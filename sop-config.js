/**
 * SOP shared backend URL – used so staff see SOPs with no setup.
 * Update this URL if you redeploy the backend to a new Cloud Run URL.
 */
window.SOP_SHARED_API_URL = 'https://sop-backend-1065392834988.us-central1.run.app';

/**
 * Firebase – users and requests sync across all devices. No per-device setup.
 * Add your Firebase config here (from Firebase Console → Project settings → Your apps).
 * Leave as null/empty to skip Firebase and use localStorage only.
 */
window.firebaseConfig = window.firebaseConfig || {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT_ID.appspot.com',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID'
};
