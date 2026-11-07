// Grades 10–12: US Geometry / Algebra 2 / Precalculus / AP Calculus, Taiwan 高中 (高一–高三, 數A/數B/數甲/數乙),
// AoPS Intro Geometry, Intermediate Algebra, Intermediate Counting & Probability, Precalculus, Calculus, AMC 10/12.
import {
  T, gcd, lcm, C, P, fact, sum, clean, num, numText, sgn, par, red, fracText, frac as ufrac, fracR, fadd, fsub, fmul, fdiv,
  pow, sqrt, simpRoot, rad, radText, term, poly, lin, polyText, pmul, uniq, ansNum, ansFrac, ansSet, ansPair, ansChoice,
} from '../util.js';
import { grid, shape } from '../draw.js';

// ---------------- shared helpers ----------------
const NAMES = [['小明', 'Max'], ['小美', 'Mia'], ['阿傑', 'Jay'], ['欣怡', 'Emma'], ['志豪', 'Leo'], ['雅婷', 'Ava'], ['家豪', 'Ethan'], ['佳穎', 'Chloe']];
const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]];
// fraction; numbers go through util (sign out front), strings are stacked as given
const fmtN = (x) => (typeof x === 'number' ? num(x) : x);
const frac = (n, d) => (typeof n === 'number' && typeof d === 'number' ? ufrac(n, d) : `<span class="fr"><span>${fmtN(n)}</span><span>${fmtN(d)}</span></span>`);
// right answer first; drop duplicates; keep up to 4
const choice = (right, wrongs) => ansChoice(uniq([right, ...wrongs], 4));
const fr = (f) => fracR(f[0], f[1]);
const frP = (f) => (f[0] < 0 ? `(${fr(f)})` : fr(f));
const ft = (f) => fracText(f[0], f[1]);
// k√r / d, simplified
function radRed(k, r, d = 1) {
  if (k === 0 || r === 0) return [0, 1, 1];
  const [m, s] = simpRoot(r); k *= m; r = s;
  if (d < 0) { k = -k; d = -d; }
  const g = gcd(k, d); return [k / g, r, d / g];
}
function radF(k, r, d = 1) {
  [k, r, d] = radRed(k, r, d);
  const top = rad(Math.abs(k), r), s = k < 0 ? '−' : '';
  return d === 1 ? s + top : `${s}<span class="fr"><span>${top}</span><span>${num(d)}</span></span>`;
}
function radFT(k, r, d = 1) { [k, r, d] = radRed(k, r, d); const top = radText(k, r); return d === 1 ? top : `${top}/${d}`; }
const ansRad = (k, r, d = 1) => { const [a, b, c] = radRed(k, r, d); return { type: 'num', v: (a * Math.sqrt(b)) / c, text: radFT(a, b, c) }; };
// nπ / d
function piF(n, d = 1) {
  [n, d] = red(n, d); if (n === 0) return '0';
  const top = `${Math.abs(n) === 1 ? '' : num(Math.abs(n))}π`;
  return (n < 0 ? '−' : '') + (d === 1 ? top : `<span class="fr"><span>${top}</span><span>${num(d)}</span></span>`);
}
function piT(n, d = 1) { [n, d] = red(n, d); const top = `${n === 1 ? '' : n === -1 ? '-' : n}π`; return d === 1 ? top : `${top}/${d}`; }
const ansPi = (n, d = 1) => ({ type: 'num', v: (n / d) * Math.PI, text: piT(n, d) });
// exact values of trig functions
const EXACT = [[0, '0'], [0.5, frac(1, 2)], [Math.SQRT2 / 2, radF(1, 2, 2)], [Math.sqrt(3) / 2, radF(1, 3, 2)], [1, '1'], [Math.sqrt(3) / 3, radF(1, 3, 3)], [Math.sqrt(3), rad(1, 3)]];
function exact(v) {
  const a = Math.abs(v);
  for (const [x, h] of EXACT) if (Math.abs(a - x) < 1e-9) return x === 0 ? '0' : (v < 0 ? '−' : '') + h;
  throw new Error('no exact value for ' + v);
}
const D2R = Math.PI / 180;
const trigV = (f, deg) => { const c = clean(Math.cos(deg * D2R), 12), s = clean(Math.sin(deg * D2R), 12); return f === 'sin' ? s : f === 'cos' ? c : s / c; };
// "ax + by + c" with real minus signs
function linXY(cs, vars = ['x', 'y', '']) { let s = ''; cs.forEach((c, i) => { if (c) s += term(c, vars[i], vars[i] ? 1 : 0, s === ''); }); return s || '0'; }
// (x − h)²
const sq = (v, h) => (h === 0 ? `${v}<sup>2</sup>` : `(${v} ${sgn(-h)})<sup>2</sup>`);
const vec = (a) => `(${a.map(num).join(', ')})`;
const V = (n) => `<b>${n}</b>`;
const dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);
const SIG = (lo, hi) => `<span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1;margin:0 .15em"><small>${hi}</small><span style="font-size:1.5em">∑</span><small>${lo}</small></span>`;
const INT = (a, b) => `<span style="display:inline-flex;align-items:center;vertical-align:middle"><span style="font-size:1.6em">∫</span><span style="display:inline-flex;flex-direction:column;line-height:1.1;font-size:.75em"><span>${b}</span><span>${a}</span></span></span>`;
const LIM = (sub) => `<span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1.1;margin-right:.2em"><span>lim</span><small>${sub}</small></span>`;
function mat(m) {
  const cols = m[0].length;
  return `<span style="display:inline-flex;align-items:stretch;vertical-align:middle;margin:0 .15em"><span style="border:1.5px solid currentColor;border-right:0;width:5px"></span><span style="display:inline-grid;grid-template-columns:repeat(${cols},auto);gap:2px 12px;padding:2px 6px;text-align:center">${m.flat().map((x) => `<span>${typeof x === 'number' ? num(x) : x}</span>`).join('')}</span><span style="border:1.5px solid currentColor;border-left:0;width:5px"></span></span>`;
}
const table = (rows) => `<table style="border-collapse:collapse;margin:6px 0">${rows.map((row, i) => `<tr>${row.map((c, j) => `<${i === 0 || j === 0 ? 'th' : 'td'} style="border:1px solid currentColor;padding:3px 10px;text-align:center">${c}</${i === 0 || j === 0 ? 'th' : 'td'}>`).join('')}</tr>`).join('')}</table>`;
// evaluate a polynomial (coefficients highest first)
const pev = (cs, x) => cs.reduce((s, c) => s * x + c, 0);
const pder = (cs) => { const n = cs.length - 1; return cs.slice(0, -1).map((c, i) => c * (n - i)); };
const deg = (x) => `${num(x)}°`;

// ---- figures ----
const RA = '<polyline points="30,126 44,126 44,140" fill="none" class="f-line"/>';
function triTheta(bottom, left, hyp) {
  return shape([[30, 20], [30, 140], [190, 140]], [{ x: 110, y: 157, s: bottom }, { x: 14, y: 80, s: left }, { x: 122, y: 70, s: hyp }, { x: 162, y: 131, s: 'θ', acc: true }], 220, 170, RA);
}
function tri3060(shortL, longL, hyp) {
  return shape([[30, 60], [30, 140], [169, 140]], [{ x: 14, y: 100, s: shortL }, { x: 100, y: 158, s: longL }, { x: 112, y: 88, s: hyp }, { x: 140, y: 131, s: '30°', acc: true }, { x: 44, y: 80, s: '60°', acc: true }], 220, 170, RA);
}
function tri45(leg1, leg2, hyp) {
  return shape([[30, 30], [30, 140], [140, 140]], [{ x: 14, y: 85, s: leg1 }, { x: 85, y: 158, s: leg2 }, { x: 98, y: 78, s: hyp }, { x: 116, y: 131, s: '45°', acc: true }, { x: 42, y: 56, s: '45°', acc: true }], 200, 170, RA);
}
function sectorFig(dg, rl) {
  const cx = 80, cy = 75, R = 60, a = dg * D2R, f = (x) => x.toFixed(2);
  const x2 = cx + R * Math.cos(a), y2 = cy - R * Math.sin(a), h = a / 2;
  return `<svg class="fig" viewBox="0 0 160 150" width="160" height="150" role="img"><circle cx="${cx}" cy="${cy}" r="${R}" class="f-soft"/>` +
    `<path d="M${cx},${cy} L${cx + R},${cy} A${R},${R} 0 ${dg > 180 ? 1 : 0} 0 ${f(x2)},${f(y2)} Z" class="f-accfill" fill-opacity="0.55"/>` +
    `<text x="${f(cx + 22 * Math.cos(h))}" y="${f(cy - 22 * Math.sin(h))}" text-anchor="middle" dominant-baseline="middle" class="f-txt" font-size="12">${dg}°</text>` +
    `<text x="${cx + 30}" y="${cy + 12}" text-anchor="middle" class="f-txt" font-size="12">${rl}</text></svg>`;
}
// points on a circle (degrees) with labels; segments between labels
function circFig(pts, segs, center = true) {
  const cx = 85, cy = 80, R = 62, P2 = {};
  for (const [k, dgr] of Object.entries(pts)) P2[k] = [cx + R * Math.cos(dgr * D2R), cy - R * Math.sin(dgr * D2R)];
  if (center) P2.O = [cx, cy];
  let s = `<circle cx="${cx}" cy="${cy}" r="${R}" class="f-soft"/>`;
  for (const [a, b] of segs) s += `<line x1="${P2[a][0].toFixed(1)}" y1="${P2[a][1].toFixed(1)}" x2="${P2[b][0].toFixed(1)}" y2="${P2[b][1].toFixed(1)}" class="f-line" stroke-width="1.5"/>`;
  for (const [k, [x, y]] of Object.entries(P2)) {
    const dx = k === 'O' ? 10 : ((x - cx) / R) * 12, dy = k === 'O' ? 10 : ((y - cy) / R) * 12;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5" class="f-dot"/><text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="middle" dominant-baseline="middle" class="f-txt" font-size="12">${k}</text>`;
  }
  return `<svg class="fig" viewBox="0 0 170 165" width="170" height="165" role="img">${s}</svg>`;
}

export default [
  // =====================================================================================
  // GRADE 10
  // =====================================================================================
  {
    id: 'g10-trig-ratio',
    grade: 10,
    name: T('直角三角形的三角比', 'Trig ratios in right triangles (SOH-CAH-TOA)'),
    cur: { us: 'Geometry · G-SRT.C.6–8', tw: '高一 三角比（直角三角形）', aops: 'Intro Geometry' },
    at: { tw: 10 },
    gen(r) {
      const [p0, q0, h0] = r.pick(TRIPLES), k = r.int(1, 3);
      let [a, b] = r.chance(0.5) ? [p0, q0] : [q0, p0]; a *= k; b *= k; const c = h0 * k;
      const fn = r.pick(['sin', 'cos', 'tan']);
      const rat = fn === 'sin' ? [b, c] : fn === 'cos' ? [a, c] : [b, a];
      const nameZ = { sin: '對邊 ÷ 斜邊', cos: '鄰邊 ÷ 斜邊', tan: '對邊 ÷ 鄰邊' }[fn], nameE = { sin: 'opposite ÷ hypotenuse', cos: 'adjacent ÷ hypotenuse', tan: 'opposite ÷ adjacent' }[fn];
      const t = r.int(0, 2);
      if (t === 0) {
        const miss = r.pick(['a', 'b', 'c']);
        const fig = triTheta(miss === 'a' ? 'x' : a, miss === 'b' ? 'x' : b, miss === 'c' ? 'x' : c);
        const py = miss === 'c' ? T(`先用畢氏定理求斜邊：x = ${sqrt(`${a}<sup>2</sup> + ${b}<sup>2</sup>`)} = ${sqrt(a * a + b * b)} = ${c}。`, `First use the Pythagorean theorem for the hypotenuse: x = ${sqrt(`${a}<sup>2</sup> + ${b}<sup>2</sup>`)} = ${sqrt(a * a + b * b)} = ${c}.`)
          : T(`先用畢氏定理求缺少的股：x = ${sqrt(`${c}<sup>2</sup> − ${miss === 'a' ? b : a}<sup>2</sup>`)} = ${sqrt(c * c - (miss === 'a' ? b : a) ** 2)} = ${miss === 'a' ? a : b}。`, `First use the Pythagorean theorem for the missing leg: x = ${sqrt(`${c}<sup>2</sup> − ${miss === 'a' ? b : a}<sup>2</sup>`)} = ${sqrt(c * c - (miss === 'a' ? b : a) ** 2)} = ${miss === 'a' ? a : b}.`);
        return {
          q: T(`如圖的直角三角形，求 ${fn} θ。（用最簡分數回答）`, `For the right triangle shown, find ${fn} θ. (Answer as a fraction in lowest terms.)`),
          fig, ans: ansFrac(...rat),
          sol: [
            py,
            T(`對角 θ 而言：對邊 = ${b}，鄰邊 = ${a}，斜邊 = ${c}。`, `Relative to θ: opposite = ${b}, adjacent = ${a}, hypotenuse = ${c}.`),
            T(`${fn} θ = ${nameZ} = ${frac(...rat)}。`, `${fn} θ = ${nameE} = ${frac(...rat)}.`),
            T(`約分得 ${fr(rat)}。`, `Reduce: ${fn} θ = ${fr(rat)}.`),
          ],
          hint: T('SOH-CAH-TOA：sin = 對/斜，cos = 鄰/斜，tan = 對/鄰。', 'SOH-CAH-TOA: sin = opp/hyp, cos = adj/hyp, tan = opp/adj.'),
        };
      }
      if (t === 1) {
        // given sin θ (or cos θ), find another ratio
        const giv = r.pick(['sin', 'cos']), want = giv === 'sin' ? r.pick(['cos', 'tan']) : r.pick(['sin', 'tan']);
        const [o, ad, hy] = [q0, p0, h0];
        const gv = giv === 'sin' ? [o, hy] : [ad, hy], wv = want === 'sin' ? [o, hy] : want === 'cos' ? [ad, hy] : [o, ad];
        const known = giv === 'sin' ? o : ad, other = giv === 'sin' ? ad : o;
        return {
          q: T(`θ 是銳角，且 ${giv} θ = ${frac(...gv)}。求 ${want} θ。（用最簡分數回答）`, `θ is an acute angle and ${giv} θ = ${frac(...gv)}. Find ${want} θ. (Answer as a fraction in lowest terms.)`),
          fig: triTheta(giv === 'cos' ? ad : '?', giv === 'sin' ? o : '?', hy),
          ans: ansFrac(...wv),
          sol: [
            T(`畫一個直角三角形：${giv === 'sin' ? '對邊' : '鄰邊'} = ${known}，斜邊 = ${hy}。`, `Draw a right triangle with ${giv === 'sin' ? 'opposite' : 'adjacent'} side ${known} and hypotenuse ${hy}.`),
            T(`畢氏定理求第三邊：${sqrt(`${hy}<sup>2</sup> − ${known}<sup>2</sup>`)} = ${sqrt(hy * hy - known * known)} = ${other}。`, `Pythagorean theorem gives the third side: ${sqrt(`${hy}<sup>2</sup> − ${known}<sup>2</sup>`)} = ${sqrt(hy * hy - known * known)} = ${other}.`),
            T(`所以對邊 = ${o}，鄰邊 = ${ad}，斜邊 = ${hy}，${want} θ = ${frac(...wv)}。`, `So opposite = ${o}, adjacent = ${ad}, hypotenuse = ${hy}, and ${want} θ = ${frac(...wv)}.`),
            T(`θ 是銳角，所以三角比都是正的。答案 ${fr(wv)}。`, `θ is acute, so every ratio is positive. Answer: ${fr(wv)}.`),
          ],
        };
      }
      const n = r.pick(NAMES);
      const ask = r.pick(['cos', 'tan', 'sin']);
      const av = ask === 'cos' ? [a, c] : ask === 'tan' ? [b, a] : [b, c];
      return {
        q: T(`${n[0]}把一支長 ${c} 公尺的梯子靠在垂直的牆上，梯腳離牆 ${a} 公尺。設梯子與地面的夾角為 θ，求 ${ask} θ。（用最簡分數回答）`,
          `${n[1]} leans a ${c} m ladder against a vertical wall. The foot of the ladder is ${a} m from the wall. Let θ be the angle between the ladder and the ground. Find ${ask} θ. (Answer as a fraction in lowest terms.)`),
        fig: triTheta(`${a} m`, '?', `${c} m`),
        ans: ansFrac(...av),
        sol: [
          T(`梯子、牆、地面形成直角三角形：斜邊（梯子）= ${c}，θ 的鄰邊（地面）= ${a}。`, `The ladder, wall and ground form a right triangle: hypotenuse (ladder) = ${c}, side adjacent to θ (ground) = ${a}.`),
          T(`梯子碰到牆的高度（對邊）= ${sqrt(`${c}<sup>2</sup> − ${a}<sup>2</sup>`)} = ${sqrt(c * c - a * a)} = ${b} 公尺。`, `Height on the wall (opposite side) = ${sqrt(`${c}<sup>2</sup> − ${a}<sup>2</sup>`)} = ${sqrt(c * c - a * a)} = ${b} m.`),
          T(`${ask} θ = ${frac(...av)} = ${fr(av)}。`, `${ask} θ = ${frac(...av)} = ${fr(av)}.`),
        ],
      };
    },
  },
  {
    id: 'g10-special-tri',
    grade: 10,
    name: T('特殊直角三角形與精確值', 'Special right triangles and exact values'),
    cur: { us: 'Geometry · G-SRT.C.6', tw: '高一 三角比（特別角）', aops: 'Intro Geometry' },
    gen(r) {
      const t = r.int(0, 2);
      if (t === 0) {
        // 45-45-90
        const n = r.int(2, 12), mode = r.int(0, 2);
        if (mode === 0) return {
          q: T(`等腰直角三角形的一股長 ${n}，求斜邊 x。（用最簡根式）`, `An isosceles right triangle has legs of length ${n}. Find the hypotenuse x. (Simplest radical form.)`),
          fig: tri45(n, n, 'x'), ans: ansRad(n, 2),
          sol: [
            T('45°-45°-90° 三角形的三邊比為 1 : 1 : √2。', 'The sides of a 45°-45°-90° triangle are in the ratio 1 : 1 : √2.'),
            T(`斜邊 = 股 × √2 = ${n} × √2 = ${rad(n, 2)}。`, `Hypotenuse = leg × √2 = ${n} × √2 = ${rad(n, 2)}.`),
            T(`驗算：${n}<sup>2</sup> + ${n}<sup>2</sup> = ${2 * n * n} = (${rad(n, 2)})<sup>2</sup>。`, `Check: ${n}<sup>2</sup> + ${n}<sup>2</sup> = ${2 * n * n} = (${rad(n, 2)})<sup>2</sup>.`),
          ],
        };
        if (mode === 1) return {
          q: T(`等腰直角三角形的斜邊長 ${rad(n, 2)}，求一股的長 x。`, `An isosceles right triangle has hypotenuse ${rad(n, 2)}. Find the length x of a leg.`),
          fig: tri45('x', 'x', rad(n, 2)), ans: ansNum(n),
          sol: [
            T('45°-45°-90° 三角形：斜邊 = 股 × √2，所以 股 = 斜邊 ÷ √2。', 'In a 45°-45°-90° triangle, hypotenuse = leg × √2, so leg = hypotenuse ÷ √2.'),
            T(`x = ${rad(n, 2)} ÷ √2 = ${n}。`, `x = ${rad(n, 2)} ÷ √2 = ${n}.`),
          ],
        };
        const m = 2 * n;
        return {
          q: T(`等腰直角三角形的斜邊長 ${m}，求一股的長 x。（用最簡根式）`, `An isosceles right triangle has hypotenuse ${m}. Find the length x of a leg. (Simplest radical form.)`),
          fig: tri45('x', 'x', m), ans: ansRad(n, 2),
          sol: [
            T('股 = 斜邊 ÷ √2。', 'Leg = hypotenuse ÷ √2.'),
            T(`x = ${frac(m, '√2')}，分母有理化：${frac(m, '√2')} × ${frac('√2', '√2')} = ${frac(`${m}√2`, 2)} = ${rad(n, 2)}。`, `x = ${frac(m, '√2')}; rationalize: ${frac(m, '√2')} × ${frac('√2', '√2')} = ${frac(`${m}√2`, 2)} = ${rad(n, 2)}.`),
            T(`驗算：2 × (${rad(n, 2)})<sup>2</sup> = ${4 * n * n} = ${m}<sup>2</sup>。`, `Check: 2 × (${rad(n, 2)})<sup>2</sup> = ${4 * n * n} = ${m}<sup>2</sup>.`),
          ],
        };
      }
      if (t === 1) {
        // 30-60-90
        const n = r.int(2, 10), mode = r.int(0, 3);
        const base = [
          T('30°-60°-90° 三角形的三邊比為 1 : √3 : 2（短股 : 長股 : 斜邊），短股對 30°。', 'A 30°-60°-90° triangle has sides in the ratio 1 : √3 : 2 (short leg : long leg : hypotenuse); the short leg is opposite 30°.'),
        ];
        if (mode === 0) return {
          q: T(`30°-60°-90° 三角形的短股長 ${n}，求長股 x。（用最簡根式）`, `A 30°-60°-90° triangle has short leg ${n}. Find the long leg x. (Simplest radical form.)`),
          fig: tri3060(n, 'x', '?'), ans: ansRad(n, 3),
          sol: [...base, T(`長股 = 短股 × √3 = ${n}√3。`, `Long leg = short leg × √3 = ${n}√3.`), T(`（斜邊 = 2 × ${n} = ${2 * n}，驗算：${n * n} + ${3 * n * n} = ${4 * n * n} = ${2 * n}<sup>2</sup>。）`, `(Hypotenuse = 2 × ${n} = ${2 * n}; check: ${n * n} + ${3 * n * n} = ${4 * n * n} = ${2 * n}<sup>2</sup>.)`)],
        };
        if (mode === 1) return {
          q: T(`30°-60°-90° 三角形的斜邊長 ${2 * n}，求長股 x。（用最簡根式）`, `A 30°-60°-90° triangle has hypotenuse ${2 * n}. Find the long leg x. (Simplest radical form.)`),
          fig: tri3060('?', 'x', 2 * n), ans: ansRad(n, 3),
          sol: [...base, T(`短股 = 斜邊 ÷ 2 = ${n}。`, `Short leg = hypotenuse ÷ 2 = ${n}.`), T(`長股 = 短股 × √3 = ${rad(n, 3)}。`, `Long leg = short leg × √3 = ${rad(n, 3)}.`)],
        };
        if (mode === 2) return {
          q: T(`30°-60°-90° 三角形的長股長 ${rad(n, 3)}，求斜邊 x。`, `A 30°-60°-90° triangle has long leg ${rad(n, 3)}. Find the hypotenuse x.`),
          fig: tri3060('?', rad(n, 3), 'x'), ans: ansNum(2 * n),
          sol: [...base, T(`短股 = 長股 ÷ √3 = ${n}。`, `Short leg = long leg ÷ √3 = ${n}.`), T(`斜邊 = 2 × 短股 = ${2 * n}。`, `Hypotenuse = 2 × short leg = ${2 * n}.`)],
        };
        const L = 3 * n;
        return {
          q: T(`30°-60°-90° 三角形的長股長 ${L}，求短股 x。（用最簡根式）`, `A 30°-60°-90° triangle has long leg ${L}. Find the short leg x. (Simplest radical form.)`),
          fig: tri3060('x', L, '?'), ans: ansRad(n, 3),
          sol: [...base, T(`短股 = 長股 ÷ √3 = ${frac(L, '√3')}。`, `Short leg = long leg ÷ √3 = ${frac(L, '√3')}.`), T(`分母有理化：${frac(L, '√3')} × ${frac('√3', '√3')} = ${frac(`${L}√3`, 3)} = ${rad(n, 3)}。`, `Rationalize: ${frac(L, '√3')} × ${frac('√3', '√3')} = ${frac(`${L}√3`, 3)} = ${rad(n, 3)}.`)],
        };
      }
      // exact values
      const f = r.pick(['sin', 'cos', 'tan']), a = r.pick([30, 45, 60]);
      const v = trigV(f, a);
      const wr = [];
      for (const g of ['sin', 'cos', 'tan']) for (const b of [30, 45, 60]) wr.push(exact(trigV(g, b)));
      const opts = uniq([exact(v), ...r.shuffle(wr)], 4);
      return {
        q: T(`${f} ${a}° 的精確值是多少？`, `What is the exact value of ${f} ${a}°?`),
        fig: a === 45 ? tri45(1, 1, '√2') : tri3060(1, '√3', 2),
        ans: ansChoice(opts),
        sol: [
          a === 45 ? T('用 45°-45°-90° 三角形：兩股 1、1，斜邊 √2。', 'Use the 45°-45°-90° triangle with legs 1, 1 and hypotenuse √2.')
            : T('用 30°-60°-90° 三角形：短股 1（對 30°），長股 √3（對 60°），斜邊 2。', 'Use the 30°-60°-90° triangle: short leg 1 (opposite 30°), long leg √3 (opposite 60°), hypotenuse 2.'),
          T(`${f} = ${f === 'sin' ? '對邊/斜邊' : f === 'cos' ? '鄰邊/斜邊' : '對邊/鄰邊'}。`, `${f} = ${f === 'sin' ? 'opposite/hypotenuse' : f === 'cos' ? 'adjacent/hypotenuse' : 'opposite/adjacent'}.`),
          T(`所以 ${f} ${a}° = ${exact(v)}${f === 'tan' && a !== 45 ? '（已分母有理化）' : ''}。`, `So ${f} ${a}° = ${exact(v)}${f === 'tan' && a !== 45 ? ' (denominator rationalized)' : ''}.`),
        ],
      };
    },
  },
  {
    id: 'g10-trig-solve',
    grade: 10,
    name: T('用三角比求邊長（仰角、坡道）', 'Solving right triangles: elevation, ramps, kites'),
    cur: { us: 'Geometry · G-SRT.C.8', tw: '高一 三角比的應用' },
    gen(r) {
      const th = r.int(15, 70), n = r.pick(NAMES);
      const tb = { sin: +Math.sin(th * D2R).toFixed(4), cos: +Math.cos(th * D2R).toFixed(4), tan: +Math.tan(th * D2R).toFixed(4) };
      const t = r.int(0, 3);
      const r1 = (x) => Math.round(clean(x * 10)) / 10;
      let q, f, given, ans, setup;
      if (t === 0) {
        const d = r.int(10, 60); f = 'tan'; given = d; ans = r1(d * tb.tan);
        q = T(`${n[0]}站在離大樓 ${d} 公尺的地方，看大樓頂端的仰角是 ${th}°。大樓高多少公尺（忽略眼睛高度）？已知 tan ${th}° ≈ ${tb.tan}，答案四捨五入到小數第一位。`,
          `${n[1]} stands ${d} m from a building. The angle of elevation to the top is ${th}°. How tall is the building (ignore eye height)? Use tan ${th}° ≈ ${tb.tan} and round to the nearest tenth.`);
        setup = [T(`高度是 ${th}° 的對邊，${d} 公尺是鄰邊，所以用 tan：tan ${th}° = 高 ÷ ${d}。`, `The height is opposite ${th}°, and ${d} m is adjacent, so use tan: tan ${th}° = height ÷ ${d}.`),
          T(`高 = ${d} × tan ${th}° ≈ ${d} × ${tb.tan} = ${clean(d * tb.tan)}。`, `Height = ${d} × tan ${th}° ≈ ${d} × ${tb.tan} = ${clean(d * tb.tan)}.`)];
      } else if (t === 1) {
        const L = r.int(4, 30); f = 'sin'; ans = r1(L * tb.sin);
        q = T(`一條長 ${L} 公尺的坡道與地面成 ${th}°。坡道的頂端離地多高？已知 sin ${th}° ≈ ${tb.sin}，四捨五入到小數第一位。`,
          `A ramp ${L} m long makes an angle of ${th}° with the ground. How high is the top of the ramp? Use sin ${th}° ≈ ${tb.sin} and round to the nearest tenth.`);
        setup = [T(`坡道是斜邊，高度是對邊，所以用 sin：sin ${th}° = 高 ÷ ${L}。`, `The ramp is the hypotenuse and the height is opposite, so use sin: sin ${th}° = height ÷ ${L}.`),
          T(`高 = ${L} × ${tb.sin} = ${clean(L * tb.sin)}。`, `Height = ${L} × ${tb.sin} = ${clean(L * tb.sin)}.`)];
      } else if (t === 2) {
        const L = r.int(20, 90); f = 'cos'; ans = r1(L * tb.cos);
        q = T(`風箏線拉直長 ${L} 公尺，與地面夾角 ${th}°。風箏正下方的點離${n[0]}多遠？已知 cos ${th}° ≈ ${tb.cos}，四捨五入到小數第一位。`,
          `A kite string is pulled straight, ${L} m long, at ${th}° to the ground. How far is ${n[1]} from the point directly below the kite? Use cos ${th}° ≈ ${tb.cos} and round to the nearest tenth.`);
        setup = [T(`線是斜邊，水平距離是鄰邊，所以用 cos：cos ${th}° = 距離 ÷ ${L}。`, `The string is the hypotenuse; the ground distance is adjacent, so use cos: cos ${th}° = distance ÷ ${L}.`),
          T(`距離 = ${L} × ${tb.cos} = ${clean(L * tb.cos)}。`, `Distance = ${L} × ${tb.cos} = ${clean(L * tb.cos)}.`)];
      } else {
        const h = r.int(5, 40); f = 'tan'; ans = r1(h / tb.tan);
        q = T(`直角三角形中，角 θ = ${th}° 的對邊長 ${h}，求 θ 的鄰邊長。已知 tan ${th}° ≈ ${tb.tan}，四捨五入到小數第一位。`,
          `In a right triangle, the side opposite θ = ${th}° is ${h}. Find the side adjacent to θ. Use tan ${th}° ≈ ${tb.tan} and round to the nearest tenth.`);
        setup = [T(`tan θ = 對邊 ÷ 鄰邊，所以 鄰邊 = 對邊 ÷ tan θ。`, `tan θ = opposite ÷ adjacent, so adjacent = opposite ÷ tan θ.`),
          T(`鄰邊 = ${h} ÷ ${tb.tan} ≈ ${(h / tb.tan).toFixed(4)}。`, `Adjacent = ${h} ÷ ${tb.tan} ≈ ${(h / tb.tan).toFixed(4)}.`)];
      }
      return {
        q, ans: ansNum(ans),
        sol: [T('先判斷已知邊和所求邊相對於角是「對邊、鄰邊、斜邊」中的哪兩個，再選三角比。', 'First decide which two sides (opposite, adjacent, hypotenuse) are involved, then pick the ratio.'), ...setup,
          T(`四捨五入到小數第一位：${num(ans)}。`, `Round to the nearest tenth: ${num(ans)}.`)],
        hint: T(`這題用 ${f}。`, `This one uses ${f}.`),
      };
    },
  },
  {
    id: 'g10-dist-mid',
    grade: 10,
    name: T('距離公式與中點', 'Distance and midpoint formulas'),
    cur: { us: 'Geometry · G-GPE.B.7', tw: '高一 直線與圓（坐標平面）', aops: 'Intro Geometry' },
    gen(r) {
      const t = r.int(0, 3);
      const x1 = r.int(-6, 6), y1 = r.int(-6, 6);
      let x2, y2; do { x2 = r.int(-6, 6); y2 = r.int(-6, 6); } while (x2 === x1 || y2 === y1);
      const dx = x2 - x1, dy = y2 - y1;
      if (t === 0) {
        const d2 = dx * dx + dy * dy, [k, s] = simpRoot(d2);
        return {
          q: T(`求點 A(${num(x1)}, ${num(y1)}) 和 B(${num(x2)}, ${num(y2)}) 的距離。（用最簡根式）`, `Find the distance between A(${num(x1)}, ${num(y1)}) and B(${num(x2)}, ${num(y2)}). (Simplest radical form.)`),
          fig: grid(7, [{ x: x1, y: y1, label: 'A' }, { x: x2, y: y2, label: 'B' }]),
          ans: ansRad(1, d2),
          sol: [
            T('距離公式：AB = √[(x₂ − x₁)² + (y₂ − y₁)²]（就是畢氏定理）。', 'Distance formula: AB = √[(x₂ − x₁)² + (y₂ − y₁)²] (the Pythagorean theorem).'),
            T(`x 差 = ${num(x2)} − ${par(x1)} = ${num(dx)}，y 差 = ${num(y2)} − ${par(y1)} = ${num(dy)}。`, `Change in x = ${num(x2)} − ${par(x1)} = ${num(dx)}, change in y = ${num(y2)} − ${par(y1)} = ${num(dy)}.`),
            T(`AB = ${sqrt(`${par(dx)}<sup>2</sup> + ${par(dy)}<sup>2</sup>`)} = ${sqrt(d2)}${k > 1 || s === 1 ? ` = ${rad(k, s)}` : ''}。`, `AB = ${sqrt(`${par(dx)}<sup>2</sup> + ${par(dy)}<sup>2</sup>`)} = ${sqrt(d2)}${k > 1 || s === 1 ? ` = ${rad(k, s)}` : ''}.`),
          ],
        };
      }
      if (t === 1) {
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        return {
          q: T(`求 A(${num(x1)}, ${num(y1)}) 與 B(${num(x2)}, ${num(y2)}) 的中點。答案寫成 (x, y)。`, `Find the midpoint of A(${num(x1)}, ${num(y1)}) and B(${num(x2)}, ${num(y2)}). Answer as (x, y).`),
          fig: grid(7, [{ x: x1, y: y1, label: 'A' }, { x: x2, y: y2, label: 'B' }]),
          ans: ansPair(mx, my),
          sol: [
            T('中點公式：M = ((x₁ + x₂)/2, (y₁ + y₂)/2)，就是兩個坐標分別取平均。', 'Midpoint formula: M = ((x₁ + x₂)/2, (y₁ + y₂)/2) — average each coordinate.'),
            T(`x：(${num(x1)} + ${par(x2)}) ÷ 2 = ${num(x1 + x2)} ÷ 2 = ${num(mx)}。`, `x: (${num(x1)} + ${par(x2)}) ÷ 2 = ${num(x1 + x2)} ÷ 2 = ${num(mx)}.`),
            T(`y：(${num(y1)} + ${par(y2)}) ÷ 2 = ${num(y1 + y2)} ÷ 2 = ${num(my)}。`, `y: (${num(y1)} + ${par(y2)}) ÷ 2 = ${num(y1 + y2)} ÷ 2 = ${num(my)}.`),
            T(`中點是 (${num(mx)}, ${num(my)})。`, `The midpoint is (${num(mx)}, ${num(my)}).`),
          ],
        };
      }
      if (t === 2) {
        const mx = r.int(-5, 5), my = r.int(-5, 5);
        let ax, ay; do { ax = r.int(-6, 6); ay = r.int(-6, 6); } while (ax === mx && ay === my);
        const bx = 2 * mx - ax, by = 2 * my - ay;
        return {
          q: T(`線段 AB 的中點是 M(${num(mx)}, ${num(my)})，A 點是 (${num(ax)}, ${num(ay)})。求 B 點坐標，寫成 (x, y)。`, `M(${num(mx)}, ${num(my)}) is the midpoint of segment AB and A = (${num(ax)}, ${num(ay)}). Find B. Answer as (x, y).`),
          ans: ansPair(bx, by),
          sol: [
            T('設 B = (x, y)。中點公式：(A 的 x + x) ÷ 2 = M 的 x，y 也一樣。', 'Let B = (x, y). Midpoint: (x of A + x) ÷ 2 = x of M, and the same for y.'),
            T(`(${num(ax)} + x) ÷ 2 = ${num(mx)} ⇒ x = 2 × ${par(mx)} − ${par(ax)} = ${num(bx)}。`, `(${num(ax)} + x) ÷ 2 = ${num(mx)} ⇒ x = 2 × ${par(mx)} − ${par(ax)} = ${num(bx)}.`),
            T(`(${num(ay)} + y) ÷ 2 = ${num(my)} ⇒ y = 2 × ${par(my)} − ${par(ay)} = ${num(by)}。`, `(${num(ay)} + y) ÷ 2 = ${num(my)} ⇒ y = 2 × ${par(my)} − ${par(ay)} = ${num(by)}.`),
            T(`B = (${num(bx)}, ${num(by)})。驗算：A、B 的平均正好是 M。`, `B = (${num(bx)}, ${num(by)}). Check: averaging A and B gives M.`),
          ],
        };
      }
      const [p, q, h] = r.pick(TRIPLES.slice(0, 3)), k = r.int(1, 3), n = r.pick(NAMES);
      const ex = r.int(-5, 5), ey = r.int(-5, 5), sx = r.sign(), sy = r.sign();
      const fx = ex + sx * p * k, fy = ey + sy * q * k;
      return {
        q: T(`地圖上每格 1 公里。${n[0]}家在 (${num(ex)}, ${num(ey)})，學校在 (${num(fx)}, ${num(fy)})。兩地的直線距離是幾公里？`, `On a map, each unit is 1 km. ${n[1]}'s home is at (${num(ex)}, ${num(ey)}) and the school is at (${num(fx)}, ${num(fy)}). What is the straight-line distance in km?`),
        ans: ansNum(h * k),
        sol: [
          T(`水平差 |${num(fx)} − ${par(ex)}| = ${p * k}，垂直差 |${num(fy)} − ${par(ey)}| = ${q * k}。`, `Horizontal change |${num(fx)} − ${par(ex)}| = ${p * k}, vertical change |${num(fy)} − ${par(ey)}| = ${q * k}.`),
          T(`距離 = ${sqrt(`${p * k}<sup>2</sup> + ${q * k}<sup>2</sup>`)} = ${sqrt((p * p + q * q) * k * k)} = ${h * k}。`, `Distance = ${sqrt(`${p * k}<sup>2</sup> + ${q * k}<sup>2</sup>`)} = ${sqrt((p * p + q * q) * k * k)} = ${h * k}.`),
          T(`答：${h * k} 公里。`, `Answer: ${h * k} km.`),
        ],
      };
    },
  },
  {
    id: 'g10-circle-eq',
    grade: 10,
    name: T('圓的方程式（圓心與半徑）', 'Equation of a circle: center and radius'),
    cur: { us: 'Geometry · G-GPE.A.1', tw: '高一 直線與圓（圓方程式）', aops: 'Intro Geometry' },
    gen(r) {
      const h = r.int(-6, 6), k = r.int(-6, 6), t = r.int(0, 3);
      const std = (R2) => `${sq('x', h)} + ${sq('y', k)} = ${R2}`;
      if (t === 0) {
        const R2 = r.chance(0.5) ? r.int(2, 9) ** 2 : r.pick([8, 12, 18, 20, 27, 45, 50, 2, 5, 13]);
        const askC = r.chance(0.4);
        return {
          q: askC ? T(`圓 ${std(R2)} 的圓心是哪一點？答案寫成 (x, y)。`, `What is the center of the circle ${std(R2)}? Answer as (x, y).`)
            : T(`圓 ${std(R2)} 的半徑是多少？（用最簡根式）`, `What is the radius of the circle ${std(R2)}? (Simplest radical form if needed.)`),
          ans: askC ? ansPair(h, k) : ansRad(1, R2),
          sol: [
            T('標準式 (x − h)² + (y − k)² = r²：圓心 (h, k)，半徑 r。', 'Standard form (x − h)² + (y − k)² = r² has center (h, k) and radius r.'),
            T(`比對：h = ${num(h)}，k = ${num(k)}（注意括號裡是「減」，所以符號要反過來看）。`, `Match: h = ${num(h)}, k = ${num(k)} (the form uses "minus", so read the signs backwards).`),
            askC ? T(`圓心 (${num(h)}, ${num(k)})。`, `Center (${num(h)}, ${num(k)}).`) : T(`r² = ${R2}，r = ${sqrt(R2)} = ${radF(1, R2)}。`, `r² = ${R2}, so r = ${sqrt(R2)} = ${radF(1, R2)}.`),
          ],
        };
      }
      if (t === 1) {
        const R = r.int(1, 7), D = -2 * h, E = -2 * k, F = h * h + k * k - R * R;
        const eq = `x<sup>2</sup> + y<sup>2</sup>${D ? ' ' + sgn(D) + 'x' : ''}${E ? ' ' + sgn(E) + 'y' : ''}${F ? ' ' + sgn(F) : ''} = 0`.replace(/([+−]) 1([xy])/g, '$1 $2');
        const askC = r.chance(0.4);
        return {
          q: askC ? T(`圓 ${eq} 的圓心是哪一點？答案寫成 (x, y)。`, `Find the center of the circle ${eq}. Answer as (x, y).`) : T(`求圓 ${eq} 的半徑。`, `Find the radius of the circle ${eq}.`),
          ans: askC ? ansPair(h, k) : ansNum(R),
          sol: [
            T('用配方法把一般式化成標準式。', 'Complete the square to turn the general form into standard form.'),
            T(`x 的部分：x² ${D ? sgn(D) + 'x' : ''} = ${sq('x', h)} − ${h * h}；y 的部分：y² ${E ? sgn(E) + 'y' : ''} = ${sq('y', k)} − ${k * k}。`.replace(/([+−]) 1([xy])/g, '$1 $2'), `x-part: x² ${D ? sgn(D) + 'x' : ''} = ${sq('x', h)} − ${h * h}; y-part: y² ${E ? sgn(E) + 'y' : ''} = ${sq('y', k)} − ${k * k}.`.replace(/([+−]) 1([xy])/g, '$1 $2')),
            T(`所以 ${sq('x', h)} + ${sq('y', k)} = ${h * h} + ${k * k} ${sgn(-F)} = ${R * R}。`, `So ${sq('x', h)} + ${sq('y', k)} = ${h * h} + ${k * k} ${sgn(-F)} = ${R * R}.`),
            askC ? T(`圓心 (${num(h)}, ${num(k)})。`, `Center (${num(h)}, ${num(k)}).`) : T(`r² = ${R * R}，半徑 r = ${R}。`, `r² = ${R * R}, so the radius is ${R}.`),
          ],
        };
      }
      if (t === 2) {
        let px, py; do { px = r.int(-6, 6); py = r.int(-6, 6); } while (px === h && py === k);
        const R2 = (px - h) ** 2 + (py - k) ** 2;
        return {
          q: T(`圓心 (${num(h)}, ${num(k)})，且通過點 (${num(px)}, ${num(py)}) 的圓方程式是哪一個？`, `Which is the equation of the circle with center (${num(h)}, ${num(k)}) passing through (${num(px)}, ${num(py)})?`),
          ans: choice(std(R2), [`${sq('x', -h)} + ${sq('y', -k)} = ${R2}`, std(`${sqrt(R2)}`), `${sq('x', h)} + ${sq('y', k)} = ${R2 * 2}`, `${sq('x', px)} + ${sq('y', py)} = ${R2}`]),
          sol: [
            T('半徑 = 圓心到圓上一點的距離。', 'The radius is the distance from the center to a point on the circle.'),
            T(`r² = (${num(px)} − ${par(h)})² + (${num(py)} − ${par(k)})² = ${(px - h) ** 2} + ${(py - k) ** 2} = ${R2}。`, `r² = (${num(px)} − ${par(h)})² + (${num(py)} − ${par(k)})² = ${(px - h) ** 2} + ${(py - k) ** 2} = ${R2}.`),
            T(`方程式：${std(R2)}（右邊是 r²，不是 r）。`, `Equation: ${std(R2)} (the right side is r², not r).`),
          ],
        };
      }
      // diameter endpoints
      const ax = h + r.nz(-4, 4), ay = k + r.int(-4, 4), bx = 2 * h - ax, by = 2 * k - ay;
      const R2 = (ax - h) ** 2 + (ay - k) ** 2;
      return {
        q: T(`A(${num(ax)}, ${num(ay)})、B(${num(bx)}, ${num(by)}) 是一個圓的直徑兩端點。求這個圓半徑的平方 r²。`, `A(${num(ax)}, ${num(ay)}) and B(${num(bx)}, ${num(by)}) are the endpoints of a diameter of a circle. Find r², the square of the radius.`),
        ans: ansNum(R2),
        sol: [
          T('直徑的中點就是圓心。', 'The midpoint of a diameter is the center.'),
          T(`圓心 = ((${num(ax)} + ${par(bx)})/2, (${num(ay)} + ${par(by)})/2) = (${num(h)}, ${num(k)})。`, `Center = ((${num(ax)} + ${par(bx)})/2, (${num(ay)} + ${par(by)})/2) = (${num(h)}, ${num(k)}).`),
          T(`r² = (${num(ax)} − ${par(h)})² + (${num(ay)} − ${par(k)})² = ${R2}。`, `r² = (${num(ax)} − ${par(h)})² + (${num(ay)} − ${par(k)})² = ${R2}.`),
          T(`圓的方程式：${std(R2)}。`, `The circle is ${std(R2)}.`),
        ],
      };
    },
  },
  {
    id: 'g10-arc-sector',
    grade: 10,
    name: T('弧長與扇形面積', 'Arc length and sector area'),
    cur: { us: 'Geometry · G-C.B.5', tw: '九年級 圓（扇形）／高一 弧度', aops: 'Intro Geometry' },
    at: { tw: 9 },
    gen(r) {
      const th = r.pick([30, 36, 40, 45, 60, 72, 90, 120, 135, 144, 150, 210, 240, 270, 300]), R = r.int(2, 12);
      const t = r.int(0, 3);
      const arc = red(R * th, 180), area = red(R * R * th, 360);
      if (t === 0 || t === 2) {
        const story = t === 2, n = r.pick(NAMES);
        return {
          q: story ? T(`${n[0]}切了一片圓形披薩，披薩半徑 ${R} 公分，這片的圓心角是 ${th}°。這片披薩外緣的餅皮（弧）有多長？（用 π 表示）`, `${n[1]} cuts a slice from a round pizza of radius ${R} cm. The slice has a central angle of ${th}°. How long is the crust (the arc)? (Leave your answer in terms of π.)`)
            : T(`半徑 ${R}、圓心角 ${th}° 的扇形，弧長是多少？（用 π 表示）`, `A sector has radius ${R} and central angle ${th}°. Find its arc length. (Leave your answer in terms of π.)`),
          fig: sectorFig(th, `r = ${R}`), ans: ansPi(...arc),
          sol: [
            T('弧長 = 圓周長 × (圓心角 ÷ 360°) = 2πr × θ/360。', 'Arc length = circumference × (angle ÷ 360°) = 2πr × θ/360.'),
            T(`= 2π × ${R} × ${frac(th, 360)}`, `= 2π × ${R} × ${frac(th, 360)}`),
            T(`= ${frac(`${2 * R * th}π`, 360)} = ${piF(...arc)}。`, `= ${frac(`${2 * R * th}π`, 360)} = ${piF(...arc)}.`),
          ],
        };
      }
      if (t === 1) return {
        q: T(`半徑 ${R}、圓心角 ${th}° 的扇形，面積是多少？（用 π 表示）`, `A sector has radius ${R} and central angle ${th}°. Find its area. (Leave your answer in terms of π.)`),
        fig: sectorFig(th, `r = ${R}`), ans: ansPi(...area),
        sol: [
          T('扇形面積 = 圓面積 × (θ ÷ 360°) = πr² × θ/360。', 'Sector area = circle area × (θ ÷ 360°) = πr² × θ/360.'),
          T(`= π × ${R}² × ${frac(th, 360)} = ${frac(`${R * R * th}π`, 360)}`, `= π × ${R}² × ${frac(th, 360)} = ${frac(`${R * R * th}π`, 360)}`),
          T(`= ${piF(...area)}。`, `= ${piF(...area)}.`),
          T(`另一種算法：扇形面積 = ½ × 弧長 × 半徑 = ½ × ${piF(...arc)} × ${R}，答案一樣。`, `Another way: area = ½ × arc × radius = ½ × ${piF(...arc)} × ${R} — same answer.`),
        ],
      };
      return {
        q: T(`一個半徑 ${R} 的扇形，弧長是 ${piF(...arc)}。圓心角是幾度？`, `A sector of radius ${R} has arc length ${piF(...arc)}. What is its central angle in degrees?`),
        fig: sectorFig(th, `r = ${R}`).replace(`>${th}°<`, '>?<'), ans: ansNum(th),
        sol: [
          T('弧長 = 2πr × θ/360，把 θ 當未知數。', 'Arc length = 2πr × θ/360; solve for θ.'),
          T(`${piF(...arc)} = 2π × ${R} × θ/360 = ${frac(`${2 * R}πθ`, 360)}`, `${piF(...arc)} = 2π × ${R} × θ/360 = ${frac(`${2 * R}πθ`, 360)}`),
          T(`θ = ${fr(arc)} × 360 ÷ ${2 * R} = ${th}°。`, `θ = ${fr(arc)} × 360 ÷ ${2 * R} = ${th}°.`),
        ],
      };
    },
  },
  {
    id: 'g10-similar-ratio',
    grade: 10,
    name: T('相似形的面積比與體積比', 'Similar figures: area and volume ratios'),
    cur: { us: 'Geometry · G-MG / G-GMD', tw: '九年級 相似形', aops: 'Intro Geometry' },
    at: { tw: 9 },
    gen(r) {
      const [p, q] = r.pick([[1, 2], [2, 3], [3, 4], [2, 5], [3, 5], [1, 3], [4, 5], [3, 7]]);
      const t = r.int(0, 3), m = r.int(1, 6);
      if (t === 0) {
        const A = p * p * m * r.pick([1, 2, 3]), B = (A / (p * p)) * q * q;
        return {
          q: T(`兩個相似三角形的對應邊長是 ${p * 2} 公分和 ${q * 2} 公分。小三角形面積是 ${A} 平方公分，大三角形面積是多少？`, `Two similar triangles have corresponding sides ${p * 2} cm and ${q * 2} cm. The smaller one has area ${A} cm². What is the area of the larger one?`),
          ans: ansNum(B),
          sol: [
            T(`邊長比 = ${p * 2} : ${q * 2} = ${p} : ${q}。`, `Length ratio = ${p * 2} : ${q * 2} = ${p} : ${q}.`),
            T(`相似形的面積比 = 邊長比的平方 = ${p * p} : ${q * q}。`, `For similar figures, area ratio = (length ratio)² = ${p * p} : ${q * q}.`),
            T(`大面積 = ${A} × ${frac(q * q, p * p)} = ${B} 平方公分。`, `Larger area = ${A} × ${frac(q * q, p * p)} = ${B} cm².`),
          ],
        };
      }
      if (t === 1) {
        const Vs = p ** 3 * m, Vb = q ** 3 * m;
        const obj = r.pick([['圓錐形紙杯', 'cone-shaped paper cups'], ['長方體箱子', 'boxes'], ['圓柱形罐子', 'cylindrical cans']]);
        return {
          q: T(`兩個相似的${obj[0]}，高度分別是 ${p * 3} 公分和 ${q * 3} 公分。小的容量是 ${Vs} 毫升，大的容量是多少毫升？`, `Two similar ${obj[1]} have heights ${p * 3} cm and ${q * 3} cm. The small one holds ${Vs} mL. How much does the large one hold?`),
          ans: ansNum(Vb),
          sol: [
            T(`長度比 = ${p * 3} : ${q * 3} = ${p} : ${q}。`, `Length ratio = ${p * 3} : ${q * 3} = ${p} : ${q}.`),
            T(`體積比 = 長度比的立方 = ${p ** 3} : ${q ** 3}。`, `Volume ratio = (length ratio)³ = ${p ** 3} : ${q ** 3}.`),
            T(`大容量 = ${Vs} × ${frac(q ** 3, p ** 3)} = ${Vb} 毫升。`, `Large volume = ${Vs} × ${frac(q ** 3, p ** 3)} = ${Vb} mL.`),
          ],
        };
      }
      if (t === 2) return {
        q: T(`兩個相似多邊形的面積比是 ${p * p} : ${q * q}。它們的周長比是多少？（寫成最簡分數 小/大）`, `Two similar polygons have areas in the ratio ${p * p} : ${q * q}. What is the ratio of their perimeters? (Answer small/large as a fraction in lowest terms.)`),
        ans: ansFrac(p, q),
        sol: [
          T('面積比 = 邊長比²，周長比 = 邊長比。', 'Area ratio = (length ratio)², and perimeter ratio = length ratio.'),
          T(`邊長比 = √${p * p} : √${q * q} = ${p} : ${q}。`, `Length ratio = √${p * p} : √${q * q} = ${p} : ${q}.`),
          T(`周長比 = ${frac(p, q)}。`, `Perimeter ratio = ${frac(p, q)}.`),
        ],
      };
      return {
        q: T(`兩個相似立體的表面積比是 ${p * p} : ${q * q}。它們的體積比（小/大）是多少？（用最簡分數）`, `Two similar solids have surface areas in the ratio ${p * p} : ${q * q}. What is the ratio of their volumes (small/large)? (Lowest terms.)`),
        ans: ansFrac(p ** 3, q ** 3),
        sol: [
          T(`表面積比 = 長度比²，所以長度比 = ${p} : ${q}。`, `Surface-area ratio = (length ratio)², so the length ratio is ${p} : ${q}.`),
          T(`體積比 = 長度比³ = ${p}³ : ${q}³ = ${p ** 3} : ${q ** 3}。`, `Volume ratio = (length ratio)³ = ${p}³ : ${q}³ = ${p ** 3} : ${q ** 3}.`),
          T(`答案 ${frac(p ** 3, q ** 3)}。常見錯誤：直接用 ${p * p}/${q * q}，那是面積比。`, `Answer: ${frac(p ** 3, q ** 3)}. A common mistake is ${p * p}/${q * q} — that is the area ratio.`),
        ],
      };
    },
  },
  {
    id: 'g10-solid-volume',
    grade: 10,
    name: T('立體的表面積與體積', 'Surface area and volume of solids'),
    cur: { us: 'Geometry · G-GMD.A.3', tw: '高二 數A 空間概念／國中 立體圖形', aops: 'Intro Geometry' },
    gen(r) {
      const t = r.int(0, 5);
      if (t === 0) {
        const R = r.int(2, 9), H = r.int(2, 12), sa = r.chance(0.5);
        return {
          q: sa ? T(`圓柱底面半徑 ${R}、高 ${H}，求表面積（上下底加側面）。（用 π 表示）`, `A cylinder has radius ${R} and height ${H}. Find its total surface area (both bases plus the side). (In terms of π.)`)
            : T(`圓柱底面半徑 ${R}、高 ${H}，求體積。（用 π 表示）`, `A cylinder has radius ${R} and height ${H}. Find its volume. (In terms of π.)`),
          ans: ansPi(sa ? 2 * R * R + 2 * R * H : R * R * H),
          sol: sa ? [
            T('圓柱表面積 = 2πr²（兩個底）+ 2πrh（側面展開是長方形）。', 'Cylinder surface area = 2πr² (two bases) + 2πrh (the side unrolls into a rectangle).'),
            T(`= 2π × ${R}² + 2π × ${R} × ${H} = ${2 * R * R}π + ${2 * R * H}π`, `= 2π × ${R}² + 2π × ${R} × ${H} = ${2 * R * R}π + ${2 * R * H}π`),
            T(`= ${piF(2 * R * R + 2 * R * H)}。`, `= ${piF(2 * R * R + 2 * R * H)}.`),
          ] : [
            T('圓柱體積 = 底面積 × 高 = πr²h。', 'Cylinder volume = base area × height = πr²h.'),
            T(`= π × ${R}² × ${H} = ${piF(R * R * H)}。`, `= π × ${R}² × ${H} = ${piF(R * R * H)}.`),
          ],
        };
      }
      if (t === 1 || t === 2) {
        const [a, b, c] = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15]]);
        if (t === 1) return {
          q: T(`圓錐底面半徑 ${a}、斜高 ${c}，求體積。（用 π 表示）`, `A cone has base radius ${a} and slant height ${c}. Find its volume. (In terms of π.)`),
          fig: shape([[110, 15], [40, 140], [180, 140]], [{ x: 145, y: 152, s: `r = ${a}` }, { x: 160, y: 72, s: `${c}` }, { x: 100, y: 95, s: 'h' }], 220, 165, '<line x1="110" y1="15" x2="110" y2="140" class="f-line" stroke-dasharray="4 3"/><line x1="110" y1="140" x2="180" y2="140" class="f-acc" stroke-width="2"/>'),
          ans: ansPi((a * a * b) / 3),
          sol: [
            T('圓錐體積 = ⅓πr²h，要先求高 h。', 'Cone volume = ⅓πr²h, so first find the height h.'),
            T(`高、半徑、斜高形成直角三角形：h = ${sqrt(`${c}² − ${a}²`)} = ${sqrt(c * c - a * a)} = ${b}。`, `Height, radius and slant height form a right triangle: h = ${sqrt(`${c}² − ${a}²`)} = ${sqrt(c * c - a * a)} = ${b}.`),
            T(`V = ⅓ × π × ${a}² × ${b} = ${frac(`${a * a * b}π`, 3)} = ${piF((a * a * b) / 3)}。`, `V = ⅓ × π × ${a}² × ${b} = ${frac(`${a * a * b}π`, 3)} = ${piF((a * a * b) / 3)}.`),
          ],
        };
        return {
          q: T(`圓錐底面半徑 ${a}、高 ${b}，求表面積（底面 + 側面）。（用 π 表示）`, `A cone has base radius ${a} and height ${b}. Find its total surface area (base + lateral). (In terms of π.)`),
          ans: ansPi(a * a + a * c),
          sol: [
            T('圓錐表面積 = πr²（底）+ πrℓ（側面），ℓ 是斜高。', 'Cone surface area = πr² (base) + πrℓ (lateral), where ℓ is the slant height.'),
            T(`斜高 ℓ = ${sqrt(`${a}² + ${b}²`)} = ${sqrt(a * a + b * b)} = ${c}。`, `Slant height ℓ = ${sqrt(`${a}² + ${b}²`)} = ${sqrt(a * a + b * b)} = ${c}.`),
            T(`= π × ${a}² + π × ${a} × ${c} = ${a * a}π + ${a * c}π = ${piF(a * a + a * c)}。`, `= π × ${a}² + π × ${a} × ${c} = ${a * a}π + ${a * c}π = ${piF(a * a + a * c)}.`),
          ],
        };
      }
      if (t === 3) {
        const R = r.int(1, 9), sa = r.chance(0.5), dia = r.chance(0.4);
        const giv = dia ? T(`直徑 ${2 * R}`, `diameter ${2 * R}`) : T(`半徑 ${R}`, `radius ${R}`);
        return {
          q: sa ? T(`球的${giv.zh}，求表面積。（用 π 表示）`, `A sphere has ${giv.en}. Find its surface area. (In terms of π.)`) : T(`球的${giv.zh}，求體積。（用 π 表示）`, `A sphere has ${giv.en}. Find its volume. (In terms of π.)`),
          ans: sa ? ansPi(4 * R * R) : ansPi(4 * R ** 3, 3),
          sol: [
            ...(dia ? [T(`半徑 = 直徑 ÷ 2 = ${R}。`, `Radius = diameter ÷ 2 = ${R}.`)] : []),
            sa ? T('球的表面積 = 4πr²。', 'Surface area of a sphere = 4πr².') : T('球的體積 = ⁴⁄₃πr³。', 'Volume of a sphere = (4/3)πr³.'),
            sa ? T(`= 4π × ${R}² = ${piF(4 * R * R)}。`, `= 4π × ${R}² = ${piF(4 * R * R)}.`) : T(`= ${frac(4, 3)} × π × ${R}³ = ${frac(`${4 * R ** 3}π`, 3)}${(4 * R ** 3) % 3 === 0 ? ` = ${piF(4 * R ** 3, 3)}` : ''}。`, `= ${frac(4, 3)} × π × ${R}³ = ${frac(`${4 * R ** 3}π`, 3)}${(4 * R ** 3) % 3 === 0 ? ` = ${piF(4 * R ** 3, 3)}` : ''}.`),
          ],
        };
      }
      if (t === 4) {
        // square pyramid: half-base a, height b, slant c
        const [a, b, c] = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [4, 3, 5], [8, 6, 10], [12, 5, 13]]), s = 2 * a, sa = r.chance(0.5);
        return {
          q: sa ? T(`正四角錐底面邊長 ${s}、高 ${b}，求表面積（底面 + 四個三角形側面）。`, `A square pyramid has base edge ${s} and height ${b}. Find its total surface area (base + four triangular faces).`)
            : T(`正四角錐底面邊長 ${s}、高 ${b}，求體積。`, `A square pyramid has base edge ${s} and height ${b}. Find its volume.`),
          ans: sa ? ansNum(s * s + 2 * s * c) : ansNum((s * s * b) / 3),
          sol: sa ? [
            T(`側面三角形的高（斜高）：從頂點到底邊中點，水平距離 ${a}、垂直距離 ${b}，斜高 = ${sqrt(`${a}² + ${b}²`)} = ${c}。`, `The slant height of each face: horizontal ${a}, vertical ${b}, so slant = ${sqrt(`${a}² + ${b}²`)} = ${c}.`),
            T(`四個側面 = 4 × ½ × ${s} × ${c} = ${2 * s * c}；底面 = ${s}² = ${s * s}。`, `Four faces = 4 × ½ × ${s} × ${c} = ${2 * s * c}; base = ${s}² = ${s * s}.`),
            T(`表面積 = ${s * s} + ${2 * s * c} = ${s * s + 2 * s * c}。`, `Surface area = ${s * s} + ${2 * s * c} = ${s * s + 2 * s * c}.`),
          ] : [
            T('錐體體積 = ⅓ × 底面積 × 高。', 'Pyramid volume = ⅓ × base area × height.'),
            T(`= ⅓ × ${s}² × ${b} = ⅓ × ${s * s * b} = ${num((s * s * b) / 3)}。`, `= ⅓ × ${s}² × ${b} = ⅓ × ${s * s * b} = ${num((s * s * b) / 3)}.`),
          ],
        };
      }
      // cylinder vs cone vs sphere relation
      const R = r.int(2, 8);
      return {
        q: T(`一個球剛好放進一個圓柱（球碰到上下底和側面），球半徑 ${R}。圓柱體積減去球體積是多少？（用 π 表示）`, `A sphere of radius ${R} fits exactly inside a cylinder (touching the top, bottom and side). What is the cylinder's volume minus the sphere's volume? (In terms of π.)`),
        ans: ansPi(2 * R ** 3, 3),
        sol: [
          T(`圓柱的半徑 = ${R}，高 = 直徑 = ${2 * R}。`, `The cylinder has radius ${R} and height = diameter = ${2 * R}.`),
          T(`圓柱體積 = π × ${R}² × ${2 * R} = ${2 * R ** 3}π；球體積 = ⁴⁄₃π × ${R}³ = ${frac(`${4 * R ** 3}π`, 3)}。`, `Cylinder: π × ${R}² × ${2 * R} = ${2 * R ** 3}π; sphere: (4/3)π × ${R}³ = ${frac(`${4 * R ** 3}π`, 3)}.`),
          T(`相減：${frac(`${6 * R ** 3}π`, 3)} − ${frac(`${4 * R ** 3}π`, 3)} = ${piF(2 * R ** 3, 3)}。（阿基米德：球是圓柱的 ⅔。）`, `Subtract: ${frac(`${6 * R ** 3}π`, 3)} − ${frac(`${4 * R ** 3}π`, 3)} = ${piF(2 * R ** 3, 3)}. (Archimedes: the sphere is ⅔ of the cylinder.)`),
        ],
      };
    },
  },
  {
    id: 'g10-circle-angles',
    grade: 10,
    name: T('圓周角、切線與圓冪', 'Inscribed angles, tangents and power of a point'),
    cur: { us: 'Geometry · G-C.A.2', tw: '九年級 圓（圓心角、圓周角）', aops: 'Intro Geometry' },
    at: { tw: 9 },
    gen(r) {
      const t = r.int(0, 5);
      if (t === 0) {
        const c = 2 * r.int(20, 85);
        return {
          q: T(`如圖，O 是圓心，∠AOB = ${c}°，C 在優弧上。求圓周角 ∠ACB。`, `O is the center and ∠AOB = ${c}°. C is on the major arc. Find the inscribed angle ∠ACB.`),
          fig: circFig({ A: 200, B: 340, C: 95 }, [['O', 'A'], ['O', 'B'], ['C', 'A'], ['C', 'B']]),
          ans: ansNum(c / 2),
          sol: [T('圓周角 = 同弧所對圓心角的一半。', 'An inscribed angle is half the central angle on the same arc.'), T(`∠ACB = ${c}° ÷ 2 = ${c / 2}°。`, `∠ACB = ${c}° ÷ 2 = ${c / 2}°.`)],
        };
      }
      if (t === 1) {
        const a = r.int(15, 80);
        return {
          q: T(`△ABC 內接於圓，AB 是直徑，∠A = ${a}°。求 ∠B。`, `Triangle ABC is inscribed in a circle with AB a diameter, and ∠A = ${a}°. Find ∠B.`),
          fig: circFig({ A: 180, B: 0, C: 70 }, [['A', 'B'], ['A', 'C'], ['B', 'C']]),
          ans: ansNum(90 - a),
          sol: [T('直徑所對的圓周角是直角：∠C = 90°（半圓上的角）。', 'An angle inscribed in a semicircle is a right angle: ∠C = 90°.'), T(`三角形內角和 180°：∠B = 180° − 90° − ${a}° = ${90 - a}°。`, `Angles of a triangle add to 180°: ∠B = 180° − 90° − ${a}° = ${90 - a}°.`)],
        };
      }
      if (t === 2) {
        const a = r.int(50, 130);
        return {
          q: T(`四邊形 ABCD 內接於圓，∠A = ${a}°。求 ∠C。`, `Quadrilateral ABCD is inscribed in a circle and ∠A = ${a}°. Find ∠C.`),
          fig: circFig({ A: 160, B: 60, C: 0, D: 250 }, [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']], false),
          ans: ansNum(180 - a),
          sol: [T('圓內接四邊形的對角互補（相加 180°），因為兩個圓周角合起來對整個圓 360° 的一半。', 'Opposite angles of a cyclic quadrilateral add to 180°: together they cover arcs totaling 360°, and each inscribed angle is half its arc.'), T(`∠C = 180° − ${a}° = ${180 - a}°。`, `∠C = 180° − ${a}° = ${180 - a}°.`)],
        };
      }
      if (t === 3) {
        const c = r.int(40, 150);
        return {
          q: T(`從圓外一點 P 作兩條切線 PA、PB（A、B 是切點），O 是圓心，∠AOB = ${c}°。求 ∠APB。`, `From an outside point P, tangents PA and PB touch the circle at A and B. O is the center and ∠AOB = ${c}°. Find ∠APB.`),
          ans: ansNum(180 - c),
          sol: [T('切線垂直於過切點的半徑：∠OAP = ∠OBP = 90°。', 'A tangent is perpendicular to the radius at the point of tangency: ∠OAP = ∠OBP = 90°.'), T('四邊形 OAPB 內角和是 360°。', 'The angles of quadrilateral OAPB add to 360°.'), T(`∠APB = 360° − 90° − 90° − ${c}° = ${180 - c}°。`, `∠APB = 360° − 90° − 90° − ${c}° = ${180 - c}°.`)],
        };
      }
      if (t === 4) {
        // intersecting chords: a·b = c·d
        const a = r.int(2, 9), b = r.int(2, 9), c = r.pick([...new Set([1, 2, 3, 4, 6].map((x) => x).filter((x) => (a * b) % x === 0 && x !== a))]) || 1, d = (a * b) / c;
        return {
          q: T(`圓內兩弦 AB、CD 交於 E。AE = ${a}，EB = ${b}，CE = ${c}，求 ED。`, `Chords AB and CD of a circle meet at E. AE = ${a}, EB = ${b}, CE = ${c}. Find ED.`),
          fig: circFig({ A: 150, B: 330, C: 60, D: 230 }, [['A', 'B'], ['C', 'D']], false),
          ans: ansNum(d),
          sol: [T('相交弦定理（圓冪）：AE × EB = CE × ED。', 'Intersecting chords (power of a point): AE × EB = CE × ED.'), T(`${a} × ${b} = ${c} × ED ⇒ ED = ${a * b} ÷ ${c} = ${num(d)}。`, `${a} × ${b} = ${c} × ED ⇒ ED = ${a * b} ÷ ${c} = ${num(d)}.`)],
        };
      }
      // tangent-secant: PT² = PA·PB
      const pa = r.int(2, 8), m = r.int(1, 4), pb = r.chance(0.4) ? pa * (m + 1) ** 2 : pa + r.int(2, 12);
      const pt2 = pa * pb, [k, s] = simpRoot(pt2);
      return {
        q: T(`從圓外一點 P 作切線 PT（T 是切點）和一條割線，割線與圓交於 A、B（A 較近）。PA = ${pa}，PB = ${pb}，求 PT。（用最簡根式）`, `From an outside point P, PT is tangent to a circle at T, and a secant from P meets the circle at A and B (A closer). PA = ${pa} and PB = ${pb}. Find PT. (Simplest radical form if needed.)`),
        ans: ansRad(k, s),
        sol: [T('切割線定理（圓冪）：PT² = PA × PB。', 'Tangent-secant theorem (power of a point): PT² = PA × PB.'), T(`PT² = ${pa} × ${pb} = ${pt2}。`, `PT² = ${pa} × ${pb} = ${pt2}.`), T(`PT = ${sqrt(pt2)} = ${rad(k, s)}。`, `PT = ${sqrt(pt2)} = ${rad(k, s)}.`)],
      };
    },
  },
  {
    id: 'g10-abs-eq',
    grade: 10,
    name: T('絕對值方程式與不等式', 'Absolute value equations and inequalities'),
    cur: { us: 'Algebra 1 · Absolute value', tw: '高一 數與式（絕對值）', aops: 'Intro Algebra' },
    at: { us: 9 },
    gen(r) {
      const t = r.int(0, 3);
      if (t === 0) {
        const a = r.pick([1, 2, 3, 4, 5]), b = r.nz(-9, 9), c = r.int(1, 12);
        const s1 = red(c - b, a), s2 = red(-c - b, a);
        return {
          q: T(`解方程式 |${lin(a, b)}| = ${c}。（兩個解用逗號隔開，可用分數）`, `Solve |${lin(a, b)}| = ${c}. (Separate the two solutions with a comma; fractions are fine.)`),
          ans: ansSet([s1[0] / s1[1], s2[0] / s2[1]], `${ft(s1)}, ${ft(s2)}`),
          sol: [
            T(`|A| = ${c} 表示 A 到 0 的距離是 ${c}，所以 A = ${c} 或 A = −${c}。`, `|A| = ${c} means A is ${c} away from 0, so A = ${c} or A = −${c}.`),
            T(`${lin(a, b)} = ${c} ⇒ ${a === 1 ? 'x' : a + 'x'} = ${num(c - b)} ⇒ x = ${fr(s1)}。`, `${lin(a, b)} = ${c} ⇒ ${a === 1 ? 'x' : a + 'x'} = ${num(c - b)} ⇒ x = ${fr(s1)}.`),
            T(`${lin(a, b)} = −${c} ⇒ ${a === 1 ? 'x' : a + 'x'} = ${num(-c - b)} ⇒ x = ${fr(s2)}。`, `${lin(a, b)} = −${c} ⇒ ${a === 1 ? 'x' : a + 'x'} = ${num(-c - b)} ⇒ x = ${fr(s2)}.`),
            T(`答：x = ${fr(s1)} 或 ${fr(s2)}。`, `Answer: x = ${fr(s1)} or ${fr(s2)}.`),
          ],
        };
      }
      if (t === 1) {
        const h = r.int(-8, 8), k = r.int(1, 9), lt = r.chance(0.5);
        const rightO = lt ? `${num(h - k)} < x < ${num(h + k)}` : T(`x < ${num(h - k)} 或 x > ${num(h + k)}`, `x < ${num(h - k)} or x > ${num(h + k)}`);
        const wrongs = lt ? [T(`x < ${num(h - k)} 或 x > ${num(h + k)}`, `x < ${num(h - k)} or x > ${num(h + k)}`), `${num(-h - k)} < x < ${num(-h + k)}`, `${num(h - k)} ≤ x ≤ ${num(h + k)}`]
          : [`${num(h - k)} < x < ${num(h + k)}`, T(`x < ${num(-h - k)} 或 x > ${num(-h + k)}`, `x < ${num(-h - k)} or x > ${num(-h + k)}`), T(`x ≤ ${num(h - k)} 或 x ≥ ${num(h + k)}`, `x ≤ ${num(h - k)} or x ≥ ${num(h + k)}`)];
        return {
          q: T(`解不等式 |${lin(1, -h)}| ${lt ? '<' : '>'} ${k}。`, `Solve |${lin(1, -h)}| ${lt ? '<' : '>'} ${k}.`),
          ans: choice(rightO, wrongs),
          sol: [
            T(`|x − ${par(h)}| 是 x 到 ${num(h)} 的距離。`, `|x − ${par(h)}| is the distance from x to ${num(h)}.`),
            lt ? T(`距離小於 ${k}：x 在 ${num(h)} 的左右各 ${k} 以內，即 ${num(h - k)} < x < ${num(h + k)}。`, `Distance less than ${k}: x is within ${k} of ${num(h)}, so ${num(h - k)} < x < ${num(h + k)}.`)
              : T(`距離大於 ${k}：x 在 ${num(h - k)} 的左邊或 ${num(h + k)} 的右邊。`, `Distance greater than ${k}: x is left of ${num(h - k)} or right of ${num(h + k)}.`),
            T('端點不包含，因為是嚴格不等號。', 'The endpoints are not included because the inequality is strict.'),
          ],
        };
      }
      if (t === 2) {
        const a = r.pick([1, 2, 3]), b = r.int(-10, 10), c = r.int(2, 12);
        let cnt = 0, lo = null, hi = null;
        for (let x = -100; x <= 100; x++) if (Math.abs(a * x - b) <= c) { cnt++; if (lo === null) lo = x; hi = x; }
        return {
          q: T(`滿足 |${lin(a, -b)}| ≤ ${c} 的整數 x 有幾個？`, `How many integers x satisfy |${lin(a, -b)}| ≤ ${c}?`),
          ans: ansNum(cnt),
          sol: [
            T(`|A| ≤ ${c} ⇔ −${c} ≤ A ≤ ${c}。`, `|A| ≤ ${c} ⇔ −${c} ≤ A ≤ ${c}.`),
            T(`−${c} ≤ ${lin(a, -b)} ≤ ${c} ⇒ ${num(b - c)} ≤ ${a === 1 ? 'x' : a + 'x'} ≤ ${num(b + c)}${a > 1 ? ` ⇒ ${fr(red(b - c, a))} ≤ x ≤ ${fr(red(b + c, a))}` : ''}。`, `−${c} ≤ ${lin(a, -b)} ≤ ${c} ⇒ ${num(b - c)} ≤ ${a === 1 ? 'x' : a + 'x'} ≤ ${num(b + c)}${a > 1 ? ` ⇒ ${fr(red(b - c, a))} ≤ x ≤ ${fr(red(b + c, a))}` : ''}.`),
            T(`整數從 ${num(lo)} 到 ${num(hi)}，共 ${num(hi)} − ${par(lo)} + 1 = ${cnt} 個。`, `The integers run from ${num(lo)} to ${num(hi)}: ${num(hi)} − ${par(lo)} + 1 = ${cnt} of them.`),
          ],
        };
      }
      const p = r.int(-9, 5), q = p + r.int(2, 12);
      return {
        q: T(`f(x) = |x ${sgn(-p)}| + |x ${sgn(-q)}| 的最小值是多少？`, `What is the minimum value of f(x) = |x ${sgn(-p)}| + |x ${sgn(-q)}|?`),
        ans: ansNum(q - p),
        sol: [
          T(`f(x) 是數線上 x 到 ${num(p)} 的距離加上 x 到 ${num(q)} 的距離。`, `f(x) is the distance from x to ${num(p)} plus the distance from x to ${num(q)} on the number line.`),
          T(`當 x 在 ${num(p)} 和 ${num(q)} 之間時，兩段距離加起來正好是 ${num(q)} − ${par(p)} = ${q - p}；在外面時會更大。`, `When x is between ${num(p)} and ${num(q)}, the two distances add to exactly ${num(q)} − ${par(p)} = ${q - p}; outside, the sum is larger.`),
          T(`最小值 = ${q - p}。例如 x = ${num(q)}：0 + ${q - p} = ${q - p}。`, `Minimum = ${q - p}. For example x = ${num(q)}: 0 + ${q - p} = ${q - p}.`),
        ],
      };
    },
  },
  {
    id: 'g10-line-slope',
    grade: 10,
    name: T('斜率、平行與垂直', 'Slope, parallel and perpendicular lines'),
    cur: { us: 'Geometry · G-GPE.B.5', tw: '高一 直線與圓（直線方程式）', aops: 'Intro Algebra' },
    gen(r) {
      const t = r.int(0, 3);
      if (t === 0) {
        const x1 = r.int(-6, 6), y1 = r.int(-6, 6); let x2; do x2 = r.int(-6, 6); while (x2 === x1); const y2 = r.int(-6, 6);
        const m = red(y2 - y1, x2 - x1);
        return {
          q: T(`求通過 (${num(x1)}, ${num(y1)}) 和 (${num(x2)}, ${num(y2)}) 的直線斜率。（用最簡分數或整數）`, `Find the slope of the line through (${num(x1)}, ${num(y1)}) and (${num(x2)}, ${num(y2)}). (Integer or fraction in lowest terms.)`),
          fig: grid(7, [{ x: x1, y: y1 }, { x: x2, y: y2 }]),
          ans: ansFrac(...m),
          sol: [
            T('斜率 m = (y₂ − y₁) ÷ (x₂ − x₁)，也就是「上升 ÷ 前進」。', 'Slope m = (y₂ − y₁) ÷ (x₂ − x₁): rise over run.'),
            T(`m = ${frac(`${num(y2)} − ${par(y1)}`, `${num(x2)} − ${par(x1)}`)} = ${frac(y2 - y1, x2 - x1)}`, `m = ${frac(`${num(y2)} − ${par(y1)}`, `${num(x2)} − ${par(x1)}`)} = ${frac(y2 - y1, x2 - x1)}`),
            T(`= ${fr(m)}。`, `= ${fr(m)}.`),
          ],
        };
      }
      if (t === 1) {
        let a, b; do { a = r.nz(-6, 6); b = r.nz(-6, 6); } while (Math.abs(a) === Math.abs(b) && r.chance(0.5));
        const c = r.int(-9, 9), perp = r.chance(0.5), m0 = red(-a, b), ms = perp ? red(b, a) : m0;
        return {
          q: T(`直線 L：${linXY([a, b, c])} = 0。與 L ${perp ? '垂直' : '平行'}的直線斜率是多少？（用最簡分數或整數）`, `Line L: ${linXY([a, b, c])} = 0. What is the slope of a line ${perp ? 'perpendicular' : 'parallel'} to L? (Integer or fraction in lowest terms.)`),
          ans: ansFrac(...ms),
          sol: [
            T(`把 L 寫成 y = mx + k：${b === 1 ? 'y' : num(b) + 'y'} = ${linXY([-a, -c])} ⇒ 斜率 m = ${frac(-a, b)} = ${fr(m0)}。`, `Write L as y = mx + k: ${b === 1 ? 'y' : num(b) + 'y'} = ${linXY([-a, -c])} ⇒ slope m = ${frac(-a, b)} = ${fr(m0)}.`),
            perp ? T(`垂直的兩直線斜率相乘 = −1，所以所求斜率 = −1 ÷ ${fr(m0)} = ${fr(ms)}（負倒數）。`, `Perpendicular slopes multiply to −1, so the slope is −1 ÷ ${fr(m0)} = ${fr(ms)} (negative reciprocal).`)
              : T(`平行線斜率相同：${fr(ms)}。`, `Parallel lines have equal slopes: ${fr(ms)}.`),
            T('（小技巧：ax + by + c = 0 的斜率是 −a/b。）', '(Shortcut: the slope of ax + by + c = 0 is −a/b.)'),
          ],
        };
      }
      if (t === 2) {
        const p = r.nz(-4, 4), q = r.pick([1, 2, 3]), x0 = r.int(-5, 5), y0 = r.int(-5, 5), b0 = r.int(-5, 5);
        const m = red(p, q), mp = red(-q, p);
        const k = fadd([y0, 1], fmul(fsub([0, 1], mp), [x0, 1])); // y0 - mp*x0
        return {
          q: T(`求通過點 (${num(x0)}, ${num(y0)}) 且垂直於 y = ${fr(m) === '1' ? '' : fr(m) === '−1' ? '−' : fr(m)}x ${sgn(b0)} 的直線的 y 截距。`, `Find the y-intercept of the line through (${num(x0)}, ${num(y0)}) perpendicular to y = ${fr(m) === '1' ? '' : fr(m) === '−1' ? '−' : fr(m)}x ${sgn(b0)}.`),
          ans: ansNum(k),
          sol: [
            T(`原直線斜率 ${fr(m)}，垂直線斜率是負倒數 ${fr(mp)}。`, `The given slope is ${fr(m)}, so the perpendicular slope is its negative reciprocal ${fr(mp)}.`),
            T(`設 y = ${fr(mp)}x + k，代入 (${num(x0)}, ${num(y0)})：${num(y0)} = ${fr(mp)} × ${par(x0)} + k。`, `Let y = ${fr(mp)}x + k and plug in (${num(x0)}, ${num(y0)}): ${num(y0)} = ${fr(mp)} × ${par(x0)} + k.`),
            T(`k = ${num(y0)} − ${frP(fmul(mp, [x0, 1]))} = ${fr(k)}。`, `k = ${num(y0)} − ${frP(fmul(mp, [x0, 1]))} = ${fr(k)}.`),
            T(`y 截距是 ${fr(k)}。`, `The y-intercept is ${fr(k)}.`),
          ],
        };
      }
      // find k for perpendicular/parallel
      let b1, a2, b2; do { b1 = r.nz(-5, 5); a2 = r.nz(-5, 5); b2 = r.nz(-5, 5); } while (false);
      const c1 = r.int(-9, 9), c2 = r.int(-9, 9), perp = r.chance(0.5);
      const kv = perp ? red(-b1 * b2, a2) : red(a2 * b1, b2);
      const kTerm = 'kx';
      return {
        q: T(`直線 ${kTerm} ${b1 < 0 ? '−' : '+'} ${Math.abs(b1) === 1 ? '' : Math.abs(b1)}y ${sgn(c1)} = 0 與 ${linXY([a2, b2, c2])} = 0 ${perp ? '互相垂直' : '互相平行'}，求 k。（用最簡分數或整數）`, `The lines ${kTerm} ${b1 < 0 ? '−' : '+'} ${Math.abs(b1) === 1 ? '' : Math.abs(b1)}y ${sgn(c1)} = 0 and ${linXY([a2, b2, c2])} = 0 are ${perp ? 'perpendicular' : 'parallel'}. Find k. (Integer or fraction in lowest terms.)`),
        ans: ansFrac(...kv),
        sol: [
          T(`第一條斜率 = −k/${par(b1)}，第二條斜率 = ${frac(-a2, b2)}。`, `Slope of the first = −k/${par(b1)}; slope of the second = ${frac(-a2, b2)}.`),
          perp ? T(`垂直：兩直線的法向量內積為 0，即 k × ${par(a2)} + ${par(b1)} × ${par(b2)} = 0。`, `Perpendicular: the normal vectors are perpendicular, so k × ${par(a2)} + ${par(b1)} × ${par(b2)} = 0.`)
            : T(`平行：係數成比例，k : ${par(b1)} = ${par(a2)} : ${par(b2)}，即 ${par(b2)}k = ${par(a2)} × ${par(b1)}。`, `Parallel: coefficients are proportional, k : ${par(b1)} = ${par(a2)} : ${par(b2)}, so ${par(b2)}k = ${par(a2)} × ${par(b1)}.`),
          T(`k = ${fr(kv)}。`, `k = ${fr(kv)}.`),
        ],
      };
    },
  },
  {
    id: 'g10-point-line-dist',
    grade: 10,
    name: T('點到直線的距離', 'Distance from a point to a line'),
    cur: { us: 'Precalculus · Lines', tw: '高一 直線與圓（點到直線距離）', aops: 'Intro Geometry' },
    at: { us: 12 },
    gen(r) {
      const t = r.int(0, 2);
      const [a0, b0, L] = r.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [6, 8, 10], [8, 6, 10], [1, 1, 0], [1, 2, 0], [2, 1, 0], [1, 3, 0]]);
      const a = a0 * r.sign(), b = b0 * r.sign(), s2 = a * a + b * b;
      if (t < 2) {
        const x0 = r.int(-6, 6), y0 = r.int(-6, 6); let c; do c = r.int(-15, 15); while (a * x0 + b * y0 + c === 0);
        const N = Math.abs(a * x0 + b * y0 + c);
        const ans = L ? ansFrac(N, L) : ansRad(N, s2, s2);
        const fin = L ? fracR(N, L) : radF(N, s2, s2);
        return {
          q: T(`求點 P(${num(x0)}, ${num(y0)}) 到直線 ${linXY([a, b, c])} = 0 的距離。${L ? '（用最簡分數或整數）' : '（用最簡根式，分母有理化）'}`, `Find the distance from P(${num(x0)}, ${num(y0)}) to the line ${linXY([a, b, c])} = 0. ${L ? '(Integer or fraction in lowest terms.)' : '(Simplest radical form, rationalized denominator.)'}`),
          ans,
          sol: [
            T('點到直線距離公式：d = |ax₀ + by₀ + c| ÷ √(a² + b²)。', 'Point-to-line distance: d = |ax₀ + by₀ + c| ÷ √(a² + b²).'),
            T(`分子：|${num(a)} × ${par(x0)} + ${par(b)} × ${par(y0)} ${sgn(c)}| = |${num(a * x0 + b * y0 + c)}| = ${N}。`, `Numerator: |${num(a)} × ${par(x0)} + ${par(b)} × ${par(y0)} ${sgn(c)}| = |${num(a * x0 + b * y0 + c)}| = ${N}.`),
            T(`分母：√(${par(a)}² + ${par(b)}²) = √${s2}${L ? ` = ${L}` : ''}。`, `Denominator: √(${par(a)}² + ${par(b)}²) = √${s2}${L ? ` = ${L}` : ''}.`),
            T(`d = ${L ? frac(N, L) : frac(N, '√' + s2)}${L && gcd(N, L) === 1 ? '' : ` = ${fin}`}。`, `d = ${L ? frac(N, L) : frac(N, '√' + s2)}${L && gcd(N, L) === 1 ? '' : ` = ${fin}`}.`),
          ],
        };
      }
      // parallel lines, second one possibly scaled by 2
      const c1 = r.int(-12, 12); let c2; do c2 = r.int(-12, 12); while (c2 === c1);
      const sc = r.chance(0.5) ? 2 : 1, N = Math.abs(c1 - c2);
      return {
        q: T(`求兩平行線 ${linXY([a, b, c1])} = 0 與 ${linXY([sc * a, sc * b, sc * c2])} = 0 的距離。${L ? '（用最簡分數或整數）' : '（用最簡根式）'}`, `Find the distance between the parallel lines ${linXY([a, b, c1])} = 0 and ${linXY([sc * a, sc * b, sc * c2])} = 0. ${L ? '(Integer or fraction in lowest terms.)' : '(Simplest radical form.)'}`),
        ans: L ? ansFrac(N, L) : ansRad(N, s2, s2),
        sol: [
          ...(sc === 2 ? [T(`先把第二條除以 2，讓 x、y 係數一樣：${linXY([a, b, c2])} = 0。`, `First divide the second line by 2 so the x and y coefficients match: ${linXY([a, b, c2])} = 0.`)] : []),
          T('平行線距離：d = |c₁ − c₂| ÷ √(a² + b²)。', 'Distance between parallel lines: d = |c₁ − c₂| ÷ √(a² + b²).'),
          T(`d = |${num(c1)} − ${par(c2)}| ÷ √${s2} = ${frac(N, L ? L : '√' + s2)}。`, `d = |${num(c1)} − ${par(c2)}| ÷ √${s2} = ${frac(N, L ? L : '√' + s2)}.`),
          T(`= ${L ? fracR(N, L) : radF(N, s2, s2)}。`, `= ${L ? fracR(N, L) : radF(N, s2, s2)}.`),
        ],
      };
    },
  },
  {
    id: 'g10-remainder-thm',
    grade: 10,
    name: T('多項式除法與餘式定理', 'Polynomial division and the remainder theorem'),
    cur: { us: 'Algebra 2 · A-APR.B.2', tw: '高一 多項式函數（餘式定理）', aops: 'Intermediate Algebra' },
    at: { us: 11 },
    gen(r) {
      const t = r.int(0, 3);
      if (t === 0) {
        const f = [r.nz(-3, 3), r.nz(-6, 6), r.nz(-9, 9), r.int(-9, 9)], a = r.nz(-3, 3), R = pev(f, a);
        return {
          q: T(`f(x) = ${poly(f)} 除以 ${lin(1, -a)} 的餘式是多少？`, `What is the remainder when f(x) = ${poly(f)} is divided by ${lin(1, -a)}?`),
          ans: ansNum(R),
          sol: [
            T(`餘式定理：f(x) 除以 (x − a) 的餘式 = f(a)。這裡 a = ${num(a)}。`, `Remainder theorem: the remainder of f(x) ÷ (x − a) is f(a). Here a = ${num(a)}.`),
            T(`f(${num(a)}) = ${num(f[0])}(${num(a)})³ ${sgn(f[1])}(${num(a)})² ${sgn(f[2])}(${num(a)}) ${sgn(f[3])}`, `f(${num(a)}) = ${num(f[0])}(${num(a)})³ ${sgn(f[1])}(${num(a)})² ${sgn(f[2])}(${num(a)}) ${sgn(f[3])}`),
            T(`= ${num(f[0] * a ** 3)} ${sgn(f[1] * a * a)} ${sgn(f[2] * a)} ${sgn(f[3])} = ${num(R)}。`, `= ${num(f[0] * a ** 3)} ${sgn(f[1] * a * a)} ${sgn(f[2] * a)} ${sgn(f[3])} = ${num(R)}.`),
          ],
        };
      }
      if (t === 1) {
        const a = r.nz(-3, 3), k = r.int(-6, 6), p = r.int(-8, 8), q = -(a ** 3 + k * a * a + p * a);
        return {
          q: T(`若 ${lin(1, -a)} 是 x³ + kx² ${p ? sgn(p) + 'x' : ''} ${sgn(q)} 的因式，求 k。`.replace(/([+−]) 1x/, '$1 x'), `If ${lin(1, -a)} is a factor of x³ + kx² ${p ? sgn(p) + 'x' : ''} ${sgn(q)}, find k.`.replace(/([+−]) 1x/, '$1 x')),
          ans: ansNum(k),
          sol: [
            T(`因式定理：(x − a) 是因式 ⇔ f(a) = 0。代 x = ${num(a)}。`, `Factor theorem: (x − a) is a factor ⇔ f(a) = 0. Plug in x = ${num(a)}.`),
            T(`(${num(a)})³ + k(${num(a)})² ${sgn(p)}(${num(a)}) ${sgn(q)} = 0 ⇒ ${num(a ** 3)} + ${a * a}k ${sgn(p * a)} ${sgn(q)} = 0。`, `(${num(a)})³ + k(${num(a)})² ${sgn(p)}(${num(a)}) ${sgn(q)} = 0 ⇒ ${num(a ** 3)} + ${a * a}k ${sgn(p * a)} ${sgn(q)} = 0.`),
            T(`${a * a}k = ${num(-(a ** 3 + p * a + q))} ⇒ k = ${num(k)}。`, `${a * a}k = ${num(-(a ** 3 + p * a + q))} ⇒ k = ${num(k)}.`),
          ],
        };
      }
      if (t === 2) {
        let a, b; do { a = r.int(-3, 3); b = r.int(-3, 3); } while (a === b);
        const p = r.nz(-5, 5), q = r.int(-6, 6), r1 = p * a + q, r2 = p * b + q;
        const D = (x) => lin(1, -x);
        return {
          q: T(`多項式 f(x) 除以 ${D(a)} 餘 ${num(r1)}，除以 ${D(b)} 餘 ${num(r2)}。f(x) 除以 (${D(a)})(${D(b)}) 的餘式是什麼？`, `A polynomial f(x) leaves remainder ${num(r1)} when divided by ${D(a)} and ${num(r2)} when divided by ${D(b)}. What is the remainder when f(x) is divided by (${D(a)})(${D(b)})?`),
          ans: choice(lin(p, q), [lin(q, p), lin(-p, q), lin(p, -q), lin(r1, r2), lin(p, q + 1)]),
          sol: [
            T('除式是二次，所以餘式最多一次：設 f(x) = (x − a)(x − b)Q(x) + mx + n。', 'The divisor is quadratic, so the remainder is at most linear: f(x) = (x − a)(x − b)Q(x) + mx + n.'),
            T(`代入：f(${num(a)}) = ${num(a)}m + n = ${num(r1)}，f(${num(b)}) = ${num(b)}m + n = ${num(r2)}。`, `Plug in: f(${num(a)}) = ${num(a)}m + n = ${num(r1)} and f(${num(b)}) = ${num(b)}m + n = ${num(r2)}.`),
            T(`兩式相減：(${num(a)} − ${par(b)})m = ${num(r1)} − ${par(r2)} ⇒ m = ${num(p)}；再得 n = ${num(q)}。`, `Subtract: (${num(a)} − ${par(b)})m = ${num(r1)} − ${par(r2)} ⇒ m = ${num(p)}, then n = ${num(q)}.`),
            T(`餘式 ${lin(p, q)}。`, `Remainder: ${lin(p, q)}.`),
          ],
        };
      }
      // synthetic division quotient
      const a = r.nz(-3, 3), Q = [1, r.int(-5, 5), r.int(-6, 6)], R = r.int(-8, 8);
      const f = [1, Q[1] - a, Q[2] - a * Q[1], R - a * Q[2]];
      const right = T(`商式 ${poly(Q)}，餘式 ${num(R)}`, `quotient ${poly(Q)}, remainder ${num(R)}`);
      return {
        q: T(`(${poly(f)}) ÷ (${lin(1, -a)}) 的商式與餘式是？`, `Divide (${poly(f)}) by (${lin(1, -a)}). What are the quotient and remainder?`),
        ans: choice(right, [
          T(`商式 ${poly([1, Q[1] - 2 * a, Q[2]])}，餘式 ${num(R)}`, `quotient ${poly([1, Q[1] - 2 * a, Q[2]])}, remainder ${num(R)}`),
          T(`商式 ${poly(Q)}，餘式 ${num(-R)}`, `quotient ${poly(Q)}, remainder ${num(-R)}`),
          T(`商式 ${poly([1, f[1] - a, f[2] - a * (f[1] - a)])}，餘式 ${num(pev(f, -a))}`, `quotient ${poly([1, f[1] - a, f[2] - a * (f[1] - a)])}, remainder ${num(pev(f, -a))}`),
          T(`商式 ${poly([1, Q[1], Q[2] + 1])}，餘式 ${num(R - a)}`, `quotient ${poly([1, Q[1], Q[2] + 1])}, remainder ${num(R - a)}`),
        ]),
        sol: [
          T(`用綜合除法，除以 x − ${par(a)} 就用 ${num(a)}。係數：1, ${num(f[1])}, ${num(f[2])}, ${num(f[3])}。`, `Use synthetic division with ${num(a)} (for x − ${par(a)}). Coefficients: 1, ${num(f[1])}, ${num(f[2])}, ${num(f[3])}.`),
          T(`往下拉 1；1 × ${par(a)} + ${par(f[1])} = ${num(Q[1])}；${par(Q[1])} × ${par(a)} + ${par(f[2])} = ${num(Q[2])}；${par(Q[2])} × ${par(a)} + ${par(f[3])} = ${num(R)}。`, `Bring down 1; 1 × ${par(a)} + ${par(f[1])} = ${num(Q[1])}; ${par(Q[1])} × ${par(a)} + ${par(f[2])} = ${num(Q[2])}; ${par(Q[2])} × ${par(a)} + ${par(f[3])} = ${num(R)}.`),
          T(`商式 ${poly(Q)}，餘式 ${num(R)}。驗算：f(${num(a)}) = ${num(pev(f, a))} 正是餘式。`, `Quotient ${poly(Q)}, remainder ${num(R)}. Check: f(${num(a)}) = ${num(pev(f, a))}, the remainder.`),
        ],
      };
    },
  },
  {
    id: 'g10-exp-log',
    grade: 10,
    name: T('指數與對數的運算', 'Exponents and logarithms'),
    cur: { us: 'Algebra 2 · F-LE.A.4', tw: '高一 數與式（指數與對數）', aops: 'Intermediate Algebra' },
    at: { us: 11 },
    gen(r) {
      const t = r.int(0, 3);
      const LOG = (b, x) => `log<sub>${b}</sub> ${x}`;
      if (t === 0) {
        const c = r.pick([2, 3, 5]), m = r.int(1, c === 2 ? 3 : 2);
        let n; do n = r.int(-3, c === 2 ? 6 : 4); while (n === 0 || n === m);
        const base = c ** m, N = n > 0 ? num(c ** n) : frac(1, c ** -n), v = red(n, m);
        return {
          q: T(`求 ${LOG(base, N)} 的值。（可用分數）`, `Evaluate ${LOG(base, N)}. (Fractions are fine.)`),
          ans: ansFrac(...v),
          sol: [
            T(`把底數和真數都寫成 ${c} 的次方：${base} = ${pow(c, m)}，${N} = ${pow(c, n < 0 ? '−' + -n : n)}。`, `Write both as powers of ${c}: ${base} = ${pow(c, m)}, ${N} = ${pow(c, n < 0 ? '−' + -n : n)}.`),
            T(`設 ${LOG(base, N)} = y，則 (${pow(c, m)})<sup>y</sup> = ${pow(c, n < 0 ? '−' + -n : n)}，所以 ${m}y = ${num(n)}。`, `Let ${LOG(base, N)} = y. Then (${pow(c, m)})<sup>y</sup> = ${pow(c, n < 0 ? '−' + -n : n)}, so ${m}y = ${num(n)}.`),
            T(`y = ${fr(v)}。`, `y = ${fr(v)}.`),
          ],
          hint: T('log_b N = y 的意思是 b^y = N。', 'log_b N = y means b^y = N.'),
        };
      }
      if (t === 1) {
        const mode = r.int(0, 3);
        if (mode === 0) {
          const [a, b] = r.pick([[2, 5], [4, 25], [8, 125], [20, 5], [25, 40], [4, 250], [50, 20], [2, 50], [16, 625], [125, 80]]), k = Math.round(Math.log10(a * b));
          return {
            q: T(`計算 log ${a} + log ${b}。（log 是以 10 為底）`, `Evaluate log ${a} + log ${b}. (log means base 10.)`),
            ans: ansNum(k),
            sol: [T('對數加法：log a + log b = log(ab)。', 'Product rule: log a + log b = log(ab).'), T(`= log(${a} × ${b}) = log ${num(a * b)}。`, `= log(${a} × ${b}) = log ${num(a * b)}.`), T(`${num(a * b)} = 10<sup>${k}</sup>，所以答案是 ${k}。`, `${num(a * b)} = 10<sup>${k}</sup>, so the answer is ${k}.`)],
          };
        }
        const c = r.pick([2, 3, 5]);
        if (mode === 1) {
          const Y = r.pick([3, 5, 6, 7, 10, 11].filter((y) => y % c)), k = r.int(1, c === 2 ? 5 : 3), X = Y * c ** k;
          return {
            q: T(`計算 ${LOG(c, X)} − ${LOG(c, Y)}。`, `Evaluate ${LOG(c, X)} − ${LOG(c, Y)}.`),
            ans: ansNum(k),
            sol: [T('對數減法：log_b M − log_b N = log_b (M/N)。', 'Quotient rule: log_b M − log_b N = log_b (M/N).'), T(`= ${LOG(c, `(${X} ÷ ${Y})`)} = ${LOG(c, c ** k)}。`, `= ${LOG(c, `(${X} ÷ ${Y})`)} = ${LOG(c, c ** k)}.`), T(`${c ** k} = ${pow(c, k)}，答案 ${k}。`, `${c ** k} = ${pow(c, k)}, so the answer is ${k}.`)],
          };
        }
        if (mode === 2) {
          const s = r.pick([2, 3, 4, 5, 6, 7].filter((x) => x % c)), j = r.int(1, 2), A = s * c ** j, B = s * s;
          return {
            q: T(`計算 2 ${LOG(c, A)} − ${LOG(c, B)}。`, `Evaluate 2 ${LOG(c, A)} − ${LOG(c, B)}.`),
            ans: ansNum(2 * j),
            sol: [T('次方規則：2 log_b A = log_b A²。', 'Power rule: 2 log_b A = log_b A².'), T(`= ${LOG(c, A * A)} − ${LOG(c, B)} = ${LOG(c, `(${A * A} ÷ ${B})`)} = ${LOG(c, c ** (2 * j))}。`, `= ${LOG(c, A * A)} − ${LOG(c, B)} = ${LOG(c, `(${A * A} ÷ ${B})`)} = ${LOG(c, c ** (2 * j))}.`), T(`${c ** (2 * j)} = ${pow(c, 2 * j)}，答案 ${2 * j}。`, `${c ** (2 * j)} = ${pow(c, 2 * j)}, so the answer is ${2 * j}.`)],
          };
        }
        const b = r.pick([2, 3, 5, 7].filter((x) => x !== c)), k = r.int(2, 4);
        return {
          q: T(`計算 ${LOG(c, b)} × ${LOG(b, c ** k)}。`, `Evaluate ${LOG(c, b)} × ${LOG(b, c ** k)}.`),
          ans: ansNum(k),
          sol: [T('換底公式：log_a b = (log b)/(log a)。', 'Change of base: log_a b = (log b)/(log a).'), T(`乘積 = ${frac(`log ${b}`, `log ${c}`)} × ${frac(`log ${c ** k}`, `log ${b}`)} = ${frac(`log ${c ** k}`, `log ${c}`)}，log ${b} 消掉了。`, `Product = ${frac(`log ${b}`, `log ${c}`)} × ${frac(`log ${c ** k}`, `log ${b}`)} = ${frac(`log ${c ** k}`, `log ${c}`)}; the log ${b} cancels.`), T(`= ${LOG(c, c ** k)} = ${k}。`, `= ${LOG(c, c ** k)} = ${k}.`)],
        };
      }
      if (t === 2) {
        const c = r.pick([2, 3]), m = r.int(1, c === 2 ? 3 : 2); let n; do n = r.int(-2, c === 2 ? 7 : 4); while (n === 0);
        const p = r.int(-3, 3), base = c ** m, rhs = n > 0 ? num(c ** n) : frac(1, c ** -n), x = fsub(red(n, m), [p, 1]);
        return {
          q: T(`解方程式 ${base}<sup>${lin(1, p)}</sup> = ${rhs}。（可用分數）`, `Solve ${base}<sup>${lin(1, p)}</sup> = ${rhs}. (Fractions are fine.)`),
          ans: ansFrac(...x),
          sol: [
            T(`化成同底數 ${c}：左邊 = ${c}<sup>${m === 1 ? '' : m}(${lin(1, p)})</sup>，右邊 = ${pow(c, n < 0 ? '−' + -n : n)}。`, `Use the same base ${c}: left = ${c}<sup>${m === 1 ? '' : m}(${lin(1, p)})</sup>, right = ${pow(c, n < 0 ? '−' + -n : n)}.`),
            T(`指數相等：${m === 1 ? '' : m}(${lin(1, p)}) = ${num(n)}。`, `Set the exponents equal: ${m === 1 ? '' : m}(${lin(1, p)}) = ${num(n)}.`),
            T(`${lin(1, p)} = ${fr(red(n, m))} ⇒ x = ${fr(x)}。`, `${lin(1, p)} = ${fr(red(n, m))} ⇒ x = ${fr(x)}.`),
          ],
        };
      }
      const [c, d] = r.pick([[2, 2], [2, 3], [2, 4], [3, 2], [3, 3], [5, 2]]); let p; do p = r.nz(-3, 3); while (p % d === 0);
      const base = c ** d, v = p > 0 ? [c ** p, 1] : [1, c ** -p];
      return {
        q: T(`計算 ${base}<sup>${p < 0 ? '−' : ''}${Math.abs(p)}/${d}</sup>。（可用分數）`, `Evaluate ${base}<sup>${p < 0 ? '−' : ''}${Math.abs(p)}/${d}</sup>. (Fractions are fine.)`),
        ans: ansFrac(...v),
        sol: [
          T(`分數指數：a<sup>m/n</sup> = (ⁿ√a)<sup>m</sup>。先開 ${d} 次方根：${d === 2 ? '√' : d === 3 ? '∛' : '∜'}${base} = ${c}。`, `Fractional exponent: a<sup>m/n</sup> = (ⁿ√a)<sup>m</sup>. First take the ${d === 2 ? 'square' : d === 3 ? 'cube' : 'fourth'} root: ${d === 2 ? '√' : d === 3 ? '∛' : '∜'}${base} = ${c}.`),
          T(`再算 ${Math.abs(p)} 次方：${pow(c, Math.abs(p))} = ${c ** Math.abs(p)}。`, `Then raise it to the power ${Math.abs(p)}: ${pow(c, Math.abs(p))} = ${c ** Math.abs(p)}.`),
          p < 0 ? T(`負指數表示倒數：答案 ${frac(1, c ** -p)}。`, `A negative exponent means reciprocal: the answer is ${frac(1, c ** -p)}.`) : T(`答案 ${c ** p}。`, `The answer is ${c ** p}.`),
        ],
      };
    },
  },
  {
    id: 'g10-log-digits',
    grade: 10,
    name: T('常用對數的應用：位數', 'Common logarithms: how many digits?'),
    cur: { tw: '高一 數與式（常用對數）', aops: 'Intermediate Algebra' },
    gen(r) {
      const LG = { 2: '0.3010', 3: '0.4771', 5: '0.6990', 6: '0.7782', 7: '0.8451' };
      const digits = (b, n) => (BigInt(b) ** BigInt(n)).toString().length;
      const t = r.int(0, 2);
      if (t < 2) {
        let b, n, ap;
        do { b = r.pick(t === 0 ? [2, 3, 5, 6, 7] : [2, 3]); n = r.int(15, 99); ap = clean(n * +LG[b], 4); } while (Math.floor(ap) + 1 !== digits(b, n));
        const D = digits(b, n);
        if (t === 0) return {
          q: T(`已知 log ${b} ≈ ${LG[b]}，${pow(b, n)} 是幾位數？`, `Given log ${b} ≈ ${LG[b]}, how many digits does ${pow(b, n)} have?`),
          ans: ansNum(D),
          sol: [
            T('一個正整數 N 若 10<sup>k</sup> ≤ N < 10<sup>k+1</sup>，它就是 k + 1 位數；也就是 log N 的整數部分 + 1。', 'If 10<sup>k</sup> ≤ N < 10<sup>k+1</sup>, then N has k + 1 digits: the integer part of log N, plus 1.'),
            T(`log ${pow(b, n)} = ${n} × log ${b} ≈ ${n} × ${LG[b]} = ${ap}。`, `log ${pow(b, n)} = ${n} × log ${b} ≈ ${n} × ${LG[b]} = ${ap}.`),
            T(`所以 10<sup>${Math.floor(ap)}</sup> ≤ ${pow(b, n)} < 10<sup>${Math.floor(ap) + 1}</sup>，是 ${Math.floor(ap)} + 1 = ${D} 位數。`, `So 10<sup>${Math.floor(ap)}</sup> ≤ ${pow(b, n)} < 10<sup>${Math.floor(ap) + 1}</sup>: it has ${Math.floor(ap)} + 1 = ${D} digits.`),
          ],
        };
        return {
          q: T(`已知 log ${b} ≈ ${LG[b]}。把 (${frac(1, b)})<sup>${n}</sup> 寫成小數，從小數點後第幾位開始出現不是 0 的數字？`, `Given log ${b} ≈ ${LG[b]}. Written as a decimal, (${frac(1, b)})<sup>${n}</sup> has its first nonzero digit in which decimal place?`),
          ans: ansNum(D),
          sol: [
            T(`log (${frac(1, b)})<sup>${n}</sup> = −${n} × ${LG[b]} = −${ap}。`, `log (${frac(1, b)})<sup>${n}</sup> = −${n} × ${LG[b]} = −${ap}.`),
            T(`−${ap} 介於 −${Math.floor(ap) + 1} 和 −${Math.floor(ap)} 之間，所以這個數介於 10<sup>−${Math.floor(ap) + 1}</sup> 和 10<sup>−${Math.floor(ap)}</sup> 之間。`, `−${ap} is between −${Math.floor(ap) + 1} and −${Math.floor(ap)}, so the number is between 10<sup>−${Math.floor(ap) + 1}</sup> and 10<sup>−${Math.floor(ap)}</sup>.`),
            T(`它至少是 10<sup>−${D}</sup> = 0.00…01（1 在第 ${D} 位），所以第一個非零數字在小數點後第 ${D} 位。`, `It is at least 10<sup>−${D}</sup> = 0.00…01 (the 1 in place ${D}), so the first nonzero digit is in decimal place ${D}.`),
          ],
        };
      }
      let k, n;
      do { k = r.int(3, 15); n = 1; while (2n ** BigInt(n) <= 10n ** BigInt(k)) n++; } while (Math.floor(k / 0.301) + 1 !== n);
      const who = r.pick([['細菌', 'bacteria'], ['病毒', 'virus particles'], ['酵母菌', 'yeast cells']]);
      return {
        q: T(`${who[0]}的數量每小時變成 2 倍。從 1 個開始，最少要經過幾小時，數量才會超過 10<sup>${k}</sup> 個？（log 2 ≈ 0.3010）`, `Starting from 1, the number of ${who[1]} doubles every hour. After how many whole hours will there first be more than 10<sup>${k}</sup>? (log 2 ≈ 0.3010)`),
        ans: ansNum(n),
        sol: [
          T(`n 小時後有 ${pow(2, 'n')} 個，要 ${pow(2, 'n')} > 10<sup>${k}</sup>。`, `After n hours there are ${pow(2, 'n')}; we need ${pow(2, 'n')} > 10<sup>${k}</sup>.`),
          T(`兩邊取 log：n × 0.3010 > ${k} ⇒ n > ${k} ÷ 0.3010 ≈ ${(k / 0.301).toFixed(2)}。`, `Take log of both sides: n × 0.3010 > ${k} ⇒ n > ${k} ÷ 0.3010 ≈ ${(k / 0.301).toFixed(2)}.`),
          T(`最小的整數 n = ${n}。`, `The smallest whole number is n = ${n}.`),
        ],
      };
    },
  },
  {
    id: 'g10-arith-seq',
    grade: 10,
    name: T('等差數列與等差級數', 'Arithmetic sequences and series'),
    cur: { us: 'Algebra 2 · F-BF.A.2', tw: '高一 數列與級數', aops: 'Intro Algebra' },
    at: { us: 11 },
    gen(r) {
      const t = r.int(0, 4), a1 = r.int(-10, 20), d = r.nz(-6, 8);
      if (t === 0) {
        const n = r.int(10, 40), an = a1 + (n - 1) * d;
        return {
          q: T(`等差數列 ${[0, 1, 2, 3].map((i) => num(a1 + i * d)).join(', ')}, … 的第 ${n} 項是多少？`, `Find term number ${n} of the arithmetic sequence ${[0, 1, 2, 3].map((i) => num(a1 + i * d)).join(', ')}, …`),
          ans: ansNum(an),
          sol: [T(`首項 a₁ = ${num(a1)}，公差 d = ${num(a1 + d)} − ${par(a1)} = ${num(d)}。`, `First term a₁ = ${num(a1)}, common difference d = ${num(a1 + d)} − ${par(a1)} = ${num(d)}.`), T('一般項 aₙ = a₁ + (n − 1)d。', 'General term aₙ = a₁ + (n − 1)d.'), T(`a<sub>${n}</sub> = ${num(a1)} + ${n - 1} × ${par(d)} = ${num(an)}。`, `a<sub>${n}</sub> = ${num(a1)} + ${n - 1} × ${par(d)} = ${num(an)}.`)],
        };
      }
      if (t === 1) {
        const m = r.int(2, 6), k = m + r.int(2, 8), n = r.int(15, 30), am = a1 + (m - 1) * d, ak = a1 + (k - 1) * d, an = a1 + (n - 1) * d;
        return {
          q: T(`等差數列中 a<sub>${m}</sub> = ${num(am)}，a<sub>${k}</sub> = ${num(ak)}，求 a<sub>${n}</sub>。`, `In an arithmetic sequence, a<sub>${m}</sub> = ${num(am)} and a<sub>${k}</sub> = ${num(ak)}. Find a<sub>${n}</sub>.`),
          ans: ansNum(an),
          sol: [T(`從第 ${m} 項到第 ${k} 項走了 ${k - m} 個公差：${k - m}d = ${num(ak)} − ${par(am)} = ${num(ak - am)}，d = ${num(d)}。`, `From term ${m} to term ${k} is ${k - m} steps: ${k - m}d = ${num(ak)} − ${par(am)} = ${num(ak - am)}, so d = ${num(d)}.`), T(`再從第 ${m} 項走 ${n - m} 步到第 ${n} 項：a<sub>${n}</sub> = ${num(am)} + ${n - m} × ${par(d)}。`, `Then go ${n - m} more steps to term ${n}: a<sub>${n}</sub> = ${num(am)} + ${n - m} × ${par(d)}.`), T(`= ${num(an)}。`, `= ${num(an)}.`)],
        };
      }
      if (t === 2) {
        const n = r.int(8, 30), an = a1 + (n - 1) * d, S = (n * (a1 + an)) / 2;
        return {
          q: T(`求等差級數 ${[0, 1, 2].map((i) => par(a1 + i * d)).join(' + ')} + … 前 ${n} 項的和。`, `Find the sum of the first ${n} terms of the arithmetic series ${[0, 1, 2].map((i) => par(a1 + i * d)).join(' + ')} + …`),
          ans: ansNum(S),
          sol: [T(`a₁ = ${num(a1)}，d = ${num(d)}，末項 a<sub>${n}</sub> = ${num(a1)} + ${n - 1} × ${par(d)} = ${num(an)}。`, `a₁ = ${num(a1)}, d = ${num(d)}, last term a<sub>${n}</sub> = ${num(a1)} + ${n - 1} × ${par(d)} = ${num(an)}.`), T('等差級數和 Sₙ = n(a₁ + aₙ) ÷ 2（首項加末項，乘項數，除以 2）。', 'Arithmetic series: Sₙ = n(a₁ + aₙ) ÷ 2 (first plus last, times the count, divided by 2).'), T(`S<sub>${n}</sub> = ${n} × (${num(a1)} + ${par(an)}) ÷ 2 = ${n} × ${num(a1 + an)} ÷ 2 = ${num(S)}。`, `S<sub>${n}</sub> = ${n} × (${num(a1)} + ${par(an)}) ÷ 2 = ${n} × ${num(a1 + an)} ÷ 2 = ${num(S)}.`)],
        };
      }
      if (t === 3) {
        const s = r.int(12, 30), dd = r.int(1, 4), R = r.int(10, 30), last = s + (R - 1) * dd, S = (R * (s + last)) / 2;
        return {
          q: T(`一座劇場第一排有 ${s} 個座位，之後每排比前一排多 ${dd} 個，共 ${R} 排。全部有幾個座位？`, `A theater has ${s} seats in the first row, and each row has ${dd} more seats than the one before. There are ${R} rows. How many seats in all?`),
          ans: ansNum(S),
          sol: [T(`每排座位數是等差數列：首項 ${s}，公差 ${dd}。`, `Seats per row form an arithmetic sequence: first term ${s}, difference ${dd}.`), T(`最後一排：${s} + ${R - 1} × ${dd} = ${last}。`, `Last row: ${s} + ${R - 1} × ${dd} = ${last}.`), T(`總數 = ${R} × (${s} + ${last}) ÷ 2 = ${num(S)}。`, `Total = ${R} × (${s} + ${last}) ÷ 2 = ${num(S)}.`)],
        };
      }
      const m = r.pick([3, 4, 6, 7, 8, 9, 11, 12, 13]), lo = r.int(10, 100), hi = lo + r.int(60, 250);
      const f = Math.ceil(lo / m) * m, l = Math.floor(hi / m) * m, cnt = (l - f) / m + 1, S = (cnt * (f + l)) / 2;
      return {
        q: T(`${lo} 到 ${hi} 之間（含兩端）所有 ${m} 的倍數的和是多少？`, `What is the sum of all multiples of ${m} from ${lo} to ${hi} (inclusive)?`),
        ans: ansNum(S),
        sol: [T(`最小的是 ${f}，最大的是 ${l}，它們是公差 ${m} 的等差數列。`, `The smallest is ${f} and the largest is ${l}; they form an arithmetic sequence with difference ${m}.`), T(`項數 = (${l} − ${f}) ÷ ${m} + 1 = ${cnt}。`, `Number of terms = (${l} − ${f}) ÷ ${m} + 1 = ${cnt}.`), T(`和 = ${cnt} × (${f} + ${l}) ÷ 2 = ${num(S)}。`, `Sum = ${cnt} × (${f} + ${l}) ÷ 2 = ${num(S)}.`)],
      };
    },
  },
  {
    id: 'g10-geom-seq',
    grade: 10,
    name: T('等比數列與等比級數', 'Geometric sequences and series'),
    cur: { us: 'Algebra 2 · A-SSE.B.4', tw: '高一 數列與級數', aops: 'Intro Algebra' },
    at: { us: 11 },
    gen(r) {
      const t = r.int(0, 4), a1 = r.nz(-5, 5), q = r.pick([2, 3, -2, -3]);
      if (t === 0) {
        const n = r.int(4, q === 3 || q === -3 ? 7 : 9), an = a1 * q ** (n - 1);
        return {
          q: T(`等比數列 ${[0, 1, 2].map((i) => num(a1 * q ** i)).join(', ')}, … 的第 ${n} 項是多少？`, `Find term number ${n} of the geometric sequence ${[0, 1, 2].map((i) => num(a1 * q ** i)).join(', ')}, …`),
          ans: ansNum(an),
          sol: [T(`首項 a₁ = ${num(a1)}，公比 r = ${num(a1 * q)} ÷ ${par(a1)} = ${num(q)}。`, `First term a₁ = ${num(a1)}, common ratio r = ${num(a1 * q)} ÷ ${par(a1)} = ${num(q)}.`), T('一般項 aₙ = a₁ × r<sup>n−1</sup>。', 'General term aₙ = a₁ × r<sup>n−1</sup>.'), T(`a<sub>${n}</sub> = ${num(a1)} × ${par(q)}<sup>${n - 1}</sup> = ${num(a1)} × ${num(q ** (n - 1))} = ${num(an)}。`, `a<sub>${n}</sub> = ${num(a1)} × ${par(q)}<sup>${n - 1}</sup> = ${num(a1)} × ${num(q ** (n - 1))} = ${num(an)}.`)],
        };
      }
      if (t === 1) {
        const a2 = a1 * q, a5 = a1 * q ** 4;
        return {
          q: T(`等比數列中 a₂ = ${num(a2)}，a₅ = ${num(a5)}。求首項 a₁。`, `In a geometric sequence, a₂ = ${num(a2)} and a₅ = ${num(a5)}. Find the first term a₁.`),
          ans: ansNum(a1),
          sol: [T(`a₅ = a₂ × r³，所以 r³ = ${num(a5)} ÷ ${par(a2)} = ${num(q ** 3)}。`, `a₅ = a₂ × r³, so r³ = ${num(a5)} ÷ ${par(a2)} = ${num(q ** 3)}.`), T(`r = ${num(q)}（實數的立方根只有一個）。`, `r = ${num(q)} (a real number has only one real cube root).`), T(`a₁ = a₂ ÷ r = ${num(a2)} ÷ ${par(q)} = ${num(a1)}。`, `a₁ = a₂ ÷ r = ${num(a2)} ÷ ${par(q)} = ${num(a1)}.`)],
        };
      }
      if (t === 2) {
        const n = r.int(4, 8), S = (a1 * (q ** n - 1)) / (q - 1);
        return {
          q: T(`求等比級數 ${[0, 1, 2].map((i) => par(a1 * q ** i)).join(' + ')} + … 前 ${n} 項的和。`, `Find the sum of the first ${n} terms of ${[0, 1, 2].map((i) => par(a1 * q ** i)).join(' + ')} + …`),
          ans: ansNum(S),
          sol: [T(`a₁ = ${num(a1)}，r = ${num(q)}。`, `a₁ = ${num(a1)}, r = ${num(q)}.`), T('等比級數和 Sₙ = a₁(rⁿ − 1) ÷ (r − 1)。', 'Geometric series: Sₙ = a₁(rⁿ − 1) ÷ (r − 1).'), T(`S<sub>${n}</sub> = ${num(a1)} × (${par(q)}<sup>${n}</sup> − 1) ÷ (${num(q)} − 1) = ${num(a1)} × ${num(q ** n - 1)} ÷ ${par(q - 1)} = ${num(S)}。`, `S<sub>${n}</sub> = ${num(a1)} × (${par(q)}<sup>${n}</sup> − 1) ÷ (${num(q)} − 1) = ${num(a1)} × ${num(q ** n - 1)} ÷ ${par(q - 1)} = ${num(S)}.`)],
        };
      }
      if (t === 3) {
        let p, s; do { p = r.int(1, 6); s = r.int(1, 6); } while (p === s);
        const k = r.int(1, 4), A = k * p * p, B = k * s * s, G = k * p * s;
        return {
          q: T(`若 ${A}, x, ${B} 成等比數列且 x > 0，求 x。`, `If ${A}, x, ${B} form a geometric sequence and x > 0, find x.`),
          ans: ansNum(G),
          sol: [T(`等比：x ÷ ${A} = ${B} ÷ x，所以 x² = ${A} × ${B} = ${A * B}（x 是等比中項）。`, `Geometric: x ÷ ${A} = ${B} ÷ x, so x² = ${A} × ${B} = ${A * B} (x is the geometric mean).`), T(`x = √${A * B} = ${G}（取正）。`, `x = √${A * B} = ${G} (take the positive root).`), T(`驗算：公比 ${fracR(G, A)}，${A} → ${G} → ${B}。`, `Check: the ratio is ${fracR(G, A)}, and ${A} → ${G} → ${B}.`)],
        };
      }
      const s = r.int(2, 9) * 10, m = r.pick([2, 3]), h = r.int(3, 6);
      return {
        q: T(`實驗室培養 ${s} 個細胞，每小時數量變成 ${m} 倍。${h} 小時後有多少個細胞？`, `A lab starts with ${s} cells and the number multiplies by ${m} every hour. How many cells are there after ${h} hours?`),
        ans: ansNum(s * m ** h),
        sol: [T(`每小時乘 ${m}，是公比 ${m} 的等比數列。`, `Multiplying by ${m} each hour is a geometric sequence with ratio ${m}.`), T(`${h} 小時後 = ${s} × ${m}<sup>${h}</sup> = ${s} × ${m ** h}。`, `After ${h} hours: ${s} × ${m}<sup>${h}</sup> = ${s} × ${m ** h}.`), T(`= ${num(s * m ** h)} 個。`, `= ${num(s * m ** h)} cells.`)],
      };
    },
  },
  {
    id: 'g10-perm-comb',
    grade: 10,
    name: T('排列與組合', 'Permutations and combinations'),
    cur: { us: 'Geometry · S-CP.B.9 (+)', tw: '高一 排列組合', aops: 'Intro Counting & Probability' },
    gen(r) {
      const t = r.int(0, 5);
      if (t === 0) {
        const n = r.int(4, 7), mode = r.int(0, 2), nm = r.sample(NAMES, 2);
        const tog = 2 * fact(n - 1), all = fact(n);
        const v = mode === 0 ? all : mode === 1 ? tog : all - tog;
        return {
          q: mode === 0 ? T(`${n} 個人排成一列拍照，有幾種排法？`, `${n} people line up in a row for a photo. How many orders are possible?`)
            : mode === 1 ? T(`${n} 個人排成一列，其中${nm[0][0]}和${nm[1][0]}一定要相鄰，有幾種排法？`, `${n} people line up in a row, and ${nm[0][1]} and ${nm[1][1]} must stand next to each other. How many orders?`)
              : T(`${n} 個人排成一列，其中${nm[0][0]}和${nm[1][0]}不能相鄰，有幾種排法？`, `${n} people line up in a row, and ${nm[0][1]} and ${nm[1][1]} must NOT stand next to each other. How many orders?`),
          ans: ansNum(v),
          sol: mode === 0 ? [T(`第一個位置 ${n} 種選法，第二個 ${n - 1} 種，…，用乘法原理。`, `The first spot has ${n} choices, the next ${n - 1}, and so on (multiplication principle).`), T(`${n}! = ${num(all)}。`, `${n}! = ${num(all)}.`)]
            : [T(`把相鄰的兩人綁成一包，等於排 ${n - 1} 個單位：${n - 1}! = ${fact(n - 1)}；包內兩人可交換：× 2。`, `Tie the pair together as one block, so we arrange ${n - 1} units: ${n - 1}! = ${fact(n - 1)}; the two can swap inside: × 2.`),
              T(`相鄰的排法 = 2 × ${fact(n - 1)} = ${tog}。`, `Orders with them together = 2 × ${fact(n - 1)} = ${tog}.`),
              ...(mode === 2 ? [T(`不相鄰 = 全部 − 相鄰 = ${n}! − ${tog} = ${all} − ${tog} = ${all - tog}。`, `Not together = all − together = ${n}! − ${tog} = ${all} − ${tog} = ${all - tog}.`)] : [])],
        };
      }
      if (t === 1) {
        const n = r.int(6, 12), k = r.int(2, 4);
        return {
          q: T(`班上 ${n} 位同學要選出 ${k} 人組成委員會（不分職位），有幾種選法？`, `A committee of ${k} (no special roles) is chosen from ${n} students. How many committees are possible?`),
          ans: ansNum(C(n, k)),
          sol: [T('不分順序，用組合 C(n, k) = n! ÷ (k!(n − k)!)。', 'Order does not matter, so use combinations: C(n, k) = n! ÷ (k!(n − k)!).'), T(`C(${n}, ${k}) = ${frac(Array.from({ length: k }, (_, i) => n - i).join(' × '), `${k}!`)} = ${frac(P(n, k), fact(k))}。`, `C(${n}, ${k}) = ${frac(Array.from({ length: k }, (_, i) => n - i).join(' × '), `${k}!`)} = ${frac(P(n, k), fact(k))}.`), T(`= ${C(n, k)}。`, `= ${C(n, k)}.`)],
        };
      }
      if (t === 2) {
        const n = r.int(5, 12);
        return {
          q: T(`社團有 ${n} 位成員，要選出社長、副社長、總務各一人（不能兼任），有幾種選法？`, `A club of ${n} members chooses a president, a vice president and a treasurer (different people). How many ways?`),
          ans: ansNum(P(n, 3)),
          sol: [T('職位不同，順序有差，用排列 P(n, 3)。', 'The roles are different, so order matters: use permutations P(n, 3).'), T(`社長 ${n} 種，副社長 ${n - 1} 種，總務 ${n - 2} 種。`, `President: ${n} choices, vice president: ${n - 1}, treasurer: ${n - 2}.`), T(`${n} × ${n - 1} × ${n - 2} = ${P(n, 3)}。`, `${n} × ${n - 1} × ${n - 2} = ${P(n, 3)}.`)],
        };
      }
      if (t === 3) {
        const w = r.pick(['BANANA', 'LEVEL', 'APPLE', 'COFFEE', 'TOOTH', 'ELEVEN', 'BOOK', 'PEPPER', 'SUCCESS', 'TAIPEI', 'GOOGLE', 'BALLOON']);
        const cnt = {}; for (const ch of w) cnt[ch] = (cnt[ch] || 0) + 1;
        const reps = Object.entries(cnt).filter(([, v]) => v > 1), den = reps.reduce((p, [, v]) => p * fact(v), 1), v = fact(w.length) / den;
        return {
          q: T(`把 ${w} 的字母全部重新排列（不一定要是英文單字），共有幾種不同的排法？`, `How many different arrangements of the letters of ${w} are there (they need not be real words)?`),
          ans: ansNum(v),
          sol: [T(`共 ${w.length} 個字母，其中重複的：${reps.map(([c, k]) => `${c} 有 ${k} 個`).join('、')}。`, `There are ${w.length} letters; repeated ones: ${reps.map(([c, k]) => `${c} × ${k}`).join(', ')}.`), T('有重複物的排列：n! ÷ (各重複個數的階乘相乘)，因為相同字母互換不會產生新排法。', 'Permutations with repeats: n! ÷ (product of the factorials of the repeat counts), because swapping identical letters gives nothing new.'), T(`${w.length}! ÷ (${reps.map(([, k]) => k + '!').join(' × ')}) = ${num(fact(w.length))} ÷ ${den} = ${num(v)}。`, `${w.length}! ÷ (${reps.map(([, k]) => k + '!').join(' × ')}) = ${num(fact(w.length))} ÷ ${den} = ${num(v)}.`)],
        };
      }
      if (t === 4) {
        const m = r.int(2, 6), n = r.int(2, 5);
        return {
          q: T(`棋盤狀街道往東 ${m} 格、往北 ${n} 格。從左下角走到右上角，只能往東或往北走，有幾條最短路徑？`, `A grid of streets is ${m} blocks east by ${n} blocks north. How many shortest paths go from the bottom-left corner to the top-right corner (moving only east or north)?`),
          ans: ansNum(C(m + n, m)),
          sol: [T(`每條最短路徑都是 ${m} 個「東」和 ${n} 個「北」排成一列。`, `Every shortest path is a row of ${m} E's and ${n} N's.`), T(`從 ${m + n} 步中選 ${m} 步往東：C(${m + n}, ${m})。`, `Choose which ${m} of the ${m + n} steps go east: C(${m + n}, ${m}).`), T(`= ${frac(fact(m + n), `${fact(m)} × ${fact(n)}`)} = ${C(m + n, m)}。`, `= ${frac(fact(m + n), `${fact(m)} × ${fact(n)}`)} = ${C(m + n, m)}.`)],
        };
      }
      const G = r.int(3, 6), B = r.int(3, 6), k = r.int(3, 4), mode = r.int(0, 1);
      const g = r.int(1, Math.min(G, k - 1));
      return {
        q: mode === 0 ? T(`從 ${G} 位女生和 ${B} 位男生中選 ${k} 人，恰好 ${g} 位女生，有幾種選法？`, `Choose ${k} people from ${G} girls and ${B} boys with exactly ${g} girl${g > 1 ? 's' : ''}. How many ways?`)
          : T(`從 ${G} 位女生和 ${B} 位男生中選 ${k} 人，至少要有 1 位女生，有幾種選法？`, `Choose ${k} people from ${G} girls and ${B} boys with at least one girl. How many ways?`),
        ans: ansNum(mode === 0 ? C(G, g) * C(B, k - g) : C(G + B, k) - C(B, k)),
        sol: mode === 0 ? [T(`女生選 ${g} 位：C(${G}, ${g}) = ${C(G, g)}；男生選 ${k - g} 位：C(${B}, ${k - g}) = ${C(B, k - g)}。`, `Girls: C(${G}, ${g}) = ${C(G, g)}; boys: C(${B}, ${k - g}) = ${C(B, k - g)}.`), T(`乘法原理：${C(G, g)} × ${C(B, k - g)} = ${C(G, g) * C(B, k - g)}。`, `Multiply: ${C(G, g)} × ${C(B, k - g)} = ${C(G, g) * C(B, k - g)}.`)]
          : [T('「至少一位」用補集：全部 − 全是男生。', '"At least one" → use the complement: all − all boys.'), T(`全部 C(${G + B}, ${k}) = ${C(G + B, k)}；全是男生 C(${B}, ${k}) = ${C(B, k)}。`, `All: C(${G + B}, ${k}) = ${C(G + B, k)}; all boys: C(${B}, ${k}) = ${C(B, k)}.`), T(`${C(G + B, k)} − ${C(B, k)} = ${C(G + B, k) - C(B, k)}。`, `${C(G + B, k)} − ${C(B, k)} = ${C(G + B, k) - C(B, k)}.`)],
      };
    },
  },
  {
    id: 'g10-probability',
    grade: 10,
    name: T('古典機率', 'Classical probability'),
    cur: { us: 'Geometry · S-CP.A / S-CP.B.9', tw: '高一 機率', aops: 'Intro Counting & Probability' },
    gen(r) {
      const t = r.int(0, 4);
      if (t === 0) {
        const s = r.int(3, 11); let w = 0; const ps = [];
        for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === s) { w++; ps.push(`(${a},${b})`); }
        return {
          q: T(`同時擲兩顆公正骰子，點數和為 ${s} 的機率是多少？（用最簡分數）`, `Two fair dice are rolled. What is the probability that the sum is ${s}? (Lowest terms.)`),
          ans: ansFrac(w, 36),
          sol: [T('兩顆骰子共有 6 × 6 = 36 種等可能的結果。', 'Two dice have 6 × 6 = 36 equally likely outcomes.'), T(`和為 ${s}：${ps.join('、')}，共 ${w} 種。`, `Sum ${s}: ${ps.join(', ')} — ${w} outcomes.`), T(`機率 = ${frac(w, 36)} = ${fracR(w, 36)}。`, `Probability = ${frac(w, 36)} = ${fracR(w, 36)}.`)],
        };
      }
      if (t === 1) {
        const R = r.int(3, 8), B = r.int(2, 7), N = R + B, mode = r.int(0, 2);
        const fav = mode === 0 ? C(R, 2) : mode === 1 ? C(B, 2) : R * B, lab = mode === 0 ? ['兩球都是紅球', 'both are red'] : mode === 1 ? ['兩球都是藍球', 'both are blue'] : ['一紅一藍', 'one is red and one is blue'];
        return {
          q: T(`袋中有 ${R} 顆紅球、${B} 顆藍球，同時取出 2 顆，${lab[0]}的機率是多少？（用最簡分數）`, `A bag has ${R} red and ${B} blue balls. Two are drawn at once. What is the probability that ${lab[1]}? (Lowest terms.)`),
          ans: ansFrac(fav, C(N, 2)),
          sol: [T(`所有取法：C(${N}, 2) = ${C(N, 2)}。`, `All possible draws: C(${N}, 2) = ${C(N, 2)}.`), mode === 2 ? T(`一紅一藍：C(${R}, 1) × C(${B}, 1) = ${R} × ${B} = ${R * B}。`, `One of each: C(${R}, 1) × C(${B}, 1) = ${R} × ${B} = ${R * B}.`) : T(`有利的取法：C(${mode === 0 ? R : B}, 2) = ${fav}。`, `Favorable draws: C(${mode === 0 ? R : B}, 2) = ${fav}.`), T(`機率 = ${frac(fav, C(N, 2))} = ${fracR(fav, C(N, 2))}。`, `Probability = ${frac(fav, C(N, 2))} = ${fracR(fav, C(N, 2))}.`)],
        };
      }
      if (t === 2) {
        const n = r.int(3, 7), k = r.int(0, n);
        return {
          q: T(`公正硬幣擲 ${n} 次，恰好出現 ${k} 次正面的機率是多少？（用最簡分數）`, `A fair coin is tossed ${n} times. What is the probability of exactly ${k} heads? (Lowest terms.)`),
          ans: ansFrac(C(n, k), 2 ** n),
          sol: [T(`每次 2 種結果，共 2<sup>${n}</sup> = ${2 ** n} 種等可能的結果。`, `Each toss has 2 outcomes: 2<sup>${n}</sup> = ${2 ** n} equally likely sequences.`), T(`選出哪 ${k} 次是正面：C(${n}, ${k}) = ${C(n, k)}。`, `Choose which ${k} tosses are heads: C(${n}, ${k}) = ${C(n, k)}.`), T(`機率 = ${frac(C(n, k), 2 ** n)} = ${fracR(C(n, k), 2 ** n)}。`, `Probability = ${frac(C(n, k), 2 ** n)} = ${fracR(C(n, k), 2 ** n)}.`)],
        };
      }
      if (t === 3) {
        const ev = r.pick([
          [['紅心或人頭牌（J、Q、K）', 'a heart or a face card (J, Q, K)'], 13, 12, 3],
          [['黑桃或 A', 'a spade or an ace'], 13, 4, 1],
          [['紅色牌或 K', 'a red card or a king'], 26, 4, 2],
          [['梅花或數字牌 2～10', 'a club or a number card 2–10'], 13, 36, 9],
          [['人頭牌或 A', 'a face card or an ace'], 12, 4, 0],
        ]);
        const [lab, a, b, both] = ev, w = a + b - both;
        return {
          q: T(`從一副 52 張的撲克牌中隨機抽一張，抽到${lab[0]}的機率是多少？（用最簡分數）`, `One card is drawn at random from a standard 52-card deck. What is the probability it is ${lab[1]}? (Lowest terms.)`),
          ans: ansFrac(w, 52),
          sol: [T(`第一類有 ${a} 張，第二類有 ${b} 張，兩者都是的有 ${both} 張。`, `The first kind has ${a} cards, the second ${b}, and ${both} are both.`), T(`排容原理：${a} + ${b} − ${both} = ${w} 張。`, `Inclusion-exclusion: ${a} + ${b} − ${both} = ${w} cards.`), T(`機率 = ${frac(w, 52)} = ${fracR(w, 52)}。`, `Probability = ${frac(w, 52)} = ${fracR(w, 52)}.`)],
        };
      }
      const n = r.int(4, 8), nm = r.sample(NAMES, 2);
      return {
        q: T(`${n} 個人隨機排成一列，${nm[0][0]}和${nm[1][0]}相鄰的機率是多少？（用最簡分數）`, `${n} people line up in a random order. What is the probability that ${nm[0][1]} and ${nm[1][1]} are next to each other? (Lowest terms.)`),
        ans: ansFrac(2, n),
        sol: [T(`全部排法 ${n}! = ${fact(n)}。`, `All orders: ${n}! = ${fact(n)}.`), T(`相鄰：綁成一包排 ${n - 1}! 種，再 × 2 = ${2 * fact(n - 1)}。`, `Together: tie them into one block, ${n - 1}! orders, × 2 = ${2 * fact(n - 1)}.`), T(`機率 = ${frac(2 * fact(n - 1), fact(n))} = ${fracR(2, n)}。`, `Probability = ${frac(2 * fact(n - 1), fact(n))} = ${fracR(2, n)}.`)],
      };
    },
  },
  {
    id: 'g10-complement-ie',
    grade: 10,
    name: T('補集計數與排容原理', 'Counting with complements and inclusion-exclusion'),
    cur: { tw: '高一 排列組合（排容原理）', aops: 'Intro Counting & Probability' },
    gen(r) {
      const t = r.int(0, 4);
      if (t === 0 || t === 1) {
        const N = r.int(5, 30) * 10;
        let a, b; do { a = r.int(2, 9); b = r.int(2, 12); } while (a === b || b % a === 0 || a % b === 0);
        const L = lcm(a, b), fa = Math.floor(N / a), fb = Math.floor(N / b), fl = Math.floor(N / L), either = fa + fb - fl;
        const neither = t === 1;
        return {
          q: neither ? T(`1 到 ${N} 的整數中，既不是 ${a} 的倍數、也不是 ${b} 的倍數的有幾個？`, `How many integers from 1 to ${N} are multiples of neither ${a} nor ${b}?`)
            : T(`1 到 ${N} 的整數中，是 ${a} 的倍數或 ${b} 的倍數的有幾個？`, `How many integers from 1 to ${N} are multiples of ${a} or ${b}?`),
          ans: ansNum(neither ? N - either : either),
          sol: [
            T(`${a} 的倍數：⌊${N}/${a}⌋ = ${fa}；${b} 的倍數：⌊${N}/${b}⌋ = ${fb}。`, `Multiples of ${a}: ⌊${N}/${a}⌋ = ${fa}; multiples of ${b}: ⌊${N}/${b}⌋ = ${fb}.`),
            T(`兩者都是 = ${L} 的倍數（最小公倍數）：⌊${N}/${L}⌋ = ${fl}，被算了兩次。`, `Both = multiples of ${L} (the LCM): ⌊${N}/${L}⌋ = ${fl}, which were counted twice.`),
            T(`排容：${fa} + ${fb} − ${fl} = ${either}。`, `Inclusion-exclusion: ${fa} + ${fb} − ${fl} = ${either}.`),
            ...(neither ? [T(`都不是 = ${N} − ${either} = ${N - either}。`, `Neither = ${N} − ${either} = ${N - either}.`)] : []),
          ],
        };
      }
      if (t === 2) {
        const A = r.int(12, 25), B = r.int(10, 22), both = r.int(3, Math.min(A, B) - 2), neither = r.int(1, 8), N = A + B - both + neither;
        const subj = r.pick([['數學', '物理', 'math', 'physics'], ['籃球', '游泳', 'basketball', 'swimming'], ['鋼琴', '畫畫', 'piano', 'drawing']]);
        return {
          q: T(`班上 ${N} 人，喜歡${subj[0]}的有 ${A} 人，喜歡${subj[1]}的有 ${B} 人，兩者都不喜歡的有 ${neither} 人。兩者都喜歡的有幾人？`, `In a class of ${N}, ${A} like ${subj[2]}, ${B} like ${subj[3]}, and ${neither} like neither. How many like both?`),
          ans: ansNum(both),
          sol: [T(`至少喜歡一種的人數 = ${N} − ${neither} = ${N - neither}。`, `People who like at least one = ${N} − ${neither} = ${N - neither}.`), T(`排容：|A ∪ B| = |A| + |B| − |A ∩ B|，所以 ${N - neither} = ${A} + ${B} − x。`, `Inclusion-exclusion: |A ∪ B| = |A| + |B| − |A ∩ B|, so ${N - neither} = ${A} + ${B} − x.`), T(`x = ${A + B} − ${N - neither} = ${both}。`, `x = ${A + B} − ${N - neither} = ${both}.`)],
        };
      }
      if (t === 3) {
        const d = r.int(1, 9), four = r.chance(0.4);
        const tot = four ? 9000 : 900, none = four ? 8 * 729 : 8 * 81;
        return {
          q: T(`${four ? '四' : '三'}位數中，至少有一個數字是 ${d} 的有幾個？`, `How many ${four ? 'four' : 'three'}-digit numbers have at least one digit equal to ${d}?`),
          ans: ansNum(tot - none),
          sol: [T(`用補集：先算「完全沒有 ${d}」的${four ? '四' : '三'}位數。`, `Use the complement: count the ${four ? 'four' : 'three'}-digit numbers with no ${d} at all.`), T(`首位不能是 0 也不能是 ${d}：8 種；其餘每位不能是 ${d}：9 種。共 8 × ${four ? '9 × 9 × 9' : '9 × 9'} = ${none}。`, `The first digit can't be 0 or ${d}: 8 choices; each other digit can't be ${d}: 9 choices. Total 8 × ${four ? '9 × 9 × 9' : '9 × 9'} = ${none}.`), T(`${four ? '四' : '三'}位數共 ${tot} 個，所以答案 = ${tot} − ${none} = ${tot - none}。`, `There are ${tot} ${four ? 'four' : 'three'}-digit numbers, so the answer is ${tot} − ${none} = ${tot - none}.`)],
        };
      }
      const N = r.int(4, 12) * 30 + r.int(0, 29);
      const f = (k) => Math.floor(N / k);
      const v = f(2) + f(3) + f(5) - f(6) - f(10) - f(15) + f(30);
      return {
        q: T(`1 到 ${N} 的整數中，能被 2、3 或 5 其中至少一個整除的有幾個？`, `How many integers from 1 to ${N} are divisible by at least one of 2, 3 or 5?`),
        ans: ansNum(v),
        sol: [T(`單獨：⌊${N}/2⌋ + ⌊${N}/3⌋ + ⌊${N}/5⌋ = ${f(2)} + ${f(3)} + ${f(5)}。`, `Singles: ⌊${N}/2⌋ + ⌊${N}/3⌋ + ⌊${N}/5⌋ = ${f(2)} + ${f(3)} + ${f(5)}.`), T(`兩兩：⌊${N}/6⌋ + ⌊${N}/10⌋ + ⌊${N}/15⌋ = ${f(6)} + ${f(10)} + ${f(15)}；三者：⌊${N}/30⌋ = ${f(30)}。`, `Pairs: ⌊${N}/6⌋ + ⌊${N}/10⌋ + ⌊${N}/15⌋ = ${f(6)} + ${f(10)} + ${f(15)}; all three: ⌊${N}/30⌋ = ${f(30)}.`), T(`排容：${f(2) + f(3) + f(5)} − ${f(6) + f(10) + f(15)} + ${f(30)} = ${v}。`, `Inclusion-exclusion: ${f(2) + f(3) + f(5)} − ${f(6) + f(10) + f(15)} + ${f(30)} = ${v}.`)],
      };
    },
  },
  {
    id: 'g10-amc10-geom',
    grade: 10,
    name: T('AMC 10 風格幾何', 'AMC 10-style geometry'),
    cur: { aops: 'AMC 10 · Intro Geometry' },
    gen(r) {
      const t = r.int(0, 5);
      if (t === 0 || t === 1 || t === 5) {
        const [a0, b0, c0] = r.pick(TRIPLES.slice(0, 4)), k = r.int(1, 3), a = a0 * k, b = b0 * k, c = c0 * k;
        if (t === 0) return {
          q: T(`直角三角形的三邊長為 ${a}、${b}、${c}，求它的內切圓半徑。`, `A right triangle has sides ${a}, ${b}, ${c}. Find the radius of its inscribed circle.`),
          ans: ansNum((a + b - c) / 2),
          sol: [T('內切圓的切點把邊分段：從直角頂點出發的兩段都是 r。', 'The tangent points split the sides; both segments from the right-angle vertex equal r.'), T('所以兩股和減斜邊 = 2r，即 r = (a + b − c) ÷ 2。', 'So (leg + leg) − hypotenuse = 2r, i.e. r = (a + b − c) ÷ 2.'), T(`r = (${a} + ${b} − ${c}) ÷ 2 = ${num((a + b - c) / 2)}。`, `r = (${a} + ${b} − ${c}) ÷ 2 = ${num((a + b - c) / 2)}.`), T(`驗算：面積 ${(a * b) / 2} = r × 半周長 = ${num((a + b - c) / 2)} × ${(a + b + c) / 2}。`, `Check: area ${(a * b) / 2} = r × semiperimeter = ${num((a + b - c) / 2)} × ${(a + b + c) / 2}.`)],
        };
        if (t === 1) return {
          q: T(`直角三角形兩股為 ${a}、${b}，求斜邊上的高。（可用分數）`, `A right triangle has legs ${a} and ${b}. Find the altitude to the hypotenuse. (Fractions are fine.)`),
          ans: ansNum(red(a * b, c)),
          sol: [T(`斜邊 = ${sqrt(`${a}² + ${b}²`)} = ${c}。`, `Hypotenuse = ${sqrt(`${a}² + ${b}²`)} = ${c}.`), T(`面積算兩次：½ × ${a} × ${b} = ½ × ${c} × h。`, `Compute the area two ways: ½ × ${a} × ${b} = ½ × ${c} × h.`), T(`h = ${a * b} ÷ ${c} = ${fracR(a * b, c)}。`, `h = ${a * b} ÷ ${c} = ${fracR(a * b, c)}.`)],
        };
        return {
          q: T(`一個 ${a} × ${b} 的長方形四個頂點都在一個圓上。這個圓的面積是多少？（用 π 表示）`, `All four corners of a rectangle with sides ${a} and ${b} lie on a circle. What is the area of the circle? (In terms of π.)`),
          ans: ansPi(c * c, 4),
          sol: [T('長方形的對角線是圓的直徑（直角對直徑）。', "The rectangle's diagonal is a diameter (a right angle is inscribed in a semicircle)."), T(`對角線 = ${sqrt(`${a}² + ${b}²`)} = ${c}，半徑 ${fracR(c, 2)}。`, `Diagonal = ${sqrt(`${a}² + ${b}²`)} = ${c}, so the radius is ${fracR(c, 2)}.`), T(`面積 = π × (${fracR(c, 2)})² = ${piF(c * c, 4)}。`, `Area = π × (${fracR(c, 2)})² = ${piF(c * c, 4)}.`)],
        };
      }
      if (t === 2) {
        const [s, A] = r.pick([[[13, 14, 15], 84], [[5, 5, 6], 12], [[5, 5, 8], 12], [[10, 13, 13], 60], [[7, 15, 20], 42], [[9, 10, 17], 36]]), k = r.int(1, 3);
        const [x, y, z] = s.map((v) => v * k), sp = (x + y + z) / 2;
        return {
          q: T(`三角形三邊長為 ${x}、${y}、${z}，求面積。`, `A triangle has sides ${x}, ${y}, ${z}. Find its area.`),
          ans: ansNum(A * k * k),
          sol: [T(`海龍公式：s = 半周長 = (${x} + ${y} + ${z}) ÷ 2 = ${sp}。`, `Heron's formula: s = semiperimeter = (${x} + ${y} + ${z}) ÷ 2 = ${sp}.`), T(`面積 = √[s(s − a)(s − b)(s − c)] = √(${sp} × ${sp - x} × ${sp - y} × ${sp - z})。`, `Area = √[s(s − a)(s − b)(s − c)] = √(${sp} × ${sp - x} × ${sp - y} × ${sp - z}).`), T(`= √${sp * (sp - x) * (sp - y) * (sp - z)} = ${A * k * k}。`, `= √${sp * (sp - x) * (sp - y) * (sp - z)} = ${A * k * k}.`)],
        };
      }
      if (t === 3) {
        const s = 2 * r.int(2, 8);
        return {
          q: T(`邊長 ${s} 的正方形內有一個內切圓。正方形在圓外的部分面積是多少？（寫成 a − bπ 的形式）`, `A circle is inscribed in a square of side ${s}. What is the area inside the square but outside the circle? (Answer in the form a − bπ.)`),
          fig: `<svg class="fig" viewBox="0 0 120 120" width="120" height="120" role="img"><rect x="10" y="10" width="100" height="100" class="f-accfill"/><circle cx="60" cy="60" r="50" class="f-soft"/></svg>`,
          ans: { type: 'num', v: s * s - (s * s / 4) * Math.PI, text: `${s * s}-${s * s / 4}π` },
          sol: [T(`圓的直徑 = 正方形邊長 = ${s}，半徑 ${s / 2}。`, `The circle's diameter equals the side, ${s}, so its radius is ${s / 2}.`), T(`正方形面積 ${s * s}，圓面積 π × ${s / 2}² = ${s * s / 4}π。`, `Square area ${s * s}; circle area π × ${s / 2}² = ${s * s / 4}π.`), T(`相減：${s * s} − ${s * s / 4 === 1 ? '' : s * s / 4}π。`, `Subtract: ${s * s} − ${s * s / 4 === 1 ? '' : s * s / 4}π.`)],
        };
      }
      const s = r.int(2, 12), [k, r0, d] = radRed(s * s, 3, 4);
      return {
        q: T(`正三角形邊長 ${s}，求面積。（用最簡根式）`, `An equilateral triangle has side ${s}. Find its area. (Simplest radical form.)`),
        ans: ansRad(s * s, 3, 4),
        sol: [T(`高把底邊平分，形成 30°-60°-90° 三角形：高 = ${fracR(s, 2)}√3。`, `The altitude bisects the base, forming a 30°-60°-90° triangle: height = ${fracR(s, 2)}√3.`), T(`面積 = ½ × 底 × 高 = ${frac('√3', 4)} × ${s}²。`, `Area = ½ × base × height = ${frac('√3', 4)} × ${s}².`), T(`= ${frac(`${s * s}√3`, 4)} = ${radF(k, r0, d)}。`, `= ${frac(`${s * s}√3`, 4)} = ${radF(k, r0, d)}.`)],
      };
    },
  },
  // =====================================================================================
  // GRADE 11
  // =====================================================================================
  {
    id: 'g11-complex',
    grade: 11,
    name: T('複數的運算', 'Complex numbers'),
    cur: { us: 'Algebra 2 · N-CN.A.1–2', tw: '高三 數甲 複數', aops: 'Intermediate Algebra' },
    at: { tw: 12 },
    gen(r) {
      const t = r.int(0, 5);
      if (t === 0) {
        const a = r.nz(-6, 6), b = r.nz(-6, 6), c = r.nz(-6, 6), d = r.nz(-6, 6);
        const re = a * c - b * d, im = a * d + b * c;
        return {
          q: T(`計算 (${cx(a, b)})(${cx(c, d)})。`, `Compute (${cx(a, b)})(${cx(c, d)}).`),
          ans: choice(cx(re, im), [cx(a * c + b * d, im), cx(re, -im), cx(a * c, b * d), cx(a * c + b * d, a * d - b * c)]),
          sol: [
            T('像多項式一樣分配展開，最後用 i² = −1。', 'Expand like binomials, then use i² = −1.'),
            T(`= ${par(a)}·${par(c)} + ${par(a)}·${par(d)}i + ${par(b)}·${par(c)}i + ${par(b)}·${par(d)}i²`, `= ${par(a)}·${par(c)} + ${par(a)}·${par(d)}i + ${par(b)}·${par(c)}i + ${par(b)}·${par(d)}i²`),
            T(`= ${num(a * c)} + ${par(a * d + b * c)}i + ${par(b * d)}(−1)`, `= ${num(a * c)} + ${par(a * d + b * c)}i + ${par(b * d)}(−1)`),
            T(`= ${cx(re, im)}。`, `= ${cx(re, im)}.`),
          ],
        };
      }
      if (t === 1) {
        const n = r.int(10, 205), k = n % 4, vals = ['1', 'i', '−1', '−i'];
        return {
          q: T(`i<sup>${n}</sup> = ?`, `What is i<sup>${n}</sup>?`),
          ans: choice(vals[k], vals.filter((_, j) => j !== k)),
          sol: [T('i 的次方每 4 個一循環：i¹ = i，i² = −1，i³ = −i，i⁴ = 1。', 'Powers of i repeat every 4: i¹ = i, i² = −1, i³ = −i, i⁴ = 1.'), T(`${n} ÷ 4 = ${Math.floor(n / 4)} 餘 ${k}，所以 i<sup>${n}</sup> = i<sup>${k}</sup>。`, `${n} ÷ 4 = ${Math.floor(n / 4)} remainder ${k}, so i<sup>${n}</sup> = i<sup>${k}</sup>.`), T(`= ${vals[k]}。`, `= ${vals[k]}.`)],
        };
      }
      if (t === 2) {
        const [p, q, h] = r.pick(TRIPLES.slice(0, 3)), k = r.int(1, 2), a = p * k * r.sign(), b = q * k * r.sign(), sw = r.chance(0.5);
        const [x, y] = sw ? [b, a] : [a, b];
        return {
          q: T(`求 |${cx(x, y)}|。`, `Find |${cx(x, y)}|.`),
          ans: ansNum(h * k),
          sol: [T('|a + bi| = √(a² + b²)，就是複數平面上到原點的距離。', '|a + bi| = √(a² + b²): the distance from the origin in the complex plane.'), T(`= √(${par(x)}² + ${par(y)}²) = √${x * x + y * y} = ${h * k}。`, `= √(${par(x)}² + ${par(y)}²) = √${x * x + y * y} = ${h * k}.`)],
        };
      }
      if (t === 3) {
        const p = r.nz(-5, 5), q = r.nz(-5, 5), c = r.nz(-4, 4), d = r.nz(-4, 4);
        const nr = p * c - q * d, ni = p * d + q * c, m = c * c + d * d;
        return {
          q: T(`計算 ${frac(`${cx(nr, ni)}`, `${cx(c, d)}`)}。`, `Compute ${frac(`${cx(nr, ni)}`, `${cx(c, d)}`)}.`),
          ans: choice(cx(p, q), [cx(p, -q), cx(q, p), cx(-p, q), cx(-q, -p)]),
          sol: [
            T(`分子分母同乘分母的共軛複數 ${cx(c, -d)}。`, `Multiply top and bottom by the conjugate ${cx(c, -d)}.`),
            T(`分母：(${cx(c, d)})(${cx(c, -d)}) = ${par(c)}² + ${par(d)}² = ${m}。`, `Denominator: (${cx(c, d)})(${cx(c, -d)}) = ${par(c)}² + ${par(d)}² = ${m}.`),
            T(`分子：(${cx(nr, ni)})(${cx(c, -d)}) = ${cx(p * m, q * m)}。`, `Numerator: (${cx(nr, ni)})(${cx(c, -d)}) = ${cx(p * m, q * m)}.`),
            T(`相除：${frac(cx(p * m, q * m), m)} = ${cx(p, q)}。`, `Divide: ${frac(cx(p * m, q * m), m)} = ${cx(p, q)}.`),
          ],
        };
      }
      if (t === 4) {
        const p = r.nz(-5, 5), q = r.int(1, 6), B = -2 * p, Cc = p * p + q * q;
        return {
          q: T(`解方程式 ${poly([1, B, Cc])} = 0。`, `Solve ${poly([1, B, Cc])} = 0.`),
          ans: choice(`x = ${pm(p, q)}`, [`x = ${pm(-p, q)}`, `x = ${num(p)} ± ${q}`, `x = ${pm(p, q * q)}`, `x = ${pm(2 * p, q)}`].filter((s) => !/= 0 ± \d+$/.test(s) || p !== 0)),
          sol: [
            T(`判別式 D = ${par(B)}² − 4 × ${Cc} = ${B * B - 4 * Cc} < 0，所以是兩個共軛虛根。`, `Discriminant D = ${par(B)}² − 4 × ${Cc} = ${B * B - 4 * Cc} < 0, so the roots are complex conjugates.`),
            T(`公式解：x = ${frac(`${num(-B)} ± √(${B * B - 4 * Cc})`, 2)} = ${frac(`${num(-B)} ± ${2 * q}i`, 2)}。`, `Quadratic formula: x = ${frac(`${num(-B)} ± √(${B * B - 4 * Cc})`, 2)} = ${frac(`${num(-B)} ± ${2 * q}i`, 2)}.`),
            T(`x = ${pm(p, q)}。驗算：兩根和 ${num(2 * p)}、積 ${p * p} + ${q * q} = ${Cc}。`, `x = ${pm(p, q)}. Check: sum of roots ${num(2 * p)}, product ${p * p} + ${q * q} = ${Cc}.`),
          ],
        };
      }
      const n = r.int(5, 103), k = n % 4, sums = ['0', 'i', '−1 + i', '−1'];
      return {
        q: T(`計算 i + i<sup>2</sup> + i<sup>3</sup> + … + i<sup>${n}</sup>。`, `Compute i + i<sup>2</sup> + i<sup>3</sup> + … + i<sup>${n}</sup>.`),
        ans: choice(sums[k], [...sums.filter((_, j) => j !== k), '1']),
        sol: [T('每連續 4 項：i + (−1) + (−i) + 1 = 0。', 'Every block of 4 consecutive terms: i + (−1) + (−i) + 1 = 0.'), T(`${n} = 4 × ${Math.floor(n / 4)} + ${k}，前 ${4 * Math.floor(n / 4)} 項的和是 0，只剩最後 ${k} 項。`, `${n} = 4 × ${Math.floor(n / 4)} + ${k}; the first ${4 * Math.floor(n / 4)} terms sum to 0, leaving the last ${k}.`), T(`剩下的是 ${k === 0 ? '（沒有）' : ['i', 'i + (−1)', 'i + (−1) + (−i)'][k - 1]} = ${sums[k]}。`, `What remains is ${k === 0 ? '(nothing)' : ['i', 'i + (−1)', 'i + (−1) + (−i)'][k - 1]} = ${sums[k]}.`)],
      };
    },
  },
  {
    id: 'g11-rational-expr',
    grade: 11,
    name: T('分式的化簡與分式方程式', 'Rational expressions and equations'),
    cur: { us: 'Algebra 2 · A-APR.D.6 / A-REI.A.2', tw: '高一 多項式（分式）', aops: 'Intermediate Algebra' },
    gen(r) {
      const t = r.int(0, 3);
      if (t === 0) {
        let a, b, c; do { a = r.nz(-6, 6); b = r.nz(-6, 6); c = r.nz(-6, 6); } while (b === c || b === -a || c === -a);
        const N = pmul([1, -a], [1, b]), D = pmul([1, -a], [1, c]);
        return {
          q: T(`化簡 ${frac(poly(N), poly(D))}。`, `Simplify ${frac(poly(N), poly(D))}.`),
          ans: choice(frac(lin(1, b), lin(1, c)), [frac(lin(1, -b), lin(1, -c)), frac(lin(1, a), lin(1, c)), fracR(b, c), frac(lin(1, b), lin(1, -c))]),
          sol: [T('先把分子、分母因式分解，再約掉公因式。', 'Factor the top and bottom, then cancel the common factor.'), T(`分子 = (${lin(1, -a)})(${lin(1, b)})，分母 = (${lin(1, -a)})(${lin(1, c)})。`, `Top = (${lin(1, -a)})(${lin(1, b)}), bottom = (${lin(1, -a)})(${lin(1, c)}).`), T(`約掉 (${lin(1, -a)})，得 ${frac(lin(1, b), lin(1, c))}（x ≠ ${num(a)}，x ≠ ${num(-c)}）。`, `Cancel (${lin(1, -a)}) to get ${frac(lin(1, b), lin(1, c))} (x ≠ ${num(a)}, x ≠ ${num(-c)}).`), T(`注意：不能約掉 x 或 x²，只能約「整個因式」。`, `Careful: you may cancel only whole factors, not the x or x² terms.`)],
        };
      }
      if (t === 1) {
        let m, n, p, q; do { m = r.nz(-5, 5); n = r.nz(-5, 5); p = r.int(-5, 5); q = r.int(-5, 5); } while (p === q || m + n === 0);
        const top = [m + n, -(m * q + n * p)], D = pmul([1, -p], [1, -q]);
        return {
          q: T(`計算 ${frac(m, lin(1, -p))} + ${frac(n, lin(1, -q))}，寫成一個分式。`.replace(/\+ −/, '+ −'), `Write ${frac(m, lin(1, -p))} + ${frac(n, lin(1, -q))} as a single fraction.`),
          ans: choice(frac(poly(top), poly(D)), [frac(poly([m + n, m * q + n * p]), poly(D)), frac(m + n, poly([2, -(p + q)])), frac(poly([m + n, -(m * p + n * q)]), poly(D))]),
          sol: [T(`通分，公分母 (${lin(1, -p)})(${lin(1, -q)})。`, `Common denominator: (${lin(1, -p)})(${lin(1, -q)}).`), T(`分子 = ${num(m)}(${lin(1, -q)}) + ${par(n)}(${lin(1, -p)}) = ${poly(top)}。`, `Numerator = ${num(m)}(${lin(1, -q)}) + ${par(n)}(${lin(1, -p)}) = ${poly(top)}.`), T(`分母展開 = ${poly(D)}，答案 ${frac(poly(top), poly(D))}。`, `Expanded denominator = ${poly(D)}, so the answer is ${frac(poly(top), poly(D))}.`)],
        };
      }
      if (t === 2) {
        let a, b, p, q; do { a = r.int(1, 7); b = r.int(1, 7); p = r.int(-6, 6); q = r.int(-6, 6); } while (a === b || p === q);
        const x = red(a * q - b * p, a - b);
        return {
          q: T(`解方程式 ${frac(a, lin(1, -p))} = ${frac(b, lin(1, -q))}。（可用分數）`, `Solve ${frac(a, lin(1, -p))} = ${frac(b, lin(1, -q))}. (Fractions are fine.)`),
          ans: ansFrac(...x),
          sol: [T(`交叉相乘：${a}(${lin(1, -q)}) = ${b}(${lin(1, -p)})。`, `Cross-multiply: ${a}(${lin(1, -q)}) = ${b}(${lin(1, -p)}).`), T(`${lin(a, -a * q)} = ${lin(b, -b * p)} ⇒ ${a - b === 1 ? '' : a - b === -1 ? '−' : num(a - b)}x = ${num(a * q - b * p)}。`, `${lin(a, -a * q)} = ${lin(b, -b * p)} ⇒ ${a - b === 1 ? '' : a - b === -1 ? '−' : num(a - b)}x = ${num(a * q - b * p)}.`), T(`x = ${fr(x)}。檢查：x ≠ ${num(p)}、x ≠ ${num(q)}，分母不為 0，所以是解。`, `x = ${fr(x)}. Check: x ≠ ${num(p)} and x ≠ ${num(q)}, so no denominator is 0 — it is a solution.`)],
        };
      }
      let a, b; do { a = r.nz(-6, 6); b = r.int(-6, 6); } while (a === b);
      const N = pmul([1, -a], [1, -b]);
      return {
        q: T(`解方程式 ${frac(poly(N), lin(1, -a))} = 0。（若有多個解，用逗號隔開）`, `Solve ${frac(poly(N), lin(1, -a))} = 0. (If there is more than one solution, separate them with commas.)`),
        ans: ansSet([b]),
        sol: [T('分式等於 0 ⇔ 分子 = 0 且分母 ≠ 0。', 'A fraction is 0 exactly when the numerator is 0 and the denominator is not.'), T(`分子 ${poly(N)} = (${lin(1, -a)})(${lin(1, -b)}) = 0 ⇒ x = ${num(a)} 或 x = ${num(b)}。`, `Numerator ${poly(N)} = (${lin(1, -a)})(${lin(1, -b)}) = 0 ⇒ x = ${num(a)} or x = ${num(b)}.`), T(`但 x = ${num(a)} 會使分母為 0，是增根，要捨去。`, `But x = ${num(a)} makes the denominator 0 — it is extraneous and must be rejected.`), T(`唯一解 x = ${num(b)}。`, `The only solution is x = ${num(b)}.`)],
      };
    },
  },
  {
    id: 'g11-radical-eq',
    grade: 11,
    name: T('根式方程式（增根）', 'Radical equations and extraneous roots'),
    cur: { us: 'Algebra 2 · A-REI.A.2', tw: '高一 數與式（根式）', aops: 'Intermediate Algebra' },
    at: { tw: 10 },
    gen(r) {
      if (r.chance(0.25)) {
        const a = r.pick([1, 2, 3]), c = r.int(2, 7); let x; do x = r.int(-5, 12); while (false);
        const b = c * c - a * x;
        return {
          q: T(`解方程式 ${sqrt(lin(a, b))} = ${c}。`, `Solve ${sqrt(lin(a, b))} = ${c}.`),
          ans: ansNum(x),
          sol: [T('兩邊平方，把根號去掉。', 'Square both sides to remove the root.'), T(`${lin(a, b)} = ${c * c} ⇒ ${a === 1 ? '' : `${a}x = ${num(c * c - b)} ⇒ `}x = ${num(x)}。`, `${lin(a, b)} = ${c * c} ⇒ ${a === 1 ? '' : `${a}x = ${num(c * c - b)} ⇒ `}x = ${num(x)}.`), T(`驗算：${sqrt(`${a === 1 ? '' : a + ' × '}${par(x)} ${sgn(b)}`)} = √${c * c} = ${c} ✓。`, `Check: ${sqrt(`${a === 1 ? '' : a + ' × '}${par(x)} ${sgn(b)}`)} = √${c * c} = ${c} ✓.`)],
        };
      }
      let c, x0, x1, A;
      do { c = r.int(-3, 3); x0 = r.int(-4, 9); x1 = r.int(-6, 9); A = 2 * c + x0 + x1; } while (x0 === x1 || A === 0 || (x0 + c < 0 && x1 + c < 0));
      const B = c * c - x0 * x1, ok = [x0, x1].filter((x) => x + c >= 0), bad = [x0, x1].filter((x) => x + c < 0);
      const rhs = lin(1, c);
      return {
        q: T(`解方程式 ${sqrt(lin(A, B))} = ${rhs}。（若有多個解，用逗號隔開）`, `Solve ${sqrt(lin(A, B))} = ${rhs}. (If there is more than one solution, separate them with commas.)`),
        ans: ansSet(ok),
        sol: [
          T(`兩邊平方：${lin(A, B)} = (${rhs})² = ${poly([1, 2 * c, c * c])}。`, `Square both sides: ${lin(A, B)} = (${rhs})² = ${poly([1, 2 * c, c * c])}.`),
          T(`移項：${poly([1, 2 * c - A, c * c - B])} = 0 ⇒ (${lin(1, -x0)})(${lin(1, -x1)}) = 0 ⇒ x = ${num(x0)} 或 ${num(x1)}。`, `Rearrange: ${poly([1, 2 * c - A, c * c - B])} = 0 ⇒ (${lin(1, -x0)})(${lin(1, -x1)}) = 0 ⇒ x = ${num(x0)} or ${num(x1)}.`),
          T(`平方可能產生增根，要驗算：根號的值不能是負的，所以需要 ${rhs} ≥ 0。`, `Squaring can create extraneous roots, so check: a square root is never negative, so we need ${rhs} ≥ 0.`),
          ...[x0, x1].map((x) => x + c >= 0 ? T(`x = ${num(x)}：右邊 = ${num(x + c)} ≥ 0，左邊 √${A * x + B} = ${num(x + c)} ✓。`, `x = ${num(x)}: right side = ${num(x + c)} ≥ 0 and √${A * x + B} = ${num(x + c)} ✓.`) : T(`x = ${num(x)}：右邊 = ${num(x + c)} < 0，捨去（增根）。`, `x = ${num(x)}: right side = ${num(x + c)} < 0 — reject (extraneous).`)),
          T(`答：x = ${ok.map(num).join('、')}。`, `Answer: x = ${ok.map(num).join(', ')}.`),
        ],
        hint: bad.length ? T('平方後一定要代回原式驗算。', 'After squaring, always check in the original equation.') : undefined,
      };
    },
  },
  {
    id: 'g11-exp-log-eq',
    grade: 11,
    name: T('指數與對數方程式', 'Exponential and logarithmic equations'),
    cur: { us: 'Algebra 2 · F-LE.A.4', tw: '高二 數A 指數與對數函數', aops: 'Intermediate Algebra' },
    gen(r) {
      const t = r.int(0, 4);
      const LOG = (b, x) => `log<sub>${b}</sub>${x}`;
      if (t === 0) {
        const b = r.pick([2, 3]), k = b === 2 ? r.int(3, 6) : r.int(2, 4), N = b ** k;
        const pairs = []; for (let u = 1; u * u < N; u++) if (N % u === 0) pairs.push([u, N / u]);
        const [u, v] = r.pick(pairs), x0 = r.int(-3, 6), p = u - x0, q = v - x0, x1 = -(p + q) - x0;
        return {
          q: T(`解方程式 ${LOG(b, `(${lin(1, p)})`)} + ${LOG(b, `(${lin(1, q)})`)} = ${k}。`, `Solve ${LOG(b, `(${lin(1, p)})`)} + ${LOG(b, `(${lin(1, q)})`)} = ${k}.`),
          ans: ansNum(x0),
          sol: [
            T(`合併：${LOG(b, `[(${lin(1, p)})(${lin(1, q)})]`)} = ${k} ⇒ (${lin(1, p)})(${lin(1, q)}) = ${b}<sup>${k}</sup> = ${N}。`, `Combine: ${LOG(b, `[(${lin(1, p)})(${lin(1, q)})]`)} = ${k} ⇒ (${lin(1, p)})(${lin(1, q)}) = ${b}<sup>${k}</sup> = ${N}.`),
            T(`展開：${poly([1, p + q, p * q - N])} = 0 ⇒ (${lin(1, -x0)})(${lin(1, -x1)}) = 0 ⇒ x = ${num(x0)} 或 ${num(x1)}。`, `Expand: ${poly([1, p + q, p * q - N])} = 0 ⇒ (${lin(1, -x0)})(${lin(1, -x1)}) = 0 ⇒ x = ${num(x0)} or ${num(x1)}.`),
            T(`對數的真數必須是正的：x = ${num(x1)} 時 ${lin(1, p)} = ${num(x1 + p)} < 0，捨去。`, `The argument of a log must be positive: at x = ${num(x1)}, ${lin(1, p)} = ${num(x1 + p)} < 0, so reject it.`),
            T(`x = ${num(x0)}：${num(x0 + p)} × ${num(x0 + q)} = ${N} ✓。答 x = ${num(x0)}。`, `x = ${num(x0)}: ${num(x0 + p)} × ${num(x0 + q)} = ${N} ✓. Answer x = ${num(x0)}.`),
          ],
        };
      }
      if (t === 1) {
        const b = r.pick([2, 3]); let s, u; do { s = r.int(0, 3); u = r.int(0, b === 2 ? 4 : 3); } while (s === u);
        const m = b ** s, n = b ** u;
        return {
          q: T(`解方程式 ${b}<sup>2x</sup> − ${m + n} · ${b}<sup>x</sup> + ${m * n} = 0。（兩個解用逗號隔開）`, `Solve ${b}<sup>2x</sup> − ${m + n} · ${b}<sup>x</sup> + ${m * n} = 0. (Separate the two solutions with a comma.)`),
          ans: ansSet([s, u]),
          sol: [T(`令 t = ${b}<sup>x</sup>（t > 0），則 ${b}<sup>2x</sup> = t²。`, `Let t = ${b}<sup>x</sup> (t > 0); then ${b}<sup>2x</sup> = t².`), T(`t² − ${m + n}t + ${m * n} = 0 ⇒ (t − ${m})(t − ${n}) = 0 ⇒ t = ${m} 或 ${n}。`, `t² − ${m + n}t + ${m * n} = 0 ⇒ (t − ${m})(t − ${n}) = 0 ⇒ t = ${m} or ${n}.`), T(`${b}<sup>x</sup> = ${m} ⇒ x = ${s}；${b}<sup>x</sup> = ${n} ⇒ x = ${u}。`, `${b}<sup>x</sup> = ${m} ⇒ x = ${s}; ${b}<sup>x</sup> = ${n} ⇒ x = ${u}.`)],
        };
      }
      if (t === 2) {
        const b = r.pick([2, 3, 5]), k = r.int(1, b === 2 ? 5 : 3), a = r.int(1, 4), c = r.int(-9, 9), x = red(b ** k - c, a);
        return {
          q: T(`解方程式 ${LOG(b, `(${lin(a, c)})`)} = ${k}。（可用分數）`, `Solve ${LOG(b, `(${lin(a, c)})`)} = ${k}. (Fractions are fine.)`),
          ans: ansFrac(...x),
          sol: [T(`對數化成指數：${lin(a, c)} = ${b}<sup>${k}</sup> = ${b ** k}。`, `Rewrite in exponential form: ${lin(a, c)} = ${b}<sup>${k}</sup> = ${b ** k}.`), T(`${a === 1 ? '' : a}x = ${b ** k} ${sgn(-c)} = ${num(b ** k - c)} ⇒ x = ${fr(x)}。`, `${a === 1 ? '' : a}x = ${b ** k} ${sgn(-c)} = ${num(b ** k - c)} ⇒ x = ${fr(x)}.`), T(`檢查真數：${b ** k} > 0 ✓。`, `Check the argument: ${b ** k} > 0 ✓.`)],
        };
      }
      if (t === 3) {
        const [b, k] = r.pick([[2, 1], [2, 2], [3, 1], [2, 3], [3, 2]]), M = b ** k, j = r.int(1, 6), p = (M - 1) * j, x = M * j;
        return {
          q: T(`解方程式 ${LOG(b, 'x')} − ${LOG(b, `(${lin(1, -p)})`)} = ${k}。`, `Solve ${LOG(b, 'x')} − ${LOG(b, `(${lin(1, -p)})`)} = ${k}.`),
          ans: ansNum(x),
          sol: [T(`合併：${LOG(b, frac('x', lin(1, -p)))} = ${k} ⇒ ${frac('x', lin(1, -p))} = ${M}。`, `Combine: ${LOG(b, frac('x', lin(1, -p)))} = ${k} ⇒ ${frac('x', lin(1, -p))} = ${M}.`), T(`x = ${M}(${lin(1, -p)}) = ${M}x − ${M * p} ⇒ ${M - 1}x = ${M * p} ⇒ x = ${x}。`, `x = ${M}(${lin(1, -p)}) = ${M}x − ${M * p} ⇒ ${M - 1}x = ${M * p} ⇒ x = ${x}.`), T(`檢查：x = ${x} > 0，x − ${p} = ${j} > 0 ✓。`, `Check: x = ${x} > 0 and x − ${p} = ${j} > 0 ✓.`)],
        };
      }
      const h = r.pick([5, 8, 10, 12, 20, 30]), n = r.int(2, 6), M = r.int(1, 9) * 2 ** n * 10;
      const sub = r.pick([['某放射性物質', 'A radioactive sample', '年', 'years'], ['某藥物在血液中的含量', 'The amount of a medicine in the blood', '小時', 'hours']]);
      return {
        q: T(`${sub[0]}的半衰期是 ${h} ${sub[2]}（每 ${h} ${sub[2]}減為一半）。原本 ${M} 毫克，要經過幾${sub[2]}才會剩下 ${M / 2 ** n} 毫克？`, `${sub[1]} has a half-life of ${h} ${sub[3]} (it halves every ${h} ${sub[3]}). It starts at ${M} mg. After how many ${sub[3]} will ${M / 2 ** n} mg remain?`),
        ans: ansNum(n * h),
        sol: [T(`剩下量 = ${M} × (½)<sup>t/${h}</sup>。`, `Amount = ${M} × (½)<sup>t/${h}</sup>.`), T(`${M / 2 ** n} = ${M} × (½)<sup>t/${h}</sup> ⇒ (½)<sup>t/${h}</sup> = ${frac(1, 2 ** n)} = (½)<sup>${n}</sup>。`, `${M / 2 ** n} = ${M} × (½)<sup>t/${h}</sup> ⇒ (½)<sup>t/${h}</sup> = ${frac(1, 2 ** n)} = (½)<sup>${n}</sup>.`), T(`t/${h} = ${n} ⇒ t = ${n * h} ${sub[2]}。`, `t/${h} = ${n} ⇒ t = ${n * h} ${sub[3]}.`)],
      };
    },
  },
  {
    id: 'g11-geo-series',
    grade: 11,
    name: T('等比級數（有限與無窮）', 'Geometric series: finite and infinite'),
    cur: { us: 'Algebra 2 · A-SSE.B.4', tw: '高三 數甲 無窮等比級數', aops: 'Intermediate Algebra' },
    at: { tw: 12 },
    gen(r) {
      const t = r.int(0, 4);
      if (t === 0) {
        const a = r.int(1, 5), q = r.pick([2, 3, -2]), n = r.int(4, q === 3 ? 6 : 8), S = (a * (q ** n - 1)) / (q - 1);
        const term_ = `${a === 1 ? '' : a + ' · '}${par(q)}<sup>k−1</sup>`;
        return {
          q: T(`計算 ${SIG('k=1', n)} ${term_}。`, `Evaluate ${SIG('k=1', n)} ${term_}.`),
          ans: ansNum(S),
          sol: [T(`這是首項 ${a}、公比 ${num(q)}、共 ${n} 項的等比級數。`, `This is a geometric series with first term ${a}, ratio ${num(q)}, and ${n} terms.`), T(`Sₙ = a(rⁿ − 1)/(r − 1) = ${a} × (${par(q)}<sup>${n}</sup> − 1) ÷ (${num(q)} − 1)。`, `Sₙ = a(rⁿ − 1)/(r − 1) = ${a} × (${par(q)}<sup>${n}</sup> − 1) ÷ (${num(q)} − 1).`), T(`= ${a} × ${num(q ** n - 1)} ÷ ${par(q - 1)} = ${num(S)}。`, `= ${a} × ${num(q ** n - 1)} ÷ ${par(q - 1)} = ${num(S)}.`)],
        };
      }
      if (t === 1) {
        const qd = r.int(2, 5), pn = r.nz(-(qd - 1), qd - 1), a = r.int(1, 9) * r.pick([1, 1, 2]);
        const rr = red(pn, qd), terms = [0, 1, 2].map((i) => red(a * rr[0] ** i, rr[1] ** i));
        const S = red(a * rr[1], rr[1] - rr[0]);
        let ser = fr(terms[0]); for (const tm of terms.slice(1)) ser += tm[0] < 0 ? ` − ${fr([-tm[0], tm[1]])}` : ` + ${fr(tm)}`;
        return {
          q: T(`求無窮等比級數 ${ser} ${rr[0] < 0 ? '+ …' : '+ …'} 的和。（可用分數）`, `Find the sum of the infinite geometric series ${ser} + … (Fractions are fine.)`),
          ans: ansFrac(...S),
          sol: [T(`首項 a = ${a}，公比 r = ${fr(rr)}。|r| < 1，所以級數收斂。`, `First term a = ${a}, ratio r = ${fr(rr)}. Since |r| < 1, the series converges.`), T('無窮等比級數和 S = a ÷ (1 − r)。', 'Infinite geometric sum: S = a ÷ (1 − r).'), T(`S = ${a} ÷ (1 − ${frP(rr)}) = ${a} ÷ ${fr(red(rr[1] - rr[0], rr[1]))} = ${fr(S)}。`, `S = ${a} ÷ (1 − ${frP(rr)}) = ${a} ÷ ${fr(red(rr[1] - rr[0], rr[1]))} = ${fr(S)}.`)],
        };
      }
      if (t === 2) {
        const OL = (s) => `<span style="text-decoration:overline">${s}</span>`;
        if (r.chance(0.5)) {
          let ab; do ab = r.int(1, 98); while (ab % 11 === 0);
          const s2 = String(ab).padStart(2, '0'), v = red(ab, 99);
          return {
            q: T(`把循環小數 0.${OL(s2)} 化成最簡分數。`, `Write the repeating decimal 0.${OL(s2)} as a fraction in lowest terms.`),
            ans: ansFrac(...v),
            sol: [T(`0.${OL(s2)} = ${frac(s2, 100)} + ${frac(s2, '100²')} + …，首項 ${frac(s2, 100)}、公比 ${frac(1, 100)}。`, `0.${OL(s2)} = ${frac(s2, 100)} + ${frac(s2, '100²')} + …, first term ${frac(s2, 100)}, ratio ${frac(1, 100)}.`), T(`和 = ${frac(s2, 100)} ÷ (1 − ${frac(1, 100)}) = ${frac(ab, 99)}。`, `Sum = ${frac(s2, 100)} ÷ (1 − ${frac(1, 100)}) = ${frac(ab, 99)}.`), T(`約分：${fr(v)}。`, `Reduce: ${fr(v)}.`)],
          };
        }
        const a = r.int(1, 9); let b; do b = r.int(1, 9); while (b === a);
        const v = red(10 * a + b - a, 90);
        return {
          q: T(`把循環小數 0.${a}${OL(b)} 化成最簡分數。`, `Write the repeating decimal 0.${a}${OL(b)} as a fraction in lowest terms.`),
          ans: ansFrac(...v),
          sol: [T(`設 x = 0.${a}${OL(b)}，則 10x = ${a}.${OL(b)}，100x = ${a}${b}.${OL(b)}。`, `Let x = 0.${a}${OL(b)}. Then 10x = ${a}.${OL(b)} and 100x = ${a}${b}.${OL(b)}.`), T(`相減：90x = ${10 * a + b} − ${a} = ${9 * a + b}。`, `Subtract: 90x = ${10 * a + b} − ${a} = ${9 * a + b}.`), T(`x = ${frac(9 * a + b, 90)} = ${fr(v)}。`, `x = ${frac(9 * a + b, 90)} = ${fr(v)}.`)],
        };
      }
      if (t === 3) {
        const [p, q] = r.pick([[1, 2], [2, 3], [3, 4], [3, 5], [4, 5], [1, 3], [2, 5]]), H = (q - p) * r.int(1, 6) * (q - p === 1 ? 2 : 1), D = (H * (q + p)) / (q - p);
        return {
          q: T(`一顆球從 ${H} 公尺高落下，每次彈起的高度是前一次落下高度的 ${frac(p, q)}，一直彈跳下去。球總共經過多少公尺？`, `A ball is dropped from ${H} m. Each bounce reaches ${frac(p, q)} of the height it fell from, forever. What total distance does the ball travel?`),
          ans: ansNum(D),
          sol: [T(`落下：${H}；之後每次彈起和落下的距離一樣，所以要算兩次。`, `Down: ${H}; after that, each rebound goes up and comes back down the same distance, so count it twice.`), T(`彈起高度：${H} × ${frac(p, q)} + ${H} × (${frac(p, q)})² + … = ${frac(`${H} × ${p}/${q}`, `1 − ${p}/${q}`)} = ${num((H * p) / (q - p))}。`, `Rebound heights: ${H} × ${frac(p, q)} + ${H} × (${frac(p, q)})² + … = ${frac(`${H} × ${p}/${q}`, `1 − ${p}/${q}`)} = ${num((H * p) / (q - p))}.`), T(`總距離 = ${H} + 2 × ${num((H * p) / (q - p))} = ${num(D)} 公尺。`, `Total = ${H} + 2 × ${num((H * p) / (q - p))} = ${num(D)} m.`)],
        };
      }
      const [p, q] = r.pick([[1, 2], [2, 3], [3, 4], [1, 3], [2, 5], [1, 4], [3, 5]]), a = (q - p) * r.int(1, 5), S = (a * q) / (q - p);
      return {
        q: T(`一個無窮等比級數的首項是 ${a}，和是 ${S}。公比是多少？（可用分數）`, `An infinite geometric series has first term ${a} and sum ${S}. What is the common ratio? (Fractions are fine.)`),
        ans: ansFrac(p, q),
        sol: [T('S = a ÷ (1 − r)。', 'S = a ÷ (1 − r).'), T(`${S} = ${a} ÷ (1 − r) ⇒ 1 − r = ${frac(a, S)} = ${fracR(a, S)}。`, `${S} = ${a} ÷ (1 − r) ⇒ 1 − r = ${frac(a, S)} = ${fracR(a, S)}.`), T(`r = 1 − ${fracR(a, S)} = ${fracR(p, q)}（|r| < 1 ✓）。`, `r = 1 − ${fracR(a, S)} = ${fracR(p, q)} (|r| < 1 ✓).`)],
      };
    },
  },
  {
    id: 'g11-func-transform',
    grade: 11,
    name: T('函數圖形的平移、伸縮與鏡射', 'Transformations of functions'),
    cur: { us: 'Algebra 2 · F-BF.B.3', tw: '高二 數A 函數圖形（平移伸縮）', aops: 'Intermediate Algebra' },
    gen(r) {
      const t = r.int(0, 3);
      if (t === 0) {
        const h = r.nz(-6, 6), k = r.nz(-6, 6), expand = r.chance(0.5);
        const g = expand ? poly([1, -2 * h, h * h + k]) : `${sq('x', h)} ${sgn(k)}`;
        return {
          q: expand ? T(`拋物線 y = ${g} 的頂點坐標是？答案寫成 (x, y)。`, `Find the vertex of the parabola y = ${g}. Answer as (x, y).`)
            : T(`把 y = x² 的圖形${h > 0 ? '向右' : '向左'}平移 ${Math.abs(h)} 單位，再${k > 0 ? '向上' : '向下'}平移 ${Math.abs(k)} 單位，得到 y = ${g}。新圖形的頂點是？答案寫成 (x, y)。`, `The graph of y = x² is shifted ${Math.abs(h)} unit${Math.abs(h) > 1 ? 's' : ''} ${h > 0 ? 'right' : 'left'} and ${Math.abs(k)} unit${Math.abs(k) > 1 ? 's' : ''} ${k > 0 ? 'up' : 'down'}, giving y = ${g}. What is the new vertex? Answer as (x, y).`),
          ans: ansPair(h, k),
          sol: expand ? [T('配方：把 x² + bx 寫成 (x + b/2)² − (b/2)²。', 'Complete the square: x² + bx = (x + b/2)² − (b/2)².'), T(`y = ${sq('x', h)} − ${h * h} ${sgn(h * h + k)} = ${sq('x', h)} ${sgn(k)}。`, `y = ${sq('x', h)} − ${h * h} ${sgn(h * h + k)} = ${sq('x', h)} ${sgn(k)}.`), T(`頂點 (${num(h)}, ${num(k)})。`, `Vertex (${num(h)}, ${num(k)}).`)]
            : [T('y = x² 的頂點是 (0, 0)，平移時頂點跟著移動。', 'y = x² has vertex (0, 0), and the vertex moves with the graph.'), T(`左右：x 坐標 ${sgn(h)}；上下：y 坐標 ${sgn(k)}。`, `Horizontal: x-coordinate ${sgn(h)}; vertical: y-coordinate ${sgn(k)}.`), T(`新頂點 (${num(h)}, ${num(k)})。`, `New vertex (${num(h)}, ${num(k)}).`)],
        };
      }
      if (t === 1) {
        const p = r.int(-5, 5), q = r.int(-5, 5), a = r.pick([2, 3, -1, -2, 1]), h = r.nz(-5, 5), k = r.int(-6, 6);
        const g = `${a === 1 ? '' : a === -1 ? '−' : num(a)}f(${lin(1, -h)}) ${k ? sgn(k) : ''}`;
        return {
          q: T(`點 (${num(p)}, ${num(q)}) 在 y = f(x) 的圖形上。下列哪一點一定在 y = ${g} 的圖形上？答案寫成 (x, y)。`, `The point (${num(p)}, ${num(q)}) is on the graph of y = f(x). Which point must be on the graph of y = ${g}? Answer as (x, y).`),
          ans: ansPair(p + h, a * q + k),
          sol: [T(`要讓括號裡等於 ${num(p)}：x − ${par(h)} = ${num(p)} ⇒ x = ${num(p + h)}。`, `Make the inside equal ${num(p)}: x − ${par(h)} = ${num(p)} ⇒ x = ${num(p + h)}.`), T(`此時 f(${num(p)}) = ${num(q)}，所以 y = ${num(a)} × ${par(q)} ${sgn(k)} = ${num(a * q + k)}。`, `Then f(${num(p)}) = ${num(q)}, so y = ${num(a)} × ${par(q)} ${sgn(k)} = ${num(a * q + k)}.`), T(`點 (${num(p + h)}, ${num(a * q + k)})。（括號裡「減 h」是向右移 h。）`, `Point (${num(p + h)}, ${num(a * q + k)}). ("Minus h" inside shifts right by h.)`)],
        };
      }
      if (t === 2) {
        const h = r.nz(-6, 6), k = r.nz(-6, 6);
        const D = (hh, kk) => T(`向${hh > 0 ? '左' : '右'}移 ${Math.abs(hh)}，向${kk > 0 ? '上' : '下'}移 ${Math.abs(kk)}`, `${Math.abs(hh)} ${hh > 0 ? 'left' : 'right'}, ${Math.abs(kk)} ${kk > 0 ? 'up' : 'down'}`);
        return {
          q: T(`y = f(${lin(1, h)}) ${sgn(k)} 的圖形是把 y = f(x) 怎麼移動得到的？`, `How is the graph of y = f(${lin(1, h)}) ${sgn(k)} obtained from y = f(x)?`),
          ans: choice(D(h, k), [D(-h, k), D(h, -k), D(-h, -k)]),
          sol: [T(`括號裡 x ${sgn(h)}：x 要${h > 0 ? '小' : '大'} ${Math.abs(h)} 才能得到原本的值，所以圖形向${h > 0 ? '左' : '右'}移 ${Math.abs(h)}。`, `Inside, x ${sgn(h)}: x must be ${Math.abs(h)} ${h > 0 ? 'smaller' : 'larger'} to give the same input, so the graph moves ${Math.abs(h)} ${h > 0 ? 'left' : 'right'}.`), T(`外面 ${sgn(k)}：每個 y 值${k > 0 ? '加' : '減'} ${Math.abs(k)}，所以向${k > 0 ? '上' : '下'}移 ${Math.abs(k)}。`, `Outside ${sgn(k)}: every y-value changes by ${num(k)}, so the graph moves ${Math.abs(k)} ${k > 0 ? 'up' : 'down'}.`), T('記法：括號裡的變化「方向相反」，括號外的變化「方向相同」。', 'Memory aid: changes inside go the opposite way; changes outside go the expected way.')],
        };
      }
      const p = 2 * r.nz(-3, 3), q = r.nz(-6, 6), mode = r.int(0, 3);
      const forms = [['−f(x)', [p, -q], T('對 x 軸鏡射：y 變號。', 'Reflect over the x-axis: y changes sign.')], ['f(−x)', [-p, q], T('對 y 軸鏡射：x 變號。', 'Reflect over the y-axis: x changes sign.')], ['f(2x)', [p / 2, q], T('水平壓縮成一半：x 除以 2。', 'Horizontal compression by 2: divide x by 2.')], ['3f(x)', [p, 3 * q], T('鉛直伸長 3 倍：y 乘以 3。', 'Vertical stretch by 3: multiply y by 3.')]];
      const [fm, [X, Y], why] = forms[mode];
      return {
        q: T(`點 (${num(p)}, ${num(q)}) 在 y = f(x) 上。對應地，哪一點在 y = ${fm} 上？答案寫成 (x, y)。`, `(${num(p)}, ${num(q)}) is on y = f(x). Which corresponding point is on y = ${fm}? Answer as (x, y).`),
        ans: ansPair(X, Y),
        sol: [why, T(`檢查：x = ${num(X)} 時，f 的輸入是 ${num(p)}，f(${num(p)}) = ${num(q)}，所以 y = ${num(Y)}。`, `Check: at x = ${num(X)} the input to f is ${num(p)}, f(${num(p)}) = ${num(q)}, so y = ${num(Y)}.`), T(`答案 (${num(X)}, ${num(Y)})。`, `Answer: (${num(X)}, ${num(Y)}).`)],
      };
    },
  },
  {
    id: 'g11-inverse-func',
    grade: 11,
    name: T('反函數與合成函數', 'Inverse and composite functions'),
    cur: { us: 'Algebra 2 · F-BF.B.4', tw: '高二 數A 指數對數函數（反函數）', aops: 'Intermediate Algebra' },
    gen(r) {
      const t = r.int(0, 4);
      if (t === 0) {
        const a = r.nz(-6, 6), b = r.nz(-9, 9), k = r.int(-10, 15), x = red(k - b, a);
        return {
          q: T(`f(x) = ${lin(a, b)}，求 f<sup>−1</sup>(${num(k)})。（可用分數）`, `f(x) = ${lin(a, b)}. Find f<sup>−1</sup>(${num(k)}). (Fractions are fine.)`),
          ans: ansFrac(...x),
          sol: [T(`f<sup>−1</sup>(${num(k)}) 就是「哪個 x 會讓 f(x) = ${num(k)}」。`, `f<sup>−1</sup>(${num(k)}) is the x that makes f(x) = ${num(k)}.`), T(`${lin(a, b)} = ${num(k)} ⇒ ${a === 1 ? '' : a === -1 ? '−' : num(a)}x = ${num(k - b)} ⇒ x = ${fr(x)}。`, `${lin(a, b)} = ${num(k)} ⇒ ${a === 1 ? '' : a === -1 ? '−' : num(a)}x = ${num(k - b)} ⇒ x = ${fr(x)}.`), T(`驗算：f(${fr(x)}) = ${num(k)} ✓。`, `Check: f(${fr(x)}) = ${num(k)} ✓.`)],
        };
      }
      if (t === 1) {
        let a, b, c, d, k; do { a = r.int(-5, 5); b = r.int(-6, 6); c = r.nz(-4, 4); d = r.int(-6, 6); k = r.int(-5, 5); } while (a * d - b * c === 0 || k * c === a);
        const x = red(b - d * k, k * c - a);
        return {
          q: T(`f(x) = ${frac(lin(a, b), lin(c, d))}，求 f<sup>−1</sup>(${num(k)})。（可用分數）`, `f(x) = ${frac(lin(a, b), lin(c, d))}. Find f<sup>−1</sup>(${num(k)}). (Fractions are fine.)`),
          ans: ansFrac(...x),
          sol: [T(`解 ${frac(lin(a, b), lin(c, d))} = ${num(k)}。`, `Solve ${frac(lin(a, b), lin(c, d))} = ${num(k)}.`), T(`${lin(a, b)} = ${num(k)}(${lin(c, d)}) = ${lin(k * c, k * d)}。`, `${lin(a, b)} = ${num(k)}(${lin(c, d)}) = ${lin(k * c, k * d)}.`), T(`${num(a - k * c)}x = ${num(k * d - b)} ⇒ x = ${fr(x)}。`, `${num(a - k * c)}x = ${num(k * d - b)} ⇒ x = ${fr(x)}.`)],
        };
      }
      if (t === 2) {
        const b = r.pick([2, 3]), c = r.int(-6, 6), m = r.int(0, b === 2 ? 6 : 4), k = b ** m + c;
        return {
          q: T(`f(x) = ${b}<sup>x</sup> ${sgn(c)}，求 f<sup>−1</sup>(${num(k)})。`, `f(x) = ${b}<sup>x</sup> ${sgn(c)}. Find f<sup>−1</sup>(${num(k)}).`),
          ans: ansNum(m),
          sol: [T(`解 ${b}<sup>x</sup> ${sgn(c)} = ${num(k)} ⇒ ${b}<sup>x</sup> = ${b ** m}。`, `Solve ${b}<sup>x</sup> ${sgn(c)} = ${num(k)} ⇒ ${b}<sup>x</sup> = ${b ** m}.`), T(`x = log<sub>${b}</sub> ${b ** m} = ${m}。（f<sup>−1</sup>(x) = log<sub>${b}</sub>(x ${sgn(-c)})）`, `x = log<sub>${b}</sub> ${b ** m} = ${m}. (f<sup>−1</sup>(x) = log<sub>${b}</sub>(x ${sgn(-c)}))`)],
        };
      }
      if (t === 3) {
        const a = r.int(2, 7) * r.sign(), b = r.nz(-9, 9);
        return {
          q: T(`f(x) = ${lin(a, b)} 的反函數 f<sup>−1</sup>(x) 是？`, `What is the inverse of f(x) = ${lin(a, b)}?`),
          ans: choice(frac(lin(1, -b), a), [frac(lin(1, b), a), frac(1, lin(a, b)), lin(a, -b), frac(lin(1, -a), b)]),
          sol: [T('設 y = f(x)，把 x、y 對調，再解出 y。', 'Write y = f(x), swap x and y, then solve for y.'), T(`x = ${lin(a, b).replace('x', 'y')} ⇒ ${num(a)}y = ${lin(1, -b)}。`, `x = ${lin(a, b).replace('x', 'y')} ⇒ ${num(a)}y = ${lin(1, -b)}.`), T(`f<sup>−1</sup>(x) = ${frac(lin(1, -b), a)}。驗算：f(f<sup>−1</sup>(x)) = x。`, `f<sup>−1</sup>(x) = ${frac(lin(1, -b), a)}. Check: f(f<sup>−1</sup>(x)) = x.`)],
        };
      }
      const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-6, 6), k = r.int(-4, 4), fg = r.chance(0.5);
      const f = (x) => a * x + b, g = (x) => x * x + c;
      const v = fg ? f(g(k)) : g(f(k));
      return {
        q: T(`f(x) = ${lin(a, b)}，g(x) = ${poly([1, 0, c])}。求 ${fg ? 'f(g' : 'g(f'}(${num(k)}))。`, `f(x) = ${lin(a, b)} and g(x) = ${poly([1, 0, c])}. Find ${fg ? 'f(g' : 'g(f'}(${num(k)})).`),
        ans: ansNum(v),
        sol: fg ? [T('由內往外算：先算 g，再代入 f。', 'Work from the inside out: g first, then f.'), T(`g(${num(k)}) = ${par(k)}² ${sgn(c)} = ${num(g(k))}。`, `g(${num(k)}) = ${par(k)}² ${sgn(c)} = ${num(g(k))}.`), T(`f(${num(g(k))}) = ${num(a)} × ${par(g(k))} ${sgn(b)} = ${num(v)}。`, `f(${num(g(k))}) = ${num(a)} × ${par(g(k))} ${sgn(b)} = ${num(v)}.`)]
          : [T('由內往外算：先算 f，再代入 g。', 'Work from the inside out: f first, then g.'), T(`f(${num(k)}) = ${num(a)} × ${par(k)} ${sgn(b)} = ${num(f(k))}。`, `f(${num(k)}) = ${num(a)} × ${par(k)} ${sgn(b)} = ${num(f(k))}.`), T(`g(${num(f(k))}) = ${par(f(k))}² ${sgn(c)} = ${num(v)}。`, `g(${num(f(k))}) = ${par(f(k))}² ${sgn(c)} = ${num(v)}.`)],
      };
    },
  },
  {
    id: 'g11-factor-thm',
    grade: 11,
    name: T('因式定理與多項式的根', 'Factor theorem and roots of polynomials'),
    cur: { us: 'Algebra 2 · A-APR.B.3', tw: '高一 多項式函數（因式定理）', aops: 'Intermediate Algebra' },
    at: { tw: 10 },
    gen(r) {
      const t = r.int(0, 2);
      if (t === 0) {
        const rs = r.sample([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6], 3), f = pmul(pmul([1, -rs[0]], [1, -rs[1]]), [1, -rs[2]]);
        const Q = pmul([1, -rs[1]], [1, -rs[2]]);
        return {
          q: T(`已知 x = ${num(rs[0])} 是 ${poly(f)} = 0 的一個根，求另外兩個根。（用逗號隔開）`, `x = ${num(rs[0])} is a root of ${poly(f)} = 0. Find the other two roots. (Separate with a comma.)`),
          ans: ansSet([rs[1], rs[2]]),
          sol: [T(`因式定理：(${lin(1, -rs[0])}) 是因式。用綜合除法除以 ${num(rs[0])}。`, `Factor theorem: (${lin(1, -rs[0])}) is a factor. Divide synthetically by ${num(rs[0])}.`), T(`商式 = ${poly(Q)}（餘式 0）。`, `Quotient = ${poly(Q)} (remainder 0).`), T(`${poly(Q)} = (${lin(1, -rs[1])})(${lin(1, -rs[2])}) ⇒ x = ${num(rs[1])}, ${num(rs[2])}。`, `${poly(Q)} = (${lin(1, -rs[1])})(${lin(1, -rs[2])}) ⇒ x = ${num(rs[1])}, ${num(rs[2])}.`), T(`驗算：三根和 = ${num(rs[0] + rs[1] + rs[2])} = −(x² 的係數)。`, `Check: sum of all three roots = ${num(rs[0] + rs[1] + rs[2])} = −(coefficient of x²).`)],
        };
      }
      if (t === 1) {
        const m = r.pick([-5, -3, -1, 1, 3, 5]), [r2, r3] = r.sample([-4, -3, -2, -1, 1, 2, 3, 4], 2), f = pmul(pmul([2, -m], [1, -r2]), [1, -r3]);
        const Q = pmul([1, -r2], [1, -r3]);
        return {
          q: T(`求方程式 ${poly(f)} = 0 的所有根。（用逗號隔開，可用分數）`, `Find all roots of ${poly(f)} = 0. (Separate with commas; fractions are fine.)`),
          ans: ansSet([m / 2, r2, r3], `${fracText(m, 2)}, ${r2}, ${r3}`),
          sol: [T(`有理根定理：可能的有理根 = ±(常數項 ${Math.abs(f[3])} 的因數) ÷ (首項 2 的因數)。`, `Rational root theorem: candidates are ±(factors of ${Math.abs(f[3])}) ÷ (factors of 2).`), T(`試 x = ${num(r2)}：f(${num(r2)}) = 0，所以 (${lin(1, -r2)}) 是因式。`, `Try x = ${num(r2)}: f(${num(r2)}) = 0, so (${lin(1, -r2)}) is a factor.`), T(`除完得 ${poly(pmul([2, -m], [1, -r3]))} = (${lin(2, -m)})(${lin(1, -r3)})。`, `Dividing leaves ${poly(pmul([2, -m], [1, -r3]))} = (${lin(2, -m)})(${lin(1, -r3)}).`), T(`根：x = ${fracR(m, 2)}, ${num(r2)}, ${num(r3)}。`, `Roots: x = ${fracR(m, 2)}, ${num(r2)}, ${num(r3)}.`)],
        };
      }
      const p = r.nz(-5, 5), q = r.int(1, 6);
      return {
        q: T(`一個實係數、首項係數為 1 的二次多項式有一根 ${cx(p, q)}，它是？`, `A monic quadratic with real coefficients has ${cx(p, q)} as a root. Which is it?`),
        ans: choice(poly([1, -2 * p, p * p + q * q]), [poly([1, 2 * p, p * p + q * q]), poly([1, -2 * p, p * p - q * q]), poly([1, -p, p * p + q * q]), poly([1, -2 * p, q * q])]),
        sol: [T(`實係數多項式的虛根成對出現：另一根是共軛 ${cx(p, -q)}。`, `Non-real roots of a real polynomial come in conjugate pairs: the other root is ${cx(p, -q)}.`), T(`兩根和 = ${num(2 * p)}，兩根積 = ${par(p)}² + ${q}² = ${p * p + q * q}。`, `Sum of roots = ${num(2 * p)}, product = ${par(p)}² + ${q}² = ${p * p + q * q}.`), T(`多項式 = x² − (和)x + 積 = ${poly([1, -2 * p, p * p + q * q])}。`, `Polynomial = x² − (sum)x + product = ${poly([1, -2 * p, p * p + q * q])}.`)],
      };
    },
  },
  {
    id: 'g11-vieta-cubic',
    grade: 11,
    name: T('根與係數：三次方程式', "Vieta's formulas for cubics"),
    cur: { tw: '高一 多項式函數（根與係數）', aops: 'Intermediate Algebra' },
    at: { tw: 10 },
    gen(r) {
      const k = r.pick([1, 1, 1, 2, 3]), B = r.nz(-9, 9), Cc = r.nz(-9, 9), D = r.nz(-9, 9);
      const s1 = red(-B, k), s2 = red(Cc, k), s3 = red(-D, k);
      const mode = r.int(0, 5);
      const items = [
        ['a + b + c', s1, T(`a + b + c = −(x² 係數)/(首項) = ${fr(s1)}。`, `a + b + c = −(x² coefficient)/(leading) = ${fr(s1)}.`)],
        ['ab + bc + ca', s2, T(`ab + bc + ca = (x 係數)/(首項) = ${fr(s2)}。`, `ab + bc + ca = (x coefficient)/(leading) = ${fr(s2)}.`)],
        ['abc', s3, T(`abc = −(常數項)/(首項) = ${fr(s3)}。`, `abc = −(constant)/(leading) = ${fr(s3)}.`)],
        ['a² + b² + c²', fsub(fmul(s1, s1), fmul([2, 1], s2)), T(`a² + b² + c² = (a + b + c)² − 2(ab + bc + ca) = (${fr(s1)})² − 2 × ${frP(s2)} = ${fr(fsub(fmul(s1, s1), fmul([2, 1], s2)))}。`, `a² + b² + c² = (a + b + c)² − 2(ab + bc + ca) = (${fr(s1)})² − 2 × ${frP(s2)} = ${fr(fsub(fmul(s1, s1), fmul([2, 1], s2)))}.`)],
        [`${frac(1, 'a')} + ${frac(1, 'b')} + ${frac(1, 'c')}`, fdiv(s2, s3), T(`通分：${frac('ab + bc + ca', 'abc')} = ${fr(s2)} ÷ ${frP(s3)} = ${fr(fdiv(s2, s3))}。`, `Common denominator: ${frac('ab + bc + ca', 'abc')} = ${fr(s2)} ÷ ${frP(s3)} = ${fr(fdiv(s2, s3))}.`)],
        ['(a + 1)(b + 1)(c + 1)', fadd(fadd(fadd([1, 1], s1), s2), s3), T(`展開 = abc + (ab + bc + ca) + (a + b + c) + 1 = ${fr(s3)} + ${frP(s2)} + ${frP(s1)} + 1 = ${fr(fadd(fadd(fadd([1, 1], s1), s2), s3))}。`, `Expand: abc + (ab + bc + ca) + (a + b + c) + 1 = ${fr(s3)} + ${frP(s2)} + ${frP(s1)} + 1 = ${fr(fadd(fadd(fadd([1, 1], s1), s2), s3))}.`)],
      ];
      const [expr, v, step] = items[mode];
      return {
        q: T(`a、b、c 是 ${poly([k, B, Cc, D])} = 0 的三個根，求 ${expr}。（可用分數）`, `a, b, c are the roots of ${poly([k, B, Cc, D])} = 0. Find ${expr}. (Fractions are fine.)`),
        ans: ansFrac(...v),
        sol: [
          T(`根與係數（韋達定理）：${k === 1 ? '' : num(k)}x³ + …= ${k === 1 ? '' : num(k)}(x − a)(x − b)(x − c)。`, `Vieta: ${k === 1 ? '' : num(k)}x³ + … = ${k === 1 ? '' : num(k)}(x − a)(x − b)(x − c).`),
          T(`a + b + c = ${fr(s1)}，ab + bc + ca = ${fr(s2)}，abc = ${fr(s3)}。`, `a + b + c = ${fr(s1)}, ab + bc + ca = ${fr(s2)}, abc = ${fr(s3)}.`),
          step,
        ],
        hint: T('不用解出根，用根與係數的關係。', "Don't solve for the roots — use Vieta's formulas."),
      };
    },
  },
  {
    id: 'g11-power-sums',
    grade: 11,
    name: T('根的對稱式（次方和）', 'Symmetric expressions in the roots'),
    cur: { tw: '國三／高一 根與係數', aops: 'Intermediate Algebra' },
    gen(r) {
      const s = r.nz(-7, 7), p = r.nz(-7, 7), mode = r.int(0, 5);
      const e2 = s * s - 2 * p;
      const items = [
        ['α² + β²', [e2, 1], T(`α² + β² = (α + β)² − 2αβ = ${par(s)}² − 2 × ${par(p)} = ${e2}。`, `α² + β² = (α + β)² − 2αβ = ${par(s)}² − 2 × ${par(p)} = ${e2}.`)],
        ['α³ + β³', [s ** 3 - 3 * p * s, 1], T(`α³ + β³ = (α + β)³ − 3αβ(α + β) = ${par(s)}³ − 3 × ${par(p)} × ${par(s)} = ${num(s ** 3 - 3 * p * s)}。`, `α³ + β³ = (α + β)³ − 3αβ(α + β) = ${par(s)}³ − 3 × ${par(p)} × ${par(s)} = ${num(s ** 3 - 3 * p * s)}.`)],
        [`${frac(1, 'α')} + ${frac(1, 'β')}`, red(s, p), T(`${frac(1, 'α')} + ${frac(1, 'β')} = ${frac('α + β', 'αβ')} = ${frac(s, p)} = ${fracR(s, p)}。`, `${frac(1, 'α')} + ${frac(1, 'β')} = ${frac('α + β', 'αβ')} = ${frac(s, p)} = ${fracR(s, p)}.`)],
        [`${frac('α', 'β')} + ${frac('β', 'α')}`, red(e2, p), T(`${frac('α', 'β')} + ${frac('β', 'α')} = ${frac('α² + β²', 'αβ')} = ${frac(e2, p)} = ${fracR(e2, p)}。`, `${frac('α', 'β')} + ${frac('β', 'α')} = ${frac('α² + β²', 'αβ')} = ${frac(e2, p)} = ${fracR(e2, p)}.`)],
        ['(α − β)²', [s * s - 4 * p, 1], T(`(α − β)² = (α + β)² − 4αβ = ${par(s)}² − 4 × ${par(p)} = ${num(s * s - 4 * p)}。`, `(α − β)² = (α + β)² − 4αβ = ${par(s)}² − 4 × ${par(p)} = ${num(s * s - 4 * p)}.`)],
        ['α⁴ + β⁴', [e2 * e2 - 2 * p * p, 1], T(`α⁴ + β⁴ = (α² + β²)² − 2(αβ)² = ${par(e2)}² − 2 × ${par(p)}² = ${num(e2 * e2 - 2 * p * p)}。`, `α⁴ + β⁴ = (α² + β²)² − 2(αβ)² = ${par(e2)}² − 2 × ${par(p)}² = ${num(e2 * e2 - 2 * p * p)}.`)],
      ];
      const [expr, v, step] = items[mode];
      return {
        q: T(`α、β 是 ${poly([1, -s, p])} = 0 的兩根，求 ${expr}。（可用分數）`, `α and β are the roots of ${poly([1, -s, p])} = 0. Find ${expr}. (Fractions are fine.)`),
        ans: ansFrac(...v),
        sol: [T(`根與係數：α + β = ${num(s)}，αβ = ${num(p)}。`, `Vieta: α + β = ${num(s)}, αβ = ${num(p)}.`), T('把所求的式子改寫成 α + β 和 αβ 的式子。', 'Rewrite the expression using only α + β and αβ.'), step],
      };
    },
  },
  {
    id: 'g11-amgm',
    grade: 11,
    name: T('算幾不等式求極值', 'AM-GM inequality: maximum and minimum'),
    cur: { tw: '高一 數與式（算幾不等式）', aops: 'Intermediate Algebra' },
    at: { tw: 10 },
    gen(r) {
      const t = r.int(0, 4);
      if (t === 0) {
        const a = r.int(1, 9), tt = r.int(1, 6), b = a * tt * tt, askX = r.chance(0.3);
        return {
          q: askX ? T(`x > 0，${a === 1 ? '' : a}x + ${frac(b, 'x')} 在 x = ? 時有最小值`, `For x > 0, at what x does ${a === 1 ? '' : a}x + ${frac(b, 'x')} reach its minimum?`)
            : T(`x > 0，求 ${a === 1 ? '' : a}x + ${frac(b, 'x')} 的最小值。`, `For x > 0, find the minimum of ${a === 1 ? '' : a}x + ${frac(b, 'x')}.`),
          ans: ansNum(askX ? tt : 2 * a * tt),
          sol: [T('算幾不等式：兩個正數 P、Q，P + Q ≥ 2√(PQ)，當 P = Q 時等號成立。', 'AM-GM: for positive P and Q, P + Q ≥ 2√(PQ), with equality when P = Q.'), T(`${a === 1 ? '' : a}x + ${frac(b, 'x')} ≥ 2√(${a}x × ${frac(b, 'x')}) = 2√${a * b} = ${2 * a * tt}。`, `${a === 1 ? '' : a}x + ${frac(b, 'x')} ≥ 2√(${a}x × ${frac(b, 'x')}) = 2√${a * b} = ${2 * a * tt}.`), T(`等號：${a === 1 ? '' : a}x = ${frac(b, 'x')} ⇒ x² = ${tt * tt} ⇒ x = ${tt}。`, `Equality: ${a === 1 ? '' : a}x = ${frac(b, 'x')} ⇒ x² = ${tt * tt} ⇒ x = ${tt}.`), T(askX ? `所以在 x = ${tt} 時有最小值 ${2 * a * tt}。` : `最小值是 ${2 * a * tt}（在 x = ${tt}）。`, askX ? `So the minimum ${2 * a * tt} happens at x = ${tt}.` : `The minimum is ${2 * a * tt} (at x = ${tt}).`)],
        };
      }
      if (t === 1) {
        const p = r.int(1, 4), q = r.int(1, 5), m = r.int(1, 4), P = p * q * m * m, mn = 2 * p * q * m;
        return {
          q: T(`x、y 為正數且 xy = ${P}，求 ${p === 1 ? '' : p}x + ${q === 1 ? '' : q}y 的最小值。`, `x and y are positive with xy = ${P}. Find the minimum of ${p === 1 ? '' : p}x + ${q === 1 ? '' : q}y.`),
          ans: ansNum(mn),
          sol: [T(`算幾：${p === 1 ? '' : p}x + ${q === 1 ? '' : q}y ≥ 2√(${p}x · ${q}y) = 2√(${p * q} × ${P})。`, `AM-GM: ${p === 1 ? '' : p}x + ${q === 1 ? '' : q}y ≥ 2√(${p}x · ${q}y) = 2√(${p * q} × ${P}).`), T(`= 2√${p * q * P} = 2 × ${p * q * m} = ${mn}。`, `= 2√${p * q * P} = 2 × ${p * q * m} = ${mn}.`), T(`等號在 ${p}x = ${q}y = ${p * q * m} 時成立，即 x = ${q * m}、y = ${p * m}（xy = ${P} ✓）。`, `Equality when ${p}x = ${q}y = ${p * q * m}: x = ${q * m}, y = ${p * m} (xy = ${P} ✓).`)],
        };
      }
      if (t === 2) {
        const p = r.int(1, 4), q = r.int(1, 5), S = 2 * p * q * r.int(1, 5), mx = red(S * S, 4 * p * q);
        return {
          q: T(`x、y 為正數且 ${p === 1 ? '' : p}x + ${q === 1 ? '' : q}y = ${S}，求 xy 的最大值。`, `x and y are positive with ${p === 1 ? '' : p}x + ${q === 1 ? '' : q}y = ${S}. Find the maximum of xy.`),
          ans: ansFrac(...mx),
          sol: [T(`算幾：${S} = ${p}x + ${q}y ≥ 2√(${p * q}xy)。`, `AM-GM: ${S} = ${p}x + ${q}y ≥ 2√(${p * q}xy).`), T(`√(${p * q}xy) ≤ ${S / 2} ⇒ ${p * q}xy ≤ ${(S / 2) ** 2} ⇒ xy ≤ ${fr(mx)}。`, `√(${p * q}xy) ≤ ${S / 2} ⇒ ${p * q}xy ≤ ${(S / 2) ** 2} ⇒ xy ≤ ${fr(mx)}.`), T(`等號在 ${p}x = ${q}y = ${S / 2} 時成立。最大值 ${fr(mx)}。`, `Equality when ${p}x = ${q}y = ${S / 2}. The maximum is ${fr(mx)}.`)],
        };
      }
      if (t === 3) {
        const L = 4 * r.int(3, 25), n = r.pick(NAMES);
        return {
          q: T(`${n[0]}要用 ${L} 公尺的籬笆圍一塊長方形菜園，菜園一邊靠著牆（那邊不用籬笆）。菜園面積最大是多少平方公尺？`, `${n[1]} has ${L} m of fencing for a rectangular garden. One side is against a wall and needs no fence. What is the largest possible area in m²?`),
          ans: ansNum((L * L) / 8),
          sol: [T(`設垂直牆的兩邊各 x，平行牆的一邊 y：2x + y = ${L}，面積 = xy。`, `Let the two sides perpendicular to the wall be x and the side parallel to it be y: 2x + y = ${L}, area = xy.`), T(`算幾：${L} = 2x + y ≥ 2√(2xy) ⇒ 2xy ≤ ${(L / 2) ** 2} ⇒ xy ≤ ${(L * L) / 8}。`, `AM-GM: ${L} = 2x + y ≥ 2√(2xy) ⇒ 2xy ≤ ${(L / 2) ** 2} ⇒ xy ≤ ${(L * L) / 8}.`), T(`等號在 2x = y = ${L / 2}：x = ${L / 4}、y = ${L / 2}。最大面積 ${(L * L) / 8} 平方公尺。`, `Equality when 2x = y = ${L / 2}: x = ${L / 4}, y = ${L / 2}. Maximum area ${(L * L) / 8} m².`)],
        };
      }
      const m = r.int(2, 9), k = m * m;
      return {
        q: T(`x ≠ 0，求 x² + ${frac(k, 'x²')} 的最小值。`, `For x ≠ 0, find the minimum of x² + ${frac(k, 'x²')}.`),
        ans: ansNum(2 * m),
        sol: [T('x² 和 k/x² 都是正數，可以用算幾不等式。', 'Both x² and k/x² are positive, so AM-GM applies.'), T(`x² + ${frac(k, 'x²')} ≥ 2√(x² · ${frac(k, 'x²')}) = 2√${k} = ${2 * m}。`, `x² + ${frac(k, 'x²')} ≥ 2√(x² · ${frac(k, 'x²')}) = 2√${k} = ${2 * m}.`), T(`等號：x² = ${m}，x = ±${rad(1, m)}。最小值 ${2 * m}。`, `Equality: x² = ${m}, x = ±${rad(1, m)}. The minimum is ${2 * m}.`)],
      };
    },
  },
  {
    id: 'g11-telescoping',
    grade: 11,
    name: T('裂項相消（伸縮級數）', 'Telescoping sums and products'),
    cur: { tw: '高一 數列與級數（裂項）', aops: 'Intermediate Algebra' },
    at: { tw: 10 },
    gen(r) {
      const t = r.int(0, 5);
      if (t === 0) {
        const n = r.int(5, 99), v = red(n, n + 1);
        return {
          q: T(`計算 ${frac(1, '1·2')} + ${frac(1, '2·3')} + ${frac(1, '3·4')} + … + ${frac(1, `${n}·${n + 1}`)}。`, `Compute ${frac(1, '1·2')} + ${frac(1, '2·3')} + ${frac(1, '3·4')} + … + ${frac(1, `${n}·${n + 1}`)}.`),
          ans: ansFrac(...v),
          sol: [T(`裂項：${frac(1, 'k(k + 1)')} = ${frac(1, 'k')} − ${frac(1, 'k + 1')}。`, `Split: ${frac(1, 'k(k + 1)')} = ${frac(1, 'k')} − ${frac(1, 'k + 1')}.`), T(`和 = (1 − ½) + (½ − ⅓) + … + (${frac(1, n)} − ${frac(1, n + 1)})，中間全部消掉。`, `Sum = (1 − ½) + (½ − ⅓) + … + (${frac(1, n)} − ${frac(1, n + 1)}); everything in the middle cancels.`), T(`= 1 − ${frac(1, n + 1)} = ${fr(v)}。`, `= 1 − ${frac(1, n + 1)} = ${fr(v)}.`)],
        };
      }
      if (t === 1) {
        const n = r.int(5, 60), v = red(n, 2 * n + 1);
        return {
          q: T(`計算 ${frac(1, '1·3')} + ${frac(1, '3·5')} + ${frac(1, '5·7')} + … + ${frac(1, `${2 * n - 1}·${2 * n + 1}`)}。`, `Compute ${frac(1, '1·3')} + ${frac(1, '3·5')} + ${frac(1, '5·7')} + … + ${frac(1, `${2 * n - 1}·${2 * n + 1}`)}.`),
          ans: ansFrac(...v),
          sol: [T(`裂項：${frac(1, '(2k − 1)(2k + 1)')} = ½(${frac(1, '2k − 1')} − ${frac(1, '2k + 1')})。`, `Split: ${frac(1, '(2k − 1)(2k + 1)')} = ½(${frac(1, '2k − 1')} − ${frac(1, '2k + 1')}).`), T(`和 = ½(1 − ${frac(1, 3)} + ${frac(1, 3)} − ${frac(1, 5)} + … − ${frac(1, 2 * n + 1)}) = ½(1 − ${frac(1, 2 * n + 1)})。`, `Sum = ½(1 − ${frac(1, 3)} + ${frac(1, 3)} − ${frac(1, 5)} + … − ${frac(1, 2 * n + 1)}) = ½(1 − ${frac(1, 2 * n + 1)}).`), T(`= ½ × ${frac(2 * n, 2 * n + 1)} = ${fr(v)}。`, `= ½ × ${frac(2 * n, 2 * n + 1)} = ${fr(v)}.`)],
        };
      }
      if (t === 2) {
        const n = r.int(4, 40); let v = [0, 1]; for (let k = 1; k <= n; k++) v = fadd(v, [1, k * (k + 2)]);
        return {
          q: T(`計算 ${SIG('k=1', n)} ${frac(1, 'k(k + 2)')}。（用最簡分數）`, `Evaluate ${SIG('k=1', n)} ${frac(1, 'k(k + 2)')}. (Lowest terms.)`),
          ans: ansFrac(...v),
          sol: [T(`裂項：${frac(1, 'k(k + 2)')} = ½(${frac(1, 'k')} − ${frac(1, 'k + 2')})。`, `Split: ${frac(1, 'k(k + 2)')} = ½(${frac(1, 'k')} − ${frac(1, 'k + 2')}).`), T(`相隔兩項才消掉，剩下前兩個正項和後兩個負項：½(1 + ½ − ${frac(1, n + 1)} − ${frac(1, n + 2)})。`, `Terms cancel two apart, leaving the first two positive and the last two negative: ½(1 + ½ − ${frac(1, n + 1)} − ${frac(1, n + 2)}).`), T(`= ${fr(v)}。`, `= ${fr(v)}.`)],
        };
      }
      if (t === 3) {
        const m = r.int(3, 15), n = m * m - 1;
        return {
          q: T(`計算 ${frac(1, '√1 + √2')} + ${frac(1, '√2 + √3')} + … + ${frac(1, `√${n} + √${n + 1}`)}。`, `Compute ${frac(1, '√1 + √2')} + ${frac(1, '√2 + √3')} + … + ${frac(1, `√${n} + √${n + 1}`)}.`),
          ans: ansNum(m - 1),
          sol: [T(`有理化：${frac(1, '√k + √(k + 1)')} = √(k + 1) − √k。`, `Rationalize: ${frac(1, '√k + √(k + 1)')} = √(k + 1) − √k.`), T(`和 = (√2 − √1) + (√3 − √2) + … + (√${n + 1} − √${n})，中間全部消掉。`, `Sum = (√2 − √1) + (√3 − √2) + … + (√${n + 1} − √${n}); the middle cancels.`), T(`= √${n + 1} − 1 = ${m} − 1 = ${m - 1}。`, `= √${n + 1} − 1 = ${m} − 1 = ${m - 1}.`)],
        };
      }
      if (t === 4) {
        const n = r.int(4, 60), v = red(n + 1, 2 * n);
        return {
          q: T(`計算 (1 − ${frac(1, '2²')})(1 − ${frac(1, '3²')})(1 − ${frac(1, '4²')})⋯(1 − ${frac(1, `${n}²`)})。`, `Compute (1 − ${frac(1, '2²')})(1 − ${frac(1, '3²')})(1 − ${frac(1, '4²')})⋯(1 − ${frac(1, `${n}²`)}).`),
          ans: ansFrac(...v),
          sol: [T(`1 − ${frac(1, 'k²')} = ${frac('(k − 1)(k + 1)', 'k · k')} = ${frac('k − 1', 'k')} × ${frac('k + 1', 'k')}。`, `1 − ${frac(1, 'k²')} = ${frac('(k − 1)(k + 1)', 'k · k')} = ${frac('k − 1', 'k')} × ${frac('k + 1', 'k')}.`), T(`${frac('k − 1', 'k')} 那一串相乘 = ${frac(1, 2)} × ${frac(2, 3)} × … = ${frac(1, n)}；${frac('k + 1', 'k')} 那一串 = ${frac(3, 2)} × ${frac(4, 3)} × … = ${frac(n + 1, 2)}。`, `The ${frac('k − 1', 'k')} factors multiply to ${frac(1, 2)} × ${frac(2, 3)} × … = ${frac(1, n)}; the ${frac('k + 1', 'k')} factors give ${frac(3, 2)} × ${frac(4, 3)} × … = ${frac(n + 1, 2)}.`), T(`乘積 = ${frac(1, n)} × ${frac(n + 1, 2)} = ${fr(v)}。`, `Product = ${frac(1, n)} × ${frac(n + 1, 2)} = ${fr(v)}.`)],
        };
      }
      const j = r.int(3, 9), n = 2 ** j - 1;
      return {
        q: T(`計算 log<sub>2</sub>(1 + ${frac(1, 1)}) + log<sub>2</sub>(1 + ${frac(1, 2)}) + … + log<sub>2</sub>(1 + ${frac(1, n)})。`, `Compute log<sub>2</sub>(1 + ${frac(1, 1)}) + log<sub>2</sub>(1 + ${frac(1, 2)}) + … + log<sub>2</sub>(1 + ${frac(1, n)}).`),
        ans: ansNum(j),
        sol: [T(`1 + ${frac(1, 'k')} = ${frac('k + 1', 'k')}，對數相加 = 真數相乘。`, `1 + ${frac(1, 'k')} = ${frac('k + 1', 'k')}, and adding logs means multiplying.`), T(`${frac(2, 1)} × ${frac(3, 2)} × ${frac(4, 3)} × … × ${frac(n + 1, n)} = ${n + 1}（連鎖消去）。`, `${frac(2, 1)} × ${frac(3, 2)} × ${frac(4, 3)} × … × ${frac(n + 1, n)} = ${n + 1} (it telescopes).`), T(`log<sub>2</sub> ${n + 1} = ${j}。`, `log<sub>2</sub> ${n + 1} = ${j}.`)],
      };
    },
  },
  {
    id: 'g11-functional-eq',
    grade: 11,
    name: T('函數方程式', 'Functional equations'),
    cur: { aops: 'Intermediate Algebra' },
    gen(r) {
      const t = r.int(0, 4);
      if (t === 0) {
        const m = r.int(2, 5), c = r.nz(-6, 6), v = m * c, n = r.int(6, 30);
        return {
          q: T(`對所有實數 x、y，f(x + y) = f(x) + f(y)，且 f(${m}) = ${num(v)}。求 f(${n})。`, `For all real x and y, f(x + y) = f(x) + f(y), and f(${m}) = ${num(v)}. Find f(${n}).`),
          ans: ansNum(n * c),
          sol: [T(`f(${m}) = f(1) + f(1) + … （${m} 個）= ${m}f(1)，所以 f(1) = ${num(c)}。`, `f(${m}) = f(1) + f(1) + … (${m} times) = ${m}f(1), so f(1) = ${num(c)}.`), T(`同理 f(${n}) = ${n}f(1)。`, `Likewise f(${n}) = ${n}f(1).`), T(`= ${n} × ${par(c)} = ${num(n * c)}。`, `= ${n} × ${par(c)} = ${num(n * c)}.`)],
        };
      }
      if (t === 1) {
        const a = r.nz(-5, 5), b = r.nz(-5, 5); let p, q; do { p = r.int(0, 4); q = r.int(0, 3); } while (p + q < 2);
        const N = 2 ** p * 3 ** q;
        return {
          q: T(`對所有正數 x、y，f(xy) = f(x) + f(y)。若 f(2) = ${num(a)}、f(3) = ${num(b)}，求 f(${N})。`, `For all positive x and y, f(xy) = f(x) + f(y). If f(2) = ${num(a)} and f(3) = ${num(b)}, find f(${N}).`),
          ans: ansNum(p * a + q * b),
          sol: [T(`${N} = ${[p ? `2${p > 1 ? `<sup>${p}</sup>` : ''}` : '', q ? `3${q > 1 ? `<sup>${q}</sup>` : ''}` : ''].filter(Boolean).join(' × ')}。`, `${N} = ${[p ? `2${p > 1 ? `<sup>${p}</sup>` : ''}` : '', q ? `3${q > 1 ? `<sup>${q}</sup>` : ''}` : ''].filter(Boolean).join(' × ')}.`), T(`乘法拆成加法：f(${N}) = ${p}f(2) + ${q}f(3)（這種函數像對數）。`, `Products turn into sums: f(${N}) = ${p}f(2) + ${q}f(3) (f behaves like a logarithm).`), T(`= ${p} × ${par(a)} + ${q} × ${par(b)} = ${num(p * a + q * b)}。`, `= ${p} × ${par(a)} + ${q} × ${par(b)} = ${num(p * a + q * b)}.`)],
        };
      }
      if (t === 2) {
        const k = r.pick([2, 3]), p = r.nz(-6, 6), q = r.int(-6, 6), m = r.nz(-4, 4);
        const v = fadd(red(p * m, 1 - k), red(q, 1 + k));
        return {
          q: T(`對所有實數 x，f(x) + ${k}f(−x) = ${lin(p, q)}。求 f(${num(m)})。（可用分數）`, `For all real x, f(x) + ${k}f(−x) = ${lin(p, q)}. Find f(${num(m)}). (Fractions are fine.)`),
          ans: ansFrac(...v),
          sol: [T(`把 x 換成 −x：f(−x) + ${k}f(x) = ${lin(-p, q)}。`, `Replace x with −x: f(−x) + ${k}f(x) = ${lin(-p, q)}.`), T(`代 x = ${num(m)}：f(${num(m)}) + ${k}f(${num(-m)}) = ${num(p * m + q)}，f(${num(-m)}) + ${k}f(${num(m)}) = ${num(-p * m + q)}。`, `At x = ${num(m)}: f(${num(m)}) + ${k}f(${num(-m)}) = ${num(p * m + q)} and f(${num(-m)}) + ${k}f(${num(m)}) = ${num(-p * m + q)}.`), T(`第二式 × ${k} 減第一式：${k * k - 1}f(${num(m)}) = ${k} × ${par(-p * m + q)} − ${par(p * m + q)} = ${num(k * (-p * m + q) - (p * m + q))}。`, `${k} × (second) − (first): ${k * k - 1}f(${num(m)}) = ${k} × ${par(-p * m + q)} − ${par(p * m + q)} = ${num(k * (-p * m + q) - (p * m + q))}.`), T(`f(${num(m)}) = ${fr(v)}。`, `f(${num(m)}) = ${fr(v)}.`)],
        };
      }
      if (t === 3) {
        const a = r.pick([2, 3, -1, -2]), b = r.int(-5, 5), cc = a * r.nz(-3, 3), d = r.int(-6, 6), m = r.int(-8, 12);
        const v = red(cc * (m - b), a)[0] / red(cc * (m - b), a)[1] + d;
        return {
          q: T(`f(${lin(a, b)}) = ${lin(cc, d)}，求 f(${num(m)})。`, `f(${lin(a, b)}) = ${lin(cc, d)}. Find f(${num(m)}).`),
          ans: ansNum(v),
          sol: [T(`令 ${lin(a, b)} = ${num(m)}，解出 x = ${fr(red(m - b, a))}。`, `Set ${lin(a, b)} = ${num(m)} and solve: x = ${fr(red(m - b, a))}.`), T(`代入右邊：${num(cc)} × ${frP(red(m - b, a))} ${sgn(d)} = ${num(v)}。`, `Plug into the right side: ${num(cc)} × ${frP(red(m - b, a))} ${sgn(d)} = ${num(v)}.`), T(`所以 f(${num(m)}) = ${num(v)}。（也可先求出 f(t) = ${lin(cc / a, d - (cc / a) * b, 't')}）`, `So f(${num(m)}) = ${num(v)}. (Or first find f(t) = ${lin(cc / a, d - (cc / a) * b, 't')}.)`)],
        };
      }
      const c = r.int(-5, 5), n = r.int(5, 30), v = c + n * (n + 1);
      return {
        q: T(`f(0) = ${num(c)}，且對所有正整數 n，f(n) = f(n − 1) + 2n。求 f(${n})。`, `f(0) = ${num(c)} and f(n) = f(n − 1) + 2n for every positive integer n. Find f(${n}).`),
        ans: ansNum(v),
        sol: [T(`一路展開：f(${n}) = f(0) + 2(1 + 2 + … + ${n})。`, `Unroll it: f(${n}) = f(0) + 2(1 + 2 + … + ${n}).`), T(`1 + 2 + … + ${n} = ${(n * (n + 1)) / 2}。`, `1 + 2 + … + ${n} = ${(n * (n + 1)) / 2}.`), T(`f(${n}) = ${num(c)} + 2 × ${(n * (n + 1)) / 2} = ${num(v)}。`, `f(${n}) = ${num(c)} + 2 × ${(n * (n + 1)) / 2} = ${num(v)}.`)],
      };
    },
  },
  {
    id: 'g11-trig-general',
    grade: 11,
    name: T('廣義角的三角函數', 'Trig functions of any angle'),
    cur: { us: 'Algebra 2 · F-TF.A.2', tw: '高二 數A 三角函數（廣義角）', aops: 'Precalculus' },
    gen(r) {
      const t = r.int(0, 3);
      if (t === 0) {
        const A = r.pick([120, 135, 150, 210, 225, 240, 300, 315, 330, 390, 405, 420, -30, -45, -60, -120, -135, -150, 480, 510, 585, 660, 750]);
        const f = r.pick(['sin', 'cos', 'tan']), v = trigV(f, A), co = ((A % 360) + 360) % 360;
        const ref = co <= 90 ? co : co <= 180 ? 180 - co : co <= 270 ? co - 180 : 360 - co, Q = co < 90 ? 1 : co < 180 ? 2 : co < 270 ? 3 : 4;
        const wr = [exact(-v)]; for (const g of ['sin', 'cos', 'tan']) { wr.push(exact(trigV(g, ref)), exact(-trigV(g, ref))); }
        return {
          q: T(`${f}(${deg(A)}) 的值是？`, `What is ${f}(${deg(A)})?`),
          ans: ansChoice(uniq([exact(v), ...r.shuffle(wr)], 4)),
          sol: [
            ...(co !== A ? [T(`同界角：${deg(A)} ${A < co ? '+' : '−'} ${Math.abs(co - A)}° = ${deg(co)}（加減 360° 的倍數不改變三角函數值）。`, `Coterminal angle: ${deg(A)} ${A < co ? '+' : '−'} ${Math.abs(co - A)}° = ${deg(co)} (adding multiples of 360° changes nothing).`)] : []),
            T(`${deg(co)} 在第${['', '一', '二', '三', '四'][Q]}象限，參考角 ${ref}°。`, `${deg(co)} is in quadrant ${Q ? ['', 'I', 'II', 'III', 'IV'][Q] : ''}; its reference angle is ${ref}°.`),
            T(`「全、正、切、餘」：第${['', '一', '二', '三', '四'][Q]}象限${['', '全部為正', 'sin 為正', 'tan 為正', 'cos 為正'][Q]}，所以 ${f} 是${v > 0 ? '正' : '負'}的。`, `"All Students Take Calculus": in quadrant ${['', 'I all are', 'II only sin is', 'III only tan is', 'IV only cos is'][Q]} positive, so ${f} is ${v > 0 ? 'positive' : 'negative'}.`),
            T(`${f}(${deg(A)}) = ${v < 0 ? '−' : ''}${f} ${ref}° = ${exact(v)}。`, `${f}(${deg(A)}) = ${v < 0 ? '−' : ''}${f} ${ref}° = ${exact(v)}.`),
          ],
        };
      }
      if (t === 1) {
        const [ad, op, hy] = r.pick(TRIPLES), Q = r.int(2, 4), giv = r.pick(['sin', 'cos']);
        const sS = Q <= 2 ? 1 : -1, cS = Q === 4 ? 1 : -1;
        const sv = [sS * op, hy], cv = [cS * ad, hy], tv = [sS * cS * op, ad];
        const want = giv === 'sin' ? r.pick(['cos', 'tan']) : r.pick(['sin', 'tan']), gv = giv === 'sin' ? sv : cv, wv = want === 'sin' ? sv : want === 'cos' ? cv : tv;
        const QN = ['', '一', '二', '三', '四'][Q], QE = ['', 'I', 'II', 'III', 'IV'][Q];
        return {
          q: T(`θ 是第${QN}象限角，且 ${giv} θ = ${fr(gv)}。求 ${want} θ。（用最簡分數）`, `θ is in quadrant ${QE} and ${giv} θ = ${fr(gv)}. Find ${want} θ. (Lowest terms.)`),
          ans: ansFrac(...wv),
          sol: [
            T(`先不管正負，用直角三角形：${giv === 'sin' ? '對邊' : '鄰邊'} ${giv === 'sin' ? op : ad}、斜邊 ${hy}，另一邊 = √(${hy}² − ${giv === 'sin' ? op : ad}²) = ${giv === 'sin' ? ad : op}。`, `Ignore signs first and use a right triangle: ${giv === 'sin' ? 'opposite' : 'adjacent'} ${giv === 'sin' ? op : ad}, hypotenuse ${hy}, so the other side = √(${hy}² − ${giv === 'sin' ? op : ad}²) = ${giv === 'sin' ? ad : op}.`),
            T(`第${QN}象限：sin ${sS > 0 ? '> 0' : '< 0'}，cos ${cS > 0 ? '> 0' : '< 0'}，tan ${sS * cS > 0 ? '> 0' : '< 0'}。`, `Quadrant ${QE}: sin ${sS > 0 ? '> 0' : '< 0'}, cos ${cS > 0 ? '> 0' : '< 0'}, tan ${sS * cS > 0 ? '> 0' : '< 0'}.`),
            T(`所以 ${want} θ = ${fr(wv)}。`, `So ${want} θ = ${fr(wv)}.`),
          ],
        };
      }
      if (t === 2) {
        let A; do A = r.int(91, 359); while (A % 90 === 0);
        const ref = A < 180 ? 180 - A : A < 270 ? A - 180 : 360 - A;
        return {
          q: T(`${deg(A)} 的參考角是幾度？`, `What is the reference angle of ${deg(A)}?`),
          ans: ansNum(ref),
          sol: [T('參考角：終邊與 x 軸所夾的銳角。', 'Reference angle: the acute angle between the terminal side and the x-axis.'), T(`${deg(A)} 在第 ${A < 180 ? '二' : A < 270 ? '三' : '四'} 象限。`, `${deg(A)} is in quadrant ${A < 180 ? 'II' : A < 270 ? 'III' : 'IV'}.`), T(A < 180 ? `180° − ${A}° = ${ref}°。` : A < 270 ? `${A}° − 180° = ${ref}°。` : `360° − ${A}° = ${ref}°。`, A < 180 ? `180° − ${A}° = ${ref}°.` : A < 270 ? `${A}° − 180° = ${ref}°.` : `360° − ${A}° = ${ref}°.`)],
        };
      }
      const b = r.int(1, 359), k = r.nz(-4, 5), A = b + 360 * k;
      return {
        q: T(`找出與 ${deg(A)} 同界、且介於 0° 到 360° 之間的角。`, `Find the angle between 0° and 360° that is coterminal with ${deg(A)}.`),
        ans: ansNum(b),
        sol: [T('同界角相差 360° 的整數倍。', 'Coterminal angles differ by a whole number of 360° turns.'), T(`${deg(A)} ${k > 0 ? '−' : '+'} ${Math.abs(k)} × 360° = ${deg(A)} ${k > 0 ? '−' : '+'} ${Math.abs(k) * 360}° = ${b}°。`, `${deg(A)} ${k > 0 ? '−' : '+'} ${Math.abs(k)} × 360° = ${deg(A)} ${k > 0 ? '−' : '+'} ${Math.abs(k) * 360}° = ${b}°.`), T(`答案 ${b}°。`, `Answer: ${b}°.`)],
      };
    },
  },
  {
    id: 'g11-law-sines-cosines',
    grade: 11,
    name: T('正弦定理與餘弦定理', 'Law of sines and law of cosines'),
    cur: { us: 'Precalculus · G-SRT.D.10–11 (+)', tw: '高二 數A 三角（正弦、餘弦定理）', aops: 'Precalculus' },
    gen(r) {
      const t = r.int(0, 3);
      const S60 = [[3, 8, 7], [5, 8, 7], [7, 15, 13], [8, 15, 13], [5, 21, 19], [16, 21, 19]], S120 = [[3, 5, 7], [7, 8, 13], [5, 16, 19], [11, 24, 31]];
      if (t === 0 || t === 1) {
        const big = r.chance(0.5), [a0, b0, c0] = r.pick(big ? S120 : S60), k = r.int(1, 2), a = a0 * k, b = b0 * k, c = c0 * k, Cdeg = big ? 120 : 60;
        if (t === 0) return {
          q: T(`△ABC 中，a = ${a}，b = ${b}，∠C = ${Cdeg}°，求 c。`, `In triangle ABC, a = ${a}, b = ${b}, and ∠C = ${Cdeg}°. Find c.`),
          fig: shape([[20, 140], [200, 140], [80, 30]], [{ x: 50, y: 78, s: 'b = ' + b }, { x: 145, y: 80, s: 'a = ' + a }, { x: 110, y: 156, s: 'c' }, { x: 80, y: 46, s: `${Cdeg}°`, acc: true }], 220, 165),
          ans: ansNum(c),
          sol: [T('餘弦定理：c² = a² + b² − 2ab cos C。', 'Law of cosines: c² = a² + b² − 2ab cos C.'), T(`cos ${Cdeg}° = ${big ? '−½' : '½'}，所以 c² = ${a}² + ${b}² ${big ? '+' : '−'} ${a} × ${b} = ${a * a} + ${b * b} ${big ? '+' : '−'} ${a * b}。`, `cos ${Cdeg}° = ${big ? '−½' : '½'}, so c² = ${a}² + ${b}² ${big ? '+' : '−'} ${a} × ${b} = ${a * a} + ${b * b} ${big ? '+' : '−'} ${a * b}.`), T(`c² = ${c * c}，c = ${c}。`, `c² = ${c * c}, so c = ${c}.`)],
        };
        return {
          q: T(`△ABC 的三邊長 a = ${a}，b = ${b}，c = ${c}。求 ∠C（c 的對角）是幾度？`, `Triangle ABC has sides a = ${a}, b = ${b}, c = ${c}. Find ∠C (opposite side c) in degrees.`),
          ans: ansNum(Cdeg),
          sol: [T('餘弦定理：cos C = (a² + b² − c²) ÷ (2ab)。', 'Law of cosines: cos C = (a² + b² − c²) ÷ (2ab).'), T(`cos C = (${a * a} + ${b * b} − ${c * c}) ÷ (2 × ${a} × ${b}) = ${frac(a * a + b * b - c * c, 2 * a * b)} = ${big ? '−½' : '½'}。`, `cos C = (${a * a} + ${b * b} − ${c * c}) ÷ (2 × ${a} × ${b}) = ${frac(a * a + b * b - c * c, 2 * a * b)} = ${big ? '−½' : '½'}.`), T(`0° < C < 180°，所以 C = ${Cdeg}°。`, `Since 0° < C < 180°, C = ${Cdeg}°.`)],
        };
      }
      if (t === 2) {
        const A = r.pick([30, 45, 60, 90, 120, 135, 150]), a = r.int(2, 12), [k, rr, d] = SINR[A];
        return {
          q: T(`△ABC 中，a = ${a}，∠A = ${A}°。求外接圓半徑 R。（用最簡根式）`, `In triangle ABC, a = ${a} and ∠A = ${A}°. Find the circumradius R. (Simplest radical form.)`),
          ans: ansRad(a * d, rr, 2 * k * rr),
          sol: [T('正弦定理：a ÷ sin A = 2R。', 'Law of sines: a ÷ sin A = 2R.'), T(`sin ${A}° = ${radF(k, rr, d)}，所以 2R = ${a} ÷ ${radF(k, rr, d)}。`, `sin ${A}° = ${radF(k, rr, d)}, so 2R = ${a} ÷ ${radF(k, rr, d)}.`), T(`R = ${frac(a, `2 × ${radF(k, rr, d)}`)} = ${radF(a * d, rr, 2 * k * rr)}。`, `R = ${frac(a, `2 × ${radF(k, rr, d)}`)} = ${radF(a * d, rr, 2 * k * rr)}.`)],
        };
      }
      let A, B; do { A = r.pick([30, 45, 60, 90, 120, 135]); B = r.pick([30, 45, 60, 90, 120, 135]); } while (A === B || A + B >= 180);
      const a = r.int(2, 12), [kA, rA, dA] = SINR[A], [kB, rB, dB] = SINR[B];
      const num_ = a * kB * dA, rr = rA * rB, den = dB * kA * rA;
      return {
        q: T(`△ABC 中，∠A = ${A}°，∠B = ${B}°，a = ${a}。求 b。（用最簡根式）`, `In triangle ABC, ∠A = ${A}°, ∠B = ${B}°, and a = ${a}. Find b. (Simplest radical form.)`),
        ans: ansRad(num_, rr, den),
        sol: [T('正弦定理：a ÷ sin A = b ÷ sin B。', 'Law of sines: a ÷ sin A = b ÷ sin B.'), T(`b = a × sin B ÷ sin A = ${a} × ${radF(kB, rB, dB)} ÷ ${radF(kA, rA, dA)}。`, `b = a × sin B ÷ sin A = ${a} × ${radF(kB, rB, dB)} ÷ ${radF(kA, rA, dA)}.`), T(`化簡（分母有理化）：b = ${radF(num_, rr, den)}。`, `Simplify (rationalize): b = ${radF(num_, rr, den)}.`)],
      };
    },
  },
  {
    id: 'g11-tri-area-sin',
    grade: 11,
    name: T('三角形面積 ½ab sin C', 'Triangle area: ½ab sin C'),
    cur: { us: 'Precalculus · G-SRT.D.9 (+)', tw: '高二 數A 三角（面積公式）', aops: 'Precalculus' },
    gen(r) {
      const t = r.int(0, 3), C_ = r.pick([30, 45, 60, 90, 120, 135, 150]), [k, rr, d] = SINR[C_], a = r.int(2, 12), b = r.int(2, 12);
      if (t === 0) return {
        q: T(`△ABC 中，a = ${a}，b = ${b}，夾角 ∠C = ${C_}°。求面積。（用最簡根式或分數）`, `In triangle ABC, a = ${a}, b = ${b}, and the included angle ∠C = ${C_}°. Find the area. (Simplest radical form or fraction.)`),
        fig: shape([[20, 140], [200, 140], [80, 30]], [{ x: 50, y: 78, s: b }, { x: 145, y: 80, s: a }, { x: 80, y: 46, s: `${C_}°`, acc: true }], 220, 165),
        ans: ansRad(a * b * k, rr, 2 * d),
        sol: [T('兩邊夾一角的三角形面積 = ½ab sin C。', 'Area with two sides and the included angle = ½ab sin C.'), T(`sin ${C_}° = ${radF(k, rr, d)}。`, `sin ${C_}° = ${radF(k, rr, d)}.`), T(`面積 = ½ × ${a} × ${b} × ${radF(k, rr, d)} = ${radF(a * b * k, rr, 2 * d)}。`, `Area = ½ × ${a} × ${b} × ${radF(k, rr, d)} = ${radF(a * b * k, rr, 2 * d)}.`)],
      };
      if (t === 1) return {
        q: T(`平行四邊形的兩鄰邊長 ${a}、${b}，夾角 ${C_}°。求面積。（用最簡根式或分數）`, `A parallelogram has adjacent sides ${a} and ${b} with an angle of ${C_}° between them. Find its area. (Simplest radical form or fraction.)`),
        ans: ansRad(a * b * k, rr, d),
        sol: [T('對角線把平行四邊形分成兩個全等三角形，所以面積 = ab sin θ。', 'A diagonal splits it into two congruent triangles, so the area = ab sin θ.'), T(`= ${a} × ${b} × ${radF(k, rr, d)}`, `= ${a} × ${b} × ${radF(k, rr, d)}`), T(`= ${radF(a * b * k, rr, d)}。`, `= ${radF(a * b * k, rr, d)}.`)],
      };
      if (t === 2) return {
        q: T(`△ABC 的面積是 ${radF(a * b * k, rr, 2 * d)}，a = ${a}，∠C = ${C_}°。求 b。`, `Triangle ABC has area ${radF(a * b * k, rr, 2 * d)}, a = ${a}, and ∠C = ${C_}°. Find b.`),
        ans: ansNum(b),
        sol: [T('面積 = ½ab sin C，把 b 當未知數。', 'Area = ½ab sin C; solve for b.'), T(`${radF(a * b * k, rr, 2 * d)} = ½ × ${a} × b × ${radF(k, rr, d)} = ${radF(a * k, rr, 2 * d)} b。`, `${radF(a * b * k, rr, 2 * d)} = ½ × ${a} × b × ${radF(k, rr, d)} = ${radF(a * k, rr, 2 * d)} b.`), T(`b = ${b}。`, `b = ${b}.`)],
      };
      const S = r.pick([[[30, 150], 1, 1, 4], [[45, 135], 1, 2, 4], [[60, 120], 1, 3, 4], [[90], 1, 1, 2]]), [angs, kk, r2, dd] = S;
      return {
        q: T(`△ABC 中，a = ${a}，b = ${b}，面積為 ${radF(a * b * kk, r2, dd)}。∠C 可能是幾度？（0° < C < 180°，全部寫出，用逗號隔開）`, `In triangle ABC, a = ${a}, b = ${b}, and the area is ${radF(a * b * kk, r2, dd)}. What can ∠C be? (0° < C < 180°; list all, separated by commas.)`),
        ans: ansSet(angs),
        sol: [T('面積 = ½ab sin C ⇒ sin C = 2 × 面積 ÷ (ab)。', 'Area = ½ab sin C ⇒ sin C = 2 × area ÷ (ab).'), T(`sin C = 2 × ${radF(a * b * kk, r2, dd)} ÷ ${a * b} = ${radF(2 * kk, r2, dd)}。`, `sin C = 2 × ${radF(a * b * kk, r2, dd)} ÷ ${a * b} = ${radF(2 * kk, r2, dd)}.`), angs.length === 2 ? T(`0° 到 180° 之間 sin 值相同的角有兩個：${angs[0]}° 和 180° − ${angs[0]}° = ${angs[1]}°，兩個都可以。`, `Between 0° and 180°, two angles have this sine: ${angs[0]}° and 180° − ${angs[0]}° = ${angs[1]}°. Both work.`) : T('sin C = 1 只有 C = 90°。', 'sin C = 1 only when C = 90°.')],
      };
    },
  },
  {
    id: 'g11-vectors',
    grade: 11,
    name: T('平面向量：內積、夾角與投影', 'Plane vectors: dot product, angle, projection'),
    cur: { us: 'Precalculus · N-VM (+)', tw: '高二 數A/數B 平面向量', aops: 'Precalculus' },
    gen(r) {
      const t = r.int(0, 4);
      if (t === 0) {
        const u = [r.nz(-6, 6), r.int(-6, 6)], v = [r.int(-6, 6), r.nz(-6, 6)];
        return {
          q: T(`${V('u')} = ${vec(u)}，${V('v')} = ${vec(v)}，求 ${V('u')} · ${V('v')}。`, `${V('u')} = ${vec(u)} and ${V('v')} = ${vec(v)}. Find ${V('u')} · ${V('v')}.`),
          ans: ansNum(dot(u, v)),
          sol: [T('內積 = 對應分量相乘再相加：(a, b) · (c, d) = ac + bd。', 'Dot product: multiply matching components and add: (a, b) · (c, d) = ac + bd.'), T(`= ${num(u[0])} × ${par(v[0])} + ${par(u[1])} × ${par(v[1])} = ${num(u[0] * v[0])} ${sgn(u[1] * v[1])} = ${num(dot(u, v))}。`, `= ${num(u[0])} × ${par(v[0])} + ${par(u[1])} × ${par(v[1])} = ${num(u[0] * v[0])} ${sgn(u[1] * v[1])} = ${num(dot(u, v))}.`)],
        };
      }
      if (t === 1) {
        const a = r.nz(-4, 4), b = r.nz(-4, 4), k = r.int(1, 2), ang = r.pick([45, 90, 135, 180]);
        const v = ang === 90 ? [-b * k, a * k] : ang === 45 ? [(a - b) * k, (a + b) * k] : ang === 135 ? [(-a - b) * k, (a - b) * k] : [-a * k, -b * k];
        const u = [a, b], D = dot(u, v), N = dot(u, u) * dot(v, v);
        return {
          q: T(`${V('u')} = ${vec(u)}，${V('v')} = ${vec(v)}，求兩向量的夾角（度）。`, `${V('u')} = ${vec(u)} and ${V('v')} = ${vec(v)}. Find the angle between them in degrees.`),
          ans: ansNum(ang),
          sol: [T('cos θ = (u · v) ÷ (|u||v|)。', 'cos θ = (u · v) ÷ (|u||v|).'), T(`u · v = ${num(D)}，|u|² = ${dot(u, u)}，|v|² = ${dot(v, v)}，|u||v| = √${N}${D !== 0 ? ` = ${radF(1, N)}` : ''}。`, `u · v = ${num(D)}, |u|² = ${dot(u, u)}, |v|² = ${dot(v, v)}, |u||v| = √${N}${D !== 0 ? ` = ${radF(1, N)}` : ''}.`), T(`cos θ = ${D === 0 ? '0' : `${frac(num(D), radF(1, N))} = ${exact(Math.cos(ang * D2R))}`}，所以 θ = ${ang}°。`, `cos θ = ${D === 0 ? '0' : `${frac(num(D), radF(1, N))} = ${exact(Math.cos(ang * D2R))}`}, so θ = ${ang}°.`)],
        };
      }
      if (t === 2) {
        const a = r.nz(-6, 6), b = r.nz(-6, 6), c = r.nz(-6, 6), k = red(-b * c, a);
        return {
          q: T(`${V('u')} = ${vec([a, b])}，${V('v')} = (k, ${num(c)})。若 ${V('u')} ⊥ ${V('v')}，求 k。（可用分數）`, `${V('u')} = ${vec([a, b])} and ${V('v')} = (k, ${num(c)}). If ${V('u')} ⊥ ${V('v')}, find k. (Fractions are fine.)`),
          ans: ansFrac(...k),
          sol: [T('垂直 ⇔ 內積 = 0。', 'Perpendicular ⇔ dot product = 0.'), T(`${num(a)}k + ${par(b)} × ${par(c)} = 0 ⇒ ${num(a)}k = ${num(-b * c)}。`, `${num(a)}k + ${par(b)} × ${par(c)} = 0 ⇒ ${num(a)}k = ${num(-b * c)}.`), T(`k = ${fr(k)}。`, `k = ${fr(k)}.`)],
        };
      }
      if (t === 3) {
        const [p, q, h] = r.pick(TRIPLES.slice(0, 3)), v = [p * r.sign(), q * r.sign()], u = [r.int(-8, 8), r.int(-8, 8)];
        if (dot(u, v) === 0) u[0] += 1;
        const D = dot(u, v);
        return {
          q: T(`${V('u')} = ${vec(u)}，${V('v')} = ${vec(v)}。求 ${V('u')} 在 ${V('v')} 方向上的正射影長（純量投影，可為負，可用分數）。`, `${V('u')} = ${vec(u)} and ${V('v')} = ${vec(v)}. Find the scalar projection of ${V('u')} onto ${V('v')} (may be negative; fractions are fine).`),
          ans: ansFrac(D, h),
          sol: [T('純量投影 = (u · v) ÷ |v|。', 'Scalar projection = (u · v) ÷ |v|.'), T(`u · v = ${num(u[0])} × ${par(v[0])} + ${par(u[1])} × ${par(v[1])} = ${num(D)}；|v| = √(${v[0] ** 2} + ${v[1] ** 2}) = ${h}。`, `u · v = ${num(u[0])} × ${par(v[0])} + ${par(u[1])} × ${par(v[1])} = ${num(D)}; |v| = √(${v[0] ** 2} + ${v[1] ** 2}) = ${h}.`), T(`投影 = ${frac(D, h)}${gcd(D, h) > 1 ? ` = ${fracR(D, h)}` : ''}。`, `Projection = ${frac(D, h)}${gcd(D, h) > 1 ? ` = ${fracR(D, h)}` : ''}.`)],
        };
      }
      const u = [r.int(-4, 4), r.nz(-4, 4)], v = [r.nz(-4, 4), r.int(-4, 4)], m = r.pick([2, 3, -2]), n = r.pick([1, -1, 2]);
      const w = [m * u[0] + n * v[0], m * u[1] + n * v[1]], L2 = dot(w, w);
      if (L2 === 0) w[0] = 1;
      const L = dot(w, w), [kk, s] = simpRoot(L);
      const lc = `${m === 1 ? '' : m === -1 ? '−' : m}${V('u')} ${n < 0 ? '−' : '+'} ${Math.abs(n) === 1 ? '' : Math.abs(n)}${V('v')}`;
      return {
        q: T(`${V('u')} = ${vec(u)}，${V('v')} = ${vec(v)}。求 |${lc}|。（用最簡根式）`, `${V('u')} = ${vec(u)} and ${V('v')} = ${vec(v)}. Find |${lc}|. (Simplest radical form.)`),
        ans: ansRad(1, L),
        sol: [T(`先算向量：${lc} = ${vec(w)}。`, `First the vector: ${lc} = ${vec(w)}.`), T(`長度 = √(${par(w[0])}² + ${par(w[1])}²) = √${L}。`, `Length = √(${par(w[0])}² + ${par(w[1])}²) = √${L}.`), T(kk > 1 || s === 1 ? `化簡：√${L} = ${rad(kk, s)}。` : `√${L} 已是最簡根式。`, kk > 1 || s === 1 ? `Simplify: √${L} = ${rad(kk, s)}.` : `√${L} is already in simplest form.`)],
      };
    },
  },
  {
    id: 'g11-space-vectors',
    grade: 11,
    name: T('空間向量與平面', 'Vectors in space and planes'),
    cur: { us: 'Precalculus · Vectors (+)', tw: '高二 數A 空間向量／空間中的平面', aops: 'Precalculus' },
    gen(r) {
      const t = r.int(0, 5);
      const Q4 = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [4, 4, 7, 9], [2, 10, 11, 15], [6, 6, 7, 11]];
      const rv = () => [r.int(-5, 5), r.int(-5, 5), r.int(-5, 5)];
      const nrm = () => { const q = r.pick(Q4), p = r.shuffle(q.slice(0, 3)).map((x) => x * r.sign()); return [p, q[3]]; };
      if (t === 0) {
        const u = rv(), v = rv();
        return {
          q: T(`${V('u')} = ${vec(u)}，${V('v')} = ${vec(v)}，求 ${V('u')} · ${V('v')}。`, `${V('u')} = ${vec(u)}, ${V('v')} = ${vec(v)}. Find ${V('u')} · ${V('v')}.`),
          ans: ansNum(dot(u, v)),
          sol: [T('空間向量內積：x₁x₂ + y₁y₂ + z₁z₂。', 'Dot product in space: x₁x₂ + y₁y₂ + z₁z₂.'), T(`= ${u.map((x, i) => `${par(x)} × ${par(v[i])}`).join(' + ')}`, `= ${u.map((x, i) => `${par(x)} × ${par(v[i])}`).join(' + ')}`), T(`= ${num(dot(u, v))}。${dot(u, v) === 0 ? '內積為 0，兩向量垂直。' : ''}`, `= ${num(dot(u, v))}.${dot(u, v) === 0 ? ' The dot product is 0, so they are perpendicular.' : ''}`)],
        };
      }
      if (t === 1) {
        const [n, L] = nrm();
        return {
          q: T(`求向量 ${vec(n)} 的長度。`, `Find the length of the vector ${vec(n)}.`),
          ans: ansNum(L),
          sol: [T('|(a, b, c)| = √(a² + b² + c²)。', '|(a, b, c)| = √(a² + b² + c²).'), T(`= √(${n.map((x) => x * x).join(' + ')}) = √${L * L} = ${L}。`, `= √(${n.map((x) => x * x).join(' + ')}) = √${L * L} = ${L}.`)],
        };
      }
      if (t === 2) {
        let u, v, w; do { u = rv(); v = rv(); w = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; } while (w.every((x) => x === 0) || w.some((x, i) => x === -w[i] && false));
        const wrong1 = w.map((x) => -x), wrong2 = [w[0], -w[1], w[2]], wrong3 = u.map((x, i) => x * v[i]);
        return {
          q: T(`${V('u')} = ${vec(u)}，${V('v')} = ${vec(v)}，求外積 ${V('u')} × ${V('v')}。`, `${V('u')} = ${vec(u)}, ${V('v')} = ${vec(v)}. Find the cross product ${V('u')} × ${V('v')}.`),
          ans: choice(vec(w), [vec(wrong1), vec(wrong2), vec(wrong3), vec([w[1], w[0], w[2]])]),
          sol: [T('u × v = (u₂v₃ − u₃v₂, u₃v₁ − u₁v₃, u₁v₂ − u₂v₁)。', 'u × v = (u₂v₃ − u₃v₂, u₃v₁ − u₁v₃, u₁v₂ − u₂v₁).'), T(`x：${par(u[1])}×${par(v[2])} − ${par(u[2])}×${par(v[1])} = ${num(w[0])}；y：${par(u[2])}×${par(v[0])} − ${par(u[0])}×${par(v[2])} = ${num(w[1])}；z：${par(u[0])}×${par(v[1])} − ${par(u[1])}×${par(v[0])} = ${num(w[2])}。`, `x: ${par(u[1])}×${par(v[2])} − ${par(u[2])}×${par(v[1])} = ${num(w[0])}; y: ${par(u[2])}×${par(v[0])} − ${par(u[0])}×${par(v[2])} = ${num(w[1])}; z: ${par(u[0])}×${par(v[1])} − ${par(u[1])}×${par(v[0])} = ${num(w[2])}.`), T(`u × v = ${vec(w)}。驗算：它和 u、v 的內積都是 0。`, `u × v = ${vec(w)}. Check: its dot product with u and with v is 0.`)],
        };
      }
      if (t === 3) {
        const [n, L] = nrm(), P0 = rv(); let d; do d = r.int(-20, 20); while (dot(n, P0) + d === 0);
        const N = Math.abs(dot(n, P0) + d);
        return {
          q: T(`求點 P${vec(P0)} 到平面 ${linXY([...n, d], ['x', 'y', 'z', ''])} = 0 的距離。（可用分數）`, `Find the distance from P${vec(P0)} to the plane ${linXY([...n, d], ['x', 'y', 'z', ''])} = 0. (Fractions are fine.)`),
          ans: ansFrac(N, L),
          sol: [T('點到平面距離：|ax₀ + by₀ + cz₀ + d| ÷ √(a² + b² + c²)。', 'Point-to-plane distance: |ax₀ + by₀ + cz₀ + d| ÷ √(a² + b² + c²).'), T(`分子 = |${n.map((x, i) => `${par(x)}×${par(P0[i])}`).join(' + ')} ${sgn(d)}| = ${N}；分母 = √${L * L} = ${L}。`, `Numerator = |${n.map((x, i) => `${par(x)}×${par(P0[i])}`).join(' + ')} ${sgn(d)}| = ${N}; denominator = √${L * L} = ${L}.`), T(`距離 = ${frac(N, L)}${gcd(N, L) > 1 ? ` = ${fracR(N, L)}` : ''}。`, `Distance = ${frac(N, L)}${gcd(N, L) > 1 ? ` = ${fracR(N, L)}` : ''}.`)],
        };
      }
      if (t === 4) {
        const n = [r.nz(-5, 5), r.int(-5, 5), r.nz(-5, 5)], P0 = rv(), D = dot(n, P0);
        return {
          q: T(`平面通過點 ${vec(P0)}，法向量為 ${vec(n)}。它的方程式是 ${linXY(n, ['x', 'y', 'z'])} = D，求 D。`, `A plane passes through ${vec(P0)} with normal vector ${vec(n)}. Its equation is ${linXY(n, ['x', 'y', 'z'])} = D. Find D.`),
          ans: ansNum(D),
          sol: [T('法向量 (a, b, c) 的平面：ax + by + cz = D。', 'A plane with normal (a, b, c) is ax + by + cz = D.'), T('點在平面上，代入即可求 D。', 'The point lies on the plane, so plug it in to get D.'), T(`D = ${n.map((x, i) => `${par(x)} × ${par(P0[i])}`).join(' + ')} = ${num(D)}。`, `D = ${n.map((x, i) => `${par(x)} × ${par(P0[i])}`).join(' + ')} = ${num(D)}.`)],
        };
      }
      let u, v, w; do { u = rv(); v = rv(); w = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; } while (w.every((x) => x === 0));
      const L = dot(w, w), [kk, s] = simpRoot(L);
      return {
        q: T(`以 ${V('u')} = ${vec(u)} 和 ${V('v')} = ${vec(v)} 為鄰邊的平行四邊形面積是多少？（用最簡根式）`, `What is the area of the parallelogram spanned by ${V('u')} = ${vec(u)} and ${V('v')} = ${vec(v)}? (Simplest radical form.)`),
        ans: ansRad(1, L),
        sol: [T('平行四邊形面積 = |u × v|。', 'Parallelogram area = |u × v|.'), T(`u × v = ${vec(w)}。`, `u × v = ${vec(w)}.`), T(`|u × v| = √(${w.map((x) => x * x).join(' + ')}) = √${L}${kk > 1 || s === 1 ? ` = ${rad(kk, s)}` : ''}。`, `|u × v| = √(${w.map((x) => x * x).join(' + ')}) = √${L}${kk > 1 || s === 1 ? ` = ${rad(kk, s)}` : ''}.`)],
      };
    },
  },
  {
    id: 'g11-matrix',
    grade: 11,
    name: T('矩陣：乘法、行列式、反矩陣', 'Matrices: products, determinants, inverses'),
    cur: { us: 'Precalculus · N-VM.C (+)', tw: '高三 數甲 矩陣', aops: 'Precalculus' },
    at: { tw: 12 },
    gen(r) {
      const t = r.int(0, 5), e = () => r.int(-4, 5);
      const mm = (A, B) => [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]], [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]];
      if (t === 0) {
        const A = [[e(), e()], [e(), e()]], B = [[e(), e()], [e(), e()]], AB = mm(A, B), BA = mm(B, A), EW = A.map((row, i) => row.map((x, j) => x * B[i][j]));
        const RR = [[A[0][0] * B[0][0] + A[0][1] * B[0][1], A[0][0] * B[1][0] + A[0][1] * B[1][1]], [A[1][0] * B[0][0] + A[1][1] * B[0][1], A[1][0] * B[1][0] + A[1][1] * B[1][1]]];
        return {
          q: T(`計算 ${mat(A)}${mat(B)}。`, `Compute ${mat(A)}${mat(B)}.`),
          ans: choice(mat(AB), [mat(BA), mat(EW), mat(RR), mat(AB.map((row) => row.map((x) => -x)))]),
          sol: [T('矩陣乘法：第 i 列 × 第 j 行（對應相乘再相加）得到第 (i, j) 項。', 'Matrix product: entry (i, j) = row i of the first · column j of the second.'), T(`(1,1)：${par(A[0][0])}×${par(B[0][0])} + ${par(A[0][1])}×${par(B[1][0])} = ${num(AB[0][0])}；(1,2)：${par(A[0][0])}×${par(B[0][1])} + ${par(A[0][1])}×${par(B[1][1])} = ${num(AB[0][1])}。`, `(1,1): ${par(A[0][0])}×${par(B[0][0])} + ${par(A[0][1])}×${par(B[1][0])} = ${num(AB[0][0])}; (1,2): ${par(A[0][0])}×${par(B[0][1])} + ${par(A[0][1])}×${par(B[1][1])} = ${num(AB[0][1])}.`), T(`(2,1)：${par(A[1][0])}×${par(B[0][0])} + ${par(A[1][1])}×${par(B[1][0])} = ${num(AB[1][0])}；(2,2)：${par(A[1][0])}×${par(B[0][1])} + ${par(A[1][1])}×${par(B[1][1])} = ${num(AB[1][1])}。`, `(2,1): ${par(A[1][0])}×${par(B[0][0])} + ${par(A[1][1])}×${par(B[1][0])} = ${num(AB[1][0])}; (2,2): ${par(A[1][0])}×${par(B[0][1])} + ${par(A[1][1])}×${par(B[1][1])} = ${num(AB[1][1])}.`), T(`答案 ${mat(AB)}。注意 AB 通常不等於 BA。`, `Answer: ${mat(AB)}. Note AB is usually not equal to BA.`)],
        };
      }
      if (t === 1) {
        if (r.chance(0.6)) {
          const a = e(), b = e(), c = e(), d = e();
          return {
            q: T(`求行列式 ${detB([[a, b], [c, d]])} 的值。`, `Evaluate the determinant ${detB([[a, b], [c, d]])}.`),
            ans: ansNum(a * d - b * c),
            sol: [T('二階行列式 = ad − bc（主對角線乘積減副對角線乘積）。', '2×2 determinant = ad − bc (main diagonal product minus the other).'), T(`= ${par(a)} × ${par(d)} − ${par(b)} × ${par(c)} = ${num(a * d)} − ${par(b * c)} = ${num(a * d - b * c)}。`, `= ${par(a)} × ${par(d)} − ${par(b)} × ${par(c)} = ${num(a * d)} − ${par(b * c)} = ${num(a * d - b * c)}.`)],
          };
        }
        const M = [[e(), e(), e()], [e(), e(), e()], [e(), e(), e()]].map((row) => row.map((x) => Math.max(-3, Math.min(3, x))));
        const [[a, b, c], [d, f, g], [h, i, j]] = M, D = a * (f * j - g * i) - b * (d * j - g * h) + c * (d * i - f * h);
        return {
          q: T(`求三階行列式 ${detB(M)} 的值。`, `Evaluate the 3×3 determinant ${detB(M)}.`),
          ans: ansNum(D),
          sol: [T('沿第一列降階展開：a(ei − fh) − b(di − fg) + c(dh − eg)。', 'Expand along the first row: a(ei − fh) − b(di − fg) + c(dh − eg).'), T(`= ${par(a)}(${num(f * j - g * i)}) − ${par(b)}(${num(d * j - g * h)}) + ${par(c)}(${num(d * i - f * h)})`, `= ${par(a)}(${num(f * j - g * i)}) − ${par(b)}(${num(d * j - g * h)}) + ${par(c)}(${num(d * i - f * h)})`), T(`= ${num(D)}。`, `= ${num(D)}.`)],
        };
      }
      if (t === 2) {
        let a, b, c, d, D; do { a = e(); b = e(); c = e(); d = e(); D = a * d - b * c; } while (![1, -1, 2, -2, 3].includes(D));
        const F = (m) => m.map((row) => row.map((x) => fracR(x, D)));
        const inv = F([[d, -b], [-c, a]]);
        return {
          q: T(`求 A = ${mat([[a, b], [c, d]])} 的反矩陣 A<sup>−1</sup>。`, `Find the inverse of A = ${mat([[a, b], [c, d]])}.`),
          ans: choice(mat(inv), [mat(F([[a, -b], [-c, d]])), mat(F([[d, b], [c, a]])), mat([[d * D, -b * D], [-c * D, a * D]]), mat(F([[-d, b], [c, -a]]))]),
          sol: [T(`det A = ${par(a)}×${par(d)} − ${par(b)}×${par(c)} = ${D} ≠ 0，所以反矩陣存在。`, `det A = ${par(a)}×${par(d)} − ${par(b)}×${par(c)} = ${D} ≠ 0, so A is invertible.`), T('二階反矩陣：A⁻¹ = (1/det) × [d, −b; −c, a]（主對角交換，副對角變號）。', '2×2 inverse: A⁻¹ = (1/det) × [d, −b; −c, a] (swap the main diagonal, negate the other).'), T(`A<sup>−1</sup> = ${frac(1, D)} ${mat([[d, -b], [-c, a]])} = ${mat(inv)}。`, `A<sup>−1</sup> = ${frac(1, D)} ${mat([[d, -b], [-c, a]])} = ${mat(inv)}.`), T('驗算：A × A⁻¹ = 單位矩陣。', 'Check: A × A⁻¹ = the identity matrix.')],
        };
      }
      if (t === 3) {
        let a, b, c, d, D; do { a = r.nz(-5, 5); b = r.nz(-5, 5); c = r.nz(-5, 5); d = r.nz(-5, 5); D = a * d - b * c; } while (D === 0);
        const x = r.int(-5, 5), y = r.int(-5, 5), p = a * x + b * y, q = c * x + d * y, Dx = p * d - b * q, Dy = a * q - p * c;
        return {
          q: T(`用克拉瑪公式解聯立方程式：${linXY([a, b])} = ${num(p)}，${linXY([c, d])} = ${num(q)}。答案寫成 (x, y)。`, `Use Cramer's rule to solve ${linXY([a, b])} = ${num(p)} and ${linXY([c, d])} = ${num(q)}. Answer as (x, y).`),
          ans: ansPair(x, y),
          sol: [T(`Δ = ${detB([[a, b], [c, d]])} = ${num(D)}。`, `Δ = ${detB([[a, b], [c, d]])} = ${num(D)}.`), T(`Δx = ${detB([[p, b], [q, d]])} = ${num(Dx)}，Δy = ${detB([[a, p], [c, q]])} = ${num(Dy)}。`, `Δx = ${detB([[p, b], [q, d]])} = ${num(Dx)}, Δy = ${detB([[a, p], [c, q]])} = ${num(Dy)}.`), T(`x = Δx/Δ = ${num(x)}，y = Δy/Δ = ${num(y)}。答 (${num(x)}, ${num(y)})。`, `x = Δx/Δ = ${num(x)}, y = Δy/Δ = ${num(y)}. Answer (${num(x)}, ${num(y)}).`)],
        };
      }
      if (t === 4) {
        const a = r.nz(-6, 6), b = r.nz(-6, 6), c = r.nz(-6, 6), k = red(a * b, c);
        return {
          q: T(`若 ${mat([['k', a], [b, c]])} 沒有反矩陣，求 k。（可用分數）`, `If ${mat([['k', a], [b, c]])} has no inverse, find k. (Fractions are fine.)`),
          ans: ansFrac(...k),
          sol: [T('沒有反矩陣 ⇔ 行列式 = 0。', 'No inverse ⇔ determinant = 0.'), T(`${num(c)}k − ${par(a)} × ${par(b)} = 0 ⇒ ${num(c)}k = ${num(a * b)}。`, `${num(c)}k − ${par(a)} × ${par(b)} = 0 ⇒ ${num(c)}k = ${num(a * b)}.`), T(`k = ${fr(k)}。`, `k = ${fr(k)}.`)],
        };
      }
      const M = [[e(), e()], [e(), e()]], x = r.int(-4, 4), y = r.nz(-4, 4), X = M[0][0] * x + M[0][1] * y, Y = M[1][0] * x + M[1][1] * y;
      return {
        q: T(`矩陣 ${mat(M)} 把點 (${num(x)}, ${num(y)}) 變換到哪一點？答案寫成 (x, y)。`, `The matrix ${mat(M)} maps the point (${num(x)}, ${num(y)}) to which point? Answer as (x, y).`),
        ans: ansPair(X, Y),
        sol: [T(`把點寫成行向量，左乘矩陣：${mat(M)}${mat([[x], [y]])}。`, `Write the point as a column vector and multiply: ${mat(M)}${mat([[x], [y]])}.`), T(`x′ = ${par(M[0][0])}×${par(x)} + ${par(M[0][1])}×${par(y)} = ${num(X)}；y′ = ${par(M[1][0])}×${par(x)} + ${par(M[1][1])}×${par(y)} = ${num(Y)}。`, `x′ = ${par(M[0][0])}×${par(x)} + ${par(M[0][1])}×${par(y)} = ${num(X)}; y′ = ${par(M[1][0])}×${par(x)} + ${par(M[1][1])}×${par(y)} = ${num(Y)}.`), T(`像點 (${num(X)}, ${num(Y)})。`, `Image: (${num(X)}, ${num(Y)}).`)],
      };
    },
  },
  {
    id: 'g11-conics',
    grade: 11,
    name: T('圓錐曲線：拋物線、橢圓、雙曲線', 'Conic sections: parabola, ellipse, hyperbola'),
    cur: { us: 'Precalculus · G-GPE.A.2–3 (+)', tw: '高三 數甲 圓錐曲線', aops: 'Precalculus' },
    at: { tw: 12 },
    gen(r) {
      const t = r.int(0, 3);
      if (t === 0) {
        const c = r.nz(-5, 5), hor = r.chance(0.5), askF = r.chance(0.6);
        const eq = hor ? `y<sup>2</sup> = ${num(4 * c)}x` : `x<sup>2</sup> = ${num(4 * c)}y`;
        return {
          q: askF ? T(`拋物線 ${eq} 的焦點坐標是？答案寫成 (x, y)。`, `Find the focus of the parabola ${eq}. Answer as (x, y).`) : T(`拋物線 ${eq} 的準線是 ${hor ? 'x' : 'y'} = ?`, `The directrix of the parabola ${eq} is ${hor ? 'x' : 'y'} = ?`),
          ans: askF ? (hor ? ansPair(c, 0) : ansPair(0, c)) : ansNum(-c),
          sol: [T(`標準式 ${hor ? 'y² = 4cx' : 'x² = 4cy'}：頂點在原點，焦點 ${hor ? '(c, 0)' : '(0, c)'}，準線 ${hor ? 'x' : 'y'} = −c。`, `Standard form ${hor ? 'y² = 4cx' : 'x² = 4cy'}: vertex at the origin, focus ${hor ? '(c, 0)' : '(0, c)'}, directrix ${hor ? 'x' : 'y'} = −c.`), T(`4c = ${num(4 * c)} ⇒ c = ${num(c)}。`, `4c = ${num(4 * c)} ⇒ c = ${num(c)}.`), askF ? T(`焦點 ${hor ? `(${num(c)}, 0)` : `(0, ${num(c)})`}。`, `Focus ${hor ? `(${num(c)}, 0)` : `(0, ${num(c)})`}.`) : T(`準線 ${hor ? 'x' : 'y'} = ${num(-c)}。`, `Directrix ${hor ? 'x' : 'y'} = ${num(-c)}.`)],
        };
      }
      if (t === 1) {
        const [b, c, a] = r.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 6, 10], [6, 8, 10], [15, 8, 17]]), hor = r.chance(0.5), mode = r.int(0, 2);
        const eq = hor ? `${frac('x²', a * a)} + ${frac('y²', b * b)} = 1` : `${frac('x²', b * b)} + ${frac('y²', a * a)} = 1`;
        const qs = [[T('兩焦點之間的距離', 'the distance between the foci'), 2 * c], [T('長軸長', 'the length of the major axis'), 2 * a], [T('橢圓上任一點到兩焦點的距離和', 'the sum of the distances from any point on the ellipse to the two foci'), 2 * a]];
        const [lab, v] = qs[mode];
        return {
          q: T(`橢圓 ${eq}，求${lab.zh}。`, `For the ellipse ${eq}, find ${lab.en}.`),
          ans: ansNum(v),
          sol: [T(`分母大的是 a²：a² = ${a * a}、b² = ${b * b}，長軸在 ${hor ? 'x' : 'y'} 軸上。`, `The larger denominator is a²: a² = ${a * a}, b² = ${b * b}; the major axis is on the ${hor ? 'x' : 'y'}-axis.`), T(`橢圓：c² = a² − b² = ${a * a} − ${b * b} = ${c * c}，c = ${c}。`, `For an ellipse c² = a² − b² = ${a * a} − ${b * b} = ${c * c}, so c = ${c}.`), mode === 0 ? T(`焦點距離 2c = ${2 * c}。`, `Distance between foci = 2c = ${2 * c}.`) : T(`${mode === 1 ? '長軸長' : '距離和（橢圓的定義）'} = 2a = ${2 * a}。`, `${mode === 1 ? 'Major axis' : 'Sum of focal distances (the definition of an ellipse)'} = 2a = ${2 * a}.`)],
        };
      }
      if (t === 2) {
        const [a, b, c] = r.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [6, 8, 10], [8, 15, 17]]), mode = r.int(0, 1);
        const eq = `${frac('x²', a * a)} − ${frac('y²', b * b)} = 1`;
        if (mode === 0) return {
          q: T(`雙曲線 ${eq} 的右焦點坐標是？答案寫成 (x, y)。`, `Find the right focus of the hyperbola ${eq}. Answer as (x, y).`),
          ans: ansPair(c, 0),
          sol: [T(`a² = ${a * a}，b² = ${b * b}。`, `a² = ${a * a}, b² = ${b * b}.`), T(`雙曲線：c² = a² + b² = ${a * a + b * b}，c = ${c}（注意和橢圓不同，是相加）。`, `For a hyperbola c² = a² + b² = ${a * a + b * b}, so c = ${c} (unlike the ellipse, we add).`), T(`右焦點 (${c}, 0)。`, `Right focus (${c}, 0).`)],
        };
        return {
          q: T(`雙曲線 ${eq} 的漸近線是？`, `What are the asymptotes of the hyperbola ${eq}?`),
          ans: choice(`y = ± ${frac(b, a)}x`, [`y = ± ${frac(a, b)}x`, `y = ± ${frac(b * b, a * a)}x`, `y = ± ${frac(c, a)}x`]),
          sol: [T(`把右邊的 1 改成 0：${frac('x²', a * a)} = ${frac('y²', b * b)}。`, `Replace the 1 with 0: ${frac('x²', a * a)} = ${frac('y²', b * b)}.`), T(`開根號：${frac('y', b)} = ±${frac('x', a)}。`, `Take square roots: ${frac('y', b)} = ±${frac('x', a)}.`), T(`y = ± ${frac(b, a)}x。`, `y = ± ${frac(b, a)}x.`)],
        };
      }
      const c = r.nz(-5, 5), hor = r.chance(0.5);
      return {
        q: T(`頂點在原點、焦點在 ${hor ? `(${num(c)}, 0)` : `(0, ${num(c)})`} 的拋物線方程式為 ${hor ? 'y² = kx' : 'x² = ky'}，求 k。`, `A parabola has vertex at the origin and focus ${hor ? `(${num(c)}, 0)` : `(0, ${num(c)})`}. Its equation is ${hor ? 'y² = kx' : 'x² = ky'}. Find k.`),
        ans: ansNum(4 * c),
        sol: [T(`焦點在 ${hor ? 'x' : 'y'} 軸上，用 ${hor ? 'y² = 4cx' : 'x² = 4cy'}。`, `The focus is on the ${hor ? 'x' : 'y'}-axis, so use ${hor ? 'y² = 4cx' : 'x² = 4cy'}.`), T(`c = ${num(c)}（頂點到焦點的有向距離）。`, `c = ${num(c)} (signed distance from vertex to focus).`), T(`k = 4c = ${num(4 * c)}。`, `k = 4c = ${num(4 * c)}.`)],
      };
    },
  },
  // =====================================================================================
  // GRADE 12
  // =====================================================================================
  {
    id: 'g12-limit',
    grade: 12,
    name: T('函數的極限', 'Limits of functions'),
    cur: { us: 'AP Calculus · Limits', tw: '高三 數甲 極限與函數', aops: 'Calculus' },
    gen(r) {
      const t = r.int(0, 4);
      if (t === 0) {
        let a, b, c; do { a = r.nz(-5, 5); b = r.int(-6, 6); c = r.int(-6, 6); } while (b === a || c === a || b === c);
        const N = pmul([1, -a], [1, -b]), D = pmul([1, -a], [1, -c]), v = red(a - b, a - c);
        return {
          q: T(`求 ${LIM(`x → ${num(a)}`)} ${frac(poly(N), poly(D))}。（可用分數）`, `Find ${LIM(`x → ${num(a)}`)} ${frac(poly(N), poly(D))}. (Fractions are fine.)`),
          ans: ansFrac(...v),
          sol: [T(`直接代入得 ${frac(0, 0)}（不定型），要先化簡。`, `Plugging in gives ${frac(0, 0)} (indeterminate), so simplify first.`), T(`因式分解：${frac(`(${lin(1, -a)})(${lin(1, -b)})`, `(${lin(1, -a)})(${lin(1, -c)})`)}，約掉 (${lin(1, -a)})。`, `Factor: ${frac(`(${lin(1, -a)})(${lin(1, -b)})`, `(${lin(1, -a)})(${lin(1, -c)})`)} and cancel (${lin(1, -a)}).`), T(`= ${LIM(`x → ${num(a)}`)} ${frac(lin(1, -b), lin(1, -c))} = ${frac(`${num(a)} ${sgn(-b)}`, `${num(a)} ${sgn(-c)}`)} = ${fr(v)}。`, `= ${LIM(`x → ${num(a)}`)} ${frac(lin(1, -b), lin(1, -c))} = ${frac(`${num(a)} ${sgn(-b)}`, `${num(a)} ${sgn(-c)}`)} = ${fr(v)}.`)],
        };
      }
      if (t === 1) {
        const lower = r.chance(0.3), p = r.nz(-6, 6), m = r.nz(-5, 5), dg = r.int(2, 3);
        const top = lower ? [p, r.int(-5, 5)] : [p, r.int(-5, 5), r.int(-5, 5), ...(dg === 3 ? [r.int(-5, 5)] : [])];
        const bot = [m, ...Array(dg - 1).fill(0).map(() => r.int(-5, 5)), r.nz(-5, 5)];
        const v = lower ? [0, 1] : red(p, m);
        return {
          q: T(`求 ${LIM('x → ∞')} ${frac(poly(top), poly(bot))}。（可用分數）`, `Find ${LIM('x → ∞')} ${frac(poly(top), poly(bot))}. (Fractions are fine.)`),
          ans: ansFrac(...v),
          sol: [T(`分子分母同除以分母的最高次 x<sup>${dg}</sup>。`, `Divide top and bottom by the highest power in the denominator, x<sup>${dg}</sup>.`), T('x → ∞ 時，1/x、1/x² … 都趨近 0。', 'As x → ∞, 1/x, 1/x², … all go to 0.'), lower ? T(`分子次數比分母低，極限 = 0。`, `The numerator has lower degree, so the limit is 0.`) : T(`次數相同，極限 = 最高次係數的比 = ${frac(p, m)} = ${fr(v)}。`, `Same degree, so the limit is the ratio of leading coefficients: ${frac(p, m)} = ${fr(v)}.`)],
        };
      }
      if (t === 2) {
        const a = r.nz(-4, 4);
        return {
          q: T(`求 ${LIM(`x → ${num(a)}`)} ${frac(`x<sup>3</sup> ${sgn(-(a ** 3))}`, lin(1, -a))}。`, `Find ${LIM(`x → ${num(a)}`)} ${frac(`x<sup>3</sup> ${sgn(-(a ** 3))}`, lin(1, -a))}.`),
          ans: ansNum(3 * a * a),
          sol: [T(`立方差：x³ − ${par(a)}³ = (x − ${par(a)})(x² ${sgn(a)}x + ${a * a})。`.replace(/([+−]) 1x/, '$1 x'), `Difference of cubes: x³ − ${par(a)}³ = (x − ${par(a)})(x² ${sgn(a)}x + ${a * a}).`.replace(/([+−]) 1x/, '$1 x')), T(`約掉 (x − ${par(a)})，剩 x² ${sgn(a)}x + ${a * a}。`.replace(/([+−]) 1x/, '$1 x'), `Cancel (x − ${par(a)}), leaving x² ${sgn(a)}x + ${a * a}.`.replace(/([+−]) 1x/, '$1 x')), T(`代 x = ${num(a)}：${a * a} + ${a * a} + ${a * a} = ${3 * a * a}。（也就是 x³ 在 x = ${num(a)} 的導數）`, `Plug in x = ${num(a)}: ${a * a} + ${a * a} + ${a * a} = ${3 * a * a}. (It is the derivative of x³ at x = ${num(a)}.)`)],
        };
      }
      if (t === 3) {
        const m = r.int(1, 7);
        return {
          q: T(`求 ${LIM('x → 0')} ${frac(`√(x + ${m * m}) − ${m}`, 'x')}。（可用分數）`, `Find ${LIM('x → 0')} ${frac(`√(x + ${m * m}) − ${m}`, 'x')}. (Fractions are fine.)`),
          ans: ansFrac(1, 2 * m),
          sol: [T('代入得 0/0，分子有理化：上下同乘 √(x + ' + m * m + ') + ' + m + '。', `Plugging in gives 0/0; multiply top and bottom by √(x + ${m * m}) + ${m}.`), T(`分子 = (x + ${m * m}) − ${m * m} = x，所以式子 = ${frac(1, `√(x + ${m * m}) + ${m}`)}。`, `Top = (x + ${m * m}) − ${m * m} = x, so the expression is ${frac(1, `√(x + ${m * m}) + ${m}`)}.`), T(`x → 0：${frac(1, `${m} + ${m}`)} = ${frac(1, 2 * m)}。`, `As x → 0: ${frac(1, `${m} + ${m}`)} = ${frac(1, 2 * m)}.`)],
        };
      }
      const k = r.int(2, 9), j = r.int(1, 7);
      const both = r.chance(0.5) && j !== k;
      return {
        q: both ? T(`求 ${LIM('x → 0')} ${frac(`sin ${k}x`, `sin ${j === 1 ? '' : j}x`)}。（可用分數）`, `Find ${LIM('x → 0')} ${frac(`sin ${k}x`, `sin ${j === 1 ? '' : j}x`)}. (Fractions are fine.)`) : T(`求 ${LIM('x → 0')} ${frac(`sin ${k}x`, 'x')}。`, `Find ${LIM('x → 0')} ${frac(`sin ${k}x`, 'x')}.`),
        ans: both ? ansFrac(k, j) : ansNum(k),
        sol: [T(`重要極限：${LIM('u → 0')} ${frac('sin u', 'u')} = 1。`, `Key limit: ${LIM('u → 0')} ${frac('sin u', 'u')} = 1.`), both ? T(`改寫：${frac(`sin ${k}x`, `${k}x`)} × ${frac(`${j === 1 ? '' : j}x`, `sin ${j === 1 ? '' : j}x`)} × ${frac(`${k}x`, `${j === 1 ? '' : j}x`)}，前兩個都 → 1。`, `Rewrite: ${frac(`sin ${k}x`, `${k}x`)} × ${frac(`${j === 1 ? '' : j}x`, `sin ${j === 1 ? '' : j}x`)} × ${frac(`${k}x`, `${j === 1 ? '' : j}x`)}; the first two → 1.`) : T(`改寫：${frac(`sin ${k}x`, 'x')} = ${k} × ${frac(`sin ${k}x`, `${k}x`)}。`, `Rewrite: ${frac(`sin ${k}x`, 'x')} = ${k} × ${frac(`sin ${k}x`, `${k}x`)}.`), both ? T(`極限 = ${frac(k, j)}${gcd(k, j) > 1 ? ` = ${fracR(k, j)}` : ''}。`, `Limit = ${frac(k, j)}${gcd(k, j) > 1 ? ` = ${fracR(k, j)}` : ''}.`) : T(`極限 = ${k} × 1 = ${k}。`, `Limit = ${k} × 1 = ${k}.`)],
      };
    },
  },
  {
    id: 'g12-deriv-power',
    grade: 12,
    name: T('導數：冪次法則', 'Derivatives: the power rule'),
    cur: { us: 'AP Calculus · Differentiation', tw: '高三 數甲 微分', aops: 'Calculus' },
    gen(r) {
      const t = r.int(0, 2);
      if (t === 0) {
        const f = r.chance(0.5) ? [r.nz(-3, 3), r.int(-5, 5), r.int(-6, 6), r.int(-9, 9)] : [r.nz(-2, 2), r.int(-3, 3), r.int(-5, 5), r.int(-6, 6), r.int(-9, 9)];
        const fp = pder(f), a = r.int(-3, 3), v = pev(fp, a);
        return {
          q: T(`f(x) = ${poly(f)}，求 f′(${num(a)})。`, `f(x) = ${poly(f)}. Find f′(${num(a)}).`),
          ans: ansNum(v),
          sol: [T('冪次法則：(xⁿ)′ = n xⁿ⁻¹；常數的導數是 0；逐項微分。', 'Power rule: (xⁿ)′ = n xⁿ⁻¹; constants differentiate to 0; go term by term.'), T(`f′(x) = ${poly(fp)}。`, `f′(x) = ${poly(fp)}.`), T(`f′(${num(a)}) = ${num(v)}。`, `f′(${num(a)}) = ${num(v)}.`)],
        };
      }
      if (t === 1) {
        const f = [r.nz(-5, 5), r.nz(-6, 6), r.nz(-7, 7), r.nz(-9, 9)], fp = pder(f);
        return {
          q: T(`f(x) = ${poly(f)}，f′(x) = ?`, `f(x) = ${poly(f)}. What is f′(x)?`),
          ans: choice(poly(fp), [poly([...fp, f[3]]), poly(f.slice(0, 3)), poly([...fp, 0]), poly([3 * f[0], f[1], f[2]])]),
          sol: [T('每一項用 (axⁿ)′ = an xⁿ⁻¹：係數乘上次方，次方減 1。', 'For each term (axⁿ)′ = an xⁿ⁻¹: multiply by the power, then lower the power by 1.'), T(`(${term(f[0], 'x', 3, true)})′ = ${term(3 * f[0], 'x', 2, true)}，(${term(f[1], 'x', 2, true)})′ = ${term(2 * f[1], 'x', 1, true)}，(${term(f[2], 'x', 1, true)})′ = ${num(f[2])}，(${num(f[3])})′ = 0。`, `(${term(f[0], 'x', 3, true)})′ = ${term(3 * f[0], 'x', 2, true)}, (${term(f[1], 'x', 2, true)})′ = ${term(2 * f[1], 'x', 1, true)}, (${term(f[2], 'x', 1, true)})′ = ${num(f[2])}, (${num(f[3])})′ = 0.`), T(`f′(x) = ${poly(fp)}。`, `f′(x) = ${poly(fp)}.`)],
        };
      }
      const n = r.int(2, 3), p = r.nz(-3, 3), q = r.nz(-8, 8), s = r.nz(-6, 6), m = r.int(1, 2), x0 = m * m;
      const v = fadd(fadd([n * p * x0 ** (n - 1), 1], [-q, x0 * x0]), [s, 2 * m]);
      return {
        q: T(`f(x) = ${term(p, 'x', n, true)} ${q < 0 ? '−' : '+'} ${frac(Math.abs(q), 'x')} ${s < 0 ? '−' : '+'} ${Math.abs(s) === 1 ? '' : Math.abs(s)}√x，求 f′(${x0})。（可用分數）`, `f(x) = ${term(p, 'x', n, true)} ${q < 0 ? '−' : '+'} ${frac(Math.abs(q), 'x')} ${s < 0 ? '−' : '+'} ${Math.abs(s) === 1 ? '' : Math.abs(s)}√x. Find f′(${x0}). (Fractions are fine.)`),
        ans: ansFrac(...v),
        sol: [T(`改寫成冪次：${frac(q, 'x')} = ${num(q)}x<sup>−1</sup>，${s === 1 ? '' : s === -1 ? '−' : num(s)}√x = ${s === 1 ? '' : s === -1 ? '−' : num(s)}x<sup>1/2</sup>。`, `Rewrite as powers: ${frac(q, 'x')} = ${num(q)}x<sup>−1</sup> and ${s === 1 ? '' : s === -1 ? '−' : num(s)}√x = ${s === 1 ? '' : s === -1 ? '−' : num(s)}x<sup>1/2</sup>.`), T(`f′(x) = ${term(n * p, 'x', n - 1, true)} ${q > 0 ? '−' : '+'} ${frac(Math.abs(q), 'x²')} ${s < 0 ? '−' : '+'} ${frac(Math.abs(s), '2√x')}。`, `f′(x) = ${term(n * p, 'x', n - 1, true)} ${q > 0 ? '−' : '+'} ${frac(Math.abs(q), 'x²')} ${s < 0 ? '−' : '+'} ${frac(Math.abs(s), '2√x')}.`), T(`代 x = ${x0}（√${x0} = ${m}）：${num(n * p * x0 ** (n - 1))} ${q > 0 ? '−' : '+'} ${frac(Math.abs(q), x0 * x0)} ${s < 0 ? '−' : '+'} ${frac(Math.abs(s), 2 * m)} = ${fr(v)}。`, `At x = ${x0} (√${x0} = ${m}): ${num(n * p * x0 ** (n - 1))} ${q > 0 ? '−' : '+'} ${frac(Math.abs(q), x0 * x0)} ${s < 0 ? '−' : '+'} ${frac(Math.abs(s), 2 * m)} = ${fr(v)}.`)],
      };
    },
  },
  {
    id: 'g12-deriv-rules',
    grade: 12,
    name: T('導數：乘法、除法與連鎖律', 'Derivatives: product, quotient and chain rules'),
    cur: { us: 'AP Calculus · Differentiation', tw: '高三 數甲 微分', aops: 'Calculus' },
    gen(r) {
      const t = r.int(0, 4);
      if (t === 0) {
        let a, b, x0, n; do { a = r.nz(-3, 3); b = r.int(-5, 5); x0 = r.int(-2, 3); n = r.int(2, 5); } while (Math.abs(a * x0 + b) > 3 || a * x0 + b === 0);
        const u = a * x0 + b, v = n * a * u ** (n - 1);
        return {
          q: T(`f(x) = (${lin(a, b)})<sup>${n}</sup>，求 f′(${num(x0)})。`, `f(x) = (${lin(a, b)})<sup>${n}</sup>. Find f′(${num(x0)}).`),
          ans: ansNum(v),
          sol: [T('連鎖律：[g(x)]ⁿ 的導數 = n[g(x)]ⁿ⁻¹ × g′(x)。', 'Chain rule: the derivative of [g(x)]ⁿ is n[g(x)]ⁿ⁻¹ × g′(x).'), T(`f′(x) = ${n}(${lin(a, b)})<sup>${n - 1}</sup> × ${par(a)}。`, `f′(x) = ${n}(${lin(a, b)})<sup>${n - 1}</sup> × ${par(a)}.`), T(`x = ${num(x0)}：${lin(a, b).replace('x', `·${par(x0)}`)} = ${num(u)}，f′ = ${n} × ${par(u)}<sup>${n - 1}</sup> × ${par(a)} = ${num(v)}。`, `At x = ${num(x0)}: the inside is ${num(u)}, so f′ = ${n} × ${par(u)}<sup>${n - 1}</sup> × ${par(a)} = ${num(v)}.`)],
        };
      }
      if (t === 1) {
        const p = r.int(-5, 5), q = r.nz(-4, 4), s = r.int(-5, 5), x0 = r.int(-3, 3);
        const g = x0 * x0 + p, h = q * x0 + s, v = 2 * x0 * h + g * q;
        return {
          q: T(`f(x) = (${poly([1, 0, p])})(${lin(q, s)})，求 f′(${num(x0)})。`, `f(x) = (${poly([1, 0, p])})(${lin(q, s)}). Find f′(${num(x0)}).`),
          ans: ansNum(v),
          sol: [T('乘法法則：(gh)′ = g′h + gh′。', "Product rule: (gh)′ = g′h + gh′."), T(`g = ${poly([1, 0, p])}，g′ = 2x；h = ${lin(q, s)}，h′ = ${num(q)}。`, `g = ${poly([1, 0, p])}, g′ = 2x; h = ${lin(q, s)}, h′ = ${num(q)}.`), T(`x = ${num(x0)}：g = ${num(g)}，g′ = ${num(2 * x0)}，h = ${num(h)}。`, `At x = ${num(x0)}: g = ${num(g)}, g′ = ${num(2 * x0)}, h = ${num(h)}.`), T(`f′ = ${par(2 * x0)} × ${par(h)} + ${par(g)} × ${par(q)} = ${num(v)}。`, `f′ = ${par(2 * x0)} × ${par(h)} + ${par(g)} × ${par(q)} = ${num(v)}.`)],
        };
      }
      if (t === 2) {
        let a, b, c, d, x0; do { a = r.int(-5, 5); b = r.int(-5, 5); c = r.nz(-3, 3); d = r.int(-5, 5); x0 = r.int(-3, 3); } while (a * d - b * c === 0 || c * x0 + d === 0);
        const den = (c * x0 + d) ** 2, v = red(a * d - b * c, den);
        return {
          q: T(`f(x) = ${frac(lin(a, b), lin(c, d))}，求 f′(${num(x0)})。（可用分數）`, `f(x) = ${frac(lin(a, b), lin(c, d))}. Find f′(${num(x0)}). (Fractions are fine.)`),
          ans: ansFrac(...v),
          sol: [T(`除法法則：(${frac('g', 'h')})′ = ${frac('g′h − gh′', 'h²')}。`, `Quotient rule: (${frac('g', 'h')})′ = ${frac('g′h − gh′', 'h²')}.`), T(`分子 = ${par(a)}(${lin(c, d)}) − (${lin(a, b)})(${num(c)}) = ${num(a * d - b * c)}（x 項消掉了）。`, `Numerator = ${par(a)}(${lin(c, d)}) − (${lin(a, b)})(${num(c)}) = ${num(a * d - b * c)} (the x terms cancel).`), T(`f′(${num(x0)}) = ${frac(a * d - b * c, `(${num(c * x0 + d)})²`)} = ${fr(v)}。`, `f′(${num(x0)}) = ${frac(a * d - b * c, `(${num(c * x0 + d)})²`)} = ${fr(v)}.`)],
        };
      }
      if (t === 3) {
        let a, x0, m, b; do { a = r.nz(-3, 4); x0 = r.nz(-3, 3); m = r.int(1, 6); b = m * m - a * x0 * x0; } while (b === 0);
        const v = red(a * x0, m);
        return {
          q: T(`f(x) = ${sqrt(poly([a, 0, b]))}，求 f′(${num(x0)})。（可用分數）`, `f(x) = ${sqrt(poly([a, 0, b]))}. Find f′(${num(x0)}). (Fractions are fine.)`),
          ans: ansFrac(...v),
          sol: [T(`連鎖律：(√u)′ = ${frac("u′", '2√u')}。`, `Chain rule: (√u)′ = ${frac("u′", '2√u')}.`), T(`u = ${poly([a, 0, b])}，u′ = ${term(2 * a, 'x', 1, true)}，f′(x) = ${frac(term(2 * a, 'x', 1, true), `2${sqrt(poly([a, 0, b]))}`)}。`, `u = ${poly([a, 0, b])}, u′ = ${term(2 * a, 'x', 1, true)}, so f′(x) = ${frac(term(2 * a, 'x', 1, true), `2${sqrt(poly([a, 0, b]))}`)}.`), T(`x = ${num(x0)}：u = ${m * m}，√u = ${m}，f′ = ${frac(2 * a * x0, 2 * m)} = ${fr(v)}。`, `At x = ${num(x0)}: u = ${m * m}, √u = ${m}, f′ = ${frac(2 * a * x0, 2 * m)} = ${fr(v)}.`)],
        };
      }
      let a, b, x0; do { a = r.nz(-4, 5); b = r.int(-6, 6); x0 = r.int(-3, 4); } while (a * x0 + b <= 0);
      const v = red(a, a * x0 + b);
      return {
        q: T(`f(x) = ln(${lin(a, b)})，求 f′(${num(x0)})。（可用分數）`, `f(x) = ln(${lin(a, b)}). Find f′(${num(x0)}). (Fractions are fine.)`),
        ans: ansFrac(...v),
        sol: [T(`(ln u)′ = ${frac("u′", 'u')}。`, `(ln u)′ = ${frac("u′", 'u')}.`), T(`f′(x) = ${frac(a, lin(a, b))}。`, `f′(x) = ${frac(a, lin(a, b))}.`), T(`f′(${num(x0)}) = ${frac(a, a * x0 + b)}${gcd(a, a * x0 + b) > 1 || a < 0 ? ` = ${fr(v)}` : ''}。`, `f′(${num(x0)}) = ${frac(a, a * x0 + b)}${gcd(a, a * x0 + b) > 1 || a < 0 ? ` = ${fr(v)}` : ''}.`)],
      };
    },
  },
  {
    id: 'g12-tangent-line',
    grade: 12,
    name: T('切線的斜率與方程式', 'Tangent lines'),
    cur: { us: 'AP Calculus · Tangent lines', tw: '高三 數甲 微分（切線）', aops: 'Calculus' },
    gen(r) {
      const t = r.int(0, 3);
      const f = r.chance(0.5) ? [r.nz(-3, 3), r.int(-6, 6), r.int(-8, 8)] : [r.nz(-2, 2), r.int(-3, 3), r.int(-5, 5), r.int(-6, 6)];
      const x0 = r.int(-2, 2), y0 = pev(f, x0), m = pev(pder(f), x0), b = y0 - m * x0;
      const base = [T(`f′(x) = ${poly(pder(f))}，切點 (${num(x0)}, f(${num(x0)})) = (${num(x0)}, ${num(y0)})。`, `f′(x) = ${poly(pder(f))}; the point of tangency is (${num(x0)}, f(${num(x0)})) = (${num(x0)}, ${num(y0)}).`), T(`切線斜率 m = f′(${num(x0)}) = ${num(m)}。`, `Tangent slope m = f′(${num(x0)}) = ${num(m)}.`)];
      if (t === 0) return {
        q: T(`曲線 y = ${poly(f)} 在 x = ${num(x0)} 處的切線斜率是多少？`, `What is the slope of the tangent line to y = ${poly(f)} at x = ${num(x0)}?`),
        ans: ansNum(m), sol: [T('切線斜率 = 導數值。', 'The slope of the tangent line is the derivative.'), ...base],
      };
      if (t === 1) return {
        q: T(`曲線 y = ${poly(f)} 在 x = ${num(x0)} 處的切線，y 截距是多少？`, `Find the y-intercept of the tangent line to y = ${poly(f)} at x = ${num(x0)}.`),
        ans: ansNum(b),
        sol: [...base, T(`點斜式：y − ${par(y0)} = ${num(m)}(x − ${par(x0)})。`, `Point-slope form: y − ${par(y0)} = ${num(m)}(x − ${par(x0)}).`), T(`令 x = 0：y = ${num(y0)} − ${par(m)} × ${par(x0)} = ${num(b)}。`, `Set x = 0: y = ${num(y0)} − ${par(m)} × ${par(x0)} = ${num(b)}.`)],
      };
      if (t === 2) return {
        q: T(`曲線 y = ${poly(f)} 在 x = ${num(x0)} 處的切線方程式是？`, `Which is the tangent line to y = ${poly(f)} at x = ${num(x0)}?`),
        ans: choice(`y = ${lin(m, b)}`, [`y = ${lin(m, y0)}`, `y = ${lin(-m, b)}`, `y = ${lin(m, y0 + m * x0)}`, `y = ${lin(y0, m)}`, `y = ${lin(m + 1, b)}`, `y = ${lin(m, b - 1)}`]),
        sol: [...base, T(`y = ${num(m)}(x − ${par(x0)}) + ${par(y0)} = ${lin(m, b)}。`, `y = ${num(m)}(x − ${par(x0)}) + ${par(y0)} = ${lin(m, b)}.`)],
      };
      const A = r.nz(-4, 4), B = r.int(-9, 9), Cc = r.int(-9, 9), xs = red(-B, 2 * A);
      return {
        q: T(`曲線 y = ${poly([A, B, Cc])} 在 x = ? 時切線是水平的。（可用分數）`, `At what x is the tangent line to y = ${poly([A, B, Cc])} horizontal? (Fractions are fine.)`),
        ans: ansFrac(...xs),
        sol: [T('水平切線 ⇔ 斜率 0 ⇔ f′(x) = 0。', 'Horizontal tangent ⇔ slope 0 ⇔ f′(x) = 0.'), T(`f′(x) = ${poly([2 * A, B])} = 0。`, `f′(x) = ${poly([2 * A, B])} = 0.`), T(`x = ${fr(xs)}（正好是拋物線的頂點）。`, `x = ${fr(xs)} (the vertex of the parabola).`)],
      };
    },
  },
  {
    id: 'g12-extrema',
    grade: 12,
    name: T('極值與最大最小值', 'Local extrema and absolute max/min'),
    cur: { us: 'AP Calculus · Applications of derivatives', tw: '高三 數甲 微分（極值）', aops: 'Calculus' },
    gen(r) {
      let p, q; do { p = r.int(-3, 3); q = r.int(-3, 4); } while (p >= q);
      const s = r.sign(), D = r.int(-6, 6), f = [2 * s, -3 * (p + q) * s, 6 * p * q * s, D];
      const F = (x) => pev(f, x), maxAt = s > 0 ? p : q, minAt = s > 0 ? q : p;
      const t = r.int(0, 3);
      const base = [T(`f′(x) = ${poly(pder(f))} = ${s > 0 ? '' : '−'}6(${lin(1, -p)})(${lin(1, -q)})，臨界點 x = ${num(p)}、${num(q)}。`, `f′(x) = ${poly(pder(f))} = ${s > 0 ? '' : '−'}6(${lin(1, -p)})(${lin(1, -q)}); critical points x = ${num(p)}, ${num(q)}.`),
        T(`f′ 的正負：${s > 0 ? `x < ${num(p)} 為正、中間為負、x > ${num(q)} 為正` : `x < ${num(p)} 為負、中間為正、x > ${num(q)} 為負`}，所以 x = ${num(maxAt)} 是極大、x = ${num(minAt)} 是極小。`, `Sign of f′: ${s > 0 ? `positive for x < ${num(p)}, negative between, positive for x > ${num(q)}` : `negative for x < ${num(p)}, positive between, negative for x > ${num(q)}`}, so x = ${num(maxAt)} is a local max and x = ${num(minAt)} a local min.`)];
      if (t === 0) return {
        q: T(`f(x) = ${poly(f)}，求 f 的極大值。`, `f(x) = ${poly(f)}. Find the local maximum value of f.`),
        ans: ansNum(F(maxAt)),
        sol: [...base, T(`極大值 f(${num(maxAt)}) = ${num(F(maxAt))}。`, `Local maximum value f(${num(maxAt)}) = ${num(F(maxAt))}.`)],
      };
      if (t === 1) return {
        q: T(`f(x) = ${poly(f)}，求 f 的極小值。`, `f(x) = ${poly(f)}. Find the local minimum value of f.`),
        ans: ansNum(F(minAt)),
        sol: [...base, T(`極小值 f(${num(minAt)}) = ${num(F(minAt))}。`, `Local minimum value f(${num(minAt)}) = ${num(F(minAt))}.`)],
      };
      if (t === 2) return {
        q: T(`f(x) = ${poly(f)} 在 x = ? 時有極小值。`, `f(x) = ${poly(f)}. At what x does f have a local minimum?`),
        ans: ansNum(minAt),
        sol: [...base, T(`答案 x = ${num(minAt)}。`, `Answer: x = ${num(minAt)}.`)],
      };
      const lo = p - r.int(1, 2), hi = q + r.int(0, 2), cand = [lo, p, q, hi].filter((x, i, a) => a.indexOf(x) === i), vals = cand.map(F), M = Math.max(...vals);
      return {
        q: T(`f(x) = ${poly(f)}，求 f 在閉區間 [${num(lo)}, ${num(hi)}] 上的最大值。`, `f(x) = ${poly(f)}. Find the absolute maximum of f on [${num(lo)}, ${num(hi)}].`),
        ans: ansNum(M),
        sol: [base[0], T('閉區間上的最大值出現在臨界點或端點，全部比較。', 'On a closed interval the maximum occurs at a critical point or an endpoint — compare them all.'), T(cand.map((x, i) => `f(${num(x)}) = ${num(vals[i])}`).join('，') + '。', cand.map((x, i) => `f(${num(x)}) = ${num(vals[i])}`).join(', ') + '.'), T(`最大值 ${num(M)}。`, `The maximum is ${num(M)}.`)],
      };
    },
  },
  {
    id: 'g12-motion',
    grade: 12,
    name: T('位置、速度與加速度', 'Position, velocity and acceleration'),
    cur: { us: 'AP Calculus · Motion', tw: '高三 數甲 微積分（應用）', aops: 'Calculus' },
    gen(r) {
      let t1, t2; do { t1 = r.int(1, 4); t2 = r.int(2, 7); } while (t1 >= t2);
      const c = r.int(0, 10), s = [2, -3 * (t1 + t2), 6 * t1 * t2, c], v = pder(s), a = pder(v), T0 = r.int(0, 8);
      const S = (x) => pev(s, x), sP = poly(s, 't');
      const t = r.int(0, 3);
      if (t === 0) return {
        q: T(`質點的位置 s(t) = ${sP}（公尺，t 秒）。求 t = ${T0} 時的速度。`, `A particle's position is s(t) = ${sP} (meters, t in seconds). Find its velocity at t = ${T0}.`),
        ans: ansNum(pev(v, T0)),
        sol: [T('速度 = 位置的導數：v(t) = s′(t)。', 'Velocity is the derivative of position: v(t) = s′(t).'), T(`v(t) = ${poly(v, 't')}。`, `v(t) = ${poly(v, 't')}.`), T(`v(${T0}) = ${num(pev(v, T0))} 公尺/秒。`, `v(${T0}) = ${num(pev(v, T0))} m/s.`)],
      };
      if (t === 1) return {
        q: T(`質點的位置 s(t) = ${sP}。求 t = ${T0} 時的加速度。`, `A particle's position is s(t) = ${sP}. Find its acceleration at t = ${T0}.`),
        ans: ansNum(pev(a, T0)),
        sol: [T('加速度 = 速度的導數 = 位置的二階導數。', 'Acceleration = derivative of velocity = second derivative of position.'), T(`v(t) = ${poly(v, 't')}，a(t) = ${poly(a, 't')}。`, `v(t) = ${poly(v, 't')}, a(t) = ${poly(a, 't')}.`), T(`a(${T0}) = ${num(pev(a, T0))}。`, `a(${T0}) = ${num(pev(a, T0))}.`)],
      };
      if (t === 2) return {
        q: T(`質點的位置 s(t) = ${sP}（t ≥ 0）。在哪些時刻質點瞬間靜止？（用逗號隔開）`, `A particle's position is s(t) = ${sP} for t ≥ 0. At what times is it momentarily at rest? (Separate with commas.)`),
        ans: ansSet([t1, t2]),
        sol: [T('靜止 ⇔ 速度 = 0。', 'At rest ⇔ velocity = 0.'), T(`v(t) = ${poly(v, 't')} = 6(t − ${t1})(t − ${t2})。`, `v(t) = ${poly(v, 't')} = 6(t − ${t1})(t − ${t2}).`), T(`t = ${t1} 或 t = ${t2}。`, `t = ${t1} or t = ${t2}.`)],
      };
      const Tb = r.int(1, 6);
      return {
        q: T(`質點的位置 s(t) = ${sP}。從 t = 0 到 t = ${Tb} 的位移是多少？`, `A particle's position is s(t) = ${sP}. What is its displacement from t = 0 to t = ${Tb}?`),
        ans: ansNum(S(Tb) - S(0)),
        sol: [T('位移 = 終點位置 − 起點位置（也等於速度的定積分）。', 'Displacement = final position − initial position (also the integral of velocity).'), T(`s(${Tb}) = ${num(S(Tb))}，s(0) = ${num(S(0))}。`, `s(${Tb}) = ${num(S(Tb))}, s(0) = ${num(S(0))}.`), T(`位移 = ${num(S(Tb))} − ${par(S(0))} = ${num(S(Tb) - S(0))}。`, `Displacement = ${num(S(Tb))} − ${par(S(0))} = ${num(S(Tb) - S(0))}.`)],
      };
    },
  },
  {
    id: 'g12-definite-integral',
    grade: 12,
    name: T('多項式的定積分', 'Definite integrals of polynomials'),
    cur: { us: 'AP Calculus · Integration', tw: '高三 數甲 積分', aops: 'Calculus' },
    gen(r) {
      const t = r.int(0, 2);
      if (t < 2) {
        let a, b; do { a = r.int(-2, 2); b = r.int(-1, 4); } while (a >= b);
        const c2 = r.int(-3, 3), c1 = r.int(-4, 4), c0 = r.int(-5, 5), cubic = t === 1, c3 = cubic ? r.nz(-2, 2) : 0;
        const f = cubic ? [c3, c2, c1, c0] : [c2 || 1, c1, c0];
        const k = f.length - 1;
        // 12·F(x)
        const F12 = (x) => f.reduce((s, c, i) => s + (12 * c * x ** (k - i + 1)) / (k - i + 1), 0);
        const v = red(F12(b) - F12(a), 12);
        const Fs = f.map((c, i) => { const e = k - i + 1; return c ? `${c < 0 ? '−' : '+'} ${fracR(Math.abs(c), e) === '1' ? '' : fracR(Math.abs(c), e)}x${e > 1 ? `<sup>${e}</sup>` : ''}` : ''; }).filter(Boolean).join(' ').replace(/^\+ /, '').replace(/^− /, '−');
        return {
          q: T(`計算 ${INT(num(a), num(b))} (${poly(f)}) dx。（可用分數）`, `Evaluate ${INT(num(a), num(b))} (${poly(f)}) dx. (Fractions are fine.)`),
          ans: ansFrac(...v),
          sol: [T('先求反導數：∫xⁿ dx = xⁿ⁺¹/(n + 1)。', 'Find an antiderivative: ∫xⁿ dx = xⁿ⁺¹/(n + 1).'), T(`F(x) = ${Fs}。`, `F(x) = ${Fs}.`), T(`微積分基本定理：∫ = F(${num(b)}) − F(${num(a)}) = ${fr(red(F12(b), 12))} − ${frP(red(F12(a), 12))}。`, `Fundamental theorem: the integral = F(${num(b)}) − F(${num(a)}) = ${fr(red(F12(b), 12))} − ${frP(red(F12(a), 12))}.`), T(`= ${fr(v)}。`, `= ${fr(v)}.`)],
        };
      }
      const a = r.int(-2, 1), b = a + r.int(1, 3), c = b + r.int(1, 3), m = r.nz(-9, 9), n = r.nz(-9, 9), mode = r.int(0, 2);
      if (mode === 0) return {
        q: T(`已知 ${INT(a, b)} f(x) dx = ${num(m)}，${INT(b, c)} f(x) dx = ${num(n)}。求 ${INT(a, c)} f(x) dx。`, `Given ${INT(a, b)} f(x) dx = ${num(m)} and ${INT(b, c)} f(x) dx = ${num(n)}, find ${INT(a, c)} f(x) dx.`),
        ans: ansNum(m + n),
        sol: [T('區間可以拆開：∫ₐᶜ = ∫ₐᵇ + ∫ᵇᶜ。', 'Intervals add: ∫ from a to c = ∫ from a to b + ∫ from b to c.'), T(`= ${num(m)} + ${par(n)} = ${num(m + n)}。`, `= ${num(m)} + ${par(n)} = ${num(m + n)}.`)],
      };
      if (mode === 1) return {
        q: T(`已知 ${INT(a, b)} f(x) dx = ${num(m)}，求 ${INT(b, a)} f(x) dx。`, `Given ${INT(a, b)} f(x) dx = ${num(m)}, find ${INT(b, a)} f(x) dx.`),
        ans: ansNum(-m),
        sol: [T('上下限對調，積分變號。', 'Swapping the limits changes the sign.'), T(`= −${par(m)} = ${num(-m)}。`, `= −${par(m)} = ${num(-m)}.`)],
      };
      const p = r.nz(-4, 4), q = r.int(-5, 5);
      return {
        q: T(`已知 ${INT(a, c)} f(x) dx = ${num(m)}，求 ${INT(a, c)} [${num(p)}f(x) ${sgn(q)}] dx。`, `Given ${INT(a, c)} f(x) dx = ${num(m)}, find ${INT(a, c)} [${num(p)}f(x) ${sgn(q)}] dx.`),
        ans: ansNum(p * m + q * (c - a)),
        sol: [T('積分是線性的：∫(pf + q) = p∫f + q × (區間長)。', 'Integration is linear: ∫(pf + q) = p∫f + q × (length of the interval).'), T(`= ${num(p)} × ${par(m)} + ${par(q)} × (${num(c)} − ${par(a)})`, `= ${num(p)} × ${par(m)} + ${par(q)} × (${num(c)} − ${par(a)})`), T(`= ${num(p * m)} ${sgn(q * (c - a))} = ${num(p * m + q * (c - a))}。`, `= ${num(p * m)} ${sgn(q * (c - a))} = ${num(p * m + q * (c - a))}.`)],
      };
    },
  },
  {
    id: 'g12-area-curve',
    grade: 12,
    name: T('曲線下與兩曲線間的面積', 'Area under and between curves'),
    cur: { us: 'AP Calculus · Area', tw: '高三 數甲 積分（面積）', aops: 'Calculus' },
    gen(r) {
      const t = r.int(0, 3);
      if (t === 0) {
        let p, q; do { p = r.int(-3, 2); q = r.int(-1, 5); } while (p >= q);
        const k = r.int(1, 3), f = [-k, k * (p + q), -k * p * q], A = red(k * (q - p) ** 3, 6);
        return {
          q: T(`求曲線 y = ${poly(f)} 與 x 軸所圍區域的面積。（可用分數）`, `Find the area of the region bounded by y = ${poly(f)} and the x-axis. (Fractions are fine.)`),
          ans: ansFrac(...A),
          sol: [T(`與 x 軸交點：${poly(f)} = −${k === 1 ? '' : k}(${lin(1, -p)})(${lin(1, -q)}) = 0 ⇒ x = ${num(p)}、${num(q)}；中間 y ≥ 0。`, `x-intercepts: ${poly(f)} = −${k === 1 ? '' : k}(${lin(1, -p)})(${lin(1, -q)}) = 0 ⇒ x = ${num(p)}, ${num(q)}; between them y ≥ 0.`), T(`面積 = ${INT(num(p), num(q))} (${poly(f)}) dx。`, `Area = ${INT(num(p), num(q))} (${poly(f)}) dx.`), T(`公式 ∫ₚ^q k(x − p)(q − x) dx = k(q − p)³/6：${k} × ${q - p}³ ÷ 6 = ${fr(A)}。`, `Shortcut ∫ k(x − p)(q − x) dx from p to q = k(q − p)³/6: ${k} × ${q - p}³ ÷ 6 = ${fr(A)}.`)],
        };
      }
      if (t === 1) {
        let r1, r2; do { r1 = r.int(-3, 2); r2 = r.int(-1, 4); } while (r1 >= r2);
        const m = r1 + r2, c = -r1 * r2, A = red((r2 - r1) ** 3, 6);
        return {
          q: T(`求 y = x² 與 y = ${lin(m, c) === '0' ? '0' : lin(m, c)} 所圍區域的面積。（可用分數）`, `Find the area enclosed by y = x² and y = ${lin(m, c)}. (Fractions are fine.)`),
          ans: ansFrac(...A),
          sol: [T(`交點：x² = ${lin(m, c)} ⇒ ${poly([1, -m, -c])} = 0 ⇒ x = ${num(r1)}、${num(r2)}。`, `Intersections: x² = ${lin(m, c)} ⇒ ${poly([1, -m, -c])} = 0 ⇒ x = ${num(r1)}, ${num(r2)}.`), T(`在兩交點之間直線在上方：面積 = ${INT(num(r1), num(r2))} (${lin(m, c)} − x²) dx。`, `Between them the line is on top: area = ${INT(num(r1), num(r2))} (${lin(m, c)} − x²) dx.`), T(`= (${num(r2)} − ${par(r1)})³ ÷ 6 = ${(r2 - r1) ** 3} ÷ 6 = ${fr(A)}。`, `= (${num(r2)} − ${par(r1)})³ ÷ 6 = ${(r2 - r1) ** 3} ÷ 6 = ${fr(A)}.`)],
        };
      }
      if (t === 2) {
        const b = r.int(1, 6), c = r.int(0, 6), A = red(b ** 3 + 3 * c * b, 3);
        return {
          q: T(`求 y = ${poly([1, 0, c])} 在 x = 0 到 x = ${b} 之間、曲線下方的面積。（可用分數）`, `Find the area under y = ${poly([1, 0, c])} from x = 0 to x = ${b}. (Fractions are fine.)`),
          ans: ansFrac(...A),
          sol: [T('曲線在 x 軸上方，面積 = 定積分。', 'The curve is above the x-axis, so area = definite integral.'), T(`${INT(0, b)} (${poly([1, 0, c])}) dx = [${frac('x³', 3)}${c ? ` + ${c}x` : ''}]₀^${b}`, `${INT(0, b)} (${poly([1, 0, c])}) dx = [${frac('x³', 3)}${c ? ` + ${c}x` : ''}] from 0 to ${b}`), T(`= ${frac(b ** 3, 3)}${c ? ` + ${c * b}` : ''} = ${fr(A)}。`, `= ${frac(b ** 3, 3)}${c ? ` + ${c * b}` : ''} = ${fr(A)}.`)],
        };
      }
      const a = r.int(1, 5), A = red(4 * a ** 3, 3);
      return {
        q: T(`求 y = x² − ${a * a} 與 x 軸所圍區域的面積。（可用分數）`, `Find the area of the region between y = x² − ${a * a} and the x-axis. (Fractions are fine.)`),
        ans: ansFrac(...A),
        sol: [T(`交點 x = ±${a}，中間曲線在 x 軸下方，所以面積 = −∫。`, `Intercepts x = ±${a}; between them the curve is below the axis, so area = −(integral).`), T(`${INT(-a, a)} (x² − ${a * a}) dx = [${frac('x³', 3)} − ${a * a}x] = ${frac(2 * a ** 3, 3)} − ${2 * a ** 3} = −${frac(4 * a ** 3, 3)}。`, `${INT(-a, a)} (x² − ${a * a}) dx = [${frac('x³', 3)} − ${a * a}x] = ${frac(2 * a ** 3, 3)} − ${2 * a ** 3} = −${frac(4 * a ** 3, 3)}.`), T(`面積 = ${fr(A)}（面積一定是正的）。`, `Area = ${fr(A)} (area is always positive).`)],
      };
    },
  },
  {
    id: 'g12-ftc-avg',
    grade: 12,
    name: T('微積分基本定理與平均值', 'Fundamental theorem and average value'),
    cur: { us: 'AP Calculus · FTC', tw: '高三 數甲 微積分基本定理', aops: 'Calculus' },
    gen(r) {
      const t = r.int(0, 2);
      if (t === 0) {
        let a, b; do { a = r.int(-2, 2); b = r.int(0, 4); } while (a >= b);
        const f = [r.int(-3, 3) || 1, r.int(-4, 4), r.int(-5, 5)], F6 = (x) => 2 * f[0] * x ** 3 + 3 * f[1] * x * x + 6 * f[2] * x;
        const I = red(F6(b) - F6(a), 6), avg = red(F6(b) - F6(a), 6 * (b - a));
        return {
          q: T(`求 f(x) = ${poly(f)} 在區間 [${num(a)}, ${num(b)}] 上的平均值。（可用分數）`, `Find the average value of f(x) = ${poly(f)} on [${num(a)}, ${num(b)}]. (Fractions are fine.)`),
          ans: ansFrac(...avg),
          sol: [T(`平均值 = ${frac(1, 'b − a')} ${INT('a', 'b')} f(x) dx。`, `Average value = ${frac(1, 'b − a')} ${INT('a', 'b')} f(x) dx.`), T(`${INT(num(a), num(b))} f(x) dx = ${fr(I)}。`, `${INT(num(a), num(b))} f(x) dx = ${fr(I)}.`), T(`平均值 = ${fr(I)} ÷ ${b - a} = ${fr(avg)}。`, `Average = ${fr(I)} ÷ ${b - a} = ${fr(avg)}.`)],
        };
      }
      if (t === 1) {
        const a = r.int(-3, 3), p = r.int(-5, 5), q = r.int(-6, 6), k = r.int(-4, 4);
        return {
          q: T(`F(x) = ${INT(num(a), 'x')} (${poly([1, p, q], 't')}) dt，求 F′(${num(k)})。`, `F(x) = ${INT(num(a), 'x')} (${poly([1, p, q], 't')}) dt. Find F′(${num(k)}).`),
          ans: ansNum(k * k + p * k + q),
          sol: [T('微積分基本定理：d/dx ∫ₐˣ f(t) dt = f(x)（下限是常數時）。', 'Fundamental theorem: d/dx ∫ from a to x of f(t) dt = f(x) (when the lower limit is a constant).'), T(`F′(x) = ${poly([1, p, q])}。`, `F′(x) = ${poly([1, p, q])}.`), T(`F′(${num(k)}) = ${num(k * k + p * k + q)}。`, `F′(${num(k)}) = ${num(k * k + p * k + q)}.`)],
        };
      }
      const A = 3 * r.nz(-2, 2), B = 2 * r.int(-3, 3), Cc = r.int(-5, 5), c = r.int(-6, 6), k = r.int(-3, 3);
      const v = (A / 3) * k ** 3 + (B / 2) * k * k + Cc * k + c;
      return {
        q: T(`f′(x) = ${poly([A, B, Cc])}，且 f(0) = ${num(c)}。求 f(${num(k)})。`, `f′(x) = ${poly([A, B, Cc])} and f(0) = ${num(c)}. Find f(${num(k)}).`),
        ans: ansNum(v),
        sol: [T('反導數再加常數 C：f(x) = ∫f′(x) dx。', 'Antidifferentiate and add a constant C: f(x) = ∫f′(x) dx.'), T(`f(x) = ${poly([A / 3, B / 2, Cc, 0])} + C，f(0) = C = ${num(c)}。`, `f(x) = ${poly([A / 3, B / 2, Cc, 0])} + C, and f(0) = C = ${num(c)}.`), T(`f(${num(k)}) = ${num(v)}。`, `f(${num(k)}) = ${num(v)}.`)],
      };
    },
  },
  {
    id: 'g12-unit-circle',
    grade: 12,
    name: T('弧度與單位圓', 'Radians and the unit circle'),
    cur: { us: 'Precalculus · F-TF.A.1–3', tw: '高二 數A 三角函數（弧度）', aops: 'Precalculus' },
    at: { tw: 11 },
    gen(r) {
      const t = r.int(0, 3);
      if (t === 0) {
        let n, d, dg; do { d = r.pick([6, 4, 3]); n = r.int(-12, 24); dg = (180 * n) / d; } while (dg % 90 === 0 || gcd(n, d) !== 1);
        const f = r.pick(['sin', 'cos', 'tan']), v = trigV(f, dg), co = ((dg % 360) + 360) % 360, ref = co <= 90 ? co : co <= 180 ? 180 - co : co <= 270 ? co - 180 : 360 - co;
        const wr = [exact(-v)]; for (const g of ['sin', 'cos', 'tan']) wr.push(exact(trigV(g, ref)), exact(-trigV(g, ref)));
        return {
          q: T(`${f}(${piF(n, d)}) = ?`, `What is ${f}(${piF(n, d)})?`),
          ans: ansChoice(uniq([exact(v), ...r.shuffle(wr)], 4)),
          sol: [T(`換成角度：${piF(n, d)} = ${frac(180 * n, d)}° = ${dg}°${co !== dg ? `，同界角 ${co}°` : ''}。`, `Convert to degrees: ${piF(n, d)} = ${frac(180 * n, d)}° = ${dg}°${co !== dg ? `, coterminal with ${co}°` : ''}.`), T(`在單位圓上，參考角 ${ref}°，點的坐標是 (cos, sin)；看象限決定正負。`, `On the unit circle the point is (cos, sin); the reference angle is ${ref}°, and the quadrant decides the sign.`), T(`${f}(${piF(n, d)}) = ${exact(v)}。`, `${f}(${piF(n, d)}) = ${exact(v)}.`)],
        };
      }
      if (t === 1) {
        const dg = r.pick([15, 18, 20, 30, 36, 40, 45, 60, 72, 75, 90, 100, 120, 135, 150, 160, 210, 225, 240, 270, 300, 315, 330, 540]);
        return {
          q: T(`把 ${dg}° 換成弧度。（用 π 表示）`, `Convert ${dg}° to radians. (In terms of π.)`),
          ans: ansPi(dg, 180),
          sol: [T('180° = π 弧度，所以 1° = π/180。', '180° = π radians, so 1° = π/180.'), T(`${dg}° = ${dg} × ${frac('π', 180)} = ${piF(dg, 180)}。`, `${dg}° = ${dg} × ${frac('π', 180)} = ${piF(dg, 180)}.`)],
        };
      }
      if (t === 2) {
        let n, d; do { d = r.pick([2, 3, 4, 5, 6, 9, 10, 12, 18]); n = r.int(1, 2 * d); } while (gcd(n, d) !== 1);
        return {
          q: T(`把 ${piF(n, d)} 弧度換成度。`, `Convert ${piF(n, d)} radians to degrees.`),
          ans: ansNum((180 * n) / d),
          sol: [T('π 弧度 = 180°。', 'π radians = 180°.'), T(`${piF(n, d)} = ${frac(n, d)} × 180° = ${num((180 * n) / d)}°。`, `${piF(n, d)} = ${frac(n, d)} × 180° = ${num((180 * n) / d)}°.`)],
        };
      }
      const R = r.int(2, 12); let n, d; do { d = r.pick([2, 3, 4, 5, 6]); n = r.int(1, 2 * d - 1); } while (gcd(n, d) !== 1);
      return {
        q: T(`半徑 ${R} 的圓上，圓心角 ${piF(n, d)} 弧度所對的弧長是多少？（用 π 表示）`, `On a circle of radius ${R}, how long is the arc cut off by a central angle of ${piF(n, d)} radians? (In terms of π.)`),
        ans: ansPi(R * n, d),
        sol: [T('弧度的定義：弧長 s = rθ（θ 用弧度）。', 'By the definition of radians: arc length s = rθ (θ in radians).'), T(`s = ${R} × ${piF(n, d)} = ${piF(R * n, d)}。`, `s = ${R} × ${piF(n, d)} = ${piF(R * n, d)}.`)],
      };
    },
  },
  {
    id: 'g12-trig-identities',
    grade: 12,
    name: T('三角恆等式：和角、倍角', 'Trig identities: sum and double angle'),
    cur: { us: 'Precalculus · F-TF.C.9 (+)', tw: '高二 數A 三角（和角公式）', aops: 'Precalculus' },
    at: { tw: 11 },
    gen(r) {
      const t = r.int(0, 4);
      if (t === 0) {
        const [ad, op, hy] = r.pick(TRIPLES), Q = r.pick([1, 2]), cs = Q === 1 ? 1 : -1, want = r.pick(['sin', 'cos']);
        const v = want === 'sin' ? red(2 * op * cs * ad, hy * hy) : red(hy * hy - 2 * op * op, hy * hy);
        return {
          q: T(`θ 是第${Q === 1 ? '一' : '二'}象限角，sin θ = ${frac(op, hy)}。求 ${want} 2θ。（用最簡分數）`, `θ is in quadrant ${Q === 1 ? 'I' : 'II'} and sin θ = ${frac(op, hy)}. Find ${want} 2θ. (Lowest terms.)`),
          ans: ansFrac(...v),
          sol: [T(`cos θ = ${cs > 0 ? '' : '−'}√(1 − sin²θ) = ${cs > 0 ? '' : '−'}${frac(ad, hy)}（第${Q === 1 ? '一' : '二'}象限 cos ${cs > 0 ? '> 0' : '< 0'}）。`, `cos θ = ${cs > 0 ? '' : '−'}√(1 − sin²θ) = ${cs > 0 ? '' : '−'}${frac(ad, hy)} (in quadrant ${Q === 1 ? 'I' : 'II'}, cos ${cs > 0 ? '> 0' : '< 0'}).`), want === 'sin' ? T(`sin 2θ = 2 sin θ cos θ = 2 × ${frac(op, hy)} × ${cs > 0 ? '' : '(−'}${frac(ad, hy)}${cs > 0 ? '' : ')'}。`, `sin 2θ = 2 sin θ cos θ = 2 × ${frac(op, hy)} × ${cs > 0 ? '' : '(−'}${frac(ad, hy)}${cs > 0 ? '' : ')'}.`) : T(`cos 2θ = 1 − 2 sin²θ = 1 − 2 × ${frac(op * op, hy * hy)}。`, `cos 2θ = 1 − 2 sin²θ = 1 − 2 × ${frac(op * op, hy * hy)}.`), T(`= ${fr(v)}。`, `= ${fr(v)}.`)],
        };
      }
      if (t === 1) {
        const A_ = frac('√6 + √2', 4), B_ = frac('√6 − √2', 4), list = [['sin', 15, B_, '45° − 30°'], ['cos', 15, A_, '45° − 30°'], ['sin', 75, A_, '45° + 30°'], ['cos', 75, B_, '45° + 30°'], ['sin', 105, A_, '60° + 45°'], ['cos', 105, '−' + B_, '60° + 45°'], ['tan', 15, '2 − √3', '45° − 30°'], ['tan', 75, '2 + √3', '45° + 30°']];
        const [f, A, right, split] = r.pick(list);
        const fm = { sin: T('sin(α ± β) = sin α cos β ± cos α sin β', 'sin(α ± β) = sin α cos β ± cos α sin β'), cos: T('cos(α ± β) = cos α cos β ∓ sin α sin β', 'cos(α ± β) = cos α cos β ∓ sin α sin β'), tan: T('tan(α ± β) = (tan α ± tan β) ÷ (1 ∓ tan α tan β)', 'tan(α ± β) = (tan α ± tan β) ÷ (1 ∓ tan α tan β)') }[f];
        return {
          q: T(`${f} ${A}° 的精確值是？`, `What is the exact value of ${f} ${A}°?`),
          ans: choice(right, [A_, B_, '−' + B_, '2 + √3', '2 − √3', frac('√3 + 1', 2)].filter((x) => x !== right)),
          sol: [T(`拆成特別角：${A}° = ${split}。`, `Split into special angles: ${A}° = ${split}.`), fm, T(`代入 sin 30° = ½、cos 30° = ${frac('√3', 2)}、sin 45° = cos 45° = ${frac('√2', 2)}、sin 60° = ${frac('√3', 2)}、cos 60° = ½、tan 30° = ${frac('√3', 3)}、tan 45° = 1，化簡得 ${right}。`, `Use sin 30° = ½, cos 30° = ${frac('√3', 2)}, sin 45° = cos 45° = ${frac('√2', 2)}, sin 60° = ${frac('√3', 2)}, cos 60° = ½, tan 30° = ${frac('√3', 3)}, tan 45° = 1; simplifying gives ${right}.`), T(`驗算：計算機 ${f} ${A}° ≈ ${trigV(f, A).toFixed(4)}。`, `Check: a calculator gives ${f} ${A}° ≈ ${trigV(f, A).toFixed(4)}.`)],
        };
      }
      if (t === 2) {
        let a, b, plus, v; do { a = red(r.nz(-5, 5), r.pick([1, 1, 2, 3])); b = red(r.nz(-5, 5), r.pick([1, 2, 3, 4])); plus = r.chance(0.6); const num_ = plus ? fadd(a, b) : fsub(a, b), den = plus ? fsub([1, 1], fmul(a, b)) : fadd([1, 1], fmul(a, b)); v = den[0] === 0 ? null : fdiv(num_, den); } while (!v);
        return {
          q: T(`tan α = ${fr(a)}，tan β = ${fr(b)}。求 tan(α ${plus ? '+' : '−'} β)。（可用分數）`, `tan α = ${fr(a)} and tan β = ${fr(b)}. Find tan(α ${plus ? '+' : '−'} β). (Fractions are fine.)`),
          ans: ansFrac(...v),
          sol: [T(`和差角公式：tan(α ${plus ? '+' : '−'} β) = ${frac(`tan α ${plus ? '+' : '−'} tan β`, `1 ${plus ? '−' : '+'} tan α tan β`)}。`, `tan(α ${plus ? '+' : '−'} β) = ${frac(`tan α ${plus ? '+' : '−'} tan β`, `1 ${plus ? '−' : '+'} tan α tan β`)}.`), T(`分子 = ${fr(a)} ${plus ? '+' : '−'} ${frP(b)} = ${fr(plus ? fadd(a, b) : fsub(a, b))}；分母 = 1 ${plus ? '−' : '+'} ${frP(fmul(a, b))} = ${fr(plus ? fsub([1, 1], fmul(a, b)) : fadd([1, 1], fmul(a, b)))}。`, `Top = ${fr(a)} ${plus ? '+' : '−'} ${frP(b)} = ${fr(plus ? fadd(a, b) : fsub(a, b))}; bottom = 1 ${plus ? '−' : '+'} ${frP(fmul(a, b))} = ${fr(plus ? fsub([1, 1], fmul(a, b)) : fadd([1, 1], fmul(a, b)))}.`), T(`tan(α ${plus ? '+' : '−'} β) = ${fr(v)}。`, `tan(α ${plus ? '+' : '−'} β) = ${fr(v)}.`)],
        };
      }
      if (t === 3) {
        const ids = [
          [`${frac('1 − cos²x', 'sin x')}`, 'sin x', ['cos x', '1', 'tan x'], T('1 − cos²x = sin²x，約掉一個 sin x。', '1 − cos²x = sin²x; cancel one sin x.')],
          ['sec²x − tan²x', '1', ['0', '−1', '2 tan²x'], T('由 1 + tan²x = sec²x 得 sec²x − tan²x = 1。', 'From 1 + tan²x = sec²x, sec²x − tan²x = 1.')],
          ['cos⁴x − sin⁴x', 'cos 2x', ['1', 'sin 2x', 'cos²x'], T('平方差：(cos²x − sin²x)(cos²x + sin²x) = cos 2x × 1。', 'Difference of squares: (cos²x − sin²x)(cos²x + sin²x) = cos 2x × 1.')],
          ['2 sin x cos x', 'sin 2x', ['cos 2x', '2 sin 2x', 'sin x²'], T('二倍角公式：sin 2x = 2 sin x cos x。', 'Double angle: sin 2x = 2 sin x cos x.')],
          ['(1 + tan²x) cos²x', '1', ['tan²x', 'sec²x', 'cos²x'], T('1 + tan²x = sec²x = 1/cos²x，乘 cos²x 得 1。', '1 + tan²x = sec²x = 1/cos²x; times cos²x gives 1.')],
          ['tan x + cot x', frac(1, 'sin x cos x'), ['1', '2', 'sin x + cos x'], T(`${frac('sin x', 'cos x')} + ${frac('cos x', 'sin x')} = ${frac('sin²x + cos²x', 'sin x cos x')} = ${frac(1, 'sin x cos x')}。`, `${frac('sin x', 'cos x')} + ${frac('cos x', 'sin x')} = ${frac('sin²x + cos²x', 'sin x cos x')} = ${frac(1, 'sin x cos x')}.`)],
          ['1 − 2 sin²x', 'cos 2x', ['sin 2x', 'cos²x', '1 − sin 2x'], T('二倍角公式：cos 2x = 1 − 2 sin²x。', 'Double angle: cos 2x = 1 − 2 sin²x.')],
          ['sin(π − x)', 'sin x', ['−sin x', 'cos x', '−cos x'], T('π − x 和 x 的 sin 值相同（對 y 軸對稱）。', 'sin(π − x) = sin x (symmetry across the y-axis on the unit circle).')],
          ['cos(x + π)', '−cos x', ['cos x', 'sin x', '−sin x'], T('轉半圈，點 (cos x, sin x) 變成 (−cos x, −sin x)。', 'A half turn sends (cos x, sin x) to (−cos x, −sin x).')],
          ['sin(x + π/2)', 'cos x', ['sin x', '−cos x', '−sin x'], T('和角：sin x cos(π/2) + cos x sin(π/2) = cos x。', 'Sum formula: sin x cos(π/2) + cos x sin(π/2) = cos x.')],
        ];
        const [e, right, wrongs, why] = r.pick(ids);
        return {
          q: T(`化簡 ${e}。`, `Simplify ${e}.`),
          ans: choice(right, wrongs),
          sol: [T('用基本恆等式 sin²x + cos²x = 1、和角公式或倍角公式。', 'Use sin²x + cos²x = 1, the sum formulas, or the double-angle formulas.'), why, T(`答案 ${right}。`, `Answer: ${right}.`)],
        };
      }
      const k = r.pick([[1, 2], [1, 3], [2, 3], [1, 5], [3, 4], [4, 5], [7, 5], [6, 5], [1, 4]]), v = red(k[0] ** 2 - k[1] ** 2, 2 * k[1] ** 2);
      return {
        q: T(`sin x + cos x = ${fracR(...k)}，求 sin x cos x。（可用分數）`, `If sin x + cos x = ${fracR(...k)}, find sin x cos x. (Fractions are fine.)`),
        ans: ansFrac(...v),
        sol: [T('兩邊平方：sin²x + 2 sin x cos x + cos²x = (sin x + cos x)²。', 'Square both sides: sin²x + 2 sin x cos x + cos²x = (sin x + cos x)².'), T(`1 + 2 sin x cos x = ${frac(k[0] ** 2, k[1] ** 2)}。`, `1 + 2 sin x cos x = ${frac(k[0] ** 2, k[1] ** 2)}.`), T(`sin x cos x = (${frac(k[0] ** 2, k[1] ** 2)} − 1) ÷ 2 = ${fr(v)}。`, `sin x cos x = (${frac(k[0] ** 2, k[1] ** 2)} − 1) ÷ 2 = ${fr(v)}.`)],
      };
    },
  },
  {
    id: 'g12-binomial-thm',
    grade: 12,
    name: T('二項式定理', 'The binomial theorem'),
    cur: { us: 'Algebra 2 · A-APR.C.5 (+)', tw: '高一 排列組合（二項式定理）', aops: 'Intermediate Counting & Probability' },
    at: { us: 11, tw: 10 },
    gen(r) {
      const t = r.int(0, 3);
      if (t === 0) {
        const n = r.int(4, 8), a = r.pick([1, 2, 3, -1, -2]), b = r.nz(-3, 3), k = r.int(1, n - 1), v = C(n, k) * a ** k * b ** (n - k);
        return {
          q: T(`(${lin(a, b)})<sup>${n}</sup> 展開後，x<sup>${k}</sup> 項的係數是多少？`, `In the expansion of (${lin(a, b)})<sup>${n}</sup>, what is the coefficient of x<sup>${k}</sup>?`),
          ans: ansNum(v),
          sol: [T('二項式定理：(A + B)ⁿ 的一般項 = C(n, r) Aʳ Bⁿ⁻ʳ。', 'Binomial theorem: the general term of (A + B)ⁿ is C(n, r) Aʳ Bⁿ⁻ʳ.'), T(`取 A = ${a === 1 ? '' : a === -1 ? '−' : num(a)}x、r = ${k}：C(${n}, ${k}) × ${par(a)}<sup>${k}</sup> × ${par(b)}<sup>${n - k}</sup>。`, `With A = ${a === 1 ? '' : a === -1 ? '−' : num(a)}x and r = ${k}: C(${n}, ${k}) × ${par(a)}<sup>${k}</sup> × ${par(b)}<sup>${n - k}</sup>.`), T(`= ${C(n, k)} × ${num(a ** k)} × ${num(b ** (n - k))} = ${num(v)}。`, `= ${C(n, k)} × ${num(a ** k)} × ${num(b ** (n - k))} = ${num(v)}.`)],
        };
      }
      if (t === 1) {
        const sq_ = r.chance(0.4), c = r.nz(-3, 3);
        if (sq_) {
          const n = r.pick([3, 6]), j = (2 * n) / 3, v = C(n, j) * c ** j;
          return {
            q: T(`(x<sup>2</sup> ${c < 0 ? '−' : '+'} ${frac(Math.abs(c), 'x')})<sup>${n}</sup> 展開後的常數項是多少？`, `What is the constant term in the expansion of (x<sup>2</sup> ${c < 0 ? '−' : '+'} ${frac(Math.abs(c), 'x')})<sup>${n}</sup>?`),
            ans: ansNum(v),
            sol: [T(`一般項 C(${n}, r)(x²)<sup>${n}−r</sup>(${num(c)}/x)<sup>r</sup> = C(${n}, r)·${par(c)}<sup>r</sup>·x<sup>${2 * n}−3r</sup>。`, `General term: C(${n}, r)(x²)<sup>${n}−r</sup>(${num(c)}/x)<sup>r</sup> = C(${n}, r)·${par(c)}<sup>r</sup>·x<sup>${2 * n}−3r</sup>.`), T(`常數項：${2 * n} − 3r = 0 ⇒ r = ${j}。`, `Constant term: ${2 * n} − 3r = 0 ⇒ r = ${j}.`), T(`C(${n}, ${j}) × ${par(c)}<sup>${j}</sup> = ${C(n, j)} × ${num(c ** j)} = ${num(v)}。`, `C(${n}, ${j}) × ${par(c)}<sup>${j}</sup> = ${C(n, j)} × ${num(c ** j)} = ${num(v)}.`)],
          };
        }
        const n = r.pick([2, 4, 6, 8]), j = n / 2, v = C(n, j) * c ** j;
        return {
          q: T(`(x ${c < 0 ? '−' : '+'} ${frac(Math.abs(c), 'x')})<sup>${n}</sup> 展開後的常數項是多少？`, `What is the constant term in the expansion of (x ${c < 0 ? '−' : '+'} ${frac(Math.abs(c), 'x')})<sup>${n}</sup>?`),
          ans: ansNum(v),
          sol: [T(`一般項 C(${n}, r) x<sup>${n}−r</sup>(${num(c)}/x)<sup>r</sup> = C(${n}, r)·${par(c)}<sup>r</sup>·x<sup>${n}−2r</sup>。`, `General term: C(${n}, r) x<sup>${n}−r</sup>(${num(c)}/x)<sup>r</sup> = C(${n}, r)·${par(c)}<sup>r</sup>·x<sup>${n}−2r</sup>.`), T(`常數項：${n} − 2r = 0 ⇒ r = ${j}。`, `Constant term: ${n} − 2r = 0 ⇒ r = ${j}.`), T(`C(${n}, ${j}) × ${par(c)}<sup>${j}</sup> = ${C(n, j)} × ${num(c ** j)} = ${num(v)}。`, `C(${n}, ${j}) × ${par(c)}<sup>${j}</sup> = ${C(n, j)} × ${num(c ** j)} = ${num(v)}.`)],
        };
      }
      if (t === 2) {
        const n = r.int(3, 9), a = r.pick([1, 2, 3, -1, -2]), b = r.nz(-3, 3);
        return {
          q: T(`(${lin(a, b)})<sup>${n}</sup> 展開後所有係數的和是多少？`, `What is the sum of all the coefficients in the expansion of (${lin(a, b)})<sup>${n}</sup>?`),
          ans: ansNum((a + b) ** n),
          sol: [T('係數和 = 把 x = 1 代入。', 'Sum of coefficients = the value at x = 1.'), T(`(${num(a)} + ${par(b)})<sup>${n}</sup> = ${par(a + b)}<sup>${n}</sup> = ${num((a + b) ** n)}。`, `(${num(a)} + ${par(b)})<sup>${n}</sup> = ${par(a + b)}<sup>${n}</sup> = ${num((a + b) ** n)}.`)],
        };
      }
      const n = r.int(4, 12), skip0 = r.chance(0.5);
      return {
        q: skip0 ? T(`計算 C(${n}, 1) + C(${n}, 2) + … + C(${n}, ${n})。`, `Compute C(${n}, 1) + C(${n}, 2) + … + C(${n}, ${n}).`) : T(`計算 C(${n}, 0) + C(${n}, 1) + … + C(${n}, ${n})。`, `Compute C(${n}, 0) + C(${n}, 1) + … + C(${n}, ${n}).`),
        ans: ansNum(2 ** n - (skip0 ? 1 : 0)),
        sol: [T(`(1 + 1)<sup>${n}</sup> 用二項式定理展開，就是全部 C(${n}, r) 的和：2<sup>${n}</sup> = ${2 ** n}。`, `Expanding (1 + 1)<sup>${n}</sup> by the binomial theorem gives the sum of all C(${n}, r): 2<sup>${n}</sup> = ${2 ** n}.`), T('（也可以想成：n 個元素的集合，所有子集的個數。）', '(Or: it counts all subsets of an n-element set.)'), ...(skip0 ? [T(`少了 C(${n}, 0) = 1：${2 ** n} − 1 = ${2 ** n - 1}。`, `Leave out C(${n}, 0) = 1: ${2 ** n} − 1 = ${2 ** n - 1}.`)] : [])],
      };
    },
  },
  {
    id: 'g12-cond-prob',
    grade: 12,
    name: T('條件機率與貝氏定理', "Conditional probability and Bayes' theorem"),
    cur: { us: 'Geometry/Statistics · S-CP.A.3–5, S-CP.B.6', tw: '高二 數A 條件機率與貝氏定理', aops: 'Intermediate Counting & Probability' },
    at: { us: 10, tw: 11 },
    gen(r) {
      const t = r.int(0, 3);
      if (t === 0) {
        const a = r.int(5, 30), b = r.int(5, 30), c = r.int(5, 30), d = r.int(5, 30), ask = r.int(0, 1);
        const tz = table([['', '參加社團', '未參加'], ['高一', a, b], ['高二', c, d]]), te = table([['', 'In a club', 'Not in a club'], ['Grade 10', a, b], ['Grade 11', c, d]]);
        return {
          q: ask === 0 ? T(`下表是學生的調查。隨機選一位高一學生，他參加社團的機率是多少？（用最簡分數）${tz}`, `The table shows a survey of students. A Grade 10 student is chosen at random. What is the probability that this student is in a club? (Lowest terms.)${te}`)
            : T(`下表是學生的調查。已知選到的學生參加社團，他是高二的機率是多少？（用最簡分數）${tz}`, `The table shows a survey of students. Given that a randomly chosen student is in a club, what is the probability the student is in Grade 11? (Lowest terms.)${te}`),
          ans: ask === 0 ? ansFrac(a, a + b) : ansFrac(c, a + c),
          sol: ask === 0 ? [T('條件機率 P(社團 | 高一) = P(社團且高一) ÷ P(高一)，只看高一那一列。', 'P(club | Grade 10) = P(club and Grade 10) ÷ P(Grade 10): look only at the Grade 10 row.'), T(`高一共 ${a} + ${b} = ${a + b} 人，其中參加社團 ${a} 人。`, `Grade 10 has ${a} + ${b} = ${a + b} students; ${a} are in a club.`), T(`機率 = ${frac(a, a + b)} = ${fracR(a, a + b)}。`, `Probability = ${frac(a, a + b)} = ${fracR(a, a + b)}.`)]
            : [T('已知參加社團，只看「參加社團」那一行。', 'Given "in a club", look only at the club column.'), T(`參加社團共 ${a} + ${c} = ${a + c} 人，其中高二 ${c} 人。`, `There are ${a} + ${c} = ${a + c} club members; ${c} are in Grade 11.`), T(`機率 = ${frac(c, a + c)} = ${fracR(c, a + c)}。`, `Probability = ${frac(c, a + c)} = ${fracR(c, a + c)}.`)],
        };
      }
      if (t === 1) {
        const prev = r.pick([1, 2, 5, 10, 20]), sens = r.pick([80, 90, 95, 99]), fp = r.pick([2, 5, 10, 20]);
        const N = 10000, sick = (N * prev) / 100, tp = (sick * sens) / 100, fpos = ((N - sick) * fp) / 100;
        return {
          q: T(`某疾病的盛行率是 ${prev}%。檢驗時，患者有 ${sens}% 會呈陽性，健康的人有 ${fp}% 會誤判為陽性。某人檢驗呈陽性，他真的患病的機率是多少？（用最簡分數）`, `A disease affects ${prev}% of people. A test is positive for ${sens}% of people who have it, and falsely positive for ${fp}% of healthy people. Someone tests positive. What is the probability they actually have the disease? (Lowest terms.)`),
          ans: ansFrac(tp, tp + fpos),
          sol: [T(`想像 ${num(N)} 人：患者 ${num(sick)} 人，健康 ${num(N - sick)} 人。`, `Imagine ${num(N)} people: ${num(sick)} sick and ${num(N - sick)} healthy.`), T(`真陽性 = ${num(sick)} × ${sens}% = ${num(tp)}；偽陽性 = ${num(N - sick)} × ${fp}% = ${num(fpos)}。`, `True positives = ${num(sick)} × ${sens}% = ${num(tp)}; false positives = ${num(N - sick)} × ${fp}% = ${num(fpos)}.`), T(`貝氏定理：P(患病 | 陽性) = ${frac(num(tp), `${num(tp)} + ${num(fpos)}`)} = ${fracR(tp, tp + fpos)}。`, `Bayes: P(sick | positive) = ${frac(num(tp), `${num(tp)} + ${num(fpos)}`)} = ${fracR(tp, tp + fpos)}.`), T('（陽性不代表一定生病——偽陽性可能很多！）', '(A positive result does not mean you are surely sick — false positives can be many!)')],
        };
      }
      if (t === 2) {
        const s = r.int(4, 10), mode = r.int(0, 1), d = r.int(Math.max(1, s - 6), Math.min(6, s - 1));
        let nc = 0, ne = 0; const lst = [];
        for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === s) { nc++; lst.push(`(${a},${b})`); if (mode === 0 ? a === d || b === d : a === b) ne++; }
        return {
          q: mode === 0 ? T(`擲兩顆公正骰子，已知點數和為 ${s}，至少有一顆是 ${d} 點的機率是多少？（用最簡分數）`, `Two fair dice are rolled and the sum is ${s}. What is the probability at least one die shows ${d}? (Lowest terms.)`)
            : T(`擲兩顆公正骰子，已知點數和為 ${s}，兩顆點數相同的機率是多少？（用最簡分數）`, `Two fair dice are rolled and the sum is ${s}. What is the probability the dice show the same number? (Lowest terms.)`),
          ans: ne === 0 ? ansNum(0) : ansFrac(ne, nc),
          sol: [T(`已知條件縮小了樣本空間：和為 ${s} 的結果有 ${lst.join('、')}，共 ${nc} 種。`, `The condition shrinks the sample space: sum ${s} gives ${lst.join(', ')} — ${nc} outcomes.`), T(`其中符合的有 ${ne} 種。`, `Of these, ${ne} satisfy the event.`), T(`機率 = ${ne === 0 ? '0' : `${frac(ne, nc)}${gcd(ne, nc) > 1 ? ` = ${fracR(ne, nc)}` : ''}`}。`, `Probability = ${ne === 0 ? '0' : `${frac(ne, nc)}${gcd(ne, nc) > 1 ? ` = ${fracR(ne, nc)}` : ''}`}.`)],
        };
      }
      const R = r.int(3, 8), B = r.int(2, 7), N = R + B, mode = r.int(0, 1);
      if (mode === 0) return {
        q: T(`袋中有 ${R} 顆紅球、${B} 顆藍球，依序取出兩顆（不放回）。已知第一顆是紅球，第二顆也是紅球的機率是多少？（用最簡分數）`, `A bag has ${R} red and ${B} blue balls. Two are drawn one after another without replacement. Given the first is red, what is the probability the second is red? (Lowest terms.)`),
        ans: ansFrac(R - 1, N - 1),
        sol: [T(`第一顆紅球拿走後，袋中剩 ${R - 1} 紅、${B} 藍，共 ${N - 1} 顆。`, `After a red ball is removed, ${R - 1} red and ${B} blue remain: ${N - 1} balls.`), T(`P = ${frac(R - 1, N - 1)} = ${fracR(R - 1, N - 1)}。`, `P = ${frac(R - 1, N - 1)} = ${fracR(R - 1, N - 1)}.`)],
      };
      const both = C(R, 2), atl = C(N, 2) - C(B, 2);
      return {
        q: T(`袋中有 ${R} 顆紅球、${B} 顆藍球，同時取兩顆。已知至少有一顆紅球，兩顆都是紅球的機率是多少？（用最簡分數）`, `A bag has ${R} red and ${B} blue balls; two are drawn at once. Given at least one is red, what is the probability both are red? (Lowest terms.)`),
        ans: ansFrac(both, atl),
        sol: [T(`至少一紅 = 全部 − 兩藍 = C(${N}, 2) − C(${B}, 2) = ${C(N, 2)} − ${C(B, 2)} = ${atl}。`, `At least one red = all − both blue = C(${N}, 2) − C(${B}, 2) = ${C(N, 2)} − ${C(B, 2)} = ${atl}.`), T(`兩紅 = C(${R}, 2) = ${both}（兩紅一定滿足「至少一紅」）。`, `Both red = C(${R}, 2) = ${both} (these all satisfy "at least one red").`), T(`P = ${frac(both, atl)} = ${fracR(both, atl)}。`, `P = ${frac(both, atl)} = ${fracR(both, atl)}.`)],
      };
    },
  },
  {
    id: 'g12-expected-value',
    grade: 12,
    name: T('期望值', 'Expected value'),
    cur: { us: 'Statistics · S-MD.A.2 (+)', tw: '高一 機率（期望值）', aops: 'Intermediate Counting & Probability' },
    at: { tw: 10 },
    gen(r) {
      const t = r.int(0, 3);
      if (t === 0) {
        const k = r.int(1, 3), w = r.int(2, 12) * 5, l = r.int(1, 6) * 5, v = red(w * k - l * (6 - k), 6);
        const ev = k === 1 ? ['擲出 6 點', 'roll a 6'] : k === 2 ? ['擲出 5 或 6 點', 'roll a 5 or 6'] : ['擲出偶數', 'roll an even number'];
        return {
          q: T(`遊戲：擲一顆骰子，${ev[0]}贏 ${w} 元，否則輸 ${l} 元。每玩一次的期望值是多少元？（可為負，可用分數）`, `A game: roll a die; if you ${ev[1]} you win $${w}, otherwise you lose $${l}. What is the expected value per game in dollars? (May be negative; fractions are fine.)`),
          ans: ansFrac(...v),
          sol: [T('期望值 = Σ（結果 × 機率）。', 'Expected value = Σ (outcome × probability).'), T(`贏的機率 ${frac(k, 6)}，輸的機率 ${frac(6 - k, 6)}。`, `P(win) = ${frac(k, 6)}, P(lose) = ${frac(6 - k, 6)}.`), T(`E = ${w} × ${frac(k, 6)} + (−${l}) × ${frac(6 - k, 6)} = ${frac(w * k - l * (6 - k), 6)} = ${fr(v)}。`, `E = ${w} × ${frac(k, 6)} + (−${l}) × ${frac(6 - k, 6)} = ${frac(w * k - l * (6 - k), 6)} = ${fr(v)}.`), T(v[0] < 0 ? '期望值是負的：玩越多次平均越虧。' : v[0] > 0 ? '期望值是正的：長期平均會賺。' : '期望值是 0：這是公平遊戲。', v[0] < 0 ? 'Negative: on average you lose money over many games.' : v[0] > 0 ? 'Positive: on average you win over many games.' : 'Zero: this is a fair game.')],
        };
      }
      if (t === 1) {
        const n = r.pick([4, 6, 8]), fk = r.pick(['sum', 'max', 'min', 'prod', 'diff']);
        const F = { sum: (a, b) => a + b, max: Math.max, min: Math.min, prod: (a, b) => a * b, diff: (a, b) => Math.abs(a - b) }[fk];
        let S = 0; for (let a = 1; a <= n; a++) for (let b = 1; b <= n; b++) S += F(a, b);
        const v = red(S, n * n);
        const L = { sum: ['點數和', 'the sum'], max: ['較大的點數', 'the larger number'], min: ['較小的點數', 'the smaller number'], prod: ['點數的乘積', 'the product'], diff: ['點數差的絕對值', 'the absolute difference'] }[fk];
        return {
          q: T(`同時擲兩顆公正的 ${n} 面骰（點數 1～${n}），${L[0]}的期望值是多少？（可用分數）`, `Two fair ${n}-sided dice (numbered 1–${n}) are rolled. What is the expected value of ${L[1]}? (Fractions are fine.)`),
          ans: ansFrac(...v),
          sol: [T(`共 ${n} × ${n} = ${n * n} 種等可能的結果。`, `There are ${n} × ${n} = ${n * n} equally likely outcomes.`), fk === 'sum' ? T(`期望值的線性：E(和) = E(第一顆) + E(第二顆) = ${frac(n + 1, 2)} + ${frac(n + 1, 2)}。`, `Linearity: E(sum) = E(first) + E(second) = ${frac(n + 1, 2)} + ${frac(n + 1, 2)}.`) : fk === 'prod' ? T(`兩顆獨立：E(積) = E(第一顆) × E(第二顆) = ${frac(n + 1, 2)} × ${frac(n + 1, 2)}。`, `Independent dice: E(product) = E(first) × E(second) = ${frac(n + 1, 2)} × ${frac(n + 1, 2)}.`) : T(`把 ${n * n} 種結果的${L[0]}全部加起來：總和 = ${S}。`, `Add ${L[1]} over all ${n * n} outcomes: total = ${S}.`), T(`E = ${frac(S, n * n)} = ${fr(v)}。`, `E = ${frac(S, n * n)} = ${fr(v)}.`)],
        };
      }
      if (t === 2) {
        const xs = r.sample([0, 1, 2, 3, 4, 5, 10], 3).sort((a, b) => a - b); let p; do { p = [r.int(1, 8), r.int(1, 8)]; } while (p[0] + p[1] >= 10);
        const ps = [p[0], p[1], 10 - p[0] - p[1]], S = xs.reduce((s, x, i) => s + x * ps[i], 0), v = red(S, 10);
        const tb = table([['X', ...xs.map(num)], ['P', ...ps.map((q) => fracR(q, 10))]]);
        return {
          q: T(`隨機變數 X 的機率分布如下，求 E(X)。（可用分數）${tb}`, `The random variable X has the distribution below. Find E(X). (Fractions are fine.)${tb}`),
          ans: ansFrac(...v),
          sol: [T('E(X) = Σ x · P(X = x)。', 'E(X) = Σ x · P(X = x).'), T(`= ${xs.map((x, i) => `${x} × ${fracR(ps[i], 10)}`).join(' + ')}`, `= ${xs.map((x, i) => `${x} × ${fracR(ps[i], 10)}`).join(' + ')}`), T(`= ${frac(S, 10)} = ${fr(v)}。`, `= ${frac(S, 10)} = ${fr(v)}.`)],
        };
      }
      const N = r.pick([100, 200, 500, 1000]), A = r.pick([100, 200, 500]), k = r.int(2, 10), B = r.pick([10, 20, 50]), price = r.pick([1, 2, 5]);
      const v = red(A + k * B - price * N, N);
      return {
        q: T(`摸彩共 ${N} 張彩券，每張 ${price} 元。頭獎 1 張 ${A} 元，二獎 ${k} 張各 ${B} 元。買一張彩券的期望淨收益是多少元？（可為負，可用分數）`, `A raffle has ${N} tickets at $${price} each. One first prize pays $${A}, and ${k} second prizes pay $${B} each. What is the expected net gain from buying one ticket, in dollars? (May be negative; fractions are fine.)`),
        ans: ansFrac(...v),
        sol: [T(`期望獎金 = ${A} × ${frac(1, N)} + ${B} × ${frac(k, N)} = ${frac(A + k * B, N)}。`, `Expected prize = ${A} × ${frac(1, N)} + ${B} × ${frac(k, N)} = ${frac(A + k * B, N)}.`), T(`扣掉票價 ${price}：${frac(A + k * B, N)} − ${price} = ${frac(A + k * B - price * N, N)}。`, `Subtract the ticket price ${price}: ${frac(A + k * B, N)} − ${price} = ${frac(A + k * B - price * N, N)}.`), T(`= ${fr(v)} 元。`, `= ${fr(v)} dollars.`)],
      };
    },
  },
  {
    id: 'g12-binomial-dist',
    grade: 12,
    name: T('二項分布：機率、期望值、變異數', 'Binomial distribution: probability, mean, variance'),
    cur: { us: 'Statistics · S-MD (+)', tw: '高三 數甲 機率分布（二項分布）', aops: 'Intermediate Counting & Probability' },
    gen(r) {
      const t = r.int(0, 3), p = r.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 6], [1, 10], [3, 10]]), q = [p[1] - p[0], p[1]];
      const nm = r.pick(NAMES);
      const ctx = r.pick([[`${nm[0]}罰球命中率`, `${nm[1]}'s free-throw success rate`, '投', 'shoots', '球', 'free throws', '命中', 'are made'], ['某種種子的發芽率', 'The germination rate of a kind of seed', '種下', 'plants', '顆', 'seeds', '發芽', 'sprout']]);
      if (t <= 1) {
        const n = p[1] * r.int(2, 12);
        const E = red(n * p[0], p[1]), Var = red(n * p[0] * q[0], p[1] * p[1]);
        return {
          q: T(`${ctx[0]}是 ${frac(...p)}，${ctx[2]} ${n} ${ctx[4]}，${ctx[6]}數 X 服從二項分布。求 ${t === 0 ? 'E(X)' : 'Var(X)'}。（可用分數）`, `${ctx[1]} is ${frac(...p)}. Someone ${ctx[3]} ${n} ${ctx[5]}; the number X that ${ctx[7]} is binomial. Find ${t === 0 ? 'E(X)' : 'Var(X)'}. (Fractions are fine.)`),
          ans: ansFrac(...(t === 0 ? E : Var)),
          sol: [T(`X ~ B(n, p)，n = ${n}，p = ${frac(...p)}。`, `X ~ B(n, p) with n = ${n} and p = ${frac(...p)}.`), t === 0 ? T('E(X) = np。', 'E(X) = np.') : T('Var(X) = np(1 − p)。', 'Var(X) = np(1 − p).'), t === 0 ? T(`= ${n} × ${frac(...p)} = ${fr(E)}。`, `= ${n} × ${frac(...p)} = ${fr(E)}.`) : T(`= ${n} × ${frac(...p)} × ${frac(...q)} = ${fr(Var)}。`, `= ${n} × ${frac(...p)} × ${frac(...q)} = ${fr(Var)}.`)],
        };
      }
      if (t === 2) {
        const n = r.int(2, 5), k = r.int(0, n), top = C(n, k) * p[0] ** k * q[0] ** (n - k), bot = p[1] ** n, v = red(top, bot);
        return {
          q: T(`${ctx[0]}是 ${frac(...p)}，${ctx[2]} ${n} ${ctx[4]}，恰好 ${k} ${ctx[4]}${ctx[6]}的機率是多少？（用最簡分數）`, `${ctx[1]} is ${frac(...p)}. Someone ${ctx[3]} ${n} ${ctx[5]}. What is the probability that exactly ${k} ${ctx[7]}? (Lowest terms.)`),
          ans: ansFrac(...v),
          sol: [T('二項分布：P(X = k) = C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ。', 'Binomial: P(X = k) = C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ.'), T(`= C(${n}, ${k}) × (${frac(...p)})<sup>${k}</sup> × (${frac(...q)})<sup>${n - k}</sup> = ${C(n, k)} × ${frac(p[0] ** k, p[1] ** k)} × ${frac(q[0] ** (n - k), q[1] ** (n - k))}。`, `= C(${n}, ${k}) × (${frac(...p)})<sup>${k}</sup> × (${frac(...q)})<sup>${n - k}</sup> = ${C(n, k)} × ${frac(p[0] ** k, p[1] ** k)} × ${frac(q[0] ** (n - k), q[1] ** (n - k))}.`), T(`= ${frac(top, bot)}${gcd(top, bot) > 1 ? ` = ${fr(v)}` : ''}。`, `= ${frac(top, bot)}${gcd(top, bot) > 1 ? ` = ${fr(v)}` : ''}.`)],
        };
      }
      const n = p[1] * r.int(2, 10), a = r.pick([2, 3, 5, 10, -1, -2]), b = r.int(-20, 50), mode = r.int(0, 1);
      const E = red(n * p[0], p[1]), Var = red(n * p[0] * q[0], p[1] * p[1]), EY = fadd(fmul([a, 1], E), [b, 1]), VY = fmul([a * a, 1], Var);
      return {
        q: T(`X ~ B(${n}, ${frac(...p)})，Y = ${lin(a, b).replace('x', 'X')}。求 ${mode === 0 ? 'E(Y)' : 'Var(Y)'}。（可用分數）`, `X ~ B(${n}, ${frac(...p)}) and Y = ${lin(a, b).replace('x', 'X')}. Find ${mode === 0 ? 'E(Y)' : 'Var(Y)'}. (Fractions are fine.)`),
        ans: ansFrac(...(mode === 0 ? EY : VY)),
        sol: [T(`E(X) = np = ${fr(E)}，Var(X) = np(1 − p) = ${fr(Var)}。`, `E(X) = np = ${fr(E)}, Var(X) = np(1 − p) = ${fr(Var)}.`), mode === 0 ? T('E(aX + b) = aE(X) + b。', 'E(aX + b) = aE(X) + b.') : T('Var(aX + b) = a² Var(X)（加常數不影響分散程度）。', 'Var(aX + b) = a² Var(X) (adding a constant does not change the spread).'), mode === 0 ? T(`E(Y) = ${num(a)} × ${frP(E)} ${sgn(b)} = ${fr(EY)}。`, `E(Y) = ${num(a)} × ${frP(E)} ${sgn(b)} = ${fr(EY)}.`) : T(`Var(Y) = ${par(a)}² × ${fr(Var)} = ${fr(VY)}。`, `Var(Y) = ${par(a)}² × ${fr(Var)} = ${fr(VY)}.`)],
      };
    },
  },
  {
    id: 'g12-std-dev',
    grade: 12,
    name: T('變異數與標準差', 'Variance and standard deviation'),
    cur: { us: 'Statistics · S-ID.A.2', tw: '高一 數據分析（標準差）', aops: 'Intermediate Counting & Probability' },
    at: { us: 9, tw: 10 },
    gen(r) {
      const t = r.int(0, 2);
      if (t <= 1) {
        let n, dv, S; do { n = r.int(4, 7); dv = Array.from({ length: n - 1 }, () => r.int(-6, 6)); dv.push(-sum(dv)); S = sum(dv.map((x) => x * x)); } while (Math.abs(dv[n - 1]) > 8 || S % n !== 0 || S === 0);
        const m = r.int(55, 85), data = r.shuffle(dv.map((d) => m + d)), V2 = S / n, [k, s] = simpRoot(V2), askSD = r.chance(0.5);
        const q0 = t === 0
          ? (askSD ? T(`求這組資料的（母體）標準差：${data.join(', ')}。（用最簡根式）`, `Find the (population) standard deviation of the data: ${data.join(', ')}. (Simplest radical form.)`) : T(`求這組資料的（母體）變異數：${data.join(', ')}。`, `Find the (population) variance of the data: ${data.join(', ')}.`))
          : T(`${n} 個數的總和是 ${sum(data)}，平方和是 ${sum(data.map((x) => x * x))}。求它們的（母體）變異數。`, `${n} numbers have sum ${sum(data)} and sum of squares ${sum(data.map((x) => x * x))}. Find their (population) variance.`);
        return {
          q: q0,
          ans: t === 0 && askSD ? ansRad(1, V2) : ansNum(V2),
          sol: t === 0 ? [T(`平均數 μ = ${sum(data)} ÷ ${n} = ${m}。`, `Mean μ = ${sum(data)} ÷ ${n} = ${m}.`), T(`離差 x − μ：${data.map((x) => num(x - m)).join(', ')}；平方：${data.map((x) => (x - m) ** 2).join(', ')}，和 = ${S}。`, `Deviations x − μ: ${data.map((x) => num(x - m)).join(', ')}; squared: ${data.map((x) => (x - m) ** 2).join(', ')}, total ${S}.`), T(`變異數 σ² = ${S} ÷ ${n} = ${V2}。`, `Variance σ² = ${S} ÷ ${n} = ${V2}.`), ...(askSD ? [T(`標準差 σ = √${V2}${k > 1 || s === 1 ? ` = ${rad(k, s)}` : ''}。`, `Standard deviation σ = √${V2}${k > 1 || s === 1 ? ` = ${rad(k, s)}` : ''}.`)] : [])]
            : [T('變異數 = 平方的平均 − 平均的平方：σ² = Σx²/n − μ²。', 'Variance = mean of squares − square of mean: σ² = Σx²/n − μ².'), T(`μ = ${sum(data)} ÷ ${n} = ${m}；Σx²/n = ${sum(data.map((x) => x * x))} ÷ ${n} = ${num(sum(data.map((x) => x * x)) / n)}。`, `μ = ${sum(data)} ÷ ${n} = ${m}; Σx²/n = ${sum(data.map((x) => x * x))} ÷ ${n} = ${num(sum(data.map((x) => x * x)) / n)}.`), T(`σ² = ${num(sum(data.map((x) => x * x)) / n)} − ${m}² = ${num(sum(data.map((x) => x * x)) / n)} − ${m * m} = ${V2}。`, `σ² = ${num(sum(data.map((x) => x * x)) / n)} − ${m}² = ${num(sum(data.map((x) => x * x)) / n)} − ${m * m} = ${V2}.`)],
        };
      }
      const mu = r.int(50, 80), sd = r.int(3, 12), a = r.pick([2, 3, 0.5, 1.5, 1.2, -1]), b = r.pick([5, 10, -10, 20, 0]) || 4, mode = r.int(0, 1);
      return {
        q: T(`一次考試的平均 ${mu} 分、標準差 ${sd} 分。老師把每個人的分數都改成 y = ${a === -1 ? '−' : num(a)}x ${sgn(b)}。新的${mode === 0 ? '平均' : '標準差'}是多少？`, `A test has mean ${mu} and standard deviation ${sd}. The teacher changes every score to y = ${a === -1 ? '−' : num(a)}x ${sgn(b)}. What is the new ${mode === 0 ? 'mean' : 'standard deviation'}?`),
        ans: ansNum(mode === 0 ? clean(a * mu + b) : clean(Math.abs(a) * sd)),
        sol: [T('每個數都 × a 再 + b：平均也 × a + b；標準差只 × |a|（平移不改變分散程度）。', 'If every value is multiplied by a and then b is added: the mean becomes a·μ + b, while the SD becomes |a|·σ (shifting does not change spread).'), mode === 0 ? T(`新平均 = ${num(a)} × ${mu} ${sgn(b)} = ${num(clean(a * mu + b))}。`, `New mean = ${num(a)} × ${mu} ${sgn(b)} = ${num(clean(a * mu + b))}.`) : T(`新標準差 = |${num(a)}| × ${sd} = ${num(clean(Math.abs(a) * sd))}（${sgn(b)} 沒有影響）。`, `New SD = |${num(a)}| × ${sd} = ${num(clean(Math.abs(a) * sd))} (the ${sgn(b)} has no effect).`)],
      };
    },
  },
  {
    id: 'g12-seq-limit',
    grade: 12,
    name: T('數列的極限與無窮級數', 'Limits of sequences and infinite series'),
    cur: { us: 'Precalculus / AP Calculus BC · Series', tw: '高三 數甲 數列的極限', aops: 'Calculus' },
    gen(r) {
      const t = r.int(0, 4);
      if (t === 0) {
        const lower = r.chance(0.25), a = r.nz(-6, 6), d = r.nz(-5, 5);
        const top = lower ? [a, r.int(-5, 5)] : [a, r.int(-5, 5), r.int(-5, 5)], bot = [d, r.int(-5, 5), r.nz(-5, 5)], v = lower ? [0, 1] : red(a, d);
        return {
          q: T(`求 ${LIM('n → ∞')} ${frac(poly(top, 'n'), poly(bot, 'n'))}。（可用分數）`, `Find ${LIM('n → ∞')} ${frac(poly(top, 'n'), poly(bot, 'n'))}. (Fractions are fine.)`),
          ans: ansFrac(...v),
          sol: [T('分子分母同除以 n²。', 'Divide top and bottom by n².'), T('1/n、1/n² 都趨近 0。', '1/n and 1/n² both go to 0.'), T(lower ? '分子剩下的都趨近 0，極限 = 0。' : `極限 = ${frac(a, d)} = ${fr(v)}。`, lower ? 'Everything on top goes to 0, so the limit is 0.' : `Limit = ${frac(a, d)} = ${fr(v)}.`)],
        };
      }
      if (t === 1) {
        const k = r.int(1, 12), v = red(k, 2);
        return {
          q: T(`求 ${LIM('n → ∞')} (√(n² + ${k}n) − n)。（可用分數）`, `Find ${LIM('n → ∞')} (√(n² + ${k}n) − n). (Fractions are fine.)`),
          ans: ansFrac(...v),
          sol: [T('∞ − ∞ 型：乘以共軛 ÷ 共軛。', '∞ − ∞ form: multiply and divide by the conjugate.'), T(`= ${frac(`(n² + ${k}n) − n²`, `√(n² + ${k}n) + n`)} = ${frac(`${k}n`, `√(n² + ${k}n) + n`)}。`, `= ${frac(`(n² + ${k}n) − n²`, `√(n² + ${k}n) + n`)} = ${frac(`${k}n`, `√(n² + ${k}n) + n`)}.`), T(`同除以 n：${frac(k, `√(1 + ${k}/n) + 1`)} → ${frac(k, 2)}${k % 2 === 0 ? ` = ${k / 2}` : ''}。`, `Divide by n: ${frac(k, `√(1 + ${k}/n) + 1`)} → ${frac(k, 2)}${k % 2 === 0 ? ` = ${k / 2}` : ''}.`)],
        };
      }
      if (t === 2) {
        const k = r.int(1, 4); let H = [0, 1]; for (let i = 1; i <= k; i++) H = fadd(H, [1, i]); const v = fmul(H, [1, k]);
        return {
          q: T(`求無窮級數 ${SIG('n=1', '∞')} ${frac(1, `n(n + ${k})`)} 的和。（可用分數）`, `Find the sum ${SIG('n=1', '∞')} ${frac(1, `n(n + ${k})`)}. (Fractions are fine.)`),
          ans: ansFrac(...v),
          sol: [T(`裂項：${frac(1, `n(n + ${k})`)} = ${frac(1, k)}(${frac(1, 'n')} − ${frac(1, `n + ${k}`)})。`, `Split: ${frac(1, `n(n + ${k})`)} = ${frac(1, k)}(${frac(1, 'n')} − ${frac(1, `n + ${k}`)}).`), T(`相隔 ${k} 項互相消去，最後只剩前 ${k} 個正項：${frac(1, k)}(${Array.from({ length: k }, (_, i) => (i === 0 ? '1' : frac(1, i + 1))).join(' + ')})。`, `Terms cancel ${k} apart, leaving only the first ${k} positive terms: ${frac(1, k)}(${Array.from({ length: k }, (_, i) => (i === 0 ? '1' : frac(1, i + 1))).join(' + ')}).`), T(`= ${fr(v)}。`, `= ${fr(v)}.`)],
        };
      }
      if (t === 3) {
        const a = r.int(3, 7), b = r.int(1, a - 1);
        return {
          q: T(`求 ${LIM('n → ∞')} ${frac(`${a}<sup>n+1</sup> + ${b}<sup>n</sup>`, `${a}<sup>n</sup> + ${b}<sup>n</sup>`)}。`, `Find ${LIM('n → ∞')} ${frac(`${a}<sup>n+1</sup> + ${b}<sup>n</sup>`, `${a}<sup>n</sup> + ${b}<sup>n</sup>`)}.`),
          ans: ansNum(a),
          sol: [T(`分子分母同除以 ${a}<sup>n</sup>（成長最快的項）。`, `Divide top and bottom by ${a}<sup>n</sup> (the fastest-growing term).`), T(`= ${frac(`${a} + (${b}/${a})<sup>n</sup>`, `1 + (${b}/${a})<sup>n</sup>`)}，而 (${b}/${a})<sup>n</sup> → 0，因為 0 < ${b}/${a} < 1。`, `= ${frac(`${a} + (${b}/${a})<sup>n</sup>`, `1 + (${b}/${a})<sup>n</sup>`)}, and (${b}/${a})<sup>n</sup> → 0 because 0 < ${b}/${a} < 1.`), T(`極限 = ${a} ÷ 1 = ${a}。`, `Limit = ${a} ÷ 1 = ${a}.`)],
        };
      }
      const [p, q] = r.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [1, 5]]), sg = r.chance(0.3) ? -1 : 1, rr = [sg * p, q], v = red(sg * p, q - sg * p);
      return {
        q: T(`求 ${SIG('n=1', '∞')} (${fr(rr)})<sup>n</sup>。（可用分數）`, `Find ${SIG('n=1', '∞')} (${fr(rr)})<sup>n</sup>. (Fractions are fine.)`),
        ans: ansFrac(...v),
        sol: [T(`這是首項 ${fr(rr)}、公比 ${fr(rr)} 的無窮等比級數，|r| < 1 所以收斂。`, `It is an infinite geometric series with first term ${fr(rr)} and ratio ${fr(rr)}; |r| < 1 so it converges.`), T('S = 首項 ÷ (1 − 公比)。', 'S = first term ÷ (1 − ratio).'), T(`= ${fr(rr)} ÷ (1 − ${frP(rr)}) = ${fr(rr)} ÷ ${fr(red(q - sg * p, q))} = ${fr(v)}。`, `= ${fr(rr)} ÷ (1 − ${frP(rr)}) = ${fr(rr)} ÷ ${fr(red(q - sg * p, q))} = ${fr(v)}.`)],
      };
    },
  },
  {
    id: 'g12-stars-bars',
    grade: 12,
    name: T('重複組合（星與棒）', 'Stars and bars'),
    cur: { tw: '高一 排列組合（重複組合）', aops: 'Intermediate Counting & Probability' },
    at: { tw: 10 },
    gen(r) {
      const t = r.int(0, 4), k = r.int(3, 5), n = r.int(k + 2, 14);
      if (t === 0) return {
        q: T(`方程式 ${Array.from({ length: k }, (_, i) => `x<sub>${i + 1}</sub>`).join(' + ')} = ${n} 有幾組非負整數解？`, `How many solutions in nonnegative integers does ${Array.from({ length: k }, (_, i) => `x<sub>${i + 1}</sub>`).join(' + ')} = ${n} have?`),
        ans: ansNum(C(n + k - 1, k - 1)),
        sol: [T(`想成 ${n} 顆星星和 ${k - 1} 根隔板排成一列，隔板把星星分成 ${k} 組。`, `Picture ${n} stars and ${k - 1} bars in a row; the bars split the stars into ${k} groups.`), T(`共 ${n + k - 1} 個位置，選 ${k - 1} 個放隔板：C(${n + k - 1}, ${k - 1})。`, `There are ${n + k - 1} spots; choose ${k - 1} for the bars: C(${n + k - 1}, ${k - 1}).`), T(`= ${C(n + k - 1, k - 1)}。`, `= ${C(n + k - 1, k - 1)}.`)],
      };
      if (t === 1) return {
        q: T(`方程式 ${Array.from({ length: k }, (_, i) => `x<sub>${i + 1}</sub>`).join(' + ')} = ${n} 有幾組正整數解？`, `How many solutions in positive integers does ${Array.from({ length: k }, (_, i) => `x<sub>${i + 1}</sub>`).join(' + ')} = ${n} have?`),
        ans: ansNum(C(n - 1, k - 1)),
        sol: [T(`每個至少 1：令 yᵢ = xᵢ − 1 ≥ 0，則 Σyᵢ = ${n} − ${k} = ${n - k}。`, `Each is at least 1: let yᵢ = xᵢ − 1 ≥ 0, so Σyᵢ = ${n} − ${k} = ${n - k}.`), T(`非負解：C(${n - k} + ${k - 1}, ${k - 1}) = C(${n - 1}, ${k - 1})。`, `Nonnegative solutions: C(${n - k} + ${k - 1}, ${k - 1}) = C(${n - 1}, ${k - 1}).`), T(`= ${C(n - 1, k - 1)}。（另一種想法：${n} 顆星之間有 ${n - 1} 個空隙，選 ${k - 1} 個放隔板。）`, `= ${C(n - 1, k - 1)}. (Or: ${n} stars have ${n - 1} gaps; choose ${k - 1} for bars.)`)],
      };
      if (t === 2) {
        const m = r.int(1, 3), N = k * m + r.int(2, 10), nm = r.pick(NAMES);
        return {
          q: T(`把 ${N} 顆相同的糖果分給 ${k} 個小朋友，每人至少 ${m} 顆，有幾種分法？`, `${N} identical candies are shared among ${k} children so that each gets at least ${m}. How many ways?`),
          ans: ansNum(C(N - k * m + k - 1, k - 1)),
          sol: [T(`先每人發 ${m} 顆，用掉 ${k * m} 顆，剩 ${N - k * m} 顆任意分。`, `First give everyone ${m}, using ${k * m}; ${N - k * m} remain to share freely.`), T(`剩下的是非負整數解：C(${N - k * m} + ${k - 1}, ${k - 1})。`, `Now count nonnegative solutions: C(${N - k * m} + ${k - 1}, ${k - 1}).`), T(`= C(${N - k * m + k - 1}, ${k - 1}) = ${C(N - k * m + k - 1, k - 1)}。`, `= C(${N - k * m + k - 1}, ${k - 1}) = ${C(N - k * m + k - 1, k - 1)}.`)],
        };
      }
      if (t === 3) {
        const kinds = r.int(3, 6), cnt = r.int(4, 10);
        return {
          q: T(`甜甜圈店有 ${kinds} 種口味（每種都很多），買 ${cnt} 個甜甜圈，有幾種不同的買法？（只看每種口味買幾個）`, `A donut shop has ${kinds} flavors (plenty of each). How many different ways are there to buy ${cnt} donuts? (Only the number of each flavor matters.)`),
          ans: ansNum(C(cnt + kinds - 1, kinds - 1)),
          sol: [T(`設各口味買 x₁, …, x<sub>${kinds}</sub> 個：x₁ + … + x<sub>${kinds}</sub> = ${cnt}，xᵢ ≥ 0。`, `Let x₁, …, x<sub>${kinds}</sub> be the counts: x₁ + … + x<sub>${kinds}</sub> = ${cnt}, xᵢ ≥ 0.`), T(`重複組合 H(${kinds}, ${cnt}) = C(${cnt + kinds - 1}, ${kinds - 1})。`, `Combinations with repetition: C(${cnt + kinds - 1}, ${kinds - 1}).`), T(`= ${C(cnt + kinds - 1, kinds - 1)}。`, `= ${C(cnt + kinds - 1, kinds - 1)}.`)],
        };
      }
      const N = r.int(3, 12);
      return {
        q: T(`x + y + z ≤ ${N} 有幾組非負整數解？`, `How many nonnegative integer solutions does x + y + z ≤ ${N} have?`),
        ans: ansNum(C(N + 3, 3)),
        sol: [T(`加一個「鬆弛變數」w ≥ 0：x + y + z + w = ${N}。`, `Add a slack variable w ≥ 0: x + y + z + w = ${N}.`), T(`四個非負變數：C(${N} + 3, 3) = C(${N + 3}, 3)。`, `Four nonnegative variables: C(${N} + 3, 3) = C(${N + 3}, 3).`), T(`= ${C(N + 3, 3)}。`, `= ${C(N + 3, 3)}.`)],
      };
    },
  },
  {
    id: 'g12-recursion-count',
    grade: 12,
    name: T('遞迴計數', 'Counting with recursion'),
    cur: { tw: '高一 排列組合（遞迴）', aops: 'Intermediate Counting & Probability' },
    at: { tw: 10 },
    gen(r) {
      const t = r.int(0, 4);
      const seq = (a0, a1, n, step) => { const o = [a0, a1]; while (o.length <= n) o.push(step(o)); return o; };
      if (t === 0 || t === 3) {
        const n = r.int(5, 18), w = seq(1, 1, n, (o) => o[o.length - 1] + o[o.length - 2]);
        return {
          q: t === 0 ? T(`爬 ${n} 階樓梯，每步可以走 1 階或 2 階，有幾種走法？`, `You climb ${n} stairs, taking 1 or 2 steps at a time. How many ways are there?`) : T(`用 1 × 2 的骨牌鋪滿 2 × ${n} 的長方形，有幾種鋪法？`, `How many ways can a 2 × ${n} rectangle be tiled with 1 × 2 dominoes?`),
          ans: ansNum(w[n]),
          sol: [t === 0 ? T('看最後一步：最後走 1 階（前面 n − 1 階）或 2 階（前面 n − 2 階）。所以 aₙ = aₙ₋₁ + aₙ₋₂。', 'Look at the last move: 1 step (after n − 1 stairs) or 2 steps (after n − 2). So aₙ = aₙ₋₁ + aₙ₋₂.') : T('看最左邊：放一塊直的（剩 2 × (n − 1)）或兩塊橫的疊起來（剩 2 × (n − 2)）。所以 aₙ = aₙ₋₁ + aₙ₋₂。', 'Look at the left end: one vertical domino (leaving 2 × (n − 1)) or two stacked horizontal ones (leaving 2 × (n − 2)). So aₙ = aₙ₋₁ + aₙ₋₂.'), T('a₁ = 1，a₂ = 2。', 'a₁ = 1, a₂ = 2.'), T(`依序：${w.slice(1, n + 1).join(', ')}。`, `In order: ${w.slice(1, n + 1).join(', ')}.`), T(`a<sub>${n}</sub> = ${num(w[n])}。`, `a<sub>${n}</sub> = ${num(w[n])}.`)],
        };
      }
      if (t === 1) {
        const n = r.int(4, 14), w = [1, 1, 2]; while (w.length <= n) w.push(w[w.length - 1] + w[w.length - 2] + w[w.length - 3]);
        return {
          q: T(`爬 ${n} 階樓梯，每步可以走 1、2 或 3 階，有幾種走法？`, `You climb ${n} stairs, taking 1, 2 or 3 steps at a time. How many ways are there?`),
          ans: ansNum(w[n]),
          sol: [T('最後一步是 1、2 或 3 階：aₙ = aₙ₋₁ + aₙ₋₂ + aₙ₋₃。', 'The last move is 1, 2 or 3 steps: aₙ = aₙ₋₁ + aₙ₋₂ + aₙ₋₃.'), T('a₁ = 1，a₂ = 2，a₃ = 4。', 'a₁ = 1, a₂ = 2, a₃ = 4.'), T(`依序：${w.slice(1, n + 1).join(', ')}。`, `In order: ${w.slice(1, n + 1).join(', ')}.`), T(`a<sub>${n}</sub> = ${num(w[n])}。`, `a<sub>${n}</sub> = ${num(w[n])}.`)],
        };
      }
      if (t === 2) {
        const n = r.int(4, 16), w = seq(1, 2, n, (o) => o[o.length - 1] + o[o.length - 2]);
        return {
          q: T(`由 0 和 1 組成、長度為 ${n} 的字串中，沒有兩個 1 相鄰的有幾個？`, `How many strings of 0s and 1s of length ${n} have no two 1s next to each other?`),
          ans: ansNum(w[n]),
          sol: [T('看第一個字：是 0，後面任意（aₙ₋₁）；是 1，第二個必須是 0，再接任意（aₙ₋₂）。aₙ = aₙ₋₁ + aₙ₋₂。', 'Look at the first symbol: 0, then anything valid (aₙ₋₁); or 1, which forces a 0 next, then anything valid (aₙ₋₂). aₙ = aₙ₋₁ + aₙ₋₂.'), T('a₁ = 2（0、1），a₂ = 3（00、01、10）。', 'a₁ = 2 (0, 1), a₂ = 3 (00, 01, 10).'), T(`依序：${w.slice(1, n + 1).join(', ')}。`, `In order: ${w.slice(1, n + 1).join(', ')}.`), T(`a<sub>${n}</sub> = ${num(w[n])}。`, `a<sub>${n}</sub> = ${num(w[n])}.`)],
        };
      }
      const n = r.int(3, 8), D = [1, 0]; for (let i = 2; i <= n; i++) D.push((i - 1) * (D[i - 1] + D[i - 2]));
      return {
        q: T(`${n} 個人各寫一張卡片，混合後每人隨機拿一張。沒有人拿到自己卡片的拿法有幾種？`, `${n} people each write a card; the cards are mixed and handed back at random. In how many ways does nobody get their own card?`),
        ans: ansNum(D[n]),
        sol: [T('這是「錯排」數 Dₙ，遞迴 Dₙ = (n − 1)(Dₙ₋₁ + Dₙ₋₂)。', 'This is the derangement number Dₙ, with Dₙ = (n − 1)(Dₙ₋₁ + Dₙ₋₂).'), T('D₁ = 0，D₂ = 1。', 'D₁ = 0, D₂ = 1.'), T(`依序：${D.slice(1, n + 1).join(', ')}。`, `In order: ${D.slice(1, n + 1).join(', ')}.`), T(`D<sub>${n}</sub> = ${num(D[n])}。`, `D<sub>${n}</sub> = ${num(D[n])}.`)],
      };
    },
  },
  {
    id: 'g12-amc12',
    grade: 12,
    name: T('AMC 12 風格綜合題', 'AMC 12-style problems'),
    cur: { aops: 'AMC 12' },
    gen(r) {
      const t = r.int(0, 4);
      if (t === 0) {
        const n = r.int(25, 999); const parts = []; let z = 0; for (let p = 5; p <= n; p *= 5) { parts.push([p, Math.floor(n / p)]); z += Math.floor(n / p); }
        return {
          q: T(`${n}! 的末尾有幾個連續的 0？`, `How many zeros are at the end of ${n}!?`),
          ans: ansNum(z),
          sol: [T('每個 0 來自一個 10 = 2 × 5，2 比 5 多，所以只要數因數 5 的個數。', 'Each trailing zero comes from 10 = 2 × 5, and 2s are plentiful, so count the factors of 5.'), T(parts.map(([p, c]) => `⌊${n}/${p}⌋ = ${c}`).join('，'), parts.map(([p, c]) => `⌊${n}/${p}⌋ = ${c}`).join(', ')), T(`合計 ${parts.map(([, c]) => c).join(' + ')} = ${z}。`, `Total ${parts.map(([, c]) => c).join(' + ')} = ${z}.`)],
        };
      }
      if (t === 1) {
        let a, b, c, N; do { a = r.int(0, 6); b = r.int(0, 4); c = r.int(0, 3); N = 2 ** a * 3 ** b * 5 ** c; } while (N > 200000 || a + b + c < 3);
        const fz = [[2, a], [3, b], [5, c]].filter(([, e]) => e).map(([p, e]) => (e > 1 ? `${p}<sup>${e}</sup>` : p)).join(' × ');
        return {
          q: T(`${num(N)} 有幾個正因數？`, `How many positive divisors does ${num(N)} have?`),
          ans: ansNum((a + 1) * (b + 1) * (c + 1)),
          sol: [T(`質因數分解：${num(N)} = ${fz}。`, `Prime factorization: ${num(N)} = ${fz}.`), T('每個因數是 2ⁱ3ʲ5ᵏ，每個指數可以從 0 選到最大。', 'Each divisor is 2ⁱ3ʲ5ᵏ, with each exponent chosen from 0 up to its maximum.'), T(`(${a} + 1)(${b} + 1)(${c} + 1) = ${(a + 1) * (b + 1) * (c + 1)}。`, `(${a} + 1)(${b} + 1)(${c} + 1) = ${(a + 1) * (b + 1) * (c + 1)}.`)],
        };
      }
      if (t === 2) {
        const a = r.int(2, 9), n = r.int(20, 2030), cyc = []; let x = a % 10; while (!cyc.includes(x)) { cyc.push(x); x = (x * a) % 10; }
        const L = cyc.length, d = cyc[(n - 1) % L];
        return {
          q: T(`${a}<sup>${n}</sup> 的個位數字是多少？`, `What is the units digit of ${a}<sup>${n}</sup>?`),
          ans: ansNum(d),
          sol: [T(`只看個位數：${a} 的次方個位數依序是 ${cyc.join(', ')}, …，每 ${L} 個一循環。`, `Only the units digit matters: powers of ${a} end in ${cyc.join(', ')}, … repeating every ${L}.`), T(`${n} ÷ ${L} 的餘數是 ${n % L}${n % L === 0 ? `（等於循環的第 ${L} 個）` : ''}。`, `${n} ÷ ${L} leaves remainder ${n % L}${n % L === 0 ? ` (same as position ${L} in the cycle)` : ''}.`), T(`個位數 = ${d}。`, `Units digit = ${d}.`)],
        };
      }
      if (t === 3) {
        const j = r.int(3, 7), m = 2 ** j;
        return {
          q: T(`計算 log<sub>2</sub>3 × log<sub>3</sub>4 × log<sub>4</sub>5 × ⋯ × log<sub>${m - 1}</sub>${m}。`, `Compute log<sub>2</sub>3 × log<sub>3</sub>4 × log<sub>4</sub>5 × ⋯ × log<sub>${m - 1}</sub>${m}.`),
          ans: ansNum(j),
          sol: [T(`換底：log<sub>k</sub>(k + 1) = ${frac('log(k + 1)', 'log k')}。`, `Change of base: log<sub>k</sub>(k + 1) = ${frac('log(k + 1)', 'log k')}.`), T(`連乘時分子分母依序消去，剩 ${frac(`log ${m}`, 'log 2')} = log<sub>2</sub>${m}。`, `In the product everything cancels in a chain, leaving ${frac(`log ${m}`, 'log 2')} = log<sub>2</sub>${m}.`), T(`${m} = 2<sup>${j}</sup>，答案 ${j}。`, `${m} = 2<sup>${j}</sup>, so the answer is ${j}.`)],
        };
      }
      const a = r.int(2, 9), m = r.pick([5, 7, 9, 11, 13]); if (a % m === 0 || gcd(a, m) > 1) return { q: T(`${a}<sup>${m}</sup> 除以 ${m + 1} 的餘數是多少？`.replace(/.*/, `${a}<sup>2</sup> 除以 ${m} 的餘數是多少？`), `What is the remainder when ${a}<sup>2</sup> is divided by ${m}?`), ans: ansNum((a * a) % m), sol: [T(`${a}² = ${a * a}。`, `${a}² = ${a * a}.`), T(`${a * a} ÷ ${m} 餘 ${(a * a) % m}。`, `${a * a} ÷ ${m} leaves ${(a * a) % m}.`)] };
      const n = r.int(20, 400), cyc = []; let x = a % m; while (!cyc.includes(x)) { cyc.push(x); x = (x * a) % m; }
      const L = cyc.length, d = cyc[(n - 1) % L];
      return {
        q: T(`${a}<sup>${n}</sup> 除以 ${m} 的餘數是多少？`, `What is the remainder when ${a}<sup>${n}</sup> is divided by ${m}?`),
        ans: ansNum(d),
        sol: [T(`看 ${a} 的次方除以 ${m} 的餘數：${cyc.map((c, i) => `${a}<sup>${i + 1}</sup> ≡ ${c}`).join('，')}，接著循環（週期 ${L}）。`, `Powers of ${a} mod ${m}: ${cyc.map((c, i) => `${a}<sup>${i + 1}</sup> ≡ ${c}`).join(', ')}, then it repeats (period ${L}).`), T(`${n} = ${L} × ${Math.floor((n - 1) / L)} + ${((n - 1) % L) + 1}，所以 ${a}<sup>${n}</sup> ≡ ${a}<sup>${((n - 1) % L) + 1}</sup>。`, `${n} = ${L} × ${Math.floor((n - 1) / L)} + ${((n - 1) % L) + 1}, so ${a}<sup>${n}</sup> ≡ ${a}<sup>${((n - 1) % L) + 1}</sup>.`), T(`餘數 ${d}。`, `Remainder ${d}.`)],
      };
    },
  },
];

// a + bi
function cx(a, b) {
  if (b === 0) return num(a);
  const bi = (Math.abs(b) === 1 ? '' : num(Math.abs(b))) + 'i';
  if (a === 0) return (b < 0 ? '−' : '') + bi;
  return `${num(a)} ${b < 0 ? '−' : '+'} ${bi}`;
}
// sin of special angles as [k, r, d] meaning k√r / d
const SINR = { 30: [1, 1, 2], 45: [1, 2, 2], 60: [1, 3, 2], 90: [1, 1, 1], 120: [1, 3, 2], 135: [1, 2, 2], 150: [1, 1, 2] };
// a determinant |…|
function detB(m) {
  const cols = m[0].length;
  return `<span style="display:inline-grid;grid-template-columns:repeat(${cols},auto);gap:2px 12px;padding:2px 8px;text-align:center;vertical-align:middle;border-left:1.5px solid currentColor;border-right:1.5px solid currentColor;margin:0 .15em">${m.flat().map((x) => `<span>${num(x)}</span>`).join('')}</span>`;
}
// p ± qi
function pm(p, q) { return `${p === 0 ? '' : num(p) + ' '}± ${q === 1 ? '' : num(q)}i`; }
