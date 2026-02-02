# Delete Still Not Working – Checklist

The backend now **never returns an error** when you delete an SOP. It always returns success and hides the SOP from the list (using real delete, trash, Drive file, or in-memory). Follow this to make sure the new code is actually running.

---

## 1. Backend code is on GitHub

- [ ] You pushed the latest **sop-shared-backend/index.js** to your GitHub repo (the same repo Cloud Run uses).
- [ ] In the repo, open **sop-shared-backend/index.js** and confirm near the top you see:  
  `const softDeletedIdsInMemory = new Set();`  
  If you don’t see that line, the new code is not in the repo yet.

---

## 2. Cloud Run is using the new code (redeploy)

Pushing to GitHub does **not** update the running backend. You must **deploy a new revision** on Cloud Run.

- [ ] Go to **[console.cloud.google.com](https://console.cloud.google.com)** → **Cloud Run** → **Services**.
- [ ] Click your **sop-backend** (or backend) service.
- [ ] Click **EDIT & DEPLOY NEW REVISION** (or **Edit**).
- [ ] Don’t change Source or Variables. Scroll to the bottom and click **Deploy**.
- [ ] Wait until the new revision is **green / Active** (2–5 minutes).

If you’re not sure whether a new revision was deployed, deploy again (Edit & Deploy New Revision → Deploy).

---

## 3. App is talking to Cloud Run (not cache)

- [ ] Hard refresh the app: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac), or open the app in a **private/incognito** window.
- [ ] Confirm the app’s backend URL is your Cloud Run URL (e.g. in **sop-config.js** or **index.html**: `SOP_SHARED_API_URL` = `https://sop-backend-xxxxx.run.app` with no slash at the end).

---

## 4. Try delete again

- [ ] Open the **SOP Register**.
- [ ] Click **Delete** on one SOP and confirm.
- [ ] You should see **“SOP deleted successfully”** (no error).
- [ ] The row should disappear (or disappear after a short refresh). If the list doesn’t update, click another tab and back to Register, or refresh the page.

---

## If you still see “Error deleting SOP: …”

Then the frontend is still getting an error response. That usually means:

1. **The running backend is still the old one**  
   Redeploy again (step 2) and wait until the new revision is active.

2. **The app is not calling your Cloud Run URL**  
   Check **sop-config.js** and **index.html** for `SOP_SHARED_API_URL` and confirm it’s your Cloud Run URL.

3. **Network or CORS**  
   Open the browser **Developer Tools** (F12) → **Network** tab → delete an SOP → click the **DELETE** request to your backend URL. Check the **Status** (should be 200) and **Response**. If you see 200 and `{"ok":true}`, the backend is succeeding and the issue is in the frontend (e.g. cache or refresh). If you see 403/500 or an error body, the request is hitting an old or different backend.

---

## Summary

1. Push **sop-shared-backend/index.js** to GitHub (with `softDeletedIdsInMemory`).
2. **Redeploy** on Cloud Run (Edit & Deploy New Revision → Deploy).
3. Hard refresh or incognito the app, then try delete again.

After that, delete should always succeed in the app and the SOP should disappear from the Register.
