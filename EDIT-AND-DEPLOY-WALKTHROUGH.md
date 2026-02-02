# Edit & Deploy New Revision – Step-by-Step Walkthrough

Use this when your **backend service already exists** on Cloud Run and you want to deploy the **latest code** from GitHub (e.g. after you pushed the delete fix).

---

## Step 1 – Open Google Cloud Console

1. In your browser, go to: **https://console.cloud.google.com**
2. Sign in if asked.
3. At the **top of the page**, check the **project name** (next to “Google Cloud”).  
   - It must be the **same project** where your SOP backend is.  
   - If it shows a different project, click the project name and switch to the correct one.

---

## Step 2 – Go to Cloud Run

1. At the **very top** of the page, find the **search box** (it says something like **“Search for products and resources”**).
2. Click in the box, type: **Cloud Run**
3. Press **Enter** (or click **Cloud Run** in the list).
4. Click **Cloud Run** in the results.  
   You should now be on the **Cloud Run** page.

**If you prefer the menu:**  
- Click the **three horizontal lines** (☰) at the top left.  
- In the menu, find **Cloud Run** (it may be under **Compute** or **Serverless**).  
- Click **Cloud Run**.

---

## Step 3 – Make Sure You’re on Services (Not Jobs)

1. On the Cloud Run page you may see **Services** and **Jobs** (tabs or links near the top).
2. Click **Services** (or the **Services** tab).  
   You need the list of **services**, not jobs.
3. You should see a list of services. One of them is your backend (e.g. **sop-backend** or **sop-shared-backend**).

---

## Step 4 – Open Your Backend Service

1. In the list of services, find your **backend service** (the one you use for the SOP app).
2. **Click the service name** (e.g. **sop-backend**).  
   Do **not** click “Create Service” or “Create job”.  
   You are opening the **existing** service.
3. You should now be on the **service details** page. At the top you’ll see the service name and a URL like `https://sop-backend-xxxxx.run.app`.

---

## Step 5 – Start “Edit & Deploy New Revision”

1. On the service details page, look near the **top** for a button or link that says:
   - **“EDIT & DEPLOY NEW REVISION”**, or  
   - **“Edit”** (and then you’ll look for Deploy), or  
   - **“Manage revisions”** → then **“Deploy new revision”**
2. **Click “EDIT & DEPLOY NEW REVISION”** (or the **Edit** button).  
   A new page or panel opens where you can change settings and deploy.

---

## Step 6 – Check the Source (Usually Leave As-Is)

1. You’ll see a **Source** or **Build** section (e.g. “Continuously deploy from a repository”).
2. It should show:
   - **Repository:** your GitHub repo (e.g. RECORPSOPTOOL or your repo name)
   - **Branch:** e.g. **main**
   - **Directory:** e.g. **sop-shared-backend**
3. **You usually do not need to change anything here** if you already pushed the new code to GitHub.  
   The new revision will build from the **latest commit** on that branch.
4. If you **do** need to change repo, branch, or directory, make the change. Otherwise leave it and scroll down.

---

## Step 7 – Check Environment Variables (Optional)

1. Scroll until you see **“Variables and secrets”**, **“Environment variables”**, or **“Container, Variables & Secrets”**.
2. **Expand** that section if it’s collapsed.
3. You should see your existing variables, e.g.:
   - **SOP_FOLDER_ID**
   - **GOOGLE_SERVICE_ACCOUNT_JSON**
4. **You usually do not need to change these** for a simple code update.  
   Only change them if you were told to (e.g. new folder or new service account).
5. Scroll to the bottom of the page.

---

## Step 8 – Deploy the New Revision

1. At the **bottom** of the page, find the blue button that says:
   - **“DEPLOY”**, or  
   - **“Deploy”**, or  
   - **“Save and deploy new revision”**
2. **Click that button.**
3. **Wait 2–5 minutes.** Do not close the page.  
   You’ll see a progress message or spinner (e.g. “Building”, “Deploying”).
4. When it finishes, you’ll see a success message or be taken back to the service page.  
   The **new revision** is now live and the backend is using the latest code from GitHub.

---

## Step 9 – Confirm It Worked

1. On the service page you should see that a **new revision** is active (e.g. “Revision 2” or a new timestamp).
2. The **URL** at the top is unchanged (e.g. `https://sop-backend-xxxxx.run.app`).  
   Your app already uses this URL; no need to change anything in the frontend.
3. You can test the app (e.g. delete an SOP from the Register) to confirm the new behavior.

---

## Quick Checklist

- [ ] Opened **console.cloud.google.com** and the correct **project**
- [ ] Went to **Cloud Run** → **Services**
- [ ] Clicked the **existing backend service** (e.g. sop-backend)
- [ ] Clicked **“EDIT & DEPLOY NEW REVISION”** (or **Edit**)
- [ ] Left **Source** (repo, branch, directory) as-is
- [ ] Left **environment variables** as-is (unless you had to change them)
- [ ] Clicked **DEPLOY** (or **Deploy** / **Save and deploy**)
- [ ] Waited for the build and deploy to finish

---

## If You Don’t See “Edit & Deploy New Revision”

- Look for **“Edit”** at the top of the service page; click it, then look for **“Deploy”** or **“Deploy new revision”** at the bottom.
- Or open the **“Revisions”** tab for the service; there may be a **“Deploy new revision”** or **“Create new revision”** button there.
- The exact words can vary by Google Cloud interface; the idea is: **edit the service → deploy a new revision** so the latest code from the repo is built and run.
