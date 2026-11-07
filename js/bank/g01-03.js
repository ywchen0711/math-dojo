// Grades 1–3: counting, addition and subtraction, place value, time, money, shapes, measurement,
// multiplication and division, first fractions, and Beast Academy style puzzles. See SPEC.md.
import { T, num, frac, fracR, red, range, sum, ansNum, ansFrac, ansChoice, uniq } from '../util.js';
import { clock, dots, numberLine, fracBar, pie, rect, shape, bars } from '../draw.js';

// ---------- shared word-problem pieces ----------
const NAMES = [['小明', 'Max'], ['小美', 'Mia'], ['阿傑', 'Jay'], ['欣怡', 'Emma'], ['志豪', 'Leo'], ['雅婷', 'Ava'], ['小華', 'Ben'], ['佳佳', 'Lily'], ['宇翔', 'Sam'], ['思妤', 'Zoe']];
const THINGS = [
  { e: '🍎', cw: '顆', zh: '蘋果', en: 'apples' },
  { e: '🍓', cw: '顆', zh: '草莓', en: 'strawberries' },
  { e: '⭐', cw: '顆', zh: '星星', en: 'stars' },
  { e: '🐟', cw: '條', zh: '魚', en: 'fish' },
  { e: '🌸', cw: '朵', zh: '花', en: 'flowers' },
  { e: '🎈', cw: '顆', zh: '氣球', en: 'balloons' },
  { e: '🐥', cw: '隻', zh: '小雞', en: 'chicks' },
  { e: '🚗', cw: '輛', zh: '玩具車', en: 'toy cars' },
  { e: '🍪', cw: '片', zh: '餅乾', en: 'cookies' },
  { e: '🐞', cw: '隻', zh: '瓢蟲', en: 'ladybugs' },
  { e: '🍬', cw: '顆', zh: '糖果', en: 'candies' },
  { e: '⚽', cw: '顆', zh: '足球', en: 'soccer balls' },
];
const TN = (n) => `${n} ${n === 1 ? 'ten' : 'tens'}`, ON = (n) => `${n} ${n === 1 ? 'one' : 'ones'}`, HN = (n) => `${n} ${n === 1 ? 'hundred' : 'hundreds'}`;
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const PL = [['個位', 'ones'], ['十位', 'tens'], ['百位', 'hundreds'], ['千位', 'thousands']];
const digs = (n) => String(n).split('').reverse().map(Number);
const ZHN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
const ENN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const h12 = (h) => ((((h - 1) % 12) + 12) % 12) + 1;
const pad2 = (m) => String(m).padStart(2, '0');
// a time as T(zh, en): 3 點半 / 3:30
const tl = (h, m, half = true) => T(m === 0 ? `${h} 點` : m === 30 && half ? `${h} 點半` : `${h} 點 ${m} 分`, `${h}:${pad2(m)}`);

// ---------- column addition / subtraction explained place by place ----------
function colAddSteps(a, b) {
  const A = digs(a), B = digs(b), n = Math.max(A.length, B.length), out = []; let c = 0;
  for (let i = 0; i < n; i++) {
    const x = A[i] || 0, y = B[i] || 0, s = x + y + c, zc = c ? ' + 1（進位）' : '', ec = c ? ' + 1 (carried)' : '';
    if (s >= 10 && i < n - 1) out.push(T(`${PL[i][0]}：${x} + ${y}${zc} = ${s}，寫 ${s % 10}，滿十要進 1 到${PL[i + 1][0]}。`, `${cap(PL[i][1])}: ${x} + ${y}${ec} = ${s}. Write ${s % 10} and carry 1 to the ${PL[i + 1][1]}.`));
    else out.push(T(`${PL[i][0]}：${x} + ${y}${zc} = ${s}，寫 ${s}。`, `${cap(PL[i][1])}: ${x} + ${y}${ec} = ${s}. Write ${s}.`));
    c = s >= 10 ? 1 : 0;
  }
  return out;
}
function colSubSteps(a, b) {
  const A = digs(a), B = digs(b), n = A.length, out = []; let br = 0;
  for (let i = 0; i < n; i++) {
    const x = A[i], y = B[i] || 0, nx = PL[i + 1] || PL[i];
    let zh = `${PL[i][0]}：`, en = `${cap(PL[i][1])}: `, avail, out1 = 0;
    if (br && x === 0) {
      avail = 9; out1 = 1;
      zh += `這一位是 0，又被右邊借走 1，所以要先向${nx[0]}借 1 變成 10，借出 1 後剩 9。9 − ${y} = ${9 - y}。`;
      en += `this digit is 0 and the place to the right borrowed from it, so first borrow 1 from the ${nx[1]} to make 10; after lending 1 it is 9. 9 − ${y} = ${9 - y}.`;
    } else {
      avail = x - br;
      if (br) { zh += `${x} 被借走 1，剩 ${avail}。`; en += `${x} lent 1, so it is ${avail}. `; }
      if (avail < y) {
        out1 = 1;
        zh += `${avail} 不夠減 ${y}，向${nx[0]}借 1，變成 ${avail + 10}。${avail + 10} − ${y} = ${avail + 10 - y}。`;
        en += `${avail} is less than ${y}, so borrow 1 from the ${nx[1]} to make ${avail + 10}. ${avail + 10} − ${y} = ${avail + 10 - y}.`;
      } else { zh += `${avail} − ${y} = ${avail - y}。`; en += `${avail} − ${y} = ${avail - y}.`; }
    }
    out.push(T(zh, en)); br = out1;
  }
  return out;
}

// ---------- making ten / counting on, explained for little kids ----------
function addSteps(a, b) {
  const s = a + b, big = Math.max(a, b), sm = Math.min(a, b);
  if (a < 10 && b < 10 && s > 10) {
    const need = 10 - big, rest = sm - need;
    return [
      T(`用「湊十」的方法：${big} 還差 ${need} 個才湊成 10。`, `Make a ten: ${big} needs ${need} more to make 10.`),
      T(`把 ${sm} 拆成 ${need} 和 ${rest}。`, `Break ${sm} into ${need} and ${rest}.`),
      T(`${big} + ${need} = 10，再加剩下的 ${rest}：10 + ${rest} = ${s}。`, `${big} + ${need} = 10, then add the ${rest} left over: 10 + ${rest} = ${s}.`),
    ];
  }
  if (big === 10) return [T(`10 + ${sm}：1 個十和 ${sm} 個一，就是 ${s}。`, `10 + ${sm} is 1 ten and ${ON(sm)}, which is ${s}.`)];
  if (big >= 10) {
    const o = big - 10;
    return [
      T(`${big} 是 1 個十和 ${o} 個一。`, `${big} is 1 ten and ${ON(o)}.`),
      T(`先把一加起來：${o} + ${sm} = ${o + sm}。`, `Add the ones first: ${o} + ${sm} = ${o + sm}.`),
      T(`再加上那 1 個十：10 + ${o + sm} = ${s}。`, `Then add the ten: 10 + ${o + sm} = ${s}.`),
    ];
  }
  return [
    T(`從比較大的數 ${big} 開始，往上數 ${sm} 個。`, `Start at the bigger number, ${big}, and count on ${sm}.`),
    T(`${big}… ${range(big + 1, s).join('、')}。`, `${big}… ${range(big + 1, s).join(', ')}.`),
  ];
}
function subSteps(a, b) {
  const d = a - b;
  if (a === 20) return b <= 10 ? [
    T('20 是 2 個十：10 和 10。', '20 is 2 tens: 10 and 10.'),
    T(`從其中一個 10 拿走 ${b}：10 − ${b} = ${10 - b}。`, `Take ${b} from one of the tens: 10 − ${b} = ${10 - b}.`),
    T(`再加上另一個 10：10 + ${10 - b} = ${d}。`, `Add the other 10: 10 + ${10 - b} = ${d}.`),
  ] : [
    T(`把 ${b} 拆成 10 和 ${b - 10}。`, `Break ${b} into 10 and ${b - 10}.`),
    T(`20 − 10 = 10，10 − ${b - 10} = ${d}。`, `20 − 10 = 10, then 10 − ${b - 10} = ${d}.`),
  ];
  if (a > 10) {
    const o = a - 10;
    if (b <= o) return [
      T(`${a} 是 1 個十和 ${o} 個一。`, `${a} is 1 ten and ${ON(o)}.`),
      T(`一的部分：${o} − ${b} = ${o - b}，十不用動。`, `Take from the ones: ${o} − ${b} = ${o - b}. The ten stays.`),
      T(`10 + ${o - b} = ${d}。`, `10 + ${o - b} = ${d}.`),
    ];
    return [
      T(`用「先減到 10」的方法：${a} 先減 ${o} 會剛好變成 10。`, `Subtract down to 10 first: ${a} − ${o} = 10.`),
      T(`把 ${b} 拆成 ${o} 和 ${b - o}。`, `Break ${b} into ${o} and ${b - o}.`),
      T(`${a} − ${o} = 10，10 − ${b - o} = ${d}。`, `${a} − ${o} = 10, then 10 − ${b - o} = ${d}.`),
    ];
  }
  if (b > a / 2) return [
    T(`減的數很大，可以從 ${b} 往上數到 ${a}，看看數了幾個。`, `${b} is close to ${a}, so count up from ${b} to ${a}.`),
    T(`${b}… ${range(b + 1, a).join('、')}，一共數了 ${d} 個。`, `${b}… ${range(b + 1, a).join(', ')}: that is ${d} numbers.`),
  ];
  return [
    T(`從 ${a} 往回數 ${b} 個。`, `Start at ${a} and count back ${b}.`),
    T(`${a}… ${range(d, a - 1).reverse().join('、')}。`, `${a}… ${range(d, a - 1).reverse().join(', ')}.`),
  ];
}

// ---------- private pictures ----------
const SV = (w, h, body) => `<svg class="fig" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">${body}</svg>`;
const TX = (x, y, s, cls = 'f-txt', fs = 13, extra = '') => `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" class="${cls}" font-size="${fs}" ${extra}>${s}</text>`;
// a row of emoji (one group)
const row = (arr) => `<div class="dots"><span class="grp">${arr.join('')}</span></div>`;
// ten frame with n dots
function tenFrame(n) {
  const u = 34; let s = '';
  for (let k = 0; k < 10; k++) { const x = 4 + (k % 5) * u, y = 4 + Math.floor(k / 5) * u; s += `<rect x="${x}" y="${y}" width="${u}" height="${u}" class="f-soft"/>`; if (k < n) s += `<circle cx="${x + u / 2}" cy="${y + u / 2}" r="11" class="f-accfill"/>`; }
  return SV(5 * u + 8, 2 * u + 8, s);
}
// number bond: whole on top, two parts below
function bond(top, l, rr) {
  const c = (x, y, v) => `<circle cx="${x}" cy="${y}" r="24" class="f-soft"/>` + TX(x, y, v, v === '?' ? 'f-acctxt' : 'f-txt', 18, 'font-weight="700"');
  return SV(200, 150, `<line x1="100" y1="34" x2="50" y2="112" class="f-line" stroke-width="2"/><line x1="100" y1="34" x2="150" y2="112" class="f-line" stroke-width="2"/>` + c(100, 32, top) + c(50, 115, l) + c(150, 115, rr));
}
// base-ten blocks: t rods of ten and o unit cubes
function blocks(t, o) {
  let s = '', x = 6;
  for (let i = 0; i < t; i++) { s += `<rect x="${x}" y="6" width="12" height="100" class="f-accfill"/>`; for (let k = 1; k < 10; k++) s += `<line x1="${x}" y1="${6 + k * 10}" x2="${x + 12}" y2="${6 + k * 10}" class="f-line"/>`; x += 18; }
  x += 8;
  for (let i = 0; i < o; i++) s += `<rect x="${x + Math.floor(i / 5) * 14}" y="${56 + (i % 5) * 10}" width="10" height="10" class="f-soft"/>`;
  return SV(x + Math.ceil(o / 5) * 14 + 6, 112, s);
}
// coins: values, Taiwan or US sizes
function coinFig(vals, kind) {
  const R = kind === 'tw' ? { 1: 15, 5: 17, 10: 20, 50: 23 } : { 1: 17, 5: 19, 10: 15, 25: 22 };
  const per = 7, cell = 52; let s = '';
  vals.forEach((v, i) => { const cx = 28 + (i % per) * cell, cy = 28 + Math.floor(i / per) * 52; s += `<circle cx="${cx}" cy="${cy}" r="${R[v]}" class="f-soft"/>` + TX(cx, cy, kind === 'tw' ? v : v + '¢', 'f-txt', 12, 'font-weight="700"'); });
  return SV(6 + Math.min(vals.length, per) * cell, 4 + Math.ceil(vals.length / per) * 52, s);
}
// a ruler 0..n with an object from a to b
function rulerFig(n, a, b, unit) {
  const u = 26, p = 16, X = (v) => p + v * u;
  let s = `<rect x="${X(a)}" y="6" width="${(b - a) * u}" height="18" rx="4" class="f-accfill"/><rect x="${p - 8}" y="30" width="${n * u + 16}" height="40" class="f-soft"/>`;
  for (let k = 0; k <= n; k++) { s += `<line x1="${X(k)}" y1="30" x2="${X(k)}" y2="44" class="f-line"/>` + TX(X(k), 57, k, 'f-txt', 11); if (k < n) s += `<line x1="${X(k + 0.5)}" y1="30" x2="${X(k + 0.5)}" y2="37" class="f-line"/>`; }
  s += TX(X(n) + 22, 57, unit, 'f-txt', 11);
  return SV(X(n) + 40, 76, s);
}
// rods of given lengths (units) with emoji labels on the left, on a unit grid
function rods(lens, labels, ticks = true) {
  const u = 24, mx = Math.max(...lens); let s = '';
  for (let k = 0; k <= mx; k++) s += `<line x1="${34 + k * u}" y1="2" x2="${34 + k * u}" y2="${lens.length * 30 + 2}" class="f-grid"/>`;
  lens.forEach((L, i) => {
    const y = 8 + i * 30; s += `<text x="16" y="${y + 9}" text-anchor="middle" dominant-baseline="middle" font-size="16">${labels[i]}</text><rect x="34" y="${y}" width="${L * u}" height="18" class="f-accfill"/>`;
    if (ticks) for (let k = 1; k < L; k++) s += `<line x1="${34 + k * u}" y1="${y}" x2="${34 + k * u}" y2="${y + 18}" class="f-line"/>`;
  });
  return SV(40 + mx * u, lens.length * 30 + 6, s);
}
// a table of cells; cells equal to '?' are highlighted; head = shade first row and column
function table(cells, head = false) {
  const u = 40, R = cells.length, Cn = cells[0].length; let s = '';
  cells.forEach((rw, i) => rw.forEach((v, j) => {
    const x = 2 + j * u, y = 2 + i * u, h = head && (i === 0 || j === 0);
    s += `<rect x="${x}" y="${y}" width="${u}" height="${u}" class="${h ? 'f-accfill' : 'f-soft'}"/>` + (v === '' ? '' : TX(x + u / 2, y + u / 2, v, v === '?' ? 'f-acctxt' : 'f-txt', 16, 'font-weight="700"'));
  }));
  return SV(Cn * u + 4, R * u + 4, s);
}
// a grid of unit squares with some shaded
function cellFig(cols, rows, on) {
  const u = 26; let s = '';
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) s += `<rect x="${3 + x * u}" y="${3 + y * u}" width="${u}" height="${u}" class="${on.has(x + ',' + y) ? 'f-accfill' : 'f-soft'}"/>`;
  return SV(cols * u + 6, rows * u + 6, s);
}
// a number line from 0 to W wholes cut into d parts, labels only on whole numbers; pts = [{ v: numerator k (point at k/d), s: label }]
function fracLine(d, W, pts) {
  const w = 340, p = 24, X = (k) => p + (k / (d * W)) * (w - 2 * p);
  let s = `<line x1="${p - 10}" y1="34" x2="${w - p + 10}" y2="34" class="f-line" stroke-width="2"/>`;
  for (let k = 0; k <= d * W; k++) { const whole = k % d === 0; s += `<line x1="${X(k)}" y1="${whole ? 24 : 28}" x2="${X(k)}" y2="${whole ? 44 : 40}" class="f-line" stroke-width="${whole ? 2 : 1}"/>`; if (whole) s += TX(X(k), 58, k / d, 'f-txt', 13); }
  for (const pt of pts) s += `<circle cx="${X(pt.v)}" cy="34" r="5" class="f-accfill"/>` + TX(X(pt.v), 12, pt.s, 'f-acctxt', 14, 'font-weight="700"');
  return SV(w, 66, s);
}
// regular polygon points in the 220x170 box used by draw.shape
const regPts = (n) => range(0, n - 1).map((k) => { const a = -Math.PI / 2 + (k * 2 * Math.PI) / n; return [+(110 + 72 * Math.cos(a)).toFixed(1), +(90 + 72 * Math.sin(a)).toFixed(1)]; });
const circleFig = () => SV(160, 160, '<circle cx="80" cy="80" r="70" class="f-soft"/>');

// =====================================================================================================
// GRADE 1
// =====================================================================================================
const G1 = [
  {
    id: 'g1-count',
    grade: 1,
    name: T('數一數', 'Counting objects'),
    cur: { us: 'CCSS 1.NBT.A.1', tw: '一年級 100 以內的數', aops: 'Beast Academy 1' },
    gen(r) {
      const th = r.pick(THINGS), k = r.int(0, 2);
      if (k === 0) {
        const n = r.int(6, 20), full = Math.floor(n / 5), rem = n % 5;
        const fives = range(1, full).map((i) => i * 5);
        return {
          q: T(`數一數，圖中有幾${th.cw}${th.zh}？`, `How many ${th.en} are there?`), fig: dots(th.e, n, 5), ans: ansNum(n),
          sol: [
            T('每一排有 5 個，我們可以 5 個 5 個數，比較快也不容易數錯。', 'Each row has 5. Counting by fives is faster, and we are less likely to make a mistake.'),
            T(`滿的有 ${full} 排：${fives.join('、')}。`, `There ${full === 1 ? 'is 1 full row' : `are ${full} full rows`}: ${fives.join(', ')}.`),
            rem ? T(`最後一排還有 ${rem} 個，接著往下數：${range(full * 5 + 1, n).join('、')}。`, `The last row has ${rem} more, so keep counting: ${range(full * 5 + 1, n).join(', ')}.`)
              : T('沒有剩下的了。', 'Nothing is left over.'),
            T(`所以一共有 ${n} ${th.cw}。`, `So there are ${n} ${th.en} in all.`),
          ],
          hint: T('5 個 5 個數：5、10、15…', 'Count by fives: 5, 10, 15, …'),
        };
      }
      if (k === 1) {
        const a = r.int(2, 9), b = r.int(2, 9), n = a + b;
        return {
          q: T(`左邊一堆有 ${a} ${th.cw}，右邊一堆也有一些。兩堆${th.zh}一共有幾${th.cw}？`, `The left group has ${a} ${th.en}, and the right group has some more. How many ${th.en} are there in both groups?`),
          fig: dots(th.e, [a, b]), ans: ansNum(n),
          sol: [
            T(`左邊已經知道有 ${a} ${th.cw}，不用再從 1 開始數。`, `We already know the left group has ${a}, so we don't need to start again from 1.`),
            T(`從 ${a} 接著數右邊的 ${b} 個：${range(a + 1, n).join('、')}。`, `Count on from ${a} for the ${b} on the right: ${range(a + 1, n).join(', ')}.`),
            T(`${a} + ${b} = ${n}，一共有 ${n} ${th.cw}。`, `${a} + ${b} = ${n}. There are ${n} in all.`),
          ],
        };
      }
      const target = r.chance(0.65) ? 10 : 20, n = target === 10 ? r.int(2, 9) : r.int(11, 18), need = target - n;
      return {
        q: T(`圖中有一些${th.zh}。要湊成 ${target} ${th.cw}，還需要幾${th.cw}？`, `Here are some ${th.en}. How many more are needed to make ${target}?`),
        fig: dots(th.e, n, 5), ans: ansNum(need),
        sol: [
          T(`先數一數：圖中有 ${n} ${th.cw}。`, `First count them: there are ${n}.`),
          T(`從 ${n} 往上數到 ${target}：${range(n + 1, target).join('、')}。`, `Count up from ${n} to ${target}: ${range(n + 1, target).join(', ')}.`),
          T(`一共數了 ${need} 個，所以還需要 ${need} ${th.cw}。`, `That is ${need} numbers, so ${need} more are needed.`),
          T(`驗算：${n} + ${need} = ${target}。`, `Check: ${n} + ${need} = ${target}.`),
        ],
      };
    },
  },
  {
    id: 'g1-add-20',
    grade: 1,
    name: T('20 以內的加法', 'Addition within 20'),
    cur: { us: 'CCSS 1.OA.C.6', tw: '一年級 20 以內的加法', aops: 'Beast Academy 1' },
    gen(r) {
      let a, b;
      if (r.chance(0.2)) { a = r.int(11, 17); b = r.int(1, 19 - a); } else { a = r.int(2, 9); b = r.int(2, 9); }
      if (r.chance(0.5)) [a, b] = [b, a];
      const s = a + b, th = r.pick(THINGS), [n1] = r.sample(NAMES, 1), k = r.int(0, 2);
      const q = k === 0 ? T(`計算：${a} + ${b} = ?`, `Find ${a} + ${b}.`)
        : k === 1 ? T(`${n1[0]}有 ${a} ${th.cw}${th.zh}，又得到 ${b} ${th.cw}。現在一共有幾${th.cw}？`, `${n1[1]} has ${a} ${th.en} and gets ${b} more. How many ${th.en} does ${n1[1]} have now?`)
          : T(`盤子上有兩堆${th.zh}，一共有幾${th.cw}？`, `How many ${th.en} are on the plate in all?`);
      return {
        q, fig: k === 2 ? dots(th.e, [a, b], 5) : k === 0 && s <= 20 && r.chance(0.5) ? dots(th.e, [a, b], 5) : '', ans: ansNum(s),
        sol: [
          T(`要把兩個數合起來，用加法：${a} + ${b}。`, `Putting two amounts together means adding: ${a} + ${b}.`),
          ...addSteps(a, b),
          T(`所以 ${a} + ${b} = ${s}。`, `So ${a} + ${b} = ${s}.`),
        ],
        hint: T('先湊成 10 會比較好算。', 'Try making a 10 first.'),
      };
    },
  },
  {
    id: 'g1-sub-20',
    grade: 1,
    name: T('20 以內的減法', 'Subtraction within 20'),
    cur: { us: 'CCSS 1.OA.C.6', tw: '一年級 20 以內的減法', aops: 'Beast Academy 1' },
    gen(r) {
      const a = r.int(5, 19), b = r.int(2, a - 1), d = a - b, th = r.pick(THINGS), [n1, n2] = r.sample(NAMES, 2), k = r.int(0, 3);
      let q, fig = '';
      if (k === 0) q = T(`計算：${a} − ${b} = ?`, `Find ${a} − ${b}.`);
      else if (k === 1) { q = T(`圖中有 ${a} ${th.cw}${th.zh}，拿走 ${b} ${th.cw}以後，還剩幾${th.cw}？`, `There are ${a} ${th.en}. If ${b} are taken away, how many are left?`); fig = dots(th.e, a, 5); }
      else if (k === 2) q = T(`${n1[0]}有 ${a} ${th.cw}${th.zh}，送給${n2[0]} ${b} ${th.cw}。${n1[0]}還剩幾${th.cw}？`, `${n1[1]} has ${a} ${th.en} and gives ${b} to ${n2[1]}. How many ${th.en} does ${n1[1]} have left?`);
      else q = T(`${n1[0]}有 ${a} ${th.cw}${th.zh}，${n2[0]}有 ${b} ${th.cw}。${n1[0]}比${n2[0]}多幾${th.cw}？`, `${n1[1]} has ${a} ${th.en}. ${n2[1]} has ${b}. How many more does ${n1[1]} have than ${n2[1]}?`);
      return {
        q, fig, ans: ansNum(d),
        sol: [
          k === 3 ? T(`問「多幾個」就是比較相差多少，用減法：${a} − ${b}。`, `"How many more" asks for the difference, so subtract: ${a} − ${b}.`)
            : T(`拿走、剩下，用減法：${a} − ${b}。`, `Taking away means subtracting: ${a} − ${b}.`),
          ...subSteps(a, b),
          T(`所以 ${a} − ${b} = ${d}。驗算：${d} + ${b} = ${a}。`, `So ${a} − ${b} = ${d}. Check: ${d} + ${b} = ${a}.`),
        ],
      };
    },
  },
  {
    id: 'g1-missing-addend',
    grade: 1,
    name: T('找出 □ 是多少', 'Find the missing number'),
    cur: { us: 'CCSS 1.OA.D.8', tw: '一年級 加減法（□ 的問題）', aops: 'Beast Academy 1' },
    gen(r) {
      const c = r.int(8, 20), a = r.int(2, c - 2), m = c - a, k = r.int(0, 4), th = r.pick(THINGS), [n1] = r.sample(NAMES, 1);
      const countUp = (from, to) => T(`從 ${from} 往上數到 ${to}：${range(from + 1, to).join('、')}，一共數了 ${to - from} 個。`, `Count up from ${from} to ${to}: ${range(from + 1, to).join(', ')}. That is ${to - from} numbers.`);
      if (k <= 1) {
        const eq = k === 0 ? `□ + ${a} = ${c}` : `${a} + □ = ${c}`;
        return {
          q: T(`□ 裡應該填多少？　${eq}`, `What number goes in the box?　${eq}`), ans: ansNum(m),
          sol: [
            T(`${eq} 的意思是：${a} 再加多少會變成 ${c}？`, `${eq} asks: ${a} plus how many makes ${c}?`),
            countUp(a, c),
            T(`也可以用減法想：${c} − ${a} = ${m}。`, `You can also subtract: ${c} − ${a} = ${m}.`),
            T(`□ = ${m}。驗算：${k === 0 ? `${m} + ${a}` : `${a} + ${m}`} = ${c}。`, `The box is ${m}. Check: ${k === 0 ? `${m} + ${a}` : `${a} + ${m}`} = ${c}.`),
          ],
          hint: T('從小的數往上數到大的數。', 'Count up from the smaller number to the bigger one.'),
        };
      }
      if (k === 2) {
        const eq = `${c} − □ = ${a}`;
        return {
          q: T(`□ 裡應該填多少？　${eq}`, `What number goes in the box?　${eq}`), ans: ansNum(m),
          sol: [
            T(`${eq} 的意思是：${c} 拿走多少，會剩下 ${a}？`, `${eq} asks: take how many away from ${c} to leave ${a}?`),
            countUp(a, c),
            T(`所以拿走了 ${m}：□ = ${m}。`, `So ${m} were taken away: the box is ${m}.`),
            T(`驗算：${c} − ${m} = ${a}。`, `Check: ${c} − ${m} = ${a}.`),
          ],
        };
      }
      if (k === 3) {
        const eq = `□ − ${m} = ${a}`;
        return {
          q: T(`□ 裡應該填多少？　${eq}`, `What number goes in the box?　${eq}`), ans: ansNum(c),
          sol: [
            T(`${eq} 的意思是：一個數拿走 ${m} 以後剩 ${a}。原來有多少？`, `${eq} means: after taking away ${m}, there are ${a} left. How many were there at first?`),
            T(`把拿走的 ${m} 放回去，就是原來的數：${a} + ${m}。`, `Put the ${m} back to get the starting number: ${a} + ${m}.`),
            ...addSteps(a, m),
            T(`□ = ${c}。驗算：${c} − ${m} = ${a}。`, `The box is ${c}. Check: ${c} − ${m} = ${a}.`),
          ],
        };
      }
      return {
        q: T(`${n1[0]}本來有 ${a} ${th.cw}${th.zh}，媽媽又給了一些，現在有 ${c} ${th.cw}。媽媽給了幾${th.cw}？`, `${n1[1]} had ${a} ${th.en}. Mom gave some more, and now there are ${c}. How many did Mom give?`),
        ans: ansNum(m),
        sol: [
          T(`可以寫成 ${a} + □ = ${c}。`, `We can write this as ${a} + □ = ${c}.`),
          countUp(a, c),
          T(`媽媽給了 ${m} ${th.cw}。驗算：${a} + ${m} = ${c}。`, `Mom gave ${m}. Check: ${a} + ${m} = ${c}.`),
        ],
      };
    },
  },
  {
    id: 'g1-make-ten',
    grade: 1,
    name: T('湊十與數的分解', 'Make ten and number bonds'),
    cur: { us: 'CCSS 1.OA.C.6', tw: '一年級 10 的合成與分解', aops: 'Beast Academy 1' },
    gen(r) {
      const k = r.int(0, 2);
      if (k === 0) {
        const a = r.int(1, 9), m = 10 - a, form = r.int(0, 1);
        const eq = form ? `${a} + □ = 10` : `10 = ${a} + □`;
        return {
          q: T(`看十格板，□ 裡應該填多少？　${eq}`, `Look at the ten frame. What goes in the box?　${eq}`), fig: tenFrame(a), ans: ansNum(m),
          sol: [
            T(`十格板一共有 10 格，已經放了 ${a} 個圓點。`, `A ten frame has 10 boxes. ${a} of them have dots.`),
            T(`數一數空的格子：有 ${m} 格。`, `Count the empty boxes: there are ${m}.`),
            T(`所以 ${a} + ${m} = 10，□ = ${m}。`, `So ${a} + ${m} = 10, and the box is ${m}.`),
          ],
          hint: T('數一數空格。', 'Count the empty boxes.'),
        };
      }
      if (k === 1) {
        const top = r.int(5, 18), part = r.int(1, top - 1), m = top - part, left = r.chance(0.5);
        return {
          q: T(`數的分解：上面的數可以分成下面兩個數。? 是多少？`, `Number bond: the top number splits into the two numbers below. What is the missing number?`),
          fig: left ? bond(top, '?', part) : bond(top, part, '?'), ans: ansNum(m),
          sol: [
            T(`上面的 ${top} 是全部，下面是它分成的兩個部分。`, `${top} on top is the whole; the two circles below are its parts.`),
            T(`已經知道一個部分是 ${part}，另一個部分 = ${top} − ${part}。`, `One part is ${part}, so the other part is ${top} − ${part}.`),
            T(`從 ${part} 往上數到 ${top}，數了 ${m} 個，所以 ? = ${m}。`, `Counting up from ${part} to ${top} takes ${m} steps, so the missing number is ${m}.`),
            T(`驗算：${part} + ${m} = ${top}。`, `Check: ${part} + ${m} = ${top}.`),
          ],
        };
      }
      const a = r.int(1, 8), b = 10 - a;
      const pr = (x, y) => T(`${x} 和 ${y}`, `${x} and ${y}`);
      const opts = [pr(a, b), pr(a, b + 1), pr(a + 1, b + 1), pr(a, b - 1)];
      return {
        q: T('哪兩個數合起來剛好是 10？', 'Which two numbers make exactly 10 together?'), ans: ansChoice(opts),
        sol: [
          T('把每一組加加看，看哪一組剛好是 10。', 'Add each pair and see which one makes exactly 10.'),
          T(`${a} + ${b} = 10 ✔`, `${a} + ${b} = 10 ✔`),
          T(`記住 10 的好朋友：1 和 9、2 和 8、3 和 7、4 和 6、5 和 5。`, `Remember the pairs that make 10: 1 and 9, 2 and 8, 3 and 7, 4 and 6, 5 and 5.`),
        ],
      };
    },
  },
  {
    id: 'g1-add-three',
    grade: 1,
    name: T('三個數相加', 'Adding three numbers'),
    cur: { us: 'CCSS 1.OA.A.2', tw: '一年級 連加', aops: 'Beast Academy 1' },
    gen(r) {
      let a, b, c;
      do {
        if (r.chance(0.6)) { const x = r.int(1, 9); const pair = [x, 10 - x], z = r.int(1, 9); [a, b, c] = r.shuffle([...pair, z]); }
        else { a = r.int(1, 9); b = r.int(1, 9); c = r.int(1, 9); }
      } while (a + b + c > 20 || a + b + c < 6);
      const s = a + b + c, th = r.pick(THINGS), [n1] = r.sample(NAMES, 1), k = r.int(0, 2);
      const nums = [a, b, c]; let pi = -1, pj = -1;
      for (let i = 0; i < 3 && pi < 0; i++) for (let j = i + 1; j < 3; j++) if (nums[i] + nums[j] === 10) { pi = i; pj = j; break; }
      const q = k === 0 ? T(`計算：${a} + ${b} + ${c} = ?`, `Find ${a} + ${b} + ${c}.`)
        : k === 1 ? T(`${n1[0]}星期一摘了 ${a} ${th.cw}${th.zh}，星期二摘了 ${b} ${th.cw}，星期三摘了 ${c} ${th.cw}。一共摘了幾${th.cw}？`, `${n1[1]} picked ${a} ${th.en} on Monday, ${b} on Tuesday and ${c} on Wednesday. How many in all?`)
          : T(`三堆${th.zh}一共有幾${th.cw}？`, `How many ${th.en} are there in the three groups?`);
      let sol;
      if (pi >= 0) {
        const z = nums[3 - pi - pj];
        sol = [
          T('三個數相加，可以換順序，先找能湊成 10 的兩個數。', 'When adding three numbers we can change the order. Look for two numbers that make 10.'),
          T(`${nums[pi]} + ${nums[pj]} = 10，先算它們。`, `${nums[pi]} + ${nums[pj]} = 10, so add those first.`),
          T(`再加上 ${z}：10 + ${z} = ${s}。`, `Then add ${z}: 10 + ${z} = ${s}.`),
          T(`所以答案是 ${s}。`, `So the answer is ${s}.`),
        ];
      } else {
        sol = [
          T('從左邊開始，一次加兩個數。', 'Start from the left and add two numbers at a time.'),
          T(`${a} + ${b} = ${a + b}。`, `${a} + ${b} = ${a + b}.`),
          T(`${a + b} + ${c} = ${s}。`, `${a + b} + ${c} = ${s}.`),
          T(`所以答案是 ${s}。`, `So the answer is ${s}.`),
        ];
      }
      return { q, fig: k === 2 ? dots(th.e, [a, b, c], 5) : '', ans: ansNum(s), sol, hint: T('先找湊成 10 的兩個數。', 'Look for two numbers that make 10.') };
    },
  },
  {
    id: 'g1-compare',
    grade: 1,
    name: T('比較數的大小（>、<、=）', 'Comparing numbers (>, <, =)'),
    cur: { us: 'CCSS 1.NBT.B.3', tw: '一年級 數的大小比較', aops: 'Beast Academy 1' },
    gen(r) {
      const k = r.int(0, 2);
      const tens = (n) => Math.floor(n / 10), ones = (n) => n % 10;
      if (k === 0) {
        let a = r.int(10, 99), b;
        if (r.chance(0.12)) b = a; else if (r.chance(0.4)) b = ones(a) ? ones(a) * 10 + tens(a) : a + 1; else b = tens(a) * 10 + r.int(0, 9);
        if (r.chance(0.3)) b = r.int(10, 99);
        if (b < 10) b = a + 1 > 99 ? a - 1 : a + 1;
        const right = a > b ? '&gt;' : a < b ? '&lt;' : '=';
        const why = a === b ? T(`${a} 和 ${b} 一樣大，用 =。`, `${a} and ${b} are the same, so use =.`)
          : tens(a) !== tens(b) ? T(`先比十位：${a} 有 ${tens(a)} 個十，${b} 有 ${tens(b)} 個十。${Math.max(tens(a), tens(b))} 個十比較多。`, `Compare the tens first: ${a} has ${TN(tens(a))} and ${b} has ${TN(tens(b))}. ${TN(Math.max(tens(a), tens(b)))} is more.`)
            : T(`十位一樣都是 ${tens(a)} 個十，再比個位：${ones(a)} 和 ${ones(b)}。`, `The tens are the same (${TN(tens(a))}), so compare the ones: ${ones(a)} and ${ones(b)}.`);
        return {
          q: T(`在 ○ 裡填入 &gt;、&lt; 或 =：　${a} ○ ${b}`, `Fill in &gt;, &lt; or =:　${a} ○ ${b}`),
          ans: ansChoice([right, ...['&gt;', '&lt;', '='].filter((x) => x !== right)]),
          sol: [why,
            a === b ? T(`所以 ${a} = ${b}。`, `So ${a} = ${b}.`) : T(`所以 ${Math.max(a, b)} 比較大：${a} ${right} ${b}。`, `So ${Math.max(a, b)} is bigger: ${a} ${right} ${b}.`),
            T('記住：開口（大嘴巴）朝向比較大的數。', 'Remember: the open side (the big mouth) faces the bigger number.')],
        };
      }
      if (k === 1) {
        const t = r.int(1, 8), big = r.chance(0.5);
        let set; do set = uniq([t * 10 + r.int(0, 9), (t + 1) * 10 + r.int(0, 9), t * 10 + r.int(0, 9), r.int(1, 9) * 10 + t].filter((x) => x >= 10 && x <= 99)); while (set.length < 4);
        set = set.slice(0, 4); const best = big ? Math.max(...set) : Math.min(...set);
        const sorted = set.slice().sort((x, y) => x - y);
        return {
          q: T(`${set.join('、')}　哪一個數最${big ? '大' : '小'}？`, `${set.join(', ')}　Which number is the ${big ? 'greatest' : 'least'}?`),
          ans: ansChoice([String(best), ...set.filter((x) => x !== best).map(String)]),
          sol: [
            T(`先看十位，十位${big ? '越大' : '越小'}，數就${big ? '越大' : '越小'}。`, `Look at the tens digit first: ${big ? 'more tens means a bigger number' : 'fewer tens means a smaller number'}.`),
            T(`十位一樣時，再比個位。`, `If the tens are the same, compare the ones.`),
            T(`由小排到大：${sorted.join(' &lt; ')}。`, `From least to greatest: ${sorted.join(' &lt; ')}.`),
            T(`最${big ? '大' : '小'}的是 ${best}。`, `The ${big ? 'greatest' : 'least'} is ${best}.`),
          ],
        };
      }
      const a = r.int(11, 89), d = r.pick([1, 10]), more = r.chance(0.5), v = more ? a + d : a - d;
      return {
        q: T(`比 ${a} ${more ? '多' : '少'} ${d} 的數是多少？`, `What number is ${d} ${more ? 'more' : 'less'} than ${a}?`), ans: ansNum(v),
        sol: d === 1 ? [
          T(`${more ? '多' : '少'} 1 就是往${more ? '後' : '前'}數一個。`, `${d} ${more ? 'more' : 'less'} means count one step ${more ? 'forward' : 'back'}.`),
          T(`${a} 的${more ? '下一個' : '前一個'}數是 ${v}。`, `The number ${more ? 'after' : 'before'} ${a} is ${v}.`),
          T(`答案是 ${v}。`, `The answer is ${v}.`),
        ] : [
          T(`${more ? '多' : '少'} 10 就是十位${more ? '多' : '少'} 1 個十，個位不變。`, `10 ${more ? 'more' : 'less'} means one ${more ? 'more' : 'fewer'} ten; the ones digit stays the same.`),
          T(`${a} 有 ${tens(a)} 個十和 ${ones(a)} 個一，變成 ${tens(v)} 個十和 ${ones(v)} 個一。`, `${a} is ${TN(tens(a))} and ${ON(ones(a))}; now it is ${TN(tens(v))} and ${ON(ones(v))}.`),
          T(`答案是 ${v}。`, `The answer is ${v}.`),
        ],
      };
    },
  },
  {
    id: 'g1-tens-ones',
    grade: 1,
    name: T('十位和個位', 'Tens and ones'),
    cur: { us: 'CCSS 1.NBT.B.2', tw: '一年級 位值（十位、個位）', aops: 'Beast Academy 1' },
    gen(r) {
      const t = r.int(1, 9), o = r.int(0, 9), n = 10 * t + o, k = r.int(0, 3);
      if (k === 0) return {
        q: T('圖中的積木代表多少？（一長條是 10，一小塊是 1）', 'What number do the blocks show? (A long rod is 10; a small cube is 1.)'),
        fig: blocks(t, o), ans: ansNum(n),
        sol: [
          T(`數長條：有 ${t} 條，就是 ${t} 個十 = ${10 * t}。`, `Count the rods: ${t} rods are ${TN(t)} = ${10 * t}.`),
          T(`數小塊：有 ${o} 塊，就是 ${o} 個一。`, `Count the cubes: ${o} cubes are ${ON(o)}.`),
          T(`${10 * t} + ${o} = ${n}。`, `${10 * t} + ${o} = ${n}.`),
        ],
      };
      if (k === 1) {
        const rev = r.chance(0.4);
        return {
          q: rev ? T(`${o} 個一和 ${t} 個十合起來是多少？`, `${ON(o)} and ${TN(t)} make what number?`) : T(`${t} 個十和 ${o} 個一合起來是多少？`, `${TN(t)} and ${ON(o)} make what number?`),
          ans: ansNum(n),
          sol: [
            T(`${t} 個十是 ${10 * t}，寫在十位：${t}。`, `${TN(t)} is ${10 * t}; the tens digit is ${t}.`),
            T(`${o} 個一寫在個位：${o}。`, `${ON(o)} go in the ones place: ${o}.`),
            rev ? T(`小心！題目先說個位，但寫數字時十位在左邊：${n}。`, `Careful! The ones were said first, but the tens digit is written on the left: ${n}.`) : T(`合起來就是 ${n}。`, `Together that is ${n}.`),
          ],
        };
      }
      if (k === 2) {
        const askT = r.chance(0.5);
        return {
          q: askT ? T(`${n} 是由幾個十和幾個一組成的？請問有幾個十？`, `${n} is made of some tens and some ones. How many tens?`) : T(`${n} 的個位數字是多少？`, `What is the ones digit of ${n}?`),
          fig: blocks(t, o), ans: ansNum(askT ? t : o),
          sol: [
            T(`${n} 的十位數字是 ${t}，個位數字是 ${o}。`, `In ${n}, the tens digit is ${t} and the ones digit is ${o}.`),
            T(`所以 ${n} = ${t} 個十 + ${o} 個一 = ${10 * t} + ${o}。`, `So ${n} = ${TN(t)} + ${ON(o)} = ${10 * t} + ${o}.`),
            T(`答案是 ${askT ? t : o}。`, `The answer is ${askT ? t : o}.`),
          ],
        };
      }
      const tt = r.int(1, 6), oo = r.int(11, 19), v = 10 * tt + oo;
      return {
        q: T(`${tt} 個十和 ${oo} 個一合起來是多少？`, `${TN(tt)} and ${ON(oo)} make what number?`), ans: ansNum(v),
        sol: [
          T(`${oo} 個一比 10 多，可以先把 10 個一換成 1 個十。`, `${ON(oo)} is more than 10, so trade 10 ones for 1 ten.`),
          T(`${oo} 個一 = 1 個十和 ${oo - 10} 個一。`, `${ON(oo)} = 1 ten and ${ON(oo - 10)}.`),
          T(`現在有 ${tt + 1} 個十和 ${oo - 10} 個一，就是 ${v}。`, `Now there are ${TN(tt + 1)} and ${ON(oo - 10)}, which is ${v}.`),
          T(`也可以這樣算：${10 * tt} + ${oo} = ${v}。`, `Or: ${10 * tt} + ${oo} = ${v}.`),
        ],
      };
    },
  },
  {
    id: 'g1-add-tens',
    grade: 1,
    name: T('整十數與二位數加減一位數', 'Adding tens and 2-digit + 1-digit'),
    cur: { us: 'CCSS 1.NBT.C.4', tw: '一年級 二位數的加減', aops: 'Beast Academy 1' },
    gen(r) {
      const type = r.int(0, 4), story = r.chance(0.3), [n1] = r.sample(NAMES, 1);
      let a, b, op = '+', sol;
      if (type === 0) {
        const x = r.int(1, 8), y = r.int(1, 9 - x); a = 10 * x; b = 10 * y;
        sol = [T(`${a} 是 ${x} 個十，${b} 是 ${y} 個十。`, `${a} is ${TN(x)} and ${b} is ${TN(y)}.`), T(`${x} 個十 + ${y} 個十 = ${x + y} 個十。`, `${TN(x)} + ${TN(y)} = ${TN(x + y)}.`), T(`${x + y} 個十就是 ${10 * (x + y)}。`, `${TN(x + y)} is ${10 * (x + y)}.`)];
      } else if (type === 1) {
        a = r.int(11, 69); if (a % 10 === 0) a++; const y = r.int(1, 9 - Math.floor(a / 10)); b = 10 * y;
        sol = [T(`加 ${b} 就是加 ${y} 個十，只有十位會改變。`, `Adding ${b} means adding ${TN(y)}, so only the tens digit changes.`), T(`十位：${Math.floor(a / 10)} + ${y} = ${Math.floor(a / 10) + y}；個位還是 ${a % 10}。`, `Tens: ${Math.floor(a / 10)} + ${y} = ${Math.floor(a / 10) + y}. The ones stay ${a % 10}.`), T(`所以是 ${a + b}。`, `So it is ${a + b}.`)];
      } else if (type === 2) {
        const t = r.int(1, 8), o = r.int(1, 8); a = 10 * t + o; b = r.int(1, 9 - o);
        sol = [T(`${a} 是 ${t} 個十和 ${o} 個一。`, `${a} is ${TN(t)} and ${ON(o)}.`), T(`個位相加：${o} + ${b} = ${o + b}，沒有超過 9。`, `Add the ones: ${o} + ${b} = ${o + b}. That is not more than 9.`), T(`十位不變，答案是 ${a + b}。`, `The tens stay the same. The answer is ${a + b}.`)];
      } else if (type === 3) {
        const t = r.int(1, 8), o = r.int(2, 9); a = 10 * t + o; b = r.int(11 - o, 9);
        const need = 10 - o;
        sol = [T(`${a} 的個位是 ${o}，再加 ${need} 就湊成下一個十：${a} + ${need} = ${a + need}。`, `${a} needs ${need} more to reach the next ten: ${a} + ${need} = ${a + need}.`), T(`把 ${b} 拆成 ${need} 和 ${b - need}。`, `Break ${b} into ${need} and ${b - need}.`), T(`${a + need} + ${b - need} = ${a + b}。`, `${a + need} + ${b - need} = ${a + b}.`)];
      } else {
        op = '−'; const x = r.int(3, 9), y = r.int(1, x - 1), o = r.chance(0.5) ? 0 : r.int(1, 9); a = 10 * x + o; b = 10 * y;
        sol = [T(`減 ${b} 就是拿走 ${y} 個十。`, `Subtracting ${b} means taking away ${TN(y)}.`), T(`十位：${x} − ${y} = ${x - y}；個位還是 ${o}。`, `Tens: ${x} − ${y} = ${x - y}. The ones stay ${o}.`), T(`所以是 ${a - b}。`, `So it is ${a - b}.`)];
      }
      const v = op === '+' ? a + b : a - b;
      const q = !story ? T(`計算：${a} ${op} ${b} = ?`, `Find ${a} ${op} ${b}.`)
        : op === '+' ? T(`${n1[0]}有 ${a} 張貼紙，又得到 ${b} 張。現在有幾張？`, `${n1[1]} has ${a} stickers and gets ${b} more. How many stickers now?`)
          : T(`${n1[0]}有 ${a} 張貼紙，用掉 ${b} 張。還剩幾張？`, `${n1[1]} has ${a} stickers and uses ${b}. How many are left?`);
      return { q, ans: ansNum(v), sol: [...sol, T(`${a} ${op} ${b} = ${v}。`, `${a} ${op} ${b} = ${v}.`)] };
    },
  },
  {
    id: 'g1-time-hour',
    grade: 1,
    name: T('認識時鐘（整點、半點）', 'Telling time to the hour and half hour'),
    cur: { us: 'CCSS 1.MD.B.3', tw: '一年級 認識時鐘（整點、半點）', aops: 'Beast Academy 1' },
    gen(r) {
      const h = r.int(1, 12), m = r.pick([0, 30]), k = r.int(0, 3), nx = h12(h + 1), pv = h12(h - 1);
      const read = [
        T('短的針是時針，長的針是分針。', 'The short hand is the hour hand; the long hand is the minute hand.'),
        m === 0 ? T('分針指著 12，表示「整點」。', 'The minute hand points to 12, so it is exactly on the hour (o\'clock).')
          : T('分針指著 6，走了半圈，表示「半點」（30 分）。', 'The minute hand points to 6, halfway around: that means 30 minutes, "half past".'),
        m === 0 ? T(`時針指著 ${h}，所以是 ${h} 點。`, `The hour hand points to ${h}, so it is ${h}:00 (${h} o'clock).`)
          : T(`時針在 ${h} 和 ${nx} 的中間，已經過了 ${h}，還沒到 ${nx}，所以是 ${h} 點半。`, `The hour hand is between ${h} and ${nx}: past ${h} but not yet ${nx}. So it is ${h}:30 (half past ${h}).`),
      ];
      const wrong = m === 0 ? [tl(h, 30), tl(nx, 0), tl(pv, 0)] : [tl(nx, 30), tl(h, 0), tl(nx, 0)];
      if (k === 0) return { q: T('時鐘上是幾點？', 'What time does the clock show?'), fig: clock(h, m), ans: ansChoice([tl(h, m), ...wrong]), sol: read };
      if (k === 1) return {
        q: T(`哪一個時鐘是 ${tl(h, m).zh}？`, `Which clock shows ${tl(h, m).en}?`),
        ans: ansChoice([clock(h, m), clock(h, 30 - m), clock(nx, m), clock(m === 0 ? pv : nx, 30 - m)]),
        sol: [read[0], m === 0 ? T(`${h} 點：分針要指著 12，時針指著 ${h}。`, `${h}:00 — the minute hand points to 12 and the hour hand points to ${h}.`)
          : T(`${h} 點半：分針要指著 6，時針在 ${h} 和 ${nx} 的中間。`, `${h}:30 — the minute hand points to 6 and the hour hand is halfway between ${h} and ${nx}.`),
        T('找出兩根針都對的那一個時鐘。', 'Pick the clock where both hands are right.')],
      };
      if (k === 2) return {
        q: m === 0 ? T(`時針指著 ${h}，分針指著 12。是幾點？`, `The hour hand points to ${h} and the minute hand points to 12. What time is it?`)
          : T(`時針在 ${h} 和 ${nx} 的中間，分針指著 6。是幾點？`, `The hour hand is between ${h} and ${nx}, and the minute hand points to 6. What time is it?`),
        ans: ansChoice([tl(h, m), ...wrong]), sol: read.slice(1).concat([T(`答案：${tl(h, m).zh}。`, `Answer: ${tl(h, m).en}.`)]),
      };
      const d = r.int(1, 3), later = h12(h + d);
      return {
        q: T(`時鐘上是現在的時間。再過 ${d} 小時是幾點？`, `The clock shows the time now. What time will it be ${d} hour${d > 1 ? 's' : ''} later?`), fig: clock(h, m),
        ans: ansChoice([tl(later, m), tl(h12(later + 1), m), tl(h, m), tl(later, 30 - m)]),
        sol: [read[1], read[2], T(`過 1 小時，時針往前走 1 個數字，分針轉一整圈回到原來的地方。`, `In 1 hour the hour hand moves forward one number, and the minute hand goes all the way around back to the same place.`),
          T(`${h} 往後數 ${d} 個數字是 ${later}${h + d > 12 ? '（過了 12 又從 1 開始）' : ''}，所以是 ${tl(later, m).zh}。`, `Count ${d} forward from ${h}: ${later}${h + d > 12 ? ' (after 12 comes 1 again)' : ''}. So it will be ${tl(later, m).en}.`)],
      };
    },
  },
  {
    id: 'g1-word-problems',
    grade: 1,
    name: T('加減應用問題', 'Addition and subtraction word problems'),
    cur: { us: 'CCSS 1.OA.A.1', tw: '一年級 加減應用問題', aops: 'Beast Academy 1' },
    gen(r) {
      const th = r.pick(THINGS), [A, B] = r.sample(NAMES, 2), k = r.int(0, 4);
      let a = r.int(3, 12), b = r.int(2, 9); if (a + b > 20) b = 20 - a;
      if (k === 0) return {
        q: T(`${A[0]}有 ${a} ${th.cw}${th.zh}，${B[0]}有 ${b} ${th.cw}。兩人一共有幾${th.cw}？`, `${A[1]} has ${a} ${th.en} and ${B[1]} has ${b}. How many do they have together?`), ans: ansNum(a + b),
        sol: [T(`「一共」就是合起來，用加法：${a} + ${b}。`, `"Together" means put them together, so add: ${a} + ${b}.`), ...addSteps(a, b), T(`兩人一共有 ${a + b} ${th.cw}。`, `They have ${a + b} ${th.en} together.`)],
      };
      if (k === 1) {
        const c = a + b;
        return {
          q: T(`盒子裡有 ${c} ${th.cw}${th.zh}，${A[0]}拿走了 ${b} ${th.cw}。盒子裡還剩幾${th.cw}？`, `A box has ${c} ${th.en}. ${A[1]} takes ${b} of them. How many are left in the box?`), ans: ansNum(a),
          sol: [T(`「拿走、還剩」用減法：${c} − ${b}。`, `"Takes … left" means subtract: ${c} − ${b}.`), ...subSteps(c, b), T(`還剩 ${a} ${th.cw}。驗算：${a} + ${b} = ${c}。`, `${a} are left. Check: ${a} + ${b} = ${c}.`)],
        };
      }
      if (k === 2) {
        const big = a + b;
        return {
          q: r.chance(0.5) ? T(`${A[0]}有 ${big} ${th.cw}${th.zh}，${B[0]}有 ${a} ${th.cw}。${A[0]}比${B[0]}多幾${th.cw}？`, `${A[1]} has ${big} ${th.en} and ${B[1]} has ${a}. How many more does ${A[1]} have than ${B[1]}?`)
            : T(`${A[0]}有 ${big} ${th.cw}${th.zh}，${B[0]}有 ${a} ${th.cw}。${B[0]}比${A[0]}少幾${th.cw}？`, `${A[1]} has ${big} ${th.en} and ${B[1]} has ${a}. How many fewer does ${B[1]} have than ${A[1]}?`),
          ans: ansNum(b),
          sol: [T(`比較兩個人差多少，用大的減小的：${big} − ${a}。`, `To compare, subtract the smaller from the bigger: ${big} − ${a}.`), ...subSteps(big, a), T(`相差 ${b} ${th.cw}。`, `The difference is ${b}.`)],
        };
      }
      if (k === 3) {
        const c = a + b;
        return {
          q: T(`${A[0]}有 ${a} ${th.cw}${th.zh}，${B[0]}又給了${A[0]}一些，現在${A[0]}有 ${c} ${th.cw}。${B[0]}給了幾${th.cw}？`, `${A[1]} had ${a} ${th.en}. ${B[1]} gave some more, and now ${A[1]} has ${c}. How many did ${B[1]} give?`), ans: ansNum(b),
          sol: [T(`可以寫成 ${a} + □ = ${c}。`, `Write it as ${a} + □ = ${c}.`), T(`從 ${a} 往上數到 ${c}：${range(a + 1, c).join('、')}，數了 ${b} 個。`, `Count up from ${a} to ${c}: ${range(a + 1, c).join(', ')}. That is ${b} numbers.`), T(`${B[0]}給了 ${b} ${th.cw}。驗算：${a} + ${b} = ${c}。`, `${B[1]} gave ${b}. Check: ${a} + ${b} = ${c}.`)],
        };
      }
      const left = r.int(2, 9), ate = r.int(2, 9), start = left + ate;
      return {
        q: T(`${A[0]}吃掉了 ${ate} 片餅乾以後，還剩 ${left} 片。${A[0]}原來有幾片餅乾？`, `After ${A[1]} ate ${ate} cookies, ${left} were left. How many cookies were there at first?`), ans: ansNum(start),
        sol: [T(`原來的 = 剩下的 + 吃掉的。把吃掉的「放回去」就是原來的數量。`, `At first = left + eaten. "Put back" the eaten cookies to find how many there were.`), ...addSteps(left, ate), T(`原來有 ${start} 片。驗算：${start} − ${ate} = ${left}。`, `There were ${start} at first. Check: ${start} − ${ate} = ${left}.`)],
      };
    },
  },
  {
    id: 'g1-shapes',
    grade: 1,
    name: T('認識形狀（邊和角）', 'Shapes: sides and corners'),
    cur: { us: 'CCSS 1.G.A.1', tw: '一年級 認識形狀', aops: 'Beast Academy 1' },
    gen(r) {
      const SH = [
        { n: 3, zh: '三角形', en: 'triangle' }, { n: 4, zh: '正方形', en: 'square' }, { n: 4, zh: '長方形', en: 'rectangle' },
        { n: 5, zh: '五邊形', en: 'pentagon' }, { n: 6, zh: '六邊形', en: 'hexagon' }, { n: 0, zh: '圓形', en: 'circle' },
      ];
      const tris = [[[110, 18], [30, 150], [190, 150]], [[40, 30], [40, 150], [190, 150]], [[70, 20], [20, 150], [200, 120]]];
      const figOf = (s) => s.en === 'circle' ? circleFig() : s.en === 'triangle' ? shape(r.pick(tris)) : s.en === 'square' ? shape([[50, 25], [170, 25], [170, 145], [50, 145]])
        : s.en === 'rectangle' ? shape([[20, 45], [200, 45], [200, 135], [20, 135]]) : shape(regPts(s.n));
      const nm = (s) => T(s.zh, s.en);
      const k = r.int(0, 3);
      if (k === 0) {
        const s = r.pick(SH), others = SH.filter((x) => x !== s && !(s.en === 'square' && x.en === 'rectangle'));
        return {
          q: T('這是什麼形狀？', 'What shape is this?'), fig: figOf(s), ans: ansChoice([nm(s), ...r.sample(others, 3).map(nm)]),
          sol: [
            s.n ? T(`數一數邊：有 ${s.n} 條直直的邊，也有 ${s.n} 個角。`, `Count the sides: ${s.n} straight sides and ${s.n} corners.`) : T('它是圓圓的，沒有直的邊，也沒有角。', 'It is round, with no straight sides and no corners.'),
            s.en === 'square' ? T('4 條邊都一樣長，4 個角都是直角。', 'All 4 sides are the same length and all 4 corners are square corners.')
              : s.en === 'rectangle' ? T('4 個角都是直角，上下兩條邊比左右兩條邊長。', 'All 4 corners are square corners; the top and bottom sides are longer than the left and right sides.') : T(`${s.n ? `${s.n} 條邊的形狀叫做${s.zh}。` : '這個形狀叫做圓形。'}`, `${s.n ? `A shape with ${s.n} sides is a ${s.en}.` : 'This shape is a circle.'}`),
            T(`答案：${s.zh}。`, `Answer: ${s.en}.`),
          ],
        };
      }
      if (k === 1) {
        const s = r.pick(SH.slice(0, 5)), side = r.chance(0.5);
        return {
          q: side ? T(`${s.zh}有幾條邊？`, `How many sides does a ${s.en} have?`) : T(`${s.zh}有幾個角？`, `How many corners does a ${s.en} have?`),
          fig: figOf(s), ans: ansNum(s.n),
          sol: [T(`看圖，沿著${s.zh}的邊一條一條數。`, `Look at the picture and count around the ${s.en} one ${side ? 'side' : 'corner'} at a time.`),
            T(`${s.zh}有 ${s.n} 條邊和 ${s.n} 個角（邊和角一樣多）。`, `A ${s.en} has ${s.n} sides and ${s.n} corners (always the same number).`),
            T(`答案是 ${s.n}。`, `The answer is ${s.n}.`)],
        };
      }
      if (k === 2) {
        const [s1, s2] = r.sample(SH.slice(0, 5), 2), a = r.int(1, 3), b = r.int(1, 3), tot = a * s1.n + b * s2.n;
        const list1 = Array(a).fill(s1.n).join(' + '), list2 = Array(b).fill(s2.n).join(' + ');
        return {
          q: T(`有 ${a} 個${s1.zh}和 ${b} 個${s2.zh}。它們一共有幾個角？`, `There ${a === 1 ? 'is' : 'are'} ${a} ${s1.en}${a > 1 ? 's' : ''} and ${b} ${s2.en}${b > 1 ? 's' : ''}. How many corners do they have in all?`),
          ans: ansNum(tot),
          sol: [T(`每個${s1.zh}有 ${s1.n} 個角，每個${s2.zh}有 ${s2.n} 個角。`, `Each ${s1.en} has ${s1.n} corners; each ${s2.en} has ${s2.n} corners.`),
            T(`${s1.zh}：${list1} = ${a * s1.n}。`, `${cap(s1.en)}s: ${list1} = ${a * s1.n}.`),
            T(`${s2.zh}：${list2} = ${b * s2.n}。`, `${cap(s2.en)}s: ${list2} = ${b * s2.n}.`),
            T(`一共 ${a * s1.n} + ${b * s2.n} = ${tot} 個角。`, `In all: ${a * s1.n} + ${b * s2.n} = ${tot} corners.`)],
        };
      }
      const s = r.pick([SH[0], SH[3], SH[4]]);
      return {
        q: T(`猜猜我是誰：我有 ${s.n} 條直直的邊和 ${s.n} 個角。我是什麼形狀？`, `Guess who: I have ${s.n} straight sides and ${s.n} corners. What shape am I?`),
        ans: ansChoice([nm(s), ...SH.filter((x) => x !== s && x.en !== 'rectangle').slice(0, 3).map(nm)]),
        sol: [T('形狀的名字常常就是在說它有幾條邊。', 'A shape\'s name often tells how many sides it has.'), T(`${s.n} 條邊、${s.n} 個角的形狀是${s.zh}。`, `A shape with ${s.n} sides and ${s.n} corners is a ${s.en}.`), T(`答案：${s.zh}。`, `Answer: ${s.en}.`)],
      };
    },
  },
  {
    id: 'g1-patterns',
    grade: 1,
    name: T('找規律：下一個是什麼？', 'Patterns: what comes next?'),
    cur: { us: 'Grade 1 · Patterns', tw: '一年級 規律', aops: 'Beast Academy 1' },
    gen(r) {
      const k = r.int(0, 2);
      if (k === 0) {
        const pal = ['🔴', '🔵', '🟡', '🟢', '⭐', '🌙', '🍎', '🐶', '🐱', '🌸'];
        const kinds = [[0, 1], [0, 0, 1], [0, 1, 1], [0, 1, 2], [0, 0, 1, 1], [0, 1, 2, 2]];
        const kind = r.pick(kinds), em = r.sample(pal, 4), unit = kind.map((i) => em[i]);
        const L = unit.length * 2 + r.int(1, unit.length), seq = range(0, L - 1).map((i) => unit[i % unit.length]), nxt = unit[L % unit.length];
        const used = [...new Set(unit)], extra = em.filter((e) => !used.includes(e));
        const opts = uniq([nxt, ...used, ...extra]).slice(0, 4);
        return {
          q: T(`找規律，下一個是什麼？　${seq.join(' ')} ？`, `Find the pattern. What comes next?　${seq.join(' ')} ?`), ans: ansChoice(opts),
          sol: [
            T(`找出一直重複的那一段：${unit.join(' ')}。`, `Find the part that repeats: ${unit.join(' ')}.`),
            T(`這一段有 ${unit.length} 個，一段一段排下去。`, `That part has ${unit.length} items, and it repeats again and again.`),
            T(`已經排了 ${L} 個，下一個是第 ${L + 1} 個，剛好是重複段裡的第 ${(L % unit.length) + 1} 個：${nxt}。`, `There are ${L} items so far. The next one is item ${L + 1}, which is item ${(L % unit.length) + 1} of the repeating part: ${nxt}.`),
          ],
        };
      }
      const step = r.pick([1, 2, 5, 10]), down = r.chance(0.3);
      const start = down ? r.int(6 * step, Math.min(100, 6 * step + 30)) : r.int(0, Math.min(60, 100 - 6 * step));
      const seq = range(0, 5).map((i) => start + (down ? -1 : 1) * step * i);
      if (k === 1) {
        const shown = seq.slice(0, 5), v = seq[5];
        return {
          q: T(`找規律，下一個數是多少？　${shown.join('、')}、□`, `Find the pattern. What number comes next?　${shown.join(', ')}, □`), ans: ansNum(v),
          sol: [T(`看看相鄰兩個數差多少：${shown[0]} → ${shown[1]} ${down ? '少了' : '多了'} ${step}。`, `See how much each number changes: ${shown[0]} → ${shown[1]} is ${down ? 'down' : 'up'} ${step}.`),
            T(`每一次都${down ? '減' : '加'} ${step}。`, `Every time it goes ${down ? 'down' : 'up'} by ${step}.`),
            T(`${shown[4]} ${down ? '−' : '+'} ${step} = ${v}。`, `${shown[4]} ${down ? '−' : '+'} ${step} = ${v}.`)],
        };
      }
      const hole = r.int(1, 4), v = seq[hole], disp = seq.map((x, i) => (i === hole ? '□' : x));
      return {
        q: T(`□ 裡的數是多少？　${disp.join('、')}`, `What number goes in the box?　${disp.join(', ')}`), ans: ansNum(v),
        sol: [T(`看沒有空格的兩個數：${seq[hole === 1 ? 3 : 0]} → ${seq[hole === 1 ? 4 : 1]}，每次${down ? '少' : '多'} ${step}。`, `Look at two neighbors without a box: ${seq[hole === 1 ? 3 : 0]} → ${seq[hole === 1 ? 4 : 1]}. Each step is ${down ? 'down' : 'up'} ${step}.`),
          T(`□ 前面的數是 ${seq[hole - 1]}，${seq[hole - 1]} ${down ? '−' : '+'} ${step} = ${v}。`, `The number before the box is ${seq[hole - 1]}: ${seq[hole - 1]} ${down ? '−' : '+'} ${step} = ${v}.`),
          T(`檢查：${v} ${down ? '−' : '+'} ${step} = ${seq[hole + 1]}，和後面的數一樣 ✔`, `Check: ${v} ${down ? '−' : '+'} ${step} = ${seq[hole + 1]}, the next number ✔`)],
      };
    },
  },
  {
    id: 'g1-coins-tw',
    grade: 1,
    name: T('認識錢幣（1、5、10、50 元）', 'Taiwan coins (1, 5, 10, 50 dollars)'),
    cur: { tw: '一年級 認識錢幣' },
    gen(r) {
      const k = r.int(0, 2);
      if (k === 0 || k === 2) {
        let c50, c10, c5, c1;
        do { c50 = r.int(0, 1); c10 = r.int(0, 4); c5 = r.int(0, 1); c1 = r.int(0, 4); } while ([c50, c10, c5, c1].filter((x) => x).length < 2 || c50 * 50 + c10 * 10 + c5 * 5 + c1 > 100);
        const vals = [...Array(c50).fill(50), ...Array(c10).fill(10), ...Array(c5).fill(5), ...Array(c1).fill(1)], tot = sum(vals);
        let run = 0; const steps = vals.map((v) => (run += v));
        const parts = [[c50, 50], [c10, 10], [c5, 5], [c1, 1]].filter(([c]) => c);
        const desc = T(parts.map(([c, v]) => `${c} 個 ${v} 元`).join('、'), parts.map(([c, v]) => `${c} coin${c > 1 ? 's' : ''} of ${v} dollar${v > 1 ? 's' : ''}`).join(', '));
        return {
          q: k === 0 ? T('圖中的錢幣一共是幾元？', 'How much money is shown? (Taiwan coins, in dollars)')
            : T(`小美的撲滿裡有 ${desc.zh}。一共是幾元？`, `Mia's piggy bank has ${desc.en} (Taiwan coins). How many dollars in all?`),
          fig: k === 0 ? coinFig(vals, 'tw') : '', ans: ansNum(tot),
          sol: [
            T('從面額大的錢幣開始數，比較快。', 'Start counting with the biggest coins; it is faster.'),
            T(`一個一個加上去：${steps.join('、')}。`, `Add them one at a time: ${steps.join(', ')}.`),
            T(`一共是 ${tot} 元。`, `That is ${tot} dollars in all.`),
          ],
        };
      }
      const ex = r.pick([[50, 10, r.int(1, 2)], [50, 5, 1], [10, 5, r.int(1, 4)], [10, 1, r.int(1, 3)], [5, 1, r.int(1, 4)]]);
      const [big, small, cnt] = ex, n = (big * cnt) / small;
      return {
        q: T(`${cnt} 個 ${big} 元可以換成幾個 ${small} 元？`, `${cnt} coin${cnt > 1 ? 's' : ''} of ${big} dollars can be traded for how many coins of ${small} dollar${small > 1 ? 's' : ''}?`),
        fig: coinFig(Array(cnt).fill(big), 'tw'), ans: ansNum(n),
        sol: [
          T(`${cnt} 個 ${big} 元一共是 ${big * cnt} 元。`, `${cnt} × ${big} dollars is ${big * cnt} dollars.`),
          T(`用 ${small} 元一個一個數到 ${big * cnt}：${range(1, n).map((i) => i * small).slice(0, 12).join('、')}${n > 12 ? '…' : ''}。`, `Count by ${small}s up to ${big * cnt}: ${range(1, n).map((i) => i * small).slice(0, 12).join(', ')}${n > 12 ? '…' : ''}.`),
          T(`數了 ${n} 次，所以可以換 ${n} 個 ${small} 元。`, `That is ${n} counts, so ${n} coins of ${small}.`),
        ],
      };
    },
  },
  {
    id: 'g1-ordinal',
    grade: 1,
    name: T('第幾個（序數）', 'Ordinal numbers (first, second, …)'),
    cur: { tw: '一年級 第幾個', aops: 'Beast Academy 1' },
    gen(r) {
      const AN = ['🐶', '🐱', '🐰', '🐻', '🐼', '🐸', '🐷', '🐵', '🦊', '🐯'], k = r.int(0, 3), [A] = r.sample(NAMES, 1);
      const ord = (n) => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');
      if (k <= 1) {
        const n = r.int(5, 8), line = r.sample(AN, n), pos = r.int(2, n), fromRight = r.chance(0.35);
        const idx = fromRight ? n - pos : pos - 1, who = line[idx];
        if (k === 0) return {
          q: T(`${fromRight ? '從右邊' : '從左邊'}數過來，${who} 排第幾個？`, `Counting from the ${fromRight ? 'right' : 'left'}, what position is ${who} in? (Type the number.)`),
          fig: row(line), ans: ansNum(pos),
          sol: [T(`從${fromRight ? '右' : '左'}邊開始，一個一個數：第 1、第 2、第 3…`, `Start at the ${fromRight ? 'right' : 'left'} end and count: 1st, 2nd, 3rd, …`),
            T(`數到 ${who} 時是第 ${pos} 個。`, `When we reach ${who}, we are at number ${pos}.`),
            T(`答案：第 ${pos} 個。`, `Answer: ${ord(pos)} (type ${pos}).`)],
        };
        const opts = uniq([who, line[fromRight ? idx + 1 : idx - 1] ?? line[0], line[n - 1 - idx], ...line]).slice(0, 4);
        return {
          q: T(`${fromRight ? '從右邊' : '從左邊'}數過來，第 ${pos} 個是誰？`, `Counting from the ${fromRight ? 'right' : 'left'}, who is ${ord(pos)}?`),
          fig: row(line), ans: ansChoice(opts),
          sol: [T(`從${fromRight ? '右' : '左'}邊開始數，數到第 ${pos} 個。`, `Start from the ${fromRight ? 'right' : 'left'} and count to ${pos}.`),
            T(`第 ${pos} 個是 ${who}。`, `The ${ord(pos)} one is ${who}.`),
            T('小心！從左邊數和從右邊數，答案常常不一樣。', 'Careful: counting from the left and from the right usually give different answers.')],
        };
      }
      if (k === 2) {
        const n = r.int(6, 15), pos = r.int(2, n - 1), back = n - pos + 1;
        return {
          q: T(`${n} 個小朋友排成一排。${A[0]}從前面數是第 ${pos} 個，從後面數是第幾個？`, `${n} children stand in a line. ${A[1]} is ${ord(pos)} from the front. What position is ${A[1]} from the back?`),
          fig: row(range(1, n).map((i) => (i === pos ? '🧒' : '🙂'))), ans: ansNum(back),
          sol: [T(`${A[0]}前面有 ${pos - 1} 個人，所以${A[0]}後面有 ${n} − ${pos} = ${n - pos} 個人。`, `There are ${pos - 1} children in front of ${A[1]}, so there are ${n} − ${pos} = ${n - pos} behind.`),
            T(`從後面數，先數後面的 ${n - pos} 個人，再數到${A[0]}自己：${n - pos} + 1 = ${back}。`, `From the back, count the ${n - pos} children behind, then ${A[1]}: ${n - pos} + 1 = ${back}.`),
            T(`答案：第 ${back} 個。`, `Answer: ${ord(back)} from the back (type ${back}).`)],
        };
      }
      const a = r.int(1, 8), b = r.int(1, 8), n = a + b + 1;
      return {
        q: T(`小朋友排隊買冰淇淋。${A[0]}前面有 ${a} 個人，後面有 ${b} 個人。這一排一共有幾個人？`, `Kids are in line for ice cream. There ${a === 1 ? 'is 1 person' : `are ${a} people`} in front of ${A[1]} and ${b} behind. How many people are in the line?`),
        fig: row([...Array(a).fill('🙂'), '🧒', ...Array(b).fill('🙂')]), ans: ansNum(n),
        sol: [T(`前面 ${a} 人，後面 ${b} 人，別忘了${A[0]}自己也在隊伍裡！`, `${a} in front and ${b} behind — and don't forget ${A[1]} is in the line too!`),
          T(`${a} + ${b} + 1 = ${n}。`, `${a} + ${b} + 1 = ${n}.`),
          T(`一共有 ${n} 個人。`, `There are ${n} people in the line.`)],
      };
    },
  },
  {
    id: 'g1-length-compare',
    grade: 1,
    name: T('比較長短', 'Comparing lengths'),
    cur: { us: 'CCSS 1.MD.A.1', tw: '一年級 長度的比較', aops: 'Beast Academy 1' },
    gen(r) {
      const k = r.int(0, 3), [A] = r.sample(NAMES, 1);
      const LB = ['🔴', '🔵', '🟢', '🟡'];
      if (k === 0) {
        const n = r.int(3, 4), lens = r.sample(range(2, 10), n), labels = LB.slice(0, n), long = r.chance(0.5);
        const best = lens.indexOf(long ? Math.max(...lens) : Math.min(...lens));
        return {
          q: T(`哪一條${long ? '最長' : '最短'}？`, `Which bar is the ${long ? 'longest' : 'shortest'}?`), fig: rods(lens, labels, false),
          ans: ansChoice([labels[best], ...labels.filter((_, i) => i !== best)]),
          sol: [T('每一條都從同一條線開始，所以只要看右邊的尾巴到哪裡。', 'All the bars start at the same line, so just look at where each one ends on the right.'),
            T(`${labels[best]} 那一條${long ? '伸得最遠' : '最早結束'}。`, `The ${labels[best]} bar ${long ? 'reaches the farthest' : 'ends first'}.`),
            T(`所以 ${labels[best]} ${long ? '最長' : '最短'}。`, `So ${labels[best]} is the ${long ? 'longest' : 'shortest'}.`)],
        };
      }
      if (k === 1) {
        const L = r.int(3, 12);
        return {
          q: T('一小格是 1 個單位。這條彩帶有幾格長？', 'Each small box is 1 unit. How many units long is the ribbon?'), fig: rods([L], ['🎀']), ans: ansNum(L),
          sol: [T('從彩帶的開頭開始，一格一格數，不要漏掉也不要重複。', 'Start at the beginning of the ribbon and count the boxes one by one, without skipping or counting twice.'),
            T(`${range(1, L).join('、')}。`, `${range(1, L).join(', ')}.`),
            T(`彩帶有 ${L} 格長。`, `The ribbon is ${L} units long.`)],
        };
      }
      if (k === 2) {
        const a = r.int(5, 15), b = r.int(2, a - 1);
        const items = r.pick([[['鉛筆', 'pencil', '✏️'], ['蠟筆', 'crayon', '🖍️']], [['尺', 'ruler', '📏'], ['橡皮擦', 'eraser', '🧽']], [['書', 'book', '📕'], ['卡片', 'card', '🃏']]]);
        return {
          q: T(`用迴紋針量長度：${items[0][0]}有 ${a} 個迴紋針長，${items[1][0]}有 ${b} 個迴紋針長。${items[0][0]}比${items[1][0]}長幾個迴紋針？`, `Measured with paper clips, the ${items[0][1]} is ${a} clips long and the ${items[1][1]} is ${b} clips long. How many clips longer is the ${items[0][1]}?`),
          fig: rods([a, b], [items[0][2], items[1][2]]), ans: ansNum(a - b),
          sol: [T(`比較長多少，用減法：${a} − ${b}。`, `To find how much longer, subtract: ${a} − ${b}.`), ...subSteps(a, b), T(`${items[0][0]}比${items[1][0]}長 ${a - b} 個迴紋針。`, `The ${items[0][1]} is ${a - b} clips longer.`)],
        };
      }
      const C = [['紅色緞帶', 'red ribbon'], ['藍色緞帶', 'blue ribbon'], ['綠色緞帶', 'green ribbon']];
      const [x, y, z] = r.shuffle(C), askShort = r.chance(0.5);
      return {
        q: T(`${x[0]}比${y[0]}長，${y[0]}比${z[0]}長。哪一條${askShort ? '最短' : '最長'}？`, `The ${x[1]} is longer than the ${y[1]}. The ${y[1]} is longer than the ${z[1]}. Which one is the ${askShort ? 'shortest' : 'longest'}?`),
        ans: ansChoice([askShort ? T(z[0], z[1]) : T(x[0], x[1]), T(y[0], y[1]), askShort ? T(x[0], x[1]) : T(z[0], z[1])]),
        sol: [T(`由長到短排一排：${x[0]}比${y[0]}長，所以${x[0]}排在${y[0]}前面。`, `Line them up from longest to shortest: the ${x[1]} is longer than the ${y[1]}, so it goes first.`),
          T(`${y[0]}又比${z[0]}長，所以順序是：${x[0]} → ${y[0]} → ${z[0]}。`, `The ${y[1]} is longer than the ${z[1]}, so the order is: ${x[1]} → ${y[1]} → ${z[1]}.`),
          T(`${askShort ? `最短的是${z[0]}` : `最長的是${x[0]}`}。`, `The ${askShort ? `shortest is the ${z[1]}` : `longest is the ${x[1]}`}.`)],
      };
    },
  },
];

// =====================================================================================================
// GRADE 2
// =====================================================================================================
const ITEMS = [['鉛筆', 'pencil'], ['筆記本', 'notebook'], ['故事書', 'storybook'], ['玩具車', 'toy car'], ['水壺', 'water bottle'], ['足球', 'soccer ball'], ['拼圖', 'puzzle'], ['帽子', 'hat'], ['書包', 'backpack'], ['彩色筆', 'set of markers']];
const ODD = T('奇數', 'odd'), EVEN = T('偶數', 'even');
// unit-fraction-style names for halves, thirds, fourths
const fname = (n, d) => T(`${ZHN[d]}分之${ZHN[n]}`, n === 1 ? `one ${d === 2 ? 'half' : d === 3 ? 'third' : 'fourth'}` : `${ENN[n]} ${d === 2 ? 'halves' : d === 3 ? 'thirds' : 'fourths'}`);
const LOSHU = [[2, 7, 6], [9, 5, 1], [4, 3, 8]];

const G2 = [
  {
    id: 'g2-add-100',
    grade: 2,
    name: T('100 以內的進位加法', 'Adding within 100 (with regrouping)'),
    cur: { us: 'CCSS 2.NBT.B.5', tw: '二年級 二位數的加法', aops: 'Beast Academy 2' },
    gen(r) {
      const regroup = r.chance(0.75); let a, b;
      do { a = r.int(12, 88); b = r.int(11, 87); } while (a + b > 99 || (regroup && (a % 10) + (b % 10) < 10) || (!regroup && (a % 10) + (b % 10) >= 10));
      const s = a + b, [A] = r.sample(NAMES, 1), k = r.int(0, 3);
      const q = k === 0 ? T(`計算：${a} + ${b} = ?`, `Find ${a} + ${b}.`)
        : k === 1 ? T(`${A[0]}昨天看了 ${a} 頁書，今天看了 ${b} 頁。兩天一共看了幾頁？`, `${A[1]} read ${a} pages yesterday and ${b} pages today. How many pages in all?`)
          : k === 2 ? T(`遊戲第一關得了 ${a} 分，第二關得了 ${b} 分。一共得了幾分？`, `In a game, ${A[1]} scored ${a} points in round 1 and ${b} points in round 2. How many points in all?`)
            : T(`比 ${a} 多 ${b} 的數是多少？`, `What number is ${b} more than ${a}?`);
      const tb = Math.floor(b / 10) * 10, ob = b % 10;
      return {
        q, ans: ansNum(s),
        sol: [
          T(`把 ${a} 和 ${b} 直式對齊（個位對個位、十位對十位），從個位開始加。`, `Line up ${a} and ${b} (ones under ones, tens under tens) and start with the ones.`),
          ...colAddSteps(a, b),
          T(`另一種想法：先加整十 ${a} + ${tb} = ${a + tb}，再加 ${ob}：${a + tb} + ${ob} = ${s}。`, `Another way: add the tens first, ${a} + ${tb} = ${a + tb}, then the ones: ${a + tb} + ${ob} = ${s}.`),
          T(`答案是 ${s}。`, `The answer is ${s}.`),
        ],
        hint: T('個位加起來滿 10，要進 1 到十位。', 'If the ones add up to 10 or more, carry 1 ten.'),
      };
    },
  },
  {
    id: 'g2-sub-100',
    grade: 2,
    name: T('100 以內的退位減法', 'Subtracting within 100 (with regrouping)'),
    cur: { us: 'CCSS 2.NBT.B.5', tw: '二年級 二位數的減法', aops: 'Beast Academy 2' },
    gen(r) {
      const regroup = r.chance(0.75); let a, b;
      do { a = r.int(30, 99); b = r.chance(0.2) ? r.int(3, 9) : r.int(11, a - 5); } while ((regroup && a % 10 >= b % 10) || (!regroup && a % 10 < b % 10));
      const d = a - b, [A, B] = r.sample(NAMES, 2), k = r.int(0, 3);
      const q = k === 0 ? T(`計算：${a} − ${b} = ?`, `Find ${a} − ${b}.`)
        : k === 1 ? T(`${A[0]}有 ${a} 張卡片，送給${B[0]} ${b} 張。${A[0]}還剩幾張？`, `${A[1]} has ${a} cards and gives ${b} to ${B[1]}. How many cards are left?`)
          : k === 2 ? T(`${A[0]}跳繩跳了 ${a} 下，${B[0]}跳了 ${b} 下。${A[0]}比${B[0]}多跳幾下？`, `${A[1]} jumped rope ${a} times and ${B[1]} jumped ${b} times. How many more jumps did ${A[1]} do?`)
            : T(`${b} 加上多少會等於 ${a}？`, `${b} plus what number equals ${a}?`);
      return {
        q, ans: ansNum(d),
        sol: [
          k === 3 ? T(`${b} + □ = ${a}，可以用減法求 □：${a} − ${b}。`, `${b} + □ = ${a}, so find □ by subtracting: ${a} − ${b}.`) : T(`列式：${a} − ${b}。直式對齊，從個位開始減。`, `Write ${a} − ${b}. Line up the digits and start with the ones.`),
          ...colSubSteps(a, b),
          T(`所以 ${a} − ${b} = ${d}。`, `So ${a} − ${b} = ${d}.`),
          T(`驗算：${d} + ${b} = ${a} ✔`, `Check: ${d} + ${b} = ${a} ✔`),
        ],
        hint: T('個位不夠減，就向十位借 1 個十。', 'If the ones are too small, borrow 1 ten.'),
      };
    },
  },
  {
    id: 'g2-add-sub-1000',
    grade: 2,
    name: T('1000 以內的加減', 'Adding and subtracting within 1000'),
    cur: { us: 'CCSS 2.NBT.B.7', tw: '二年級 三位數的加減', aops: 'Beast Academy 2' },
    gen(r) {
      const k = r.int(0, 3), add = k === 0 || k === 2, [A] = r.sample(NAMES, 1);
      let a, b;
      if (add) { do { a = r.int(105, 880); b = r.int(102, 870); } while (a + b > 999); }
      else { a = r.chance(0.3) ? r.int(2, 9) * 100 + r.pick([0, r.int(1, 9)]) : r.int(250, 999); b = r.int(101, a - 20); }
      const v = add ? a + b : a - b, op = add ? '+' : '−';
      const q = k <= 1 ? T(`計算：${a} ${op} ${b} = ?`, `Find ${a} ${op} ${b}.`)
        : add ? T(`圖書館有 ${a} 本故事書和 ${b} 本科學書。一共有幾本書？`, `A library has ${a} storybooks and ${b} science books. How many books in all?`)
          : T(`${A[0]}的目標是走 ${a} 步，已經走了 ${b} 步。還要再走幾步？`, `${A[1]} wants to walk ${a} steps and has walked ${b}. How many more steps are needed?`);
      return {
        q, ans: ansNum(v),
        sol: [
          T(`直式對齊百位、十位、個位，從個位開始${add ? '加' : '減'}。`, `Line up hundreds, tens and ones, and ${add ? 'add' : 'subtract'} starting from the ones.`),
          ...(add ? colAddSteps(a, b) : colSubSteps(a, b)),
          T(`答案是 ${v}。${add ? `估算檢查：大約 ${Math.round(a / 100) * 100} + ${Math.round(b / 100) * 100} = ${Math.round(a / 100) * 100 + Math.round(b / 100) * 100}，很接近 ✔` : `驗算：${v} + ${b} = ${a} ✔`}`,
            `The answer is ${v}. ${add ? `Estimate to check: about ${Math.round(a / 100) * 100} + ${Math.round(b / 100) * 100} = ${Math.round(a / 100) * 100 + Math.round(b / 100) * 100}, close ✔` : `Check: ${v} + ${b} = ${a} ✔`}`),
        ],
      };
    },
  },
  {
    id: 'g2-place-value-3',
    grade: 2,
    name: T('百位、十位、個位', 'Hundreds, tens and ones'),
    cur: { us: 'CCSS 2.NBT.A.1', tw: '二年級 1000 以內的數（位值）', aops: 'Beast Academy 2' },
    gen(r) {
      const k = r.int(0, 4);
      if (k === 0) {
        const h = r.int(1, 9), t = r.pick([0, r.int(1, 9), r.int(1, 9)]), o = r.pick([0, r.int(1, 9), r.int(1, 9)]), n = 100 * h + 10 * t + o;
        return {
          q: T(`${h} 個百、${t} 個十和 ${o} 個一合起來是多少？`, `${HN(h)}, ${TN(t)} and ${ON(o)} make what number?`), ans: ansNum(n),
          sol: [T(`百位寫 ${h}，十位寫 ${t}，個位寫 ${o}。`, `Write ${h} in the hundreds place, ${t} in the tens place, ${o} in the ones place.`),
            (t === 0 || o === 0) ? T('沒有的位要寫 0 佔位子，不能空著！', 'If a place has none, write 0 to hold the place — don\'t leave it empty!') : T(`${100 * h} + ${10 * t} + ${o}。`, `${100 * h} + ${10 * t} + ${o}.`),
            T(`答案是 ${n}。`, `The answer is ${n}.`)],
        };
      }
      if (k === 1) {
        const [h, t, o] = r.sample(range(1, 9), 3), n = 100 * h + 10 * t + o, i = r.int(0, 2), d = [o, t, h][i], v = d * 10 ** i;
        return {
          q: T(`${n} 裡的數字 ${d} 代表多少？`, `In ${n}, what is the value of the digit ${d}?`), ans: ansNum(v),
          sol: [T(`${n}：百位是 ${h}，十位是 ${t}，個位是 ${o}。`, `${n}: hundreds digit ${h}, tens digit ${t}, ones digit ${o}.`),
            T(`${d} 在${PL[i][0]}，代表 ${d} 個${['一', '十', '百'][i]}。`, `${d} is in the ${PL[i][1]} place, so it means ${[ON, TN, HN][i](d)}.`),
            T(`${d} 個${['一', '十', '百'][i]} = ${v}。`, `${[ON, TN, HN][i](d)} = ${v}.`)],
        };
      }
      if (k === 2) {
        const h = r.int(1, 9), t = r.int(1, 9), o = r.int(1, 9), n = 100 * h + 10 * t + o, parts = r.shuffle([100 * h, 10 * t, o]);
        return {
          q: T(`${parts.join(' + ')} = ?`, `${parts.join(' + ')} = ?`), ans: ansNum(n),
          sol: [T('先把每個數放到它的位置：', 'Put each number in its place:'),
            T(`${100 * h} 是 ${h} 個百，${10 * t} 是 ${t} 個十，${o} 是 ${o} 個一。`, `${100 * h} is ${HN(h)}, ${10 * t} is ${TN(t)}, ${o} is ${ON(o)}.`),
            T(`順序不重要，合起來是 ${n}。`, `The order doesn't matter: together they make ${n}.`)],
        };
      }
      if (k === 3) {
        const n = r.int(110, 990), H = Math.floor(n / 100), t = Math.floor(n / 10) % 10, all = Math.floor(n / 10);
        return {
          q: T(`${n} 裡面一共有幾個十？（把百也換成十來算）`, `How many tens are in ${n} altogether? (Count the hundreds as tens too.)`), ans: ansNum(all),
          sol: [T(`1 個百 = 10 個十。`, `1 hundred = 10 tens.`),
            T(`${n} 有 ${H} 個百，就是 ${H} × 10 = ${H * 10} 個十。`, `${n} has ${HN(H)}, which is ${TN(H * 10)}.`),
            T(`再加上十位的 ${t} 個十：${H * 10} + ${t} = ${all} 個十（個位的 ${n % 10} 不夠一個十）。`, `Add the ${TN(t)} in the tens place: ${H * 10} + ${t} = ${TN(all)} (the ${ON(n % 10)} are not a full ten).`)],
        };
      }
      const n = r.int(120, 880), d = r.pick([10, 100]), more = r.chance(0.5), v = more ? n + d : n - d;
      return {
        q: T(`比 ${n} ${more ? '多' : '少'} ${d} 的數是多少？`, `What number is ${d} ${more ? 'more' : 'less'} than ${n}?`), ans: ansNum(v),
        sol: [T(`${more ? '多' : '少'} ${d} 就是${d === 10 ? '十' : '百'}位${more ? '加' : '減'} 1，其他位通常不變。`, `${d} ${more ? 'more' : 'less'} changes the ${d === 10 ? 'tens' : 'hundreds'} digit by 1.`),
          T(`${n} ${more ? '+' : '−'} ${d} = ${v}。`, `${n} ${more ? '+' : '−'} ${d} = ${v}.`),
          T(`答案是 ${v}。`, `The answer is ${v}.`)],
      };
    },
  },
  {
    id: 'g2-skip-count',
    grade: 2,
    name: T('跳著數（2、5、10、100）', 'Skip counting by 2s, 5s, 10s and 100s'),
    cur: { us: 'CCSS 2.NBT.A.2', tw: '二年級 數的規律（幾個幾個數）', aops: 'Beast Academy 2' },
    gen(r) {
      const step = r.pick([2, 5, 10, 100]), k = r.int(0, 2);
      const start = step === 2 ? r.int(0, 60) : step === 5 ? 5 * r.int(0, 15) : step === 10 ? r.int(0, 50) : 100 * r.int(0, 3) + r.pick([0, 0, 50, 20]);
      if (k === 0) {
        const down = r.chance(0.3), seq = range(0, 5).map((i) => start + step * i); if (down) seq.reverse();
        const hole = r.int(1, 5), v = seq[hole], disp = seq.map((x, i) => (i === hole ? '□' : x));
        return {
          q: T(`□ 裡是多少？　${disp.join('、')}`, `What number goes in the box?　${disp.join(', ')}`), ans: ansNum(v),
          sol: [T(`看前兩個數：${seq[0]} → ${seq[1]}，每次${down ? '少' : '多'} ${step}，這是 ${step} 個 ${step} 個${down ? '往回' : ''}數。`, `Look at the first two: ${seq[0]} → ${seq[1]}. Each step goes ${down ? 'down' : 'up'} by ${step}.`),
            T(`□ 前面是 ${seq[hole - 1]}：${seq[hole - 1]} ${down ? '−' : '+'} ${step} = ${v}。`, `The number before the box is ${seq[hole - 1]}: ${seq[hole - 1]} ${down ? '−' : '+'} ${step} = ${v}.`),
            T(`答案是 ${v}。`, `The answer is ${v}.`)],
        };
      }
      if (k === 1) {
        const n = r.int(3, 6), v = start + step * n, list = range(1, n).map((i) => start + step * i);
        return {
          q: T(`從 ${start} 開始，${step} 個 ${step} 個往上數，數 ${n} 次後是多少？`, `Start at ${start} and count up by ${step}s. What number do you say after ${n} counts?`), ans: ansNum(v),
          sol: [T(`每數一次就加 ${step}。`, `Each count adds ${step}.`),
            T(`${start} → ${list.join(' → ')}。`, `${start} → ${list.join(' → ')}.`),
            T(`數了 ${n} 次，到 ${v}。`, `After ${n} counts we reach ${v}.`)],
        };
      }
      const st = r.pick([2, 5, 10]), n = r.int(4, 10), end = st * n;
      return {
        q: T(`從 0 開始 ${st} 個 ${st} 個數，數到 ${end} 時，一共數了幾次？`, `Counting by ${st}s starting from 0, how many counts does it take to reach ${end}?`), ans: ansNum(n),
        sol: [T(`一邊數一邊用手指記次數：${range(1, n).map((i) => i * st).join('、')}。`, `Count and keep track on your fingers: ${range(1, n).map((i) => i * st).join(', ')}.`),
          T(`一共數了 ${n} 次。`, `That is ${n} counts.`),
          T(`也就是說 ${n} 個 ${st} 是 ${end}。`, `So ${n} groups of ${st} make ${end}.`)],
      };
    },
  },
  {
    id: 'g2-even-odd',
    grade: 2,
    name: T('奇數和偶數', 'Odd and even numbers'),
    cur: { us: 'CCSS 2.OA.C.3', tw: '二年級 奇數與偶數', aops: 'Beast Academy 2' },
    gen(r) {
      const k = r.int(0, 3), rule = T('個位是 0、2、4、6、8 的數是偶數；個位是 1、3、5、7、9 的是奇數。', 'Numbers ending in 0, 2, 4, 6, 8 are even; numbers ending in 1, 3, 5, 7, 9 are odd.');
      if (k === 0) {
        const n = r.int(11, 199), ev = n % 2 === 0;
        return {
          q: T(`${n} 是奇數還是偶數？`, `Is ${n} odd or even?`), ans: ansChoice(ev ? [EVEN, ODD] : [ODD, EVEN]),
          sol: [T('只要看個位就知道。', 'Just look at the ones digit.'), rule, T(`${n} 的個位是 ${n % 10}，所以是${ev ? '偶數' : '奇數'}。`, `The ones digit of ${n} is ${n % 10}, so it is ${ev ? 'even' : 'odd'}.`)],
        };
      }
      if (k === 1) {
        const th = r.pick(THINGS), n = r.int(5, 20), ev = n % 2 === 0;
        return {
          q: T(`兩個兩個配成一對。圖中${th.zh}的數量是奇數還是偶數？`, `Pair them up two by two. Is the number of ${th.en} odd or even?`),
          fig: dots(th.e, n, Math.ceil(n / 2)), ans: ansChoice(ev ? [EVEN, ODD] : [ODD, EVEN]),
          sol: [T(`一共有 ${n} ${th.cw}。`, `There are ${n} ${th.en}.`),
            T(`兩個兩個配對：可以配成 ${Math.floor(n / 2)} 對，${ev ? '沒有剩下' : '剩下 1 個沒有伴'}。`, `Pairing them gives ${Math.floor(n / 2)} pairs with ${ev ? 'none left over' : '1 left over'}.`),
            T(`${ev ? '剛好配完是偶數' : '剩 1 個是奇數'}。`, `${ev ? 'No leftover means even.' : 'One left over means odd.'}`)],
        };
      }
      if (k === 2) {
        const a = r.int(11, 60), b = r.int(11, 39), s = a + b, ev = s % 2 === 0;
        const pa = a % 2 ? '奇' : '偶', pb = b % 2 ? '奇' : '偶';
        return {
          q: T(`${a} + ${b} 的答案是奇數還是偶數？`, `Is the answer to ${a} + ${b} odd or even?`), ans: ansChoice(ev ? [EVEN, ODD] : [ODD, EVEN]),
          sol: [T(`${a} 是${pa}數，${b} 是${pb}數。`, `${a} is ${a % 2 ? 'odd' : 'even'} and ${b} is ${b % 2 ? 'odd' : 'even'}.`),
            T('規則：偶 + 偶 = 偶，奇 + 奇 = 偶，奇 + 偶 = 奇。', 'Rule: even + even = even, odd + odd = even, odd + even = odd.'),
            T(`算算看：${a} + ${b} = ${s}，個位是 ${s % 10}，是${ev ? '偶數' : '奇數'} ✔`, `Check: ${a} + ${b} = ${s}, ending in ${s % 10}, which is ${ev ? 'even' : 'odd'} ✔`)],
        };
      }
      const wantEven = r.chance(0.5), base = r.int(2, 40) * 2 + (wantEven ? 0 : 1);
      const others = uniq(range(0, 6).map(() => r.int(5, 45) * 2 + (wantEven ? 1 : 0))).slice(0, 3);
      return {
        q: T(`下面哪一個是${wantEven ? '偶數' : '奇數'}？`, `Which number is ${wantEven ? 'even' : 'odd'}?`), ans: ansChoice([String(base), ...others.map(String)]),
        sol: [rule, T(`${base} 的個位是 ${base % 10}，是${wantEven ? '偶數' : '奇數'}。`, `${base} ends in ${base % 10}, so it is ${wantEven ? 'even' : 'odd'}.`),
          T(`其他的數個位都是${wantEven ? '奇數（1、3、5、7、9）' : '偶數（0、2、4、6、8）'}。`, `The others all end in ${wantEven ? 'an odd digit' : 'an even digit'}.`)],
      };
    },
  },
  {
    id: 'g2-time-5min',
    grade: 2,
    name: T('看時鐘（幾點幾分）', 'Telling time to 5 minutes'),
    cur: { us: 'CCSS 2.MD.C.7', tw: '二年級 時間（幾點幾分）', aops: 'Beast Academy 2' },
    gen(r) {
      const h = r.int(1, 12), m = 5 * r.int(1, 11), k = r.int(0, 2), nx = h12(h + 1), pv = h12(h - 1), mk = m / 5;
      const read = [
        T(`長針是分針。從 12 開始，每走一個數字是 5 分鐘。`, `The long hand is the minute hand. From 12, each number is 5 more minutes.`),
        T(`分針指著 ${mk}：${range(1, mk).map((i) => i * 5).join('、')}，是 ${m} 分。`, `The minute hand points to ${mk}: ${range(1, mk).map((i) => i * 5).join(', ')}. That is ${m} minutes.`),
        T(`短針（時針）在 ${h} 和 ${nx} 中間${m >= 40 ? `，快到 ${nx} 了但還沒到` : ''}，所以是 ${h} 點。`, `The short hour hand is between ${h} and ${nx}${m >= 40 ? ` — almost at ${nx}, but not yet` : ''}, so the hour is ${h}.`),
        T(`答案：${h} 點 ${m} 分（${h}:${pad2(m)}）。`, `Answer: ${h}:${pad2(m)}.`),
      ];
      if (k === 0) {
        const lab = (hh, mm) => tl(hh, mm, false);
        const opts = uniq([lab(h, m), lab(h, mk), lab(m >= 30 ? nx : pv, m), lab(mk, (h % 12) * 5), lab(h, (m + 30) % 60 || 30), lab(nx, mk)]).slice(0, 4);
        return { q: T('時鐘上是幾點幾分？', 'What time does the clock show?'), fig: clock(h, m), ans: ansChoice(opts), sol: read };
      }
      if (k === 1) {
        const opts = uniq([clock(h, m), clock(m >= 30 ? nx : pv, m), clock(mk, (h % 12) * 5), clock(h, (m + 30) % 60), clock(nx, (m + 15) % 60)]).slice(0, 4);
        return { q: T(`哪一個時鐘是 ${h} 點 ${m} 分？`, `Which clock shows ${h}:${pad2(m)}?`), ans: ansChoice(opts), sol: [read[0], T(`${m} 分：分針要指著 ${mk}。`, `${m} minutes: the minute hand points to ${mk}.`), T(`${h} 點多：時針要在 ${h} 和 ${nx} 中間。`, `A little after ${h}: the hour hand is between ${h} and ${nx}.`), T('找兩根針都對的時鐘。', 'Pick the clock where both hands are right.')] };
      }
      return {
        q: T(`分針指著 ${mk}。是幾分？`, `The minute hand points to ${mk}. How many minutes past the hour is it?`), fig: clock(h, m), ans: ansNum(m),
        sol: [read[0], T(`5 個 5 個數 ${mk} 次：${range(1, mk).map((i) => i * 5).join('、')}。`, `Count by 5s, ${mk} times: ${range(1, mk).map((i) => i * 5).join(', ')}.`), T(`也就是 ${mk} × 5 = ${m}，是 ${m} 分。`, `That is ${mk} × 5 = ${m} minutes.`)],
      };
    },
  },
  {
    id: 'g2-coins-us',
    grade: 2,
    name: T('美國硬幣（分）', 'US coins: pennies, nickels, dimes, quarters'),
    cur: { us: 'CCSS 2.MD.C.8' },
    gen(r) {
      const NM = { 25: ['25 分（quarter）', 'quarter', 'quarters'], 10: ['10 分（dime）', 'dime', 'dimes'], 5: ['5 分（nickel）', 'nickel', 'nickels'], 1: ['1 分（penny）', 'penny', 'pennies'] };
      const k = r.int(0, 2);
      const pick = () => { let c; do c = [r.int(0, 3), r.int(0, 4), r.int(0, 3), r.int(0, 4)]; while (c.filter((x) => x).length < 2 || c[0] * 25 + c[1] * 10 + c[2] * 5 + c[3] > 95); return c; };
      if (k === 0 || k === 2) {
        const c = pick(), vals = [...Array(c[0]).fill(25), ...Array(c[1]).fill(10), ...Array(c[2]).fill(5), ...Array(c[3]).fill(1)], tot = sum(vals);
        let run = 0; const steps = vals.map((v) => (run += v) + '¢');
        const parts = [[c[0], 25], [c[1], 10], [c[2], 5], [c[3], 1]].filter(([x]) => x);
        const desc = T(parts.map(([x, v]) => `${x} 個${NM[v][0]}`).join('、'), parts.map(([x, v]) => `${x} ${x > 1 ? NM[v][2] : NM[v][1]}`).join(', '));
        const sol = [T('從最大的硬幣開始數：quarter 25¢、dime 10¢、nickel 5¢、penny 1¢。', 'Start with the coins worth the most: quarter 25¢, dime 10¢, nickel 5¢, penny 1¢.'),
          T(`一個一個加上去：${steps.join('、')}。`, `Count on coin by coin: ${steps.join(', ')}.`),
          T(`一共是 ${tot}¢。`, `That makes ${tot}¢.`)];
        if (k === 0) return { q: T('圖中的硬幣一共是幾分（¢）？', 'How many cents are shown?'), fig: coinFig(vals, 'us'), ans: ansNum(tot), sol: [...sol, T('小提醒：dime 雖然最小，卻比 penny 和 nickel 值錢！', 'Remember: the dime is the smallest coin but it is worth more than a penny or a nickel!')] };
        const price = r.int(tot + 3, 99);
        return {
          q: T(`Mia 有 ${desc.zh}。她想買一個 ${price}¢ 的玩具，還差幾分？`, `Mia has ${desc.en}. She wants a toy that costs ${price}¢. How many more cents does she need?`), ans: ansNum(price - tot),
          sol: [...sol, T(`還差 ${price} − ${tot} = ${price - tot}¢。`, `She needs ${price} − ${tot} = ${price - tot}¢ more.`)],
        };
      }
      const [big, small] = r.pick([[25, 5], [25, 1], [10, 5], [10, 1], [100, 25], [100, 10], [100, 5], [50, 10], [50, 25]]), n = big / small;
      const bigZ = big === 100 ? '1 美元（100¢）' : big === 50 ? '50¢' : `1 個${NM[big][0]}`, bigE = big === 100 ? 'one dollar (100¢)' : big === 50 ? '50¢' : `one ${NM[big][1]} (${big}¢)`;
      return {
        q: T(`${bigZ}可以換成幾個${NM[small][0]}？`, `How many ${NM[small][2]} make ${bigE}?`), ans: ansNum(n),
        sol: [T(`一個${NM[small][1]}是 ${small}¢。`, `One ${NM[small][1]} is ${small}¢.`),
          T(`${small} 個 ${small} 個數到 ${big}：${range(1, Math.min(n, 12)).map((i) => i * small).join('、')}${n > 12 ? '…' : ''}。`, `Count by ${small}s to ${big}: ${range(1, Math.min(n, 12)).map((i) => i * small).join(', ')}${n > 12 ? '…' : ''}.`),
          T(`一共要 ${n} 個。`, `It takes ${n} of them.`)],
      };
    },
  },
  {
    id: 'g2-money-word',
    grade: 2,
    name: T('錢的應用問題', 'Money word problems'),
    cur: { us: 'CCSS 2.MD.C.8', tw: '二年級 錢幣（1000 元以內）', aops: 'Beast Academy 2' },
    gen(r) {
      const [x, y] = r.sample(ITEMS, 2), [A] = r.sample(NAMES, 1), k = r.int(0, 2);
      if (k === 0) {
        let p1, p2; do { p1 = r.int(15, 480); p2 = r.int(12, 450); } while (p1 + p2 > 999);
        const s = p1 + p2;
        return {
          q: T(`一個${x[0]} ${p1} 元，一個${y[0]} ${p2} 元。兩樣都買，一共要付幾元？`, `A ${x[1]} costs $${p1} and a ${y[1]} costs $${p2}. How much for both?`), ans: ansNum(s),
          sol: [T(`「一共」用加法：${p1} + ${p2}。`, `"Both together" means add: ${p1} + ${p2}.`), ...colAddSteps(p1, p2), T(`一共要付 ${s} 元。`, `Together they cost $${s}.`)],
        };
      }
      if (k === 1) {
        const pay = r.pick([100, 500, 1000]), p = pay === 100 ? r.int(12, 95) : pay === 500 ? r.int(105, 480) : r.int(210, 980), c = pay - p;
        return {
          q: T(`${A[0]}買一個 ${p} 元的${x[0]}，付了 ${pay} 元。應該找回幾元？`, `${A[1]} buys a ${x[1]} for $${p} and pays with $${pay}. How much change should ${A[1]} get?`), ans: ansNum(c),
          sol: [T(`找回的錢 = 付的錢 − 價錢：${pay} − ${p}。`, `Change = money paid − price: ${pay} − ${p}.`), ...colSubSteps(pay, p), T(`找回 ${c} 元。驗算：${p} + ${c} = ${pay} ✔`, `The change is $${c}. Check: ${p} + ${c} = ${pay} ✔`)],
        };
      }
      const p = r.int(120, 950), m = r.int(50, p - 10), d = p - m;
      return {
        q: T(`${A[0]}存了 ${m} 元，想買一個 ${p} 元的${x[0]}。還差幾元？`, `${A[1]} has saved $${m} and wants a ${x[1]} that costs $${p}. How much more money is needed?`), ans: ansNum(d),
        sol: [T(`「還差」就是價錢比存的錢多多少，用減法：${p} − ${m}。`, `"How much more" is the difference between the price and the savings: ${p} − ${m}.`), ...colSubSteps(p, m), T(`還差 ${d} 元。`, `${A[1]} needs $${d} more.`)],
      };
    },
  },
  {
    id: 'g2-length-units',
    grade: 2,
    name: T('長度：公分和公尺', 'Length: centimeters and meters'),
    cur: { us: 'CCSS 2.MD.A.1', tw: '二年級 長度（公分、公尺）', aops: 'Beast Academy 2' },
    gen(r) {
      const k = r.int(0, 4);
      if (k === 0) {
        const L = r.int(3, 11), n = Math.min(12, L + r.int(1, 2));
        return {
          q: T('這條紙條長幾公分？', 'How many centimeters long is the strip?'), fig: rulerFig(n, 0, L, 'cm'), ans: ansNum(L),
          sol: [T('紙條的左端對準尺上的 0。', 'The left end of the strip lines up with 0 on the ruler.'), T(`右端對準 ${L}。`, `The right end lines up with ${L}.`), T(`所以紙條長 ${L} 公分。`, `So the strip is ${L} cm long.`)],
        };
      }
      if (k === 1) {
        const a = r.int(1, 4), L = r.int(3, 7), b = a + L, n = Math.min(12, b + 1);
        return {
          q: T('這條紙條長幾公分？（小心看開頭！）', 'How many centimeters long is the strip? (Look carefully at where it starts!)'), fig: rulerFig(n, a, b, 'cm'), ans: ansNum(L),
          sol: [T(`紙條不是從 0 開始，是從 ${a} 開始，到 ${b} 結束。`, `The strip does not start at 0. It starts at ${a} and ends at ${b}.`),
            T(`數一數中間有幾個 1 公分：${range(a + 1, b).join('、')}，有 ${L} 個。`, `Count the 1-cm spaces: ${range(a + 1, b).join(', ')} — that is ${L}.`),
            T(`也可以算 ${b} − ${a} = ${L}。紙條長 ${L} 公分（不是 ${b} 公分）。`, `Or compute ${b} − ${a} = ${L}. The strip is ${L} cm long (not ${b} cm).`)],
        };
      }
      if (k === 2) {
        const m = r.int(1, 5), c = r.pick([r.int(1, 9), r.int(10, 99), r.int(10, 99)]), v = 100 * m + c;
        return {
          q: T(`${m} 公尺 ${c} 公分 = 幾公分？`, `${m} m ${c} cm = how many centimeters?`), ans: ansNum(v),
          sol: [T('1 公尺 = 100 公分。', '1 meter = 100 centimeters.'), T(`${m} 公尺 = ${100 * m} 公分。`, `${m} m = ${100 * m} cm.`),
            T(`${100 * m} + ${c} = ${v}${c < 10 ? `（注意：${c} 公分要寫在個位，十位補 0）` : ''}。`, `${100 * m} + ${c} = ${v}${c < 10 ? ` (careful: ${c} cm goes in the ones place, with 0 in the tens)` : ''}.`),
            T(`答案是 ${v} 公分。`, `The answer is ${v} cm.`)],
        };
      }
      if (k === 3) {
        const v = r.int(105, 590), m = Math.floor(v / 100), c = v % 100;
        return {
          q: T(`${v} 公分 = ${m} 公尺 □ 公分，□ 是多少？`, `${v} cm = ${m} m and □ cm. What is □?`), ans: ansNum(c),
          sol: [T('100 公分 = 1 公尺。', '100 cm = 1 m.'), T(`${v} 公分裡有 ${m} 個 100 公分，就是 ${m} 公尺，用掉 ${100 * m} 公分。`, `${v} cm has ${HN(m)}, which is ${m} m, using ${100 * m} cm.`), T(`剩下 ${v} − ${100 * m} = ${c} 公分。`, `What is left: ${v} − ${100 * m} = ${c} cm.`)],
        };
      }
      if (r.chance(0.5)) {
        const c = r.int(15, 95);
        return {
          q: T(`1 公尺比 ${c} 公分長幾公分？`, `How many centimeters longer is 1 meter than ${c} cm?`), ans: ansNum(100 - c),
          sol: [T('先把 1 公尺換成 100 公分，單位一樣才能比。', 'First change 1 m into 100 cm — the units must match to compare.'), T(`100 − ${c} = ${100 - c}。`, `100 − ${c} = ${100 - c}.`), T(`長 ${100 - c} 公分。`, `It is ${100 - c} cm longer.`)],
        };
      }
      const a = r.int(15, 60), b = r.int(15, 39);
      return {
        q: T(`紅緞帶長 ${a} 公分，藍緞帶長 ${b} 公分。接在一起（不重疊）一共長幾公分？`, `A red ribbon is ${a} cm long and a blue ribbon is ${b} cm long. Put end to end, how long are they together?`), ans: ansNum(a + b),
        sol: [T(`接在一起就是把長度加起來：${a} + ${b}。`, `End to end means add the lengths: ${a} + ${b}.`), ...colAddSteps(a, b), T(`一共長 ${a + b} 公分。`, `Together they are ${a + b} cm long.`)],
      };
    },
  },
  {
    id: 'g2-inches-feet',
    grade: 2,
    name: T('英制長度：英寸、英尺、碼', 'Length: inches, feet and yards'),
    cur: { us: 'CCSS 2.MD.A.1' },
    gen(r) {
      const k = r.int(0, 4);
      if (k === 0) {
        const a = r.chance(0.6) ? 0 : r.int(1, 3), L = r.int(2, 7), n = Math.min(12, a + L + r.int(0, 2));
        return {
          q: T('這條紙條長幾英寸（in）？', 'How many inches long is the strip?'), fig: rulerFig(n, a, a + L, 'in'), ans: ansNum(L),
          sol: [T(`紙條從 ${a} 開始，到 ${a + L} 結束。`, `The strip starts at ${a} and ends at ${a + L}.`),
            a ? T(`不是從 0 開始，所以要算 ${a + L} − ${a} = ${L}。`, `It does not start at 0, so subtract: ${a + L} − ${a} = ${L}.`) : T('從 0 開始，右端的數字就是長度。', 'It starts at 0, so the number at the right end is the length.'),
            T(`紙條長 ${L} 英寸。`, `The strip is ${L} inches long.`)],
        };
      }
      if (k === 1) {
        const f = r.int(2, 6), v = 12 * f;
        return {
          q: T(`${f} 英尺 = 幾英寸？（1 英尺 = 12 英寸）`, `${f} feet = how many inches? (1 foot = 12 inches)`), ans: ansNum(v),
          sol: [T('1 英尺有 12 英寸。', '1 foot is 12 inches.'), T(`${f} 英尺就是 ${f} 個 12：${Array(f).fill(12).join(' + ')}。`, `${f} feet is ${f} twelves: ${Array(f).fill(12).join(' + ')}.`), T(`= ${v} 英寸。`, `= ${v} inches.`)],
        };
      }
      if (k === 2) {
        const f = r.int(1, 4), i = r.int(1, 11), v = 12 * f + i;
        return {
          q: T(`${f} 英尺 ${i} 英寸 = 幾英寸？`, `${f} ft ${i} in = how many inches?`), ans: ansNum(v),
          sol: [T('1 英尺 = 12 英寸。', '1 foot = 12 inches.'), T(`${f} 英尺 = ${12 * f} 英寸。`, `${f} ft = ${12 * f} in.`), T(`${12 * f} + ${i} = ${v} 英寸。`, `${12 * f} + ${i} = ${v} inches.`)],
        };
      }
      if (k === 3) {
        const y = r.int(2, 9), v = 3 * y;
        return {
          q: T(`${y} 碼 = 幾英尺？（1 碼 = 3 英尺）`, `${y} yards = how many feet? (1 yard = 3 feet)`), ans: ansNum(v),
          sol: [T('1 碼有 3 英尺。', '1 yard is 3 feet.'), T(`${y} 碼就是 ${y} 個 3：${range(1, y).map((j) => 3 * j).join('、')}。`, `${y} yards is ${y} threes: ${range(1, y).map((j) => 3 * j).join(', ')}.`), T(`= ${v} 英尺。`, `= ${v} feet.`)],
        };
      }
      const f = r.int(2, 3), i = r.int(10, 12 * f - 2);
      return {
        q: T(`一條繩子長 ${f} 英尺，另一條長 ${i} 英寸。第一條比第二條長幾英寸？`, `One rope is ${f} feet long and another is ${i} inches long. How many inches longer is the first rope?`), ans: ansNum(12 * f - i),
        sol: [T('單位不一樣，先都換成英寸。', 'The units are different, so change everything to inches first.'), T(`${f} 英尺 = ${12 * f} 英寸。`, `${f} feet = ${12 * f} inches.`), T(`${12 * f} − ${i} = ${12 * f - i}，長 ${12 * f - i} 英寸。`, `${12 * f} − ${i} = ${12 * f - i}, so it is ${12 * f - i} inches longer.`)],
      };
    },
  },
  {
    id: 'g2-mult-intro',
    grade: 2,
    name: T('認識乘法（幾個一數、陣列）', 'Intro to multiplication: equal groups and arrays'),
    cur: { us: 'CCSS 2.OA.C.4', tw: '二年級 乘法的意義', aops: 'Beast Academy 2' },
    gen(r) {
      const th = r.pick(THINGS), k = r.int(0, 3), G = r.int(2, 5), S = r.int(2, 6), tot = G * S;
      const rep = Array(G).fill(S).join(' + ');
      const msol = (gz, ge) => [
        T(`每${gz} ${S} 個，有 ${G} ${gz}，就是 ${G} 個 ${S}。`, `There are ${G} ${ge} of ${S}.`),
        T(`連加：${rep} = ${tot}。`, `Repeated addition: ${rep} = ${tot}.`),
        T(`寫成乘法：${S} × ${G} = ${tot}（${S} 的 ${G} 倍）。`, `As multiplication: ${G} × ${S} = ${tot} (${G} groups of ${S}).`),
        T(`一共有 ${tot} ${th.cw}。`, `There are ${tot} in all.`),
      ];
      if (k === 0) return { q: T(`${th.zh}排成整齊的陣列。一共有幾${th.cw}？`, `The ${th.en} are in an array. How many are there?`), fig: dots(th.e, tot, S), ans: ansNum(tot), sol: [T(`數一數：有 ${G} 排，每排 ${S} ${th.cw}。`, `Count: ${G} rows with ${S} in each row.`), ...msol('排', 'rows').slice(1)] };
      if (k === 1) return { q: T(`有 ${G} 盤${th.zh}，每盤 ${S} ${th.cw}。一共有幾${th.cw}？`, `There are ${G} plates with ${S} ${th.en} on each. How many in all?`), fig: dots(th.e, Array(G).fill(S)), ans: ansNum(tot), sol: msol('盤', 'plates') };
      if (k === 2) {
        const askCount = r.chance(0.4);
        return {
          q: askCount ? T(`${rep} 是幾個 ${S} 相加？`, `${rep} is how many ${S}s added together?`) : T(`${rep} = ?`, `${rep} = ?`),
          ans: ansNum(askCount ? G : tot),
          sol: [T(`數一數有幾個 ${S}：一共 ${G} 個。`, `Count the ${S}s: there are ${G} of them.`),
            T(`${G} 個 ${S} 可以寫成乘法：${S} × ${G}。`, `${G} groups of ${S} can be written ${G} × ${S}.`),
            T(`${S} 個 ${S} 個數：${range(1, G).map((i) => i * S).join('、')}，所以是 ${tot}。`, `Skip count by ${S}: ${range(1, G).map((i) => i * S).join(', ')}, so the total is ${tot}.`),
            T(`答案是 ${askCount ? G : tot}。`, `The answer is ${askCount ? G : tot}.`)],
        };
      }
      const [zh, en, each, ez, ee] = r.pick([['雞', 'chickens', 2, '隻腳', 'legs'], ['小狗', 'dogs', 4, '隻腳', 'legs'], ['三輪車', 'tricycles', 3, '個輪子', 'wheels'], ['汽車', 'cars', 4, '個輪子', 'wheels'], ['手', 'hands', 5, '根手指', 'fingers'], ['瓢蟲', 'ladybugs', 6, '隻腳', 'legs']]);
      const n = r.int(2, 6), v = n * each;
      return {
        q: T(`每${zh === '手' ? '隻' : zh === '三輪車' || zh === '汽車' ? '輛' : '隻'}${zh}有 ${each} ${ez}。${n} ${zh === '三輪車' || zh === '汽車' ? '輛' : '隻'}${zh}一共有幾${ez}？`, `Each of the ${en} has ${each} ${ee}. How many ${ee} do ${n} ${en} have?`),
        ans: ansNum(v),
        sol: [T(`${n} 個 ${each}：${Array(n).fill(each).join(' + ')}。`, `${n} groups of ${each}: ${Array(n).fill(each).join(' + ')}.`),
          T(`${each} 個 ${each} 個數：${range(1, n).map((i) => i * each).join('、')}。`, `Skip count by ${each}: ${range(1, n).map((i) => i * each).join(', ')}.`),
          T(`寫成乘法：${each} × ${n} = ${v}。一共 ${v} ${ez}。`, `As multiplication: ${n} × ${each} = ${v}. There are ${v} ${ee}.`)],
      };
    },
  },
  {
    id: 'g2-two-step',
    grade: 2,
    name: T('兩步驟加減應用問題', 'Two-step word problems'),
    cur: { us: 'CCSS 2.OA.A.1', tw: '二年級 加減應用問題', aops: 'Beast Academy 2' },
    gen(r) {
      const [A, B, C] = r.sample(NAMES, 3), k = r.int(0, 3);
      if (k === 0) {
        const a = r.int(20, 45), b = r.int(5, a - 5), c = r.int(5, 30), v = a - b + c;
        return {
          q: T(`公車上有 ${a} 人。到站時下車 ${b} 人，又上車 ${c} 人。現在車上有幾人？`, `A bus has ${a} people. At a stop, ${b} get off and ${c} get on. How many people are on the bus now?`), ans: ansNum(v),
          sol: [T('分兩步來算：先下車，再上車。', 'Do it in two steps: first people get off, then people get on.'),
            T(`第一步：下車用減法，${a} − ${b} = ${a - b}。`, `Step 1: getting off means subtract, ${a} − ${b} = ${a - b}.`),
            T(`第二步：上車用加法，${a - b} + ${c} = ${v}。`, `Step 2: getting on means add, ${a - b} + ${c} = ${v}.`),
            T(`一起寫：${a} − ${b} + ${c} = ${v}。車上有 ${v} 人。`, `All together: ${a} − ${b} + ${c} = ${v}. There are ${v} people.`)],
        };
      }
      if (k === 1) {
        const a = r.int(12, 40), b = r.int(3, 15), bb = a + b, v = a + bb;
        return {
          q: T(`${A[0]}有 ${a} 顆彈珠，${B[0]}比${A[0]}多 ${b} 顆。兩人一共有幾顆彈珠？`, `${A[1]} has ${a} marbles. ${B[1]} has ${b} more than ${A[1]}. How many marbles do they have together?`), ans: ansNum(v),
          sol: [T(`先算${B[0]}有幾顆：「多 ${b} 顆」用加法，${a} + ${b} = ${bb}。`, `First find ${B[1]}'s marbles: "${b} more" means add, ${a} + ${b} = ${bb}.`),
            T(`再算兩人一共：${a} + ${bb} = ${v}。`, `Then add both: ${a} + ${bb} = ${v}.`),
            T(`小心！答案不是 ${a} + ${b} = ${bb}，那只是${B[0]}的彈珠。`, `Careful! The answer is not ${a} + ${b} = ${bb} — that is only ${B[1]}'s marbles.`),
            T(`兩人一共有 ${v} 顆。`, `Together they have ${v} marbles.`)],
        };
      }
      if (k === 2) {
        const a = r.int(30, 90), b = r.int(5, 25), c = r.int(5, a - b - 3), v = a - b - c;
        return {
          q: T(`${A[0]}有 ${a} 張貼紙，送給${B[0]} ${b} 張，又送給${C[0]} ${c} 張。${A[0]}還剩幾張？`, `${A[1]} has ${a} stickers. ${A[1]} gives ${b} to ${B[1]} and ${c} to ${C[1]}. How many stickers are left?`), ans: ansNum(v),
          sol: [T(`第一步：送給${B[0]}後，${a} − ${b} = ${a - b}。`, `Step 1: after giving to ${B[1]}, ${a} − ${b} = ${a - b}.`),
            T(`第二步：再送給${C[0]}，${a - b} − ${c} = ${v}。`, `Step 2: after giving to ${C[1]}, ${a - b} − ${c} = ${v}.`),
            T(`也可以先把送出去的加起來：${b} + ${c} = ${b + c}，${a} − ${b + c} = ${v}。`, `Or add what was given away first: ${b} + ${c} = ${b + c}, then ${a} − ${b + c} = ${v}.`),
            T(`還剩 ${v} 張。`, `${v} stickers are left.`)],
        };
      }
      const m = r.int(40, 99), x = r.int(10, m - 10), y = r.int(10, 50), v = m - x + y;
      return {
        q: T(`${A[0]}有 ${m} 元，買零食花了 ${x} 元，後來奶奶又給${A[0]} ${y} 元。${A[0]}現在有幾元？`, `${A[1]} has $${m}, spends $${x} on snacks, and then Grandma gives ${A[1]} $${y}. How much money does ${A[1]} have now?`), ans: ansNum(v),
        sol: [T(`第一步：花掉用減法，${m} − ${x} = ${m - x}。`, `Step 1: spending means subtract, ${m} − ${x} = ${m - x}.`),
          T(`第二步：得到用加法，${m - x} + ${y} = ${v}。`, `Step 2: getting money means add, ${m - x} + ${y} = ${v}.`),
          T(`${A[0]}現在有 ${v} 元。`, `${A[1]} has $${v} now.`)],
      };
    },
  },
  {
    id: 'g2-bar-chart',
    grade: 2,
    name: T('看長條圖', 'Reading bar graphs'),
    cur: { us: 'CCSS 2.MD.D.10', tw: '二年級 分類與統計', aops: 'Beast Academy 2' },
    gen(r) {
      const SETS = [
        { t: T('班上同學最喜歡的水果（每格代表 1 人）', 'Favorite fruits in a class (each line is 1 student)'), c: [['🍎', '蘋果', 'apple'], ['🍌', '香蕉', 'banana'], ['🍇', '葡萄', 'grapes'], ['🍓', '草莓', 'strawberry'], ['🍊', '橘子', 'orange']], u: ['人', 'students'] },
        { t: T('同學家裡養的寵物（每格代表 1 隻）', 'Pets owned by the class (each line is 1 pet)'), c: [['🐶', '狗', 'dogs'], ['🐱', '貓', 'cats'], ['🐰', '兔子', 'rabbits'], ['🐟', '魚', 'fish'], ['🐦', '鳥', 'birds']], u: ['隻', 'pets'] },
        { t: T('同學最喜歡的運動（每格代表 1 人）', 'Favorite sports (each line is 1 student)'), c: [['⚽', '足球', 'soccer'], ['🏀', '籃球', 'basketball'], ['⚾', '棒球', 'baseball'], ['🏊', '游泳', 'swimming'], ['🎾', '網球', 'tennis']], u: ['人', 'students'] },
      ];
      const S = r.pick(SETS), cats = r.sample(S.c, 4), vals = r.sample(range(1, 10), 4), k = r.int(0, 3);
      const fig = bars(cats.map((c, i) => ({ label: c[0], v: vals[i] })), 10);
      const lab = (i) => T(`${cats[i][0]} ${cats[i][1]}`, `${cats[i][0]} ${cats[i][2]}`);
      const read = T(`從長條頂端往左看到數字：${cats.map((c, i) => `${c[0]} ${vals[i]}`).join('，')}。`, `Read across from the top of each bar: ${cats.map((c, i) => `${c[0]} ${vals[i]}`).join(', ')}.`);
      if (k === 0) {
        const most = r.chance(0.5), v = most ? Math.max(...vals) : Math.min(...vals), i = vals.indexOf(v);
        return {
          q: T(`${S.t.zh}<br>哪一種${most ? '最多' : '最少'}？`, `${S.t.en}<br>Which has the ${most ? 'most' : 'fewest'}?`), fig,
          ans: ansChoice([lab(i), ...[0, 1, 2, 3].filter((j) => j !== i).map(lab)]),
          sol: [T(`找${most ? '最高' : '最矮'}的長條。`, `Find the ${most ? 'tallest' : 'shortest'} bar.`), read, T(`${cats[i][0]} 的長條${most ? '最高' : '最矮'}，是 ${v}。`, `The ${cats[i][0]} bar is the ${most ? 'tallest' : 'shortest'}, at ${v}.`)],
        };
      }
      if (k === 1) {
        const [i, j] = r.sample([0, 1, 2, 3], 2), [bi, sj] = vals[i] > vals[j] ? [i, j] : [j, i], d = vals[bi] - vals[sj];
        return {
          q: T(`${S.t.zh}<br>${cats[bi][0]} 比 ${cats[sj][0]} 多幾${S.u[0]}？`, `${S.t.en}<br>How many more for ${cats[bi][0]} than for ${cats[sj][0]}?`), fig, ans: ansNum(d),
          sol: [T(`${cats[bi][0]} 是 ${vals[bi]}，${cats[sj][0]} 是 ${vals[sj]}。`, `${cats[bi][0]} is ${vals[bi]} and ${cats[sj][0]} is ${vals[sj]}.`), T(`多幾個用減法：${vals[bi]} − ${vals[sj]} = ${d}。`, `"How many more" means subtract: ${vals[bi]} − ${vals[sj]} = ${d}.`), T(`多 ${d} ${S.u[0]}。`, `${d} more.`)],
        };
      }
      if (k === 2) {
        const tot = sum(vals);
        return {
          q: T(`${S.t.zh}<br>一共有幾${S.u[0]}？`, `${S.t.en}<br>How many ${S.u[1]} in all?`), fig, ans: ansNum(tot),
          sol: [read, T(`全部加起來：${vals.join(' + ')} = ${tot}。`, `Add them all: ${vals.join(' + ')} = ${tot}.`), T(`一共 ${tot} ${S.u[0]}。`, `${tot} in all.`)],
        };
      }
      const i = r.int(0, 3);
      return {
        q: T(`${S.t.zh}<br>${cats[i][0]} 有幾${S.u[0]}？`, `${S.t.en}<br>How many for ${cats[i][0]}?`), fig, ans: ansNum(vals[i]),
        sol: [T(`找到 ${cats[i][0]} 的長條。`, `Find the ${cats[i][0]} bar.`), T(`從長條的頂端往左邊的數字看，對到 ${vals[i]}。`, `Look across from the top of the bar to the numbers on the left: ${vals[i]}.`), T(`答案是 ${vals[i]}。`, `The answer is ${vals[i]}.`)],
      };
    },
  },
  {
    id: 'g2-fraction-shapes',
    grade: 2,
    name: T('二分之一、三分之一、四分之一', 'Halves, thirds and fourths'),
    cur: { us: 'CCSS 2.G.A.3', tw: '二年級 簡單分數', aops: 'Beast Academy 2' },
    gen(r) {
      const d = r.int(2, 4), n = r.int(1, d - 1), k = r.int(0, 3), circ = r.chance(0.5);
      const pic = (nn, dd) => (circ ? pie(nn, dd) : fracBar(nn, dd, 200));
      const wrongPairs = () => {
        const seen = new Set([n / d]), o = [];
        for (const [p, q] of [[d - n, d], [n, d - n], [n, d + 1], [n + 1, d], [1, d + 2]]) if (p > 0 && q > 1 && p < q && !seen.has(p / q)) { seen.add(p / q); o.push([p, q]); }
        return o.slice(0, 3);
      };
      const why = [
        T(`整個圖形被平分成 ${d} 份（每份一樣大），這是分母 ${d}。`, `The whole is cut into ${d} equal parts — that's the bottom number, ${d}.`),
        T(`塗色的有 ${n} 份，這是分子 ${n}。`, `${n} part${n > 1 ? 's are' : ' is'} shaded — that's the top number, ${n}.`),
        T(`所以塗色部分是 ${frac(n, d)}，讀作「${fname(n, d).zh}」。`, `So the shaded part is ${frac(n, d)}, "${fname(n, d).en}".`),
      ];
      if (k === 0) return { q: T('塗色的部分是全部的幾分之幾？', 'What fraction of the shape is shaded?'), fig: pic(n, d), ans: ansChoice([frac(n, d), ...wrongPairs().map(([p, q]) => frac(p, q))]), sol: why };
      if (k === 1) {
        const pool = [[1, 2], [1, 3], [2, 3], [1, 4], [2, 4], [3, 4]].filter(([p, q]) => p / q !== n / d && !(p === d - n && q === d));
        const opts = uniq([fname(n, d), ...(d - n !== n ? [fname(d - n, d)] : []), ...r.shuffle(pool).map(([p, q]) => fname(p, q))]).slice(0, 4);
        const [A] = r.sample(NAMES, 1);
        return {
          q: T(`一個披薩平分成 ${d} 片，${A[0]}吃了 ${n} 片。${A[0]}吃了這個披薩的多少？`, `A pizza is cut into ${d} equal slices. ${A[1]} eats ${n}. How much of the pizza did ${A[1]} eat?`),
          fig: pie(n, d), ans: ansChoice(opts),
          sol: [T(`平分成 ${d} 片，每一片是${fname(1, d).zh}。`, `${d} equal slices: each slice is ${fname(1, d).en}.`), T(`吃了 ${n} 片，就是 ${n} 個${fname(1, d).zh}。`, `${n} slice${n > 1 ? 's' : ''} is ${n} of those.`), T(`答案：${fname(n, d).zh}（${frac(n, d)}）。`, `Answer: ${fname(n, d).en} (${frac(n, d)}).`)],
        };
      }
      if (k === 2) {
        const opts = [fname(1, d), ...[2, 3, 4].filter((q) => q !== d).map((q) => fname(1, q)), T(`${ZHN[d]}分之${ZHN[d]}`, `${ENN[d]} ${d === 2 ? 'halves' : d === 3 ? 'thirds' : 'fourths'}`)];
        return {
          q: T(`一個長方形平分成 ${d} 份，其中一份是整個的多少？`, `A rectangle is cut into ${d} equal parts. One part is how much of the whole?`),
          fig: fracBar(1, d, 200), ans: ansChoice(opts.slice(0, 4)),
          sol: [T(`平分成 ${d} 份，表示每一份一樣大。`, `Cut into ${d} equal parts means every part is the same size.`), T(`1 份就是 ${frac(1, d)}。`, `One part is ${frac(1, d)}.`), T(`讀作「${fname(1, d).zh}」。`, `We say "${fname(1, d).en}".`)],
        };
      }
      const opts = uniq([pie(n, d), ...wrongPairs().map(([p, q]) => pie(p, q))]);
      return {
        q: T(`哪一個圖的塗色部分是 ${frac(n, d)}？`, `Which picture shows ${frac(n, d)} shaded?`), ans: ansChoice(opts),
        sol: [T(`${frac(n, d)} 表示：平分成 ${d} 份，塗 ${n} 份。`, `${frac(n, d)} means: cut into ${d} equal parts and shade ${n}.`), T(`先找切成 ${d} 片的圓，再看是不是剛好塗了 ${n} 片。`, `Find the circle cut into ${d} slices, then check that exactly ${n} ${n > 1 ? 'are' : 'is'} shaded.`), T('小心：塗色的份數和沒塗的份數不要弄反。', 'Careful not to mix up the shaded and unshaded parts.')],
      };
    },
  },
  {
    id: 'g2-ba-puzzles',
    grade: 2,
    name: T('數學謎題（魔方陣、圖形算式、猜數字）', 'Puzzles: magic squares, shape sums, mystery numbers'),
    cur: { aops: 'Beast Academy 2' },
    gen(r) {
      const k = r.int(0, 3);
      if (k === 0) {
        let g = LOSHU.map((rw) => rw.slice());
        for (let t = r.int(0, 3); t > 0; t--) g = g[0].map((_, j) => g.map((rw) => rw[j]).reverse());
        if (r.chance(0.5)) g = g.map((rw) => rw.slice().reverse());
        const off = r.int(0, 10), S = 15 + 3 * off; g = g.map((rw) => rw.map((v) => v + off));
        const i = r.int(0, 2), j = r.int(0, 2), v = g[i][j], others = g[i].filter((_, jj) => jj !== j);
        const col = [0, 1, 2].filter((ii) => ii !== i).map((ii) => g[ii][j]);
        return {
          q: T(`這是一個魔方陣：每一橫行、每一直行、兩條斜線上的三個數加起來都是 ${S}。? 是多少？`, `This is a magic square: every row, every column and both diagonals add up to ${S}. What number is ?`),
          fig: table(g.map((rw, ii) => rw.map((x, jj) => (ii === i && jj === j ? '?' : String(x))))), ans: ansNum(v),
          sol: [T(`找一條有 ? 的橫行：第 ${i + 1} 橫行還有 ${others[0]} 和 ${others[1]}。`, `Pick the row with the ?: row ${i + 1} also has ${others[0]} and ${others[1]}.`),
            T(`${others[0]} + ${others[1]} = ${others[0] + others[1]}。`, `${others[0]} + ${others[1]} = ${others[0] + others[1]}.`),
            T(`要加到 ${S}，還差 ${S} − ${others[0] + others[1]} = ${v}。`, `To reach ${S}, we need ${S} − ${others[0] + others[1]} = ${v}.`),
            T(`檢查直行：${col[0]} + ${col[1]} + ${v} = ${col[0] + col[1] + v} ✔`, `Check the column: ${col[0]} + ${col[1]} + ${v} = ${col[0] + col[1] + v} ✔`)],
        };
      }
      if (k === 1) {
        const a = r.int(2, 12), b = r.int(1, 12), [P, Q] = r.sample(['🔺', '🟦', '⭐', '🟢', '❤️'], 2), askB = r.chance(0.7);
        return {
          q: T(`每個圖形代表一個數，一樣的圖形代表一樣的數。<br>${P} + ${P} = ${2 * a}<br>${P} + ${Q} = ${a + b}<br>${askB ? Q : P} 是多少？`, `Each shape stands for a number; the same shapes are the same number.<br>${P} + ${P} = ${2 * a}<br>${P} + ${Q} = ${a + b}<br>What is ${askB ? Q : P}?`),
          ans: ansNum(askB ? b : a),
          sol: [T(`兩個 ${P} 一樣大，合起來是 ${2 * a}，所以一個 ${P} 是 ${2 * a} 的一半：${a}。`, `Two ${P} are equal and make ${2 * a}, so one ${P} is half of ${2 * a}: ${a}.`),
            T(`檢查：${a} + ${a} = ${2 * a} ✔`, `Check: ${a} + ${a} = ${2 * a} ✔`),
            askB ? T(`${a} + ${Q} = ${a + b}，所以 ${Q} = ${a + b} − ${a} = ${b}。`, `${a} + ${Q} = ${a + b}, so ${Q} = ${a + b} − ${a} = ${b}.`) : T(`所以 ${P} = ${a}。`, `So ${P} = ${a}.`)],
        };
      }
      if (k === 2) {
        let t, o; do { t = r.int(1, 9); o = r.int(0, 9); } while (t === o);
        const s = t + o, d = Math.abs(t - o), tensBig = t > o, n = 10 * t + o;
        const cands = range(1, 9).filter((x) => s - x >= 0 && s - x <= 9).map((x) => 10 * x + (s - x));
        return {
          q: T(`猜猜我是誰：我是一個二位數。我的十位數字和個位數字加起來是 ${s}，${tensBig ? '十位' : '個位'}數字比${tensBig ? '個位' : '十位'}數字大 ${d}。我是多少？`, `Who am I? I am a two-digit number. My two digits add up to ${s}, and my ${tensBig ? 'tens' : 'ones'} digit is ${d} more than my ${tensBig ? 'ones' : 'tens'} digit. What number am I?`),
          ans: ansNum(n),
          sol: [T(`先列出兩個數字加起來是 ${s} 的二位數：${cands.join('、')}。`, `List the two-digit numbers whose digits add to ${s}: ${cands.join(', ')}.`),
            T(`再找${tensBig ? '十位' : '個位'}比${tensBig ? '個位' : '十位'}大 ${d} 的：${n}（${tensBig ? `${t} − ${o}` : `${o} − ${t}`} = ${d}）。`, `Now find the one whose ${tensBig ? 'tens' : 'ones'} digit is ${d} more: ${n} (${tensBig ? `${t} − ${o}` : `${o} − ${t}`} = ${d}).`),
            T(`我是 ${n}。`, `I am ${n}.`)],
        };
      }
      const x = r.int(3, 30), D = r.int(2, 20), S = 2 * x + D, big = r.chance(0.6);
      return {
        q: T(`兩個數加起來是 ${S}，大的數比小的數多 ${D}。${big ? '大' : '小'}的數是多少？`, `Two numbers add up to ${S}. The bigger one is ${D} more than the smaller one. What is the ${big ? 'bigger' : 'smaller'} number?`),
        ans: ansNum(big ? x + D : x),
        sol: [T(`先把多出來的 ${D} 拿走：${S} − ${D} = ${2 * x}。`, `Take away the extra ${D} first: ${S} − ${D} = ${2 * x}.`),
          T(`現在兩個數一樣大，平分：${2 * x} 的一半是 ${x}，這是小的數。`, `Now the two numbers are equal, so split in half: half of ${2 * x} is ${x}. That's the smaller number.`),
          T(`大的數 = ${x} + ${D} = ${x + D}。`, `The bigger number is ${x} + ${D} = ${x + D}.`),
          T(`檢查：${x} + ${x + D} = ${S} ✔`, `Check: ${x} + ${x + D} = ${S} ✔`)],
      };
    },
  },
  {
    id: 'g2-number-line',
    grade: 2,
    name: T('數線上的跳躍', 'Jumps on a number line'),
    cur: { us: 'CCSS 2.MD.B.6', tw: '二年級 數線', aops: 'Beast Academy 2' },
    gen(r) {
      const k = r.int(0, 2);
      if (k === 0) {
        const j = r.pick([2, 3, 4, 5, 10]), n = r.int(2, 4), back = r.chance(0.35);
        const lo = j === 10 ? 10 * r.int(0, 3) : j * r.int(0, 4), hi = lo + j * (n + 2);
        const s = back ? hi - j : lo + j, v = back ? s - j * n : s + j * n;
        const list = range(1, n).map((i) => s + (back ? -1 : 1) * j * i);
        return {
          q: T(`青蛙 🐸 站在 ${s}，${back ? '往左' : '往右'}跳 ${n} 次，每次跳 ${j}。牠會停在哪個數？`, `The frog 🐸 is at ${s}. It jumps ${n} times to the ${back ? 'left' : 'right'}, ${j} each jump. Where does it land?`),
          fig: numberLine(lo, hi, [{ v: s, label: '🐸' }], j), ans: ansNum(v),
          sol: [T(`往${back ? '左跳數字變小，用減法' : '右跳數字變大，用加法'}。`, `Jumping ${back ? 'left makes numbers smaller (subtract)' : 'right makes numbers bigger (add)'}.`),
            T(`一次一次跳：${s} → ${list.join(' → ')}。`, `Jump by jump: ${s} → ${list.join(' → ')}.`),
            T(`也可以算：${n} 次 ${j} 是 ${n * j}，${s} ${back ? '−' : '+'} ${n * j} = ${v}。`, `Or: ${n} jumps of ${j} is ${n * j}, and ${s} ${back ? '−' : '+'} ${n * j} = ${v}.`)],
        };
      }
      if (k === 1) {
        const big = r.chance(0.5), v = big ? 10 * r.int(0, 9) + 5 : 2 * r.int(0, 9) + 1, lo = big ? 10 * Math.floor(v / 10) : v - 1;
        return {
          q: T(`數線上的點 P 代表多少？`, `What number does point P show?`),
          fig: big ? numberLine(0, 100, [{ v, label: 'P', hi: true }], 10) : numberLine(0, 20, [{ v, label: 'P', hi: true }], 2), ans: ansNum(v),
          sol: [T(`每一格是 ${big ? 10 : 2}。`, `Each space is ${big ? 10 : 2}.`),
            T(`P 在 ${lo} 和 ${lo + (big ? 10 : 2)} 的正中間。`, `P is exactly halfway between ${lo} and ${lo + (big ? 10 : 2)}.`),
            T(`${big ? 10 : 2} 的一半是 ${big ? 5 : 1}，${lo} + ${big ? 5 : 1} = ${v}。`, `Half of ${big ? 10 : 2} is ${big ? 5 : 1}, and ${lo} + ${big ? 5 : 1} = ${v}.`)],
        };
      }
      const step = r.pick([5, 10]), lo = step * r.int(0, 4), hi = lo + step * 8, a = lo + step * r.int(0, 3), b = a + step * r.int(2, 8 - (a - lo) / step);
      return {
        q: T(`🐸 從 ${a} 跳到 🏁 ${b}，一共跳了多遠？`, `🐸 jumps from ${a} to the flag 🏁 at ${b}. How far did it jump?`),
        fig: numberLine(lo, hi, [{ v: a, label: '🐸' }, { v: b, label: '🏁' }], step), ans: ansNum(b - a),
        sol: [T(`距離是大的數減小的數：${b} − ${a}。`, `The distance is the bigger number minus the smaller: ${b} − ${a}.`),
          T(`也可以數格子：每格 ${step}，有 ${(b - a) / step} 格，${(b - a) / step} 個 ${step} 是 ${b - a}。`, `Or count spaces: each is ${step}, and there are ${(b - a) / step} spaces, so ${(b - a) / step} × ${step} = ${b - a}.`),
          T(`跳了 ${b - a}。`, `It jumped ${b - a}.`)],
      };
    },
  },
  {
    id: 'g2-compare-3digit',
    grade: 2,
    name: T('比較三位數的大小', 'Comparing 3-digit numbers'),
    cur: { us: 'CCSS 2.NBT.A.4', tw: '二年級 1000 以內數的大小比較', aops: 'Beast Academy 2' },
    gen(r) {
      const k = r.int(0, 2);
      const dg = (n) => [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10];
      if (k === 0) {
        const a = r.int(100, 999); let b;
        const mode = r.int(0, 3);
        if (mode === 0) b = a; else if (mode === 1) b = Math.floor(a / 100) * 100 + r.int(0, 99); else if (mode === 2) { const [h, t, o] = dg(a); b = o ? 100 * o + 10 * t + h : r.int(100, 999); } else b = r.int(100, 999);
        if (mode === 0 && r.chance(0.6)) b = a + r.pick([-1, 1, 10, -10]);
        b = Math.max(100, Math.min(999, b));
        const [A, B] = [dg(a), dg(b)], right = a > b ? '&gt;' : a < b ? '&lt;' : '=';
        const p = A[0] !== B[0] ? 0 : A[1] !== B[1] ? 1 : 2;
        return {
          q: T(`在 ○ 裡填入 &gt;、&lt; 或 =：　${a} ○ ${b}`, `Fill in &gt;, &lt; or =:　${a} ○ ${b}`), ans: ansChoice([right, ...['&gt;', '&lt;', '='].filter((x) => x !== right)]),
          sol: [T('從最高的位（百位）開始比，一樣再往下一位比。', 'Compare from the biggest place (hundreds). If equal, move to the next place.'),
            a === b ? T(`每一位都一樣，所以 ${a} = ${b}。`, `Every digit is the same, so ${a} = ${b}.`)
              : T(`${p > 0 ? `${['百位', '十位'].slice(0, p).join('、')}一樣；` : ''}${PL[2 - p][0]}：${A[p]} 和 ${B[p]}，${Math.max(A[p], B[p])} 比較大。`, `${p > 0 ? `The ${['hundreds', 'tens'].slice(0, p).join(' and ')} are the same; ${PL[2 - p][1]}` : cap(PL[2 - p][1])}: ${A[p]} vs ${B[p]}, and ${Math.max(A[p], B[p])} is bigger.`),
            T(`所以 ${a} ${right} ${b}。`, `So ${a} ${right} ${b}.`)],
        };
      }
      if (k === 1) {
        const ds = r.sample(range(1, 9), 3), perms = r.shuffle([[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]).slice(0, 4).map((p) => 100 * ds[p[0]] + 10 * ds[p[1]] + ds[p[2]]);
        const big = r.chance(0.5), best = big ? Math.max(...perms) : Math.min(...perms), sorted = perms.slice().sort((x, y) => x - y);
        return {
          q: T(`${perms.join('、')}　哪一個最${big ? '大' : '小'}？`, `${perms.join(', ')}　Which is the ${big ? 'greatest' : 'least'}?`), ans: ansChoice([String(best), ...perms.filter((x) => x !== best).map(String)]),
          sol: [T('這些數用的數字都一樣，要看每個數字放在哪一位。', 'These numbers use the same digits, so look at which place each digit is in.'),
            T('先比百位，百位一樣再比十位。', 'Compare the hundreds first; if they tie, compare the tens.'),
            T(`由小到大：${sorted.join(' &lt; ')}。`, `From least to greatest: ${sorted.join(' &lt; ')}.`),
            T(`最${big ? '大' : '小'}的是 ${best}。`, `The ${big ? 'greatest' : 'least'} is ${best}.`)],
        };
      }
      const ds = r.chance(0.4) ? [0, ...r.sample(range(1, 9), 2)] : r.sample(range(1, 9), 3), big = r.chance(0.5);
      const desc = ds.slice().sort((x, y) => y - x), asc = ds.slice().sort((x, y) => x - y);
      let small = asc.slice(); if (small[0] === 0) small = [small[1], 0, small[2]];
      const v = big ? +desc.join('') : +small.join(''), shown = r.shuffle(ds).join('、'), shownE = shown.replace(/、/g, ', ');
      return {
        q: T(`用 ${shown} 這三張數字卡，每張用一次，排成最${big ? '大' : '小'}的三位數。這個數是多少？`, `Use the digit cards ${shownE} once each to make the ${big ? 'greatest' : 'least'} 3-digit number. What is it?`),
        ans: ansNum(v),
        sol: big ? [T('要最大，就把最大的數字放在百位（最值錢的位置）。', 'To make it greatest, put the biggest digit in the hundreds place — it is worth the most.'), T(`由大到小排：${desc.join('、')}。`, `Order from biggest to smallest: ${desc.join(', ')}.`), T(`最大的三位數是 ${v}。`, `The greatest is ${v}.`)]
          : [T('要最小，就把最小的數字放在百位。', 'To make it least, put the smallest digit in the hundreds place.'), ds.includes(0) ? T('但是 0 不能放在百位（那就不是三位數了），所以百位放最小的非 0 數字，0 放十位。', 'But 0 can\'t go in the hundreds place (then it wouldn\'t be a 3-digit number), so use the smallest non-zero digit there and put 0 in the tens.') : T(`由小到大排：${asc.join('、')}。`, `Order from smallest to biggest: ${asc.join(', ')}.`), T(`最小的三位數是 ${v}。`, `The least is ${v}.`)],
      };
    },
  },
];

// =====================================================================================================
// GRADE 3
// =====================================================================================================
// a kid-friendly strategy for one multiplication fact
function factSteps(a, b) {
  const p = a * b, [x, y] = [a, b].includes(9) ? (b === 9 ? [a, b] : [b, a]) : [a, b].includes(5) ? (b === 5 ? [a, b] : [b, a]) : [a, b].includes(2) ? (b === 2 ? [a, b] : [b, a]) : [a, b].includes(4) ? (b === 4 ? [a, b] : [b, a]) : [a, b];
  if (y === 9) return [T(`× 9 的小技巧：先算 × 10，再減掉一個 ${x}。`, `Trick for × 9: multiply by 10, then take away one ${x}.`), T(`${x} × 10 = ${x * 10}，${x * 10} − ${x} = ${p}。`, `${x} × 10 = ${x * 10}, and ${x * 10} − ${x} = ${p}.`)];
  if (y === 5) return [T(`× 5 是 × 10 的一半。`, `× 5 is half of × 10.`), T(`${x} × 10 = ${x * 10}，一半是 ${p}。`, `${x} × 10 = ${x * 10}, and half of that is ${p}.`)];
  if (y === 2) return [T(`× 2 就是加倍。`, `× 2 means double.`), T(`${x} + ${x} = ${p}。`, `${x} + ${x} = ${p}.`)];
  if (y === 4) return [T(`× 4 就是「加倍再加倍」。`, `× 4 means double, then double again.`), T(`${x} × 2 = ${2 * x}，${2 * x} × 2 = ${p}。`, `${x} × 2 = ${2 * x}, and ${2 * x} × 2 = ${p}.`)];
  if (y > 5) return [T(`把 ${y} 拆成 5 和 ${y - 5}：${x} × ${y} = ${x} × 5 + ${x} × ${y - 5}。`, `Break ${y} into 5 and ${y - 5}: ${x} × ${y} = ${x} × 5 + ${x} × ${y - 5}.`), T(`${x * 5} + ${x * (y - 5)} = ${p}。`, `${x * 5} + ${x * (y - 5)} = ${p}.`)];
  return [T(`用知道的算式往上加：${x} × ${y - 1} = ${x * (y - 1)}，再多一個 ${x}。`, `Build from a fact you know: ${x} × ${y - 1} = ${x * (y - 1)}, plus one more ${x}.`), T(`${x * (y - 1)} + ${x} = ${p}。`, `${x * (y - 1)} + ${x} = ${p}.`)];
}
const multiples = (d, upto) => range(1, upto).map((i) => d * i);

const G3 = [
  {
    id: 'g3-mult-facts',
    grade: 3,
    name: T('九九乘法', 'Multiplication facts'),
    cur: { us: 'CCSS 3.OA.C.7', tw: '二年級 九九乘法', aops: 'Beast Academy 3' },
    at: { tw: 2 },
    gen(r) {
      const a = r.int(2, 9), b = r.int(2, 9), p = a * b, k = r.int(0, 2), th = r.pick(THINGS);
      const q = k === 0 ? T(`計算：${a} × ${b} = ?`, `Find ${a} × ${b}.`)
        : k === 1 ? T(`每盒有 ${a} ${th.cw}${th.zh}，${b} 盒一共有幾${th.cw}？`, `Each box has ${a} ${th.en}. How many ${th.en} are in ${b} boxes?`)
          : T(`${b} 個 ${a} 是多少？`, `What is ${b} groups of ${a}?`);
      return {
        q, ans: ansNum(p),
        sol: [
          k === 0 ? T(`${a} × ${b} 就是 ${b} 個 ${a} 相加（也等於 ${a} 個 ${b}）。`, `${a} × ${b} means ${a} added ${b} times (or ${b} added ${a} times).`) : T(`${b} 個 ${a}，寫成乘法是 ${a} × ${b}。`, `${b} groups of ${a} is the multiplication ${b} × ${a}.`),
          ...factSteps(a, b),
          T(`所以 ${a} × ${b} = ${p}。交換也一樣：${b} × ${a} = ${p}。`, k === 0 ? `So ${a} × ${b} = ${p}. Switching the order gives the same: ${b} × ${a} = ${p}.` : `So ${b} × ${a} = ${p}. Switching the order gives the same: ${a} × ${b} = ${p}.`),
        ],
      };
    },
  },
  {
    id: 'g3-div-facts',
    grade: 3,
    name: T('除法（用乘法想）', 'Division facts'),
    cur: { us: 'CCSS 3.OA.A.2', tw: '三年級 除法', aops: 'Beast Academy 3' },
    gen(r) {
      const d = r.int(2, 9), q = r.int(2, 9), n = d * q, k = r.int(0, 3), th = r.pick(THINGS);
      const think = [
        T(`想乘法：${d} × 多少 = ${n}？`, `Think multiplication: ${d} × what = ${n}?`),
        T(`${d} 的乘法：${multiples(d, q).join('、')}，第 ${q} 個是 ${n}。`, `Count by ${d}s: ${multiples(d, q).join(', ')}. After ${q} counts we reach ${n}.`),
        T(`所以 ${n} ÷ ${d} = ${q}。驗算：${d} × ${q} = ${n} ✔`, `So ${n} ÷ ${d} = ${q}. Check: ${d} × ${q} = ${n} ✔`),
      ];
      if (k === 0) return { q: T(`計算：${n} ÷ ${d} = ?`, `Find ${n} ÷ ${d}.`), ans: ansNum(q), sol: think };
      if (k === 1) return {
        q: T(`${n} ${th.cw}${th.zh}平分給 ${d} 個小朋友，每人分到幾${th.cw}？`, `${n} ${th.en} are shared equally among ${d} children. How many does each child get?`), ans: ansNum(q),
        sol: [T(`平分用除法：${n} ÷ ${d}。`, `Sharing equally means divide: ${n} ÷ ${d}.`), ...think],
      };
      if (k === 2) return {
        q: T(`有 ${n} ${th.cw}${th.zh}，每 ${d} ${th.cw}裝一袋，可以裝幾袋？`, `There are ${n} ${th.en}. If each bag holds ${d}, how many bags can be filled?`), ans: ansNum(q),
        sol: [T(`每 ${d} 個一袋，就是看 ${n} 裡有幾個 ${d}：${n} ÷ ${d}。`, `Bags of ${d}: how many ${d}s are in ${n}? ${n} ÷ ${d}.`), ...think],
      };
      return {
        q: T(`圖中的${th.zh}每 ${d} ${th.cw}一組，一共有 ${n} ${th.cw}。可以分成幾組？`, `The ${n} ${th.en} are put in groups of ${d}. How many groups are there?`),
        fig: dots(th.e, Array(q).fill(d)), ans: ansNum(q),
        sol: [T(`數一數組數，也可以算 ${n} ÷ ${d}。`, `Count the groups, or compute ${n} ÷ ${d}.`), ...think],
      };
    },
  },
  {
    id: 'g3-missing-factor',
    grade: 3,
    name: T('乘除法的 □', 'Missing factor (multiplication and division)'),
    cur: { us: 'CCSS 3.OA.A.4', tw: '三年級 乘除互逆', aops: 'Beast Academy 3' },
    gen(r) {
      const a = r.int(2, 9), m = r.int(2, 9), c = a * m, k = r.int(0, 3);
      const eqs = [`□ × ${a} = ${c}`, `${a} × □ = ${c}`, `${c} ÷ □ = ${a}`, `□ ÷ ${a} = ${m}`];
      const eq = eqs[k], ans = k === 3 ? c : m;
      const sol = k <= 1 ? [
        T(`${eq}：哪一個數和 ${a} 相乘會得到 ${c}？`, `${eq}: what number times ${a} gives ${c}?`),
        T(`用除法找：${c} ÷ ${a} = ${m}。`, `Use division: ${c} ÷ ${a} = ${m}.`),
        T(`□ = ${m}。驗算：${k === 0 ? `${m} × ${a}` : `${a} × ${m}`} = ${c} ✔`, `□ = ${m}. Check: ${k === 0 ? `${m} × ${a}` : `${a} × ${m}`} = ${c} ✔`),
      ] : k === 2 ? [
        T(`${eq}：${c} 分成幾份，每份才是 ${a}？`, `${eq}: ${c} split into how many parts gives ${a} in each part?`),
        T(`想乘法：${a} × □ = ${c}，${c} ÷ ${a} = ${m}。`, `Think multiplication: ${a} × □ = ${c}, so □ = ${c} ÷ ${a} = ${m}.`),
        T(`□ = ${m}。驗算：${c} ÷ ${m} = ${a} ✔`, `□ = ${m}. Check: ${c} ÷ ${m} = ${a} ✔`),
      ] : [
        T(`${eq}：什麼數分成 ${a} 份，每份是 ${m}？`, `${eq}: what number divided by ${a} gives ${m}?`),
        T(`把 ${a} 份合回去：${a} × ${m} = ${c}。`, `Put the ${a} parts back together: ${a} × ${m} = ${c}.`),
        T(`□ = ${c}。驗算：${c} ÷ ${a} = ${m} ✔`, `□ = ${c}. Check: ${c} ÷ ${a} = ${m} ✔`),
      ];
      return { q: T(`□ 裡應該填多少？　${eq}`, `What number goes in the box?　${eq}`), ans: ansNum(ans), sol };
    },
  },
  {
    id: 'g3-div-remainder',
    grade: 3,
    name: T('有餘數的除法', 'Division with remainders'),
    cur: { us: 'CCSS 4.NBT.B.6', tw: '三年級 有餘數的除法', aops: 'Beast Academy 3' },
    at: { us: 4 },
    gen(r) {
      const d = r.int(2, 9), q = r.int(2, 9), rem = r.int(1, d - 1), n = d * q + rem, k = r.int(0, 3), th = r.pick(THINGS);
      const core = [
        T(`找 ${d} 的倍數中，不超過 ${n} 的最大一個：${d} × ${q} = ${d * q}（${d} × ${q + 1} = ${d * (q + 1)} 就太多了）。`, `Find the biggest multiple of ${d} that is not more than ${n}: ${d} × ${q} = ${d * q} (${d} × ${q + 1} = ${d * (q + 1)} is too much).`),
        T(`剩下：${n} − ${d * q} = ${rem}。`, `Left over: ${n} − ${d * q} = ${rem}.`),
        T(`所以 ${n} ÷ ${d} = ${q} 餘 ${rem}。餘數 ${rem} 比除數 ${d} 小 ✔`, `So ${n} ÷ ${d} = ${q} remainder ${rem}. The remainder ${rem} is less than ${d} ✔`),
        T(`驗算：${d} × ${q} + ${rem} = ${n} ✔`, `Check: ${d} × ${q} + ${rem} = ${n} ✔`),
      ];
      if (k <= 1) return {
        q: T(`${n} ÷ ${d} = □ 餘 △。${k === 0 ? '商 □' : '餘數 △'}是多少？`, `${n} ÷ ${d} = □ remainder △. What is ${k === 0 ? 'the quotient □' : 'the remainder △'}?`), ans: ansNum(k === 0 ? q : rem), sol: core,
      };
      if (k === 2) {
        const askLeft = r.chance(0.5);
        return {
          q: T(`有 ${n} ${th.cw}${th.zh}，每 ${d} ${th.cw}裝一袋。${askLeft ? '裝完後會剩下幾' + th.cw + '？' : '可以裝滿幾袋？'}`, `There are ${n} ${th.en}, ${d} in each bag. ${askLeft ? 'How many are left over after filling the bags?' : 'How many bags can be filled?'}`),
          ans: ansNum(askLeft ? rem : q), sol: [T(`每 ${d} 個一袋：${n} ÷ ${d}。`, `Bags of ${d}: ${n} ÷ ${d}.`), ...core.slice(0, 3), T(askLeft ? `剩下 ${rem} ${th.cw}。` : `可以裝滿 ${q} 袋。`, askLeft ? `${rem} are left over.` : `${q} bags can be filled.`)],
        };
      }
      return {
        q: T(`${n} 位小朋友要坐車去郊遊，每輛車最多坐 ${d} 人。最少要幾輛車才能讓大家都坐上車？`, `${n} children are going on a trip. Each van holds at most ${d} children. What is the fewest vans needed so everyone can go?`),
        ans: ansNum(q + 1),
        sol: [T(`${n} ÷ ${d}：${d} × ${q} = ${d * q}，${n} − ${d * q} = ${rem}，所以是 ${q} 餘 ${rem}。`, `${n} ÷ ${d}: ${d} × ${q} = ${d * q} and ${n} − ${d * q} = ${rem}, so ${q} remainder ${rem}.`),
          T(`${q} 輛車坐滿了，還有 ${rem} 個人沒有車坐。`, `${q} vans are full, but ${rem} child${rem > 1 ? 'ren are' : ' is'} still waiting.`),
          T(`這 ${rem} 個人也需要一輛車，所以要 ${q} + 1 = ${q + 1} 輛。`, `They need one more van too, so ${q} + 1 = ${q + 1} vans.`),
          T('小心：這種題目答案要「多 1」，不能只寫商！', 'Careful: here the answer is one more than the quotient!')],
      };
    },
  },
  {
    id: 'g3-mult-tens',
    grade: 3,
    name: T('整十、整百的乘法', 'Multiplying by multiples of 10'),
    cur: { us: 'CCSS 3.NBT.A.3', tw: '三年級 乘法', aops: 'Beast Academy 3' },
    gen(r) {
      const a = r.int(2, 9), b = r.int(2, 9), z = r.chance(0.7) ? 10 : 100, B = b * z, p = a * B, k = r.int(0, 2);
      const unit = z === 10 ? ['十', 'tens'] : ['百', 'hundreds'];
      const q = k === 0 ? T(`計算：${a} × ${B} = ?`, `Find ${a} × ${B}.`)
        : k === 1 ? T(`每箱有 ${B} 枝鉛筆，${a} 箱一共有幾枝？`, `Each box has ${B} pencils. How many pencils are in ${a} boxes?`)
          : T(`計算：${B} × ${a} = ?`, `Find ${B} × ${a}.`);
      return {
        q, ans: ansNum(p),
        sol: [T(`${B} 是 ${b} 個${unit[0]}。`, `${B} is ${b} ${unit[1]}.`),
          T(`${a} × ${b} 個${unit[0]} = ${a * b} 個${unit[0]}（因為 ${a} × ${b} = ${a * b}）。`, `${a} × ${b} ${unit[1]} = ${a * b} ${unit[1]} (because ${a} × ${b} = ${a * b}).`),
          T(`${a * b} 個${unit[0]}就是 ${p}。小技巧：先算 ${a} × ${b}，再在後面補 ${z === 10 ? '1 個 0' : '2 個 0'}。`, `${a * b} ${unit[1]} is ${p}. Shortcut: find ${a} × ${b}, then write ${z === 10 ? 'one 0' : 'two 0s'} after it.`)],
      };
    },
  },
  {
    id: 'g3-mult-2x1',
    grade: 3,
    name: T('二、三位數乘以一位數', 'Multiplying 2- and 3-digit numbers by 1-digit numbers'),
    cur: { us: 'CCSS 4.NBT.B.5', tw: '三年級 二、三位數乘以一位數', aops: 'Beast Academy 3' },
    at: { us: 4 },
    gen(r) {
      const n = r.chance(0.7) ? r.int(12, 99) : r.int(102, 499), m = r.int(2, 9), p = n * m, k = r.int(0, 2), [A] = r.sample(NAMES, 1);
      const parts = digs(n).map((d, i) => d * 10 ** i).reverse().filter((x) => x);
      const q = k === 0 ? T(`計算：${n} × ${m} = ?`, `Find ${n} × ${m}.`)
        : k === 1 ? T(`每箱有 ${n} 瓶水，${m} 箱一共有幾瓶？`, `Each case has ${n} bottles of water. How many bottles are in ${m} cases?`)
          : T(`一張門票 ${n} 元，${A[0]}全家買了 ${m} 張，一共要付幾元？`, `A ticket costs $${n}. ${A[1]}'s family buys ${m} tickets. How much do they pay?`);
      return {
        q, ans: ansNum(p),
        sol: [
          T(`把 ${n} 拆開：${parts.join(' + ')}。`, `Break ${n} apart: ${parts.join(' + ')}.`),
          T(`每一部分都乘以 ${m}：${parts.map((x) => `${x} × ${m} = ${x * m}`).join('，')}。`, `Multiply each part by ${m}: ${parts.map((x) => `${x} × ${m} = ${x * m}`).join(', ')}.`),
          T(`加起來：${parts.map((x) => x * m).join(' + ')} = ${p}。`, `Add them up: ${parts.map((x) => x * m).join(' + ')} = ${p}.`),
          T(`估算檢查：${n} 大約是 ${n < 100 ? Math.round(n / 10) * 10 : Math.round(n / 100) * 100}，× ${m} 大約 ${(n < 100 ? Math.round(n / 10) * 10 : Math.round(n / 100) * 100) * m}，${p} 很接近 ✔`, `Estimate to check: ${n} is about ${n < 100 ? Math.round(n / 10) * 10 : Math.round(n / 100) * 100}, times ${m} is about ${(n < 100 ? Math.round(n / 10) * 10 : Math.round(n / 100) * 100) * m}; ${p} is close ✔`),
        ],
      };
    },
  },
  {
    id: 'g3-add-sub-4digit',
    grade: 3,
    name: T('一萬以內的加減', 'Adding and subtracting 4-digit numbers'),
    cur: { us: 'CCSS 4.NBT.B.4', tw: '三年級 一萬以內的加減', aops: 'Beast Academy 3' },
    at: { us: 4 },
    gen(r) {
      const k = r.int(0, 3), add = k === 0 || k === 2;
      let a, b;
      if (add) { do { a = r.int(1005, 7990); b = r.int(1002, 6990); } while (a + b > 9999); }
      else { a = r.chance(0.35) ? r.int(2, 9) * 1000 + r.pick([0, r.int(1, 9), 10 * r.int(1, 9), 100 * r.int(1, 9) + r.int(1, 9)]) : r.int(2500, 9999); b = r.int(1001, a - 100); }
      const v = add ? a + b : a - b, op = add ? '+' : '−';
      const q = k <= 1 ? T(`計算：${a} ${op} ${b} = ?`, `Find ${a} ${op} ${b}.`)
        : add ? T(`棒球場星期六來了 ${a} 位觀眾，星期日來了 ${b} 位。兩天一共來了幾位觀眾？`, `A ballpark had ${a} fans on Saturday and ${b} fans on Sunday. How many fans in the two days?`)
          : T(`一座山高 ${a} 公尺，登山隊已經爬到 ${b} 公尺的地方。還要再往上爬幾公尺才到山頂？`, `A mountain is ${a} m tall. The hikers are at ${b} m. How many more meters to the top?`);
      return {
        q, ans: ansNum(v),
        sol: [
          T(`直式對齊千位、百位、十位、個位，從個位開始${add ? '加' : '減'}。`, `Line up thousands, hundreds, tens and ones, and ${add ? 'add' : 'subtract'} starting from the ones.`),
          ...(add ? colAddSteps(a, b) : colSubSteps(a, b)),
          T(`答案是 ${v}。${add ? '' : `驗算：${v} + ${b} = ${a} ✔`}`, `The answer is ${v}.${add ? '' : ` Check: ${v} + ${b} = ${a} ✔`}`),
        ],
      };
    },
  },
  {
    id: 'g3-rounding',
    grade: 3,
    name: T('四捨五入到十位、百位', 'Rounding to the nearest 10 or 100'),
    cur: { us: 'CCSS 3.NBT.A.1', tw: '四年級 概數（四捨五入）', aops: 'Beast Academy 3' },
    at: { tw: 4 },
    gen(r) {
      const k = r.int(0, 3);
      const rnd = (n, u) => Math.floor((n + u / 2) / u) * u;
      const explain = (n, u) => {
        const lo = Math.floor(n / u) * u, hi = lo + u, dgt = Math.floor((n % u) / (u / 10)), up = dgt >= 5;
        return [
          T(`${n} 在 ${lo} 和 ${hi} 之間。`, `${n} is between ${lo} and ${hi}.`),
          T(`看${u === 10 ? '個位' : '十位'}：是 ${dgt}。${dgt === 5 ? '5 剛好在中間，規定要「五入」，往上進。' : up ? `${dgt} ≥ 5，要「五入」，往上進。` : `${dgt} < 5，要「四捨」，捨去。`}`, `Look at the ${u === 10 ? 'ones' : 'tens'} digit: ${dgt}. ${dgt === 5 ? '5 is exactly halfway, and the rule says round up.' : up ? `${dgt} is 5 or more, so round up.` : `${dgt} is less than 5, so round down.`}`),
          T(`所以 ${n} 四捨五入到${u === 10 ? '十' : '百'}位是 ${up ? hi : lo}。`, `So ${n} rounded to the nearest ${u === 10 ? 'ten' : 'hundred'} is ${up ? hi : lo}.`),
        ];
      };
      if (k === 0) {
        let n; do n = r.int(101, 989); while (n % 10 === 0);
        const lo = Math.floor(n / 10) * 10;
        return { q: T(`把 ${n} 四捨五入到十位。`, `Round ${n} to the nearest ten.`), fig: numberLine(lo, lo + 10, [{ v: n, label: String(n), hi: true }], 1), ans: ansNum(rnd(n, 10)), sol: explain(n, 10) };
      }
      if (k === 1) {
        let n; do n = r.chance(0.6) ? r.int(110, 989) : r.int(1010, 9890); while (n % 100 === 0);
        const lo = Math.floor(n / 100) * 100;
        return { q: T(`把 ${n} 四捨五入到百位。`, `Round ${n} to the nearest hundred.`), fig: numberLine(lo, lo + 100, [{ v: n, label: String(n), hi: true }], 10), ans: ansNum(rnd(n, 100)), sol: explain(n, 100) };
      }
      if (k === 2) {
        const X = 10 * r.int(3, 98), small = r.chance(0.5), v = small ? X - 5 : X + 4;
        return {
          q: T(`一個整數四捨五入到十位以後是 ${X}。這個整數${small ? '最小' : '最大'}可能是多少？`, `A whole number rounded to the nearest ten is ${X}. What is the ${small ? 'smallest' : 'greatest'} it could be?`), ans: ansNum(v),
          sol: [T(`會變成 ${X} 的數，是離 ${X} 比離旁邊的整十更近的數。`, `Numbers that round to ${X} are closer to ${X} than to the tens next to it.`),
            T(`${X - 5} 個位是 5，五入變成 ${X}；${X - 6} 個位是 4，會四捨成 ${X - 10}。`, `${X - 5} ends in 5, so it rounds up to ${X}; ${X - 6} ends in 4, so it rounds down to ${X - 10}.`),
            T(`${X + 4} 個位是 4，四捨變成 ${X}；${X + 5} 會五入成 ${X + 10}。`, `${X + 4} ends in 4, so it rounds down to ${X}; ${X + 5} rounds up to ${X + 10}.`),
            T(`所以範圍是 ${X - 5} 到 ${X + 4}，${small ? '最小' : '最大'}是 ${v}。`, `So the numbers go from ${X - 5} to ${X + 4}; the ${small ? 'smallest' : 'greatest'} is ${v}.`)],
        };
      }
      let n; do n = r.int(120, 980); while (n % 100 === 0);
      return {
        q: T(`學校有 ${n} 位學生。四捨五入到百位，大約是幾位學生？`, `A school has ${n} students. Rounded to the nearest hundred, about how many students is that?`), ans: ansNum(rnd(n, 100)), sol: explain(n, 100),
      };
    },
  },
  {
    id: 'g3-frac-number-line',
    grade: 3,
    name: T('數線上的分數', 'Fractions on a number line'),
    cur: { us: 'CCSS 3.NF.A.2', tw: '四年級 分數與數線', aops: 'Beast Academy 3' },
    at: { tw: 4 },
    gen(r) {
      let d = r.pick([2, 3, 4, 5, 6, 8]); const W = r.chance(0.3) ? 2 : 1, k = r.int(0, 2);
      if (k === 1 && d * W < 5) d = r.pick([4, 5, 6, 8]);
      if (k === 0) {
        let n; do n = r.int(1, d * W - 1); while (n % d === 0);
        return {
          q: T(`點 P 表示哪一個分數？（例如寫成 3/4）`, `What fraction does point P show? (Type it like 3/4.)`), fig: fracLine(d, W, [{ v: n, s: 'P' }]), ans: ansNum([n, d], `${n}/${d}`),
          sol: [T(`0 到 1 之間被平分成 ${d} 格，每一格是 ${frac(1, d)}。`, `From 0 to 1 is cut into ${d} equal spaces, so each space is ${frac(1, d)}.`),
            T(`從 0 往右數到 P：一共 ${n} 格。`, `Count the spaces from 0 to P: ${n}.`),
            T(`${n} 個 ${frac(1, d)} 是 ${frac(n, d)}${n > d ? `（也就是 1 又 ${frac(n - d, d)}）` : ''}。`, `${n} of ${frac(1, d)} is ${frac(n, d)}${n > d ? ` (that is 1 and ${frac(n - d, d)})` : ''}.`)],
        };
      }
      if (k === 1) {
        const pool = r.shuffle(range(1, d * W - 1)).slice(0, 4), tgt = pool[0], sorted = pool.slice().sort((x, y) => x - y), L = ['P', 'Q', 'R', 'S'];
        const lab = (v) => L[sorted.indexOf(v)];
        return {
          q: T(`哪一個點表示 ${frac(tgt, d)}？`, `Which point shows ${frac(tgt, d)}?`), fig: fracLine(d, W, sorted.map((v) => ({ v, s: lab(v) }))),
          ans: ansChoice([lab(tgt), ...sorted.filter((v) => v !== tgt).map(lab)]),
          sol: [T(`分母是 ${d}：0 到 1 平分成 ${d} 格，每格 ${frac(1, d)}。`, `The denominator is ${d}: 0 to 1 is cut into ${d} spaces of ${frac(1, d)} each.`),
            T(`分子是 ${tgt}：從 0 往右數 ${tgt} 格。`, `The numerator is ${tgt}: count ${tgt} spaces to the right of 0.`),
            T(`停在點 ${lab(tgt)}。`, `We land on point ${lab(tgt)}.`)],
        };
      }
      const whole = r.int(1, W), v = whole * d;
      return {
        q: T(`看數線：${whole} = □/${d}，□ 是多少？`, `Look at the number line: ${whole} = □/${d}. What is □?`), fig: fracLine(d, W, [{ v, s: String(whole) }]), ans: ansNum(v),
        sol: [T(`每一格是 ${frac(1, d)}。`, `Each space is ${frac(1, d)}.`), T(`從 0 數到 ${whole}，一共 ${whole} × ${d} = ${v} 格。`, `From 0 to ${whole} there are ${whole} × ${d} = ${v} spaces.`), T(`所以 ${whole} = ${frac(v, d)}，□ = ${v}。`, `So ${whole} = ${frac(v, d)}, and □ = ${v}.`)],
      };
    },
  },
  {
    id: 'g3-equiv-frac',
    grade: 3,
    name: T('等值分數', 'Equivalent fractions'),
    cur: { us: 'CCSS 3.NF.A.3b', tw: '四年級 等值分數', aops: 'Beast Academy 3' },
    at: { tw: 4 },
    gen(r) {
      let a, b, m; do { b = r.int(2, 6); m = r.int(2, 4); a = r.int(1, b - 1); } while (b * m > 12 || red(a, b)[1] !== b);
      const k = r.int(0, 2), A = a * m, B = b * m, figs = fracBar(a, b, 240) + fracBar(A, B, 240);
      const why = [
        T(`把每一份再切成 ${m} 小份：全部的份數 ${b} × ${m} = ${B}，塗色的份數 ${a} × ${m} = ${A}。`, `Cut every part into ${m} smaller parts: total parts ${b} × ${m} = ${B}, shaded parts ${a} × ${m} = ${A}.`),
        T(`塗色的大小沒有變，所以 ${frac(a, b)} = ${frac(A, B)}。`, `The shaded amount didn't change, so ${frac(a, b)} = ${frac(A, B)}.`),
        T(`規則：分子和分母同時乘以同一個數，分數的大小不變。`, `Rule: multiply the top and bottom by the same number and the fraction stays the same size.`),
      ];
      if (k === 0) return { q: T(`${frac(a, b)} = □/${B}，□ 是多少？`, `${frac(a, b)} = □/${B}. What is □?`), fig: figs, ans: ansNum(A), sol: [T(`分母從 ${b} 變成 ${B}，是乘以 ${m}。`, `The bottom went from ${b} to ${B}: that's times ${m}.`), ...why] };
      if (k === 1) return {
        q: T(`${frac(A, B)} = ${a}/□，□ 是多少？`, `${frac(A, B)} = ${a}/□. What is □?`), fig: figs, ans: ansNum(b),
        sol: [T(`分子從 ${A} 變成 ${a}，是除以 ${m}。分母也要除以 ${m}：${B} ÷ ${m} = ${b}。`, `The top went from ${A} to ${a}: divided by ${m}. Divide the bottom by ${m} too: ${B} ÷ ${m} = ${b}.`), ...why.slice(0, 2)],
      };
      const cand = [[a + m, b + m], [A, b + m], [a, B], [A + 1, B], [a + 1, b + 1]].filter(([p, q]) => p < q && p * b !== q * a);
      const opts = uniq([frac(A, B), ...cand.map(([p, q]) => frac(p, q))]).slice(0, 4);
      return {
        q: T(`哪一個分數和 ${frac(a, b)} 一樣大？`, `Which fraction is equal to ${frac(a, b)}?`), ans: ansChoice(opts),
        sol: [T(`分子、分母都乘以 ${m}：${frac(a, b)} = ${frac(A, B)}。`, `Multiply top and bottom by ${m}: ${frac(a, b)} = ${frac(A, B)}.`), ...why.slice(1), T('小心：分子分母「加上」同一個數，大小會改變，不是等值分數。', 'Careful: adding the same number to the top and bottom changes the size — that does not make an equal fraction.')],
      };
    },
  },
  {
    id: 'g3-frac-compare',
    grade: 3,
    name: T('比較分數（同分母或同分子）', 'Comparing fractions with the same numerator or denominator'),
    cur: { us: 'CCSS 3.NF.A.3d', tw: '三年級 分數的大小比較', aops: 'Beast Academy 3' },
    gen(r) {
      const same = r.chance(0.5) ? 'den' : 'num'; let a, b, c, d;
      if (same === 'den') { b = d = r.int(3, 12); [a, c] = r.sample(range(1, b - 1), 2); }
      else { a = c = r.int(1, 5); [b, d] = r.sample(range(a + 1, 12), 2); }
      const gt = a * d > c * b, sym = gt ? '&gt;' : '&lt;', big = gt ? [a, b] : [c, d], small = gt ? [c, d] : [a, b], k = r.int(0, 1);
      const why = same === 'den' ? [
        T(`分母一樣都是 ${b}：每一份一樣大。`, `Same denominator (${b}): all the pieces are the same size.`),
        T(`${frac(big[0], b)} 有 ${big[0]} 份，${frac(small[0], b)} 只有 ${small[0]} 份，份數多的比較大。`, `${frac(big[0], b)} has ${big[0]} pieces and ${frac(small[0], b)} has only ${small[0]}. More pieces is more.`),
      ] : [
        T(`分子一樣都是 ${a}：拿的份數一樣多。`, `Same numerator (${a}): we take the same number of pieces.`),
        T(`分母越大，切得越多份，每一份就越小。${frac(1, big[1])} 比 ${frac(1, small[1])} 大。`, `A bigger denominator means more pieces, so each piece is smaller. ${frac(1, big[1])} is bigger than ${frac(1, small[1])}.`),
        T(`所以 ${frac(...big)} 比 ${frac(...small)} 大。`, `So ${frac(...big)} is bigger than ${frac(...small)}.`),
      ];
      if (k === 0) return {
        q: T(`在 ○ 裡填入 &gt;、&lt; 或 =：　${frac(a, b)} ○ ${frac(c, d)}`, `Fill in &gt;, &lt; or =:　${frac(a, b)} ○ ${frac(c, d)}`), fig: fracBar(a, b, 240) + fracBar(c, d, 240),
        ans: ansChoice([sym, gt ? '&lt;' : '&gt;', '=']), sol: [...why, T(`${frac(a, b)} ${sym} ${frac(c, d)}。`, `${frac(a, b)} ${sym} ${frac(c, d)}.`)],
      };
      const [A, B] = r.sample(NAMES, 2);
      return {
        q: T(`兩個一樣大的披薩。${A[0]}吃了一個披薩的 ${frac(a, b)}，${B[0]}吃了另一個披薩的 ${frac(c, d)}。誰吃得比較多？`, `Two pizzas are the same size. ${A[1]} ate ${frac(a, b)} of one pizza and ${B[1]} ate ${frac(c, d)} of the other. Who ate more?`),
        fig: pie(a, b) + pie(c, d), ans: ansChoice(gt ? [T(A[0], A[1]), T(B[0], B[1]), T('一樣多', 'They ate the same amount')] : [T(B[0], B[1]), T(A[0], A[1]), T('一樣多', 'They ate the same amount')]),
        sol: [...why, T(`${gt ? A[0] : B[0]}吃得比較多。`, `${gt ? A[1] : B[1]} ate more.`)],
      };
    },
  },
  {
    id: 'g3-area-count',
    grade: 3,
    name: T('數格子求面積和周長', 'Area and perimeter by counting squares'),
    cur: { us: 'CCSS 3.MD.C.6', tw: '三年級 面積（數格子）', aops: 'Beast Academy 3' },
    gen(r) {
      const k = r.int(0, 3), cols = 9, rows = 6, on = new Set();
      const add = (x0, y0, w, h) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) on.add(x + ',' + y); };
      const unitA = T('每一小格是 1 平方公分。', 'Each small square is 1 square centimeter.');
      if (k === 0 || k === 2) {
        const w = r.int(2, 7), h = r.int(2, 5); add(r.int(0, cols - w), r.int(0, rows - h), w, h);
        if (k === 0) return {
          q: T('塗色長方形的面積是幾平方公分？（每一小格是 1 平方公分）', 'What is the area of the shaded rectangle in square centimeters? (Each small square is 1 square centimeter.)'), fig: cellFig(cols, rows, on), ans: ansNum(w * h),
          sol: [unitA, T(`它有 ${h} 排，每排 ${w} 格。`, `It has ${h} rows with ${w} squares in each row.`), T(`不用一格一格數：${w} × ${h} = ${w * h}。`, `No need to count one by one: ${w} × ${h} = ${w * h}.`), T(`面積是 ${w * h} 平方公分。`, `The area is ${w * h} square centimeters.`)],
        };
        return {
          q: T('塗色長方形的周長是幾公分？（每一小格的邊長是 1 公分）', 'What is the perimeter of the shaded rectangle in centimeters? (Each small square has sides of 1 cm.)'), fig: cellFig(cols, rows, on), ans: ansNum(2 * (w + h)),
          sol: [T('周長是繞著外圍走一圈的長度。', 'Perimeter is the distance all the way around the outside.'), T(`上下兩邊各 ${w} 公分，左右兩邊各 ${h} 公分。`, `The top and bottom are ${w} cm each; the left and right sides are ${h} cm each.`),
            T(`${w} + ${h} + ${w} + ${h} = ${2 * (w + h)}。`, `${w} + ${h} + ${w} + ${h} = ${2 * (w + h)}.`), T(`周長是 ${2 * (w + h)} 公分。`, `The perimeter is ${2 * (w + h)} cm.`)],
        };
      }
      if (k === 1) {
        const W = r.int(3, 7), H = r.int(3, 5), cw = r.int(1, W - 1), ch = r.int(1, H - 1), x0 = r.int(0, cols - W), y0 = r.int(0, rows - H);
        add(x0, y0, W, H); const right = r.chance(0.5), top = r.chance(0.5);
        for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) on.delete((right ? x0 + W - 1 - x : x0 + x) + ',' + (top ? y0 + y : y0 + H - 1 - y));
        const A = W * H - cw * ch;
        return {
          q: T('塗色圖形的面積是幾平方公分？（每一小格是 1 平方公分）', 'What is the area of the shaded shape in square centimeters? (Each small square is 1 square centimeter.)'), fig: cellFig(cols, rows, on), ans: ansNum(A),
          sol: [unitA, T(`先把它看成一個完整的大長方形：${W} × ${H} = ${W * H} 格。`, `First imagine the full big rectangle: ${W} × ${H} = ${W * H} squares.`),
            T(`缺了一個角：${cw} × ${ch} = ${cw * ch} 格。`, `A corner is missing: ${cw} × ${ch} = ${cw * ch} squares.`),
            T(`${W * H} − ${cw * ch} = ${A}，面積是 ${A} 平方公分。`, `${W * H} − ${cw * ch} = ${A}. The area is ${A} square centimeters.`)],
        };
      }
      // a random connected blob
      const x0 = r.int(2, 6), y0 = r.int(1, 4); on.add(x0 + ',' + y0); const n = r.int(6, 14);
      while (on.size < n) { const [x, y] = r.pick([...on]).split(',').map(Number), [dx, dy] = r.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]); const nx = x + dx, ny = y + dy; if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) on.add(nx + ',' + ny); }
      const byRow = range(0, rows - 1).map((y) => [...on].filter((c) => +c.split(',')[1] === y).length).filter((c) => c);
      return {
        q: T('塗色圖形的面積是幾平方公分？（每一小格是 1 平方公分）', 'What is the area of the shaded shape in square centimeters? (Each small square is 1 square centimeter.)'), fig: cellFig(cols, rows, on), ans: ansNum(n),
        sol: [unitA, T('一排一排數，比較不會漏掉。', 'Count row by row so you don\'t miss any.'), T(`每一排塗色的格數：${byRow.join(' + ')} = ${n}。`, `Shaded squares in each row: ${byRow.join(' + ')} = ${n}.`), T(`面積是 ${n} 平方公分。`, `The area is ${n} square centimeters.`)],
      };
    },
  },
  {
    id: 'g3-area-perimeter',
    grade: 3,
    name: T('長方形的面積與周長', 'Area and perimeter of rectangles'),
    cur: { us: 'CCSS 3.MD.D.8', tw: '四年級 長方形的周長與面積', aops: 'Beast Academy 3' },
    at: { tw: 4 },
    gen(r) {
      const k = r.int(0, 4), w = r.int(3, 12), h = r.int(2, Math.min(9, w - 1)), [A] = r.sample(NAMES, 1);
      if (k === 0) return {
        q: T(`長方形的長是 ${w} 公分，寬是 ${h} 公分。面積是幾平方公分？`, `A rectangle is ${w} cm long and ${h} cm wide. What is its area in square centimeters?`), fig: rect(`${w} cm`, `${h} cm`), ans: ansNum(w * h),
        sol: [T('長方形的面積 = 長 × 寬。', 'Area of a rectangle = length × width.'), T(`想成 ${h} 排，每排 ${w} 個 1 平方公分的小方格。`, `Think of ${h} rows of ${w} unit squares.`), T(`${w} × ${h} = ${w * h}，面積是 ${w * h} 平方公分。`, `${w} × ${h} = ${w * h}, so the area is ${w * h} square centimeters.`)],
      };
      if (k === 1) return {
        q: T(`${A[0]}要用緞帶圍一個長 ${w} 公分、寬 ${h} 公分的長方形卡片一圈。需要幾公分的緞帶？`, `${A[1]} wants to put ribbon around the edge of a card that is ${w} cm long and ${h} cm wide. How many centimeters of ribbon are needed?`), fig: rect(`${w} cm`, `${h} cm`), ans: ansNum(2 * (w + h)),
        sol: [T('圍一圈就是求周長：四條邊加起來。', 'Going all the way around means perimeter: add all four sides.'), T(`${w} + ${h} + ${w} + ${h} = ${2 * (w + h)}。`, `${w} + ${h} + ${w} + ${h} = ${2 * (w + h)}.`), T(`也可以算 (${w} + ${h}) × 2 = ${2 * (w + h)}。需要 ${2 * (w + h)} 公分。`, `Or (${w} + ${h}) × 2 = ${2 * (w + h)}. ${2 * (w + h)} cm are needed.`)],
      };
      if (k === 2) return {
        q: T(`長方形的面積是 ${w * h} 平方公分，長是 ${w} 公分。寬是幾公分？`, `A rectangle has an area of ${w * h} square centimeters and a length of ${w} cm. What is its width?`), fig: rect(`${w} cm`, '?'), ans: ansNum(h),
        sol: [T(`長 × 寬 = 面積：${w} × □ = ${w * h}。`, `Length × width = area: ${w} × □ = ${w * h}.`), T(`□ = ${w * h} ÷ ${w} = ${h}。`, `□ = ${w * h} ÷ ${w} = ${h}.`), T(`寬是 ${h} 公分。驗算：${w} × ${h} = ${w * h} ✔`, `The width is ${h} cm. Check: ${w} × ${h} = ${w * h} ✔`)],
      };
      if (k === 3) {
        const P = 2 * (w + h);
        return {
          q: T(`長方形的周長是 ${P} 公分，長是 ${w} 公分。寬是幾公分？`, `A rectangle has a perimeter of ${P} cm and a length of ${w} cm. What is its width?`), fig: rect(`${w} cm`, '?'), ans: ansNum(h),
          sol: [T(`周長是「長 + 寬」的 2 倍，所以長 + 寬 = ${P} ÷ 2 = ${w + h}。`, `The perimeter is 2 times (length + width), so length + width = ${P} ÷ 2 = ${w + h}.`), T(`寬 = ${w + h} − ${w} = ${h}。`, `Width = ${w + h} − ${w} = ${h}.`), T(`寬是 ${h} 公分。驗算：${w} + ${h} + ${w} + ${h} = ${P} ✔`, `The width is ${h} cm. Check: ${w} + ${h} + ${w} + ${h} = ${P} ✔`)],
        };
      }
      const s = r.int(2, 12), askArea = r.chance(0.5);
      return {
        q: askArea ? T(`正方形的周長是 ${4 * s} 公分。它的面積是幾平方公分？`, `A square has a perimeter of ${4 * s} cm. What is its area in square centimeters?`) : T(`正方形的邊長是 ${s} 公分。它的周長是幾公分？`, `A square has sides of ${s} cm. What is its perimeter?`),
        fig: rect(askArea ? '?' : `${s} cm`, askArea ? '?' : `${s} cm`, 100, 100), ans: ansNum(askArea ? s * s : 4 * s),
        sol: askArea ? [T('正方形的 4 條邊一樣長。', 'A square has 4 equal sides.'), T(`邊長 = ${4 * s} ÷ 4 = ${s} 公分。`, `Side = ${4 * s} ÷ 4 = ${s} cm.`), T(`面積 = ${s} × ${s} = ${s * s} 平方公分。`, `Area = ${s} × ${s} = ${s * s} square centimeters.`)]
          : [T('正方形的 4 條邊一樣長。', 'A square has 4 equal sides.'), T(`周長 = ${s} + ${s} + ${s} + ${s} = ${s} × 4 = ${4 * s}。`, `Perimeter = ${s} + ${s} + ${s} + ${s} = ${s} × 4 = ${4 * s}.`), T(`周長是 ${4 * s} 公分。`, `The perimeter is ${4 * s} cm.`)],
      };
    },
  },
  {
    id: 'g3-elapsed-time',
    grade: 3,
    name: T('經過多少時間', 'Elapsed time'),
    cur: { us: 'CCSS 3.MD.A.1', tw: '三年級 時間的計算', aops: 'Beast Academy 3' },
    gen(r) {
      let h, m, D, eh, em;
      do { h = r.int(7, 10); m = 5 * r.int(0, 11); D = 5 * r.int(3, 22); const t = h * 60 + m + D; eh = Math.floor(t / 60); em = t % 60; } while (eh > 11);
      const lab = (hh, mm) => tl(hh, mm, false), k = r.int(0, 3), [A] = r.sample(NAMES, 1);
      const Dh = Math.floor(D / 60), Dm = D % 60;
      const durText = T(Dh ? `${Dh} 小時${Dm ? ` ${Dm} 分` : ''}` : `${D} 分鐘`, Dh ? `${Dh} hour${Dh > 1 ? 's' : ''}${Dm ? ` ${Dm} minutes` : ''}` : `${D} minutes`);
      // how long from h:m to eh:em, explained
      const between = () => {
        if (h === eh) return [T(`開始和結束都在 ${h} 點多，只要看分鐘。`, `Both times are in the same hour (${h} o'clock), so just compare the minutes.`), T(`同一個小時裡：${em} − ${m} = ${D} 分鐘。`, `Same hour: ${em} − ${m} = ${D} minutes.`)];
        const toHour = 60 - m, mid = eh - h - 1;
        return [
          T(`先從 ${lab(h, m).zh} 走到 ${h + 1} 點整：${m ? `60 − ${m} = ${toHour}` : '60'} 分鐘。`, `First go from ${lab(h, m).en} to ${h + 1}:00: ${m ? `60 − ${m} = ${toHour}` : '60'} minutes.`),
          ...(mid ? [T(`${h + 1} 點到 ${eh} 點：${mid} 小時 = ${mid * 60} 分鐘。`, `${h + 1}:00 to ${eh}:00: ${mid} hour${mid > 1 ? 's' : ''} = ${mid * 60} minutes.`)] : []),
          T(`再從 ${eh} 點走到 ${lab(eh, em).zh}：${em} 分鐘。`, `Then ${eh}:00 to ${lab(eh, em).en}: ${em} minutes.`),
          T(`合起來：${[m ? toHour : 60, ...(mid ? [mid * 60] : []), em].join(' + ')} = ${D} 分鐘${Dh ? `（${durText.zh}）` : ''}。`, `Together: ${[m ? toHour : 60, ...(mid ? [mid * 60] : []), em].join(' + ')} = ${D} minutes${Dh ? ` (${durText.en})` : ''}.`),
        ];
      };
      if (k === 0 || k === 3) {
        const fwd = k === 0;
        const wrongs = [lab(eh + 1, em), lab(eh, (em + 10) % 60), lab(h + Dh, (m + Dm) % 60 === em ? (em + 5) % 60 : (m + Dm) % 60), lab(eh - 1, em), lab(h, m === 0 ? 30 : 0)];
        const right = fwd ? lab(eh, em) : lab(h, m);
        const wrongB = [lab(h - 1, m), lab(h, (m + 10) % 60), lab(h + 1, m), lab(eh, em)];
        const opts = uniq([right, ...(fwd ? wrongs : wrongB)]).slice(0, 4);
        return {
          q: fwd ? T(`${A[0]}在 ${lab(h, m).zh} 開始寫功課，寫了 ${durText.zh}。幾點幾分寫完？`, `${A[1]} starts homework at ${lab(h, m).en} and works for ${durText.en}. What time does ${A[1]} finish?`)
            : T(`一部電影在 ${lab(eh, em).zh} 結束，一共演了 ${durText.zh}。電影是幾點幾分開始的？`, `A movie ends at ${lab(eh, em).en}. It lasted ${durText.en}. What time did it start?`),
          ans: ansChoice(opts),
          sol: fwd ? [
            T(`把 ${D} 分鐘拆成 ${Dh} 小時 ${Dm} 分鐘（60 分鐘 = 1 小時）。`, `Split ${D} minutes into ${Dh} hour${Dh === 1 ? '' : 's'} and ${Dm} minutes (60 minutes = 1 hour).`),
            T(`先加小時：${h} + ${Dh} = ${h + Dh} 點 ${m} 分。`, `Add the hours: ${h} + ${Dh} = ${h + Dh}, so ${h + Dh}:${pad2(m)}.`),
            m + Dm >= 60 ? T(`再加分鐘：${m} + ${Dm} = ${m + Dm} 分，超過 60 分要進位成 1 小時：${m + Dm} − 60 = ${em} 分，時變成 ${eh}。`, `Add the minutes: ${m} + ${Dm} = ${m + Dm}. That's 60 or more, so trade 60 minutes for 1 hour: ${m + Dm} − 60 = ${em}, and the hour becomes ${eh}.`)
              : T(`再加分鐘：${m} + ${Dm} = ${em} 分。`, `Add the minutes: ${m} + ${Dm} = ${em}.`),
            T(`寫完的時間是 ${lab(eh, em).zh}。`, `${A[1]} finishes at ${lab(eh, em).en}.`),
          ] : [
            T(`往回推：從結束時間減掉 ${durText.zh}。`, `Work backward: subtract ${durText.en} from the end time.`),
            T(`${lab(eh, em).zh} 往前 ${D} 分鐘。`, `Go back ${D} minutes from ${lab(eh, em).en}.`),
            ...between().slice(-1),
            T(`檢查：從 ${lab(h, m).zh} 開始，過 ${D} 分鐘剛好是 ${lab(eh, em).zh} ✔ 所以開始時間是 ${lab(h, m).zh}。`, `Check: starting at ${lab(h, m).en}, ${D} minutes later is ${lab(eh, em).en} ✔ So it started at ${lab(h, m).en}.`),
          ],
        };
      }
      return {
        q: k === 1 ? T(`游泳課從 ${lab(h, m).zh} 開始，到 ${lab(eh, em).zh} 結束。一共上了幾分鐘？`, `Swim class starts at ${lab(h, m).en} and ends at ${lab(eh, em).en}. How many minutes long is it?`)
          : T('左邊的時鐘是開始的時間，右邊的時鐘是結束的時間。一共經過了幾分鐘？', 'The left clock shows the start time and the right clock shows the end time. How many minutes passed?'),
        fig: k === 2 ? clock(h, m) + clock(eh, em) : '', ans: ansNum(D),
        sol: [...(k === 2 ? [T(`開始：${lab(h, m).zh}；結束：${lab(eh, em).zh}。`, `Start: ${lab(h, m).en}. End: ${lab(eh, em).en}.`)] : []), ...between()],
      };
    },
  },
  {
    id: 'g3-mass-capacity',
    grade: 3,
    name: T('重量與容量（公斤、公克、公升、毫升）', 'Mass and capacity (kg, g, L, mL)'),
    cur: { us: 'CCSS 3.MD.A.2', tw: '三年級 重量與容量', aops: 'Beast Academy 3' },
    gen(r) {
      const k = r.int(0, 4), liq = r.chance(0.45);
      const [Bz, Be, sz, se, bigZ, bigE, smZ, smE] = liq ? ['公升', 'L', '毫升', 'mL', '公升', 'liters', '毫升', 'milliliters'] : ['公斤', 'kg', '公克', 'g', '公斤', 'kilograms', '公克', 'grams'];
      const rule = T(`1 ${Bz} = 1000 ${sz}。`, `1 ${Be} = 1000 ${se}.`);
      if (k === 0) {
        const x = r.int(1, 9), y = r.pick([r.int(1, 99), r.int(100, 999), r.int(100, 999)]), v = 1000 * x + y;
        return {
          q: T(`${x} ${Bz} ${y} ${sz} = 幾${sz}？`, `${x} ${Be} ${y} ${se} = how many ${smE}?`), ans: ansNum(v),
          sol: [rule, T(`${x} ${Bz} = ${1000 * x} ${sz}。`, `${x} ${Be} = ${1000 * x} ${se}.`), T(`${1000 * x} + ${y} = ${v}${y < 100 ? `（小心中間要補 0）` : ''}。`, `${1000 * x} + ${y} = ${v}${y < 100 ? ' (careful with the zeros in the middle)' : ''}.`), T(`答案是 ${v} ${sz}。`, `The answer is ${v} ${se}.`)],
        };
      }
      if (k === 1) {
        const v = r.int(1050, 9950), x = Math.floor(v / 1000), y = v % 1000;
        return {
          q: T(`${v} ${sz} = ${x} ${Bz} □ ${sz}，□ 是多少？`, `${v} ${se} = ${x} ${Be} and □ ${se}. What is □?`), ans: ansNum(y),
          sol: [rule, T(`${v} 裡有 ${x} 個 1000，就是 ${x} ${Bz}。`, `${v} has ${x} thousands, which is ${x} ${Be}.`), T(`剩下 ${v} − ${1000 * x} = ${y} ${sz}。`, `What is left: ${v} − ${1000 * x} = ${y} ${se}.`)],
        };
      }
      if (k === 2) {
        const a = r.int(150, 2800), b = r.int(120, 2500), s = a + b;
        const q = liq ? T(`一瓶果汁有 ${a} 毫升，一瓶牛奶有 ${b} 毫升。兩瓶一共有幾毫升？`, `A bottle of juice holds ${a} mL and a bottle of milk holds ${b} mL. How many milliliters in all?`)
          : T(`一顆西瓜重 ${a} 公克，一顆鳳梨重 ${b} 公克。一共重幾公克？`, `A watermelon weighs ${a} g and a pineapple weighs ${b} g. How many grams in all?`);
        return {
          q, ans: ansNum(s),
          sol: [T(`單位一樣，直接相加：${a} + ${b} = ${s}。`, `The units are the same, so just add: ${a} + ${b} = ${s}.`), T(`一共 ${s} ${sz}${s >= 1000 ? `，也就是 ${Math.floor(s / 1000)} ${Bz} ${s % 1000} ${sz}` : ''}。`, `That is ${s} ${se}${s >= 1000 ? `, or ${Math.floor(s / 1000)} ${Be} ${s % 1000} ${se}` : ''}.`)],
        };
      }
      if (k === 3) {
        const c = r.int(1, 19) * 50, big = r.int(1, 3), v = big * 1000 - c;
        const q = liq ? T(`水壺裡有 ${big} 公升的水，倒出 ${c} 毫升。還剩幾毫升？`, `A jug has ${big} L of water. ${c} mL is poured out. How many milliliters are left?`)
          : T(`一袋米重 ${big} 公斤，用掉了 ${c} 公克。還剩幾公克？`, `A bag of rice weighs ${big} kg. ${c} g is used. How many grams are left?`);
        return {
          q, ans: ansNum(v),
          sol: [T('單位不一樣，先換成一樣的單位。', 'The units are different, so change them to the same unit first.'), T(`${big} ${Bz} = ${big * 1000} ${sz}。`, `${big} ${Be} = ${big * 1000} ${se}.`), T(`${big * 1000} − ${c} = ${v}，還剩 ${v} ${sz}。`, `${big * 1000} − ${c} = ${v}, so ${v} ${se} are left.`)],
        };
      }
      const EST = [['一顆雞蛋', 'An egg', 50, 'g'], ['一顆蘋果', 'An apple', 200, 'g'], ['一枝鉛筆', 'A pencil', 5, 'g'], ['一顆大西瓜', 'A big watermelon', 5, 'kg'], ['一隻小狗', 'A small dog', 8, 'kg'], ['一個三年級學生', 'A third grader', 28, 'kg'],
        ['一杯牛奶', 'A glass of milk', 250, 'mL'], ['一湯匙的藥水', 'A spoonful of medicine', 5, 'mL'], ['一個浴缸的水', 'A bathtub of water', 200, 'L'], ['一個水桶的水', 'A bucket of water', 10, 'L']];
      const [z, e, v, u] = r.pick(EST), U = { g: T('公克', 'grams'), kg: T('公斤', 'kilograms'), mL: T('毫升', 'milliliters'), L: T('公升', 'liters') };
      const isMass = u === 'g' || u === 'kg';
      return {
        q: T(`${z}大約是 ${v} 多少？選最合適的單位。`, `${e} is about ${v} what? Choose the best unit.`), ans: ansChoice([U[u], ...['g', 'kg', 'mL', 'L'].filter((x) => x !== u).map((x) => U[x])]),
        sol: [isMass ? T('這是在說有多重，用重量單位（公克或公斤）。', 'This is about how heavy something is, so use a mass unit (grams or kilograms).') : T('這是在說能裝多少液體，用容量單位（毫升或公升）。', 'This is about how much liquid, so use a capacity unit (milliliters or liters).'),
          T(`${u === 'g' ? '1 公克很輕，大約一個迴紋針' : u === 'kg' ? '1 公斤大約是一大瓶水' : u === 'mL' ? '1 毫升很少，大約幾滴水' : '1 公升大約是一大瓶水'}。`, `${u === 'g' ? '1 gram is very light, about a paper clip' : u === 'kg' ? '1 kilogram is about a big bottle of water' : u === 'mL' ? '1 milliliter is tiny, just a few drops' : '1 liter is about a big bottle of water'}.`),
          T(`所以${z}大約是 ${v} ${U[u].zh}。`, `So ${e.toLowerCase()} is about ${v} ${U[u].en}.`)],
      };
    },
  },
  {
    id: 'g3-order-ops',
    grade: 3,
    name: T('先乘除，後加減', 'Order of operations: × and ÷ before + and −'),
    cur: { us: 'CCSS 3.OA.D.8', tw: '四年級 四則運算', aops: 'Beast Academy 3' },
    at: { tw: 4 },
    gen(r) {
      const f = r.int(0, 5); let expr, v, steps, ltr = null;
      const b = r.int(2, 9), c = r.int(2, 9);
      if (f === 0) { const a = r.int(2, 40); expr = `${a} + ${b} × ${c}`; v = a + b * c; ltr = (a + b) * c; steps = [`${b} × ${c} = ${b * c}`, `${a} + ${b * c} = ${v}`]; }
      else if (f === 1) { const a = b * c + r.int(1, 30); expr = `${a} − ${b} × ${c}`; v = a - b * c; ltr = (a - b) * c; steps = [`${b} × ${c} = ${b * c}`, `${a} − ${b * c} = ${v}`]; }
      else if (f === 2) { const d = r.int(2, 9), e = r.int(2, 9); expr = `${b} × ${c} + ${d} × ${e}`; v = b * c + d * e; ltr = (b * c + d) * e; steps = [`${b} × ${c} = ${b * c}`, `${d} × ${e} = ${d * e}`, `${b * c} + ${d * e} = ${v}`]; }
      else if (f === 3) { const a = b * c, e = r.int(2, 30); expr = `${e} + ${a} ÷ ${b}`; v = e + c; ltr = (e + a) / b; steps = [`${a} ÷ ${b} = ${c}`, `${e} + ${c} = ${v}`]; }
      else if (f === 4) { const a = b * c, e = c + r.int(1, 40); expr = `${e} − ${a} ÷ ${b}`; v = e - c; ltr = (e - a) / b; steps = [`${a} ÷ ${b} = ${c}`, `${e} − ${c} = ${v}`]; }
      else { const a = b * c, d = r.int(2, 9), e = r.int(1, Math.min(30, c * d - 1)); expr = `${a} ÷ ${b} × ${d} − ${e}`; v = c * d - e; ltr = null; steps = [`${a} ÷ ${b} = ${c}（乘除從左到右）`, `${c} × ${d} = ${c * d}`, `${c * d} − ${e} = ${v}`]; }
      const stepsE = steps.map((s) => s.replace('（乘除從左到右）', ' (× and ÷ go left to right)'));
      const warn = ltr !== null && Number.isInteger(ltr) && ltr >= 0 && ltr !== v;
      return {
        q: T(`計算：${expr} = ?`, `Find ${expr}.`), ans: ansNum(v),
        sol: [T('規則：先算乘法和除法，再算加法和減法。', 'Rule: do multiplication and division first, then addition and subtraction.'),
          ...steps.map((s, i) => T(`第 ${i + 1} 步：${s}。`, `Step ${i + 1}: ${stepsE[i]}.`)),
          T(`答案是 ${v}。${warn ? `（如果從左算到右會得到 ${ltr}，那是錯的！）` : ''}`, `The answer is ${v}.${warn ? ` (Going strictly left to right would give ${ltr} — that's wrong!)` : ''}`)],
        hint: T('先乘除，後加減。', 'Multiply and divide before you add and subtract.'),
      };
    },
  },
  {
    id: 'g3-multi-step',
    grade: 3,
    name: T('兩步驟應用問題（加減乘除）', 'Two-step word problems with all four operations'),
    cur: { us: 'CCSS 3.OA.D.8', tw: '三年級 兩步驟問題', aops: 'Beast Academy 3' },
    gen(r) {
      const k = r.int(0, 4), [A, B] = r.sample(NAMES, 2), th = r.pick(THINGS.filter((t) => ['🍎', '🍓', '🍪', '🍬', '🎈'].includes(t.e)));
      if (k === 0) {
        const g = r.int(3, 9), s = r.int(4, 9), e = r.int(2, g * s - 5), v = g * s - e;
        return {
          q: T(`${A[0]}買了 ${g} 盒${th.zh}，每盒 ${s} ${th.cw}，分給同學 ${e} ${th.cw}後，還剩幾${th.cw}？`, `${A[1]} buys ${g} boxes of ${th.en} with ${s} in each box and gives ${e} to classmates. How many are left?`), ans: ansNum(v),
          sol: [T(`第一步：一共有幾${th.cw}？${s} × ${g} = ${g * s}。`, `Step 1: how many in all? ${g} × ${s} = ${g * s}.`), T(`第二步：分掉 ${e} ${th.cw}：${g * s} − ${e} = ${v}。`, `Step 2: give away ${e}: ${g * s} − ${e} = ${v}.`), T(`併式：${s} × ${g} − ${e} = ${v}。還剩 ${v} ${th.cw}。`, `As one expression: ${g} × ${s} − ${e} = ${v}. ${v} are left.`)],
        };
      }
      if (k === 1) {
        const M = r.pick([50, 100, 100, 500]), p = M === 500 ? r.int(15, 60) : r.int(5, 19); let n = r.int(2, 9); while (n * p >= M) n--;
        const c = M - n * p;
        return {
          q: T(`${A[0]}帶了 ${M} 元，買了 ${n} 枝原子筆，每枝 ${p} 元。可以找回幾元？`, `${A[1]} brings $${M} and buys ${n} pens at $${p} each. How much change does ${A[1]} get?`), ans: ansNum(c),
          sol: [T(`第一步：筆一共多少錢？${p} × ${n} = ${n * p} 元。`, `Step 1: cost of the pens: ${n} × ${p} = $${n * p}.`), T(`第二步：找回 ${M} − ${n * p} = ${c} 元。`, `Step 2: change: ${M} − ${n * p} = $${c}.`), T(`併式：${M} − ${p} × ${n} = ${c}（先乘再減）。`, `As one expression: ${M} − ${n} × ${p} = ${c} (multiply first, then subtract).`)],
        };
      }
      if (k === 2) {
        const b = r.int(3, 8), t = r.int(3, 9), n = b * t, c = r.int(2, 4), v = t * c;
        return {
          q: T(`全班有 ${n} 位同學，每 ${b} 人坐一桌。每一桌要放 ${c} 盤點心，一共要準備幾盤點心？`, `A class of ${n} students sits ${b} to a table. Each table gets ${c} plates of snacks. How many plates are needed?`), ans: ansNum(v),
          sol: [T(`第一步：有幾桌？${n} ÷ ${b} = ${t} 桌。`, `Step 1: how many tables? ${n} ÷ ${b} = ${t}.`), T(`第二步：每桌 ${c} 盤：${c} × ${t} = ${v} 盤。`, `Step 2: ${c} plates per table: ${t} × ${c} = ${v}.`), T(`一共要 ${v} 盤點心。`, `${v} plates are needed.`)],
        };
      }
      if (k === 3) {
        const a = r.int(4, 25), m = r.int(2, 5), v = a + a * m;
        return {
          q: T(`${A[0]}有 ${a} 張卡片，${B[0]}的卡片是${A[0]}的 ${m} 倍。兩人一共有幾張卡片？`, `${A[1]} has ${a} cards. ${B[1]} has ${m} times as many as ${A[1]}. How many cards do they have together?`), ans: ansNum(v),
          sol: [T(`第一步：${B[0]}有 ${a} × ${m} = ${a * m} 張。`, `Step 1: ${B[1]} has ${a} × ${m} = ${a * m} cards.`), T(`第二步：一共 ${a} + ${a * m} = ${v} 張。`, `Step 2: together ${a} + ${a * m} = ${v} cards.`), T(`小心：不是 ${a} × ${m} 就結束了，還要加上${A[0]}自己的。`, `Careful: ${a} × ${m} is only ${B[1]}'s cards — add ${A[1]}'s too.`)],
        };
      }
      const d = r.int(20, 90), w = r.int(3, 9), s = r.int(10, d * w - 10), v = d * w - s;
      return {
        q: T(`${A[0]}每個星期存 ${d} 元，存了 ${w} 個星期，然後買玩具花了 ${s} 元。還剩幾元？`, `${A[1]} saves $${d} every week for ${w} weeks, then spends $${s} on a toy. How much money is left?`), ans: ansNum(v),
        sol: [T(`第一步：存了 ${d} × ${w} = ${d * w} 元。`, `Step 1: saved ${w} × ${d} = $${d * w}.`), T(`第二步：花掉 ${s} 元，${d * w} − ${s} = ${v}。`, `Step 2: spend $${s}: ${d * w} − ${s} = ${v}.`), T(`還剩 ${v} 元。`, `$${v} is left.`)],
      };
    },
  },
  {
    id: 'g3-ba-puzzles',
    grade: 3,
    name: T('數學謎題（倒推、周長、神秘數）', 'Puzzles: work backward, perimeter, mystery numbers'),
    cur: { aops: 'Beast Academy 3' },
    gen(r) {
      const k = r.int(0, 3);
      if (k === 0) {
        const x = r.int(2, 12), m = r.int(2, 5), a = r.int(1, 15), f = r.int(0, 2);
        let R, z, e, back;
        if (f === 0) { R = x * m + a; z = `先乘以 ${m}，再加 ${a}`; e = `multiply it by ${m}, then add ${a}`; back = [[`先把加的 ${a} 減回去：${R} − ${a} = ${R - a}`, `Undo the +${a}: ${R} − ${a} = ${R - a}`], [`再把乘以 ${m} 除回去：${R - a} ÷ ${m} = ${x}`, `Undo the ×${m}: ${R - a} ÷ ${m} = ${x}`]]; }
        else if (f === 1) { R = (x + a) * m; z = `先加 ${a}，再乘以 ${m}`; e = `add ${a}, then multiply by ${m}`; back = [[`先把乘以 ${m} 除回去：${R} ÷ ${m} = ${x + a}`, `Undo the ×${m}: ${R} ÷ ${m} = ${x + a}`], [`再把加的 ${a} 減回去：${x + a} − ${a} = ${x}`, `Undo the +${a}: ${x + a} − ${a} = ${x}`]]; }
        else { const aa = Math.min(a, x * m - 1); R = x * m - aa; z = `先乘以 ${m}，再減 ${aa}`; e = `multiply it by ${m}, then subtract ${aa}`; back = [[`先把減的 ${aa} 加回去：${R} + ${aa} = ${R + aa}`, `Undo the −${aa}: ${R} + ${aa} = ${R + aa}`], [`再把乘以 ${m} 除回去：${R + aa} ÷ ${m} = ${x}`, `Undo the ×${m}: ${R + aa} ÷ ${m} = ${x}`]]; }
        return {
          q: T(`我心裡想一個數，${z}，得到 ${R}。我想的數是多少？`, `I'm thinking of a number. I ${e}, and I get ${R}. What is my number?`), ans: ansNum(x),
          sol: [T('倒著做回去：從最後的答案開始，每一步都做「相反的運算」。', 'Work backward: start from the result and undo each step with the opposite operation.'),
            ...back.map(([zz, ee]) => T(zz + '。', ee + '.')), T(`我想的數是 ${x}。`, `My number is ${x}.`)],
        };
      }
      if (k === 1) {
        const n = r.int(2, 5), s = r.int(2, 9), P = 2 * (n * s + s), askS = r.chance(0.5), on = new Set(range(0, n - 1).map((i) => i + ',0'));
        return {
          q: askS ? T(`${n} 個一樣大的正方形排成一排，拼成一個長方形。這個長方形的周長是 ${P} 公分，每個正方形的邊長是幾公分？`, `${n} equal squares are put in a row to make a rectangle. The rectangle's perimeter is ${P} cm. What is the side length of each square?`)
            : T(`${n} 個邊長 ${s} 公分的正方形排成一排，拼成一個長方形。這個長方形的周長是幾公分？`, `${n} squares, each with sides of ${s} cm, are put in a row to make a rectangle. What is the rectangle's perimeter?`),
          fig: cellFig(n, 1, on), ans: ansNum(askS ? s : P),
          sol: [T(`沿著外圍數一數有幾條正方形的邊：上面 ${n} 條、下面 ${n} 條、左右各 1 條，共 ${2 * n + 2} 條。`, `Count the square sides around the outside: ${n} on top, ${n} on the bottom and 1 on each end — ${2 * n + 2} sides.`),
            askS ? T(`${2 * n + 2} 條邊一共 ${P} 公分，每條邊 = ${P} ÷ ${2 * n + 2} = ${s} 公分。`, `${2 * n + 2} sides make ${P} cm, so each side is ${P} ÷ ${2 * n + 2} = ${s} cm.`)
              : T(`每條 ${s} 公分：${2 * n + 2} × ${s} = ${P} 公分。`, `Each is ${s} cm: ${2 * n + 2} × ${s} = ${P} cm.`),
            T('注意：中間拼在一起的邊在裡面，不算周長。', 'Notice: the sides where squares touch are inside, so they are not part of the perimeter.'),
            T(`答案是 ${askS ? s : P}${askS ? ' 公分' : ' 公分'}。`, `The answer is ${askS ? s : P} cm.`)],
        };
      }
      if (k === 2) {
        let L, m, par, list;
        do { L = r.int(2, 8) * 10; m = r.pick([3, 4, 6, 7, 8, 9]); par = r.int(0, 1); list = range(L + 1, L + 29).filter((x) => x % m === 0 && x % 2 === par); } while (list.length !== 1);
        const all = range(L + 1, L + 29).filter((x) => x % m === 0), v = list[0];
        return {
          q: T(`神秘數：我比 ${L} 大，比 ${L + 30} 小。我是 ${m} 的倍數，而且我是${par ? '奇數' : '偶數'}。我是多少？`, `Mystery number: I am greater than ${L} and less than ${L + 30}. I am a multiple of ${m}, and I am ${par ? 'odd' : 'even'}. What am I?`),
          ans: ansNum(v),
          sol: [T(`先列出 ${L} 和 ${L + 30} 之間 ${m} 的倍數：${all.join('、')}。`, `List the multiples of ${m} between ${L} and ${L + 30}: ${all.join(', ')}.`),
            T(`再挑${par ? '奇數（個位是 1、3、5、7、9）' : '偶數（個位是 0、2、4、6、8）'}：只有 ${v}。`, `Now keep the ${par ? 'odd' : 'even'} one: only ${v}.`),
            T(`我是 ${v}。`, `I am ${v}.`)],
        };
      }
      const dd = r.int(2, 9), plus = r.chance(0.6), N = plus ? 12 * dd : 10 * dd;
      const tries = range(1, dd).map((x) => `${11 * x} ${plus ? '+' : '−'} ${x} = ${plus ? 12 * x : 10 * x}`);
      return {
        q: T(`每個 □ 都是同一個數字：□□ ${plus ? '+' : '−'} □ = ${N}。□ 是多少？`, `Every □ is the same digit: □□ ${plus ? '+' : '−'} □ = ${N}. What is □?`), ans: ansNum(dd),
        sol: [T(`□□ 是一個二位數，例如 □ = 3 時，□□ 是 33。`, `□□ is a two-digit number; for example if □ = 3, then □□ is 33.`),
          T(`一個一個試：${tries.join('；')}。`, `Try them in order: ${tries.join('; ')}.`),
          T(`□ = ${dd} 時剛好是 ${N}：${11 * dd} ${plus ? '+' : '−'} ${dd} = ${N}。`, `□ = ${dd} works: ${11 * dd} ${plus ? '+' : '−'} ${dd} = ${N}.`),
          T(`發現規律了嗎？□□ ${plus ? '+' : '−'} □ 總是 □ 的 ${plus ? 12 : 10} 倍。`, `See the pattern? □□ ${plus ? '+' : '−'} □ is always ${plus ? 12 : 10} times □.`)],
      };
    },
  },
  {
    id: 'g3-mult-patterns',
    grade: 3,
    name: T('乘法表的規律', 'Patterns in the multiplication table'),
    cur: { us: 'CCSS 3.OA.D.9', tw: '三年級 乘法', aops: 'Beast Academy 3' },
    gen(r) {
      const k = r.int(0, 3);
      if (k === 0) {
        const a = r.int(2, 7), b = r.int(2, 7), i = r.int(0, 2), j = r.int(0, 2), R = a + i, Cc = b + j, v = R * Cc;
        const cells = [['×', String(b), String(b + 1), String(b + 2)], ...[0, 1, 2].map((ii) => [String(a + ii), ...[0, 1, 2].map((jj) => (ii === i && jj === j ? '?' : String((a + ii) * (b + jj))))])];
        const nb = j > 0 ? (a + i) * (b + j - 1) : (a + i) * (b + j + 1);
        return {
          q: T('這是乘法表的一部分。? 是多少？', 'This is part of the multiplication table. What number is ?'), fig: table(cells, true), ans: ansNum(v),
          sol: [T(`? 在 ${R} 那一橫行、${Cc} 那一直行，所以是 ${R} × ${Cc}。`, `The ? is in row ${R} and column ${Cc}, so it is ${R} × ${Cc}.`),
            T(`${R} × ${Cc} = ${v}。`, `${R} × ${Cc} = ${v}.`),
            T(`看規律檢查：同一橫行每次多 ${R}。旁邊是 ${nb}，${nb} ${j > 0 ? '+' : '−'} ${R} = ${v} ✔`, `Check with the pattern: across a row, each number goes up by ${R}. The neighbor is ${nb}, and ${nb} ${j > 0 ? '+' : '−'} ${R} = ${v} ✔`)],
        };
      }
      if (k === 1) {
        const a = r.int(3, 9), b = r.int(3, 9), up = r.chance(0.6), b2 = up ? b + 1 : b - 1, v = a * b2;
        return {
          q: T(`已經知道 ${a} × ${b} = ${a * b}。那麼 ${a} × ${b2} 是多少？`, `You know ${a} × ${b} = ${a * b}. What is ${a} × ${b2}?`), ans: ansNum(v),
          sol: [T(`${a} × ${b} 是 ${b} 個 ${a}，${a} × ${b2} 是 ${b2} 個 ${a}。`, `${a} × ${b} is ${b} groups of ${a}; ${a} × ${b2} is ${b2} groups of ${a}.`),
            T(`${up ? '多' : '少'}了一個 ${a}：${a * b} ${up ? '+' : '−'} ${a} = ${v}。`, `That's one ${up ? 'more' : 'fewer'} group of ${a}: ${a * b} ${up ? '+' : '−'} ${a} = ${v}.`),
            T(`答案是 ${v}。`, `The answer is ${v}.`)],
        };
      }
      if (k === 2) {
        const odd = () => r.pick([3, 5, 7, 9]), even = () => r.pick([2, 4, 6, 8]);
        const right = `${odd()} × ${odd()}`, wr = uniq([`${even()} × ${odd()}`, `${odd()} × ${even()}`, `${even()} × ${even()}`, `${odd()} × ${even()}`, `${even()} × ${odd()}`]).filter((x) => x !== right).slice(0, 3);
        const [p, q] = right.split(' × ').map(Number);
        return {
          q: T('不用算出來，哪一個乘積是奇數？', 'Without multiplying it out, which product is odd?'), ans: ansChoice([right, ...wr]),
          sol: [T('只要有一個數是偶數，乘起來就是偶數（因為可以兩個兩個分組）。', 'If either number is even, the product is even (it can be split into pairs).'),
            T('只有「奇數 × 奇數」才會是奇數。', 'Only odd × odd gives an odd product.'),
            T(`${right} 兩個都是奇數：${p} × ${q} = ${p * q}，是奇數 ✔`, `${right} uses two odd numbers: ${p} × ${q} = ${p * q}, which is odd ✔`)],
        };
      }
      const n = r.int(2, 10), v = 9 * n, askT = r.chance(0.5);
      return {
        q: T(`9 的乘法有一個規律：十位數字比乘的數少 1，兩個數字加起來是 9。9 × ${n} 的${askT ? '十位' : '個位'}數字是多少？`, `The 9s have a pattern: the tens digit is 1 less than the number you multiply by, and the two digits add to 9. What is the ${askT ? 'tens' : 'ones'} digit of 9 × ${n}?`),
        ans: ansNum(askT ? Math.floor(v / 10) : v % 10),
        sol: [T(`十位數字：${n} − 1 = ${n - 1}。`, `Tens digit: ${n} − 1 = ${n - 1}.`), T(`個位數字：9 − ${n - 1} = ${10 - n}。`, `Ones digit: 9 − ${n - 1} = ${10 - n}.`), T(`所以 9 × ${n} = ${v}，${askT ? '十位' : '個位'}數字是 ${askT ? n - 1 : 10 - n}。`, `So 9 × ${n} = ${v}, and the ${askT ? 'tens' : 'ones'} digit is ${askT ? n - 1 : 10 - n}.`)],
      };
    },
  },
];

export default [...G1, ...G2, ...G3];
