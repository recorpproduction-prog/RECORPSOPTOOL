/**
 * SOP Shared Backend – one-time setup with a service account; staff never touch API keys or OAuth.
 * Deploy to Google Cloud Run or any Node host. Set FOLDER_ID and service account credentials.
 */
const { google } = require('googleapis');
const { Readable } = require('stream');

const FOLDER_ID = process.env.SOP_FOLDER_ID || process.env.FOLDER_ID || '';
const PORT = process.env.PORT || 8080;

function getDrive() {
    const key = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!key) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON env var required (JSON string of service account key)');
    const creds = JSON.parse(key);
    const auth = new google.auth.GoogleAuth({
        credentials: creds,
        scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive']
    });
    const drive = google.drive({ version: 'v3', auth });
    return drive;
}

async function listSops(drive) {
    const res = await drive.files.list({
        q: `'${FOLDER_ID}' in parents and trashed=false and name contains '.json'`,
        fields: 'files(id, name)',
        pageSize: 500
    });
    const files = res.data.files || [];
    const sops = {};
    for (const file of files) {
        if (!file.name.endsWith('.json')) continue;
        try {
            const fileRes = await drive.files.get({
                fileId: file.id,
                alt: 'media'
            }, { responseType: 'text' });
            const sop = JSON.parse(fileRes.data);
            if (sop && sop.meta) {
                const id = sop.meta.sopId || file.name.replace('.json', '');
                sops[id] = sop;
            }
        } catch (e) {
            console.warn('Skip file', file.name, e.message);
        }
    }
    return sops;
}

async function getSop(drive, sopId) {
    const fileName = sopId + '.json';
    const res = await drive.files.list({
        q: `'${FOLDER_ID}' in parents and name='${fileName.replace(/'/g, "\\'")}' and trashed=false`,
        fields: 'files(id)'
    });
    const files = res.data.files || [];
    if (files.length === 0) return null;
    const fileRes = await drive.files.get({
        fileId: files[0].id,
        alt: 'media'
    }, { responseType: 'text' });
    return JSON.parse(fileRes.data);
}

async function saveSop(drive, sop) {
    const sopId = (sop && sop.meta && sop.meta.sopId) || 'sop-' + Date.now();
    const fileName = sopId + '.json';
    const body = JSON.stringify(sop, null, 2);

    const listRes = await drive.files.list({
        q: `'${FOLDER_ID}' in parents and name='${fileName.replace(/'/g, "\\'")}' and trashed=false`,
        fields: 'files(id)'
    });
    const existing = (listRes.data.files || [])[0];

    const bodyStream = Readable.from([body]);
    if (existing) {
        await drive.files.update({
            fileId: existing.id,
            media: { mimeType: 'application/json', body: bodyStream }
        });
    } else {
        await drive.files.create({
            requestBody: { name: fileName, parents: [FOLDER_ID] },
            media: { mimeType: 'application/json', body: bodyStream }
        });
    }
    return true;
}

async function deleteSop(drive, sopId) {
    const fileName = sopId + '.json';
    const res = await drive.files.list({
        q: `'${FOLDER_ID}' in parents and name='${fileName.replace(/'/g, "\\'")}' and trashed=false`,
        fields: 'files(id)'
    });
    const files = res.data.files || [];
    if (files.length > 0) {
        await drive.files.delete({ fileId: files[0].id });
    }
    return true;
}

// CORS and JSON helpers
function cors(req, res) {
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return true;
    }
    return false;
}

function sendJson(res, status, data) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(status);
    res.end(JSON.stringify(data));
}

// HTTP server (Cloud Run / Node)
const http = require('http');
const server = http.createServer(async (req, res) => {
    if (cors(req, res)) return;

    const url = new URL(req.url || '', 'http://localhost');
    const path = url.pathname.replace(/\/$/, '') || '';
    const pathParts = path.split('/').filter(Boolean);

    if (!FOLDER_ID) {
        sendJson(res, 503, { error: 'SOP_FOLDER_ID not configured' });
        return;
    }

    let drive;
    try {
        drive = getDrive();
    } catch (e) {
        sendJson(res, 503, { error: 'Server not configured: ' + e.message });
        return;
    }

    try {
        if (pathParts[0] === 'sops' && pathParts.length === 1) {
            if (req.method === 'GET') {
                const sops = await listSops(drive);
                sendJson(res, 200, { sops });
                return;
            }
            if (req.method === 'POST') {
                let body = '';
                for await (const chunk of req) body += chunk;
                const sop = JSON.parse(body || '{}');
                await saveSop(drive, sop);
                sendJson(res, 200, { ok: true });
                return;
            }
        }
        if (pathParts[0] === 'sops' && pathParts.length === 2) {
            const id = decodeURIComponent(pathParts[1]);
            if (req.method === 'GET') {
                const sop = await getSop(drive, id);
                if (!sop) {
                    sendJson(res, 404, { error: 'Not found' });
                    return;
                }
                sendJson(res, 200, sop);
                return;
            }
            if (req.method === 'DELETE') {
                await deleteSop(drive, id);
                sendJson(res, 200, { ok: true });
                return;
            }
        }
        sendJson(res, 404, { error: 'Not found' });
    } catch (e) {
        console.error(e);
        sendJson(res, 500, { error: e.message || 'Server error' });
    }
});

server.listen(PORT, () => {
    console.log('SOP Shared Backend listening on port', PORT);
    if (!FOLDER_ID) console.warn('WARNING: SOP_FOLDER_ID not set');
});
