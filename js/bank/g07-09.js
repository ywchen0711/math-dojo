// Question bank: grades 7, 8 and 9 (US Grade 7 / Grade 8 / Algebra 1, Taiwan 國一～國三, AoPS Prealgebra → Intro books).
// See SPEC.md. Each topic's gen(r) returns { q, fig?, ans, sol, hint? }.
import {
  T, num, par, sgn, frac, fracR, fracText, red, gcd, lcm, isPrime, primeFactors, C, P, fact, range, sum, clean,
  pow, sqrt, simpRoot, rad, radText, term, poly, lin, polyText, pmul, uniq, ansNum, ansFrac, ansSet, ansPair, ansChoice,
  fadd, fsub, fmul, fdiv, numText,
} from '../util.js';
import { numberLine, shape, rightTri, circle, grid } from '../draw.js';

// ---------- shared helpers ----------
const NAMES = [['小明', 'Max'], ['小美', 'Mia'], ['阿傑', 'Jay'], ['欣怡', 'Emma'], ['志豪', 'Leo'], ['雅婷', 'Ava'],
  ['家豪', 'Ryan'], ['佳穎', 'Zoe'], ['冠宇', 'Owen'], ['詩涵', 'Lily'], ['宗翰', 'Ethan'], ['宜蓁', 'Chloe']];
const who = (r) => r.pick(NAMES);
const two = (r) => r.sample(NAMES, 2);
// a stacked fraction with any content (variables, ± …)
const fx = (a, b) => `<span class="fr"><span>${a}</span><span>${b}</span></span>`;
// a fraction in parentheses when negative
const pf = (n, d) => (n * d < 0 ? `(${frac(n, d)})` : frac(n, d));
// reduced fraction in parentheses when negative
const pfr = (n, d) => { [n, d] = red(n, d); return d === 1 ? par(n) : pf(n, d); };
const deg = (x) => `${num(x)}°`;
const LT = '&lt;', GT = '&gt;';
const SHOW = { '<': LT, '>': GT, '≤': '≤', '≥': '≥' };
const FLIP = { '<': '>', '>': '<', '≤': '≥', '≥': '≤' };
const STRICT = { '<': '≤', '≤': '<', '>': '≥', '≥': '>' };
const choice = (right, ...wrong) => ansChoice(uniq([right, ...wrong], 4));
const piT = (k) => (k === 1 ? 'π' : `${num(k)}π`);
const piAns = (k) => ansNum(k * Math.PI, `${clean(k)}π`);
const eq2 = (a, b, c) => `${term(a, 'x', 1, true)}${term(b, 'y', 1)} = ${num(c)}`;
// a fraction, and its reduced form if different: 6/8 = 3/4
const eqR = (n, d) => { const A = d === 1 ? num(n) : frac(n, d), B = fracR(n, d); return A === B ? B : `${A} = ${B}`; };
// the terms of a polynomial written after something else: [−4, −1, 2] → " − 4x² − x + 2"
const tail = (cs) => cs.map((c, i) => term(c, 'x', cs.length - 1 - i)).join('');
const sci = (c, e) => `${num(c)} × 10<sup>${num(e)}</sup>`;
const mono = (c, v = 'x') => term(c, v, 1, true);        // 3x, −x …
const ZH_Q = ['一', '二', '三', '四'];
const EN_Q = ['I', 'II', 'III', 'IV'];
const ord = (n) => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };

// ---------- private SVG helpers ----------
const SV = (w, h, body) => `<svg class="fig" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">${body}</svg>`;
const f1 = (x) => +(+x).toFixed(1);
const tt = (x, y, s, acc = false, fs = 13) => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="middle" dominant-baseline="middle" class="${acc ? 'f-acctxt' : 'f-txt'}" font-size="${fs}"${acc ? ' font-weight="700"' : ''}>${s}</text>`;
const ln = (x1, y1, x2, y2, cls = 'f-line', w = 1.5) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" class="${cls}" stroke-width="${w}"/>`;
const dot = (x, y, acc = false) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="3.5" class="${acc ? 'f-accfill' : 'f-dot'}"/>`;
const rad2 = (d) => (d * Math.PI) / 180;
// two lines crossing; theta = angle of the slanted line (deg); labels for the 4 angles counter-clockwise from the right
function xFig(theta, labels, hi = -1) {
  const cx = 120, cy = 80, R = 75, c = Math.cos(rad2(theta)), s = Math.sin(rad2(theta));
  let b = ln(cx - 95, cy, cx + 95, cy, 'f-line', 2) + ln(cx - R * c, cy + R * s, cx + R * c, cy - R * s, 'f-line', 2) + dot(cx, cy);
  const mids = [theta / 2, (theta + 180) / 2, 180 + theta / 2, (theta + 180) / 2 + 180];
  const spans = [theta, 180 - theta, theta, 180 - theta];
  mids.forEach((m, i) => { const rr = spans[i] < 50 ? 52 : 32; b += tt(cx + rr * Math.cos(rad2(m)), cy - rr * Math.sin(rad2(m)), labels[i], i === hi); });
  return SV(240, 160, b);
}
// a straight line with a ray from its middle at angle phi; labels: [right part, left part]
function rayFig(phi, right, left) {
  const cx = 130, cy = 120;
  let b = ln(20, cy, 240, cy, 'f-line', 2) + ln(cx, cy, cx + 100 * Math.cos(rad2(phi)), cy - 100 * Math.sin(rad2(phi)), 'f-line', 2) + dot(cx, cy);
  const m1 = phi / 2, m2 = (phi + 180) / 2;
  b += tt(cx + 58 * Math.cos(rad2(m1)), cy - 40 * Math.sin(rad2(m1)) - 6, right, true, 12) + tt(cx + 58 * Math.cos(rad2(m2)), cy - 40 * Math.sin(rad2(m2)) - 6, left, true, 12);
  return SV(260, 140, b);
}
// a right angle split by a ray at angle phi (deg from the bottom side)
function rightAngleFig(phi, low, up) {
  const ox = 40, oy = 130;
  let b = ln(ox, oy, 230, oy, 'f-line', 2) + ln(ox, oy, ox, 10, 'f-line', 2) + `<polyline points="${ox},${oy - 14} ${ox + 14},${oy - 14} ${ox + 14},${oy}" fill="none" class="f-line"/>`;
  b += ln(ox, oy, ox + 150 * Math.cos(rad2(phi)), oy - 150 * Math.sin(rad2(phi)), 'f-line', 2);
  b += tt(ox + 75 * Math.cos(rad2(phi / 2)), oy - 75 * Math.sin(rad2(phi / 2)), low, true, 12) + tt(ox + 62 * Math.cos(rad2((phi + 90) / 2)), oy - 62 * Math.sin(rad2((phi + 90) / 2)), up, true, 12);
  return SV(240, 145, b);
}
// two parallel lines cut by a transversal; angles numbered 1–8 (top: 1 UL, 2 UR, 3 LL, 4 LR; bottom: 5–8)
function parFig(theta, given, ask, givenText) {
  const y1 = 50, y2 = 130, x1 = 130, dx = (y2 - y1) / Math.tan(rad2(theta)), x2 = x1 - dx;
  const c = Math.cos(rad2(theta)), s = Math.sin(rad2(theta));
  let b = ln(10, y1, 270, y1, 'f-line', 2) + ln(10, y2, 270, y2, 'f-line', 2);
  b += ln(x1 + 40 * c, y1 - 40 * s, x2 - 40 * c, y2 + 40 * s, 'f-line', 2);
  b += tt(262, y1 - 9, 'L₁', false, 11) + tt(262, y2 - 9, 'L₂', false, 11);
  const mids = [(theta + 180) / 2, theta / 2, 180 + theta / 2, 270 + theta / 2];
  [[x1, y1], [x2, y2]].forEach(([px, py], j) => {
    mids.forEach((m, i) => {
      const n = j * 4 + i + 1, rr = 22;
      const lab = n === given ? givenText : n === ask ? '?' : String(n);
      b += tt(px + rr * Math.cos(rad2(m)), py - rr * Math.sin(rad2(m)), lab, n === given || n === ask, n === given ? 11 : 12);
    });
  });
  return SV(280, 180, b);
}
// points on a circle (angles in degrees, 0 = right, counter-clockwise); segs = [[i, j]], labels for points; center O optional
function circFig(angs, names, segs, withO = true, extra = '') {
  const cx = 110, cy = 100, R = 80, X = (a) => cx + R * Math.cos(rad2(a)), Y = (a) => cy - R * Math.sin(rad2(a));
  const pt = (k) => (k === 'O' ? [cx, cy] : [X(angs[k]), Y(angs[k])]);
  let b = `<circle cx="${cx}" cy="${cy}" r="${R}" class="f-soft"/>`;
  for (const [i, j] of segs) { const [a1, b1] = pt(i), [a2, b2] = pt(j); b += ln(a1, b1, a2, b2, 'f-line', 1.6); }
  angs.forEach((a, k) => { b += dot(X(a), Y(a)) + tt(cx + (R + 13) * Math.cos(rad2(a)), cy - (R + 13) * Math.sin(rad2(a)), names[k], false, 13); });
  if (withO) b += dot(cx, cy, true) + tt(cx + 10, cy + 12, 'O', true, 12);
  return SV(220, 205, b + extra);
}
// circle with external point P and two tangent segments PA, PB
function tangentFig(labels) {
  const cx = 80, cy = 95, R = 55, px = 250, py = 95, d = px - cx, a = Math.acos(R / d);
  const A = [cx + R * Math.cos(a), cy - R * Math.sin(a)], B = [cx + R * Math.cos(a), cy + R * Math.sin(a)];
  let b = `<circle cx="${cx}" cy="${cy}" r="${R}" class="f-soft"/>` + ln(px, py, A[0], A[1], 'f-acc', 2) + ln(px, py, B[0], B[1], 'f-line', 1.6);
  b += ln(cx, cy, A[0], A[1], 'f-line', 1.2) + ln(cx, cy, B[0], B[1], 'f-line', 1.2) + ln(cx, cy, px, py, 'f-grid', 1.2);
  b += dot(cx, cy) + dot(px, py) + dot(A[0], A[1]) + dot(B[0], B[1]);
  b += tt(cx - 10, cy + 2, 'O') + tt(px + 12, py, 'P') + tt(A[0] + 2, A[1] - 12, 'A') + tt(B[0] + 2, B[1] + 13, 'B');
  if (labels.PA) b += tt((px + A[0]) / 2 + 6, (py + A[1]) / 2 - 12, labels.PA, true, 12);
  if (labels.PB) b += tt((px + B[0]) / 2 + 6, (py + B[1]) / 2 + 12, labels.PB, true, 12);
  if (labels.r) b += tt((cx + A[0]) / 2 - 10, (cy + A[1]) / 2 - 4, labels.r, true, 12);
  if (labels.OP) b += tt((cx + px) / 2 + 10, cy - 8, labels.OP, true, 12);
  return SV(280, 190, b);
}
// a simple data table: rows = [[head, v1, v2 …], …]
const tbl = (rows) => `<table class="dtab" style="border-collapse:collapse;margin:6px 0">${rows.map((rw) => `<tr>${rw.map((c, i) => `<${i ? 'td' : 'th'} style="border:1px solid currentColor;padding:3px 10px;text-align:center">${c}</${i ? 'td' : 'th'}>`).join('')}</tr>`).join('')}</table>`;
// cylinder / cone / sphere outlines with a radius and height label
function solidFig(kind, rl, hl) {
  let b = '';
  if (kind === 'sphere') {
    b = `<circle cx="90" cy="80" r="62" class="f-soft"/><ellipse cx="90" cy="80" rx="62" ry="16" fill="none" class="f-line" stroke-dasharray="4 3"/>` + ln(90, 80, 152, 80, 'f-acc', 2) + dot(90, 80) + tt(121, 70, rl, true, 12);
    return SV(180, 160, b);
  }
  if (kind === 'cyl') {
    b = `<rect x="40" y="30" width="110" height="110" class="f-soft" stroke="none"/><ellipse cx="95" cy="140" rx="55" ry="14" class="f-soft"/><ellipse cx="95" cy="30" rx="55" ry="14" class="f-soft"/>` + ln(40, 30, 40, 140) + ln(150, 30, 150, 140);
    b += ln(95, 30, 150, 30, 'f-acc', 2) + dot(95, 30) + tt(122, 20, rl, true, 12) + tt(170, 85, hl, true, 12);
    return SV(200, 165, b);
  }
  b = `<polygon points="95,15 40,140 150,140" class="f-soft"/><ellipse cx="95" cy="140" rx="55" ry="14" class="f-soft"/>` + ln(95, 15, 95, 140, 'f-line', 1) + ln(95, 140, 150, 140, 'f-acc', 2) + dot(95, 140);
  b += tt(122, 128, rl, true, 12) + tt(84, 80, hl, true, 12);
  return SV(200, 165, b);
}
// triangle ABC from points with optional side labels [ab, bc, ca] and vertex names
function triFig(pts, names, sides = [], extra = '') {
  const [A, B, Cc] = pts, mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const G = [(A[0] + B[0] + Cc[0]) / 3, (A[1] + B[1] + Cc[1]) / 3];
  const out = (m) => { const dx = m[0] - G[0], dy = m[1] - G[1], L = Math.hypot(dx, dy) || 1; return [m[0] + (dx / L) * 13, m[1] + (dy / L) * 13]; };
  let b = `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" class="f-soft"/>` + extra;
  pts.forEach((p, i) => { const o = out(p); b += tt(o[0], o[1], names[i]); });
  [[A, B], [B, Cc], [Cc, A]].forEach(([p, q], i) => { if (sides[i]) { const o = out(mid(p, q)); b += tt(o[0], o[1], sides[i], true, 12); } });
  return b;
}
// box plot for a five-number summary on a scale lo..hi
function boxFig(five, lo, hi, step) {
  const w = 340, pad = 20, X = (v) => pad + ((v - lo) / (hi - lo)) * (w - 2 * pad), [mn, q1, md, q3, mx] = five;
  let b = ln(pad, 95, w - pad, 95, 'f-line', 1.5);
  for (let v = lo; v <= hi; v += step) b += ln(X(v), 91, X(v), 99, 'f-line', 1) + tt(X(v), 110, v, false, 10);
  b += ln(X(mn), 50, X(q1), 50, 'f-line', 2) + ln(X(q3), 50, X(mx), 50, 'f-line', 2) + ln(X(mn), 40, X(mn), 60, 'f-line', 2) + ln(X(mx), 40, X(mx), 60, 'f-line', 2);
  b += `<rect x="${f1(X(q1))}" y="30" width="${f1(X(q3) - X(q1))}" height="40" class="f-soft"/>` + ln(X(md), 30, X(md), 70, 'f-acc', 2.5);
  return SV(w, 120, b);
}

// ======================= GRADE 7 =======================
// how two signed numbers add, explained
function addWhy(x, y) {
  const s = x + y;
  if (x === 0 || y === 0) return T(`${num(x)} + ${par(y)} = ${num(s)}（加 0 不變）。`, `${num(x)} + ${par(y)} = ${num(s)} (adding 0 changes nothing).`);
  if ((x > 0) === (y > 0)) return T(`${num(x)} + ${par(y)}：同號，絕對值相加 ${Math.abs(x)} + ${Math.abs(y)} = ${Math.abs(s)}，符號不變，得 ${num(s)}。`,
    `${num(x)} + ${par(y)}: same signs, so add the sizes ${Math.abs(x)} + ${Math.abs(y)} = ${Math.abs(s)} and keep the sign: ${num(s)}.`);
  const big = Math.max(Math.abs(x), Math.abs(y)), sm = Math.min(Math.abs(x), Math.abs(y));
  return T(`${num(x)} + ${par(y)}：異號，大減小 ${big} − ${sm} = ${big - sm}，取絕對值較大者的符號，得 ${num(s)}。`,
    `${num(x)} + ${par(y)}: different signs, so subtract the sizes ${big} − ${sm} = ${big - sm} and take the sign of the bigger one: ${num(s)}.`);
}
const negCount = (...xs) => xs.filter((x) => x < 0).length;
const signWhy = (n, v) => (n % 2
  ? T(`有 ${n} 個負數（奇數個），所以結果是負的。`, `There ${n === 1 ? 'is 1 negative number' : `are ${n} negative numbers`} (an odd count), so the result is negative.`)
  : T(`有 ${n} 個負數（偶數個），所以結果是正的。`, `There ${n === 0 ? 'are no negative numbers' : `are ${n} negative numbers`} (an even count), so the result is positive.`));

const G7 = [
  {
    id: 'g7-int-ops', grade: 7,
    name: T('整數的四則運算', 'Operations with integers'),
    cur: { us: 'CCSS 7.NS.A.1–2', tw: '七年級 整數的四則運算', aops: 'Prealgebra' },
    gen(r) {
      const k = r.int(0, 3);
      const hint = T('減一個數 = 加它的相反數；乘除先看負號個數決定正負。', 'Subtracting = adding the opposite. For × and ÷, count the negative signs to decide the sign.');
      if (k === 0) {
        const a = r.nz(-25, 25), b = r.nz(-25, 25), c = r.nz(-25, 25), s1 = a + b, v = s1 - c;
        return {
          q: T(`計算：${num(a)} + ${par(b)} − ${par(c)}`, `Compute: ${num(a)} + ${par(b)} − ${par(c)}`), ans: ansNum(v), hint,
          sol: [
            T(`減去一個數，就是加上它的相反數，所以「− ${par(c)}」可以改成「+ ${par(-c)}」。`, `Subtracting a number is the same as adding its opposite, so "− ${par(c)}" becomes "+ ${par(-c)}".`),
            T(`算式變成 ${num(a)} + ${par(b)} + ${par(-c)}，由左到右算。`, `Now it reads ${num(a)} + ${par(b)} + ${par(-c)}. Work from left to right.`),
            addWhy(a, b), addWhy(s1, -c),
            T(`答案：${num(v)}。`, `Answer: ${num(v)}.`),
          ],
        };
      }
      if (k === 1) {
        const b = r.nz(-9, 9), c = r.int(2, 9) * r.sign(), a = c * r.nz(-6, 6), ab = a * b, v = ab / c;
        return {
          q: T(`計算：${num(a)} × ${par(b)} ÷ ${par(c)}`, `Compute: ${num(a)} × ${par(b)} ÷ ${par(c)}`), ans: ansNum(v), hint,
          sol: [
            T('只有乘和除，由左到右計算。正負號可以先決定。', 'Only × and ÷, so work from left to right. We can decide the sign first.'),
            signWhy(negCount(a, b, c), v),
            T(`先算絕對值：${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(ab)}。`, `Sizes first: ${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(ab)}.`),
            T(`${Math.abs(ab)} ÷ ${Math.abs(c)} = ${Math.abs(v)}，加上符號得 ${num(v)}。`, `${Math.abs(ab)} ÷ ${Math.abs(c)} = ${Math.abs(v)}; with the sign: ${num(v)}.`),
            T(`驗算：${num(a)} × ${par(b)} = ${num(ab)}，${num(ab)} ÷ ${par(c)} = ${num(v)} ✓`, `Check: ${num(a)} × ${par(b)} = ${num(ab)}, and ${num(ab)} ÷ ${par(c)} = ${num(v)} ✓`),
          ],
        };
      }
      if (k === 2) {
        const a = r.nz(-20, 20), b = r.int(2, 9) * r.sign(); let c, d; do { c = r.nz(-10, 10); d = r.nz(-10, 10); } while (c === d);
        const e = c - d, f = b * e, v = a - f;
        return {
          q: T(`計算：${num(a)} − ${par(b)} × (${num(c)} − ${par(d)})`, `Compute: ${num(a)} − ${par(b)} × (${num(c)} − ${par(d)})`), ans: ansNum(v), hint,
          sol: [
            T('運算順序：先括號，再乘除，最後加減。', 'Order of operations: parentheses first, then × and ÷, then + and −.'),
            T(`括號：${num(c)} − ${par(d)} = ${num(c)} + ${par(-d)} = ${num(e)}。`, `Parentheses: ${num(c)} − ${par(d)} = ${num(c)} + ${par(-d)} = ${num(e)}.`),
            T(`乘法：${par(b)} × ${par(e)} = ${num(f)}。`, `Multiply: ${par(b)} × ${par(e)} = ${num(f)}.`),
            T(`最後減法：${num(a)} − ${par(f)} = ${num(a)} + ${par(-f)} = ${num(v)}。`, `Finally subtract: ${num(a)} − ${par(f)} = ${num(a)} + ${par(-f)} = ${num(v)}.`),
          ],
        };
      }
      if (r.chance(0.5)) {
        const t0 = r.int(-12, 6), u = r.int(3, 12), dn = r.int(6, 22), m = t0 + u, v = m - dn;
        return {
          q: T(`合歡山上早上的氣溫是 ${num(t0)}°C，到中午上升了 ${u}°C，晚上又比中午下降了 ${dn}°C。晚上的氣溫是幾 °C？`,
            `On a mountain the temperature was ${num(t0)}°C in the morning. By noon it rose ${u}°C, and by night it fell ${dn}°C from the noon temperature. What was the temperature at night (°C)?`),
          ans: ansNum(v), hint,
          sol: [
            T('上升用加法，下降用減法。', 'Rising means add, falling means subtract.'),
            T(`中午：${num(t0)} + ${u} = ${num(m)}°C。`, `Noon: ${num(t0)} + ${u} = ${num(m)}°C.`),
            T(`晚上：${num(m)} − ${dn} = ${num(v)}°C。`, `Night: ${num(m)} − ${dn} = ${num(v)}°C.`),
            T(`答案：${num(v)}°C。`, `Answer: ${num(v)}°C.`),
          ],
        };
      }
      const a = r.int(20, 90), b = r.int(5, 40), c = r.int(10, 60), m = -a + b, v = m - c;
      return {
        q: T(`一艘潛水艇在海平面下 ${a} 公尺（記為 −${a} 公尺），先上升 ${b} 公尺，再下潛 ${c} 公尺。現在牠在哪個高度？（用正負數回答，單位：公尺）`,
          `A submarine is ${a} m below sea level (written −${a} m). It rises ${b} m, then dives ${c} m. What is its height now, in meters (use a signed number)?`),
        ans: ansNum(v), hint,
        sol: [
          T('海平面是 0，海平面以下用負數。上升加、下潛減。', 'Sea level is 0 and below it is negative. Rising adds, diving subtracts.'),
          addWhy(-a, b),
          T(`再下潛：${num(m)} − ${c} = ${num(v)}。`, `Then dive: ${num(m)} − ${c} = ${num(v)}.`),
          T(`現在在 ${num(v)} 公尺，也就是海平面下 ${-v} 公尺。`, `It is now at ${num(v)} m, that is ${-v} m below sea level.`),
        ],
      };
    },
  },
  {
    id: 'g7-rational-ops', grade: 7,
    name: T('有理數（分數、小數）的運算', 'Operations with rational numbers'),
    cur: { us: 'CCSS 7.NS.A.1–3', tw: '七年級 分數的四則運算', aops: 'Prealgebra' },
    gen(r) {
      const k = r.int(0, 3), D = [2, 3, 4, 5, 6, 8, 10, 12];
      const fr1 = () => { const d = r.pick(D); let n; do n = r.int(1, d - 1); while (gcd(n, d) !== 1); return [n * r.sign(), d]; };
      if (k === 0) {
        const [a, b] = fr1(); let c, d; do [c, d] = fr1(); while (d === b && c === a);
        const op = r.pick(['+', '−']), L = lcm(b, d), A = a * (L / b), Cc = c * (L / d), N = op === '+' ? A + Cc : A - Cc, [n, m] = red(N, L);
        return {
          q: T(`計算：${frac(a, b)} ${op} ${pf(c, d)}（用最簡分數回答）`, `Compute: ${frac(a, b)} ${op} ${pf(c, d)} (answer in lowest terms).`),
          ans: ansFrac(n, m),
          sol: [
            T(`分母不同，先通分。${b} 和 ${d} 的最小公倍數是 ${L}。`, `The denominators differ, so find a common one: the LCM of ${b} and ${d} is ${L}.`),
            T(`${frac(a, b)} = ${frac(A, L)}，${pf(c, d)} = ${pf(Cc, L)}。`, `${frac(a, b)} = ${frac(A, L)} and ${pf(c, d)} = ${pf(Cc, L)}.`),
            T(`分子計算：${num(A)} ${op} ${par(Cc)} = ${num(N)}，得 ${frac(N, L)}。`, `Combine the numerators: ${num(A)} ${op} ${par(Cc)} = ${num(N)}, giving ${frac(N, L)}.`),
            T(`約分：答案是 ${fracR(n, m)}。`, `Reduce: the answer is ${fracR(n, m)}.`),
          ],
          hint: T('先通分，再處理正負號。', 'Get a common denominator, then handle the signs.'),
        };
      }
      if (k === 1) {
        const [a, b] = fr1(), [c, d] = fr1(), div = r.chance(0.5);
        const [p, q] = div ? [c < 0 ? -d : d, Math.abs(c)] : [c, d];
        const [n, m] = fmul([a, b], [p, q]), sgnNeg = n < 0;
        return {
          q: T(`計算：${frac(a, b)} ${div ? '÷' : '×'} ${pf(c, d)}（用最簡分數回答）`, `Compute: ${frac(a, b)} ${div ? '÷' : '×'} ${pf(c, d)} (answer in lowest terms).`),
          ans: ansFrac(n, m),
          sol: [
            ...(div ? [T(`除以一個分數 = 乘以它的倒數：÷ ${pf(c, d)} 變成 × ${pf(p, q)}。`, `Dividing by a fraction = multiplying by its reciprocal: ÷ ${pf(c, d)} becomes × ${pf(p, q)}.`)] : []),
            T(`符號：${negCount(a, p)} 個負數，結果是${sgnNeg ? '負' : '正'}的。`, `Sign: ${negCount(a, p)} negative factor(s), so the result is ${sgnNeg ? 'negative' : 'positive'}.`),
            T(`分子乘分子、分母乘分母：${fx(`${Math.abs(a)} × ${Math.abs(p)}`, `${b} × ${q}`)} = ${frac(Math.abs(a * p), b * q)}。`, `Multiply tops and bottoms: ${fx(`${Math.abs(a)} × ${Math.abs(p)}`, `${b} × ${q}`)} = ${frac(Math.abs(a * p), b * q)}.`),
            T(`約分並加上符號：${fracR(n, m)}。`, `Reduce and attach the sign: ${fracR(n, m)}.`),
          ],
          hint: T('負號個數是奇數 → 答案為負。', 'An odd number of negatives → negative answer.'),
        };
      }
      if (k === 2) {
        const a = r.nz(-95, 95) / 10, b = r.nz(-9, 9), c = r.nz(-99, 99) / 10, ab = clean(a * b), v = clean(ab - c);
        return {
          q: T(`計算：${num(a)} × ${par(b)} − ${par(c)}`, `Compute: ${num(a)} × ${par(b)} − ${par(c)}`), ans: ansNum(v),
          sol: [
            T('先乘後減。', 'Multiply first, then subtract.'),
            T(`${num(a)} × ${par(b)} = ${num(ab)}（${negCount(a, b) === 1 ? '異號相乘為負' : '同號相乘為正'}）。`, `${num(a)} × ${par(b)} = ${num(ab)} (${negCount(a, b) === 1 ? 'different signs → negative' : 'same signs → positive'}).`),
            T(`${num(ab)} − ${par(c)} = ${num(ab)} + ${par(-c)} = ${num(v)}。`, `${num(ab)} − ${par(c)} = ${num(ab)} + ${par(-c)} = ${num(v)}.`),
            T(`答案：${num(v)}。`, `Answer: ${num(v)}.`),
          ],
        };
      }
      if (r.chance(0.5)) {
        const n = r.int(3, 9), q = r.pick([2, 3, 4, 5, 8]), p = r.int(1, q - 1), [x, y] = red(-n * p, q);
        if (gcd(p, q) !== 1) return this.gen(r);
        return {
          q: T(`某支股票連續 ${n} 天，每天都下跌 ${frac(p, q)} 元。這 ${n} 天股價一共變化了多少元？（下跌用負數表示，用最簡分數回答）`,
            `A stock fell ${frac(p, q)} dollar every day for ${n} days in a row. What was the total change in price, in dollars? (A drop is negative; answer in lowest terms.)`),
          ans: ansFrac(x, y),
          sol: [
            T(`每天的變化是 ${frac(-p, q)} 元，共 ${n} 天，用乘法。`, `Each day the change is ${frac(-p, q)} dollar; there are ${n} days, so multiply.`),
            T(`${n} × ${pf(-p, q)} = ${frac(-n * p, q)}。`, `${n} × ${pf(-p, q)} = ${frac(-n * p, q)}.`),
            T(`約分：${fracR(x, y)} 元，也就是一共跌了 ${fracR(-x, y)} 元。`, `Reduced: ${fracR(x, y)} dollars, i.e. it fell ${fracR(-x, y)} dollars in all.`),
          ],
        };
      }
      const t0 = r.int(-3, 12), dr = r.pick([0.5, 1.5, 2.5, 1.2, 0.8, 1.4]), h = r.int(3, 8), ch = clean(dr * h), v = clean(t0 - ch);
      return {
        q: T(`寒流來襲，傍晚氣溫是 ${num(t0)}°C，之後每小時下降 ${num(dr)}°C。${h} 小時後氣溫是幾 °C？`,
          `A cold front arrives. In the evening it is ${num(t0)}°C, and then the temperature drops ${num(dr)}°C every hour. What is the temperature after ${h} hours (°C)?`),
        ans: ansNum(v),
        sol: [
          T(`${h} 小時共下降 ${num(dr)} × ${h} = ${num(ch)}°C。`, `In ${h} hours it drops ${num(dr)} × ${h} = ${num(ch)}°C.`),
          T(`${num(t0)} − ${num(ch)} = ${num(v)}。`, `${num(t0)} − ${num(ch)} = ${num(v)}.`),
          T(`答案：${num(v)}°C。`, `Answer: ${num(v)}°C.`),
        ],
      };
    },
  },
  {
    id: 'g7-expressions', grade: 7,
    name: T('一元一次式的化簡', 'Simplifying linear expressions'),
    cur: { us: 'CCSS 7.EE.A.1', tw: '七年級 一元一次式的化簡', aops: 'Prealgebra' },
    gen(r) {
      const k = r.int(0, 3);
      if (k === 0) {
        const a = r.int(2, 7), b = r.nz(-9, 9), c = r.int(2, 7), d = r.nz(-9, 9);
        const X = a - c, K = a * b + c * d, right = poly([X, K]);
        // a(x + b) − c(x − d) = ax + ab − cx + cd
        return {
          q: T(`化簡：${a}(x ${sgn(b)}) − ${c}(x ${sgn(-d)})`, `Simplify: ${a}(x ${sgn(b)}) − ${c}(x ${sgn(-d)})`),
          ans: choice(right, poly([X, a * b - c * d]), poly([a + c, K]), poly([X, a * b + d]), poly([X, b + c * d])),
          sol: [
            T('用分配律把括號展開，注意前面的「−」要乘進每一項。', 'Use the distributive law. The "−" in front must multiply every term inside.'),
            T(`${a}(x ${sgn(b)}) = ${poly([a, a * b])}。`, `${a}(x ${sgn(b)}) = ${poly([a, a * b])}.`),
            T(`−${c}(x ${sgn(-d)}) = ${poly([-c, c * d])}${d > 0 ? '（負負得正）' : ''}。`, `−${c}(x ${sgn(-d)}) = ${poly([-c, c * d])}${d > 0 ? ' (negative × negative = positive)' : ''}.`),
            T(`合併同類項：x 項 ${a} − ${c} = ${num(X)}，常數 ${num(a * b)} ${sgn(c * d)} = ${num(K)}。`, `Combine like terms: x-terms ${a} − ${c} = ${num(X)}; constants ${num(a * b)} ${sgn(c * d)} = ${num(K)}.`),
            T(`答案：${right}。`, `Answer: ${right}.`),
          ],
        };
      }
      if (k === 1) {
        const a = r.nz(-9, 9), b = r.nz(-12, 12); let c; do c = r.nz(-9, 9); while (c === a); const d = r.nz(-12, 12);
        const right = poly([a + c, b + d]);
        return {
          q: T(`化簡：${mono(a)} ${sgn(b)} ${c < 0 ? '−' : '+'} ${mono(Math.abs(c))} ${sgn(d)}`, `Simplify: ${mono(a)} ${sgn(b)} ${c < 0 ? '−' : '+'} ${mono(Math.abs(c))} ${sgn(d)}`),
          ans: choice(right, poly([a - c, b + d]), poly([a + c, b - d]), poly([0, a + b + c + d]) === '0' ? poly([a + c + 1, b + d]) : `${num(a + b + c + d)}x`, poly([a + c, -(b + d)])),
          sol: [
            T('同類項才能合併：x 項跟 x 項，常數跟常數。', 'Only like terms combine: x-terms with x-terms, numbers with numbers.'),
            T(`x 項：${num(a)} ${sgn(c)} = ${num(a + c)}。`, `x-terms: ${num(a)} ${sgn(c)} = ${num(a + c)}.`),
            T(`常數：${num(b)} ${sgn(d)} = ${num(b + d)}。`, `Constants: ${num(b)} ${sgn(d)} = ${num(b + d)}.`),
            T(`答案：${right}。`, `Answer: ${right}.`),
          ],
        };
      }
      if (k === 2) {
        const a = r.nz(-6, 6), b = r.int(2, 9) * r.sign(), c = r.int(2, 5), x = r.nz(-5, 5), inner = x - c, v = a * x + b * inner;
        // expression: a x + b(x − c)
        return {
          q: T(`當 x = ${num(x)} 時，求 ${mono(a)} ${b < 0 ? '−' : '+'} ${Math.abs(b)}(x − ${c}) 的值。`, `Find the value of ${mono(a)} ${b < 0 ? '−' : '+'} ${Math.abs(b)}(x − ${c}) when x = ${num(x)}.`),
          ans: ansNum(v),
          sol: [
            T(`把 x 換成 ${par(x)}，負數要加括號。`, `Replace x with ${par(x)} — use parentheses for negatives.`),
            T(`${num(a)} × ${par(x)} = ${num(a * x)}；括號裡 ${par(x)} − ${c} = ${num(inner)}。`, `${num(a)} × ${par(x)} = ${num(a * x)}; inside the parentheses ${par(x)} − ${c} = ${num(inner)}.`),
            T(`${num(b)} × ${par(inner)} = ${num(b * inner)}。`, `${num(b)} × ${par(inner)} = ${num(b * inner)}.`),
            T(`${num(a * x)} + ${par(b * inner)} = ${num(v)}。`, `${num(a * x)} + ${par(b * inner)} = ${num(v)}.`),
          ],
        };
      }
      const [nm] = [who(r)], a = r.int(150, 450), b = r.pick([30, 40, 50, 60, 80, 100]);
      return {
        q: T(`${nm[0]}去看演唱會，門票每張 ${a} 元，另外整筆訂單收手續費 ${b} 元。買 n 張門票共要付多少元？`,
          `${nm[1]} buys concert tickets at $${a} each, plus one $${b} service fee for the whole order. How many dollars does it cost to buy n tickets?`),
        ans: choice(`${a}n + ${b}`, `${a + b}n`, `${a}(n + ${b})`, `${b}n + ${a}`),
        sol: [
          T(`n 張門票的錢：每張 ${a} 元 × n 張 = ${a}n 元。`, `The tickets: $${a} × n = ${a}n dollars.`),
          T(`手續費只收一次，所以只加一次 ${b}。`, `The fee is charged once, so add ${b} only once.`),
          T(`總價 = ${a}n + ${b}。例如 n = 2 時是 ${a * 2 + b} 元。`, `Total = ${a}n + ${b}. For example, n = 2 gives $${a * 2 + b}.`),
        ],
      };
    },
  },
  {
    id: 'g7-two-step-eq', grade: 7,
    name: T('一元一次方程式', 'Solving linear equations'),
    cur: { us: 'CCSS 7.EE.B.4a', tw: '七年級 一元一次方程式', aops: 'Prealgebra' },
    gen(r) {
      const k = r.int(0, 4), x = r.nz(-12, 12);
      const hint = T('想像天平：兩邊做一樣的事，等號仍然成立。', 'Think of a balance: do the same thing to both sides.');
      if (k === 0) {
        const a = r.int(2, 9) * r.sign(), b = r.nz(-20, 20), c = a * x + b;
        return {
          q: T(`解方程式：${mono(a)} ${sgn(b)} = ${num(c)}`, `Solve: ${mono(a)} ${sgn(b)} = ${num(c)}`), ans: ansNum(x, `x = ${x}`), hint,
          sol: [
            T(`先把常數 ${num(b)} 消掉：兩邊同時${b > 0 ? `減 ${b}` : `加 ${-b}`}。`, `First get rid of the ${num(b)}: ${b > 0 ? `subtract ${b} from` : `add ${-b} to`} both sides.`),
            T(`${mono(a)} = ${num(c)} ${sgn(-b)} = ${num(c - b)}。`, `${mono(a)} = ${num(c)} ${sgn(-b)} = ${num(c - b)}.`),
            T(`兩邊同除以 ${par(a)}：x = ${num(c - b)} ÷ ${par(a)} = ${num(x)}。`, `Divide both sides by ${par(a)}: x = ${num(c - b)} ÷ ${par(a)} = ${num(x)}.`),
            T(`驗算：${num(a)} × ${par(x)} ${sgn(b)} = ${num(a * x)} ${sgn(b)} = ${num(c)} ✓`, `Check: ${num(a)} × ${par(x)} ${sgn(b)} = ${num(a * x)} ${sgn(b)} = ${num(c)} ✓`),
          ],
        };
      }
      if (k === 1) {
        const a = r.int(2, 8), m = r.nz(-9, 9), X = a * m, b = r.nz(-15, 15), c = m + b;
        return {
          q: T(`解方程式：${fx('x', a)} ${sgn(b)} = ${num(c)}`, `Solve: ${fx('x', a)} ${sgn(b)} = ${num(c)}`), ans: ansNum(X, `x = ${X}`), hint,
          sol: [
            T(`兩邊同時${b > 0 ? `減 ${b}` : `加 ${-b}`}：${fx('x', a)} = ${num(c)} ${sgn(-b)} = ${num(m)}。`, `${b > 0 ? `Subtract ${b} from` : `Add ${-b} to`} both sides: ${fx('x', a)} = ${num(c)} ${sgn(-b)} = ${num(m)}.`),
            T(`x 被除以 ${a}，所以兩邊同乘 ${a}：x = ${num(m)} × ${a} = ${num(X)}。`, `x is divided by ${a}, so multiply both sides by ${a}: x = ${num(m)} × ${a} = ${num(X)}.`),
            T(`驗算：${num(X)} ÷ ${a} ${sgn(b)} = ${num(m)} ${sgn(b)} = ${num(c)} ✓`, `Check: ${num(X)} ÷ ${a} ${sgn(b)} = ${num(m)} ${sgn(b)} = ${num(c)} ✓`),
          ],
        };
      }
      if (k === 2) {
        const a = r.int(2, 9) * r.sign(); let b; do b = r.nz(-9, 9); while (x + b === 0); const c = a * (x + b);
        return {
          q: T(`解方程式：${num(a)}(x ${sgn(b)}) = ${num(c)}`, `Solve: ${num(a)}(x ${sgn(b)}) = ${num(c)}`), ans: ansNum(x, `x = ${x}`), hint,
          sol: [
            T(`兩邊同除以 ${par(a)}：x ${sgn(b)} = ${num(c)} ÷ ${par(a)} = ${num(x + b)}。`, `Divide both sides by ${par(a)}: x ${sgn(b)} = ${num(c)} ÷ ${par(a)} = ${num(x + b)}.`),
            T(`兩邊同時${b > 0 ? `減 ${b}` : `加 ${-b}`}：x = ${num(x + b)} ${sgn(-b)} = ${num(x)}。`, `${b > 0 ? `Subtract ${b} from` : `Add ${-b} to`} both sides: x = ${num(x + b)} ${sgn(-b)} = ${num(x)}.`),
            T(`（也可以先展開成 ${poly([a, a * b])} = ${num(c)} 再解，答案一樣。）`, `(You could also expand to ${poly([a, a * b])} = ${num(c)} first; the answer is the same.)`),
            T(`驗算：${num(a)} × (${num(x)} ${sgn(b)}) = ${num(a)} × ${par(x + b)} = ${num(c)} ✓`, `Check: ${num(a)} × (${num(x)} ${sgn(b)}) = ${num(a)} × ${par(x + b)} = ${num(c)} ✓`),
          ],
        };
      }
      if (k === 3) {
        const nm = who(r), n = r.int(2, 12), a = r.pick([15, 20, 25, 30, 35, 40, 45, 50, 55, 60]), b = r.pick([10, 12, 15, 18, 20, 25, 30]), c = a * n + b;
        return {
          q: T(`${nm[0]}買了一些每本 ${a} 元的筆記本，又買了一支 ${b} 元的筆，一共花了 ${c} 元。${nm[0]}買了幾本筆記本？`,
            `${nm[1]} bought some notebooks at $${a} each and one pen for $${b}, spending $${c} in all. How many notebooks did ${nm[1]} buy?`),
          ans: ansNum(n), hint,
          sol: [
            T(`設買了 x 本，列式：${a}x + ${b} = ${c}。`, `Let x be the number of notebooks: ${a}x + ${b} = ${c}.`),
            T(`兩邊減 ${b}：${a}x = ${c - b}。`, `Subtract ${b}: ${a}x = ${c - b}.`),
            T(`兩邊除以 ${a}：x = ${n}。`, `Divide by ${a}: x = ${n}.`),
            T(`驗算：${a} × ${n} + ${b} = ${a * n} + ${b} = ${c} ✓，買了 ${n} 本。`, `Check: ${a} × ${n} + ${b} = ${a * n} + ${b} = ${c} ✓ — ${n} notebooks.`),
          ],
        };
      }
      const a = r.nz(-9, 9); let c; do c = r.nz(-9, 9); while (c === a); const b = r.nz(-20, 20), d = (a - c) * x + b;
      return {
        q: T(`解方程式：${mono(a)} ${sgn(b)} = ${mono(c)} ${sgn(d)}`, `Solve: ${mono(a)} ${sgn(b)} = ${mono(c)} ${sgn(d)}`), ans: ansNum(x, `x = ${x}`), hint,
        sol: [
          T('把含 x 的項移到左邊，常數移到右邊（移項要變號）。', 'Move the x-terms to the left and the numbers to the right (a term changes sign when it crosses the = sign).'),
          T(`${mono(a)} ${c < 0 ? '+' : '−'} ${mono(Math.abs(c))} = ${num(d)} ${sgn(-b)}，即 ${mono(a - c)} = ${num(d - b)}。`, `${mono(a)} ${c < 0 ? '+' : '−'} ${mono(Math.abs(c))} = ${num(d)} ${sgn(-b)}, so ${mono(a - c)} = ${num(d - b)}.`),
          T(`x = ${num(d - b)} ÷ ${par(a - c)} = ${num(x)}。`, `x = ${num(d - b)} ÷ ${par(a - c)} = ${num(x)}.`),
          T(`驗算：左邊 = ${num(a * x + b)}，右邊 = ${num(c * x + d)} ✓`, `Check: left side = ${num(a * x + b)}, right side = ${num(c * x + d)} ✓`),
        ],
      };
    },
  },
  {
    id: 'g7-inequality', grade: 7,
    name: T('一元一次不等式', 'One-variable inequalities'),
    cur: { us: 'CCSS 7.EE.B.4b', tw: '七年級 一元一次不等式', aops: 'Prealgebra' },
    gen(r) {
      const k = r.int(0, 2);
      const hint = T('兩邊同乘或同除以負數時，不等號要反向！', 'When you multiply or divide both sides by a negative number, flip the inequality sign!');
      if (k === 0) {
        const a = r.int(2, 7) * r.sign(), x0 = r.nz(-9, 9), b = r.nz(-15, 15), c = a * x0 + b, op = r.pick(['<', '>', '≤', '≥']), op2 = a < 0 ? FLIP[op] : op;
        const S = (o, v) => `x ${SHOW[o]} ${num(v)}`;
        const t = x0 + (op2 === '>' || op2 === '≥' ? 1 : -1);
        return {
          q: T(`解不等式 ${mono(a)} ${sgn(b)} ${SHOW[op]} ${num(c)}，下列何者正確？`, `Solve ${mono(a)} ${sgn(b)} ${SHOW[op]} ${num(c)}. Which is correct?`),
          ans: choice(S(op2, x0), S(FLIP[op2], x0), S(STRICT[op2], x0), S(op2, -x0)),
          sol: [
            T(`兩邊同時${b > 0 ? `減 ${b}` : `加 ${-b}`}：${mono(a)} ${SHOW[op]} ${num(c - b)}。`, `${b > 0 ? `Subtract ${b} from` : `Add ${-b} to`} both sides: ${mono(a)} ${SHOW[op]} ${num(c - b)}.`),
            a < 0
              ? T(`兩邊同除以 ${par(a)}。因為除以負數，不等號要反向：x ${SHOW[op2]} ${num(x0)}。`, `Divide both sides by ${par(a)}. Dividing by a negative flips the sign: x ${SHOW[op2]} ${num(x0)}.`)
              : T(`兩邊同除以 ${a}（正數，不等號方向不變）：x ${SHOW[op2]} ${num(x0)}。`, `Divide both sides by ${a} (positive, so the sign stays): x ${SHOW[op2]} ${num(x0)}.`),
            T(`驗算：取 x = ${num(t)}，${num(a)} × ${par(t)} ${sgn(b)} = ${num(a * t + b)}，確實 ${SHOW[op]} ${num(c)} ✓`, `Check with x = ${num(t)}: ${num(a)} × ${par(t)} ${sgn(b)} = ${num(a * t + b)}, which is indeed ${SHOW[op]} ${num(c)} ✓`),
          ],
          hint,
        };
      }
      if (k === 1) {
        const a = r.int(2, 6) * r.sign(), b = r.nz(-15, 15); let c; do c = r.int(-30, 30); while ((c - b) % a === 0);
        const op = r.pick(['<', '>', '≤', '≥']), op2 = a < 0 ? FLIP[op] : op, B = (c - b) / a, small = op2 === '>' || op2 === '≥';
        const v = small ? Math.ceil(B) : Math.floor(B);
        return {
          q: T(`滿足 ${mono(a)} ${sgn(b)} ${SHOW[op]} ${num(c)} 的${small ? '最小' : '最大'}整數 x 是多少？`, `What is the ${small ? 'smallest' : 'largest'} integer x with ${mono(a)} ${sgn(b)} ${SHOW[op]} ${num(c)}?`),
          ans: ansNum(v), hint,
          sol: [
            T(`移項：${mono(a)} ${SHOW[op]} ${num(c - b)}。`, `Move the constant: ${mono(a)} ${SHOW[op]} ${num(c - b)}.`),
            T(`除以 ${par(a)}${a < 0 ? '（負數，不等號反向）' : ''}：x ${SHOW[op2]} ${fracR(c - b, a)}，約是 ${num(+B.toFixed(2))}。`, `Divide by ${par(a)}${a < 0 ? ' (negative, so flip the sign)' : ''}: x ${SHOW[op2]} ${fracR(c - b, a)} ≈ ${num(+B.toFixed(2))}.`),
            T(`在數線上，${small ? `比 ${num(+B.toFixed(2))} 大的最小整數` : `比 ${num(+B.toFixed(2))} 小的最大整數`}是 ${num(v)}。`, `On the number line, the ${small ? 'smallest integer above' : 'largest integer below'} ${num(+B.toFixed(2))} is ${num(v)}.`),
            T(`驗算：x = ${num(v)} 時左邊 = ${num(a * v + b)}，成立；x = ${num(small ? v - 1 : v + 1)} 時左邊 = ${num(a * (small ? v - 1 : v + 1) + b)}，不成立。`, `Check: x = ${num(v)} gives ${num(a * v + b)} (works); x = ${num(small ? v - 1 : v + 1)} gives ${num(a * (small ? v - 1 : v + 1) + b)} (fails).`),
          ],
        };
      }
      const nm = who(r);
      if (r.chance(0.5)) {
        const M = r.pick([300, 400, 500, 600, 800, 1000]), b = r.pick([100, 120, 150, 180, 200]), a = r.pick([30, 35, 40, 45, 50, 60, 70]), v = Math.floor((M - b) / a);
        return {
          q: T(`${nm[0]}帶了 ${M} 元去遊樂園，門票 ${b} 元，每玩一項設施要 ${a} 元。${nm[0]}最多可以玩幾項設施？`,
            `${nm[1]} brings $${M} to an amusement park. The entrance costs $${b} and each ride costs $${a}. At most how many rides can ${nm[1]} go on?`),
          ans: ansNum(v), hint: T('「最多」→ 用 ≤ 列不等式。', '"At most" → use ≤.'),
          sol: [
            T(`設玩 x 項，花費不能超過 ${M} 元：${b} + ${a}x ≤ ${M}。`, `Let x be the number of rides. The cost can't exceed $${M}: ${b} + ${a}x ≤ ${M}.`),
            T(`${a}x ≤ ${M - b}，x ≤ ${fracR(M - b, a)}${(M - b) % a ? ` ≈ ${num(+((M - b) / a).toFixed(2))}` : ''}。`, `${a}x ≤ ${M - b}, so x ≤ ${fracR(M - b, a)}${(M - b) % a ? ` ≈ ${num(+((M - b) / a).toFixed(2))}` : ''}.`),
            T(`x 要是整數，所以最多 ${v} 項。`, `x must be a whole number, so at most ${v} rides.`),
            T(`驗算：${b} + ${a} × ${v} = ${b + a * v} ≤ ${M} ✓；再多玩一項要 ${b + a * (v + 1)} 元，超過了。`, `Check: ${b} + ${a} × ${v} = ${b + a * v} ≤ ${M} ✓; one more ride would cost $${b + a * (v + 1)}, too much.`),
          ],
        };
      }
      const p = r.pick([4, 5, 6, 8]), s0 = r.int(20, 50), S = r.int(70, 100), v = Math.ceil((S - s0) / p);
      return {
        q: T(`闖關遊戲中，${nm[0]}已經有 ${s0} 分，之後每答對一題得 ${p} 分。要至少達到 ${S} 分，${nm[0]}至少還要答對幾題？`,
          `In a quiz game ${nm[1]} already has ${s0} points and gets ${p} points for each correct answer. To reach at least ${S} points, at least how many more questions must ${nm[1]} answer correctly?`),
        ans: ansNum(v), hint: T('「至少」→ 用 ≥ 列不等式。', '"At least" → use ≥.'),
        sol: [
          T(`設再答對 x 題：${s0} + ${p}x ≥ ${S}。`, `Let x be the number of correct answers: ${s0} + ${p}x ≥ ${S}.`),
          T(`${p}x ≥ ${S - s0}，x ≥ ${fracR(S - s0, p)}${(S - s0) % p ? ` ≈ ${num(+((S - s0) / p).toFixed(2))}` : ''}。`, `${p}x ≥ ${S - s0}, so x ≥ ${fracR(S - s0, p)}${(S - s0) % p ? ` ≈ ${num(+((S - s0) / p).toFixed(2))}` : ''}.`),
          T(`x 是整數，所以至少 ${v} 題。`, `x is a whole number, so at least ${v}.`),
          T(`驗算：${s0} + ${p} × ${v} = ${s0 + p * v} ≥ ${S} ✓${v > 1 ? `；${v - 1} 題只有 ${s0 + p * (v - 1)} 分，不夠。` : '。'}`, `Check: ${s0} + ${p} × ${v} = ${s0 + p * v} ≥ ${S} ✓${v > 1 ? `; ${v - 1} would give only ${s0 + p * (v - 1)}.` : '.'}`),
        ],
      };
    },
  },
  {
    id: 'g7-proportional', grade: 7,
    name: T('正比與反比', 'Proportional relationships'),
    cur: { us: 'CCSS 7.RP.A.2', tw: '七年級 正比與反比', aops: 'Prealgebra' },
    gen(r) {
      const k = r.int(0, 3);
      if (k === 0) {
        const kk = r.pick([2, 3, 4, 5, 6, 7, 1.5, 2.5, 0.5, 1.2, 3.5]), xs = r.sample([1, 2, 3, 4, 5, 6, 8, 10, 12], 3).sort((a, b) => a - b);
        return {
          q: T('下表中 y 與 x 成正比。比例常數 k（y = kx 中的 k）是多少？', 'In the table, y is proportional to x. What is the constant of proportionality k (in y = kx)?'),
          fig: tbl([['x', ...xs.map(num)], ['y', ...xs.map((x) => num(clean(kk * x)))]]),
          ans: ansNum(kk),
          sol: [
            T('成正比表示 y ÷ x 永遠相同，這個固定的值就是 k。', 'Proportional means y ÷ x is always the same number; that number is k.'),
            T(`${num(clean(kk * xs[0]))} ÷ ${xs[0]} = ${num(kk)}。`, `${num(clean(kk * xs[0]))} ÷ ${xs[0]} = ${num(kk)}.`),
            T(`檢查其他欄：${num(clean(kk * xs[1]))} ÷ ${xs[1]} = ${num(kk)}，${num(clean(kk * xs[2]))} ÷ ${xs[2]} = ${num(kk)} ✓`, `Check the other columns: ${num(clean(kk * xs[1]))} ÷ ${xs[1]} = ${num(kk)}, ${num(clean(kk * xs[2]))} ÷ ${xs[2]} = ${num(kk)} ✓`),
            T(`所以 k = ${num(kk)}，關係式是 y = ${num(kk)}x。`, `So k = ${num(kk)} and y = ${num(kk)}x.`),
          ],
        };
      }
      if (k === 1) {
        const q = r.pick([1, 2, 3, 4, 5]), p = r.int(2, 9); if (gcd(p, q) !== 1) return this.gen(r);
        const x1 = q * r.int(1, 6); let x2; do x2 = q * r.int(1, 10); while (x2 === x1);
        const y1 = (p * x1) / q, y2 = (p * x2) / q, nm = who(r), story = r.int(0, 2);
        const q0 = [
          T(`已知 y 與 x 成正比，且 x = ${x1} 時 y = ${y1}。求 x = ${x2} 時 y 的值。`, `y is proportional to x, and y = ${y1} when x = ${x1}. Find y when x = ${x2}.`),
          T(`${nm[0]}的印表機速度固定，${x1} 分鐘印了 ${y1} 頁。照這個速度，${x2} 分鐘可以印幾頁？`, `${nm[1]}'s printer works at a steady speed and prints ${y1} pages in ${x1} minutes. At this speed, how many pages in ${x2} minutes?`),
          T(`${x1} 公斤的米賣 ${y1 * 10} 元。同樣的單價，${x2} 公斤要多少元？`, `${x1} kg of rice costs $${y1 * 10}. At the same price per kilogram, how much do ${x2} kg cost?`),
        ][story];
        const mul = story === 2 ? 10 : 1;
        return {
          q: q0, ans: ansNum(y2 * mul),
          sol: [
            T('成正比 → y = kx，先求 k。', 'Proportional → y = kx. Find k first.'),
            T(`k = ${y1 * mul} ÷ ${x1} = ${fracR(p * mul, q)}。`, `k = ${y1 * mul} ÷ ${x1} = ${fracR(p * mul, q)}.`),
            T(`y = ${fracR(p * mul, q)} × ${x2} = ${y2 * mul}。`, `y = ${fracR(p * mul, q)} × ${x2} = ${y2 * mul}.`),
            T(`檢查：${x2} 是 ${x1} 的 ${fracR(x2, x1)} 倍，${y2 * mul} 也是 ${y1 * mul} 的 ${fracR(x2, x1)} 倍 ✓`, `Check: ${x2} is ${fracR(x2, x1)} times ${x1}, and ${y2 * mul} is also ${fracR(x2, x1)} times ${y1 * mul} ✓`),
          ],
        };
      }
      if (k === 2) {
        const n1 = r.int(3, 12), d1 = r.int(4, 20), W = n1 * d1, opts = range(2, 30).filter((n) => n !== n1 && W % n === 0);
        if (!opts.length) return this.gen(r);
        const n2 = r.pick(opts), d2 = W / n2;
        return {
          q: T(`${n1} 個工人 ${d1} 天可以蓋好一座涼亭。如果每個人工作速度相同，改派 ${n2} 個工人，要幾天才能蓋好？`,
            `${n1} workers can build a pavilion in ${d1} days. If everyone works at the same speed, how many days would ${n2} workers take?`),
          ans: ansNum(d2),
          sol: [
            T('人越多、天數越少，人數 × 天數 = 總工作量（固定），這是反比。', 'More workers → fewer days. Workers × days = total work (fixed), so this is an inverse proportion.'),
            T(`總工作量：${n1} × ${d1} = ${W}（人・天）。`, `Total work: ${n1} × ${d1} = ${W} worker-days.`),
            T(`${n2} 個人：${W} ÷ ${n2} = ${d2} 天。`, `With ${n2} workers: ${W} ÷ ${n2} = ${d2} days.`),
            T(`檢查：${n2} × ${d2} = ${W} ✓`, `Check: ${n2} × ${d2} = ${W} ✓`),
          ],
        };
      }
      const kk = r.int(2, 9), b = r.int(1, 9);
      return {
        q: T('下列哪一個式子表示「y 與 x 成正比」？', 'Which equation shows that y is proportional to x?'),
        ans: choice(`y = ${kk}x`, `y = ${kk}x + ${b}`, `y = ${fx(kk, 'x')}`, `y = x + ${kk}`),
        sol: [
          T('成正比的關係式一定長成 y = kx（k 不是 0）：y ÷ x 是固定值，而且圖形是通過原點的直線。', 'A proportional relationship always looks like y = kx (k ≠ 0): y ÷ x is constant and the graph is a line through the origin.'),
          T(`y = ${kk}x + ${b}：x = 0 時 y = ${b}，不通過原點，不是正比。`, `y = ${kk}x + ${b}: when x = 0, y = ${b}, so it misses the origin — not proportional.`),
          T(`y = ${fx(kk, 'x')}：x × y = ${kk} 固定，這是反比。`, `y = ${fx(kk, 'x')}: x × y = ${kk} is constant — that's an inverse proportion.`),
          T(`所以答案是 y = ${kk}x，比例常數 ${kk}。`, `So the answer is y = ${kk}x, with constant ${kk}.`),
        ],
      };
    },
  },
  {
    id: 'g7-ratio', grade: 7,
    name: T('比與比例式', 'Ratios and proportions'),
    cur: { us: 'Grade 7 · Ratios & proportional relationships', tw: '七年級 比與比例式', aops: 'Prealgebra' },
    gen(r) {
      const k = r.int(0, 3);
      if (k === 0) {
        let a, b; do { a = r.int(2, 9); b = r.int(2, 12); } while (gcd(a, b) !== 1); const m = r.int(2, 9), c = a * m, x = b * m, flip = r.chance(0.5);
        return {
          q: flip ? T(`解比例式：${c} : x = ${a} : ${b}`, `Solve the proportion: ${c} : x = ${a} : ${b}`) : T(`解比例式：${a} : ${b} = ${c} : x`, `Solve the proportion: ${a} : ${b} = ${c} : x`),
          ans: ansNum(x, `x = ${x}`),
          sol: [
            T('比例式中「外項乘積 = 內項乘積」（交叉相乘）。', 'In a proportion, the product of the outer terms equals the product of the inner terms (cross-multiply).'),
            T(`${a} × x = ${b} × ${c} = ${b * c}。`, `${a} × x = ${b} × ${c} = ${b * c}.`),
            T(`x = ${b * c} ÷ ${a} = ${x}。`, `x = ${b * c} ÷ ${a} = ${x}.`),
            T(`檢查：${c} 是 ${a} 的 ${m} 倍，${x} 也是 ${b} 的 ${m} 倍 ✓`, `Check: ${c} is ${m} times ${a}, and ${x} is ${m} times ${b} ✓`),
          ],
        };
      }
      if (k === 1) {
        const [A, B] = two(r); let a, b; do { a = r.int(1, 9); b = r.int(1, 9); } while (a === b || gcd(a, b) !== 1); const m = r.pick([20, 25, 30, 40, 50, 60, 75, 100]), N = (a + b) * m;
        return {
          q: T(`${A[0]}和${B[0]}一起出錢買了一張樂透，${A[0]}出的錢和${B[0]}出的錢的比是 ${a} : ${b}。中獎 ${N} 元，按出錢比例分，${A[0]}分到多少元？`,
            `${A[1]} and ${B[1]} shared the cost of a prize ticket in the ratio ${a} : ${b}. It won $${N}, split in the same ratio. How much does ${A[1]} get?`),
          ans: ansNum(a * m),
          sol: [
            T(`把獎金分成 ${a} + ${b} = ${a + b} 份。`, `Split the prize into ${a} + ${b} = ${a + b} equal parts.`),
            T(`每份：${N} ÷ ${a + b} = ${m} 元。`, `One part: ${N} ÷ ${a + b} = $${m}.`),
            T(`${A[0]}拿 ${a} 份：${a} × ${m} = ${a * m} 元。`, `${A[1]} gets ${a} parts: ${a} × ${m} = $${a * m}.`),
            T(`檢查：${B[0]}拿 ${b * m} 元，${a * m} + ${b * m} = ${N} ✓`, `Check: ${B[1]} gets $${b * m}, and ${a * m} + ${b * m} = ${N} ✓`),
          ],
        };
      }
      if (k === 2) {
        let a, b, c, d; do { a = r.int(1, 7); b = r.int(2, 8); c = r.int(2, 8); d = r.int(1, 9); } while (gcd(a, b) > 1 || gcd(c, d) > 1 || b === c || a === b);
        const [p, q] = red(a * c, b * d), S = (x, y) => { const [u, v] = red(x, y); return `${u} : ${v}`; };
        const right = `${p} : ${q}`;
        const wrongs = [S(a, d), `${q} : ${p}`, S(a * d, b * c), S(a + c, b + d), S(a * b, c * d)].filter((w) => w !== right);
        return {
          q: T(`已知 x : y = ${a} : ${b}，y : z = ${c} : ${d}，求 x : z（最簡整數比）。`, `If x : y = ${a} : ${b} and y : z = ${c} : ${d}, find x : z in simplest form.`),
          ans: choice(right, ...wrongs),
          sol: [
            T(`兩個比裡的 y 不一樣（${b} 和 ${c}），要先把 y 變成相同的數：${b} 和 ${c} 的最小公倍數是 ${lcm(b, c)}。`, `The y-parts differ (${b} and ${c}), so make them equal first: the LCM of ${b} and ${c} is ${lcm(b, c)}.`),
            T(`x : y = ${a} : ${b} = ${a * lcm(b, c) / b} : ${lcm(b, c)}；y : z = ${c} : ${d} = ${lcm(b, c)} : ${d * lcm(b, c) / c}。`, `x : y = ${a} : ${b} = ${a * lcm(b, c) / b} : ${lcm(b, c)}; y : z = ${c} : ${d} = ${lcm(b, c)} : ${d * lcm(b, c) / c}.`),
            T(`連比 x : y : z = ${a * lcm(b, c) / b} : ${lcm(b, c)} : ${d * lcm(b, c) / c}。`, `So x : y : z = ${a * lcm(b, c) / b} : ${lcm(b, c)} : ${d * lcm(b, c) / c}.`),
            T(`x : z = ${a * lcm(b, c) / b} : ${d * lcm(b, c) / c} = ${right}。`, `x : z = ${a * lcm(b, c) / b} : ${d * lcm(b, c) / c} = ${right}.`),
          ],
        };
      }
      const s = r.pick([10000, 20000, 25000, 50000, 100000, 200000]), L = r.int(2, 12), km = clean((L * s) / 100000);
      return {
        q: T(`一張地圖的比例尺是 1 : ${num(s)}。地圖上兩地相距 ${L} 公分，實際距離是多少公里？`, `A map has scale 1 : ${num(s)}. Two towns are ${L} cm apart on the map. How many kilometers apart are they really?`),
        ans: ansNum(km),
        sol: [
          T(`比例尺 1 : ${num(s)} 表示地圖上 1 公分代表實際 ${num(s)} 公分。`, `Scale 1 : ${num(s)} means 1 cm on the map is ${num(s)} cm in real life.`),
          T(`實際距離：${L} × ${num(s)} = ${num(L * s)} 公分。`, `Real distance: ${L} × ${num(s)} = ${num(L * s)} cm.`),
          T(`1 公里 = 100,000 公分，所以 ${num(L * s)} ÷ 100,000 = ${num(km)} 公里。`, `1 km = 100,000 cm, so ${num(L * s)} ÷ 100,000 = ${num(km)} km.`),
        ],
      };
    },
  },
  {
    id: 'g7-percent', grade: 7,
    name: T('百分率：增減、折扣、稅與小費', 'Percent: change, discount, tax and tip'),
    cur: { us: 'CCSS 7.RP.A.3', tw: '七年級 一元一次方程式的應用（打折、百分率）', aops: 'Prealgebra' },
    gen(r) {
      const k = r.int(0, 4), nm = who(r);
      const zhe = (d) => ((100 - d) % 10 === 0 ? `${(100 - d) / 10}` : `${100 - d}`);
      if (k === 0) {
        let a, p, up, b; do { a = r.pick([20, 25, 40, 50, 80, 120, 150, 200, 250, 400, 500, 800]); p = r.pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75]); up = r.chance(0.5); b = clean(a * (1 + (up ? p : -p) / 100)); } while (!Number.isInteger(b));
        const item = r.pick([['社團人數', 'club members', ''], ['一雙球鞋的價格', 'the price of sneakers', '$'], ['網站每日的訪客', 'daily website visitors', '']]);
        return {
          q: T(`${item[0]}從 ${num(a)} 變成 ${num(b)}。這是增加還是減少了百分之多少？請回答百分比的數字（例如 20 表示 20%）。`, `${item[2] ? 'The price of sneakers' : item[1][0].toUpperCase() + item[1].slice(1)} went from ${item[2]}${num(a)} to ${item[2]}${num(b)}. By what percent did it ${up ? 'increase' : 'decrease'}? (Type the number, e.g. 20 for 20%.)`),
          ans: ansNum(p),
          sol: [
            T('百分率變化 = 變化量 ÷ 原來的量 × 100%（一定要除以「原來」的量）。', 'Percent change = amount of change ÷ ORIGINAL amount × 100%.'),
            T(`變化量：${num(Math.max(a, b))} − ${num(Math.min(a, b))} = ${num(Math.abs(b - a))}，是${up ? '增加' : '減少'}。`, `Change: ${num(Math.max(a, b))} − ${num(Math.min(a, b))} = ${num(Math.abs(b - a))}, ${up ? 'an increase' : 'a decrease'}.`),
            T(`${num(Math.abs(b - a))} ÷ ${num(a)} = ${num(p / 100)} = ${p}%。`, `${num(Math.abs(b - a))} ÷ ${num(a)} = ${num(p / 100)} = ${p}%.`),
            T(`${up ? '增加' : '減少'}了 ${p}%。檢查：${num(a)} × ${num(1 + (up ? p : -p) / 100)} = ${num(b)} ✓`, `It ${up ? 'increased' : 'decreased'} by ${p}%. Check: ${num(a)} × ${num(clean(1 + (up ? p : -p) / 100))} = ${num(b)} ✓`),
          ],
        };
      }
      if (k === 1) {
        const d = r.pick([10, 15, 20, 25, 30, 40]), p = r.int(5, 60) * 20, s = (p * (100 - d)) / 100;
        const item = r.pick([['件外套', 'jacket'], ['副耳機', 'pair of headphones'], ['個書包', 'backpack'], ['支球拍', 'racket']]);
        return {
          q: T(`一${item[0]}原價 ${num(p)} 元，現在打 ${zhe(d)} 折（也就是便宜 ${d}%）。現在賣多少元？`, `A ${item[1]} costs $${num(p)}. It is on sale for ${d}% off. What is the sale price in dollars?`),
          ans: ansNum(s),
          sol: [
            T(`便宜 ${d}% 表示只要付原價的 100% − ${d}% = ${100 - d}%（打 ${zhe(d)} 折）。`, `${d}% off means you pay 100% − ${d}% = ${100 - d}% of the price.`),
            T(`${num(p)} × ${num((100 - d) / 100)} = ${num(s)}。`, `${num(p)} × ${num((100 - d) / 100)} = ${num(s)}.`),
            T(`另一種算法：折扣 ${num(p)} × ${num(d / 100)} = ${num(p - s)}，${num(p)} − ${num(p - s)} = ${num(s)} ✓`, `Another way: discount ${num(p)} × ${num(d / 100)} = ${num(p - s)}, and ${num(p)} − ${num(p - s)} = ${num(s)} ✓`),
          ],
        };
      }
      if (k === 2) {
        const m = r.int(2, 12) * 20, t = r.pick([5, 8, 10]), p = r.pick([10, 15, 20]), tax = clean((m * t) / 100), tip = clean((m * p) / 100), tot = clean(m + tax + tip);
        return {
          q: T(`${nm[0]}一家人在餐廳吃飯，餐點 ${m} 元。另外要加 ${t}% 的稅和 ${p}% 的小費（兩者都用餐點原價計算）。一共要付多少元？`,
            `${nm[1]}'s family eats at a restaurant. The food costs $${m}. They add ${t}% tax and a ${p}% tip, both on the food price. What is the total in dollars?`),
          ans: ansNum(tot),
          sol: [
            T(`稅：${m} × ${t}% = ${m} × ${num(t / 100)} = ${num(tax)}。`, `Tax: ${m} × ${t}% = ${m} × ${num(t / 100)} = ${num(tax)}.`),
            T(`小費：${m} × ${p}% = ${num(tip)}。`, `Tip: ${m} × ${p}% = ${num(tip)}.`),
            T(`總共：${m} + ${num(tax)} + ${num(tip)} = ${num(tot)}。`, `Total: ${m} + ${num(tax)} + ${num(tip)} = ${num(tot)}.`),
            T(`快速檢查：${m} × ${num(1 + (t + p) / 100)} = ${num(tot)} ✓`, `Quick check: ${m} × ${num(clean(1 + (t + p) / 100))} = ${num(tot)} ✓`),
          ],
        };
      }
      if (k === 3) {
        const d = r.pick([10, 20, 25, 30, 40, 50]), p = r.int(3, 40) * 20, s = (p * (100 - d)) / 100;
        if (!Number.isInteger(s)) return this.gen(r);
        return {
          q: T(`${nm[0]}買了一雙打 ${zhe(d)} 折（便宜 ${d}%）的球鞋，付了 ${num(s)} 元。這雙球鞋的原價是多少元？`, `${nm[1]} bought sneakers at ${d}% off and paid $${num(s)}. What was the original price in dollars?`),
          ans: ansNum(p),
          sol: [
            T(`便宜 ${d}% → 付的是原價的 ${100 - d}%。設原價 x 元：${num((100 - d) / 100)}x = ${num(s)}。`, `${d}% off → the price paid is ${100 - d}% of the original. Let x be the original: ${num((100 - d) / 100)}x = ${num(s)}.`),
            T(`x = ${num(s)} ÷ ${num((100 - d) / 100)} = ${num(p)}。`, `x = ${num(s)} ÷ ${num((100 - d) / 100)} = ${num(p)}.`),
            T(`常見錯誤：用 ${num(s)} 加上 ${num(s)} 的 ${d}%，會得到 ${num(clean(s * (1 + d / 100)))}，不對！折扣是以原價計算的。`, `Common mistake: adding ${d}% of ${num(s)} gives ${num(clean(s * (1 + d / 100)))} — wrong, because the discount was taken from the original price.`),
            T(`驗算：${num(p)} × ${num((100 - d) / 100)} = ${num(s)} ✓`, `Check: ${num(p)} × ${num((100 - d) / 100)} = ${num(s)} ✓`),
          ],
        };
      }
      const c = r.int(2, 20) * 50, up = r.pick([20, 30, 40, 50, 60]), off = r.pick([10, 20, 25]), mark = (c * (100 + up)) / 100, sell = clean((mark * (100 - off)) / 100);
      return {
        q: T(`商店進貨一台電風扇成本 ${num(c)} 元，先按成本加價 ${up}% 標價，週年慶再打 ${zhe(off)} 折（便宜 ${off}%）賣出。售價是多少元？`,
          `A shop pays $${num(c)} for a fan. It marks the price up ${up}% above cost, then sells it at ${off}% off during a sale. What is the selling price in dollars?`),
        ans: ansNum(sell),
        sol: [
          T(`標價：${num(c)} × (1 + ${num(up / 100)}) = ${num(c)} × ${num(1 + up / 100)} = ${num(mark)}。`, `Marked price: ${num(c)} × (1 + ${num(up / 100)}) = ${num(c)} × ${num(clean(1 + up / 100))} = ${num(mark)}.`),
          T(`打折：${num(mark)} × ${num((100 - off) / 100)} = ${num(sell)}。`, `Sale: ${num(mark)} × ${num((100 - off) / 100)} = ${num(sell)}.`),
          T(`注意：不能直接算「加 ${up}% 再減 ${off}%＝加 ${up - off}%」，因為兩次百分比的基準不同。`, `Careful: "+${up}% then −${off}%" is NOT the same as "+${up - off}%", because the two percents are of different amounts.`),
          T(`售價 ${num(sell)} 元，利潤 ${num(clean(sell - c))} 元。`, `Selling price $${num(sell)}; profit $${num(clean(sell - c))}.`),
        ],
      };
    },
  },
  {
    id: 'g7-simple-interest', grade: 7,
    name: T('單利息', 'Simple interest'),
    cur: { us: 'CCSS 7.RP.A.3', aops: 'Prealgebra' },
    gen(r) {
      const k = r.int(0, 3), nm = who(r), Pp = r.pick([1000, 2000, 2500, 4000, 5000, 8000, 10000, 12000, 20000, 50000]), rt = r.pick([1, 1.5, 2, 2.5, 3, 4, 5, 6]), t = r.int(2, 6), I = clean((Pp * rt * t) / 100);
      const f = T('單利公式：利息 I = 本金 P × 年利率 r × 年數 t。', 'Simple interest: I = P × r × t (principal × yearly rate × years).');
      if (k === 0 || k === 1) {
        const total = clean(Pp + I);
        return {
          q: k === 0
            ? T(`${nm[0]}把 ${num(Pp)} 元存進銀行，年利率 ${num(rt)}%，以單利計算。${t} 年後可以得到多少元利息？`, `${nm[1]} deposits $${num(Pp)} at ${num(rt)}% simple interest per year. How much interest is earned after ${t} years?`)
            : T(`${nm[0]}把 ${num(Pp)} 元存進銀行，年利率 ${num(rt)}%，以單利計算。${t} 年後本金加利息（本利和）共有多少元？`, `${nm[1]} deposits $${num(Pp)} at ${num(rt)}% simple interest per year. What is the total (principal + interest) after ${t} years?`),
          ans: ansNum(k === 0 ? I : total),
          sol: [
            f,
            T(`${num(rt)}% = ${num(rt / 100)}。`, `${num(rt)}% = ${num(rt / 100)}.`),
            T(`一年的利息：${num(Pp)} × ${num(rt / 100)} = ${num(clean((Pp * rt) / 100))}；${t} 年：${num(clean((Pp * rt) / 100))} × ${t} = ${num(I)}。`, `One year: ${num(Pp)} × ${num(rt / 100)} = ${num(clean((Pp * rt) / 100))}; ${t} years: ${num(clean((Pp * rt) / 100))} × ${t} = ${num(I)}.`),
            k === 0 ? T(`利息是 ${num(I)} 元。`, `The interest is $${num(I)}.`) : T(`本利和：${num(Pp)} + ${num(I)} = ${num(total)} 元。`, `Total: ${num(Pp)} + ${num(I)} = $${num(total)}.`),
          ],
        };
      }
      if (k === 2) {
        return {
          q: T(`本金 ${num(Pp)} 元存 ${t} 年，單利計算共得利息 ${num(I)} 元。年利率是百分之多少？（回答數字，例如 3 表示 3%）`, `$${num(Pp)} earns $${num(I)} of simple interest in ${t} years. What is the yearly interest rate? (Type the number, e.g. 3 for 3%.)`),
          ans: ansNum(rt),
          sol: [
            f,
            T(`每年的利息：${num(I)} ÷ ${t} = ${num(clean(I / t))}。`, `Interest per year: ${num(I)} ÷ ${t} = ${num(clean(I / t))}.`),
            T(`年利率：${num(clean(I / t))} ÷ ${num(Pp)} = ${num(rt / 100)} = ${num(rt)}%。`, `Rate: ${num(clean(I / t))} ÷ ${num(Pp)} = ${num(rt / 100)} = ${num(rt)}%.`),
            T(`驗算：${num(Pp)} × ${num(rt / 100)} × ${t} = ${num(I)} ✓`, `Check: ${num(Pp)} × ${num(rt / 100)} × ${t} = ${num(I)} ✓`),
          ],
        };
      }
      return {
        q: T(`本金 ${num(Pp)} 元，年利率 ${num(rt)}%，單利計算。要存幾年，利息才會達到 ${num(I)} 元？`, `$${num(Pp)} is invested at ${num(rt)}% simple interest per year. How many years until the interest reaches $${num(I)}?`),
        ans: ansNum(t),
        sol: [
          f,
          T(`一年的利息：${num(Pp)} × ${num(rt / 100)} = ${num(clean((Pp * rt) / 100))} 元。`, `Interest per year: ${num(Pp)} × ${num(rt / 100)} = $${num(clean((Pp * rt) / 100))}.`),
          T(`年數：${num(I)} ÷ ${num(clean((Pp * rt) / 100))} = ${t}。`, `Years: ${num(I)} ÷ ${num(clean((Pp * rt) / 100))} = ${t}.`),
          T(`答案：${t} 年。`, `Answer: ${t} years.`),
        ],
      };
    },
  },
  {
    id: 'g7-angles', grade: 7,
    name: T('餘角、補角與對頂角', 'Complementary, supplementary and vertical angles'),
    cur: { us: 'CCSS 7.G.B.5', tw: '七年級 角的關係（餘角、補角、對頂角）', aops: 'Prealgebra' },
    gen(r) {
      const k = r.int(0, 4);
      if (k === 0) {
        const a = r.int(8, 82), comp = r.chance(0.5), v = comp ? 90 - a : 180 - a;
        return {
          q: comp ? T(`一個角是 ${a}°，它的餘角是幾度？`, `An angle measures ${a}°. What is its complement, in degrees?`) : T(`一個角是 ${a}°，它的補角是幾度？`, `An angle measures ${a}°. What is its supplement, in degrees?`),
          fig: comp ? rightAngleFig(a, deg(a), '?') : rayFig(a, deg(a), '?'),
          ans: ansNum(v),
          sol: [
            comp ? T('兩角相加等於 90°，就互為餘角。', 'Two angles are complementary when they add up to 90°.') : T('兩角相加等於 180°，就互為補角（合起來是一直線）。', 'Two angles are supplementary when they add up to 180° (together they make a straight line).'),
            T(`${comp ? 90 : 180}° − ${a}° = ${v}°。`, `${comp ? 90 : 180}° − ${a}° = ${v}°.`),
            T(`檢查：${a}° + ${v}° = ${comp ? 90 : 180}° ✓`, `Check: ${a}° + ${v}° = ${comp ? 90 : 180}° ✓`),
          ],
          hint: T('餘角湊 90°，補角湊 180°。', 'Complement → 90°, supplement → 180°.'),
        };
      }
      if (k === 1) {
        const th = r.int(25, 155), given = r.int(0, 3), ask = r.pick([0, 1, 2, 3].filter((i) => i !== given));
        const vals = [th, 180 - th, th, 180 - th], labels = ['1', '2', '3', '4'].map((s, i) => (i === given ? deg(vals[i]) : i === ask ? '?' : `∠${s}`));
        const vert = (given + 2) % 4 === ask;
        return {
          q: T(`兩直線相交如圖，已知 ∠${given + 1} = ${vals[given]}°，求 ∠${ask + 1}（標「?」的角）是幾度？`, `Two lines cross as shown. ∠${given + 1} = ${vals[given]}°. Find ∠${ask + 1} (marked "?"), in degrees.`),
          fig: xFig(th, labels, given), ans: ansNum(vals[ask]),
          sol: vert
            ? [T(`∠${given + 1} 和 ∠${ask + 1} 是對頂角（面對面的兩個角）。`, `∠${given + 1} and ∠${ask + 1} are vertical angles (they face each other).`), T('對頂角相等。', 'Vertical angles are equal.'), T(`所以 ∠${ask + 1} = ${vals[ask]}°。`, `So ∠${ask + 1} = ${vals[ask]}°.`)]
            : [T(`∠${given + 1} 和 ∠${ask + 1} 相鄰，合起來是一條直線，所以互補（和為 180°）。`, `∠${given + 1} and ∠${ask + 1} are next to each other on a straight line, so they are supplementary (sum 180°).`), T(`∠${ask + 1} = 180° − ${vals[given]}° = ${vals[ask]}°。`, `∠${ask + 1} = 180° − ${vals[given]}° = ${vals[ask]}°.`), T(`檢查：${vals[given]}° + ${vals[ask]}° = 180° ✓`, `Check: ${vals[given]}° + ${vals[ask]}° = 180° ✓`)],
        };
      }
      if (k === 2 || k === 3) {
        const tot = k === 2 ? 180 : 90;
        let a, b, c, d, x, A1, A2;
        do { x = r.int(4, 30); a = r.int(1, 6); c = r.int(1, 6); b = r.int(-20, 30); A1 = a * x + b; A2 = tot - A1; d = A2 - c * x; } while (A1 < 12 || A2 < 12 || a === c || d === 0 || b === 0);
        const e1 = poly([a, b]), e2 = poly([c, d]);
        return {
          q: k === 2 ? T(`如圖，兩個角合起來是一直線，分別是 (${e1})° 和 (${e2})°。求 x。`, `In the figure, two angles together form a straight line: (${e1})° and (${e2})°. Find x.`)
            : T(`如圖，直角被分成兩個角：(${e1})° 和 (${e2})°。求 x。`, `In the figure, a right angle is split into two angles: (${e1})° and (${e2})°. Find x.`),
          fig: k === 2 ? rayFig(A1, `(${e1})°`, `(${e2})°`) : rightAngleFig(A1, `(${e1})°`, `(${e2})°`),
          ans: ansNum(x, `x = ${x}`),
          sol: [
            T(`兩角的和是 ${tot}°：(${e1}) + (${e2}) = ${tot}。`, `The two angles add to ${tot}°: (${e1}) + (${e2}) = ${tot}.`),
            T(`合併同類項：${poly([a + c, b + d])} = ${tot}。`, `Combine like terms: ${poly([a + c, b + d])} = ${tot}.`),
            T(`${mono(a + c)} = ${tot - b - d}，x = ${x}。`, `${mono(a + c)} = ${tot - b - d}, so x = ${x}.`),
            T(`檢查：兩角是 ${A1}° 和 ${A2}°，和為 ${tot}° ✓`, `Check: the angles are ${A1}° and ${A2}°, which add to ${tot}° ✓`),
          ],
        };
      }
      const [m, x] = r.pick([[3, 45], [4, 60], [7, 75], [10, 80], [2.5, 30], [5.5, 70]]);
      return {
        q: T(`一個角的補角是它的餘角的 ${num(m)} 倍。這個角是幾度？`, `The supplement of an angle is ${num(m)} times its complement. What is the angle, in degrees?`),
        ans: ansNum(x),
        sol: [
          T('設這個角是 x°，補角 = 180 − x，餘角 = 90 − x。', 'Let the angle be x°. Its supplement is 180 − x and its complement is 90 − x.'),
          T(`列式：180 − x = ${num(m)}(90 − x)。`, `Equation: 180 − x = ${num(m)}(90 − x).`),
          T(`展開：180 − x = ${num(m * 90)} − ${num(m)}x，移項：${num(m)}x − x = ${num(m * 90)} − 180，${num(m - 1)}x = ${num(m * 90 - 180)}。`, `Expand: 180 − x = ${num(m * 90)} − ${num(m)}x. Rearrange: ${num(m)}x − x = ${num(m * 90)} − 180, so ${num(m - 1)}x = ${num(m * 90 - 180)}.`),
          T(`x = ${x}。檢查：補角 ${180 - x}°，餘角 ${90 - x}°，${90 - x} × ${num(m)} = ${180 - x} ✓`, `x = ${x}. Check: supplement ${180 - x}°, complement ${90 - x}°, and ${90 - x} × ${num(m)} = ${180 - x} ✓`),
        ],
      };
    },
  },
  {
    id: 'g7-circle', grade: 7,
    name: T('圓周長與圓面積', 'Circumference and area of circles'),
    cur: { us: 'CCSS 7.G.B.4', tw: '六年級 圓周長與圓面積', aops: 'Prealgebra' },
    at: { tw: 6 },
    gen(r) {
      const k = r.int(0, 4), rr = r.int(2, 15);
      const area = T('圓面積 = π × 半徑 × 半徑 = πr²。', 'Area of a circle = π × radius × radius = πr².'), circ = T('圓周長 = 2 × π × 半徑 = πd（d 是直徑）。', 'Circumference = 2 × π × radius = πd (d = diameter).');
      if (k === 0) return {
        q: T(`一個圓的半徑是 ${rr} 公分，面積是多少平方公分？（用 π 表示）`, `A circle has radius ${rr} cm. What is its area in cm²? (Leave your answer in terms of π.)`),
        fig: circle(`r = ${rr}`), ans: piAns(rr * rr),
        sol: [area, T(`${rr} × ${rr} = ${rr * rr}，所以面積 = ${piT(rr * rr)} 平方公分。`, `${rr} × ${rr} = ${rr * rr}, so the area is ${piT(rr * rr)} cm².`), T(`（約 ${num(clean(rr * rr * 3.14, 2))} 平方公分，用 π ≈ 3.14）`, `(About ${num(clean(rr * rr * 3.14, 2))} cm², using π ≈ 3.14.)`)],
      };
      if (k === 1) {
        const d = 2 * rr;
        return {
          q: T(`一個圓的直徑是 ${d} 公尺，圓周長是多少公尺？（用 π 表示）`, `A circle has diameter ${d} m. What is its circumference in meters? (Leave your answer in terms of π.)`),
          fig: circle(`d = ${d}`, true), ans: piAns(d),
          sol: [circ, T(`周長 = π × ${d} = ${piT(d)} 公尺。`, `Circumference = π × ${d} = ${piT(d)} m.`), T(`注意：題目給的是直徑，不要再乘 2 了。`, `Careful: this is the diameter already, so don't multiply by 2 again.`)],
        };
      }
      if (k === 2) return {
        q: T(`一個圓的圓周長是 ${piT(2 * rr)} 公分，它的面積是多少平方公分？（用 π 表示）`, `A circle's circumference is ${piT(2 * rr)} cm. What is its area in cm²? (In terms of π.)`),
        ans: piAns(rr * rr),
        sol: [T('先由周長求半徑，再算面積。', 'Find the radius from the circumference, then the area.'), T(`2πr = ${piT(2 * rr)} → r = ${2 * rr} ÷ 2 = ${rr}。`, `2πr = ${piT(2 * rr)} → r = ${2 * rr} ÷ 2 = ${rr}.`), T(`面積 = π × ${rr}² = ${piT(rr * rr)} 平方公分。`, `Area = π × ${rr}² = ${piT(rr * rr)} cm².`)],
      };
      if (k === 3) {
        const nm = who(r), d = r.pick([50, 60, 70, 80]), n = r.int(5, 40);
        return {
          q: T(`${nm[0]}的腳踏車輪子直徑 ${d} 公分。輪子滾了 ${n} 圈，腳踏車前進了多少公分？（以 π ≈ 3.14 計算）`, `${nm[1]}'s bike wheel has diameter ${d} cm. The wheel turns ${n} times. How many centimeters does the bike move? (Use π ≈ 3.14.)`),
          fig: circle(`d = ${d}`, true), ans: ansNum(clean(3.14 * d * n)),
          sol: [T('輪子滾一圈，前進的距離就是一個圓周長。', 'One full turn moves the bike forward one circumference.'), T(`一圈：3.14 × ${d} = ${num(clean(3.14 * d))} 公分。`, `One turn: 3.14 × ${d} = ${num(clean(3.14 * d))} cm.`), T(`${n} 圈：${num(clean(3.14 * d))} × ${n} = ${num(clean(3.14 * d * n))} 公分。`, `${n} turns: ${num(clean(3.14 * d))} × ${n} = ${num(clean(3.14 * d * n))} cm.`)],
        };
      }
      const half = r.chance(0.5);
      return {
        q: half ? T(`一個半圓的半徑是 ${rr} 公分，它的面積是多少平方公分？（以 π ≈ 3.14 計算）`, `A semicircle has radius ${rr} cm. What is its area in cm²? (Use π ≈ 3.14.)`)
          : T(`一個圓的面積是 ${piT(rr * rr)} 平方公尺，它的半徑是多少公尺？`, `A circle has area ${piT(rr * rr)} m². What is its radius in meters?`),
        ans: half ? ansNum(clean((3.14 * rr * rr) / 2)) : ansNum(rr),
        sol: half
          ? [area, T(`整個圓：3.14 × ${rr} × ${rr} = ${num(clean(3.14 * rr * rr))}。`, `Whole circle: 3.14 × ${rr} × ${rr} = ${num(clean(3.14 * rr * rr))}.`), T(`半圓是一半：${num(clean(3.14 * rr * rr))} ÷ 2 = ${num(clean((3.14 * rr * rr) / 2))} 平方公分。`, `A semicircle is half: ${num(clean(3.14 * rr * rr))} ÷ 2 = ${num(clean((3.14 * rr * rr) / 2))} cm².`)]
          : [area, T(`πr² = ${piT(rr * rr)} → r² = ${rr * rr}。`, `πr² = ${piT(rr * rr)} → r² = ${rr * rr}.`), T(`哪個正數自己乘自己是 ${rr * rr}？${rr} × ${rr} = ${rr * rr}，所以 r = ${rr} 公尺。`, `Which positive number times itself is ${rr * rr}? ${rr} × ${rr} = ${rr * rr}, so r = ${rr} m.`)],
      };
    },
  },
  {
    id: 'g7-probability', grade: 7,
    name: T('簡單機率', 'Simple probability'),
    cur: { us: 'CCSS 7.SP.C.5–7', tw: '九年級 機率', aops: 'Intro Counting & Probability' },
    at: { tw: 9 },
    gen(r) {
      const k = r.int(0, 3);
      if (k === 0) {
        const R = r.int(1, 9), B = r.int(1, 9), G = r.int(0, 6), N = R + B + G, c = r.pick(['r', 'b', 'notr']);
        const fav = c === 'r' ? R : c === 'b' ? B : N - R, [n, d] = red(fav, N);
        const what = c === 'r' ? ['紅球', 'a red marble'] : c === 'b' ? ['藍球', 'a blue marble'] : ['不是紅球', 'a marble that is NOT red'];
        return {
          q: T(`袋子裡有 ${R} 顆紅球、${B} 顆藍球${G ? `、${G} 顆綠球` : ''}。隨機摸出一顆，摸到${what[0]}的機率是多少？（用最簡分數）`, `A bag has ${R} red, ${B} blue${G ? ` and ${G} green` : ''} marbles. One is drawn at random. What is the probability of drawing ${what[1]}? (Lowest terms.)`),
          ans: ansFrac(n, d),
          sol: [
            T('機率 = 有利的結果數 ÷ 所有可能的結果數（每顆球被摸到的機會一樣）。', 'Probability = favorable outcomes ÷ all possible outcomes (each marble is equally likely).'),
            T(`全部共 ${R} + ${B}${G ? ` + ${G}` : ''} = ${N} 顆。`, `There are ${R} + ${B}${G ? ` + ${G}` : ''} = ${N} marbles in all.`),
            c === 'notr' ? T(`不是紅球的有 ${N} − ${R} = ${fav} 顆。`, `Not red: ${N} − ${R} = ${fav} marbles.`) : T(`符合的有 ${fav} 顆。`, `Favorable: ${fav} marbles.`),
            T(`機率 = ${eqR(fav, N)}。`, `Probability = ${eqR(fav, N)}.`),
          ],
        };
      }
      if (k === 1) {
        const evs = [
          ['點數是質數', 'a prime number', [2, 3, 5]], ['點數是偶數', 'an even number', [2, 4, 6]], ['點數是 3 的倍數', 'a multiple of 3', [3, 6]],
          ['點數大於 4', 'a number greater than 4', [5, 6]], ['點數小於 3', 'a number less than 3', [1, 2]], ['點數是 6 的因數', 'a factor of 6', [1, 2, 3, 6]], ['點數不是 1', 'a number other than 1', [2, 3, 4, 5, 6]],
          ['點數是奇數', 'an odd number', [1, 3, 5]], ['點數至少是 2', 'at least 2', [2, 3, 4, 5, 6]], ['點數是 4 的因數', 'a factor of 4', [1, 2, 4]],
        ];
        const [zh, en, L] = r.pick(evs), [n, d] = red(L.length, 6);
        return {
          q: T(`擲一顆公正的骰子，${zh}${/\d$/.test(zh) ? ' ' : ''}的機率是多少？（用最簡分數）`, `A fair die is rolled. What is the probability of rolling ${en}? (Lowest terms.)`),
          ans: ansFrac(n, d),
          sol: [
            T('骰子有 1～6 共 6 種結果，每種機會相同。', 'A die has 6 equally likely outcomes: 1 to 6.'),
            T(`符合的有：${L.join('、')}，共 ${L.length} 種。`, `Favorable outcomes: ${L.join(', ')} — that's ${L.length}.`),
            T(`機率 = ${eqR(L.length, 6)}。`, `Probability = ${eqR(L.length, 6)}.`),
          ],
        };
      }
      if (k === 2) {
        const N = r.pick([20, 24, 30, 36, 40, 50, 60]), m = r.pick([3, 4, 5, 6, 7]), cnt = Math.floor(N / m), [n, d] = red(cnt, N);
        return {
          q: T(`從寫著 1 到 ${N} 的 ${N} 張卡片中隨機抽一張，抽到 ${m} 的倍數的機率是多少？（用最簡分數）`, `One card is drawn at random from ${N} cards numbered 1 to ${N}. What is the probability that the number is a multiple of ${m}? (Lowest terms.)`),
          ans: ansFrac(n, d),
          sol: [
            T(`1～${N} 中 ${m} 的倍數：${m}, ${2 * m}, …, ${cnt * m}。`, `Multiples of ${m} from 1 to ${N}: ${m}, ${2 * m}, …, ${cnt * m}.`),
            T(`個數：${N} ÷ ${m} = ${num(clean(N / m, 2))}，取整數部分是 ${cnt} 個。`, `How many: ${N} ÷ ${m} = ${num(clean(N / m, 2))}; the whole-number part is ${cnt}.`),
            T(`機率 = ${eqR(cnt, N)}。`, `Probability = ${eqR(cnt, N)}.`),
          ],
        };
      }
      const nm = who(r), sec = r.pick([4, 5, 6, 8, 10]), win = r.int(1, sec - 1), n = sec * r.int(5, 30), exp = (win * n) / sec, [p, q] = red(win, sec);
      return {
        q: T(`一個轉盤平分成 ${sec} 格，其中 ${win} 格是「得獎」。${nm[0]}轉了 ${n} 次，預期大約會得獎幾次？`, `A spinner has ${sec} equal sections, ${win} of which say "WIN". ${nm[1]} spins it ${n} times. About how many wins should ${nm[1]} expect?`),
        ans: ansNum(exp),
        sol: [
          T(`每轉一次得獎的機率 = ${frac(win, sec)}${gcd(win, sec) > 1 ? ` = ${fracR(p, q)}` : ''}。`, `The chance of a win on each spin is ${frac(win, sec)}${gcd(win, sec) > 1 ? ` = ${fracR(p, q)}` : ''}.`),
          T(`預期次數 = 機率 × 次數 = ${fracR(p, q)} × ${n} = ${exp}。`, `Expected wins = probability × number of spins = ${fracR(p, q)} × ${n} = ${exp}.`),
          T('實際轉的時候可能多一點或少一點，但大約是這個數。', 'The real count may be a bit more or less, but it should be close to this.'),
        ],
      };
    },
  },
  {
    id: 'g7-sci-notation', grade: 7,
    name: T('科學記號', 'Scientific notation'),
    cur: { us: 'CCSS 8.EE.A.3–4', tw: '七年級 科學記號', aops: 'Prealgebra' },
    at: { us: 8 },
    gen(r) {
      const k = r.int(0, 3), c = r.int(11, 99) / 10;
      const rule = T('科學記號寫成 a × 10ⁿ，其中 1 ≤ a < 10，n 是整數。', 'Scientific notation is a × 10ⁿ with 1 ≤ a < 10 and n an integer.');
      if (k === 0) {
        const e = r.int(4, 9), N = Math.round(c * 10 ** e);
        return {
          q: T(`把 ${num(N)} 寫成科學記號。`, `Write ${num(N)} in scientific notation.`),
          ans: choice(sci(c, e), sci(c, e - 1), sci(c, e + 1), sci(clean(c * 10), e - 1)),
          sol: [rule, T(`把小數點往左移，直到前面只剩一位非零數字：${num(c)}。`, `Move the decimal point left until one nonzero digit is in front: ${num(c)}.`), T(`小數點往左移了 ${e} 位，所以指數是 ${e}。`, `It moved ${e} places left, so the exponent is ${e}.`), T(`${num(N)} = ${sci(c, e)}。（${num(clean(c * 10))} × 10<sup>${e - 1}</sup> 雖然值一樣，但 ${num(clean(c * 10))} 不在 1 到 10 之間，不是科學記號。）`, `${num(N)} = ${sci(c, e)}. (${num(clean(c * 10))} × 10<sup>${e - 1}</sup> has the same value, but ${num(clean(c * 10))} is not between 1 and 10.)`)],
        };
      }
      if (k === 1) {
        const e = r.int(3, 8), s = (c / 10 ** e).toFixed(e + 1);
        return {
          q: T(`把 ${s} 寫成科學記號。`, `Write ${s} in scientific notation.`),
          ans: choice(sci(c, -e), sci(c, -(e - 1)), sci(c, -(e + 1)), sci(c, e)),
          sol: [rule, T(`把小數點往右移，直到變成 ${num(c)}。`, `Move the decimal point right until you get ${num(c)}.`), T(`往右移了 ${e} 位，數變大了，所以要乘 10<sup>−${e}</sup> 把它變回來。`, `It moved ${e} places right (the number got bigger), so multiply by 10<sup>−${e}</sup> to undo that.`), T(`${s} = ${sci(c, -e)}。`, `${s} = ${sci(c, -e)}.`)],
        };
      }
      if (k === 2) {
        let a, b; do { a = r.int(2, 9); b = r.int(2, 9); } while (a * b < 10);
        const m = r.int(-6, 9), n = r.int(-6, 9), p = a * b, pc = clean(p / 10);
        return {
          q: T(`計算 (${sci(a, m)}) × (${sci(b, n)})，並用科學記號表示。`, `Compute (${sci(a, m)}) × (${sci(b, n)}) and write the answer in scientific notation.`),
          ans: choice(sci(pc, m + n + 1), sci(pc, m + n), sci(p, m + n), sci(pc, m * n + 1), sci(pc, m + n - 1)),
          sol: [T('前面的數相乘，10 的次方相乘（指數相加）。', 'Multiply the front numbers; multiply the powers of 10 by adding exponents.'), T(`${a} × ${b} = ${p}；10<sup>${num(m)}</sup> × 10<sup>${num(n)}</sup> = 10<sup>${num(m + n)}</sup>。`, `${a} × ${b} = ${p}; 10<sup>${num(m)}</sup> × 10<sup>${num(n)}</sup> = 10<sup>${num(m + n)}</sup>.`), T(`得到 ${sci(p, m + n)}，但 ${p} ≥ 10，要調整：${p} = ${num(pc)} × 10。`, `That gives ${sci(p, m + n)}, but ${p} ≥ 10, so adjust: ${p} = ${num(pc)} × 10.`), T(`答案：${sci(pc, m + n + 1)}。`, `Answer: ${sci(pc, m + n + 1)}.`)],
        };
      }
      const e = r.int(3, 9), N = Math.round(c * 10 ** e), small = r.chance(0.4);
      const s = small ? (c / 10 ** e).toFixed(e + 1) : num(N);
      return {
        q: T(`${s} = ${num(c)} × 10<sup>n</sup>，求 n。`, `${s} = ${num(c)} × 10<sup>n</sup>. Find n.`),
        ans: ansNum(small ? -e : e),
        sol: [T(`從 ${num(c)} 變成 ${s}，小數點要往${small ? '左' : '右'}移幾位？`, `To go from ${num(c)} to ${s}, how many places does the decimal point move ${small ? 'left' : 'right'}?`), T(`數一數：${e} 位。`, `Count: ${e} places.`), T(`往${small ? '左移（變小）指數是負的' : '右移（變大）指數是正的'}，所以 n = ${num(small ? -e : e)}。`, `Moving ${small ? 'left (smaller) means a negative' : 'right (bigger) means a positive'} exponent, so n = ${num(small ? -e : e)}.`)],
      };
    },
  },
  {
    id: 'g7-exponent-rules', grade: 7,
    name: T('指數律', 'Exponent rules'),
    cur: { us: 'CCSS 8.EE.A.1', tw: '七年級 指數律', aops: 'Prealgebra' },
    at: { us: 8 },
    gen(r) {
      const k = r.int(0, 4), a = r.pick([2, 3, 5, 7, 10, 'a', 'x']), m = r.int(2, 9), n = r.int(2, 9);
      if (k === 0) return {
        q: T(`${pow(a, m)} × ${pow(a, n)} = ${a}<sup>□</sup>，□ 是多少？`, `${pow(a, m)} × ${pow(a, n)} = ${a}<sup>□</sup>. What is □?`), ans: ansNum(m + n),
        sol: [T(`${pow(a, m)} 是 ${m} 個 ${a} 相乘，${pow(a, n)} 是 ${n} 個 ${a} 相乘。`, `${pow(a, m)} is ${m} factors of ${a}; ${pow(a, n)} is ${n} factors of ${a}.`), T(`合起來共有 ${m} + ${n} = ${m + n} 個 ${a} 相乘。`, `Together that is ${m} + ${n} = ${m + n} factors of ${a}.`), T(`同底數相乘，指數相加：□ = ${m + n}。`, `Same base, multiply → add exponents: □ = ${m + n}.`)],
      };
      if (k === 1) return {
        q: T(`(${pow(a, m)})<sup>${n}</sup> = ${a}<sup>□</sup>，□ 是多少？`, `(${pow(a, m)})<sup>${n}</sup> = ${a}<sup>□</sup>. What is □?`), ans: ansNum(m * n),
        sol: [T(`(${pow(a, m)})<sup>${n}</sup> 表示 ${n} 個 ${pow(a, m)} 相乘。`, `(${pow(a, m)})<sup>${n}</sup> means ${n} factors of ${pow(a, m)}.`), T(`每個有 ${m} 個 ${a}，共 ${m} × ${n} = ${m * n} 個。`, `Each has ${m} factors of ${a}, so ${m} × ${n} = ${m * n} in all.`), T(`次方的次方，指數相乘：□ = ${m * n}。（常見錯誤：寫成 ${m + n}）`, `Power of a power → multiply exponents: □ = ${m * n}. (Common mistake: ${m + n}.)`)],
      };
      if (k === 2) {
        const big = m + n;
        return {
          q: T(`${pow(a, big)} ÷ ${pow(a, m)} = ${a}<sup>□</sup>，□ 是多少？`, `${pow(a, big)} ÷ ${pow(a, m)} = ${a}<sup>□</sup>. What is □?`), ans: ansNum(n),
          sol: [T(`${big} 個 ${a} 相乘，除以 ${m} 個 ${a} 相乘，可以約掉 ${m} 個。`, `${big} factors of ${a} divided by ${m} factors of ${a}: ${m} of them cancel.`), T(`剩下 ${big} − ${m} = ${n} 個。`, `${big} − ${m} = ${n} are left.`), T(`同底數相除，指數相減：□ = ${n}。`, `Same base, divide → subtract exponents: □ = ${n}.`)],
        };
      }
      if (k === 3) {
        const b = r.int(2, 5), e1 = r.pick([2, 3, 4]), e2 = r.pick([2, 3]), v1 = -(b ** e1), v2 = (-b) ** e2, v = v1 + v2;
        return {
          q: T(`計算：−${pow(b, e1)} + ${pow(`(−${b})`, e2)}`, `Compute: −${pow(b, e1)} + ${pow(`(−${b})`, e2)}`), ans: ansNum(v),
          sol: [T(`−${pow(b, e1)} 是「${pow(b, e1)} 的相反數」，次方只作用在 ${b} 上：−${pow(b, e1)} = −${b ** e1}。`, `−${pow(b, e1)} means "the opposite of ${pow(b, e1)}" — the exponent applies only to ${b}: −${pow(b, e1)} = −${b ** e1}.`), T(`${pow(`(−${b})`, e2)} 是 ${e2} 個 (−${b}) 相乘，${e2 % 2 ? '奇數個負號，結果為負' : '偶數個負號，結果為正'}：${num(v2)}。`, `${pow(`(−${b})`, e2)} is ${e2} factors of (−${b}); ${e2 % 2 ? 'an odd count gives a negative' : 'an even count gives a positive'}: ${num(v2)}.`), T(`${num(v1)} + ${par(v2)} = ${num(v)}。`, `${num(v1)} + ${par(v2)} = ${num(v)}.`)],
        };
      }
      const [base, sm] = r.pick([[2, [4, 8, 16, 32]], [3, [9, 27, 81]]]), p = r.pick(sm), q = r.pick(sm), ep = Math.round(Math.log(p) / Math.log(base)), eq = Math.round(Math.log(q) / Math.log(base)), x = r.int(2, 5), y = r.int(2, 4), tot = ep * x + eq * y;
      return {
        q: T(`${pow(p, x)} × ${pow(q, y)} = ${base}<sup>n</sup>，求 n。`, `${pow(p, x)} × ${pow(q, y)} = ${base}<sup>n</sup>. Find n.`), ans: ansNum(tot),
        sol: [T(`把底數都寫成 ${base} 的次方：${p} = ${pow(base, ep)}，${q} = ${pow(base, eq)}。`, `Write each base as a power of ${base}: ${p} = ${pow(base, ep)}, ${q} = ${pow(base, eq)}.`), T(`${pow(p, x)} = (${pow(base, ep)})<sup>${x}</sup> = ${pow(base, ep * x)}；${pow(q, y)} = (${pow(base, eq)})<sup>${y}</sup> = ${pow(base, eq * y)}。`, `${pow(p, x)} = (${pow(base, ep)})<sup>${x}</sup> = ${pow(base, ep * x)}; ${pow(q, y)} = (${pow(base, eq)})<sup>${y}</sup> = ${pow(base, eq * y)}.`), T(`相乘指數相加：${ep * x} + ${eq * y} = ${tot}，所以 n = ${tot}。`, `Multiply → add exponents: ${ep * x} + ${eq * y} = ${tot}, so n = ${tot}.`)],
      };
    },
  },
  {
    id: 'g7-prime-factor', grade: 7,
    name: T('質因數分解與標準分解式', 'Prime factorization'),
    cur: { tw: '七年級 標準分解式', aops: 'Intro Number Theory' },
    gen(r) {
      const k = r.int(0, 2);
      let fs, N;
      do {
        const ps = r.sample([2, 3, 5, 7, 11, 13], r.int(2, 3)).sort((a, b) => a - b);
        fs = ps.map((p) => [p, r.int(1, p <= 3 ? 4 : 2)]); N = fs.reduce((s, [p, e]) => s * p ** e, 1);
      } while (N > 6000 || N < 30);
      const show = (L) => L.filter(([, e]) => e > 0).map(([p, e]) => (e > 1 ? pow(p, e) : String(p))).join(' × ');
      const plain = primeFactors(N), divs = fs.reduce((s, [, e]) => s * (e + 1), 1);
      const ladder = T(`短除法：${N} 連續除以質數 → ${plain.join(' × ')}。`, `Divide by primes repeatedly: ${N} = ${plain.join(' × ')}.`);
      if (k === 0) {
        const w1 = fs.map(([p, e], i) => [p, i === 0 ? e + 1 : e]), w2 = fs.map(([p, e], i) => [p, i === fs.length - 1 ? e - 1 : e]);
        const w3 = fs.length >= 2 && fs[0][1] !== fs[1][1] ? fs.map(([p, e], i) => [p, i === 0 ? fs[1][1] : i === 1 ? fs[0][1] : e]) : fs.map(([p]) => [p, 1]);
        const w4 = fs[0][0] === 2 && fs[0][1] >= 2 ? `4 × ${show([[2, fs[0][1] - 2], ...fs.slice(1)])}`.replace(/ × $/, '') : show(fs.map(([p, e]) => [p, e + 1]));
        return {
          q: T(`${N} 的標準分解式是哪一個？`, `Which is the prime factorization of ${N} (in exponent form)?`),
          ans: choice(show(fs), show(w1), show(w2), show(w3), w4),
          sol: [T('標準分解式：把數寫成質數的乘積，相同的質數用次方表示，由小到大排列。', 'Prime factorization: write the number as a product of primes, using exponents for repeats, smallest prime first.'), ladder, T(`整理：${show(fs)}。`, `Group them: ${show(fs)}.`), T(`驗算：${fs.filter(([, e]) => e > 1).map(([p, e]) => `${pow(p, e)} = ${p ** e}`).join('，')}，相乘 = ${N} ✓`, `Check: ${fs.filter(([, e]) => e > 1).map(([p, e]) => `${pow(p, e)} = ${p ** e}`).join(', ')}; their product is ${N} ✓`)],
        };
      }
      if (k === 1) return {
        q: T(`${N} 有幾個正因數？`, `How many positive factors (divisors) does ${N} have?`), ans: ansNum(divs),
        sol: [T(`先寫標準分解式：${N} = ${show(fs)}。`, `First factor: ${N} = ${show(fs)}.`), T(`每個因數都是從每個質數選一個次方：${fs.map(([p, e]) => `${p} 的次方可選 0～${e}，共 ${e + 1} 種`).join('；')}。`, `Every factor picks a power of each prime: ${fs.map(([p, e]) => `${p}: exponent 0 to ${e}, ${e + 1} choices`).join('; ')}.`), T(`因數個數 = ${fs.map(([, e]) => `(${e} + 1)`).join(' × ')} = ${divs}。`, `Number of factors = ${fs.map(([, e]) => `(${e} + 1)`).join(' × ')} = ${divs}.`)],
        hint: T('先做標準分解式，指數各加 1 再相乘。', 'Factor first, add 1 to each exponent, then multiply.'),
      };
      const need = fs.filter(([, e]) => e % 2).map(([p]) => p), m = need.reduce((s, p) => s * p, 1);
      if (m === 1) return this.gen(r);
      return {
        q: T(`${N} 乘上一個最小的正整數 k 後會變成完全平方數，k 是多少？`, `What is the smallest positive integer k such that ${N} × k is a perfect square?`), ans: ansNum(m),
        sol: [T(`${N} = ${show(fs)}。`, `${N} = ${show(fs)}.`), T('完全平方數的標準分解式中，每個指數都是偶數。', 'In a perfect square every exponent in the prime factorization is even.'), T(`指數是奇數的質數：${need.join('、')}，各再乘一個就變偶數。`, `Primes with odd exponents: ${need.join(', ')}. Multiply by one more of each.`), T(`k = ${need.join(' × ')} = ${m}，${N} × ${m} = ${N * m} = ${Math.round(Math.sqrt(N * m))}² ✓`, `k = ${need.join(' × ')} = ${m}, and ${N} × ${m} = ${N * m} = ${Math.round(Math.sqrt(N * m))}² ✓`)],
      };
    },
  },
  {
    id: 'g7-gcd-lcm', grade: 7,
    name: T('最大公因數與最小公倍數', 'GCD and LCM'),
    cur: { us: 'CCSS 6.NS.B.4', tw: '七年級 最大公因數與最小公倍數', aops: 'Intro Number Theory' },
    at: { us: 6 },
    gen(r) {
      const k = r.int(0, 4);
      const fac = (n) => { const o = {}; primeFactors(n).forEach((p) => (o[p] = (o[p] || 0) + 1)); return o; };
      const show = (n) => { const f = fac(n); return Object.keys(f).map((p) => (f[p] > 1 ? pow(p, f[p]) : p)).join(' × ') || '1'; };
      let a, b; do { const g = r.pick([2, 3, 4, 5, 6, 8, 9, 10, 12, 14, 15]); a = g * r.int(2, 12); b = g * r.int(2, 12); } while (a === b || a > 200 || b > 200);
      const G = gcd(a, b), L = lcm(a, b);
      const steps = (isG) => [
        T(`標準分解：${a} = ${show(a)}，${b} = ${show(b)}。`, `Factor: ${a} = ${show(a)}, ${b} = ${show(b)}.`),
        isG ? T('最大公因數：取兩數「共同有」的質數，次方取較小的。', 'GCD: take the primes they share, each with the smaller exponent.') : T('最小公倍數：取「所有出現過」的質數，次方取較大的。', 'LCM: take every prime that appears, each with the larger exponent.'),
        isG ? T(`(${a}, ${b}) = ${show(G)} = ${G}。`, `GCD(${a}, ${b}) = ${show(G)} = ${G}.`) : T(`[${a}, ${b}] = ${show(L)} = ${L}。`, `LCM(${a}, ${b}) = ${show(L)} = ${L}.`),
        T(`檢查：${G} × ${L} = ${G * L} = ${a} × ${b} ✓（兩數乘積 = 最大公因數 × 最小公倍數）`, `Check: ${G} × ${L} = ${G * L} = ${a} × ${b} ✓ (product = GCD × LCM).`),
      ];
      if (k === 0) return { q: T(`求 ${a} 和 ${b} 的最大公因數。`, `Find the greatest common divisor of ${a} and ${b}.`), ans: ansNum(G), sol: steps(true) };
      if (k === 1) return { q: T(`求 ${a} 和 ${b} 的最小公倍數。`, `Find the least common multiple of ${a} and ${b}.`), ans: ansNum(L), sol: steps(false) };
      if (k === 2) {
        const w = a, h = b;
        return {
          q: T(`一塊長 ${w} 公分、寬 ${h} 公分的長方形布，要剪成大小相同的正方形，不能有剩。正方形的邊長最大是幾公分？`, `A ${w} cm by ${h} cm rectangle of cloth is cut into equal squares with nothing left over. What is the largest possible side length of the squares, in cm?`),
          ans: ansNum(G),
          sol: [T(`正方形的邊長必須同時整除 ${w} 和 ${h}，所以是公因數；要最大 → 最大公因數。`, `The side must divide both ${w} and ${h}, so it's a common factor; the largest one is the GCD.`), ...steps(true).slice(0, 3), T(`可以剪成 ${w / G} × ${h / G} = ${(w / G) * (h / G)} 個邊長 ${G} 公分的正方形。`, `That makes ${w / G} × ${h / G} = ${(w / G) * (h / G)} squares of side ${G} cm.`)],
        };
      }
      if (k === 3) {
        const p = r.pick([6, 8, 9, 10, 12, 15, 18, 20]); let q; do q = r.pick([8, 10, 12, 14, 15, 16, 20, 24, 25, 30]); while (q === p);
        const Lq = lcm(p, q), h = 7 + Math.floor(Lq / 60), mi = Lq % 60;
        return {
          q: T(`公車 A 每 ${p} 分鐘發一班，公車 B 每 ${q} 分鐘發一班。早上 7:00 兩班車同時發車，下一次同時發車是幾分鐘後？`, `Bus A leaves every ${p} minutes and bus B every ${q} minutes. Both leave together at 7:00 a.m. After how many minutes do they next leave together?`),
          ans: ansNum(Lq),
          sol: [T(`A 發車的時間是 ${p} 的倍數，B 是 ${q} 的倍數；同時發車 → 公倍數，最早 → 最小公倍數。`, `A leaves at multiples of ${p}, B at multiples of ${q}. Together → common multiple; next time → least common multiple.`), T(`${p} = ${show(p)}，${q} = ${show(q)}。`, `${p} = ${show(p)}, ${q} = ${show(q)}.`), T(`[${p}, ${q}] = ${Lq}。`, `LCM(${p}, ${q}) = ${Lq}.`), T(`${Lq} 分鐘後，也就是 ${h}:${String(mi).padStart(2, '0')}。`, `${Lq} minutes later, at ${h}:${String(mi).padStart(2, '0')}.`)],
        };
      }
      return {
        q: T(`兩個正整數的最大公因數是 ${G}，最小公倍數是 ${L}，其中一個數是 ${a}。另一個數是多少？`, `Two positive integers have GCD ${G} and LCM ${L}. One of them is ${a}. What is the other?`), ans: ansNum(b),
        sol: [T('重要性質：兩數乘積 = 最大公因數 × 最小公倍數。', 'Key fact: the product of two numbers = GCD × LCM.'), T(`${a} × 另一數 = ${G} × ${L} = ${G * L}。`, `${a} × (other) = ${G} × ${L} = ${G * L}.`), T(`另一數 = ${G * L} ÷ ${a} = ${b}。`, `Other = ${G * L} ÷ ${a} = ${b}.`), T(`驗算：(${a}, ${b}) = ${G}，[${a}, ${b}] = ${L} ✓`, `Check: GCD(${a}, ${b}) = ${G}, LCM = ${L} ✓`)],
      };
    },
  },
  {
    id: 'g7-linear-system', grade: 7,
    name: T('二元一次聯立方程式', 'Systems of two linear equations'),
    cur: { us: 'CCSS 8.EE.C.8b', tw: '七年級 二元一次聯立方程式', aops: 'Intro Algebra' },
    at: { us: 8 },
    gen(r) {
      const k = r.int(0, 2), x = r.nz(-8, 8), y = r.nz(-8, 8);
      if (k === 0) {
        let a1, b1, a2, b2; do { a1 = r.nz(-6, 6); b1 = r.nz(-6, 6); a2 = r.nz(-6, 6); b2 = r.nz(-6, 6); } while (a1 * b2 - a2 * b1 === 0 || Math.abs(b1) === Math.abs(b2) && Math.abs(a1) === Math.abs(a2));
        const c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y, L = lcm(b1, b2), m1 = L / Math.abs(b1), m2 = L / Math.abs(b2);
        const same = Math.sign(b1) === Math.sign(b2), A = a1 * m1 - (same ? 1 : -1) * a2 * m2, Cc = c1 * m1 - (same ? 1 : -1) * c2 * m2;
        return {
          q: T(`解聯立方程式：<br>${eq2(a1, b1, c1)}　①<br>${eq2(a2, b2, c2)}　②<br>（答案寫成 (x, y)）`, `Solve the system:<br>${eq2(a1, b1, c1)}　(1)<br>${eq2(a2, b2, c2)}　(2)<br>(Answer as (x, y).)`),
          ans: ansPair(x, y),
          sol: [
            T(`用加減消去法消去 y：讓兩式 y 的係數變成一樣大（${L}）。`, `Eliminate y: make the y-coefficients the same size (${L}).`),
            T(`${m1 > 1 ? `①×${m1}：` : '①：'}${eq2(a1 * m1, b1 * m1, c1 * m1)}；${m2 > 1 ? `②×${m2}：` : '②：'}${eq2(a2 * m2, b2 * m2, c2 * m2)}。`, `${m1 > 1 ? `(1)×${m1}: ` : '(1): '}${eq2(a1 * m1, b1 * m1, c1 * m1)}; ${m2 > 1 ? `(2)×${m2}: ` : '(2): '}${eq2(a2 * m2, b2 * m2, c2 * m2)}.`),
            T(`y 的係數${same ? '同號，兩式相減' : '異號，兩式相加'}：${mono(A)} = ${num(Cc)}，x = ${num(x)}。`, `The y-terms have ${same ? 'the same sign, so subtract' : 'opposite signs, so add'}: ${mono(A)} = ${num(Cc)}, so x = ${num(x)}.`),
            T(`代回 ①：${num(a1)} × ${par(x)}${term(b1, 'y', 1)} = ${num(c1)} → ${term(b1, 'y', 1, true)} = ${num(c1 - a1 * x)} → y = ${num(y)}。`, `Substitute into (1): ${num(a1)} × ${par(x)}${term(b1, 'y', 1)} = ${num(c1)} → ${term(b1, 'y', 1, true)} = ${num(c1 - a1 * x)} → y = ${num(y)}.`),
            T(`驗算 ②：${num(a2)} × ${par(x)} + ${par(b2)} × ${par(y)} = ${num(c2)} ✓，答案 (${num(x)}, ${num(y)})。`, `Check (2): ${num(a2)} × ${par(x)} + ${par(b2)} × ${par(y)} = ${num(c2)} ✓. Answer (${num(x)}, ${num(y)}).`),
          ],
        };
      }
      if (k === 1) {
        const m = r.nz(-4, 4), c = y - m * x; let a, b; do { a = r.nz(-5, 5); b = r.nz(-5, 5); } while (a + b * m === 0);
        const d = a * x + b * y;
        return {
          q: T(`解聯立方程式：<br>y = ${lin(m, c)}　①<br>${eq2(a, b, d)}　②<br>（答案寫成 (x, y)）`, `Solve the system:<br>y = ${lin(m, c)}　(1)<br>${eq2(a, b, d)}　(2)<br>(Answer as (x, y).)`),
          ans: ansPair(x, y),
          sol: [
            T('① 已經寫成「y = …」，用代入消去法：把 ① 代入 ②。', '(1) already says "y = …", so substitute it into (2).'),
            T(`${mono(a)} ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}(${lin(m, c)}) = ${num(d)}。`, `${mono(a)} ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}(${lin(m, c)}) = ${num(d)}.`),
            T(`展開合併：${poly([a + b * m, b * c])} = ${num(d)} → ${mono(a + b * m)} = ${num(d - b * c)} → x = ${num(x)}。`, `Expand and combine: ${poly([a + b * m, b * c])} = ${num(d)} → ${mono(a + b * m)} = ${num(d - b * c)} → x = ${num(x)}.`),
            T(`代回 ①：y = ${num(m)} × ${par(x)} ${sgn(c)} = ${num(y)}。`, `Back into (1): y = ${num(m)} × ${par(x)} ${sgn(c)} = ${num(y)}.`),
            T(`驗算 ②：${num(a)} × ${par(x)} + ${par(b)} × ${par(y)} = ${num(d)} ✓`, `Check (2): ${num(a)} × ${par(x)} + ${par(b)} × ${par(y)} = ${num(d)} ✓`),
          ],
        };
      }
      const s = x + y, d = x - y;
      if (s === 0 || d === 0) return this.gen(r);
      return {
        q: T(`解聯立方程式：<br>x + y = ${num(s)}<br>x − y = ${num(d)}<br>（答案寫成 (x, y)）`, `Solve the system:<br>x + y = ${num(s)}<br>x − y = ${num(d)}<br>(Answer as (x, y).)`),
        ans: ansPair(x, y),
        sol: [
          T('兩式相加，y 會消掉。', 'Add the two equations: y cancels.'),
          T(`2x = ${num(s)} + ${par(d)} = ${num(s + d)}，x = ${num(x)}。`, `2x = ${num(s)} + ${par(d)} = ${num(s + d)}, so x = ${num(x)}.`),
          T(`代入 x + y = ${num(s)}：y = ${num(s)} − ${par(x)} = ${num(y)}。`, `Put it in x + y = ${num(s)}: y = ${num(s)} − ${par(x)} = ${num(y)}.`),
          T(`驗算：${num(x)} − ${par(y)} = ${num(d)} ✓，答案 (${num(x)}, ${num(y)})。`, `Check: ${num(x)} − ${par(y)} = ${num(d)} ✓. Answer (${num(x)}, ${num(y)}).`),
        ],
      };
    },
  },
  {
    id: 'g7-coord-plane', grade: 7,
    name: T('直角坐標平面', 'The coordinate plane'),
    cur: { us: 'CCSS 6.NS.C.8', tw: '七年級 直角坐標與二元一次方程式的圖形', aops: 'Prealgebra' },
    at: { us: 6 },
    gen(r) {
      const k = r.int(0, 3);
      if (k === 0) {
        const x = r.nz(-9, 9), y = r.nz(-9, 9), qd = x > 0 ? (y > 0 ? 0 : 3) : y > 0 ? 1 : 2;
        const opts = [0, 1, 2, 3].map((i) => T(`第${ZH_Q[i]}象限`, `Quadrant ${EN_Q[i]}`));
        return {
          q: T(`點 (${num(x)}, ${num(y)}) 在第幾象限？`, `Which quadrant is the point (${num(x)}, ${num(y)}) in?`),
          ans: ansChoice([opts[qd], ...opts.filter((_, i) => i !== qd)]),
          sol: [T('四個象限：第一 (+, +)、第二 (−, +)、第三 (−, −)、第四 (+, −)，從右上開始逆時針數。', 'The quadrants: I (+, +), II (−, +), III (−, −), IV (+, −), counter-clockwise from the upper right.'), T(`x = ${num(x)} 是${x > 0 ? '正' : '負'}的（在 y 軸${x > 0 ? '右' : '左'}邊），y = ${num(y)} 是${y > 0 ? '正' : '負'}的（在 x 軸${y > 0 ? '上' : '下'}方）。`, `x = ${num(x)} is ${x > 0 ? 'positive (right of the y-axis)' : 'negative (left of the y-axis)'}; y = ${num(y)} is ${y > 0 ? 'positive (above the x-axis)' : 'negative (below the x-axis)'}.`), T(`所以在第${ZH_Q[qd]}象限。`, `So it is in Quadrant ${EN_Q[qd]}.`)],
        };
      }
      if (k === 1) {
        const x = r.int(-5, 5), y = r.int(-5, 5);
        return {
          q: T('圖中點 A 的坐標是什麼？（答案寫成 (x, y)）', 'What are the coordinates of point A? (Answer as (x, y).)'),
          fig: grid(6, [{ x, y, label: 'A' }]), ans: ansPair(x, y),
          sol: [T('坐標 (x, y)：先看左右（x），再看上下（y）。', 'Coordinates (x, y): first left/right (x), then up/down (y).'), T(`從原點出發，A 在${x === 0 ? '正上或正下方（x = 0）' : x > 0 ? `右邊 ${x} 格` : `左邊 ${-x} 格`}，所以 x = ${num(x)}。`, `From the origin, A is ${x === 0 ? 'straight up or down (x = 0)' : x > 0 ? `${x} units right` : `${-x} units left`}, so x = ${num(x)}.`), T(`再${y === 0 ? '不上不下（y = 0）' : y > 0 ? `往上 ${y} 格` : `往下 ${-y} 格`}，所以 y = ${num(y)}。`, `Then ${y === 0 ? 'neither up nor down (y = 0)' : y > 0 ? `${y} units up` : `${-y} units down`}, so y = ${num(y)}.`), T(`A = (${num(x)}, ${num(y)})。`, `A = (${num(x)}, ${num(y)}).`)],
        };
      }
      if (k === 2) {
        const x1 = r.int(-5, 1), x2 = r.int(x1 + 2, 5), y1 = r.int(-5, 1), y2 = r.int(y1 + 2, 5), W = x2 - x1, H = y2 - y1;
        const pts = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]], miss = r.int(0, 3), lab = ['A', 'B', 'C', 'D'];
        const shown = pts.map((p, i) => ({ x: p[0], y: p[1], label: lab[i] })).filter((_, i) => i !== miss);
        if (r.chance(0.5)) {
          return {
            q: T(`長方形 ABCD 中，${shown.map((p) => `${p.label}(${num(p.x)}, ${num(p.y)})`).join('、')}，求頂點 ${lab[miss]} 的坐標。（答案寫成 (x, y)）`, `In rectangle ABCD, ${shown.map((p) => `${p.label}(${num(p.x)}, ${num(p.y)})`).join(', ')}. Find vertex ${lab[miss]}. (Answer as (x, y).)`),
            fig: grid(6, shown), ans: ansPair(pts[miss][0], pts[miss][1]),
            sol: [T('長方形的邊跟坐標軸平行時，相鄰頂點有相同的 x 或相同的 y。', 'With sides parallel to the axes, neighboring vertices share an x or a y.'), T(`${lab[miss]} 與 ${lab[(miss + 1) % 4]} 在同一條${miss % 2 === 0 ? '鉛直' : '水平'}線上，與 ${lab[(miss + 3) % 4]} 在同一條${miss % 2 === 0 ? '水平' : '鉛直'}線上。`, `${lab[miss]} lines up ${miss % 2 === 0 ? 'vertically' : 'horizontally'} with ${lab[(miss + 1) % 4]} and ${miss % 2 === 0 ? 'horizontally' : 'vertically'} with ${lab[(miss + 3) % 4]}.`), T(`所以 ${lab[miss]} = (${num(pts[miss][0])}, ${num(pts[miss][1])})。`, `So ${lab[miss]} = (${num(pts[miss][0])}, ${num(pts[miss][1])}).`)],
          };
        }
        return {
          q: T(`長方形的四個頂點是 (${num(x1)}, ${num(y1)})、(${num(x2)}, ${num(y1)})、(${num(x2)}, ${num(y2)})、(${num(x1)}, ${num(y2)})。它的面積是多少平方單位？`, `A rectangle has vertices (${num(x1)}, ${num(y1)}), (${num(x2)}, ${num(y1)}), (${num(x2)}, ${num(y2)}) and (${num(x1)}, ${num(y2)}). What is its area in square units?`),
          fig: grid(6, pts.map((p, i) => ({ x: p[0], y: p[1], label: lab[i] }))), ans: ansNum(W * H),
          sol: [T('水平的邊長 = 兩個 x 坐標相減；鉛直的邊長 = 兩個 y 坐標相減。', 'Horizontal side = difference of the x-values; vertical side = difference of the y-values.'), T(`寬：${num(x2)} − ${par(x1)} = ${W}；高：${num(y2)} − ${par(y1)} = ${H}。`, `Width: ${num(x2)} − ${par(x1)} = ${W}; height: ${num(y2)} − ${par(y1)} = ${H}.`), T(`面積 = ${W} × ${H} = ${W * H}。`, `Area = ${W} × ${H} = ${W * H}.`)],
        };
      }
      const x = r.int(-6, 6), y = r.int(-6, 6), dx = r.nz(-5, 5), dy = r.nz(-5, 5);
      const dir = (v, zh, en) => (v > 0 ? [`${zh[0]} ${v}`, `${v} ${en[0]}`] : [`${zh[1]} ${-v}`, `${-v} ${en[1]}`]);
      const [hz, he] = dir(dx, ['向右', '向左'], ['units right', 'units left']), [vz, ve] = dir(dy, ['向上', '向下'], ['units up', 'units down']);
      return {
        q: T(`點 P(${num(x)}, ${num(y)}) 先${hz} 單位，再${vz} 單位，到達點 Q。Q 的坐標是什麼？（答案寫成 (x, y)）`, `Point P(${num(x)}, ${num(y)}) moves ${he}, then ${ve}, to point Q. What are Q's coordinates? (Answer as (x, y).)`),
        ans: ansPair(x + dx, y + dy),
        sol: [T('左右移動只改變 x：向右加、向左減。上下移動只改變 y：向上加、向下減。', 'Left/right changes only x (right +, left −). Up/down changes only y (up +, down −).'), T(`x：${num(x)} ${sgn(dx)} = ${num(x + dx)}。`, `x: ${num(x)} ${sgn(dx)} = ${num(x + dx)}.`), T(`y：${num(y)} ${sgn(dy)} = ${num(y + dy)}。`, `y: ${num(y)} ${sgn(dy)} = ${num(y + dy)}.`), T(`Q = (${num(x + dx)}, ${num(y + dy)})。`, `Q = (${num(x + dx)}, ${num(y + dy)}).`)],
      };
    },
  },
  {
    id: 'g7-units-digit', grade: 7,
    name: T('個位數字的規律', 'Units digit patterns'),
    cur: { aops: 'Intro Number Theory' },
    gen(r) {
      const cyc = (d) => { const o = []; let x = d % 10; while (!o.includes(x)) { o.push(x); x = (x * (d % 10)) % 10; } return o; };
      const ud = (b, n) => { const c = cyc(b); return c[(n - 1) % c.length]; };
      const explain = (b, n) => {
        const c = cyc(b), pos = ((n - 1) % c.length) + 1;
        return [
          T(`只要看個位數。${b} 的次方個位數依序是：${c.join(', ')}, ${c[0]}, …，每 ${c.length} 個一循環。`, `Only the units digit matters. Powers of ${b} end in ${c.join(', ')}, ${c[0]}, … — repeating every ${c.length}.`),
          T(`${n} ÷ ${c.length} = ${Math.floor(n / c.length)} 餘 ${n % c.length}${n % c.length === 0 ? `，餘 0 表示是循環的最後一個` : ''}，對應循環中的第 ${pos} 個。`, `${n} ÷ ${c.length} = ${Math.floor(n / c.length)} remainder ${n % c.length}${n % c.length === 0 ? ' (remainder 0 means the last in the cycle)' : ''}, so it's position ${pos} in the cycle.`),
          T(`所以 ${pow(b, n)} 的個位數是 ${c[pos - 1]}。`, `So ${pow(b, n)} ends in ${c[pos - 1]}.`),
        ];
      };
      const B = () => { let b; do b = r.int(2, 29); while (b % 10 < 2 || b % 10 === 5); return b; };
      const k = r.int(0, 2);
      if (k === 0) {
        const b = B(), n = r.int(15, 2026);
        return { q: T(`${pow(b, n)} 的個位數字是多少？`, `What is the units digit of ${pow(b, n)}?`), ans: ansNum(ud(b, n)), sol: explain(b, n), hint: T('列出前幾個次方的個位數，找循環。', 'List the units digits of the first few powers and look for a cycle.') };
      }
      const b = B(); let c; do c = B(); while (c === b); const n = r.int(10, 999), m = r.int(10, 999), u1 = ud(b, n), u2 = ud(c, m), add = k === 1, v = add ? (u1 + u2) % 10 : (u1 * u2) % 10;
      return {
        q: T(`${pow(b, n)} ${add ? '+' : '×'} ${pow(c, m)} 的個位數字是多少？`, `What is the units digit of ${pow(b, n)} ${add ? '+' : '×'} ${pow(c, m)}?`), ans: ansNum(v),
        sol: [...explain(b, n).slice(0, 1), T(`${pow(b, n)} 的個位數是 ${u1}（循環長度 ${cyc(b).length}，${n} ÷ ${cyc(b).length} 餘 ${n % cyc(b).length}）。`, `${pow(b, n)} ends in ${u1} (cycle length ${cyc(b).length}, ${n} ÷ ${cyc(b).length} leaves remainder ${n % cyc(b).length}).`), T(`${c} 的次方個位數循環：${cyc(c).join(', ')}；${m} ÷ ${cyc(c).length} 餘 ${m % cyc(c).length}，所以 ${pow(c, m)} 的個位數是 ${u2}。`, `Powers of ${c} cycle ${cyc(c).join(', ')}; ${m} ÷ ${cyc(c).length} leaves ${m % cyc(c).length}, so ${pow(c, m)} ends in ${u2}.`), T(`${u1} ${add ? '+' : '×'} ${u2} = ${add ? u1 + u2 : u1 * u2}，個位數是 ${v}。`, `${u1} ${add ? '+' : '×'} ${u2} = ${add ? u1 + u2 : u1 * u2}, whose units digit is ${v}.`)],
      };
    },
  },
  {
    id: 'g7-divisibility', grade: 7,
    name: T('倍數的判別', 'Divisibility rules'),
    cur: { tw: '七年級 因數與倍數（倍數判別法）', aops: 'Prealgebra' },
    gen(r) {
      const k = r.int(0, 3);
      const make = (len) => { const d = [r.int(1, 9)]; for (let i = 1; i < len; i++) d.push(r.int(0, 9)); return d; };
      const showD = (d, pos) => d.map((x, i) => (i === pos ? '□' : x)).join('');
      if (k === 0 || k === 1) {
        const m = k === 0 ? 9 : 3, len = r.int(4, 6), d = make(len), pos = r.int(1, len - 1);
        const rest = sum(d.filter((_, i) => i !== pos)), ok = range(0, 9).filter((x) => (rest + x) % m === 0);
        if (m === 9 && (ok.length !== 1)) return this.gen(r);
        const s = showD(d, pos);
        if (m === 9) return {
          q: T(`${len} 位數 ${s} 是 9 的倍數，□ 中的數字是多少？`, `The ${len}-digit number ${s} is divisible by 9. What digit is in the □?`), ans: ansNum(ok[0]),
          sol: [T('9 的倍數判別法：各位數字的和是 9 的倍數。', 'Divisible by 9 ⇔ the sum of the digits is divisible by 9.'), T(`其他數字的和：${d.filter((_, i) => i !== pos).join(' + ')} = ${rest}。`, `The other digits add to ${d.filter((_, i) => i !== pos).join(' + ')} = ${rest}.`), T(`${rest} + □ 要是 9 的倍數，□ 只能是 0～9 中的 ${ok[0]}（${rest} + ${ok[0]} = ${rest + ok[0]}）。`, `${rest} + □ must be a multiple of 9; the only digit that works is ${ok[0]} (${rest} + ${ok[0]} = ${rest + ok[0]}).`)],
        };
        return {
          q: T(`${s} 是 3 的倍數。□ 可以填 0～9 中的哪些數字？把所有可能的數字加起來是多少？`, `${s} is divisible by 3. Which digits 0–9 can go in the □? What is the sum of all the possible digits?`), ans: ansNum(sum(ok)),
          sol: [T('3 的倍數判別法：各位數字的和是 3 的倍數。', 'Divisible by 3 ⇔ the digit sum is divisible by 3.'), T(`其他數字的和是 ${rest}。`, `The other digits add to ${rest}.`), T(`${rest} + □ 是 3 的倍數：□ 可以是 ${ok.join('、')}。`, `${rest} + □ must be a multiple of 3: □ can be ${ok.join(', ')}.`), T(`和 = ${ok.join(' + ')} = ${sum(ok)}。`, `Sum = ${ok.join(' + ')} = ${sum(ok)}.`)],
        };
      }
      if (k === 2) {
        const len = r.pick([5, 6, 7]), d = make(len), pos = r.int(1, len - 1);
        const alt = (arr) => arr.reduce((s, x, i) => s + ((len - 1 - i) % 2 === 0 ? x : -x), 0);
        const base = alt(d.map((x, i) => (i === pos ? 0 : x))), sgnPos = (len - 1 - pos) % 2 === 0 ? 1 : -1;
        const ok = range(0, 9).filter((x) => (((base + sgnPos * x) % 11) + 11) % 11 === 0);
        if (ok.length !== 1) return this.gen(r);
        const odd = d.filter((_, i) => (len - 1 - i) % 2 === 0 && i !== pos), even = d.filter((_, i) => (len - 1 - i) % 2 === 1 && i !== pos);
        return {
          q: T(`${showD(d, pos)} 是 11 的倍數，□ 中的數字是多少？`, `${showD(d, pos)} is divisible by 11. What digit is in the □?`), ans: ansNum(ok[0]),
          sol: [T('11 的倍數判別法：從個位起，奇數位數字和與偶數位數字和的差是 11 的倍數（包含 0）。', 'Divisible by 11 ⇔ (sum of digits in odd places) − (sum in even places), counting from the units digit, is a multiple of 11 (0 counts).'), T(`□ 在從右數第 ${len - pos} 位（${sgnPos > 0 ? '奇數位' : '偶數位'}）。奇數位其他數字：${odd.join(' + ') || '0'} = ${sum(odd)}；偶數位：${even.join(' + ') || '0'} = ${sum(even)}。`, `The □ is in place ${len - pos} from the right (${sgnPos > 0 ? 'odd' : 'even'}). Other odd-place digits: ${odd.join(' + ') || '0'} = ${sum(odd)}; even-place digits: ${even.join(' + ') || '0'} = ${sum(even)}.`), T(`試 □ = ${ok[0]}：差 = ${sgnPos > 0 ? `${sum(odd) + ok[0]} − ${sum(even)}` : `${sum(odd)} − ${sum(even) + ok[0]}`} = ${base + sgnPos * ok[0]}，是 11 的倍數 ✓`, `Try □ = ${ok[0]}: difference = ${sgnPos > 0 ? `${sum(odd) + ok[0]} − ${sum(even)}` : `${sum(odd)} − ${sum(even) + ok[0]}`} = ${base + sgnPos * ok[0]}, a multiple of 11 ✓`), T(`答案：${ok[0]}。`, `Answer: ${ok[0]}.`)],
        };
      }
      const m = r.pick([4, 6, 8, 12, 15]);
      const ds = (n) => sum(String(n).split('').map(Number)), l2 = (n) => String(n).slice(-2), l3 = (n) => String(n).slice(-3);
      const why = {
        4: ['4 的倍數：末兩位是 4 的倍數。', 'Divisible by 4 ⇔ the last two digits form a multiple of 4.', (n) => [`末兩位 ${l2(n)}，${+l2(n) % 4 ? '不是' : '是'} 4 的倍數`, `last two digits ${l2(n)} — ${+l2(n) % 4 ? 'not ' : ''}a multiple of 4`]],
        8: ['8 的倍數：末三位是 8 的倍數。', 'Divisible by 8 ⇔ the last three digits form a multiple of 8.', (n) => [`末三位 ${l3(n)}，${+l3(n) % 8 ? '不是' : '是'} 8 的倍數`, `last three digits ${l3(n)} — ${+l3(n) % 8 ? 'not ' : ''}a multiple of 8`]],
        6: ['6 的倍數：同時是 2 和 3 的倍數（偶數，且數字和是 3 的倍數）。', 'Divisible by 6 ⇔ divisible by 2 and by 3 (even, and digit sum a multiple of 3).', (n) => [`${n % 2 ? '奇數' : '偶數'}，數字和 ${ds(n)}`, `${n % 2 ? 'odd' : 'even'}, digit sum ${ds(n)}`]],
        12: ['12 的倍數：同時是 3 和 4 的倍數。', 'Divisible by 12 ⇔ divisible by 3 and by 4.', (n) => [`數字和 ${ds(n)}，末兩位 ${l2(n)}`, `digit sum ${ds(n)}, last two digits ${l2(n)}`]],
        15: ['15 的倍數：同時是 3 和 5 的倍數（個位是 0 或 5，且數字和是 3 的倍數）。', 'Divisible by 15 ⇔ divisible by 3 and 5 (ends in 0 or 5, and digit sum a multiple of 3).', (n) => [`個位 ${n % 10}，數字和 ${ds(n)}`, `units digit ${n % 10}, digit sum ${ds(n)}`]],
      }[m];
      let right; do right = r.int(1000, 9999); while (right % m);
      const wrongs = []; let guard = 0;
      while (wrongs.length < 3 && guard++ < 999) {
        let w = r.int(1000, 9999);
        // near misses: pass one part of the test but not all of it
        if (m === 6 || m === 12) w -= w % 3; if (m === 15) w -= w % 5; if (m === 4 || m === 8) w -= w % 2;
        if (w % m && !wrongs.includes(w) && w >= 1000) wrongs.push(w);
      }
      const [rz, re] = why[2](right), [wz, we] = why[2](wrongs[0]);
      return {
        q: T(`下列哪一個數是 ${m} 的倍數？`, `Which number is divisible by ${m}?`),
        ans: choice(String(right), ...wrongs.map(String)),
        sol: [T(why[0], why[1]), T(`${right}：${rz} → 符合。`, `${right}: ${re} → passes.`), T(`其他的數都有一個條件不符合，例如 ${wrongs[0]}：${wz}。`, `Each other choice fails a test, e.g. ${wrongs[0]}: ${we}.`), T(`驗算：${right} ÷ ${m} = ${right / m} ✓`, `Check: ${right} ÷ ${m} = ${right / m} ✓`)],
      };
    },
  },
  {
    id: 'g7-counting', grade: 7,
    name: T('排列與乘法原理', 'Counting: arrangements and the multiplication principle'),
    cur: { us: 'CCSS 7.SP.C.8b', aops: 'Intro Counting & Probability' },
    gen(r) {
      const k = r.int(0, 4);
      if (k === 0) {
        const n = r.int(3, 7);
        return {
          q: T(`${n} 位同學排成一排照相，共有幾種排法？`, `${n} students line up in a row for a photo. How many different orders are possible?`), ans: ansNum(fact(n)),
          sol: [T('一個位置一個位置填，用乘法原理。', 'Fill the spots one at a time and multiply (multiplication principle).'), T(`第 1 個位置有 ${n} 種選擇，第 2 個剩 ${n - 1} 種，……，最後一個只剩 1 種。`, `Spot 1 has ${n} choices, spot 2 has ${n - 1}, …, the last spot has 1.`), T(`${range(1, n).reverse().join(' × ')} = ${fact(n)}（記作 ${n}!）。`, `${range(1, n).reverse().join(' × ')} = ${fact(n)} (written ${n}!).`)],
        };
      }
      if (k === 1) {
        const n = r.int(5, 12);
        return {
          q: T(`班上有 ${n} 位候選人，要選出班長、副班長、學藝股長各一人（不能兼任），共有幾種選法？`, `There are ${n} candidates. A president, a vice president and a secretary are chosen (one person per job). How many ways are there?`), ans: ansNum(P(n, 3)),
          sol: [T('職位不同，順序有差別，用乘法原理。', 'The jobs are different, so order matters. Multiply.'), T(`班長 ${n} 種，副班長剩 ${n - 1} 種，學藝剩 ${n - 2} 種。`, `President: ${n} choices; vice president: ${n - 1}; secretary: ${n - 2}.`), T(`${n} × ${n - 1} × ${n - 2} = ${P(n, 3)}。`, `${n} × ${n - 1} × ${n - 2} = ${P(n, 3)}.`)],
        };
      }
      if (k === 2) {
        const nm = who(r), a = r.int(2, 6), b = r.int(2, 5), c = r.int(2, 4);
        return {
          q: T(`${nm[0]}有 ${a} 件上衣、${b} 條褲子、${c} 雙鞋。每次各選一樣搭配，共有幾種不同的穿搭？`, `${nm[1]} has ${a} shirts, ${b} pairs of pants and ${c} pairs of shoes. Choosing one of each, how many different outfits are there?`), ans: ansNum(a * b * c),
          sol: [T('分三步驟選，每一步的選法相乘。', 'Three independent choices: multiply the number of options.'), T(`${a} × ${b} × ${c} = ${a * b * c}。`, `${a} × ${b} × ${c} = ${a * b * c}.`), T(`可以想成樹狀圖：每件上衣有 ${b * c} 種下半身搭配，共 ${a} 件上衣。`, `Think of a tree diagram: each shirt goes with ${b * c} pants-and-shoes combinations, and there are ${a} shirts.`)],
        };
      }
      if (k === 3) {
        const n = r.int(4, 6), digs = [0, ...r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], n - 1)].sort(), tot = (n - 1) * (n - 1) * (n - 2);
        return {
          q: T(`用數字 ${digs.join('、')} 組成三位數，數字不能重複使用，共可組成幾個？`, `Using the digits ${digs.join(', ')} without repeating any digit, how many three-digit numbers can be made?`), ans: ansNum(tot),
          sol: [T('百位數不能是 0！先填百位。', 'The hundreds digit cannot be 0! Fill it first.'), T(`百位：0 以外的 ${n - 1} 種。`, `Hundreds: ${n - 1} choices (anything but 0).`), T(`十位：剩下 ${n - 1} 個數字（0 現在可以用了）；個位：剩 ${n - 2} 個。`, `Tens: ${n - 1} digits left (0 is allowed now); units: ${n - 2} left.`), T(`${n - 1} × ${n - 1} × ${n - 2} = ${tot}。`, `${n - 1} × ${n - 1} × ${n - 2} = ${tot}.`)],
        };
      }
      const n = r.int(4, 7), [A, B] = two(r), tot = 2 * fact(n - 1);
      return {
        q: T(`${n} 個人排成一排，其中${A[0]}和${B[0]}一定要相鄰，共有幾種排法？`, `${n} people stand in a row, and ${A[1]} and ${B[1]} must stand next to each other. How many arrangements are there?`), ans: ansNum(tot),
        sol: [T(`把${A[0]}和${B[0]}綁成一組，當作 1 個人。`, `Glue ${A[1]} and ${B[1]} together and treat them as one block.`), T(`現在有 ${n - 1} 個「單位」排一排：${n - 1}! = ${fact(n - 1)} 種。`, `Now ${n - 1} units line up: ${n - 1}! = ${fact(n - 1)} ways.`), T(`組內兩人可以交換位置：× 2。`, `Inside the block the two can swap: × 2.`), T(`${fact(n - 1)} × 2 = ${tot}。`, `${fact(n - 1)} × 2 = ${tot}.`)],
      };
    },
  },
];

// ======================= GRADE 8 =======================
const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [6, 8, 10], [12, 16, 20], [9, 12, 15], [15, 20, 25], [10, 24, 26]];
// y = mx + b with m = [n, d] (d > 0)
function yEq(m, b, v = 'x') {
  const [n, d] = red(...m);
  let s;
  if (n === 0) return `y = ${num(b)}`;
  if (d === 1) s = term(n, v, 1, true);
  else s = `${n < 0 ? '−' : ''}${frac(Math.abs(n), d)}${v}`;
  return `y = ${s}${b ? ` ${sgn(b)}` : ''}`;
}
const fac1 = (p) => `(x ${sgn(p)})`;               // (x + p)
const facA = (a, p) => `(${lin(a, p)})`;           // (ax + p)
const sq = (s) => `${s}<sup>2</sup>`;
// triangle with angle labels inside the corners
function triAngFig(pts, labs, extra = '') {
  const G = [(pts[0][0] + pts[1][0] + pts[2][0]) / 3, (pts[0][1] + pts[1][1] + pts[2][1]) / 3];
  let b = `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" class="f-soft"/>` + extra;
  pts.forEach((p, i) => { if (labs[i]) b += tt(p[0] + (G[0] - p[0]) * 0.32, p[1] + (G[1] - p[1]) * 0.32, labs[i], labs[i] === '?' || /x/.test(labs[i]), 12); });
  return b;
}
// parallelogram ABCD with optional angle labels / diagonals
function pgramFig(labs = {}, diag = false) {
  const A = [30, 130], B = [190, 130], Cc = [240, 40], D = [80, 40];
  let b = `<polygon points="${[A, B, Cc, D].map((p) => p.join(',')).join(' ')}" class="f-soft"/>`;
  if (diag) b += ln(A[0], A[1], Cc[0], Cc[1], 'f-line', 1.2) + ln(B[0], B[1], D[0], D[1], 'f-line', 1.2) + tt(135, 98, 'E', false, 12);
  b += tt(20, 140, 'A') + tt(200, 142, 'B') + tt(250, 32, 'C') + tt(72, 30, 'D');
  if (labs.A) b += tt(62, 118, labs.A, true, 12); if (labs.B) b += tt(190, 117, labs.B, true, 12); if (labs.C) b += tt(208, 52, labs.C, true, 12); if (labs.D) b += tt(85, 54, labs.D, true, 12);
  if (labs.AE) b += tt(70, 98, labs.AE, true, 12); if (labs.EC) b += tt(200, 78, labs.EC, true, 12);
  return SV(270, 155, b);
}

const G8 = [
  {
    id: 'g8-pythagoras', grade: 8,
    name: T('畢氏定理', 'The Pythagorean theorem'),
    cur: { us: 'CCSS 8.G.B.7–8', tw: '八年級 畢氏定理', aops: 'Prealgebra' },
    gen(r) {
      const k = r.int(0, 5), [a, b, c] = r.pick(TRIPLES), s = r.int(1, Math.max(1, Math.floor(45 / c))), A = a * s, B = b * s, Cc = c * s;
      const thm = T('畢氏定理：直角三角形中，兩股的平方和 = 斜邊的平方（a² + b² = c²）。', 'Pythagorean theorem: in a right triangle, leg² + leg² = hypotenuse² (a² + b² = c²).');
      if (k === 0) return {
        q: T(`直角三角形的兩股長是 ${A} 和 ${B}，斜邊長是多少？`, `A right triangle has legs ${A} and ${B}. How long is the hypotenuse?`),
        fig: rightTri(A, B, '?'), ans: ansNum(Cc),
        sol: [thm, T(`${A}² + ${B}² = ${A * A} + ${B * B} = ${Cc * Cc}。`, `${A}² + ${B}² = ${A * A} + ${B * B} = ${Cc * Cc}.`), T(`斜邊 = √${Cc * Cc} = ${Cc}（因為 ${Cc} × ${Cc} = ${Cc * Cc}）。`, `Hypotenuse = √${Cc * Cc} = ${Cc} (since ${Cc} × ${Cc} = ${Cc * Cc}).`)],
      };
      if (k === 1) return {
        q: T(`直角三角形的斜邊長 ${Cc}，一股長 ${A}，另一股長是多少？`, `A right triangle has hypotenuse ${Cc} and one leg ${A}. How long is the other leg?`),
        fig: rightTri(A, '?', Cc), ans: ansNum(B),
        sol: [thm, T(`另一股² = 斜邊² − 已知股² = ${Cc}² − ${A}² = ${Cc * Cc} − ${A * A} = ${B * B}。`, `Other leg² = hypotenuse² − known leg² = ${Cc}² − ${A}² = ${Cc * Cc} − ${A * A} = ${B * B}.`), T(`另一股 = √${B * B} = ${B}。`, `Other leg = √${B * B} = ${B}.`), T(`驗算：${A}² + ${B}² = ${Cc * Cc} = ${Cc}² ✓`, `Check: ${A}² + ${B}² = ${Cc * Cc} = ${Cc}² ✓`)],
      };
      if (k === 2) {
        let x, y, kk, rr; do { x = r.int(1, 12); y = r.int(1, 12); [kk, rr] = simpRoot(x * x + y * y); } while (rr === 1);
        return {
          q: T(`直角三角形的兩股長是 ${x} 和 ${y}，斜邊長是多少？（用最簡根式表示）`, `A right triangle has legs ${x} and ${y}. Find the hypotenuse in simplest radical form.`),
          fig: rightTri(x, y, '?'), ans: ansNum(Math.sqrt(x * x + y * y), radText(kk, rr)),
          sol: [thm, T(`斜邊² = ${x}² + ${y}² = ${x * x} + ${y * y} = ${x * x + y * y}。`, `Hypotenuse² = ${x}² + ${y}² = ${x * x} + ${y * y} = ${x * x + y * y}.`), kk > 1 ? T(`√${x * x + y * y} = √(${kk * kk} × ${rr}) = ${rad(kk, rr)}。`, `√${x * x + y * y} = √(${kk * kk} × ${rr}) = ${rad(kk, rr)}.`) : T(`${x * x + y * y} 沒有大於 1 的平方因數，所以就是 ${rad(1, rr)}。`, `${x * x + y * y} has no square factor bigger than 1, so it stays ${rad(1, rr)}.`), T(`答案：${rad(kk, rr)}（約 ${num(+Math.sqrt(x * x + y * y).toFixed(2))}）。`, `Answer: ${rad(kk, rr)} (about ${num(+Math.sqrt(x * x + y * y).toFixed(2))}).`)],
        };
      }
      if (k === 3) {
        const [p, q, h] = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [9, 12, 15], [7, 24, 25], [8, 15, 17]]);
        return {
          q: T(`一把 ${h} 公尺長的梯子斜靠在牆上，梯腳離牆 ${p} 公尺。梯子頂端離地面多高（公尺）？`, `A ${h} m ladder leans against a wall with its foot ${p} m from the wall. How high up the wall does the ladder reach (m)?`),
          fig: rightTri(`${p}`, '?', `${h}`), ans: ansNum(q),
          sol: [T('牆、地面、梯子圍成直角三角形，梯子是斜邊。', 'The wall, the ground and the ladder form a right triangle; the ladder is the hypotenuse.'), T(`高² = ${h}² − ${p}² = ${h * h} − ${p * p} = ${q * q}。`, `Height² = ${h}² − ${p}² = ${h * h} − ${p * p} = ${q * q}.`), T(`高 = ${q} 公尺。`, `Height = ${q} m.`)],
        };
      }
      if (k === 4) {
        const [p, q, h] = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [4, 3, 5], [8, 6, 10]]), sx = r.sign(), sy = r.sign(), x1 = r.int(-3, 3), y1 = r.int(-3, 3), x2 = x1 + sx * p, y2 = y1 + sy * q;
        const inside = Math.max(...[x1, y1, x2, y2].map(Math.abs)) <= 9;
        return {
          q: T(`求 A(${num(x1)}, ${num(y1)}) 和 B(${num(x2)}, ${num(y2)}) 兩點的距離。`, `Find the distance between A(${num(x1)}, ${num(y1)}) and B(${num(x2)}, ${num(y2)}).`),
          fig: inside ? grid(10, [{ x: x1, y: y1, label: 'A' }, { x: x2, y: y2, label: 'B' }]) : '', ans: ansNum(h),
          sol: [T('把 AB 當成直角三角形的斜邊：水平股 = x 的差，鉛直股 = y 的差。', 'Make AB the hypotenuse of a right triangle: horizontal leg = difference in x, vertical leg = difference in y.'), T(`水平：|${num(x2)} − ${par(x1)}| = ${p}；鉛直：|${num(y2)} − ${par(y1)}| = ${q}。`, `Horizontal: |${num(x2)} − ${par(x1)}| = ${p}; vertical: |${num(y2)} − ${par(y1)}| = ${q}.`), T(`AB = √(${p}² + ${q}²) = √${h * h} = ${h}。`, `AB = √(${p}² + ${q}²) = √${h * h} = ${h}.`)],
        };
      }
      const right = r.chance(0.5), sides = right ? [A, B, Cc] : [A, B, Cc + r.pick([-1, 1])];
      const yes = T('是直角三角形', 'Yes, it is a right triangle'), no = T('不是直角三角形', 'No, it is not a right triangle');
      return {
        q: T(`三邊長是 ${sides.join('、')} 的三角形是直角三角形嗎？`, `Is a triangle with sides ${sides.join(', ')} a right triangle?`),
        ans: ansChoice(right ? [yes, no] : [no, yes]),
        sol: [T('畢氏定理的逆定理：如果兩短邊的平方和 = 最長邊的平方，就是直角三角形。', 'Converse of the Pythagorean theorem: if the two shorter sides squared add up to the longest side squared, it is a right triangle.'), T(`${sides[0]}² + ${sides[1]}² = ${sides[0] ** 2} + ${sides[1] ** 2} = ${sides[0] ** 2 + sides[1] ** 2}。`, `${sides[0]}² + ${sides[1]}² = ${sides[0] ** 2} + ${sides[1] ** 2} = ${sides[0] ** 2 + sides[1] ** 2}.`), T(`${sides[2]}² = ${sides[2] ** 2}，${right ? '相等，所以是直角三角形' : '不相等，所以不是直角三角形'}。`, `${sides[2]}² = ${sides[2] ** 2}: ${right ? 'equal, so it IS a right triangle' : 'not equal, so it is NOT a right triangle'}.`)],
      };
    },
  },
  {
    id: 'g8-radicals', grade: 8,
    name: T('平方根與根式化簡', 'Square roots and simplifying radicals'),
    cur: { us: 'CCSS 8.EE.A.2 / 8.NS.A.2', tw: '八年級 平方根與近似值、根式的運算', aops: 'Prealgebra' },
    gen(r) {
      const k = r.int(0, 5), SF = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15];
      if (k === 0) {
        let kk, rr; do { kk = r.int(2, 10); rr = r.pick(SF); } while (kk * kk * rr > 1000);
        const n = kk * kk * rr;
        return {
          q: T(`化簡 ${sqrt(n)}（用最簡根式表示）。`, `Simplify ${sqrt(n)} (simplest radical form).`), ans: ansNum(Math.sqrt(n), radText(kk, rr)),
          sol: [T(`找出 ${n} 裡面最大的完全平方因數，把它開出來。`, `Find the largest perfect-square factor of ${n} and take its root out.`), T(`${n} = ${kk * kk} × ${rr}，其中 ${kk * kk} = ${kk}²。`, `${n} = ${kk * kk} × ${rr}, and ${kk * kk} = ${kk}².`), T(`${sqrt(n)} = ${sqrt(kk * kk)} × ${sqrt(rr)} = ${rad(kk, rr)}。`, `${sqrt(n)} = ${sqrt(kk * kk)} × ${sqrt(rr)} = ${rad(kk, rr)}.`), T(`檢查：${rr} 已經沒有平方因數了，是最簡根式 ✓`, `Check: ${rr} has no square factor left, so this is simplest form ✓`)],
        };
      }
      if (k === 1) {
        let n; do n = r.int(5, 250); while (Number.isInteger(Math.sqrt(n)));
        const m = Math.floor(Math.sqrt(n));
        return {
          q: T(`${sqrt(n)} 介於哪兩個連續整數之間？請回答較小的那個整數。`, `${sqrt(n)} lies between two consecutive integers. What is the smaller one?`), ans: ansNum(m),
          sol: [T(`找出 ${n} 附近的完全平方數。`, `Find the perfect squares around ${n}.`), T(`${m}² = ${m * m} < ${n} < ${(m + 1) ** 2} = ${m + 1}²。`, `${m}² = ${m * m} < ${n} < ${(m + 1) ** 2} = ${m + 1}².`), T(`所以 ${m} < ${sqrt(n)} < ${m + 1}，較小的是 ${m}。`, `So ${m} < ${sqrt(n)} < ${m + 1}; the smaller integer is ${m}.`)],
        };
      }
      if (k === 2) {
        const rr = r.pick([2, 3, 5, 6, 7]); let a, b; do { a = r.int(1, 6); b = r.int(1, 6); } while (a === b);
        const plus = r.chance(0.5), [p, q] = plus ? [a, b] : [Math.max(a, b), Math.min(a, b)], v = plus ? p + q : p - q;
        return {
          q: T(`化簡 ${sqrt(p * p * rr)} ${plus ? '+' : '−'} ${sqrt(q * q * rr)}（用最簡根式表示）。`, `Simplify ${sqrt(p * p * rr)} ${plus ? '+' : '−'} ${sqrt(q * q * rr)} (simplest radical form).`), ans: ansNum(v * Math.sqrt(rr), radText(v, rr)),
          sol: [T('先把每個根式化成最簡根式，再合併「同類根式」（根號裡一樣的）。', 'Simplify each radical first, then combine like radicals (same number under the root).'), T(`${sqrt(p * p * rr)} = ${rad(p, rr)}，${sqrt(q * q * rr)} = ${rad(q, rr)}。`, `${sqrt(p * p * rr)} = ${rad(p, rr)}, ${sqrt(q * q * rr)} = ${rad(q, rr)}.`), T(`${rad(p, rr)} ${plus ? '+' : '−'} ${rad(q, rr)} = (${p} ${plus ? '+' : '−'} ${q})${sqrt(rr)} = ${rad(v, rr)}。`, `${rad(p, rr)} ${plus ? '+' : '−'} ${rad(q, rr)} = (${p} ${plus ? '+' : '−'} ${q})${sqrt(rr)} = ${rad(v, rr)}.`), T(`注意：${sqrt(p * p * rr)} ${plus ? '+' : '−'} ${sqrt(q * q * rr)} ≠ ${sqrt(plus ? (p * p + q * q) * rr : (p * p - q * q) * rr)}，根號不能直接相${plus ? '加' : '減'}。`, `Careful: ${sqrt(p * p * rr)} ${plus ? '+' : '−'} ${sqrt(q * q * rr)} ≠ ${sqrt(plus ? (p * p + q * q) * rr : (p * p - q * q) * rr)} — you can't ${plus ? 'add' : 'subtract'} under the root.`)],
        };
      }
      if (k === 3) {
        let x, y; do { x = r.int(2, 18); y = r.int(2, 18); } while (x === y || Number.isInteger(Math.sqrt(x)) || Number.isInteger(Math.sqrt(y)));
        const [kk, rr] = simpRoot(x * y);
        return {
          q: T(`計算 ${sqrt(x)} × ${sqrt(y)}（用最簡根式表示）。`, `Compute ${sqrt(x)} × ${sqrt(y)} (simplest radical form).`), ans: ansNum(Math.sqrt(x * y), radText(kk, rr)),
          sol: [T('根式相乘：√a × √b = √(ab)。', 'Multiplying roots: √a × √b = √(ab).'), T(`${sqrt(x)} × ${sqrt(y)} = ${sqrt(x * y)}。`, `${sqrt(x)} × ${sqrt(y)} = ${sqrt(x * y)}.`), rr === 1 ? T(`${x * y} = ${kk}²，所以等於 ${kk}。`, `${x * y} = ${kk}², so it equals ${kk}.`) : kk > 1 ? T(`${x * y} = ${kk * kk} × ${rr}，所以 ${sqrt(x * y)} = ${rad(kk, rr)}。`, `${x * y} = ${kk * kk} × ${rr}, so ${sqrt(x * y)} = ${rad(kk, rr)}.`) : T(`${x * y} 沒有平方因數，答案就是 ${sqrt(x * y)}。`, `${x * y} has no square factor, so the answer is ${sqrt(x * y)}.`)],
        };
      }
      if (k === 4) {
        const b = r.pick([2, 3, 5, 6, 7, 10]), kk = r.int(1, 6), a = kk * b;
        return {
          q: T(`把 ${fx(a, sqrt(b))} 的分母有理化，並化成最簡根式。`, `Rationalize the denominator of ${fx(a, sqrt(b))} and simplify.`), ans: ansNum(a / Math.sqrt(b), radText(kk, b)),
          sol: [T(`分子分母同乘 ${sqrt(b)}，讓分母變成整數。`, `Multiply top and bottom by ${sqrt(b)} so the denominator becomes a whole number.`), T(`${fx(a, sqrt(b))} = ${fx(`${a}${sqrt(b)}`, `${sqrt(b)} × ${sqrt(b)}`)} = ${fx(`${a}${sqrt(b)}`, b)}。`, `${fx(a, sqrt(b))} = ${fx(`${a}${sqrt(b)}`, `${sqrt(b)} × ${sqrt(b)}`)} = ${fx(`${a}${sqrt(b)}`, b)}.`), T(`約分：${a} ÷ ${b} = ${kk}，答案 ${rad(kk, b)}。`, `Reduce: ${a} ÷ ${b} = ${kk}, so the answer is ${rad(kk, b)}.`)],
        };
      }
      let n; do n = r.int(3, 99); while (Number.isInteger(Math.sqrt(n)));
      const m = Math.floor(Math.sqrt(n)), t = Math.floor(Math.sqrt(n) * 10) / 10, mid = clean(t + 0.05), v = Math.round(Math.sqrt(n) * 10) / 10;
      return {
        q: T(`求 ${sqrt(n)} 的近似值，四捨五入到小數第一位。`, `Estimate ${sqrt(n)}, rounded to the nearest tenth.`), ans: ansNum(v),
        sol: [T(`${m}² = ${m * m}，${m + 1}² = ${(m + 1) ** 2}，所以 ${sqrt(n)} 在 ${m} 和 ${m + 1} 之間。`, `${m}² = ${m * m} and ${m + 1}² = ${(m + 1) ** 2}, so ${sqrt(n)} is between ${m} and ${m + 1}.`), T(`試小數第一位：${num(t)}² = ${num(clean(t * t))} ≤ ${n} < ${num(clean(t + 0.1))}² = ${num(clean((t + 0.1) ** 2))}。`, `Try tenths: ${num(t)}² = ${num(clean(t * t))} ≤ ${n} < ${num(clean(t + 0.1))}² = ${num(clean((t + 0.1) ** 2))}.`), T(`要四捨五入，看中間值 ${num(mid)}：${num(mid)}² = ${num(clean(mid * mid))}，${n} ${n < mid * mid ? '比它小，捨去' : '比它大，進位'}。`, `To round, check the midpoint ${num(mid)}: ${num(mid)}² = ${num(clean(mid * mid))}, and ${n} is ${n < mid * mid ? 'smaller, so round down' : 'bigger, so round up'}.`), T(`${sqrt(n)} ≈ ${num(v)}。`, `${sqrt(n)} ≈ ${num(v)}.`)],
      };
    },
  },
  {
    id: 'g8-slope', grade: 8,
    name: T('斜率與直線方程式', 'Slope and equations of lines'),
    cur: { us: 'CCSS 8.EE.B.6 / 8.F.B.4', tw: '八年級 線型函數與其圖形', aops: 'Intro Algebra' },
    gen(r) {
      const k = r.int(0, 4);
      if (k === 0) {
        let x1, y1, x2, y2; do { x1 = r.int(-8, 8); y1 = r.int(-8, 8); x2 = r.int(-8, 8); y2 = r.int(-8, 8); } while (x1 === x2 || y1 === y2);
        const dy = y2 - y1, dx = x2 - x1, [n, d] = red(dy, dx);
        return {
          q: T(`求通過 (${num(x1)}, ${num(y1)}) 和 (${num(x2)}, ${num(y2)}) 的直線斜率。（用最簡分數或整數）`, `Find the slope of the line through (${num(x1)}, ${num(y1)}) and (${num(x2)}, ${num(y2)}). (Lowest terms or an integer.)`),
          ans: ansNum([n, d]),
          sol: [T('斜率 m = y 的變化量 ÷ x 的變化量 = (y₂ − y₁) ÷ (x₂ − x₁)。', 'Slope m = change in y ÷ change in x = (y₂ − y₁) ÷ (x₂ − x₁).'), T(`y 的變化：${num(y2)} − ${par(y1)} = ${num(dy)}；x 的變化：${num(x2)} − ${par(x1)} = ${num(dx)}。`, `Change in y: ${num(y2)} − ${par(y1)} = ${num(dy)}; change in x: ${num(x2)} − ${par(x1)} = ${num(dx)}.`), T(`m = ${eqR(dy, dx)}。`, `m = ${eqR(dy, dx)}.`), T(`斜率${n * d > 0 ? '為正，直線往右上升' : '為負，直線往右下降'}。`, `The slope is ${n * d > 0 ? 'positive: the line rises to the right' : 'negative: the line falls to the right'}.`)],
        };
      }
      if (k === 1) {
        const m = r.pick([[1, 1], [2, 1], [3, 1], [-1, 1], [-2, 1], [-3, 1], [1, 2], [-1, 2], [3, 2], [-3, 2], [2, 3], [-2, 3]]), b = r.int(-4, 4), [n, d] = m;
        const p1 = { x: 0, y: b, label: '' }, p2 = { x: d, y: b + n };
        if (Math.abs(b + n) > 6) return this.gen(r);
        return {
          q: T('圖中直線的方程式是哪一個？', 'Which equation describes the line in the graph?'),
          fig: grid(6, [p1, p2], [{ m: n / d, b }]),
          ans: choice(yEq(m, b), yEq([-n, d], b), yEq(m, -b === b ? b + 1 : -b), yEq([d, n], b), d === 1 && b ? `y = ${term(b, 'x', 1, true)} ${sgn(n)}` : yEq([n, d], b + 2)),
          sol: [T('先找 y 截距：直線和 y 軸交在哪裡。', 'First the y-intercept: where the line crosses the y-axis.'), T(`直線通過 (0, ${num(b)})，所以 b = ${num(b)}。`, `It passes through (0, ${num(b)}), so b = ${num(b)}.`), T(`再找斜率：從 (0, ${num(b)}) 往右 ${d} 格，${n > 0 ? `往上 ${n}` : `往下 ${-n}`} 格到 (${d}, ${num(b + n)})，m = ${eqR(n, d)}。`, `Now the slope: from (0, ${num(b)}) go right ${d} and ${n > 0 ? `up ${n}` : `down ${-n}`} to (${d}, ${num(b + n)}), so m = ${eqR(n, d)}.`), T(`方程式：${yEq(m, b)}。`, `Equation: ${yEq(m, b)}.`)],
        };
      }
      if (k === 2) {
        const m = r.nz(-4, 4), b = r.int(-8, 8); let x1, x2; do { x1 = r.int(-5, 5); x2 = r.int(-5, 5); } while (x1 === x2);
        const y1 = m * x1 + b, y2 = m * x2 + b;
        return {
          q: T(`通過 (${num(x1)}, ${num(y1)}) 和 (${num(x2)}, ${num(y2)}) 的直線方程式是哪一個？`, `Which is the equation of the line through (${num(x1)}, ${num(y1)}) and (${num(x2)}, ${num(y2)})?`),
          ans: choice(yEq([m, 1], b), yEq([-m, 1], b), yEq([m, 1], y1 - m * x1 === b ? b + m * 2 : 0), yEq([1, m], b), yEq([m, 1], y1)),
          sol: [T(`斜率：m = (${num(y2)} − ${par(y1)}) ÷ (${num(x2)} − ${par(x1)}) = ${num(y2 - y1)} ÷ ${par(x2 - x1)} = ${num(m)}。`, `Slope: m = (${num(y2)} − ${par(y1)}) ÷ (${num(x2)} − ${par(x1)}) = ${num(y2 - y1)} ÷ ${par(x2 - x1)} = ${num(m)}.`), T(`把 (${num(x1)}, ${num(y1)}) 代入 y = ${mono(m)} + b：${num(y1)} = ${num(m * x1)} + b，b = ${num(b)}。`, `Put (${num(x1)}, ${num(y1)}) into y = ${mono(m)} + b: ${num(y1)} = ${num(m * x1)} + b, so b = ${num(b)}.`), T(`方程式：${yEq([m, 1], b)}。`, `Equation: ${yEq([m, 1], b)}.`), T(`驗算另一點：${num(m)} × ${par(x2)} ${sgn(b)} = ${num(y2)} ✓`, `Check the other point: ${num(m)} × ${par(x2)} ${sgn(b)} = ${num(y2)} ✓`)],
        };
      }
      if (k === 3) {
        const m = r.nz(-5, 5), p = r.nz(-6, 6), b = r.int(-10, 10), q = m * p + b;
        return {
          q: T(`一條直線的斜率是 ${num(m)}，並通過點 (${num(p)}, ${num(q)})。它的 y 截距 b 是多少？`, `A line has slope ${num(m)} and passes through (${num(p)}, ${num(q)}). What is its y-intercept b?`), ans: ansNum(b),
          sol: [T(`斜截式 y = mx + b，已知 m = ${num(m)}。`, `Slope-intercept form y = mx + b with m = ${num(m)}.`), T(`代入點：${num(q)} = ${num(m)} × ${par(p)} + b = ${num(m * p)} + b。`, `Substitute the point: ${num(q)} = ${num(m)} × ${par(p)} + b = ${num(m * p)} + b.`), T(`b = ${num(q)} − ${par(m * p)} = ${num(b)}。`, `b = ${num(q)} − ${par(m * p)} = ${num(b)}.`)],
        };
      }
      if (r.chance(0.5)) {
        const base = r.pick([70, 85, 100, 120]), rate = r.pick([15, 20, 25, 30]), d1 = r.int(2, 6), d2 = d1 + r.int(2, 8), f1 = base + rate * d1, f2 = base + rate * d2, askRate = r.chance(0.5);
        return {
          q: T(`某城市計程車的車資是里程的線型函數：坐 ${d1} 公里要 ${f1} 元，坐 ${d2} 公里要 ${f2} 元。${askRate ? '每公里多收多少元？' : '起跳價（0 公里時的車資）是多少元？'}`, `A city's taxi fare is a linear function of distance: ${d1} km costs $${f1} and ${d2} km costs $${f2}. ${askRate ? 'How much is charged per extra kilometer?' : 'What is the starting fare (the fare at 0 km)?'}`),
          ans: ansNum(askRate ? rate : base),
          sol: [T(`每公里的費用就是斜率：(${f2} − ${f1}) ÷ (${d2} − ${d1}) = ${f2 - f1} ÷ ${d2 - d1} = ${rate} 元／公里。`, `The cost per km is the slope: (${f2} − ${f1}) ÷ (${d2} − ${d1}) = ${f2 - f1} ÷ ${d2 - d1} = $${rate} per km.`), T(`起跳價是 y 截距：${f1} − ${rate} × ${d1} = ${base} 元。`, `The starting fare is the y-intercept: ${f1} − ${rate} × ${d1} = $${base}.`), T(`車資 y = ${rate}x + ${base}。驗算：${rate} × ${d2} + ${base} = ${f2} ✓`, `Fare y = ${rate}x + ${base}. Check: ${rate} × ${d2} + ${base} = ${f2} ✓`)],
        };
      }
      const h0 = r.pick([20, 24, 25, 30, 36]), rt = r.pick([2, 3, 4]), t1 = r.int(1, 3), t2 = t1 + r.int(1, 3), h1 = h0 - rt * t1, h2 = h0 - rt * t2;
      if (h2 <= 0) return this.gen(r);
      return {
        q: T(`一根蠟燭點燃後高度穩定下降：點燃 ${t1} 小時後高 ${h1} 公分，${t2} 小時後高 ${h2} 公分。蠟燭原來（點燃前）多高？`, `A candle burns down at a steady rate. After ${t1} hours it is ${h1} cm tall and after ${t2} hours it is ${h2} cm tall. How tall was it before it was lit?`),
        ans: ansNum(h0),
        sol: [T(`高度每小時的變化（斜率）：(${h2} − ${h1}) ÷ (${t2} − ${t1}) = ${num(h2 - h1)} ÷ ${t2 - t1} = ${num(-rt)} 公分／小時。`, `Change per hour (slope): (${h2} − ${h1}) ÷ (${t2} − ${t1}) = ${num(h2 - h1)} ÷ ${t2 - t1} = ${num(-rt)} cm per hour.`), T(`往回推 ${t1} 小時：${h1} + ${rt} × ${t1} = ${h0} 公分。`, `Go back ${t1} hour(s): ${h1} + ${rt} × ${t1} = ${h0} cm.`), T(`高度 y = ${h0} − ${rt}x。驗算：${h0} − ${rt} × ${t2} = ${h2} ✓`, `Height y = ${h0} − ${rt}x. Check: ${h0} − ${rt} × ${t2} = ${h2} ✓`)],
      };
    },
  },
  {
    id: 'g8-functions', grade: 8,
    name: T('函數與線型函數', 'Functions and linear functions'),
    cur: { us: 'CCSS 8.F.A.1–3', tw: '八年級 函數與線型函數', aops: 'Intro Algebra' },
    gen(r) {
      const k = r.int(0, 3);
      if (k === 0) {
        const xs = r.sample(range(-5, 6), 4), mk = (pairs) => `{${pairs.map(([x, y]) => `(${num(x)}, ${num(y)})`).join(', ')}}`;
        const good = xs.map((x) => [x, r.int(-5, 6)]);
        const bad = () => { const p = good.map(([x]) => [x, r.int(-5, 6)]); const i = r.int(1, 3); p[i] = [p[0][0], p[0][1] + r.nz(-3, 3)]; return r.shuffle(p); };
        const b1 = bad(), b2 = bad(), b3 = bad();
        return {
          q: T('下列哪一組數對表示「y 是 x 的函數」？', 'Which set of ordered pairs (x, y) shows y as a function of x?'),
          ans: choice(mk(good), mk(b1), mk(b2), mk(b3)),
          sol: [T('函數：每一個 x 只能對應到「唯一」一個 y。', 'Function: each x must go to exactly ONE y.'), T('所以只要看有沒有相同的 x 配到不同的 y。（不同的 x 配到相同的 y 沒關係。）', 'So look for a repeated x with different y-values. (Different x with the same y is fine.)'), T(`${mk(good)} 的 x 都不同，是函數。`, `In ${mk(good)} every x is different, so it is a function.`), T(`其他選項都有同一個 x 對到兩個 y，例如 ${mk(b1)}。`, `Each other choice has one x paired with two y-values, e.g. ${mk(b1)}.`)],
        };
      }
      if (k === 1) {
        const a = r.nz(-6, 6), b = r.int(-10, 10), x = r.nz(-6, 6), v = a * x + b;
        return {
          q: T(`線型函數 f(x) = ${lin(a, b)}，求 f(${num(x)})。`, `For the linear function f(x) = ${lin(a, b)}, find f(${num(x)}).`), ans: ansNum(v),
          sol: [T(`f(${num(x)}) 表示把 x 換成 ${par(x)}。`, `f(${num(x)}) means replace x with ${par(x)}.`), T(`f(${num(x)}) = ${num(a)} × ${par(x)} ${sgn(b)} = ${num(a * x)} ${sgn(b)} = ${num(v)}。`, `f(${num(x)}) = ${num(a)} × ${par(x)} ${sgn(b)} = ${num(a * x)} ${sgn(b)} = ${num(v)}.`), T(`答案：${num(v)}。`, `Answer: ${num(v)}.`)],
        };
      }
      if (k === 2) {
        const a = r.nz(-5, 5), b = r.int(-10, 10); let p, s, u; do { p = r.int(-5, 5); s = r.int(-5, 5); u = r.int(-8, 8); } while (p === s || u === p || u === s);
        const q = a * p + b, t = a * s + b, v = a * u + b;
        return {
          q: T(`線型函數 f(x) = ax + b 滿足 f(${num(p)}) = ${num(q)}、f(${num(s)}) = ${num(t)}。求 f(${num(u)})。`, `A linear function f(x) = ax + b has f(${num(p)}) = ${num(q)} and f(${num(s)}) = ${num(t)}. Find f(${num(u)}).`), ans: ansNum(v),
          sol: [T(`列出：${num(p)}a + b = ${num(q)}，${num(s)}a + b = ${num(t)}。`, `Write: ${num(p)}a + b = ${num(q)} and ${num(s)}a + b = ${num(t)}.`), T(`兩式相減：(${num(p)} − ${par(s)})a = ${num(q)} − ${par(t)} → ${num(p - s)}a = ${num(q - t)} → a = ${num(a)}。`, `Subtract: (${num(p)} − ${par(s)})a = ${num(q)} − ${par(t)} → ${num(p - s)}a = ${num(q - t)} → a = ${num(a)}.`), T(`代回：b = ${num(q)} − ${num(a)} × ${par(p)} = ${num(b)}，所以 f(x) = ${lin(a, b)}。`, `Back-substitute: b = ${num(q)} − ${num(a)} × ${par(p)} = ${num(b)}, so f(x) = ${lin(a, b)}.`), T(`f(${num(u)}) = ${num(a)} × ${par(u)} ${sgn(b)} = ${num(v)}。`, `f(${num(u)}) = ${num(a)} × ${par(u)} ${sgn(b)} = ${num(v)}.`)],
        };
      }
      const a = r.nz(-6, 6), b = r.nz(-10, 10), x = r.int(-8, 8), v = a * x + b;
      return {
        q: T(`f(x) = ${lin(a, b)}。當 f(x) = ${num(v)} 時，x 是多少？`, `f(x) = ${lin(a, b)}. For which x is f(x) = ${num(v)}?`), ans: ansNum(x, `x = ${x}`),
        sol: [T(`列方程式：${lin(a, b)} = ${num(v)}。`, `Set up: ${lin(a, b)} = ${num(v)}.`), T(`${mono(a)} = ${num(v)} ${sgn(-b)} = ${num(v - b)}。`, `${mono(a)} = ${num(v)} ${sgn(-b)} = ${num(v - b)}.`), T(`x = ${num(v - b)} ÷ ${par(a)} = ${num(x)}。驗算：f(${num(x)}) = ${num(v)} ✓`, `x = ${num(v - b)} ÷ ${par(a)} = ${num(x)}. Check: f(${num(x)}) = ${num(v)} ✓`)],
      };
    },
  },
  {
    id: 'g8-system-word', grade: 8,
    name: T('聯立方程式應用題', 'Systems of equations word problems'),
    cur: { us: 'CCSS 8.EE.C.8c', tw: '七年級 二元一次聯立方程式的應用', aops: 'Intro Algebra' },
    at: { tw: 7 },
    gen(r) {
      const k = r.int(0, 4);
      if (k === 0) {
        const A = r.pick([250, 300, 350, 400]), Cp = r.pick([100, 150, 200]), x = r.int(5, 40), y = r.int(5, 40), N = x + y, R = A * x + Cp * y, askA = r.chance(0.5);
        return {
          q: T(`音樂會全票每張 ${A} 元、兒童票每張 ${Cp} 元。某天共賣出 ${N} 張票，收入 ${num(R)} 元。賣出幾張${askA ? '全票' : '兒童票'}？`, `Concert tickets cost $${A} for adults and $${Cp} for children. One day ${N} tickets were sold for $${num(R)} in total. How many ${askA ? 'adult' : 'child'} tickets were sold?`),
          ans: ansNum(askA ? x : y),
          sol: [T(`設全票 x 張、兒童票 y 張。`, `Let x = adult tickets and y = child tickets.`), T(`張數：x + y = ${N}；收入：${A}x + ${Cp}y = ${num(R)}。`, `Count: x + y = ${N}. Money: ${A}x + ${Cp}y = ${num(R)}.`), T(`第一式乘 ${Cp}：${Cp}x + ${Cp}y = ${num(Cp * N)}。兩式相減：${A - Cp}x = ${num(R - Cp * N)}，x = ${x}。`, `Multiply the first by ${Cp}: ${Cp}x + ${Cp}y = ${num(Cp * N)}. Subtract: ${A - Cp}x = ${num(R - Cp * N)}, so x = ${x}.`), T(`y = ${N} − ${x} = ${y}。`, `y = ${N} − ${x} = ${y}.`), T(`驗算：${A} × ${x} + ${Cp} × ${y} = ${num(A * x)} + ${num(Cp * y)} = ${num(R)} ✓`, `Check: ${A} × ${x} + ${Cp} × ${y} = ${num(A * x)} + ${num(Cp * y)} = ${num(R)} ✓`)],
        };
      }
      if (k === 1) {
        const c = r.int(3, 30), b = r.int(3, 30), H = c + b, L = 2 * c + 4 * b, askR = r.chance(0.5);
        return {
          q: T(`籠子裡有雞和兔子，共有 ${H} 個頭、${L} 隻腳。${askR ? '兔子' : '雞'}有幾隻？`, `A cage holds chickens and rabbits: ${H} heads and ${L} legs in all. How many ${askR ? 'rabbits' : 'chickens'} are there?`),
          ans: ansNum(askR ? b : c),
          sol: [T('設雞 x 隻、兔 y 隻。雞有 2 隻腳，兔有 4 隻腳。', 'Let x = chickens and y = rabbits. A chicken has 2 legs, a rabbit 4.'), T(`x + y = ${H}，2x + 4y = ${L}。`, `x + y = ${H} and 2x + 4y = ${L}.`), T(`第一式 ×2：2x + 2y = ${2 * H}，相減：2y = ${L - 2 * H}，y = ${b}。`, `First equation × 2: 2x + 2y = ${2 * H}. Subtract: 2y = ${L - 2 * H}, y = ${b}.`), T(`x = ${H} − ${b} = ${c}。驗算：2 × ${c} + 4 × ${b} = ${L} ✓`, `x = ${H} − ${b} = ${c}. Check: 2 × ${c} + 4 × ${b} = ${L} ✓`)],
        };
      }
      if (k === 2) {
        const nm = who(r), x = r.int(3, 25), y = r.int(3, 25), N = x + y, V = 5 * x + 10 * y, askTen = r.chance(0.5);
        return {
          q: T(`${nm[0]}的撲滿裡只有 5 元和 10 元硬幣，共 ${N} 枚，總共 ${V} 元。${askTen ? 10 : 5} 元硬幣有幾枚？`, `${nm[1]}'s piggy bank holds only 5-dollar and 10-dollar coins: ${N} coins worth $${V} in all. How many ${askTen ? '10-dollar' : '5-dollar'} coins are there?`),
          ans: ansNum(askTen ? y : x),
          sol: [T('設 5 元 x 枚、10 元 y 枚。', 'Let x = 5-dollar coins and y = 10-dollar coins.'), T(`x + y = ${N}，5x + 10y = ${V}。`, `x + y = ${N} and 5x + 10y = ${V}.`), T(`第一式 ×5：5x + 5y = ${5 * N}。相減：5y = ${V - 5 * N}，y = ${y}。`, `First × 5: 5x + 5y = ${5 * N}. Subtract: 5y = ${V - 5 * N}, so y = ${y}.`), T(`x = ${N} − ${y} = ${x}。驗算：5 × ${x} + 10 × ${y} = ${V} ✓`, `x = ${N} − ${y} = ${x}. Check: 5 × ${x} + 10 × ${y} = ${V} ✓`)],
        };
      }
      if (k === 3) {
        const s = r.int(4, 30), m = r.int(2, 4), c = r.int(1, 15), b = m * s + c, S = s + b;
        return {
          q: T(`兩個正整數的和是 ${S}，較大的數比較小的數的 ${m} 倍多 ${c}。較大的數是多少？`, `Two positive integers add up to ${S}. The larger is ${c} more than ${m} times the smaller. What is the larger number?`),
          ans: ansNum(b),
          sol: [T('設較小的數 x、較大的數 y。', 'Let x be the smaller number and y the larger.'), T(`x + y = ${S}，y = ${m}x + ${c}。`, `x + y = ${S} and y = ${m}x + ${c}.`), T(`代入：x + ${m}x + ${c} = ${S} → ${m + 1}x = ${S - c} → x = ${s}。`, `Substitute: x + ${m}x + ${c} = ${S} → ${m + 1}x = ${S - c} → x = ${s}.`), T(`y = ${m} × ${s} + ${c} = ${b}。驗算：${s} + ${b} = ${S} ✓`, `y = ${m} × ${s} + ${c} = ${b}. Check: ${s} + ${b} = ${S} ✓`)],
        };
      }
      const nm = who(r), p = r.int(10, 30), q = r.int(25, 80), a1 = r.int(2, 5), b1 = r.int(1, 4), a2 = r.int(2, 4), b2 = r.int(2, 6);
      if (a1 * b2 === a2 * b1 || a1 === a2) return this.gen(r);
      const pl = (n, w) => `${n} ${w}${n > 1 ? 's' : ''}`;
      const T1 = a1 * p + b1 * q, T2 = a2 * p + b2 * q;
      return {
        q: T(`${nm[0]}買 ${a1} 支筆和 ${b1} 本筆記本花了 ${T1} 元；${nm[0]}的朋友買 ${a2} 支筆和 ${b2} 本筆記本花了 ${T2} 元（單價相同）。一本筆記本多少元？`, `${nm[1]} paid $${T1} for ${pl(a1, 'pen')} and ${pl(b1, 'notebook')}. A friend paid $${T2} for ${pl(a2, 'pen')} and ${pl(b2, 'notebook')} (same prices). How much does one notebook cost?`),
        ans: ansNum(q),
        sol: [T('設筆每支 x 元、筆記本每本 y 元。', 'Let x = price of a pen and y = price of a notebook.'), T(`${a1}x + ${b1}y = ${T1}，${a2}x + ${b2}y = ${T2}。`, `${a1}x + ${b1}y = ${T1} and ${a2}x + ${b2}y = ${T2}.`), T(`消去 x：第一式 ×${a2}、第二式 ×${a1}：${a1 * a2}x + ${b1 * a2}y = ${T1 * a2}，${a1 * a2}x + ${b2 * a1}y = ${T2 * a1}。`, `Eliminate x: first × ${a2}, second × ${a1}: ${a1 * a2}x + ${b1 * a2}y = ${T1 * a2} and ${a1 * a2}x + ${b2 * a1}y = ${T2 * a1}.`), T(`相減：${num(b2 * a1 - b1 * a2)}y = ${num(T2 * a1 - T1 * a2)}，y = ${q}。`, `Subtract: ${num(b2 * a1 - b1 * a2)}y = ${num(T2 * a1 - T1 * a2)}, so y = ${q}.`), T(`筆：x = (${T1} − ${b1} × ${q}) ÷ ${a1} = ${p}。驗算：${a2} × ${p} + ${b2} × ${q} = ${T2} ✓`, `Pen: x = (${T1} − ${b1} × ${q}) ÷ ${a1} = ${p}. Check: ${a2} × ${p} + ${b2} × ${q} = ${T2} ✓`)],
      };
    },
  },
  {
    id: 'g8-volume', grade: 8,
    name: T('圓柱、圓錐與球的體積', 'Volume of cylinders, cones and spheres'),
    cur: { us: 'CCSS 8.G.C.9', aops: 'Intro Geometry' },
    gen(r) {
      const k = r.int(0, 4);
      if (k === 0) {
        const rr = r.int(2, 10), h = r.int(3, 20), v = rr * rr * h;
        return {
          q: T(`圓柱的底面半徑 ${rr} 公分、高 ${h} 公分，體積是多少立方公分？（用 π 表示）`, `A cylinder has radius ${rr} cm and height ${h} cm. What is its volume in cm³? (In terms of π.)`),
          fig: solidFig('cyl', `r=${rr}`, `h=${h}`), ans: piAns(v),
          sol: [T('圓柱體積 = 底面積 × 高 = πr²h。', 'Cylinder volume = base area × height = πr²h.'), T(`底面積 = π × ${rr}² = ${piT(rr * rr)}。`, `Base area = π × ${rr}² = ${piT(rr * rr)}.`), T(`體積 = ${piT(rr * rr)} × ${h} = ${piT(v)} 立方公分。`, `Volume = ${piT(rr * rr)} × ${h} = ${piT(v)} cm³.`)],
        };
      }
      if (k === 1) {
        let rr, h; do { rr = r.int(2, 10); h = r.int(3, 21); } while ((rr * rr * h) % 3);
        const v = (rr * rr * h) / 3;
        return {
          q: T(`圓錐的底面半徑 ${rr} 公分、高 ${h} 公分，體積是多少立方公分？（用 π 表示）`, `A cone has radius ${rr} cm and height ${h} cm. What is its volume in cm³? (In terms of π.)`),
          fig: solidFig('cone', `r=${rr}`, `h=${h}`), ans: piAns(v),
          sol: [T('圓錐體積是同底同高圓柱的三分之一：V = ⅓πr²h。', 'A cone holds one third of the cylinder with the same base and height: V = ⅓πr²h.'), T(`πr²h = π × ${rr * rr} × ${h} = ${piT(rr * rr * h)}。`, `πr²h = π × ${rr * rr} × ${h} = ${piT(rr * rr * h)}.`), T(`÷ 3：${piT(v)} 立方公分。`, `Divide by 3: ${piT(v)} cm³.`)],
        };
      }
      if (k === 2) {
        const rr = r.pick([3, 6, 9, 12]), dia = r.chance(0.4), v = (4 * rr ** 3) / 3;
        return {
          q: dia ? T(`一顆球的直徑是 ${2 * rr} 公分，體積是多少立方公分？（用 π 表示）`, `A ball has diameter ${2 * rr} cm. What is its volume in cm³? (In terms of π.)`) : T(`球的半徑是 ${rr} 公分，體積是多少立方公分？（用 π 表示）`, `A sphere has radius ${rr} cm. What is its volume in cm³? (In terms of π.)`),
          fig: solidFig('sphere', `r=${rr}`), ans: piAns(v),
          sol: [T('球體積 V = ⁴⁄₃πr³。', 'Sphere volume V = ⁴⁄₃πr³.'), ...(dia ? [T(`半徑 = ${2 * rr} ÷ 2 = ${rr}。`, `Radius = ${2 * rr} ÷ 2 = ${rr}.`)] : []), T(`r³ = ${rr}³ = ${rr ** 3}。`, `r³ = ${rr}³ = ${rr ** 3}.`), T(`V = ⁴⁄₃ × ${rr ** 3} × π = ${num(v)}π 立方公分。`, `V = ⁴⁄₃ × ${rr ** 3} × π = ${num(v)}π cm³.`)],
        };
      }
      if (k === 3) {
        const rr = r.int(2, 9), h = r.int(2, 12), v = rr * rr * h;
        return {
          q: T(`一個圓柱形水桶的體積是 ${piT(v)} 立方公分，高 ${h} 公分。底面半徑是多少公分？`, `A cylindrical bucket has volume ${piT(v)} cm³ and height ${h} cm. What is its radius in cm?`),
          fig: solidFig('cyl', 'r=?', `h=${h}`), ans: ansNum(rr),
          sol: [T('V = πr²h。', 'V = πr²h.'), T(`${piT(v)} = π × r² × ${h} → r² = ${v} ÷ ${h} = ${rr * rr}。`, `${piT(v)} = π × r² × ${h} → r² = ${v} ÷ ${h} = ${rr * rr}.`), T(`r = ${rr} 公分（${rr} × ${rr} = ${rr * rr}）。`, `r = ${rr} cm (${rr} × ${rr} = ${rr * rr}).`)],
        };
      }
      const rr = r.pick([3, 6, 9, 12, 15]), h = (4 * rr) / 3;
      return {
        q: T(`把一顆半徑 ${rr} 公分的黏土球，重新捏成底面半徑也是 ${rr} 公分的圓柱（體積不變）。圓柱的高是幾公分？`, `A clay ball of radius ${rr} cm is reshaped into a cylinder whose radius is also ${rr} cm (same volume). How tall is the cylinder, in cm?`),
        ans: ansNum(h),
        sol: [T(`球的體積：⁴⁄₃π × ${rr}³ = ${num((4 * rr ** 3) / 3)}π。`, `Ball volume: ⁴⁄₃π × ${rr}³ = ${num((4 * rr ** 3) / 3)}π.`), T(`圓柱體積：π × ${rr}² × h = ${rr * rr}πh。`, `Cylinder volume: π × ${rr}² × h = ${rr * rr}πh.`), T(`${rr * rr}πh = ${num((4 * rr ** 3) / 3)}π → h = ${num((4 * rr ** 3) / 3)} ÷ ${rr * rr} = ${h}。`, `${rr * rr}πh = ${num((4 * rr ** 3) / 3)}π → h = ${num((4 * rr ** 3) / 3)} ÷ ${rr * rr} = ${h}.`), T(`（一般來說 h = ⁴⁄₃r。）`, `(In general h = ⁴⁄₃r.)`)],
      };
    },
  },
  {
    id: 'g8-transform', grade: 8,
    name: T('坐標上的平移、鏡射與旋轉', 'Transformations on the coordinate plane'),
    cur: { us: 'CCSS 8.G.A.3' },
    gen(r) {
      const k = r.int(0, 4);
      let x, y; do { x = r.nz(-5, 5); y = r.nz(-5, 5); } while (Math.abs(x) === Math.abs(y));
      const P = `P(${num(x)}, ${num(y)})`;
      if (k === 0) {
        let ax, ay, bx, by; do { ax = r.int(-5, 5); ay = r.int(-5, 5); bx = r.int(-5, 5); by = r.int(-5, 5); } while (ax === bx && ay === by);
        const dx = r.nz(-4, 4), dy = r.nz(-4, 4);
        return {
          q: T(`平移一個圖形，使點 A(${num(ax)}, ${num(ay)}) 移到 A′(${num(ax + dx)}, ${num(ay + dy)})。同樣的平移，點 B(${num(bx)}, ${num(by)}) 會移到哪裡？（答案寫成 (x, y)）`, `A translation moves A(${num(ax)}, ${num(ay)}) to A′(${num(ax + dx)}, ${num(ay + dy)}). Where does the same translation move B(${num(bx)}, ${num(by)})? (Answer as (x, y).)`),
          ans: ansPair(bx + dx, by + dy),
          sol: [T('平移時每個點都移動一樣的量。', 'In a translation every point moves by the same amount.'), T(`A 的移動：x 方向 ${num(ax + dx)} − ${par(ax)} = ${num(dx)}，y 方向 ${num(ay + dy)} − ${par(ay)} = ${num(dy)}。`, `A moved ${num(dx)} in x (${num(ax + dx)} − ${par(ax)}) and ${num(dy)} in y (${num(ay + dy)} − ${par(ay)}).`), T(`B′ = (${num(bx)} ${sgn(dx)}, ${num(by)} ${sgn(dy)}) = (${num(bx + dx)}, ${num(by + dy)})。`, `B′ = (${num(bx)} ${sgn(dx)}, ${num(by)} ${sgn(dy)}) = (${num(bx + dx)}, ${num(by + dy)}).`)],
        };
      }
      if (k === 1) {
        const t = r.int(0, 2), img = [[x, -y], [-x, y], [y, x]][t], nm = [['x 軸', 'the x-axis'], ['y 軸', 'the y-axis'], ['直線 y = x', 'the line y = x']][t];
        const rule = [T('對 x 軸鏡射：x 不變，y 變號，(x, y) → (x, −y)。', 'Reflect in the x-axis: x stays, y changes sign: (x, y) → (x, −y).'), T('對 y 軸鏡射：y 不變，x 變號，(x, y) → (−x, y)。', 'Reflect in the y-axis: y stays, x changes sign: (x, y) → (−x, y).'), T('對直線 y = x 鏡射：x 和 y 交換，(x, y) → (y, x)。', 'Reflect in y = x: swap the coordinates: (x, y) → (y, x).')][t];
        return {
          q: T(`把 ${P} 對${nm[0]}鏡射，得到的點坐標是什麼？（答案寫成 (x, y)）`, `Reflect ${P} in ${nm[1]}. What is the image? (Answer as (x, y).)`),
          fig: grid(6, [{ x, y, label: 'P' }], t === 2 ? [{ m: 1, b: 0 }] : []), ans: ansPair(img[0], img[1]),
          sol: [rule, T(`${P} → (${num(img[0])}, ${num(img[1])})。`, `${P} → (${num(img[0])}, ${num(img[1])}).`), T('檢查：原來的點和像到鏡射線的距離一樣，而且在兩側。', 'Check: the point and its image are the same distance from the mirror line, on opposite sides.')],
        };
      }
      if (k === 2) {
        const t = r.int(0, 2), img = [[-y, x], [y, -x], [-x, -y]][t], nm = [['逆時針旋轉 90°', '90° counter-clockwise'], ['順時針旋轉 90°', '90° clockwise'], ['旋轉 180°', '180°']][t];
        const rule = [T('繞原點逆時針轉 90°：(x, y) → (−y, x)。', 'Rotating 90° counter-clockwise about the origin: (x, y) → (−y, x).'), T('繞原點順時針轉 90°：(x, y) → (y, −x)。', 'Rotating 90° clockwise about the origin: (x, y) → (y, −x).'), T('繞原點轉 180°：兩個坐標都變號，(x, y) → (−x, −y)。', 'Rotating 180° about the origin: both signs change: (x, y) → (−x, −y).')][t];
        return {
          q: T(`把 ${P} 繞原點${nm[0]}，得到的點坐標是什麼？（答案寫成 (x, y)）`, `Rotate ${P} ${nm[1]} about the origin. What is the image? (Answer as (x, y).)`),
          fig: grid(6, [{ x, y, label: 'P' }]), ans: ansPair(img[0], img[1]),
          sol: [rule, T(`${P} → (${num(img[0])}, ${num(img[1])})。`, `${P} → (${num(img[0])}, ${num(img[1])}).`), T(`檢查：到原點的距離不變，都是 √${x * x + y * y}。`, `Check: the distance to the origin stays √${x * x + y * y}.`)],
        };
      }
      if (k === 3) {
        const s = r.pick([2, 3, 0.5]), xx = s === 0.5 ? 2 * x : x, yy = s === 0.5 ? 2 * y : y;
        return {
          q: T(`以原點為中心，把點 (${num(xx)}, ${num(yy)}) 縮放 ${num(s)} 倍，得到的點坐標是什麼？（答案寫成 (x, y)）`, `Dilate the point (${num(xx)}, ${num(yy)}) by a scale factor of ${num(s)} centered at the origin. What is the image? (Answer as (x, y).)`),
          ans: ansPair(clean(s * xx), clean(s * yy)),
          sol: [T(`以原點為中心縮放 k 倍：(x, y) → (kx, ky)。`, `A dilation by k centered at the origin: (x, y) → (kx, ky).`), T(`(${num(s)} × ${par(xx)}, ${num(s)} × ${par(yy)}) = (${num(clean(s * xx))}, ${num(clean(s * yy))})。`, `(${num(s)} × ${par(xx)}, ${num(s)} × ${par(yy)}) = (${num(clean(s * xx))}, ${num(clean(s * yy))}).`), T(s > 1 ? '倍數大於 1，點離原點更遠（放大）。' : '倍數小於 1，點更靠近原點（縮小）。', s > 1 ? 'A factor above 1 pushes the point away from the origin (enlarges).' : 'A factor below 1 pulls the point toward the origin (shrinks).')],
        };
      }
      const all = [
        [[x, -y], T('對 x 軸鏡射', 'Reflection in the x-axis')], [[-x, y], T('對 y 軸鏡射', 'Reflection in the y-axis')],
        [[-x, -y], T('繞原點旋轉 180°', 'Rotation of 180° about the origin')], [[-y, x], T('繞原點逆時針旋轉 90°', 'Rotation of 90° counter-clockwise about the origin')],
        [[y, x], T('對直線 y = x 鏡射', 'Reflection in the line y = x')],
      ];
      const pick = r.int(0, 4), [img, nameT] = all[pick], others = r.shuffle(all.filter((_, i) => i !== pick)).slice(0, 3).map((a) => a[1]);
      return {
        q: T(`${P} 經過某個變換後變成 P′(${num(img[0])}, ${num(img[1])})。是哪一種變換？`, `A transformation maps ${P} to P′(${num(img[0])}, ${num(img[1])}). Which transformation is it?`),
        fig: grid(6, [{ x, y, label: 'P' }, { x: img[0], y: img[1], label: 'P′' }]),
        ans: ansChoice([nameT, ...others]),
        sol: [T('比較坐標的變化：哪個變號？有沒有交換？', 'Compare the coordinates: which signs changed? Did they swap?'), T(`(${num(x)}, ${num(y)}) → (${num(img[0])}, ${num(img[1])})。`, `(${num(x)}, ${num(y)}) → (${num(img[0])}, ${num(img[1])}).`), T(['只有 y 變號 → 對 x 軸鏡射。', '只有 x 變號 → 對 y 軸鏡射。', '兩個都變號 → 旋轉 180°。', '(x, y) → (−y, x) → 逆時針旋轉 90°。', 'x、y 交換 → 對 y = x 鏡射。'][pick], ['Only y changed sign → reflection in the x-axis.', 'Only x changed sign → reflection in the y-axis.', 'Both changed sign → rotation of 180°.', '(x, y) → (−y, x) → rotation of 90° counter-clockwise.', 'x and y swapped → reflection in y = x.'][pick])],
      };
    },
  },
  {
    id: 'g8-mult-formula', grade: 8,
    name: T('乘法公式', 'Special products'),
    cur: { us: 'Algebra 1 · Polynomial arithmetic (A-APR.A.1)', tw: '八年級 乘法公式', aops: 'Intro Algebra' },
    at: { us: 9 },
    gen(r) {
      const k = r.int(0, 4), a = r.int(1, 5), b = r.int(1, 9) * r.sign();
      if (k === 0) {
        const right = poly([a * a, 2 * a * b, b * b]);
        return {
          q: T(`展開 ${sq(facA(a, b))}。`, `Expand ${sq(facA(a, b))}.`),
          ans: choice(right, poly([a * a, 0, b * b]), poly([a * a, a * b, b * b]), poly([a * a, -2 * a * b, b * b]), poly([a * a, 2 * a * b, -b * b])),
          sol: [T(`和（差）的平方公式：(A ${b > 0 ? '+' : '−'} B)² = A² ${b > 0 ? '+' : '−'} 2AB + B²，中間項不能漏！`, `Square of a ${b > 0 ? 'sum' : 'difference'}: (A ${b > 0 ? '+' : '−'} B)² = A² ${b > 0 ? '+' : '−'} 2AB + B². Don't forget the middle term!`), T(`A = ${mono(a)}，B = ${Math.abs(b)}。`, `A = ${mono(a)}, B = ${Math.abs(b)}.`), T(`A² = ${poly([a * a, 0, 0])}，2AB = 2 × ${mono(a)} × ${Math.abs(b)} = ${mono(2 * a * Math.abs(b))}，B² = ${b * b}。`, `A² = ${poly([a * a, 0, 0])}, 2AB = 2 × ${mono(a)} × ${Math.abs(b)} = ${mono(2 * a * Math.abs(b))}, B² = ${b * b}.`), T(`答案：${right}。`, `Answer: ${right}.`)],
        };
      }
      if (k === 1) {
        const B = Math.abs(b), right = poly([a * a, 0, -B * B]);
        return {
          q: T(`展開 (${lin(a, B)})(${lin(a, -B)})。`, `Expand (${lin(a, B)})(${lin(a, -B)}).`),
          ans: choice(right, poly([a * a, 0, B * B]), poly([a * a, -2 * a * B, -B * B]), poly([a * a, 2 * a * B, B * B])),
          sol: [T('平方差公式：(A + B)(A − B) = A² − B²。', 'Difference of squares: (A + B)(A − B) = A² − B².'), T(`A = ${mono(a)}，B = ${B}：A² = ${poly([a * a, 0, 0])}，B² = ${B * B}。`, `A = ${mono(a)}, B = ${B}: A² = ${poly([a * a, 0, 0])}, B² = ${B * B}.`), T(`中間的 +${a * B}x 和 −${a * B}x 互相抵消。`, `The middle terms +${a * B}x and −${a * B}x cancel.`), T(`答案：${right}。`, `Answer: ${right}.`)],
        };
      }
      if (k === 2) {
        const M = r.pick([20, 30, 50, 100, 1000]), d = r.int(1, M >= 100 ? 9 : 3), t = r.int(0, 2);
        if (t === 2) {
          const v = M * M - d * d;
          return {
            q: T(`利用乘法公式計算 ${M + d} × ${M - d}。`, `Use a special product to compute ${M + d} × ${M - d}.`), ans: ansNum(v),
            sol: [T(`${M + d} = ${M} + ${d}，${M - d} = ${M} − ${d}，用平方差公式。`, `${M + d} = ${M} + ${d} and ${M - d} = ${M} − ${d}: difference of squares.`), T(`(${M} + ${d})(${M} − ${d}) = ${M}² − ${d}² = ${num(M * M)} − ${d * d}。`, `(${M} + ${d})(${M} − ${d}) = ${M}² − ${d}² = ${num(M * M)} − ${d * d}.`), T(`= ${num(v)}。`, `= ${num(v)}.`)],
          };
        }
        const s = t === 0 ? 1 : -1, N = M + s * d, v = N * N;
        return {
          q: T(`利用乘法公式計算 ${N}²。`, `Use a special product to compute ${N}².`), ans: ansNum(v),
          sol: [T(`${N} = ${M} ${s > 0 ? '+' : '−'} ${d}，用${s > 0 ? '和' : '差'}的平方公式。`, `${N} = ${M} ${s > 0 ? '+' : '−'} ${d}, so use the square of a ${s > 0 ? 'sum' : 'difference'}.`), T(`(${M} ${s > 0 ? '+' : '−'} ${d})² = ${M}² ${s > 0 ? '+' : '−'} 2 × ${M} × ${d} + ${d}² = ${num(M * M)} ${s > 0 ? '+' : '−'} ${num(2 * M * d)} + ${d * d}。`, `(${M} ${s > 0 ? '+' : '−'} ${d})² = ${M}² ${s > 0 ? '+' : '−'} 2 × ${M} × ${d} + ${d}² = ${num(M * M)} ${s > 0 ? '+' : '−'} ${num(2 * M * d)} + ${d * d}.`), T(`= ${num(v)}。`, `= ${num(v)}.`)],
        };
      }
      if (k === 3) {
        let p, q; do { p = r.nz(-7, 9); q = r.nz(-7, 9); } while (p === q);
        const t = r.int(0, 2), S = p + q, Pp = p * q, Dd = p - q;
        if (t === 0) return {
          q: T(`已知 a + b = ${num(S)}，ab = ${num(Pp)}，求 a² + b²。`, `If a + b = ${num(S)} and ab = ${num(Pp)}, find a² + b².`), ans: ansNum(p * p + q * q),
          sol: [T('(a + b)² = a² + 2ab + b²，所以 a² + b² = (a + b)² − 2ab。', '(a + b)² = a² + 2ab + b², so a² + b² = (a + b)² − 2ab.'), T(`= ${par(S)}² − 2 × ${par(Pp)} = ${S * S} ${sgn(-2 * Pp)}。`, `= ${par(S)}² − 2 × ${par(Pp)} = ${S * S} ${sgn(-2 * Pp)}.`), T(`= ${p * p + q * q}。`, `= ${p * p + q * q}.`)],
        };
        if (t === 1) return {
          q: T(`已知 a − b = ${num(Dd)}，ab = ${num(Pp)}，求 a² + b²。`, `If a − b = ${num(Dd)} and ab = ${num(Pp)}, find a² + b².`), ans: ansNum(p * p + q * q),
          sol: [T('(a − b)² = a² − 2ab + b²，所以 a² + b² = (a − b)² + 2ab。', '(a − b)² = a² − 2ab + b², so a² + b² = (a − b)² + 2ab.'), T(`= ${par(Dd)}² + 2 × ${par(Pp)} = ${Dd * Dd} ${sgn(2 * Pp)}。`, `= ${par(Dd)}² + 2 × ${par(Pp)} = ${Dd * Dd} ${sgn(2 * Pp)}.`), T(`= ${p * p + q * q}。`, `= ${p * p + q * q}.`)],
        };
        return {
          q: T(`已知 a + b = ${num(S)}，ab = ${num(Pp)}，求 (a − b)²。`, `If a + b = ${num(S)} and ab = ${num(Pp)}, find (a − b)².`), ans: ansNum(Dd * Dd),
          sol: [T('(a − b)² = a² − 2ab + b² = (a + b)² − 4ab。', '(a − b)² = a² − 2ab + b² = (a + b)² − 4ab.'), T(`= ${par(S)}² − 4 × ${par(Pp)} = ${S * S} ${sgn(-4 * Pp)}。`, `= ${par(S)}² − 4 × ${par(Pp)} = ${S * S} ${sgn(-4 * Pp)}.`), T(`= ${Dd * Dd}。`, `= ${Dd * Dd}.`)],
        };
      }
      const m = r.int(2, 12), c = m * m, kk = 2 * m;
      return {
        q: T(`若 x² + kx + ${c} 是一個完全平方式（可以寫成 (x + m)² 的形式），且 k > 0，求 k。`, `If x² + kx + ${c} is a perfect square (it can be written as (x + m)²) and k > 0, find k.`), ans: ansNum(kk),
        sol: [T('(x + m)² = x² + 2mx + m²。', '(x + m)² = x² + 2mx + m².'), T(`比較常數項：m² = ${c}，m = ${m}（k > 0 取正）。`, `Match the constants: m² = ${c}, so m = ${m} (positive, since k > 0).`), T(`k = 2m = ${kk}，x² + ${kk}x + ${c} = (x + ${m})²。`, `k = 2m = ${kk}, and x² + ${kk}x + ${c} = (x + ${m})².`)],
      };
    },
  },
  {
    id: 'g8-poly-ops', grade: 8,
    name: T('多項式的加減乘除', 'Adding, multiplying and dividing polynomials'),
    cur: { us: 'Algebra 1 · Polynomial arithmetic (A-APR.A.1)', tw: '八年級 多項式的四則運算', aops: 'Intro Algebra' },
    at: { us: 9 },
    gen(r) {
      const k = r.int(0, 4);
      if (k === 0) {
        const A = [r.nz(-6, 6), r.nz(-9, 9), r.nz(-9, 9)], B = [r.nz(-6, 6), r.nz(-9, 9), r.nz(-9, 9)], minus = r.chance(0.65);
        const res = A.map((x, i) => (minus ? x - B[i] : x + B[i]));
        if (res[0] === 0) return this.gen(r);
        const wrong1 = minus ? [A[0] - B[0], A[1] + B[1], A[2] + B[2]] : [A[0] + B[0], A[1] + B[1], A[2] - B[2]];
        const wrong2 = minus ? A.map((x, i) => x + B[i]) : A.map((x, i) => x - B[i]);
        const wrong3 = [res[0], res[1], -res[2] || res[2] + 1];
        return {
          q: T(`化簡 (${poly(A)}) ${minus ? '−' : '+'} (${poly(B)})。`, `Simplify (${poly(A)}) ${minus ? '−' : '+'} (${poly(B)}).`),
          ans: choice(poly(res), poly(wrong1), poly(wrong2), poly(wrong3)),
          sol: [minus ? T('減一個括號：括號前是「−」，去括號時裡面每一項都要變號。', 'Subtracting a bracket: every term inside changes sign when you remove it.') : T('加法可以直接去括號。', 'With +, just drop the brackets.'), T(`= ${poly(A)}${tail(minus ? B.map((x) => -x) : B)}`, `= ${poly(A)}${tail(minus ? B.map((x) => -x) : B)}`), T(`合併同類項：x²：${num(res[0])}，x：${num(res[1])}，常數：${num(res[2])}。`, `Combine like terms: x²: ${num(res[0])}, x: ${num(res[1])}, constant: ${num(res[2])}.`), T(`答案：${poly(res)}。`, `Answer: ${poly(res)}.`)],
        };
      }
      if (k === 1) {
        const a = r.int(1, 5), b = r.nz(-9, 9), c = r.int(1, 5), d = r.nz(-9, 9), res = pmul([a, b], [c, d]);
        if (res[1] === 0) return this.gen(r);
        return {
          q: T(`展開並化簡 (${lin(a, b)})(${lin(c, d)})。`, `Expand and simplify (${lin(a, b)})(${lin(c, d)}).`),
          ans: choice(poly(res), poly([a * c, 0, b * d]), poly([a * c, a * d - b * c, b * d]), poly([a * c, res[1], -b * d]), poly([a * c, a * d, b * d])),
          sol: [T('分配律：第一個括號的每一項，乘以第二個括號的每一項（共 4 個乘積）。', 'Distribute: every term in the first bracket times every term in the second (4 products).'), T(`${mono(a)} × ${mono(c)} = ${poly([a * c, 0, 0])}；${mono(a)} × ${par(d)} = ${mono(a * d)}；${num(b)} × ${mono(c)} = ${mono(b * c)}；${num(b)} × ${par(d)} = ${num(b * d)}。`, `${mono(a)} × ${mono(c)} = ${poly([a * c, 0, 0])}; ${mono(a)} × ${par(d)} = ${mono(a * d)}; ${num(b)} × ${mono(c)} = ${mono(b * c)}; ${num(b)} × ${par(d)} = ${num(b * d)}.`), T(`合併中間兩項：${num(a * d)} ${sgn(b * c)} = ${num(res[1])}。`, `Combine the middle terms: ${num(a * d)} ${sgn(b * c)} = ${num(res[1])}.`), T(`答案：${poly(res)}。`, `Answer: ${poly(res)}.`)],
        };
      }
      if (k === 2) {
        const m = r.nz(-6, 6), a = r.int(1, 6), b = r.nz(-9, 9);
        if (m === 1) return this.gen(r);
        return {
          q: T(`展開 ${mono(m)}(${lin(a, b)})。`, `Expand ${mono(m)}(${lin(a, b)}).`),
          ans: choice(poly([m * a, m * b, 0]), poly([m * a, 0, m * b]), poly([m * a, m * b]), poly([m * a, b, 0]), poly([m * a, -m * b, 0])),
          sol: [T(`把 ${mono(m)} 分別乘進括號裡的每一項。`, `Multiply ${mono(m)} by each term in the bracket.`), T(`${mono(m)} × ${mono(a)} = ${poly([m * a, 0, 0])}（x × x = x²）。`, `${mono(m)} × ${mono(a)} = ${poly([m * a, 0, 0])} (x × x = x²).`), T(`${mono(m)} × ${par(b)} = ${mono(m * b)}。`, `${mono(m)} × ${par(b)} = ${mono(m * b)}.`), T(`答案：${poly([m * a, m * b, 0])}。`, `Answer: ${poly([m * a, m * b, 0])}.`)],
        };
      }
      if (k === 3) {
        const a = r.int(1, 4), b = r.nz(-6, 6), c = r.int(1, 4), d = r.nz(-6, 6), e = r.nz(-6, 6), askX = r.chance(0.5), v = askX ? a * e + b * d : a * d + b * c;
        return {
          q: T(`(${lin(a, b)})(${poly([c, d, e])}) 展開後，${askX ? 'x' : 'x²'} 項的係數是多少？`, `When (${lin(a, b)})(${poly([c, d, e])}) is expanded, what is the coefficient of ${askX ? 'x' : 'x²'}?`), ans: ansNum(v),
          sol: [T(`不用全部展開，只找乘起來會得到 ${askX ? 'x' : 'x²'} 的組合。`, `No need to expand everything — just find the products that give ${askX ? 'x' : 'x²'}.`), askX ? T(`${mono(a)} × ${par(e)} = ${mono(a * e)}，${num(b)} × ${mono(d)} = ${mono(b * d)}。`, `${mono(a)} × ${par(e)} = ${mono(a * e)} and ${num(b)} × ${mono(d)} = ${mono(b * d)}.`) : T(`${mono(a)} × ${mono(d)} = ${poly([a * d, 0, 0])}，${num(b)} × ${poly([c, 0, 0])} = ${poly([b * c, 0, 0])}。`, `${mono(a)} × ${mono(d)} = ${poly([a * d, 0, 0])} and ${num(b)} × ${poly([c, 0, 0])} = ${poly([b * c, 0, 0])}.`), T(`係數相加：${askX ? `${num(a * e)} ${sgn(b * d)}` : `${num(a * d)} ${sgn(b * c)}`} = ${num(v)}。`, `Add the coefficients: ${askX ? `${num(a * e)} ${sgn(b * d)}` : `${num(a * d)} ${sgn(b * c)}`} = ${num(v)}.`)],
        };
      }
      let p, q; do { p = r.nz(-8, 8); q = r.nz(-8, 8); } while (p === q || p + q === 0);
      const N = [1, p + q, p * q];
      return {
        q: T(`計算 (${poly(N)}) ÷ (x ${sgn(p)})。`, `Compute (${poly(N)}) ÷ (x ${sgn(p)}).`),
        ans: choice(`x ${sgn(q)}`, `x ${sgn(-q)}`, `x ${sgn(p)}`, `x ${sgn(p + q)}`, `x ${sgn(-p)}`),
        sol: [T('用長除法：先看最高次項。', 'Long division: look at the highest-degree terms first.'), T(`x² ÷ x = x；x × (x ${sgn(p)}) = ${poly([1, p, 0])}，相減剩 ${poly([q, p * q])}。`, `x² ÷ x = x; x × (x ${sgn(p)}) = ${poly([1, p, 0])}; subtracting leaves ${poly([q, p * q])}.`), T(`${mono(q)} ÷ x = ${num(q)}；${num(q)} × (x ${sgn(p)}) = ${poly([q, p * q])}，相減餘 0。`, `${mono(q)} ÷ x = ${num(q)}; ${num(q)} × (x ${sgn(p)}) = ${poly([q, p * q])}; remainder 0.`), T(`商是 x ${sgn(q)}。驗算：(x ${sgn(p)})(x ${sgn(q)}) = ${poly(N)} ✓`, `The quotient is x ${sgn(q)}. Check: (x ${sgn(p)})(x ${sgn(q)}) = ${poly(N)} ✓`)],
      };
    },
  },
  {
    id: 'g8-factoring', grade: 8,
    name: T('因式分解', 'Factoring'),
    cur: { us: 'Algebra 1 · Factoring (A-SSE.A.2)', tw: '八年級 因式分解（提公因式、乘法公式、十字交乘法）', aops: 'Intro Algebra' },
    at: { us: 9 },
    gen(r) {
      const k = r.int(0, 4);
      if (k === 0) {
        const g = r.int(2, 6); let a, b; do { a = r.int(1, 7); b = r.nz(-9, 9); } while (gcd(a, b) !== 1 || a === 1 && b === 1);
        const E = poly([g * a, g * b, 0]);
        return {
          q: T(`將 ${E} 完全因式分解。`, `Factor completely: ${E}.`),
          ans: choice(`${g}x(${lin(a, b)})`, `${g}(${poly([a, b, 0])})`, `x(${lin(g * a, b)})`, `${g}x(${lin(a, -b)})`, `${g}x(${lin(g * a, g * b)})`),
          sol: [T('先找所有項的最大公因式（係數的最大公因數 × 共同的 x）。', 'Find the greatest common factor of all terms (GCD of the coefficients × the common x).'), T(`${g * a} 和 ${Math.abs(g * b)} 的最大公因數是 ${g}，兩項都有 x，所以公因式是 ${g}x。`, `The GCD of ${g * a} and ${Math.abs(g * b)} is ${g}, and both terms have x, so the common factor is ${g}x.`), T(`${poly([g * a, 0, 0])} ÷ ${g}x = ${mono(a)}；${mono(g * b)} ÷ ${g}x = ${num(b)}。`, `${poly([g * a, 0, 0])} ÷ ${g}x = ${mono(a)}; ${mono(g * b)} ÷ ${g}x = ${num(b)}.`), T(`答案：${g}x(${lin(a, b)})。（${g}(${poly([a, b, 0])}) 還能再提出 x，不算完全分解。）`, `Answer: ${g}x(${lin(a, b)}). (${g}(${poly([a, b, 0])}) still has a common x, so it isn't completely factored.)`)],
        };
      }
      if (k === 1) {
        const a = r.int(1, 6), b = r.int(1, 9); if (gcd(a, b) > 1) return this.gen(r);
        return {
          q: T(`因式分解 ${poly([a * a, 0, -b * b])}。`, `Factor ${poly([a * a, 0, -b * b])}.`),
          ans: choice(`(${lin(a, b)})(${lin(a, -b)})`, sq(`(${lin(a, -b)})`), sq(`(${lin(a, b)})`), `(${lin(a * a, b)})(x − ${b})`),
          sol: [T('平方差公式：A² − B² = (A + B)(A − B)。', 'Difference of squares: A² − B² = (A + B)(A − B).'), T(`${poly([a * a, 0, 0])} = (${mono(a)})²，${b * b} = ${b}²。`, `${poly([a * a, 0, 0])} = (${mono(a)})² and ${b * b} = ${b}².`), T(`答案：(${lin(a, b)})(${lin(a, -b)})。`, `Answer: (${lin(a, b)})(${lin(a, -b)}).`), T(`驗算：展開後中間項 +${a * b}x − ${a * b}x 抵消，得 ${poly([a * a, 0, -b * b])} ✓`, `Check: expanding, the middle terms +${a * b}x − ${a * b}x cancel, giving ${poly([a * a, 0, -b * b])} ✓`)],
        };
      }
      if (k === 2) {
        const a = r.int(1, 5), b = r.int(1, 9) * r.sign(); if (gcd(a, Math.abs(b)) > 1) return this.gen(r);
        const E = poly([a * a, 2 * a * b, b * b]);
        return {
          q: T(`因式分解 ${E}。`, `Factor ${E}.`),
          ans: choice(sq(`(${lin(a, b)})`), sq(`(${lin(a, -b)})`), `(${lin(a, b)})(${lin(a, -b)})`, sq(`(${lin(a, 2 * b)})`)),
          sol: [T(`首項 ${poly([a * a, 0, 0])} = (${mono(a)})²，末項 ${b * b} = ${Math.abs(b)}²，看看是不是完全平方式。`, `First term ${poly([a * a, 0, 0])} = (${mono(a)})², last term ${b * b} = ${Math.abs(b)}². Is it a perfect square?`), T(`中間項應該是 ${b > 0 ? '+' : '−'}2 × ${mono(a)} × ${Math.abs(b)} = ${mono(2 * a * b)}，符合！`, `The middle term should be ${b > 0 ? '+' : '−'}2 × ${mono(a)} × ${Math.abs(b)} = ${mono(2 * a * b)} — it matches!`), T(`所以 ${E} = ${sq(`(${lin(a, b)})`)}。`, `So ${E} = ${sq(`(${lin(a, b)})`)}.`)],
        };
      }
      if (k === 3) {
        let p, q; do { p = r.nz(-9, 9); q = r.nz(-9, 9); } while (p + q === 0 || p === q);
        const E = poly([1, p + q, p * q]);
        let alt = null; for (let u = 1; u <= Math.abs(p * q); u++) { if ((p * q) % u) continue; for (const s of [1, -1]) { const v = (p * q) / (s * u); const uu = s * u; if (uu + v !== p + q && !alt) alt = [uu, v]; } }
        const w = alt ? `${fac1(alt[0])}${fac1(alt[1])}` : `${fac1(p + 1)}${fac1(q)}`;
        return {
          q: T(`因式分解 ${E}。`, `Factor ${E}.`),
          ans: choice(`${fac1(p)}${fac1(q)}`, `${fac1(-p)}${fac1(-q)}`, w, `${fac1(p)}${fac1(-q)}`),
          sol: [T(`十字交乘：找兩個數，相乘 = ${num(p * q)}，相加 = ${num(p + q)}。`, `Find two numbers that multiply to ${num(p * q)} and add to ${num(p + q)}.`), T(`${num(p)} × ${par(q)} = ${num(p * q)}，${num(p)} + ${par(q)} = ${num(p + q)} ✓`, `${num(p)} × ${par(q)} = ${num(p * q)} and ${num(p)} + ${par(q)} = ${num(p + q)} ✓`), T(`所以 ${E} = ${fac1(p)}${fac1(q)}。`, `So ${E} = ${fac1(p)}${fac1(q)}.`), T(`驗算：展開得 x² ${sgn(p + q)}x ${sgn(p * q)} ✓`, `Check: expanding gives x² ${sgn(p + q)}x ${sgn(p * q)} ✓`)],
        };
      }
      const a = r.pick([2, 3, 5]); let p, q; do { p = r.nz(-7, 7); q = r.nz(-7, 7); } while (gcd(a, Math.abs(p)) !== 1 || a * q + p === 0 || a * q === p || q === p);
      const E = poly([a, a * q + p, p * q]);
      return {
        q: T(`因式分解 ${E}。`, `Factor ${E}.`),
        ans: choice(`${facA(a, p)}${fac1(q)}`, `${facA(a, q)}${fac1(p)}`, `${facA(a, -p)}${fac1(-q)}`, `${facA(a, p)}${fac1(-q)}`),
        sol: [T(`十字交乘：首項 ${a}x² = ${a}x × x，末項 ${num(p * q)} 拆成兩數相乘。`, `Cross method: ${a}x² = ${a}x × x, and split ${num(p * q)} into two factors.`), T(`試 ${a}x 配 ${num(p)}、x 配 ${num(q)}：交叉相乘 ${a}x × ${par(q)} + x × ${par(p)} = ${mono(a * q + p)}，正好是中間項 ✓`, `Try ${a}x with ${num(p)} and x with ${num(q)}: cross products ${a}x × ${par(q)} + x × ${par(p)} = ${mono(a * q + p)}, exactly the middle term ✓`), T(`所以 ${E} = ${facA(a, p)}${fac1(q)}。`, `So ${E} = ${facA(a, p)}${fac1(q)}.`), T(`（若配成 ${facA(a, q)}${fac1(p)}，中間項會是 ${mono(a * p + q)}，不對。）`, `(Pairing as ${facA(a, q)}${fac1(p)} gives a middle term of ${mono(a * p + q)} — wrong.)`)],
      };
    },
  },
  {
    id: 'g8-quad-eq', grade: 8,
    name: T('一元二次方程式（因式分解法、配方法）', 'Solving quadratic equations by factoring and square roots'),
    cur: { us: 'Algebra 1 · Solving quadratics (A-REI.B.4b)', tw: '八年級 一元二次方程式', aops: 'Intro Algebra' },
    at: { us: 9 },
    gen(r) {
      const k = r.int(0, 5);
      const comma = T('（有兩個解時用逗號隔開）', '(Separate two answers with a comma.)');
      if (k === 0) {
        let p, q; do { p = r.nz(-9, 9); q = r.nz(-9, 9); } while (p === q || p + q === 0 && r.chance(0.7));
        const E = poly([1, -(p + q), p * q]);
        return {
          q: T(`解方程式 ${E} = 0。${comma.zh}`, `Solve ${E} = 0. ${comma.en}`), ans: ansSet([p, q]),
          sol: [T(`因式分解：找兩數相乘 ${num(p * q)}、相加 ${num(-(p + q))}：${num(-p)} 和 ${num(-q)}。`, `Factor: two numbers with product ${num(p * q)} and sum ${num(-(p + q))}: ${num(-p)} and ${num(-q)}.`), T(`${fac1(-p)}${fac1(-q)} = 0。`.replace(/\(x \+ 0\)/g, 'x'), `${fac1(-p)}${fac1(-q)} = 0.`.replace(/\(x \+ 0\)/g, 'x')), T(`兩數相乘為 0，至少一個是 0：x = ${num(p)} 或 x = ${num(q)}。`, `If a product is 0, one factor is 0: x = ${num(p)} or x = ${num(q)}.`), T(`驗算：${par(p)}² ${sgn(-(p + q))} × ${par(p)} ${sgn(p * q)} = 0 ✓`, `Check: ${par(p)}² ${sgn(-(p + q))} × ${par(p)} ${sgn(p * q)} = 0 ✓`)],
        };
      }
      if (k === 1) {
        const h = r.int(-6, 6), sqr = r.chance(0.5);
        if (sqr) {
          const m = r.int(1, 9), K = m * m;
          return {
            q: T(`解方程式 ${sq(`(x ${sgn(-h)})`.replace('(x + 0)', 'x').replace('(x − 0)', 'x'))} = ${K}。${comma.zh}`, `Solve ${sq(`(x ${sgn(-h)})`.replace('(x + 0)', 'x').replace('(x − 0)', 'x'))} = ${K}. ${comma.en}`), ans: ansSet([h + m, h - m]),
            sol: [T(`平方等於 ${K}，括號裡可以是 ${m} 或 −${m}（別忘了負的）。`, `Something squared is ${K}, so it is ${m} or −${m} (don't forget the negative).`), T(`x ${sgn(-h)} = ${m} → x = ${num(h + m)}；x ${sgn(-h)} = −${m} → x = ${num(h - m)}。`, `x ${sgn(-h)} = ${m} → x = ${num(h + m)}; x ${sgn(-h)} = −${m} → x = ${num(h - m)}.`), T(`答案：x = ${num(h + m)} 或 ${num(h - m)}。`, `Answer: x = ${num(h + m)} or ${num(h - m)}.`)],
          };
        }
        let kk, rr, K; do { K = r.int(2, 50); [kk, rr] = simpRoot(K); } while (rr === 1);
        const rt = radText(kk, rr), txt = h === 0 ? `${rt}, -${rt}` : `${h}+${rt}, ${h}-${rt}`;
        const show = h === 0 ? `±${rad(kk, rr)}` : `${num(h)} ± ${rad(kk, rr)}`;
        return {
          q: T(`解方程式 ${sq(`(x ${sgn(-h)})`.replace('(x + 0)', 'x').replace('(x − 0)', 'x'))} = ${K}（用最簡根式表示）。${comma.zh}`, `Solve ${sq(`(x ${sgn(-h)})`.replace('(x + 0)', 'x').replace('(x − 0)', 'x'))} = ${K} (simplest radical form). ${comma.en}`),
          ans: ansSet([h + Math.sqrt(K), h - Math.sqrt(K)], txt),
          sol: [T(`開平方：x ${sgn(-h)} = ±${sqrt(K)}${kk > 1 ? ` = ±${rad(kk, rr)}` : ''}。`, `Take square roots: x ${sgn(-h)} = ±${sqrt(K)}${kk > 1 ? ` = ±${rad(kk, rr)}` : ''}.`), T(`x = ${show}。`, `x = ${show}.`), T(`兩個解：${h === 0 ? `${rad(kk, rr)} 和 −${rad(kk, rr)}` : `${num(h)} + ${rad(kk, rr)} 和 ${num(h)} − ${rad(kk, rr)}`}。`, `Two solutions: ${h === 0 ? `${rad(kk, rr)} and −${rad(kk, rr)}` : `${num(h)} + ${rad(kk, rr)} and ${num(h)} − ${rad(kk, rr)}`}.`)],
        };
      }
      if (k === 2) {
        const a = r.int(2, 6), b = r.nz(-12, 12); if (b % a === 0 && r.chance(0.5)) return this.gen(r);
        const E = poly([a, b, 0]), [n, d] = red(-b, a);
        return {
          q: T(`解方程式 ${E} = 0。${comma.zh}`, `Solve ${E} = 0. ${comma.en}`), ans: ansSet([0, n / d], `0, ${fracText(n, d)}`),
          sol: [T('兩項都有 x，先提出 x（不要兩邊同除以 x，會漏掉 x = 0！）。', 'Both terms have x: factor it out. (Don\'t divide by x — you would lose x = 0!)'), T(`x(${lin(a, b)}) = 0。`, `x(${lin(a, b)}) = 0.`), T(`x = 0 或 ${lin(a, b)} = 0 → x = ${fracR(n, d)}。`, `x = 0 or ${lin(a, b)} = 0 → x = ${fracR(n, d)}.`)],
        };
      }
      if (k === 3) {
        if (r.chance(0.5)) {
          const w = r.int(3, 15), d = r.int(1, 8), A = w * (w + d);
          return {
            q: T(`一塊長方形花圃的長比寬多 ${d} 公尺，面積是 ${A} 平方公尺。寬是幾公尺？`, `A rectangular garden is ${d} m longer than it is wide, and its area is ${A} m². How wide is it, in meters?`), ans: ansNum(w),
            sol: [T(`設寬 x 公尺，長 x + ${d} 公尺：x(x + ${d}) = ${A}。`, `Let the width be x m; the length is x + ${d}: x(x + ${d}) = ${A}.`), T(`整理：x² + ${d}x − ${A} = 0，因式分解：(x − ${w})(x + ${w + d}) = 0。`, `Rearrange: x² + ${d}x − ${A} = 0. Factor: (x − ${w})(x + ${w + d}) = 0.`), T(`x = ${w} 或 x = −${w + d}；寬不能是負的，所以 x = ${w}。`, `x = ${w} or x = −${w + d}; a width can't be negative, so x = ${w}.`), T(`驗算：${w} × ${w + d} = ${A} ✓`, `Check: ${w} × ${w + d} = ${A} ✓`)],
          };
        }
        const n = r.int(4, 30), Pp = n * (n + 1);
        return {
          q: T(`兩個連續正整數的乘積是 ${Pp}，較小的數是多少？`, `The product of two consecutive positive integers is ${Pp}. What is the smaller one?`), ans: ansNum(n),
          sol: [T(`設較小的是 x，較大的是 x + 1：x(x + 1) = ${Pp}。`, `Let the smaller be x; the larger is x + 1: x(x + 1) = ${Pp}.`), T(`x² + x − ${Pp} = 0 → (x − ${n})(x + ${n + 1}) = 0。`, `x² + x − ${Pp} = 0 → (x − ${n})(x + ${n + 1}) = 0.`), T(`x = ${n}（−${n + 1} 不是正整數）。驗算：${n} × ${n + 1} = ${Pp} ✓`, `x = ${n} (−${n + 1} isn't positive). Check: ${n} × ${n + 1} = ${Pp} ✓`)],
        };
      }
      if (k === 4) {
        let p, q; do { p = r.nz(-8, 8); q = r.nz(-8, 8); } while (p === q || p + q === 0);
        const c = p * q, kk = -(p + q);
        return {
          q: T(`方程式 x² + kx ${sgn(c)} = 0 有一個解是 x = ${num(p)}，求 k。`, `The equation x² + kx ${sgn(c)} = 0 has x = ${num(p)} as a solution. Find k.`), ans: ansNum(kk),
          sol: [T(`x = ${num(p)} 是解，代入一定成立。`, `Since x = ${num(p)} is a solution, it makes the equation true.`), T(`${par(p)}² + k × ${par(p)} ${sgn(c)} = 0 → ${p * p} ${sgn(c)} ${p < 0 ? '−' : '+'} ${Math.abs(p) === 1 ? '' : Math.abs(p)}k = 0。`, `${par(p)}² + k × ${par(p)} ${sgn(c)} = 0 → ${p * p} ${sgn(c)} ${p < 0 ? '−' : '+'} ${Math.abs(p) === 1 ? '' : Math.abs(p)}k = 0.`), T(`${num(p)}k = ${num(-(p * p + c))}，k = ${num(kk)}。`, `${num(p)}k = ${num(-(p * p + c))}, so k = ${num(kk)}.`), T(`（另一個解是 ${num(q)}：x² ${sgn(kk)}x ${sgn(c)} = (x ${sgn(-p)})(x ${sgn(-q)})。）`, `(The other solution is ${num(q)}: x² ${sgn(kk)}x ${sgn(c)} = (x ${sgn(-p)})(x ${sgn(-q)}).)`)],
        };
      }
      const h = r.nz(-6, 6), c = r.nz(-20, 20), K = h * h - c;
      return {
        q: T(`用配方法把 x² ${sgn(2 * h)}x ${sgn(c)} = 0 寫成 (x ${sgn(h)})² = k 的形式，k 是多少？`.replace(' + 0 = 0', ' = 0'), `Complete the square: write x² ${sgn(2 * h)}x ${sgn(c)} = 0 as (x ${sgn(h)})² = k. What is k?`.replace(' + 0 = 0', ' = 0')), ans: ansNum(K),
        sol: [T(`常數移到右邊：x² ${sgn(2 * h)}x = ${num(-c)}。`, `Move the constant: x² ${sgn(2 * h)}x = ${num(-c)}.`), T(`兩邊加上「x 係數一半的平方」：(${num(2 * h)} ÷ 2)² = ${h * h}。`, `Add (half the x-coefficient)² to both sides: (${num(2 * h)} ÷ 2)² = ${h * h}.`), T(`左邊 x² ${sgn(2 * h)}x + ${h * h} = (x ${sgn(h)})²，右邊 ${num(-c)} + ${h * h} = ${num(K)}。`, `Left: x² ${sgn(2 * h)}x + ${h * h} = (x ${sgn(h)})²; right: ${num(-c)} + ${h * h} = ${num(K)}.`), T(`k = ${num(K)}。`, `k = ${num(K)}.`)],
      };
    },
  },
  {
    id: 'g8-arith-seq', grade: 8,
    name: T('等差數列', 'Arithmetic sequences'),
    cur: { us: 'Algebra 1 · Arithmetic sequences (F-BF.A.2)', tw: '八年級 等差數列', aops: 'Intro Algebra' },
    at: { us: 9 },
    gen(r) {
      const k = r.int(0, 4), a1 = r.int(-20, 30), d = r.nz(-9, 9), A = (n) => a1 + (n - 1) * d;
      const f = T('等差數列第 n 項：aₙ = a₁ + (n − 1)d。', 'nth term of an arithmetic sequence: aₙ = a₁ + (n − 1)d.');
      if (k === 0) {
        const n = r.int(10, 60);
        return {
          q: T(`等差數列 ${[1, 2, 3, 4].map((i) => num(A(i))).join(', ')}, … 的第 ${n} 項是多少？`, `What is the ${ord(n)} term of the arithmetic sequence ${[1, 2, 3, 4].map((i) => num(A(i))).join(', ')}, …?`), ans: ansNum(A(n)),
          sol: [f, T(`首項 a₁ = ${num(a1)}，公差 d = ${num(A(2))} − ${par(a1)} = ${num(d)}。`, `First term a₁ = ${num(a1)}; common difference d = ${num(A(2))} − ${par(a1)} = ${num(d)}.`), T(`a<sub>${n}</sub> = ${num(a1)} + (${n} − 1) × ${par(d)} = ${num(a1)} ${sgn((n - 1) * d)} = ${num(A(n))}。`, `a<sub>${n}</sub> = ${num(a1)} + (${n} − 1) × ${par(d)} = ${num(a1)} ${sgn((n - 1) * d)} = ${num(A(n))}.`)],
        };
      }
      if (k === 1) {
        const m = r.int(2, 6), n = m + r.int(2, 10), ask1 = r.chance(0.5);
        return {
          q: T(`等差數列中 a<sub>${m}</sub> = ${num(A(m))}，a<sub>${n}</sub> = ${num(A(n))}，求${ask1 ? '首項 a₁' : '公差 d'}。`, `In an arithmetic sequence a<sub>${m}</sub> = ${num(A(m))} and a<sub>${n}</sub> = ${num(A(n))}. Find ${ask1 ? 'the first term a₁' : 'the common difference d'}.`), ans: ansNum(ask1 ? a1 : d),
          sol: [T(`從第 ${m} 項到第 ${n} 項，加了 ${n - m} 次公差。`, `From term ${m} to term ${n}, d is added ${n - m} times.`), T(`${n - m}d = ${num(A(n))} − ${par(A(m))} = ${num(A(n) - A(m))}，d = ${num(d)}。`, `${n - m}d = ${num(A(n))} − ${par(A(m))} = ${num(A(n) - A(m))}, so d = ${num(d)}.`), ...(ask1 ? [T(`a₁ = a<sub>${m}</sub> − (${m} − 1)d = ${num(A(m))} − ${m - 1} × ${par(d)} = ${num(a1)}。`, `a₁ = a<sub>${m}</sub> − (${m} − 1)d = ${num(A(m))} − ${m - 1} × ${par(d)} = ${num(a1)}.`)] : []), T(`答案：${ask1 ? `a₁ = ${num(a1)}` : `d = ${num(d)}`}。`, `Answer: ${ask1 ? `a₁ = ${num(a1)}` : `d = ${num(d)}`}.`)],
        };
      }
      if (k === 2) {
        const n = r.int(8, 80), V = A(n);
        return {
          q: T(`在等差數列 ${[1, 2, 3].map((i) => num(A(i))).join(', ')}, … 中，${num(V)} 是第幾項？`, `In the arithmetic sequence ${[1, 2, 3].map((i) => num(A(i))).join(', ')}, …, which term is ${num(V)}?`), ans: ansNum(n),
          sol: [f, T(`a₁ = ${num(a1)}，d = ${num(d)}：${num(a1)} + (n − 1) × ${par(d)} = ${num(V)}。`, `a₁ = ${num(a1)}, d = ${num(d)}: ${num(a1)} + (n − 1) × ${par(d)} = ${num(V)}.`), T(`(n − 1) × ${par(d)} = ${num(V - a1)}，n − 1 = ${n - 1}，n = ${n}。`, `(n − 1) × ${par(d)} = ${num(V - a1)}, so n − 1 = ${n - 1} and n = ${n}.`)],
        };
      }
      if (k === 3) {
        const dd = Math.abs(d), b1 = r.int(1, 20), n = r.int(10, 90), L = b1 + (n - 1) * dd;
        return {
          q: T(`數列 ${b1}, ${b1 + dd}, ${b1 + 2 * dd}, …, ${L} 共有幾項？`, `How many terms are in the list ${b1}, ${b1 + dd}, ${b1 + 2 * dd}, …, ${L}?`), ans: ansNum(n),
          sol: [T(`這是公差 ${dd} 的等差數列。`, `It's an arithmetic sequence with difference ${dd}.`), T(`從 ${b1} 到 ${L} 增加了 ${L - b1}，也就是 ${L - b1} ÷ ${dd} = ${n - 1} 個公差。`, `From ${b1} to ${L} it grows by ${L - b1}, which is ${L - b1} ÷ ${dd} = ${n - 1} steps.`), T(`${n - 1} 個間隔 → ${n - 1} + 1 = ${n} 項（別忘了 +1！）。`, `${n - 1} gaps → ${n - 1} + 1 = ${n} terms (don't forget the +1!).`)],
        };
      }
      const g = r.int(1, 4), a = r.int(-20, 20), dd = r.nz(-8, 8), b = a + (g + 1) * dd;
      return {
        q: T(`在 ${num(a)} 和 ${num(b)} 之間插入 ${g} 個數，使這 ${g + 2} 個數成等差數列。公差是多少？`, `Insert ${g} number${g > 1 ? 's' : ''} between ${num(a)} and ${num(b)} so that all ${g + 2} numbers form an arithmetic sequence. What is the common difference?`), ans: ansNum(dd),
        sol: [T(`共 ${g + 2} 項，${num(a)} 是第 1 項，${num(b)} 是第 ${g + 2} 項。`, `There are ${g + 2} terms: ${num(a)} is the 1st and ${num(b)} is the ${ord(g + 2)}.`), T(`中間有 ${g + 1} 個公差：(${g + 1})d = ${num(b)} − ${par(a)} = ${num(b - a)}。`, `There are ${g + 1} steps between them: ${g + 1}d = ${num(b)} − ${par(a)} = ${num(b - a)}.`), T(`d = ${num(dd)}，數列是 ${range(0, g + 1).map((i) => num(a + i * dd)).join(', ')}。`, `d = ${num(dd)}; the sequence is ${range(0, g + 1).map((i) => num(a + i * dd)).join(', ')}.`)],
      };
    },
  },
  {
    id: 'g8-arith-series', grade: 8,
    name: T('等差級數', 'Arithmetic series'),
    cur: { tw: '八年級 等差級數', aops: 'Intro Algebra' },
    gen(r) {
      const k = r.int(0, 3);
      const f = T('等差級數和 = (首項 + 末項) × 項數 ÷ 2。', 'Sum of an arithmetic series = (first + last) × number of terms ÷ 2.');
      if (k === 0) {
        const a1 = r.int(-10, 20), d = r.nz(-5, 6), n = r.int(6, 30), L = a1 + (n - 1) * d, S = ((a1 + L) * n) / 2;
        return {
          q: T(`等差數列首項 ${num(a1)}、公差 ${num(d)}，求前 ${n} 項的和。`, `An arithmetic sequence has first term ${num(a1)} and common difference ${num(d)}. Find the sum of the first ${n} terms.`), ans: ansNum(S),
          sol: [f, T(`末項 a<sub>${n}</sub> = ${num(a1)} + ${n - 1} × ${par(d)} = ${num(L)}。`, `Last term a<sub>${n}</sub> = ${num(a1)} + ${n - 1} × ${par(d)} = ${num(L)}.`), T(`和 = (${num(a1)} + ${par(L)}) × ${n} ÷ 2 = ${num(a1 + L)} × ${n} ÷ 2 = ${num(S)}。`, `Sum = (${num(a1)} + ${par(L)}) × ${n} ÷ 2 = ${num(a1 + L)} × ${n} ÷ 2 = ${num(S)}.`)],
        };
      }
      if (k === 1) {
        const a1 = r.int(1, 15), d = r.int(2, 7), n = r.int(8, 40), L = a1 + (n - 1) * d, S = ((a1 + L) * n) / 2;
        return {
          q: T(`求 ${a1} + ${a1 + d} + ${a1 + 2 * d} + … + ${L} 的和。`, `Find ${a1} + ${a1 + d} + ${a1 + 2 * d} + … + ${L}.`), ans: ansNum(S),
          sol: [T(`公差 ${d}，項數 = (${L} − ${a1}) ÷ ${d} + 1 = ${n}。`, `Common difference ${d}; number of terms = (${L} − ${a1}) ÷ ${d} + 1 = ${n}.`), f, T(`和 = (${a1} + ${L}) × ${n} ÷ 2 = ${a1 + L} × ${n} ÷ 2 = ${num(S)}。`, `Sum = (${a1} + ${L}) × ${n} ÷ 2 = ${a1 + L} × ${n} ÷ 2 = ${num(S)}.`), T('（高斯的方法：把數列正著寫一次、倒著寫一次，上下相加每一組都一樣。）', '(Gauss\'s trick: write the list forwards and backwards; each pair adds to the same total.)')],
        };
      }
      if (k === 2) {
        const t = r.int(0, 1);
        if (t === 0) {
          const n = r.int(10, 60);
          return {
            q: T(`求前 ${n} 個正奇數的和：1 + 3 + 5 + … + ${2 * n - 1}。`, `Find the sum of the first ${n} odd numbers: 1 + 3 + 5 + … + ${2 * n - 1}.`), ans: ansNum(n * n),
            sol: [T(`首項 1、末項 ${2 * n - 1}、共 ${n} 項。`, `First 1, last ${2 * n - 1}, ${n} terms.`), T(`和 = (1 + ${2 * n - 1}) × ${n} ÷ 2 = ${2 * n} × ${n} ÷ 2 = ${n * n}。`, `Sum = (1 + ${2 * n - 1}) × ${n} ÷ 2 = ${2 * n} × ${n} ÷ 2 = ${n * n}.`), T(`有趣的規律：前 n 個奇數的和 = n²，這裡是 ${n}² = ${n * n}。`, `A neat pattern: the first n odd numbers add to n², here ${n}² = ${n * n}.`)],
          };
        }
        const m = r.int(3, 9), lo = r.int(10, 60), hi = r.int(150, 400), f1 = Math.ceil(lo / m) * m, l1 = Math.floor(hi / m) * m, n = (l1 - f1) / m + 1, S = ((f1 + l1) * n) / 2;
        return {
          q: T(`${lo} 到 ${hi} 之間所有 ${m} 的倍數的和是多少？`, `What is the sum of all multiples of ${m} from ${lo} to ${hi}?`), ans: ansNum(S),
          sol: [T(`最小的 ${m} 的倍數是 ${f1}，最大的是 ${l1}。`, `The smallest multiple of ${m} in range is ${f1}; the largest is ${l1}.`), T(`項數 = (${l1} − ${f1}) ÷ ${m} + 1 = ${n}。`, `Number of terms = (${l1} − ${f1}) ÷ ${m} + 1 = ${n}.`), T(`和 = (${f1} + ${l1}) × ${n} ÷ 2 = ${num(S)}。`, `Sum = (${f1} + ${l1}) × ${n} ÷ 2 = ${num(S)}.`)],
        };
      }
      const a1 = r.int(12, 30), d = r.int(1, 4), n = r.int(10, 30), L = a1 + (n - 1) * d, S = ((a1 + L) * n) / 2;
      return {
        q: T(`禮堂第一排有 ${a1} 個座位，之後每一排都比前一排多 ${d} 個，共 ${n} 排。禮堂一共有多少個座位？`, `An auditorium has ${a1} seats in the first row, and each row has ${d} more seats than the row before. There are ${n} rows. How many seats are there in all?`), ans: ansNum(S),
        sol: [T(`每排座位數是首項 ${a1}、公差 ${d} 的等差數列。`, `The rows form an arithmetic sequence with first term ${a1} and difference ${d}.`), T(`最後一排：${a1} + ${n - 1} × ${d} = ${L}。`, `Last row: ${a1} + ${n - 1} × ${d} = ${L}.`), T(`總數 = (${a1} + ${L}) × ${n} ÷ 2 = ${num(S)}。`, `Total = (${a1} + ${L}) × ${n} ÷ 2 = ${num(S)}.`)],
      };
    },
  },
  {
    id: 'g8-polygon-angles', grade: 8,
    name: T('三角形與多邊形的角', 'Angles of triangles and polygons'),
    cur: { us: 'CCSS 8.G.A.5', tw: '八年級 三角形與多邊形的內角和、外角和', aops: 'Prealgebra' },
    gen(r) {
      const k = r.int(0, 5);
      const pts = [[40, 140], [210, 140], [r.int(70, 170), 20]];
      if (k === 0) {
        let a, b; do { a = r.int(20, 100); b = r.int(20, 100); } while (a + b >= 165);
        const c = 180 - a - b;
        return {
          q: T(`三角形的兩個內角是 ${a}° 和 ${b}°，第三個角是幾度？`, `Two angles of a triangle are ${a}° and ${b}°. What is the third angle, in degrees?`),
          fig: SV(250, 160, triAngFig(pts, [deg(a), deg(b), '?'])), ans: ansNum(c),
          sol: [T('三角形三個內角的和是 180°。', 'The three angles of a triangle add up to 180°.'), T(`180° − ${a}° − ${b}° = ${c}°。`, `180° − ${a}° − ${b}° = ${c}°.`), T(`檢查：${a} + ${b} + ${c} = 180 ✓`, `Check: ${a} + ${b} + ${c} = 180 ✓`)],
        };
      }
      if (k === 1) {
        let a, b; do { a = r.int(25, 85); b = r.int(25, 85); } while (a + b >= 165);
        const ext = ln(210, 140, 245, 140, 'f-line', 2) + tt(232, 128, '?', true, 12);
        return {
          q: T(`如圖，三角形的兩個內角是 ${a}° 和 ${b}°，延長底邊形成的外角（標「?」）是幾度？`, `In the figure, two interior angles are ${a}° and ${b}°. The bottom side is extended to form an exterior angle (marked "?"). How many degrees is it?`),
          fig: SV(255, 160, triAngFig([[40, 140], [210, 140], pts[2]], [deg(a), '', deg(b)], ext)), ans: ansNum(a + b),
          sol: [T('三角形的外角 = 兩個不相鄰的內角和。', 'An exterior angle of a triangle = the sum of the two interior angles not next to it.'), T(`外角 = ${a}° + ${b}° = ${a + b}°。`, `Exterior angle = ${a}° + ${b}° = ${a + b}°.`), T(`另一種想法：相鄰內角 = 180 − ${a} − ${b} = ${180 - a - b}，外角 = 180 − ${180 - a - b} = ${a + b} ✓`, `Another way: the adjacent interior angle is 180 − ${a} − ${b} = ${180 - a - b}, so the exterior angle is 180 − ${180 - a - b} = ${a + b} ✓`)],
        };
      }
      if (k === 2) {
        const n = r.int(5, 20);
        return {
          q: T(`${n} 邊形的內角和是幾度？`, `What is the sum of the interior angles of a ${n}-sided polygon, in degrees?`), ans: ansNum((n - 2) * 180),
          sol: [T(`從一個頂點畫對角線，可以把 n 邊形切成 n − 2 個三角形。`, `Diagonals from one vertex cut an n-gon into n − 2 triangles.`), T(`${n} 邊形 → ${n - 2} 個三角形。`, `${n} sides → ${n - 2} triangles.`), T(`內角和 = ${n - 2} × 180° = ${num((n - 2) * 180)}°。`, `Angle sum = ${n - 2} × 180° = ${num((n - 2) * 180)}°.`)],
        };
      }
      if (k === 3) {
        const n = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36]), each = ((n - 2) * 180) / n;
        return {
          q: T(`正 ${n} 邊形的每一個內角是幾度？`, `What is each interior angle of a regular ${n}-gon, in degrees?`), ans: ansNum(each),
          sol: [T(`內角和 = (${n} − 2) × 180° = ${num((n - 2) * 180)}°。`, `Angle sum = (${n} − 2) × 180° = ${num((n - 2) * 180)}°.`), T(`正多邊形每個角都相等：${num((n - 2) * 180)}° ÷ ${n} = ${num(each)}°。`, `A regular polygon has equal angles: ${num((n - 2) * 180)}° ÷ ${n} = ${num(each)}°.`), T(`驗算：每個外角 = 360° ÷ ${n} = ${num(360 / n)}°，${num(each)}° + ${num(360 / n)}° = 180° ✓`, `Check: each exterior angle = 360° ÷ ${n} = ${num(360 / n)}°, and ${num(each)}° + ${num(360 / n)}° = 180° ✓`)],
        };
      }
      if (k === 4) {
        const n = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36, 40, 45]), e = 360 / n, byInt = r.chance(0.5);
        return {
          q: byInt ? T(`一個正多邊形的每個內角都是 ${num(180 - e)}°，它是幾邊形？`, `Each interior angle of a regular polygon is ${num(180 - e)}°. How many sides does it have?`) : T(`一個正多邊形的每個外角都是 ${num(e)}°，它是幾邊形？`, `Each exterior angle of a regular polygon is ${num(e)}°. How many sides does it have?`),
          ans: ansNum(n),
          sol: [T('任何多邊形的外角和都是 360°。', 'The exterior angles of any polygon add up to 360°.'), ...(byInt ? [T(`每個外角 = 180° − ${num(180 - e)}° = ${num(e)}°。`, `Each exterior angle = 180° − ${num(180 - e)}° = ${num(e)}°.`)] : []), T(`邊數 = 360° ÷ ${num(e)}° = ${n}。`, `Number of sides = 360° ÷ ${num(e)}° = ${n}.`)],
        };
      }
      let a, b, c; do { a = r.int(1, 6); b = r.int(1, 7); c = r.int(1, 8); } while (180 % (a + b + c) || a === b && b === c);
      const u = 180 / (a + b + c), big = Math.max(a, b, c) * u;
      return {
        q: T(`三角形三個內角的比是 ${a} : ${b} : ${c}，最大的角是幾度？`, `The angles of a triangle are in the ratio ${a} : ${b} : ${c}. What is the largest angle, in degrees?`), ans: ansNum(big),
        sol: [T(`設三個角是 ${a}x、${b}x、${c}x。`, `Let the angles be ${a}x, ${b}x and ${c}x.`), T(`${a}x + ${b}x + ${c}x = 180 → ${a + b + c}x = 180 → x = ${u}。`, `${a}x + ${b}x + ${c}x = 180 → ${a + b + c}x = 180 → x = ${u}.`), T(`三個角：${a * u}°、${b * u}°、${c * u}°，最大是 ${big}°。`, `The angles are ${a * u}°, ${b * u}° and ${c * u}°; the largest is ${big}°.`)],
      };
    },
  },
  {
    id: 'g8-parallel-lines', grade: 8,
    name: T('平行線與截角', 'Parallel lines and transversals'),
    cur: { us: 'CCSS 8.G.A.5', tw: '八年級 平行線的截角性質', aops: 'Prealgebra' },
    gen(r) {
      let th; do th = r.int(45, 135); while (Math.abs(th - 90) < 12);
      const val = (i) => ([2, 3].includes(((i - 1) % 4) + 1) ? th : 180 - th); // UR(2), LL(3) = θ
      const REL = [
        [[1, 5], [2, 6], [3, 7], [4, 8]], // corresponding
        [[3, 6], [4, 5]],                 // alternate interior
        [[1, 8], [2, 7]],                 // alternate exterior
        [[3, 5], [4, 6]],                 // same-side interior
        [[1, 4], [2, 3], [5, 8], [6, 7]], // vertical
      ];
      const NAMES_R = [['同位角', 'corresponding angles', '相等', 'equal'], ['內錯角', 'alternate interior angles', '相等', 'equal'], ['外錯角', 'alternate exterior angles', '相等', 'equal'], ['同側內角', 'same-side interior angles', '互補（和為 180°）', 'supplementary (add to 180°)'], ['對頂角', 'vertical angles', '相等', 'equal']];
      const t = r.int(0, 4), pair = r.shuffle(r.pick(REL[t])), [g, a] = pair, nm = NAMES_R[t];
      const k = r.int(0, 1);
      if (k === 0 || t === 4) {
        return {
          q: T(`如圖，L₁ ∥ L₂，∠${g} = ${val(g)}°，求 ∠${a}（標「?」）是幾度？`, `In the figure L₁ ∥ L₂ and ∠${g} = ${val(g)}°. Find ∠${a} (marked "?"), in degrees.`),
          fig: parFig(th, g, a, deg(val(g))), ans: ansNum(val(a)),
          sol: [T(`∠${g} 和 ∠${a} 是${nm[0]}。`, `∠${g} and ∠${a} are ${nm[1]}.`), T(`${t === 4 ? '對頂角' : `兩直線平行時，${nm[0]}`}${nm[2]}。`, `${t === 4 ? 'Vertical angles are' : `When the lines are parallel, ${nm[1]} are`} ${nm[3]}.`), T(t === 3 ? `∠${a} = 180° − ${val(g)}° = ${val(a)}°。` : `∠${a} = ${val(a)}°。`, t === 3 ? `∠${a} = 180° − ${val(g)}° = ${val(a)}°.` : `∠${a} = ${val(a)}°.`)],
        };
      }
      // algebra version: expressions for both angles
      let x, p, q, c1, c2;
      do { x = r.int(5, 30); p = r.int(2, 6); c1 = val(g) - p * x; q = r.int(1, 7); c2 = val(a) - q * x; } while (p === q || c1 === 0 || c2 === 0 || Math.abs(c1) > 60 || Math.abs(c2) > 90);
      const e1 = poly([p, c1]), e2 = poly([q, c2]);
      return {
        q: T(`如圖，L₁ ∥ L₂，∠${g} = (${e1})°，∠${a} = (${e2})°。求 x。`, `In the figure L₁ ∥ L₂, ∠${g} = (${e1})° and ∠${a} = (${e2})°. Find x.`),
        fig: parFig(th, g, a, `(${e1})°`), ans: ansNum(x, `x = ${x}`),
        sol: [T(`∠${g} 和 ∠${a} 是${nm[0]}，${nm[2]}。`, `∠${g} and ∠${a} are ${nm[1]}, so they are ${nm[3]}.`), t === 3 ? T(`(${e1}) + (${e2}) = 180 → ${poly([p + q, c1 + c2])} = 180。`, `(${e1}) + (${e2}) = 180 → ${poly([p + q, c1 + c2])} = 180.`) : T(`${e1} = ${e2} → ${mono(p - q)} = ${num(c2 - c1)}。`, `${e1} = ${e2} → ${mono(p - q)} = ${num(c2 - c1)}.`), T(`x = ${x}。`, `x = ${x}.`), T(`檢查：∠${g} = ${val(g)}°，∠${a} = ${val(a)}° ✓`, `Check: ∠${g} = ${val(g)}°, ∠${a} = ${val(a)}° ✓`)],
      };
    },
  },
  {
    id: 'g8-quadrilaterals', grade: 8,
    name: T('平行四邊形與特殊四邊形', 'Parallelograms and special quadrilaterals'),
    cur: { tw: '八年級 平行四邊形與特殊四邊形', aops: 'Intro Geometry' },
    gen(r) {
      const k = r.int(0, 4);
      if (k === 0) {
        const A = r.int(50, 130), askB = r.chance(0.5);
        if (A === 90) return this.gen(r);
        return {
          q: T(`平行四邊形 ABCD 中，∠A = ${A}°，求 ∠${askB ? 'B' : 'C'}。`, `In parallelogram ABCD, ∠A = ${A}°. Find ∠${askB ? 'B' : 'C'}.`),
          fig: pgramFig({ A: deg(A), [askB ? 'B' : 'C']: '?' }), ans: ansNum(askB ? 180 - A : A),
          sol: askB ? [T('平行四邊形相鄰兩角互補（AD ∥ BC，∠A 與 ∠B 是同側內角）。', 'In a parallelogram, neighboring angles are supplementary (AD ∥ BC, so ∠A and ∠B are same-side interior angles).'), T(`∠B = 180° − ${A}° = ${180 - A}°。`, `∠B = 180° − ${A}° = ${180 - A}°.`)] : [T('平行四邊形的對角相等。', 'Opposite angles of a parallelogram are equal.'), T(`∠C = ∠A = ${A}°。`, `∠C = ∠A = ${A}°.`), T(`（∠B = ∠D = ${180 - A}°，四角和 ${A} + ${180 - A} + ${A} + ${180 - A} = 360 ✓）`, `(∠B = ∠D = ${180 - A}°, and ${A} + ${180 - A} + ${A} + ${180 - A} = 360 ✓)`)],
        };
      }
      if (k === 1) {
        let x, a, b, c, d; do { x = r.int(2, 10); a = r.int(1, 5); c = r.int(1, 7); b = r.int(-5, 12); d = a * x + b - c * x; } while (a === c || a * x + b <= 0 || d === 0 || b === 0);
        const half = a * x + b;
        return {
          q: T(`平行四邊形 ABCD 的對角線交於 E，AE = ${poly([a, b])}，EC = ${poly([c, d])}。求對角線 AC 的長。`, `The diagonals of parallelogram ABCD meet at E. AE = ${poly([a, b])} and EC = ${poly([c, d])}. Find the length of diagonal AC.`),
          fig: pgramFig({ AE: poly([a, b]), EC: poly([c, d]) }, true), ans: ansNum(2 * half),
          sol: [T('平行四邊形的兩條對角線互相平分，所以 AE = EC。', 'The diagonals of a parallelogram bisect each other, so AE = EC.'), T(`${poly([a, b])} = ${poly([c, d])} → ${mono(a - c)} = ${num(d - b)} → x = ${x}。`, `${poly([a, b])} = ${poly([c, d])} → ${mono(a - c)} = ${num(d - b)} → x = ${x}.`), T(`AE = ${a} × ${x} ${sgn(b)} = ${half}。`, `AE = ${a} × ${x} ${sgn(b)} = ${half}.`), T(`AC = 2 × AE = ${2 * half}。`, `AC = 2 × AE = ${2 * half}.`)],
        };
      }
      if (k === 2) {
        const [p, q, s] = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20]]);
        return {
          q: T(`菱形的兩條對角線長是 ${2 * p} 和 ${2 * q}，它的邊長是多少？`, `A rhombus has diagonals of lengths ${2 * p} and ${2 * q}. How long is each side?`), ans: ansNum(s),
          sol: [T('菱形的對角線互相垂直平分，把菱形切成 4 個全等的直角三角形。', 'The diagonals of a rhombus are perpendicular bisectors of each other, cutting it into 4 congruent right triangles.'), T(`每個直角三角形的兩股是對角線的一半：${p} 和 ${q}。`, `Each right triangle has legs equal to half the diagonals: ${p} and ${q}.`), T(`邊長 = √(${p}² + ${q}²) = √${s * s} = ${s}。`, `Side = √(${p}² + ${q}²) = √${s * s} = ${s}.`), T(`（面積 = 對角線乘積 ÷ 2 = ${2 * p} × ${2 * q} ÷ 2 = ${2 * p * q}。）`, `(Area = product of diagonals ÷ 2 = ${2 * p} × ${2 * q} ÷ 2 = ${2 * p * q}.)`)],
        };
      }
      if (k === 3) {
        let x, a, b, c, d; do { x = r.int(2, 12); a = r.int(2, 6); c = r.int(1, 8); b = r.int(-8, 15); d = a * x + b - c * x; } while (a === c || a * x + b <= 2 || d === 0 || b === 0);
        return {
          q: T(`長方形 ABCD 的對角線 AC = ${poly([a, b])}，BD = ${poly([c, d])}。求 x。`, `In rectangle ABCD, diagonal AC = ${poly([a, b])} and diagonal BD = ${poly([c, d])}. Find x.`), ans: ansNum(x, `x = ${x}`),
          sol: [T('長方形的兩條對角線等長。', 'The diagonals of a rectangle are equal in length.'), T(`${poly([a, b])} = ${poly([c, d])} → ${mono(a - c)} = ${num(d - b)}。`, `${poly([a, b])} = ${poly([c, d])} → ${mono(a - c)} = ${num(d - b)}.`), T(`x = ${x}，對角線長 ${a * x + b}。`, `x = ${x}; each diagonal is ${a * x + b}.`)],
        };
      }
      let a, b, c; do { a = r.int(50, 140); b = r.int(50, 140); c = r.int(50, 140); } while (360 - a - b - c < 30 || 360 - a - b - c > 170);
      const d = 360 - a - b - c;
      return {
        q: T(`四邊形的三個內角是 ${a}°、${b}°、${c}°，第四個角是幾度？`, `Three angles of a quadrilateral are ${a}°, ${b}° and ${c}°. What is the fourth angle, in degrees?`), ans: ansNum(d),
        sol: [T('四邊形可以用一條對角線切成 2 個三角形，所以內角和 = 2 × 180° = 360°。', 'A diagonal cuts a quadrilateral into 2 triangles, so its angles add to 2 × 180° = 360°.'), T(`360° − ${a}° − ${b}° − ${c}° = ${d}°。`, `360° − ${a}° − ${b}° − ${c}° = ${d}°.`)],
      };
    },
  },
  {
    id: 'g8-diophantine', grade: 8,
    name: T('整數解問題（買東西湊錢）', 'Integer solutions (Diophantine puzzles)'),
    cur: { aops: 'Intro Number Theory' },
    gen(r) {
      const k = r.int(0, 2);
      if (k === 0) {
        let a, b, c, sols; do { a = r.int(2, 9); b = r.int(2, 11); c = r.int(30, 120); sols = []; for (let x = 1; a * x < c; x++) if ((c - a * x) % b === 0 && c - a * x > 0) sols.push([x, (c - a * x) / b]); } while (a === b || gcd(a, b) > 1 || sols.length < 1 || sols.length > 8);
        const nm = who(r), story = r.chance(0.6);
        return {
          q: story ? T(`${nm[0]}要用剛好 ${c} 元買每支 ${a} 元的鉛筆和每個 ${b} 元的橡皮擦，兩種都至少買一個。共有幾種買法？`, `${nm[1]} wants to spend exactly $${c} on pencils at $${a} each and erasers at $${b} each, buying at least one of each. How many ways are there?`)
            : T(`方程式 ${a}x + ${b}y = ${c} 有幾組正整數解 (x, y)？`, `How many solutions in positive integers (x, y) does ${a}x + ${b}y = ${c} have?`),
          ans: ansNum(sols.length),
          sol: [T(`${story ? `設鉛筆 x 支、橡皮擦 y 個：` : ''}${a}x + ${b}y = ${c}，x、y 都是正整數。`, `${story ? 'Let x = pencils and y = erasers: ' : ''}${a}x + ${b}y = ${c} with x, y positive integers.`), T(`${c} − ${a}x 必須是 ${b} 的正倍數。逐一試 x：`, `${c} − ${a}x must be a positive multiple of ${b}. Try values of x:`), T(`符合的有 ${sols.map(([x, y]) => `(${x}, ${y})`).join('、')}。`, `The ones that work: ${sols.map(([x, y]) => `(${x}, ${y})`).join(', ')}.`), T(`規律：x 每增加 ${b}，y 就減少 ${a}。共 ${sols.length} 組。`, `Pattern: each time x goes up by ${b}, y goes down by ${a}. That's ${sols.length} solution(s).`)],
        };
      }
      if (k === 1) {
        const [a, b] = r.pick([[3, 5], [4, 7], [5, 8], [3, 7], [5, 7], [4, 9], [3, 8], [6, 11]]); let c, best;
        do { c = r.int(20, 80); best = null; for (let y = 0; b * y <= c; y++) if ((c - b * y) % a === 0) { const x = (c - b * y) / a; if (!best || x + y < best[0] + best[1]) best = [x, y]; } } while (!best);
        return {
          q: T(`郵局只賣 ${a} 元和 ${b} 元的郵票。要剛好貼 ${c} 元的郵資，最少要用幾張郵票？`, `A post office only sells $${a} and $${b} stamps. To make exactly $${c} of postage, what is the fewest number of stamps you can use?`),
          ans: ansNum(best[0] + best[1]),
          sol: [T(`想用最少張，就盡量多用 ${b} 元的大面額。`, `To use as few stamps as possible, use as many $${b} stamps as you can.`), T(`設 ${b} 元 y 張、${a} 元 x 張：${a}x + ${b}y = ${c}。從大的 y 往下試，剩下的錢要是 ${a} 的倍數。`, `Let y = $${b} stamps and x = $${a} stamps: ${a}x + ${b}y = ${c}. Try y from large to small; what's left must be a multiple of ${a}.`), T(`y = ${best[1]}：${c} − ${b * best[1]} = ${c - b * best[1]} = ${a} × ${best[0]} ✓`, `y = ${best[1]}: ${c} − ${b * best[1]} = ${c - b * best[1]} = ${a} × ${best[0]} ✓`), T(`最少 ${best[1]} + ${best[0]} = ${best[0] + best[1]} 張。`, `Fewest: ${best[1]} + ${best[0]} = ${best[0] + best[1]} stamps.`)],
        };
      }
      const [a, b] = r.pick([[3, 5], [4, 7], [5, 8], [3, 7], [5, 7], [4, 9], [3, 8], [5, 9], [7, 9], [5, 6], [4, 5], [7, 8]]), F = a * b - a - b;
      return {
        q: T(`某店的雞塊只賣 ${a} 塊裝和 ${b} 塊裝。無法剛好買到的最大塊數是多少？`, `A shop sells nuggets only in boxes of ${a} and ${b}. What is the largest number of nuggets that can NOT be bought exactly?`),
        ans: ansNum(F),
        sol: [T(`${a} 和 ${b} 互質。有一個漂亮的公式（雞塊定理）：無法湊出的最大數 = ${a} × ${b} − ${a} − ${b}。`, `${a} and ${b} share no common factor. A famous result (the Chicken McNugget theorem): the largest number you can't make is ${a} × ${b} − ${a} − ${b}.`), T(`= ${a * b} − ${a} − ${b} = ${F}。`, `= ${a * b} − ${a} − ${b} = ${F}.`), T(`檢查：${F} 減去 0、${b}、${2 * b}…… 都不是 ${a} 的倍數，所以湊不出來；而 ${F + 1} 到 ${F + a} 這連續 ${a} 個數都湊得出來，之後每個數只要再加 ${a} 塊裝就行。`, `Check: ${F} minus 0, ${b}, ${2 * b}, … is never a multiple of ${a}, so it can't be made; but ${F + 1} through ${F + a} (${a} numbers in a row) can, and then every bigger number is one of those plus some boxes of ${a}.`)],
      };
    },
  },
  {
    id: 'g8-counting', grade: 8,
    name: T('計數技巧：倍數、排容與補集', 'Counting: multiples, inclusion–exclusion and complements'),
    cur: { aops: 'Intro Counting & Probability' },
    gen(r) {
      const k = r.int(0, 4);
      if (k === 0) {
        const m = r.int(3, 13), A = r.int(10, 200), B = A + r.int(100, 900), n = Math.floor(B / m) - Math.floor((A - 1) / m);
        return {
          q: T(`從 ${A} 到 ${B}（包含兩端）有幾個 ${m} 的倍數？`, `How many multiples of ${m} are there from ${A} to ${B}, inclusive?`), ans: ansNum(n),
          sol: [T(`1～${B} 中 ${m} 的倍數有 ⌊${B} ÷ ${m}⌋ = ${Math.floor(B / m)} 個。`, `From 1 to ${B} there are ⌊${B} ÷ ${m}⌋ = ${Math.floor(B / m)} multiples of ${m}.`), T(`1～${A - 1} 中有 ⌊${A - 1} ÷ ${m}⌋ = ${Math.floor((A - 1) / m)} 個（要扣掉）。`, `From 1 to ${A - 1} there are ⌊${A - 1} ÷ ${m}⌋ = ${Math.floor((A - 1) / m)} (remove these).`), T(`${Math.floor(B / m)} − ${Math.floor((A - 1) / m)} = ${n}。`, `${Math.floor(B / m)} − ${Math.floor((A - 1) / m)} = ${n}.`)],
        };
      }
      if (k === 1) {
        let a, b; do { a = r.int(2, 9); b = r.int(2, 11); } while (a === b || a % b === 0 || b % a === 0);
        const N = r.int(50, 500), L = lcm(a, b), na = Math.floor(N / a), nb = Math.floor(N / b), nl = Math.floor(N / L), either = na + nb - nl, neither = r.chance(0.4);
        return {
          q: neither ? T(`1 到 ${N} 中，既不是 ${a} 的倍數、也不是 ${b} 的倍數的數有幾個？`, `How many integers from 1 to ${N} are multiples of neither ${a} nor ${b}?`) : T(`1 到 ${N} 中，是 ${a} 的倍數或 ${b} 的倍數的數有幾個？`, `How many integers from 1 to ${N} are multiples of ${a} or ${b} (or both)?`),
          ans: ansNum(neither ? N - either : either),
          sol: [T(`${a} 的倍數：⌊${N}/${a}⌋ = ${na}；${b} 的倍數：⌊${N}/${b}⌋ = ${nb}。`, `Multiples of ${a}: ⌊${N}/${a}⌋ = ${na}; multiples of ${b}: ⌊${N}/${b}⌋ = ${nb}.`), T(`兩者都是（${L} 的倍數）被算了兩次：⌊${N}/${L}⌋ = ${nl}。`, `Numbers that are both (multiples of ${L}) were counted twice: ⌊${N}/${L}⌋ = ${nl}.`), T(`排容原理：${na} + ${nb} − ${nl} = ${either}。`, `Inclusion–exclusion: ${na} + ${nb} − ${nl} = ${either}.`), ...(neither ? [T(`都不是的：${N} − ${either} = ${N - either}。`, `Neither: ${N} − ${either} = ${N - either}.`)] : [])],
        };
      }
      if (k === 2) {
        const L = r.int(2, 4), t = r.int(0, 2), d = r.int(1, 9), total = 9 * 10 ** (L - 1);
        const none = t === 0 ? 8 * 9 ** (L - 1) : t === 1 ? 5 ** L : 4 * 5 ** (L - 1);
        const what = t === 0 ? [`至少有一個數字是 ${d}`, `at least one digit equal to ${d}`] : t === 1 ? ['至少有一個數字是偶數', 'at least one even digit'] : ['至少有一個數字是奇數', 'at least one odd digit'];
        const how = t === 0 ? T(`沒有 ${d} 的：首位不能是 0 也不能是 ${d}，有 8 種；其他每位不能是 ${d}，各 9 種：8 × ${'9 × '.repeat(L - 1).slice(0, -3)} = ${none}。`, `With no ${d}: the first digit can't be 0 or ${d} (8 choices); each other digit can't be ${d} (9 choices): 8 × ${'9 × '.repeat(L - 1).slice(0, -3)} = ${none}.`)
          : t === 1 ? T(`沒有偶數（全是奇數 1,3,5,7,9）：每位 5 種，${L} 位：5<sup>${L}</sup> = ${none}。`, `No even digits (all odd: 1, 3, 5, 7, 9): 5 choices per digit, so 5<sup>${L}</sup> = ${none}.`)
            : T(`沒有奇數（全是偶數）：首位只能是 2,4,6,8（4 種），其他位 0,2,4,6,8（5 種）：4 × 5<sup>${L - 1}</sup> = ${none}。`, `No odd digits (all even): first digit 2, 4, 6 or 8 (4 choices), others 0, 2, 4, 6, 8 (5 choices): 4 × 5<sup>${L - 1}</sup> = ${none}.`);
        return {
          q: T(`有幾個${L}位數${what[0]}？`, `How many ${L}-digit numbers have ${what[1]}?`), ans: ansNum(total - none),
          sol: [T('「至少一個」直接數很麻煩，改用補集：全部 − 一個都沒有。', '"At least one" is hard to count directly; count the complement: all − none.'), T(`${L} 位數共有 ${num(total)} 個（${10 ** (L - 1)} 到 ${10 ** L - 1}）。`, `There are ${num(total)} ${L}-digit numbers (${10 ** (L - 1)} to ${10 ** L - 1}).`), how, T(`答案：${num(total)} − ${num(none)} = ${num(total - none)}。`, `Answer: ${num(total)} − ${num(none)} = ${num(total - none)}.`)],
        };
      }
      if (k === 3) {
        const n = r.int(5, 20), v = (n * (n - 3)) / 2;
        return {
          q: T(`${n} 邊形共有幾條對角線？`, `How many diagonals does a ${n}-sided polygon have?`), ans: ansNum(v),
          sol: [T(`每個頂點可以連到另外 ${n - 1} 個頂點，但其中 2 個是相鄰的（連起來是邊），所以每個頂點有 ${n - 3} 條對角線。`, `Each vertex connects to ${n - 1} others, but 2 are neighbors (those are sides), so each vertex has ${n - 3} diagonals.`), T(`${n} × ${n - 3} = ${n * (n - 3)}，但每條對角線被兩端各算一次，要除以 2。`, `${n} × ${n - 3} = ${n * (n - 3)}, but each diagonal was counted from both ends, so divide by 2.`), T(`${n * (n - 3)} ÷ 2 = ${v}。`, `${n * (n - 3)} ÷ 2 = ${v}.`)],
        };
      }
      const L = r.int(3, 7), half = Math.ceil(L / 2), v = 9 * 10 ** (half - 1);
      return {
        q: T(`迴文數是正著讀、倒著讀都一樣的數（例如 ${L % 2 ? '12321'.slice(0, L) : '1221'}）。共有幾個 ${L} 位數的迴文數？`.replace(/（例如 [^）]*）/, `（例如 ${L === 3 ? '373' : L === 4 ? '4114' : L === 5 ? '12321' : L === 6 ? '583385' : '1234321'}）`), `A palindrome reads the same forwards and backwards (like ${L === 3 ? '373' : L === 4 ? '4114' : L === 5 ? '12321' : L === 6 ? '583385' : '1234321'}). How many ${L}-digit palindromes are there?`), ans: ansNum(v),
        sol: [T(`只要決定前 ${half} 位，後面的數字就跟著決定了（倒過來抄）。`, `Once the first ${half} digits are chosen, the rest are forced (copied in reverse).`), T(`第 1 位：1～9 共 9 種；${half > 1 ? `其他 ${half - 1} 位：各 10 種。` : ''}`, `First digit: 1–9, 9 choices${half === 2 ? '; the other digit: 10 choices' : half > 2 ? `; the other ${half - 1} digits: 10 choices each` : ''}.`), T(`9 × ${half > 1 ? `10<sup>${half - 1}</sup>` : '1'} = ${num(v)}。`, `9 × ${half > 1 ? `10<sup>${half - 1}</sup>` : '1'} = ${num(v)}.`)],
      };
    },
  },
];

// ======================= GRADE 9 =======================
// (−b ± √D) / den, simplified, as HTML "x = …"
function qfShow(nb, D, den) {
  const [k, rr] = simpRoot(D), g = gcd(gcd(Math.abs(nb), k), Math.abs(den)) || 1, s = den < 0 ? -1 : 1;
  const top = `${num((s * nb) / g)} ± ${rad(k / g, rr)}`, bot = Math.abs(den) / g;
  return `x = ${bot === 1 ? top : fx(top, bot)}`;
}
const vform = (a, h, k) => `y = ${a === 1 ? '' : a === -1 ? '−' : num(a)}${h === 0 ? 'x²' : `(x ${sgn(-h)})²`}${k ? ` ${sgn(k)}` : ''}`;
const DAYS = [['星期日', 'Sunday'], ['星期一', 'Monday'], ['星期二', 'Tuesday'], ['星期三', 'Wednesday'], ['星期四', 'Thursday'], ['星期五', 'Friday'], ['星期六', 'Saturday']];
const median = (a) => { const n = a.length; return n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2; };
// a small lattice grid m × n with A bottom-left and B top-right
function latticeFig(m, n) {
  const u = Math.min(36, 220 / Math.max(m, n)), w = m * u + 40, h = n * u + 40;
  let b = '';
  for (let i = 0; i <= m; i++) b += ln(20 + i * u, 20, 20 + i * u, 20 + n * u, 'f-line', 1.2);
  for (let j = 0; j <= n; j++) b += ln(20, 20 + j * u, 20 + m * u, 20 + j * u, 'f-line', 1.2);
  b += dot(20, 20 + n * u, true) + dot(20 + m * u, 20, true) + tt(10, 30 + n * u, 'A', true) + tt(30 + m * u, 10, 'B', true);
  return SV(w, h, b);
}

const G9 = [
  {
    id: 'g9-quad-formula', grade: 9,
    name: T('公式解與判別式', 'The quadratic formula and the discriminant'),
    cur: { us: 'Algebra 1 · Quadratic formula (A-REI.B.4b)', tw: '八年級 一元二次方程式（公式解）', aops: 'Intro Algebra' },
    at: { tw: 8 },
    gen(r) {
      const k = r.int(0, 4);
      const F = T('公式解：ax² + bx + c = 0 的解是 x = (−b ± √(b² − 4ac)) ÷ 2a，其中 D = b² − 4ac 叫做判別式。', 'Quadratic formula: ax² + bx + c = 0 has x = (−b ± √(b² − 4ac)) ÷ 2a; D = b² − 4ac is the discriminant.');
      if (k === 0) {
        const a = r.nz(-5, 5), b = r.nz(-9, 9), c = r.nz(-9, 9), D = b * b - 4 * a * c;
        return {
          q: T(`求 ${poly([a, b, c])} = 0 的判別式 D = b² − 4ac。`, `Find the discriminant D = b² − 4ac of ${poly([a, b, c])} = 0.`), ans: ansNum(D),
          sol: [T(`a = ${num(a)}，b = ${num(b)}，c = ${num(c)}。`, `a = ${num(a)}, b = ${num(b)}, c = ${num(c)}.`), T(`b² = ${par(b)}² = ${b * b}；4ac = 4 × ${par(a)} × ${par(c)} = ${num(4 * a * c)}。`, `b² = ${par(b)}² = ${b * b}; 4ac = 4 × ${par(a)} × ${par(c)} = ${num(4 * a * c)}.`), T(`D = ${b * b} − ${par(4 * a * c)} = ${num(D)}。`, `D = ${b * b} − ${par(4 * a * c)} = ${num(D)}.`), T(`D ${D > 0 ? '> 0，有兩個相異實根' : D === 0 ? '= 0，有一個重根' : '< 0，沒有實根'}。`, `D ${D > 0 ? '> 0: two different real roots' : D === 0 ? '= 0: one double root' : '< 0: no real roots'}.`)],
        };
      }
      if (k === 1) {
        const t = r.int(0, 2); let a, b, c, D;
        if (t === 1) { const p = r.int(1, 4), q = r.nz(-7, 7); a = p * p; b = 2 * p * q; c = q * q; if (r.chance(0.5)) { a = -a; b = -b; c = -c; } }
        else do { a = r.nz(-5, 5); b = r.nz(-9, 9); c = r.nz(-9, 9); } while (t === 0 ? b * b - 4 * a * c <= 0 : b * b - 4 * a * c >= 0);
        D = b * b - 4 * a * c;
        const opts = [T('兩個相異實根', 'Two different real roots'), T('一個實根（重根）', 'Exactly one real root (a double root)'), T('沒有實根', 'No real roots')];
        return {
          q: T(`方程式 ${poly([a, b, c])} = 0 有幾個實數解？`, `How many real solutions does ${poly([a, b, c])} = 0 have?`),
          ans: ansChoice([opts[t], ...opts.filter((_, i) => i !== t)]),
          sol: [T('看判別式 D = b² − 4ac：D > 0 兩根、D = 0 重根、D < 0 無實根。', 'Use the discriminant D = b² − 4ac: D > 0 two roots, D = 0 one (double) root, D < 0 none.'), T(`D = ${par(b)}² − 4 × ${par(a)} × ${par(c)} = ${b * b} ${sgn(-4 * a * c)} = ${num(D)}。`, `D = ${par(b)}² − 4 × ${par(a)} × ${par(c)} = ${b * b} ${sgn(-4 * a * c)} = ${num(D)}.`), T(`D ${D > 0 ? '> 0' : D === 0 ? '= 0' : '< 0'}，所以${['有兩個相異實根', '有一個重根', '沒有實根'][t]}。`, `D ${D > 0 ? '> 0' : D === 0 ? '= 0' : '< 0'}, so ${['there are two different real roots', 'there is one double root', 'there are no real roots'][t]}.`)],
        };
      }
      if (k === 2) {
        let a, b, c, D; do { a = r.int(1, 3); b = r.nz(-9, 9); c = r.nz(-9, 9); D = b * b - 4 * a * c; } while (D <= 0 || Number.isInteger(Math.sqrt(D)));
        const D2 = b * b + 4 * a * c, right = qfShow(-b, D, 2 * a);
        const w3 = D2 > 0 && !Number.isInteger(Math.sqrt(D2)) ? qfShow(-b, D2, 2 * a) : qfShow(-b, D, 4 * a);
        const [kk, rr] = simpRoot(D);
        return {
          q: T(`用公式解解 ${poly([a, b, c])} = 0。`, `Solve ${poly([a, b, c])} = 0 with the quadratic formula.`),
          ans: choice(right, qfShow(b, D, 2 * a), qfShow(-b, D, a), w3),
          sol: [F, T(`a = ${a}，b = ${num(b)}，c = ${num(c)}：D = ${b * b} ${sgn(-4 * a * c)} = ${D}。`, `a = ${a}, b = ${num(b)}, c = ${num(c)}: D = ${b * b} ${sgn(-4 * a * c)} = ${D}.`), T(`√${D}${kk > 1 ? ` = ${rad(kk, rr)}` : ''}。`, `√${D}${kk > 1 ? ` = ${rad(kk, rr)}` : ''}.`), T(`x = ${fx(`${num(-b)} ± ${rad(kk, rr)}`, 2 * a)}${right.replace('x = ', '') !== fx(`${num(-b)} ± ${rad(kk, rr)}`, 2 * a) ? `，約分得 ${right}` : ''}。`, `x = ${fx(`${num(-b)} ± ${rad(kk, rr)}`, 2 * a)}${right.replace('x = ', '') !== fx(`${num(-b)} ± ${rad(kk, rr)}`, 2 * a) ? `, which simplifies to ${right}` : ''}.`), T(`常見錯誤：−b 寫成 b、分母只寫 a、或 b² − 4ac 的符號算錯。`, `Common slips: using b instead of −b, dividing by a instead of 2a, or a sign error in b² − 4ac.`)],
        };
      }
      if (k === 3) {
        const b = 2 * r.nz(-9, 9), K = (b * b) / 4;
        return {
          q: T(`若方程式 x² ${sgn(b)}x + k = 0 只有一個實數解（重根），求 k。`, `If x² ${sgn(b)}x + k = 0 has exactly one real solution (a double root), find k.`), ans: ansNum(K),
          sol: [T('只有一個解（重根）⇔ 判別式 D = 0。', 'Exactly one solution (double root) ⇔ the discriminant D = 0.'), T(`D = ${par(b)}² − 4 × 1 × k = ${b * b} − 4k = 0。`, `D = ${par(b)}² − 4 × 1 × k = ${b * b} − 4k = 0.`), T(`k = ${b * b} ÷ 4 = ${K}。`, `k = ${b * b} ÷ 4 = ${K}.`), T(`驗算：x² ${sgn(b)}x + ${K} = (x ${sgn(b / 2)})²，只有 x = ${num(-b / 2)} 一個解 ✓`, `Check: x² ${sgn(b)}x + ${K} = (x ${sgn(b / 2)})², so x = ${num(-b / 2)} only ✓`)],
        };
      }
      let a, p, q; do { a = r.int(2, 4); p = r.nz(-9, 9); q = r.nz(-6, 6); } while (gcd(a, Math.abs(p)) !== 1 || a * q === p);
      const B = -(a * q + p), Cc = p * q, D = (a * q - p) ** 2, sD = Math.abs(a * q - p);
      return {
        q: T(`用公式解解 ${poly([a, B, Cc])} = 0。（兩個解用逗號隔開，可以用分數）`, `Solve ${poly([a, B, Cc])} = 0 with the quadratic formula. (Separate the two answers with a comma; fractions are fine.)`),
        ans: ansSet([q, p / a], `${q}, ${fracText(p, a)}`),
        sol: [F, T(`D = ${par(B)}² − 4 × ${a} × ${par(Cc)} = ${B * B} ${sgn(-4 * a * Cc)} = ${D}，√${D} = ${sD}。`, `D = ${par(B)}² − 4 × ${a} × ${par(Cc)} = ${B * B} ${sgn(-4 * a * Cc)} = ${D}, √${D} = ${sD}.`), T(`x = ${fx(`${num(-B)} ± ${sD}`, 2 * a)}。`, `x = ${fx(`${num(-B)} ± ${sD}`, 2 * a)}.`), T(`x = ${eqR(-B + sD, 2 * a)} 或 x = ${eqR(-B - sD, 2 * a)}。`, `x = ${eqR(-B + sD, 2 * a)} or x = ${eqR(-B - sD, 2 * a)}.`), T(`驗算：${poly([a, B, Cc])} = ${facA(a, -p)}${fac1(-q)} ✓`, `Check: ${poly([a, B, Cc])} = ${facA(a, -p)}${fac1(-q)} ✓`)],
      };
    },
  },
  {
    id: 'g9-quad-function', grade: 9,
    name: T('二次函數的頂點與最大最小值', 'Quadratic functions: vertex, axis and max/min'),
    cur: { us: 'Algebra 1 · Quadratic functions (F-IF.C.8a)', tw: '九年級 二次函數', aops: 'Intro Algebra' },
    gen(r) {
      const k = r.int(0, 4), a = r.nz(-3, 3), h = r.int(-6, 6), kk = r.int(-9, 9);
      const b = -2 * a * h, c = a * h * h + kk, std = `y = ${poly([a, b, c])}`;
      if (k === 0) return {
        q: T(`二次函數 ${vform(a, h, kk)} 的頂點坐標是什麼？（答案寫成 (x, y)）`, `What is the vertex of ${vform(a, h, kk)}? (Answer as (x, y).)`), ans: ansPair(h, kk),
        sol: [T('頂點式 y = a(x − h)² + k 的頂點是 (h, k)。', 'Vertex form y = a(x − h)² + k has vertex (h, k).'), T(`這裡 ${h === 0 ? 'x² 表示 h = 0' : `(x ${sgn(-h)})² 表示 h = ${num(h)}（注意正負號相反）`}，k = ${num(kk)}。`, `Here ${h === 0 ? 'x² means h = 0' : `(x ${sgn(-h)})² means h = ${num(h)} (watch the sign flip)`}, and k = ${num(kk)}.`), T(`頂點 (${num(h)}, ${num(kk)})，開口${a > 0 ? '向上' : '向下'}。`, `Vertex (${num(h)}, ${num(kk)}); the parabola opens ${a > 0 ? 'up' : 'down'}.`)],
      };
      if (k === 1 || k === 2) {
        if (b === 0) return this.gen(r);
        const askV = k === 1;
        return {
          q: askV ? T(`二次函數 ${std} 的頂點坐標是什麼？（答案寫成 (x, y)）`, `Find the vertex of ${std}. (Answer as (x, y).)`)
            : T(`二次函數 ${std} 的${a > 0 ? '最小值' : '最大值'}是多少？`, `What is the ${a > 0 ? 'minimum' : 'maximum'} value of ${std}?`),
          ans: askV ? ansPair(h, kk) : ansNum(kk),
          sol: [T('頂點的 x 坐標：x = −b ÷ 2a。', 'The vertex has x = −b ÷ 2a.'), T(`x = −${par(b)} ÷ (2 × ${par(a)}) = ${num(h)}。`, `x = −${par(b)} ÷ (2 × ${par(a)}) = ${num(h)}.`), T(`代回：y = ${num(a)} × ${par(h)}² ${sgn(b)} × ${par(h)} ${sgn(c)} = ${num(kk)}。`, `Plug in: y = ${num(a)} × ${par(h)}² ${sgn(b)} × ${par(h)} ${sgn(c)} = ${num(kk)}.`), T(`（配方：${std} = ${vform(a, h, kk).slice(4)}。）`, `(Completing the square: ${std} = ${vform(a, h, kk).slice(4)}.)`), askV ? T(`頂點 (${num(h)}, ${num(kk)})。`, `Vertex (${num(h)}, ${num(kk)}).`) : T(`a ${a > 0 ? '> 0 開口向上，頂點最低' : '< 0 開口向下，頂點最高'}，所以${a > 0 ? '最小值' : '最大值'}是 ${num(kk)}。`, `a ${a > 0 ? '> 0: opens up, the vertex is the lowest point' : '< 0: opens down, the vertex is the highest point'}, so the ${a > 0 ? 'minimum' : 'maximum'} is ${num(kk)}.`)],
        };
      }
      if (k === 3) {
        let p, q; do { p = r.int(-9, 9); q = r.int(-9, 9); } while (p === q);
        const A = r.nz(-3, 3), cs = pmul([A, -A * p], [1, -q]);
        return {
          q: T(`拋物線 y = ${poly(cs)} 的對稱軸是 x = ?`, `The parabola y = ${poly(cs)} has axis of symmetry x = ?`), ans: ansNum((p + q) / 2, `x = ${fracText(p + q, 2)}`),
          sol: [T(`方法一：對稱軸 x = −b ÷ 2a = −${par(cs[1])} ÷ ${par(2 * A)} = ${fracR(p + q, 2)}。`, `Method 1: axis x = −b ÷ 2a = −${par(cs[1])} ÷ ${par(2 * A)} = ${fracR(p + q, 2)}.`), T(`方法二：y = ${num(A)}${fac1(-p)}${fac1(-q)}，和 x 軸交於 x = ${num(p)}、${num(q)}；對稱軸在兩交點正中間：(${num(p)} + ${par(q)}) ÷ 2 = ${fracR(p + q, 2)}。`.replace(/\(x \+ 0\)/g, 'x').replace(/\(x − 0\)/g, 'x'), `Method 2: y = ${num(A)}${fac1(-p)}${fac1(-q)} crosses the x-axis at x = ${num(p)} and ${num(q)}; the axis is halfway between: (${num(p)} + ${par(q)}) ÷ 2 = ${fracR(p + q, 2)}.`.replace(/\(x \+ 0\)/g, 'x').replace(/\(x − 0\)/g, 'x')), T(`答案：x = ${fracR(p + q, 2)}。`, `Answer: x = ${fracR(p + q, 2)}.`)],
        };
      }
      const v = r.pick([10, 20, 30, 40]), h0 = r.pick([0, 1, 2, 5, 10]), tt0 = v / 10, mx = h0 + (v * v) / 20;
      return {
        q: T(`把球往上拋，t 秒後的高度是 h = −5t² + ${v}t${h0 ? ` + ${h0}` : ''}（公尺）。球最高到達幾公尺？`, `A ball is thrown upward; after t seconds its height is h = −5t² + ${v}t${h0 ? ` + ${h0}` : ''} meters. What is its greatest height, in meters?`), ans: ansNum(mx),
        sol: [T('a = −5 < 0，開口向下，頂點就是最高點。', 'a = −5 < 0, so the parabola opens down and its vertex is the highest point.'), T(`t = −b ÷ 2a = −${v} ÷ (2 × (−5)) = ${tt0} 秒。`, `t = −b ÷ 2a = −${v} ÷ (2 × (−5)) = ${tt0} s.`), T(`h = −5 × ${tt0}² + ${v} × ${tt0}${h0 ? ` + ${h0}` : ''} = ${num(-5 * tt0 * tt0)} + ${v * tt0}${h0 ? ` + ${h0}` : ''} = ${mx}。`, `h = −5 × ${tt0}² + ${v} × ${tt0}${h0 ? ` + ${h0}` : ''} = ${num(-5 * tt0 * tt0)} + ${v * tt0}${h0 ? ` + ${h0}` : ''} = ${mx}.`), T(`最高 ${mx} 公尺（在 ${tt0} 秒時）。`, `Greatest height ${mx} m (at t = ${tt0} s).`)],
      };
    },
  },
  {
    id: 'g9-exponential', grade: 9,
    name: T('指數成長與衰退', 'Exponential growth and decay'),
    cur: { us: 'Algebra 1 · Exponential models (F-LE.A.1–2)', aops: 'Intro Algebra' },
    gen(r) {
      const k = r.int(0, 4);
      if (k === 0) {
        const P0 = r.pick([50, 100, 200, 300, 500, 1000]), t = r.pick([2, 3, 4, 5, 6, 20, 30]), n = r.int(2, 7), unit = t >= 20 ? ['分鐘', 'minutes'] : ['小時', 'hours'];
        return {
          q: T(`培養皿裡有 ${P0} 個細菌，每 ${t} ${unit[0]}數量變成 2 倍。${n * t} ${unit[0]}後有幾個細菌？`, `A dish has ${P0} bacteria, and the number doubles every ${t} ${unit[1]}. How many bacteria are there after ${n * t} ${unit[1]}?`),
          ans: ansNum(P0 * 2 ** n),
          sol: [T(`${n * t} ÷ ${t} = ${n}，共翻倍 ${n} 次。`, `${n * t} ÷ ${t} = ${n}, so it doubles ${n} times.`), T(`數量 = ${P0} × 2<sup>${n}</sup> = ${P0} × ${2 ** n}。`, `Number = ${P0} × 2<sup>${n}</sup> = ${P0} × ${2 ** n}.`), T(`= ${num(P0 * 2 ** n)} 個。（模型：N = ${P0} × 2<sup>t/${t}</sup>）`, `= ${num(P0 * 2 ** n)}. (Model: N = ${P0} × 2<sup>t/${t}</sup>.)`)],
        };
      }
      if (k === 1) {
        const n = r.int(2, 5), m = 2 ** n * r.pick([5, 10, 15, 25, 3, 7]), t = r.pick([5, 8, 10, 12, 30]);
        return {
          q: T(`某放射性物質的半衰期是 ${t} 年（每 ${t} 年剩下一半）。現在有 ${m} 公克，${n * t} 年後剩下幾公克？`, `A radioactive substance has a half-life of ${t} years (half is left every ${t} years). There are ${m} g now. How many grams are left after ${n * t} years?`),
          ans: ansNum(m / 2 ** n),
          sol: [T(`${n * t} ÷ ${t} = ${n} 個半衰期。`, `${n * t} ÷ ${t} = ${n} half-lives.`), T(`剩下 ${m} × (${frac(1, 2)})<sup>${n}</sup> = ${m} ÷ ${2 ** n}。`, `Left: ${m} × (${frac(1, 2)})<sup>${n}</sup> = ${m} ÷ ${2 ** n}.`), T(`= ${num(m / 2 ** n)} 公克。`, `= ${num(m / 2 ** n)} g.`)],
        };
      }
      if (k === 2) {
        const P0 = r.pick([1000, 2000, 5000, 10000, 20000]), p = r.pick([2, 3, 4, 5, 6, 8, 10, 20]), n = r.int(2, 3), up = r.chance(0.7);
        const f = up ? 1 + p / 100 : 1 - p / 100, v = P0 * f ** n, ans = Math.round(v);
        return {
          q: up ? T(`${num(P0)} 元存入年利率 ${p}% 的帳戶，每年複利一次。${n} 年後本利和是多少元？（四捨五入到整數）`, `$${num(P0)} is put in an account earning ${p}% interest compounded yearly. How much is in it after ${n} years? (Round to the nearest dollar.)`)
            : T(`一台機器價值 ${num(P0)} 元，每年貶值 ${p}%（每年剩下前一年的 ${100 - p}%）。${n} 年後價值多少元？（四捨五入到整數）`, `A machine worth $${num(P0)} loses ${p}% of its value each year. What is it worth after ${n} years? (Round to the nearest dollar.)`),
          ans: ansNum(ans),
          sol: [T(`每年乘上 ${up ? `1 + ${num(p / 100)}` : `1 − ${num(p / 100)}`} = ${num(f)}。`, `Each year multiply by ${up ? `1 + ${num(p / 100)}` : `1 − ${num(p / 100)}`} = ${num(f)}.`), T(`${n} 年：${num(P0)} × ${num(f)}<sup>${n}</sup>。`, `After ${n} years: ${num(P0)} × ${num(f)}<sup>${n}</sup>.`), T(`${num(f)}<sup>${n}</sup> = ${num(clean(f ** n, 6))}，${num(P0)} × ${num(clean(f ** n, 6))} = ${num(clean(v, 4))}。`, `${num(f)}<sup>${n}</sup> = ${num(clean(f ** n, 6))}, and ${num(P0)} × ${num(clean(f ** n, 6))} = ${num(clean(v, 4))}.`), T(`四捨五入：${num(ans)} 元。（注意：這不是單利，每年是乘法而不是加固定的錢。）`, `Rounded: $${num(ans)}. (This is not simple interest: each year multiplies instead of adding a fixed amount.)`)],
        };
      }
      if (k === 3) {
        const b = r.pick([1.02, 1.03, 1.05, 1.08, 1.2, 1.5, 0.98, 0.95, 0.9, 0.8, 0.75, 0.6]), a = r.pick([50, 100, 250, 400, 1200]), pct = Math.round(Math.abs(b - 1) * 100), g = b > 1;
        const G = (p) => T(`成長，每期增加 ${p}%`, `Growth: increases ${p}% each period`), Dk = (p) => T(`衰退，每期減少 ${p}%`, `Decay: decreases ${p}% each period`);
        return {
          q: T(`函數 y = ${a} × (${num(b)})<sup>x</sup> 表示的是什麼？`, `What does y = ${a} × (${num(b)})<sup>x</sup> describe?`),
          ans: choice(g ? G(pct) : Dk(pct), g ? Dk(pct) : G(pct), g ? G(Math.round(b * 100)) : Dk(Math.round(b * 100)), g ? Dk(Math.round(b * 100)) : G(Math.round(b * 100))),
          sol: [T('y = a × bˣ：b > 1 是成長，0 < b < 1 是衰退。', 'y = a × bˣ: b > 1 means growth, 0 < b < 1 means decay.'), T(`b = ${num(b)} ${g ? '> 1' : '< 1'}，是${g ? '成長' : '衰退'}。`, `b = ${num(b)} is ${g ? 'greater' : 'less'} than 1, so it's ${g ? 'growth' : 'decay'}.`), T(`變化率 = |b − 1| = |${num(b)} − 1| = ${num(clean(Math.abs(b - 1)))} = ${pct}%。`, `Rate = |b − 1| = |${num(b)} − 1| = ${num(clean(Math.abs(b - 1)))} = ${pct}%.`), T(`起始值是 ${a}（x = 0 時）。`, `The starting value is ${a} (at x = 0).`)],
        };
      }
      const a = r.pick([2, 3, 4, 5, 6, 10]), b = r.pick([2, 3, 4]), ys = [0, 1, 2, 3].map((x) => a * b ** x);
      const ex = (s) => `y = ${s}`;
      return {
        q: T('下表的 x 和 y 符合哪一個式子？', 'Which equation fits the table?'),
        fig: tbl([['x', 0, 1, 2, 3], ['y', ...ys]]),
        ans: choice(ex(`${a} × ${b}<sup>x</sup>`), ex(`${b} × ${a}<sup>x</sup>`), ex(`${a * b - a}x + ${a}`), ex(`${a} × x<sup>${b}</sup>`)),
        sol: [T('先看 y 每次是「加」固定的數還是「乘」固定的數。', 'Check whether y goes up by adding the same amount or by multiplying by the same amount.'), T(`${ys[1]} ÷ ${ys[0]} = ${b}，${ys[2]} ÷ ${ys[1]} = ${b}，${ys[3]} ÷ ${ys[2]} = ${b}：每次乘 ${b}，是指數函數。`, `${ys[1]} ÷ ${ys[0]} = ${b}, ${ys[2]} ÷ ${ys[1]} = ${b}, ${ys[3]} ÷ ${ys[2]} = ${b}: multiplied by ${b} each time, so it's exponential.`), T(`x = 0 時 y = ${a}（起始值），所以 y = ${a} × ${b}<sup>x</sup>。`, `At x = 0, y = ${a} (the starting value), so y = ${a} × ${b}<sup>x</sup>.`), T(`檢查：線型的 y = ${a * b - a}x + ${a} 在 x = 2 時是 ${2 * (a * b - a) + a}，不是 ${ys[2]}。`, `Check: the linear y = ${a * b - a}x + ${a} gives ${2 * (a * b - a) + a} at x = 2, not ${ys[2]}.`)],
      };
    },
  },
  {
    id: 'g9-functions', grade: 9,
    name: T('函數的求值、合成與定義域', 'Function notation, composition and domain'),
    cur: { us: 'Algebra 1 · Functions (F-IF.A.1–2)', aops: 'Intro Algebra' },
    gen(r) {
      const k = r.int(0, 3);
      if (k === 0) {
        const a = r.nz(-4, 4), b = r.nz(-9, 9), c = r.int(-9, 9), x = r.nz(-5, 5), v = a * x * x + b * x + c;
        return {
          q: T(`f(x) = ${poly([a, b, c])}，求 f(${num(x)})。`, `If f(x) = ${poly([a, b, c])}, find f(${num(x)}).`), ans: ansNum(v),
          sol: [T(`把每個 x 換成 ${par(x)}（負數一定要加括號）。`, `Replace every x with ${par(x)} (always use parentheses for negatives).`), T(`${par(x)}² = ${x * x}，所以 ${num(a)} × ${x * x} = ${num(a * x * x)}；${num(b)} × ${par(x)} = ${num(b * x)}。`, `${par(x)}² = ${x * x}, so ${num(a)} × ${x * x} = ${num(a * x * x)}; ${num(b)} × ${par(x)} = ${num(b * x)}.`), T(`f(${num(x)}) = ${num(a * x * x)} ${sgn(b * x)}${c ? ` ${sgn(c)}` : ''} = ${num(v)}。`, `f(${num(x)}) = ${num(a * x * x)} ${sgn(b * x)}${c ? ` ${sgn(c)}` : ''} = ${num(v)}.`)],
        };
      }
      if (k === 1) {
        const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-5, 5), x = r.nz(-4, 4), g = x * x + c, v = a * g + b, rev = r.chance(0.5);
        const v2 = (a * x + b) ** 2 + c;
        return rev ? {
          q: T(`f(x) = ${lin(a, b)}，g(x) = x² ${sgn(c)}，求 g(f(${num(x)}))。`, `f(x) = ${lin(a, b)} and g(x) = x² ${sgn(c)}. Find g(f(${num(x)})).`), ans: ansNum(v2),
          sol: [T('由內往外算：先算 f(…)，再把結果放進 g。', 'Work from the inside out: first f, then put the result into g.'), T(`f(${num(x)}) = ${num(a)} × ${par(x)} ${sgn(b)} = ${num(a * x + b)}。`, `f(${num(x)}) = ${num(a)} × ${par(x)} ${sgn(b)} = ${num(a * x + b)}.`), T(`g(${num(a * x + b)}) = ${par(a * x + b)}² ${sgn(c)} = ${num(v2)}。`, `g(${num(a * x + b)}) = ${par(a * x + b)}² ${sgn(c)} = ${num(v2)}.`), T(`注意 g(f(x)) 和 f(g(x)) 通常不一樣：f(g(${num(x)})) = ${num(v)}。`, `Note g(f(x)) and f(g(x)) are usually different: f(g(${num(x)})) = ${num(v)}.`)],
        } : {
          q: T(`f(x) = ${lin(a, b)}，g(x) = x² ${sgn(c)}，求 f(g(${num(x)}))。`, `f(x) = ${lin(a, b)} and g(x) = x² ${sgn(c)}. Find f(g(${num(x)})).`), ans: ansNum(v),
          sol: [T('由內往外算：先算 g(…)，再把結果放進 f。', 'Work from the inside out: first g, then put the result into f.'), T(`g(${num(x)}) = ${par(x)}² ${sgn(c)} = ${num(g)}。`, `g(${num(x)}) = ${par(x)}² ${sgn(c)} = ${num(g)}.`), T(`f(${num(g)}) = ${num(a)} × ${par(g)} ${sgn(b)} = ${num(v)}。`, `f(${num(g)}) = ${num(a)} × ${par(g)} ${sgn(b)} = ${num(v)}.`), T(`注意 f(g(x)) 和 g(f(x)) 通常不一樣：g(f(${num(x)})) = ${num(v2)}。`, `Note f(g(x)) and g(f(x)) are usually different: g(f(${num(x)})) = ${num(v2)}.`)],
        };
      }
      if (k === 2) {
        const a = r.nz(-8, 8), t = r.int(0, 3), xa = `x ${sgn(-a)}`, ax = `${num(a)} − x`;
        const fs = [`${fx(1, xa)}`, sqrt(xa), sqrt(ax), fx(1, sqrt(xa))];
        const ds = [`x ≠ ${num(a)}`, `x ≥ ${num(a)}`, `x ≤ ${num(a)}`, `x ${GT} ${num(a)}`];
        const why = [
          T(`分母不能是 0：${xa} ≠ 0，所以 x ≠ ${num(a)}。`, `The denominator can't be 0: ${xa} ≠ 0, so x ≠ ${num(a)}.`),
          T(`根號裡面不能是負數：${xa} ≥ 0，所以 x ≥ ${num(a)}。`, `The number under a square root can't be negative: ${xa} ≥ 0, so x ≥ ${num(a)}.`),
          T(`根號裡面不能是負數：${ax} ≥ 0，所以 x ≤ ${num(a)}。`, `The number under a square root can't be negative: ${ax} ≥ 0, so x ≤ ${num(a)}.`),
          T(`根號裡不能是負數，而且在分母不能是 0：${xa} ${GT} 0，所以 x ${GT} ${num(a)}。`, `Under the root it can't be negative, and in the denominator it can't be 0: ${xa} ${GT} 0, so x ${GT} ${num(a)}.`),
        ];
        return {
          q: T(`f(x) = ${fs[t]} 的定義域（x 可以代入的值）是什麼？`, `What is the domain (the allowed x-values) of f(x) = ${fs[t]}?`),
          ans: choice(ds[t], ...ds.filter((_, i) => i !== t).slice(0, 2), T('所有實數', 'All real numbers')),
          sol: [T('找出會讓式子「沒有意義」的 x：分母為 0、根號裡為負。', 'Look for x-values that break the formula: a zero denominator or a negative under a square root.'), why[t], T(`定義域：${ds[t]}。`, `Domain: ${ds[t]}.`)],
        };
      }
      const a = r.nz(-6, 6); let c; do c = r.nz(-6, 6); while (c === a); const x = r.int(-8, 8), b = r.int(-12, 12), d = (a - c) * x + b;
      return {
        q: T(`f(x) = ${lin(a, b)}，g(x) = ${lin(c, d)}。x 是多少時 f(x) = g(x)？`, `f(x) = ${lin(a, b)} and g(x) = ${lin(c, d)}. For what x is f(x) = g(x)?`), ans: ansNum(x, `x = ${x}`),
        sol: [T(`列式：${lin(a, b)} = ${lin(c, d)}。`, `Set them equal: ${lin(a, b)} = ${lin(c, d)}.`), T(`移項：${mono(a - c)} = ${num(d - b)}。`, `Rearrange: ${mono(a - c)} = ${num(d - b)}.`), T(`x = ${num(x)}。驗算：f(${num(x)}) = ${num(a * x + b)}，g(${num(x)}) = ${num(c * x + d)} ✓`, `x = ${num(x)}. Check: f(${num(x)}) = ${num(a * x + b)} and g(${num(x)}) = ${num(c * x + d)} ✓`), T('（在圖上，這是兩條直線的交點的 x 坐標。）', '(On a graph, this is the x-coordinate where the two lines cross.)')],
      };
    },
  },
  {
    id: 'g9-line-forms', grade: 9,
    name: T('直線方程式：點斜式、平行與垂直', 'Equations of lines: point-slope, parallel and perpendicular'),
    cur: { us: 'Algebra 1 · Linear functions (F-LE.A.2, G-GPE.B.5)', tw: '高一 直線方程式', aops: 'Intro Algebra' },
    at: { tw: 10 },
    gen(r) {
      const k = r.int(0, 4);
      if (k === 0) {
        const m = r.nz(-5, 5), p = r.nz(-6, 6), q = r.int(-8, 8), b = q - m * p;
        return {
          q: T(`斜率 ${num(m)}、通過點 (${num(p)}, ${num(q)}) 的直線，寫成斜截式是哪一個？`, `Which is the slope-intercept form of the line with slope ${num(m)} through (${num(p)}, ${num(q)})?`),
          ans: choice(yEq([m, 1], b), yEq([m, 1], q + m * p), yEq([m, 1], q), yEq([m, 1], p - m * q), yEq([-m, 1], b)),
          sol: [T('點斜式：y − y₁ = m(x − x₁)。', 'Point-slope form: y − y₁ = m(x − x₁).'), T(`y ${sgn(-q)} = ${num(m)}(x ${sgn(-p)})。`.replace('y + 0', 'y').replace('y − 0', 'y'), `y ${sgn(-q)} = ${num(m)}(x ${sgn(-p)}).`.replace('y + 0', 'y').replace('y − 0', 'y')), T(`展開：y ${sgn(-q)} = ${lin(m, -m * p)}，所以 ${yEq([m, 1], b)}。`.replace('y + 0', 'y').replace('y − 0', 'y'), `Expand: y ${sgn(-q)} = ${lin(m, -m * p)}, so ${yEq([m, 1], b)}.`.replace('y + 0', 'y').replace('y − 0', 'y')), T(`驗算：x = ${num(p)} 代入得 y = ${num(m * p + b)} ✓`, `Check: x = ${num(p)} gives y = ${num(m * p + b)} ✓`)],
        };
      }
      if (k === 1) {
        const m = r.nz(-5, 5), b0 = r.int(-9, 9), p = r.nz(-6, 6), q = r.int(-9, 9), b = q - m * p;
        if (b === b0) return this.gen(r);
        return {
          q: T(`一條直線與 ${yEq([m, 1], b0)} 平行，並通過 (${num(p)}, ${num(q)})。它的 y 截距是多少？`, `A line is parallel to ${yEq([m, 1], b0)} and passes through (${num(p)}, ${num(q)}). What is its y-intercept?`), ans: ansNum(b),
          sol: [T(`平行線的斜率相同：m = ${num(m)}。`, `Parallel lines have equal slopes: m = ${num(m)}.`), T(`y = ${mono(m)} + b 通過 (${num(p)}, ${num(q)})：${num(q)} = ${num(m * p)} + b。`, `y = ${mono(m)} + b passes through (${num(p)}, ${num(q)}): ${num(q)} = ${num(m * p)} + b.`), T(`b = ${num(b)}，直線是 ${yEq([m, 1], b)}。`, `b = ${num(b)}; the line is ${yEq([m, 1], b)}.`)],
        };
      }
      if (k === 2) {
        const n = r.nz(-6, 6), d = r.int(1, 5), b = r.int(-9, 9), [nn, dd] = red(n, d);
        return {
          q: T(`與 ${yEq([n, d], b)} 垂直的直線，斜率是多少？（用最簡分數或整數）`, `What is the slope of a line perpendicular to ${yEq([n, d], b)}? (Lowest terms or an integer.)`), ans: ansNum([-dd, nn]),
          sol: [T('兩條直線垂直 ⇔ 斜率相乘 = −1，也就是斜率互為「負倒數」。', 'Two lines are perpendicular ⇔ their slopes multiply to −1: they are negative reciprocals.'), T(`原來的斜率 ${fracR(nn, dd)}，倒數是 ${fracR(dd, nn)}，再變號：${fracR(-dd, nn)}。`, `The slope is ${fracR(nn, dd)}; its reciprocal is ${fracR(dd, nn)}; change the sign: ${fracR(-dd, nn)}.`), T(`檢查：${fracR(nn, dd)} × ${pfr(-dd, nn)} = −1 ✓`, `Check: ${fracR(nn, dd)} × ${pfr(-dd, nn)} = −1 ✓`)],
        };
      }
      if (k === 3) {
        const a = r.nz(-6, 6), b = r.nz(-6, 6), c = r.int(-20, 20);
        if (Math.abs(b) === 1 && r.chance(0.5)) return this.gen(r);
        return {
          q: T(`直線 ${eq2(a, b, c)} 的斜率是多少？（用最簡分數或整數）`, `What is the slope of the line ${eq2(a, b, c)}? (Lowest terms or an integer.)`), ans: ansNum([-a, b]),
          sol: [T('把方程式改寫成 y = mx + b 的形式。', 'Rewrite it as y = mx + b.'), T(`${term(b, 'y', 1, true)} = ${lin(-a, c)}。`, `${term(b, 'y', 1, true)} = ${lin(-a, c)}.`), T(`兩邊除以 ${par(b)}：斜率 m = ${eqR(-a, b)}。`, `Divide by ${par(b)}: the slope is m = ${eqR(-a, b)}.`), T(`（捷徑：ax + by = c 的斜率是 −a/b。）`, `(Shortcut: ax + by = c has slope −a/b.)`)],
        };
      }
      const m = r.nz(-5, 5), b = r.nz(-12, 12), [n, d] = red(-b, m);
      return {
        q: T(`直線 ${yEq([m, 1], b)} 和 x 軸的交點（x 截距）的 x 坐標是多少？（用最簡分數或整數）`, `Where does the line ${yEq([m, 1], b)} cross the x-axis? Give the x-coordinate (lowest terms or an integer).`), ans: ansNum([n, d]),
        sol: [T('在 x 軸上的點，y = 0。', 'On the x-axis, y = 0.'), T(`0 = ${lin(m, b)} → ${mono(m)} = ${num(-b)}。`, `0 = ${lin(m, b)} → ${mono(m)} = ${num(-b)}.`), T(`x = ${eqR(-b, m)}。`, `x = ${eqR(-b, m)}.`)],
      };
    },
  },
  {
    id: 'g9-similar', grade: 9,
    name: T('相似三角形', 'Similar triangles'),
    cur: { us: 'Geometry · Similarity (G-SRT.B.5)', tw: '九年級 相似形', aops: 'Intro Geometry' },
    at: { us: 10 },
    gen(r) {
      const k = r.int(0, 4);
      if (k === 0) {
        let p, q; do { p = r.int(2, 5); q = r.int(2, 7); } while (p === q || gcd(p, q) > 1);
        const AB = p * r.int(1, 4), BC = p * r.int(1, 5), DE = (AB * q) / p, EF = (BC * q) / p;
        const s1 = 0.9, s2 = 1.6;
        const T1 = [[20, 140], [20 + 70 * s1, 140], [20 + 25 * s1, 140 - 60 * s1]], T2 = [[130, 140], [130 + 70 * s2 * 0.75, 140], [130 + 25 * s2 * 0.75, 140 - 60 * s2 * 0.75]];
        const fig = SV(260, 160, triFig(T1, ['A', 'B', 'C'], [AB, BC, '']) + triFig(T2, ['D', 'E', 'F'], [DE, '?', '']));
        return {
          q: T(`△ABC ∼ △DEF，AB = ${AB}，BC = ${BC}，DE = ${DE}。求 EF。`, `△ABC ∼ △DEF with AB = ${AB}, BC = ${BC} and DE = ${DE}. Find EF.`), fig, ans: ansNum(EF),
          sol: [T('相似三角形的對應邊成比例。', 'Corresponding sides of similar triangles are in proportion.'), T(`AB 對應 DE，BC 對應 EF：${fx('DE', 'AB')} = ${fx('EF', 'BC')}。`, `AB matches DE and BC matches EF: ${fx('DE', 'AB')} = ${fx('EF', 'BC')}.`), T(`相似比 DE : AB = ${DE} : ${AB}${DE !== q ? ` = ${q} : ${p}` : ''}。`, `Scale factor DE : AB = ${DE} : ${AB}${DE !== q ? ` = ${q} : ${p}` : ''}.`), T(`EF = ${BC} × ${frac(q, p)} = ${num(EF)}。`, `EF = ${BC} × ${frac(q, p)} = ${num(EF)}.`)],
        };
      }
      if (k === 1) {
        const a = r.int(2, 8), b = r.int(1, 8), m = r.int(1, 4), c = (a / gcd(a, a + b)) * m, BC = (c * (a + b)) / a;
        const A = [110, 15], B = [20, 150], Cc = [220, 150], t = a / (a + b), D = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t], E = [A[0] + (Cc[0] - A[0]) * t, A[1] + (Cc[1] - A[1]) * t];
        const extra = ln(D[0], D[1], E[0], E[1], 'f-acc', 2) + tt(D[0] - 10, D[1], 'D') + tt(E[0] + 10, E[1], 'E') + tt((D[0] + E[0]) / 2, D[1] - 9, c, true, 12) + tt((A[0] + D[0]) / 2 - 14, (A[1] + D[1]) / 2, a, true, 12) + tt((D[0] + B[0]) / 2 - 14, (D[1] + B[1]) / 2, b, true, 12);
        return {
          q: T(`如圖，△ABC 中 DE ∥ BC，AD = ${a}，DB = ${b}，DE = ${c}。求 BC。`, `In △ABC, DE ∥ BC, AD = ${a}, DB = ${b} and DE = ${c}. Find BC.`),
          fig: SV(240, 170, triFig([A, B, Cc], ['A', 'B', 'C'], ['', '?', ''], extra)), ans: ansNum(BC),
          sol: [T('DE ∥ BC，所以 △ADE ∼ △ABC（AA 相似：同位角相等）。', 'DE ∥ BC, so △ADE ∼ △ABC (AA: corresponding angles are equal).'), T(`AB = AD + DB = ${a} + ${b} = ${a + b}，相似比 AD : AB = ${a} : ${a + b}。`, `AB = AD + DB = ${a} + ${b} = ${a + b}; the ratio AD : AB = ${a} : ${a + b}.`), T(`DE : BC = ${a} : ${a + b} → BC = ${c} × ${frac(a + b, a)} = ${num(BC)}。`, `DE : BC = ${a} : ${a + b} → BC = ${c} × ${frac(a + b, a)} = ${num(BC)}.`), T(`常見錯誤：用 AD : DB = ${a} : ${b} 去算，會得到 ${num(clean((c * b) / a, 3))}。要用整個 AB！`, `Common mistake: using AD : DB = ${a} : ${b} gives ${num(clean((c * b) / a, 3))}. Use the whole side AB!`)],
        };
      }
      if (k === 2) {
        let p, q; do { p = r.int(1, 5); q = r.int(2, 7); } while (p >= q || gcd(p, q) > 1);
        const S = p * p * r.int(1, 8), L = (S * q * q) / (p * p);
        return {
          q: T(`兩個相似三角形的對應邊長比是 ${p} : ${q}，小三角形的面積是 ${S}，大三角形的面積是多少？`, `Two similar triangles have corresponding sides in the ratio ${p} : ${q}. The smaller has area ${S}. What is the area of the larger?`), ans: ansNum(L),
          sol: [T('面積比 = 邊長比的平方（長和高都放大同樣倍數）。', 'Area ratio = (side ratio)² — both base and height scale by the same factor.'), T(`面積比 = ${p}² : ${q}² = ${p * p} : ${q * q}。`, `Area ratio = ${p}² : ${q}² = ${p * p} : ${q * q}.`), T(`大面積 = ${S} × ${frac(q * q, p * p)} = ${num(L)}。`, `Larger area = ${S} × ${frac(q * q, p * p)} = ${num(L)}.`), T(`常見錯誤：直接乘 ${frac(q, p)} 會得到 ${num(clean((S * q) / p, 3))}。`, `Common mistake: multiplying by ${frac(q, p)} gives ${num(clean((S * q) / p, 3))}.`)],
        };
      }
      if (k === 3) {
        const nm = who(r), h = r.pick([1.5, 1.6, 1.8, 1.2]), s = r.pick([1, 2, 3, 4]), m = r.int(3, 9), S = s * m, H = clean(h * m);
        return {
          q: T(`同一時間，身高 ${num(h)} 公尺的${nm[0]}影子長 ${s} 公尺，一棵樹的影子長 ${S} 公尺。樹有多高（公尺）？`, `At the same moment, ${nm[1]} (${num(h)} m tall) casts a ${s} m shadow and a tree casts a ${S} m shadow. How tall is the tree, in meters?`), ans: ansNum(H),
          sol: [T('同一時間太陽光線角度相同，人和影子、樹和影子形成相似的直角三角形。', 'At the same time the sun\'s rays hit at the same angle, so person + shadow and tree + shadow form similar right triangles.'), T(`${fx('樹高', '樹影')} = ${fx('身高', '人影')}：${fx('H', S)} = ${fx(num(h), s)}。`, `${fx('tree', 'tree shadow')} = ${fx('person', 'person shadow')}: ${fx('H', S)} = ${fx(num(h), s)}.`), T(`H = ${num(h)} × ${S} ÷ ${s} = ${num(H)} 公尺。`, `H = ${num(h)} × ${S} ÷ ${s} = ${num(H)} m.`)],
        };
      }
      let p, q; do { p = r.int(1, 5); q = r.int(2, 7); } while (p >= q || gcd(p, q) > 1);
      const side = p * r.int(1, 6), big = (side * q) / p;
      return {
        q: T(`兩個相似多邊形的面積比是 ${p * p} : ${q * q}。小多邊形的一邊長 ${side}，大多邊形對應的邊長是多少？`, `Two similar polygons have areas in the ratio ${p * p} : ${q * q}. A side of the smaller one is ${side}. How long is the matching side of the larger one?`), ans: ansNum(big),
        sol: [T('面積比 = 邊長比²，所以邊長比 = 面積比開根號。', 'Area ratio = (side ratio)², so side ratio = √(area ratio).'), T(`邊長比 = √${p * p} : √${q * q} = ${p} : ${q}。`, `Side ratio = √${p * p} : √${q * q} = ${p} : ${q}.`), T(`大邊 = ${side} × ${frac(q, p)} = ${num(big)}。`, `Larger side = ${side} × ${frac(q, p)} = ${num(big)}.`)],
      };
    },
  },
  {
    id: 'g9-circle-angles', grade: 9,
    name: T('圓心角與圓周角', 'Central and inscribed angles'),
    cur: { us: 'Geometry · Circles (G-C.A.2)', tw: '九年級 圓（圓心角、圓周角）', aops: 'Intro Geometry' },
    at: { us: 10 },
    gen(r) {
      const k = r.int(0, 4);
      if (k === 0 || k === 1) {
        const c = 2 * r.int(20, 80), i = c / 2, cA = r.int(60, 120);
        const fig = circFig([270 - c / 2, 270 + c / 2, cA], ['A', 'B', 'C'], [[2, 0], [2, 1], ['O', 0], ['O', 1]]);
        return k === 0 ? {
          q: T(`如圖，O 是圓心，∠AOB = ${c}°（對著弧 AB），C 在圓上。求圓周角 ∠ACB。`, `O is the center and ∠AOB = ${c}° (it intercepts arc AB). C is on the circle. Find the inscribed angle ∠ACB.`), fig, ans: ansNum(i),
          sol: [T('同一條弧所對的圓周角 = 圓心角的一半。', 'An inscribed angle is half the central angle on the same arc.'), T(`∠ACB = ${c}° ÷ 2 = ${i}°。`, `∠ACB = ${c}° ÷ 2 = ${i}°.`)],
        } : {
          q: T(`如圖，O 是圓心，圓周角 ∠ACB = ${i}°。求圓心角 ∠AOB（對著同一條弧 AB）。`, `O is the center and the inscribed angle ∠ACB = ${i}°. Find the central angle ∠AOB on the same arc AB.`), fig, ans: ansNum(c),
          sol: [T('圓心角 = 同弧所對圓周角的 2 倍。', 'A central angle is twice the inscribed angle on the same arc.'), T(`∠AOB = 2 × ${i}° = ${c}°。`, `∠AOB = 2 × ${i}° = ${c}°.`), T(`這也是弧 AB 的度數：${c}°。`, `That is also the measure of arc AB: ${c}°.`)],
        };
      }
      if (k === 2) {
        const a = r.int(15, 75), cA = 180 - 2 * a;
        return {
          q: T(`如圖，AB 是圓 O 的直徑，C 在圓上，∠CAB = ${a}°。求 ∠CBA。`, `AB is a diameter of circle O and C is on the circle. ∠CAB = ${a}°. Find ∠CBA.`),
          fig: circFig([180, 0, cA], ['A', 'B', 'C'], [[0, 1], [0, 2], [1, 2]]), ans: ansNum(90 - a),
          sol: [T('直徑所對的圓周角是 90°（半圓的圓心角是 180°，一半是 90°）。', 'An angle inscribed in a semicircle is 90° (the central angle is 180°, half of it is 90°).'), T('所以 ∠ACB = 90°。', 'So ∠ACB = 90°.'), T(`三角形內角和：∠CBA = 180° − 90° − ${a}° = ${90 - a}°。`, `Angle sum in △ABC: ∠CBA = 180° − 90° − ${a}° = ${90 - a}°.`)],
        };
      }
      if (k === 3) {
        const A = r.int(55, 125);
        return {
          q: T(`四邊形 ABCD 的四個頂點都在同一個圓上（圓內接四邊形），∠A = ${A}°。求 ∠C。`, `Quadrilateral ABCD has all four vertices on a circle (a cyclic quadrilateral). ∠A = ${A}°. Find ∠C.`),
          fig: circFig([200, 290, 20, 110], ['A', 'B', 'C', 'D'], [[0, 1], [1, 2], [2, 3], [3, 0]], false), ans: ansNum(180 - A),
          sol: [T('圓內接四邊形的對角互補（和為 180°）。', 'Opposite angles of a cyclic quadrilateral are supplementary (add to 180°).'), T('原因：∠A 和 ∠C 所對的兩條弧合起來是整個圓（360°），兩個圓周角是它們的一半，和是 180°。', 'Why: ∠A and ∠C intercept arcs that together make the whole circle (360°); each angle is half its arc, so they add to 180°.'), T(`∠C = 180° − ${A}° = ${180 - A}°。`, `∠C = 180° − ${A}° = ${180 - A}°.`)],
        };
      }
      let x, p, b, q, d; do { x = r.int(5, 30); p = r.int(1, 5); q = r.int(1, 5); b = r.int(-20, 40); d = p * x + b - q * x; } while (p === q || p * x + b < 15 || p * x + b > 85 || b === 0 || d === 0);
      return {
        q: T(`如圖，C、D 在圓上，∠ACB = (${poly([p, b])})°，∠ADB = (${poly([q, d])})°，兩個角對著同一條弧 AB。求 x。`, `C and D are on the circle. ∠ACB = (${poly([p, b])})° and ∠ADB = (${poly([q, d])})° both intercept arc AB. Find x.`),
        fig: circFig([235, 305, 70, 120], ['A', 'B', 'C', 'D'], [[2, 0], [2, 1], [3, 0], [3, 1]], false), ans: ansNum(x, `x = ${x}`),
        sol: [T('對同一條弧的圓周角相等（都是那條弧度數的一半）。', 'Inscribed angles on the same arc are equal (each is half the arc).'), T(`${poly([p, b])} = ${poly([q, d])} → ${mono(p - q)} = ${num(d - b)}。`, `${poly([p, b])} = ${poly([q, d])} → ${mono(p - q)} = ${num(d - b)}.`), T(`x = ${x}，兩個角都是 ${p * x + b}°。`, `x = ${x}; both angles are ${p * x + b}°.`)],
      };
    },
  },
  {
    id: 'g9-tangent', grade: 9,
    name: T('圓的切線', 'Tangent lines to a circle'),
    cur: { us: 'Geometry · Circles (G-C.A.2)', tw: '九年級 圓（切線性質）', aops: 'Intro Geometry' },
    at: { us: 10 },
    gen(r) {
      const k = r.int(0, 4), [a, b, c] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [7, 24, 25], [9, 12, 15], [12, 16, 20], [20, 21, 29]]);
      const perp = T('切線和過切點的半徑互相垂直，所以 △OAP 是直角三角形（∠OAP = 90°）。', 'A tangent is perpendicular to the radius at the point of tangency, so △OAP is a right triangle (∠OAP = 90°).');
      if (k === 0) return {
        q: T(`從圓外一點 P 畫切線 PA 切圓 O 於 A。半徑 ${a}，OP = ${c}，求切線段 PA 的長。`, `From P outside circle O, tangent PA touches the circle at A. The radius is ${a} and OP = ${c}. Find PA.`),
        fig: tangentFig({ r: a, OP: c, PA: '?' }), ans: ansNum(b),
        sol: [perp, T(`PA² = OP² − OA² = ${c}² − ${a}² = ${c * c} − ${a * a} = ${b * b}。`, `PA² = OP² − OA² = ${c}² − ${a}² = ${c * c} − ${a * a} = ${b * b}.`), T(`PA = ${b}。`, `PA = ${b}.`)],
      };
      if (k === 1) return {
        q: T(`圓 O 的半徑是 ${a}，從 P 點畫的切線段 PA = ${b}。P 到圓心 O 的距離是多少？`, `Circle O has radius ${a}. The tangent segment from P is PA = ${b}. How far is P from the center O?`),
        fig: tangentFig({ r: a, PA: b, OP: '?' }), ans: ansNum(c),
        sol: [perp, T(`OP² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}。`, `OP² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}.`), T(`OP = ${c}。`, `OP = ${c}.`)],
      };
      if (k === 2) {
        let x, p, q, s, t; do { x = r.int(2, 12); p = r.int(1, 6); q = r.int(1, 6); s = r.int(-8, 10); t = p * x + s - q * x; } while (p === q || p * x + s <= 0 || s === 0 || t === 0);
        return {
          q: T(`從圓外一點 P 畫兩條切線，分別切圓於 A、B。PA = ${poly([p, s])}，PB = ${poly([q, t])}。求切線段 PA 的長。`, `From an outside point P, two tangents touch the circle at A and B. PA = ${poly([p, s])} and PB = ${poly([q, t])}. Find the length PA.`),
          fig: tangentFig({ PA: poly([p, s]), PB: poly([q, t]) }), ans: ansNum(p * x + s),
          sol: [T('從圓外一點到圓的兩條切線段等長：PA = PB。', 'Two tangent segments from the same outside point are equal: PA = PB.'), T(`${poly([p, s])} = ${poly([q, t])} → ${mono(p - q)} = ${num(t - s)} → x = ${x}。`, `${poly([p, s])} = ${poly([q, t])} → ${mono(p - q)} = ${num(t - s)} → x = ${x}.`), T(`PA = ${p} × ${x} ${sgn(s)} = ${p * x + s}。`, `PA = ${p} × ${x} ${sgn(s)} = ${p * x + s}.`)],
        };
      }
      if (k === 3) {
        const O = r.int(60, 160), rev = r.chance(0.5);
        return {
          q: rev ? T(`PA、PB 是圓 O 的兩條切線（A、B 是切點），∠APB = ${180 - O}°。求 ∠AOB。`, `PA and PB are tangents to circle O at A and B, and ∠APB = ${180 - O}°. Find ∠AOB.`) : T(`PA、PB 是圓 O 的兩條切線（A、B 是切點），∠AOB = ${O}°。求 ∠APB。`, `PA and PB are tangents to circle O at A and B, and ∠AOB = ${O}°. Find ∠APB.`),
          fig: tangentFig({}), ans: ansNum(rev ? O : 180 - O),
          sol: [T('四邊形 OAPB 中，∠OAP = ∠OBP = 90°（切線 ⊥ 半徑）。', 'In quadrilateral OAPB, ∠OAP = ∠OBP = 90° (tangent ⊥ radius).'), T('四邊形內角和 360°，所以 ∠AOB + ∠APB = 360° − 90° − 90° = 180°。', 'The angles of a quadrilateral add to 360°, so ∠AOB + ∠APB = 360° − 90° − 90° = 180°.'), rev ? T(`∠AOB = 180° − ${180 - O}° = ${O}°。`, `∠AOB = 180° − ${180 - O}° = ${O}°.`) : T(`∠APB = 180° − ${O}° = ${180 - O}°。`, `∠APB = 180° − ${O}° = ${180 - O}°.`)],
        };
      }
      return {
        q: T(`圓 O 的半徑是 ${a}，從 P 點畫的切線段長 ${b}。P 點到圓上最近的點距離是多少？`, `Circle O has radius ${a}, and the tangent segment from P has length ${b}. How far is P from the nearest point on the circle?`),
        fig: tangentFig({ r: a, PA: b }), ans: ansNum(c - a),
        sol: [perp, T(`OP = √(${a}² + ${b}²) = √${c * c} = ${c}。`, `OP = √(${a}² + ${b}²) = √${c * c} = ${c}.`), T('離 P 最近的圓上的點在線段 OP 上，距離 = OP − 半徑。', 'The nearest point of the circle lies on segment OP, so the distance is OP − radius.'), T(`${c} − ${a} = ${c - a}。`, `${c} − ${a} = ${c - a}.`)],
      };
    },
  },
  {
    id: 'g9-triangle-centers', grade: 9,
    name: T('三角形的外心、內心與重心', 'Triangle centers: circumcenter, incenter, centroid'),
    cur: { us: 'Geometry · Triangle centers (G-C.A.3, G-CO.C.10)', tw: '九年級 三角形的外心、內心與重心', aops: 'Intro Geometry' },
    at: { us: 10 },
    gen(r) {
      const k = r.int(0, 5);
      if (k === 0) {
        const m = r.int(2, 15), AD = 3 * m, askAG = r.chance(0.5);
        return {
          q: T(`△ABC 的重心是 G，中線 AD 長 ${AD}。求 ${askAG ? 'AG' : 'GD'}。`, `G is the centroid of △ABC and median AD has length ${AD}. Find ${askAG ? 'AG' : 'GD'}.`), ans: ansNum(askAG ? 2 * m : m),
          sol: [T('重心是三條中線的交點，它把每條中線分成 2 : 1（靠頂點的較長）。', 'The centroid is where the medians meet; it splits each median 2 : 1 (the longer part next to the vertex).'), T(`AG = ${AD} × ${frac(2, 3)} = ${2 * m}，GD = ${AD} × ${frac(1, 3)} = ${m}。`, `AG = ${AD} × ${frac(2, 3)} = ${2 * m} and GD = ${AD} × ${frac(1, 3)} = ${m}.`), T(`答案：${askAG ? `AG = ${2 * m}` : `GD = ${m}`}。`, `Answer: ${askAG ? `AG = ${2 * m}` : `GD = ${m}`}.`)],
        };
      }
      if (k === 1) {
        const [a, b, c] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [7, 24, 25], [9, 40, 41], [12, 16, 20]]);
        return {
          q: T(`直角三角形的兩股長是 ${a} 和 ${b}。它的外接圓半徑是多少？`, `A right triangle has legs ${a} and ${b}. What is the radius of its circumscribed circle?`), ans: ansNum(c / 2),
          sol: [T('直角三角形的外心在斜邊的中點（直角對著直徑）。', 'The circumcenter of a right triangle is the midpoint of the hypotenuse (the right angle sits on a diameter).'), T(`斜邊 = √(${a}² + ${b}²) = √${c * c} = ${c}。`, `Hypotenuse = √(${a}² + ${b}²) = √${c * c} = ${c}.`), T(`外接圓半徑 = 斜邊的一半 = ${num(c / 2)}。`, `Circumradius = half the hypotenuse = ${num(c / 2)}.`)],
        };
      }
      if (k === 2) {
        const A = 2 * r.int(15, 70);
        return {
          q: T(`I 是 △ABC 的內心，∠A = ${A}°。求 ∠BIC。`, `I is the incenter of △ABC and ∠A = ${A}°. Find ∠BIC.`), ans: ansNum(90 + A / 2),
          sol: [T('內心是三條角平分線的交點，所以 ∠IBC = ½∠B、∠ICB = ½∠C。', 'The incenter is where the angle bisectors meet, so ∠IBC = ½∠B and ∠ICB = ½∠C.'), T(`∠B + ∠C = 180° − ${A}° = ${180 - A}°，所以 ½∠B + ½∠C = ${(180 - A) / 2}°。`, `∠B + ∠C = 180° − ${A}° = ${180 - A}°, so ½∠B + ½∠C = ${(180 - A) / 2}°.`), T(`∠BIC = 180° − ${(180 - A) / 2}° = ${90 + A / 2}°。（公式：∠BIC = 90° + ½∠A）`, `∠BIC = 180° − ${(180 - A) / 2}° = ${90 + A / 2}°. (Formula: ∠BIC = 90° + ½∠A.)`)],
        };
      }
      if (k === 3) {
        const A = r.int(25, 85);
        return {
          q: T(`O 是銳角 △ABC 的外心，∠A = ${A}°。求 ∠BOC。`, `O is the circumcenter of acute △ABC and ∠A = ${A}°. Find ∠BOC.`), ans: ansNum(2 * A),
          sol: [T('外心是外接圓的圓心，A、B、C 都在這個圓上。', 'The circumcenter is the center of the circle through A, B and C.'), T('∠A 是對著弧 BC 的圓周角，∠BOC 是同一弧的圓心角。', '∠A is an inscribed angle on arc BC, and ∠BOC is the central angle on the same arc.'), T(`圓心角 = 2 × 圓周角：∠BOC = 2 × ${A}° = ${2 * A}°。`, `Central = 2 × inscribed: ∠BOC = 2 × ${A}° = ${2 * A}°.`)],
        };
      }
      if (k === 4) {
        const [a, b, c] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [7, 24, 25], [9, 40, 41], [12, 16, 20], [20, 21, 29], [9, 12, 15]]), rr = (a + b - c) / 2;
        return {
          q: T(`直角三角形的三邊長是 ${a}、${b}、${c}。它的內切圓半徑是多少？`, `A right triangle has sides ${a}, ${b} and ${c}. What is the radius of its inscribed circle?`), ans: ansNum(rr),
          sol: [T('方法：面積 = 內切圓半徑 × 周長 ÷ 2（把三角形從內心切成三塊）。', 'Method: area = inradius × perimeter ÷ 2 (cut the triangle into three pieces from the incenter).'), T(`面積 = ${a} × ${b} ÷ 2 = ${(a * b) / 2}；周長 = ${a + b + c}。`, `Area = ${a} × ${b} ÷ 2 = ${(a * b) / 2}; perimeter = ${a + b + c}.`), T(`r = 2 × ${(a * b) / 2} ÷ ${a + b + c} = ${num(rr)}。`, `r = 2 × ${(a * b) / 2} ÷ ${a + b + c} = ${num(rr)}.`), T(`（直角三角形的捷徑：r = (a + b − c) ÷ 2 = (${a} + ${b} − ${c}) ÷ 2 = ${num(rr)} ✓）`, `(Right-triangle shortcut: r = (a + b − c) ÷ 2 = (${a} + ${b} − ${c}) ÷ 2 = ${num(rr)} ✓)`)],
        };
      }
      const C = [[T('外心', 'Circumcenter'), T('到三個頂點等距離的點', 'the point equally far from all three vertices'), T('三邊垂直平分線的交點', 'where the perpendicular bisectors of the sides meet')],
        [T('內心', 'Incenter'), T('到三邊等距離的點', 'the point equally far from all three sides'), T('三個角的角平分線交點', 'where the angle bisectors meet')],
        [T('重心', 'Centroid'), T('三條中線的交點', 'where the three medians meet'), T('把每條中線分成 2 : 1 的點', 'the point that splits each median 2 : 1')],
        [T('垂心', 'Orthocenter'), T('三條高的交點', 'where the three altitudes meet'), T('三條高的交點', 'where the three altitudes meet')]];
      const i = r.int(0, 3), j = r.int(1, 2), prop = C[i][j];
      return {
        q: T(`三角形中「${prop.zh}」叫做什麼？`, `In a triangle, what is ${prop.en} called?`),
        ans: ansChoice([C[i][0], ...C.filter((_, t) => t !== i).map((c) => c[0])]),
        sol: [T('外心：垂直平分線交點，到三頂點等距（外接圓圓心）。', 'Circumcenter: perpendicular bisectors meet; equally far from the vertices (center of the circumscribed circle).'), T('內心：角平分線交點，到三邊等距（內切圓圓心）。', 'Incenter: angle bisectors meet; equally far from the sides (center of the inscribed circle).'), T('重心：中線交點，把中線分成 2 : 1；垂心：三條高的交點。', 'Centroid: medians meet, splitting each 2 : 1. Orthocenter: altitudes meet.'), T(`所以答案是${C[i][0].zh}。`, `So the answer is the ${C[i][0].en.toLowerCase()}.`)],
      };
    },
  },
  {
    id: 'g9-quartiles', grade: 9,
    name: T('四分位數與盒狀圖', 'Quartiles, IQR and box plots'),
    cur: { us: 'Algebra 1 · Statistics (S-ID.A.1–3)', tw: '九年級 統計（四分位數與盒狀圖）' },
    gen(r) {
      const k = r.int(0, 3), n = r.pick([7, 8, 9, 10, 11, 12]);
      const data = Array.from({ length: n }, () => r.int(1, 60)).sort((a, b) => a - b);
      const h = Math.floor(n / 2), lo = data.slice(0, h), hi = data.slice(n - h), Q1 = median(lo), Q2 = median(data), Q3 = median(hi), IQR = clean(Q3 - Q1);
      const how = T(`先排好：${data.join(', ')}。共 ${n} 個，中位數 Q₂ = ${num(Q2)}。`, `Sorted: ${data.join(', ')}. There are ${n} values; the median Q₂ = ${num(Q2)}.`);
      const halves = T(`下半部（${n % 2 ? '不含中位數' : '前一半'}）：${lo.join(', ')} → Q₁ = ${num(Q1)}；上半部：${hi.join(', ')} → Q₃ = ${num(Q3)}。`, `Lower half (${n % 2 ? 'leaving out the median' : 'first half'}): ${lo.join(', ')} → Q₁ = ${num(Q1)}; upper half: ${hi.join(', ')} → Q₃ = ${num(Q3)}.`);
      const shuffled = r.shuffle(data).join(', ');
      if (k === 0) {
        const askQ1 = r.chance(0.5);
        return {
          q: T(`資料：${shuffled}。求第${askQ1 ? '一' : '三'}四分位數 Q${askQ1 ? '₁' : '₃'}。`, `Data: ${shuffled}. Find the ${askQ1 ? 'first' : 'third'} quartile Q${askQ1 ? '₁' : '₃'}.`), ans: ansNum(askQ1 ? Q1 : Q3),
          sol: [T('四分位數：先由小到大排序，找中位數，再分別找下半部和上半部的中位數。', 'Quartiles: sort, find the median, then find the medians of the lower and upper halves.'), how, halves, T(`答案：Q${askQ1 ? '₁' : '₃'} = ${num(askQ1 ? Q1 : Q3)}。`, `Answer: Q${askQ1 ? '₁' : '₃'} = ${num(askQ1 ? Q1 : Q3)}.`)],
        };
      }
      if (k === 1) return {
        q: T(`資料：${shuffled}。求四分位距 IQR = Q₃ − Q₁。`, `Data: ${shuffled}. Find the interquartile range IQR = Q₃ − Q₁.`), ans: ansNum(IQR),
        sol: [how, halves, T(`IQR = ${num(Q3)} − ${num(Q1)} = ${num(IQR)}。`, `IQR = ${num(Q3)} − ${num(Q1)} = ${num(IQR)}.`), T('IQR 表示中間 50% 資料分布的寬度，不太受極端值影響。', 'The IQR is the width of the middle 50% of the data; extreme values barely affect it.')],
      };
      if (k === 2) {
        const st = r.pick([2, 5]), base = st * r.int(0, 4), f = [0, r.int(1, 3), r.int(1, 3), r.int(1, 3), r.int(1, 3)];
        const five = []; let acc = base; for (const x of f) { acc += x * st; five.push(acc); }
        const ask = r.int(0, 2), names = [['四分位距', 'interquartile range (IQR)'], ['全距', 'range'], ['中位數', 'median']], v = [five[3] - five[1], five[4] - five[0], five[2]][ask];
        return {
          q: T(`從盒狀圖讀出資料的${names[ask][0]}。`, `Read the ${names[ask][1]} from the box plot.`), fig: boxFig(five, base - st, five[4] + st, st), ans: ansNum(v),
          sol: [T('盒狀圖的五個數：最小值、Q₁（盒子左邊）、中位數（盒內的線）、Q₃（盒子右邊）、最大值。', 'A box plot shows five numbers: minimum, Q₁ (left edge of the box), median (line in the box), Q₃ (right edge), maximum.'), T(`讀圖：最小 ${five[0]}，Q₁ = ${five[1]}，中位數 ${five[2]}，Q₃ = ${five[3]}，最大 ${five[4]}。`, `From the plot: min ${five[0]}, Q₁ = ${five[1]}, median ${five[2]}, Q₃ = ${five[3]}, max ${five[4]}.`), [T(`IQR = ${five[3]} − ${five[1]} = ${v}。`, `IQR = ${five[3]} − ${five[1]} = ${v}.`), T(`全距 = ${five[4]} − ${five[0]} = ${v}。`, `Range = ${five[4]} − ${five[0]} = ${v}.`), T(`中位數 = ${v}。`, `Median = ${v}.`)][ask]],
        };
      }
      const fence = clean(Q3 + 1.5 * IQR);
      return {
        q: T(`資料：${shuffled}。常用的離群值判斷是「大於 Q₃ + 1.5 × IQR」。這個上界是多少？`, `Data: ${shuffled}. A common outlier rule flags values above Q₃ + 1.5 × IQR. What is this upper fence?`), ans: ansNum(fence),
        sol: [how, halves, T(`IQR = ${num(Q3)} − ${num(Q1)} = ${num(IQR)}。`, `IQR = ${num(Q3)} − ${num(Q1)} = ${num(IQR)}.`), T(`上界 = ${num(Q3)} + 1.5 × ${num(IQR)} = ${num(Q3)} + ${num(clean(1.5 * IQR))} = ${num(fence)}。${data[n - 1] > fence ? `最大值 ${data[n - 1]} 超過上界，是離群值。` : '沒有資料超過它，所以沒有偏大的離群值。'}`, `Upper fence = ${num(Q3)} + 1.5 × ${num(IQR)} = ${num(Q3)} + ${num(clean(1.5 * IQR))} = ${num(fence)}. ${data[n - 1] > fence ? `The maximum ${data[n - 1]} is above it, so it is an outlier.` : 'No value is above it, so there are no high outliers.'}`)],
      };
    },
  },
  {
    id: 'g9-compound-prob', grade: 9,
    name: T('複合事件的機率', 'Probability of compound events'),
    cur: { us: 'CCSS 7.SP.C.8 / Geometry S-CP.A.2', tw: '九年級 機率', aops: 'Intro Counting & Probability' },
    gen(r) {
      const k = r.int(0, 4);
      if (k === 0) {
        const t = r.int(0, 2);
        if (t === 0) {
          const s = r.int(2, 12), cnt = 6 - Math.abs(s - 7), pairs = range(1, 6).filter((a) => s - a >= 1 && s - a <= 6).map((a) => `(${a}, ${s - a})`), [n, d] = red(cnt, 36);
          return {
            q: T(`同時擲兩顆公正的骰子，點數和是 ${s} 的機率是多少？（用最簡分數）`, `Two fair dice are rolled. What is the probability that the sum is ${s}? (Lowest terms.)`), ans: ansFrac(n, d),
            sol: [T('兩顆骰子共有 6 × 6 = 36 種結果，每種機會相同。', 'Two dice give 6 × 6 = 36 equally likely outcomes.'), T(`和為 ${s} 的有：${pairs.join('、')}，共 ${cnt} 種。`, `Sum ${s}: ${pairs.join(', ')} — ${cnt} outcome(s).`), T(`機率 = ${eqR(cnt, 36)}。`, `Probability = ${eqR(cnt, 36)}.`)],
          };
        }
        if (t === 1) return {
          q: T('同時擲兩顆公正的骰子，至少出現一個 6 的機率是多少？（用最簡分數）', 'Two fair dice are rolled. What is the probability of at least one 6? (Lowest terms.)'), ans: ansFrac(11, 36),
          sol: [T('「至少一個」用補集算：1 − P(都不是 6)。', '"At least one" → use the complement: 1 − P(no 6 at all).'), T(`都不是 6：${frac(5, 6)} × ${frac(5, 6)} = ${frac(25, 36)}。`, `No 6 on either: ${frac(5, 6)} × ${frac(5, 6)} = ${frac(25, 36)}.`), T(`1 − ${frac(25, 36)} = ${frac(11, 36)}。`, `1 − ${frac(25, 36)} = ${frac(11, 36)}.`)],
        };
        const m = r.pick([2, 3, 4, 5, 6]), fav = range(1, 6).reduce((s, a) => s + range(1, 6).filter((b) => (a * b) % m === 0).length, 0), [n, d] = red(fav, 36);
        return {
          q: T(`同時擲兩顆公正的骰子，兩個點數的乘積是 ${m} 的倍數的機率是多少？（用最簡分數）`, `Two fair dice are rolled. What is the probability that the product of the numbers is a multiple of ${m}? (Lowest terms.)`), ans: ansFrac(n, d),
          sol: [T('畫一張 6 × 6 的表，把每格的乘積寫出來，共 36 格。', 'Make a 6 × 6 table of products: 36 equally likely cells.'), T(`逐列數：${range(1, 6).map((a) => `${a} → ${range(1, 6).filter((b) => (a * b) % m === 0).length}`).join('，')}，共 ${fav} 格。`, `Count row by row: ${range(1, 6).map((a) => `${a} → ${range(1, 6).filter((b) => (a * b) % m === 0).length}`).join(', ')} — ${fav} cells.`), T(`機率 = ${eqR(fav, 36)}。`, `Probability = ${eqR(fav, 36)}.`)],
        };
      }
      if (k === 1 || k === 2) {
        const R = r.int(2, 8), B = r.int(2, 8), N = R + B, without = k === 1;
        const [n, d] = without ? red(R * (R - 1), N * (N - 1)) : red(R * R, N * N);
        return {
          q: without ? T(`袋中有 ${R} 顆紅球、${B} 顆白球。不放回地連續摸出 2 顆，兩顆都是紅球的機率是多少？（用最簡分數）`, `A bag has ${R} red and ${B} white balls. Two are drawn one after another WITHOUT replacement. What is the probability both are red? (Lowest terms.)`)
            : T(`袋中有 ${R} 顆紅球、${B} 顆白球。摸出一顆、記下顏色後放回，再摸一顆。兩次都是紅球的機率是多少？（用最簡分數）`, `A bag has ${R} red and ${B} white balls. A ball is drawn, its color noted, and it is put back; then a second ball is drawn. What is the probability both are red? (Lowest terms.)`),
          ans: ansFrac(n, d),
          sol: [T(`第一次紅球：${frac(R, N)}。`, `First red: ${frac(R, N)}.`), without ? T(`沒有放回，剩 ${N - 1} 顆，其中紅球 ${R - 1} 顆：第二次紅球 ${frac(R - 1, N - 1)}。`, `Not replaced: ${N - 1} balls left, ${R - 1} red, so the second is red with probability ${frac(R - 1, N - 1)}.`) : T(`放回了，第二次一樣是 ${frac(R, N)}（兩次獨立）。`, `It was put back, so the second is also ${frac(R, N)} (independent).`), T(`相乘：${frac(R, N)} × ${frac(without ? R - 1 : R, without ? N - 1 : N)} = ${eqR(without ? R * (R - 1) : R * R, without ? N * (N - 1) : N * N)}。`, `Multiply: ${frac(R, N)} × ${frac(without ? R - 1 : R, without ? N - 1 : N)} = ${eqR(without ? R * (R - 1) : R * R, without ? N * (N - 1) : N * N)}.`)],
        };
      }
      if (k === 3) {
        const n = r.int(3, 6), h = r.int(0, n), [p, q] = red(C(n, h), 2 ** n);
        return {
          q: T(`連續擲一枚公正硬幣 ${n} 次，恰好出現 ${h} 次正面的機率是多少？（用最簡分數）`, `A fair coin is tossed ${n} times. What is the probability of exactly ${h} heads? (Lowest terms.)`), ans: ansFrac(p, q),
          sol: [T(`每次 2 種結果，共 2<sup>${n}</sup> = ${2 ** n} 種，機會相同。`, `Each toss has 2 outcomes: 2<sup>${n}</sup> = ${2 ** n} equally likely sequences.`), T(`恰好 ${h} 次正面：從 ${n} 次中選 ${h} 次是正面，C(${n}, ${h}) = ${C(n, h)} 種。`, `Exactly ${h} heads: choose which ${h} of the ${n} tosses are heads: C(${n}, ${h}) = ${C(n, h)}.`), T(`機率 = ${eqR(C(n, h), 2 ** n)}。`, `Probability = ${eqR(C(n, h), 2 ** n)}.`)],
        };
      }
      const a = r.int(1, 9), b = r.int(1, 9), both = r.chance(0.5), [A, B] = two(r);
      const [n, d] = both ? red(a * b, 100) : red(100 - (10 - a) * (10 - b), 100);
      return {
        q: T(`${A[0]}投籃命中的機率是 ${num(a / 10)}，${B[0]}是 ${num(b / 10)}，兩人互不影響。各投一球，${both ? '兩人都命中' : '至少一人命中'}的機率是多少？（用最簡分數）`, `${A[1]} makes a shot with probability ${num(a / 10)} and ${B[1]} with probability ${num(b / 10)}, independently. Each takes one shot. What is the probability that ${both ? 'both make it' : 'at least one makes it'}? (Lowest terms.)`),
        ans: ansFrac(n, d),
        sol: both ? [T('獨立事件同時發生：機率相乘。', 'Independent events both happening: multiply.'), T(`${num(a / 10)} × ${num(b / 10)} = ${num(clean((a * b) / 100))} = ${eqR(a * b, 100)}。`, `${num(a / 10)} × ${num(b / 10)} = ${num(clean((a * b) / 100))} = ${eqR(a * b, 100)}.`)]
          : [T('「至少一人」用補集：1 − P(兩人都沒中)。', '"At least one" → complement: 1 − P(both miss).'), T(`兩人都沒中：${num(1 - a / 10)} × ${num(1 - b / 10)} = ${num(clean(((10 - a) * (10 - b)) / 100))}。`, `Both miss: ${num(clean(1 - a / 10))} × ${num(clean(1 - b / 10))} = ${num(clean(((10 - a) * (10 - b)) / 100))}.`), T(`1 − ${num(clean(((10 - a) * (10 - b)) / 100))} = ${num(clean(1 - ((10 - a) * (10 - b)) / 100))} = ${eqR(100 - (10 - a) * (10 - b), 100)}。`, `1 − ${num(clean(((10 - a) * (10 - b)) / 100))} = ${num(clean(1 - ((10 - a) * (10 - b)) / 100))} = ${eqR(100 - (10 - a) * (10 - b), 100)}.`)],
      };
    },
  },
  {
    id: 'g9-vieta', grade: 9,
    name: T('根與係數的關係（韋達定理）', "Vieta's formulas"),
    cur: { aops: 'Intro Algebra' },
    gen(r) {
      const k = r.int(0, 4), a = r.int(1, 5), b = r.nz(-12, 12), c = r.nz(-12, 12), E = `${poly([a, b, c])} = 0`;
      const V = T(`韋達定理：ax² + bx + c = 0 的兩根 r、s 滿足 r + s = −b/a，rs = c/a。`, "Vieta's formulas: the roots r, s of ax² + bx + c = 0 satisfy r + s = −b/a and rs = c/a.");
      const lowest = T('（用最簡分數或整數）', '(Lowest terms or an integer.)');
      if (k === 0 || k === 1) {
        const [n, d] = k === 0 ? red(-b, a) : red(c, a);
        return {
          q: T(`方程式 ${E} 的兩根${k === 0 ? '之和' : '之積'}是多少？${lowest.zh}`, `What is the ${k === 0 ? 'sum' : 'product'} of the roots of ${E}? ${lowest.en}`), ans: ansFrac(n, d),
          sol: [V, T(`a = ${a}，b = ${num(b)}，c = ${num(c)}。`, `a = ${a}, b = ${num(b)}, c = ${num(c)}.`), k === 0 ? T(`r + s = −b/a = ${eqR(-b, a)}。`, `r + s = −b/a = ${eqR(-b, a)}.`) : T(`rs = c/a = ${eqR(c, a)}。`, `rs = c/a = ${eqR(c, a)}.`), T('不用真的解出根（根可能不是整數，甚至不是實數），也能知道它們的和與積！', 'You never need the roots themselves (they may be ugly or not even real) to know their sum and product!')],
        };
      }
      if (k === 2) {
        const S = [-b, a], Pp = [c, a], [n, d] = red(b * b - 2 * a * c, a * a);
        return {
          q: T(`設 r、s 是 ${E} 的兩根，求 r² + s²。${lowest.zh}`, `Let r and s be the roots of ${E}. Find r² + s². ${lowest.en}`), ans: ansFrac(n, d),
          sol: [V, T(`r + s = ${eqR(...S)}，rs = ${eqR(...Pp)}。`, `r + s = ${eqR(...S)}, rs = ${eqR(...Pp)}.`), T('r² + s² = (r + s)² − 2rs。', 'r² + s² = (r + s)² − 2rs.'), T(`= (${fracR(...S)})² − 2 × ${pfr(...Pp)} = ${fracR(b * b, a * a)} ${c > 0 ? '−' : '+'} ${fracR(Math.abs(2 * c), a)} = ${fracR(n, d)}。`, `= (${fracR(...S)})² − 2 × ${pfr(...Pp)} = ${fracR(b * b, a * a)} ${c > 0 ? '−' : '+'} ${fracR(Math.abs(2 * c), a)} = ${fracR(n, d)}.`)],
        };
      }
      if (k === 3) {
        const [n, d] = red(-b, c);
        return {
          q: T(`設 r、s 是 ${E} 的兩根，求 ${fx(1, 'r')} + ${fx(1, 's')}。${lowest.zh}`, `Let r and s be the roots of ${E}. Find ${fx(1, 'r')} + ${fx(1, 's')}. ${lowest.en}`), ans: ansFrac(n, d),
          sol: [V, T(`通分：${fx(1, 'r')} + ${fx(1, 's')} = ${fx('r + s', 'rs')}。`, `Common denominator: ${fx(1, 'r')} + ${fx(1, 's')} = ${fx('r + s', 'rs')}.`), T(`= ${fracR(-b, a)} ÷ ${pfr(c, a)} = ${eqR(-b, c)}。`, `= ${fracR(-b, a)} ÷ ${pfr(c, a)} = ${eqR(-b, c)}.`)],
        };
      }
      const h = r.int(-5, 5); let m; do m = r.int(2, 15); while (Number.isInteger(Math.sqrt(m)));
      const S = 2 * h, Pp = h * h - m, [kk, rr] = simpRoot(m), rt = h === 0 ? `±${rad(kk, rr)}` : `${num(h)} ± ${rad(kk, rr)}`;
      return {
        q: T(`以 ${rt} 為兩根的一元二次方程式（x² 係數為 1）是哪一個？`, `Which monic quadratic equation has roots ${rt}?`),
        ans: choice(`${poly([1, -S, Pp])} = 0`, `${poly([1, S, Pp])} = 0`, `${poly([1, -S, h * h + m])} = 0`, `${poly([1, -Pp, S])} = 0`, `${poly([1, S, -Pp])} = 0`),
        sol: [T('以 r、s 為根的方程式：x² − (r + s)x + rs = 0。', 'An equation with roots r and s: x² − (r + s)x + rs = 0.'), T(`r + s = ${num(S)}（根號部分抵消）。`, `r + s = ${num(S)} (the root parts cancel).`), T(`rs = ${par(h)}² − (${rad(kk, rr)})² = ${h * h} − ${m} = ${num(Pp)}（平方差）。`, `rs = ${par(h)}² − (${rad(kk, rr)})² = ${h * h} − ${m} = ${num(Pp)} (difference of squares).`), T(`方程式：${poly([1, -S, Pp])} = 0。`, `Equation: ${poly([1, -S, Pp])} = 0.`)],
      };
    },
  },
  {
    id: 'g9-area', grade: 9,
    name: T('面積問題（坐標、組合圖形）', 'Area problems (coordinates and composite shapes)'),
    cur: { aops: 'Intro Geometry' },
    gen(r) {
      const k = r.int(0, 4);
      if (k === 0) {
        let P; do P = [0, 1, 2].map(() => [r.int(-5, 5), r.int(-5, 5)]); while ((P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[2][0] - P[0][0]) * (P[1][1] - P[0][1]) === 0);
        const [[x1, y1], [x2, y2], [x3, y3]] = P, cr = (x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1), A = Math.abs(cr) / 2;
        const xs = [x1, x2, x3], ys = [y1, y2, y3], W = Math.max(...xs) - Math.min(...xs), H = Math.max(...ys) - Math.min(...ys);
        return {
          q: T(`求以 A(${num(x1)}, ${num(y1)})、B(${num(x2)}, ${num(y2)})、C(${num(x3)}, ${num(y3)}) 為頂點的三角形面積。`, `Find the area of the triangle with vertices A(${num(x1)}, ${num(y1)}), B(${num(x2)}, ${num(y2)}) and C(${num(x3)}, ${num(y3)}).`),
          fig: grid(6, [{ x: x1, y: y1, label: 'A' }, { x: x2, y: y2, label: 'B' }, { x: x3, y: y3, label: 'C' }]), ans: ansNum(A),
          sol: [T(`方法一（框框法）：畫一個包住三角形的長方形，寬 ${W}、高 ${H}，面積 ${W * H}，再減去周圍的直角三角形。`, `Method 1 (box it in): a ${W} × ${H} rectangle around the triangle has area ${W * H}; subtract the right triangles around it.`), T('方法二（向量／鞋帶公式）：面積 = ½ |(x₂ − x₁)(y₃ − y₁) − (x₃ − x₁)(y₂ − y₁)|。', 'Method 2 (shoelace): area = ½ |(x₂ − x₁)(y₃ − y₁) − (x₃ − x₁)(y₂ − y₁)|.'), T(`= ½ |${par(x2 - x1)} × ${par(y3 - y1)} − ${par(x3 - x1)} × ${par(y2 - y1)}| = ½ |${num((x2 - x1) * (y3 - y1))} − ${par((x3 - x1) * (y2 - y1))}| = ½ × ${Math.abs(cr)}。`, `= ½ |${par(x2 - x1)} × ${par(y3 - y1)} − ${par(x3 - x1)} × ${par(y2 - y1)}| = ½ |${num((x2 - x1) * (y3 - y1))} − ${par((x3 - x1) * (y2 - y1))}| = ½ × ${Math.abs(cr)}.`), T(`面積 = ${num(A)}。`, `Area = ${num(A)}.`)],
        };
      }
      if (k === 1) {
        const a = r.int(3, 15), b = a + r.int(2, 12), h = r.int(2, 12), A = ((a + b) * h) / 2;
        return {
          q: T(`梯形的上底 ${a}、下底 ${b}、高 ${h}，面積是多少？`, `A trapezoid has bases ${a} and ${b} and height ${h}. What is its area?`),
          fig: shape([[60, 30], [60 + a * 6, 30], [20 + b * 6 > 200 ? 200 : 20 + b * 6, 140], [20, 140]].map(([x, y]) => [Math.min(x, 200), y]), [{ x: 60 + Math.min(a * 3, 70), y: 18, s: a }, { x: 100, y: 157, s: b }, { x: 10, y: 85, s: `h=${h}`, acc: true }], 220, 170),
          ans: ansNum(A),
          sol: [T('梯形面積 = (上底 + 下底) × 高 ÷ 2。', 'Trapezoid area = (base₁ + base₂) × height ÷ 2.'), T(`(${a} + ${b}) × ${h} ÷ 2 = ${a + b} × ${h} ÷ 2 = ${num(A)}。`, `(${a} + ${b}) × ${h} ÷ 2 = ${a + b} × ${h} ÷ 2 = ${num(A)}.`), T('（想法：兩個一樣的梯形倒過來拼，變成一個平行四邊形，底是上底 + 下底。）', '(Idea: two copies, one flipped, make a parallelogram whose base is base₁ + base₂.)')],
        };
      }
      if (k === 2) {
        const inSq = r.chance(0.5);
        if (inSq) {
          const s = 2 * r.int(2, 10), rr = s / 2, txt = `${s * s}-${rr * rr}π`;
          const fig = SV(170, 170, `<rect x="15" y="15" width="140" height="140" class="f-accfill"/><circle cx="85" cy="85" r="70" class="f-soft"/>` + tt(85, 165, s, false, 12));
          return {
            q: T(`邊長 ${s} 的正方形裡畫一個最大的圓（內切圓）。正方形內、圓外的部分（四個角）面積是多少？（用 π 表示）`, `The largest possible circle is drawn inside a square of side ${s}. What is the area inside the square but outside the circle (the four corners)? (In terms of π.)`),
            fig, ans: ansNum(s * s - rr * rr * Math.PI, txt),
            sol: [T(`圓的直徑 = 正方形邊長 = ${s}，半徑 ${rr}。`, `The circle's diameter equals the side, ${s}, so its radius is ${rr}.`), T(`正方形面積 ${s}² = ${s * s}；圓面積 π × ${rr}² = ${piT(rr * rr)}。`, `Square: ${s}² = ${s * s}; circle: π × ${rr}² = ${piT(rr * rr)}.`), T(`相減：${s * s} − ${piT(rr * rr)}（約 ${num(clean(s * s - rr * rr * Math.PI, 2))}）。`, `Subtract: ${s * s} − ${piT(rr * rr)} (about ${num(clean(s * s - rr * rr * Math.PI, 2))}).`)],
          };
        }
        const rr = r.int(2, 10), txt = `${rr * rr}π-${2 * rr * rr}`;
        const fig = SV(170, 170, `<circle cx="85" cy="85" r="70" class="f-accfill"/><polygon points="85,15 155,85 85,155 15,85" class="f-soft"/>` + ln(85, 85, 155, 85, 'f-line', 1.5) + tt(120, 77, `r=${rr}`, false, 12));
        return {
          q: T(`半徑 ${rr} 的圓裡有一個內接正方形（四個頂點都在圓上）。圓內、正方形外的面積是多少？（用 π 表示）`, `A square is inscribed in a circle of radius ${rr} (all four corners on the circle). What is the area inside the circle but outside the square? (In terms of π.)`),
          fig, ans: ansNum(rr * rr * Math.PI - 2 * rr * rr, txt),
          sol: [T(`正方形的對角線就是圓的直徑 ${2 * rr}。`, `The square's diagonal is the circle's diameter, ${2 * rr}.`), T(`正方形面積 = 對角線² ÷ 2 = ${2 * rr}² ÷ 2 = ${2 * rr * rr}。`, `Square area = diagonal² ÷ 2 = ${2 * rr}² ÷ 2 = ${2 * rr * rr}.`), T(`圓面積 ${piT(rr * rr)}，相減得 ${piT(rr * rr)} − ${2 * rr * rr}（約 ${num(clean(rr * rr * Math.PI - 2 * rr * rr, 2))}）。`, `Circle area ${piT(rr * rr)}; subtract: ${piT(rr * rr)} − ${2 * rr * rr} (about ${num(clean(rr * rr * Math.PI - 2 * rr * rr, 2))}).`)],
        };
      }
      if (k === 3) {
        const s = 2 * r.int(1, 10), co = (s * s) / 4;
        return {
          q: T(`邊長 ${s} 的正三角形面積是多少？（用最簡根式表示）`, `What is the area of an equilateral triangle with side ${s}? (Simplest radical form.)`),
          fig: shape([[110, 20], [30, 150], [190, 150]], [{ x: 110, y: 165, s }, { x: 55, y: 80, s }, { x: 165, y: 80, s }], 220, 172, ln(110, 20, 110, 150, 'f-acc', 1.5)),
          ans: ansNum(co * Math.sqrt(3), radText(co, 3)),
          sol: [T('從頂點畫高，把正三角形切成兩個 30°-60°-90° 的直角三角形，底邊被平分。', 'Drop the height from the top: it splits the triangle into two 30°-60°-90° right triangles and halves the base.'), T(`高² = ${s}² − ${s / 2}² = ${s * s} − ${(s * s) / 4} = ${(3 * s * s) / 4}，高 = ${rad(s / 2, 3)}。`, `height² = ${s}² − ${s / 2}² = ${s * s} − ${(s * s) / 4} = ${(3 * s * s) / 4}, so height = ${rad(s / 2, 3)}.`), T(`面積 = ${s} × ${rad(s / 2, 3)} ÷ 2 = ${rad(co, 3)}。`, `Area = ${s} × ${rad(s / 2, 3)} ÷ 2 = ${rad(co, 3)}.`), T(`（公式：正三角形面積 = ${fx(sqrt(3), 4)}s²。）`, `(Formula: area = ${fx(sqrt(3), 4)}s².)`)],
        };
      }
      const rr = 2 * r.int(1, 6), h = r.int(3, 15), rect = 2 * rr * h, semi = (rr * rr) / 2, txt = `${rect}+${semi}π`;
      return {
        q: T(`一扇窗由寬 ${2 * rr}、高 ${h} 的長方形，上面加一個直徑 ${2 * rr} 的半圓組成。窗戶的面積是多少？（用 π 表示）`, `A window is a ${2 * rr}-wide, ${h}-tall rectangle with a semicircle of diameter ${2 * rr} on top. What is the window's area? (In terms of π.)`),
        fig: SV(180, 190, `<path d="M30,180 L30,90 A60,60 0 0 1 150,90 L150,180 Z" class="f-soft"/>` + ln(30, 90, 150, 90, 'f-line', 1) + tt(90, 188, 2 * rr, false, 12) + tt(18, 135, h, false, 12)),
        ans: ansNum(rect + semi * Math.PI, txt),
        sol: [T(`長方形：${2 * rr} × ${h} = ${rect}。`, `Rectangle: ${2 * rr} × ${h} = ${rect}.`), T(`半圓：半徑 ${rr}，面積 = ½ × π × ${rr}² = ${piT(semi)}。`, `Semicircle: radius ${rr}, area = ½ × π × ${rr}² = ${piT(semi)}.`), T(`總面積 = ${rect} + ${piT(semi)}。`, `Total = ${rect} + ${piT(semi)}.`)],
      };
    },
  },
  {
    id: 'g9-combinations', grade: 9,
    name: T('組合（選出 k 個）', 'Combinations'),
    cur: { aops: 'Intro Counting & Probability' },
    gen(r) {
      const k = r.int(0, 4);
      const Cdef = (n, m) => T(`C(${n}, ${m}) = ${fx(range(n - m + 1, n).reverse().join(' × '), range(1, m).reverse().join(' × '))} = ${C(n, m)}`, `C(${n}, ${m}) = ${fx(range(n - m + 1, n).reverse().join(' × '), range(1, m).reverse().join(' × '))} = ${C(n, m)}`);
      const join = (t1, t2) => T(t1.zh + t2.zh, t1.en + t2.en);
      if (k === 0) {
        const n = r.int(5, 14), m = r.int(2, 4);
        return {
          q: T(`從 ${n} 位同學中選出 ${m} 位組成小組（不分職位），共有幾種選法？`, `In how many ways can a group of ${m} be chosen from ${n} students (no special roles)?`), ans: ansNum(C(n, m)),
          sol: [T(`如果有順序：${range(n - m + 1, n).reverse().join(' × ')} = ${num(P(n, m))} 種。`, `If order mattered: ${range(n - m + 1, n).reverse().join(' × ')} = ${num(P(n, m))}.`), T(`但同一組 ${m} 個人被排了 ${m}! = ${fact(m)} 次，要除掉。`, `But each group of ${m} was counted ${m}! = ${fact(m)} times, so divide.`), join(Cdef(n, m), T('。', '.'))],
        };
      }
      if (k === 1) {
        const b = r.int(4, 9), g = r.int(4, 9), x = r.int(1, 3), y = r.int(1, 3);
        return {
          q: T(`班上有 ${b} 位男生、${g} 位女生。要選 ${x} 位男生和 ${y} 位女生參加比賽，共有幾種選法？`, `A class has ${b} boys and ${g} girls. In how many ways can ${x} boy${x > 1 ? 's' : ''} and ${y} girl${y > 1 ? 's' : ''} be chosen for a contest?`), ans: ansNum(C(b, x) * C(g, y)),
          sol: [T(`選男生：C(${b}, ${x}) = ${C(b, x)}；選女生：C(${g}, ${y}) = ${C(g, y)}。`, `Boys: C(${b}, ${x}) = ${C(b, x)}; girls: C(${g}, ${y}) = ${C(g, y)}.`), T('兩件事都要做，用乘法原理。', 'Both choices are made, so multiply.'), T(`${C(b, x)} × ${C(g, y)} = ${C(b, x) * C(g, y)}。`, `${C(b, x)} × ${C(g, y)} = ${C(b, x) * C(g, y)}.`)],
        };
      }
      if (k === 2) {
        const n = r.int(5, 30), t = r.chance(0.5);
        return {
          q: t ? T(`${n} 個人參加聚會，每兩人都握一次手，共握手幾次？`, `${n} people are at a party and every two of them shake hands once. How many handshakes are there?`) : T(`圓上有 ${n} 個點，每兩點連一條線段，共可連出幾條？`, `There are ${n} points on a circle. How many segments join two of them?`),
          ans: ansNum(C(n, 2)),
          sol: [T(`每次握手（每條線段）就是從 ${n} 個裡選 2 個，不分順序。`, `Each handshake (segment) is a choice of 2 out of ${n}, order not mattering.`), T(`C(${n}, 2) = ${n} × ${n - 1} ÷ 2 = ${C(n, 2)}。`, `C(${n}, 2) = ${n} × ${n - 1} ÷ 2 = ${C(n, 2)}.`), T(`另一種想法：每人握 ${n - 1} 次，${n} × ${n - 1} 把每次握手算了兩次，所以除以 2。`, `Another way: each person shakes ${n - 1} hands; ${n} × ${n - 1} counts every handshake twice, so halve it.`)],
        };
      }
      if (k === 3) {
        const m = r.int(2, 6), n = r.int(2, 5);
        return {
          q: T(`在 ${m} × ${n} 的方格路網上，從左下角 A 走到右上角 B，每步只能向右或向上走一格。最短路徑共有幾條？`, `On a ${m} × ${n} grid of streets, how many shortest paths go from the lower-left corner A to the upper-right corner B, moving only right or up one block at a time?`),
          fig: latticeFig(m, n), ans: ansNum(C(m + n, m)),
          sol: [T(`每條最短路徑都是 ${m} 步「右」和 ${n} 步「上」，共 ${m + n} 步。`, `Every shortest path is ${m} "rights" and ${n} "ups": ${m + n} steps in all.`), T(`只要決定 ${m + n} 步中哪 ${m} 步是「右」，路徑就確定了。`, `Choosing which ${m} of the ${m + n} steps are "right" fixes the path.`), join(Cdef(m + n, m), T('。', '.'))],
        };
      }
      const b = r.int(4, 8), g = r.int(3, 7), m = r.int(3, 4), tot = C(b + g, m), none = C(b, m);
      return {
        q: T(`社團有 ${b} 位男生、${g} 位女生，要選出 ${m} 人的幹部群，而且至少要有 1 位女生。共有幾種選法？`, `A club has ${b} boys and ${g} girls. A committee of ${m} must include at least one girl. How many committees are possible?`), ans: ansNum(tot - none),
        sol: [T('「至少 1 位」用補集：全部的選法 − 一個女生都沒有的選法。', '"At least one" → complement: all committees − committees with no girls.'), T(`全部：C(${b + g}, ${m}) = ${tot}。`, `All: C(${b + g}, ${m}) = ${tot}.`), T(`全是男生：C(${b}, ${m}) = ${none}。`, `All boys: C(${b}, ${m}) = ${none}.`), T(`${tot} − ${none} = ${tot - none}。`, `${tot} − ${none} = ${tot - none}.`)],
      };
    },
  },
  {
    id: 'g9-mod', grade: 9,
    name: T('同餘與餘數', 'Modular arithmetic and remainders'),
    cur: { aops: 'Intro Number Theory' },
    gen(r) {
      const k = r.int(0, 3);
      if (k === 0) {
        const m = r.int(5, 13), a = r.int(100, 9999), b = r.int(100, 9999), mul = r.chance(0.5), ra = a % m, rb = b % m, v = mul ? (ra * rb) % m : (ra + rb) % m;
        return {
          q: T(`${a} ${mul ? '×' : '+'} ${b} 除以 ${m} 的餘數是多少？`, `What is the remainder when ${a} ${mul ? '×' : '+'} ${b} is divided by ${m}?`), ans: ansNum(v),
          sol: [T(`不用真的算出${mul ? '乘積' : '和'}：先各自取餘數再${mul ? '相乘' : '相加'}（同餘的性質）。`, `No need to compute the whole ${mul ? 'product' : 'sum'}: take remainders first, then ${mul ? 'multiply' : 'add'} (modular arithmetic).`), T(`${a} = ${m} × ${Math.floor(a / m)} + ${ra}，所以 ${a} ≡ ${ra} (mod ${m})；${b} ≡ ${rb} (mod ${m})。`, `${a} = ${m} × ${Math.floor(a / m)} + ${ra}, so ${a} ≡ ${ra} (mod ${m}); ${b} ≡ ${rb} (mod ${m}).`), T(`${ra} ${mul ? '×' : '+'} ${rb} = ${mul ? ra * rb : ra + rb} ≡ ${v} (mod ${m})。`, `${ra} ${mul ? '×' : '+'} ${rb} = ${mul ? ra * rb : ra + rb} ≡ ${v} (mod ${m}).`), T(`餘數是 ${v}。`, `The remainder is ${v}.`)],
        };
      }
      if (k === 1) {
        const m = r.pick([3, 4, 5, 7, 9, 11, 13]); let b; do b = r.int(2, 12); while (gcd(b, m) !== 1 || b % m === 1);
        const n = r.int(20, 999), cyc = []; let x = b % m; while (!cyc.includes(x)) { cyc.push(x); x = (x * b) % m; }
        const L = cyc.length, v = cyc[(n - 1) % L];
        return {
          q: T(`${pow(b, n)} 除以 ${m} 的餘數是多少？`, `What is the remainder when ${pow(b, n)} is divided by ${m}?`), ans: ansNum(v),
          sol: [T(`列出 ${b} 的次方除以 ${m} 的餘數：${cyc.map((c, i) => `${pow(b, i + 1)} ≡ ${c}`).join('，')}，${pow(b, L + 1)} ≡ ${cyc[0]}……`, `Remainders of powers of ${b} mod ${m}: ${cyc.map((c, i) => `${pow(b, i + 1)} ≡ ${c}`).join(', ')}, ${pow(b, L + 1)} ≡ ${cyc[0]}, …`), T(`每 ${L} 個一循環${cyc[L - 1] === 1 ? `（${pow(b, L)} ≡ 1）` : ''}。`, `It repeats every ${L}${cyc[L - 1] === 1 ? ` (${pow(b, L)} ≡ 1)` : ''}.`), T(`${n} ÷ ${L} 餘 ${n % L}，對應循環中的第 ${((n - 1) % L) + 1} 個：餘數 ${v}。`, `${n} ÷ ${L} leaves ${n % L}, which is position ${((n - 1) % L) + 1} in the cycle: remainder ${v}.`)],
        };
      }
      if (k === 2) {
        const d0 = r.int(0, 6), N = r.int(20, 2000), d1 = (d0 + N) % 7;
        const opts = [d1, ...r.sample(range(0, 6).filter((x) => x !== d1), 3)].map((i) => T(DAYS[i][0], DAYS[i][1]));
        return {
          q: T(`今天是${DAYS[d0][0]}。${N} 天後是星期幾？`, `Today is ${DAYS[d0][1]}. What day of the week will it be ${N} days from now?`), ans: ansChoice(opts),
          sol: [T('每 7 天星期就重複一次，所以只看 N 除以 7 的餘數。', 'The days repeat every 7, so only the remainder of N ÷ 7 matters.'), T(`${N} = 7 × ${Math.floor(N / 7)} + ${N % 7}，餘 ${N % 7}。`, `${N} = 7 × ${Math.floor(N / 7)} + ${N % 7}, remainder ${N % 7}.`), T(`從${DAYS[d0][0]}往後數 ${N % 7} 天：${DAYS[d1][0]}。`, `Count ${N % 7} day(s) forward from ${DAYS[d0][1]}: ${DAYS[d1][1]}.`)],
        };
      }
      const [m, n] = r.pick([[3, 4], [3, 5], [4, 5], [3, 7], [5, 7], [4, 7], [5, 6], [7, 8], [5, 9], [4, 9]]), a = r.int(0, m - 1), b = r.int(0, n - 1);
      let x = 1; while (x % m !== a || x % n !== b) x++;
      if (x <= Math.max(m, n)) return this.gen(r);
      const list = []; for (let y = b || n; list.length < 8 && y <= x; y += n) list.push(y);
      return {
        q: T(`一個正整數除以 ${m} 餘 ${a}，除以 ${n} 餘 ${b}。這個數最小是多少？`, `A positive integer leaves remainder ${a} when divided by ${m} and remainder ${b} when divided by ${n}. What is the smallest such number?`), ans: ansNum(x),
        sol: [T(`先列出除以 ${n} 餘 ${b} 的正整數：${list.join(', ')}${list[list.length - 1] < x ? ', …' : ''}。`, `List the positive integers with remainder ${b} mod ${n}: ${list.join(', ')}${list[list.length - 1] < x ? ', …' : ''}.`), T(`再一個一個檢查除以 ${m} 的餘數，第一個餘 ${a} 的是 ${x}。`, `Check each one mod ${m}; the first with remainder ${a} is ${x}.`), T(`驗算：${x} = ${m} × ${Math.floor(x / m)} + ${a}，${x} = ${n} × ${Math.floor(x / n)} + ${b} ✓（之後每加 ${m * n} 都還符合）`, `Check: ${x} = ${m} × ${Math.floor(x / m)} + ${a} and ${x} = ${n} × ${Math.floor(x / n)} + ${b} ✓ (adding ${m * n} keeps working).`)],
      };
    },
  },
  {
    id: 'g9-amc-mix', grade: 9,
    name: T('AMC 10 風格綜合題', 'AMC 10-style problems'),
    cur: { aops: 'AMC 10' },
    gen(r) {
      const k = r.int(0, 4);
      if (k === 0) {
        const n = r.int(25, 400), parts = []; let p = 5, z = 0; while (p <= n) { parts.push(Math.floor(n / p)); z += Math.floor(n / p); p *= 5; }
        return {
          q: T(`${n}! 的末尾有幾個連續的 0？`, `How many zeros are at the end of ${n}!?`), ans: ansNum(z),
          sol: [T('每個末尾 0 來自一個 10 = 2 × 5。因數 2 比 5 多很多，所以只要數因數 5 的個數。', 'Each trailing zero comes from a 10 = 2 × 5. There are far more 2s than 5s, so count the factors of 5.'), T(`5 的倍數：⌊${n}/5⌋ = ${parts[0]}${parts[1] != null ? `；25 的倍數再多貢獻一個：⌊${n}/25⌋ = ${parts[1]}` : ''}${parts[2] != null ? `；125 的倍數：⌊${n}/125⌋ = ${parts[2]}` : ''}。`, `Multiples of 5: ⌊${n}/5⌋ = ${parts[0]}${parts[1] != null ? `; multiples of 25 give an extra 5: ⌊${n}/25⌋ = ${parts[1]}` : ''}${parts[2] != null ? `; multiples of 125: ⌊${n}/125⌋ = ${parts[2]}` : ''}.`), T(`共 ${parts.join(' + ')} = ${z} 個 0。`, `Total: ${parts.join(' + ')} = ${z} zeros.`)],
        };
      }
      if (k === 1) {
        const [a, b] = r.pick([[30, 60], [40, 60], [20, 30], [60, 90], [45, 90], [12, 24], [10, 15], [36, 45], [50, 75], [60, 40], [84, 42]]), d = r.pick([60, 90, 120, 180, 360]), avg = (2 * a * b) / (a + b), nm = who(r);
        return {
          q: T(`${nm[0]}開車從甲地到乙地 ${d} 公里，去程時速 ${a} 公里，回程時速 ${b} 公里。來回的平均時速是多少公里？`, `${nm[1]} drives ${d} km from town A to town B at ${a} km/h and drives back at ${b} km/h. What is the average speed for the round trip, in km/h?`), ans: ansNum(avg),
          sol: [T('平均速率 = 總距離 ÷ 總時間（不是兩個速率的平均！）。', 'Average speed = total distance ÷ total time (NOT the average of the two speeds!).'), T(`去程 ${d} ÷ ${a} = ${num(clean(d / a, 4))} 小時，回程 ${d} ÷ ${b} = ${num(clean(d / b, 4))} 小時。`, `Going: ${d} ÷ ${a} = ${num(clean(d / a, 4))} h; returning: ${d} ÷ ${b} = ${num(clean(d / b, 4))} h.`), T(`總距離 ${2 * d}，總時間 ${num(clean(d / a + d / b, 4))}：${2 * d} ÷ ${num(clean(d / a + d / b, 4))} = ${num(avg)}。`, `Total distance ${2 * d}, total time ${num(clean(d / a + d / b, 4))}: ${2 * d} ÷ ${num(clean(d / a + d / b, 4))} = ${num(avg)}.`), T(`（${fx(`2 × ${a} × ${b}`, `${a} + ${b}`)} = ${num(avg)}，比 (${a} + ${b}) ÷ 2 = ${num((a + b) / 2)} 小。）`, `(${fx(`2 × ${a} × ${b}`, `${a} + ${b}`)} = ${num(avg)}, less than (${a} + ${b}) ÷ 2 = ${num((a + b) / 2)}.)`)],
        };
      }
      if (k === 2) {
        let a, b; do { a = r.int(2, 12); b = r.int(2, 15); } while (a === b);
        const [n, d] = red(a * b, a + b), [A, B] = two(r);
        return {
          q: T(`${A[0]}單獨粉刷一間教室要 ${a} 小時，${B[0]}單獨要 ${b} 小時。兩人一起刷，要幾小時？（可用分數）`, `${A[1]} can paint a classroom alone in ${a} hours and ${B[1]} alone in ${b} hours. How many hours does it take working together? (A fraction is fine.)`), ans: ansNum([n, d]),
          sol: [T(`每小時：${A[0]}完成 ${frac(1, a)}，${B[0]}完成 ${frac(1, b)}。`, `Per hour: ${A[1]} does ${frac(1, a)} of the job and ${B[1]} does ${frac(1, b)}.`), T(`一起每小時完成 ${frac(1, a)} + ${frac(1, b)} = ${frac(a + b, a * b)}。`, `Together per hour: ${frac(1, a)} + ${frac(1, b)} = ${frac(a + b, a * b)}.`), T(`完成整份（1）需要 1 ÷ ${frac(a + b, a * b)} = ${eqR(a * b, a + b)} 小時${d > 1 ? `（約 ${num(clean(n / d, 2))} 小時）` : ''}。`, `The whole job (1) takes 1 ÷ ${frac(a + b, a * b)} = ${eqR(a * b, a + b)} hours${d > 1 ? ` (about ${num(clean(n / d, 2))})` : ''}.`)],
        };
      }
      if (k === 3) {
        const N = r.int(100, 999), D = 9 + 180 + 3 * (N - 99), rev = r.chance(0.5);
        return {
          q: rev ? T(`一本書的頁碼從 1 開始連續編號，共用了 ${num(D)} 個數字。這本書有幾頁？`, `A book's pages are numbered 1, 2, 3, …, using ${num(D)} digits in all. How many pages does it have?`) : T(`一本書有 ${N} 頁，頁碼從 1 開始，一共要印幾個數字？`, `A book has ${N} pages numbered from 1. How many digits are printed in all?`),
          ans: ansNum(rev ? N : D),
          sol: [T('分段數：1～9 每頁 1 個數字，共 9 個；10～99 共 90 頁，每頁 2 個，共 180 個。', 'Count in blocks: pages 1–9 use 1 digit each (9 digits); pages 10–99 are 90 pages × 2 = 180 digits.'), rev ? T(`前 99 頁用了 189 個，剩下 ${num(D)} − 189 = ${D - 189} 個，每頁 3 個：${D - 189} ÷ 3 = ${N - 99} 頁。`, `The first 99 pages use 189; the rest is ${num(D)} − 189 = ${D - 189} digits at 3 per page: ${D - 189} ÷ 3 = ${N - 99} pages.`) : T(`100～${N} 共 ${N - 99} 頁，每頁 3 個：${3 * (N - 99)} 個。`, `Pages 100–${N}: ${N - 99} pages × 3 = ${3 * (N - 99)} digits.`), rev ? T(`總頁數 99 + ${N - 99} = ${N}。`, `Pages: 99 + ${N - 99} = ${N}.`) : T(`總共 9 + 180 + ${3 * (N - 99)} = ${num(D)} 個數字。`, `Total: 9 + 180 + ${3 * (N - 99)} = ${num(D)} digits.`)],
        };
      }
      const A = r.int(10, 400), B = A + r.int(200, 3000), lo = Math.ceil(Math.sqrt(A)), hi = Math.floor(Math.sqrt(B)), v = hi - lo + 1;
      return {
        q: T(`${A} 到 ${num(B)}（包含兩端）之間有幾個完全平方數？`, `How many perfect squares are there from ${A} to ${num(B)}, inclusive?`), ans: ansNum(v),
        sol: [T(`最小的：${lo}² = ${lo * lo}（${lo - 1}² = ${(lo - 1) ** 2} 太小）。`, `Smallest: ${lo}² = ${lo * lo} (${lo - 1}² = ${(lo - 1) ** 2} is too small).`), T(`最大的：${hi}² = ${num(hi * hi)}（${hi + 1}² = ${num((hi + 1) ** 2)} 太大）。`, `Largest: ${hi}² = ${num(hi * hi)} (${hi + 1}² = ${num((hi + 1) ** 2)} is too big).`), T(`${lo}² 到 ${hi}² 共 ${hi} − ${lo} + 1 = ${v} 個。`, `${lo}² through ${hi}²: ${hi} − ${lo} + 1 = ${v} squares.`)],
      };
    },
  },
  {
    id: 'g9-abs-value', grade: 9,
    name: T('絕對值方程式與不等式', 'Absolute value equations and inequalities'),
    cur: { us: 'Algebra 1 · Absolute value (A-CED.A.1)', aops: 'Intro Algebra' },
    gen(r) {
      const k = r.int(0, 4);
      const meaning = T('|x − a| 表示 x 和 a 在數線上的距離。', '|x − a| is the distance between x and a on the number line.');
      if (k === 0) {
        const a = r.int(1, 4), b = r.nz(-12, 12), c = r.int(1, 15), r1 = red(c - b, a), r2 = red(-c - b, a);
        return {
          q: T(`解方程式 |${lin(a, b)}| = ${c}。（兩個解用逗號隔開，可以用分數）`, `Solve |${lin(a, b)}| = ${c}. (Separate the answers with a comma; fractions are fine.)`), ans: ansSet([(c - b) / a, (-c - b) / a], `${fracText(...r1)}, ${fracText(...r2)}`),
          sol: [T(`絕對值等於 ${c}，裡面可以是 ${c} 或 −${c}。`, `If the absolute value is ${c}, the inside is ${c} or −${c}.`), T(`${lin(a, b)} = ${c} → ${a > 1 ? `${mono(a)} = ${num(c - b)} → ` : ''}x = ${fracR(...r1)}。`, `${lin(a, b)} = ${c} → ${a > 1 ? `${mono(a)} = ${num(c - b)} → ` : ''}x = ${fracR(...r1)}.`), T(`${lin(a, b)} = −${c} → ${a > 1 ? `${mono(a)} = ${num(-c - b)} → ` : ''}x = ${fracR(...r2)}。`, `${lin(a, b)} = −${c} → ${a > 1 ? `${mono(a)} = ${num(-c - b)} → ` : ''}x = ${fracR(...r2)}.`), T(`答案：x = ${fracR(...r1)} 或 ${fracR(...r2)}。`, `Answer: x = ${fracR(...r1)} or ${fracR(...r2)}.`)],
        };
      }
      if (k === 1) {
        const a = r.int(-10, 10), b = r.int(1, 9), strict = r.chance(0.5), cnt = strict ? 2 * b - 1 : 2 * b + 1;
        const lo = strict ? a - b + 1 : a - b, hi = strict ? a + b - 1 : a + b;
        return {
          q: T(`有幾個整數 x 滿足 |x ${sgn(-a)}| ${strict ? LT : '≤'} ${b}？`.replace('|x + 0|', '|x|').replace('|x − 0|', '|x|'), `How many integers x satisfy |x ${sgn(-a)}| ${strict ? LT : '≤'} ${b}?`.replace('|x + 0|', '|x|').replace('|x − 0|', '|x|')), ans: ansNum(cnt),
          sol: [meaning, T(`x 和 ${num(a)} 的距離${strict ? '小於' : '不超過'} ${b}：${num(a - b)} ${strict ? LT : '≤'} x ${strict ? LT : '≤'} ${num(a + b)}。`, `x is ${strict ? 'less than' : 'at most'} ${b} away from ${num(a)}: ${num(a - b)} ${strict ? LT : '≤'} x ${strict ? LT : '≤'} ${num(a + b)}.`), T(`整數從 ${num(lo)} 到 ${num(hi)}，共 ${num(hi)} − ${par(lo)} + 1 = ${cnt} 個。`, `The integers run from ${num(lo)} to ${num(hi)}: ${num(hi)} − ${par(lo)} + 1 = ${cnt}.`)],
        };
      }
      if (k === 2) {
        const a = r.int(-9, 9), c = r.int(1, 12), t = r.int(0, 2), d = t === 0 ? c + r.int(1, 9) : t === 1 ? c : c - r.int(1, 9), w = d - c;
        const opts = [T('2 個', '2'), T('1 個', '1'), T('0 個（無解）', '0 (no solution)')];
        return {
          q: T(`方程式 |x ${sgn(-a)}| + ${c} = ${num(d)} 有幾個實數解？`.replace('|x + 0|', '|x|').replace('|x − 0|', '|x|'), `How many real solutions does |x ${sgn(-a)}| + ${c} = ${num(d)} have?`.replace('|x + 0|', '|x|').replace('|x − 0|', '|x|')),
          ans: ansChoice([opts[t], ...opts.filter((_, i) => i !== t)]),
          sol: [T(`先把絕對值單獨留在一邊：|x ${sgn(-a)}| = ${num(d)} − ${c} = ${num(w)}。`.replace('|x + 0|', '|x|').replace('|x − 0|', '|x|'), `Isolate the absolute value: |x ${sgn(-a)}| = ${num(d)} − ${c} = ${num(w)}.`.replace('|x + 0|', '|x|').replace('|x − 0|', '|x|')), T('絕對值永遠 ≥ 0：等於正數有 2 解，等於 0 有 1 解，等於負數無解。', 'An absolute value is never negative: = positive → 2 solutions, = 0 → 1 solution, = negative → none.'), t === 0 ? T(`${w} > 0，x = ${num(a)} ± ${w}，即 ${num(a + w)} 或 ${num(a - w)}，共 2 個。`, `${w} > 0: x = ${num(a)} ± ${w}, i.e. ${num(a + w)} or ${num(a - w)} — 2 solutions.`) : t === 1 ? T(`等於 0，只有 x = ${num(a)}，1 個。`, `It equals 0, so only x = ${num(a)} — 1 solution.`) : T(`${num(w)} < 0，不可能，無解。`, `${num(w)} < 0 is impossible — no solution.`)],
        };
      }
      if (k === 3) {
        let a, b; do { a = r.int(-12, 12); b = r.int(-12, 12); } while (a === b);
        return {
          q: T(`解方程式 |x ${sgn(-a)}| = |x ${sgn(-b)}|。`.replace(/\|x \+ 0\|/g, '|x|').replace(/\|x − 0\|/g, '|x|'), `Solve |x ${sgn(-a)}| = |x ${sgn(-b)}|.`.replace(/\|x \+ 0\|/g, '|x|').replace(/\|x − 0\|/g, '|x|')), ans: ansNum((a + b) / 2, `x = ${fracText(a + b, 2)}`),
          sol: [meaning, T(`題目是說：x 到 ${num(a)} 的距離 = x 到 ${num(b)} 的距離，所以 x 在 ${num(a)} 和 ${num(b)} 的正中間。`, `So x is the same distance from ${num(a)} as from ${num(b)}: it's the midpoint.`), T(`x = (${num(a)} + ${par(b)}) ÷ 2 = ${fracR(a + b, 2)}。`, `x = (${num(a)} + ${par(b)}) ÷ 2 = ${fracR(a + b, 2)}.`), T(`代數驗證：兩邊平方，(x ${sgn(-a)})² = (x ${sgn(-b)})²，x² 消掉後得 ${num(2 * (b - a))}x = ${num(b * b - a * a)}，x = ${fracR(a + b, 2)} ✓`, `Algebra check: square both sides, (x ${sgn(-a)})² = (x ${sgn(-b)})²; the x² cancels, leaving ${num(2 * (b - a))}x = ${num(b * b - a * a)}, so x = ${fracR(a + b, 2)} ✓`)],
        };
      }
      const a = r.int(-8, 8), b = r.int(1, 9), S = (o, v) => `x ${o} ${num(v)}`;
      const right = T(`${S(LT, a - b)} 或 ${S(GT, a + b)}`, `${S(LT, a - b)} or ${S(GT, a + b)}`);
      return {
        q: T(`解不等式 |x ${sgn(-a)}| ${GT} ${b}。`.replace('|x + 0|', '|x|').replace('|x − 0|', '|x|'), `Solve |x ${sgn(-a)}| ${GT} ${b}.`.replace('|x + 0|', '|x|').replace('|x − 0|', '|x|')),
        ans: ansChoice([right, T(`${num(a - b)} ${LT} x ${LT} ${num(a + b)}`, `${num(a - b)} ${LT} x ${LT} ${num(a + b)}`), T(`${S(LT, -b - a)} 或 ${S(GT, b - a)}`, `${S(LT, -b - a)} or ${S(GT, b - a)}`), T(S(GT, a + b), S(GT, a + b))].filter((o, i, arr) => arr.findIndex((p) => p.en === o.en) === i)),
        sol: [meaning, T(`距離 ${num(a)} 超過 ${b}：x 在 ${num(a - b)} 的左邊，或在 ${num(a + b)} 的右邊。`, `More than ${b} away from ${num(a)}: x is left of ${num(a - b)} or right of ${num(a + b)}.`), T(`答案：x ${LT} ${num(a - b)} 或 x ${GT} ${num(a + b)}（兩段，不是夾在中間）。`, `Answer: x ${LT} ${num(a - b)} or x ${GT} ${num(a + b)} — two pieces, not the middle.`)],
      };
    },
  },
  {
    id: 'g9-geo-seq', grade: 9,
    name: T('等比數列', 'Geometric sequences'),
    cur: { us: 'Algebra 1 · Geometric sequences (F-LE.A.2)', tw: '八年級 等比數列', aops: 'Intro Algebra' },
    at: { tw: 8 },
    gen(r) {
      const k = r.int(0, 4), F = T('等比數列第 n 項：aₙ = a₁ × r<sup>n−1</sup>（r 是公比）。', 'nth term of a geometric sequence: aₙ = a₁ × r<sup>n−1</sup> (r = common ratio).');
      if (k === 0) {
        const rt = r.pick([2, 3, -2, -3, 0.5]), n = r.int(5, rt === 0.5 ? 7 : 8), a1 = rt === 0.5 ? 2 ** (n - 1) * r.int(1, 3) : r.nz(-5, 5), A = (i) => clean(a1 * rt ** (i - 1));
        return {
          q: T(`等比數列 ${[1, 2, 3, 4].map((i) => num(A(i))).join(', ')}, … 的第 ${n} 項是多少？`, `What is the ${ord(n)} term of the geometric sequence ${[1, 2, 3, 4].map((i) => num(A(i))).join(', ')}, …?`), ans: ansNum(A(n)),
          sol: [F, T(`a₁ = ${num(a1)}，公比 r = ${num(A(2))} ÷ ${par(A(1))} = ${num(rt)}。`, `a₁ = ${num(a1)}; ratio r = ${num(A(2))} ÷ ${par(A(1))} = ${num(rt)}.`), T(`a<sub>${n}</sub> = ${num(a1)} × ${par(rt)}<sup>${n - 1}</sup> = ${num(a1)} × ${par(clean(rt ** (n - 1)))} = ${num(A(n))}。`, `a<sub>${n}</sub> = ${num(a1)} × ${par(rt)}<sup>${n - 1}</sup> = ${num(a1)} × ${par(clean(rt ** (n - 1)))} = ${num(A(n))}.`)],
        };
      }
      if (k === 1) {
        const gap = r.pick([2, 3]), rt = gap === 2 ? r.pick([2, 3, 4, 5]) : r.pick([2, 3, -2, -3, 4]), a1 = r.nz(-6, 6), m = r.int(1, 3), n = m + gap, am = a1 * rt ** (m - 1), an = a1 * rt ** (n - 1);
        return {
          q: T(`等比數列中 a<sub>${m}</sub> = ${num(am)}，a<sub>${n}</sub> = ${num(an)}，公比是${gap === 2 ? '正數' : '實數'}。求公比 r。`, `In a geometric sequence a<sub>${m}</sub> = ${num(am)} and a<sub>${n}</sub> = ${num(an)}; the common ratio is ${gap === 2 ? 'positive' : 'a real number'}. Find the ratio r.`), ans: ansNum(rt),
          sol: [T(`從第 ${m} 項到第 ${n} 項乘了 ${gap} 次公比：a<sub>${n}</sub> = a<sub>${m}</sub> × r<sup>${gap}</sup>。`, `From term ${m} to term ${n} we multiply by r ${gap} times: a<sub>${n}</sub> = a<sub>${m}</sub> × r<sup>${gap}</sup>.`), T(`r<sup>${gap}</sup> = ${num(an)} ÷ ${par(am)} = ${num(rt ** gap)}。`, `r<sup>${gap}</sup> = ${num(an)} ÷ ${par(am)} = ${num(rt ** gap)}.`),
            gap === 2 ? T(`r = ±${rt}，題目說公比是正數，所以 r = ${rt}。`, `r = ±${rt}; the ratio is positive, so r = ${rt}.`) : T(`哪個數的立方是 ${num(rt ** 3)}？${par(rt)}³ = ${num(rt ** 3)}，所以 r = ${num(rt)}。`, `Which number cubed is ${num(rt ** 3)}? ${par(rt)}³ = ${num(rt ** 3)}, so r = ${num(rt)}.`)],
        };
      }
      if (k === 2) {
        const rt = r.pick([2, 3]), a1 = r.int(1, 5), n = r.int(4, rt === 2 ? 11 : 7), V = a1 * rt ** (n - 1);
        return {
          q: T(`在等比數列 ${a1}, ${a1 * rt}, ${a1 * rt * rt}, … 中，${num(V)} 是第幾項？`, `In the geometric sequence ${a1}, ${a1 * rt}, ${a1 * rt * rt}, …, which term is ${num(V)}?`), ans: ansNum(n),
          sol: [F, T(`${a1} × ${rt}<sup>n−1</sup> = ${num(V)} → ${rt}<sup>n−1</sup> = ${num(V / a1)}。`, `${a1} × ${rt}<sup>n−1</sup> = ${num(V)} → ${rt}<sup>n−1</sup> = ${num(V / a1)}.`), T(`${num(V / a1)} = ${rt}<sup>${n - 1}</sup>，所以 n − 1 = ${n - 1}，n = ${n}。`, `${num(V / a1)} = ${rt}<sup>${n - 1}</sup>, so n − 1 = ${n - 1} and n = ${n}.`)],
        };
      }
      if (k === 3) {
        const [p, q] = r.pick([[1, 2], [3, 4], [2, 3], [3, 5]]), n = r.int(2, 4), h = q ** n * r.int(1, 3) * (q === 2 ? 5 : 1), v = (h * p ** n) / q ** n;
        return {
          q: T(`一顆球從 ${num(h)} 公分高落下，每次彈起的高度是落下高度的 ${frac(p, q)}。第 ${n} 次彈起的高度是幾公分？`, `A ball is dropped from ${num(h)} cm. Each bounce reaches ${frac(p, q)} of the height it fell from. How high does it rise on the ${ord(n)} bounce, in cm?`), ans: ansNum(v),
          sol: [T(`每次乘 ${frac(p, q)}，是公比 ${frac(p, q)} 的等比數列。`, `Each bounce multiplies by ${frac(p, q)}: a geometric sequence with ratio ${frac(p, q)}.`), T(`第 ${n} 次：${num(h)} × (${frac(p, q)})<sup>${n}</sup> = ${num(h)} × ${frac(p ** n, q ** n)}。`, `Bounce ${n}: ${num(h)} × (${frac(p, q)})<sup>${n}</sup> = ${num(h)} × ${frac(p ** n, q ** n)}.`), T(`= ${num(v)} 公分。`, `= ${num(v)} cm.`)],
        };
      }
      const m = r.int(1, 5), s = r.int(1, 6); let t; do t = r.int(1, 8); while (t === s);
      const a = m * s * s, b = m * t * t, x = m * s * t;
      return {
        q: T(`${a}, x, ${b} 三個正數成等比數列，求 x。`, `The positive numbers ${a}, x, ${b} form a geometric sequence. Find x.`), ans: ansNum(x),
        sol: [T(`等比 → ${fx('x', a)} = ${fx(b, 'x')}（公比相同）。`, `Geometric → ${fx('x', a)} = ${fx(b, 'x')} (same ratio).`), T(`x² = ${a} × ${b} = ${a * b}。`, `x² = ${a} × ${b} = ${a * b}.`), T(`x 是正數，x = √${a * b} = ${x}（等比中項）。`, `x is positive: x = √${a * b} = ${x} (the geometric mean).`), T(`檢查：公比 ${fracR(x, a)}，${a} → ${x} → ${b} ✓`, `Check: ratio ${fracR(x, a)}: ${a} → ${x} → ${b} ✓`)],
      };
    },
  },
];

export default [...G7, ...G8, ...G9];
