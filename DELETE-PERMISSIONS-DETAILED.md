# Delete Permissions – Detailed Step-by-Step Guide

Use this guide when you get **"The user does not have sufficient permissions for this file"** when deleting an SOP from the Register, and you’ve already shared the folder with the service account as Editor.

---

## No right‑click? Can’t find Shared drives?

**If right‑click doesn’t work** (touch device, trackpad, or no mouse): every step below has a **no right‑click** option using a **single click** on the folder or drive, then a **Share** or **⋮** (three dots) button in the **top bar**.

**If you don’t see “Shared drives”** in the left sidebar at all: your SOP folder is in **My Drive**. Skip anything about “Shared Drive” and only do **Part 2** and **Part 3** (share your folder in My Drive with the service account as Editor). You do **not** need to use or open Shared drives.

### Quick reference – Share / Manage without right‑click

| What you want | What to do (no right‑click) |
|---------------|-----------------------------|
| **Share a folder (My Drive)** | Click the folder **once** → at the **top** click **Share** (or **⋮** → **Share**). |
| **Manage members (Shared Drive)** | Open the Shared Drive (click it in the left sidebar) → at the **top** click **Manage members** (or **⋮** → **Manage members**). |
| **Don’t see Shared drives?** | Your folder is in My Drive. Use **Part 3** only (share the folder with the service account as Editor). |

---

## Part 1: Is your SOP folder in “My Drive” or a “Shared Drive”?

This decides which steps you need.

### How to tell

1. Go to [drive.google.com](https://drive.google.com) and sign in.
2. In the **left sidebar** you’ll see:
   - **My Drive** – your personal drive (may have subfolders).
   - **Shared drives** (or **Team Drives**) – separate section, often with a different icon (e.g. multi-person or briefcase).
3. Open the **exact folder** where your SOP files live (the one whose ID you use in Cloud Run as `SOP_FOLDER_ID`).
4. Look at the **breadcrumb** at the top (the path like “My Drive > SOPs” or “Shared drives > [Drive name] > SOPs”):
   - If it starts with **“My Drive”** → your folder is in **My Drive**. Use **Part 2** and **Part 3**.
   - If it starts with **“Shared drives”** (or a Shared Drive name) → your folder is in a **Shared Drive**. Use **Part 2** and **Part 4**.

**URL check:**
- My Drive folder: `https://drive.google.com/drive/folders/XXXXXXXX`
- Shared Drive folder: often similar, but the **parent** in the left sidebar is under “Shared drives”, not “My Drive”.

Write down for yourself: **My Drive** or **Shared Drive** (and the Shared Drive name if applicable).

---

## Part 2: Get the service account email (exact steps)

The backend uses this email to access Drive. You need to use this **exact** email when sharing or adding members.

### Option A – From Google Cloud Console

1. Open a browser and go to **[console.cloud.google.com](https://console.cloud.google.com)**.
2. At the top, click the **project name** (next to “Google Cloud”). Select the **same project** you use for Cloud Run (e.g. where your sop-backend runs).
3. Open the **☰** menu (top left) → **APIs & Services** → **Credentials**.
4. On the Credentials page, scroll to the section **“Service accounts”** (not “API keys” or “OAuth 2.0”).
5. Under Service accounts, you’ll see a list. Click the **service account** you use for the SOP backend (often named something like `sop-backend` or the default one for the project).
6. On the service account details page, at the top you’ll see **“Email”**. It looks like:  
   `xxxxxxxxxx@xxxxxxxxxx.iam.gserviceaccount.com`
7. **Copy that full email** (double‑click to select, then Ctrl+C). Paste it into Notepad so you don’t lose it.

### Option B – From the JSON key file

1. On your computer, find the **JSON key file** you downloaded when you created the service account (e.g. `your-project-xxxxx.json`).
2. Open it with **Notepad** (or any text editor). Don’t open it in Excel.
3. Find the line that says `"client_email":` (with a colon). It will look like:  
   `"client_email": "xxxxxxxxxx@xxxxxxxxxx.iam.gserviceaccount.com",`
4. Copy **only the email part** between the quotes (nothing before or after). Paste it into Notepad.

**Check:** The email must end with **`.iam.gserviceaccount.com`**. If it’s a normal Gmail address, that’s the wrong account.

Use this email in **Part 3** (My Drive) or **Part 4** (Shared Drive).

---

## Part 3: Folder in “My Drive” – share the folder with the service account as Editor

Do this only if in Part 1 you saw your SOP folder under **My Drive** (or if you don’t see “Shared drives” in the left sidebar – then your folder is in My Drive).

1. Go to [drive.google.com](https://drive.google.com) and open **My Drive**.
2. Find the **folder** where your SOP files are (the one whose ID is in Cloud Run as `SOP_FOLDER_ID`).  
   If you’re not sure which folder:  
   - In Cloud Run → your service → **Edit & deploy new revision** → expand **Variables and secrets** → look at the value of **SOP_FOLDER_ID** (e.g. `15HssSe1Wc_7lsRiQEtLe9Tpv0yzDCmec`).  
   - In Drive, open folders until you see that ID in the URL when you’re inside the folder:  
     `https://drive.google.com/drive/folders/15HssSe1Wc_7lsRiQEtLe9Tpv0yzDCmec`
3. **Open Share (no right‑click):**
   - **Option A:** Click the folder **once** so it is selected (highlighted). Look at the **top of the page** for a **Share** button or a **person-with-plus** icon. Click it.
   - **Option B:** Click the folder **once** to select it. Look for **⋮** (three vertical dots) at the top right. Click **⋮** → click **Share**.
   - **Option C:** **Double‑click** the folder to open it (you’re inside the folder). At the top you may see **Share** or **⋮** → **Share**. Click that.
4. In the “Share with people and groups” dialog:
   - In the **“Add people and groups”** box, **paste the service account email** you copied in Part 2.
   - Next to it, click the **role dropdown**. It might say “Viewer” or “Editor”.
   - Set it to **Editor** (not Viewer, not Commenter).  
     - **Viewer** = backend can only read → delete will fail with “insufficient permissions”.  
     - **Editor** = backend can create, edit, and **delete** files.
   - **Uncheck** “Notify people” (the service account doesn’t read email).
   - Click **Share** or **Send**.
5. Close the dialog. Try deleting an SOP from the Register again.

If it still fails, your folder might actually be inside a Shared Drive (double‑check Part 1) or the files were created by a user account (see Part 5). Also do **Part 6** (redeploy) so the backend can try trashing when delete fails.

---

## Part 4: Folder in a “Shared Drive” – add the service account to the Shared Drive

Do this **only** if in Part 1 you saw your SOP folder under **“Shared drives”** in the left sidebar. If you **don’t see “Shared drives”** at all, skip Part 4 and use only Part 3 (share your folder in My Drive).

Sharing the subfolder with the service account is **not enough**; the service account must be a **member of the Shared Drive itself**.

1. Go to [drive.google.com](https://drive.google.com).
2. In the **left sidebar**, under **“Shared drives”**, click the **Shared Drive name** that contains your SOP folder (so you’re inside that drive, not inside a subfolder).
3. **Open Manage members (no right‑click):**
   - **Option A:** With the Shared Drive open, look at the **top bar** (under the drive name). Find **“Manage members”** or a **people** icon and click it.
   - **Option B:** Look for **⋮** (three dots) at the top right. Click **⋮** → click **Manage members** or **Share**.
   - **Option C:** If you see the drive name at the top, click it once, then look for **Manage members** or **Share** in the bar that appears.
4. In the **“Manage members”** (or “Share” / “Access”) dialog:
   - Click **Add members** (or **Add people**).
   - In the box, **paste the service account email** from Part 2.
   - Set the **role** to **Content manager** or **Manager** (not Viewer, not Commenter).  
     - **Viewer** = cannot delete.  
     - **Content manager** or **Manager** = can create, edit, and delete files.
   - **Uncheck** “Notify people” if shown.
   - Click **Send** or **Share**.
5. Close the dialog. Wait a minute, then try deleting an SOP from the Register again.

If it still fails, do **Part 6** (redeploy) so the backend can try trashing when delete returns “insufficient permissions”.

---

## Part 5: Files created by a user (not the backend)

If the SOP files were created when someone used **“Connect to Google Drive”** in the app (saving with their own Google account), those files are **owned by that user**, not the service account. The backend can often **read** them (if the folder is shared) but may not be allowed to **delete** them.

- **For new SOPs:** Save through the app when it’s using the **Shared API** (backend). Then the backend creates the files and the service account owns them, so delete works.
- **For existing user‑owned files:** The backend will **try to trash** the file (Part 6) when delete fails, so the file is removed from the folder and the Register; it will sit in Drive Trash until someone empties Trash.

No extra sharing steps for Part 5; just ensure the folder (or Shared Drive) is set up as in Part 3 or Part 4, and redeploy (Part 6).

---

## Part 6: Redeploy the backend (trash fallback)

The backend code has a **fallback**: if permanent delete returns “insufficient permissions”, it **tries to move the file to Drive Trash** instead. The file then disappears from the SOP folder and from the Register; you can empty Trash in Drive later.

You must **deploy a new revision** of the backend for this to run.

1. Go to **[console.cloud.google.com](https://console.cloud.google.com)** → **Cloud Run** (use the top search box: type “Cloud Run” and open it).
2. On the **Services** tab, click your **backend service** (e.g. **sop-backend**).
3. Click **“EDIT & DEPLOY NEW REVISION”** (or **Edit**).
4. Don’t change **Source** (repo, branch, directory) or **Variables and secrets** unless you were told to.
5. Scroll to the bottom and click **Deploy** (or **Save and deploy**).
6. Wait until the new revision is live (2–5 minutes).
7. Try deleting an SOP from the Register again. If delete still fails with permissions, the backend will try trash and the SOP should disappear from the list.

(If you need a full click‑by‑click for Cloud Run, use **EDIT-AND-DEPLOY-WALKTHROUGH.md**.)

---

## Checklist (in order)

- [ ] **Part 1:** I know whether my SOP folder is in **My Drive** or a **Shared Drive** (and the Shared Drive name if applicable).
- [ ] **Part 2:** I have the **service account email** copied (ends with `.iam.gserviceaccount.com`).
- [ ] **Part 3 (My Drive):** I shared the **SOP folder** with that email as **Editor** (not Viewer).
- [ ] **Part 4 (Shared Drive):** I added that email to the **Shared Drive** as **Content manager** (or Manager).
- [ ] **Part 6:** I **redeployed** the backend (Edit & deploy new revision) so the trash fallback is active.
- [ ] I tried **deleting an SOP** from the Register again and checked the result (and Drive Trash if it still said “insufficient permissions”).

---

## If it still doesn’t work

1. **Confirm the same email everywhere**  
   The email in Cloud Run (inside `GOOGLE_SERVICE_ACCOUNT_JSON` → `client_email`) must be **exactly** the same as the one you added in Drive (Part 3 or Part 4). No extra spaces, no typo.

2. **Confirm the same folder**  
   The **SOP_FOLDER_ID** in Cloud Run must be the ID of the folder (or the Shared Drive’s root) where the SOP files actually live. Open that folder in Drive and check the URL: the part after `/folders/` should match `SOP_FOLDER_ID`.

3. **Try creating and deleting a new SOP**  
   In the app, create a **new** SOP, **Save** (so the backend creates the file), then **delete** it from the Register. If that works, the issue is only with older files (e.g. user‑owned); the trash fallback (Part 6) should still remove them from the list.

If you’ve done all of the above and it still fails, note the **exact** error message shown in the app (or in the browser console: F12 → Console) and which step (Part 3, 4, or 6) you did last; that will narrow it down further.
