// Math Dojo: pick a curriculum and a grade, then practice one topic (endless), take a 10-question mixed quiz, or
// print a worksheet with an answer key. Pages are hash routes: #/  #/g/5  #/p/<topic>  #/quiz/5  #/print/<topic|g5>
import BANK from './bank/index.js';
import { rng, tx } from './util.js';
import { check } from './check.js';

const $ = (s, el = document) => el.querySelector(s);
const app = $('#app');
const store = {
  get(k, d) { try { const v = localStorage.getItem('md-' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('md-' + k, JSON.stringify(v)); } catch {} },
};
let lang = store.get('lang', (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en');
let cur = store.get('cur', 'all');
const stats = store.get('stats', {});
const L = (zh, en) => (lang === 'zh' ? zh : en);
const X = (x) => tx(x, lang);

const CURS = {
  all: ['全部課綱', 'All curricula'],
  us: ['美國 Common Core', 'US Common Core'],
  tw: ['台灣 108 課綱', 'Taiwan 108 Curriculum'],
  aops: ['AoPS 資優數學', 'AoPS (Art of Problem Solving)'],
};
const CUR_SHORT = { us: ['美國', 'US'], tw: ['台灣', 'TW'], aops: ['AoPS', 'AoPS'] };
const ZH_N = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
function gradeName(g, c = cur) {
  if (lang === 'en') return c === 'tw' ? (g <= 6 ? `Elementary ${g}` : g <= 9 ? `Junior High ${g - 6}` : `Senior High ${g - 9}`) + ` (G${g})` : `Grade ${g}`;
  if (c === 'tw') return g <= 6 ? `國小${ZH_N[g]}年級` : g <= 9 ? `國${ZH_N[g - 6]}（${ZH_N[g]}年級）` : `高${ZH_N[g - 9]}（${ZH_N[g]}年級）`;
  return `${ZH_N[g]}年級`;
}
const gradeOf = (tp, c = cur) => (c === 'all' ? tp.grade : tp.at?.[c] ?? tp.grade);
const topicsFor = (g, c = cur) => BANK.filter((tp) => (c === 'all' || tp.cur[c]) && gradeOf(tp, c) === g);
const byId = (id) => BANK.find((tp) => tp.id === id);
const newSeed = () => (Math.random() * 2 ** 31) >>> 0;
const draw = (tp, seed) => ({ ...tp.gen(rng(seed)), tp, seed });

function stars(id) {
  const s = stats[id]; if (!s) return 0;
  const [n, ok] = s;
  return ok >= 25 && ok / n >= 0.8 ? 3 : ok >= 10 ? 2 : ok >= 3 ? 1 : 0;
}
const starHTML = (k) => `<span class="stars">${'★'.repeat(k)}<i>${'★'.repeat(3 - k)}</i></span>`;
function record(id, ok) { const s = (stats[id] ||= [0, 0]); s[0]++; if (ok) s[1]++; store.set('stats', stats); }

// ---------- header ----------
function header() {
  $('.bt').innerHTML = `<b>${L('數學練功房', 'Math Dojo')}</b><small>${L('1–12 年級 · 隨機出題 · 詳細解答', 'Grades 1–12 · endless questions · worked solutions')}</small>`;
  $('#lang').textContent = lang === 'zh' ? 'EN' : '中文';
  $('#cur').innerHTML = Object.entries(CURS).map(([k, v]) => `<option value="${k}" ${k === cur ? 'selected' : ''}>${L(...v)}</option>`).join('');
  document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
  document.title = L('數學練功房 Math Dojo', 'Math Dojo 數學練功房');
  $('#foot').innerHTML = L(`共 ${BANK.length} 個單元，每個單元的題目都由程式隨機產生，數字每次不同。進度只存在這台裝置的瀏覽器裡。`,
    `${BANK.length} topics. Every question is generated with new numbers each time. Progress is saved only in this browser.`);
}
// switching language keeps the current question / quiz (relang is set by those pages)
let relang = null;
$('#lang').onclick = () => { lang = lang === 'zh' ? 'en' : 'zh'; store.set('lang', lang); header(); relang ? relang() : route(); };
$('#cur').onchange = (e) => { cur = e.target.value; store.set('cur', cur); header(); route(); };

// ---------- pages ----------
function home() {
  const curNote = {
    all: L('依照年級列出所有單元。也可以在右上角選擇課綱：美國、台灣或 AoPS。', 'All topics by grade. Pick a curriculum at the top right: US, Taiwan or AoPS.'),
    us: L('美國 Common Core 州共同核心標準：K–8 每個年級，高中為代數一、幾何、代數二、微積分預備與微積分。', 'US Common Core State Standards: each grade K–8, then Algebra 1, Geometry, Algebra 2, Precalculus and Calculus.'),
    tw: L('台灣十二年國教 108 課綱：國小一到六年級、國中七到九年級、高中十到十二年級。', 'Taiwan’s 108 curriculum: elementary grades 1–6, junior high 7–9, senior high 10–12.'),
    aops: L('Art of Problem Solving 資優數學路線：Beast Academy、Prealgebra、代數、數論、計數與機率、幾何，以及 MATHCOUNTS、AMC 8/10/12 風格的題目。', 'The Art of Problem Solving path: Beast Academy, Prealgebra, Algebra, Number Theory, Counting & Probability, Geometry, plus MATHCOUNTS and AMC 8/10/12-style problems.'),
  }[cur];
  let h = `<section class="hero"><h1>${L('今天想練哪一年級？', 'Which grade today?')}</h1><p>${curNote}</p></section><div class="grades">`;
  for (let g = 1; g <= 12; g++) {
    const tps = topicsFor(g), done = tps.reduce((s, tp) => s + stars(tp.id), 0), max = tps.length * 3;
    const band = g <= 3 ? 'b1' : g <= 6 ? 'b2' : g <= 9 ? 'b3' : 'b4';
    h += `<a class="gcard ${band}" href="#/g/${g}"><span class="gn">${g}</span><span class="gl">${gradeName(g)}</span><span class="gc">${L(`${tps.length} 個單元`, `${tps.length} topics`)}</span>
      <span class="bar"><i style="width:${max ? (100 * done) / max : 0}%"></i></span></a>`;
  }
  app.innerHTML = h + '</div>';
}

function grade(g) {
  const tps = topicsFor(g);
  let h = `<nav class="crumb"><a href="#/">← ${L('所有年級', 'All grades')}</a></nav>
    <section class="ghead"><h1>${gradeName(g)}</h1><span class="cur-tag">${L(...CURS[cur])}</span>
    <div class="acts"><a class="btn big" href="#/quiz/${g}">🎯 ${L('綜合測驗 10 題', 'Mixed quiz · 10 questions')}</a>
    <a class="btn ghost" href="#/print/g${g}">🖨️ ${L('列印學習單', 'Print a worksheet')}</a></div></section>`;
  if (!tps.length) h += `<p class="empty">${L('這個課綱在這個年級沒有單元。換一個課綱看看？', 'No topics for this grade in this curriculum. Try another one?')}</p>`;
  h += '<div class="topics">' + tps.map((tp) => {
    const s = stats[tp.id];
    const tags = Object.keys(tp.cur).map((c) => `<span class="tag t-${c}" title="${X(tp.cur[c]).replace(/"/g, '')}">${L(...CUR_SHORT[c])} · ${X(tp.cur[c])}</span>`).join('');
    return `<a class="topic" href="#/p/${tp.id}"><span class="tn">${X(tp.name)}</span>${starHTML(stars(tp.id))}
      <span class="tags">${tags}</span><span class="ts">${s ? L(`答對 ${s[1]} / ${s[0]} 題`, `${s[1]} / ${s[0]} correct`) : L('還沒練習', 'Not started')}</span></a>`;
  }).join('') + '</div>';
  app.innerHTML = h;
}

// the question card; onDone(ok, given) after the last try
function card(q, el, { tries = 2, onDone, quiz = false } = {}) {
  let left = tries, finished = false;
  const a = q.ans;
  const opts = a.type === 'choice' ? rng(q.seed ^ 0x5bd1e995).shuffle(a.options.map((o, i) => ({ o, i }))) : null;
  el.innerHTML = `<div class="q">${X(q.q)}</div>${q.fig ? `<div class="figs">${q.fig}</div>` : ''}
    ${opts ? `<div class="choices">${opts.map((x, k) => `<button class="ch" data-i="${x.i}"><b>${'ABCDEF'[k]}</b><span>${X(x.o)}</span></button>`).join('')}</div>`
      : `<form class="ansrow" autocomplete="off"><input id="ans" type="text" inputmode="text" spellcheck="false" placeholder="${L('輸入答案', 'Your answer')}" aria-label="answer">
        <button class="btn" type="submit">${L('送出', 'Check')}</button></form>
        <div class="keys">${keysFor(q.tp.grade).map((k) => `<button type="button" class="key" data-k="${k}">${k === '-' ? '−' : k}</button>`).join('')}
        <span class="fmt">${q.tp.grade <= 3 ? L('分數寫成 3/4', 'write fractions as 3/4') : q.tp.grade <= 6 ? L('分數 3/4　帶分數 1 1/2', 'fraction 3/4 · mixed 1 1/2') : L('分數 3/4　帶分數 1 1/2　根號 2√3　多個答案用逗號', 'fraction 3/4 · mixed 1 1/2 · root 2√3 · several answers: commas')}</span></div>`}
    <div class="fb" aria-live="polite"></div>${q.hint && !quiz ? `<button class="link hintb">💡 ${L('提示', 'Hint')}</button>` : ''}
    <div class="sol" hidden></div>`;
  const fb = $('.fb', el), solEl = $('.sol', el);
  const showSol = () => {
    solEl.hidden = false;
    solEl.innerHTML = `<h3>📖 ${L('詳細解答', 'Step-by-step solution')}</h3><ol>${q.sol.map((s) => `<li>${X(s)}</li>`).join('')}</ol>
      <p class="ansline">${L('答案', 'Answer')}：<b>${answerHTML(q)}</b></p>`;
    $('h3', solEl).onclick = () => solEl.classList.remove('fold');
  };
  const end = (ok, given) => {
    finished = true;
    el.querySelectorAll('input,.ch,.key,.ansrow button').forEach((b) => (b.disabled = true));
    if (opts) el.querySelectorAll('.ch').forEach((b) => { if (+b.dataset.i === a.correct) b.classList.add('right'); });
    if (!quiz) { record(q.tp.id, ok); showSol(); if (ok) solEl.classList.add('fold'); }
    onDone?.(ok, given);
  };
  const judge = (given, btn) => {
    if (finished) return;
    const r = check(a, given);
    if (r.ok) { fb.className = 'fb ok'; fb.innerHTML = `✅ ${L(pick(['答對了！', '太棒了！', '完全正確！', '好厲害！']), pick(['Correct!', 'Great job!', 'Exactly right!', 'Nice work!']))}`; btn?.classList.add('right'); return end(true, given); }
    left--; btn?.classList.add('wrong'); if (btn) btn.disabled = true;
    if (left > 0 && !quiz) {
      fb.className = 'fb no';
      fb.innerHTML = `🤔 ${r.note ? X(r.note) : L('不太對，再想一次！', 'Not quite — try once more!')}${q.hint ? ` <span class="h">💡 ${X(q.hint)}</span>` : ''}`;
      $('#ans', el)?.select();
      return;
    }
    fb.className = 'fb no';
    fb.innerHTML = quiz ? '' : `❌ ${r.note ? X(r.note) + ' ' : ''}${L('沒關係，看看詳解怎麼做。', 'That’s OK — see how it’s done below.')}`;
    end(false, given);
  };
  if (opts) el.querySelectorAll('.ch').forEach((b) => (b.onclick = () => judge(+b.dataset.i, b)));
  else {
    const inp = $('#ans', el);
    $('.ansrow', el).onsubmit = (e) => { e.preventDefault(); if (inp.value.trim()) judge(inp.value); };
    el.querySelectorAll('.key').forEach((b) => (b.onclick = () => {
      const k = b.dataset.k, s = inp.selectionStart ?? inp.value.length;
      inp.value = inp.value.slice(0, s) + k + inp.value.slice(inp.selectionEnd ?? s); inp.focus(); inp.setSelectionRange(s + 1, s + 1);
    }));
    setTimeout(() => inp.focus({ preventScroll: true }), 30);
  }
  const hb = $('.hintb', el); if (hb) hb.onclick = () => { hb.remove(); fb.className = 'fb'; fb.innerHTML = `💡 ${X(q.hint)}`; };
  return { finished: () => finished, showSol };
}
// the helper keys under the answer box: only what the grade needs
const keysFor = (g) => (g <= 3 ? ['/'] : g <= 6 ? ['/', '-', '.'] : ['/', '√', 'π', '-', ',', '(', ')', '^']);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
function answerHTML(q) {
  const a = q.ans;
  if (a.type === 'choice') return X(a.options[a.correct]);
  return String(a.text).replace(/-/g, '−').replace(/\*/g, '×').replace(/\^(\d+)/g, '<sup>$1</sup>');
}

let cleanup = null;
function practice(id, seed0) {
  const tp = byId(id); if (!tp) return (location.hash = '#/');
  const g = gradeOf(tp);
  let streak = 0, right = 0, done = 0, q;
  app.innerHTML = `<nav class="crumb"><a href="#/g/${g}">← ${gradeName(g)}</a></nav>
    <section class="phead"><h1>${X(tp.name)}</h1><span class="tags">${Object.keys(tp.cur).map((c) => `<span class="tag t-${c}">${L(...CUR_SHORT[c])} · ${X(tp.cur[c])}</span>`).join('')}</span></section>
    <div class="score"><span id="sc"></span><span id="st"></span><a class="link" href="#/print/${tp.id}">🖨️ ${L('列印學習單', 'Worksheet')}</a></div>
    <article class="card" id="card"></article><div class="next"><button class="btn big" id="next" hidden>${L('下一題', 'Next question')} →</button></div>`;
  const sc = () => { $('#sc').innerHTML = L(`本次答對 <b>${right}</b> / ${done}`, `This session: <b>${right}</b> / ${done}`); $('#st').innerHTML = streak >= 2 ? `🔥 ${L(`連續答對 ${streak} 題`, `${streak} in a row`)}` : ''; };
  const nextB = $('#next');
  const one = (seed) => {
    q = draw(tp, seed); nextB.hidden = true;
    card(q, $('#card'), { onDone(ok) { done++; if (ok) { right++; streak++; } else streak = 0; sc(); nextB.hidden = false; nextB.focus({ preventScroll: true }); } });
    sc();
  };
  nextB.onclick = () => { one(newSeed()); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const key = (e) => { if (e.key === 'Enter' && !nextB.hidden && document.activeElement?.id !== 'ans') { e.preventDefault(); nextB.click(); } };
  document.addEventListener('keydown', key); cleanup = () => document.removeEventListener('keydown', key);
  one(seed0 ?? newSeed());
  relang = () => practice(id, q.seed);
}

function quiz(g) {
  const tps = topicsFor(g); if (!tps.length) return (location.hash = '#/g/' + g);
  const order = []; let pool = [];
  while (order.length < 10) { if (!pool.length) pool = tps.slice().sort(() => Math.random() - 0.5); order.push(pool.pop()); }
  const qs = order.map((tp) => draw(tp, newSeed())), res = [];
  let k = 0, nextB;
  const quizShell = () => {
    app.innerHTML = `<nav class="crumb"><a href="#/g/${g}">← ${gradeName(g)}</a></nav>
      <section class="phead"><h1>🎯 ${L('綜合測驗', 'Mixed quiz')} · ${gradeName(g)}</h1></section>
      <div class="qprog" id="qp"></div><article class="card" id="card"></article><div class="next"><button class="btn big" id="next" hidden></button></div>`;
    nextB = $('#next');
    nextB.onclick = () => { if (++k < 10) { show(); window.scrollTo({ top: 0, behavior: 'smooth' }); } else results(); };
  };
  const show = () => {
    const q = qs[k];
    $('#qp').innerHTML = qs.map((_, i) => `<i class="${i < k ? (res[i].ok ? 'ok' : 'no') : i === k ? 'now' : ''}"></i>`).join('') + `<span>${k + 1} / 10 · ${X(q.tp.name)}</span>`;
    nextB.hidden = true;
    card(q, $('#card'), { tries: 1, quiz: true, onDone(ok, given) {
      res[k] = { ok, given }; record(q.tp.id, ok);
      nextB.textContent = k < 9 ? L('下一題 →', 'Next →') : L('看成績 →', 'See results →'); nextB.hidden = false; nextB.focus({ preventScroll: true });
    } });
  };
  relang = () => { if (k >= 10) results(); else { quizShell(); show(); } };
  const results = () => {
    const n = res.filter((r) => r.ok).length;
    const msg = n === 10 ? L('滿分！太厲害了！🏆', 'Perfect score! 🏆') : n >= 8 ? L('很棒！再接再厲！🌟', 'Great work! 🌟') : n >= 5 ? L('不錯喔，看看錯的題目怎麼做。💪', 'Good — check the ones you missed. 💪') : L('先看詳解，再挑單元慢慢練。📚', 'Read the solutions, then practice topic by topic. 📚');
    app.innerHTML = `<nav class="crumb"><a href="#/g/${g}">← ${gradeName(g)}</a></nav>
      <section class="result"><div class="big-score">${n}<small>/10</small></div><p>${msg}</p>
      <div class="acts"><a class="btn big" href="#/quiz/${g}" id="again">${L('再考一次', 'Another quiz')}</a><a class="btn ghost" href="#/g/${g}">${L('回到單元列表', 'Back to topics')}</a></div></section>
      <div class="review">${qs.map((q, i) => {
        const r = res[i], given = r.given == null ? '—' : q.ans.type === 'choice' ? X(q.ans.options[r.given]) : String(r.given).replace(/</g, '&lt;');
        return `<details class="rv ${r.ok ? 'ok' : 'no'}" ${r.ok ? '' : 'open'}><summary><b>${i + 1}.</b> ${r.ok ? '✅' : '❌'} ${X(q.tp.name)}</summary>
          <div class="q">${X(q.q)}</div>${q.fig ? `<div class="figs">${q.fig}</div>` : ''}
          <p>${L('你的答案', 'Your answer')}：<b>${given}</b>　${L('正確答案', 'Correct answer')}：<b>${answerHTML(q)}</b></p>
          <ol class="steps">${q.sol.map((s) => `<li>${X(s)}</li>`).join('')}</ol></details>`;
      }).join('')}</div>`;
    $('#again').onclick = (e) => { e.preventDefault(); quiz(g); };
  };
  quizShell();
  show();
}

function print(what) {
  const g = what.match(/^g(\d+)$/)?.[1];
  const tps = g ? topicsFor(+g) : [byId(what)].filter(Boolean);
  if (!tps.length) return (location.hash = '#/');
  const title = g ? gradeName(+g) : X(tps[0].name);
  const qs = Array.from({ length: 20 }, (_, i) => draw(tps[i % tps.length], newSeed()));
  if (g) qs.sort((a, b) => tps.indexOf(a.tp) - tps.indexOf(b.tp));
  const qHTML = (q, i) => `<li class="pq"><div class="q">${X(q.q)}</div>${q.fig ? `<div class="figs">${q.fig}</div>` : ''}${q.ans.type === 'choice'
    ? `<div class="pch">${rng(q.seed ^ 0x5bd1e995).shuffle(q.ans.options.map((o, j) => ({ o, j }))).map((x, k) => `<span>(${'ABCDEF'[k]}) ${X(x.o)}</span>`).join('')}</div>` : '<div class="line"></div>'}</li>`;
  const key = (q) => { if (q.ans.type !== 'choice') return answerHTML(q); const o = rng(q.seed ^ 0x5bd1e995).shuffle(q.ans.options.map((o, j) => ({ o, j }))); const k = o.findIndex((x) => x.j === q.ans.correct); return `(${'ABCDEF'[k]}) ${X(q.ans.options[q.ans.correct])}`; };
  app.innerHTML = `<nav class="crumb noprint"><a href="javascript:history.back()">← ${L('返回', 'Back')}</a>
      <button class="btn" onclick="window.print()">🖨️ ${L('列印', 'Print')}</button><button class="btn ghost" id="regen">🔄 ${L('換一批題目', 'New questions')}</button></nav>
    <section class="sheet"><h1>${L('數學學習單', 'Math worksheet')} · ${title}</h1><p class="who">${L('姓名', 'Name')}：＿＿＿＿＿＿　${L('日期', 'Date')}：＿＿＿＿＿＿　${L('得分', 'Score')}：＿＿＿ / 20</p>
    <ol class="pqs">${qs.map(qHTML).join('')}</ol></section>
    <section class="sheet key"><h1>${L('解答', 'Answer key')} · ${title}</h1><ol class="keys-list">${qs.map((q) => `<li><b>${key(q)}</b><ol class="steps">${q.sol.map((s) => `<li>${X(s)}</li>`).join('')}</ol></li>`).join('')}</ol></section>`;
  $('#regen').onclick = () => print(what);
}

// ---------- router ----------
function route() {
  cleanup?.(); cleanup = null; relang = null;
  const h = location.hash;
  let m;
  if ((m = h.match(/^#\/g\/(\d+)/))) grade(+m[1]);
  else if ((m = h.match(/^#\/p\/(.+)/))) practice(decodeURIComponent(m[1]));
  else if ((m = h.match(/^#\/quiz\/(\d+)/))) quiz(+m[1]);
  else if ((m = h.match(/^#\/print\/(.+)/))) print(decodeURIComponent(m[1]));
  else home();
  document.body.dataset.page = (h.match(/^#\/(\w+)/) || [, 'home'])[1];
}
window.addEventListener('hashchange', () => { route(); window.scrollTo(0, 0); });
header();
route();
