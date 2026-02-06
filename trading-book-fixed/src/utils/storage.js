export const STORAGE_PREFIX = 'tb:';
export const STORAGE_VERSION = 1;

export const keys = {
  version: `${STORAGE_PREFIX}version`,
  completedLawIds: `${STORAGE_PREFIX}completedLawIds`,
  progress: `${STORAGE_PREFIX}progress`,
  appliedLaw: `${STORAGE_PREFIX}appliedLaw`,
  chartData: `${STORAGE_PREFIX}chartData`,
  tutorialState: `${STORAGE_PREFIX}tutorialState`,
  disableChart: `${STORAGE_PREFIX}disableChart`,
};

export const safeJsonParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const safeGetJSON = (key, fallback) => {
  const raw = localStorage.getItem(key);
  if (raw == null) return fallback;
  const parsed = safeJsonParse(raw, fallback);
  return parsed ?? fallback;
};

export const safeSetJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('[storage] set failed', key, error);
    return false;
  }
};

export const clearAppStorage = () => {
  const toDelete = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      toDelete.push(key);
    }
  }
  toDelete.forEach((key) => localStorage.removeItem(key));
};

export const ensureStorageVersion = () => {
  const stored = safeGetJSON(keys.version, null);
  if (stored !== STORAGE_VERSION) {
    clearAppStorage();
    safeSetJSON(keys.version, STORAGE_VERSION);
  }
};
