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
    const headers = {
        'Authorization': `token ${githubRepoStorage.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
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
        // File doesn't exist, that's okay
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

// Save SOP to GitHub repository (shared database)
async function saveSopToGitHubRepo(sop) {
    if (!githubRepoStorage.isEnabled) {
        return false;
    }
    
    try {
        const sopId = sop.meta.sopId || `sop-${Date.now()}`;
        sop.meta.sopId = sopId; // Ensure SOP ID is set
        
        const fileName = `sops/${sopId}.json`;
        const message = `Save SOP: ${sop.meta.title || sopId}`;
        
        await saveFileToRepo(fileName, sop, message);
        console.log('✅ SOP saved to GitHub repository:', sopId);
        return true;
    } catch (error) {
        console.error('❌ Error saving SOP to GitHub:', error);
        throw error;
    }
}

// Load all SOPs from GitHub repository (shared database)
async function loadAllSopsFromGitHubRepo() {
    if (!githubRepoStorage.isEnabled) {
        return null;
    }
    
    try {
        // Get all files in sops/ directory
        const files = await githubApiRequest(`/repos/${githubRepoStorage.owner}/${githubRepoStorage.repo}/contents/sops`);
        
        const sops = {};
        
        // Load each SOP file
        for (const file of files) {
            if (file.type === 'file' && file.name.endsWith('.json')) {
                try {
                    const sop = await getFileFromRepo(file.path);
                    if (sop && sop.meta && sop.meta.sopId) {
                        sops[sop.meta.sopId] = sop;
                    }
                } catch (error) {
                    console.warn('Error loading SOP file:', file.name, error);
                }
            }
        }
        
        console.log(`✅ Loaded ${Object.keys(sops).length} SOPs from GitHub repository`);
        return sops;
    } catch (error) {
        if (error.message.includes('404')) {
            // sops/ directory doesn't exist yet, that's okay
            console.log('No SOPs directory found, will create on first save');
            return {};
        }
        console.error('❌ Error loading SOPs from GitHub:', error);
        throw error;
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const initialized = initGitHubRepoStorage();
    if (initialized) {
        console.log('🚀 Using GitHub Repository for shared SOP storage');
    } else {
        console.log('⚠️ GitHub Repository storage not available, using localStorage fallback');
    }
});

// Make functions globally available
window.saveSopToGitHubRepo = saveSopToGitHubRepo;
window.loadAllSopsFromGitHubRepo = loadAllSopsFromGitHubRepo;
window.deleteSopFromGitHubRepo = deleteSopFromGitHubRepo;
window.useGitHubRepo = () => githubRepoStorage.isEnabled;

