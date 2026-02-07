# Firebase Setup – Step by Step

Users and pending SOP requests sync across all devices. You configure Firebase once; people just open the app. No keys or setup per device.

---

## Step 1: Create a Firebase Project

1. Open your browser and go to **https://console.firebase.google.com/**
2. Sign in with your Google account (or create one)
3. On the Firebase home page, click **Create a project**
4. **Project name:** type something like `recorp-sop-tool` (or any name)
5. Click **Continue**
6. **Google Analytics:** toggle **OFF** (you don't need it)
7. Click **Create project**
8. Wait 30–60 seconds for the project to be created
9. When you see "Your new project is ready", click **Continue**

---

## Step 2: Enable Anonymous Authentication

1. In the left sidebar, click **Build** → **Authentication**
   - If you see "Get started", click it
2. Click the **Sign-in method** tab (top of the page)
3. In the list of providers, find **Anonymous**
4. Click **Anonymous**
5. Turn the **Enable** switch **ON**
6. Click **Save**
7. You should see "Anonymous" listed with "Enabled"

---

## Step 3: Create a Firestore Database

1. In the left sidebar, click **Build** → **Firestore Database**
2. Click **Create database**
3. **Security rules:**
   - Choose **Start in production mode**
   - Click **Next**
4. **Cloud Firestore location:**
   - Pick a region (e.g. `us-central1` or the one closest to you)
   - Click **Enable**
5. Wait 30–60 seconds for the database to be created
6. You should see an empty Firestore database with "Rules", "Indexes", and "Data" tabs

---

## Step 4: Set Firestore Security Rules

1. In Firestore, click the **Rules** tab (top of the page)
2. You'll see existing rules. **Select all the text** and delete it
3. **Paste** this exactly:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sopToolShared/{docId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Click **Publish**
5. You should see a message that the rules were published successfully

---

## Step 5: Add Your Web App and Get the Config

1. In the left sidebar, click the **gear icon** ⚙️ next to "Project Overview"
2. Click **Project settings**
3. Scroll down to the **Your apps** section
4. Click the **web** icon (looks like `</>`)
5. **App nickname:** type something like `SOP Tool` (or leave blank)
6. **Firebase Hosting:** leave unchecked
7. Click **Register app**
8. You'll see a code block with `firebaseConfig`. **Copy the values** – you need:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`
9. Click **Continue to console** (or **Next** until you're back to the console)

It will look like this (your values will be different):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "recorp-sop-tool.firebaseapp.com",
  projectId: "recorp-sop-tool",
  storageBucket: "recorp-sop-tool.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
};
```

---

## Step 6: Add the Config to Your SOP Tool

1. Open your project folder
2. Open the file **sop-config.js** in a text editor
3. Find the `window.firebaseConfig` section (near the bottom)
4. Replace the placeholder values with your real values from Step 5:

```javascript
window.firebaseConfig = {
    apiKey: 'AIzaSyCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    authDomain: 'recorp-sop-tool.firebaseapp.com',
    projectId: 'recorp-sop-tool',
    storageBucket: 'recorp-sop-tool.appspot.com',
    messagingSenderId: '123456789012',
    appId: '1:123456789012:web:abcdef123456789'
};
```

5. Use your actual values – especially `apiKey`, `projectId`, and `appId`
6. Save the file

---

## Step 7: Test the App

1. Run your app locally (e.g. double-click `start-server.bat` or open `index.html`)
2. Open the app in your browser
3. Open the browser console (F12 → Console tab)
4. You should see: **"Firebase sync ready – users and requests sync across devices"**
5. Add a user or submit an SOP request
6. Open the same app on another device (or another browser/incognito window)
7. You should see the same users and requests

---

## Checklist

- [ ] Step 1: Firebase project created
- [ ] Step 2: Anonymous authentication enabled
- [ ] Step 3: Firestore database created
- [ ] Step 4: Security rules set and published
- [ ] Step 5: Web app added and config copied
- [ ] Step 6: Config pasted into sop-config.js
- [ ] Step 7: App tested and data syncs

---

## Troubleshooting

**"Firebase sync not available" in console**
- Check that all values in `sop-config.js` are real (no `YOUR_API_KEY` or `YOUR_PROJECT_ID`)
- Make sure Anonymous auth is enabled in Firebase Console
- Make sure Firestore rules are published

**Data doesn't sync between devices**
- Both devices must use the same app (same `sop-config.js` with the same Firebase config)
- Check the console (F12) on each device for errors

**Permission denied errors**
- Double-check the Firestore rules (Step 4) – they must allow `request.auth != null`
- Make sure Anonymous auth is enabled

---

## What You Do vs. What Users Do

| You (one-time)          | End users          |
|-------------------------|--------------------|
| Create Firebase project | Nothing            |
| Enable Anonymous auth   | Nothing            |
| Create Firestore        | Nothing            |
| Add config to app       | Nothing            |
| Deploy app              | Open the app URL   |

Users do not enter any keys, tokens, or credentials.
