// Question bank for grades 4–6 (US Common Core, Taiwan 108 國小四～六年級, AoPS Beast Academy 4–5 / Prealgebra / MATHCOUNTS).
// See SPEC.md for the format.
import {
  T, num, numText, frac, fracR, mixed, mixedText, red, gcd, lcm, isPrime, factors, primeFactors,
  fadd, fsub, fmul, fdiv, fracText, pow, ansNum, ansFrac, ansPair, ansChoice, near, uniq, clean, sum, range, C, P, fact, lin, par,
} from '../util.js';
import { numberLine, fracBar, rect, shape, bars, clock, circle } from '../draw.js';

// ---------- shared helpers ----------
const NAMES = [['小明', 'Max'], ['小美', 'Mia'], ['阿傑', 'Jay'], ['欣怡', 'Emma'], ['志豪', 'Leo'], ['雅婷', 'Ava'], ['俊宏', 'Ben'], ['佳穎', 'Zoe']];
const who = (r) => r.pick(NAMES);
const svg = (w, h, body) => `<svg class="fig" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">${body}</svg>`;
const lab = (x, y, s, cls = 'f-txt', fs = 13) => `<text x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" text-anchor="middle" dominant-baseline="middle" class="${cls}" font-size="${fs}">${s}</text>`;
const numChoice = (r, v, spread = 5, ok = (w) => w >= 0) => ansChoice([num(v), ...near(r, v, 3, spread, ok).map(num)]);
// a stacked fraction whose parts are any text ("?", "3 × 4")
const fq = (n, d) => `<span class="fr"><span>${n}</span><span>${d}</span></span>`;
const fx = (x, d) => (+x).toFixed(d); // decimal shown with exactly d places (0.50)

// rays from one point (degrees, counterclockwise from the right) with labelled arcs [{a0, a1, label, acc}]
function angFig(rays, arcs, full = false) {
  const cx = 130, cy = full ? 110 : 112, R = full ? 90 : 100;
  const Pt = (a, rr) => [cx + rr * Math.cos((a * Math.PI) / 180), cy - rr * Math.sin((a * Math.PI) / 180)];
  let s = '';
  for (const a of rays) { const [x, y] = Pt(a, R); s += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="f-line" stroke-width="2"/>`; }
  for (const k of arcs) {
    const rr = k.r || 24, [x0, y0] = Pt(k.a0, rr), [x1, y1] = Pt(k.a1, rr), big = k.a1 - k.a0 > 180 ? 1 : 0;
    s += `<path d="M${x0.toFixed(1)},${y0.toFixed(1)} A${rr},${rr} 0 ${big} 0 ${x1.toFixed(1)},${y1.toFixed(1)}" fill="none" class="${k.acc ? 'f-acc' : 'f-line'}" stroke-width="1.5"/>`;
    const [lx, ly] = Pt((k.a0 + k.a1) / 2, rr + 24);
    s += lab(lx, ly, k.label, k.acc ? 'f-acctxt' : 'f-txt', 13);
  }
  s += `<circle cx="${cx}" cy="${cy}" r="3" class="f-dot"/>`;
  return svg(260, full ? 220 : 130, s);
}
// an L-shaped figure: a W×H rectangle with a cw×ch corner cut from the top right
function lShape(W, H, cw, ch, u) {
  const s = Math.min(170 / W, 120 / H), x0 = 40, y0 = 24;
  const X = (v) => +(x0 + v * s).toFixed(1), Y = (v) => +(y0 + v * s).toFixed(1);
  const pts = [[X(0), Y(0)], [X(W - cw), Y(0)], [X(W - cw), Y(ch)], [X(W), Y(ch)], [X(W), Y(H)], [X(0), Y(H)]];
  const labels = [
    { x: X(W / 2), y: Y(H) + 13, s: `${W} ${u}` }, { x: x0 - 20, y: Y(H / 2), s: `${H} ${u}` },
    { x: X((W - cw) / 2), y: y0 - 11, s: `${W - cw} ${u}` }, { x: X(W) + 22, y: Y(ch + (H - ch) / 2), s: `${H - ch} ${u}` },
  ];
  return shape(pts, labels, X(W) + 55, Y(H) + 28);
}
// a box (rectangular prism) drawn in oblique view with length / width / height labels
function box(lL, wL, hL) {
  const f = '30,140 170,140 170,70 30,70', top = '30,70 170,70 210,40 70,40', side = '170,140 210,110 210,40 170,70';
  return svg(250, 165, `<polygon points="${f}" class="f-soft"/><polygon points="${top}" class="f-soft"/><polygon points="${side}" class="f-soft"/>` +
    lab(100, 154, lL) + lab(14, 105, hL) + lab(218, 133, wL));
}
// a quadrant-I grid 0..n with points [{x, y, label}]
function gridQ1(n, pts) {
  const u = 24, pad = 26, S = n * u, X = (x) => pad + x * u, Y = (y) => pad + S - y * u;
  let s = '';
  for (let k = 0; k <= n; k++) s += `<line x1="${X(k)}" y1="${Y(0)}" x2="${X(k)}" y2="${Y(n)}" class="f-grid"/><line x1="${X(0)}" y1="${Y(k)}" x2="${X(n)}" y2="${Y(k)}" class="f-grid"/>`;
  s += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(n) + 8}" y2="${Y(0)}" class="f-line" stroke-width="1.5"/><line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(n) - 8}" class="f-line" stroke-width="1.5"/>`;
  for (let k = 0; k <= n; k++) s += lab(X(k), Y(0) + 13, k, 'f-txt', 10) + (k ? lab(X(0) - 12, Y(k), k, 'f-txt', 10) : '');
  s += lab(X(n) + 14, Y(0), 'x', 'f-txt', 12) + lab(X(0), Y(n) - 16, 'y', 'f-txt', 12);
  for (const p of pts) s += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="4.5" class="f-accfill"/>` + (p.label ? lab(X(p.x) + 11, Y(p.y) - 10, p.label, 'f-acctxt', 13) : '');
  return svg(S + 2 * pad + 10, S + 2 * pad, s);
}
// a 10 × 10 hundred grid with n squares shaded
function hundred(n) {
  let s = '';
  for (let k = 0; k < 100; k++) s += `<rect x="${2 + (k % 10) * 15}" y="${2 + Math.floor(k / 10) * 15}" width="15" height="15" class="${k < n ? 'f-accfill' : 'f-soft'}"/>`;
  return svg(154, 154, s);
}

// ---- number names ----
function zhNum(n) {
  if (!n) return '零';
  const D = '零一二三四五六七八九', U = ['千', '百', '十', ''], big = ['', '萬', '億', '兆'], groups = [];
  while (n > 0) { groups.unshift(n % 10000); n = Math.floor(n / 10000); }
  let s = '', zero = false;
  groups.forEach((g, i) => {
    const unit = big[groups.length - 1 - i];
    if (g === 0) { if (s) zero = true; return; }
    if (s && (zero || g < 1000)) s += '零';
    zero = false;
    const ds = String(g).padStart(4, '0'); let part = '', z = false, started = false;
    for (let k = 0; k < 4; k++) {
      const d = +ds[k];
      if (d === 0) { if (started) z = true; continue; }
      if (z) part += '零';
      z = false; started = true;
      part += d === 1 && k === 2 && !s && !part ? '十' : D[d] + U[k];
    }
    s += part + unit;
  });
  return s;
}
const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function en3(n) {
  let s = '';
  if (n >= 100) { s = ONES[Math.floor(n / 100)] + ' hundred'; n %= 100; if (n) s += ' '; }
  if (n >= 20) { s += TENS[Math.floor(n / 10)]; if (n % 10) s += '-' + ONES[n % 10]; } else if (n) s += ONES[n];
  return s;
}
function enWords(n) {
  if (!n) return 'zero';
  const u = ['', 'thousand', 'million', 'billion'], out = []; let i = 0;
  while (n > 0) { const g = n % 1000; if (g) out.unshift(en3(g) + (u[i] ? ' ' + u[i] : '')); n = Math.floor(n / 1000); i++; }
  return out.join(' ');
}
// long division, digit by digit: [[partial dividend, quotient digit, remainder] …]
function ldSteps(N, d) {
  const out = []; let cur = 0, started = false;
  for (const ch of String(N)) {
    cur = cur * 10 + +ch;
    if (!started && cur < d) continue;
    started = true; const qd = Math.floor(cur / d); out.push([cur, qd, cur - qd * d]); cur -= qd * d;
  }
  return out;
}
// prime factorization as HTML: 2³ × 3 × 5
function pfHtml(n) {
  const m = {}; for (const p of primeFactors(n)) m[p] = (m[p] || 0) + 1;
  return Object.keys(m).map((p) => (m[p] > 1 ? pow(p, m[p]) : p)).join(' × ');
}
const pfFlat = (n) => primeFactors(n).join(' × ');

// =====================================================================================
// GRADE 4
// =====================================================================================
const G4 = [
  {
    id: 'g4-mult-4x1',
    grade: 4,
    name: T('四位數乘以一位數', 'Multiplying a 4-digit number by a 1-digit number'),
    cur: { us: 'CCSS 4.NBT.B.5', tw: '四年級 整數的乘法', aops: 'Beast Academy 4' },
    gen(r) {
      const a = r.int(1012, 9876), b = r.int(3, 9), p = a * b, k = r.int(0, 2), [zn, en] = who(r);
      const parts = [Math.floor(a / 1000) * 1000, (Math.floor(a / 100) % 10) * 100, (Math.floor(a / 10) % 10) * 10, a % 10].filter((x) => x);
      const q = [
        T(`計算 ${num(a)} × ${b}。`, `Find ${num(a)} × ${b}.`),
        T(`一箱有 ${num(a)} 張貼紙，${zn}買了 ${b} 箱。一共有幾張貼紙？`, `One box holds ${num(a)} stickers. ${en} buys ${b} boxes. How many stickers are there in all?`),
        T(`一台腳踏車賣 ${num(a)} 元，學校買了 ${b} 台，一共要付幾元？`, `A bike costs $${num(a)}. The school buys ${b} bikes. How many dollars does it pay in all?`),
      ][k];
      const est = Math.round(a / 1000) * 1000;
      const sol = [];
      if (k) sol.push(T(`每一份一樣多、有 ${b} 份，所以用乘法：${num(a)} × ${b}。`, `There are ${b} equal groups of ${num(a)}, so multiply: ${num(a)} × ${b}.`));
      sol.push(
        T(`把 ${num(a)} 按照位值拆開：${parts.map(num).join(' + ')}。`, `Break ${num(a)} apart by place value: ${parts.map(num).join(' + ')}.`),
        T(`每一部分都乘以 ${b}：${parts.map((x) => `${num(x)} × ${b} = ${num(x * b)}`).join('，')}。`, `Multiply each part by ${b}: ${parts.map((x) => `${num(x)} × ${b} = ${num(x * b)}`).join(', ')}.`),
        T(`把結果加起來：${parts.map((x) => num(x * b)).join(' + ')} = ${num(p)}。`, `Add the results: ${parts.map((x) => num(x * b)).join(' + ')} = ${num(p)}.`),
        T(`估算檢查：${num(a)} 大約是 ${num(est)}，${num(est)} × ${b} = ${num(est * b)}，和 ${num(p)} 很接近，答案合理。`, `Estimate to check: ${num(a)} is about ${num(est)}, and ${num(est)} × ${b} = ${num(est * b)}, close to ${num(p)}. The answer makes sense.`),
      );
      return { q, ans: ansNum(p), sol, hint: T('把千位、百位、十位、個位分開乘，再加起來。', 'Multiply the thousands, hundreds, tens and ones separately, then add.') };
    },
  },
  {
    id: 'g4-mult-2x2',
    grade: 4,
    name: T('二位數乘以二位數', 'Multiplying two 2-digit numbers'),
    cur: { us: 'CCSS 4.NBT.B.5', tw: '四年級 整數的乘法', aops: 'Beast Academy 4' },
    gen(r) {
      let a, b; do { a = r.int(12, 99); b = r.int(12, 99); } while (a % 10 === 0 || b % 10 === 0);
      const tens = b - (b % 10), ones = b % 10, p = a * b, k = r.int(0, 3), [zn, en] = who(r);
      const q = [
        T(`計算 ${a} × ${b}。`, `Find ${a} × ${b}.`),
        T(`禮堂有 ${b} 排椅子，每排 ${a} 張。禮堂一共有幾張椅子？`, `A hall has ${b} rows of chairs with ${a} chairs in each row. How many chairs are there?`),
        T(`${zn}每天跳繩 ${a} 下，連續跳了 ${b} 天，一共跳了幾下？`, `${en} jumps rope ${a} times every day for ${b} days. How many jumps in all?`),
        T(`一盒鉛筆 ${a} 元，老師買了 ${b} 盒，要付幾元？`, `A box of pencils costs $${a}. The teacher buys ${b} boxes. How many dollars is that?`),
      ][k];
      return {
        q, fig: k === 0 ? rect(`${tens} + ${ones}`, `${a}`, 170, 70) : '', ans: ansNum(p),
        sol: [
          T(`把 ${b} 拆成 ${tens} + ${ones}，分成兩次乘。`, `Split ${b} into ${tens} + ${ones} and multiply in two parts.`),
          T(`${a} × ${tens} = ${num(a * tens)}（先算 ${a} × ${tens / 10} = ${a * (tens / 10)}，再補一個 0）。`, `${a} × ${tens} = ${num(a * tens)} (first ${a} × ${tens / 10} = ${a * (tens / 10)}, then add a 0 because it is tens).`),
          T(`${a} × ${ones} = ${num(a * ones)}。`, `${a} × ${ones} = ${num(a * ones)}.`),
          T(`相加：${num(a * tens)} + ${num(a * ones)} = ${num(p)}。`, `Add: ${num(a * tens)} + ${num(a * ones)} = ${num(p)}.`),
          T(`估算：${Math.round(a / 10) * 10} × ${Math.round(b / 10) * 10} = ${num(Math.round(a / 10) * 10 * Math.round(b / 10) * 10)}，和 ${num(p)} 接近。`, `Estimate: ${Math.round(a / 10) * 10} × ${Math.round(b / 10) * 10} = ${num(Math.round(a / 10) * 10 * Math.round(b / 10) * 10)}, close to ${num(p)}.`),
        ],
        hint: T(`把 ${b} 拆成十位和個位。`, `Split ${b} into tens and ones.`),
      };
    },
  },
  {
    id: 'g4-long-div',
    grade: 4,
    name: T('除法與餘數', 'Long division with remainders'),
    cur: { us: 'CCSS 4.NBT.B.6', tw: '四年級 整數的除法', aops: 'Beast Academy 4' },
    gen(r) {
      const two = r.chance(0.3), d = two ? r.int(11, 25) : r.int(3, 9), qq = two ? r.int(12, 60) : r.int(102, 999);
      const rm = r.int(1, d - 1), N = d * qq + rm, k = r.int(0, 3), [zn, en] = who(r);
      const steps = ldSteps(N, d);
      const ld = T(`直式除法，從最高位開始：${steps.map(([c, qd, rr]) => `${c} ÷ ${d} 商 ${qd} 餘 ${rr}`).join('；')}。`,
        `Long division from the left: ${steps.map(([c, qd, rr]) => `${c} ÷ ${d} = ${qd} R${rr}`).join('; ')}.`);
      const res = T(`所以 ${num(N)} ÷ ${d} = ${qq} … ${rm}（商 ${qq}，餘數 ${rm}）。餘數 ${rm} 比除數 ${d} 小，算完了。`, `So ${num(N)} ÷ ${d} = ${qq} R ${rm} (quotient ${qq}, remainder ${rm}). The remainder ${rm} is less than ${d}, so we are done.`);
      const chk = T(`驗算：${d} × ${qq} + ${rm} = ${num(d * qq)} + ${rm} = ${num(N)} ✓`, `Check: ${d} × ${qq} + ${rm} = ${num(d * qq)} + ${rm} = ${num(N)} ✓`);
      if (k === 0) return { q: T(`${num(N)} ÷ ${d} 的商是多少？（只填商）`, `What is the quotient of ${num(N)} ÷ ${d}? (Quotient only.)`), ans: ansNum(qq), sol: [ld, res, chk] };
      if (k === 1) return { q: T(`${num(N)} ÷ ${d} 的餘數是多少？`, `What is the remainder when ${num(N)} is divided by ${d}?`), ans: ansNum(rm), sol: [ld, res, chk] };
      if (k === 2) return {
        q: T(`有 ${num(N)} 位學生去校外教學，每台車最多坐 ${d} 人。至少要幾台車？`, `${num(N)} students go on a field trip. Each van holds at most ${d} people. How many vans are needed at least?`),
        ans: ansNum(qq + 1),
        sol: [T(`要知道 ${num(N)} 裡有幾個 ${d}，用除法 ${num(N)} ÷ ${d}。`, `To find how many groups of ${d} fit in ${num(N)}, divide ${num(N)} ÷ ${d}.`), ld, res,
          T(`坐滿 ${qq} 台車後還剩 ${rm} 人，他們也要坐車，所以要再多 1 台：${qq} + 1 = ${qq + 1} 台。`, `After ${qq} full vans, ${rm} people are left. They need a van too, so add 1: ${qq} + 1 = ${qq + 1} vans.`)],
        hint: T('剩下的人也要有車坐喔！', "Don't forget the people left over!"),
      };
      return {
        q: T(`${zn}把 ${num(N)} 顆彈珠平分給 ${d} 個朋友，每人分得一樣多且盡量多。最後剩下幾顆？`, `${en} shares ${num(N)} marbles equally among ${d} friends, giving each as many as possible. How many marbles are left over?`),
        ans: ansNum(rm), sol: [T(`平分就是除法：${num(N)} ÷ ${d}。`, `Sharing equally means dividing: ${num(N)} ÷ ${d}.`), ld, res, T(`每人 ${qq} 顆，剩下 ${rm} 顆。`, `Each friend gets ${qq}, and ${rm} are left over.`)],
      };
    },
  },
  {
    id: 'g4-factors-multiples',
    grade: 4,
    name: T('因數與倍數', 'Factors and multiples'),
    cur: { us: 'CCSS 4.OA.B.4', tw: '四年級 因數與倍數', aops: 'Beast Academy 4' },
    at: { tw: 5 },
    gen(r) {
      const k = r.int(0, 3);
      const N = r.pick([12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48, 50, 54, 56, 60, 63, 64, 72, 80, 84, 90, 96, 100]);
      const fs = factors(N), prs = fs.filter((x) => x * x <= N).map((x) => `${x} × ${N / x}`);
      const pairStep = T(`成對找因數（兩個數相乘等於 ${N}）：${prs.join('、')}。`, `Find factor pairs (two numbers that multiply to ${N}): ${prs.join(', ')}.`);
      if (k === 0) return {
        q: T(`${N} 有幾個因數？`, `How many factors does ${N} have?`), ans: ansNum(fs.length),
        sol: [T(`因數就是可以整除 ${N} 的數。從 1 開始一個一個試。`, `A factor of ${N} divides ${N} with no remainder. Try 1, 2, 3, … in order.`), pairStep,
          T(`所有因數：${fs.join('、')}。`, `All the factors: ${fs.join(', ')}.`),
          T(`數一數，共有 ${fs.length} 個。${Number.isInteger(Math.sqrt(N)) ? `（${Math.sqrt(N)} × ${Math.sqrt(N)} 只算一次）` : ''}`, `Count them: ${fs.length} factors.${Number.isInteger(Math.sqrt(N)) ? ` (${Math.sqrt(N)} × ${Math.sqrt(N)} counts only once.)` : ''}`)],
        hint: T('因數是成對出現的。', 'Factors come in pairs.'),
      };
      if (k === 1) {
        const good = r.pick(fs.filter((x) => x > 1 && x < N)), nonf = range(2, N - 1).filter((x) => N % x);
        const wr = r.sample(nonf, 3);
        return {
          q: T(`下面哪一個是 ${N} 的因數？`, `Which of these is a factor of ${N}?`), ans: ansChoice([num(good), ...wr.map(num)]),
          sol: [T(`看哪一個數能把 ${N} 整除（沒有餘數）。`, `Look for the number that divides ${N} with no remainder.`),
            T(`${N} ÷ ${good} = ${N / good}，剛好整除，所以 ${good} 是因數。`, `${N} ÷ ${good} = ${N / good} exactly, so ${good} is a factor.`),
            T(`其他的都有餘數：${wr.map((w) => `${N} ÷ ${w} = ${Math.floor(N / w)} … ${N % w}`).join('；')}。`, `The others leave remainders: ${wr.map((w) => `${N} ÷ ${w} = ${Math.floor(N / w)} R ${N % w}`).join('; ')}.`)],
        };
      }
      if (k === 2) {
        const a = r.int(3, 12), M = r.int(40, 150), c = Math.floor(M / a);
        return {
          q: T(`從 1 到 ${M}，有幾個數是 ${a} 的倍數？`, `How many multiples of ${a} are there from 1 to ${M}?`), ans: ansNum(c),
          sol: [T(`${a} 的倍數是 ${a} × 1、${a} × 2、${a} × 3、……`, `The multiples of ${a} are ${a} × 1, ${a} × 2, ${a} × 3, …`),
            T(`看最多能乘到幾還不超過 ${M}：${M} ÷ ${a} = ${c} … ${M % a}。`, `See how far we can go without passing ${M}: ${M} ÷ ${a} = ${c} R ${M % a}.`),
            T(`${a} × ${c} = ${a * c} ≤ ${M}，但 ${a} × ${c + 1} = ${a * (c + 1)} 太大了。所以共有 ${c} 個。`, `${a} × ${c} = ${a * c} ≤ ${M}, but ${a} × ${c + 1} = ${a * (c + 1)} is too big. So there are ${c} multiples.`)],
        };
      }
      const a = r.int(6, 19), M = r.int(50, 200), m = (Math.floor(M / a) + 1) * a;
      return {
        q: T(`比 ${M} 大的數中，最小的 ${a} 的倍數是多少？`, `What is the smallest multiple of ${a} that is greater than ${M}?`), ans: ansNum(m),
        sol: [T(`先算 ${M} ÷ ${a} = ${Math.floor(M / a)} … ${M % a}。`, `First ${M} ÷ ${a} = ${Math.floor(M / a)} R ${M % a}.`),
          T(`所以 ${a} × ${Math.floor(M / a)} = ${Math.floor(M / a) * a}，還不比 ${M} 大。`, `So ${a} × ${Math.floor(M / a)} = ${Math.floor(M / a) * a}, which is not greater than ${M}.`),
          T(`下一個倍數：${a} × ${Math.floor(M / a) + 1} = ${m}，這就是答案。`, `The next multiple is ${a} × ${Math.floor(M / a) + 1} = ${m}. That is the answer.`)],
      };
    },
  },
  {
    id: 'g4-prime-composite',
    grade: 4,
    name: T('質數與合數', 'Prime and composite numbers'),
    cur: { us: 'CCSS 4.OA.B.4', tw: '六年級 質數與質因數分解', aops: 'Beast Academy 4' },
    at: { tw: 6 },
    gen(r) {
      const k = r.int(0, 3), primes = range(11, 97).filter(isPrime);
      const comps = [21, 27, 33, 39, 49, 51, 57, 63, 69, 77, 81, 87, 91, 93, 99];
      const split = (c) => { const p = primeFactors(c)[0]; return `${c} = ${p} × ${c / p}`; };
      const def = T('質數：剛好只有 1 和自己兩個因數。合數：有超過兩個因數。1 兩者都不是。', 'A prime has exactly two factors: 1 and itself. A composite number has more than two factors. 1 is neither.');
      if (k === 0) {
        const p = r.pick(primes), w = r.sample(comps, 3);
        return {
          q: T('下面哪一個是質數？', 'Which of these is a prime number?'), ans: ansChoice([num(p), ...w.map(num)]),
          sol: [def, T(`其他三個都能拆成兩個較小的數相乘：${w.map(split).join('；')}，所以是合數。`, `The other three can be written as a product of smaller numbers: ${w.map(split).join('; ')}. They are composite.`),
            T(`${p} 不能被 2、3、5、7 整除（而 ${p} < 100，試到 7 就夠了），所以 ${p} 是質數。`, `${p} is not divisible by 2, 3, 5 or 7 (for numbers under 100, testing up to 7 is enough), so ${p} is prime.`)],
          hint: T('奇數不一定是質數，例如 51 = 3 × 17。', 'Odd does not mean prime: 51 = 3 × 17.'),
        };
      }
      if (k === 1) {
        const c = r.pick(comps.concat([4, 6, 8, 9, 10, 12, 14, 15, 25, 35])), w = r.sample(primes.concat([2, 3, 5, 7]), 3);
        return {
          q: T('下面哪一個是合數？', 'Which of these is a composite number?'), ans: ansChoice([num(c), ...w.map(num)]),
          sol: [def, T(`${split(c)}，所以 ${c} 除了 1 和自己還有別的因數，是合數。`, `${split(c)}, so ${c} has a factor other than 1 and itself. It is composite.`),
            T(`${w.join('、')} 都只有 1 和自己兩個因數，是質數。`, `${w.join(', ')} have only two factors each, so they are prime.`)],
        };
      }
      if (k === 2) {
        const a = r.int(1, 50), b = a + r.int(10, 20), ps = range(a, b).filter(isPrime);
        return {
          q: T(`從 ${a} 到 ${b}（包含 ${a} 和 ${b}），有幾個質數？`, `How many prime numbers are there from ${a} to ${b} (including ${a} and ${b})?`), ans: ansNum(ps.length),
          sol: [def, T('先刪掉雙數（2 除外）和 5 的倍數，再檢查剩下的能不能被 3 或 7 整除。', 'Cross out even numbers (except 2) and multiples of 5, then test the rest for 3 and 7.'),
            T(`剩下的質數：${ps.length ? ps.join('、') : '沒有'}。`, `The primes left: ${ps.length ? ps.join(', ') : 'none'}.`),
            T(`共有 ${ps.length} 個。`, `That is ${ps.length} primes.`)],
        };
      }
      const N = r.int(1, 60), fs = factors(N);
      const right = N === 1 ? T('都不是', 'Neither') : isPrime(N) ? T('質數', 'Prime') : T('合數', 'Composite');
      const all = [T('質數', 'Prime'), T('合數', 'Composite'), T('都不是', 'Neither')].filter((o) => o.en !== right.en);
      return {
        q: T(`${N} 是質數、合數，還是都不是？`, `Is ${N} prime, composite, or neither?`), ans: ansChoice([right, ...all]),
        sol: [def, T(`${N} 的因數有：${fs.join('、')}，共 ${fs.length} 個。`, `The factors of ${N} are ${fs.join(', ')}: ${fs.length} of them.`),
          T(`所以 ${N} 是${right.zh}。`, `So ${N} is ${right.en.toLowerCase()}.`)],
      };
    },
  },
  {
    id: 'g4-large-numbers',
    grade: 4,
    name: T('大數的位值（萬、億）', 'Place value of large numbers'),
    cur: { us: 'CCSS 4.NBT.A.2', tw: '四年級 億以內的數', aops: 'Beast Academy 4' },
    gen(r) {
      const k = r.int(0, 3), len = r.int(7, 10);
      const ds = [r.int(1, 9)]; for (let i = 1; i < len; i++) ds.push(r.chance(0.35) ? 0 : r.int(1, 9));
      const n = +ds.join('');
      const PZ = ['個位', '十位', '百位', '千位', '萬位', '十萬位', '百萬位', '千萬位', '億位', '十億位'];
      const PE = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands', 'millions', 'ten millions', 'hundred millions', 'billions'];
      if (k === 0) {
        const cand = range(4, len - 1).filter((p) => ds[len - 1 - p] !== 0), p = r.pick(cand), d = ds[len - 1 - p], v = d * 10 ** p;
        const shown = ds.map((x, i) => { const pos = len - 1 - i; return (i && (pos + 1) % 3 === 0 ? ',' : '') + (pos === p ? `<u><b>${x}</b></u>` : x); }).join('');
        return {
          q: T(`在 ${shown} 中，畫底線的數字 ${d} 代表多少？`, `In ${shown}, what is the value of the underlined digit ${d}?`), ans: ansNum(v),
          sol: [T('台灣用「四位一節」來讀：個、十、百、千｜萬、十萬、百萬、千萬｜億、十億。', 'In English we read in groups of three: ones, thousands, millions, billions.'),
            T(`從個位往左數，底線的 ${d} 在第 ${p + 1} 位，是「${PZ[p]}」。`, `Counting from the ones digit to the left, the underlined ${d} is in place ${p + 1}: the ${PE[p]} place.`),
            T(`所以它代表 ${d} 個 ${num(10 ** p)}，也就是 ${num(v)}。`, `So it stands for ${d} × ${num(10 ** p)} = ${num(v)}.`)],
        };
      }
      if (k === 1) {
        const g8 = Math.floor(n / 1e8), g4 = Math.floor(n / 1e4) % 1e4, g0 = n % 1e4;
        const zhParts = (g8 ? `${g8} 億 ` : '') + `${g8 ? String(g4).padStart(4, '0') : g4} 萬 ${String(g0).padStart(4, '0')}`;
        return {
          q: T(`把「${zhNum(n)}」寫成數字。`, `Write "${enWords(n)}" as a number.`), ans: ansNum(n),
          sol: [T('把數字分成「億、萬、個」三節，每節（除了最前面）都要寫滿四位，空的位要補 0。', 'Split the words at "billion", "million" and "thousand". Each group (except the first) must have 3 digits; fill empty places with 0.'),
            T(`分節：${zhParts}。`, `Groups: ${n.toLocaleString('en-US').split(',').join(' | ')}.`),
            T(`合起來寫成 ${num(n)}。`, `Put together: ${num(n)}.`)],
          hint: T('「零」表示中間有空位，要補 0。', 'Every group after the first needs exactly 3 digits.'),
        };
      }
      const units = [[1e4, '一萬', 'ten thousand', 10000], [1e6, '一百萬', 'one million', 1000000], [1e8, '一億', 'one hundred million', 100000000]];
      const [u, uz, ue] = r.pick(units);
      if (k === 2) {
        const m = r.int(12, 999);
        return {
          q: T(`${m} 個${uz}是多少？`, `What is ${m} groups of ${ue} (${m} × ${num(u)})?`), ans: ansNum(m * u),
          sol: [T(`${uz} = ${num(u)}，後面有 ${Math.log10(u)} 個 0。`, `${ue[0].toUpperCase() + ue.slice(1)} = ${num(u)}, which has ${Math.log10(u)} zeros.`),
            T(`${m} 個${uz}，就是在 ${m} 後面補上 ${Math.log10(u)} 個 0。`, `${m} of them: write ${m} and add ${Math.log10(u)} zeros.`),
            T(`答案：${num(m * u)}。`, `Answer: ${num(m * u)}.`)],
        };
      }
      const plus = r.chance(0.5) || n < u * 2, v = plus ? n + u : n - u;
      return {
        q: T(`比 ${num(n)} ${plus ? '多' : '少'}${uz}的數是多少？`, `What number is ${ue} ${plus ? 'more' : 'less'} than ${num(n)}?`), ans: ansNum(v),
        sol: [T(`${uz} = ${num(u)}，只會改變「${PZ[Math.log10(u)]}」和它左邊的位。`, `${ue[0].toUpperCase() + ue.slice(1)} = ${num(u)}; only the ${PE[Math.log10(u)]} place (and maybe places to its left) changes.`),
          T(`${num(n)} ${plus ? '+' : '−'} ${num(u)} = ${num(v)}。`, `${num(n)} ${plus ? '+' : '−'} ${num(u)} = ${num(v)}.`),
          T(`看看${PZ[Math.log10(u)]}：${plus ? '多了 1' : '少了 1'}${(plus && Math.floor(n / u) % 10 === 9) || (!plus && Math.floor(n / u) % 10 === 0) ? '，而且要' + (plus ? '進位' : '退位') : ''}。`, `Look at the ${PE[Math.log10(u)]} digit: it goes ${plus ? 'up' : 'down'} by 1${(plus && Math.floor(n / u) % 10 === 9) || (!plus && Math.floor(n / u) % 10 === 0) ? ', with ' + (plus ? 'a carry' : 'a borrow') : ''}.`)],
      };
    },
  },
  {
    id: 'g4-rounding',
    grade: 4,
    name: T('概數與四捨五入', 'Rounding and estimating'),
    cur: { us: 'CCSS 4.NBT.A.3', tw: '四年級 概數', aops: 'Beast Academy 4' },
    gen(r) {
      const k = r.int(0, 3);
      const PL = [[10, '十位', 'ten', '個位', 'ones'], [100, '百位', 'hundred', '十位', 'tens'], [1000, '千位', 'thousand', '百位', 'hundreds'], [10000, '萬位', 'ten thousand', '千位', 'thousands']];
      if (k === 3) {
        const a = r.int(110, 989), b = r.int(110, 989), ra = Math.round(a / 100) * 100, rb = Math.round(b / 100) * 100;
        return {
          q: T(`先把 ${a} 和 ${b} 用四捨五入法取到百位，再估算它們的和。估算的和是多少？`, `Round ${a} and ${b} to the nearest hundred, then add to estimate their sum. What is the estimate?`), ans: ansNum(ra + rb),
          sol: [T(`${a}：十位是 ${Math.floor(a / 10) % 10}，${Math.floor(a / 10) % 10 >= 5 ? '≥ 5 進位' : '< 5 捨去'}，約 ${ra}。`, `${a}: the tens digit is ${Math.floor(a / 10) % 10}, so round ${Math.floor(a / 10) % 10 >= 5 ? 'up' : 'down'} to ${ra}.`),
            T(`${b}：十位是 ${Math.floor(b / 10) % 10}，${Math.floor(b / 10) % 10 >= 5 ? '≥ 5 進位' : '< 5 捨去'}，約 ${rb}。`, `${b}: the tens digit is ${Math.floor(b / 10) % 10}, so round ${Math.floor(b / 10) % 10 >= 5 ? 'up' : 'down'} to ${rb}.`),
            T(`估算：${ra} + ${rb} = ${num(ra + rb)}。（真正的和是 ${num(a + b)}，很接近！）`, `Estimate: ${ra} + ${rb} = ${num(ra + rb)}. (The exact sum is ${num(a + b)}, quite close!)`)],
        };
      }
      const [pv, pz, pe, lz, le] = r.pick(PL);
      let n; do n = r.int(pv * 10 + 1, pv * 1000 - 1); while (n % pv === 0);
      const dig = Math.floor(n / (pv / 10)) % 10, lo = Math.floor(n / pv) * pv, hi = lo + pv;
      const ansV = k === 0 ? (dig >= 5 ? hi : lo) : k === 1 ? hi : lo;
      const q = [
        T(`用四捨五入法，把 ${num(n)} 取概數到${pz}。`, `Round ${num(n)} to the nearest ${pe}.`),
        T(`用無條件進入法，把 ${num(n)} 取概數到${pz}。`, `Round ${num(n)} UP to the ${pe}s place (any leftover makes it go up).`),
        T(`用無條件捨去法，把 ${num(n)} 取概數到${pz}。`, `Round ${num(n)} DOWN to the ${pe}s place (drop everything after it).`),
      ][k];
      const sol = [T(`${num(n)} 在 ${num(lo)} 和 ${num(hi)} 之間。`, `${num(n)} is between ${num(lo)} and ${num(hi)}.`)];
      if (k === 0) sol.push(T(`看${pz}右邊一位（${lz}）的數字：${dig}。${dig >= 5 ? '5 以上要進位' : '4 以下要捨去'}。`, `Look at the digit just right of the ${pe}s place (the ${le} digit): ${dig}. ${dig >= 5 ? '5 or more rounds up' : '4 or less rounds down'}.`));
      if (k === 1) sol.push(T(`無條件進入：${pz}後面只要不是全部為 0，就一律進位。`, `Rounding up: if anything after the ${pe}s place is not zero, always go up.`));
      if (k === 2) sol.push(T(`無條件捨去：${pz}後面的數字一律變成 0。`, `Rounding down: every digit after the ${pe}s place becomes 0.`));
      sol.push(T(`所以答案是 ${num(ansV)}。`, `So the answer is ${num(ansV)}.`));
      return { q, ans: ansNum(ansV), sol };
    },
  },
  {
    id: 'g4-equiv-frac',
    grade: 4,
    name: T('等值分數與約分', 'Equivalent fractions'),
    cur: { us: 'CCSS 4.NF.A.1', tw: '四年級 等值分數', aops: 'Beast Academy 4' },
    gen(r) {
      let a, b; do { b = r.int(2, 10); a = r.int(1, b - 1); } while (gcd(a, b) > 1);
      const m = r.int(2, 6), A = a * m, B = b * m, k = r.int(0, 3);
      const why = T(`分子和分母同時乘以（或除以）同一個數，分數的大小不變——就像把每一塊再切成 ${m} 小塊。`, `Multiplying (or dividing) the top and bottom by the same number keeps the fraction's value — like cutting every piece into ${m} smaller pieces.`);
      const fig = B <= 30 ? fracBar(a, b, 240) + fracBar(A, B, 240) : '';
      if (k === 0) return {
        q: T(`${frac(a, b)} = ${fq('?', B)}，? 是多少？`, `${frac(a, b)} = ${fq('?', B)}. What is ?`), fig, ans: ansNum(A),
        sol: [T(`分母從 ${b} 變成 ${B}：${b} × ${m} = ${B}。`, `The denominator went from ${b} to ${B}: ${b} × ${m} = ${B}.`), why, T(`分子也要乘 ${m}：${a} × ${m} = ${A}。`, `So multiply the numerator by ${m} too: ${a} × ${m} = ${A}.`)],
      };
      if (k === 1) return {
        q: T(`${frac(a, b)} = ${fq(A, '?')}，? 是多少？`, `${frac(a, b)} = ${fq(A, '?')}. What is ?`), fig, ans: ansNum(B),
        sol: [T(`分子從 ${a} 變成 ${A}：${a} × ${m} = ${A}。`, `The numerator went from ${a} to ${A}: ${a} × ${m} = ${A}.`), why, T(`分母也要乘 ${m}：${b} × ${m} = ${B}。`, `So multiply the denominator by ${m} too: ${b} × ${m} = ${B}.`)],
      };
      if (k === 2) return {
        q: T(`把 ${frac(A, B)} 約分成最簡分數。`, `Write ${frac(A, B)} in lowest terms.`), fig, ans: ansFrac(a, b),
        sol: [T(`找 ${A} 和 ${B} 的最大公因數：${m}。`, `Find the greatest common factor of ${A} and ${B}: ${m}.`), why,
          T(`分子分母都除以 ${m}：${A} ÷ ${m} = ${a}，${B} ÷ ${m} = ${b}。`, `Divide both by ${m}: ${A} ÷ ${m} = ${a}, ${B} ÷ ${m} = ${b}.`),
          T(`${a} 和 ${b} 除了 1 沒有公因數了，所以 ${frac(a, b)} 是最簡分數。`, `${a} and ${b} share no factor except 1, so ${frac(a, b)} is in lowest terms.`)],
      };
      const wrongs = uniq([[a + m, b + m], [A, B + 1], [a * m, b], [a + 1, b + 1], [A + 1, B]].filter(([x, y]) => x * b !== y * a && x > 0 && x !== y), 3);
      return {
        q: T(`哪一個分數和 ${frac(a, b)} 一樣大？`, `Which fraction is equal to ${frac(a, b)}?`), ans: ansChoice([frac(A, B), ...wrongs.map(([x, y]) => frac(x, y))]),
        sol: [why, T(`${frac(a, b)} 的分子分母同乘 ${m}：${frac(a, b)} = ${frac(A, B)}。`, `Multiply the top and bottom of ${frac(a, b)} by ${m}: ${frac(a, b)} = ${frac(A, B)}.`),
          T(`注意：分子分母同時「加」一樣的數，大小會改變，不是等值分數。`, `Careful: ADDING the same number to the top and bottom changes the value, so that does not make an equivalent fraction.`)],
      };
    },
  },
  {
    id: 'g4-frac-compare',
    grade: 4,
    name: T('分數比大小', 'Comparing fractions'),
    cur: { us: 'CCSS 4.NF.A.2', tw: '四年級 分數的大小比較', aops: 'Beast Academy 4' },
    gen(r) {
      const k = r.int(0, 3);
      if (k === 3) {
        let fs; do { fs = [0, 1, 2].map(() => { const d = r.pick([2, 3, 4, 6, 8, 12]); return [r.int(1, d - 1), d]; }); } while (new Set(fs.map(([n, d]) => n / d)).size < 3);
        const L = fs.reduce((s, f) => lcm(s, f[1]), 1), big = fs.reduce((m, f) => (f[0] / f[1] > m[0] / m[1] ? f : m));
        return {
          q: T(`${fs.map((f) => frac(...f)).join('、')} 中，哪一個最大？`, `Which is the largest: ${fs.map((f) => frac(...f)).join(', ')}?`),
          ans: ansChoice([frac(...big), ...fs.filter((f) => f !== big).map((f) => frac(...f))]),
          sol: [T(`通分成分母 ${L}（${fs.map((f) => f[1]).join('、')} 的最小公倍數）。`, `Rewrite all with denominator ${L} (the least common multiple of ${fs.map((f) => f[1]).join(', ')}).`),
            T(fs.map(([n, d]) => `${frac(n, d)} = ${frac(n * (L / d), L)}`).join('，'), fs.map(([n, d]) => `${frac(n, d)} = ${frac(n * (L / d), L)}`).join(', ')),
            T(`分母一樣時，分子越大越大，所以 ${frac(...big)} 最大。`, `With the same denominator, the bigger numerator wins, so ${frac(...big)} is the largest.`)],
        };
      }
      let a, b, c, d;
      if (k === 0) { b = d = r.int(3, 12); a = r.int(1, b - 1); do c = r.int(1, d - 1); while (c === a); }
      else if (k === 1) { a = c = r.int(1, 5); b = r.int(a + 1, 12); do d = r.int(a + 1, 12); while (d === b); }
      else {
        b = r.int(2, 9); do d = r.int(2, 9); while (d === b);
        a = r.int(1, b - 1); c = r.int(1, d - 1);
        if (r.chance(0.2)) { const m = r.int(2, 3); [c, d] = [a * m, b * m]; }
      }
      const L = a * d, Rr = c * b, sym = L > Rr ? '&gt;' : L < Rr ? '&lt;' : '=';
      const opts = ['&gt;', '&lt;', '='];
      const sol = [];
      if (k === 0) sol.push(T(`分母一樣都是 ${b}，代表每一塊一樣大。`, `Both denominators are ${b}, so the pieces are the same size.`), T(`比分子：${a} ${sym} ${c}，塊數多的比較大。`, `Compare the numerators: ${a} ${sym} ${c}. More pieces means more.`));
      else if (k === 1) sol.push(T(`分子一樣都是 ${a}，代表塊數一樣多。`, `Both numerators are ${a}, so we have the same number of pieces.`), T(`分母越大，每一塊越小（切得越多塊）。${b} ${b < d ? '&lt;' : '&gt;'} ${d}，所以 ${frac(a, b < d ? b : d)} 的每一塊比較大。`, `A bigger denominator means smaller pieces. ${b} ${b < d ? '&lt;' : '&gt;'} ${d}, so the pieces of ${frac(a, b < d ? b : d)} are bigger.`));
      else {
        const M = lcm(b, d);
        sol.push(T(`分母不同，先通分成 ${M}：${frac(a, b)} = ${frac(a * (M / b), M)}，${frac(c, d)} = ${frac(c * (M / d), M)}。`, `Different denominators: rewrite both over ${M}: ${frac(a, b)} = ${frac(a * (M / b), M)}, ${frac(c, d)} = ${frac(c * (M / d), M)}.`),
          T(`比分子：${a * (M / b)} ${sym} ${c * (M / d)}。`, `Compare numerators: ${a * (M / b)} ${sym} ${c * (M / d)}.`));
      }
      sol.push(T(`所以 ${frac(a, b)} ${sym} ${frac(c, d)}。`, `So ${frac(a, b)} ${sym} ${frac(c, d)}.`));
      return {
        q: T(`在 ○ 裡填入 &gt;、&lt; 或 =：${frac(a, b)} ○ ${frac(c, d)}`, `Fill in &gt;, &lt; or =: ${frac(a, b)} ○ ${frac(c, d)}`),
        fig: fracBar(a, b, 240) + fracBar(c, d, 240), ans: ansChoice([sym, ...opts.filter((o) => o !== sym)]), sol,
      };
    },
  },
  {
    id: 'g4-frac-like-addsub',
    grade: 4,
    name: T('同分母分數加減', 'Adding and subtracting fractions with like denominators'),
    cur: { us: 'CCSS 4.NF.B.3', tw: '四年級 同分母分數的加減', aops: 'Beast Academy 4' },
    gen(r) {
      const d = r.int(3, 12), k = r.int(0, 4), [zn, en] = who(r);
      const form = T('（用最簡分數或帶分數回答）', '(Answer as a fraction or mixed number in lowest terms.)');
      let A, B, sub, showA, showB, q;
      if (k <= 2) {
        sub = k === 1; A = r.int(sub ? 2 : 1, d - 1); B = r.int(1, sub ? A - 1 : d - 1);
        showA = frac(A, d); showB = frac(B, d);
      } else {
        sub = k === 4; const w1 = r.int(2, 5), w2 = r.int(1, sub ? w1 - 1 : 4), a = r.int(1, d - 1), c = r.int(1, d - 1);
        A = w1 * d + a; B = w2 * d + c; showA = `${w1}${frac(a, d)}`; showB = `${w2}${frac(c, d)}`;
      }
      const R = sub ? A - B : A + B, [n, m] = red(R, d);
      if (k === 2) q = T(`一個披薩切成 ${d} 片一樣大。${zn}吃了 ${A} 片，弟弟吃了 ${B} 片，兩人一共吃了幾個披薩？${form.zh}`, `A pizza is cut into ${d} equal slices. ${en} eats ${A} slices and a brother eats ${B} slices. What part of a pizza did they eat together? ${form.en}`);
      else q = T(`計算 ${showA} ${sub ? '−' : '+'} ${showB}。${form.zh}`, `Find ${showA} ${sub ? '−' : '+'} ${showB}. ${form.en}`);
      const sol = [];
      if (k === 2) sol.push(T(`每一片是 ${frac(1, d)} 個披薩，所以是 ${frac(A, d)} + ${frac(B, d)}。`, `Each slice is ${frac(1, d)} of a pizza, so we add ${frac(A, d)} + ${frac(B, d)}.`));
      if (k >= 3) sol.push(T(`先把帶分數化成假分數：${showA} = ${frac(A, d)}，${showB} = ${frac(B, d)}。`, `Change the mixed numbers to improper fractions: ${showA} = ${frac(A, d)}, ${showB} = ${frac(B, d)}.`));
      sol.push(T(`分母一樣（都是 ${d}），每一塊一樣大，只要把分子${sub ? '相減' : '相加'}，分母不變：${A} ${sub ? '−' : '+'} ${B} = ${R}。`, `The denominators are the same (${d}), so the pieces are the same size: just ${sub ? 'subtract' : 'add'} the numerators and keep the denominator: ${A} ${sub ? '−' : '+'} ${B} = ${R}.`));
      sol.push(T(`得到 ${frac(R, d)}${m !== d ? `，約分成 ${fracR(n, m)}` : ''}${n > m && m > 1 ? `，也就是 ${mixed(n, m)}` : ''}。`, `We get ${frac(R, d)}${m !== d ? `, which reduces to ${fracR(n, m)}` : ''}${n > m && m > 1 ? `, that is ${mixed(n, m)}` : ''}.`));
      if (sub) sol.push(T(`驗算：${fracR(n, m)} + ${frac(B, d)} = ${frac(A, d)} ✓`, `Check: ${fracR(n, m)} + ${frac(B, d)} = ${frac(A, d)} ✓`));
      return { q, fig: k <= 2 && !sub ? fracBar(A, d, 240) + fracBar(B, d, 240) : '', ans: ansFrac(n, m), sol, hint: T('分母相同時，只加減分子。', 'Same denominator: add or subtract only the numerators.') };
    },
  },
  {
    id: 'g4-mixed-improper',
    grade: 4,
    name: T('帶分數與假分數', 'Mixed numbers and improper fractions'),
    cur: { us: 'CCSS 4.NF.B.3', tw: '四年級 假分數與帶分數', aops: 'Beast Academy 4' },
    gen(r) {
      let d, c; do { d = r.int(2, 9); c = r.int(1, d - 1); } while (gcd(c, d) > 1);
      const w = r.int(1, 7), N = w * d + c, k = r.int(0, 2), [zn, en] = who(r);
      if (k === 0) return {
        q: T(`把 ${w}${frac(c, d)} 化成假分數。`, `Write ${w}${frac(c, d)} as an improper fraction.`), ans: ansFrac(N, d),
        sol: [T(`${w} 個整體，每個整體是 ${frac(d, d)}，所以 ${w} = ${frac(w * d, d)}。`, `Each whole is ${frac(d, d)}, so ${w} wholes = ${frac(w * d, d)}.`),
          T(`再加上 ${frac(c, d)}：${w} × ${d} + ${c} = ${N}。`, `Add the extra ${frac(c, d)}: ${w} × ${d} + ${c} = ${N}.`),
          T(`分母不變，所以 ${w}${frac(c, d)} = ${frac(N, d)}。`, `The denominator stays ${d}: ${w}${frac(c, d)} = ${frac(N, d)}.`)],
        hint: T('整數 × 分母 + 分子。', 'Whole × denominator + numerator.'),
      };
      const sol = [T(`${N} ÷ ${d} = ${w} … ${c}。`, `${N} ÷ ${d} = ${w} R ${c}.`),
        T(`商 ${w} 是幾個整體，餘數 ${c} 是剩下幾個 ${frac(1, d)}。`, `The quotient ${w} is the number of wholes; the remainder ${c} is how many ${frac(1, d)} are left.`),
        T(`所以 ${frac(N, d)} = ${w}${frac(c, d)}。驗算：${w} × ${d} + ${c} = ${N} ✓`, `So ${frac(N, d)} = ${w}${frac(c, d)}. Check: ${w} × ${d} + ${c} = ${N} ✓`)];
      if (k === 1) {
        const wr = uniq([`${c}${frac(w, d)}`, `${w + 1}${frac(c, d)}`, `${w}${frac(d - c, d)}`, w > 1 ? `${w - 1}${frac(c, d)}` : `${w}${frac(c, N)}`, `${w}${frac(c + 1, d)}`].filter((s) => s !== `${w}${frac(c, d)}`), 3);
        return { q: T(`把 ${frac(N, d)} 化成帶分數。`, `Write ${frac(N, d)} as a mixed number.`), ans: ansChoice([`${w}${frac(c, d)}`, ...wr]), sol };
      }
      return {
        q: T(`${zn}有 ${N} 杯果汁，每杯是 ${frac(1, d)} 公升。一共是幾公升？用帶分數回答。`, `${en} has ${N} cups of juice. Each cup holds ${frac(1, d)} liter. How many liters in all? Answer as a mixed number.`),
        ans: ansNum([N, d], mixedText(N, d)),
        sol: [T(`${N} 個 ${frac(1, d)} 就是 ${frac(N, d)} 公升。`, `${N} groups of ${frac(1, d)} make ${frac(N, d)} liters.`), ...sol],
      };
    },
  },
  {
    id: 'g4-frac-times-whole',
    grade: 4,
    name: T('整數乘以分數', 'Multiplying a fraction by a whole number'),
    cur: { us: 'CCSS 4.NF.B.4', tw: '四年級 分數的整數倍', aops: 'Beast Academy 4' },
    gen(r) {
      const n = r.int(2, 9), b = r.int(2, 12), a = r.int(1, b - 1), k = r.int(0, 3), [zn, en] = who(r), [p, q2] = red(n * a, b);
      const form = T('（用最簡分數或帶分數回答）', '(Answer as a fraction or mixed number in lowest terms.)');
      const core = [T(`${n} × ${frac(a, b)} 表示 ${n} 個 ${frac(a, b)} 加起來，也就是 ${n * a} 個 ${frac(1, b)}。`, `${n} × ${frac(a, b)} means ${n} groups of ${frac(a, b)}, which is ${n * a} pieces of size ${frac(1, b)}.`),
        T(`整數乘分子，分母不變：${fq(`${n} × ${a}`, b)} = ${frac(n * a, b)}。`, `Multiply the whole number by the numerator; keep the denominator: ${fq(`${n} × ${a}`, b)} = ${frac(n * a, b)}.`),
        T(`${q2 !== b ? `約分得 ${fracR(p, q2)}` : `${frac(p, q2)} 已經是最簡`}${p > q2 && q2 > 1 ? `，化成帶分數是 ${mixed(p, q2)}` : ''}。`, `${q2 !== b ? `Reduce to ${fracR(p, q2)}` : `${frac(p, q2)} is already in lowest terms`}${p > q2 && q2 > 1 ? `; as a mixed number, ${mixed(p, q2)}` : ''}.`)];
      if (k === 3) return {
        q: T(`${n} × ${fq('?', b)} = ${frac(n * a, b)}，? 是多少？`, `${n} × ${fq('?', b)} = ${frac(n * a, b)}. What is ?`), ans: ansNum(a),
        sol: [T(`${n} × ${fq('?', b)} = ${fq(`${n} × ?`, b)}，分母一樣是 ${b}。`, `${n} × ${fq('?', b)} = ${fq(`${n} × ?`, b)}, and the denominator is ${b} on both sides.`),
          T(`所以 ${n} × ? = ${n * a}，? = ${n * a} ÷ ${n} = ${a}。`, `So ${n} × ? = ${n * a}, and ? = ${n * a} ÷ ${n} = ${a}.`), T(`驗算：${n} × ${frac(a, b)} = ${frac(n * a, b)} ✓`, `Check: ${n} × ${frac(a, b)} = ${frac(n * a, b)} ✓`)],
      };
      const q = k === 0 ? T(`計算 ${n} × ${frac(a, b)}。${form.zh}`, `Find ${n} × ${frac(a, b)}. ${form.en}`)
        : k === 1 ? T(`${zn}每天喝 ${frac(a, b)} 公升牛奶，${n} 天一共喝了幾公升？${form.zh}`, `${en} drinks ${frac(a, b)} liter of milk every day. How many liters in ${n} days? ${form.en}`)
          : T(`做一個蛋糕要用 ${frac(a, b)} 杯糖。做 ${n} 個蛋糕要用幾杯糖？${form.zh}`, `One cake needs ${frac(a, b)} cup of sugar. How many cups for ${n} cakes? ${form.en}`);
      return { q, fig: n <= 4 ? Array.from({ length: n }, () => fracBar(a, b, 150)).join('') : '', ans: ansFrac(p, q2), sol: core };
    },
  },
  {
    id: 'g4-decimals',
    grade: 4,
    name: T('小數：十分位與百分位', 'Decimals: tenths and hundredths'),
    cur: { us: 'CCSS 4.NF.C.6', tw: '四年級 二位小數', aops: 'Beast Academy 4' },
    gen(r) {
      const k = r.int(0, 4);
      if (k === 0) {
        const ten = r.chance(0.35), D = ten ? 10 : 100, n = ten ? r.int(1, 39) : r.int(1, 399);
        const v = n / D;
        return {
          q: T(`把 ${frac(n, D)} 寫成小數。`, `Write ${frac(n, D)} as a decimal.`), ans: ansNum(v),
          sol: [T(`${frac(1, D)} = ${ten ? '0.1' : '0.01'}（${ten ? '十分位' : '百分位'}）。`, `${frac(1, D)} = ${ten ? '0.1' : '0.01'} (one ${ten ? 'tenth' : 'hundredth'}).`),
            T(`${frac(n, D)} 就是 ${n} 個 ${frac(1, D)}。`, `${frac(n, D)} is ${n} ${ten ? 'tenths' : 'hundredths'}.`),
            T(`${ten ? '最後一位放在十分位' : '最後一位放在百分位'}：${frac(n, D)} = ${num(v)}。`, `Put the last digit in the ${ten ? 'tenths' : 'hundredths'} place: ${frac(n, D)} = ${fx(v, ten ? 1 : 2)}.`)],
        };
      }
      if (k === 1) {
        const n = r.int(1, 99), v = n / 100;
        return {
          q: T(`${fx(v, 2)} = ${fq('?', 100)}，? 是多少？`, `${fx(v, 2)} = ${fq('?', 100)}. What is ?`), ans: ansNum(n),
          sol: [T(`${fx(v, 2)} 有兩位小數，最後一位在百分位。`, `${fx(v, 2)} has two decimal places; the last digit is in the hundredths place.`),
            T(`所以它是 ${n} 個 0.01，也就是 ${n} 個 ${frac(1, 100)}。`, `So it is ${n} hundredths: ${n} × ${frac(1, 100)}.`), T(`? = ${n}。`, `? = ${n}.`)],
        };
      }
      if (k === 2) {
        const ds = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 3), v = ds[0] + ds[1] / 10 + ds[2] / 100, tenth = r.chance(0.5);
        return {
          q: T(`${fx(v, 2)} 的${tenth ? '十分位' : '百分位'}數字是多少？`, `What digit is in the ${tenth ? 'tenths' : 'hundredths'} place of ${fx(v, 2)}?`), ans: ansNum(tenth ? ds[1] : ds[2]),
          sol: [T('小數點右邊第一位是十分位，第二位是百分位。', 'The first digit right of the decimal point is tenths; the second is hundredths.'),
            T(`${fx(v, 2)}：個位 ${ds[0]}、十分位 ${ds[1]}、百分位 ${ds[2]}。`, `${fx(v, 2)}: ones ${ds[0]}, tenths ${ds[1]}, hundredths ${ds[2]}.`), T(`答案：${tenth ? ds[1] : ds[2]}。`, `Answer: ${tenth ? ds[1] : ds[2]}.`)],
        };
      }
      if (k === 3) {
        const A = r.int(105, 989), B = r.int(105, 989), sub = r.chance(0.5), [X, Y] = sub && A < B ? [B, A] : [A, B], R = sub ? X - Y : X + Y;
        return {
          q: T(`計算 ${fx(X / 100, 2)} ${sub ? '−' : '+'} ${fx(Y / 100, 2)}。`, `Find ${fx(X / 100, 2)} ${sub ? '−' : '+'} ${fx(Y / 100, 2)}.`), ans: ansNum(R / 100),
          sol: [T('直式計算時，小數點要對齊，這樣十分位對十分位、百分位對百分位。', 'Line up the decimal points so tenths sit under tenths and hundredths under hundredths.'),
            T(`想成百分位的個數：${X} 個 0.01 ${sub ? '−' : '+'} ${Y} 個 0.01 = ${R} 個 0.01。`, `Think in hundredths: ${X} hundredths ${sub ? '−' : '+'} ${Y} hundredths = ${R} hundredths.`),
            T(`${R} 個 0.01 = ${fx(R / 100, 2)}。`, `${R} hundredths = ${fx(R / 100, 2)}.`)],
        };
      }
      const a = r.int(1, 20), b = r.int(1, 9), c = r.int(1, 9), v = clean(a + b / 10 + c / 100);
      return {
        q: T(`${a} 個 1、${b} 個 0.1 和 ${c} 個 0.01 合起來是多少？`, `What number is ${a} ones, ${b} tenths and ${c} hundredths?`), ans: ansNum(v),
        sol: [T(`${a} 個 1 = ${a}，${b} 個 0.1 = ${fx(b / 10, 1)}，${c} 個 0.01 = ${fx(c / 100, 2)}。`, `${a} ones = ${a}, ${b} tenths = ${fx(b / 10, 1)}, ${c} hundredths = ${fx(c / 100, 2)}.`),
          T(`依位值寫：個位 ${a}、十分位 ${b}、百分位 ${c}。`, `By place value: ones ${a}, tenths ${b}, hundredths ${c}.`), T(`答案 ${fx(v, 2)}。`, `Answer: ${fx(v, 2)}.`)],
      };
    },
  },
  {
    id: 'g4-decimal-compare',
    grade: 4,
    name: T('小數比大小', 'Comparing decimals'),
    cur: { us: 'CCSS 4.NF.C.7', tw: '四年級 小數的大小比較', aops: 'Beast Academy 4' },
    gen(r) {
      const k = r.int(0, 2);
      const sameLen = T('先把位數補齊（在後面補 0 不改變大小），再從最左邊的位一位一位比。', 'Make them the same length by adding zeros at the end (this does not change the value), then compare from the left, place by place.');
      if (k === 0) {
        const w = r.int(0, 5), a = r.int(1, 9), mode = r.int(0, 3);
        const x = w + a / 10; let y, ys;
        if (mode === 3) { y = x; ys = fx(y, 2); } else { const h = mode === 0 ? a * 10 + r.int(1, 9) : mode === 1 ? (a - 1) * 10 + r.int(1, 9) : r.int(1, 9) * 10 + r.int(1, 9); y = w + h / 100; ys = fx(y, 2); }
        const sym = x > y + 1e-9 ? '&gt;' : x < y - 1e-9 ? '&lt;' : '=';
        return {
          q: T(`在 ○ 裡填入 &gt;、&lt; 或 =：${fx(x, 1)} ○ ${ys}`, `Fill in &gt;, &lt; or =: ${fx(x, 1)} ○ ${ys}`), ans: ansChoice([sym, ...['&gt;', '&lt;', '='].filter((o) => o !== sym)]),
          sol: [sameLen, T(`${fx(x, 1)} = ${fx(x, 2)}，和 ${ys} 比。`, `${fx(x, 1)} = ${fx(x, 2)}; compare with ${ys}.`),
            T(`${Math.round(x * 100)} 個 0.01 和 ${Math.round(y * 100)} 個 0.01 比較：${fx(x, 2)} ${sym} ${ys}。`, `${Math.round(x * 100)} hundredths vs ${Math.round(y * 100)} hundredths: ${fx(x, 2)} ${sym} ${ys}.`),
            T('注意：小數位數多，不代表比較大！', 'Careful: more digits after the point does not mean bigger!')],
        };
      }
      let vs; do { const w = r.int(0, 3); vs = [0, 1, 2, 3].map(() => (r.chance(0.5) ? w + r.int(1, 9) / 10 : w + r.int(1, 99) / 100 + (r.chance(0.2) ? 1 : 0))).map((v) => clean(v)); } while (new Set(vs).size < 4);
      const big = k === 1, best = big ? Math.max(...vs) : Math.min(...vs);
      const show = (v) => (Math.abs(v * 10 - Math.round(v * 10)) < 1e-9 ? fx(v, 1) : fx(v, 2));
      return {
        q: T(`下面哪一個數${big ? '最大' : '最小'}？`, `Which number is the ${big ? 'largest' : 'smallest'}?`),
        ans: ansChoice([show(best), ...vs.filter((v) => v !== best).map(show)]),
        sol: [sameLen, T(`都寫成兩位小數：${vs.map((v) => fx(v, 2)).join('、')}。`, `Write each with two decimal places: ${vs.map((v) => fx(v, 2)).join(', ')}.`),
          T(`比較後，${big ? '最大' : '最小'}的是 ${show(best)}。`, `Comparing, the ${big ? 'largest' : 'smallest'} is ${show(best)}.`)],
      };
    },
  },
  {
    id: 'g4-angles',
    grade: 4,
    name: T('角度', 'Measuring and finding angles'),
    cur: { us: 'CCSS 4.MD.C.7', tw: '四年級 角度', aops: 'Beast Academy 4' },
    gen(r) {
      const k = r.int(0, 4);
      if (k === 0) {
        let a; do a = 5 * r.int(5, 31); while (a === 90);
        const askLeft = r.chance(0.5);
        return {
          q: T('兩個角合起來是一條直線（平角）。問號的角是幾度？', 'The two angles together make a straight line. How many degrees is the angle marked ?'),
          fig: angFig([0, 180, a], [{ a0: 0, a1: a, label: askLeft ? `${a}°` : '?', acc: !askLeft }, { a0: a, a1: 180, label: askLeft ? '?' : `${180 - a}°`, acc: askLeft }]),
          ans: ansNum(askLeft ? 180 - a : a),
          sol: [T('一條直線（平角）是 180°。', 'A straight angle measures 180°.'), T(`所以兩個角加起來是 180°：? = 180° − ${askLeft ? a : 180 - a}°。`, `So the two angles add up to 180°: ? = 180° − ${askLeft ? a : 180 - a}°.`),
            T(`? = ${askLeft ? 180 - a : a}°。`, `? = ${askLeft ? 180 - a : a}°.`)],
        };
      }
      if (k === 1) {
        let a, b, c; do { a = 10 * r.int(6, 15); b = 10 * r.int(6, 15); c = 360 - a - b; } while (c < 60 || c > 200);
        return {
          q: T('三個角圍成一圈（周角）。問號的角是幾度？', 'Three angles fit together all the way around a point. How many degrees is the angle marked ?'),
          fig: angFig([0, a, a + b], [{ a0: 0, a1: a, label: `${a}°` }, { a0: a, a1: a + b, label: `${b}°` }, { a0: a + b, a1: 360, label: '?', acc: true }], true), ans: ansNum(c),
          sol: [T('繞一整圈（周角）是 360°。', 'All the way around a point is 360°.'), T(`已知兩個角：${a}° + ${b}° = ${a + b}°。`, `The known angles: ${a}° + ${b}° = ${a + b}°.`), T(`? = 360° − ${a + b}° = ${c}°。`, `? = 360° − ${a + b}° = ${c}°.`)],
        };
      }
      if (k === 2) {
        const a = 5 * r.int(3, 15);
        return {
          q: T('一個直角被分成兩個角。問號的角是幾度？', 'A right angle is split into two angles. How many degrees is the angle marked ?'),
          fig: angFig([0, 90, a], [{ a0: 0, a1: a, label: `${a}°` }, { a0: a, a1: 90, label: '?', acc: true }]), ans: ansNum(90 - a),
          sol: [T('直角是 90°。', 'A right angle is 90°.'), T(`? + ${a}° = 90°，所以 ? = 90° − ${a}° = ${90 - a}°。`, `? + ${a}° = 90°, so ? = 90° − ${a}° = ${90 - a}°.`), T(`驗算：${a}° + ${90 - a}° = 90° ✓`, `Check: ${a}° + ${90 - a}° = 90° ✓`)],
        };
      }
      if (k === 3) {
        const h = r.int(1, 11), ang = 30 * Math.min(h, 12 - h);
        return {
          q: T(`${h} 點整時，時針和分針所夾的角（較小的那個）是幾度？`, `At ${h} o'clock, what is the smaller angle between the hour hand and the minute hand?`), fig: clock(h, 0), ans: ansNum(ang),
          sol: [T('鐘面一圈 360°，分成 12 大格，每一大格是 360° ÷ 12 = 30°。', 'A clock face is 360° split into 12 equal spaces, so each space is 360° ÷ 12 = 30°.'),
            T(`${h} 點整，分針指 12，時針指 ${h}，兩針之間（較小的一邊）有 ${Math.min(h, 12 - h)} 大格。`, `At ${h}:00 the minute hand points to 12 and the hour hand to ${h}: ${Math.min(h, 12 - h)} spaces apart (the smaller way).`),
            T(`${Math.min(h, 12 - h)} × 30° = ${ang}°。`, `${Math.min(h, 12 - h)} × 30° = ${ang}°.`)],
        };
      }
      const kind = r.int(0, 3), x = [5 * r.int(2, 17), 90, 5 * r.int(19, 35), 180][kind];
      const O = [T('銳角', 'Acute'), T('直角', 'Right'), T('鈍角', 'Obtuse'), T('平角', 'Straight')];
      return {
        q: T(`${x}° 的角是哪一種角？`, `What kind of angle measures ${x}°?`), ans: ansChoice([O[kind], ...O.filter((_, i) => i !== kind)]),
        sol: [T('銳角：比 90° 小。直角：剛好 90°。鈍角：比 90° 大、比 180° 小。平角：剛好 180°。', 'Acute: less than 90°. Right: exactly 90°. Obtuse: between 90° and 180°. Straight: exactly 180°.'),
          T(`${x}° ${kind === 0 ? '比 90° 小' : kind === 1 ? '剛好是 90°' : kind === 2 ? '在 90° 和 180° 之間' : '剛好是 180°'}，所以是${O[kind].zh}。`, `${x}° is ${kind === 0 ? 'less than 90°' : kind === 1 ? 'exactly 90°' : kind === 2 ? 'between 90° and 180°' : 'exactly 180°'}, so it is ${O[kind].en.toLowerCase()}.`)],
      };
    },
  },
  {
    id: 'g4-perim-area',
    grade: 4,
    name: T('長方形的周長與面積', 'Perimeter and area of rectangles'),
    cur: { us: 'CCSS 4.MD.A.3', tw: '四年級 周長與面積', aops: 'Beast Academy 4' },
    gen(r) {
      const k = r.int(0, 4);
      let L = r.int(4, 25), W = r.int(3, 18); if (L === W) L++;
      if (k === 4) {
        const WW = r.int(8, 15), HH = r.int(6, 12), cw = r.int(2, WW - 3), ch = r.int(2, HH - 3), A = WW * HH - cw * ch, per = r.chance(0.4);
        if (per) return {
          q: T('這個 L 形的周長是幾公分？（每個角都是直角）', 'What is the perimeter of this L-shape in cm? (All corners are right angles.)'), fig: lShape(WW, HH, cw, ch, 'cm'), ans: ansNum(2 * (WW + HH)),
          sol: [T(`缺的兩條邊：上方缺口的寬是 ${WW} − ${WW - cw} = ${cw} 公分，高是 ${HH} − ${HH - ch} = ${ch} 公分。`, `The two unlabeled sides: the notch is ${WW} − ${WW - cw} = ${cw} cm wide and ${HH} − ${HH - ch} = ${ch} cm tall.`),
            T(`小技巧：把缺口的邊「推出去」，周長和 ${WW} × ${HH} 的長方形一樣。`, `Trick: push the notch's edges outward — the perimeter equals that of a ${WW} by ${HH} rectangle.`),
            T(`周長 = (${WW} + ${HH}) × 2 = ${2 * (WW + HH)} 公分。`, `Perimeter = (${WW} + ${HH}) × 2 = ${2 * (WW + HH)} cm.`)],
        };
        return {
          q: T('這個 L 形的面積是幾平方公分？（每個角都是直角）', 'What is the area of this L-shape in square cm? (All corners are right angles.)'), fig: lShape(WW, HH, cw, ch, 'cm'), ans: ansNum(A),
          sol: [T(`把它看成 ${WW} × ${HH} 的大長方形，再挖掉右上角的小長方形。`, `Think of a big ${WW} by ${HH} rectangle with a small rectangle cut from the top right.`),
            T(`小長方形：寬 ${WW} − ${WW - cw} = ${cw}，高 ${HH} − ${HH - ch} = ${ch}，面積 ${cw} × ${ch} = ${cw * ch}。`, `The cut piece: width ${WW} − ${WW - cw} = ${cw}, height ${HH} − ${HH - ch} = ${ch}, area ${cw} × ${ch} = ${cw * ch}.`),
            T(`面積 = ${WW} × ${HH} − ${cw * ch} = ${WW * HH} − ${cw * ch} = ${A} 平方公分。`, `Area = ${WW} × ${HH} − ${cw * ch} = ${WW * HH} − ${cw * ch} = ${A} square cm.`),
            T(`驗算（切成兩塊）：${WW - cw} × ${HH} + ${cw} × ${HH - ch} = ${(WW - cw) * HH} + ${cw * (HH - ch)} = ${A} ✓`, `Check (cut into two pieces): ${WW - cw} × ${HH} + ${cw} × ${HH - ch} = ${(WW - cw) * HH} + ${cw * (HH - ch)} = ${A} ✓`)],
        };
      }
      const fig = rect(`${L} cm`, `${W} cm`);
      if (k === 0) return {
        q: T(`長方形長 ${L} 公分、寬 ${W} 公分，面積是幾平方公分？`, `A rectangle is ${L} cm long and ${W} cm wide. What is its area in square cm?`), fig, ans: ansNum(L * W),
        sol: [T('面積是「可以鋪幾個 1 平方公分的小方格」。', 'Area counts how many 1 cm by 1 cm squares cover the shape.'), T(`一排 ${L} 格，共有 ${W} 排。`, `Each row has ${L} squares, and there are ${W} rows.`), T(`面積 = 長 × 寬 = ${L} × ${W} = ${L * W} 平方公分。`, `Area = length × width = ${L} × ${W} = ${L * W} square cm.`)],
      };
      if (k === 1) return {
        q: T(`長方形長 ${L} 公分、寬 ${W} 公分，周長是幾公分？`, `A rectangle is ${L} cm long and ${W} cm wide. What is its perimeter in cm?`), fig, ans: ansNum(2 * (L + W)),
        sol: [T('周長是繞圖形一圈的長度。長方形有兩條長、兩條寬。', 'Perimeter is the distance all the way around. A rectangle has two lengths and two widths.'), T(`${L} + ${W} + ${L} + ${W} = (${L} + ${W}) × 2。`, `${L} + ${W} + ${L} + ${W} = (${L} + ${W}) × 2.`), T(`= ${L + W} × 2 = ${2 * (L + W)} 公分。`, `= ${L + W} × 2 = ${2 * (L + W)} cm.`)],
      };
      if (k === 2) return {
        q: T(`長方形的面積是 ${L * W} 平方公分，長是 ${L} 公分。寬是幾公分？`, `A rectangle has area ${L * W} square cm and length ${L} cm. What is its width?`), fig: rect(`${L} cm`, '?'), ans: ansNum(W),
        sol: [T('面積 = 長 × 寬，所以寬 = 面積 ÷ 長。', 'Area = length × width, so width = area ÷ length.'), T(`寬 = ${L * W} ÷ ${L} = ${W} 公分。`, `Width = ${L * W} ÷ ${L} = ${W} cm.`), T(`驗算：${L} × ${W} = ${L * W} ✓`, `Check: ${L} × ${W} = ${L * W} ✓`)],
      };
      return {
        q: T(`長方形的周長是 ${2 * (L + W)} 公分，長是 ${L} 公分。寬是幾公分？`, `A rectangle has perimeter ${2 * (L + W)} cm and length ${L} cm. What is its width?`), fig: rect(`${L} cm`, '?'), ans: ansNum(W),
        sol: [T(`周長是 (長 + 寬) × 2，所以長 + 寬 = ${2 * (L + W)} ÷ 2 = ${L + W}。`, `Perimeter = (length + width) × 2, so length + width = ${2 * (L + W)} ÷ 2 = ${L + W}.`), T(`寬 = ${L + W} − ${L} = ${W} 公分。`, `Width = ${L + W} − ${L} = ${W} cm.`), T(`驗算：(${L} + ${W}) × 2 = ${2 * (L + W)} ✓`, `Check: (${L} + ${W}) × 2 = ${2 * (L + W)} ✓`)],
        hint: T('先把周長除以 2。', 'Halve the perimeter first.'),
      };
    },
  },
  {
    id: 'g4-unit-convert',
    grade: 4,
    name: T('單位換算（長度、重量、時間）', 'Converting units of length, weight and time'),
    cur: { us: 'CCSS 4.MD.A.1', tw: '四年級 公里與長度、重量單位換算', aops: 'Beast Academy 4' },
    gen(r) {
      const k = r.int(0, 6);
      const U = [
        // [big zh, big en, small zh, small en, factor]
        ['公里', 'km', '公尺', 'm', 1000], ['公尺', 'm', '公分', 'cm', 100], ['公斤', 'kg', '公克', 'g', 1000], ['公斤', 'kg', '公克', 'g', 1000],
        ['英尺', 'ft', '英寸', 'in', 12], ['磅', 'lb', '盎司', 'oz', 16], ['小時', 'h', '分鐘', 'min', 60],
      ][k];
      const [bz, be, sz, se, f] = U, a = r.int(1, 9), b = r.int(1, f - 1), tot = a * f + b;
      const fact0 = T(`1 ${bz} = ${num(f)} ${sz}。`, `1 ${be} = ${num(f)} ${se}.`);
      if (k === 3) return {
        q: T(`${num(tot)} 公克 = ${a} 公斤又幾公克？`, `${num(tot)} g = ${a} kg and how many g?`), ans: ansNum(b),
        sol: [fact0, T(`${a} 公斤 = ${a} × 1000 = ${num(a * 1000)} 公克。`, `${a} kg = ${a} × 1000 = ${num(a * 1000)} g.`), T(`剩下 ${num(tot)} − ${num(a * 1000)} = ${b} 公克。`, `What is left: ${num(tot)} − ${num(a * 1000)} = ${b} g.`)],
      };
      return {
        q: T(`${a} ${bz} ${b} ${sz} = 幾${sz}？`, `${a} ${be} ${b} ${se} = how many ${se}?`), ans: ansNum(tot),
        sol: [fact0, T(`大單位換成小單位要乘：${a} ${bz} = ${a} × ${num(f)} = ${num(a * f)} ${sz}。`, `Big unit to small unit: multiply. ${a} ${be} = ${a} × ${num(f)} = ${num(a * f)} ${se}.`),
          T(`再加上 ${b} ${sz}：${num(a * f)} + ${b} = ${num(tot)} ${sz}。`, `Add the ${b} ${se}: ${num(a * f)} + ${b} = ${num(tot)} ${se}.`)],
        hint: T(`1 ${bz} 是幾${sz}？`, `How many ${se} are in 1 ${be}?`),
      };
    },
  },
  {
    id: 'g4-patterns-counting',
    grade: 4,
    name: T('規律與數數（數學競賽入門）', 'Patterns and counting puzzles'),
    cur: { us: 'CCSS 4.OA.C.5', aops: 'Beast Academy 4' },
    gen(r) {
      const k = r.int(0, 4);
      if (k === 0) {
        const a = r.int(2, 30), d = r.int(2, 9), n = r.int(12, 40), b = a + (n - 1) * d;
        return {
          q: T(`數列 ${a}, ${a + d}, ${a + 2 * d}, …, ${b} 一共有幾個數？`, `How many numbers are in the list ${a}, ${a + d}, ${a + 2 * d}, …, ${b}?`), ans: ansNum(n),
          sol: [T(`每次加 ${d}。從 ${a} 到 ${b} 一共加了 (${b} − ${a}) ÷ ${d} = ${n - 1} 次。`, `Each step adds ${d}. From ${a} to ${b} we add ${d} a total of (${b} − ${a}) ÷ ${d} = ${n - 1} times.`),
            T(`加了 ${n - 1} 次，數有 ${n - 1} + 1 = ${n} 個（別忘了第一個數！）。`, `${n - 1} steps means ${n - 1} + 1 = ${n} numbers (don't forget the first one!).`),
            T('這叫「種樹問題」：間隔數 + 1 = 個數。', 'This is the fence-post idea: number of gaps + 1 = number of posts.')],
        };
      }
      if (k === 1) {
        const a = r.int(1, 20), d = r.int(2, 9), n = r.int(15, 50);
        return {
          q: T(`規律：${a}, ${a + d}, ${a + 2 * d}, ${a + 3 * d}, … 第 ${n} 個數是多少？`, `Pattern: ${a}, ${a + d}, ${a + 2 * d}, ${a + 3 * d}, … What is the ${n}th number?`), ans: ansNum(a + (n - 1) * d),
          sol: [T(`每次加 ${d}。`, `Each number is ${d} more than the one before.`), T(`從第 1 個到第 ${n} 個，要加 ${n - 1} 次 ${d}。`, `From the 1st to the ${n}th we add ${d} exactly ${n - 1} times.`), T(`${a} + ${n - 1} × ${d} = ${a} + ${(n - 1) * d} = ${a + (n - 1) * d}。`, `${a} + ${n - 1} × ${d} = ${a} + ${(n - 1) * d} = ${a + (n - 1) * d}.`)],
        };
      }
      if (k === 2) {
        const n = r.int(6, 30), sq = r.chance(0.5), per = sq ? 3 : 2, c = per * n + 1;
        const u = 18; let s = '';
        for (let m = 1, x0 = 6; m <= 3; m++) {
          for (let i = 0; i < m; i++) {
            if (sq) s += `<rect x="${x0 + i * u}" y="10" width="${u}" height="${u}" fill="none" class="f-line" stroke-width="2"/>`;
            else { const X = x0 + i * u; s += `<polygon points="${X},34 ${X + u},34 ${X + u / 2},10" fill="none" class="f-line" stroke-width="2"/>`; if (i < m - 1) s += `<polygon points="${X + u / 2},10 ${X + u * 1.5},10 ${X + u},34" fill="none" class="f-line" stroke-width="2"/>`; }
          }
          x0 += m * u + 26;
        }
        return {
          q: T(`用火柴棒排成一排${sq ? '正方形' : '三角形'}，相鄰的圖形共用一根火柴（圖中依序是 ${sq ? '1、2、3 個正方形' : '1、3、5 個三角形'}）。排 ${n} 個${sq ? '正方形' : '三角形'}一共要幾根火柴？`,
            `Matchsticks make a row of ${sq ? 'squares' : 'triangles'}; neighbors share a stick (the pictures show ${sq ? '1, 2 and 3 squares' : '1, 3 and 5 triangles'}). How many matchsticks are needed for ${n} ${sq ? 'squares' : 'triangles'}?`),
          fig: svg(260, 44, s), ans: ansNum(c),
          sol: sq ? [T('第 1 個正方形要 4 根，之後每多 1 個正方形，只要再多 3 根（左邊那根共用）。', 'The first square needs 4 sticks; each new square adds only 3 more (it shares its left side).'),
            T(`${n} 個正方形：4 + 3 × ${n - 1}。`, `${n} squares: 4 + 3 × ${n - 1}.`), T(`= 4 + ${3 * (n - 1)} = ${3 * n + 1} 根。`, `= 4 + ${3 * (n - 1)} = ${3 * n + 1} sticks.`)]
            : [T('第 1 個三角形要 3 根，之後每多 1 個三角形，只要再多 2 根。', 'The first triangle needs 3 sticks; each new triangle adds only 2 more.'),
              T(`${n} 個三角形：3 + 2 × ${n - 1}。`, `${n} triangles: 3 + 2 × ${n - 1}.`), T(`= 3 + ${2 * (n - 1)} = ${c} 根。`, `= 3 + ${2 * (n - 1)} = ${c} sticks.`)],
        };
      }
      if (k === 3) {
        const N = r.int(15, 250), d1 = Math.min(N, 9), d2 = Math.max(0, Math.min(N, 99) - 9), d3 = Math.max(0, N - 99), tot = d1 + 2 * d2 + 3 * d3;
        return {
          q: T(`一本書從第 1 頁編到第 ${N} 頁，印頁碼一共要用幾個數字？`, `A book's pages are numbered from 1 to ${N}. How many digits are printed in all?`), ans: ansNum(tot),
          sol: [T(`第 1～${d1} 頁是一位數：${d1} 個數字。`, `Pages 1–${d1} have one digit each: ${d1} digits.`),
            T(`第 10～${Math.min(N, 99)} 頁是二位數，共 ${d2} 頁：${d2} × 2 = ${2 * d2} 個數字。`, `Pages 10–${Math.min(N, 99)} have two digits: ${d2} pages × 2 = ${2 * d2} digits.`),
            ...(d3 ? [T(`第 100～${N} 頁是三位數，共 ${d3} 頁：${d3} × 3 = ${3 * d3} 個數字。`, `Pages 100–${N} have three digits: ${d3} pages × 3 = ${3 * d3} digits.`)] : []),
            T(`合計：${d1} + ${2 * d2}${d3 ? ` + ${3 * d3}` : ''} = ${tot} 個數字。`, `Total: ${d1} + ${2 * d2}${d3 ? ` + ${3 * d3}` : ''} = ${tot} digits.`)],
        };
      }
      const d = r.pick([2, 3, 4, 5, 6, 8, 10]), g = r.int(8, 40), L = d * g, [zn, en] = who(r);
      return {
        q: T(`一條 ${L} 公尺長的直路，${zn}從頭到尾每隔 ${d} 公尺種一棵樹（兩端都種）。一共種幾棵樹？`, `Along a straight ${L} m path, ${en} plants a tree every ${d} m, including both ends. How many trees?`), ans: ansNum(g + 1),
        sol: [T(`間隔數：${L} ÷ ${d} = ${g} 個間隔。`, `Number of gaps: ${L} ÷ ${d} = ${g}.`), T('兩端都種時，樹比間隔多 1 棵。', 'With trees at both ends, there is one more tree than gaps.'), T(`${g} + 1 = ${g + 1} 棵。`, `${g} + 1 = ${g + 1} trees.`)],
        hint: T('想想看：3 公尺、每隔 1 公尺種，需要幾棵？', 'Try a tiny case: a 3 m path, a tree every 1 m — how many trees?'),
      };
    },
  },
];

// =====================================================================================
// GRADE 5
// =====================================================================================
const LOWEST = T('（用最簡分數或帶分數回答）', '(Answer as a fraction or mixed number in lowest terms.)');
const showMixed = (n, d) => mixed(n, d); // 7/2 → 3½ as HTML
const G5 = [
  {
    id: 'g5-frac-unlike-addsub',
    grade: 5,
    name: T('異分母分數與帶分數的加減', 'Adding and subtracting unlike fractions and mixed numbers'),
    cur: { us: 'CCSS 5.NF.A.1', tw: '五年級 異分母分數的加減', aops: 'Beast Academy 5' },
    gen(r) {
      const k = r.int(0, 3), [zn, en] = who(r);
      let b, d; do { b = r.pick([2, 3, 4, 5, 6, 8, 10]); d = r.pick([2, 3, 4, 6, 8, 9, 12]); } while (b === d);
      let a = r.int(1, b - 1), c = r.int(1, d - 1);
      while (gcd(a, b) > 1) a = r.int(1, b - 1);
      while (gcd(c, d) > 1) c = r.int(1, d - 1);
      let w1 = 0, w2 = 0;
      if (k >= 2) { w1 = r.int(2, 6); w2 = r.int(1, w1 - 1); }
      let X = [w1 * b + a, b], Y = [w2 * d + c, d];
      const sub = k === 1 || k === 3;
      if (sub && X[0] / X[1] < Y[0] / Y[1]) [X, Y] = [Y, X];
      if (sub && X[0] * Y[1] === Y[0] * X[1]) return G5[0].gen(r);
      const L = lcm(X[1], Y[1]), XA = X[0] * (L / X[1]), YA = Y[0] * (L / Y[1]), R = sub ? XA - YA : XA + YA, [n, m] = red(R, L);
      const sx = showMixed(...X), sy = showMixed(...Y), op = sub ? '−' : '+';
      const q = k === 3
        ? T(`${zn}有一條 ${sx} 公尺長的緞帶，用掉 ${sy} 公尺，還剩幾公尺？${LOWEST.zh}`, `${en} has a ribbon ${sx} m long and uses ${sy} m. How many meters are left? ${LOWEST.en}`)
        : k === 2 ? T(`${zn}星期六走了 ${sx} 公里，星期日走了 ${sy} 公里，兩天共走了幾公里？${LOWEST.zh}`, `${en} walked ${sx} km on Saturday and ${sy} km on Sunday. How far in all? ${LOWEST.en}`)
          : T(`計算 ${sx} ${op} ${sy}。${LOWEST.zh}`, `Find ${sx} ${op} ${sy}. ${LOWEST.en}`);
      const sol = [];
      if (k >= 2) sol.push(T(`先化成假分數：${sx} = ${frac(...X)}，${sy} = ${frac(...Y)}。`, `Change to improper fractions: ${sx} = ${frac(...X)}, ${sy} = ${frac(...Y)}.`));
      sol.push(
        T(`分母 ${X[1]} 和 ${Y[1]} 不一樣，每一塊大小不同，不能直接${sub ? '減' : '加'}。找最小公倍數 ${L} 當共同分母。`, `The denominators ${X[1]} and ${Y[1]} are different — the pieces are different sizes — so we can't ${sub ? 'subtract' : 'add'} yet. Use their least common multiple, ${L}, as the common denominator.`),
        T(`通分：${frac(...X)} = ${frac(XA, L)}，${frac(...Y)} = ${frac(YA, L)}。`, `Rewrite: ${frac(...X)} = ${frac(XA, L)}, ${frac(...Y)} = ${frac(YA, L)}.`),
        T(`分子${sub ? '相減' : '相加'}：${XA} ${op} ${YA} = ${R}，得到 ${frac(R, L)}。`, `${sub ? 'Subtract' : 'Add'} the numerators: ${XA} ${op} ${YA} = ${R}, giving ${frac(R, L)}.`),
        T(`${m !== L ? `約分成 ${fracR(n, m)}` : '已經是最簡分數'}${n > m && m > 1 ? `，化成帶分數是 ${mixed(n, m)}` : ''}。`, `${m !== L ? `Reduce to ${fracR(n, m)}` : 'It is already in lowest terms'}${n > m && m > 1 ? `; as a mixed number, ${mixed(n, m)}` : ''}.`),
      );
      return { q, fig: k === 0 && X[0] < X[1] && Y[0] < Y[1] ? fracBar(...X, 240) + fracBar(...Y, 240) : '', ans: ansFrac(n, m), sol, hint: T('先通分。', 'Find a common denominator first.') };
    },
  },
  {
    id: 'g5-frac-mult',
    grade: 5,
    name: T('分數乘法', 'Multiplying fractions'),
    cur: { us: 'CCSS 5.NF.B.4', tw: '五年級 分數的乘法', aops: 'Beast Academy 5' },
    gen(r) {
      const k = r.int(0, 3), [zn, en] = who(r);
      const fr = () => { let d, n; do { d = r.int(2, 9); n = r.int(1, d - 1); } while (gcd(n, d) > 1); return [n, d]; };
      let X = fr(), Y = fr();
      if (k === 3) { const w = r.int(1, 4); X = [w * X[1] + X[0], X[1]]; Y = [r.int(2, 9), 1]; }
      const [n, m] = fmul(X, Y);
      const g1 = gcd(X[0], Y[1]), g2 = gcd(Y[0], X[1]);
      const sx = showMixed(...X), sy = Y[1] === 1 ? num(Y[0]) : frac(...Y);
      const q = [
        T(`計算 ${sx} × ${sy}。${LOWEST.zh}`, `Find ${sx} × ${sy}. ${LOWEST.en}`),
        T(`一個披薩剩下 ${frac(...Y)} 個，${zn}吃掉了剩下的 ${frac(...X)}。${zn}吃了幾個披薩？${LOWEST.zh}`, `There is ${frac(...Y)} of a pizza left. ${en} eats ${frac(...X)} of what is left. What part of a whole pizza did ${en} eat? ${LOWEST.en}`),
        T(`長方形花圃長 ${frac(...X)} 公尺、寬 ${frac(...Y)} 公尺，面積是幾平方公尺？${LOWEST.zh}`, `A garden bed is ${frac(...X)} m long and ${frac(...Y)} m wide. What is its area in square meters? ${LOWEST.en}`),
        T(`計算 ${sx} × ${sy}。${LOWEST.zh}`, `Find ${sx} × ${sy}. ${LOWEST.en}`),
      ][k];
      const sol = [];
      if (k === 1) sol.push(T(`「剩下的 ${frac(...X)}」就是 ${frac(...X)} × ${frac(...Y)}（「的」表示乘）。`, `"${frac(...X)} of the leftover" means ${frac(...X)} × ${frac(...Y)} ("of" means multiply).`));
      if (k === 2) sol.push(T('長方形面積 = 長 × 寬，分數也一樣。', 'Area of a rectangle = length × width, even with fractions.'));
      if (k === 3) sol.push(T(`先把帶分數化成假分數：${sx} = ${frac(...X)}。`, `Change the mixed number to an improper fraction: ${sx} = ${frac(...X)}.`));
      if (g1 > 1 || g2 > 1) sol.push(T(`可以先約分（交叉約分）讓數字變小：${g1 > 1 ? `${X[0]} 和 ${Y[1]} 同除以 ${g1}` : ''}${g1 > 1 && g2 > 1 ? '，' : ''}${g2 > 1 ? `${Y[0]} 和 ${X[1]} 同除以 ${g2}` : ''}。`, `Simplify first (cross-cancel) to keep numbers small: ${g1 > 1 ? `divide ${X[0]} and ${Y[1]} by ${g1}` : ''}${g1 > 1 && g2 > 1 ? '; ' : ''}${g2 > 1 ? `divide ${Y[0]} and ${X[1]} by ${g2}` : ''}.`));
      sol.push(T(`分子乘分子、分母乘分母：${fq(`${X[0]} × ${Y[0]}`, `${X[1]} × ${Y[1]}`)} = ${frac(X[0] * Y[0], X[1] * Y[1])}。`, `Multiply top × top and bottom × bottom: ${fq(`${X[0]} × ${Y[0]}`, `${X[1]} × ${Y[1]}`)} = ${frac(X[0] * Y[0], X[1] * Y[1])}.`));
      sol.push(T(`最簡分數：${fracR(n, m)}${n > m && m > 1 ? `（= ${mixed(n, m)}）` : ''}。`, `In lowest terms: ${fracR(n, m)}${n > m && m > 1 ? ` (= ${mixed(n, m)})` : ''}.`));
      if (k === 2) return { q, fig: rect(`${X[0]}/${X[1]} m`, `${Y[0]}/${Y[1]} m`), ans: ansFrac(n, m), sol };
      return { q, ans: ansFrac(n, m), sol };
    },
  },
  {
    id: 'g5-unit-frac-div',
    grade: 5,
    name: T('整數與單位分數的除法', 'Dividing with unit fractions'),
    cur: { us: 'CCSS 5.NF.B.7', tw: '五年級 分數除以整數', aops: 'Beast Academy 5' },
    gen(r) {
      const k = r.int(0, 3), n = r.int(2, 9), b = r.int(2, 8), [zn, en] = who(r);
      if (k === 0 || k === 2) {
        const q = k === 0 ? T(`計算 ${n} ÷ ${frac(1, b)}。`, `Find ${n} ÷ ${frac(1, b)}.`)
          : T(`${zn}有 ${n} 公升果汁，倒進每杯 ${frac(1, b)} 公升的杯子，可以倒滿幾杯？`, `${en} has ${n} liters of juice and pours it into cups that hold ${frac(1, b)} liter each. How many cups can be filled?`);
        return {
          q, fig: n <= 4 ? Array.from({ length: n }, () => fracBar(b, b, 150)).join('') : '', ans: ansNum(n * b),
          sol: [T(`問「${n} 裡面有幾個 ${frac(1, b)}」。`, `The question is: how many ${frac(1, b)}s fit in ${n}?`),
            T(`每 1 個整體可以切成 ${b} 個 ${frac(1, b)}。`, `Each whole holds ${b} pieces of size ${frac(1, b)}.`),
            T(`${n} 個整體就有 ${n} × ${b} = ${n * b} 個。`, `${n} wholes hold ${n} × ${b} = ${n * b} pieces.`),
            T(`所以 ${n} ÷ ${frac(1, b)} = ${n * b}。驗算：${n * b} × ${frac(1, b)} = ${n} ✓`, `So ${n} ÷ ${frac(1, b)} = ${n * b}. Check: ${n * b} × ${frac(1, b)} = ${n} ✓`)],
        };
      }
      const q = k === 1 ? T(`計算 ${frac(1, b)} ÷ ${n}。${LOWEST.zh}`, `Find ${frac(1, b)} ÷ ${n}. ${LOWEST.en}`)
        : T(`還剩 ${frac(1, b)} 個蛋糕，${n} 個人平分，每人分到幾個蛋糕？${LOWEST.zh}`, `There is ${frac(1, b)} of a cake left. ${n} people share it equally. What part of the whole cake does each person get? ${LOWEST.en}`);
      return {
        q, fig: fracBar(1, b, 240), ans: ansFrac(1, b * n),
        sol: [T(`把 ${frac(1, b)} 再平分成 ${n} 份。`, `Split ${frac(1, b)} into ${n} equal parts.`),
          T(`整個蛋糕原本有 ${b} 塊，每塊都切成 ${n} 份，整個就變成 ${b} × ${n} = ${b * n} 小份。`, `If every one of the ${b} pieces of the whole is cut into ${n}, the whole has ${b} × ${n} = ${b * n} tiny pieces.`),
          T(`每人拿 1 小份，就是 ${frac(1, b * n)}。`, `Each person gets one tiny piece: ${frac(1, b * n)}.`),
          T(`也可以想成 ${frac(1, b)} × ${frac(1, n)} = ${frac(1, b * n)}。`, `Another way: ${frac(1, b)} × ${frac(1, n)} = ${frac(1, b * n)}.`)],
      };
    },
  },
  {
    id: 'g5-decimal-addsub',
    grade: 5,
    name: T('小數的加減', 'Adding and subtracting decimals'),
    cur: { us: 'CCSS 5.NBT.B.7', tw: '五年級 小數的加減', aops: 'Beast Academy 5' },
    at: { tw: 4 },
    gen(r) {
      const k = r.int(0, 3), [zn, en] = who(r);
      const p1 = r.int(1, 3), p2 = r.int(1, 3);
      const A = r.int(10 ** p1, 50 * 10 ** p1) , B = r.int(10 ** p2, 30 * 10 ** p2);
      let x = clean(A / 10 ** p1), y = clean(B / 10 ** p2);
      const P = Math.max(p1, p2);
      if (k === 1 || k === 3) { if (x < y) [x, y] = [y, x]; if (x === y) x = clean(x + 1); }
      const sub = k === 1 || k === 3, R = clean(sub ? x - y : x + y);
      const q = [
        T(`計算 ${num(x)} + ${num(y)}。`, `Find ${num(x)} + ${num(y)}.`),
        T(`計算 ${num(x)} − ${num(y)}。`, `Find ${num(x)} − ${num(y)}.`),
        T(`一包麵粉重 ${num(x)} 公斤，一包糖重 ${num(y)} 公斤，兩包一共重幾公斤？`, `A bag of flour weighs ${num(x)} kg and a bag of sugar weighs ${num(y)} kg. How many kg do they weigh together?`),
        T(`一桶水有 ${num(x)} 公升，用掉 ${num(y)} 公升後還剩幾公升？`, `A bucket holds ${num(x)} liters of water. After ${num(y)} liters are used, how many liters are left?`),
      ][k];
      return {
        q, ans: ansNum(R),
        sol: [T('直式計算時，小數點要對齊，這樣同一個位值才會在同一行（十分位對十分位……）。', 'Line up the decimal points so each place value is in the same column (tenths under tenths, and so on).'),
          T(`位數不一樣時，在後面補 0：${fx(x, P)} ${sub ? '−' : '+'} ${fx(y, P)}。`, `If the lengths differ, add zeros at the end: ${fx(x, P)} ${sub ? '−' : '+'} ${fx(y, P)}.`),
          T(`像整數一樣從最右邊開始${sub ? '減（不夠減就向左邊借 1）' : '加（滿十就進位）'}：得到 ${fx(R, P)}。`, `${sub ? 'Subtract' : 'Add'} from the right like whole numbers (${sub ? 'borrow when needed' : 'carry when a column reaches 10'}): ${fx(R, P)}.`),
          T(sub ? `驗算：${num(R)} + ${num(y)} = ${num(x)} ✓` : `估算：約 ${Math.round(x)} + ${Math.round(y)} = ${Math.round(x) + Math.round(y)}，答案 ${num(R)} 合理。`, sub ? `Check: ${num(R)} + ${num(y)} = ${num(x)} ✓` : `Estimate: about ${Math.round(x)} + ${Math.round(y)} = ${Math.round(x) + Math.round(y)}, so ${num(R)} makes sense.`)],
        hint: T('小數點對齊！', 'Line up the decimal points!'),
      };
    },
  },
  {
    id: 'g5-decimal-mult',
    grade: 5,
    name: T('小數的乘法', 'Multiplying decimals'),
    cur: { us: 'CCSS 5.NBT.B.7', tw: '五年級 小數的乘法', aops: 'Beast Academy 5' },
    gen(r) {
      const k = r.int(0, 2), [zn, en] = who(r);
      let A, p, B, q2;
      if (k === 0) { p = r.int(1, 2); A = r.int(10 ** p + 1, 9 * 10 ** p + 9); if (A % 10 === 0) A++; B = r.int(3, 19); q2 = 0; }
      else { p = r.int(1, 2); A = r.int(11, 99); if (A % 10 === 0) A++; q2 = 1; B = r.int(2, 9); if (k === 2) { p = 1; A = r.int(11, 29); B = r.int(4, 9); if (A % 10 === 0) A++; } }
      const x = clean(A / 10 ** p), y = clean(B / 10 ** q2), prod = A * B, R = clean(prod / 10 ** (p + q2));
      const q = [
        T(`計算 ${num(x)} × ${num(y)}。`, `Find ${num(x)} × ${num(y)}.`),
        T(`計算 ${num(x)} × ${num(y)}。`, `Find ${num(x)} × ${num(y)}.`),
        T(`${zn}的書桌桌面是長方形，長 ${num(x)} 公尺、寬 ${num(y)} 公尺。桌面面積是幾平方公尺？`, `${en}'s desk top is a rectangle ${num(x)} m long and ${num(y)} m wide. What is its area in square meters?`),
      ][k];
      return {
        q, ans: ansNum(R),
        sol: [T(`先不看小數點，當整數算：${A} × ${B} = ${num(prod)}。`, `Ignore the decimal points and multiply whole numbers: ${A} × ${B} = ${num(prod)}.`),
          T(`${num(x)} 有 ${p} 位小數${q2 ? `，${num(y)} 有 ${q2} 位小數` : `，${num(y)} 是整數`}，答案共有 ${p + q2} 位小數。`, `${num(x)} has ${p} decimal place${p > 1 ? 's' : ''}${q2 ? ` and ${num(y)} has ${q2}` : ` and ${num(y)} is a whole number`}, so the answer has ${p + q2} decimal place${p + q2 > 1 ? 's' : ''}.`),
          T(`從 ${num(prod)} 的最右邊往左數 ${p + q2} 位點上小數點：${fx(R, p + q2)}${fx(R, p + q2) !== num(R) ? `，也就是 ${num(R)}` : ''}。`, `Count ${p + q2} places from the right of ${num(prod)} and put the point: ${fx(R, p + q2)}${fx(R, p + q2) !== num(R) ? `, which is ${num(R)}` : ''}.`),
          y < 1 ? T(`檢查：${num(y)} 比 1 小，所以乘積要比 ${num(x)} 小：${num(R)} &lt; ${num(x)} ✓`, `Check: ${num(y)} is less than 1, so the product must be less than ${num(x)}: ${num(R)} &lt; ${num(x)} ✓`)
            : T(`估算：${num(x)} 約 ${Math.round(x)}，${num(y)} 約 ${Math.round(y)}，乘起來約 ${Math.round(x) * Math.round(y)}，答案合理。`, `Estimate: ${num(x)} ≈ ${Math.round(x)} and ${num(y)} ≈ ${Math.round(y)}, product ≈ ${Math.round(x) * Math.round(y)}, so the answer is reasonable.`)],
        hint: T('先當整數乘，再數小數位數。', 'Multiply as whole numbers, then count decimal places.'),
      };
    },
  },
  {
    id: 'g5-decimal-div',
    grade: 5,
    name: T('小數的除法', 'Dividing decimals'),
    cur: { us: 'CCSS 5.NBT.B.7', tw: '五年級 小數除以整數；六年級 小數除以小數', aops: 'Beast Academy 5' },
    gen(r) {
      const k = r.int(0, 3), [zn, en] = who(r);
      if (k === 0 || k === 2) {
        const d = r.int(2, 9), Q = r.int(11, 499), qv = clean(Q / 100), N = clean((Q * d) / 100);
        const q = k === 0 ? T(`計算 ${num(N)} ÷ ${d}。`, `Find ${num(N)} ÷ ${d}.`)
          : T(`一條 ${num(N)} 公尺長的繩子，平分成 ${d} 段，每段長幾公尺？`, `A rope ${num(N)} m long is cut into ${d} equal pieces. How long is each piece in meters?`);
        return {
          q, ans: ansNum(qv),
          sol: [T('小數除以整數：像整數一樣做直式除法，商的小數點要和被除數的小數點對齊。', 'Decimal ÷ whole number: do long division as usual, and put the decimal point in the quotient right above the one in the dividend.'),
            T(`想成百分位：${num(N)} 是 ${Q * d} 個 0.01，${Q * d} ÷ ${d} = ${Q}。`, `Think in hundredths: ${num(N)} is ${Q * d} hundredths, and ${Q * d} ÷ ${d} = ${Q}.`),
            T(`${Q} 個 0.01 = ${num(qv)}。`, `${Q} hundredths = ${num(qv)}.`),
            T(`驗算：${num(qv)} × ${d} = ${num(N)} ✓`, `Check: ${num(qv)} × ${d} = ${num(N)} ✓`)],
        };
      }
      const s = r.pick([10, 100]), D = s === 10 ? r.int(2, 9) : r.pick([5, 25, 4, 2, 8, 15, 12]), dv = clean(D / s), Q = r.int(3, 40), N = clean((D * Q) / s);
      const q = k === 1 ? T(`計算 ${num(N)} ÷ ${num(dv)}。`, `Find ${num(N)} ÷ ${num(dv)}.`)
        : T(`${zn}有 ${num(N)} 公斤的米，每袋裝 ${num(dv)} 公斤，可以裝幾袋？`, `${en} has ${num(N)} kg of rice and fills bags with ${num(dv)} kg each. How many bags?`);
      return {
        q, ans: ansNum(Q),
        sol: [T(`除數 ${num(dv)} 是小數。把除數和被除數同時乘以 ${s}，商不變（就像分數擴分）。`, `The divisor ${num(dv)} is a decimal. Multiply both numbers by ${s}; the quotient stays the same (like making an equivalent fraction).`),
          T(`${num(N)} ÷ ${num(dv)} = ${num(clean(N * s))} ÷ ${D}。`, `${num(N)} ÷ ${num(dv)} = ${num(clean(N * s))} ÷ ${D}.`),
          T(`${num(clean(N * s))} ÷ ${D} = ${Q}。`, `${num(clean(N * s))} ÷ ${D} = ${Q}.`),
          T(`驗算：${Q} × ${num(dv)} = ${num(N)} ✓`, `Check: ${Q} × ${num(dv)} = ${num(N)} ✓`)],
        hint: T('先把除數變成整數。', 'Make the divisor a whole number first.'),
      };
    },
  },
  {
    id: 'g5-prism-volume',
    grade: 5,
    name: T('長方體與正方體的體積', 'Volume of rectangular prisms'),
    cur: { us: 'CCSS 5.MD.C.5', tw: '五年級 長方體和正方體的體積', aops: 'Beast Academy 5' },
    gen(r) {
      const k = r.int(0, 4);
      let l = r.int(3, 15), w = r.int(2, 10), h = r.int(2, 12);
      if (k === 0) return {
        q: T(`長方體長 ${l} 公分、寬 ${w} 公分、高 ${h} 公分，體積是幾立方公分？`, `A box is ${l} cm long, ${w} cm wide and ${h} cm tall. What is its volume in cubic cm?`), fig: box(`${l} cm`, `${w} cm`, `${h} cm`), ans: ansNum(l * w * h),
        sol: [T('體積是「可以放幾個 1 立方公分的小積木」。', 'Volume counts how many 1-cm cubes fill the box.'),
          T(`底面一層有 ${l} × ${w} = ${l * w} 個，共 ${h} 層。`, `One layer on the bottom has ${l} × ${w} = ${l * w} cubes, and there are ${h} layers.`),
          T(`體積 = 長 × 寬 × 高 = ${l * w} × ${h} = ${num(l * w * h)} 立方公分。`, `Volume = length × width × height = ${l * w} × ${h} = ${num(l * w * h)} cubic cm.`)],
      };
      if (k === 1) return {
        q: T(`長方體的體積是 ${num(l * w * h)} 立方公分，長 ${l} 公分、寬 ${w} 公分。高是幾公分？`, `A box has volume ${num(l * w * h)} cubic cm. It is ${l} cm long and ${w} cm wide. How tall is it?`), fig: box(`${l} cm`, `${w} cm`, '?'), ans: ansNum(h),
        sol: [T('體積 = 底面積 × 高，所以 高 = 體積 ÷ 底面積。', 'Volume = base area × height, so height = volume ÷ base area.'), T(`底面積 = ${l} × ${w} = ${l * w}。`, `Base area = ${l} × ${w} = ${l * w}.`), T(`高 = ${num(l * w * h)} ÷ ${l * w} = ${h} 公分。`, `Height = ${num(l * w * h)} ÷ ${l * w} = ${h} cm.`)],
      };
      if (k === 2) { const s = r.int(2, 12); return {
        q: T(`正方體的邊長是 ${s} 公分，體積是幾立方公分？`, `A cube has edges ${s} cm long. What is its volume in cubic cm?`), fig: box(`${s} cm`, `${s} cm`, `${s} cm`), ans: ansNum(s ** 3),
        sol: [T('正方體的長、寬、高都一樣。', 'A cube has the same length, width and height.'), T(`體積 = ${s} × ${s} × ${s}。`, `Volume = ${s} × ${s} × ${s}.`), T(`= ${s * s} × ${s} = ${num(s ** 3)} 立方公分。`, `= ${s * s} × ${s} = ${num(s ** 3)} cubic cm.`)],
      }; }
      if (k === 3) {
        l = 10 * r.int(2, 8); w = 10 * r.int(2, 6); h = 10 * r.int(1, 5); const V = l * w * h;
        return {
          q: T(`一個長方體水箱，內部長 ${l} 公分、寬 ${w} 公分、高 ${h} 公分。裝滿水是幾公升？（1 公升 = 1000 立方公分）`, `A tank is ${l} cm long, ${w} cm wide and ${h} cm tall inside. How many liters does it hold when full? (1 liter = 1000 cubic cm)`), fig: box(`${l} cm`, `${w} cm`, `${h} cm`), ans: ansNum(V / 1000),
          sol: [T(`容積 = ${l} × ${w} × ${h} = ${num(V)} 立方公分。`, `Volume = ${l} × ${w} × ${h} = ${num(V)} cubic cm.`), T('1 公升 = 1000 立方公分，所以除以 1000。', '1 liter = 1000 cubic cm, so divide by 1000.'), T(`${num(V)} ÷ 1000 = ${num(V / 1000)} 公升。`, `${num(V)} ÷ 1000 = ${num(V / 1000)} liters.`)],
        };
      }
      l = r.int(2, 6); w = r.int(2, 5); h = r.int(2, 5);
      return {
        q: T(`用 1 立方公分的小積木堆成長 ${l} 個、寬 ${w} 個、高 ${h} 個的長方體，一共用了幾個積木？`, `Unit cubes are stacked into a box ${l} cubes long, ${w} cubes wide and ${h} cubes tall. How many cubes are used?`), fig: box(`${l}`, `${w}`, `${h}`), ans: ansNum(l * w * h),
        sol: [T(`一層有 ${l} × ${w} = ${l * w} 個。`, `One layer has ${l} × ${w} = ${l * w} cubes.`), T(`一共 ${h} 層：${l * w} × ${h} = ${l * w * h} 個。`, `There are ${h} layers: ${l * w} × ${h} = ${l * w * h} cubes.`), T('這就是體積公式 長 × 寬 × 高 的由來。', 'That is exactly why volume = length × width × height.')],
      };
    },
  },
  {
    id: 'g5-order-ops',
    grade: 5,
    name: T('四則運算與括號', 'Order of operations with parentheses'),
    cur: { us: 'CCSS 5.OA.A.1', tw: '四年級 四則運算', aops: 'Beast Academy 5' },
    at: { tw: 4 },
    gen(r) {
      const k = r.int(0, 5);
      const rule = T('規則：先算括號裡面，再算乘除（由左到右），最後算加減（由左到右）。', 'Rule: parentheses first, then × and ÷ (left to right), then + and − (left to right).');
      let e, steps, v;
      if (k === 0) { const a = r.int(5, 40), b = r.int(2, 9), c = r.int(2, 9); e = `${a} + ${b} × ${c}`; steps = [`${a} + ${b * c}`]; v = a + b * c; }
      else if (k === 1) { const a = r.int(5, 20), b = r.int(2, 15), c = r.int(2, 9); e = `(${a} + ${b}) × ${c}`; steps = [`${a + b} × ${c}`]; v = (a + b) * c; }
      else if (k === 2) { const b = r.int(5, 15), c = r.int(1, b - 2), a = r.int(2, 9), d = r.int(1, 20); e = `${a} × (${b} − ${c}) + ${d}`; steps = [`${a} × ${b - c} + ${d}`, `${a * (b - c)} + ${d}`]; v = a * (b - c) + d; }
      else if (k === 3) { const c = r.int(2, 9), qv = r.int(2, 9), b = c * qv, a = r.int(qv + 1, 60); e = `${a} − ${b} ÷ ${c}`; steps = [`${a} − ${qv}`]; v = a - qv; }
      else if (k === 4) { const c = r.int(2, 6), s = c * r.int(2, 8), a = r.int(1, s - 1), b = s - a, d = r.int(2, 5); e = `(${a} + ${b}) ÷ ${c} × ${d}`; steps = [`${s} ÷ ${c} × ${d}`, `${s / c} × ${d}`]; v = (s / c) * d; }
      else { const a = r.int(3, 12), b = r.int(3, 12), c = r.int(2, 9), d = r.int(1, Math.floor((a * b) / c) - 1); e = `${a} × ${b} − ${c} × ${d}`; steps = [`${a * b} − ${c * d}`]; v = a * b - c * d; }
      if (r.chance(0.25) && k === 0) {
        const m = e.split(' '), a = +m[0], b = +m[2], c = +m[4], target = (a + b) * c;
        const opts = [`(${a} + ${b}) × ${c}`, `${a} + (${b} × ${c})`, `${a} + ${b} × ${c}`, `${a} × ${c} + ${b}`];
        return {
          q: T(`哪一個算式的值是 ${target}？`, `Which expression equals ${target}?`), ans: ansChoice(opts),
          sol: [rule, T(`(${a} + ${b}) × ${c} = ${a + b} × ${c} = ${target} ✓`, `(${a} + ${b}) × ${c} = ${a + b} × ${c} = ${target} ✓`),
            T(`${a} + ${b} × ${c} 要先乘：${a} + ${b * c} = ${a + b * c}；加括號 ${a} + (${b} × ${c}) 也一樣是 ${a + b * c}。`, `${a} + ${b} × ${c} multiplies first: ${a} + ${b * c} = ${a + b * c}; ${a} + (${b} × ${c}) is the same, ${a + b * c}.`),
            T(`${a} × ${c} + ${b} = ${a * c + b}。所以答案是 (${a} + ${b}) × ${c}。`, `${a} × ${c} + ${b} = ${a * c + b}. So the answer is (${a} + ${b}) × ${c}.`)],
        };
      }
      return {
        q: T(`計算 ${e}。`, `Find ${e}.`), ans: ansNum(v),
        sol: [rule, T(`${e}`, `${e}`), ...steps.map((s) => T(`= ${s}`, `= ${s}`)), T(`= ${v}`, `= ${v}`)],
        hint: T('先乘除、後加減；括號最優先。', 'Parentheses first, then multiply/divide, then add/subtract.'),
      };
    },
  },
  {
    id: 'g5-coord-q1',
    grade: 5,
    name: T('坐標平面（第一象限）', 'The coordinate plane (first quadrant)'),
    cur: { us: 'CCSS 5.G.A.2', tw: '七年級 直角坐標平面', aops: 'Beast Academy 5' },
    at: { tw: 7 },
    gen(r) {
      const k = r.int(0, 3), n = 8;
      const how = T('坐標 (x, y)：先從原點往右走 x 格，再往上走 y 格。', 'A point (x, y): start at the origin, go right x, then up y.');
      if (k === 0) {
        const x = r.int(1, n), y = r.int(1, n);
        return {
          q: T('點 A 的坐標是什麼？請寫成 (x, y)。', 'What are the coordinates of point A? Answer as (x, y).'), fig: gridQ1(n, [{ x, y, label: 'A' }]), ans: ansPair(x, y),
          sol: [how, T(`從 A 往下看到 x 軸：${x}。`, `Look straight down from A to the x-axis: ${x}.`), T(`從 A 往左看到 y 軸：${y}。`, `Look straight left from A to the y-axis: ${y}.`), T(`A = (${x}, ${y})。注意先寫 x 再寫 y。`, `A = (${x}, ${y}). Remember: x first, then y.`)],
        };
      }
      if (k === 1) {
        const y = r.int(1, n), x1 = r.int(0, n - 2), x2 = r.int(x1 + 1, n), vert = r.chance(0.5);
        const A = vert ? [y, x1] : [x1, y], B = vert ? [y, x2] : [x2, y];
        return {
          q: T(`A(${A[0]}, ${A[1]}) 和 B(${B[0]}, ${B[1]}) 之間的距離是幾格？`, `How many units apart are A(${A[0]}, ${A[1]}) and B(${B[0]}, ${B[1]})?`),
          fig: gridQ1(n, [{ x: A[0], y: A[1], label: 'A' }, { x: B[0], y: B[1], label: 'B' }]), ans: ansNum(x2 - x1),
          sol: [T(`兩點的 ${vert ? 'x' : 'y'} 坐標一樣（都是 ${y}），所以它們在同一條${vert ? '直' : '橫'}線上。`, `Both points have the same ${vert ? 'x' : 'y'}-coordinate (${y}), so they lie on the same ${vert ? 'vertical' : 'horizontal'} line.`),
            T(`距離就是另一個坐標的差：${x2} − ${x1} = ${x2 - x1}。`, `The distance is the difference of the other coordinate: ${x2} − ${x1} = ${x2 - x1}.`), T(`答案：${x2 - x1} 格。`, `Answer: ${x2 - x1} units.`)],
        };
      }
      if (k === 2) {
        const x = r.int(0, 4), y = r.int(0, 4), dx = r.int(1, 4), dy = r.int(1, 4);
        return {
          q: T(`點 P 在 (${x}, ${y})。把它往右移 ${dx} 格、往上移 ${dy} 格，新的坐標是什麼？請寫成 (x, y)。`, `Point P is at (${x}, ${y}). Move it ${dx} right and ${dy} up. What are its new coordinates? Answer as (x, y).`),
          fig: gridQ1(n, [{ x, y, label: 'P' }]), ans: ansPair(x + dx, y + dy),
          sol: [T('往右移會讓 x 變大，往上移會讓 y 變大。', 'Moving right increases x; moving up increases y.'), T(`x：${x} + ${dx} = ${x + dx}；y：${y} + ${dy} = ${y + dy}。`, `x: ${x} + ${dx} = ${x + dx}; y: ${y} + ${dy} = ${y + dy}.`), T(`新坐標 (${x + dx}, ${y + dy})。`, `New point: (${x + dx}, ${y + dy}).`)],
        };
      }
      let x, y; do { x = r.int(1, n); y = r.int(1, n); } while (x === y);
      const pts = [[x, y], [y, x]]; while (pts.length < 4) { const p = [r.int(1, n), r.int(1, n)]; if (!pts.some((q) => q[0] === p[0] && q[1] === p[1])) pts.push(p); }
      const order = r.shuffle([0, 1, 2, 3]), L = ['A', 'B', 'C', 'D'];
      const labelOf = (i) => L[order.indexOf(i)];
      return {
        q: T(`哪一個點的坐標是 (${x}, ${y})？`, `Which point is at (${x}, ${y})?`),
        fig: gridQ1(n, pts.map((p, i) => ({ x: p[0], y: p[1], label: labelOf(i) }))), ans: ansChoice([labelOf(0), labelOf(1), labelOf(2), labelOf(3)]),
        sol: [how, T(`往右 ${x} 格、往上 ${y} 格，找到點 ${labelOf(0)}。`, `Go right ${x} and up ${y}: that is point ${labelOf(0)}.`), T(`小心：點 ${labelOf(1)} 是 (${y}, ${x})，x 和 y 顛倒了。`, `Careful: point ${labelOf(1)} is (${y}, ${x}) — x and y swapped.`)],
      };
    },
  },
  {
    id: 'g5-powers-of-10',
    grade: 5,
    name: T('乘除以 10、100、1000', 'Multiplying and dividing by powers of 10'),
    cur: { us: 'CCSS 5.NBT.A.2', tw: '五年級 小數乘以 10、100、1000', aops: 'Beast Academy 5' },
    gen(r) {
      const k = r.int(0, 4), e = r.int(1, 3), P10 = 10 ** e;
      const x = clean(r.int(101, 9999) / 10 ** r.int(1, 3));
      if (k === 0) return {
        q: T(`計算 ${num(x)} × ${num(P10)}。`, `Find ${num(x)} × ${num(P10)}.`), ans: ansNum(clean(x * P10)),
        sol: [T(`乘以 ${num(P10)}，每個數字都變大 ${num(P10)} 倍，小數點向右移 ${e} 位。`, `Multiplying by ${num(P10)} makes every digit ${num(P10)} times bigger: the decimal point moves ${e} place${e > 1 ? 's' : ''} right.`),
          T(`${num(x)} → ${num(clean(x * P10))}（位數不夠時補 0）。`, `${num(x)} → ${num(clean(x * P10))} (fill with zeros if needed).`), T(`答案：${num(clean(x * P10))}。`, `Answer: ${num(clean(x * P10))}.`)],
      };
      if (k === 1) return {
        q: T(`計算 ${num(x)} ÷ ${num(P10)}。`, `Find ${num(x)} ÷ ${num(P10)}.`), ans: ansNum(clean(x / P10)),
        sol: [T(`除以 ${num(P10)}，每個數字都變小，小數點向左移 ${e} 位。`, `Dividing by ${num(P10)} makes every digit smaller: the decimal point moves ${e} place${e > 1 ? 's' : ''} left.`),
          T(`${num(x)} → ${num(clean(x / P10))}（前面不夠時補 0）。`, `${num(x)} → ${num(clean(x / P10))} (put zeros in front if needed).`), T(`答案：${num(clean(x / P10))}。`, `Answer: ${num(clean(x / P10))}.`)],
      };
      if (k === 2) { const n = r.int(2, 7), m = r.int(2, 9); return {
        q: T(`${m} × ${pow(10, n)} 是多少？`, `What is ${m} × ${pow(10, n)}?`), ans: ansNum(m * 10 ** n),
        sol: [T(`${pow(10, n)} 表示 ${n} 個 10 相乘：${Array(n).fill(10).join(' × ')} = ${num(10 ** n)}（1 後面 ${n} 個 0）。`, `${pow(10, n)} means ${n} tens multiplied: ${Array(n).fill(10).join(' × ')} = ${num(10 ** n)} (1 followed by ${n} zeros).`),
          T(`${m} × ${num(10 ** n)}：在 ${m} 後面補 ${n} 個 0。`, `${m} × ${num(10 ** n)}: write ${m} and then ${n} zeros.`), T(`= ${num(m * 10 ** n)}。`, `= ${num(m * 10 ** n)}.`)],
      }; }
      if (k === 3) return {
        q: T(`${num(x)} × ? = ${num(clean(x * P10))}，? 是多少？`, `${num(x)} × ? = ${num(clean(x * P10))}. What is ?`), ans: ansNum(P10),
        sol: [T(`比較兩個數：小數點向右移了 ${e} 位。`, `Compare the two numbers: the decimal point moved ${e} place${e > 1 ? 's' : ''} to the right.`), T(`向右移 ${e} 位就是乘以 ${num(P10)}。`, `Moving ${e} place${e > 1 ? 's' : ''} right means multiplying by ${num(P10)}.`), T(`? = ${num(P10)}。`, `? = ${num(P10)}.`)],
      };
      const [bz, be, sz, se, f] = r.pick([['公尺', 'm', '公分', 'cm', 100], ['公里', 'km', '公尺', 'm', 1000], ['公斤', 'kg', '公克', 'g', 1000], ['公升', 'L', '毫升', 'mL', 1000]]);
      const y = clean(r.int(11, 999) / 100), toSmall = r.chance(0.6), Y = clean(y * f);
      return {
        q: toSmall ? T(`${num(y)} ${bz} = 幾${sz}？`, `${num(y)} ${be} = how many ${se}?`) : T(`${num(Y)} ${sz} = 幾${bz}？`, `${num(Y)} ${se} = how many ${be}?`),
        ans: ansNum(toSmall ? Y : y),
        sol: [T(`1 ${bz} = ${f} ${sz}。`, `1 ${be} = ${f} ${se}.`),
          toSmall ? T(`大單位換小單位，乘以 ${f}：${num(y)} × ${f} = ${num(Y)}。`, `Big unit to small unit: multiply by ${f}. ${num(y)} × ${f} = ${num(Y)}.`) : T(`小單位換大單位，除以 ${f}：${num(Y)} ÷ ${f} = ${num(y)}。`, `Small unit to big unit: divide by ${f}. ${num(Y)} ÷ ${f} = ${num(y)}.`),
          T(`答案：${num(toSmall ? Y : y)} ${toSmall ? sz : bz}。`, `Answer: ${num(toSmall ? Y : y)} ${toSmall ? se : be}.`)],
      };
    },
  },
  {
    id: 'g5-gcf-lcm',
    grade: 5,
    name: T('公因數與公倍數', 'Greatest common factor and least common multiple'),
    cur: { us: 'CCSS 6.NS.B.4', tw: '五年級 公因數與公倍數', aops: 'Beast Academy 5' },
    at: { us: 6 },
    gen(r) {
      const k = r.int(0, 3), [zn, en] = who(r);
      let g, m, n; do { g = r.int(2, 12); m = r.int(1, 7); n = r.int(2, 9); } while (gcd(m, n) > 1 || m === n);
      const a = g * m, b = g * n, G = gcd(a, b), L = lcm(a, b);
      const fa = factors(a), fb = factors(b), com = fa.filter((x) => b % x === 0);
      const gcfSteps = [T(`${a} 的因數：${fa.join('、')}。`, `Factors of ${a}: ${fa.join(', ')}.`), T(`${b} 的因數：${fb.join('、')}。`, `Factors of ${b}: ${fb.join(', ')}.`), T(`公因數：${com.join('、')}；最大的是 ${G}。`, `Common factors: ${com.join(', ')}. The greatest is ${G}.`)];
      const big = Math.max(a, b), small = Math.min(a, b), ms = range(1, L / big).map((i) => i * big);
      const lcmSteps = [T(`列出較大數 ${big} 的倍數：${ms.join('、')}。`, `List multiples of the bigger number ${big}: ${ms.join(', ')}.`), T(`找第一個也是 ${small} 的倍數的：${L}（${L} ÷ ${small} = ${L / small}）。`, `Find the first one that is also a multiple of ${small}: ${L} (${L} ÷ ${small} = ${L / small}).`), T(`最小公倍數是 ${L}。也可以用 ${a} × ${b} ÷ ${G} = ${L} 檢查。`, `The least common multiple is ${L}. Check: ${a} × ${b} ÷ ${G} = ${L}.`)];
      if (k === 0) return { q: T(`${a} 和 ${b} 的最大公因數是多少？`, `What is the greatest common factor (GCF) of ${a} and ${b}?`), ans: ansNum(G), sol: gcfSteps };
      if (k === 1) return { q: T(`${a} 和 ${b} 的最小公倍數是多少？`, `What is the least common multiple (LCM) of ${a} and ${b}?`), ans: ansNum(L), sol: lcmSteps };
      if (k === 2) return {
        q: T(`${zn}有 ${a} 顆糖果和 ${b} 塊餅乾，要分裝成相同的禮物袋，每袋的糖果一樣多、餅乾也一樣多，而且都要剛好分完。最多可以裝幾袋？`, `${en} has ${a} candies and ${b} cookies to pack into identical gift bags, with nothing left over. What is the greatest number of bags possible?`),
        ans: ansNum(G), sol: [T(`袋數必須同時整除 ${a} 和 ${b}，所以是公因數；要最多袋，就找最大公因數。`, `The number of bags must divide both ${a} and ${b} — a common factor. For the most bags, find the greatest common factor.`), ...gcfSteps,
          T(`每袋有 ${a / G} 顆糖果和 ${b / G} 塊餅乾。`, `Each bag gets ${a / G} candies and ${b / G} cookies.`)],
      };
      return {
        q: T(`甲公車每 ${a} 分鐘發一班，乙公車每 ${b} 分鐘發一班。早上 7 點兩班車同時發車，下一次同時發車是幾分鐘後？`, `Bus A leaves every ${a} minutes and Bus B every ${b} minutes. Both leave together at 7:00. After how many minutes will they next leave together?`),
        ans: ansNum(L), sol: [T(`甲車發車的時間是 ${a} 的倍數，乙車是 ${b} 的倍數；同時發車就是公倍數，最早一次是最小公倍數。`, `Bus A leaves at multiples of ${a}, Bus B at multiples of ${b}. Together means a common multiple; the first time is the least common multiple.`), ...lcmSteps],
      };
    },
  },
  {
    id: 'g5-area-tri-para-trap',
    grade: 5,
    name: T('三角形、平行四邊形、梯形面積', 'Area of triangles, parallelograms and trapezoids'),
    cur: { us: 'CCSS 6.G.A.1', tw: '五年級 三角形、平行四邊形與梯形的面積', aops: 'Beast Academy 5' },
    at: { us: 6 },
    gen(r) {
      const k = r.int(0, 3);
      const dash = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="f-acc" stroke-width="1.5" stroke-dasharray="4 3"/>`;
      if (k === 0 || k === 3) {
        let b = r.int(4, 20), h = r.int(3, 16); if ((b * h) % 2) b++;
        const A = (b * h) / 2, apex = r.int(50, 150);
        const fig = shape([[20, 140], [200, 140], [apex, 30]], [{ x: 110, y: 156, s: k === 3 ? `${b} cm` : `${b} cm` }, { x: apex + 18, y: 88, s: k === 3 ? '?' : `${h} cm`, acc: true }], 220, 170, dash(apex, 30, apex, 140));
        if (k === 3) return {
          q: T(`三角形的面積是 ${A} 平方公分，底是 ${b} 公分。高是幾公分？`, `A triangle has area ${A} square cm and base ${b} cm. What is its height?`), fig, ans: ansNum(h),
          sol: [T('三角形面積 = 底 × 高 ÷ 2，所以 底 × 高 = 面積 × 2。', 'Triangle area = base × height ÷ 2, so base × height = area × 2.'), T(`${b} × 高 = ${A} × 2 = ${2 * A}。`, `${b} × height = ${A} × 2 = ${2 * A}.`), T(`高 = ${2 * A} ÷ ${b} = ${h} 公分。`, `Height = ${2 * A} ÷ ${b} = ${h} cm.`)],
        };
        return {
          q: T(`三角形的底是 ${b} 公分、高是 ${h} 公分，面積是幾平方公分？`, `A triangle has base ${b} cm and height ${h} cm. What is its area in square cm?`), fig, ans: ansNum(A),
          sol: [T('兩個一樣的三角形可以拼成一個平行四邊形，所以三角形面積是它的一半。', 'Two copies of the triangle make a parallelogram, so the triangle is half of it.'), T('三角形面積 = 底 × 高 ÷ 2。', 'Triangle area = base × height ÷ 2.'), T(`${b} × ${h} ÷ 2 = ${b * h} ÷ 2 = ${A} 平方公分。`, `${b} × ${h} ÷ 2 = ${b * h} ÷ 2 = ${A} square cm.`)],
        };
      }
      if (k === 1) {
        const b = r.int(5, 20), h = r.int(3, 15), s = r.int(h + 1, h + 6);
        return {
          q: T(`平行四邊形的底是 ${b} 公分、高是 ${h} 公分（斜邊長 ${s} 公分）。面積是幾平方公分？`, `A parallelogram has base ${b} cm and height ${h} cm (its slanted side is ${s} cm). What is its area in square cm?`),
          fig: shape([[20, 140], [160, 140], [200, 40], [60, 40]], [{ x: 90, y: 156, s: `${b} cm` }, { x: 96, y: 90, s: `${h} cm`, acc: true }, { x: 196, y: 92, s: `${s} cm` }], 220, 170, dash(80, 40, 80, 140)),
          ans: ansNum(b * h),
          sol: [T('把平行四邊形左邊切下一個三角形，移到右邊，就變成長方形。', 'Cut a triangle off one side and slide it to the other: it becomes a rectangle.'), T(`長方形的長是底 ${b}、寬是高 ${h}，所以面積 = 底 × 高（斜邊 ${s} 用不到！）。`, `The rectangle is ${b} by ${h}, so area = base × height. (The slanted side ${s} is not used!)`), T(`${b} × ${h} = ${b * h} 平方公分。`, `${b} × ${h} = ${b * h} square cm.`)],
        };
      }
      let a = r.int(3, 12), c = r.int(a + 2, a + 12), h = r.int(2, 12); if (((a + c) * h) % 2) h++;
      return {
        q: T(`梯形的上底 ${a} 公分、下底 ${c} 公分、高 ${h} 公分，面積是幾平方公分？`, `A trapezoid has parallel sides ${a} cm and ${c} cm and height ${h} cm. What is its area in square cm?`),
        fig: shape([[20, 140], [200, 140], [150, 40], [60, 40]], [{ x: 105, y: 28, s: `${a} cm` }, { x: 110, y: 156, s: `${c} cm` }, { x: 84, y: 90, s: `${h} cm`, acc: true }], 220, 170, dash(70, 40, 70, 140)),
        ans: ansNum(((a + c) * h) / 2),
        sol: [T('兩個一樣的梯形，一個倒過來拼在一起，會變成平行四邊形，底是 上底 + 下底。', 'Two copies of the trapezoid, one flipped, make a parallelogram whose base is (top + bottom).'), T('所以梯形面積 = (上底 + 下底) × 高 ÷ 2。', 'So trapezoid area = (top + bottom) × height ÷ 2.'), T(`(${a} + ${c}) × ${h} ÷ 2 = ${a + c} × ${h} ÷ 2 = ${(a + c) * h} ÷ 2 = ${((a + c) * h) / 2} 平方公分。`, `(${a} + ${c}) × ${h} ÷ 2 = ${a + c} × ${h} ÷ 2 = ${(a + c) * h} ÷ 2 = ${((a + c) * h) / 2} square cm.`)],
      };
    },
  },
  {
    id: 'g5-percent-intro',
    grade: 5,
    name: T('百分率', 'Introduction to percent'),
    cur: { us: 'CCSS 6.RP.A.3c', tw: '五年級 百分率', aops: 'Beast Academy 5' },
    at: { us: 6 },
    gen(r) {
      const k = r.int(0, 3), [zn, en] = who(r);
      const mean = T('百分率就是「每 100 份中佔幾份」，p% = p ÷ 100。', 'Percent means "out of 100": p% = p ÷ 100.');
      if (k === 0) {
        const d = r.pick([2, 4, 5, 10, 20, 25, 50]); let n = r.int(1, d - 1); while (gcd(n, d) > 1) n = r.int(1, d - 1);
        const p = (n * 100) / d;
        return {
          q: T(`${frac(n, d)} 等於百分之幾？（填數字）`, `${frac(n, d)} is what percent? (Type the number.)`), fig: hundred(p), ans: ansNum(p),
          sol: [mean, T(`把分母變成 100：分子分母同乘 ${100 / d}，${frac(n, d)} = ${frac(p, 100)}。`, `Make the denominator 100: multiply top and bottom by ${100 / d}: ${frac(n, d)} = ${frac(p, 100)}.`), T(`${frac(p, 100)} = ${p}%。`, `${frac(p, 100)} = ${p}%.`)],
        };
      }
      if (k === 1) {
        const p = r.int(1, 99), toDec = r.chance(0.5);
        return {
          q: toDec ? T(`${p}% 寫成小數是多少？`, `Write ${p}% as a decimal.`) : T(`${num(p / 100)} 是百分之幾？（填數字）`, `${num(p / 100)} is what percent? (Type the number.)`), fig: hundred(p), ans: ansNum(toDec ? p / 100 : p),
          sol: [mean, toDec ? T(`${p}% = ${frac(p, 100)} = ${num(p / 100)}（小數點向左移兩位）。`, `${p}% = ${frac(p, 100)} = ${num(p / 100)} (move the point two places left).`) : T(`${num(p / 100)} = ${frac(p, 100)}，也就是 100 份中的 ${p} 份。`, `${num(p / 100)} = ${frac(p, 100)}, that is ${p} out of 100.`),
            T(`答案：${toDec ? num(p / 100) : p + '%'}。`, `Answer: ${toDec ? num(p / 100) : p + '%'}.`)],
        };
      }
      if (k === 2) {
        const tot = r.pick([20, 25, 50, 200, 400]), part = r.int(1, tot - 1), p = (part * 100) / tot;
        if (!Number.isInteger(p)) return G5[12].gen(r);
        return {
          q: T(`班上有 ${tot} 位同學參加調查，其中 ${part} 位喜歡游泳。喜歡游泳的佔百分之幾？（填數字）`, `${tot} students were surveyed and ${part} of them like swimming. What percent like swimming? (Type the number.)`), ans: ansNum(p),
          sol: [T(`喜歡游泳的佔 ${frac(part, tot)}。`, `The fraction who like swimming is ${frac(part, tot)}.`), T(`化成分母 100：${tot > 100 ? `分子分母同除以 ${tot / 100}` : `分子分母同乘 ${100 / tot}`}，得 ${frac(p, 100)}。`, `Make the denominator 100: ${tot > 100 ? `divide top and bottom by ${tot / 100}` : `multiply top and bottom by ${100 / tot}`} to get ${frac(p, 100)}.`), T(`= ${p}%。`, `= ${p}%.`)],
        };
      }
      const p = 10 * r.int(1, 9), N = 10 * r.int(2, 30);
      return {
        q: T(`${zn}有 ${N} 元，花了其中的 ${p}%。花了幾元？`, `${en} has $${N} and spends ${p}% of it. How many dollars did ${en} spend?`), ans: ansNum((p * N) / 100),
        sol: [mean, T(`${N} 的 10% 是 ${N} ÷ 10 = ${N / 10}。`, `10% of ${N} is ${N} ÷ 10 = ${N / 10}.`), T(`${p}% 是 ${p / 10} 個 10%：${N / 10} × ${p / 10} = ${(p * N) / 100} 元。`, `${p}% is ${p / 10} groups of 10%: ${N / 10} × ${p / 10} = ${(p * N) / 100} dollars.`)],
      };
    },
  },
  {
    id: 'g5-mean',
    grade: 5,
    name: T('平均數', 'Finding the average (mean)'),
    cur: { us: 'CCSS 6.SP.B.5c', aops: 'Beast Academy 5' },
    at: { us: 6 },
    gen(r) {
      const k = r.int(0, 3), [zn, en] = who(r), n = r.int(3, 6), M = r.int(6, 90);
      let vs; do { vs = Array.from({ length: n }, () => M + r.int(-Math.min(5, M - 1), 5)); vs[n - 1] = M * n - sum(vs.slice(0, n - 1)); } while (vs[n - 1] <= 0);
      const S = sum(vs), mean = S / n;
      if (k === 0 || k === 3) {
        const q = k === 0 ? T(`求 ${vs.join('、')} 的平均數。`, `Find the mean of ${vs.join(', ')}.`)
          : T(`${zn}這 ${n} 次數學小考的分數如圖。平均幾分？`, `The chart shows ${en}'s scores on ${n} quizzes. What is the mean score?`);
        return {
          q, fig: k === 3 ? bars(vs.map((v, i) => ({ label: `#${i + 1}`, v })), Math.ceil(Math.max(...vs) / 10) * 10) : '', ans: ansNum(mean),
          sol: [T('平均數 = 總和 ÷ 個數。就像把多的分給少的，讓每個都一樣多。', 'Mean = total ÷ how many. It is like evening out the values so they are all the same.'),
            T(`總和：${vs.join(' + ')} = ${S}。`, `Total: ${vs.join(' + ')} = ${S}.`), T(`共有 ${n} 個數：${S} ÷ ${n} = ${mean}。`, `There are ${n} values: ${S} ÷ ${n} = ${mean}.`)],
        };
      }
      if (k === 1) {
        const known = vs.slice(0, n - 1), miss = vs[n - 1];
        return {
          q: T(`${n} 個數的平均是 ${mean}。其中 ${n - 1} 個是 ${known.join('、')}，最後一個數是多少？`, `The mean of ${n} numbers is ${mean}. ${n - 1} of them are ${known.join(', ')}. What is the last number?`), ans: ansNum(miss),
          sol: [T(`總和 = 平均 × 個數 = ${mean} × ${n} = ${S}。`, `Total = mean × count = ${mean} × ${n} = ${S}.`), T(`已知的和：${known.join(' + ')} = ${sum(known)}。`, `The known numbers add to ${known.join(' + ')} = ${sum(known)}.`), T(`最後一個 = ${S} − ${sum(known)} = ${miss}。`, `The last number = ${S} − ${sum(known)} = ${miss}.`)],
        };
      }
      const a = r.int(70, 90), t1 = r.int(3, 5), b = r.int(Math.max(60, a - 15), Math.min(100, a + 15));
      const need = b * (t1 + 1) - a * t1;
      if (need > 100 || need < 0) return G5[13].gen(r);
      return {
        q: T(`${zn}前 ${t1} 次考試平均 ${a} 分。第 ${t1 + 1} 次要考幾分，${t1 + 1} 次的平均才會是 ${b} 分？`, `${en}'s mean on the first ${t1} tests is ${a}. What score on test ${t1 + 1} makes the mean of all ${t1 + 1} tests equal ${b}?`), ans: ansNum(need),
        sol: [T(`前 ${t1} 次的總分：${a} × ${t1} = ${a * t1}。`, `Total of the first ${t1} tests: ${a} × ${t1} = ${a * t1}.`), T(`${t1 + 1} 次要平均 ${b}，總分要 ${b} × ${t1 + 1} = ${b * (t1 + 1)}。`, `For a mean of ${b} over ${t1 + 1} tests, the total must be ${b} × ${t1 + 1} = ${b * (t1 + 1)}.`), T(`第 ${t1 + 1} 次：${b * (t1 + 1)} − ${a * t1} = ${need} 分。`, `Test ${t1 + 1}: ${b * (t1 + 1)} − ${a * t1} = ${need}.`)],
      };
    },
  },
  {
    id: 'g5-prime-factorization',
    grade: 5,
    name: T('指數與質因數分解', 'Exponents and prime factorization'),
    cur: { tw: '六年級 質因數分解', aops: 'Beast Academy 5' },
    at: { tw: 6 },
    gen(r) {
      const k = r.int(0, 3);
      const N = r.pick([12, 18, 20, 24, 28, 36, 40, 44, 45, 48, 50, 54, 56, 60, 63, 72, 75, 80, 84, 88, 90, 96, 98, 100, 108, 120, 126, 135, 144, 150, 168, 180, 196, 200, 210, 225, 240, 252, 270, 300]);
      const tree = (n, sep) => { const o = []; let m = n; for (const p of primeFactors(n)) { o.push(`${m} = ${p} × ${m / p}`); m /= p; if (m === 1 || isPrime(m)) break; } return o.join(sep); };
      if (k === 0) {
        const pf = primeFactors(N), right = pfHtml(N);
        const big = pf.length > 2 ? `${pf[0] * pf[1]} × ${pf.slice(2).join(' × ')}` : `1 × ${N}`;
        const wrongExp = (() => { const m = {}; for (const p of pf) m[p] = (m[p] || 0) + 1; const ks = Object.keys(m); const i = ks.findIndex((p) => m[p] > 1); const kk = ks[i >= 0 ? i : 0]; m[kk] = m[kk] + 1; return ks.map((p) => (m[p] > 1 ? pow(p, m[p]) : p)).join(' × '); })();
        const other = (() => { const p = pf[0]; return `${p} × ${N / p}`; })();
        const opts = uniq([right, big, wrongExp, other, `${pf.join(' + ')}`].filter((x) => x !== right).map((x) => x), 3);
        return {
          q: T(`${N} 的質因數分解是哪一個？`, `Which is the prime factorization of ${N}?`), ans: ansChoice([right, ...opts]),
          sol: [T('質因數分解：把數寫成「只有質數」相乘。', 'Prime factorization writes a number as a product of primes only.'), T(`一直除以最小的質數：${tree(N, '，')}。`, `Keep dividing by the smallest prime: ${tree(N, '; ')}.`),
            T(`所以 ${N} = ${pfFlat(N)} = ${right}。（4、6、9 這種合數不能留在答案裡。）`, `So ${N} = ${pfFlat(N)} = ${right}. (Composite pieces like 4, 6, 9 are not allowed.)`)],
        };
      }
      if (k === 1) {
        const a = r.int(1, 4), b = r.int(1, 3), c = r.int(0, 1), v = 2 ** a * 3 ** b * 5 ** c;
        const e = [a > 1 ? pow(2, a) : '2', b > 1 ? pow(3, b) : '3', c ? '5' : ''].filter(Boolean).join(' × ');
        return {
          q: T(`計算 ${e}。`, `Find ${e}.`), ans: ansNum(v),
          sol: [T('指數表示同一個數連乘幾次，例如 2³ = 2 × 2 × 2。', 'An exponent tells how many times to multiply a number by itself: 2³ = 2 × 2 × 2.'),
            T(`${pow(2, a)} = ${2 ** a}，${pow(3, b)} = ${3 ** b}${c ? '，再乘 5' : ''}。`, `${pow(2, a)} = ${2 ** a}, ${pow(3, b)} = ${3 ** b}${c ? ', then times 5' : ''}.`), T(`${2 ** a} × ${3 ** b}${c ? ' × 5' : ''} = ${v}。`, `${2 ** a} × ${3 ** b}${c ? ' × 5' : ''} = ${v}.`)],
        };
      }
      if (k === 2) {
        const a = r.int(2, 6), others = r.pick([[3], [5], [3, 5], [3, 3], [7]]), M = others.reduce((s, x) => s * x, 1), v = 2 ** a * M;
        return {
          q: T(`${v} = 2<sup>a</sup> × ${others.join(' × ')}，a 是多少？`, `${v} = 2<sup>a</sup> × ${others.join(' × ')}. What is a?`), ans: ansNum(a),
          sol: [T(`先除掉其他的因數：${v} ÷ ${M} = ${2 ** a}。`, `Divide out the other factors: ${v} ÷ ${M} = ${2 ** a}.`), T(`${2 ** a} = ${Array(a).fill(2).join(' × ')}，共 ${a} 個 2。`, `${2 ** a} = ${Array(a).fill(2).join(' × ')}: ${a} twos.`), T(`所以 a = ${a}。`, `So a = ${a}.`)],
        };
      }
      const b = r.pick([2, 3, 4, 5, 10]), e = b === 2 ? r.int(4, 8) : b === 10 ? r.int(2, 6) : r.int(2, 4);
      return {
        q: T(`${pow(b, e)} 是多少？`, `What is ${pow(b, e)}?`), ans: ansNum(b ** e),
        sol: [T(`${pow(b, e)} 表示 ${e} 個 ${b} 相乘，不是 ${b} × ${e}！`, `${pow(b, e)} means ${e} copies of ${b} multiplied, not ${b} × ${e}!`), T(`${Array(e).fill(b).join(' × ')}`, `${Array(e).fill(b).join(' × ')}`), T(`= ${num(b ** e)}。`, `= ${num(b ** e)}.`)],
      };
    },
  },
  {
    id: 'g5-frac-word',
    grade: 5,
    name: T('分數應用題', 'Fraction word problems'),
    cur: { us: 'CCSS 5.NF.B.6', tw: '五年級 分數的乘法', aops: 'Beast Academy 5' },
    gen(r) {
      const k = r.int(0, 3), [zn, en] = who(r);
      let b, a; do { b = r.pick([3, 4, 5, 6, 8, 10]); a = r.int(1, b - 1); } while (gcd(a, b) > 1);
      if (k === 0) {
        const M = b * r.int(4, 30), sp = (M / b) * a;
        return {
          q: T(`${zn}有 ${M} 元，花掉了 ${frac(a, b)}。還剩幾元？`, `${en} has $${M} and spends ${frac(a, b)} of it. How many dollars are left?`), ans: ansNum(M - sp),
          sol: [T(`${M} 的 ${frac(1, b)} 是 ${M} ÷ ${b} = ${M / b}。`, `${frac(1, b)} of ${M} is ${M} ÷ ${b} = ${M / b}.`), T(`花掉 ${frac(a, b)}：${M / b} × ${a} = ${sp} 元。`, `Spent ${frac(a, b)}: ${M / b} × ${a} = ${sp} dollars.`), T(`剩下：${M} − ${sp} = ${M - sp} 元。（也可以算 ${M} × ${frac(b - a, b)} = ${M - sp}）`, `Left: ${M} − ${sp} = ${M - sp} dollars. (Or ${M} × ${frac(b - a, b)} = ${M - sp}.)`)],
        };
      }
      if (k === 1) {
        let d, c; do { d = r.pick([2, 3, 4, 5]); c = r.int(1, d - 1); } while (gcd(c, d) > 1);
        const N = b * d * r.int(1, 4), girls = (N / b) * a; if (girls % d) return G5[15].gen(r);
        const gl = (girls / d) * c;
        return {
          q: T(`班上有 ${N} 人，其中 ${frac(a, b)} 是女生，女生中有 ${frac(c, d)} 戴眼鏡。戴眼鏡的女生有幾人？`, `A class has ${N} students. ${frac(a, b)} of them are girls, and ${frac(c, d)} of the girls wear glasses. How many girls wear glasses?`), ans: ansNum(gl),
          sol: [T(`女生：${N} × ${frac(a, b)} = ${girls} 人。`, `Girls: ${N} × ${frac(a, b)} = ${girls}.`), T(`戴眼鏡的女生：${girls} × ${frac(c, d)} = ${gl} 人。`, `Girls with glasses: ${girls} × ${frac(c, d)} = ${gl}.`), T(`一步算：${N} × ${frac(a, b)} × ${frac(c, d)} = ${N} × ${fracR(a * c, b * d)} = ${gl}。`, `In one step: ${N} × ${frac(a, b)} × ${frac(c, d)} = ${N} × ${fracR(a * c, b * d)} = ${gl}.`)],
        };
      }
      if (k === 2) {
        let d, c; do { d = r.pick([2, 3, 4, 5]); c = r.int(1, d - 1); } while (gcd(c, d) > 1);
        const rest = [b - a, b], used2 = fmul([c, d], rest), left = fsub(rest, used2);
        return {
          q: T(`${zn}第一天讀了一本書的 ${frac(a, b)}，第二天讀了剩下的 ${frac(c, d)}。還沒讀的部分是全書的幾分之幾？${LOWEST.zh}`, `${en} reads ${frac(a, b)} of a book on day 1 and ${frac(c, d)} of the rest on day 2. What fraction of the whole book is still unread? ${LOWEST.en}`),
          ans: ansFrac(...left),
          sol: [T(`第一天後剩下：1 − ${frac(a, b)} = ${frac(b - a, b)}。`, `After day 1, the part left is 1 − ${frac(a, b)} = ${frac(b - a, b)}.`),
            T(`第二天讀了剩下的 ${frac(c, d)}，所以還剩下「剩下的」${frac(d - c, d)}。`, `Day 2 uses ${frac(c, d)} of that, so ${frac(d - c, d)} of it remains.`),
            T(`${frac(b - a, b)} × ${frac(d - c, d)} = ${fracR(...left)}。`, `${frac(b - a, b)} × ${frac(d - c, d)} = ${fracR(...left)}.`),
            T('注意：「剩下的幾分之幾」是以剩下的部分當整體，不是以全書當整體。', 'Careful: "of the rest" means a fraction of what was left, not of the whole book.')],
        };
      }
      const n = r.int(3, 12), [p, q2] = red(a * n, b);
      return {
        q: T(`做一批餅乾要 ${frac(a, b)} 杯牛奶。做 ${n} 批要幾杯牛奶？${LOWEST.zh}`, `One batch of cookies needs ${frac(a, b)} cup of milk. How many cups for ${n} batches? ${LOWEST.en}`), ans: ansFrac(p, q2),
        sol: [T(`${n} 批就是 ${n} 個 ${frac(a, b)}：${n} × ${frac(a, b)}。`, `${n} batches means ${n} groups of ${frac(a, b)}: ${n} × ${frac(a, b)}.`), T(`= ${frac(n * a, b)}${q2 !== b ? ` = ${fracR(p, q2)}` : ''}。`, `= ${frac(n * a, b)}${q2 !== b ? ` = ${fracR(p, q2)}` : ''}.`), T(`${p > q2 && q2 > 1 ? `化成帶分數：${mixed(p, q2)} 杯。` : `答案：${fracR(p, q2)} 杯。`}`, `${p > q2 && q2 > 1 ? `As a mixed number: ${mixed(p, q2)} cups.` : `Answer: ${fracR(p, q2)} cups.`}`)],
      };
    },
  },
];

// =====================================================================================
// GRADE 6
// =====================================================================================
const PI_NOTE = T('（圓周率用 3.14 計算）', '(Use 3.14 for π.)');
const G6 = [
  {
    id: 'g6-ratio',
    grade: 6,
    name: T('比與比值', 'Ratios and ratio values'),
    cur: { us: 'CCSS 6.RP.A.1', tw: '六年級 比與比值', aops: 'Prealgebra' },
    gen(r) {
      const k = r.int(0, 4), [zn, en] = who(r);
      let m, n; do { m = r.int(1, 9); n = r.int(2, 9); } while (m === n || gcd(m, n) > 1);
      const g = r.int(2, 9), a = m * g, b = n * g, s = r.int(2, 9);
      if (k === 0) {
        const right = `${m} : ${n}`, half = g % 2 === 0 && g > 2 ? `${a / 2} : ${b / 2}` : `${m + 1} : ${n + 1}`;
        const wr = uniq([`${n} : ${m}`, half, `${a} : ${n}`, `${m} : ${b}`].filter((x) => x !== right), 3);
        return {
          q: T(`${a} : ${b} 化成最簡整數比是哪一個？`, `Which is ${a} : ${b} in simplest form?`), ans: ansChoice([right, ...wr]),
          sol: [T('比的前項和後項同時除以同一個數（不是 0），比的關係不變。', 'Dividing both terms of a ratio by the same (nonzero) number keeps the ratio the same.'),
            T(`${a} 和 ${b} 的最大公因數是 ${g}。`, `The greatest common factor of ${a} and ${b} is ${g}.`), T(`${a} ÷ ${g} = ${m}，${b} ÷ ${g} = ${n}，所以是 ${right}。`, `${a} ÷ ${g} = ${m}, ${b} ÷ ${g} = ${n}, so it is ${right}.`),
            T('注意順序：前項對前項，不可以前後顛倒。', 'Keep the order: the first term stays first.')],
        };
      }
      if (k === 1) return {
        q: T(`${a} : ${b} 的比值是多少？（用最簡分數回答）`, `What is the value of the ratio ${a} : ${b} (that is, ${a} ÷ ${b})? (Answer in lowest terms.)`), ans: ansFrac(m, n),
        sol: [T(`比值 = 前項 ÷ 後項 = ${a} ÷ ${b} = ${frac(a, b)}。`, `Ratio value = first term ÷ second term = ${a} ÷ ${b} = ${frac(a, b)}.`), T(`分子分母同除以 ${g}：${frac(a, b)} = ${frac(m, n)}。`, `Divide top and bottom by ${g}: ${frac(a, b)} = ${frac(m, n)}.`), T(`比值是 ${frac(m, n)}${m > n ? `（= ${mixed(m, n)}）` : ''}。相等的比，比值一樣。`, `The ratio value is ${frac(m, n)}${m > n ? ` (= ${mixed(m, n)})` : ''}. Equal ratios have equal values.`)],
      };
      if (k === 2) return {
        q: T(`${m} : ${n} = ${m * s} : ?，? 是多少？`, `${m} : ${n} = ${m * s} : ?. What is ?`), ans: ansNum(n * s),
        sol: [T(`前項從 ${m} 變成 ${m * s}，是乘以 ${s}。`, `The first term went from ${m} to ${m * s}: multiplied by ${s}.`), T(`後項也要乘以 ${s}：${n} × ${s} = ${n * s}。`, `Multiply the second term by ${s} too: ${n} × ${s} = ${n * s}.`), T(`檢查比值：${frac(m, n)} = ${frac(m * s, n * s)} ✓`, `Check the values: ${frac(m, n)} = ${frac(m * s, n * s)} ✓`)],
      };
      if (k === 3) return {
        q: T(`合唱團男生和女生人數的比是 ${m} : ${n}。男生有 ${m * s} 人，女生有幾人？`, `In a choir, the ratio of boys to girls is ${m} : ${n}. There are ${m * s} boys. How many girls are there?`), ans: ansNum(n * s),
        sol: [T(`${m} : ${n} 表示每 ${m} 個男生，就有 ${n} 個女生。`, `${m} : ${n} means for every ${m} boys there are ${n} girls.`), T(`${m * s} ÷ ${m} = ${s}，有 ${s} 組這樣的人。`, `${m * s} ÷ ${m} = ${s}, so there are ${s} such groups.`), T(`女生：${n} × ${s} = ${n * s} 人。`, `Girls: ${n} × ${s} = ${n * s}.`)],
      };
      const tot = (m + n) * s, big = Math.max(m, n) * s;
      return {
        q: T(`${zn}和姊姊按照 ${m} : ${n} 的比分 ${tot} 張卡片（${zn}是 ${m}）。分得比較多的人拿到幾張？`, `${en} and a sister share ${tot} cards in the ratio ${m} : ${n} (${en} gets the ${m} part). How many cards does the person with more get?`), ans: ansNum(big),
        sol: [T(`把卡片分成 ${m} + ${n} = ${m + n} 等份。`, `Split the cards into ${m} + ${n} = ${m + n} equal parts.`), T(`每份：${tot} ÷ ${m + n} = ${s} 張。`, `One part: ${tot} ÷ ${m + n} = ${s} cards.`),
          T(`${zn}：${m} × ${s} = ${m * s}；姊姊：${n} × ${s} = ${n * s}。比較多的是 ${big} 張。`, `${en}: ${m} × ${s} = ${m * s}; sister: ${n} × ${s} = ${n * s}. The larger share is ${big}.`)],
      };
    },
  },
  {
    id: 'g6-unit-rate',
    grade: 6,
    name: T('單價與單位量（率）', 'Unit rates and unit prices'),
    cur: { us: 'CCSS 6.RP.A.3b', tw: '六年級 比與比值', aops: 'Prealgebra' },
    gen(r) {
      const k = r.int(0, 3), [zn, en] = who(r);
      if (k === 0) {
        const n = r.int(3, 12), u = r.int(4, 45), P = n * u, it = r.pick([['枝', '筆', 'pens'], ['個', '蘋果', 'apples'], ['本', '筆記本', 'notebooks']]);
        return {
          q: T(`${n} ${it[0]}${it[1]}賣 ${P} 元，1 ${it[0]}多少元？`, `${n} ${it[2]} cost $${P}. What is the price of one?`), ans: ansNum(u),
          sol: [T('單價就是「1 個要多少錢」：總價 ÷ 數量。', 'Unit price = total cost ÷ number of items.'), T(`${P} ÷ ${n} = ${u} 元。`, `${P} ÷ ${n} = ${u} dollars.`), T(`驗算：${u} × ${n} = ${P} ✓`, `Check: ${u} × ${n} = ${P} ✓`)],
        };
      }
      if (k === 1) {
        let n1, n2, u1, u2; do { n1 = r.int(2, 8); n2 = r.int(2, 8); u1 = r.int(5, 30); u2 = r.int(5, 30); } while (n1 === n2 || u1 === u2 && r.chance(0.7));
        const P1 = n1 * u1, P2 = n2 * u2;
        const opts = [T('A 比較便宜', 'Pack A is the better buy'), T('B 比較便宜', 'Pack B is the better buy'), T('一樣便宜', 'They cost the same per can')];
        const ri = u1 < u2 ? 0 : u1 > u2 ? 1 : 2;
        return {
          q: T(`飲料 A 包裝：${n1} 罐 ${P1} 元；B 包裝：${n2} 罐 ${P2} 元。哪一種每罐比較便宜？`, `Drinks: pack A has ${n1} cans for $${P1}; pack B has ${n2} cans for $${P2}. Which is cheaper per can?`),
          ans: ansChoice([opts[ri], ...opts.filter((_, i) => i !== ri)]),
          sol: [T('罐數不同，不能只看總價，要比「每罐多少錢」。', 'The packs have different numbers of cans, so compare the price per can, not the total.'),
            T(`A：${P1} ÷ ${n1} = ${u1} 元／罐。B：${P2} ÷ ${n2} = ${u2} 元／罐。`, `A: ${P1} ÷ ${n1} = $${u1} per can. B: ${P2} ÷ ${n2} = $${u2} per can.`), T(`所以${opts[ri].zh}。`, `So: ${opts[ri].en}.`)],
        };
      }
      if (k === 2) {
        const m = r.int(2, 6), u = r.int(15, 60), t = r.int(3, 15), W = m * u;
        return {
          q: T(`${zn} ${m} 分鐘打了 ${W} 個字。照這個速度，${t} 分鐘可以打幾個字？`, `${en} types ${W} words in ${m} minutes. At this rate, how many words in ${t} minutes?`), ans: ansNum(u * t),
          sol: [T(`先求 1 分鐘打幾個字（單位量）：${W} ÷ ${m} = ${u} 個。`, `First find the unit rate (words per minute): ${W} ÷ ${m} = ${u}.`), T(`${t} 分鐘：${u} × ${t} = ${u * t} 個字。`, `In ${t} minutes: ${u} × ${t} = ${u * t} words.`), T('先求「1 份」再求「多份」，是解率問題的好方法。', 'Find "one unit" first, then scale up — a great way to solve rate problems.')],
        };
      }
      const L = r.int(3, 40), u = r.int(8, 20), D = L * u;
      return {
        q: T(`一輛車用 ${L} 公升汽油可以跑 ${D} 公里。平均每公升可以跑幾公里？`, `A car goes ${D} km on ${L} liters of gas. How many km per liter is that?`), ans: ansNum(u),
        sol: [T('「每公升跑幾公里」= 距離 ÷ 汽油量。', '"km per liter" = distance ÷ liters.'), T(`${D} ÷ ${L} = ${u}。`, `${D} ÷ ${L} = ${u}.`), T(`每公升 ${u} 公里。`, `${u} km per liter.`)],
      };
    },
  },
  {
    id: 'g6-percent',
    grade: 6,
    name: T('百分率的應用（折扣、求全部）', 'Percent problems: part, whole and discounts'),
    cur: { us: 'CCSS 6.RP.A.3c', tw: '六年級 百分率的應用', aops: 'Prealgebra' },
    gen(r) {
      const k = r.int(0, 4), [zn, en] = who(r);
      const p = r.pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80]), W = 20 * r.int(2, 40), part = (p * W) / 100;
      if (!Number.isInteger(part)) return G6[2].gen(r);
      if (k === 0) return {
        q: T(`${W} 的 ${p}% 是多少？`, `What is ${p}% of ${W}?`), ans: ansNum(part),
        sol: [T(`${p}% = ${frac(p, 100)}。「的」表示乘。`, `${p}% = ${frac(p, 100)}, and "of" means multiply.`), T(`${W} × ${frac(p, 100)} = ${W * p} ÷ 100 = ${part}。`, `${W} × ${frac(p, 100)} = ${W * p} ÷ 100 = ${part}.`), T(`檢查：1% 是 ${num(W / 100)}，${p}% 就是 ${num(W / 100)} × ${p} = ${part} ✓`, `Check: 1% is ${num(W / 100)}, so ${p}% is ${num(W / 100)} × ${p} = ${part} ✓`)],
      };
      if (k === 1) return {
        q: T(`某數的 ${p}% 是 ${part}，這個數是多少？`, `${p}% of a number is ${part}. What is the number?`), ans: ansNum(W),
        sol: [T(`某數 × ${frac(p, 100)} = ${part}。`, `number × ${frac(p, 100)} = ${part}.`), T(`${p}% 是 ${part}，所以 1% 是 ${part} ÷ ${p} = ${num(part / p)}。`, `${p}% is ${part}, so 1% is ${part} ÷ ${p} = ${num(part / p)}.`), T(`100% 是 ${num(part / p)} × 100 = ${W}。`, `100% is ${num(part / p)} × 100 = ${W}.`)],
      };
      if (k === 2) return {
        q: T(`${zn}投籃 ${W} 次，進了 ${part} 次。命中率是百分之幾？（填數字）`, `${en} took ${W} shots and made ${part}. What percent were made? (Type the number.)`), ans: ansNum(p),
        sol: [T(`命中率 = 進球 ÷ 投籃 = ${frac(part, W)}。`, `Success rate = made ÷ taken = ${frac(part, W)}.`), T(`${part} ÷ ${W} = ${num(p / 100)}。`, `${part} ÷ ${W} = ${num(p / 100)}.`), T(`${num(p / 100)} = ${p}%。`, `${num(p / 100)} = ${p}%.`)],
      };
      if (k === 3) {
        const [zz, pay] = r.pick([['九折', 90], ['八折', 80], ['七折', 70], ['六折', 60], ['七五折', 75], ['八五折', 85], ['半價（五折）', 50]]), P = 100 * r.int(2, 30), S = (P * pay) / 100;
        return {
          q: T(`一雙球鞋原價 ${P} 元，打${zz}，要付幾元？`, `A pair of sneakers costs $${P}. They are ${100 - pay}% off. What is the sale price in dollars?`), ans: ansNum(S),
          sol: [T(`打${zz}表示只付原價的 ${pay}%（也就是便宜了 ${100 - pay}%）。`, `${100 - pay}% off means you pay only ${pay}% of the price.`),
            T(`${P} × ${pay}% = ${P} × ${num(pay / 100)} = ${S} 元。`, `${P} × ${pay}% = ${P} × ${num(pay / 100)} = $${S}.`), T(`省了 ${P} − ${S} = ${P - S} 元。`, `You save ${P} − ${S} = $${P - S}.`)],
        };
      }
      const P = 20 * r.int(2, 40), q2 = r.pick([10, 20, 25, 50]), up = (P * q2) / 100;
      return {
        q: T(`一盒點心原本賣 ${P} 元，漲價 ${q2}%。現在賣幾元？`, `A box of snacks cost $${P}. The price goes up ${q2}%. What is the new price?`), ans: ansNum(P + up),
        sol: [T(`漲了：${P} × ${q2}% = ${up} 元。`, `Increase: ${P} × ${q2}% = $${up}.`), T(`新價格：${P} + ${up} = ${P + up} 元。`, `New price: ${P} + ${up} = $${P + up}.`), T(`也可以一步算：${P} × ${100 + q2}% = ${P + up}。`, `Or in one step: ${P} × ${100 + q2}% = ${P + up}.`)],
      };
    },
  },
  {
    id: 'g6-frac-div',
    grade: 6,
    name: T('分數除以分數', 'Dividing fractions by fractions'),
    cur: { us: 'CCSS 6.NS.A.1', tw: '六年級 分數的除法', aops: 'Prealgebra' },
    gen(r) {
      const k = r.int(0, 3), [zn, en] = who(r);
      const fr = (lo = 2, hi = 9) => { let d, n; do { d = r.int(lo, hi); n = r.int(1, d - 1); } while (gcd(n, d) > 1); return [n, d]; };
      let X, Y = fr(), q;
      if (k === 0) { X = fr(); q = T(`計算 ${frac(...X)} ÷ ${frac(...Y)}。${LOWEST.zh}`, `Find ${frac(...X)} ÷ ${frac(...Y)}. ${LOWEST.en}`); }
      else if (k === 1) { const f = fr(), w = r.int(1, 4); X = [w * f[1] + f[0], f[1]]; q = T(`計算 ${mixed(...X)} ÷ ${frac(...Y)}。${LOWEST.zh}`, `Find ${mixed(...X)} ÷ ${frac(...Y)}. ${LOWEST.en}`); }
      else if (k === 2) { const c = r.int(2, 12); X = fmul(Y, [c, 1]); q = T(`${zn}有 ${mixed(...X)} 公斤的糖，每包裝 ${frac(...Y)} 公斤，可以裝幾包？`, `${en} has ${mixed(...X)} kg of sugar and puts ${frac(...Y)} kg in each bag. How many bags can be filled?`); }
      else { X = [r.int(2, 9), 1]; q = T(`計算 ${X[0]} ÷ ${frac(...Y)}。${LOWEST.zh}`, `Find ${X[0]} ÷ ${frac(...Y)}. ${LOWEST.en}`); }
      const [n, m] = fdiv(X, Y), sx = X[1] === 1 ? num(X[0]) : frac(...X);
      const sol = [];
      if (k === 1 || (k === 2 && X[0] > X[1])) sol.push(T(`先把帶分數化成假分數：${mixed(...X)} = ${frac(...X)}。`, `First write the mixed number as an improper fraction: ${mixed(...X)} = ${frac(...X)}.`));
      sol.push(
        T(`除以一個分數，等於乘以它的倒數（分子分母顛倒）：${frac(...Y)} 的倒數是 ${frac(Y[1], Y[0])}。`, `Dividing by a fraction is the same as multiplying by its reciprocal (flip it): the reciprocal of ${frac(...Y)} is ${frac(Y[1], Y[0])}.`),
        T(`${sx} ÷ ${frac(...Y)} = ${sx} × ${frac(Y[1], Y[0])} = ${frac(X[0] * Y[1], X[1] * Y[0])}。`, `${sx} ÷ ${frac(...Y)} = ${sx} × ${frac(Y[1], Y[0])} = ${frac(X[0] * Y[1], X[1] * Y[0])}.`),
        T(`約分：${fracR(n, m)}${n > m && m > 1 ? `（= ${mixed(n, m)}）` : ''}。`, `Simplify: ${fracR(n, m)}${n > m && m > 1 ? ` (= ${mixed(n, m)})` : ''}.`),
        T(`為什麼？「${sx} 裡有幾個 ${frac(...Y)}」——驗算：${fracR(n, m)} × ${frac(...Y)} = ${fracR(...X)} ✓`, `Why? It asks "how many ${frac(...Y)}s fit in ${sx}?" Check: ${fracR(n, m)} × ${frac(...Y)} = ${fracR(...X)} ✓`),
      );
      return { q, ans: k === 2 ? ansNum(n / m) : ansFrac(n, m), sol, hint: T('除以分數 = 乘以倒數。', 'Divide by a fraction = multiply by its reciprocal.') };
    },
  },
  {
    id: 'g6-integers-abs',
    grade: 6,
    name: T('負數與絕對值', 'Integers and absolute value'),
    cur: { us: 'CCSS 6.NS.C.7', tw: '七年級 負數與絕對值', aops: 'Prealgebra' },
    at: { tw: 7 },
    gen(r) {
      const k = r.int(0, 3);
      const absDef = T('絕對值 |a| 是 a 到 0 的距離，所以一定不是負的。', 'The absolute value |a| is the distance from a to 0, so it is never negative.');
      if (k === 0) {
        const a = r.nz(-30, 30), b = r.nz(-30, 30), plus = r.chance(0.5), v = plus ? Math.abs(a) + Math.abs(b) : Math.abs(a) - Math.abs(b);
        return {
          q: T(`計算 |${num(a)}| ${plus ? '+' : '−'} |${num(b)}|。`, `Find |${num(a)}| ${plus ? '+' : '−'} |${num(b)}|.`), ans: ansNum(v),
          sol: [absDef, T(`|${num(a)}| = ${Math.abs(a)}，|${num(b)}| = ${Math.abs(b)}。`, `|${num(a)}| = ${Math.abs(a)} and |${num(b)}| = ${Math.abs(b)}.`), T(`${Math.abs(a)} ${plus ? '+' : '−'} ${Math.abs(b)} = ${num(v)}。`, `${Math.abs(a)} ${plus ? '+' : '−'} ${Math.abs(b)} = ${num(v)}.`)],
        };
      }
      if (k === 1) {
        let vs; do vs = [r.int(-20, -1), r.int(-20, -1), r.int(-20, 20), r.int(-5, 15)]; while (new Set(vs).size < 4);
        const big = r.chance(0.5), best = big ? Math.max(...vs) : Math.min(...vs);
        return {
          q: T(`下面哪一個數${big ? '最大' : '最小'}？`, `Which number is the ${big ? 'greatest' : 'least'}?`), ans: ansChoice([num(best), ...vs.filter((v) => v !== best).map(num)]),
          sol: [T('在數線上，越右邊的數越大。負數都在 0 的左邊。', 'On a number line, numbers get bigger to the right. Negative numbers are left of 0.'),
            T(`由小到大：${vs.slice().sort((x, y) => x - y).map(num).join(' &lt; ')}。`, `From least to greatest: ${vs.slice().sort((x, y) => x - y).map(num).join(' &lt; ')}.`),
            T(`注意：負數後面的數字越大，其實越小。例如 ${num(Math.min(...vs))} 在最左邊，所以最小。`, `Careful: for negative numbers, a bigger digit means a smaller number. For example ${num(Math.min(...vs))} is farthest left, so it is the least.`),
            T(`答案：${num(best)}。`, `Answer: ${num(best)}.`)],
        };
      }
      if (k === 2) {
        const t0 = r.int(-5, 12), d = r.int(t0 + 2, t0 + 15), v = t0 - d, [cz, ce] = r.pick([['合歡山', 'a mountain town'], ['北海道', 'a northern city'], ['南極站', 'a polar station']]);
        return {
          q: T(`${cz}傍晚的氣溫是 ${num(t0)}°C，半夜下降了 ${d}°C。半夜的氣溫是幾度？`, `In ${ce}, the evening temperature is ${num(t0)}°C. By midnight it drops ${d}°C. What is the midnight temperature?`), fig: numberLine(-20, 15, [{ v: t0, label: num(t0) }, { v, label: '?', hi: true }], 5), ans: ansNum(v),
          sol: [T(`下降 ${d} 度就是往數線左邊走 ${d} 格：${num(t0)} − ${d}。`, `Dropping ${d}° means moving ${d} left on the number line: ${num(t0)} − ${d}.`),
            ...(t0 > 0 ? [T(`先降 ${t0} 度到 0°C，還要再降 ${d - t0} 度。`, `First drop ${t0}° to reach 0°C, then ${d - t0}° more.`)] : []),
            T(`${num(t0)} − ${d} = ${num(v)}°C。`, `${num(t0)} − ${d} = ${num(v)}°C.`)],
        };
      }
      const a = r.int(5, 60), b = r.int(3, 40);
      return {
        q: T(`潛水員在海平面下 ${a} 公尺（記作 −${a} 公尺），海鷗在海平面上 ${b} 公尺。兩者高度相差幾公尺？`, `A diver is ${a} m below sea level (written −${a} m) and a seagull is ${b} m above sea level. How far apart are they vertically, in meters?`), ans: ansNum(a + b),
        sol: [T('海平面當作 0，上面是正、下面是負。', 'Sea level is 0: above is positive, below is negative.'), T(`潛水員到海平面 |−${a}| = ${a} 公尺，海平面到海鷗 ${b} 公尺。`, `From the diver up to sea level is |−${a}| = ${a} m; from sea level to the gull is ${b} m.`), T(`相差 ${b} − (−${a}) = ${b} + ${a} = ${a + b} 公尺。`, `Difference: ${b} − (−${a}) = ${b} + ${a} = ${a + b} m.`)],
      };
    },
  },
  {
    id: 'g6-number-line',
    grade: 6,
    name: T('數線上的正負數', 'Positive and negative numbers on the number line'),
    cur: { us: 'CCSS 6.NS.C.6', tw: '七年級 數線', aops: 'Prealgebra' },
    at: { tw: 7 },
    gen(r) {
      const k = r.int(0, 3);
      if (k === 0) {
        const v = r.nz(-9, 9);
        return {
          q: T('數線上點 A 代表的數是多少？', 'What number does point A show on the number line?'), fig: numberLine(-10, 10, [{ v, label: 'A', hi: true }], 2), ans: ansNum(v),
          sol: [T('每一個刻度相差 2，刻度中間是奇數。', 'Each tick mark is 2 apart, so halfway between ticks is an odd number.'), T(`A 在 0 的${v < 0 ? '左' : '右'}邊，所以是${v < 0 ? '負數' : '正數'}。`, `A is to the ${v < 0 ? 'left' : 'right'} of 0, so it is ${v < 0 ? 'negative' : 'positive'}.`), T(`A = ${num(v)}。`, `A = ${num(v)}.`)],
        };
      }
      if (k === 1) {
        const a = r.int(-9, 0), b = r.int(a + 2, 9);
        return {
          q: T(`數線上 A = ${num(a)}，B = ${num(b)}。A 和 B 的距離是多少？`, `On a number line A = ${num(a)} and B = ${num(b)}. What is the distance between A and B?`),
          fig: numberLine(-10, 10, [{ v: a, label: 'A' }, { v: b, label: 'B', hi: true }], 1), ans: ansNum(b - a),
          sol: [T('兩點的距離 = 大的數 − 小的數。', 'Distance between two points = greater number − smaller number.'), T(`${num(b)} − ${par(a)} = ${num(b - a)}。`, `${num(b)} − ${par(a)} = ${num(b - a)}.`),
            ...(a < 0 && b > 0 ? [T(`也可以分段想：A 到 0 是 ${-a}，0 到 B 是 ${b}，${-a} + ${b} = ${b - a}。`, `Or in two parts: A to 0 is ${-a}, 0 to B is ${b}, and ${-a} + ${b} = ${b - a}.`)] : [])],
        };
      }
      if (k === 2) {
        const a = r.int(-6, 6), d = r.int(2, 9), left = r.chance(0.6), v = left ? a - d : a + d;
        if (v < -10 || v > 10) return G6[5].gen(r);
        return {
          q: T(`從 ${num(a)} 出發，往${left ? '左' : '右'}走 ${d} 個單位，會到哪一個數？`, `Start at ${num(a)} and move ${d} units to the ${left ? 'left' : 'right'}. Where do you land?`), fig: numberLine(-10, 10, [{ v: a, label: 'start' }], 1), ans: ansNum(v),
          sol: [T(`往${left ? '左' : '右'}走表示${left ? '減' : '加'}：${num(a)} ${left ? '−' : '+'} ${d}。`, `Moving ${left ? 'left' : 'right'} means ${left ? 'subtracting' : 'adding'}: ${num(a)} ${left ? '−' : '+'} ${d}.`), T(`= ${num(v)}。`, `= ${num(v)}.`), T(`在數線上數 ${d} 格檢查一下。`, `Count ${d} steps on the number line to check.`)],
        };
      }
      let a, b; do { a = r.int(-10, 4); b = r.int(a + 2, 10); } while ((a + b) % 2 !== 0);
      const m = (a + b) / 2;
      return {
        q: T(`${num(a)} 和 ${num(b)} 正中間的數是多少？`, `What number is exactly halfway between ${num(a)} and ${num(b)}?`), fig: numberLine(-10, 10, [{ v: a, label: num(a) }, { v: b, label: num(b) }], 1), ans: ansNum(m),
        sol: [T(`兩數的距離：${num(b)} − ${par(a)} = ${b - a}。`, `Distance between them: ${num(b)} − ${par(a)} = ${b - a}.`), T(`一半是 ${(b - a) / 2}，從 ${num(a)} 往右走 ${(b - a) / 2}：${num(a)} + ${(b - a) / 2} = ${num(m)}。`, `Half of it is ${(b - a) / 2}. From ${num(a)} move right ${(b - a) / 2}: ${num(a)} + ${(b - a) / 2} = ${num(m)}.`), T(`也可以算平均：(${num(a)} + ${num(b)}) ÷ 2 = ${num(m)}。`, `Or average them: (${num(a)} + ${num(b)}) ÷ 2 = ${num(m)}.`)],
      };
    },
  },
  {
    id: 'g6-expressions',
    grade: 6,
    name: T('代數式：列式與求值', 'Writing and evaluating expressions'),
    cur: { us: 'CCSS 6.EE.A.2', tw: '七年級 代數式', aops: 'Prealgebra' },
    at: { tw: 7 },
    gen(r) {
      const k = r.int(0, 3);
      if (k === 0) {
        const a = r.int(2, 9), b = r.int(1, 20), x = r.int(2, 12), minus = r.chance(0.4) && a * x > b, v = minus ? a * x - b : a * x + b;
        const e = `${a}x ${minus ? '−' : '+'} ${b}`;
        return {
          q: T(`當 x = ${x} 時，${e} 的值是多少？`, `Find the value of ${e} when x = ${x}.`), ans: ansNum(v),
          sol: [T(`${a}x 表示 ${a} × x。把 x 換成 ${x}。`, `${a}x means ${a} × x. Replace x with ${x}.`), T(`${a} × ${x} ${minus ? '−' : '+'} ${b} = ${a * x} ${minus ? '−' : '+'} ${b}`, `${a} × ${x} ${minus ? '−' : '+'} ${b} = ${a * x} ${minus ? '−' : '+'} ${b}`), T(`= ${v}。`, `= ${v}.`)],
        };
      }
      if (k === 1) {
        const x = r.int(2, 9), y = r.int(2, 9), c = r.int(1, 15), f = r.int(0, 2);
        const [e, steps, v] = f === 0 ? [`3x + 2y`, `3 × ${x} + 2 × ${y} = ${3 * x} + ${2 * y}`, 3 * x + 2 * y]
          : f === 1 ? [`xy − ${c}`, `${x} × ${y} − ${c} = ${x * y} − ${c}`, x * y - c]
            : [`${pow('x', 2)} + y`, `${x} × ${x} + ${y} = ${x * x} + ${y}`, x * x + y];
        return {
          q: T(`當 x = ${x}、y = ${y} 時，${e} 的值是多少？`, `Find the value of ${e} when x = ${x} and y = ${y}.`), ans: ansNum(v),
          sol: [T('數字和字母、字母和字母寫在一起表示相乘，例如 xy = x × y。', 'A number next to a letter, or two letters together, means multiply: xy = x × y.'), T(steps, steps), T(`= ${num(v)}。`, `= ${num(v)}.`)],
        };
      }
      if (k === 2) {
        let a, b; do { a = r.int(2, 9); b = r.int(1, 9); } while (a === b);
        const f = r.int(0, 3);
        const P = [
          [`比 n 的 ${a} 倍多 ${b}`, `${b} more than ${a} times n`, `${a}n + ${b}`, [`${b}n + ${a}`, `${a}(n + ${b})`, `(${a} + ${b})n`]],
          [`n 與 ${b} 的和的 ${a} 倍`, `${a} times the sum of n and ${b}`, `${a}(n + ${b})`, [`${a}n + ${b}`, `n + ${a * b}`, `${a} + n + ${b}`]],
          [`n 的 ${a} 倍減去 ${b}`, `${b} less than ${a} times n`, `${a}n − ${b}`, [`${b} − ${a}n`, `${a}(n − ${b})`, `${b}n − ${a}`]],
          [`n 除以 ${a} 再加 ${b}`, `n divided by ${a}, plus ${b}`, `n ÷ ${a} + ${b}`, [`${a} ÷ n + ${b}`, `n ÷ (${a} + ${b})`, `(n + ${b}) ÷ ${a}`]],
        ][f];
        return {
          q: T(`「${P[0]}」用代數式表示是哪一個？`, `Which expression means "${P[1]}"?`), ans: ansChoice([P[2], ...P[3]]),
          sol: [T('照文字的順序一步一步翻譯，注意哪個先算。', 'Translate step by step, paying attention to what happens first.'),
            T(f === 1 ? `「n 與 ${b} 的和」先算，要加括號：(n + ${b})，再乘 ${a}。` : f === 3 ? `先 n ÷ ${a}，再加 ${b}。` : `「n 的 ${a} 倍」是 ${a}n，再${f === 0 ? `加 ${b}` : `減 ${b}`}。`,
              f === 1 ? `"The sum of n and ${b}" comes first, so it needs parentheses: (n + ${b}); then multiply by ${a}.` : f === 3 ? `First n ÷ ${a}, then add ${b}.` : `"${a} times n" is ${a}n; then ${f === 0 ? `add ${b}` : `subtract ${b}`}${f === 2 ? ` ("${b} less than" means take ${b} away)` : ''}.`),
            T(`答案：${P[2]}。`, `Answer: ${P[2]}.`)],
        };
      }
      let a, b, c; do { a = r.int(2, 9); b = r.int(1, 9); c = r.int(1, 12); } while (a === b);
      const right = lin(a + b, c), opts = uniq([right, `${a + b + c}x`, `${a + b}${pow('x', 2)} + ${c}`, lin(a * b, c), lin(a + b + 1, c)], 4);
      return {
        q: T(`化簡 ${a}x + ${b === 1 ? '' : b}x + ${c}。`, `Simplify ${a}x + ${b === 1 ? '' : b}x + ${c}.`), ans: ansChoice(opts),
        sol: [T(`${a}x 和 ${b === 1 ? '' : b}x 是同類項（都有 x），可以合併：${a} 個 x 加 ${b} 個 x 是 ${a + b} 個 x。`, `${a}x and ${b === 1 ? '' : b}x are like terms (both have x), so combine them: ${a} x's plus ${b} x's is ${a + b} x's.`),
          T(`${c} 沒有 x，不能和 x 項合併。`, `${c} has no x, so it cannot combine with the x terms.`), T(`結果：${right}。`, `Result: ${right}.`)],
      };
    },
  },
  {
    id: 'g6-exponents',
    grade: 6,
    name: T('指數與含指數的運算', 'Exponents and order of operations'),
    cur: { us: 'CCSS 6.EE.A.1', tw: '七年級 指數', aops: 'Prealgebra' },
    at: { tw: 7 },
    gen(r) {
      const k = r.int(0, 3);
      if (k === 0) {
        const f = r.int(0, 2), a = r.int(1, 20), b = r.int(2, 6), c = r.int(2, 5);
        const [e, steps, v] = f === 0 ? [`${a} + ${pow(b, 2)} × ${c}`, [`${a} + ${b * b} × ${c}`, `${a} + ${b * b * c}`], a + b * b * c]
          : f === 1 ? [`(${c} + ${b})${'<sup>2</sup>'} − ${a}`, [`${pow(c + b, 2)} − ${a}`, `${(c + b) ** 2} − ${a}`], (c + b) ** 2 - a]
            : [`${pow(c, 3)} ÷ ${c} + ${a}`, [`${c ** 3} ÷ ${c} + ${a}`, `${c * c} + ${a}`], c * c + a];
        return {
          q: T(`計算 ${e}。`, `Find ${e}.`), ans: ansNum(v),
          sol: [T('運算順序：括號 → 指數 → 乘除 → 加減。', 'Order: parentheses → exponents → multiply/divide → add/subtract.'), ...steps.map((s) => T(`= ${s}`, `= ${s}`)), T(`= ${num(v)}`, `= ${num(v)}`)],
        };
      }
      if (k === 1) {
        const b = r.pick([2, 3, 4, 5, 10]), e = b === 2 ? r.int(3, 10) : b === 10 ? r.int(3, 8) : r.int(2, 5), v = b ** e;
        return {
          q: T(`${b}<sup>?</sup> = ${num(v)}，? 是多少？`, `${b}<sup>?</sup> = ${num(v)}. What is ?`), ans: ansNum(e),
          sol: [T(`一直乘 ${b}，數數乘了幾次：${range(1, e).map((i) => num(b ** i)).join(' → ')}。`, `Keep multiplying by ${b} and count: ${range(1, e).map((i) => num(b ** i)).join(' → ')}.`), T(`${num(v)} = ${Array(e).fill(b).join(' × ')}，共 ${e} 個 ${b}。`, `${num(v)} = ${Array(e).fill(b).join(' × ')}: ${e} factors of ${b}.`), T(`? = ${e}。`, `? = ${e}.`)],
        };
      }
      if (k === 2) {
        let a, b; do { a = r.int(2, 6); b = r.int(2, 6); } while (a === b);
        const L = a ** b, R = b ** a, sym = L > R ? '&gt;' : L < R ? '&lt;' : '=';
        return {
          q: T(`在 ○ 裡填入 &gt;、&lt; 或 =：${pow(a, b)} ○ ${pow(b, a)}`, `Fill in &gt;, &lt; or =: ${pow(a, b)} ○ ${pow(b, a)}`), ans: ansChoice([sym, ...['&gt;', '&lt;', '='].filter((o) => o !== sym)]),
          sol: [T(`${pow(a, b)} = ${Array(b).fill(a).join(' × ')} = ${num(L)}。`, `${pow(a, b)} = ${Array(b).fill(a).join(' × ')} = ${num(L)}.`), T(`${pow(b, a)} = ${Array(a).fill(b).join(' × ')} = ${num(R)}。`, `${pow(b, a)} = ${Array(a).fill(b).join(' × ')} = ${num(R)}.`), T(`所以 ${pow(a, b)} ${sym} ${pow(b, a)}。`, `So ${pow(a, b)} ${sym} ${pow(b, a)}.`)],
        };
      }
      let n, d; do { d = r.int(2, 6); n = r.int(1, d - 1); } while (gcd(n, d) > 1);
      const e = d <= 4 ? r.int(2, 3) : 2;
      return {
        q: T(`計算 (${frac(n, d)})<sup>${e}</sup>。（用最簡分數回答）`, `Find (${frac(n, d)})<sup>${e}</sup>. (Answer in lowest terms.)`), ans: ansFrac(n ** e, d ** e),
        sol: [T(`(${frac(n, d)})<sup>${e}</sup> = ${Array(e).fill(frac(n, d)).join(' × ')}。`, `(${frac(n, d)})<sup>${e}</sup> = ${Array(e).fill(frac(n, d)).join(' × ')}.`), T(`分子：${pow(n, e)} = ${n ** e}；分母：${pow(d, e)} = ${d ** e}。`, `Top: ${pow(n, e)} = ${n ** e}; bottom: ${pow(d, e)} = ${d ** e}.`), T(`答案 ${frac(n ** e, d ** e)}。（真分數的次方會變小！）`, `Answer: ${frac(n ** e, d ** e)}. (Powers of a fraction less than 1 get smaller!)`)],
      };
    },
  },
  {
    id: 'g6-one-step-eq',
    grade: 6,
    name: T('一步驟方程式', 'One-step equations'),
    cur: { us: 'CCSS 6.EE.B.7', tw: '七年級 一元一次方程式', aops: 'Prealgebra' },
    at: { tw: 7 },
    gen(r) {
      const k = r.int(0, 4), [zn, en] = who(r), a = r.int(2, 15), x = k === 1 ? a + r.int(1, 25) : r.int(2, 30);
      const check = (s) => T(`驗算：${s} ✓`, `Check: ${s} ✓`);
      const tail = T('（寫出 x 的值）', '(Give the value of x.)');
      if (k === 0) return {
        q: T(`解方程式 x + ${a} = ${x + a}。${tail.zh}`, `Solve x + ${a} = ${x + a}. ${tail.en}`), ans: ansNum(x),
        sol: [T(`x 加了 ${a}，要讓 x 單獨留下，兩邊同時減 ${a}（等式兩邊做一樣的事，仍然相等）。`, `x has ${a} added. To get x alone, subtract ${a} from both sides (doing the same to both sides keeps them equal).`), T(`x = ${x + a} − ${a} = ${x}。`, `x = ${x + a} − ${a} = ${x}.`), check(`${x} + ${a} = ${x + a}`)],
      };
      if (k === 1) return {
        q: T(`解方程式 x − ${a} = ${x - a}。${tail.zh}`, `Solve x − ${a} = ${num(x - a)}. ${tail.en}`), ans: ansNum(x),
        sol: [T(`x 被減了 ${a}，兩邊同時加 ${a}。`, `x has ${a} taken away, so add ${a} to both sides.`), T(`x = ${num(x - a)} + ${a} = ${x}。`, `x = ${num(x - a)} + ${a} = ${x}.`), check(`${x} − ${a} = ${num(x - a)}`)],
      };
      if (k === 2) return {
        q: T(`解方程式 ${a}x = ${a * x}。${tail.zh}`, `Solve ${a}x = ${a * x}. ${tail.en}`), ans: ansNum(x),
        sol: [T(`${a}x 表示 ${a} × x。乘法的反運算是除法，兩邊同時除以 ${a}。`, `${a}x means ${a} × x. Undo multiplication by dividing both sides by ${a}.`), T(`x = ${a * x} ÷ ${a} = ${x}。`, `x = ${a * x} ÷ ${a} = ${x}.`), check(`${a} × ${x} = ${a * x}`)],
      };
      if (k === 3) {
        const q = r.int(2, 12);
        return {
          q: T(`解方程式 x ÷ ${a} = ${q}。${tail.zh}`, `Solve x ÷ ${a} = ${q}. ${tail.en}`), ans: ansNum(a * q),
          sol: [T(`除法的反運算是乘法，兩邊同時乘以 ${a}。`, `Undo division by multiplying both sides by ${a}.`), T(`x = ${q} × ${a} = ${a * q}。`, `x = ${q} × ${a} = ${a * q}.`), check(`${a * q} ÷ ${a} = ${q}`)],
        };
      }
      const p = r.int(3, 9), tot = p * x;
      return {
        q: T(`${zn}買了 x 本一樣的筆記本，每本 ${p} 元，共付了 ${tot} 元。列出方程式並求 x。`, `${en} buys x identical notebooks at $${p} each and pays $${tot} in all. Write an equation and find x.`), ans: ansNum(x),
        sol: [T(`單價 × 數量 = 總價：${p}x = ${tot}。`, `price × number = total: ${p}x = ${tot}.`), T(`兩邊同除以 ${p}：x = ${tot} ÷ ${p} = ${x}。`, `Divide both sides by ${p}: x = ${tot} ÷ ${p} = ${x}.`), check(`${p} × ${x} = ${tot}`)],
      };
    },
  },
  {
    id: 'g6-area-composite',
    grade: 6,
    name: T('多邊形與複合圖形的面積', 'Area of polygons and composite shapes'),
    cur: { us: 'CCSS 6.G.A.1', tw: '五年級 多邊形與複合圖形面積', aops: 'Prealgebra' },
    at: { tw: 5 },
    gen(r) {
      const k = r.int(0, 3);
      const dash = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="f-acc" stroke-width="1.5" stroke-dasharray="4 3"/>`;
      if (k === 0) {
        let W = r.int(4, 16), H = r.int(3, 12), R = r.int(2, 8); if ((W * R) % 2) W++;
        const A = W * H + (W * R) / 2;
        return {
          q: T(`這個「房子」形狀由長方形和三角形組成。總面積是幾平方公尺？`, `This "house" is a rectangle with a triangle on top. What is its total area in square meters?`),
          fig: shape([[30, 80], [110, 20], [190, 80], [190, 155], [30, 155]], [{ x: 110, y: 167, s: `${W} m` }, { x: 14, y: 118, s: `${H} m` }, { x: 124, y: 52, s: `${R} m`, acc: true }], 220, 178, dash(110, 20, 110, 80) + `<line x1="30" y1="80" x2="190" y2="80" class="f-line" stroke-dasharray="3 3"/>`),
          ans: ansNum(A),
          sol: [T('把圖形切成兩塊：下面的長方形和上面的三角形。', 'Cut the shape into two pieces: the rectangle and the triangle on top.'), T(`長方形：${W} × ${H} = ${W * H}。`, `Rectangle: ${W} × ${H} = ${W * H}.`), T(`三角形：底 ${W}、高 ${R}，${W} × ${R} ÷ 2 = ${(W * R) / 2}。`, `Triangle: base ${W}, height ${R}: ${W} × ${R} ÷ 2 = ${(W * R) / 2}.`), T(`總面積：${W * H} + ${(W * R) / 2} = ${A} 平方公尺。`, `Total: ${W * H} + ${(W * R) / 2} = ${A} square meters.`)],
        };
      }
      if (k === 1) {
        const W = r.int(8, 20), H = r.int(6, 15); let a = r.int(2, W - 3), b = r.int(2, H - 3); if ((a * b) % 2) b = b + 1 <= H - 2 ? b + 1 : b - 1;
        const A = W * H - (a * b) / 2;
        return {
          q: T(`長方形紙板長 ${W} 公分、寬 ${H} 公分，右上角剪掉一個直角三角形（兩股分別是 ${a} 公分和 ${b} 公分）。剩下的面積是幾平方公分？`, `A ${W} cm by ${H} cm rectangle of card has a right triangle cut off its top right corner (legs ${a} cm and ${b} cm). What area is left, in square cm?`),
          fig: shape([[30, 30], [150, 30], [190, 75], [190, 150], [30, 150]], [{ x: 110, y: 163, s: `${W} cm` }, { x: 14, y: 90, s: `${H} cm` }, { x: 170, y: 20, s: `${a}`, acc: true }, { x: 202, y: 52, s: `${b}`, acc: true }], 220, 172, dash(150, 30, 190, 30) + dash(190, 30, 190, 75)),
          ans: ansNum(A),
          sol: [T('剩下的面積 = 整個長方形 − 剪掉的三角形。', 'Area left = whole rectangle − the triangle cut off.'), T(`長方形：${W} × ${H} = ${W * H}。`, `Rectangle: ${W} × ${H} = ${W * H}.`), T(`直角三角形：${a} × ${b} ÷ 2 = ${(a * b) / 2}（兩股就是底和高）。`, `Right triangle: ${a} × ${b} ÷ 2 = ${(a * b) / 2} (the legs are its base and height).`), T(`${W * H} − ${(a * b) / 2} = ${A} 平方公分。`, `${W * H} − ${(a * b) / 2} = ${A} square cm.`)],
        };
      }
      if (k === 2) {
        let d1 = r.int(4, 20), d2 = r.int(4, 16); if ((d1 * d2) % 2) d1++;
        return {
          q: T(`菱形的兩條對角線長 ${d1} 公分和 ${d2} 公分，面積是幾平方公分？`, `A rhombus has diagonals ${d1} cm and ${d2} cm. What is its area in square cm?`),
          fig: shape([[110, 20], [190, 90], [110, 160], [30, 90]], [{ x: 70, y: 80, s: `${d1} cm`, acc: true }, { x: 128, y: 125, s: `${d2} cm`, acc: true }], 220, 175, dash(30, 90, 190, 90) + dash(110, 20, 110, 160)),
          ans: ansNum((d1 * d2) / 2),
          sol: [T('菱形放進一個長方形裡：長方形的長和寬就是兩條對角線。', 'Fit the rhombus inside a rectangle whose sides are the two diagonals.'), T('菱形剛好佔長方形的一半（四個角的小三角形和菱形裡的四個三角形一樣大）。', 'The rhombus fills exactly half of that rectangle (the four corner triangles match the four triangles inside).'), T(`面積 = ${d1} × ${d2} ÷ 2 = ${(d1 * d2) / 2} 平方公分。`, `Area = ${d1} × ${d2} ÷ 2 = ${(d1 * d2) / 2} square cm.`)],
        };
      }
      const W = r.int(10, 30), H = r.int(8, 20), p = r.int(1, 3), inner = (W - 2 * p) * (H - 2 * p);
      return {
        q: T(`一塊長方形草地，外圍長 ${W} 公尺、寬 ${H} 公尺。沿著草地內側四周鋪一條寬 ${p} 公尺的步道。步道的面積是幾平方公尺？`, `A rectangular lawn is ${W} m by ${H} m on the outside. A path ${p} m wide runs all around the inside edge. What is the area of the path in square meters?`),
        fig: shape([[20, 20], [200, 20], [200, 150], [20, 150]], [{ x: 110, y: 162, s: `${W} m` }, { x: 10, y: 85, s: `${H} m` }, { x: 110, y: 85, s: `${p} m`, acc: true }], 220, 172, `<rect x="40" y="40" width="140" height="90" fill="none" class="f-acc" stroke-width="2"/>`),
        ans: ansNum(W * H - inner),
        sol: [T('步道面積 = 外面的大長方形 − 裡面的小長方形。', 'Path area = big outer rectangle − small inner rectangle.'), T(`裡面的長方形，長和寬各少了兩邊的步道：${W} − ${2 * p} = ${W - 2 * p}，${H} − ${2 * p} = ${H - 2 * p}。`, `The inner rectangle loses the path on both sides: ${W} − ${2 * p} = ${W - 2 * p} and ${H} − ${2 * p} = ${H - 2 * p}.`),
          T(`${W} × ${H} − ${W - 2 * p} × ${H - 2 * p} = ${W * H} − ${inner} = ${W * H - inner} 平方公尺。`, `${W} × ${H} − ${W - 2 * p} × ${H - 2 * p} = ${W * H} − ${inner} = ${W * H - inner} square meters.`)],
        hint: T('別忘了步道在兩側都有。', 'Remember the path is on both sides.'),
      };
    },
  },
  {
    id: 'g6-surface-area',
    grade: 6,
    name: T('長方體與正方體的表面積', 'Surface area of rectangular prisms'),
    cur: { us: 'CCSS 6.G.A.4', tw: '五年級 長方體和正方體的表面積', aops: 'Prealgebra' },
    at: { tw: 5 },
    gen(r) {
      const k = r.int(0, 3), l = r.int(3, 15), w = r.int(2, 10), h = r.int(2, 12);
      if (k === 0) { const S = 2 * (l * w + l * h + w * h); return {
        q: T(`長方體長 ${l} 公分、寬 ${w} 公分、高 ${h} 公分。表面積是幾平方公分？`, `A box is ${l} cm long, ${w} cm wide and ${h} cm tall. What is its surface area in square cm?`), fig: box(`${l} cm`, `${w} cm`, `${h} cm`), ans: ansNum(S),
        sol: [T('表面積是 6 個面的面積總和。相對的面一樣大，所以有 3 對。', 'Surface area is the total area of all 6 faces. Opposite faces match, so there are 3 pairs.'),
          T(`上下：${l} × ${w} = ${l * w}；前後：${l} × ${h} = ${l * h}；左右：${w} × ${h} = ${w * h}。`, `Top/bottom: ${l} × ${w} = ${l * w}; front/back: ${l} × ${h} = ${l * h}; left/right: ${w} × ${h} = ${w * h}.`),
          T(`(${l * w} + ${l * h} + ${w * h}) × 2 = ${l * w + l * h + w * h} × 2 = ${S} 平方公分。`, `(${l * w} + ${l * h} + ${w * h}) × 2 = ${l * w + l * h + w * h} × 2 = ${S} square cm.`)],
      }; }
      if (k === 1 || k === 2) {
        const s = r.int(2, 15);
        if (k === 1) return {
          q: T(`正方體的邊長是 ${s} 公分，表面積是幾平方公分？`, `A cube has edges ${s} cm long. What is its surface area in square cm?`), fig: box(`${s} cm`, `${s} cm`, `${s} cm`), ans: ansNum(6 * s * s),
          sol: [T('正方體有 6 個一樣大的正方形面。', 'A cube has 6 identical square faces.'), T(`一個面：${s} × ${s} = ${s * s}。`, `One face: ${s} × ${s} = ${s * s}.`), T(`${s * s} × 6 = ${6 * s * s} 平方公分。`, `${s * s} × 6 = ${6 * s * s} square cm.`)],
        };
        return {
          q: T(`正方體的表面積是 ${6 * s * s} 平方公分，邊長是幾公分？`, `A cube has surface area ${6 * s * s} square cm. How long is each edge?`), fig: box('?', '?', '?'), ans: ansNum(s),
          sol: [T(`6 個面一樣大，一個面：${6 * s * s} ÷ 6 = ${s * s}。`, `The 6 faces are equal, so one face is ${6 * s * s} ÷ 6 = ${s * s}.`), T(`哪個數自己乘自己等於 ${s * s}？${s} × ${s} = ${s * s}。`, `Which number times itself is ${s * s}? ${s} × ${s} = ${s * s}.`), T(`邊長 ${s} 公分。`, `Each edge is ${s} cm.`)],
        };
      }
      const S = l * w + 2 * (l * h + w * h);
      return {
        q: T(`做一個沒有蓋子的長方體紙盒，長 ${l} 公分、寬 ${w} 公分、高 ${h} 公分。至少要用多少平方公分的紙板？`, `An open box (no lid) is ${l} cm long, ${w} cm wide and ${h} cm tall. How many square cm of cardboard does it need?`), fig: box(`${l} cm`, `${w} cm`, `${h} cm`), ans: ansNum(S),
        sol: [T('沒有蓋子，所以只有 5 個面：1 個底面、4 個側面。', 'No lid means only 5 faces: the bottom and 4 sides.'), T(`底面：${l} × ${w} = ${l * w}。前後：2 × ${l} × ${h} = ${2 * l * h}。左右：2 × ${w} × ${h} = ${2 * w * h}。`, `Bottom: ${l} × ${w} = ${l * w}. Front and back: 2 × ${l} × ${h} = ${2 * l * h}. Left and right: 2 × ${w} × ${h} = ${2 * w * h}.`),
          T(`${l * w} + ${2 * l * h} + ${2 * w * h} = ${S} 平方公分。`, `${l * w} + ${2 * l * h} + ${2 * w * h} = ${S} square cm.`)],
      };
    },
  },
  {
    id: 'g6-stats',
    grade: 6,
    name: T('平均數、中位數、眾數與全距', 'Mean, median, mode and range'),
    cur: { us: 'CCSS 6.SP.B.5c', tw: '九年級 統計（平均數、中位數、眾數）', aops: 'Prealgebra' },
    at: { tw: 9 },
    gen(r) {
      const k = r.int(0, 3), n = r.int(5, 9);
      let vs, tries = 0;
      do { const base = r.sample(range(2, 40), n - 1); vs = r.shuffle([...base, r.pick(base)]); tries++; } while (k === 0 && sum(vs) % n !== 0 && tries < 500);
      if (k === 0 && sum(vs) % n) { vs[0] += n - (sum(vs) % n); }
      const s = vs.slice().sort((a, b) => a - b), S = sum(vs);
      const cnt = {}; for (const v of vs) cnt[v] = (cnt[v] || 0) + 1;
      const modes = Object.keys(cnt).filter((v) => cnt[v] === Math.max(...Object.values(cnt))).map(Number);
      const data = vs.join(', ');
      const sorted = T(`先由小到大排好：${s.join('、')}。`, `First sort them: ${s.join(', ')}.`);
      if (k === 0) return {
        q: T(`資料：${vs.join('、')}。平均數是多少？`, `Data: ${data}. What is the mean?`), ans: ansNum(S / n),
        sol: [T(`總和：${vs.join(' + ')} = ${S}。`, `Total: ${vs.join(' + ')} = ${S}.`), T(`共 ${n} 個數。`, `There are ${n} values.`), T(`平均數 = ${S} ÷ ${n} = ${num(S / n)}。`, `Mean = ${S} ÷ ${n} = ${num(S / n)}.`)],
      };
      if (k === 1) {
        const med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
        return {
          q: T(`資料：${vs.join('、')}。中位數是多少？`, `Data: ${data}. What is the median?`), ans: ansNum(med),
          sol: [sorted, n % 2 ? T(`共 ${n} 個（奇數個），正中間是第 ${(n + 1) / 2} 個：${med}。`, `There are ${n} values (odd), so the middle one is number ${(n + 1) / 2}: ${med}.`)
            : T(`共 ${n} 個（偶數個），中間有兩個：第 ${n / 2} 個 ${s[n / 2 - 1]} 和第 ${n / 2 + 1} 個 ${s[n / 2]}。`, `There are ${n} values (even), so there are two middle values: ${s[n / 2 - 1]} and ${s[n / 2]}.`),
            ...(n % 2 ? [] : [T(`取它們的平均：(${s[n / 2 - 1]} + ${s[n / 2]}) ÷ 2 = ${num(med)}。`, `Average them: (${s[n / 2 - 1]} + ${s[n / 2]}) ÷ 2 = ${num(med)}.`)]),
            T('一定要先排序才能找中位數！', 'Always sort before finding the median!')],
        };
      }
      if (k === 2) return {
        q: T(`資料：${vs.join('、')}。眾數是多少？`, `Data: ${data}. What is the mode?`), ans: ansNum(modes[0]),
        sol: [T('眾數是出現次數最多的數。', 'The mode is the value that appears most often.'), sorted, T(`${modes[0]} 出現了 ${cnt[modes[0]]} 次，其他都只出現 1 次，所以眾數是 ${modes[0]}。`, `${modes[0]} appears ${cnt[modes[0]]} times and every other value only once, so the mode is ${modes[0]}.`)],
      };
      return {
        q: T(`資料：${vs.join('、')}。全距是多少？`, `Data: ${data}. What is the range?`), ans: ansNum(s[n - 1] - s[0]),
        sol: [T('全距 = 最大值 − 最小值，表示資料分散的程度。', 'Range = greatest − least. It shows how spread out the data are.'), T(`最大值 ${s[n - 1]}，最小值 ${s[0]}。`, `Greatest ${s[n - 1]}, least ${s[0]}.`), T(`${s[n - 1]} − ${s[0]} = ${s[n - 1] - s[0]}。`, `${s[n - 1]} − ${s[0]} = ${s[n - 1] - s[0]}.`)],
      };
    },
  },
  {
    id: 'g6-circle',
    grade: 6,
    name: T('圓周長與圓面積', 'Circumference and area of circles'),
    cur: { us: 'CCSS 7.G.B.4', tw: '六年級 圓周率與圓面積', aops: 'Prealgebra' },
    at: { us: 7 },
    gen(r) {
      const k = r.int(0, 5), rr = r.int(2, 20), d = 2 * rr;
      const piD = T('圓周率 π 是「圓周長 ÷ 直徑」，大約是 3.14。', 'π is circumference ÷ diameter, about 3.14.');
      if (k === 0) { const v = clean(3.14 * d); return {
        q: T(`圓的直徑是 ${d} 公分，圓周長是幾公分？${PI_NOTE.zh}`, `A circle has diameter ${d} cm. What is its circumference in cm? ${PI_NOTE.en}`), fig: circle(`${d} cm`, true), ans: ansNum(v),
        sol: [piD, T('圓周長 = 直徑 × 圓周率。', 'Circumference = diameter × π.'), T(`${d} × 3.14 = ${num(v)} 公分。`, `${d} × 3.14 = ${num(v)} cm.`)],
      }; }
      if (k === 1) { const v = clean(2 * rr * 3.14); return {
        q: T(`圓的半徑是 ${rr} 公分，圓周長是幾公分？${PI_NOTE.zh}`, `A circle has radius ${rr} cm. What is its circumference in cm? ${PI_NOTE.en}`), fig: circle(`${rr} cm`), ans: ansNum(v),
        sol: [T(`直徑是半徑的 2 倍：${rr} × 2 = ${d} 公分。`, `The diameter is twice the radius: ${rr} × 2 = ${d} cm.`), T('圓周長 = 直徑 × 3.14。', 'Circumference = diameter × 3.14.'), T(`${d} × 3.14 = ${num(v)} 公分。`, `${d} × 3.14 = ${num(v)} cm.`)],
      }; }
      if (k === 2) { const v = clean(rr * rr * 3.14); return {
        q: T(`圓的半徑是 ${rr} 公分，面積是幾平方公分？${PI_NOTE.zh}`, `A circle has radius ${rr} cm. What is its area in square cm? ${PI_NOTE.en}`), fig: circle(`${rr} cm`), ans: ansNum(v),
        sol: [T('把圓切成很多小扇形再拼起來，會像一個長方形：長是圓周長的一半（半徑 × 3.14），寬是半徑。', 'Cut a circle into many thin slices and line them up: it looks like a rectangle with length half the circumference (radius × 3.14) and width the radius.'),
          T('所以圓面積 = 半徑 × 半徑 × 3.14。', 'So circle area = radius × radius × 3.14.'), T(`${rr} × ${rr} × 3.14 = ${rr * rr} × 3.14 = ${num(v)} 平方公分。`, `${rr} × ${rr} × 3.14 = ${rr * rr} × 3.14 = ${num(v)} square cm.`)],
      }; }
      if (k === 3) { const C = clean(3.14 * d); return {
        q: T(`圓周長是 ${num(C)} 公分，直徑是幾公分？${PI_NOTE.zh}`, `A circle's circumference is ${num(C)} cm. What is its diameter in cm? ${PI_NOTE.en}`), fig: circle('?', true), ans: ansNum(d),
        sol: [T('圓周長 = 直徑 × 3.14，所以 直徑 = 圓周長 ÷ 3.14。', 'Circumference = diameter × 3.14, so diameter = circumference ÷ 3.14.'), T(`${num(C)} ÷ 3.14 = ${d} 公分。`, `${num(C)} ÷ 3.14 = ${d} cm.`), T(`驗算：${d} × 3.14 = ${num(C)} ✓`, `Check: ${d} × 3.14 = ${num(C)} ✓`)],
      }; }
      if (k === 4) return {
        q: T(`圓的半徑是 ${rr} 公分，面積是幾平方公分？請用 π 表示（例如 9π）。`, `A circle has radius ${rr} cm. What is its area in square cm? Leave your answer in terms of π (like 9π).`), fig: circle(`${rr} cm`), ans: ansNum(rr * rr * Math.PI, `${rr * rr}π`),
        sol: [T('圓面積 = π × 半徑²。', 'Area = π × radius².'), T(`π × ${rr}² = π × ${rr * rr}。`, `π × ${rr}² = π × ${rr * rr}.`), T(`答案 ${rr * rr}π 平方公分（不必把 π 換成 3.14）。`, `Answer: ${rr * rr}π square cm (no need to replace π with a number).`)],
      };
      const half = clean((3.14 * d) / 2), P = clean(half + d);
      return {
        q: T(`一個半圓形的直徑是 ${d} 公分，它的周長（弧線加直徑）是幾公分？${PI_NOTE.zh}`, `A semicircle has diameter ${d} cm. What is its perimeter (the curved part plus the diameter) in cm? ${PI_NOTE.en}`), ans: ansNum(P),
        sol: [T(`弧線是整個圓周長的一半：${d} × 3.14 ÷ 2 = ${num(half)} 公分。`, `The curved part is half the full circumference: ${d} × 3.14 ÷ 2 = ${num(half)} cm.`), T('別忘了加上直徑那條直線！', "Don't forget the straight edge (the diameter)!"), T(`${num(half)} + ${d} = ${num(P)} 公分。`, `${num(half)} + ${d} = ${num(P)} cm.`)],
      };
    },
  },
  {
    id: 'g6-speed',
    grade: 6,
    name: T('速率、距離與時間', 'Speed, distance and time'),
    cur: { us: 'CCSS 6.RP.A.3b', tw: '六年級 速率', aops: 'Prealgebra' },
    gen(r) {
      const k = r.int(0, 4), [zn, en] = who(r);
      const fml = T('距離 = 速率 × 時間；速率 = 距離 ÷ 時間；時間 = 距離 ÷ 速率。', 'distance = speed × time; speed = distance ÷ time; time = distance ÷ speed.');
      if (k === 0) { const s = r.int(30, 110), t = r.int(2, 6); return {
        q: T(`汽車以時速 ${s} 公里行駛 ${t} 小時，共走了幾公里？`, `A car drives at ${s} km per hour for ${t} hours. How many km does it travel?`), ans: ansNum(s * t),
        sol: [fml, T(`時速 ${s} 公里表示 1 小時走 ${s} 公里。`, `${s} km per hour means ${s} km in each hour.`), T(`${s} × ${t} = ${s * t} 公里。`, `${s} × ${t} = ${s * t} km.`)],
      }; }
      if (k === 1) { const s = r.int(4, 20) * 5, t = r.int(2, 8), D = s * t; return {
        q: T(`火車時速 ${s} 公里，要走 ${D} 公里需要幾小時？`, `A train goes ${s} km per hour. How many hours does it take to go ${D} km?`), ans: ansNum(t),
        sol: [fml, T(`時間 = 距離 ÷ 速率 = ${D} ÷ ${s}。`, `time = distance ÷ speed = ${D} ÷ ${s}.`), T(`= ${t} 小時。驗算：${s} × ${t} = ${D} ✓`, `= ${t} hours. Check: ${s} × ${t} = ${D} ✓`)],
      }; }
      if (k === 2) { const v = r.int(50, 90), t = r.int(5, 25), D = v * t; return {
        q: T(`${zn}走 ${num(D)} 公尺花了 ${t} 分鐘，平均分速是幾公尺？`, `${en} walks ${num(D)} m in ${t} minutes. What is the average speed in meters per minute?`), ans: ansNum(v),
        sol: [fml, T(`分速 = 距離 ÷ 分鐘數 = ${num(D)} ÷ ${t}。`, `meters per minute = distance ÷ minutes = ${num(D)} ÷ ${t}.`), T(`= ${v} 公尺／分。`, `= ${v} m per minute.`)],
      }; }
      if (k === 3) { const s = 6 * r.int(2, 15), m = (s * 1000) / 60; return {
        q: T(`時速 ${s} 公里等於分速幾公尺？`, `${s} km per hour is how many meters per minute?`), ans: ansNum(m),
        sol: [T(`1 小時走 ${s} 公里 = ${num(s * 1000)} 公尺。`, `In 1 hour: ${s} km = ${num(s * 1000)} m.`), T('1 小時 = 60 分鐘，所以每分鐘走的是它的 60 分之一。', '1 hour = 60 minutes, so each minute covers 1/60 of that.'), T(`${num(s * 1000)} ÷ 60 = ${num(m)} 公尺／分。`, `${num(s * 1000)} ÷ 60 = ${num(m)} m per minute.`)],
      }; }
      const [zn2, en2] = r.pick(NAMES.filter((x) => x[0] !== zn)), a = r.int(50, 90), b = r.int(50, 90), t = r.int(4, 20), D = (a + b) * t;
      return {
        q: T(`${zn}和${zn2}相距 ${num(D)} 公尺，同時出發相向而行。${zn}分速 ${a} 公尺，${zn2}分速 ${b} 公尺。幾分鐘後相遇？`, `${en} and ${en2} are ${num(D)} m apart and walk toward each other at the same time. ${en} walks ${a} m per minute and ${en2} walks ${b} m per minute. After how many minutes do they meet?`), ans: ansNum(t),
        sol: [T(`兩人每分鐘一共拉近 ${a} + ${b} = ${a + b} 公尺。`, `Each minute they get ${a} + ${b} = ${a + b} m closer.`), T(`${num(D)} ÷ ${a + b} = ${t} 分鐘。`, `${num(D)} ÷ ${a + b} = ${t} minutes.`), T(`驗算：${a} × ${t} + ${b} × ${t} = ${a * t} + ${b * t} = ${num(D)} ✓`, `Check: ${a} × ${t} + ${b} × ${t} = ${a * t} + ${b * t} = ${num(D)} ✓`)],
      };
    },
  },
  {
    id: 'g6-proportion',
    grade: 6,
    name: T('比例、正比與比例尺', 'Proportions, direct variation and scale'),
    cur: { us: 'CCSS 7.RP.A.2', tw: '六年級 正比與比例尺', aops: 'Prealgebra' },
    at: { us: 7 },
    gen(r) {
      const k = r.int(0, 3);
      if (k === 0) {
        let a, b; do { a = r.int(1, 9); b = r.int(2, 12); } while (a === b);
        const s = r.int(2, 8), c = b * s;
        return {
          q: T(`${frac(a, b)} = ${fq('x', c)}，x 是多少？`, `${frac(a, b)} = ${fq('x', c)}. What is x?`), ans: ansNum(a * s),
          sol: [T(`分母 ${b} → ${c}，乘了 ${s}。`, `The denominator went from ${b} to ${c}: times ${s}.`), T(`分子也乘 ${s}：x = ${a} × ${s} = ${a * s}。`, `So the numerator is multiplied by ${s} too: x = ${a} × ${s} = ${a * s}.`), T(`也可以交叉相乘：${b} × x = ${a} × ${c}，x = ${a * c} ÷ ${b} = ${a * s}。`, `Or cross-multiply: ${b} × x = ${a} × ${c}, so x = ${a * c} ÷ ${b} = ${a * s}.`)],
        };
      }
      if (k === 1) {
        const a = r.int(2, 5), b = r.int(6, 12), s1 = r.int(2, 4), s2 = r.int(s1 + 1, 9);
        return {
          q: T(`做 ${b * s1} 片鬆餅要用 ${a * s1} 杯麵粉。做 ${b * s2} 片要用幾杯麵粉？`, `${b * s1} pancakes need ${a * s1} cups of flour. How many cups for ${b * s2} pancakes?`), ans: ansNum(a * s2),
          sol: [T(`麵粉和鬆餅片數成正比（比值不變）。`, `Flour and pancakes are proportional (their ratio stays the same).`), T(`${a * s1} : ${b * s1} = ${a} : ${b}，也就是每 ${b} 片要 ${a} 杯。`, `${a * s1} : ${b * s1} = ${a} : ${b}, so every ${b} pancakes need ${a} cups.`), T(`${b * s2} 片是 ${s2} 個 ${b} 片：${a} × ${s2} = ${a * s2} 杯。`, `${b * s2} pancakes is ${s2} groups of ${b}: ${a} × ${s2} = ${a * s2} cups.`)],
        };
      }
      if (k === 2) {
        const S = r.pick([10000, 20000, 25000, 50000, 100000]), cm = r.int(2, 12), real = cm * S, km = real / 100000;
        return {
          q: T(`地圖的比例尺是 1 : ${num(S)}。地圖上 ${cm} 公分，實際距離是幾公里？`, `A map's scale is 1 : ${num(S)}. ${cm} cm on the map is how many km in real life?`), ans: ansNum(km),
          sol: [T(`比例尺 1 : ${num(S)} 表示地圖上 1 公分是實際的 ${num(S)} 公分。`, `A scale of 1 : ${num(S)} means 1 cm on the map is ${num(S)} cm in real life.`), T(`${cm} × ${num(S)} = ${num(real)} 公分。`, `${cm} × ${num(S)} = ${num(real)} cm.`), T(`1 公里 = 100,000 公分，${num(real)} ÷ 100,000 = ${num(km)} 公里。`, `1 km = 100,000 cm, so ${num(real)} ÷ 100,000 = ${num(km)} km.`)],
        };
      }
      const kk = r.int(2, 9), x1 = r.int(2, 9), x2 = r.int(10, 25);
      return {
        q: T(`y 和 x 成正比。當 x = ${x1} 時，y = ${kk * x1}。當 x = ${x2} 時，y 是多少？`, `y is proportional to x. When x = ${x1}, y = ${kk * x1}. What is y when x = ${x2}?`), ans: ansNum(kk * x2),
        sol: [T('成正比：y ÷ x 的值永遠一樣（y = kx）。', 'Proportional means y ÷ x is always the same number k (y = kx).'), T(`k = ${kk * x1} ÷ ${x1} = ${kk}，所以 y = ${kk}x。`, `k = ${kk * x1} ÷ ${x1} = ${kk}, so y = ${kk}x.`), T(`x = ${x2}：y = ${kk} × ${x2} = ${kk * x2}。`, `When x = ${x2}: y = ${kk} × ${x2} = ${kk * x2}.`)],
      };
    },
  },
  {
    id: 'g6-divisibility',
    grade: 6,
    name: T('倍數的判別法', 'Divisibility rules'),
    cur: { aops: 'Prealgebra' },
    gen(r) {
      const k = r.int(0, 3);
      if (k === 0) {
        let ds, pos, need; do { const len = r.int(4, 6); ds = Array.from({ length: len }, (_, i) => (i ? r.int(0, 9) : r.int(1, 9))); pos = r.int(1, len - 1); ds[pos] = 0; need = (9 - (sum(ds) % 9)) % 9; } while (need === 0);
        const shown = ds.map((d, i) => (i === pos ? '□' : d)).join('');
        return {
          q: T(`${shown} 是 9 的倍數，□ 裡的數字是多少？`, `${shown} is a multiple of 9. What digit goes in the □?`), ans: ansNum(need),
          sol: [T('9 的倍數判別法：各位數字的和是 9 的倍數。', 'Rule for 9: a number is a multiple of 9 when the sum of its digits is a multiple of 9.'), T(`已知數字的和：${ds.filter((_, i) => i !== pos).join(' + ')} = ${sum(ds)}。`, `Sum of the known digits: ${ds.filter((_, i) => i !== pos).join(' + ')} = ${sum(ds)}.`),
            T(`${sum(ds)} + □ 要是 9 的倍數，下一個 9 的倍數是 ${sum(ds) + need}，所以 □ = ${need}。`, `${sum(ds)} + □ must be a multiple of 9. The next multiple of 9 is ${sum(ds) + need}, so □ = ${need}.`), T(`驗算：${ds.map((d, i) => (i === pos ? need : d)).join('')} 的數字和是 ${sum(ds) + need} ✓`, `Check: the digits of ${ds.map((d, i) => (i === pos ? need : d)).join('')} add to ${sum(ds) + need} ✓`)],
        };
      }
      if (k === 1) {
        const len = r.int(3, 5), ds = Array.from({ length: len }, (_, i) => (i ? r.int(0, 9) : r.int(1, 9))), pos = r.int(1, len - 1); ds[pos] = 0;
        const need = (3 - (sum(ds) % 3)) % 3, all = [need, need + 3, need + 6, need + 9].filter((d) => d <= 9);
        const shown = ds.map((d, i) => (i === pos ? '□' : d)).join('');
        return {
          q: T(`${shown} 是 3 的倍數，□ 裡最小可以填多少？`, `${shown} is a multiple of 3. What is the smallest digit that can go in the □?`), ans: ansNum(need),
          sol: [T('3 的倍數判別法：各位數字的和是 3 的倍數。', 'Rule for 3: the sum of the digits is a multiple of 3.'), T(`已知數字的和是 ${sum(ds)}。`, `The known digits add to ${sum(ds)}.`), T(`□ 可以是 ${all.join('、')}（讓和變成 3 的倍數），最小的是 ${need}。`, `□ can be ${all.join(', ')} (each makes the sum a multiple of 3). The smallest is ${need}.`)],
        };
      }
      if (k === 2) {
        const hund = r.int(1, 99) * 100, good = hund + 4 * r.int(1, 24);
        const bad = r.sample([2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62, 66, 70, 74, 78, 82, 86, 90, 94, 98], 3).map((t) => r.int(1, 99) * 100 + t);
        return {
          q: T('下面哪一個數是 4 的倍數？', 'Which number is a multiple of 4?'), ans: ansChoice([num(good), ...bad.map(num)]),
          sol: [T('4 的倍數判別法：看最後兩位數是不是 4 的倍數（因為 100 是 4 的倍數）。', 'Rule for 4: check whether the last two digits form a multiple of 4 (because 100 is a multiple of 4).'),
            T(`${num(good)} 的末兩位 ${String(good % 100).padStart(2, '0')} = 4 × ${(good % 100) / 4} ✓`, `${num(good)} ends in ${String(good % 100).padStart(2, '0')} = 4 × ${(good % 100) / 4} ✓`),
            T(`其他的末兩位 ${bad.map((b) => String(b % 100).padStart(2, '0')).join('、')} 都是雙數但不是 4 的倍數。只看個位是雙數是不夠的！`, `The others end in ${bad.map((b) => String(b % 100).padStart(2, '0')).join(', ')}: even, but not multiples of 4. Being even is not enough!`)],
        };
      }
      const N = r.int(100, 999), ev = N % 2 === 0, s3 = sum(String(N).split('').map(Number)), by3 = s3 % 3 === 0, yes = ev && by3;
      const Y = T('是', 'Yes'), No = T('不是', 'No');
      return {
        q: T(`${N} 是 6 的倍數嗎？`, `Is ${N} a multiple of 6?`), ans: ansChoice(yes ? [Y, No] : [No, Y]),
        sol: [T('6 = 2 × 3，所以要同時是 2 的倍數和 3 的倍數。', '6 = 2 × 3, so the number must be a multiple of both 2 and 3.'), T(`2：個位是 ${N % 10}，${ev ? '是雙數 ✓' : '是單數 ✗'}。`, `2: the ones digit is ${N % 10}, ${ev ? 'even ✓' : 'odd ✗'}.`),
          T(`3：數字和 ${String(N).split('').join(' + ')} = ${s3}，${by3 ? '是 3 的倍數 ✓' : '不是 3 的倍數 ✗'}。`, `3: the digit sum ${String(N).split('').join(' + ')} = ${s3} is ${by3 ? '' : 'not '}a multiple of 3 ${by3 ? '✓' : '✗'}.`), T(`所以${yes ? '是' : '不是'} 6 的倍數。`, `So ${N} is ${yes ? '' : 'not '}a multiple of 6.`)],
      };
    },
  },
  {
    id: 'g6-counting',
    grade: 6,
    name: T('簡單的排列與計數', 'Counting arrangements'),
    cur: { aops: 'Prealgebra' },
    gen(r) {
      const k = r.int(0, 4), [zn, en] = who(r);
      if (k === 0) { const a = r.int(2, 6), b = r.int(2, 5), c = r.chance(0.5) ? r.int(2, 4) : 0, v = a * b * (c || 1); return {
        q: T(`${zn}有 ${a} 件上衣、${b} 條褲子${c ? `、${c} 頂帽子` : ''}。每次各選一件來搭配，共有幾種穿法？`, `${en} has ${a} shirts and ${b} pairs of pants${c ? ` and ${c} hats` : ''}. Choosing one of each, how many different outfits are possible?`), ans: ansNum(v),
        sol: [T('乘法原理：每一步的選擇互不影響時，把各步的方法數相乘。', 'Multiplication principle: when each choice is independent, multiply the numbers of choices.'), T(`每一件上衣可以配 ${b} 條褲子${c ? `，每一種再配 ${c} 頂帽子` : ''}。`, `Each shirt goes with ${b} pants${c ? `, and each of those with ${c} hats` : ''}.`), T(`${a} × ${b}${c ? ` × ${c}` : ''} = ${v} 種。`, `${a} × ${b}${c ? ` × ${c}` : ''} = ${v} outfits.`)],
      }; }
      if (k === 1) { const n = r.int(3, 6); return {
        q: T(`${n} 本不同的書排成一排放在書架上，共有幾種排法？`, `In how many ways can ${n} different books be arranged in a row on a shelf?`), ans: ansNum(fact(n)),
        sol: [T(`第 1 個位置有 ${n} 種選擇，第 2 個位置剩 ${n - 1} 種，……最後一個位置剩 1 種。`, `The first spot has ${n} choices, the second ${n - 1}, …, the last spot 1.`), T(`${range(1, n).reverse().join(' × ')} = ${fact(n)}。`, `${range(1, n).reverse().join(' × ')} = ${fact(n)}.`), T(`這叫 ${n} 的階乘，寫成 ${n}!。`, `This is ${n} factorial, written ${n}!.`)],
      }; }
      if (k === 2) { const n = r.int(4, 15); return {
        q: T(`${n} 個人開會，每兩個人都握一次手，一共握幾次手？`, `At a meeting of ${n} people, every two people shake hands once. How many handshakes are there?`), ans: ansNum(C(n, 2)),
        sol: [T(`每個人要和其他 ${n - 1} 人握手：${n} × ${n - 1} = ${n * (n - 1)}。`, `Each person shakes ${n - 1} hands: ${n} × ${n - 1} = ${n * (n - 1)}.`), T('但是 A 和 B 握手被算了兩次（A 算一次、B 又算一次），所以要除以 2。', 'But each handshake was counted twice (once by each person), so divide by 2.'), T(`${n * (n - 1)} ÷ 2 = ${C(n, 2)} 次。`, `${n * (n - 1)} ÷ 2 = ${C(n, 2)} handshakes.`)],
      }; }
      if (k === 3) {
        const zero = r.chance(0.5), m = r.int(3, 5), ds = (zero ? [0, ...r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], m - 1)] : r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], m)).sort((a, b) => a - b);
        const v = zero ? (m - 1) * (m - 1) : m * (m - 1);
        return {
          q: T(`用 ${ds.join('、')} 這 ${m} 張數字卡，選兩張排成二位數（不可重複使用），可以排出幾個不同的二位數？`, `Using the ${m} digit cards ${ds.join(', ')}, pick two to make a 2-digit number (no card used twice). How many different 2-digit numbers can be made?`), ans: ansNum(v),
          sol: zero ? [T('十位不可以是 0（像 05 不是二位數）。', 'The tens digit cannot be 0 (05 is not a 2-digit number).'), T(`十位：0 以外的 ${m - 1} 張；個位：剩下的 ${m - 1} 張（現在可以用 0）。`, `Tens digit: the ${m - 1} nonzero cards. Ones digit: any of the remaining ${m - 1} cards (0 is allowed now).`), T(`${m - 1} × ${m - 1} = ${v} 個。`, `${m - 1} × ${m - 1} = ${v} numbers.`)]
            : [T(`十位有 ${m} 種選擇，個位用剩下的 ${m - 1} 張。`, `The tens digit has ${m} choices; the ones digit uses one of the other ${m - 1}.`), T(`${m} × ${m - 1} = ${v} 個。`, `${m} × ${m - 1} = ${v} numbers.`), T('可以用樹狀圖檢查。', 'A tree diagram can check this.')],
        };
      }
      const n = r.int(4, 12);
      return {
        q: T(`班上 ${n} 位候選人要選出班長和副班長各一人（不能同一人），共有幾種選法？`, `From ${n} candidates, a class elects a president and a vice president (different people). How many outcomes are possible?`), ans: ansNum(n * (n - 1)),
        sol: [T(`班長有 ${n} 種選法；選好後，副班長剩 ${n - 1} 種。`, `There are ${n} choices for president; then ${n - 1} for vice president.`), T('順序有差別（甲當班長、乙當副班長，和反過來不一樣），所以不用除以 2。', 'Order matters here (A president with B vice is different from the reverse), so we do not divide by 2.'), T(`${n} × ${n - 1} = ${n * (n - 1)} 種。`, `${n} × ${n - 1} = ${n * (n - 1)} ways.`)],
      };
    },
  },
  {
    id: 'g6-digit-sums',
    grade: 6,
    name: T('數字和問題（數學競賽）', 'Digit sum puzzles'),
    cur: { aops: 'MATHCOUNTS' },
    gen(r) {
      const k = r.int(0, 3), ds = (x) => String(x).split('').reduce((s, c) => s + +c, 0);
      if (k === 0) {
        const n = r.int(3, 9), m = r.int(1, 9), v = 10 ** n - m, ans = 9 * (n - 1) + (10 - m);
        return {
          q: T(`${pow(10, n)} − ${m} 的各位數字和是多少？`, `What is the sum of the digits of ${pow(10, n)} − ${m}?`), ans: ansNum(ans),
          sol: [T(`${pow(10, n)} = 1 後面 ${n} 個 0。減掉 ${m}：${num(v)}。`, `${pow(10, n)} is 1 followed by ${n} zeros. Subtract ${m}: ${num(v)}.`), T(`這個數有 ${n - 1} 個 9，最後一位是 ${10 - m}。`, `It has ${n - 1} nines and ends in ${10 - m}.`), T(`數字和：9 × ${n - 1} + ${10 - m} = ${ans}。`, `Digit sum: 9 × ${n - 1} + ${10 - m} = ${ans}.`)],
        };
      }
      if (k === 1) {
        const s = r.int(2, 17), list = range(10, 99).filter((x) => ds(x) === s);
        return {
          q: T(`有幾個二位數的數字和是 ${s}？`, `How many 2-digit numbers have a digit sum of ${s}?`), ans: ansNum(list.length),
          sol: [T(`十位是 a、個位是 b，a + b = ${s}，a 是 1～9，b 是 0～9。`, `Let the tens digit be a and the ones digit b: a + b = ${s}, with a from 1 to 9 and b from 0 to 9.`), T(`一個一個列出來：${list.join('、')}。`, `List them: ${list.join(', ')}.`), T(`共 ${list.length} 個。`, `That is ${list.length} numbers.`)],
        };
      }
      if (k === 2) {
        const s = r.int(10, 40), q9 = Math.floor(s / 9), rm = s % 9, v = rm ? +(String(rm) + '9'.repeat(q9)) : +'9'.repeat(q9);
        return {
          q: T(`數字和是 ${s} 的正整數中，最小的是多少？`, `What is the smallest positive integer whose digits add up to ${s}?`), ans: ansNum(v),
          sol: [T('要讓數最小，位數要越少越好，所以每一位盡量放 9。', 'To make the number small, use as few digits as possible, so use as many 9s as we can.'), T(`${s} = 9 × ${q9}${rm ? ` + ${rm}` : ''}，需要 ${q9} 個 9${rm ? `，再加一個 ${rm}` : ''}。`, `${s} = 9 × ${q9}${rm ? ` + ${rm}` : ''}: we need ${q9} nines${rm ? ` and one ${rm}` : ''}.`),
            T(`${rm ? `小的數字 ${rm} 放在最前面（最高位）` : '全部都是 9'}：${v}。`, `${rm ? `Put the small digit ${rm} in front (the highest place)` : 'All nines'}: ${v}.`)],
        };
      }
      const s = r.int(2, 8), list = range(100, 999).filter((x) => ds(x) === s);
      const byH = range(1, s).map((h) => [h, s - h + 1]);
      return {
        q: T(`有幾個三位數的數字和是 ${s}？`, `How many 3-digit numbers have a digit sum of ${s}?`), ans: ansNum(list.length),
        sol: [T(`依百位分類。百位是 h 時，十位和個位的和是 ${s} − h。`, `Sort by the hundreds digit h. Then the tens and ones digits add to ${s} − h.`),
          T(byH.map(([h, c]) => `百位 ${h}：十位可以是 0～${s - h}，有 ${c} 個`).join('；'), byH.map(([h, c]) => `h = ${h}: tens digit 0 to ${s - h}, ${c} number${c > 1 ? 's' : ''}`).join('; ')),
          T(`合計：${byH.map((x) => x[1]).join(' + ')} = ${list.length} 個。`, `Total: ${byH.map((x) => x[1]).join(' + ')} = ${list.length}.`)],
      };
    },
  },
  {
    id: 'g6-mathcounts-word',
    grade: 6,
    name: T('經典應用題（雞兔同籠、連續整數…）', 'Classic word problems (MATHCOUNTS style)'),
    cur: { aops: 'MATHCOUNTS' },
    gen(r) {
      const k = r.int(0, 3), [zn, en] = who(r);
      if (k === 0) {
        const c = r.int(3, 30), b = r.int(3, 30), H = c + b, L = 2 * c + 4 * b;
        return {
          q: T(`籠子裡有雞和兔子，共有 ${H} 個頭、${L} 隻腳。兔子有幾隻？`, `A farm has chickens and rabbits: ${H} heads and ${L} legs in all. How many rabbits are there?`), ans: ansNum(b),
          sol: [T(`假設全部都是雞：${H} × 2 = ${2 * H} 隻腳。`, `Pretend all ${H} animals are chickens: ${H} × 2 = ${2 * H} legs.`), T(`實際多了 ${L} − ${2 * H} = ${L - 2 * H} 隻腳。`, `There are actually ${L} − ${2 * H} = ${L - 2 * H} extra legs.`),
            T(`每把一隻雞換成兔子，多 2 隻腳：${L - 2 * H} ÷ 2 = ${b} 隻兔子。`, `Each rabbit has 2 more legs than a chicken: ${L - 2 * H} ÷ 2 = ${b} rabbits.`), T(`驗算：雞 ${c} 隻，${c} × 2 + ${b} × 4 = ${L} ✓`, `Check: ${c} chickens, ${c} × 2 + ${b} × 4 = ${L} ✓`)],
        };
      }
      if (k === 1) {
        const m = r.pick([3, 5]), mid = r.int(5, 60), S = m * mid, big = mid + (m - 1) / 2;
        return {
          q: T(`${m} 個連續整數的和是 ${S}，最大的那個數是多少？`, `The sum of ${m} consecutive integers is ${S}. What is the largest of them?`), ans: ansNum(big),
          sol: [T(`連續整數左右對稱，平均數就是正中間的數：${S} ÷ ${m} = ${mid}。`, `Consecutive integers are balanced around the middle one, which equals the mean: ${S} ÷ ${m} = ${mid}.`), T(`這 ${m} 個數是 ${range(mid - (m - 1) / 2, big).join('、')}。`, `The ${m} numbers are ${range(mid - (m - 1) / 2, big).join(', ')}.`), T(`最大的是 ${big}。`, `The largest is ${big}.`)],
        };
      }
      if (k === 2) {
        const y = r.int(6, 14), o = y + r.int(2, 30), S = o + y, D = o - y;
        return {
          q: T(`爸爸和${zn}的年齡和是 ${S} 歲，爸爸比${zn}大 ${D} 歲。爸爸幾歲？`, `The sum of Dad's age and ${en}'s age is ${S}. Dad is ${D} years older. How old is Dad?`), ans: ansNum(o),
          sol: [T(`如果${zn}多 ${D} 歲，兩人就一樣大，和變成 ${S} + ${D} = ${S + D}。`, `If ${en} were ${D} years older, they would be the same age and the sum would be ${S} + ${D} = ${S + D}.`), T(`爸爸：${S + D} ÷ 2 = ${o} 歲。`, `Dad: ${S + D} ÷ 2 = ${o}.`), T(`驗算：${zn} ${y} 歲，${o} + ${y} = ${S}，${o} − ${y} = ${D} ✓`, `Check: ${en} is ${y}; ${o} + ${y} = ${S} and ${o} − ${y} = ${D} ✓`)],
        };
      }
      const f = r.int(2, 20), t = r.int(2, 20), n = f + t, V = 5 * f + 10 * t;
      return {
        q: T(`${zn}有 5 元和 10 元硬幣共 ${n} 枚，總共 ${V} 元。10 元硬幣有幾枚？`, `${en} has ${n} coins, all nickels (5¢) and dimes (10¢), worth ${V}¢ in all. How many dimes are there?`), ans: ansNum(t),
        sol: [T(`假設全部都是 5 元：${n} × 5 = ${5 * n} 元。`, `Pretend all ${n} coins are nickels: ${n} × 5 = ${5 * n}¢.`), T(`少了 ${V} − ${5 * n} = ${V - 5 * n} 元。`, `That is ${V} − ${5 * n} = ${V - 5 * n}¢ too little.`), T(`每換一枚成 10 元多 5 元：${V - 5 * n} ÷ 5 = ${t} 枚。`, `Each dime adds 5¢ more than a nickel: ${V - 5 * n} ÷ 5 = ${t} dimes.`), T(`驗算：${f} × 5 + ${t} × 10 = ${V} ✓`, `Check: ${f} × 5 + ${t} × 10 = ${V} ✓`)],
      };
    },
  },
];

export default [...G4, ...G5, ...G6];
