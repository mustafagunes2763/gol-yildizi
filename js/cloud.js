// Kayıt sistemi: 3 kayıt yuvası telefonda (localStorage).
// İsteğe bağlı: Google ile giriş yapılırsa her kayıtta otomatik olarak Firebase'e yedeklenir.
// Arkadaş sıralaması şimdilik kapalı (SHOW_LEADERBOARD), kodu duruyor.
import { firebaseConfig } from './firebase-config.js';
import { overall } from './engine.js';

export const SHOW_LEADERBOARD = false;
export const SLOTS = 3;
const SDK = 'https://www.gstatic.com/firebasejs/11.0.2';
const OLD_KEY = 'golyildizi.save.v1';
const slotKey = (i) => `golyildizi.slot.${i}`;
const ACTIVE_KEY = 'golyildizi.active';

let fb = null;
let user = null;
let syncTimer = null;
let lastBackup = null;   // { at, ok }
const listeners = new Set();

export const cloudEnabled = () => !!firebaseConfig.apiKey;
export const currentUser = () => user;
export const lastBackupInfo = () => lastBackup;
export const onUser = (fn) => { listeners.add(fn); fn(user); return () => listeners.delete(fn); };

// ---------- yerel ----------
const ls = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { console.warn(e); return false; } },
  del(k) { try { localStorage.removeItem(k); } catch { /* yoksay */ } },
};

// Eski tek kayıt -> 1. yuva
(function migrate() {
  const old = ls.get(OLD_KEY);
  if (old && !ls.get(slotKey(0))) { ls.set(slotKey(0), old); ls.set(ACTIVE_KEY, '0'); }
  if (old) ls.del(OLD_KEY);
})();

export const activeSlot = () => Math.min(SLOTS - 1, Math.max(0, +(ls.get(ACTIVE_KEY) ?? 0) || 0));
export const setActiveSlot = (i) => ls.set(ACTIVE_KEY, String(i));

export function loadSlot(i) {
  try { return JSON.parse(ls.get(slotKey(i)) || 'null'); } catch { return null; }
}
export function slotSummaries() {
  return Array.from({ length: SLOTS }, (_, i) => {
    const s = loadSlot(i);
    if (!s?.player) return { i, empty: true };
    const p = s.player;
    return {
      i, empty: false,
      name: `${p.name} ${p.surname}`, age: p.age,
      club: s.teams?.[p.clubId]?.name || '—',
      season: s.season ? `${s.season.year}-${String(s.season.year + 1).slice(2)}` : '',
      week: (s.season?.week ?? 0) + 1,
      goals: p.career?.goals ?? 0,
      ovr: p.stats ? overall(p) : 0,
      updatedAt: s.updatedAt || 0,
    };
  });
}
export function deleteSlot(i) {
  ls.del(slotKey(i));
  if (fb && user) {
    const { db, fsM } = fb;
    fsM.deleteDoc(fsM.doc(db, 'saves', user.uid, 'slots', String(i))).catch((e) => console.warn(e));
  }
}

export function save(state, slot = activeSlot()) {
  state.updatedAt = Date.now();
  ls.set(slotKey(slot), JSON.stringify(state));
  if (fb && user) {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => pushSlot(slot, state), 1500);
  }
}

// ---------- dosya yedeği ----------
export function exportAll() {
  const slots = Array.from({ length: SLOTS }, (_, i) => loadSlot(i));
  return JSON.stringify({ app: 'gol-yildizi', v: 1, exportedAt: Date.now(), slots });
}
export function importAll(text) {
  const data = JSON.parse(text);
  if (data?.app !== 'gol-yildizi' || !Array.isArray(data.slots)) throw new Error('Bu bir Gol Yıldızı yedeği değil.');
  let n = 0;
  data.slots.slice(0, SLOTS).forEach((s, i) => { if (s?.player) { ls.set(slotKey(i), JSON.stringify(s)); n++; } });
  return n;
}

// ---------- Firebase ----------
export async function initCloud() {
  if (!cloudEnabled()) return null;
  try {
    const [appM, authM, fsM] = await Promise.all([
      import(`${SDK}/firebase-app.js`),
      import(`${SDK}/firebase-auth.js`),
      import(`${SDK}/firebase-firestore.js`),
    ]);
    const app = appM.initializeApp(firebaseConfig);
    const auth = authM.getAuth(app);
    const db = fsM.getFirestore(app);
    fb = { auth, db, authM, fsM };
    try { await authM.getRedirectResult(auth); } catch (_) { /* yoksay */ }
    authM.onAuthStateChanged(auth, (u) => { user = u; listeners.forEach((fn) => fn(u)); });
    return fb;
  } catch (e) {
    console.warn('Firebase yüklenemedi, çevrimdışı devam', e);
    fb = null;
    return null;
  }
}

export async function signIn() {
  if (!fb) throw new Error('Firebase ayarlı değil');
  const { auth, authM } = fb;
  const provider = new authM.GoogleAuthProvider();
  try {
    await authM.signInWithPopup(auth, provider);
  } catch (e) {
    if (String(e.code).includes('popup')) await authM.signInWithRedirect(auth, provider);
    else throw e;
  }
}
export async function signOut() { if (fb) await fb.authM.signOut(fb.auth); }

async function pushSlot(slot, state) {
  if (!fb || !user) return;
  const { db, fsM } = fb;
  try {
    await fsM.setDoc(fsM.doc(db, 'saves', user.uid, 'slots', String(slot)), { data: JSON.stringify(state), updatedAt: state.updatedAt });
    lastBackup = { at: Date.now(), ok: true };
    if (SHOW_LEADERBOARD) await pushSummary(state);
  } catch (e) {
    console.warn('Bulut yedeği başarısız', e);
    lastBackup = { at: Date.now(), ok: false };
  }
}

// Girişte: bulutta daha yeni olan yuvaları telefona indir, telefonda daha yeni olanları buluta gönder
export async function syncAll() {
  if (!fb || !user) return { down: 0, up: 0 };
  const { db, fsM } = fb;
  let down = 0, up = 0;
  for (let i = 0; i < SLOTS; i++) {
    const local = loadSlot(i);
    let remote = null;
    try {
      const snap = await fsM.getDoc(fsM.doc(db, 'saves', user.uid, 'slots', String(i)));
      if (snap.exists()) remote = { updatedAt: snap.data().updatedAt, data: snap.data().data };
    } catch (e) { console.warn(e); }
    if (remote && (!local || remote.updatedAt > (local.updatedAt || 0))) {
      ls.set(slotKey(i), remote.data); down++;
    } else if (local && (!remote || (local.updatedAt || 0) > remote.updatedAt)) {
      await pushSlot(i, local); up++;
    }
  }
  lastBackup = { at: Date.now(), ok: true };
  return { down, up };
}

// ---------- arkadaş sıralaması (kapalı) ----------
async function pushSummary(state) {
  const { db, fsM } = fb;
  const p = state.player;
  await fsM.setDoc(fsM.doc(db, 'players', user.uid), {
    name: `${p.name} ${p.surname}`, owner: user.displayName || '',
    club: state.teams[p.clubId]?.name || '-', age: p.age, overall: overall(p),
    goals: p.career.goals, assists: p.career.assists, apps: p.career.apps,
    money: Math.round(p.money), updatedAt: state.updatedAt,
  });
}
export async function leaderboard(field = 'goals') {
  if (!fb || !user) return [];
  const { db, fsM } = fb;
  const q = fsM.query(fsM.collection(db, 'players'), fsM.orderBy(field, 'desc'), fsM.limit(50));
  const snap = await fsM.getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}
