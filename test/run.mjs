// Checks every question generator: node test/run.mjs [bank file …]   (default: all of js/bank/g*.js)
// For each topic, draws 400 questions and checks the text in both languages, that the stated answer passes the
// answer checker, that choices are distinct, and that the numbers vary from draw to draw.
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { rng } from '../js/util.js';
import { check } from '../js/check.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const files = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(path.join(root, 'js/bank')).filter((f) => /^g.*\.js$/.test(f)).map((f) => path.join(root, 'js/bank', f));
const bad = (s) => typeof s !== 'string' || !s.trim() || /undefined|NaN|\[object|Infinity|null/.test(s.replace(/<[^>]*>/g, ''));
const txt = (x) => (typeof x === 'string' ? [x, x] : x && typeof x === 'object' ? [x.zh, x.en] : [undefined, undefined]);
const ids = new Set();
let errs = 0, topics = 0, perGrade = {};
const fail = (id, seed, msg) => { if (errs++ < 60) console.log(`✗ ${id} seed ${seed}: ${msg}`); };

for (const f of files) {
  const bank = (await import(pathToFileURL(path.resolve(f)).href)).default;
  for (const tp of bank) {
    topics++;
    const id = tp.id;
    if (!id || ids.has(id)) fail(id, '-', 'missing or duplicate id'); ids.add(id);
    if (!(tp.grade >= 1 && tp.grade <= 12)) fail(id, '-', 'bad grade');
    if (txt(tp.name).some(bad)) fail(id, '-', 'bad name');
    const cur = Object.keys(tp.cur || {});
    if (!cur.length || cur.some((c) => !['us', 'tw', 'aops'].includes(c)) || cur.some((c) => txt(tp.cur[c]).some(bad))) fail(id, '-', 'bad cur');
    for (const c of cur) { const g = tp.at?.[c] ?? tp.grade; perGrade[c + g] = (perGrade[c + g] || 0) + 1; }
    const seen = new Set();
    for (let seed = 1; seed <= 400; seed++) {
      let q;
      try { q = tp.gen(rng(seed * 7919 + 13)); } catch (e) { fail(id, seed, 'throws ' + e.message); continue; }
      const [qz, qe] = txt(q.q);
      if (bad(qz) || bad(qe)) { fail(id, seed, 'bad question text: ' + JSON.stringify(q.q).slice(0, 200)); continue; }
      if (typeof q.q === 'object' && /[一-鿿]/.test(qe.replace(/<[^>]*>/g, ''))) fail(id, seed, 'Chinese in English text: ' + qe.slice(0, 120));
      seen.add(qe + JSON.stringify(q.ans) + (q.fig || ""));
      if (!Array.isArray(q.sol) || q.sol.length < 2) fail(id, seed, 'solution needs 2+ steps');
      else for (const st of q.sol) { const [a, b] = txt(st); if (bad(a) || bad(b)) { fail(id, seed, 'bad solution step ' + JSON.stringify(st).slice(0, 160)); break; } }
      const a = q.ans;
      if (!a) { fail(id, seed, 'no answer'); continue; }
      if (a.type === 'choice') {
        if (!Array.isArray(a.options) || a.options.length < 2 || a.options.length > 6) fail(id, seed, 'choice needs 2–6 options');
        else if (new Set(a.options.map((o) => JSON.stringify(o))).size !== a.options.length) fail(id, seed, 'duplicate options ' + JSON.stringify(a.options));
        else if (a.options.some((o) => txt(o).some(bad))) fail(id, seed, 'bad option ' + JSON.stringify(a.options));
        if (a.correct !== 0) fail(id, seed, 'correct must be 0');
      } else if (['num', 'set', 'pair', 'text'].includes(a.type)) {
        const vs = a.type === 'num' ? [a.v] : a.type === 'text' ? [] : a.v;
        if (vs.some((v) => !Number.isFinite(v))) fail(id, seed, 'answer value not finite ' + JSON.stringify(a));
        else if (bad(a.text) || !check(a, a.text).ok) fail(id, seed, `answer text "${a.text}" does not pass the checker for ${JSON.stringify(a.v)}`);
      } else fail(id, seed, 'unknown answer type ' + a.type);
    }
    if (seen.size < 12) fail(id, '-', `only ${seen.size} different questions in 400 draws`);
  }
}
console.log(`${topics} topics, ${errs} problems`);
console.log(Object.entries(perGrade).sort().map(([k, v]) => `${k}:${v}`).join(' '));
process.exit(errs ? 1 : 0);
