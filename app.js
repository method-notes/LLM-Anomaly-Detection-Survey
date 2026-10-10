'use strict';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const icon = name => {
  const element = document.createElement('i');
  element.dataset.lucide = name;
  element.setAttribute('aria-hidden', 'true');
  return element;
};
const refreshIcons = () => window.lucide?.createIcons({ attrs: { 'aria-hidden': 'true' } });
let toastTimer;
function notify(message) {
  $('#toast').textContent = message;
  $('#toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 3200);
}

const methods = window.SURVEY_DATA.methods;
const state = { query: '', family: '', paradigm: '', year: '', sort: 'newest', page: 1 };
const pageSize = 12;
let currentResults = [];
const familyParadigm = family => family.includes('Boundary') ? 'Boundary-Modeling AD' : 'Alignment-Based AD';
const yearSelect = $('#year-filter');
[...new Set(methods.map(m => m.year))].sort((a, b) => b - a).forEach(year => {
  if (![...yearSelect.options].some(o => o.value === String(year))) {
    yearSelect.add(new Option(String(year), String(year)));
  }
});

function updateUrl() {
  const url = new URL(location.href);
  for (const [key, value] of Object.entries({ q: state.query, family: state.family, paradigm: state.paradigm, year: state.year, sort: state.sort === 'newest' ? '' : state.sort })) {
    value ? url.searchParams.set(key, value) : url.searchParams.delete(key);
  }
  try { history.replaceState(null, '', url); } catch { /* File previews can restrict history updates. */ }
}

function renderMethods() {
  const terms = state.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  currentResults = methods.filter(m => {
    const text = `${m.name} ${m.title} ${m.family} ${m.paradigm}`.toLowerCase();
    return terms.every(term => text.includes(term)) && (!state.family || m.family === state.family)
      && (!state.paradigm || m.paradigm === state.paradigm) && (!state.year || String(m.year) === state.year);
  }).sort((a, b) => state.sort === 'name' ? a.name.localeCompare(b.name)
    : (state.sort === 'oldest' ? a.year - b.year : b.year - a.year) || a.name.localeCompare(b.name));
  const pages = Math.max(1, Math.ceil(currentResults.length / pageSize));
  state.page = Math.min(state.page, pages);
  const start = (state.page - 1) * pageSize;
  const fragment = document.createDocumentFragment();
  currentResults.slice(start, start + pageSize).forEach(method => {
    const row = document.createElement('tr');
    const main = document.createElement('td');
    const link = document.createElement('a');
    link.className = 'method-name'; link.textContent = method.name; link.href = method.url;
    link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `${method.name}: open publication`);
    const title = document.createElement('p'); title.className = 'method-title'; title.textContent = method.title;
    main.append(link, title);
    if (method.note) {
      const note = document.createElement('p'); note.className = 'method-note'; note.textContent = method.note;
      main.append(note);
    }
    const family = document.createElement('td');
    const label = document.createElement('span'); label.className = 'family-label';
    const dot = document.createElement('span'); dot.className = `legend-mark ${method.paradigm === 'Boundary-Modeling AD' ? 'blue' : 'orange'}`;
    label.append(dot, document.createTextNode(method.family)); family.append(label);
    const year = document.createElement('td'); year.className = 'method-year'; year.textContent = method.year;
    const action = document.createElement('td');
    const external = document.createElement('a'); external.className = 'icon-button';
    external.href = method.url; external.target = '_blank'; external.rel = 'noopener noreferrer';
    external.setAttribute('aria-label', `Open ${method.name} publication`); external.title = 'Open publication';
    external.append(icon('arrow-up-right')); action.append(external);
    row.append(main, family, year, action); fragment.append(row);
  });
  $('#method-rows').replaceChildren(fragment);
  $('#empty-state').hidden = currentResults.length !== 0;
  $('#result-count').textContent = `${currentResults.length} of ${methods.length} methods`;
  $('#page-info').textContent = currentResults.length ? `Showing ${start + 1}–${Math.min(start + pageSize, currentResults.length)} of ${currentResults.length}` : 'No results';
  $('#page-number').textContent = `${state.page} / ${pages}`;
  $('#prev-page').disabled = state.page <= 1;
  $('#next-page').disabled = state.page >= pages;
  $('#export-methods').disabled = currentResults.length === 0;
  $('#search').value = state.query; $('#family-filter').value = state.family;
  $('#year-filter').value = state.year; $('#sort-filter').value = state.sort;
  $('#clear-search').hidden = state.query.length === 0;
  $$('[data-filter-paradigm]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filterParadigm === state.paradigm)));
  refreshIcons(); updateUrl();
}

const params = new URLSearchParams(location.search);
state.query = params.get('q') || '';
if (methods.some(m => m.family === params.get('family'))) state.family = params.get('family');
if (methods.some(m => m.paradigm === params.get('paradigm'))) state.paradigm = params.get('paradigm');
if (methods.some(m => String(m.year) === params.get('year'))) state.year = params.get('year');
if (['newest', 'oldest', 'name'].includes(params.get('sort'))) state.sort = params.get('sort');
$('#filters').addEventListener('submit', event => event.preventDefault());
$('#search').addEventListener('input', event => { state.query = event.target.value; state.page = 1; renderMethods(); });
$('#clear-search').addEventListener('click', () => { state.query = ''; state.page = 1; renderMethods(); $('#search').focus(); });
$('#family-filter').addEventListener('change', event => { state.family = event.target.value; if (state.family && state.paradigm && familyParadigm(state.family) !== state.paradigm) state.paradigm = ''; state.page = 1; renderMethods(); });
$('#year-filter').addEventListener('change', event => { state.year = event.target.value; state.page = 1; renderMethods(); });
$('#sort-filter').addEventListener('change', event => { state.sort = event.target.value; state.page = 1; renderMethods(); });
$$('[data-filter-paradigm]').forEach(button => button.addEventListener('click', () => {
  state.paradigm = button.dataset.filterParadigm;
  if (state.family && state.paradigm && familyParadigm(state.family) !== state.paradigm) state.family = '';
  state.page = 1; renderMethods();
}));
function resetFilters() { Object.assign(state, { query: '', family: '', paradigm: '', year: '', sort: 'newest', page: 1 }); }
$('#reset-filters').addEventListener('click', () => { resetFilters(); renderMethods(); $('#search').focus(); });
$$('[data-family]').forEach(link => link.addEventListener('click', () => { resetFilters(); state.family = link.dataset.family; renderMethods(); }));
$$('[data-paradigm]').forEach(link => link.addEventListener('click', () => { resetFilters(); state.paradigm = link.dataset.paradigm; renderMethods(); }));
for (const [id, delta] of [['prev-page', -1], ['next-page', 1]]) {
  $(`#${id}`).addEventListener('click', () => { state.page += delta; renderMethods(); $('#filters').scrollIntoView({ block: 'start' }); });
}
$('#export-methods').addEventListener('click', () => {
  const fields = ['name', 'title', 'year', 'family', 'paradigm', 'url'];
  const quote = value => `"${String(value).replaceAll('"', '""')}"`;
  const csv = [fields.join(','), ...currentResults.map(method => fields.map(field => quote(method[field])).join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'llm-ad-survey-methods.csv';
  link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify(`Exported ${currentResults.length} methods`);
});

const figures = {
  paradigms: { src: 'assets/paradigms.png', title: 'Comparison of the two detection paradigms', alt: 'Comparison of Boundary-Modeling AD and Alignment-Based AD using expected and observed behavior.', caption: 'Comparison of Boundary-Modeling AD and Alignment-Based AD. From the survey.', width: 5307, height: 2342 },
  motivation: { src: 'assets/motivation.png', title: 'Motivation for two anomaly-detection paradigms', alt: 'Different LLM agent trajectories and the limitations of characterizing expected behavior from historical runtime data alone.', caption: 'LLM uncertainty motivates two ways of constructing and applying anomaly decision conditions. From the survey.', width: 7337, height: 3735 },
  framework: { src: 'assets/framework.png', title: 'Five-stage framework for Alignment-Based AD', alt: 'Five activities for constructing, evaluating, and updating an alignment model.' },
  statistics: { src: 'assets/publication-statistics.png', title: 'Composition and temporal distribution of the selected examples', alt: '181 examples by paradigm and a time series of 173 dated examples through 2026 Q2.' },
};
let currentFigure = 'paradigms';
function showOverviewFigure(key) {
  currentFigure = key;
  const figure = figures[key];
  $('#overview-image').src = figure.src; $('#overview-image').alt = figure.alt;
  $('#overview-image').width = figure.width; $('#overview-image').height = figure.height;
  $('#overview-caption').textContent = figure.caption;
  $$('[data-figure]').forEach(button => {
    const active = button.dataset.figure === key;
    button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1;
    if (active) $('#overview-figure').setAttribute('aria-labelledby', button.id);
  });
}
$$('[data-figure]').forEach(button => button.addEventListener('click', () => showOverviewFigure(button.dataset.figure)));
let figureOpener;
function expandFigure(key, opener) {
  const figure = figures[key]; figureOpener = opener;
  $('#dialog-image').src = figure.src; $('#dialog-image').alt = figure.alt;
  $('#dialog-title').textContent = figure.title; $('#download-figure').href = figure.src;
  $('#figure-dialog').showModal(); document.body.style.overflow = 'hidden';
}
$('#expand-overview').addEventListener('click', event => expandFigure(currentFigure, event.currentTarget));
$$('[data-expand]').forEach(button => button.addEventListener('click', () => expandFigure(button.dataset.expand, button)));
$('#close-dialog').addEventListener('click', () => $('#figure-dialog').close());
$('#figure-dialog').addEventListener('close', () => { document.body.style.overflow = ''; figureOpener?.focus(); });
$('#figure-dialog').addEventListener('click', event => { if (event.target === $('#figure-dialog')) { const r = event.target.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) event.target.close(); } });

const stages = [
  { title: 'Requirement Instantiation', kicker: 'Make the requirement concrete', description: 'Convert a general end-to-end requirement into a requirement instance using the current request and execution context. An SLO may become a latency or cost threshold; a safety requirement may become an authorization condition.', input: 'General requirement, current request, execution context', output: 'A requirement instance for the current execution' },
  { title: 'Behavior Representation', kicker: 'Represent the relevant observations', description: 'Organize observable data and execution context into a behavior pattern relevant to the requirement instance. The data may include metrics, claims and evidence, reasoning steps, tool calls, or execution records.', input: 'Observable runtime data, execution context, requirement instance', output: 'A behavior pattern relevant to the requirement' },
  { title: 'Dynamic Alignment Construction', kicker: 'Connect requirements with behavior', description: 'Establish correspondences between the requirement instance and the behavior pattern, together with the decision conditions. These conditions specify what must hold under the current execution context.', input: 'Requirement instance, behavior pattern, execution context', output: 'An alignment model with correspondences and decision conditions' },
  { title: 'Alignment Evaluation', kicker: 'Evaluate the decision conditions', description: 'Check whether the behavior pattern satisfies the conditions in the alignment model. Evaluation may use a satisfaction score or a Boolean check. Pending obligations and unavailable evidence can remain unresolved.', input: 'Alignment model, requirement instance, behavior pattern', output: 'Anomaly decisions with condition-level verdicts and evidence' },
  { title: 'Model Evolution', kicker: 'Update the decision basis', description: 'Update the alignment model as requirements, runtime data, and execution context change. Earlier verdicts remain associated with the evidence and versions used at the time; reassessment and behavior repair are recorded separately.', input: 'New requirements, observations, evidence, or context', output: 'Updated decision conditions for subsequent evaluation' },
];
function showStage(index) {
  const stage = stages[index];
  for (const field of ['title', 'kicker', 'description', 'input', 'output']) $(`#stage-${field}`).textContent = stage[field];
  $('#stage-panel').setAttribute('aria-labelledby', `stage-${index}`);
  $$('[data-stage]').forEach(button => { const active = Number(button.dataset.stage) === index; button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1; });
}
$$('[data-stage]').forEach(button => button.addEventListener('click', () => showStage(Number(button.dataset.stage))));
$$('[role=tablist]').forEach(list => list.addEventListener('keydown', event => {
  if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault(); const tabs = [...list.querySelectorAll('[role=tab]')];
  let index = tabs.indexOf(document.activeElement);
  if (index < 0) return;
  index = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + tabs.length) % tabs.length;
  tabs[index].focus(); tabs[index].click();
}));

$('#copy-citation').addEventListener('click', async () => {
  const text = $('#bibtex').textContent;
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
    else {
      const input = document.createElement('textarea'); input.value = text; input.style.position = 'fixed'; input.style.opacity = '0'; document.body.append(input); input.select();
      const copied = document.execCommand('copy'); input.remove(); if (!copied) throw new Error('Clipboard unavailable');
    }
    notify('BibTeX citation copied');
  } catch { notify('Clipboard unavailable. Use Download BibTeX.'); }
});

$('.menu-toggle').addEventListener('click', () => {
  const open = $('.menu-toggle').getAttribute('aria-expanded') !== 'true';
  $('.menu-toggle').setAttribute('aria-expanded', String(open)); $('.menu-toggle').setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); $('#mobile-nav').hidden = !open;
});
$$('#mobile-nav a').forEach(link => link.addEventListener('click', () => { $('#mobile-nav').hidden = true; $('.menu-toggle').setAttribute('aria-expanded', 'false'); $('.menu-toggle').setAttribute('aria-label', 'Open navigation'); }));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !$('#mobile-nav').hidden) $('.menu-toggle').click(); });
const observer = new IntersectionObserver(entries => {
  entries.filter(entry => entry.isIntersecting).forEach(entry => {
    $$('.nav-wrap nav a').forEach(link => { const active = link.hash === `#${entry.target.id}`; link.classList.toggle('active', active); active ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'); });
  });
}, { rootMargin: '-15% 0px -60% 0px' });
$$('main section[id]').forEach(section => observer.observe(section));

// A schematic of historical-pattern boundaries and requirement-behavior links.
const canvas = $('#hero-canvas');
const ctx = canvas.getContext('2d');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let sceneVisible = true;
new IntersectionObserver(entries => { sceneVisible = entries[0].isIntersecting; }).observe(canvas);
function drawScene(time = 0) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) { canvas.width = Math.round(rect.width * dpr); canvas.height = Math.round(rect.height * dpr); }
  const w = rect.width, h = rect.height;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
  const narrow = w < 700;
  const left = w * .27, right = w * .73, center = h * .58;
  const rx = Math.min(narrow ? w * .19 : w * .17, 215), ry = narrow ? 36 : 49;
  ctx.fillStyle = '#e4e9ee';
  for (let x = 16; x < w; x += 24) for (let y = 30; y < h - 20; y += 24) { ctx.beginPath(); ctx.arc(x, y, .65, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = '#8eacd8'; ctx.lineWidth = 1.2; ctx.fillStyle = '#eaf1fa88';
  ctx.beginPath(); ctx.ellipse(left, center, rx, ry, -.035, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  const seed = n => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
  const count = narrow ? 22 : 43;
  for (let i = 0; i < count; i++) {
    const angle = seed(i + 3) * Math.PI * 2, radius = Math.sqrt(seed(i + 61)) * .85;
    const x = left + Math.cos(angle) * radius * rx, y = center + Math.sin(angle) * radius * ry;
    ctx.fillStyle = i % 5 === 0 ? '#8da9ce' : '#3668b0'; ctx.beginPath(); ctx.arc(x, y, narrow ? 1.7 : 2.25, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = '#c65c45'; ctx.lineWidth = 1.4;
  [[1.12, -.5], [-.83, -1.15], [.76, 1.13]].forEach(([x, y]) => {
    const px = left + x * rx, py = center + y * ry; ctx.beginPath(); ctx.moveTo(px - 3, py - 3); ctx.lineTo(px + 3, py + 3); ctx.moveTo(px - 3, py + 3); ctx.lineTo(px + 3, py - 3); ctx.stroke();
  });
  const span = Math.min(w * .15, 180), rows = [-1, 0, 1];
  const from = rows.map((r, i) => ({ x: right - span, y: center + r * (narrow ? 26 : 32), name: ['SLO', 'Intent', 'Safety'][i] }));
  const to = Array.from({ length: 5 }, (_, i) => ({ x: right + span * .9, y: center + (i - 2) * (narrow ? 16 : 21) }));
  from.forEach((start, i) => to.forEach((end, j) => {
    if ((i + j) % 3 === 0) return;
    ctx.strokeStyle = '#dab59f'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.bezierCurveTo(right, start.y, right, end.y, end.x, end.y); ctx.stroke();
    if (!reducedMotion.matches && (i + j) % 4 === 0) {
      const t = ((time * .00013 + i * .3 + j * .2) % 1), u = 1 - t;
      const x = u ** 3 * start.x + 3 * u * u * t * right + 3 * u * t * t * right + t ** 3 * end.x;
      const y = u ** 3 * start.y + 3 * u * u * t * start.y + 3 * u * t * t * end.y + t ** 3 * end.y;
      ctx.fillStyle = '#c16a43'; ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
    }
  }));
  from.forEach(start => {
    ctx.fillStyle = '#fafbfc'; ctx.strokeStyle = '#c67b59'; ctx.lineWidth = 1.25; ctx.beginPath(); ctx.arc(start.x, start.y, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#886a5c'; ctx.font = `${narrow ? 8 : 10}px -apple-system, sans-serif`; ctx.textAlign = 'right'; ctx.fillText(start.name, start.x - 12, start.y + 3);
  });
  to.forEach((end, i) => { ctx.fillStyle = i === 3 ? '#be624b' : '#608477'; ctx.beginPath(); ctx.arc(end.x, end.y, 3.2, 0, Math.PI * 2); ctx.fill(); });
  ctx.setLineDash([3, 4]); ctx.strokeStyle = '#bdcfc6'; ctx.beginPath(); ctx.ellipse(right + span * .9, center, narrow ? 15 : 24, narrow ? 43 : 58, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
}
let lastFrame = 0;
function animate(time) {
  if (sceneVisible && !document.hidden && time - lastFrame > 40) { drawScene(time); lastFrame = time; }
  if (!reducedMotion.matches) requestAnimationFrame(animate);
}
new ResizeObserver(() => drawScene()).observe(canvas);
reducedMotion.addEventListener('change', () => { drawScene(); if (!reducedMotion.matches) requestAnimationFrame(animate); });
drawScene(); if (!reducedMotion.matches) requestAnimationFrame(animate);
showStage(0); renderMethods(); refreshIcons();
