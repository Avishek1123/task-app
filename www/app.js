(() => {
const $ = s => document.querySelector(s), app = $('#app');
const pad = n => String(n).padStart(2, '0');
const ds = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const diff = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const IDS = ['28', '30', '45', '60', '90'];
const BLURB = {
  '28': 'Built for you: arrays, strings, two pointers, sliding window, hash maps, stacks and recursion are revision, then TCS patterns, DP and mocks.',
  '30': 'High-intensity sprint. Use this when the exam is inside about five weeks and you can give 4–6 hours a day.',
  '45': 'A complete Prime plan on its own. After day 45, add extension weeks if the exam is still ahead.',
  '60': 'The realistic pace for most people: about 3 hours a day, ending in full mocks.',
  '90': 'From language basics through mock season. Use this if fundamentals are rusty or the exam is three months out.'
};
const KEY = 'nqt.plan.v1';
const fresh = () => ({ start: ds(new Date()), ext: 0, done: {}, notes: {} });

let S;
try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
if (!S || !S.plans) {
  let theme = 'system', time = '09:00', notify = false;
  try {
    const old = JSON.parse(localStorage.getItem('nqt.daily.v1') || 'null');
    if (old) { theme = old.theme || theme; time = old.time || time; notify = !!old.notify; }
  } catch (e) {}
  S = { plan: '28', theme, time, notify, plans: {} };
}
if (!IDS.includes(S.plan)) S.plan = '28';
for (const id of IDS) if (!S.plans[id]) S.plans[id] = fresh();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
save();

const pack = () => PLAN_DATA.plans[S.plan];
const st = () => S.plans[S.plan];
const totalDays = () => pack().days.length + (st().ext || 0) * 7;
const material = i => {
  const base = pack().days;
  if (i < base.length) return base[i];
  const src = PLAN_DATA.ext[(i - base.length) % 7];
  const week = Math.floor((i - base.length) / 7) + 1;
  return { t: src.t, f: src.f.replace(/extension week \d+/, 'extension week ' + week), s: src.s, k: src.k };
};
const cleanTask = text => String(text).replace(/^(?:\p{Extended_Pictographic}\uFE0F?|\uFE0F|\u200D)+\s*/u, '').trim();
const isAssessedDrill = text => {
  const t = cleanTask(text);
  if (/redo|wrong|skipped|weak topic/i.test(t)) return false;
  return /(aptitude|reasoning|\bquant\b)/i.test(t) && /\bq/i.test(t);
};
const visibleTasks = i => material(i).k.map((text, j) => ({ text, j })).filter(x => !isAssessedDrill(x.text));
const quizOf = (i, id) => GEN.quiz(id, ds(dateOf(i)), i);
const quizAns = (i, id) => (st().quiz && st().quiz[i] && st().quiz[i][id]) || [];
const quizDone = (i, id) => { const qs = quizOf(i, id), a = quizAns(i, id); return a.length === qs.length && qs.length > 0 && a.every(x => x != null); };
const doneN = i => visibleTasks(i).filter(x => (st().done[i] || [])[x.j]).length + (quizDone(i, 'apt') ? 1 : 0) + (quizDone(i, 'rea') ? 1 : 0);
const slotN = i => visibleTasks(i).length + 2;
const allDone = i => slotN(i) > 0 && doneN(i) === slotN(i);
const groups = () => {
  const g = pack().phases.map(p => ({ n: p.n, a: p.a - 1, b: p.b - 1 }));
  const base = pack().days.length;
  for (let w = 0; w < (st().ext || 0); w++) g.push({ n: 'Extension week ' + (w + 1), a: base + w * 7, b: base + w * 7 + 6 });
  return g;
};
const phaseOf = i => { const n = i + 1; const p = groups().find(x => n >= x.a + 1 && n <= x.b + 1); return p ? p.n : ''; };
const dateOf = i => { const d = parse(st().start); d.setDate(d.getDate() + i); return d; };
const todayOff = () => diff(st().start, ds(new Date()));

function streak() {
  let d = new Date(), n = 0;
  if (!fullOn(ds(d))) d.setDate(d.getDate() - 1);
  while (fullOn(ds(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function bestStreak() {
  const end = ds(new Date()); let best = 0, cur = 0, d = parse(st().start);
  if (d > parse(end)) return 0;
  while (ds(d) <= end) { if (fullOn(ds(d))) best = Math.max(best, ++cur); else cur = 0; d.setDate(d.getDate() + 1); }
  return best;
}
function fullOn(dateStr) {
  const off = diff(st().start, dateStr);
  return off >= 0 && off < totalDays() && allDone(off);
}
function finishedCount() {
  let n = 0;
  for (let i = 0; i < totalDays(); i++) if (allDone(i)) n++;
  return n;
}

const ico = {
  home: '<svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  list: '<svg viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14.3 3h-4l-.4 2.7a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.4 2.7h4l.4-2.7a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"/></svg>',
  back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg>',
  fire: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4-3 5-3 9a3 3 0 0 0 6 0c0-1-.5-2-1-3 3 1 5 4 5 7a7 7 0 0 1-14 0c0-6 7-7 7-13z"/></svg>',
  tick: '<svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>'
};
const tic = {
  code: '<svg viewBox="0 0 24 24"><path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 6l-4 12"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/></svg>',
  calc: '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/></svg>',
  reason: '<svg viewBox="0 0 24 24"><circle cx="6" cy="8" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="12" cy="17" r="2"/><path d="M8 8h8M7.4 9.6l3.4 5M16.6 9.6l-3.4 5"/></svg>',
  pen: '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/></svg>',
  clip: '<svg viewBox="0 0 24 24"><path d="M9 5h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7"/><path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1H9z"/><path d="M9 12h6M9 16h4"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 19V10M10 19V5M16 19v-7M21 19H3"/></svg>',
  moon: '<svg viewBox="0 0 24 24"><path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z"/></svg>',
  list: '<svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>'
};
function taskIcon(text) {
  const t = cleanTask(text).toLowerCase();
  if (/sleep|rest/.test(t)) return tic.moon;
  if (/verbal|email|grammar|passage|sentence|jumble|synonym/.test(t)) return tic.pen;
  if (/mock|foundation part|advanced aptitude|advanced coding/.test(t)) return tic.clip;
  if (/log|record|score|mistake|weak/.test(t)) return tic.chart;
  if (/problem|re-solve|solve|coding|warm-up/.test(t)) return tic.code;
  if (/read|formula|study|checklist|verify|slot|game plan/.test(t)) return tic.book;
  return tic.list;
}
function quizLabel(i, id) {
  const qs = quizOf(i, id), a = quizAns(i, id), n = a.filter(x => x != null).length;
  if (n === qs.length && n) return `${qs.filter((q, k) => a[k] === q.a).length}/${qs.length} correct`;
  if (n) return `${n}/${qs.length} answered`;
  return `${qs.length} questions · answer here, then check`;
}
function drillHint(i, id) {
  const line = material(i).k.map(cleanTask).find(t => id === 'apt' ? /aptitude|\bquant\b/i.test(t) : /reasoning/i.test(t));
  return line || (id === 'apt' ? 'Percentages, profit, time, interest, averages' : 'Series, coding-decoding, directions, blood relations');
}

function planSwitch() {
  return `<div class="seg plans">${IDS.map(id => `<button class="${S.plan === id ? 'on' : ''}" data-act="plan" data-v="${id}">${id}</button>`).join('')}</div>`;
}

function vToday(i, fromList) {
  const off = todayOff(), total = totalDays(), day = material(i), tasks = visibleTasks(i), c = doneN(i), slots = slotN(i);
  const circ = 2 * Math.PI * 32, offRing = circ * (1 - c / slots);
  const when = dateOf(i);
  const hr = new Date().getHours();
  const isToday = off === i;
  let banner = '';
  if (off < 0 && i === 0) banner = `<div class="note">This plan starts in ${-off} day${off === -1 ? '' : 's'} (${esc(st().start)}). Day 1 is ready whenever you are.</div>`;
  else if (off >= total && i === total - 1) banner = `<div class="note">You finished this plan. Add an extension week to keep the mocks and drills going.</div>`;
  else if (!isToday && off >= 0 && i > off) banner = `<div class="note">This day is ${i - off} day${i - off === 1 ? '' : 's'} from today.</div>`;
  const back = fromList ? `<a class="back" href="#/days">${ico.back} All days</a>` : '';
  return `${back}<div class="top"><div><p class="mu sm">${when.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</p><h1>${isToday ? (hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening') : 'Day ' + (i + 1)}</h1></div><span class="chip">${ico.fire}${streak()} day${streak() === 1 ? '' : 's'}</span></div>
  <div class="card hero"><div class="ring"><svg width="76" height="76"><circle cx="38" cy="38" r="32" fill="none" stroke="var(--sf2)" stroke-width="7"/><circle cx="38" cy="38" r="32" fill="none" stroke="var(--lime)" stroke-width="7" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${offRing}"/></svg><b>${c}/${slots}</b></div>
  <div><p class="mu sm">${esc(pack().name)} · ${esc(phaseOf(i))}</p><h2>Day ${i + 1} — ${esc(day.t)}</h2><p class="mu sm">${c === slots ? 'All done for this day.' : 'Finish the tasks and both assessments.'}</p></div></div>
  ${banner}
  ${S.notify ? '' : `<a class="card" href="#/settings" style="display:flex;justify-content:space-between;align-items:center;background:var(--soft);border-color:transparent;margin-top:12px"><span class="sm"><b>Turn on the daily reminder</b><br><span class="mu">It names today's topic until the day is finished.</span></span></a>`}
  <p class="sec">Focus</p>
  <div class="note" style="margin-top:0">${esc(day.f)}</div>
  <p class="sec">Study</p>
  <div class="card"><ul class="pts">${day.s.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
  <p class="sec">Daily assessment</p>
  <a class="card task ${quizDone(i, 'apt') ? 'done' : ''}" href="#/quiz/apt/${i + 1}"><span class="tic">${tic.calc}</span><span class="tt"><b>Aptitude</b><span>${esc(quizLabel(i, 'apt'))}</span></span></a>
  <a class="card task ${quizDone(i, 'rea') ? 'done' : ''}" href="#/quiz/rea/${i + 1}"><span class="tic">${tic.reason}</span><span class="tt"><b>Reasoning</b><span>${esc(quizLabel(i, 'rea'))}</span></span></a>
  <p class="sec">Tasks</p>
  ${tasks.map(({ text, j }) => { const on = !!(st().done[i] || [])[j]; return `<button class="check ${on ? 'on' : ''}" data-act="tog" data-i="${i}" data-j="${j}"><span class="box">${on ? ico.tick : ''}</span><span class="tic">${taskIcon(text)}</span><span>${esc(cleanTask(text))}</span></button>`; }).join('')}
  <textarea data-note="${i}" placeholder="3-line takeaway (saved on this device)">${esc(st().notes[i] || '')}</textarea>
  <div class="row" style="margin-top:14px"><button class="btn sm ghost" data-act="goto" data-v="${Math.max(0, i - 1)}" ${i === 0 ? 'disabled' : ''}>Previous</button><button class="btn sm ghost" data-act="goto" data-v="${Math.min(total - 1, i + 1)}" ${i >= total - 1 ? 'disabled' : ''}>Next day</button></div>`;
}

function vDays() {
  const off = todayOff(), fin = finishedCount(), total = totalDays();
  const cells = [];
  const today = parse(ds(new Date())), dow = (today.getDay() + 6) % 7;
  for (let i = 21 + dow; i >= 0 - (6 - dow); i--) {
    const x = new Date(today); x.setDate(x.getDate() - i); const fut = x > today;
    const on = fullOn(ds(x)), started = diff(st().start, ds(x));
    const lvl = fut ? '' : on ? 'l5' : (started >= 0 && started < total && doneN(started) ? 'l' + Math.min(4, doneN(started)) : '');
    cells.push(`<div class="cell ${lvl}" ${fut ? 'style="opacity:.35"' : ''}></div>`);
  }
  let html = '';
  for (const g of groups()) {
    html += `<p class="sec">${esc(g.n)}</p>`;
    for (let i = g.a; i <= g.b; i++) {
      const day = material(i), c = doneN(i), n = slotN(i);
      html += `<a class="card task ${allDone(i) ? 'done' : ''} ${i === off ? 'todayline' : ''}" href="#/day/${i + 1}"><span class="dot">${allDone(i) ? '✓' : i + 1}</span><span class="tt"><b>${esc(day.t)}</b><span>${c}/${n} tasks${i === off ? ' · today' : ''}</span></span></a>`;
    }
  }
  return `<h1 style="margin:6px 0 6px">Plan</h1><p class="mu sm" style="margin-bottom:12px">${esc(BLURB[S.plan])}</p>${planSwitch()}
  <div class="stats" style="margin-top:12px"><div class="card"><p class="mu sm">Days done</p><b>${fin}/${total}</b></div><div class="card"><p class="mu sm">Best streak</p><b>${bestStreak()}</b></div></div>
  <div class="card"><div class="row"><b>Last 4 weeks</b><span class="mu sm">${esc(pack().name)}</span></div><div class="grid">${cells.join('')}</div><p class="mu sm" style="margin-top:10px">A day counts when every task is ticked.</p></div>
  ${html}
  <div class="row" style="margin-top:8px"><button class="btn sm" data-act="extend">Add extension week</button>${st().ext ? `<button class="btn sm ghost" data-act="shrink">Remove last week</button>` : ''}</div>
  <a class="card" href="#/guide" style="display:block;margin-top:12px"><b>Exam guide</b><p class="mu sm">Pattern, timing and what Prime actually tests.</p></a>`;
}

function vQuiz(id, i) {
  const name = id === 'apt' ? 'Aptitude' : 'Reasoning';
  const qs = quizOf(i, id);
  st().quiz = st().quiz || {};
  st().quiz[i] = st().quiz[i] || {};
  const prev = st().quiz[i][id];
  const a = st().quiz[i][id] = (prev && prev.length === qs.length) ? prev : Array(qs.length).fill(null);
  const fin = a.every(x => x != null), sc = qs.filter((q, n) => a[n] === q.a).length;
  const backTo = todayOff() === i ? '#/today' : '#/day/' + (i + 1);
  return `<a class="back" href="${backTo}">${ico.back} Day ${i + 1}</a><span class="badge lime">${name}</span><h1 style="margin-top:12px">${name}</h1><p class="mu sm" style="margin:6px 0 4px">${esc(drillHint(i, id))}</p><p class="mu sm" style="margin:0 0 16px">Answer here. The explanation shows as soon as you tap.</p>
  ${qs.map((q, n) => `<div class="card q"><p class="qn">Question ${n + 1}</p><p class="qt">${esc(q.q)}</p>${q.o.map((o, j) => `<button class="opt ${a[n] != null ? (j === q.a ? 'ok' : j === a[n] ? 'bad' : '') : ''}" ${a[n] != null ? 'disabled' : `data-act="ans" data-i="${i}" data-s="${id}" data-q="${n}" data-o="${j}"`}>${esc(o)}</button>`).join('')}${a[n] != null ? `<p class="exp">${esc(q.e)}</p>` : ''}</div>`).join('')}
  ${fin ? `<div class="card" style="text-align:center;background:var(--soft);border-color:transparent"><h2>${sc}/${qs.length} correct</h2><p class="mu sm">${sc === qs.length ? 'Clean set.' : 'Read the explanations, then the same set stays here if you want another look.'}</p></div>` : ''}`;
}

function vGuide() {
  return `<a class="back" href="#/days">${ico.back} Plan</a><h1>Exam guide</h1><p class="mu sm" style="margin:6px 0 14px">The same facts used in the desktop planner.</p>
  ${PLAN_DATA.exam.map(x => `<div class="card" style="margin-bottom:10px">${esc(x)}</div>`).join('')}`;
}

function vSettings() {
  return `<h1 style="margin:6px 0 16px">Settings</h1>
  <div class="card set"><b>Active plan</b><p class="mu sm" style="margin:4px 0 10px">${esc(pack().name)}. Each plan keeps its own start date and ticks.</p>${planSwitch()}<p class="mu sm" style="margin-top:10px">${esc(BLURB[S.plan])}</p></div>
  <div class="card set"><div class="row"><div><b>Start date</b><p class="mu sm">Day 1 of this plan.</p></div><input type="date" id="start" value="${esc(st().start)}"></div>
  <div class="row" style="margin:0"><button class="btn sm" data-act="extend">Add extension week</button>${st().ext ? `<button class="btn sm ghost" data-act="shrink">Remove last week</button>` : ''}</div>
  <p class="mu sm" style="margin-top:8px">${st().ext || 0} extension week${st().ext === 1 ? '' : 's'} · ${totalDays()} days total</p></div>
  <div class="card set"><b>Theme</b><div class="seg" style="margin-top:10px">${['system', 'light', 'dark'].map(v => `<button class="${S.theme === v ? 'on' : ''}" data-act="theme" data-v="${v}">${v[0].toUpperCase() + v.slice(1)}</button>`).join('')}</div></div>
  <div class="card set"><div class="row"><div><b>Daily reminder</b><p class="mu sm">Names today's topic from the plan.</p></div><input type="time" id="tm" value="${esc(S.time)}"></div>
  <div class="row" style="margin:0"><button class="btn sm" data-act="notify">${S.notify ? 'Reminders on · tap to turn off' : 'Enable reminders'}</button><button class="btn sm ghost" data-act="test">Test</button></div></div>
  <div class="card set"><b>Your data</b><p class="mu sm" style="margin:4px 0 12px">Progress stays on this device. No account, no server.</p>
  <div class="row" style="margin:0"><button class="btn sm ghost" data-act="export">Export backup</button><button class="btn sm ghost" data-act="import">Import</button><button class="btn sm ghost" data-act="reset" style="color:var(--bad)">Reset</button></div></div>
  <p class="mu sm" style="text-align:center;margin-top:18px">NQT Daily · the 28, 30, 45, 60 and 90-day Prime plans</p>`;
}

function render(route) {
  const h = (location.hash.replace('#/', '') || 'today').split('/'), [r, arg, extra] = h;
  let html, tab = 'today';
  if (r === 'days') { html = vDays(); tab = 'days'; }
  else if (r === 'guide') { html = vGuide(); tab = 'days'; }
  else if (r === 'settings') { html = vSettings(); tab = 'settings'; }
  else if (r === 'quiz') {
    const i = Math.min(totalDays(), Math.max(1, parseInt(extra, 10) || 1)) - 1;
    html = vQuiz(arg === 'rea' ? 'rea' : 'apt', i);
  } else if (r === 'day') {
    const n = Math.min(totalDays(), Math.max(1, parseInt(arg, 10) || 1));
    html = vToday(n - 1, true);
  } else {
    const off = todayOff(), total = totalDays();
    const i = off < 0 ? 0 : Math.min(off, total - 1);
    html = vToday(i, false);
  }
  const y = route ? 0 : scrollY; app.innerHTML = html; scrollTo(0, y);
  $('nav').innerHTML = [['today', 'Today', ico.home], ['days', 'Plan', ico.list], ['settings', 'Settings', ico.gear]].map(([k, l, i]) => `<a href="#/${k}" class="${tab === k ? 'on' : ''}">${i}${l}</a>`).join('');
}
addEventListener('hashchange', () => render(true));

const LN = () => window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications;
function noteBody(dayOffset) {
  const at = new Date(); at.setDate(at.getDate() + dayOffset);
  const off = diff(st().start, ds(at)), total = totalDays();
  if (off < 0) return `${pack().name} starts on ${st().start}.`;
  if (off >= total) return 'Plan finished. Add an extension week to keep going.';
  const day = material(off);
  return `Day ${off + 1}: ${day.t}. ${day.f}`;
}
async function schedule() {
  const ln = LN(); if (!ln || !S.notify) return;
  try {
    const p = await ln.getPending(); if (p.notifications.length) await ln.cancel({ notifications: p.notifications });
    const [h, m] = S.time.split(':').map(Number), now = new Date(), list = [];
    for (let i = 0; i < 30; i++) {
      const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, h, m, 0);
      if (at <= now) continue;
      list.push({ id: i + 1, title: 'NQT Daily', body: noteBody(i), schedule: { at, allowWhileIdle: true } });
    }
    if (list.length) await ln.schedule({ notifications: list });
  } catch (e) { console.warn(e); }
}
async function enable() {
  const ln = LN();
  if (ln) { const p = await ln.requestPermissions(); if (p.display !== 'granted') return toast('Notification permission denied'), false; S.notify = true; save(); await schedule(); return true; }
  if ('Notification' in window) { const p = await Notification.requestPermission(); if (p === 'granted') { S.notify = true; toast('On. Install the APK for reminders when the app is closed.'); return true; } }
  toast('Notifications are not available here'); return false;
}
async function test() {
  const ln = LN();
  if (ln) { const p = await ln.requestPermissions(); if (p.display !== 'granted') return toast('Permission denied'); await ln.schedule({ notifications: [{ id: 999, title: 'NQT Daily', body: noteBody(0), schedule: { at: new Date(Date.now() + 3000) } }] }); return toast('Arriving in 3 seconds'); }
  if ('Notification' in window && Notification.permission === 'granted') return void new Notification('NQT Daily', { body: noteBody(0) });
  toast('Enable reminders first');
}
function webReminder() {
  if (LN() || !S.notify || !('Notification' in window) || Notification.permission !== 'granted') return;
  const d = ds(new Date()); if (S.lastNote === d) return; S.lastNote = d; save();
  try { new Notification('NQT Daily', { body: noteBody(0) }); } catch (e) {}
}

let tt; function toast(m) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t); clearTimeout(tt); tt = setTimeout(() => t.remove(), 2800); }
function applyTheme() {
  const dark = S.theme === 'dark' || (S.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = dark ? '#1A1918' : '#FAF9F5';
}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

function goDay(i) {
  location.hash = '#/day/' + (i + 1);
}

document.addEventListener('click', async e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act;
  if (a === 'tog') {
    const i = +b.dataset.i, j = +b.dataset.j;
    const cur = material(i).k.map((_, k) => !!(st().done[i] && st().done[i][k]));
    cur[j] = !cur[j]; st().done[i] = cur;
  } else if (a === 'ans') {
    const i = +b.dataset.i, id = b.dataset.s, q = +b.dataset.q;
    const qs = quizOf(i, id);
    st().quiz = st().quiz || {}; st().quiz[i] = st().quiz[i] || {};
    const arr = st().quiz[i][id] = (st().quiz[i][id] && st().quiz[i][id].length === qs.length) ? st().quiz[i][id] : Array(qs.length).fill(null);
    if (arr[q] != null) return;
    arr[q] = +b.dataset.o;
  } else if (a === 'plan') {
    S.plan = b.dataset.v;
  } else if (a === 'extend') {
    st().ext = (st().ext || 0) + 1;
    toast('Extension week ' + st().ext + ' added · ' + totalDays() + ' days');
  } else if (a === 'shrink') {
    if (!st().ext) return;
    const from = pack().days.length + (st().ext - 1) * 7;
    for (let i = from; i < from + 7; i++) { delete st().done[i]; delete st().notes[i]; }
    st().ext -= 1;
  } else if (a === 'goto') {
    save(); goDay(+b.dataset.v); return;
  } else if (a === 'theme') { S.theme = b.dataset.v; applyTheme(); }
  else if (a === 'notify') { if (S.notify) { S.notify = false; const ln = LN(); if (ln) { try { const p = await ln.getPending(); if (p.notifications.length) await ln.cancel({ notifications: p.notifications }); } catch (x) {} } } else await enable(); }
  else if (a === 'test') return test();
  else if (a === 'export') { const j = JSON.stringify(S); try { await navigator.clipboard.writeText(j); toast('Backup copied to clipboard'); } catch (x) { prompt('Copy your backup:', j); } try { const l = document.createElement('a'); l.href = URL.createObjectURL(new Blob([j], { type: 'application/json' })); l.download = 'nqt-plan-backup.json'; l.click(); } catch (x) {} return; }
  else if (a === 'import') { const j = prompt('Paste your backup JSON:'); if (!j) return; try { const o = JSON.parse(j); if (!o.plans || !o.plan) throw 0; S = o; toast('Backup restored'); } catch (x) { return toast('Invalid backup'); } }
  else if (a === 'reset') { if (!confirm('Delete all plan progress on this device?')) return; S = { plan: '28', theme: S.theme, time: S.time, notify: S.notify, plans: {} }; for (const id of IDS) S.plans[id] = fresh(); }
  save(); render(); if (a === 'notify' || a === 'import' || a === 'plan' || a === 'extend' || a === 'shrink') schedule();
});
document.addEventListener('input', e => {
  if (e.target.dataset.note != null) { st().notes[e.target.dataset.note] = e.target.value; save(); }
});
document.addEventListener('change', e => {
  if (e.target.id === 'tm' && e.target.value) { S.time = e.target.value; save(); schedule(); toast('Reminder time updated'); }
  if (e.target.id === 'start' && e.target.value) { st().start = e.target.value; save(); schedule(); render(); toast('Start date updated'); }
});

applyTheme(); render(true); schedule(); webReminder();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
