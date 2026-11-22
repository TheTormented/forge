// Persistent state kept on the device (IndexedDB, falling back to localStorage).

const DB_NAME = 'forge';
const STORE = 'kv';
const KEY = 'state';
const LS_KEY = 'forge-state';

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function defaultState() {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    onboarded: false,
    profile: { sex: 'male', age: 25, heightCm: 178, weightKg: 80, activity: 1.55, goal: 'maintain' },
    targets: { kcal: 2600, p: 160, c: 300, f: 75 },
    targetsHistory: [],  // [{ from: 'YYYY-MM-DD', targets }]
    plan: { presetId: null, name: '', days: [], schedule: [null, null, null, null, null, null, null] },
    scheduleHistory: [], // [{ from: 'YYYY-MM-DD', schedule: [dayId|null x7] }]
    sessions: [],        // finished sessions
    active: null,        // session in progress
    foods: [],           // saved foods
    meals: [],           // saved meals (groups of foods)
    foodLog: {},         // { 'YYYY-MM-DD': [entry] }
    weights: [],         // [{ date, kg }]
    settings: { restTimer: true },
  };
}

function openDB() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('no idb'));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

let db = null;

export async function load() {
  let data = null;
  try {
    db = await openDB();
    data = await new Promise((resolve, reject) => {
      const r = db.transaction(STORE).objectStore(STORE).get(KEY);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => reject(r.error);
    });
  } catch { db = null; }
  if (!data) {
    try { data = JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch { data = null; }
  }
  try { navigator.storage?.persist?.(); } catch { /* optional */ }
  return migrate(data);
}

export function migrate(data) {
  const base = defaultState();
  if (!data || typeof data !== 'object') return base;
  return { ...base, ...data, profile: { ...base.profile, ...data.profile }, settings: { ...base.settings, ...data.settings } };
}

let timer = null;
export function save(state) {
  clearTimeout(timer);
  timer = setTimeout(() => writeNow(state), 150);
}

export async function writeNow(state) {
  clearTimeout(timer);
  const json = JSON.stringify(state);
  try { localStorage.setItem(LS_KEY, json); } catch { /* quota: IndexedDB is the main store */ }
  if (!db) return;
  await new Promise(resolve => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(JSON.parse(json), KEY);
    tx.oncomplete = tx.onerror = () => resolve();
  });
}

// Make sure data is flushed when the app is backgrounded on iOS.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && window.__forgeState) writeNow(window.__forgeState);
});
