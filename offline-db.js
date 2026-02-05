export const OfflineDB = {
    dbName: 'CognitoAttendOffline',
    dbVersion: 1,
    db: null,

    async init() {
        if (this.db) return this.db;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('pendingScans')) {
                    db.createObjectStore('pendingScans', { keyPath: 'id', autoIncrement: true });
                }
            };
            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve(this.db);
            };
            request.onerror = (e) => reject(e);
        });
    },

    async saveScan(scanData) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('pendingScans', 'readwrite');
            const store = tx.objectStore('pendingScans');
            const request = store.add({ ...scanData, timestamp: new Date() });
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e);
        });
    },

    async getPendingScans() {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('pendingScans', 'readonly');
            const store = tx.objectStore('pendingScans');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e);
        });
    },

    async clearScans(ids) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('pendingScans', 'readwrite');
            const store = tx.objectStore('pendingScans');
            ids.forEach(id => store.delete(id));
            tx.oncomplete = () => resolve();
            tx.onerror = (e) => reject(e);
        });
    }
};
