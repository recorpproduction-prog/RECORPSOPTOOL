# How to Redeploy (Backend Delete Fix)

“Redeploy” here means **two separate things**:

---

## 1. Push the new code to GitHub

Upload/push the updated files to your GitHub repo (the same repo you use for the app and backend):

- **sop-shared-backend/index.js** ← this has the delete fix (find file by `meta.sopId`)
- Optionally **shared-sop-api.js** (treats 404 on delete as success)

**This alone does NOT redeploy the backend.** It only updates the code in the repo. Your live Cloud Run service keeps running the old code until you do step 2.

---

## 2. Deploy a new revision on Google Cloud Run

The backend runs on **Google Cloud Run**. To run the new code you must deploy a new revision.

### Option A – If you have “continuously deploy from repository”

If when you first set up Cloud Run you chose **“Continuously deploy from a repository”** and connected GitHub:

- A **new push to the branch** (e.g. `main`) may trigger an automatic build and deploy.
- Check in **Google Cloud Console** → **Cloud Build** → **History** to see if a build started after your push.
- If a build runs and succeeds, the new revision is live; no extra step needed.

### Option B – Deploy a new revision manually (always works)

1. Go to **[Google Cloud Console](https://console.cloud.google.com)** → **Cloud Run**.
2. Click your **backend service** (e.g. **sop-backend**).
3. Click **“EDIT & DEPLOY NEW REVISION”** (or **Edit** then **Deploy**).
4. Do **not** change repo, branch, or directory – leave them as they are (e.g. repo connected, branch **main**, directory **sop-shared-backend**).
5. Click **Deploy** (or **Save and deploy**).
6. Wait for the new revision to finish deploying.

After that, the backend is redeployed and the delete fix is live.

---

## Summary

| What you do | What it updates |
|-------------|------------------|
| **Push to GitHub** | Updates the code in the repo; GitHub Pages will serve new frontend files; backend does **not** change until you deploy. |
| **Cloud Run → Edit & deploy new revision → Deploy** | Builds from the latest code in the repo and runs the **new backend** (including the delete fix). |

So: **uploading/pushing to GitHub is step 1.** **Redeploy = step 2 (new revision on Cloud Run)** so the new backend code actually runs.
