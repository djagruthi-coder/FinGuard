/* ============================================================
   db.js – Simple IndexedDB wrapper for storing user profiles
   ============================================================ */

'use strict';

const DB_NAME = 'FinGuardDB';
const DB_VERSION = 1;
const USER_STORE = 'users';

function openDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported')); // will fallback to localStorage
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(USER_STORE)) {
        const store = db.createObjectStore(USER_STORE, { keyPath: 'mobile' });
        store.createIndex('byName', 'name', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

async function withStore(storeName, mode, callback) {
  try {
    const db = await openDb();
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const result = await callback(store);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch (error) {
    // Fallback to localStorage if IndexedDB is not available.
    console.warn('IndexedDB unavailable, falling back to localStorage', error);
    return callback({
      get: (key) => Promise.resolve(JSON.parse(localStorage.getItem(key))),
      put: (value) => {
        localStorage.setItem(value.mobile || 'unknown', JSON.stringify(value));
        return Promise.resolve();
      },
      getAll: () => {
        const values = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          try {
            values.push(JSON.parse(localStorage.getItem(key)));
          } catch {}
        }
        return Promise.resolve(values);
      }
    });
  }
}

async function getUserByMobile(mobile) {
  if (!mobile) return null;
  return withStore(USER_STORE, 'readonly', (store) => {
    return new Promise((resolve, reject) => {
      const req = store.get(mobile);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  });
}

async function saveUserProfile(user) {
  if (!user || !user.mobile) return;
  user.updatedAt = new Date().toISOString();
  return withStore(USER_STORE, 'readwrite', (store) => {
    return new Promise((resolve, reject) => {
      const req = store.put(user);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  });
}

async function getAllUsers() {
  return withStore(USER_STORE, 'readonly', (store) => {
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  });
}

// Expose DB helpers globally
window.FinGuardDB = {
  getUserByMobile,
  saveUserProfile,
  getAllUsers,
};
