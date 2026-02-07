# Get Your SOP Tool Going

Follow these steps to have the app running and syncing across all devices.

---

## 1. Finish Firebase Setup (if not done)

1. Open **FIREBASE_SETUP_INSTRUCTIONS.md**
2. Complete Steps 1–6 (create project, enable Anonymous auth, Firestore, Storage, rules, add config to `sop-config.js`)
3. Add your GitHub Pages domain to Firebase **Authentication** → **Settings** → **Authorized domains** (e.g. `recorpproduction-prog.github.io`)

---

## 2. Push Your Code to GitHub

1. Make sure your latest code (including `sop-config.js` with real Firebase values) is in your repo
2. Commit and push:

```bash
git add .
git commit -m "Add Firebase sync for users, requests, SOPs and images"
git push origin main
```

---

## 3. Turn On GitHub Pages

1. Go to your repo on GitHub (e.g. `github.com/recorpproduction-prog/RECORPSOPTOOL`)
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, choose **Deploy from a branch**
4. **Branch:** `main` (or `master`) → **/(root)** → **Save**
5. Wait 1–2 minutes for the site to build

---

## 4. Open the Live App

Your app will be at:

```
https://recorpproduction-prog.github.io/RECORPSOPTOOL
```

(Replace `recorpproduction-prog` and `RECORPSOPTOOL` with your GitHub username and repo name.)

---

## 5. Verify It Works

1. Open the URL in your browser
2. Press **F12** → **Console** tab
3. You should see: **"Firebase sync ready – users, requests, SOPs and images sync across devices"**
4. Add a user, submit a request, or save an SOP
5. Open the same URL on your phone (or another browser/incognito)
6. Confirm the same data appears

---

## 6. Share the Link

Give the URL to your team. They open it and use the app. No setup, no keys, no login.

---

## Quick Reference

| Step | What |
|------|------|
| Firebase | Project, Anonymous auth, Firestore, Storage, rules, config in `sop-config.js` |
| GitHub | Push code, enable Pages |
| Live URL | `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME` |
| Users | Open the link – no setup |

---

## Troubleshooting

**"Firebase sync not available"**
- Check `sop-config.js` has real values (no `YOUR_API_KEY`)
- Add your GitHub Pages domain to Firebase Authorized domains

**Data doesn’t sync**
- All devices must use the same live URL (not `file://` or `localhost`)

**Permission denied**
- Confirm Firestore and Storage rules are published
- Confirm Anonymous auth is enabled
