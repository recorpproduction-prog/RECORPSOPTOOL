// Firebase Sync - Users, Requests, SOPs and Images across all devices
// Uses anonymous auth: no login, no keys per device. You configure once when deploying.

(function () {
    'use strict';
    var firebaseApp = null;
    var firestoreDb = null;
    var storage = null;
    var ready = false;
    var COLLECTION = 'sopToolShared';
    var SOPS_COLLECTION = 'sops';
    var IMAGES_PREFIX = 'sop-images/';

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
            var storageMod = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js');
            firebaseApp = mod.initializeApp(window.firebaseConfig);
            var auth = authMod.getAuth(firebaseApp);
            firestoreDb = fsMod.getFirestore(firebaseApp);
            storage = storageMod.getStorage(firebaseApp);
            if (typeof storage.setMaxUploadRetryTime === 'function') {
                storage.setMaxUploadRetryTime(5 * 60 * 1000);
            }
            await authMod.signInAnonymously(auth);
            ready = true;
            console.log('Firebase sync ready – users, requests, SOPs and images sync across devices');
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

    // --- SOPs and Images ---
    async function uploadBase64ToStorage(base64Data, storagePath) {
        if (!ready || !storage) throw new Error('Firebase not ready');
        var storageMod = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js');
        var ref = storageMod.ref(storage, storagePath);
        await storageMod.uploadString(ref, base64Data, 'data_url');
        return await storageMod.getDownloadURL(ref);
    }

    async function processSopForSave(sop) {
        if (!sop || !sop.steps) return sop;
        var sopId = (sop.meta && sop.meta.sopId) || 'sop-' + Date.now();
        var processed = JSON.parse(JSON.stringify(sop));
        for (var i = 0; i < processed.steps.length; i++) {
            var step = processed.steps[i];
            if (step.images && Array.isArray(step.images)) {
                var newImages = [];
                for (var j = 0; j < step.images.length; j++) {
                    var img = step.images[j];
                    if (typeof img === 'string' && img.indexOf('data:image') === 0) {
                        var path = IMAGES_PREFIX + sopId + '/step' + i + '_' + j + '.png';
                        try {
                            var url = await uploadBase64ToStorage(img, path);
                            newImages.push(url);
                        } catch (e) {
                            console.warn('Image upload failed (omitting to avoid Firestore size limit):', e.message);
                            // Do not keep base64 – Firestore doc limit is 1MB; save still succeeds
                        }
                    } else if (typeof img === 'string' && img.indexOf('http') === 0) {
                        newImages.push(img);
                    }
                }
                step.images = newImages;
            }
        }
        return processed;
    }

    async function loadSopsFromFirebase() {
        if (!ready || !firestoreDb) return null;
        try {
            var fs = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            var coll = fs.collection(firestoreDb, SOPS_COLLECTION);
            var snap = await fs.getDocs(coll);
            var out = {};
            snap.forEach(function (d) {
                var data = d.data();
                if (data.savedAt && data.savedAt.toDate) data.savedAt = data.savedAt.toDate().toISOString();
                if (data.updatedAt && data.updatedAt.toDate) data.updatedAt = data.updatedAt.toDate().toISOString();
                out[d.id] = data;
            });
            return out;
        } catch (e) {
            console.warn('Firebase load SOPs:', e.message);
            return null;
        }
    }

    async function saveSopToFirebase(sop) {
        if (!ready || !firestoreDb) return false;
        try {
            var fs = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            var processed = await processSopForSave(sop);
            var sopId = (processed.meta && processed.meta.sopId) || processed.sopId || 'sop-' + Date.now();
            processed.savedAt = new Date().toISOString();
            processed.updatedAt = fs.serverTimestamp();
            var ref = fs.doc(firestoreDb, SOPS_COLLECTION, sopId);
            await fs.setDoc(ref, processed, { merge: true });
            return true;
        } catch (e) {
            console.warn('Firebase save SOP:', e.message);
            return false;
        }
    }

    async function deleteSopFromFirebase(sopId) {
        if (!ready || !firestoreDb) return false;
        try {
            var fs = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            var ref = fs.doc(firestoreDb, SOPS_COLLECTION, sopId);
            await fs.deleteDoc(ref);
            return true;
        } catch (e) {
            console.warn('Firebase delete SOP:', e.message);
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
        window.loadSopsFromFirebase = loadSopsFromFirebase;
        window.saveSopToFirebase = saveSopToFirebase;
        window.deleteSopFromFirebase = deleteSopFromFirebase;
        if (ok) {
            if (typeof window.syncSharedData === 'function') window.syncSharedData();
            if (typeof window.refreshRegister === 'function') window.refreshRegister();
            if (typeof window.refreshReviewList === 'function') window.refreshReviewList();
        }
    });
})();
