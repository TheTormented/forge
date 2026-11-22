import { PRESETS, EXERCISE_LIBRARY } from './presets.js';
import * as store from './store.js';
import * as L from './logic.js';

let S;                    // app state
const A = {};             // click actions:  data-act="name"
const IN = {};            // live input:     data-in="name"  (input + change)
const CH = {};            // commit change:  data-ch="name"  (change only)
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const r0 = n => Math.round(n);
const r1 = n => Math.round(n * 10) / 10;
const fmtW = w => (w === '' || w == null) ? '' : String(r1(+w)).replace(/\.0$/, '');
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : 0; };
const MON_FIRST = [1, 2, 3, 4, 5, 6, 0];
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

// ---------- icons ----------
const ICONS = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 9.5V20h14V9.5"/>',
  dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>',
  food: '<path d="M7 3v6a2 2 0 0 0 4 0V3M9 11v10"/><path d="M17 21V3c-2.2 1.2-3 4-3 7 0 2 1 3 3 3"/>',
  scale: '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M7.5 10a6 6 0 0 1 9 0"/><path d="M12 10.5l2-2.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  flame: '<path d="M12 2.5c.8 3.6 5.5 5.6 5.5 10.5a5.5 5.5 0 0 1-11 0c0-2.6 1.4-4.3 2.6-5.4.2 2 1.2 3.2 2.6 3.4-.9-3.2-.4-6 .3-8.5z"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M8 6H5a3 3 0 0 0 3 4.5M16 6h3a3 3 0 0 1-3 4.5M12 13v4M8 21h8M9.5 17h5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  chevR: '<path d="M9 6l6 6-6 6"/>',
  chevL: '<path d="M15 6l-6 6 6 6"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  share: '<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
};
const I = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;

// ---------- infra ----------
function commit(rerender = true) { window.__forgeState = S; store.save(S); if (rerender) render(); }
function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }
let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}
let sheetFn = null;
function openSheet(fn) { sheetFn = fn; refreshSheet(); }
function refreshSheet() {
  if (!sheetFn) return;
  const root = $('#sheet-root');
  const scroll = root.querySelector('.sheet')?.scrollTop || 0;
  root.innerHTML = `<div class="backdrop" data-act="closeSheet"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${sheetFn()}</div>`;
  root.querySelector('.sheet').scrollTop = scroll;
}
function closeSheet() { sheetFn = null; $('#sheet-root').innerHTML = ''; }
A.closeSheet = closeSheet;

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = A[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el.dataset, el, e); }
});
const onIn = e => { const el = e.target.closest?.('[data-in]'); if (el) IN[el.dataset.in]?.(el.dataset, el); };
document.addEventListener('input', onIn);
document.addEventListener('change', e => {
  onIn(e);
  const el = e.target.closest?.('[data-ch]'); if (el) CH[el.dataset.ch]?.(el.dataset, el);
});

const uid = store.uid;
const today = L.todayKey;

// ---------- shared bits ----------
function ring(value, target, color = 'var(--accent)', size = 132, stroke = 12) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, pct = Math.max(0, Math.min(1, target ? value / target : 0));
  const over = target && value > target * 1.1;
  return `<svg viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="${stroke}"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${over ? 'var(--danger)' : color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}"/></svg>`;
}
function macroBar(key, label, val, target, hit) {
  const pct = target ? Math.min(100, (val / target) * 100) : 0;
  const over = key !== 'p' && target && val > target * 1.1;
  return `<div class="macro ${key} ${over ? 'over' : ''}"><div class="row between"><span class="bold">${label} ${hit ? `<span class="hit">${I('check').replace('<svg', '<svg style="width:14px;height:14px;vertical-align:-2px"')}</span>` : ''}</span><span class="num muted"><b style="color:var(--text)">${r0(val)}</b> / ${r0(target)} g</span></div><div class="bar"><i style="width:${pct}%"></i></div></div>`;
}
function levelCard(compact = false) {
  const lv = L.levelInfo(L.totalXP(S)), st = L.streaks(S);
  return `<div class="card hero">
    <div class="row between">
      <div class="grow"><div class="rank">${esc(lv.rank)}</div><div class="big" style="margin-top:4px">Level ${lv.level}</div></div>
      <div class="streak"><div class="flame">${I('flame')}</div><div><div class="mid num">${st.current}</div><div class="tiny muted">streak · best ${st.best}</div></div></div>
    </div>
    <div class="bar mt"><i style="width:${(lv.into / lv.need) * 100}%"></i></div>
    <div class="row between small muted" style="margin-top:6px"><span class="num">${lv.into} / ${lv.need} XP</span><span>${lv.nextRank ? `${esc(lv.nextRank.name)} at Lv ${lv.nextRank.level}` : 'Max rank'}</span></div>
    ${compact ? '' : `<div class="small dim" style="margin-top:4px">${lv.xp.toLocaleString()} XP total</div>`}
  </div>`;
}
function weekStrip() {
  const t = today(), mon = L.mondayOf(t), byDate = L.sessionsByDate(S);
  return `<div class="week">${[0, 1, 2, 3, 4, 5, 6].map(i => {
    const k = L.addDays(mon, i), sid = L.scheduledDayId(S, k), done = byDate.has(k);
    const day = L.dayById(S, sid);
    const cls = done ? 'done' : sid && k < t ? 'missed' : sid ? 'sched' : '';
    const label = done ? I('check') : sid ? esc((day?.name || '•').slice(0, 1)) : '–';
    return `<div class="d">${L.DAY_NAMES[L.weekday(k)]}<div class="dot ${cls} ${k === t ? 'today' : ''}">${label}</div></div>`;
  }).join('')}</div>`;
}
function scheduleDaysFor(dayId) {
  return MON_FIRST.filter(wd => S.plan.schedule[wd] === dayId).map(wd => L.DAY_NAMES[wd]).join(' · ');
}
function saveSchedule() { L.setHistory(S.scheduleHistory, today(), 'schedule', [...S.plan.schedule]); }
function saveTargets(t) { S.targets = { ...t }; S.targetsHistory ||= []; L.setHistory(S.targetsHistory, today(), 'targets', { ...t }); }
function datalist() { return `<datalist id="exlib">${EXERCISE_LIBRARY.map(n => `<option value="${esc(n)}">`).join('')}</datalist>`; }

function planFromPreset(p) {
  const days = p.days.map(d => ({ id: uid(), name: d.name, exercises: d.exercises.map(e => ({ ...e, id: uid() })) }));
  return { presetId: p.id, name: p.name, days, schedule: p.schedule.map(i => (i == null ? null : days[i].id)) };
}

// ---------- tabs ----------
const TABS = [['today', 'Today', 'home'], ['train', 'Train', 'dumbbell'], ['food', 'Food', 'food'], ['weight', 'Weight', 'scale'], ['me', 'Me', 'user']];
function renderTabs(cur) {
  $('#tabs').innerHTML = TABS.map(([id, label, icon]) =>
    `<a href="#/${id}" class="${cur === id ? 'on' : ''}" ${cur === id ? 'aria-current="page"' : ''}>${I(icon)}${id === 'train' && S.active ? '<span class="live"></span>' : ''}${label}</a>`).join('');
}

// ---------- router ----------
let elapsedTimer;
function render() {
  window.__forgeState = S;
  const v = $('#view');
  clearInterval(elapsedTimer);
  if (!S.onboarded) { $('#tabs').hidden = true; v.innerHTML = viewOnboarding(); return; }
  $('#tabs').hidden = false;
  const [tab, ...rest] = (location.hash.replace(/^#\/?/, '') || 'today').split('/');
  const views = { today: viewToday, train: viewTrain, food: viewFood, weight: viewWeight, me: viewMe };
  const key = views[tab] ? tab : 'today';
  v.innerHTML = views[key](rest.map(decodeURIComponent));
  renderTabs(key);
  if (key === 'train' && S.active && !rest.length) elapsedTimer = setInterval(() => { const el = $('#elapsed'); if (el) el.textContent = elapsed(); }, 15000);
}
window.addEventListener('hashchange', () => { closeSheet(); render(); window.scrollTo(0, 0); });

// =====================================================================
// ONBOARDING
// =====================================================================
let ob = null;
function viewOnboarding() {
  ob ||= { step: 0, plan: planFromPreset(PRESETS[0]), draft: { profile: { ...S.profile }, targets: null } };
  const steps = `<div class="steps">${[0, 1, 2].map(i => `<i class="${i <= ob.step ? 'on' : ''}"></i>`).join('')}</div>`;
  if (ob.step === 0) {
    return `${steps}<div class="top"><div><h1>Pick your split</h1><div class="sub">You can change exercises, sets and reps later.</div></div></div>
      ${PRESETS.map(p => `<button class="card preset tap ${ob.plan.presetId === p.id ? 'on' : ''}" data-act="obPreset" data-id="${p.id}">
        <div class="row between"><div class="bold">${esc(p.name)}</div>${ob.plan.presetId === p.id ? `<span class="chip accent">${I('check').replace('<svg', '<svg style="width:14px;height:14px"')} Selected</span>` : ''}</div>
        <div class="small muted">${esc(p.blurb)}</div>
        <div class="small dim mt">${p.days.map(d => esc(d.name)).join(' · ')}</div></button>`).join('')}
      <button class="btn primary block mt" data-act="obNext">Next</button>`;
  }
  if (ob.step === 1) {
    return `${steps}<div class="top"><div><h1>Your week</h1><div class="sub">Pick what you train each day. Rest days never break your streak.</div></div></div>
      <div class="card">${scheduleRows(ob.plan, 'obSched')}</div>
      <div class="row"><button class="btn grow" data-act="obBack">Back</button><button class="btn primary grow" data-act="obNext">Next</button></div>`;
  }
  return `${steps}<div class="top"><div><h1>Daily targets</h1><div class="sub">We'll suggest calories and macros. Edit anything.</div></div></div>
    ${targetsEditor(ob.draft)}
    <div class="row"><button class="btn grow" data-act="obBack">Back</button><button class="btn primary grow" data-act="obFinish">Start training</button></div>`;
}
A.obPreset = ({ id }) => { ob.plan = planFromPreset(PRESETS.find(p => p.id === id)); render(); };
A.obNext = () => { ob.step++; render(); window.scrollTo(0, 0); };
A.obBack = () => { ob.step--; render(); window.scrollTo(0, 0); };
CH.obSched = ({ wd }, el) => { ob.plan.schedule[+wd] = el.value || null; };
A.obFinish = () => {
  const d = ob.draft;
  if (!d.targets) d.targets = pickTargets(L.suggestTargets(d.profile));
  S.plan = ob.plan; saveSchedule();
  S.profile = { ...d.profile }; saveTargets(d.targets);
  if (d.profile.weightKg > 0) upsertWeight(today(), d.profile.weightKg);
  S.onboarded = true; ob = null;
  commit(false); go('#/today'); toast("You're set. Let's get to work.");
};

function scheduleRows(plan, ch) {
  return MON_FIRST.map(wd => `<div class="sched-row"><span class="wd">${L.DAY_NAMES[wd]}</span>
    <select class="input" data-ch="${ch}" data-wd="${wd}" aria-label="${L.DAY_NAMES[wd]}">
      <option value="">Rest</option>${plan.days.map(d => `<option value="${d.id}" ${plan.schedule[wd] === d.id ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}
    </select></div>`).join('');
}

// ---------- targets editor (onboarding + Me) ----------
const pickTargets = s => ({ kcal: s.kcal, p: s.p, c: s.c, f: s.f });
function targetsEditor(draft) {
  const p = draft.profile, sug = L.suggestTargets(p);
  draft.targets ||= pickTargets(sug);
  const t = draft.targets;
  const field = (f, label, mode = 'numeric') => `<label class="field"><span>${label}</span><input class="input" inputmode="${mode}" data-in="prof" data-f="${f}" value="${esc(p[f])}"></label>`;
  const tf = (f, label, unit) => `<label class="field"><span>${label} (${unit})</span><input class="input" id="t-${f}" inputmode="numeric" data-in="targ" data-f="${f}" value="${t[f]}"></label>`;
  return `<div class="card">
    <div class="seg" style="margin-bottom:12px">${['male', 'female'].map(s => `<button class="${p.sex === s ? 'on' : ''}" data-act="sex" data-v="${s}">${s === 'male' ? 'Male' : 'Female'}</button>`).join('')}</div>
    <div class="grid2">${field('age', 'Age')}${field('heightCm', 'Height (cm)')}</div>
    ${field('weightKg', 'Weight (kg)', 'decimal')}
    <label class="field"><span>Activity</span><select class="input" data-in="prof" data-f="activity">${L.ACTIVITY.map(a => `<option value="${a.v}" ${+p.activity === a.v ? 'selected' : ''}>${a.label}</option>`).join('')}</select></label>
    <label class="field"><span>Goal</span><select class="input" data-in="prof" data-f="goal">${L.GOALS.map(g => `<option value="${g.v}" ${p.goal === g.v ? 'selected' : ''}>${g.label}</option>`).join('')}</select></label>
    <div class="small muted" id="sugg">${suggText(sug)}</div>
  </div>
  <div class="card">
    <div class="grid2">${tf('kcal', 'Calories', 'kcal')}${tf('p', 'Protein', 'g')}${tf('c', 'Carbs', 'g')}${tf('f', 'Fat', 'g')}</div>
    <div class="small muted" id="macro-sum">${macroSumText(t)}</div>
  </div>`;
}
const suggText = s => `BMR ${s.bmr} kcal · maintenance ≈ ${s.tdee} kcal · suggested <b style="color:var(--accent)">${s.kcal} kcal</b>, ${s.p}g protein, ${s.c}g carbs, ${s.f}g fat. Changing your details updates the targets below.`;
const macroSumText = t => { const k = t.p * 4 + t.c * 4 + t.f * 9; return `Macros add up to ${r0(k)} kcal${Math.abs(k - t.kcal) > t.kcal * 0.05 ? ` <span style="color:var(--fat)">(${k > t.kcal ? '+' : ''}${r0(k - t.kcal)} vs calories)</span>` : ''}.`; };
const activeDraft = () => (S.onboarded ? meDraft : ob.draft);
IN.prof = ({ f }, el) => {
  const d = activeDraft();
  d.profile[f] = f === 'goal' ? el.value : num(el.value);
  const s = L.suggestTargets(d.profile);
  if (!(d.profile.weightKg > 0 && d.profile.heightCm > 0 && d.profile.age > 0)) return;
  d.targets = pickTargets(s);
  $('#sugg').innerHTML = suggText(s);
  for (const k of ['kcal', 'p', 'c', 'f']) { const i = $('#t-' + k); if (i) i.value = d.targets[k]; }
  $('#macro-sum').innerHTML = macroSumText(d.targets);
};
IN.targ = ({ f }, el) => { const d = activeDraft(); d.targets[f] = num(el.value); $('#macro-sum').innerHTML = macroSumText(d.targets); };
A.sex = ({ v }) => {
  const d = activeDraft(); d.profile.sex = v; d.targets = pickTargets(L.suggestTargets(d.profile));
  render();
};

// =====================================================================
// TODAY
// =====================================================================
function viewToday() {
  const t = today(), sid = L.scheduledDayId(S, t), day = L.dayById(S, sid);
  const doneToday = S.sessions.filter(s => s.date === t);
  const tot = L.dayTotals(S.foodLog[t]), tg = L.targetsOn(S, t), ms = L.macroStatus(tot, tg);
  const hour = new Date().getHours();
  const greet = hour < 5 ? 'Late night' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  let workout;
  if (S.active) {
    workout = `<div class="card"><div class="rank" style="color:var(--streak)">In progress</div><div class="mid" style="margin:4px 0 12px">${esc(S.active.dayName)}</div><a class="btn primary block" href="#/train">Resume workout</a></div>`;
  } else if (doneToday.length) {
    const s = doneToday[doneToday.length - 1];
    workout = `<div class="card"><div class="row between"><div><div class="rank">Done today</div><div class="mid" style="margin-top:4px">${esc(s.dayName)}</div></div><span class="chip good">${I('check').replace('<svg', '<svg style="width:14px;height:14px"')} Complete</span></div>
      <div class="small muted mt">${s.exercises.length} exercise${s.exercises.length === 1 ? '' : 's'} ·${s.exercises.reduce((n, e) => n + e.sets.length, 0)} sets${s.pbs?.length ? ` · <span style="color:var(--gold)">${s.pbs.length} PB${s.pbs.length > 1 ? 's' : ''}</span>` : ''}</div></div>`;
  } else if (day) {
    workout = `<div class="card"><div class="rank">Today's session</div><div class="big" style="margin:6px 0 4px">${esc(day.name)}</div>
      <div class="small muted">${day.exercises.length} exercises · ${day.exercises.reduce((n, e) => n + (+e.sets || 0), 0)} sets</div>
      <div class="small dim" style="margin:8px 0 14px">${day.exercises.slice(0, 4).map(e => esc(e.name)).join(' · ')}${day.exercises.length > 4 ? ' …' : ''}</div>
      <button class="btn primary block" data-act="start" data-day="${day.id}">Start workout</button></div>`;
  } else {
    workout = `<div class="card"><div class="rank" style="color:var(--muted)">Rest day</div><div class="mid" style="margin:4px 0 6px">Recover and eat well</div>
      <div class="small muted" style="margin-bottom:12px">Your streak is safe today.</div><a class="btn block" href="#/train">Train anyway</a></div>`;
  }

  const latest = [...S.weights].sort((a, b) => b.date.localeCompare(a.date))[0];
  const ser = L.weightSeries(S), avg = ser.length ? ser[ser.length - 1].avg : null;
  const feed = L.xpLedger(S).slice(0, 4);

  return `<div class="top"><div><h1>${greet}</h1><div class="sub">${L.fmtDate(t, { weekday: 'long', day: 'numeric', month: 'long' })}</div></div></div>
    ${levelCard(true)}
    ${workout}
    <div class="card">${weekStrip()}</div>
    <a class="card tap" href="#/food" style="color:inherit;text-decoration:none">
      <div class="row between" style="margin-bottom:12px"><div class="bold">Nutrition</div>${ms.all ? `<span class="chip good">Targets hit · +${L.XP.macros} XP</span>` : `<span class="small muted">${r0(Math.max(0, tg.kcal - tot.kcal))} kcal left</span>`}</div>
      <div class="row" style="gap:18px"><div class="ring-wrap" style="width:104px;height:104px">${ring(tot.kcal, tg.kcal, 'var(--accent)', 104, 10)}<div class="ring-label"><div><div class="mid num">${r0(tot.kcal)}</div><div class="tiny muted">/ ${tg.kcal} kcal</div></div></div></div>
      <div class="grow">${macroBar('p', 'Protein', tot.p, tg.p, ms.p)}${macroBar('c', 'Carbs', tot.c, tg.c, ms.c)}${macroBar('f', 'Fat', tot.f, tg.f, ms.f)}</div></div>
    </a>
    <div class="card"><div class="row between"><div><div class="small muted bold">Body weight</div>
      <div class="mid num" style="margin-top:4px">${latest ? `${fmtW(latest.kg)} kg` : '—'}</div>
      <div class="small dim">${latest ? (latest.date === t ? 'Logged today' : `Last: ${L.fmtDate(latest.date)}`) : 'No entries yet'}${avg ? ` · 7-day avg ${fmtW(avg)}` : ''}</div></div>
      <button class="btn sm" data-act="logWeight">${latest?.date === t ? 'Update' : 'Log weight'}</button></div></div>
    ${feed.length ? `<h2 class="section">Recent XP</h2><div class="list">${feed.map(x => `<div class="li"><div class="grow"><div class="bold small">${esc(x.label)}</div><div class="tiny muted">${L.fmtDate(x.date)}</div></div><b class="num" style="color:var(--accent)">+${x.amount}</b></div>`).join('')}</div>` : ''}`;
}

// =====================================================================
// TRAIN
// =====================================================================
function viewTrain(rest) {
  if (rest[0] === 'history') return viewHistory();
  if (rest[0] === 'pbs') return viewPBs();
  if (rest[0] === 'pb') return viewPBDetail(rest[1] || '');
  if (S.active) return viewLogger();
  const t = today(), sid = L.scheduledDayId(S, t);
  const lastDone = id => { const s = [...S.sessions].reverse().find(x => x.dayId === id); return s ? L.fmtDate(s.date) : null; };
  return `<div class="top"><div><h1>Train</h1><div class="sub">${esc(S.plan.name || 'Your plan')}</div></div><a class="icon-btn" href="#/me/plan" aria-label="Edit plan">${I('more')}</a></div>
    ${S.plan.days.map(d => {
      const isToday = d.id === sid, ld = lastDone(d.id), wds = scheduleDaysFor(d.id);
      return `<div class="card"><div class="row between"><div class="grow"><div class="row" style="gap:8px"><div class="mid ellipsis">${esc(d.name)}</div>${isToday ? '<span class="chip accent">Today</span>' : ''}</div>
        <div class="small muted">${d.exercises.length} exercises${wds ? ` · ${wds}` : ''}</div>${ld ? `<div class="tiny dim">Last done ${ld}</div>` : ''}</div>
        <button class="btn ${isToday ? 'primary' : ''} sm" data-act="start" data-day="${d.id}">Start</button></div></div>`;
    }).join('')}
    <button class="btn block" data-act="start" data-day="">${I('plus')} Empty workout</button>
    <h2 class="section">Progress</h2>
    <div class="list">
      <a class="li" href="#/train/pbs" style="color:inherit;text-decoration:none"><div class="li-icon" style="color:var(--gold)">${I('trophy')}</div><div class="grow bold">Personal bests</div>${I('chevR').replace('<svg', '<svg class="chev"')}</a>
      <a class="li" href="#/train/history" style="color:inherit;text-decoration:none"><div class="li-icon">${I('history')}</div><div class="grow"><div class="bold">History</div><div class="small muted">${S.sessions.length} session${S.sessions.length === 1 ? '' : 's'} logged</div></div>${I('chevR').replace('<svg', '<svg class="chev"')}</a>
    </div>`;
}

A.start = ({ day }) => {
  if (S.active) { go('#/train'); return; }
  const d = L.dayById(S, day);
  S.active = {
    id: uid(), date: today(), dayId: d?.id || null, dayName: d?.name || 'Workout', startedAt: new Date().toISOString(),
    exercises: (d?.exercises || []).map(e => newSessionExercise(e)),
  };
  commit(false); go('#/train');
};
function newSessionExercise(e) {
  return { name: e.name, target: { sets: +e.sets || 3, min: +e.repsMin || 8, max: +e.repsMax || +e.repsMin || 12 }, rest: +e.rest || 90,
    sets: Array.from({ length: +e.sets || 3 }, () => ({ w: '', r: '', done: false })) };
}
function elapsed() {
  const m = Math.floor((Date.now() - new Date(S.active.startedAt)) / 60000);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
}
const prevFor = (last, j) => (last ? last.sets[j] || last.sets[last.sets.length - 1] : null);

function viewLogger() {
  const a = S.active;
  L.markPBs(S, a);
  const all = a.exercises.flatMap(e => e.sets), done = all.filter(s => s.done).length;
  return `<div class="session-head"><div class="row between"><div class="grow"><div class="rank"><span id="elapsed">${elapsed()}</span> · ${done}/${all.length} sets</div><div class="mid ellipsis">${esc(a.dayName)}</div></div>
      <button class="btn primary sm" data-act="finish">Finish</button></div>
      <div class="bar" style="margin-top:10px;height:6px"><i style="width:${all.length ? (done / all.length) * 100 : 0}%"></i></div></div>
    ${a.exercises.map((e, i) => exCard(e, i)).join('') || '<div class="card empty">No exercises yet. Add one below.</div>'}
    <button class="btn block" data-act="addExercise">${I('plus')} Add exercise</button>
    <button class="btn danger block mt" data-act="discard">Discard workout</button>`;
}
function exCard(e, i) {
  const last = L.lastPerformance(S, e.name, S.active.id);
  const tg = e.target ? `${e.target.sets} × ${e.target.min}${e.target.max !== e.target.min ? '–' + e.target.max : ''}` : '';
  const hasPB = e.sets.some(s => s.pb);
  const rows = e.sets.map((s, j) => {
    const p = prevFor(last, j);
    return `<tr class="${s.done ? 'done' : ''} ${s.pb ? 'pb' : ''}" data-row="${i}-${j}">
      <td class="n">${j + 1}</td>
      <td class="prev">${p ? `${fmtW(p.w) || 0}×${p.r}` : '—'}</td>
      <td><input class="cell" inputmode="decimal" enterkeyhint="next" data-in="set" data-i="${i}" data-j="${j}" data-f="w" value="${esc(s.w)}" placeholder="${p ? fmtW(p.w) || '0' : 'kg'}" aria-label="Set ${j + 1} weight"></td>
      <td><input class="cell" inputmode="numeric" enterkeyhint="done" data-in="set" data-i="${i}" data-j="${j}" data-f="r" value="${esc(s.r)}" placeholder="${p ? p.r : 'reps'}" aria-label="Set ${j + 1} reps"></td>
      <td style="width:50px"><button class="check" data-act="check" data-i="${i}" data-j="${j}" aria-label="Complete set ${j + 1}">${s.pb ? I('trophy') : I('check')}</button></td></tr>`;
  }).join('');
  return `<div class="card ex"><div class="row between"><div class="grow"><div class="ex-title ellipsis">${esc(e.name)}</div>
      <div class="small muted" id="exsub-${i}">${tg ? `Target ${tg} · rest ${e.rest}s` : ''}${hasPB ? ` · <span class="pb-tag">${I('trophy')} NEW PB</span>` : ''}</div></div>
      <button class="icon-btn" data-act="exMenu" data-i="${i}" aria-label="Exercise options">${I('more')}</button></div>
    <table class="sets"><thead><tr><th>Set</th><th>Last</th><th>kg</th><th>Reps</th><th></th></tr></thead><tbody>${rows}</tbody></table>
    <div class="ex-actions"><button class="btn sm" data-act="addSet" data-i="${i}">${I('plus')} Set</button><button class="btn sm" data-act="removeSet" data-i="${i}" ${e.sets.length ? '' : 'disabled'}>− Set</button><button class="btn sm ghost" data-act="records" data-i="${i}">Records</button></div></div>`;
}
IN.set = ({ i, j, f }, el) => {
  const set = S.active?.exercises[+i]?.sets[+j]; if (!set) return;
  set[f] = el.value.replace(',', '.');
  if (set.done) refreshPBMarks(+i);
  commit(false);
};
function refreshPBMarks(i) {
  L.markPBs(S, S.active);
  const e = S.active.exercises[i];
  e.sets.forEach((s, j) => {
    const tr = document.querySelector(`tr[data-row="${i}-${j}"]`); if (!tr) return;
    tr.classList.toggle('pb', !!s.pb);
    tr.querySelector('.check').innerHTML = s.pb ? I('trophy') : I('check');
  });
}
A.check = ({ i, j }) => {
  const e = S.active.exercises[+i], set = e.sets[+j];
  if (set.done) { set.done = false; commit(); return; }
  const p = prevFor(L.lastPerformance(S, e.name, S.active.id), +j);
  if (set.w === '') set.w = p ? String(p.w) : '0';
  if (set.r === '' && p) set.r = String(p.r);
  if (!(num(set.r) > 0)) { toast('Enter your reps first'); return; }
  set.done = true;
  navigator.vibrate?.(20);
  const wasPB = (() => { L.markPBs(S, S.active); return set.pb; })();
  if (wasPB) toast(`New PB · ${fmtW(set.w)} kg × ${set.r} on ${e.name}`);
  if (S.settings.restTimer) startTimer(e.rest || 90);
  commit();
};
A.addSet = ({ i }) => { S.active.exercises[+i].sets.push({ w: '', r: '', done: false }); commit(); };
A.removeSet = ({ i }) => { S.active.exercises[+i].sets.pop(); commit(); };
A.exMenu = ({ i }) => {
  i = +i;
  const e = S.active.exercises[i], n = S.active.exercises.length;
  openSheet(() => `<h3>${esc(e.name)}</h3><div class="list">
    <button class="li" data-act="exMove" data-i="${i}" data-d="-1" ${i === 0 ? 'disabled style="opacity:.4"' : ''}><div class="li-icon">${I('up')}</div><div class="grow bold">Move up</div></button>
    <button class="li" data-act="exMove" data-i="${i}" data-d="1" ${i === n - 1 ? 'disabled style="opacity:.4"' : ''}><div class="li-icon">${I('down')}</div><div class="grow bold">Move down</div></button>
    <button class="li" data-act="exRest" data-i="${i}"><div class="li-icon">${I('timer')}</div><div class="grow bold">Rest time</div><span class="muted">${e.rest}s</span></button>
    <button class="li" data-act="exRemove" data-i="${i}"><div class="li-icon" style="color:var(--danger)">${I('trash')}</div><div class="grow bold" style="color:var(--danger)">Remove from workout</div></button></div>`);
};
A.exMove = ({ i, d }) => { const a = S.active.exercises, k = +i + +d; [a[+i], a[k]] = [a[k], a[+i]]; closeSheet(); commit(); };
A.exRemove = ({ i }) => { S.active.exercises.splice(+i, 1); closeSheet(); commit(); };
A.exRest = ({ i }) => {
  const e = S.active.exercises[+i];
  openSheet(() => `<h3>Rest time</h3><div class="grid2">${[45, 60, 90, 120, 150, 180, 240, 300].map(s => `<button class="btn ${e.rest === s ? 'primary' : ''}" data-act="setRest" data-i="${i}" data-s="${s}">${s < 60 ? s + 's' : (s / 60) + ' min'}</button>`).join('')}</div>`);
};
A.setRest = ({ i, s }) => { S.active.exercises[+i].rest = +s; closeSheet(); commit(); };
A.records = ({ i }) => showRecords(S.active.exercises[+i].name);
function showRecords(name) {
  const tbl = L.pbTable(S, name);
  openSheet(() => `<h3>${esc(name)}</h3><div class="small muted" style="margin-bottom:12px">Your most reps at each weight. Beat one for a PB.</div>
    ${tbl.length ? `<div class="list">${tbl.map(r => `<div class="li"><div class="grow bold num">${fmtW(r.w) || 0} kg</div><div class="num"><b>${r.r}</b> reps</div><div class="small dim" style="width:76px;text-align:right">${L.fmtDate(r.date, { day: 'numeric', month: 'short' })}</div></div>`).join('')}</div>`
      : '<div class="card empty">No history yet. This session becomes your baseline.</div>'}`);
}
A.addExercise = () => {
  openSheet(() => `<h3>Add exercise</h3>${datalist()}
    <label class="field"><span>Exercise</span><input class="input" id="nx-name" list="exlib" placeholder="Search or type a name" autocomplete="off"></label>
    <div class="grid2"><label class="field"><span>Sets</span><input class="input" id="nx-sets" inputmode="numeric" value="3"></label>
    <label class="field"><span>Reps</span><input class="input" id="nx-reps" inputmode="numeric" value="8-12"></label></div>
    <button class="btn primary block" data-act="addExerciseGo">Add</button>`);
  setTimeout(() => $('#nx-name')?.focus(), 250);
};
A.addExerciseGo = () => {
  const name = $('#nx-name').value.trim(); if (!name) { toast('Enter an exercise name'); return; }
  const [mn, mx] = $('#nx-reps').value.split(/[-–]/).map(num);
  S.active.exercises.push(newSessionExercise({ name, sets: num($('#nx-sets').value) || 3, repsMin: mn || 8, repsMax: mx || mn || 12, rest: 90 }));
  closeSheet(); commit();
  setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 50);
};
A.discard = () => { if (confirm('Discard this workout? Nothing will be saved.')) { S.active = null; stopTimer(); commit(); } };
A.finish = () => {
  const a = S.active;
  const doneSets = a.exercises.reduce((n, e) => n + e.sets.filter(s => s.done).length, 0);
  if (!doneSets) { if (confirm('No sets completed. Discard this workout?')) { S.active = null; stopTimer(); commit(); } return; }
  const undone = a.exercises.reduce((n, e) => n + e.sets.filter(s => !s.done).length, 0);
  if (undone && !confirm(`${undone} set${undone > 1 ? 's are' : ' is'} not ticked and won't be saved. Finish anyway?`)) return;
  const xpBefore = L.totalXP(S), lvBefore = L.levelInfo(xpBefore);
  a.exercises.forEach(e => { e.sets = e.sets.filter(s => s.done).map(s => ({ w: num(s.w), r: num(s.r), done: true })); });
  a.exercises = a.exercises.filter(e => e.sets.length);
  a.pbs = L.markPBs(S, a);
  a.exercises.forEach(e => e.sets.forEach(s => { if (!s.pb) delete s.pb; }));
  a.finishedAt = new Date().toISOString();
  const firstToday = !S.sessions.some(s => s.date === a.date);
  S.sessions.push(a); S.active = null; stopTimer();
  const xpAfter = L.totalXP(S), lvAfter = L.levelInfo(xpAfter);
  commit(false); go('#/train');
  showSummary(a, xpAfter - xpBefore, lvBefore, lvAfter, firstToday && !!L.scheduledDayId(S, a.date));
};
function showSummary(s, gained, before, after, onSched) {
  const st = L.streaks(S);
  const items = [[`Completed ${s.dayName}`, L.XP.session]];
  if (s.pbs.length) items.push([`${s.pbs.length} new PB${s.pbs.length > 1 ? 's' : ''}`, L.XP.pb * s.pbs.length]);
  if (onSched) items.push(['On schedule', L.XP.onSchedule]);
  const rest = gained - items.reduce((a, b) => a + b[1], 0);
  if (rest > 0) items.push(['Perfect week', rest]);
  const pbSets = s.exercises.flatMap(e => e.sets.filter(x => x.pb).slice(-1).map(x => ({ name: e.name, ...x })));
  openSheet(() => `<div class="celebrate"><div class="trophy">${I(s.pbs.length ? 'trophy' : 'check')}</div>
      <h3 style="margin-bottom:4px">${s.pbs.length ? 'New personal best!' : 'Workout complete'}</h3>
      <div class="muted small">${esc(s.dayName)} · ${s.exercises.length} exercise${s.exercises.length === 1 ? '' : 's'} ·${s.exercises.reduce((n, e) => n + e.sets.length, 0)} sets · ${r0(s.exercises.reduce((v, e) => v + e.sets.reduce((a, x) => a + x.w * x.r, 0), 0)).toLocaleString()} kg volume</div></div>
    ${after.level > before.level ? `<div class="card hero center" style="margin-top:14px"><div class="rank">Level up</div><div class="big">Level ${after.level}</div>${after.rank !== before.rank ? `<div class="bold" style="margin-top:6px">New rank: ${esc(after.rank)}</div>` : ''}</div>` : ''}
    ${pbSets.length ? `<div class="list mt">${pbSets.map(p => `<div class="li"><div class="li-icon" style="color:var(--gold)">${I('trophy')}</div><div class="grow bold">${esc(p.name)}</div><div class="num bold">${fmtW(p.w) || 0} kg × ${p.r}</div></div>`).join('')}</div>` : ''}
    <div class="card mt">${items.map(([l, v]) => `<div class="xp-line"><span>${esc(l)}</span><b>+${v}</b></div>`).join('')}
      <div class="xp-line"><span class="bold">Total</span><b>+${gained} XP</b></div></div>
    <div class="row" style="justify-content:center;gap:8px;margin:4px 0 14px"><span class="chip fire">${I('flame').replace('<svg', '<svg style="width:14px;height:14px"')} ${st.current} streak</span><span class="chip accent">Lv ${after.level} · ${after.into}/${after.need}</span></div>
    <button class="btn primary block" data-act="closeSheet">Nice</button>`);
}

// ---------- rest timer ----------
let timerEnd = 0, timerInt = null, audioCtx = null, timerHide = null;
function startTimer(sec) {
  try { audioCtx ||= new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume?.(); } catch { /* no audio */ }
  timerEnd = Date.now() + sec * 1000;
  clearInterval(timerInt); clearTimeout(timerHide);
  timerInt = setInterval(tickTimer, 250); tickTimer();
}
function tickTimer() {
  const el = $('#timer'), left = Math.ceil((timerEnd - Date.now()) / 1000);
  el.hidden = false;
  if (left <= 0) {
    clearInterval(timerInt); timerInt = null;
    el.className = 'timer done';
    el.innerHTML = `<div class="t"><small>Rest over</small>Next set</div><button class="btn sm" style="background:rgba(0,0,0,.15);color:inherit" data-act="timerSkip">Close</button>`;
    beep(); navigator.vibrate?.([200, 100, 200]);
    timerHide = setTimeout(stopTimer, 6000);
    return;
  }
  el.className = 'timer';
  el.innerHTML = `<div class="t"><small>Rest</small>${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}</div>
    <button class="btn sm" data-act="timerAdd" data-s="-15">−15</button><button class="btn sm" data-act="timerAdd" data-s="15">+15</button><button class="btn sm" data-act="timerSkip">Skip</button>`;
}
function beep() {
  if (!audioCtx) return;
  try {
    [0, 0.25].forEach(off => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(audioCtx.destination);
      g.gain.setValueAtTime(0.25, audioCtx.currentTime + off); g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + off + 0.2);
      o.start(audioCtx.currentTime + off); o.stop(audioCtx.currentTime + off + 0.22);
    });
  } catch { /* ignore */ }
}
function stopTimer() { clearInterval(timerInt); clearTimeout(timerHide); timerInt = null; $('#timer').hidden = true; }
A.timerAdd = ({ s }) => { timerEnd += +s * 1000; if (!timerInt) timerInt = setInterval(tickTimer, 250); tickTimer(); };
A.timerSkip = stopTimer;

// ---------- history & PBs ----------
function viewHistory() {
  const list = [...S.sessions].sort((a, b) => (b.finishedAt || b.date).localeCompare(a.finishedAt || a.date));
  return `<a class="back" href="#/train">${I('chevL').replace('<svg', '<svg style="width:18px;height:18px"')} Train</a><div class="top"><h1>History</h1></div>
    ${list.length ? `<div class="list">${list.map(s => `<button class="li" data-act="sessionDetail" data-id="${s.id}"><div class="grow"><div class="bold">${esc(s.dayName)}</div>
      <div class="small muted">${L.fmtDate(s.date)} · ${s.exercises.reduce((n, e) => n + e.sets.length, 0)} sets</div></div>
      ${s.pbs?.length ? `<span class="chip gold">${I('trophy').replace('<svg', '<svg style="width:13px;height:13px"')} ${s.pbs.length}</span>` : ''}${I('chevR').replace('<svg', '<svg class="chev"')}</button>`).join('')}</div>`
      : '<div class="card empty">No sessions yet. Finish a workout and it shows up here.</div>'}`;
}
A.sessionDetail = ({ id }) => {
  const s = S.sessions.find(x => x.id === id); if (!s) return;
  openSheet(() => `<h3>${esc(s.dayName)}</h3><div class="small muted" style="margin:-8px 0 12px">${L.fmtDate(s.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
    ${s.exercises.map(e => `<div class="card"><div class="bold" style="margin-bottom:6px">${esc(e.name)}</div>
      ${e.sets.map((x, j) => `<div class="row between small" style="padding:3px 0"><span class="muted">Set ${j + 1}</span><span class="num bold">${fmtW(x.w) || 0} kg × ${x.r} ${x.pb ? `<span class="pb-tag">${I('trophy')} PB</span>` : ''}</span></div>`).join('')}</div>`).join('')}
    <button class="btn danger block" data-act="deleteSession" data-id="${s.id}">Delete session</button>`);
};
A.deleteSession = ({ id }) => {
  if (!confirm('Delete this session? Its PBs and XP will be removed.')) return;
  // PBs of later sessions may change: replay remaining sessions in order, each judged only against earlier ones
  const remaining = S.sessions.filter(s => s.id !== id).sort((a, b) => (a.finishedAt || '').localeCompare(b.finishedAt || ''));
  S.sessions = [];
  for (const s of remaining) { s.pbs = L.markPBs(S, s); s.exercises.forEach(e => e.sets.forEach(x => { if (!x.pb) delete x.pb; })); S.sessions.push(s); }
  closeSheet(); commit(); toast('Session deleted');
};
function viewPBs() {
  const names = new Map();
  for (const s of S.sessions) for (const e of s.exercises) { const k = e.name.trim().toLowerCase(); if (!names.has(k)) names.set(k, e.name); }
  const rows = [...names.values()].sort().map(n => {
    const t = L.pbTable(S, n); const top = t[0];
    return { n, top, count: t.length };
  });
  const recent = [...S.sessions].sort((a, b) => (b.finishedAt || '').localeCompare(a.finishedAt || ''))
    .flatMap(s => s.exercises.flatMap(e => e.sets.filter(x => x.pb).slice(-1).map(x => ({ date: s.date, name: e.name, ...x })))).slice(0, 8);
  return `<a class="back" href="#/train">${I('chevL').replace('<svg', '<svg style="width:18px;height:18px"')} Train</a><div class="top"><div><h1>Personal bests</h1><div class="sub">A PB is more reps than ever at a given weight.</div></div></div>
    ${recent.length ? `<h2 class="section">Recent PBs</h2><div class="list">${recent.map(p => `<div class="li"><div class="li-icon" style="color:var(--gold)">${I('trophy')}</div><div class="grow"><div class="bold">${esc(p.name)}</div><div class="small muted">${L.fmtDate(p.date)}</div></div><div class="num bold">${fmtW(p.w) || 0} × ${p.r}</div></div>`).join('')}</div>` : ''}
    <h2 class="section">All exercises</h2>
    ${rows.length ? `<div class="list">${rows.map(r => `<a class="li" href="#/train/pb/${encodeURIComponent(r.n)}" style="color:inherit;text-decoration:none"><div class="grow"><div class="bold">${esc(r.n)}</div><div class="small muted">Heaviest: ${fmtW(r.top.w) || 0} kg × ${r.top.r} · ${r.count} weight${r.count > 1 ? 's' : ''} logged</div></div>${I('chevR').replace('<svg', '<svg class="chev"')}</a>`).join('')}</div>`
      : '<div class="card empty">Log a workout to start building your records.</div>'}`;
}
function viewPBDetail(name) {
  const t = L.pbTable(S, name);
  const hist = S.sessions.filter(s => s.exercises.some(e => e.name.trim().toLowerCase() === name.trim().toLowerCase())).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  return `<a class="back" href="#/train/pbs">${I('chevL').replace('<svg', '<svg style="width:18px;height:18px"')} Personal bests</a><div class="top"><h1 style="font-size:26px">${esc(name)}</h1></div>
    <h2 class="section">Most reps per weight</h2>
    <div class="list">${t.map(r => `<div class="li"><div class="grow bold num">${fmtW(r.w) || 0} kg</div><div class="num"><b>${r.r}</b> reps</div><div class="small dim" style="width:80px;text-align:right">${L.fmtDate(r.date, { day: 'numeric', month: 'short' })}</div></div>`).join('') || '<div class="empty">No sets yet</div>'}</div>
    <h2 class="section">Recent sessions</h2>
    <div class="list">${hist.map(s => { const e = s.exercises.find(x => x.name.trim().toLowerCase() === name.trim().toLowerCase()); return `<div class="li"><div class="grow"><div class="bold small">${L.fmtDate(s.date)}</div><div class="small muted num">${e.sets.map(x => `${fmtW(x.w) || 0}×${x.r}${x.pb ? '★' : ''}`).join('  ')}</div></div></div>`; }).join('')}</div>`;
}

// =====================================================================
// FOOD
// =====================================================================
let foodDate = null;
function viewFood() {
  foodDate ||= today();
  const k = foodDate, entries = S.foodLog[k] || [], tot = L.dayTotals(entries), tg = L.targetsOn(S, k), ms = L.macroStatus(tot, tg);
  const isToday = k === today(), yest = S.foodLog[L.addDays(k, -1)] || [];
  return `<div class="top"><div><h1>Food</h1><div class="sub">${isToday ? 'Today' : L.fmtDate(k, { weekday: 'long', day: 'numeric', month: 'short' })}</div></div>
      <div class="row" style="gap:8px"><button class="icon-btn" data-act="foodDay" data-d="-1" aria-label="Previous day">${I('chevL')}</button><button class="icon-btn" data-act="foodDay" data-d="1" ${isToday ? 'disabled style="opacity:.3"' : ''} aria-label="Next day">${I('chevR')}</button></div></div>
    <div class="card"><div class="row" style="gap:18px">
      <div class="ring-wrap">${ring(tot.kcal, tg.kcal)}<div class="ring-label"><div><div class="big num" style="font-size:30px">${r0(tot.kcal)}</div><div class="tiny muted">of ${tg.kcal} kcal</div>${ms.kcal ? '<div class="tiny hit bold">on target</div>' : `<div class="tiny muted">${tot.kcal < tg.kcal ? r0(tg.kcal - tot.kcal) + ' left' : r0(tot.kcal - tg.kcal) + ' over'}</div>`}</div></div></div>
      <div class="grow">${macroBar('p', 'Protein', tot.p, tg.p, ms.p)}${macroBar('c', 'Carbs', tot.c, tg.c, ms.c)}${macroBar('f', 'Fat', tot.f, tg.f, ms.f)}</div></div>
      <div class="small mt ${ms.all ? 'hit bold' : 'muted'}">${ms.all ? `All targets hit · +${L.XP.macros} XP` : `Hit all four within 10% (protein: at least 90%) for +${L.XP.macros} XP`}</div></div>
    ${!entries.length && yest.length ? `<button class="btn block" data-act="copyYesterday" style="margin-bottom:12px">${I('copy')} Copy previous day (${yest.length} items)</button>` : ''}
    ${MEALS.map(m => {
      const es = entries.filter(e => (e.meal || 'Snacks') === m), sub = L.dayTotals(es);
      return `<div class="row between" style="margin:18px 4px 8px"><div><span class="bold">${m}</span> <span class="small muted num">${es.length ? r0(sub.kcal) + ' kcal' : ''}</span></div>
        <div class="row" style="gap:6px">${es.length > 1 ? `<button class="btn sm ghost" data-act="saveMeal" data-meal="${m}">Save meal</button>` : ''}<button class="icon-btn" data-act="addFood" data-meal="${m}" aria-label="Add to ${m}" style="color:var(--accent)">${I('plus')}</button></div></div>
        ${es.length ? `<div class="list">${es.map(e => `<button class="li" data-act="editEntry" data-id="${e.id}"><div class="grow"><div class="bold ellipsis">${esc(e.name)}</div>
          <div class="small muted num">${(+e.qty || 1) !== 1 ? `${r1(e.qty)} × ` : ''}${esc(e.serving || 'serving')} · P ${r0(e.p * e.qty)} · C ${r0(e.c * e.qty)} · F ${r0(e.f * e.qty)}</div></div><div class="num bold">${r0(e.kcal * e.qty)}</div></button>`).join('')}</div>` : ''}`;
    }).join('')}`;
}
A.foodDay = ({ d }) => { const n = L.addDays(foodDate, +d); if (n > today()) return; foodDate = n; render(); };
A.copyYesterday = () => {
  const src = S.foodLog[L.addDays(foodDate, -1)] || [];
  S.foodLog[foodDate] = src.map(e => ({ ...e, id: uid() }));
  commit(); toast(`Copied ${src.length} items`);
};
let fs = null; // add-food sheet state
A.addFood = ({ meal }) => { fs = { meal, tab: S.foods.length ? 'saved' : 'new', q: '', pick: null }; openSheet(foodSheet); };
function foodSheet() {
  if (fs.pick) {
    const f = fs.pick;
    return `<h3>${esc(f.name)}</h3><div class="small muted" style="margin:-8px 0 14px">${esc(f.serving || '1 serving')} · ${r0(f.kcal)} kcal · P ${r1(f.p)} · C ${r1(f.c)} · F ${r1(f.f)}</div>
      <label class="field"><span>Servings</span><input class="input" id="pick-qty" inputmode="decimal" value="${fs.qty ?? 1}" data-in="pickQty"></label>
      <div class="row" style="gap:6px;margin-bottom:14px">${[0.5, 1, 1.5, 2, 3].map(q => `<button class="btn sm grow" data-act="pickQty" data-q="${q}">${q}</button>`).join('')}</div>
      <div class="card small" id="pick-sum">${pickSum()}</div>
      <div class="row"><button class="btn grow" data-act="pickBack">Back</button><button class="btn primary grow" data-act="pickAdd">Add to ${esc(fs.meal)}</button></div>`;
  }
  const tabs = `<div class="seg" style="margin-bottom:14px">${[['saved', 'My foods'], ['meals', 'Meals'], ['new', 'New food']].map(([k, l]) => `<button class="${fs.tab === k ? 'on' : ''}" data-act="foodTab" data-t="${k}">${l}</button>`).join('')}</div>`;
  if (fs.tab === 'saved') {
    return `<h3>Add to ${esc(fs.meal)}</h3>${tabs}<input class="input" placeholder="Search my foods" data-in="foodQ" value="${esc(fs.q)}" style="margin-bottom:12px" autocomplete="off"><div id="food-results">${foodResults()}</div>`;
  }
  if (fs.tab === 'meals') {
    return `<h3>Add to ${esc(fs.meal)}</h3>${tabs}${S.meals.length ? `<div class="list">${S.meals.map(m => { const t = L.dayTotals(m.items); return `<div class="li"><button class="grow" style="text-align:left" data-act="addMealItems" data-id="${m.id}"><div class="bold">${esc(m.name)}</div><div class="small muted">${m.items.length} items · ${r0(t.kcal)} kcal · P ${r0(t.p)}</div></button><button class="icon-btn" data-act="deleteMeal" data-id="${m.id}" aria-label="Delete meal">${I('trash')}</button></div>`; }).join('')}</div>`
      : '<div class="card empty">No saved meals yet. Log two or more foods in a meal, then tap “Save meal”.</div>'}`;
  }
  return `<h3>Add to ${esc(fs.meal)}</h3>${tabs}
    <label class="field"><span>Name</span><input class="input" id="nf-name" placeholder="e.g. Chicken breast" autocomplete="off"></label>
    <label class="field"><span>Serving</span><input class="input" id="nf-serving" placeholder="e.g. 100 g, 1 scoop"></label>
    <div class="grid2"><label class="field"><span>Protein (g)</span><input class="input" id="nf-p" inputmode="decimal" data-in="nfMacro"></label>
      <label class="field"><span>Carbs (g)</span><input class="input" id="nf-c" inputmode="decimal" data-in="nfMacro"></label>
      <label class="field"><span>Fat (g)</span><input class="input" id="nf-f" inputmode="decimal" data-in="nfMacro"></label>
      <label class="field"><span>Calories</span><input class="input" id="nf-kcal" inputmode="decimal" placeholder="auto"></label></div>
    <div class="grid2"><label class="field"><span>Servings eaten</span><input class="input" id="nf-qty" inputmode="decimal" value="1"></label>
      <label class="field"><span>Save to My foods</span><div class="row" style="min-height:48px"><label class="switch"><input type="checkbox" id="nf-save" checked><span></span></label></div></label></div>
    <button class="btn primary block" data-act="newFoodAdd">Add</button>`;
}
function foodResults() {
  const q = fs.q.trim().toLowerCase();
  const list = S.foods.filter(f => !q || f.name.toLowerCase().includes(q)).sort((a, b) => (b.used || 0) - (a.used || 0) || a.name.localeCompare(b.name));
  if (!S.foods.length) return '<div class="card empty">No saved foods yet. Add one in “New food”.</div>';
  if (!list.length) return '<div class="card empty">No match. Add it in “New food”.</div>';
  return `<div class="list">${list.map(f => `<div class="li"><button class="grow" style="text-align:left;min-width:0" data-act="pickFood" data-id="${f.id}"><div class="bold ellipsis">${esc(f.name)}</div><div class="small muted num">${esc(f.serving || 'serving')} · ${r0(f.kcal)} kcal · P ${r1(f.p)} C ${r1(f.c)} F ${r1(f.f)}</div></button><button class="icon-btn" data-act="deleteFood" data-id="${f.id}" aria-label="Delete ${esc(f.name)}">${I('trash')}</button></div>`).join('')}</div>`;
}
IN.foodQ = (_, el) => { fs.q = el.value; $('#food-results').innerHTML = foodResults(); };
A.foodTab = ({ t }) => { fs.tab = t; refreshSheet(); };
A.pickFood = ({ id }) => { fs.pick = S.foods.find(f => f.id === id); fs.qty = 1; refreshSheet(); };
A.pickBack = () => { fs.pick = null; refreshSheet(); };
const pickSum = () => { const q = fs.qty || 0, f = fs.pick; return `<b class="num">${r0(f.kcal * q)} kcal</b> <span class="muted num">· P ${r1(f.p * q)} · C ${r1(f.c * q)} · F ${r1(f.f * q)}</span>`; };
IN.pickQty = (_, el) => { fs.qty = num(el.value); $('#pick-sum').innerHTML = pickSum(); };
A.pickQty = ({ q }) => { fs.qty = +q; $('#pick-qty').value = q; $('#pick-sum').innerHTML = pickSum(); };
A.pickAdd = () => {
  const f = fs.pick; if (!(fs.qty > 0)) { toast('Enter servings'); return; }
  addEntry({ name: f.name, serving: f.serving, kcal: f.kcal, p: f.p, c: f.c, f: f.f, qty: fs.qty });
  f.used = (f.used || 0) + 1;
  closeSheet(); commit(); toast(`Added ${f.name}`);
};
IN.nfMacro = () => {
  const k = $('#nf-kcal'); if (!k) return;
  k.placeholder = String(r0(num($('#nf-p').value) * 4 + num($('#nf-c').value) * 4 + num($('#nf-f').value) * 9)) + ' (auto)';
};
A.newFoodAdd = () => {
  const name = $('#nf-name').value.trim(); if (!name) { toast('Give the food a name'); return; }
  const p = num($('#nf-p').value), c = num($('#nf-c').value), f = num($('#nf-f').value);
  const kcal = $('#nf-kcal').value.trim() ? num($('#nf-kcal').value) : r0(p * 4 + c * 4 + f * 9);
  const food = { name, serving: $('#nf-serving').value.trim(), kcal, p, c, f };
  const qty = num($('#nf-qty').value) || 1;
  if ($('#nf-save').checked) S.foods.push({ id: uid(), ...food, used: 1 });
  addEntry({ ...food, qty });
  closeSheet(); commit(); toast(`Added ${name}`);
};
function addEntry(e) { (S.foodLog[foodDate] ||= []).push({ id: uid(), meal: fs.meal, ...e }); }
A.deleteFood = ({ id }) => { const f = S.foods.find(x => x.id === id); if (f && confirm(`Remove “${f.name}” from My foods? Logged entries stay.`)) { S.foods = S.foods.filter(x => x.id !== id); commit(false); refreshSheet(); } };
A.addMealItems = ({ id }) => {
  const m = S.meals.find(x => x.id === id); if (!m) return;
  m.items.forEach(it => addEntry({ ...it }));
  closeSheet(); commit(); toast(`Added ${m.name}`);
};
A.deleteMeal = ({ id }) => { if (confirm('Delete this saved meal?')) { S.meals = S.meals.filter(x => x.id !== id); commit(false); refreshSheet(); } };
A.saveMeal = ({ meal }) => {
  const items = (S.foodLog[foodDate] || []).filter(e => (e.meal || 'Snacks') === meal).map(({ name, serving, kcal, p, c, f, qty }) => ({ name, serving, kcal, p, c, f, qty }));
  const name = prompt('Name this meal', `My ${meal.toLowerCase()}`);
  if (!name) return;
  S.meals.push({ id: uid(), name: name.trim(), items });
  commit(); toast(`Saved “${name.trim()}”`);
};
A.editEntry = ({ id }) => {
  const e = (S.foodLog[foodDate] || []).find(x => x.id === id); if (!e) return;
  openSheet(() => `<h3>${esc(e.name)}</h3>
    <label class="field"><span>Servings (${esc(e.serving || 'serving')})</span><input class="input" id="ee-qty" inputmode="decimal" value="${r1(e.qty || 1)}"></label>
    <label class="field"><span>Meal</span><select class="input" id="ee-meal">${MEALS.map(m => `<option ${m === e.meal ? 'selected' : ''}>${m}</option>`).join('')}</select></label>
    <div class="card small muted num">Per serving: ${r0(e.kcal)} kcal · P ${r1(e.p)} · C ${r1(e.c)} · F ${r1(e.f)}</div>
    <div class="row"><button class="btn danger grow" data-act="deleteEntry" data-id="${e.id}">Delete</button><button class="btn primary grow" data-act="saveEntry" data-id="${e.id}">Save</button></div>`);
};
A.saveEntry = ({ id }) => { const e = S.foodLog[foodDate].find(x => x.id === id); e.qty = num($('#ee-qty').value) || 1; e.meal = $('#ee-meal').value; closeSheet(); commit(); };
A.deleteEntry = ({ id }) => { S.foodLog[foodDate] = S.foodLog[foodDate].filter(x => x.id !== id); if (!S.foodLog[foodDate].length) delete S.foodLog[foodDate]; closeSheet(); commit(); };

// =====================================================================
// WEIGHT
// =====================================================================
let wRange = 30;
function upsertWeight(date, kg) {
  const i = S.weights.findIndex(w => w.date === date);
  if (i >= 0) S.weights[i].kg = kg; else S.weights.push({ date, kg });
  const latest = [...S.weights].sort((a, b) => b.date.localeCompare(a.date))[0];
  if (latest) S.profile.weightKg = latest.kg;
}
function viewWeight() {
  const ser = L.weightSeries(S), t = today();
  const from = wRange ? L.addDays(t, -wRange + 1) : '0000';
  const pts = ser.filter(p => p.date >= from);
  const cur = ser[ser.length - 1];
  const first = pts[0];
  const change = cur && first ? cur.avg - first.avg : 0;
  const todayEntry = S.weights.find(w => w.date === t);
  return `<div class="top"><div><h1>Weight</h1><div class="sub">Daily weigh-ins, smoothed with a 7-day average</div></div></div>
    <div class="card"><div class="row" style="gap:10px"><input class="input num" id="w-kg" inputmode="decimal" placeholder="kg" value="${todayEntry ? fmtW(todayEntry.kg) : ''}" style="font-size:22px;font-weight:800" aria-label="Weight in kg">
      <button class="btn primary" data-act="saveWeightInline">${todayEntry ? 'Update' : 'Log today'}</button></div></div>
    <div class="grid2" style="margin-bottom:12px">
      <div class="card"><div class="small muted bold">7-day average</div><div class="mid num" style="margin-top:4px">${cur ? fmtW(cur.avg) : '—'} <span class="small muted">kg</span></div></div>
      <div class="card"><div class="small muted bold">Change (${wRange ? wRange + 'd' : 'all'})</div><div class="mid num" style="margin-top:4px;color:${change > 0.05 ? 'var(--fat)' : change < -0.05 ? 'var(--carbs)' : 'var(--text)'}">${pts.length > 1 ? (change > 0 ? '+' : '') + fmtW(change) : '—'} <span class="small muted">kg</span></div></div>
    </div>
    <div class="card"><div class="seg" style="margin-bottom:12px">${[[30, '30 days'], [90, '90 days'], [365, '1 year'], [0, 'All']].map(([v, l]) => `<button class="${wRange === v ? 'on' : ''}" data-act="wRange" data-v="${v}">${l}</button>`).join('')}</div>
      ${pts.length > 1 ? chart(pts) : '<div class="empty small">Log at least two days to see your trend.</div>'}
      <div class="row small muted" style="gap:14px;margin-top:6px"><span><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--muted);margin-right:5px"></i>Weigh-in</span><span><i style="display:inline-block;width:14px;height:3px;border-radius:2px;background:var(--accent);margin-right:5px;vertical-align:middle"></i>7-day avg</span></div></div>
    <h2 class="section">Entries</h2>
    ${S.weights.length ? `<div class="list">${[...ser].reverse().slice(0, 60).map(w => `<div class="li"><div class="grow"><div class="bold num">${fmtW(w.kg)} kg</div><div class="small muted">${L.fmtDate(w.date)}</div></div><div class="small dim num">avg ${fmtW(w.avg)}</div><button class="icon-btn" data-act="deleteWeight" data-d="${w.date}" aria-label="Delete entry">${I('trash')}</button></div>`).join('')}</div>` : '<div class="card empty">No weigh-ins yet.</div>'}`;
}
function chart(pts) {
  const W = 340, H = 200, pl = 34, pr = 8, pt = 10, pb = 22;
  const vals = pts.flatMap(p => [p.kg, p.avg]);
  let lo = Math.min(...vals), hi = Math.max(...vals);
  const pad = Math.max(0.5, (hi - lo) * 0.15); lo -= pad; hi += pad;
  const t0 = L.parseKey(pts[0].date).getTime(), t1 = L.parseKey(pts[pts.length - 1].date).getTime();
  const x = d => pl + ((L.parseKey(d).getTime() - t0) / Math.max(1, t1 - t0)) * (W - pl - pr);
  const y = v => pt + (1 - (v - lo) / (hi - lo)) * (H - pt - pb);
  const ticks = [0, 0.5, 1].map(f => lo + (hi - lo) * f);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Weight trend chart">
    ${ticks.map(v => `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/><text x="0" y="${y(v) + 3}">${r1(v)}</text>`).join('')}
    ${pts.map(p => `<circle class="pt" cx="${x(p.date)}" cy="${y(p.kg)}" r="2.5"/>`).join('')}
    <polyline class="avg" points="${pts.map(p => `${x(p.date)},${y(p.avg)}`).join(' ')}"/>
    <text x="${pl}" y="${H - 4}">${L.fmtDate(pts[0].date, { day: 'numeric', month: 'short' })}</text>
    <text x="${W - pr}" y="${H - 4}" text-anchor="end">${L.fmtDate(pts[pts.length - 1].date, { day: 'numeric', month: 'short' })}</text></svg>`;
}
A.wRange = ({ v }) => { wRange = +v; render(); };
A.saveWeightInline = () => {
  const kg = num($('#w-kg').value); if (!(kg > 20 && kg < 400)) { toast('Enter a weight in kg'); return; }
  upsertWeight(today(), r1(kg)); commit(); toast(`Logged ${fmtW(kg)} kg`);
};
A.deleteWeight = ({ d }) => { if (confirm(`Delete weigh-in from ${L.fmtDate(d)}?`)) { S.weights = S.weights.filter(w => w.date !== d); commit(); } };
A.logWeight = () => {
  const e = S.weights.find(w => w.date === today()), latest = [...S.weights].sort((a, b) => b.date.localeCompare(a.date))[0];
  openSheet(() => `<h3>Log weight</h3><label class="field"><span>Today (kg)</span><input class="input num" id="lw-kg" inputmode="decimal" value="${e ? fmtW(e.kg) : latest ? fmtW(latest.kg) : ''}" style="font-size:24px;font-weight:800"></label>
    <button class="btn primary block" data-act="logWeightGo">Save</button>`);
  setTimeout(() => { const i = $('#lw-kg'); i?.focus(); i?.select(); }, 250);
};
A.logWeightGo = () => {
  const kg = num($('#lw-kg').value); if (!(kg > 20 && kg < 400)) { toast('Enter a weight in kg'); return; }
  upsertWeight(today(), r1(kg)); closeSheet(); commit(); toast(`Logged ${fmtW(kg)} kg`);
};

// =====================================================================
// ME
// =====================================================================
let meDraft = null;
function viewMe(rest) {
  if (rest[0] === 'plan') return viewPlan();
  if (rest[0] === 'schedule') return viewSchedule();
  if (rest[0] === 'targets') { meDraft ||= { profile: { ...S.profile }, targets: { ...S.targets } }; return viewTargets(); }
  if (rest[0] === 'ranks') return viewRanks();
  if (rest[0] === 'xp') return viewXP();
  meDraft = null;
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const li = (href, icon, title, sub) => `<a class="li" href="${href}" style="color:inherit;text-decoration:none"><div class="li-icon">${I(icon)}</div><div class="grow"><div class="bold">${title}</div>${sub ? `<div class="small muted ellipsis">${sub}</div>` : ''}</div>${I('chevR').replace('<svg', '<svg class="chev"')}</a>`;
  const t = S.targets;
  return `<div class="top"><h1>Me</h1></div>
    ${levelCard()}
    <div class="card small"><div class="bold" style="margin-bottom:6px">How you earn XP</div>
      ${[[`Complete a session`, L.XP.session], [`Each exercise with a new PB`, L.XP.pb], [`Train on a scheduled day`, L.XP.onSchedule], [`Perfect week (every scheduled session)`, L.XP.perfectWeek], [`Hit calories + macros for the day`, L.XP.macros]].map(([l, v]) => `<div class="xp-line"><span class="muted">${l}</span><b>+${v}</b></div>`).join('')}</div>
    <h2 class="section">Plan</h2>
    <div class="list">${li('#/me/plan', 'dumbbell', 'Workout split', esc(S.plan.name || 'Custom') + ` · ${S.plan.days.length} days`)}${li('#/me/schedule', 'calendar', 'Weekly schedule', MON_FIRST.map(wd => L.dayById(S, S.plan.schedule[wd])?.name?.slice(0, 1) || '·').join(' '))}${li('#/me/targets', 'target', 'Calorie & macro targets', `${t.kcal} kcal · P ${t.p} · C ${t.c} · F ${t.f}`)}</div>
    <h2 class="section">Progress</h2>
    <div class="list">${li('#/me/ranks', 'star', 'Ranks', '')}${li('#/me/xp', 'history', 'XP history', '')}</div>
    <h2 class="section">Settings</h2>
    <div class="list"><label class="li"><div class="li-icon">${I('timer')}</div><div class="grow"><div class="bold">Rest timer</div><div class="small muted">Starts when you tick a set</div></div><span class="switch"><input type="checkbox" data-ch="restTimer" ${S.settings.restTimer ? 'checked' : ''}><span></span></span></label></div>
    <h2 class="section">Your data</h2>
    <div class="list">
      <button class="li" data-act="exportData"><div class="li-icon">${I('download')}</div><div class="grow"><div class="bold">Export backup</div><div class="small muted">${S.settings.lastBackup ? 'Last: ' + L.fmtDate(S.settings.lastBackup) : 'Save a copy to Files'}</div></div></button>
      <label class="li" style="cursor:pointer"><div class="li-icon">${I('upload')}</div><div class="grow"><div class="bold">Import backup</div><div class="small muted">Replaces everything on this device</div></div><input type="file" accept="application/json,.json" data-ch="importData" hidden></label>
      <button class="li" data-act="resetAll"><div class="li-icon" style="color:var(--danger)">${I('trash')}</div><div class="grow bold" style="color:var(--danger)">Delete all data</div></button>
    </div>
    <div class="small dim" style="margin:8px 4px">Your data is stored only on this device. Export a backup now and then.</div>
    ${!standalone ? `<div class="card mt"><div class="bold">Install on iPhone</div><div class="small muted" style="margin-top:4px">In Safari, tap ${I('share').replace('<svg', '<svg style="width:15px;height:15px;vertical-align:-2px"')} Share, then “Add to Home Screen”. It opens full-screen and works offline.</div></div>` : ''}`;
}
CH.restTimer = (_, el) => { S.settings.restTimer = el.checked; commit(false); };

function viewTargets() {
  return `<a class="back" href="#/me">${I('chevL').replace('<svg', '<svg style="width:18px;height:18px"')} Me</a><div class="top"><div><h1>Targets</h1><div class="sub">Changes apply from today. Past days keep their old targets.</div></div></div>
    ${targetsEditor(meDraft)}<button class="btn primary block" data-act="saveTargetsMe">Save targets</button>`;
}
A.saveTargetsMe = () => {
  const t = meDraft.targets;
  if (!(t.kcal > 0)) { toast('Calories must be above 0'); return; }
  S.profile = { ...meDraft.profile }; saveTargets(t); meDraft = null; commit(false); go('#/me'); toast('Targets saved');
};

function viewSchedule() {
  return `<a class="back" href="#/me">${I('chevL').replace('<svg', '<svg style="width:18px;height:18px"')} Me</a><div class="top"><div><h1>Schedule</h1><div class="sub">Changes apply from today. Your past streak isn't affected.</div></div></div>
    <div class="card">${scheduleRows(S.plan, 'sched')}</div>`;
}
CH.sched = ({ wd }, el) => { S.plan.schedule[+wd] = el.value || null; saveSchedule(); commit(false); toast('Schedule updated'); };

function viewPlan() {
  return `<a class="back" href="#/me">${I('chevL').replace('<svg', '<svg style="width:18px;height:18px"')} Me</a>
    <div class="top"><div><h1>Workout split</h1><div class="sub">Edit days, exercises, sets, reps and rest.</div></div></div>${datalist()}
    <label class="field"><span>Plan name</span><input class="input" data-in="planName" value="${esc(S.plan.name)}"></label>
    <button class="btn block" data-act="changeSplit" style="margin-bottom:12px">Switch to a different split…</button>
    ${S.plan.days.map((d, di) => `<div class="card">
      <div class="row"><input class="input grow bold" data-in="dayName" data-d="${di}" value="${esc(d.name)}" aria-label="Day name" style="font-size:18px">
        <button class="icon-btn" data-act="dayMove" data-d="${di}" data-x="-1" aria-label="Move day up" ${di === 0 ? 'disabled style="opacity:.3"' : ''}>${I('up')}</button>
        <button class="icon-btn" data-act="deleteDay" data-d="${di}" aria-label="Delete day">${I('trash')}</button></div>
      <div class="small muted" style="margin:6px 2px 0">${scheduleDaysFor(d.id) || 'Not scheduled'}</div>
      ${d.exercises.map((e, ei) => `<div class="plan-ex"><div style="min-width:0"><input class="name-in" list="exlib" data-in="exField" data-d="${di}" data-e="${ei}" data-f="name" value="${esc(e.name)}" aria-label="Exercise name">
        <div class="nums">${[['sets', 'Sets'], ['repsMin', 'Min reps'], ['repsMax', 'Max reps'], ['rest', 'Rest s']].map(([f, l]) => `<label>${l}<input inputmode="numeric" data-in="exField" data-d="${di}" data-e="${ei}" data-f="${f}" value="${e[f]}"></label>`).join('')}</div></div>
        <div class="ex-tools"><button class="icon-btn" data-act="exPlanMove" data-d="${di}" data-e="${ei}" data-x="-1" aria-label="Move up" ${ei === 0 ? 'disabled style="opacity:.3"' : ''}>${I('up')}</button>
          <button class="icon-btn" data-act="exPlanMove" data-d="${di}" data-e="${ei}" data-x="1" aria-label="Move down" ${ei === d.exercises.length - 1 ? 'disabled style="opacity:.3"' : ''}>${I('down')}</button>
          <button class="icon-btn" data-act="exPlanDelete" data-d="${di}" data-e="${ei}" aria-label="Remove">${I('x')}</button></div></div>`).join('')}
      <button class="btn sm block mt" data-act="exPlanAdd" data-d="${di}">${I('plus')} Add exercise</button></div>`).join('')}
    <button class="btn block" data-act="addDay">${I('plus')} Add day</button>
    <a class="btn ghost block mt" href="#/me/schedule">Edit weekly schedule</a>`;
}
IN.planName = (_, el) => { S.plan.name = el.value; commit(false); };
IN.dayName = ({ d }, el) => { S.plan.days[+d].name = el.value; commit(false); };
IN.exField = ({ d, e, f }, el) => { S.plan.days[+d].exercises[+e][f] = f === 'name' ? el.value : num(el.value); commit(false); };
A.exPlanMove = ({ d, e, x }) => { const a = S.plan.days[+d].exercises, k = +e + +x; if (k < 0 || k >= a.length) return; [a[+e], a[k]] = [a[k], a[+e]]; commit(); };
A.exPlanDelete = ({ d, e }) => { S.plan.days[+d].exercises.splice(+e, 1); commit(); };
A.exPlanAdd = ({ d }) => { S.plan.days[+d].exercises.push({ id: uid(), name: '', sets: 3, repsMin: 8, repsMax: 12, rest: 90 }); commit(); const ins = document.querySelectorAll(`.name-in[data-d="${d}"]`); ins[ins.length - 1]?.focus(); };
A.dayMove = ({ d, x }) => { const a = S.plan.days, k = +d + +x; if (k < 0) return; [a[+d], a[k]] = [a[k], a[+d]]; commit(); };
A.addDay = () => { S.plan.days.push({ id: uid(), name: `Day ${S.plan.days.length + 1}`, exercises: [] }); commit(); };
A.deleteDay = ({ d }) => {
  const day = S.plan.days[+d];
  if (!confirm(`Delete “${day.name}”? It will be removed from your schedule.`)) return;
  S.plan.days.splice(+d, 1);
  if (S.plan.schedule.includes(day.id)) { S.plan.schedule = S.plan.schedule.map(x => (x === day.id ? null : x)); saveSchedule(); }
  commit();
};
A.changeSplit = () => {
  openSheet(() => `<h3>Switch split</h3><div class="small muted" style="margin:-6px 0 12px">This replaces your current days and schedule. Your history, PBs and XP stay.</div>
    ${PRESETS.map(p => `<button class="card preset tap" data-act="applySplit" data-id="${p.id}"><div class="bold">${esc(p.name)}</div><div class="small muted">${esc(p.blurb)}</div></button>`).join('')}`);
};
A.applySplit = ({ id }) => {
  const p = PRESETS.find(x => x.id === id);
  if (!confirm(`Switch to ${p.name}? Your current plan will be replaced.`)) return;
  S.plan = planFromPreset(p); saveSchedule(); closeSheet(); commit(); toast(`Switched to ${p.name}`);
};

function viewRanks() {
  const lv = L.levelInfo(L.totalXP(S));
  let cum = 0; const xpAt = {};
  for (let l = 1; l <= 75; l++) { xpAt[l] = cum; cum += L.levelCost(l); }
  return `<a class="back" href="#/me">${I('chevL').replace('<svg', '<svg style="width:18px;height:18px"')} Me</a><div class="top"><h1>Ranks</h1></div>
    <div class="list ranks">${L.RANKS.map(r => { const cur = r.name === lv.rank, locked = lv.level < r.level;
      return `<div class="li ${cur ? 'current' : ''} ${locked ? 'locked' : ''}"><div class="li-icon" style="color:${cur ? 'var(--accent)' : locked ? 'var(--dim)' : 'var(--gold)'}">${I(locked ? 'target' : 'star')}</div><div class="grow"><div class="bold">${r.name}</div><div class="small muted">Level ${r.level} · ${xpAt[r.level].toLocaleString()} XP</div></div>${cur ? '<span class="chip accent">You</span>' : !locked ? `<span class="chip gold">Unlocked</span>` : ''}</div>`; }).join('')}</div>`;
}
function viewXP() {
  const L2 = L.xpLedger(S);
  return `<a class="back" href="#/me">${I('chevL').replace('<svg', '<svg style="width:18px;height:18px"')} Me</a><div class="top"><div><h1>XP history</h1><div class="sub">${L2.reduce((a, b) => a + b.amount, 0).toLocaleString()} XP total</div></div></div>
    ${L2.length ? `<div class="list">${L2.slice(0, 200).map(x => `<div class="li"><div class="grow"><div class="bold small">${esc(x.label)}</div><div class="tiny muted">${L.fmtDate(x.date)}</div></div><b class="num" style="color:var(--accent)">+${x.amount}</b></div>`).join('')}</div>` : '<div class="card empty">Finish a workout or hit your macros to earn XP.</div>'}`;
}

// ---------- backup ----------
A.exportData = async () => {
  const name = `forge-backup-${today()}.json`;
  const blob = new Blob([JSON.stringify(S)], { type: 'application/json' });
  const file = new File([blob], name, { type: 'application/json' });
  S.settings.lastBackup = today(); commit(false);
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Forge backup' }); render(); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000); render();
};
CH.importData = async (_, el) => {
  const f = el.files?.[0]; if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (!data || !Array.isArray(data.sessions) || !data.plan) throw new Error('bad');
    if (!confirm(`Replace all data on this device with the backup (${data.sessions.length} sessions, ${data.weights?.length || 0} weigh-ins)?`)) return;
    S = store.migrate(data); await store.writeNow(S); render(); toast('Backup restored');
  } catch { toast("That file isn't a Forge backup"); }
  el.value = '';
};
A.resetAll = async () => {
  if (!confirm('Delete ALL your workouts, food logs, weights and XP from this device? This cannot be undone.')) return;
  if (!confirm('Are you sure? Export a backup first if you might want it back.')) return;
  S = store.defaultState(); await store.writeNow(S); ob = null; location.hash = '#/today'; render();
};

// ---------- boot ----------
(async () => {
  S = await store.load();
  window.__forgeState = S;
  render();
  let lastDay = today();
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && today() !== lastDay) { lastDay = today(); foodDate = null; render(); } });
  // Offline cache. Skipped on localhost (so edits show immediately) unless ?sw is in the URL.
  const local = ['localhost', '127.0.0.1'].includes(location.hostname) && !location.search.includes('sw');
  if ('serviceWorker' in navigator && location.protocol !== 'file:' && !local) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
