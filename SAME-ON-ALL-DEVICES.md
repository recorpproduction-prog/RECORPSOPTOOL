# Same Data on Every Device – What You Need

## How it works now

- **One sync function** (`syncSharedData()`) loads **Users** and **Submitted SOP requests** from your backend (Google Drive) and updates the app state. It runs:
  - On app load (and again after 2.5s on slow connections)
  - When you open the **SOP Requests** tab
  - When you open the **Users** tab
- **SOP Register** and **Under Review** already load from the same backend via `loadAllSopsMerged()` when you open those tabs (you said that part works).
- **Backend URL** is fixed: if `SOP_SHARED_API_URL` is missing or invalid, the app uses the default Cloud Run URL so it works on every device.

## What you must do once

1. **Deploy the backend** (with `/users` and `/requests` routes) to Cloud Run.  
   Use the code in `sop-shared-backend/` and set env: `SOP_FOLDER_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON`.  
   See e.g. `REDEPLOY-BACKEND.md` or your deploy docs.

2. **Use the same app URL everywhere**  
   Open the app from the same place (e.g. GitHub Pages or your server) on desktop and phone. No local `file://` on one device and a URL on another.

3. **Hard refresh on phone**  
   After deploying the new frontend, clear cache or hard refresh the app on the phone so it loads the latest `app.js`.

## Result

- **Users** and **Submitted SOP requests** come from the backend every time you open those tabs or the app, so they stay the same on all devices.
- **SOP Register** and **Under Review** come from the same backend when you open those tabs, so they stay in sync as well.

No extra setup per device; deploy the backend once and use the same app URL everywhere.
