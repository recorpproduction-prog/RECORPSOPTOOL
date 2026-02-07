# Fix: "Missing or insufficient permissions" for SOPs

If you see **"Firebase load SOPs: Missing or insufficient permissions"** in the console, your Firestore rules need to allow access to the `sops` collection.

## Fix

1. Go to [Firebase Console](https://console.firebase.google.com/) → your project
2. Click **Build** → **Firestore Database**
3. Click the **Rules** tab
4. Replace your rules with this (or add the `sops` block if you already have `sopToolShared`):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sopToolShared/{docId} {
      allow read, write: if request.auth != null;
    }
    match /sops/{sopId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

5. Click **Publish**

Both `sopToolShared` (users + requests) and `sops` (completed SOPs, under review) must be in the rules.
