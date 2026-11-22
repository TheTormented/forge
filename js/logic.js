// Pure logic: dates, schedule, streaks, personal bests, macros, XP and levels.

// ---------- dates (local, 'YYYY-MM-DD') ----------
export const dateKey = (d = new Date()) => {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
export const todayKey = () => dateKey(new Date());
export const parseKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return dateKey(d); };
export const weekday = k => parseKey(k).getDay();
export const mondayOf = k => addDays(k, -((weekday(k) + 6) % 7));
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const fmtDate = (k, opts = { weekday: 'short', day: 'numeric', month: 'short' }) => parseKey(k).toLocaleDateString(undefined, opts);

// ---------- history helpers (value in effect on a date) ----------
function inEffect(history, key) {
  let found = null;
  for (const h of history) if (h.from <= key && (!found || h.from >= found.from)) found = h;
  return found;
}
export function setHistory(list, key, field, value) {
  const i = list.findIndex(h => h.from === key);
  const entry = { from: key, [field]: value };
  if (i >= 0) list[i] = entry; else list.push(entry);
  list.sort((a, b) => a.from.localeCompare(b.from));
}

/** Split day id scheduled on a date, or null for rest / before tracking. */
export function scheduledDayId(state, key) {
  const h = inEffect(state.scheduleHistory, key);
  return h ? h.schedule[weekday(key)] ?? null : null;
}
export function targetsOn(state, key) {
  const h = inEffect(state.targetsHistory || [], key);
  return h ? h.targets : state.targets;
}
export const dayById = (state, id) => state.plan.days.find(d => d.id === id) || null;

export function sessionsByDate(state) {
  const m = new Map();
  for (const s of state.sessions) {
    if (!m.has(s.date)) m.set(s.date, []);
    m.get(s.date).push(s);
  }
  return m;
}

// ---------- streak ----------
/** Counts consecutive scheduled sessions completed. Rest days never break it; today only counts once done. */
export function streaks(state, upTo = todayKey()) {
  const firstSched = state.scheduleHistory[0]?.from;
  if (!firstSched) return { current: 0, best: 0 };
  const byDate = sessionsByDate(state);
  let cur = 0, best = 0;
  for (let k = firstSched; k <= upTo; k = addDays(k, 1)) {
    if (!scheduledDayId(state, k)) continue;
    if (byDate.has(k)) { cur++; best = Math.max(best, cur); }
    else if (k < upTo) cur = 0;
  }
  return { current: cur, best };
}

// ---------- personal bests: most reps at a weight ----------
const norm = s => s.trim().toLowerCase();

/** Previous done sets for an exercise, from sessions other than `excludeId` that finished before `before`. */
export function exerciseHistory(state, name, excludeId = null) {
  const n = norm(name), out = [];
  for (const s of state.sessions) {
    if (s.id === excludeId) continue;
    for (const e of s.exercises) if (norm(e.name) === n) for (const set of e.sets) if (set.done && set.r > 0) out.push({ w: +set.w || 0, r: +set.r, date: s.date });
  }
  return out;
}

/** Best reps previously achieved at this weight or heavier (doing 8 @ 95 isn't a PB if you did 8 @ 100). */
export function bestRepsAtOrAbove(history, w) {
  let best = 0;
  for (const h of history) if (h.w >= w && h.r > best) best = h.r;
  return best;
}

/** True when the set beats your rep record at its weight. First time doing an exercise = baseline, not a PB. */
export function isPB(history, w, r) {
  if (!history.length || !(r > 0)) return false;
  return r > bestRepsAtOrAbove(history, +w || 0);
}

/** Rep records per weight for an exercise, heaviest first. */
export function pbTable(state, name) {
  const hist = exerciseHistory(state, name);
  const byW = new Map();
  for (const h of hist) { const cur = byW.get(h.w); if (!cur || h.r > cur.r) byW.set(h.w, h); }
  return [...byW.values()].sort((a, b) => b.w - a.w);
}

/** Marks PB sets in a session (against all other sessions) and returns names of exercises with a PB. */
export function markPBs(state, session) {
  const pbs = [];
  for (const e of session.exercises) {
    const hist = exerciseHistory(state, e.name, session.id);
    let any = false;
    const running = [...hist];
    for (const set of e.sets) {
      set.pb = set.done && isPB(running, set.w, +set.r);
      if (set.pb) any = true;
      if (set.done && hist.length) running.push({ w: +set.w || 0, r: +set.r });
    }
    if (any) pbs.push(e.name);
  }
  return pbs;
}

export function lastPerformance(state, name, excludeId = null) {
  const n = norm(name);
  const sorted = [...state.sessions].filter(s => s.id !== excludeId).sort((a, b) => (b.finishedAt || '').localeCompare(a.finishedAt || ''));
  for (const s of sorted) {
    const e = s.exercises.find(x => norm(x.name) === n);
    if (e) { const sets = e.sets.filter(x => x.done); if (sets.length) return { date: s.date, sets }; }
  }
  return null;
}

// ---------- nutrition ----------
export function dayTotals(entries = []) {
  const t = { kcal: 0, p: 0, c: 0, f: 0 };
  for (const e of entries) { const q = +e.qty || 1; t.kcal += e.kcal * q; t.p += e.p * q; t.c += e.c * q; t.f += e.f * q; }
  return t;
}
/** Calories, carbs and fat within ±10%; protein at least 90% of target (no upper limit). */
export function macroStatus(totals, targets) {
  const within = (v, t) => t > 0 && Math.abs(v - t) <= t * 0.1;
  const s = {
    kcal: within(totals.kcal, targets.kcal),
    p: targets.p > 0 && totals.p >= targets.p * 0.9,
    c: within(totals.c, targets.c),
    f: within(totals.f, targets.f),
  };
  s.all = s.kcal && s.p && s.c && s.f;
  return s;
}

export const ACTIVITY = [
  { v: 1.2, label: 'Sedentary (desk job, little exercise)' },
  { v: 1.375, label: 'Light (training 1–3x/week)' },
  { v: 1.55, label: 'Moderate (training 3–5x/week)' },
  { v: 1.725, label: 'High (training 6–7x/week)' },
  { v: 1.9, label: 'Very high (physical job + training)' },
];
export const GOALS = [
  { v: 'cut', label: 'Cut (lose fat)', mult: 0.8, protein: 2.2 },
  { v: 'maintain', label: 'Maintain', mult: 1, protein: 2.0 },
  { v: 'bulk', label: 'Lean bulk', mult: 1.1, protein: 1.8 },
];
/** Mifflin–St Jeor BMR × activity, adjusted for goal. Fat 25% of calories, carbs fill the rest. */
export function suggestTargets(p) {
  const bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + (p.sex === 'female' ? -161 : 5);
  const goal = GOALS.find(g => g.v === p.goal) || GOALS[1];
  const kcal = Math.round((bmr * p.activity * goal.mult) / 10) * 10;
  const prot = Math.round(p.weightKg * goal.protein);
  const fat = Math.round((kcal * 0.25) / 9);
  const carbs = Math.max(0, Math.round((kcal - prot * 4 - fat * 9) / 4));
  return { kcal, p: prot, c: carbs, f: fat, bmr: Math.round(bmr), tdee: Math.round(bmr * p.activity) };
}

// ---------- XP ----------
export const XP = { session: 50, pb: 25, onSchedule: 20, perfectWeek: 100, macros: 40 };

/** Full XP ledger, recomputed from your data so edits never double-count. */
export function xpLedger(state, upTo = todayKey()) {
  const L = [];
  const seenSchedDay = new Set();
  for (const s of state.sessions) {
    L.push({ date: s.date, amount: XP.session, label: `Completed ${s.dayName}` });
    const pbCount = (s.pbs || []).length;
    if (pbCount) L.push({ date: s.date, amount: XP.pb * pbCount, label: `${pbCount} new PB${pbCount > 1 ? 's' : ''} · ${s.dayName}` });
    if (scheduledDayId(state, s.date) && !seenSchedDay.has(s.date)) {
      seenSchedDay.add(s.date);
      L.push({ date: s.date, amount: XP.onSchedule, label: 'On schedule' });
    }
  }
  // perfect weeks (Mon–Sun) with every scheduled session done
  const first = state.scheduleHistory[0]?.from;
  if (first) {
    const byDate = sessionsByDate(state);
    for (let wk = mondayOf(first); wk <= upTo; wk = addDays(wk, 7)) {
      let sched = 0, done = 0;
      for (let i = 0; i < 7; i++) {
        const k = addDays(wk, i);
        if (k < first || !scheduledDayId(state, k)) continue;
        sched++; if (byDate.has(k)) done++;
      }
      if (sched > 0 && sched === done) L.push({ date: addDays(wk, 6) > upTo ? upTo : addDays(wk, 6), amount: XP.perfectWeek, label: 'Perfect week' });
    }
  }
  for (const [k, entries] of Object.entries(state.foodLog)) {
    if (k > upTo || !entries.length) continue;
    if (macroStatus(dayTotals(entries), targetsOn(state, k)).all) L.push({ date: k, amount: XP.macros, label: 'Hit macro targets' });
  }
  return L.sort((a, b) => b.date.localeCompare(a.date));
}
export const totalXP = state => xpLedger(state).reduce((a, b) => a + b.amount, 0);

export const RANKS = [
  { level: 1, name: 'Rookie' }, { level: 5, name: 'Iron' }, { level: 10, name: 'Bronze' },
  { level: 15, name: 'Silver' }, { level: 20, name: 'Gold' }, { level: 30, name: 'Platinum' },
  { level: 40, name: 'Diamond' }, { level: 50, name: 'Titan' }, { level: 75, name: 'Legend' },
];
/** XP needed to go from level L to L+1. */
export const levelCost = L => 100 + 50 * (L - 1);
export function levelInfo(xp) {
  let level = 1, rem = xp;
  while (rem >= levelCost(level)) { rem -= levelCost(level); level++; }
  const rank = [...RANKS].reverse().find(r => level >= r.level);
  const next = RANKS.find(r => r.level > level) || null;
  return { level, into: rem, need: levelCost(level), rank: rank.name, nextRank: next, xp };
}

// ---------- weight ----------
export function weightSeries(state) {
  const sorted = [...state.weights].sort((a, b) => a.date.localeCompare(b.date));
  return sorted.map((w, i) => {
    const from = addDays(w.date, -6);
    const win = sorted.slice(0, i + 1).filter(x => x.date >= from);
    return { ...w, avg: win.reduce((a, b) => a + b.kg, 0) / win.length };
  });
}
