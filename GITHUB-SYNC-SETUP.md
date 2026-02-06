# GitHub Sync – Users & Requests (No Cloud Run Needed)

When Cloud Run is unavailable or deployment fails, the app uses **GitHub** to sync Users and Submitted SOP requests across all devices.

---

## One-time setup

### 1. Create two files in your repo

Go to **github.com/recorpproduction-prog/RECORPSOPTOOL** (or your repo).

Create these two files at the **root** (same level as index.html):

**File 1:** `_sop-users.json`

```json
{"users":[]}
```

**File 2:** `_sop-requests.json`

```json
{"requests":[]}
```

- Click **Add file** → **Create new file**
- Type the filename
- Paste the content
- Click **Commit changes** (to main)

### 2. Add GitHub token (for saving)

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. **Generate new token** (classic) with **repo** scope
3. Copy the token (e.g. `ghp_xxxxx`)
4. In the SOP app, click **🔄 Sync** in the header
5. Paste the token → **Save Token**

Devices that need to **save** (add users, submit requests) need the token.  
Devices that only **view** get data from GitHub with no setup.

---

## How it works

- **Read:** The app fetches from `https://raw.githubusercontent.com/YOUR_USER/YOUR_REPO/main/_sop-users.json` and `_sop-requests.json` – no auth required.
- **Write:** Uses the GitHub API with your token to update those files.
- **Fallback:** Tries Cloud Run first; if it fails, uses GitHub.
- **Same on every device:** All devices read from the same GitHub repo, so data stays in sync.

---

## Repo detection

If the app is served from `https://YOUR_USER.github.io/YOUR_REPO/`, it automatically uses `YOUR_USER/YOUR_REPO`.  
To override, add to **index.html** (before app.js):

```html
<script>
window.SOP_SYNC_REPO = { owner: 'your-username', repo: 'your-repo-name' };
</script>
```
