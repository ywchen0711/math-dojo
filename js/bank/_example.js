// An example of the topic format (not loaded by the site). See SPEC.md.
import { T, frac, fracR, red, lcm, ansFrac, ansChoice, num } from '../util.js';
import { fracBar } from '../draw.js';

export default [
  {
    id: 'g5-frac-add-unlike',
    grade: 5,
    name: T('異分母分數加法', 'Adding fractions with unlike denominators'),
    cur: { us: 'CCSS 5.NF.A.1', tw: '五年級 異分母分數的加減', aops: 'Beast Academy 5' },
    gen(r) {
      const b = r.pick([2, 3, 4, 5, 6, 8]); let d;
      do d = r.pick([2, 3, 4, 5, 6, 8, 10, 12]); while (d === b);
      const a = r.int(1, b - 1), c = r.int(1, d - 1), L = lcm(b, d);
      const A = a * (L / b), Cc = c * (L / d), [n, m] = red(A + Cc, L);
      const story = r.chance(0.5);
      const name = r.pick([['小明', 'Max'], ['小美', 'Mia'], ['阿傑', 'Jay']]);
      const q = story
        ? T(`${name[0]}早上喝了 ${frac(a, b)} 公升的水，下午又喝了 ${frac(c, d)} 公升。一共喝了多少公升？（用最簡分數回答）`,
            `${name[1]} drank ${frac(a, b)} liter of water in the morning and ${frac(c, d)} liter in the afternoon. How many liters in all? (Answer in lowest terms.)`)
        : T(`計算 ${frac(a, b)} + ${frac(c, d)}（用最簡分數回答）`, `Find ${frac(a, b)} + ${frac(c, d)}. (Answer in lowest terms.)`);
      return {
        q, fig: story ? '' : fracBar(a, b, 240) + fracBar(c, d, 240),
        ans: ansFrac(n, m),
        sol: [
          T(`分母不同，不能直接相加。先找 ${b} 和 ${d} 的最小公倍數：${L}。`, `The denominators are different, so we can't add yet. Find the least common multiple of ${b} and ${d}: ${L}.`),
          T(`通分：${frac(a, b)} = ${frac(A, L)}，${frac(c, d)} = ${frac(Cc, L)}。`, `Rewrite both with denominator ${L}: ${frac(a, b)} = ${frac(A, L)} and ${frac(c, d)} = ${frac(Cc, L)}.`),
          T(`分子相加：${frac(A, L)} + ${frac(Cc, L)} = ${frac(A + Cc, L)}。`, `Add the numerators: ${frac(A, L)} + ${frac(Cc, L)} = ${frac(A + Cc, L)}.`),
          T(`約分得到 ${fracR(n, m)}。`, `Reduce: the answer is ${fracR(n, m)}.`),
        ],
        hint: T('先通分，讓分母一樣。', 'Make the denominators the same first.'),
      };
    },
  },
  {
    id: 'g5-frac-compare',
    grade: 5,
    name: T('比較分數大小', 'Comparing fractions'),
    cur: { us: 'CCSS 4.NF.A.2', tw: '四年級 分數的大小比較' },
    at: { us: 4, tw: 4 },
    gen(r) {
      let a, b, c, d;
      do { b = r.int(2, 12); d = r.int(2, 12); a = r.int(1, b - 1); c = r.int(1, d - 1); } while (a * d === b * c);
      const big = a * d > b * c ? [a, b] : [c, d];
      return {
        q: T(`哪一個比較大？`, `Which is larger?`),
        ans: ansChoice([frac(...big), big[0] === a && big[1] === b ? frac(c, d) : frac(a, b), T('一樣大', 'They are equal')]),
        sol: [
          T(`交叉相乘比較：${a} × ${d} = ${num(a * d)}，${c} × ${b} = ${num(c * b)}。`, `Cross-multiply: ${a} × ${d} = ${num(a * d)} and ${c} × ${b} = ${num(c * b)}.`),
          T(`所以 ${frac(...big)} 比較大。`, `So ${frac(...big)} is larger.`),
        ],
      };
    },
  },
];
