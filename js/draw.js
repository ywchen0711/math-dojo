// Small SVG pictures for questions. Each returns an HTML string; colors come from CSS variables so they follow
// the light/dark theme (--ink lines, --soft fills, --acc highlights).
const W = (w, h, body, cls = '') => `<svg class="fig ${cls}" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">${body}</svg>`;
const t = (x, y, s, extra = '') => `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" ${extra}>${s}</text>`;

// a clock face showing h:m
export function clock(h, m) {
  const cx = 70, cy = 70, R = 60;
  let s = `<circle cx="${cx}" cy="${cy}" r="${R}" class="f-soft"/>`;
  for (let k = 1; k <= 12; k++) { const a = (k / 12) * 2 * Math.PI; s += t(cx + 47 * Math.sin(a), cy - 47 * Math.cos(a), k, 'class="f-txt" font-size="13"'); }
  for (let k = 0; k < 60; k++) { const a = (k / 60) * 2 * Math.PI, r0 = k % 5 ? 56 : 53; s += `<line x1="${cx + r0 * Math.sin(a)}" y1="${cy - r0 * Math.cos(a)}" x2="${cx + 59 * Math.sin(a)}" y2="${cy - 59 * Math.cos(a)}" class="f-line" stroke-width="${k % 5 ? 0.6 : 1.5}"/>`; }
  const ha = (((h % 12) + m / 60) / 12) * 2 * Math.PI, ma = (m / 60) * 2 * Math.PI;
  s += `<line x1="${cx}" y1="${cy}" x2="${cx + 30 * Math.sin(ha)}" y2="${cy - 30 * Math.cos(ha)}" class="f-line" stroke-width="5" stroke-linecap="round"/>`;
  s += `<line x1="${cx}" y1="${cy}" x2="${cx + 46 * Math.sin(ma)}" y2="${cy - 46 * Math.cos(ma)}" class="f-acc" stroke-width="3" stroke-linecap="round"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="4" class="f-dot"/>`;
  return W(140, 140, s);
}

// rows of an emoji: dots('🍎', 7) ; groups: dots('🍎', [3, 4]) shows two groups
export function dots(e, n, perRow = 10) {
  const groups = Array.isArray(n) ? n : [n];
  return `<div class="dots">${groups.map((g) => `<span class="grp">${Array.from({ length: g }, (_, i) => (i && i % perRow === 0 ? '<br>' : '') + e).join('')}</span>`).join('')}</div>`;
}

// a number line from a to b; marks = [{ v, label, hi }]
export function numberLine(a, b, marks = [], step = 1) {
  const w = 360, pad = 20, X = (v) => pad + ((v - a) / (b - a)) * (w - 2 * pad);
  let s = `<line x1="${pad - 8}" y1="30" x2="${w - pad + 8}" y2="30" class="f-line" stroke-width="2"/>`;
  for (let v = a; v <= b + 1e-9; v += step) s += `<line x1="${X(v)}" y1="24" x2="${X(v)}" y2="36" class="f-line"/>` + t(X(v), 50, +v.toFixed(4), 'class="f-txt" font-size="12"');
  for (const mk of marks) s += `<circle cx="${X(mk.v)}" cy="30" r="5" class="${mk.hi ? 'f-accfill' : 'f-dot'}"/>` + (mk.label ? t(X(mk.v), 12, mk.label, 'class="f-acctxt" font-size="13" font-weight="700"') : '');
  return W(w, 60, s);
}

// a bar cut into d equal parts with n shaded
export function fracBar(n, d, w = 300) {
  let s = ''; const pw = w / d;
  for (let k = 0; k < d; k++) s += `<rect x="${2 + k * pw}" y="2" width="${pw}" height="36" class="${k < n ? 'f-accfill' : 'f-soft'}"/>`;
  return W(w + 4, 40, s);
}
// a circle cut into d equal slices with n shaded
export function pie(n, d) {
  const cx = 50, cy = 50, R = 45; let s = '';
  for (let k = 0; k < d; k++) {
    const a0 = (k / d) * 2 * Math.PI - Math.PI / 2, a1 = ((k + 1) / d) * 2 * Math.PI - Math.PI / 2;
    const p = d === 1 ? `<circle cx="${cx}" cy="${cy}" r="${R}"` : `<path d="M${cx},${cy} L${cx + R * Math.cos(a0)},${cy + R * Math.sin(a0)} A${R},${R} 0 0 1 ${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)} Z"`;
    s += `${p} class="${k < n ? 'f-accfill' : 'f-soft'}"/>`;
  }
  return W(100, 100, s);
}

// a rectangle with side labels (strings), scaled to fit
export function rect(wl, hl, w = 160, h = 90) {
  return W(w + 70, h + 40, `<rect x="35" y="10" width="${w}" height="${h}" class="f-soft"/>` + t(35 + w / 2, h + 28, wl, 'class="f-txt"') + t(17, 10 + h / 2, hl, 'class="f-txt"'));
}
// a polygon from points [[x,y]…] (in a 0..200 box) with labels [{x,y,s}]
export function shape(pts, labels = [], w = 220, h = 170, extra = '') {
  return W(w, h, `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" class="f-soft"/>` + extra + labels.map((l) => t(l.x, l.y, l.s, `class="${l.acc ? 'f-acctxt' : 'f-txt'}" font-size="13"`)).join(''));
}
// a right triangle with legs a (bottom) and b (left) and hypotenuse c labels
export function rightTri(a, b, c) {
  return shape([[30, 20], [30, 140], [190, 140]], [{ x: 110, y: 157, s: a }, { x: 14, y: 80, s: b }, { x: 122, y: 70, s: c }], 220, 170, '<polyline points="30,126 44,126 44,140" fill="none" class="f-line"/>');
}
// a circle with a radius (or diameter) label
export function circle(label, diameter = false) {
  return W(160, 140, `<circle cx="80" cy="70" r="60" class="f-soft"/><circle cx="80" cy="70" r="3" class="f-dot"/>` +
    (diameter ? `<line x1="20" y1="70" x2="140" y2="70" class="f-acc" stroke-width="2"/>` : `<line x1="80" y1="70" x2="140" y2="70" class="f-acc" stroke-width="2"/>`) +
    t(diameter ? 80 : 110, 60, label, 'class="f-acctxt" font-size="14" font-weight="700"'));
}
// a bar chart: data = [{ label, v }]
export function bars(data, max) {
  max = max || Math.max(...data.map((d) => d.v)); const bw = 44, h = 120, w = data.length * (bw + 16) + 40;
  let s = `<line x1="30" y1="10" x2="30" y2="${h + 10}" class="f-line"/><line x1="30" y1="${h + 10}" x2="${w}" y2="${h + 10}" class="f-line"/>`;
  const step = max <= 10 ? 1 : max <= 20 ? 2 : max <= 50 ? 5 : 10;
  for (let v = 0; v <= max; v += step) s += t(18, h + 10 - (v / max) * h, v, 'class="f-txt" font-size="10"') + `<line x1="30" y1="${h + 10 - (v / max) * h}" x2="${w}" y2="${h + 10 - (v / max) * h}" class="f-grid"/>`;
  data.forEach((d, i) => { const x = 40 + i * (bw + 16), bh = (d.v / max) * h; s += `<rect x="${x}" y="${h + 10 - bh}" width="${bw}" height="${bh}" class="f-accfill"/>` + t(x + bw / 2, h + 24, d.label, 'class="f-txt" font-size="11"'); });
  return W(w + 10, h + 34, s);
}
// a coordinate grid from -n..n with points [{x,y,label}] and optional lines [{m,b}] (y = mx + b)
export function grid(n = 6, pts = [], lines = []) {
  const S = 300, u = S / (2 * n), X = (x) => S / 2 + x * u, Y = (y) => S / 2 - y * u;
  let s = '';
  for (let k = -n; k <= n; k++) s += `<line x1="${X(k)}" y1="0" x2="${X(k)}" y2="${S}" class="f-grid"/><line x1="0" y1="${Y(k)}" x2="${S}" y2="${Y(k)}" class="f-grid"/>`;
  s += `<line x1="0" y1="${S / 2}" x2="${S}" y2="${S / 2}" class="f-line" stroke-width="1.5"/><line x1="${S / 2}" y1="0" x2="${S / 2}" y2="${S}" class="f-line" stroke-width="1.5"/>`;
  for (let k = -n; k <= n; k++) if (k) s += t(X(k), S / 2 + 10, k, 'class="f-txt" font-size="9"') + t(S / 2 - 9, Y(k), k, 'class="f-txt" font-size="9"');
  for (const l of lines) s += `<line x1="${X(-n)}" y1="${Y(l.m * -n + l.b)}" x2="${X(n)}" y2="${Y(l.m * n + l.b)}" class="f-acc" stroke-width="2"/>`;
  for (const p of pts) s += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="4.5" class="f-accfill"/>` + (p.label ? t(X(p.x) + 12, Y(p.y) - 10, p.label, 'class="f-acctxt" font-size="13" font-weight="700"') : '');
  return `<svg class="fig" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}" role="img"><clipPath id="gc"><rect width="${S}" height="${S}"/></clipPath><g clip-path="url(#gc)">${s}</g></svg>`;
}
