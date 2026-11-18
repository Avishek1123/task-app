const GEN = (() => {
  const D = (typeof module !== 'undefined') ? require('./data.js') : DATA;
  const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => { let a = seed >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  const shuffle = (r, arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  const num = (r, ans) => {
    const step = ans < 20 ? 1 : ans < 100 ? 5 : ans < 500 ? 10 : 50;
    const set = new Set([ans]);
    let k = 0;
    while (set.size < 4 && k++ < 60) { const v = ans + int(r, 1, 4) * step * (r() < .5 ? -1 : 1); if (v > 0) set.add(v); }
    let pad = 5; while (set.size < 4) set.add(ans + step * pad++);
    const arr = shuffle(r, [...set]);
    return { o: arr.map(String), a: arr.indexOf(ans) };
  };
  const txt = (r, correct, wrongs) => {
    const set = [correct]; for (const w of wrongs) if (!set.includes(w)) set.push(w);
    let pad = 0; while (set.length < 4) set.push(correct + (++pad));
    const arr = shuffle(r, set.slice(0, 4));
    return { o: arr, a: arr.indexOf(correct) };
  };
  const fromBank = (r, it) => { const idx = shuffle(r, it.o.map((_, i) => i)); return { q: it.q, o: idx.map(i => it.o[i]), a: idx.indexOf(it.a), e: it.e }; };

  const APT = [
    r => { const p = pick(r, [10, 15, 20, 25, 30, 40, 60, 75]), y = int(r, 2, 20) * 20, a = p * y / 100; return { q: `What is ${p}% of ${y}?`, ...num(r, a), e: `${p}/100 × ${y} = ${a}` }; },
    r => { const cp = int(r, 2, 20) * 100, p = pick(r, [10, 20, 25, 40, 50]), a = cp * (100 + p) / 100; return { q: `An article bought for ₹${cp} is sold at a ${p}% profit. Find the selling price (₹).`, ...num(r, a), e: `SP = ${cp} × ${100 + p}/100 = ${a}` }; },
    r => { const [x, y] = pick(r, [[10, 15], [12, 6], [20, 30], [12, 4], [30, 45], [18, 9], [24, 8], [20, 5]]), a = x * y / (x + y); return { q: `A can finish a job in ${x} days and B in ${y} days. Working together, in how many days will they finish it?`, ...num(r, a), e: `Together = ${x}×${y}/(${x}+${y}) = ${a} days` }; },
    r => { const s = pick(r, [36, 54, 72, 90]), v = s * 5 / 18, t = pick(r, [6, 8, 10, 12]), L = v * t; return { q: `A ${L} m long train crosses a pole in ${t} seconds. What is its speed in km/h?`, ...num(r, s), e: `Speed = ${L}/${t} = ${v} m/s = ${v} × 18/5 = ${s} km/h` }; },
    r => { const P = int(r, 1, 10) * 1000, R = pick(r, [5, 8, 10, 12]), t = pick(r, [2, 3, 4, 5]), a = P * R * t / 100; return { q: `Find the simple interest (₹) on ₹${P} at ${R}% per annum for ${t} years.`, ...num(r, a), e: `SI = ${P}×${R}×${t}/100 = ${a}` }; },
    r => { const [x, y] = pick(r, [[2, 3], [3, 5], [1, 4], [3, 7], [2, 5]]), T = (x + y) * int(r, 1, 9) * 10, a = Math.max(x, y) * T / (x + y); return { q: `₹${T} is divided in the ratio ${x}:${y}. What is the bigger share (₹)?`, ...num(r, a), e: `Bigger share = ${Math.max(x, y)}/${x + y} × ${T} = ${a}` }; },
    r => { const m = int(r, 10, 50), n = m + int(r, 1, 6), x = 5 * n - 4 * m; return { q: `The average of 4 numbers is ${m}. When a fifth number ${x} is added, what is the new average?`, ...num(r, n), e: `(4×${m} + ${x})/5 = ${n}` }; }
  ];

  const sr = [
    r => { const s = int(r, 2, 20), d = int(r, 3, 9), t = [0, 1, 2, 3, 4].map(i => s + i * d), a = s + 5 * d; return { q: `Find the next number: ${t.join(', ')}, ?`, ...num(r, a), e: `Add ${d} each time → ${a}` }; },
    r => { const s = pick(r, [2, 3, 5]), q = pick(r, [2, 3]), t = [0, 1, 2, 3].map(i => s * q ** i), a = s * q ** 4; return { q: `Find the next number: ${t.join(', ')}, ?`, ...num(r, a), e: `Multiply by ${q} each time → ${a}` }; },
    r => { const n = int(r, 2, 6), k = pick(r, [0, 1, 2]), t = [0, 1, 2, 3].map(i => (n + i) ** 2 + k), a = (n + 4) ** 2 + k; return { q: `Find the next number: ${t.join(', ')}, ?`, ...num(r, a), e: `Terms are n²${k ? '+' + k : ''} for n=${n}, ${n + 1}… → ${a}` }; },
    r => { const s = int(r, 1, 10), d = int(r, 1, 4), t = [s]; for (let i = 0; i < 5; i++) t.push(t[i] + d + i); return { q: `Find the next number: ${t.slice(0, 5).join(', ')}, ?`, ...num(r, t[5]), e: `Differences grow by 1: ${d}, ${d + 1}, ${d + 2}, ${d + 3}, ${d + 4} → ${t[5]}` }; }
  ];
  const shift = (w, k) => [...w].map(c => String.fromCharCode((c.charCodeAt(0) - 65 + k + 26) % 26 + 65)).join('');
  const REA = [
    r => sr[0](r), r => sr[int(r, 1, 3)](r),
    r => { const w = pick(r, ['CODE', 'TEAM', 'JAVA', 'DATA', 'NODE', 'BYTE', 'HASH', 'TREE']), k = int(r, 1, 3), c = shift(w, k); return { q: `In a code, each letter is replaced by the letter ${k} place${k > 1 ? 's' : ''} ahead in the alphabet. How is ${w} written?`, ...txt(r, c, [shift(w, k + 1), shift(w, k + 2), shift(w, -k), [...c].reverse().join('')]), e: `Shift every letter by +${k}: ${w} → ${c}` }; },
    r => { const [d, h] = pick(r, [[3, 4], [6, 8], [5, 12], [8, 6]]), z = int(r, 1, 4), x = d + z, a = Math.hypot(d, h); return { q: `Ravi walks ${x} km north, ${h} km east, then ${z} km south. How far is he from the start (km)?`, ...num(r, a), e: `Net north = ${x}−${z} = ${d}; east = ${h}; distance = √(${d}²+${h}²) = ${a}` }; },
    r => fromBank(r, pick(r, D.BLOOD))
  ];
  const ban = { apt: APT, rea: REA };

  function quiz(id, date, dayNum) {
    const r = rng(hash(date + id));
    if (id === 'ver') return shuffle(r, D.VER.map((_, i) => i)).slice(0, 5).map(i => fromBank(r, D.VER[i]));
    if (id === 'rea') {
      const out = [];
      for (let n = 0; n < 8; n++) out.push(REA[n % REA.length](r));
      return out;
    }
    const order = shuffle(r, APT.map((_, i) => i));
    const out = [];
    for (let n = 0; n < 8; n++) out.push(APT[order[n % order.length]](r));
    return out;
  }
  return { quiz };
})();
if (typeof module !== 'undefined') module.exports = GEN;
