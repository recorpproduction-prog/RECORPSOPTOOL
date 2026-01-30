/**
 * Shared SOP API – staff get SOPs from your backend with no API key or OAuth.
 * You set SOP_SHARED_API_URL once (e.g. in index.html); staff just open the app.
 */
(function () {
    'use strict';

    function getBaseUrl() {
        const url = typeof window !== 'undefined' && (window.SOP_SHARED_API_URL || window.sopSharedApiUrl);
        if (!url || typeof url !== 'string') return '';
        return url.replace(/\/$/, '');
    }

    function useSharedAccess() {
        return getBaseUrl().length > 0;
    }

    async function loadAllSopsFromSharedAPI() {
        const base = getBaseUrl();
        if (!base) return null;
        try {
            const res = await fetch(base + '/sops', { method: 'GET', headers: { Accept: 'application/json' } });
            if (!res.ok) throw new Error(res.statusText || 'Failed to load SOPs');
            const data = await res.json();
            const sops = data.sops || data;
            if (typeof sops === 'object' && !Array.isArray(sops)) return sops;
            return {};
        } catch (e) {
            console.warn('Shared SOP API load failed:', e.message);
            return null;
        }
    }

    async function saveSopToSharedAPI(sop) {
        const base = getBaseUrl();
        if (!base) return false;
        const sopId = (sop && sop.meta && sop.meta.sopId) || ('sop-' + Date.now());
        try {
            const res = await fetch(base + '/sops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(sop)
            });
            if (!res.ok) throw new Error(res.statusText || 'Failed to save SOP');
            return true;
        } catch (e) {
            console.error('Shared SOP API save failed:', e);
            throw e;
        }
    }

    async function deleteSopFromSharedAPI(sopId) {
        const base = getBaseUrl();
        if (!base) return false;
        try {
            const res = await fetch(base + '/sops/' + encodeURIComponent(sopId), { method: 'DELETE' });
            if (!res.ok) throw new Error(res.statusText || 'Failed to delete SOP');
            return true;
        } catch (e) {
            console.error('Shared SOP API delete failed:', e);
            throw e;
        }
    }

    if (typeof window !== 'undefined') {
        window.useSharedAccess = useSharedAccess;
        window.loadAllSopsFromSharedAPI = loadAllSopsFromSharedAPI;
        window.saveSopToSharedAPI = saveSopToSharedAPI;
        window.deleteSopFromSharedAPI = deleteSopFromSharedAPI;
    }
})();
