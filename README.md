# 數學練功房 Math Dojo

**Play:** https://ywchen0711.github.io/math-dojo/

Math practice for kids from grade 1 to grade 12, in Traditional Chinese and English. 一到十二年級的數學練習，中英雙語。

- **224 topics**, sorted by grade. Every topic is a question generator: each question has new numbers and often a new
  situation, so the bank never runs out.
- **Three curricula** (top-right menu): US Common Core, Taiwan's 108 curriculum (國小・國中・高中) and the Art of
  Problem Solving path (Beast Academy, Prealgebra, Algebra, Number Theory, Counting & Probability, Geometry, Precalculus,
  Calculus, MATHCOUNTS / AMC 8 / 10 / 12 style). A topic appears in the grade where each curriculum teaches it
  (for example quadratic equations: Taiwan grade 8, US grade 9). "All curricula" lists everything.
- **Step-by-step solutions** with the actual numbers for every question, in both languages.
- **Practice** one topic: two tries per question (a hint after the first miss), then the worked solution. Stars per topic.
- **Mixed quiz**: 10 questions from the grade, results with every solution.
- **Worksheet**: 20 printable questions with an answer key on its own page.
- Typed answers accept whole numbers, decimals, fractions (3/4), mixed numbers (1 1/2), roots (2√3), π (3π),
  powers (2^5), lists ("2, -5") and points ("(1, 2)"). Fractions that must be in lowest terms say so.
- Progress is saved only in the browser (localStorage).

## Files
```
index.html, style.css
js/app.js          pages: grades, topic list, practice, quiz, worksheet
js/util.js         random numbers, bilingual text, fractions, roots, polynomials, answer builders
js/check.js        reads a typed answer and compares it with the right value
js/draw.js         SVG pictures: clock, counting dots, number line, fraction bars, shapes, charts, coordinate grid
js/bank/g01-03.js  grades 1–3 (53 topics)
js/bank/g04-06.js  grades 4–6 (53 topics)
js/bank/g07-09.js  grades 7–9 (57 topics)
js/bank/g10-12.js  grades 10–12 (61 topics)
js/bank/_example.js two example topics showing the format (not loaded)
SPEC.md            how to write a topic
test/run.mjs       node test/run.mjs — draws 400 questions per topic and checks text, answers and choices
```
