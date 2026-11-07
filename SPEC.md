# Question bank spec (for whoever writes js/bank/gNN-NN.js)

The site is a math practice app for kids, grades 1–12, in Traditional Chinese (繁體中文, Taiwan usage) and English.
Every question is **generated** from random numbers, so each topic is an endless bank. Each comes with a
**detailed step-by-step solution** that a child can learn from.

## Files
- `js/util.js` — rng, `T(zh, en)`, fractions, roots, polynomial formatting, answer builders. **Read it first.**
- `js/draw.js` — SVG pictures: clock, dots (emoji counting), numberLine, fracBar, pie, rect, shape, rightTri, circle, bars, grid.
  You may add private SVG helpers inside your own bank file (use the classes f-soft, f-line, f-acc, f-accfill, f-dot, f-txt, f-acctxt, f-grid).
- `js/check.js` — how typed answers are checked (evaluates "3/4", "1 1/2", "2√3", "3π", "x = 5", lists "2, -3", pairs "(1, 2)").
- `js/bank/_example.js` — **two complete example topics. Copy this style.**
- `test/run.mjs` — `node test/run.mjs js/bank/yourfile.js` must print `0 problems`.

## A topic
```js
{
  id: 'g7-two-step-eq',          // unique, starts with g<grade>-
  grade: 7,                       // decides which file it lives in, and its grade in the "all curricula" view
  name: T('二步驟方程式', 'Two-step equations'),
  cur: {                          // which curricula teach it; each value is a short label shown to the user
    us: 'CCSS 7.EE.B.4',          //   US Common Core (HS: Algebra 1 / Geometry / Algebra 2 / Precalculus / Calculus)
    tw: '七年級 一元一次方程式',     //   Taiwan 108 curriculum (國小/國中/高中; label with grade + unit name)
    aops: 'Prealgebra',           //   Art of Problem Solving (Beast Academy 1–5, Prealgebra, Intro Algebra, Intro Counting & Probability,
  },                              //   Intro Number Theory, Intro Geometry, Intermediate Algebra, Intermediate C&P, Precalculus, Calculus;
                                  //   also MATHCOUNTS / AMC 8 / AMC 10 / AMC 12 style)
  at: { tw: 8 },                  // optional: grade in a curriculum when it differs from `grade`
  gen(r) { return { q, fig?, ans, sol, hint? }; },
}
```
Only put a curriculum in `cur` if that curriculum really teaches the topic (at about that grade). Only cite a CCSS code
if you are sure of it; otherwise use a unit name ("Grade 4 · Fractions"). For Taiwan use grade + unit name, e.g.
`四年級 分數`, `八年級 乘法公式`, `高一 指數與對數`, `高三 數甲 微積分`. Taiwan grade numbers: 國一 = 7, 高一 = 10.
AoPS-only topics (competition flavor: digit puzzles, counting tricks, modular arithmetic, telescoping, Vieta…)
are welcome and important — tag them with `cur: { aops: 'Intro Number Theory' }` (or `'AMC 8'` etc.).

## gen(r) returns
- `q`: `T(zh, en)` — the question. HTML allowed (use `frac`, `pow`, `sqrt`, `poly`, `num` … from util.js).
  English text must contain no Chinese characters.
- `fig` (optional): an HTML/SVG string shown under the question (from draw.js), language-neutral.
- `ans`, one of:
  - `ansNum(v, text?)` — a number. `v` number or fraction `[n, d]`; `text` is what a student would type (default made for you).
  - `ansFrac(n, d)` — a fraction that must be in lowest terms.
  - `ansSet([v1, v2], text?)` — several numbers in any order (roots of an equation…). Say "separate with commas / 用逗號隔開".
  - `ansPair(x, y)` — an ordered pair (solution of a system, a point). Say "answer as (x, y)".
  - `ansChoice([right, wrong1, wrong2, wrong3])` — multiple choice, **right answer first** (the app shuffles). Options are
    strings (HTML ok) or `T(zh, en)`. They must all be different. Use this for expressions, factored forms, true/false,
    shapes, comparisons, anything that isn't a single number. Make the wrong options the *mistakes kids really make*.
  - `{ type: 'num', v, text, tol }` — `tol` for rounded answers ("round to the nearest tenth": tol 0.05 is wrong — instead
    give the exact rounded value and tol 1e-9; use tol only for things like "to 2 decimal places" with value already rounded).
  The question must tell the student the expected form when it matters ("用最簡分數", "in simplest radical form",
  "leave your answer in terms of π", "round to the nearest hundredth").
  **The answer must be computed from the same numbers as the question. Double-check your math.**
- `sol`: array of 3–6 `T(zh, en)` steps, a real worked solution with the actual numbers: what to notice, the method, each
  computation, the answer, and where useful a check ("驗算 / Check: …"). Write for a child of that grade — short
  sentences, friendly, explain *why*. Not "the answer is 7".
- `hint` (optional): `T(zh, en)` a one-line nudge shown before answering.

## Quality bar
- Every topic must vary a lot: random numbers **and** several templates (bare computation, word problem with names /
  objects / money / sports, "find the missing number", reverse questions). Aim for ≥ 3 templates in most topics.
- Names in word problems: mix (zh/en pairs) e.g. 小明/Max, 小美/Mia, 阿傑/Jay, 欣怡/Emma, 志豪/Leo, 雅婷/Ava …
  Money: Chinese says 元, English says dollars ($) — keep the same numbers.
- Keep numbers grade-appropriate and answers "nice" (integers or simple fractions unless the topic is about decimals).
- Avoid degenerate cases (coefficient 0 or 1 where it looks odd, x = 0 every time, dividing by zero, negative lengths).
- Use the real minus sign − in display (util's `num`, `poly`, `sgn`, `par` do this). Typed answer text uses "-".
- Traditional Chinese only (數學, 計算, 長方形, 鉛筆…), Taiwan terms (公分, 公尺, 公斤, 公升, 元; 最簡分數, 因式分解, 一元二次方程式, 斜率…).
- ES module, `export default [ ...topics ]`, import only from '../util.js' and '../draw.js'. No other dependencies.
- Run the test until it prints `0 problems`, then also eyeball ~5 generated questions per topic (print them with a small
  node script) to make sure the wording, the numbers and the solution agree.
