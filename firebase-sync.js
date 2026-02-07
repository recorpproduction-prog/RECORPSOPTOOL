// Firebase Sync - Users & Requests across all devices
// Uses anonymous auth: no login, no keys per device. You configure once when deploying.

(function () {
    'use strict';
    var firebaseApp = null;
    var firestoreDb = null;
    var ready = false;
    var COLLECTION = 'sopToolShared';

    function useFirebaseSync() {
        return ready;
    }

    async function init() {
        var c = window.firebaseConfig;
        if (!c || !c.apiKey || c.apiKey.indexOf('YOUR_') === 0 || c.projectId.indexOf('YOUR_') === 0) {
            return false;
        }
        try {
            var mod = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
            var authMod = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
            var fsMod = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            firebaseApp = mod.initializeApp(window.firebaseConfig);
            var auth = authMod.getAuth(firebaseApp);
            firestoreDb = fsMod.getFirestore(firebaseApp);
            await authMod.signInAnonymously(auth);
            ready = true;
            console.log('Firebase sync ready – users and requests sync across devices');
            return true;
        } catch (e) {
            console.warn('Firebase sync not available:', e.message);
            return false;
        }
    }

    async function loadUsers() {
        if (!ready || !firestoreDb) return null;
        try {
            var fs = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            var ref = fs.doc(firestoreDb, COLLECTION, 'users');
            var snap = await fs.getDoc(ref);
            var data = snap.exists() ? snap.data() : null;
            var users = (data && data.users) ? data.users : (Array.isArray(data) ? data : []);
            return Array.isArray(users) ? users : [];
        } catch (e) {
            console.warn('Firebase load users:', e.message);
            return null;
        }
    }

    async function loadRequests() {
        if (!ready || !firestoreDb) return null;
        try {
            var fs = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            var ref = fs.doc(firestoreDb, COLLECTION, 'requests');
            var snap = await fs.getDoc(ref);
            var data = snap.exists() ? snap.data() : null;
            var requests = (data && data.requests) ? data.requests : (Array.isArray(data) ? data : []);
            return Array.isArray(requests) ? requests : [];
        } catch (e) {
            console.warn('Firebase load requests:', e.message);
            return null;
        }
    }

    async function saveUsers(users) {
        if (!ready || !firestoreDb) return false;
        try {
            var fs = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            var ref = fs.doc(firestoreDb, COLLECTION, 'users');
            await fs.setDoc(ref, { users: Array.isArray(users) ? users : [], updatedAt: fs.serverTimestamp() });
            return true;
        } catch (e) {
            console.warn('Firebase save users:', e.message);
            return false;
        }
    }

    async function saveRequests(requests) {
        if (!ready || !firestoreDb) return false;
        try {
            var fs = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            var ref = fs.doc(firestoreDb, COLLECTION, 'requests');
            await fs.setDoc(ref, { requests: Array.isArray(requests) ? requests : [], updatedAt: fs.serverTimestamp() });
            return true;
        } catch (e) {
            console.warn('Firebase save requests:', e.message);
            return false;
        }
    }

    window.firebaseSyncReady = false;
    init().then(function (ok) {
        window.firebaseSyncReady = ok;
        window.useFirebaseSync = useFirebaseSync;
        window.loadUsersFromFirebase = loadUsers;
        window.loadRequestsFromFirebase = loadRequests;
        window.saveUsersToFirebase = saveUsers;
        window.saveRequestsToFirebase = saveRequests;
        if (ok && typeof window.syncSharedData === 'function') window.syncSharedData();
    });
})();
