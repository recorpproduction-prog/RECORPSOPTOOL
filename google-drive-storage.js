// Google Drive Storage - Shared Database for All SOPs
// Uses Google Drive API to store SOPs as JSON files
// All users see all SOPs (shared database)
console.log('📁 Google Drive Storage module loaded at', new Date().toISOString());

let googleDriveStorage = {
    clientId: null,
    apiKey: null,
    folderId: null,
    isEnabled: false,
    isAuthenticated: false,
    accessToken: null
};

// Google Drive API configuration
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

// Initialize Google Drive Storage
function initGoogleDriveStorage() {
    // Load config from localStorage or use defaults
    const savedConfig = localStorage.getItem('googleDriveConfig');
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            googleDriveStorage.clientId = config.clientId || null;
            googleDriveStorage.apiKey = config.apiKey || null;
            googleDriveStorage.folderId = config.folderId || null;
            googleDriveStorage.isEnabled = !!(config.clientId && config.apiKey);
            
            console.log('📁 Loading Google Drive config from localStorage');
            console.log('Client ID present:', !!config.clientId);
            console.log('API Key present:', !!config.apiKey);
            console.log('Is Enabled:', googleDriveStorage.isEnabled);
        } catch (e) {
            console.error('Error loading Google Drive config:', e);
            googleDriveStorage.isEnabled = false;
        }
    } else {
        console.log('⚠️ No Google Drive config found in localStorage');
        googleDriveStorage.isEnabled = false;
    }
    
    // Load access token if available
    const savedToken = localStorage.getItem('googleDriveToken');
    if (savedToken) {
        try {
            const tokenData = JSON.parse(savedToken);
            if (tokenData.expires_at > Date.now()) {
                googleDriveStorage.accessToken = tokenData.access_token;
                googleDriveStorage.isAuthenticated = true;
            } else {
                // Token expired, clear it
                localStorage.removeItem('googleDriveToken');
                googleDriveStorage.isAuthenticated = false;
            }
        } catch (e) {
            console.error('Error loading Google Drive token:', e);
            googleDriveStorage.isAuthenticated = false;
        }
    } else {
        googleDriveStorage.isAuthenticated = false;
    }
    
    // Only log once per session to avoid spam
    if (!googleDriveStorage._initialized) {
        if (googleDriveStorage.isEnabled) {
            console.log('✅ Google Drive Storage initialized');
            console.log('Client ID:', googleDriveStorage.clientId ? googleDriveStorage.clientId.substring(0, 20) + '...' : 'Not set');
            console.log('API Key:', googleDriveStorage.apiKey ? googleDriveStorage.apiKey.substring(0, 10) + '...' : 'Not set');
            console.log('Folder ID:', googleDriveStorage.folderId || 'Not set');
            console.log('Authenticated:', googleDriveStorage.isAuthenticated);
        } else {
            console.log('⚠️ Google Drive Storage not configured');
        }
        googleDriveStorage._initialized = true;
    }
    
    return googleDriveStorage.isEnabled;
}

// Save Google Drive configuration
// IMPORTANT: This function must NOT call window.saveGoogleDriveConfig to avoid recursion
function saveGoogleDriveConfigToStorage(clientId, apiKey, folderId) {
    // Prevent recursion - check if we're being called recursively
    if (saveGoogleDriveConfigToStorage._saving) {
        console.error('❌ RECURSION DETECTED in saveGoogleDriveConfigToStorage!');
        return false;
    }
    
    saveGoogleDriveConfigToStorage._saving = true;
    
    try {
        console.log('💾 saveGoogleDriveConfigToStorage called with:');
        console.log('  - clientId:', clientId ? clientId.substring(0, 30) + '...' : 'EMPTY');
        console.log('  - apiKey:', apiKey ? apiKey.substring(0, 15) + '...' : 'EMPTY');
        console.log('  - folderId:', folderId || 'null');
        
        if (!clientId || !apiKey) {
            console.error('❌ Cannot save: clientId or apiKey is empty');
            return false;
        }
        
        googleDriveStorage.clientId = clientId;
        googleDriveStorage.apiKey = apiKey;
        googleDriveStorage.folderId = folderId || null;
        googleDriveStorage.isEnabled = !!(clientId && apiKey);
        
        const config = {
            clientId: clientId,
            apiKey: apiKey,
            folderId: folderId || null
        };
        
        localStorage.setItem('googleDriveConfig', JSON.stringify(config));
        console.log('✅ Google Drive config saved to localStorage');
        console.log('✅ Config saved - Client ID length:', clientId.length);
        console.log('✅ Config saved - API Key length:', apiKey.length);
        
        // Verify it was saved
        const verify = localStorage.getItem('googleDriveConfig');
        if (verify) {
            const parsed = JSON.parse(verify);
            console.log('✅ Verification: Config in localStorage - Client ID present:', !!parsed.clientId);
            console.log('✅ Verification: Config in localStorage - API Key present:', !!parsed.apiKey);
        } else {
            console.error('❌ ERROR: Config not found in localStorage after save!');
        }
        
        return true;
    } catch (e) {
        console.error('❌ Error saving to localStorage:', e);
        return false;
    } finally {
        saveGoogleDriveConfigToStorage._saving = false;
    }
}

// Initialize Google API Client
async function initGoogleAPI() {
    return new Promise((resolve, reject) => {
        if (window.gapi && window.gapi.client) {
            resolve();
            return;
        }
        
        // Wait for gapi to be available (script is loaded in index.html)
        const checkInterval = setInterval(() => {
            if (window.gapi) {
                clearInterval(checkInterval);
                window.gapi.load('client:auth2', () => {
                    resolve();
                });
            }
        }, 100);
        
        setTimeout(() => {
            clearInterval(checkInterval);
            reject(new Error('Google API failed to load. Make sure the Google API script is included in index.html'));
        }, 10000);
    });
}

// Authenticate with Google Drive
async function authenticateGoogleDrive() {
    // Re-initialize config from localStorage to ensure we have latest
    initGoogleDriveStorage();
    
    if (!googleDriveStorage.isEnabled || !googleDriveStorage.clientId || !googleDriveStorage.apiKey) {
        throw new Error('Google Drive not configured. Please set Client ID and API Key in settings.');
    }
    
    try {
        await initGoogleAPI();
        
        // Check if client is already initialized - if so, we may need to re-init with new credentials
        let needsInit = true;
        if (window.gapi.client && window.gapi.client.getToken) {
            try {
                // Try to get current config to see if it matches
                const currentApiKey = window.gapi.client.apiKey;
                if (currentApiKey === googleDriveStorage.apiKey) {
                    needsInit = false;
                }
            } catch (e) {
                // Client not properly initialized, need to init
            }
        }
        
        if (needsInit) {
            await window.gapi.client.init({
                apiKey: googleDriveStorage.apiKey,
                clientId: googleDriveStorage.clientId,
                discoveryDocs: DISCOVERY_DOCS,
                scope: SCOPES
            });
        }
        
        const authInstance = window.gapi.auth2.getAuthInstance();
        if (!authInstance) {
            throw new Error('Failed to get auth instance. Please check your Client ID.');
        }
        
        const user = authInstance.currentUser.get();
        
        if (!user.isSignedIn()) {
            // Sign in
            await authInstance.signIn();
        }
        
        const authResponse = user.getAuthResponse();
        if (!authResponse || !authResponse.access_token) {
            throw new Error('Failed to get access token. Please try again.');
        }
        
        googleDriveStorage.accessToken = authResponse.access_token;
        googleDriveStorage.isAuthenticated = true;
        
        // Save token with expiration
        const tokenData = {
            access_token: authResponse.access_token,
            expires_at: Date.now() + (authResponse.expires_in * 1000)
        };
        localStorage.setItem('googleDriveToken', JSON.stringify(tokenData));
        
        console.log('✅ Google Drive authenticated');
        return true;
    } catch (error) {
        const msg = (error && (error.details || error.message || (typeof error.error === 'string' ? error.error : null))) || (typeof error === 'string' ? error : JSON.stringify(error));
        console.error('Error authenticating with Google Drive:', msg, error);
        googleDriveStorage.isAuthenticated = false;
        throw new Error(msg);
    }
}

// Sign out from Google Drive
async function signOutGoogleDrive() {
    try {
        if (window.gapi && window.gapi.auth2) {
            const authInstance = window.gapi.auth2.getAuthInstance();
            if (authInstance) {
                await authInstance.signOut();
            }
        }
        googleDriveStorage.accessToken = null;
        googleDriveStorage.isAuthenticated = false;
        localStorage.removeItem('googleDriveToken');
        console.log('✅ Signed out from Google Drive');
        return true;
    } catch (error) {
        console.error('Error signing out:', error);
        return false;
    }
}

// Get or create SOPs folder in Google Drive
async function getSopsFolder() {
    if (!googleDriveStorage.isAuthenticated) {
        await authenticateGoogleDrive();
    }
    
    // If folder ID is already set, verify it exists
    if (googleDriveStorage.folderId) {
        try {
            const response = await window.gapi.client.drive.files.get({
                fileId: googleDriveStorage.folderId,
                fields: 'id, name'
            });
            return response.result.id;
        } catch (error) {
            // Folder doesn't exist or is inaccessible, create new one
            console.log('Folder not found, creating new one...');
        }
    }
    
    // Create new folder
    const folderMetadata = {
        name: 'SOPs',
        mimeType: 'application/vnd.google-apps.folder'
    };
    
    try {
        const response = await window.gapi.client.drive.files.create({
            resource: folderMetadata,
            fields: 'id'
        });
        
        googleDriveStorage.folderId = response.result.id;
        
        // Save folder ID to config
        const config = JSON.parse(localStorage.getItem('googleDriveConfig') || '{}');
        config.folderId = response.result.id;
        localStorage.setItem('googleDriveConfig', JSON.stringify(config));
        
        console.log('✅ Created SOPs folder:', response.result.id);
        return response.result.id;
    } catch (error) {
        console.error('Error creating folder:', error);
        throw error;
    }
}

// Save SOP to Google Drive
async function saveSopToGoogleDrive(sop) {
    if (!googleDriveStorage.isEnabled) {
        return false;
    }
    
    try {
        if (!googleDriveStorage.isAuthenticated) {
            await authenticateGoogleDrive();
        }
        
        const folderId = await getSopsFolder();
        const sopId = sop.meta.sopId || `sop-${Date.now()}`;
        const fileName = `${sopId}.json`;
        
        // Check if file already exists
        let existingFileId = null;
        try {
            const listResponse = await window.gapi.client.drive.files.list({
                q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
                fields: 'files(id, name)',
                spaces: 'drive'
            });
            
            if (listResponse.result.files && listResponse.result.files.length > 0) {
                existingFileId = listResponse.result.files[0].id;
            }
        } catch (error) {
            console.warn('Error checking for existing file:', error);
        }
        
        // Convert SOP to JSON
        const jsonContent = JSON.stringify(sop, null, 2);
        
        if (existingFileId) {
            // Update existing file - first update metadata, then content
            await window.gapi.client.drive.files.update({
                fileId: existingFileId,
                resource: {
                    name: fileName
                }
            });
            
            // Update file content using resumable upload
            const updateResponse = await fetch(
                `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${googleDriveStorage.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: jsonContent
                }
            );
            
            if (!updateResponse.ok) {
                throw new Error(`Failed to update file: ${updateResponse.statusText}`);
            }
            
            console.log('✅ SOP updated in Google Drive:', fileName);
        } else {
            // Create new file - first create metadata, then upload content
            const createResponse = await window.gapi.client.drive.files.create({
                resource: {
                    name: fileName,
                    parents: [folderId]
                },
                fields: 'id'
            });
            
            const newFileId = createResponse.result.id;
            
            // Upload file content
            const uploadResponse = await fetch(
                `https://www.googleapis.com/upload/drive/v3/files/${newFileId}?uploadType=media`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${googleDriveStorage.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: jsonContent
                }
            );
            
            if (!uploadResponse.ok) {
                throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
            }
            
            console.log('✅ SOP saved to Google Drive:', fileName);
        }
        
        return true;
    } catch (error) {
        console.error('Error saving to Google Drive:', error);
        throw error;
    }
}

// Load all SOPs from Google Drive
async function loadAllSopsFromGoogleDrive() {
    if (!googleDriveStorage.isEnabled) {
        return null;
    }
    
    try {
        if (!googleDriveStorage.isAuthenticated) {
            await authenticateGoogleDrive();
        }
        
        const folderId = await getSopsFolder();
        
        // List all JSON files in the folder
        const response = await window.gapi.client.drive.files.list({
            q: `'${folderId}' in parents and trashed=false`,
            fields: 'files(id, name, mimeType)',
            spaces: 'drive'
        });
        
        const files = response.result.files || [];
        const sops = {};
        
        // Load each SOP file
        for (const file of files) {
            if (file.name.endsWith('.json')) {
                try {
                    // Use fetch to get file content
                    const fileResponse = await fetch(
                        `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
                        {
                            headers: {
                                'Authorization': `Bearer ${googleDriveStorage.accessToken}`
                            }
                        }
                    );
                    
                    if (!fileResponse.ok) {
                        throw new Error(`Failed to load file: ${fileResponse.statusText}`);
                    }
                    
                    const jsonText = await fileResponse.text();
                    const sop = JSON.parse(jsonText);
                    
                    if (sop && sop.meta) {
                        const sopKey = sop.meta.sopId || file.name.replace('.json', '');
                        sops[sopKey] = sop;
                    }
                } catch (error) {
                    console.warn('Error loading SOP file:', file.name, error);
                }
            }
        }
        
        console.log(`✅ Loaded ${Object.keys(sops).length} SOPs from Google Drive`);
        return sops;
    } catch (error) {
        console.error('Error loading from Google Drive:', error);
        return null;
    }
}

// Delete SOP from Google Drive
async function deleteSopFromGoogleDrive(sopId) {
    if (!googleDriveStorage.isEnabled || !googleDriveStorage.isAuthenticated) {
        return false;
    }
    
    try {
        const folderId = await getSopsFolder();
        const fileName = `${sopId}.json`;
        
        // Find the file
        const listResponse = await window.gapi.client.drive.files.list({
            q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
            fields: 'files(id)',
            spaces: 'drive'
        });
        
        if (listResponse.result.files && listResponse.result.files.length > 0) {
            const fileId = listResponse.result.files[0].id;
            
            // Delete the file
            await window.gapi.client.drive.files.delete({
                fileId: fileId
            });
            
            console.log('✅ SOP deleted from Google Drive:', fileName);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error deleting from Google Drive:', error);
        return false;
    }
}

// Check if Google Drive is enabled and authenticated
function useGoogleDrive() {
    return googleDriveStorage.isEnabled && googleDriveStorage.isAuthenticated;
}

// Initialize on load
if (typeof window !== 'undefined') {
    window.googleDriveStorage = googleDriveStorage;
    window.saveSopToGoogleDrive = saveSopToGoogleDrive;
    window.loadAllSopsFromGoogleDrive = loadAllSopsFromGoogleDrive;
    window.deleteSopFromGoogleDrive = deleteSopFromGoogleDrive;
    window.authenticateGoogleDrive = authenticateGoogleDrive;
    window.signOutGoogleDrive = signOutGoogleDrive;
    window.saveGoogleDriveConfig = saveGoogleDriveConfigToStorage;
    window.useGoogleDrive = useGoogleDrive;
    window.initGoogleDriveStorage = initGoogleDriveStorage;
    window.getSopsFolder = getSopsFolder;
    
    // Auto-initialize when DOM is ready (only once)
    if (!googleDriveStorage._autoInitDone) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                if (!googleDriveStorage._autoInitDone) {
                    initGoogleDriveStorage();
                    googleDriveStorage._autoInitDone = true;
                }
            });
        } else {
            initGoogleDriveStorage();
            googleDriveStorage._autoInitDone = true;
        }
    }
}

