# Users & Requests Sync: Google Drive Only

**Users** and **pending SOP requests** are the same on every device (including phone) when you use **Google Drive**.

## How it works

- **One place:** The same Google Drive folder you use for SOPs also holds:
  - `_sop-users.json` (user list)
  - `_sop-requests.json` (submitted SOP requests)
- **Connect once per device:** On each device (desktop, phone, etc.), open the app and **Connect to Google Drive** (Settings → Google Drive). Pick the same shared folder you use for SOPs.
- **No Cloud Run, no GitHub:** We do not use a backend server or a GitHub token for users or requests. Everything is in that Drive folder.

## Steps

1. In the app, go to **Settings** and connect **Google Drive** (Client ID, API key, Folder ID if needed).
2. Use the **same folder** for SOPs and for sync (users + requests).
3. On another device, connect to Google Drive and choose the **same folder**. You’ll see the same users and requests.

If the folder is shared with your team, everyone who connects with that folder sees the same data.
