const DB_NAME = 'tb-market-cache';
const DB_VERSION = 1;
const STORE_NAME = 'candles';

const openDb = () =>
  new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('INDEXED_DB_UNAVAILABLE'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const withStore = async (mode, callback) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const result = callback(store);

    transaction.oncomplete = () => {
      db.close();
      resolve(result);
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

export const getCachedBars = async (key, ttlMs) => {
  try {
    return await withStore('readonly', (store) =>
      new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => {
          const entry = request.result;
          if (!entry) {
            resolve(null);
            return;
          }
          if (ttlMs && Date.now() - entry.timestamp > ttlMs) {
            resolve(null);
            return;
          }
          resolve(entry);
        };
        request.onerror = () => reject(request.error);
      })
    );
  } catch (error) {
    console.warn('[cache] read failed', error);
    return null;
  }
};

export const setCachedBars = async (key, bars) => {
  try {
    await withStore('readwrite', (store) =>
      store.put({ key, bars, timestamp: Date.now() })
    );
  } catch (error) {
    console.warn('[cache] write failed', error);
  }
};

export const getTimeframeTtl = (timeframeId) => {
  if (['1m', '5m'].includes(timeframeId)) return 30 * 1000;
  if (['15m', '1h'].includes(timeframeId)) return 2 * 60 * 1000;
  if (['4h'].includes(timeframeId)) return 5 * 60 * 1000;
  return 15 * 60 * 1000;
};
