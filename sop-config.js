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
window.firebaseConfig = {
    apiKey: 'AIzaSyAwf4H3sgGNZYsvJ3Hx8Hf3iCcPMMMuh20',
    authDomain: 'soptool-4360d.firebaseapp.com',
    projectId: 'soptool-4360d',
    storageBucket: 'soptool-4360d.firebasestorage.app',
    messagingSenderId: '427908617162',
    appId: '1:427908617162:web:d982f4b5e8a9aa0419f533',
    measurementId: 'G-M5YEQVZNT2'
};
