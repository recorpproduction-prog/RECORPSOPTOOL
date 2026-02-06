# Why You Were Seeing "Error Not Found" – and What Was Fixed

## What was happening

1. **Where "Not found" came from**  
   The **shared-sop-api.js** script calls the backend (e.g. `GET .../sops`) to load SOPs. When the backend returned **404**, it sent a JSON body like `{"error":"Not found"}`. The script then did:
   - `msg = data.error` → `"Not found"`
   - `throw new Error(msg)`  
   So the app was literally throwing and showing the backend’s **"Not found"** text in the UI (Load SOP list and the red connection banner).

2. **Why the backend might return 404**  
   - **Backend not (re)deployed** – The service running on Cloud Run is an old image that doesn’t have the `/sops`, `/users`, `/requests` routes, so every request hits the “unknown route” handler and returns 404.  
   - **Wrong path** – Proxy or config sends a path the server doesn’t recognize (e.g. typo or extra prefix).  
   - **Wrong URL** – The app is calling a different host (typo, old bookmark, or wrong config) that returns 404.

3. **Why it showed up on phone**  
   On the phone you’re still hitting the same backend URL. If that URL gets 404 (for any of the reasons above), the app showed “Not found” and didn’t load users/requests. Caching could also have kept an old frontend that displayed the raw error.

## What was fixed in code

- **shared-sop-api.js**  
  - For **GET /sops**: if the response status is **404**, we no longer throw; we **return {}** so the app uses local/empty data and doesn’t show “Not found”.  
  - For any **!res.ok**, we no longer show the raw `data.error` when it’s “Not found” or “endpoint_not_found”; we replace it with a short message like “Cannot reach SOP server.” so the UI never shows the backend’s “Not found” text.

- **app.js**  
  - **loadAllSopsMerged**: if the cloud load fails with a “not found” / “cannot reach” style error and we have no cloud SOPs, we **return (local) savedSops** instead of rethrowing, so the app doesn’t throw and doesn’t show “Not found” in the list or banner.  
  - **showLoadSection** (Load SOP): we sanitize the error message so any backend-style “Not found” or JSON error is replaced with “Cannot reach SOP server. Check internet and backend URL.” so you never see raw “error not found” in that screen.

- **Backend** (already done earlier)  
  - Root path returns 200 and a message instead of 404.  
  - 404 body changed from `{"error":"Not found"}` to `{"error":"endpoint_not_found", "message":"..."}` so the frontend can treat it as a generic “server/endpoint” problem.

## What you should do

1. **Redeploy the backend**  
   Deploy the current **sop-shared-backend** (with `/sops`, `/users`, `/requests` and the root route) to Cloud Run so the live service is the one we’re testing against.

2. **Use the diagnostic page on your phone**  
   - Host **backend-test.html** on the same server as your app (or open it from the same place you open the app).  
   - On your phone, open **backend-test.html** and tap “Test again”.  
   - It will call the same base URL the app uses and show:
     - **Root** – should be 200 and something like `{"ok":true,"message":"SOP backend"}`.  
     - **SOPs list**, **Users**, **Requests** – should be 200 and JSON with `sops` / `users` / `requests` (can be empty).  
   - If any of these show **404** or “Not found”, the problem is that the backend at that URL is either old (not redeployed) or the path/URL is wrong.

3. **Clear cache on the phone**  
   Hard refresh or clear site data for the SOP app so it loads the updated **app.js** and **shared-sop-api.js** that no longer surface “Not found”.

4. **Confirm backend URL**  
   In **index.html** and **sop-config.js** the URL should be exactly your Cloud Run URL with **no path**, e.g.  
   `https://sop-backend-1065392834988.us-central1.run.app`

After redeploying, testing with **backend-test.html**, and clearing cache, the app should stop showing “error not found” and users/requests should load when the backend returns 200 for `/users` and `/requests`.
