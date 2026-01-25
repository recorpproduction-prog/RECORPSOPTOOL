// GitHub Repository Storage - Shared Database for All SOPs
// Uses GitHub Repository API to store SOPs as JSON files
// All users see all SOPs (shared database)

let githubRepoStorage = {
    token: null,
    owner: null,
    repo: null,
    isEnabled: false
};

// Initialize GitHub Repository Storage
function initGitHubRepoStorage() {
    if (!window.githubRepoConfig) {
        console.log('GitHub repo config not found');
        return false;
    }
    
    const config = window.githubRepoConfig;
    
    if (!config.token || !config.owner || !config.repo) {
        console.warn('GitHub repo config incomplete. Please check index.html');
        return false;
    }
    
    // Replace placeholder values
    if (config.owner === 'YOUR_GITHUB_USERNAME' || config.repo === 'recorp-sops-data' && !config.repo.includes('YOUR')) {
        // Check if owner needs to be set
        if (config.owner === 'YOUR_GITHUB_USERNAME') {
            console.error('⚠️ Please set your GitHub username in index.html (githubRepoConfig.owner)');
            return false;
        }
    }
    
    githubRepoStorage.token = config.token;
    githubRepoStorage.owner = config.owner;
    githubRepoStorage.repo = config.repo;
    githubRepoStorage.isEnabled = true;
    
    console.log('✅ GitHub Repository Storage initialized');
    console.log('Repository:', `${config.owner}/${config.repo}`);
    
    return true;
}

// GitHub API helper - make authenticated request
async function githubApiRequest(endpoint, options = {}) {
    if (!githubRepoStorage.isEnabled) {
        throw new Error('GitHub storage not enabled');
    }
    
    const url = `https://api.github.com${endpoint}`;
    
    // Use Bearer for newer tokens, token for classic tokens
    const authHeader = githubRepoStorage.token.startsWith('ghp_') || githubRepoStorage.token.startsWith('github_pat_')
        ? `Bearer ${githubRepoStorage.token}`
        : `token ${githubRepoStorage.token}`;
    
    const headers = {
        'Authorization': authHeader,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        let error;
        try {
            error = JSON.parse(errorText);
        } catch {
            error = { message: errorText || response.statusText };
        }
        
        // Provide helpful error messages
        if (response.status === 401) {
            throw new Error(`Bad credentials (401). Your GitHub token may be invalid, expired, or missing 'repo' scope. Please check your token in index.html.`);
        } else if (response.status === 403) {
            throw new Error(`Forbidden (403). Your token may not have permission to access this repository.`);
        } else if (response.status === 404) {
            throw new Error(`Not found (404). Repository ${githubRepoStorage.owner}/${githubRepoStorage.repo} may not exist.`);
        }
        
        throw new Error(`GitHub API error: ${error.message || response.statusText} (${response.status})`);
    }
    
    return response.json();
}

// Get file content from repository
async function getFileFromRepo(path) {
    try {
        const content = await githubApiRequest(`/repos/${githubRepoStorage.owner}/${githubRepoStorage.repo}/contents/${path}`);
        
        if (content.encoding === 'base64') {
            const decoded = atob(content.content);
            return JSON.parse(decoded);
        }
        return JSON.parse(content.content);
    } catch (error) {
        if (error.message.includes('404')) {
            return null; // File doesn't exist
        }
        throw error;
    }
}

// Save file to repository
async function saveFileToRepo(path, content, message = 'Update SOP') {
    let sha = null;
    
    // Check if file exists
    try {
        const existing = await githubApiRequest(`/repos/${githubRepoStorage.owner}/${githubRepoStorage.repo}/contents/${path}`);
        sha = existing.sha;
    } catch (error) {
        // File doesn't exist, that's okay - we'll create it
        if (!error.message.includes('404')) {
            console.warn('Error checking file existence:', error);
        }
    }
    
    const encodedContent = btoa(JSON.stringify(content, null, 2));
    
    const body = {
        message: message,
        content: encodedContent,
        branch: 'main'
    };
    
    if (sha) {
        body.sha = sha; // Update existing file
    }
    
    await githubApiRequest(`/repos/${githubRepoStorage.owner}/${githubRepoStorage.repo}/contents/${path}`, {
        method: 'PUT',
        body: JSON.stringify(body)
    });
}

// Save SOP to GitHub repository - PRIMARY STORAGE
async function saveSopToGitHubRepo(sop) {
    if (!githubRepoStorage.isEnabled) {
        throw new Error('GitHub storage not enabled. Please check your repository configuration.');
    }
    
    // Check if repository exists first
    try {
        await githubApiRequest(`/repos/${githubRepoStorage.owner}/${githubRepoStorage.repo}`);
    } catch (error) {
        if (error.message.includes('404')) {
            throw new Error(`Repository ${githubRepoStorage.owner}/${githubRepoStorage.repo} does not exist. Please create it on GitHub.`);
        }
        if (error.message.includes('401') || error.message.includes('Bad credentials')) {
            throw new Error('GitHub authentication failed. Please check your token is valid and has the correct permissions (repo scope).');
        }
        throw error;
    }
    
    const sopId = sop.meta.sopId || `sop-${Date.now()}`;
    sop.meta.sopId = sopId; // Ensure SOP ID is set
    
    // Add savedAt timestamp if not present
    if (!sop.savedAt) {
        sop.savedAt = new Date().toISOString();
    }
    
    const fileName = `sops/${sopId}.json`;
    const message = `Save SOP: ${sop.meta.title || sopId}`;
    
    await saveFileToRepo(fileName, sop, message);
    console.log('✅ SOP saved to GitHub repository:', sopId);
    return true;
}

// Load all SOPs from GitHub repository (shared database)
async function loadAllSopsFromGitHubRepo() {
    if (!githubRepoStorage.isEnabled) {
        return null;
    }
    
    try {
        // First check if repository exists
        try {
            await githubApiRequest(`/repos/${githubRepoStorage.owner}/${githubRepoStorage.repo}`);
        } catch (error) {
            if (error.message.includes('404')) {
                console.log('📝 Repository does not exist yet - will use localStorage until repo is created');
                return null; // Return null to use localStorage
            }
            throw error;
        }
        
        // Get all files in sops/ directory
        let files = [];
        try {
            files = await githubApiRequest(`/repos/${githubRepoStorage.owner}/${githubRepoStorage.repo}/contents/sops`);
        } catch (error) {
            if (error.message.includes('404')) {
                // sops/ directory doesn't exist yet, that's okay
                console.log('📝 No SOPs directory found yet - will create on first save');
                return {}; // Return empty object, not null
            }
            throw error;
        }
        
        // Handle case where files is not an array
        if (!Array.isArray(files)) {
            files = [files];
        }
        
        const sops = {};
        
        // Load each SOP file
        for (const file of files) {
            if (file.type === 'file' && file.name.endsWith('.json')) {
                try {
                    const sop = await getFileFromRepo(file.path);
                    if (sop && sop.meta) {
                        const sopKey = sop.meta.sopId || file.name.replace('.json', '');
                        sops[sopKey] = sop;
                    }
                } catch (error) {
                    console.warn('Error loading SOP file:', file.name, error);
                }
            }
        }
        
        console.log(`✅ Loaded ${Object.keys(sops).length} SOPs from GitHub repository`);
        return sops;
    } catch (error) {
        // Don't throw - just return empty object so app continues working
        console.warn('⚠️ Could not load from GitHub:', error.message);
        return {}; // Return empty object, not null
    }
}

// Delete SOP from GitHub repository
async function deleteSopFromGitHubRepo(sopId) {
    if (!githubRepoStorage.isEnabled) {
        return false;
    }
    
    try {
        const fileName = `sops/${sopId}.json`;
        
        // Get file SHA first
        const file = await githubApiRequest(`/repos/${githubRepoStorage.owner}/${githubRepoStorage.repo}/contents/${fileName}`);
        
        // Delete file
        await githubApiRequest(`/repos/${githubRepoStorage.owner}/${githubRepoStorage.repo}/contents/${fileName}`, {
            method: 'DELETE',
            body: JSON.stringify({
                message: `Delete SOP: ${sopId}`,
                sha: file.sha,
                branch: 'main'
            })
        });
        
        console.log('✅ SOP deleted from GitHub repository:', sopId);
        return true;
    } catch (error) {
        if (error.message.includes('404')) {
            // File doesn't exist, that's okay
            return true;
        }
        console.error('❌ Error deleting SOP from GitHub:', error);
        throw error;
    }
}

// Initialize on page load - wait for config to be available
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure config is loaded
    setTimeout(() => {
        const initialized = initGitHubRepoStorage();
        if (initialized) {
            console.log('🚀 GitHub Repository Storage initialized');
            console.log('Repository:', `${githubRepoStorage.owner}/${githubRepoStorage.repo}`);
            
            // Try to load from GitHub (non-blocking, silent failure)
            loadAllSopsFromGitHubRepo().then(sops => {
                if (sops && Object.keys(sops).length > 0) {
                    console.log(`✅ Loaded ${Object.keys(sops).length} SOPs from GitHub repository`);
                } else {
                    console.log('📝 No SOPs in GitHub repository yet');
                }
            }).catch(error => {
                // Silent failure - don't break the app
                console.warn('⚠️ GitHub load failed (app will still work):', error.message);
            });
        } else {
            console.log('📝 Using localStorage only (GitHub not configured)');
        }
    }, 100);
});

// Make functions globally available
window.saveSopToGitHubRepo = saveSopToGitHubRepo;
window.loadAllSopsFromGitHubRepo = loadAllSopsFromGitHubRepo;
window.deleteSopFromGitHubRepo = deleteSopFromGitHubRepo;
window.useGitHubRepo = () => githubRepoStorage.isEnabled;

