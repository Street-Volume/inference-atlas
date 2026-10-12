/* Inference Atlas — shared app shell (nav, search, progress, quiz, keyboard shortcuts).
   Loaded on every page. Page-specific scripts (figures, encyclopedia, bridge, checker)
   read helpers off window.Atlas instead of redefining them. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);
  const tok = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  const go = (sel) => { const el = typeof sel === 'string' ? document.querySelector(sel) : sel; if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); };
  let toastT;
  const toast = msg => { const t = $('toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1900); };

  const PAGE = document.body.dataset.page || '';

  /* ---------- problem metadata (every page; drives nav, search, progress, stepping) ---------- */
  const P = [
    { id: 'q1', n: 'Q1', t: 'Geometric MGF proof', topic: 'Generating functions', hue: 'mgf', part: 'A', page: 'probability.html', ans: 'm(t) = pe^t / (1 − qe^t), qe^t < 1', kw: 'geometric series moment generating proof blanks' },
    { id: 'q2', n: 'Q2', t: 'Identify the distribution from its MGF', topic: 'Generating functions', hue: 'mgf', part: 'A', page: 'probability.html', ans: 'Binomial(6, 0.2) · Geometric(0.5) · Poisson(5)', kw: 'binomial geometric poisson uniqueness match' },
    { id: 'q3', n: 'Q3', t: 'Moments from a finite MGF', topic: 'Generating functions', hue: 'mgf', part: 'A', page: 'probability.html', ans: 'E(Y) = 19/9 · V(Y) = 26/81', kw: 'mean variance derivative moments probabilities' },
    { id: 'q4', n: 'Q4', t: 'Bounds from mean and variance', topic: 'Tchebysheff', hue: 'cheb', part: 'A', page: 'probability.html', ans: '≥ 0.75 · C = 10', kw: 'chebyshev tchebysheff bound inequality k sigma' },
    { id: 'q5', n: 'Q5', t: 'Three coin tosses vs the empirical rule', topic: 'Tchebysheff', hue: 'cheb', part: 'A', page: 'probability.html', ans: 'μ = 1.5 · σ = 0.866 · 0.75 and 1', kw: 'binomial coin heads empirical rule' },
    { id: 'q6', n: 'Q6', t: 'Spraying cost for diseased trees', topic: 'Tchebysheff', hue: 'cheb', part: 'A', page: 'probability.html', ans: 'E(C) = 105 · σ = 18.028 · (68.94, 141.06)', kw: 'poisson cost linear function interval chebyshev' },
    { id: 'q7', n: 'Q7', t: 'Poisson approximation for a rare disease', topic: 'Discrete models', hue: 'disc', part: 'A', page: 'probability.html', ans: 'λ = 0.5 · P(Y ≥ 2) = 0.090', kw: 'poisson binomial approximation rare children' },
    { id: 'q8', n: 'Q8', t: 'Clearing inventory in fewer than 6 contacts', topic: 'Discrete models', hue: 'disc', part: 'A', page: 'probability.html', ans: 'P(Y < 6) = 1/64 = 0.0156', kw: 'negative binomial sales equipment' },
    { id: 'q9', n: 'Q9', t: 'Finding c, F(y) and an area two ways', topic: 'Continuous', hue: 'cont', part: 'A', page: 'probability.html', ans: 'c = 0.5 · F = y²/4 · 0.75', kw: 'density normalize cdf trapezoid geometry' },
    { id: 'q10', n: 'Q10', t: 'From a piecewise F back to f', topic: 'Continuous', hue: 'cont', part: 'A', page: 'probability.html', ans: '0.4727 · 0.7500 · 0.7160', kw: 'piecewise cdf derivative conditional' },
    { id: 'q11', n: 'Q11', t: 'A piecewise demand density', topic: 'Continuous', hue: 'cont', part: 'A', page: 'probability.html', ans: '0.045 · 0.855', kw: 'piecewise density cdf demand integrate' },
    { id: 'ex982', n: '9.82', t: 'Sufficient statistic, MLE and MVUE', topic: 'Point estimation', hue: 'est', part: 'B', page: 'inference.html', ans: 'U = ΣYᵢʳ · θ̂ = U/n · MVUE: yes', kw: 'sufficiency factorization likelihood score mle mvue rao blackwell weibull gamma' },
    { id: 'ex996', n: '9.96', t: 'MLE of σ for a normal sample', topic: 'Point estimation', hue: 'est', part: 'B', page: 'inference.html', ans: 'σ̂ = √((1/n) Σ(Yᵢ − Ȳ)²)', kw: 'normal sigma invariance mle bias' },
    { id: 'ex105', n: '10.5', t: 'Matching α for two tests', topic: 'Hypothesis testing', hue: 'test', part: 'B', page: 'inference.html', ans: 'c = 2 − √0.10 ≈ 1.684', kw: 'type i error alpha rejection region triangle uniform power test' },
    { id: 'or1', n: 'OR1', t: 'Binding constraints and the price of a resource', topic: 'Shadow prices', hue: 'shadow', part: 'C', page: 'operations-research.html', ans: 'Both binding · y₁ = y₂ = 0.5 · 3 more units', kw: 'linear programming lp shadow price binding resource graphical hillier operations research' },
    { id: 'or2', n: 'OR2', t: 'How far can the objective tilt?', topic: 'Objective ranging', hue: 'range', part: 'C', page: 'operations-research.html', ans: 'Yes · No · 1 ≤ c₂ ≤ 3 · 2/3 ≤ c₁ ≤ 2', kw: 'objective coefficient sensitivity range slope optimal corner lp' },
    { id: 'or3', n: 'OR3', t: 'Three resources, one with slack', topic: 'Shadow prices', hue: 'shadow', part: 'C', page: 'operations-research.html', ans: 'Binding: 2, 3 · y = (0, 0.2, 1.4)', kw: 'shadow price nonbinding slack graphical lp' },
    { id: 'or4', n: 'OR4', t: 'Which corner wins for every objective', topic: 'Objective ranging', hue: 'range', part: 'C', page: 'operations-research.html', ans: '[1/3, 2] · ≥ 2 · [0, 1/3] · c₁ ≥ 0, c₂ ≤ 0', kw: 'normal fan ratio cone negative coefficients sensitivity lp' },
    { id: 'or5', n: 'OR5', t: 'Shadow prices from the final tableau', topic: 'Shadow prices', hue: 'shadow', part: 'C', page: 'operations-research.html', ans: 'y = (0, 1.5, 0.5) · buy resource 2 only', kw: 'simplex tableau row 0 slack allowable range buy resource cost lp' }
  ];
  const PI = Object.fromEntries(P.map((p, i) => [p.id, i]));

  /* ---------- static destinations for search + the "overview" context panel ---------- */
  const SECTIONS = [
    { t: 'Home', page: 'index.html', anchor: 'top', kw: 'overview start home' },
    { t: 'Part A reading list', page: 'probability.html', anchor: 'readA', kw: 'sections textbook read probability' },
    { t: 'Part B reading list', page: 'inference.html', anchor: 'readB', kw: 'sections textbook read inference' },
    { t: 'Part C reading list', page: 'operations-research.html', anchor: 'readC', kw: 'sections textbook read hillier operations research' },
    { t: 'Distribution encyclopedia', page: 'encyclopedia.html', anchor: 'ency', kw: 'distributions pmf pdf shapes gallery' },
    { t: 'Concept bridge', page: 'bridge.html', anchor: 'bridge', kw: 'connections links probability inference' },
    { t: 'Quant trading lab', page: 'quant.html', anchor: 'quant', kw: 'quant finance trading black scholes markowitz var portfolio wall street options statarb' },
    { t: 'Science workbench', page: 'science.html', anchor: 'science', kw: 'science alphafold protein pdb pubchem chemistry clinvar deepmind' },
    { t: 'Answer checker', page: 'workbench.html', anchor: 'workbench', kw: 'check practice verify webassign key' },
    { t: 'Audit log', page: 'workbench.html', anchor: 'audit', kw: 'errors fixes gemini lab issues' }
  ];
  const DISTS = [
    { id: 'bern', name: 'Bernoulli', sub: 'one trial', hue: 'mgf' }, { id: 'binom', name: 'Binomial', sub: 'successes in n trials', hue: 'disc' },
    { id: 'geom', name: 'Geometric', sub: 'trial of the first success', hue: 'mgf' }, { id: 'nbin', name: 'Negative binomial', sub: 'trial of the r-th success', hue: 'disc' },
    { id: 'hyper', name: 'Hypergeometric', sub: 'sampling without replacement', hue: 'cheb' }, { id: 'pois', name: 'Poisson', sub: 'counts of rare events', hue: 'disc' },
    { id: 'unif', name: 'Uniform', sub: 'flat on an interval', hue: 'test' }, { id: 'sumu', name: 'Sum of uniforms', sub: 'triangular when k = 2', hue: 'test' },
    { id: 'norm', name: 'Normal', sub: 'the bell curve', hue: 'est' }, { id: 'expo', name: 'Exponential', sub: 'memoryless waiting time', hue: 'shadow' },
    { id: 'gamma', name: 'Gamma', sub: 'sum of exponential waits', hue: 'range' }, { id: 'chisq', name: 'Chi-square', sub: 'gamma with β = 2', hue: 'range' },
    { id: 'beta', name: 'Beta', sub: 'shapes on [0, 1]', hue: 'cont' }, { id: 'weib', name: 'Weibull', sub: 'the 9.82 density', hue: 'est' },
    { id: 'tdist', name: 'Student’s t', sub: 'normal with fat tails', hue: 'test' }, { id: 'lognorm', name: 'Log-normal', sub: 'exponential of a normal', hue: 'shadow' }
  ];
  const BRIDGES = [
    { t: 'Probability models → Likelihood', k: 0 }, { t: 'Expectation → Unbiasedness', k: 1 },
    { t: 'Tchebysheff → Consistency', k: 2 }, { t: 'CDF areas → Type I error', k: 3 }, { t: 'Sums of variables → Test statistic', k: 4 }
  ];

  const nav = (page, anchor) => { if (page === PAGE) go('#' + anchor); else location.href = page + (anchor ? '#' + anchor : ''); };
  window.Atlas = { $, tok, store, go, toast, reduce, P, PI, SECTIONS, DISTS, PAGE, nav, retheme: [] };
  window.Atlas.onRetheme = fn => window.Atlas.retheme.push(fn);

  /* ---------- decorate problem sections present on this page ---------- */
  P.filter(p => p.page === PAGE).forEach((p) => {
    const sec = $(p.id); if (!sec) return;
    const pr = sec.querySelector('.problem'); if (pr) pr.id = p.id + '-prob';
    const tl = sec.querySelector('.tools'); if (tl) tl.id = p.id + '-tools';
    const st = sec.querySelector('.part'); if (st) st.id = p.id + '-steps';
    const ans = sec.querySelectorAll('.answer'); if (ans.length) ans[ans.length - 1].id = p.id + '-ans';
    const nx = P[PI[p.id] + 1];
    const foot = document.createElement('div');
    foot.className = 'pfoot';
    foot.innerHTML = `<button class="mark" data-mark="${p.id}" aria-pressed="false"><svg><use href="#ico-check"/></svg><span>Mark understood</span></button><span class="sp"></span>` +
      (nx ? `<a class="next" href="${nx.page === PAGE ? '#' + nx.id : nx.page + '#' + nx.id}">Next <b>${nx.n} ${nx.t}</b> →</a>` : `<a class="next" href="encyclopedia.html#ency">Next <b>Distribution encyclopedia</b> →</a>`);
    sec.appendChild(foot);
  });
  document.querySelectorAll('.answer').forEach(a => {
    const b = document.createElement('button'); b.className = 'reveal primary'; b.type = 'button'; b.textContent = 'Reveal answer';
    b.addEventListener('click', () => a.classList.add('revealed'));
    a.appendChild(b);
  });
  document.querySelectorAll('figure.lab').forEach((f, i) => { if (!f.id) f.id = 'fig' + i; });

  /* ---------- progress (shared across every page via localStorage) ---------- */
  let done = new Set(store.get('atlas2.done', []));
  window.Atlas.isDone = id => done.has(id);
  function applyProgress() {
    const k = done.size, N = P.length;
    document.querySelectorAll('nav.navlist a[data-p]').forEach(a => a.classList.toggle('done', done.has(a.dataset.p)));
    document.querySelectorAll('a.tile[data-p]').forEach(a => a.classList.toggle('done', done.has(a.dataset.p)));
    document.querySelectorAll('button.mark[data-mark]').forEach(b => {
      const on = done.has(b.dataset.mark); b.setAttribute('aria-pressed', String(on)); b.querySelector('span').textContent = on ? 'Understood' : 'Mark understood';
    });
    if ($('ringFg')) $('ringFg').style.strokeDashoffset = (94.25 * (1 - k / N)).toFixed(2);
    if ($('ringTxt')) $('ringTxt').textContent = k + '/' + N;
    ['A', 'B', 'C'].forEach(pt => {
      const ps = P.filter(p => p.part === pt), n = ps.filter(p => done.has(p.id)).length;
      const el = $('cb' + pt); if (el) el.style.width = (100 * n / ps.length) + '%';
      const badge = document.querySelector('.nav-badge[data-part="' + pt + '"]');
      if (badge) { badge.textContent = n + '/' + ps.length; badge.classList.toggle('done', n === ps.length); }
    });
    const nxt = P.find(p => !done.has(p.id));
    const cb = $('continueBtn');
    if (cb) {
      if (k === 0) { cb.textContent = 'Start with Q1 →'; cb.href = 'probability.html#q1'; }
      else if (nxt) { cb.textContent = `Continue with ${nxt.n} →`; cb.href = (nxt.page === PAGE ? '#' : nxt.page + '#') + nxt.id; }
      else { cb.textContent = `All ${N} marked. Open the checker →`; cb.href = 'workbench.html#workbench'; }
    }
    updateCtx();
    if (window.Atlas._filterTodo) window.Atlas._filterTodo();
  }
  function toggleDone(id) {
    if (!id) return;
    if (done.has(id)) done.delete(id); else { done.add(id); toast(`${P[PI[id]].n} marked understood · ${done.size}/${P.length}`); }
    store.set('atlas2.done', [...done]); applyProgress();
  }
  window.Atlas.toggleDone = toggleDone;
  window.Atlas.applyProgress = applyProgress;
  document.addEventListener('click', e => { const b = e.target.closest('button.mark[data-mark]'); if (b) toggleDone(b.dataset.mark); });
  if ($('ctxMark')) $('ctxMark').addEventListener('click', () => toggleDone(currentProblem));
  if ($('ringBtn')) $('ringBtn').addEventListener('click', () => { if (PAGE === 'index.html') go('#map'); else location.href = 'index.html#map'; });

  /* ---------- quiz mode ---------- */
  function setQuiz(on, silent) {
    document.body.classList.toggle('quiz', on);
    if ($('quizSw')) $('quizSw').setAttribute('aria-checked', String(on));
    if (on) document.querySelectorAll('.answer.revealed').forEach(a => a.classList.remove('revealed'));
    store.set('atlas2.quiz', on);
    if (!silent) toast(on ? 'Quiz mode on: answers stay hidden until you reveal them' : 'Quiz mode off');
  }
  window.Atlas.setQuiz = setQuiz;
  if ($('quizSw')) $('quizSw').addEventListener('click', () => setQuiz(!document.body.classList.contains('quiz')));
  setQuiz(store.get('atlas2.quiz', false), true);

  /* ---------- scroll spy, crumb, context rail (scoped to whatever exists on this page) ---------- */
  const navLinks = [...document.querySelectorAll('nav.navlist a[href^="#"]')];
  const targets = navLinks.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  const names = {
    top: ['Overview', 'Start here'], map: ['Overview', 'Problem map'], readA: ['Part A', 'Reading list'], readB: ['Part B', 'Reading list'],
    readC: ['Part C', 'Reading list'], ency: ['Encyclopedia', 'Distribution spotlight'], bridge: ['Study Tools', 'Concept bridge'], quant: ['Study Tools', 'Quant trading lab'], science: ['Study Tools', 'Science workbench'], workbench: ['Study Tools', 'Answer checker'], audit: ['Study Tools', 'Audit log']
  };
  let current = null, currentProblem = null;
  function updateCtx() {
    const ctx = $('ctx'); if (!ctx) return;
    const p = currentProblem ? P[PI[currentProblem]] : null;
    const jump = $('ctxJump'); if (jump) jump.innerHTML = '';
    const addJump = (label, href, meta) => { if (!jump) return; const a = document.createElement('a'); a.href = href; a.innerHTML = `<span>${label}</span><span>${meta || ''}</span>`; jump.appendChild(a); };
    if (p) {
      ctx.setAttribute('data-hue', p.hue);
      if ($('ctxTopic')) $('ctxTopic').textContent = `Part ${p.part} · ${p.topic}`;
      if ($('ctxTitle')) $('ctxTitle').textContent = `${p.n} ${p.t}`;
      if ($('ctxAnsTag')) $('ctxAnsTag').textContent = 'Key result';
      if ($('ctxAns')) $('ctxAns').textContent = p.ans;
      if ($('ctxMeterWrap')) $('ctxMeterWrap').hidden = true;
      const mk = $('ctxMark');
      if (mk) { mk.hidden = false; const on = done.has(p.id); mk.setAttribute('aria-pressed', String(on)); mk.querySelector('span').textContent = on ? 'Understood' : 'Mark understood'; }
      [['Problem', '-prob'], ['Textbook tools', '-tools'], ['Derivation', '-steps'], ['Answer', '-ans']].forEach(([l, s]) => { if ($(p.id + s)) addJump(l, '#' + p.id + s); });
      $(p.id).querySelectorAll('figure.lab').forEach(f => { const tg = f.querySelector('.tag'); const m = tg && tg.textContent.match(/Live figure ([ABC]\d+)/); addJump('Live figure', '#' + f.id, m ? m[1] : ''); });
    } else {
      ctx.setAttribute('data-hue', 'neutral');
      const nm = names[current] || ['Overview', ''];
      if ($('ctxTopic')) $('ctxTopic').textContent = nm[0];
      if ($('ctxTitle')) $('ctxTitle').textContent = (current === 'top' || current === 'map') ? `${P.length} problems across three courses` : nm[1];
      if ($('ctxAnsTag')) $('ctxAnsTag').textContent = 'Your progress';
      if ($('ctxAns')) $('ctxAns').textContent = `${done.size} of ${P.length} marked understood`;
      if ($('ctxMeterWrap')) { $('ctxMeterWrap').hidden = false; $('ctxMeter').style.width = (100 * done.size / P.length) + '%'; }
      if ($('ctxMark')) $('ctxMark').hidden = true;
      const nxt = P.find(x => !done.has(x.id));
      if (nxt) addJump(`Continue: ${nxt.n} ${nxt.t}`, (nxt.page === PAGE ? '#' : nxt.page + '#') + nxt.id, '');
      addJump('Problem map', 'index.html#map'); addJump('Concept bridge', 'bridge.html#bridge'); addJump('Quant trading lab', 'quant.html#quant'); addJump('Science workbench', 'science.html#science'); addJump('Answer checker', 'workbench.html#workbench');
    }
  }
  function setCurrent(id) {
    if (id === current) return; current = id;
    navLinks.forEach(a => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + id)));
    currentProblem = PI[id] != null ? id : null;
    const p = currentProblem ? P[PI[id]] : null, cr = $('crumb');
    if (cr) {
      if (p) { cr.setAttribute('data-hue', p.hue); $('crPart').textContent = `Part ${p.part} · ${p.topic}`; $('crName').textContent = `${p.n} ${p.t}`; }
      else { cr.setAttribute('data-hue', 'neutral'); const nm = names[id] || ['Overview', '']; $('crPart').textContent = nm[0]; $('crName').textContent = nm[1]; }
    }
    updateCtx();
    const a = navLinks.find(x => x.getAttribute('href') === '#' + id);
    const rail = $('railLeft');
    if (a && rail && window.matchMedia('(min-width: 1081px)').matches) {
      const r = a.getBoundingClientRect(), rr = rail.getBoundingClientRect();
      if (r.top < rr.top + 40 || r.bottom > rr.bottom - 40) rail.scrollTo({ top: rail.scrollTop + r.top - rr.top - rr.height / 2, behavior: reduce ? 'auto' : 'smooth' });
    }
  }
  function spy() {
    if (!targets.length) { updateCtx(); return; }
    const line = window.innerHeight * 0.3; let best = targets[0];
    for (const t of targets) { if (t.getBoundingClientRect().top - line <= 0) best = t; else break; }
    if (best) setCurrent(best.id);
  }
  let q = false;
  window.addEventListener('scroll', () => { if (!q) { q = true; requestAnimationFrame(() => { q = false; spy(); }); } }, { passive: true });

  /* ---------- next / previous (crosses page boundaries via the global P order) ---------- */
  function curIndex() {
    if (currentProblem) return PI[currentProblem];
    const onPage = P.map((p, i) => [p, i]).filter(([p]) => p.page === PAGE);
    for (const [p, i] of onPage) { const el = $(p.id); if (el && el.getBoundingClientRect().top > window.innerHeight * 0.3) return i - 0.5; }
    return onPage.length ? onPage[onPage.length - 1][1] + 0.5 : -0.5;
  }
  function step(dir) {
    const i = curIndex(), t = dir > 0 ? Math.floor(i + 1) : Math.ceil(i - 1);
    if (t < 0) { toast('Already at the first problem'); return; }
    if (t >= P.length) { toast('That was the last problem'); nav('encyclopedia.html', 'ency'); return; }
    const target = P[t];
    if (target.page === PAGE) go('#' + target.id); else location.href = target.page + '#' + target.id;
  }
  window.Atlas.step = step;
  if ($('ctxNext')) $('ctxNext').addEventListener('click', () => step(1));
  if ($('ctxPrev')) $('ctxPrev').addEventListener('click', () => step(-1));

  /* ---------- mobile drawer ---------- */
  const closeNav = () => { document.body.classList.remove('nav-open'); if ($('menuBtn')) $('menuBtn').setAttribute('aria-expanded', 'false'); };
  if ($('menuBtn')) $('menuBtn').addEventListener('click', () => { const on = !document.body.classList.contains('nav-open'); document.body.classList.toggle('nav-open', on); $('menuBtn').setAttribute('aria-expanded', String(on)); });
  if ($('scrim')) $('scrim').addEventListener('click', closeNav);
  navLinks.forEach(a => a.addEventListener('click', closeNav));

  /* ---------- map filter (index.html problem map only; view transitions) ---------- */
  let activeFilter = 'all';
  const tiles = [...document.querySelectorAll('a.tile')];
  tiles.forEach(t => { t.style.viewTransitionName = 'tile-' + t.dataset.p; });
  function filterTiles(f, animate) {
    activeFilter = f;
    const apply = () => {
      tiles.forEach(t => { t.hidden = !(f === 'all' || (f === 'todo' ? !done.has(t.dataset.p) : t.dataset.hue === f)); });
      document.querySelectorAll('#mapChips .chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.f === f)));
    };
    if (animate && document.startViewTransition && !reduce) document.startViewTransition(apply); else apply();
  }
  window.Atlas._filterTodo = () => { if (activeFilter === 'todo') filterTiles('todo', false); };
  document.querySelectorAll('#mapChips .chip').forEach(c => c.addEventListener('click', () => filterTiles(c.dataset.f, true)));

  /* ---------- command palette (static cross-page index) ---------- */
  const pal = $('palette'), palIn = $('palInput'), palList = $('palList');
  if (pal && palIn && palList) {
    const items = [];
    P.forEach(p => items.push({ kind: 'Problem', icon: p.n.replace('.', ''), title: `${p.n} ${p.t}`, sub: `Part ${p.part} · ${p.topic} · ${p.ans}`, hue: p.hue, kw: p.kw, run: () => nav(p.page, p.id) }));
    document.querySelectorAll('figure.lab').forEach(f => {
      const tg = f.querySelector('.tag'), h = f.querySelector('h3'), sec = f.closest('[data-hue]');
      const m = tg && tg.textContent.match(/Live figure ([ABC]\d+)/);
      items.push({ kind: 'Figure', icon: m ? m[1] : 'F', title: h ? h.textContent : 'Live figure', sub: tg ? tg.textContent : '', hue: sec ? sec.getAttribute('data-hue') : 'neutral', kw: 'figure live interactive chart simulation', run: () => go(f) });
    });
    SECTIONS.forEach(s => items.push({ kind: 'Section', icon: '§', title: s.t, sub: 'Jump to section', hue: 'neutral', kw: s.kw, run: () => nav(s.page, s.anchor) }));
    DISTS.forEach(d => items.push({ kind: 'Distribution', icon: d.name.slice(0, 3), title: d.name, sub: d.sub, hue: d.hue, kw: 'distribution pmf pdf encyclopedia ' + d.id, run: () => nav('encyclopedia.html', d.id) }));
    BRIDGES.forEach(b => items.push({ kind: 'Bridge', icon: '⇄', title: b.t, sub: 'Concept bridge link', hue: 'neutral', kw: 'bridge connect', run: () => nav('bridge.html', 'link' + b.k) }));
    const act = (t, sub, kw, run) => items.push({ kind: 'Action', icon: '›', title: t, sub, hue: 'neutral', kw, run });
    act('Open Quant trading lab', 'Black-Scholes, Markowitz frontier, VaR & pairs trading', 'quant finance trading options var markowitz wall street', () => nav('quant.html', 'quant'));
    act('Open Science workbench', 'AlphaFold 3D, PubChem chemistry & ClinVar', 'science alphafold protein chemistry pdb drug', () => nav('science.html', 'science'));
    act('Toggle quiz mode', 'Blur answers so you can test yourself', 'quiz hide answers test', () => setQuiz(!document.body.classList.contains('quiz')));
    act('Continue with the next unmarked problem', 'Picks up where you left off', 'continue resume next', () => { const n = P.find(p => !done.has(p.id)); n ? nav(n.page, n.id) : nav('workbench.html', 'workbench'); });
    act('Mark current problem understood', 'Toggles the check for the problem in view', 'mark done understood', () => currentProblem ? toggleDone(currentProblem) : toast('Scroll to a problem first'));
    act('Next problem', 'Shortcut J', 'next forward', () => step(1));
    act('Previous problem', 'Shortcut K', 'previous back', () => step(-1));
    act('Reset progress', 'Clears all checkmarks in this browser', 'reset clear progress', () => { done = new Set(); store.set('atlas2.done', []); applyProgress(); toast('Progress cleared'); });
    let shown = [], sel = 0;
    function renderPal() {
      const qs = palIn.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
      shown = items.filter(it => { const hay = (it.title + ' ' + it.sub + ' ' + it.kind + ' ' + (it.kw || '')).toLowerCase(); return qs.every(w => hay.includes(w)); }).slice(0, 40);
      sel = Math.min(sel, Math.max(0, shown.length - 1));
      palList.innerHTML = shown.length ? '' : '<div class="pal-empty">No matches. Try a topic like "poisson" or "power".</div>';
      shown.forEach((it, k) => {
        const li = document.createElement('li'); li.setAttribute('role', 'option'); li.setAttribute('data-hue', it.hue); li.setAttribute('aria-selected', String(k === sel));
        li.innerHTML = `<span class="pi">${it.icon}</span><span class="pt"><b></b><span></span></span><span class="pk">${it.kind}</span>`;
        li.querySelector('.pt b').textContent = it.title; li.querySelector('.pt span').textContent = it.sub;
        li.addEventListener('mousemove', () => { if (sel !== k) { sel = k; mark(); } });
        li.addEventListener('click', () => runSel(k));
        palList.appendChild(li);
      });
    }
    const mark = () => { [...palList.children].forEach((li, k) => li.setAttribute && li.setAttribute('aria-selected', String(k === sel))); const el = palList.children[sel]; if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' }); };
    const runSel = k => { const it = shown[k]; if (!it) return; pal.close(); setTimeout(() => it.run(), 30); };
    function openPal() { if (pal.open) return; palIn.value = ''; sel = 0; renderPal(); try { pal.showModal(); } catch (e) { pal.setAttribute('open', ''); } palIn.focus(); }
    window.Atlas.openPal = openPal;
    palIn.addEventListener('input', () => { sel = 0; renderPal(); });
    palIn.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(shown.length - 1, sel + 1); mark(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); mark(); }
      else if (e.key === 'Enter') { e.preventDefault(); runSel(sel); }
    });
    pal.addEventListener('click', e => { if (e.target === pal) pal.close(); });
    if ($('searchBtn')) $('searchBtn').addEventListener('click', openPal);
    if ($('heroSearch')) $('heroSearch').addEventListener('click', openPal);
    const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    if ($('kbdHint')) $('kbdHint').textContent = mac ? '⌘K' : 'Ctrl K';
  }

  /* ---------- keyboard ---------- */
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (window.Atlas.openPal) window.Atlas.openPal(); return; }
    if (pal && pal.open) return;
    const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === '/') { e.preventDefault(); if (window.Atlas.openPal) window.Atlas.openPal(); }
    else if (k === 'j') step(1);
    else if (k === 'k') step(-1);
    else if (k === 'q') setQuiz(!document.body.classList.contains('quiz'));
    else if (k === 'm') { if (currentProblem) toggleDone(currentProblem); else toast('Scroll to a problem first'); }
    else if (k === 'escape') closeNav();
  });

  /* ---------- animated stat counters (works with any .stat b[data-count] on the page) ---------- */
  if ($('stSteps')) $('stSteps').dataset.count = 109;
  if ($('stFigs')) $('stFigs').dataset.count = 20;
  if ($('stChecks')) $('stChecks').dataset.count = 49;
  if ($('stDists')) $('stDists').dataset.count = 16;
  document.querySelectorAll('.stat b[data-count]').forEach((el, i) => {
    const end = +el.dataset.count; el.textContent = end;
    if (reduce) return;
    const t0 = performance.now() + 150 + i * 110, dur = 1100;
    const tick = now => { const p = Math.max(0, Math.min(1, (now - t0) / dur)); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });

  /* ---------- theme changes: let page-specific scripts (ridgeline, bridge, canvases) repaint ---------- */
  const rethemed = () => { window.Atlas.retheme.forEach(fn => { try { fn(); } catch (e) { /* ignore */ } }); };
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', rethemed);
  new MutationObserver(rethemed).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* ---------- cursor glow, tile tilt, slider fill ---------- */
  document.querySelectorAll('figure.lab, a.tile, a.course, .problem, .ck, .ctx, .bridge-detail, .tools').forEach(el => el.classList.add('glow'));
  let gq = null, gPending = false;
  document.addEventListener('pointermove', e => {
    gq = e; if (gPending) return; gPending = true;
    requestAnimationFrame(() => {
      gPending = false; const ev = gq; if (!ev) return;
      const el = ev.target.closest && ev.target.closest('.glow');
      if (el) { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', (ev.clientX - r.left) + 'px'); el.style.setProperty('--my', (ev.clientY - r.top) + 'px'); }
      if (!reduce) {
        const t = ev.target.closest && ev.target.closest('a.tile');
        document.querySelectorAll('a.tile.tilt').forEach(x => { if (x !== t) { x.classList.remove('tilt'); x.style.removeProperty('--rx'); x.style.removeProperty('--ry'); } });
        if (t) { const r = t.getBoundingClientRect(), px = (ev.clientX - r.left) / r.width - 0.5, py = (ev.clientY - r.top) / r.height - 0.5; t.classList.add('tilt'); t.style.setProperty('--ry', (px * 9).toFixed(2) + 'deg'); t.style.setProperty('--rx', (-py * 9).toFixed(2) + 'deg'); }
      }
    });
  }, { passive: true });
  const ranges = () => document.querySelectorAll('input[type=range]');
  const fillRange = el => { const mn = +el.min || 0, mx = +el.max || 100, v = +el.value; el.style.setProperty('--pct', ((v - mn) / (mx - mn) * 100).toFixed(2) + '%'); };
  document.addEventListener('input', e => { if (e.target.matches && e.target.matches('input[type=range]')) fillRange(e.target); }, true);
  ranges().forEach(fillRange);
  setInterval(() => ranges().forEach(fillRange), 250);

  /* ---------- audit filter (workbench.html only) ---------- */
  document.querySelectorAll('#auditChips .chip').forEach(c => c.addEventListener('click', () => {
    const f = c.dataset.f;
    const apply = () => {
      document.querySelectorAll('#auditTable tbody tr').forEach(r => { r.hidden = !(f === 'all' || r.dataset.src === f); });
      document.querySelectorAll('#auditChips .chip').forEach(x => x.setAttribute('aria-pressed', String(x === c)));
    };
    if (document.startViewTransition && !reduce) document.startViewTransition(apply); else apply();
  }));

  applyProgress();
  spy();
})();
