(() => {
const $ = s => document.querySelector(s), app = $('#app');
const pad = n => String(n).padStart(2, '0');
const ds = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const diff = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
const KEY = 'nqt.daily.v1';
let S;
try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
S = S || { start: ds(new Date()), theme: 'system', time: '09:00', notify: false, days: {} };
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
save();

const TASKS = [
  { id: 'dsa', n: 'DSA question' }, { id: 'sd', n: 'System design concept' },
  { id: 'apt', n: 'Aptitude' }, { id: 'rea', n: 'Reasoning' }, { id: 'ver', n: 'Verbal ability' }
];
const QT = { apt: 'Aptitude', rea: 'Reasoning', ver: 'Verbal ability' };
const T = () => { const d = ds(new Date()); return { d, n: Math.max(0, diff(S.start, d)) }; };
const rec = d => S.days[d] = S.days[d] || { dsa: 0, sd: 0, ans: {}, notes: {} };
const done = (id, d) => { const r = S.days[d]; if (!r) return false; if (id === 'dsa' || id === 'sd') return !!r[id]; const a = r.ans && r.ans[id]; return !!a && a.length === 5 && a.every(x => x != null); };
const cnt = d => TASKS.filter(t => done(t.id, d)).length;
const dsaOf = n => DATA.DSA[n % DATA.DSA.length], sdOf = n => DATA.SD[n % DATA.SD.length];

const ico = {
  home: '<svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14.3 3h-4l-.4 2.7a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.4 2.7h4l.4-2.7a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"/></svg>',
  chev: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>',
  back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg>',
  fire: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4-3 5-3 9a3 3 0 0 0 6 0c0-1-.5-2-1-3 3 1 5 4 5 7a7 7 0 0 1-14 0c0-6 7-7 7-13z"/></svg>'
};

function streak() {
  let d = new Date(), n = 0;
  if (cnt(ds(d)) < 3) d.setDate(d.getDate() - 1);
  while (cnt(ds(d)) >= 3) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function bestStreak() {
  const { d } = T(); let best = 0, cur = 0;
  for (let i = diff(S.start, d); i >= 0; i--) { const x = new Date(parse(d)); x.setDate(x.getDate() - i); if (cnt(ds(x)) >= 3) best = Math.max(best, ++cur); else cur = 0; }
  return best;
}

/* ---------- views ---------- */
function vToday() {
  const { d, n } = T(), c = cnt(d), dsa = dsaOf(n), sd = sdOf(n), st = streak();
  const circ = 2 * Math.PI * 32, off = circ * (1 - c / 5);
  const sub = { dsa: `${dsa.t} · ${dsa.d}`, sd: sd.t };
  const qsub = id => { if (!S.days[d] || !S.days[d].ans[id]) return '5 questions'; const qs = GEN.quiz(id, d, n), a = S.days[d].ans[id]; return done(id, d) ? `${qs.filter((q, i) => a[i] === q.a).length}/5 correct` : `${a.filter(x => x != null).length}/5 answered`; };
  const hr = new Date().getHours();
  return `<div class="top"><div><p class="mu sm">${new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</p><h1>${hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening'}</h1></div><span class="chip">${ico.fire}${st} day${st === 1 ? '' : 's'}</span></div>
  <div class="card hero"><div class="ring"><svg width="76" height="76"><circle cx="38" cy="38" r="32" fill="none" stroke="var(--sf2)" stroke-width="7"/><circle cx="38" cy="38" r="32" fill="none" stroke="var(--lime)" stroke-width="7" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${off}"/></svg><b>${c}/5</b></div>
  <div><h2>Day ${n + 1}</h2><p class="mu sm">TCS NQT Prime · ${c === 5 ? 'All done. Nice work.' : c >= 3 ? 'Streak safe for today.' : 'Finish 3 tasks to keep your streak.'}</p></div></div>
  ${S.notify ? '' : `<a class="card" href="#/settings" style="display:flex;justify-content:space-between;align-items:center;background:var(--soft);border-color:transparent"><span class="sm"><b>Turn on daily reminders</b><br><span class="mu">Get today's DSA question as a notification.</span></span>${ico.chev}</a>`}
  <p class="sec">Today</p>
  ${TASKS.map((t, i) => `<a class="card task ${done(t.id, d) ? 'done' : ''}" href="#/${t.id === 'dsa' || t.id === 'sd' ? t.id : 'q/' + t.id}"><span class="dot">${done(t.id, d) ? '✓' : i + 1}</span><span class="tt"><b>${t.n}</b><span>${sub[t.id] || qsub(t.id)}</span></span><span class="mu">${ico.chev}</span></a>`).join('')}`;
}
const back = '<a class="back" href="#/today">' + ico.back + ' Today</a>';
const notesBox = (r, k) => `<textarea data-note="${k}" placeholder="Your notes (saved on this device)">${(r.notes[k] || '').replace(/</g, '&lt;')}</textarea>`;
function vDsa() {
  const { d, n } = T(), q = dsaOf(n), r = rec(d);
  return `${back}<span class="badge lime">${q.d}</span><span class="badge">${q.c}</span><h1 style="margin-top:12px">${q.t}</h1><p style="margin-top:12px">${q.s}</p>
  <details><summary>Hint</summary><p class="mu">${q.h}</p></details><details><summary>Approach &amp; complexity</summary><p class="mu">${q.a}</p></details>
  <div class="note">Solve it yourself first, in your own code, then peek at the approach.</div>${notesBox(r, 'dsa')}
  <button class="btn" data-act="flag" data-k="dsa">${r.dsa ? 'Solved ✓ (tap to undo)' : 'Mark as solved'}</button>`;
}
function vSd() {
  const { d, n } = T(), q = sdOf(n), r = rec(d);
  return `${back}<span class="badge lime">System design</span><h1 style="margin-top:12px">${q.t}</h1><p style="margin-top:12px">${q.d}</p>
  <div class="card" style="margin-top:14px"><b>Key points</b><ul class="pts">${q.p.map(x => `<li>${x}</li>`).join('')}</ul></div>
  <div class="note"><b>Trade-off.</b> ${q.x}</div>${notesBox(r, 'sd')}
  <button class="btn" data-act="flag" data-k="sd">${r.sd ? 'Learned ✓ (tap to undo)' : 'Mark as learned'}</button>`;
}
function vQuiz(id) {
  const { d, n } = T(), qs = GEN.quiz(id, d, n), r = rec(d), a = r.ans[id] = r.ans[id] || Array(5).fill(null);
  const fin = a.every(x => x != null), sc = qs.filter((q, i) => a[i] === q.a).length;
  return `${back}<h1>${QT[id]}</h1><p class="mu sm" style="margin:6px 0 16px">5 questions · tap an answer to see the explanation</p>
  ${qs.map((q, i) => `<div class="card q"><p class="qn">Question ${i + 1}</p><p class="qt">${q.q}</p>${q.o.map((o, j) => `<button class="opt ${a[i] != null ? (j === q.a ? 'ok' : j === a[i] ? 'bad' : '') : ''}" ${a[i] != null ? 'disabled' : `data-act="ans" data-s="${id}" data-q="${i}" data-o="${j}"`}>${o}</button>`).join('')}${a[i] != null ? `<p class="exp">${q.e}</p>` : ''}</div>`).join('')}
  ${fin ? `<div class="card" style="text-align:center;background:var(--soft);border-color:transparent"><h2>${sc}/5 correct</h2><p class="mu sm">${sc === 5 ? 'Perfect set.' : 'Review the explanations above, then come back tomorrow.'}</p></div>` : ''}`;
}
function vProgress() {
  const { d } = T(), total = Object.keys(S.days).reduce((s, k) => s + cnt(k), 0);
  const solved = Object.values(S.days).filter(x => x.dsa).length, learned = Object.values(S.days).filter(x => x.sd).length;
  const acc = id => { let c = 0, t = 0; for (const k of Object.keys(S.days)) { const a = S.days[k].ans && S.days[k].ans[id]; if (!a) continue; const qs = GEN.quiz(id, k, 0); a.forEach((v, i) => { if (v != null) { t++; if (v === qs[i].a) c++; } }); } return t ? Math.round(c * 100 / t) : 0; };
  const cells = []; const today = parse(d), dow = (today.getDay() + 6) % 7;
  for (let i = 21 + dow; i >= 0 - (6 - dow); i--) { const x = new Date(today); x.setDate(x.getDate() - i); const k = ds(x), fut = x > today; cells.push(`<div class="cell ${fut ? '' : 'l' + cnt(k)}" ${fut ? 'style="opacity:.35"' : ''}></div>`); }
  return `<h1 style="margin:6px 0 16px">Progress</h1>
  <div class="stats"><div class="card"><p class="mu sm">Current streak</p><b>${streak()}</b></div><div class="card"><p class="mu sm">Best streak</p><b>${bestStreak()}</b></div><div class="card"><p class="mu sm">DSA solved</p><b>${solved}</b></div><div class="card"><p class="mu sm">Concepts learned</p><b>${learned}</b></div></div>
  <div class="card"><div class="row"><b>Last 4 weeks</b><span class="mu sm">${total} tasks done</span></div><div class="grid">${cells.join('')}</div><p class="mu sm" style="margin-top:10px">A day counts toward your streak at 3+ tasks.</p></div>
  <p class="sec">Quiz accuracy</p><div class="card bars">${['apt', 'rea', 'ver'].map(id => `<div><div class="row"><span>${QT[id]}</span><b>${acc(id)}%</b></div><div class="bar"><i style="width:${acc(id)}%"></i></div></div>`).join('')}</div>`;
}
function vSettings() {
  return `<h1 style="margin:6px 0 16px">Settings</h1>
  <div class="card set"><b>Theme</b><div class="seg" style="margin-top:10px">${['system', 'light', 'dark'].map(v => `<button class="${S.theme === v ? 'on' : ''}" data-act="theme" data-v="${v}">${v[0].toUpperCase() + v.slice(1)}</button>`).join('')}</div></div>
  <div class="card set"><div class="row"><div><b>Daily reminder</b><p class="mu sm">"Today's DSA question is …"</p></div><input type="time" id="tm" value="${S.time}"></div>
  <div class="row" style="margin:0"><button class="btn sm" data-act="notify">${S.notify ? 'Reminders on · tap to turn off' : 'Enable reminders'}</button><button class="btn sm ghost" data-act="test">Test</button></div></div>
  <div class="card set"><b>Your data</b><p class="mu sm" style="margin:4px 0 12px">Everything is stored only on this device. No account, no server.</p>
  <div class="row" style="margin:0"><button class="btn sm ghost" data-act="export">Export backup</button><button class="btn sm ghost" data-act="import">Import</button><button class="btn sm ghost" data-act="reset" style="color:var(--bad)">Reset</button></div></div>
  <p class="mu sm" style="text-align:center;margin-top:18px">NQT Daily · ${DATA.DSA.length} DSA · ${DATA.SD.length} design concepts · fresh quizzes every day</p>`;
}

/* ---------- router ---------- */
function render(route) {
  const h = (location.hash.replace('#/', '') || 'today').split('/'), [r, arg] = h;
  const html = r === 'dsa' ? vDsa() : r === 'sd' ? vSd() : r === 'q' ? vQuiz(arg) : r === 'progress' ? vProgress() : r === 'settings' ? vSettings() : vToday();
  const y = route ? 0 : scrollY; app.innerHTML = html; scrollTo(0, y);
  const tab = ['progress', 'settings'].includes(r) ? r : 'today';
  $('nav').innerHTML = [['today', 'Today', ico.home], ['progress', 'Progress', ico.chart], ['settings', 'Settings', ico.gear]].map(([k, l, i]) => `<a href="#/${k}" class="${tab === k ? 'on' : ''}">${i}${l}</a>`).join('');
}
addEventListener('hashchange', () => render(true));

/* ---------- notifications ---------- */
const LN = () => window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications;
const body = (n) => `Today's DSA question is: ${dsaOf(n).t} (${dsaOf(n).c.split(' · ')[0]}, ${dsaOf(n).d}). System design: ${sdOf(n).t}`;
async function schedule() {
  const ln = LN(); if (!ln || !S.notify) return;
  try {
    const p = await ln.getPending(); if (p.notifications.length) await ln.cancel({ notifications: p.notifications });
    const [h, m] = S.time.split(':').map(Number), now = new Date(), { n } = T(), list = [];
    for (let i = 0; i < 30; i++) { const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, h, m, 0); if (at <= now) continue; list.push({ id: i + 1, title: 'NQT Daily', body: body(n + i), schedule: { at, allowWhileIdle: true } }); }
    if (list.length) await ln.schedule({ notifications: list });
  } catch (e) { console.warn(e); }
}
async function enable() {
  const ln = LN();
  if (ln) { const p = await ln.requestPermissions(); if (p.display !== 'granted') return toast('Notification permission denied'), false; S.notify = true; save(); await schedule(); return true; }
  if ('Notification' in window) { const p = await Notification.requestPermission(); if (p === 'granted') { S.notify = true; toast('On. In a browser they show when you open the app. Install the APK for scheduled ones.'); return true; } }
  toast('Notifications are not available here'); return false;
}
async function test() {
  const ln = LN(), { n } = T();
  if (ln) { const p = await ln.requestPermissions(); if (p.display !== 'granted') return toast('Permission denied'); await ln.schedule({ notifications: [{ id: 999, title: 'NQT Daily', body: body(n), schedule: { at: new Date(Date.now() + 3000) } }] }); return toast('Arriving in 3 seconds'); }
  if ('Notification' in window && Notification.permission === 'granted') return void new Notification('NQT Daily', { body: body(n) });
  toast('Enable reminders first');
}
function webReminder() {
  if (LN() || !S.notify || !('Notification' in window) || Notification.permission !== 'granted') return;
  const { d, n } = T(); if (S.lastNote === d) return; S.lastNote = d; save();
  try { new Notification('NQT Daily', { body: body(n) }); } catch (e) {}
}

/* ---------- misc ---------- */
let tt; function toast(m) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t); clearTimeout(tt); tt = setTimeout(() => t.remove(), 2800); }
function applyTheme() {
  const dark = S.theme === 'dark' || (S.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = dark ? '#1A1918' : '#FAF9F5';
}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

document.addEventListener('click', async e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act, { d } = T(), r = rec(d);
  if (a === 'ans') r.ans[b.dataset.s][+b.dataset.q] = +b.dataset.o;
  else if (a === 'flag') r[b.dataset.k] = r[b.dataset.k] ? 0 : 1;
  else if (a === 'theme') { S.theme = b.dataset.v; applyTheme(); }
  else if (a === 'notify') { if (S.notify) { S.notify = false; const ln = LN(); if (ln) { try { const p = await ln.getPending(); if (p.notifications.length) await ln.cancel({ notifications: p.notifications }); } catch (x) {} } } else await enable(); }
  else if (a === 'test') return test();
  else if (a === 'export') { const j = JSON.stringify(S); try { await navigator.clipboard.writeText(j); toast('Backup copied to clipboard'); } catch (x) { prompt('Copy your backup:', j); } try { const l = document.createElement('a'); l.href = URL.createObjectURL(new Blob([j], { type: 'application/json' })); l.download = 'nqt-daily-backup.json'; l.click(); } catch (x) {} return; }
  else if (a === 'import') { const j = prompt('Paste your backup JSON:'); if (!j) return; try { const o = JSON.parse(j); if (!o.days || !o.start) throw 0; S = o; toast('Backup restored'); } catch (x) { return toast('Invalid backup'); } }
  else if (a === 'reset') { if (!confirm('Delete all progress on this device?')) return; S = { start: ds(new Date()), theme: S.theme, time: S.time, notify: S.notify, days: {} }; }
  save(); render(); if (a === 'notify' || a === 'import') schedule();
});
document.addEventListener('input', e => { if (e.target.dataset.note) { rec(T().d).notes[e.target.dataset.note] = e.target.value; save(); } });
document.addEventListener('change', e => { if (e.target.id === 'tm' && e.target.value) { S.time = e.target.value; save(); schedule(); toast('Reminder time updated'); } });

applyTheme(); render(true); schedule(); webReminder();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
