# Fix: "The user does not have sufficient permissions for this file" (Delete)

When you **delete** an SOP from the Register, the backend (Cloud Run) uses a **service account** to delete the file from Google Drive. This error means the service account does **not** have permission to delete that file.

---

## If you already shared the folder with the service account as Editor

If the folder is already shared with the service account email as **Editor** and you still get this error, the usual cause is one of these:

### 1. Folder is inside a **Shared Drive** (Team Drive)

In **Shared Drives**, sharing a subfolder with the service account (like in My Drive) is **not enough**. The service account must be a **member of the Shared Drive itself** with a role that can delete files.

1. In Google Drive, open the **Shared Drive** that contains your SOP folder (click the Shared Drive name in the left sidebar, not just the folder inside it).
2. Right‑click the **Shared Drive name** → **Manage members** (or **Share** / **Manage access**).
3. Click **Add members** (or **Add people**).
4. Paste the **service account email** (from your JSON key: `client_email`).
5. Set the role to **Content manager** or **Manager** (not Viewer or Commenter).
6. Save.

After that, the backend can delete (and trash) files in that Shared Drive. No need to “share” the subfolder separately.

### 2. Files were created by a **user** (not the backend)

If the SOP files were created by someone **saving from the app while connected to their own Google Drive** (e.g. “Connect to Google Drive” in the app), those files are **owned by that user**, not the service account. The backend (service account) can then read them (if the folder is shared) but may not be able to delete them.

- **Fix:** Ensure new SOPs are **saved through the app when it’s using the Shared API** (backend), not only via “Connect to Google Drive”. Then the backend creates the files and owns them, so delete works.
- For **existing** files already owned by a user: the owner can move them into a folder that is shared with the service account as **Editor**, or the backend will try **trashing** the file instead of permanent delete when delete returns 403 (file disappears from the folder and goes to Drive Trash).

### 3. Backend fallback: trash instead of delete

The backend now **tries to trash** the file (move to Drive Trash) if permanent delete returns “insufficient permissions”. The file is removed from the SOP folder and no longer appears in the Register; you can empty Trash in Drive later. Redeploy the backend to use this behavior.

---

## Fix: Give the service account **Editor** (or delete) access

### 1. Find the service account email

1. Open your **Google Cloud Console** → your project.
2. Go to **APIs & Services** → **Credentials**.
3. Under **Service Accounts**, click the service account you use for the SOP backend (e.g. `sop-backend`).
4. Copy the **Email** (it looks like `something@your-project.iam.gserviceaccount.com`).

**Or** open the **JSON key file** you downloaded when you created the service account. Find the line `"client_email": "..."` and copy that email.

---

### 2. Share the Drive folder with that email as **Editor**

1. Go to [Google Drive](https://drive.google.com).
2. Find the **folder** you use for SOPs (the one whose ID is in `SOP_FOLDER_ID` in Cloud Run).
3. **Right‑click** the folder → **Share** (or click the folder, then the Share icon).
4. In **Add people and groups**, paste the **service account email**.
5. Set the permission to **Editor** (not Viewer).
   - **Viewer** = can only read → backend can list and read SOPs but **cannot delete**.
   - **Editor** = can add, edit, and **delete** → backend can delete SOPs.
6. **Uncheck** “Notify people” (the service account does not read email).
7. Click **Share** or **Send**.

---

### 3. If the folder is inside a **Shared Drive** (Team Drive)

1. Open the **Shared Drive** (not just the folder inside it).
2. Right‑click the Shared Drive name → **Manage members** (or **Share**).
3. Add the **service account email** as a member.
4. Give it a role that can delete files, e.g. **Content manager** or **Manager** (not **Viewer**).
5. Save.

The backend already uses `supportsAllDrives: true`, so once the service account has the right role on the Shared Drive, delete will work.

---

### 4. If the files were created by someone else

Sometimes the folder is shared with the service account as Editor, but the **files inside** were created or owned by a different Google account and that account’s sharing prevents delete. Fix by:

- Making sure the **folder** (not only individual files) is shared with the service account as **Editor**, and
- If needed, having the file owner share the folder (or the files) with the service account with **Editor** access, or move the SOPs into a folder that is shared with the service account as **Editor**.

---

## Summary

| Problem | Fix |
|--------|-----|
| **"Insufficient permissions for this file"** on delete | Share the **SOP folder** with the **service account email** as **Editor** (not Viewer). |
| Folder in a **Shared Drive** | Add the service account to the **Shared Drive** as **Content manager** (or Manager). |
| Still failing | Confirm the email in Cloud Run’s `GOOGLE_SERVICE_ACCOUNT_JSON` (the `client_email` in the JSON) is exactly the one you shared the folder with. |

After changing sharing, try deleting an SOP from the Register again; no need to redeploy the backend.
