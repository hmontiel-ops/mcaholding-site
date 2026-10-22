// mcaholding.com.mx — page behaviour. No framework, no inline handlers (the
// Content-Security-Policy in vercel.json only allows this file to run).

(function () {
  'use strict';

  // Published Apps Script web app that returns { wins: [...] }. The section
  // stays hidden until it answers, so a failure costs nothing visible.
  const WINS_FEED_URL = 'https://script.google.com/macros/s/AKfycbyKl0-TlgZh1JamQhsUBZuTOOpgZ01tr06qiOZaLte1LWH7Qf0GbxCt5JajHC4EcZXl/exec';
  const WINS_FEED_TIMEOUT_MS = 8000;
  const ITEMS_PER_PAGE = 6;
  const LANG_KEY = 'mca-lang';

  const meta = {
    en: { title: 'MCA Holding | Google Workspace Consulting', description: 'MCA Holding specializes in Google Workspace implementations, optimization, and automation for businesses across Mexico.' },
    es: { title: 'MCA Holding | Consultoría de Google Workspace', description: 'MCA Holding se especializa en implementaciones, optimización y automatización de Google Workspace para empresas en México.' },
  };

  const stepsData = {
    en: [
      { title: 'Identify',    desc: 'We pinpoint bottlenecks in your current Google Workspace setup or infrastructure.',  task: 'We detect that legal contracts take 3 days to sign manually, slowing down critical operations.' },
      { title: 'Investigate', desc: 'Deep dive into the Google ecosystem to find the most practical tool for the job.',    task: 'We evaluate native Google Docs e-signatures to eliminate third-party software costs.' },
      { title: 'Select',      desc: 'Choosing the right configuration that fits your specific business culture.',          task: 'We choose the integrated e-signature feature to keep workflow data 100% secure in Drive.' },
      { title: 'Implement',   desc: 'The technical heavy lifting: migrations, automation, and seamless integration.',      task: 'We set up automated contract templates and train the legal team on live tracking.' },
      { title: 'Reflect',     desc: 'Measuring ROI and gathering feedback to start the next optimization cycle.',         task: 'Outcome: Contracts signed in 2 hours instead of 3 days. Total optimization achieved.' },
    ],
    es: [
      { title: 'Identificar',  desc: 'Detectamos cuellos de botella en tu configuración actual de Google Workspace.',          task: 'Detectamos que los contratos legales tardan 3 días en firmarse, frenando operaciones críticas.' },
      { title: 'Investigar',   desc: 'Profundizamos en el ecosistema de Google para encontrar la herramienta práctica.',       task: 'Evaluamos las firmas electrónicas nativas de Google Docs para eliminar costos de software.' },
      { title: 'Seleccionar',  desc: 'Elegimos la configuración que mejor se adapte a tu cultura empresarial.',                task: 'Elegimos la función nativa para mantener los datos del flujo 100% seguros en Drive.' },
      { title: 'Implementar',  desc: 'El trabajo técnico pesado: migraciones, automatización e integración.',                  task: 'Configuramos plantillas automatizadas y capacitamos al equipo legal.' },
      { title: 'Reflexionar',  desc: 'Medimos el ROI y recopilamos feedback para iniciar el siguiente ciclo de optimización.', task: 'Resultado: Contratos firmados en 2 horas en lugar de 3 días. Optimización total lograda.' },
    ],
  };
  const stepIcons = ['search', 'book-open', 'lightbulb', 'circle-check-big', 'refresh-ccw'];

  // Per-product colours for the wins cards (Tailwind classes; keep them literal so the build sees them).
  const productThemes = {
    'Gmail':       { icon: 'mail',           bg: 'bg-red-50',        border: 'border-red-200/70',     text: 'text-red-600',       accent: 'bg-red-200',     hover: 'hover:border-red-400' },
    'Calendar':    { icon: 'calendar',       bg: 'bg-blue-50',       border: 'border-blue-200/70',    text: 'text-blue-600',      accent: 'bg-blue-200',    hover: 'hover:border-blue-400' },
    'Spaces':      { icon: 'message-square', bg: 'bg-emerald-50',    border: 'border-emerald-200/70', text: 'text-emerald-600',   accent: 'bg-emerald-200', hover: 'hover:border-emerald-400' },
    'Apps Script': { icon: 'code-xml',       bg: 'bg-amber-50',      border: 'border-amber-200/70',   text: 'text-amber-600',     accent: 'bg-amber-200',   hover: 'hover:border-amber-400' },
    'Docs':        { icon: 'file-text',      bg: 'bg-indigo-50',     border: 'border-indigo-200/70',  text: 'text-indigo-600',    accent: 'bg-indigo-200',  hover: 'hover:border-indigo-400' },
    'Vids':        { icon: 'circle-play',    bg: 'bg-purple-50',     border: 'border-purple-200/70',  text: 'text-purple-600',    accent: 'bg-purple-200',  hover: 'hover:border-purple-400' },
    'Classroom':   { icon: 'graduation-cap', bg: 'bg-teal-50',       border: 'border-teal-200/70',    text: 'text-teal-600',      accent: 'bg-teal-200',    hover: 'hover:border-teal-400' },
    'Default':     { icon: 'zap',            bg: 'bg-brandOffWhite', border: 'border-brandSlate',     text: 'text-brandElectric', accent: 'bg-brandSlate',  hover: 'hover:border-brandElectric' },
  };

  const legalText = {
    en: {
      privacy: "<h2 id='modal-title' class='text-2xl font-bold uppercase tracking-tight text-brandNavy mb-6'>Privacy Policy</h2><p class='mb-4 text-slate-500'>At MCA Holding (mcaholding.com.mx), we respect your data. We only collect information strictly necessary for our consulting services.</p><h3 class='font-bold text-brandNavy mt-6 mb-2 uppercase text-[10px] tracking-widest'>Data Use</h3><p class='text-slate-500'>We operate within Google Cloud infrastructure. Your domain data is used only for implementation and optimization purposes.</p><h3 class='font-bold text-brandNavy mt-6 mb-2 uppercase text-[10px] tracking-widest'>This Website</h3><p class='text-slate-500'>This site sets no cookies and runs no analytics. Your language preference is kept in your own browser only.</p>",
      terms:   "<h2 id='modal-title' class='text-2xl font-bold uppercase tracking-tight text-brandNavy mb-6'>Terms of Service</h2><p class='mb-4 text-slate-500'>By using our services at mcaholding.com.mx, you agree to our practical approach to Workspace optimization.</p><h3 class='font-bold text-brandNavy mt-6 mb-2 uppercase text-[10px] tracking-widest'>Scope</h3><p class='text-slate-500'>Services include migrations, training, and admin management. Clients maintain full account ownership.</p>",
    },
    es: {
      privacy: "<h2 id='modal-title' class='text-2xl font-bold uppercase tracking-tight text-brandNavy mb-6'>Aviso de Privacidad</h2><p class='mb-4 text-slate-500'>En MCA Holding (mcaholding.com.mx), respetamos sus datos. Solo recolectamos información estrictamente necesaria para nuestros servicios de consultoría.</p><h3 class='font-bold text-brandNavy mt-6 mb-2 uppercase text-[10px] tracking-widest'>Uso de Datos</h3><p class='text-slate-500'>Operamos dentro de Google Cloud. Sus datos solo se usan para fines de implementación y optimización.</p><h3 class='font-bold text-brandNavy mt-6 mb-2 uppercase text-[10px] tracking-widest'>Este Sitio</h3><p class='text-slate-500'>Este sitio no usa cookies ni analítica. Su preferencia de idioma se guarda únicamente en su navegador.</p>",
      terms:   "<h2 id='modal-title' class='text-2xl font-bold uppercase tracking-tight text-brandNavy mb-6'>Términos de Servicio</h2><p class='mb-4 text-slate-500'>Al trabajar con MCA Holding (mcaholding.com.mx), acepta nuestro enfoque práctico de optimización.</p><h3 class='font-bold text-brandNavy mt-6 mb-2 uppercase text-[10px] tracking-widest'>Alcance</h3><p class='text-slate-500'>Los servicios incluyen optimización, gestión de consola y capacitación. El cliente mantiene la propiedad total de su cuenta.</p>",
    },
  };

  const $ = (id) => document.getElementById(id);
  const t = (en, es) => (currentLang === 'en' ? en : es);

  let currentLang = 'en';
  let activeStepIndex = 0;
  let winsList = [];
  let currentFilter = 'All';
  let currentPage = 1;
  let lastFocused = null;

  // ---------- Language ----------
  function detectLanguage() {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === 'en' || saved === 'es') return saved;
    } catch (_) { /* storage unavailable: fall through */ }
    return (navigator.language || '').toLowerCase().startsWith('es') ? 'es' : 'en';
  }

  function changeLanguage(lang, persist) {
    currentLang = lang;
    if (persist) { try { localStorage.setItem(LANG_KEY, lang); } catch (_) { /* ignore */ } }

    document.documentElement.lang = lang;
    document.title = meta[lang].title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', meta[lang].description);

    document.querySelectorAll('[data-en]').forEach((el) => { el.textContent = el.getAttribute('data-' + lang); });
    document.querySelectorAll('[data-aria-en]').forEach((el) => { el.setAttribute('aria-label', el.getAttribute('data-aria-' + lang)); });
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      const active = btn.dataset.lang === lang;
      btn.setAttribute('aria-pressed', String(active));
      btn.classList.toggle('bg-white', active);
      btn.classList.toggle('shadow-sm', active);
      btn.classList.toggle('text-brandElectric', active);
      btn.classList.toggle('text-slate-400', !active);
    });

    updateProcessContent();
    renderFilters();
    renderWins();
    if (!$('modal-container').classList.contains('hidden') && $('modal-container').dataset.type) {
      $('modal-content').innerHTML = legalText[lang][$('modal-container').dataset.type];
    }
  }

  // ---------- Process ----------
  function updateProcessContent() {
    const step = stepsData[currentLang][activeStepIndex];
    $('step-title').textContent = step.title;
    $('step-desc').textContent = step.desc;
    $('story-task').textContent = '"' + step.task + '"';
    $('step-icon').setAttribute('href', '#i-' + stepIcons[activeStepIndex]);
  }

  function setStep(index) {
    activeStepIndex = index;
    document.querySelectorAll('.process-btn').forEach((btn, i) => {
      btn.classList.toggle('step-active', i === index);
      btn.classList.toggle('opacity-50', i !== index);
      btn.setAttribute('aria-selected', String(i === index));
    });
    updateProcessContent();
  }

  // ---------- Practical wins ----------
  async function fetchWins() {
    if (!WINS_FEED_URL) return;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), WINS_FEED_TIMEOUT_MS);
    try {
      const res = await fetch(WINS_FEED_URL, { signal: controller.signal });
      if (!res.ok) throw new Error('Wins feed answered ' + res.status);
      const data = await res.json();
      winsList = Array.isArray(data.wins) ? data.wins.filter((w) => w && w.product) : [];
      if (winsList.length) {
        $('wins-section').classList.remove('hidden');
        document.querySelectorAll('.wins-link').forEach((el) => el.classList.remove('hidden'));
      }
      renderFilters();
      renderWins();
    } catch (err) {
      console.error('Practical wins feed unavailable:', err);
    } finally {
      clearTimeout(timer);
    }
  }

  function renderFilters() {
    const container = $('filter-container');
    if (!winsList.length) return;
    const products = ['All', ...new Set(winsList.map((w) => w.product))];
    container.replaceChildren();
    products.forEach((prod) => {
      const active = currentFilter === prod;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'px-5 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ' + (
        active ? 'bg-brandElectric text-white border-brandElectric shadow-sm'
               : 'bg-white text-slate-500 border-brandSlate hover:border-brandElectric hover:text-brandElectric');
      btn.setAttribute('aria-pressed', String(active));
      btn.textContent = prod === 'All' ? t('Show All', 'Ver Todo') : prod;
      btn.addEventListener('click', () => { currentFilter = prod; currentPage = 1; renderFilters(); renderWins(); });
      container.appendChild(btn);
    });
  }

  function icon(name, classes) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon ' + classes);
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#i-' + name);
    svg.appendChild(use);
    return svg;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  // Cards are built from DOM nodes, never from HTML strings, so feed content
  // is always rendered as text.
  function winCard(win) {
    const theme = productThemes[win.product] || productThemes.Default;
    const card = el('div', 'win-card bg-white rounded-3xl border border-brandSlate p-8 flex flex-col justify-between shadow-sm relative overflow-hidden ' + theme.hover);

    const top = el('div', 'mb-8');
    const head = el('div', 'flex items-center justify-between mb-6');
    const iconBox = el('div', 'w-12 h-12 ' + theme.bg + ' rounded-2xl flex items-center justify-center ' + theme.text + ' border ' + theme.border);
    iconBox.appendChild(icon(theme.icon, 'w-6 h-6'));
    head.appendChild(iconBox);
    head.appendChild(el('span', 'text-[9px] font-bold uppercase tracking-[0.2em] ' + theme.text + ' ' + theme.bg + ' px-3 py-1 rounded-full border ' + theme.border, win.product));
    top.appendChild(head);
    top.appendChild(el('h3', 'text-lg font-bold text-brandNavy mb-4 uppercase tracking-tight', t(win.title_en, win.title_es) || ''));
    top.appendChild(el('div', 'w-10 h-1 ' + theme.accent + ' rounded-full'));

    const outcome = el('div', theme.bg + ' rounded-2xl p-5 border ' + theme.border);
    outcome.appendChild(el('p', 'text-[9px] font-bold uppercase tracking-widest mb-2 ' + theme.text, t('Outcome', 'Resultado')));
    outcome.appendChild(el('p', 'text-sm leading-relaxed text-slate-700 italic', '"' + (t(win.impact_en, win.impact_es) || '') + '"'));

    card.appendChild(top);
    card.appendChild(outcome);
    return card;
  }

  function renderWins() {
    if (!winsList.length) return;
    const container = $('wins-container');
    const filtered = currentFilter === 'All' ? winsList : winsList.filter((w) => w.product === currentFilter);
    const total = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    currentPage = Math.min(Math.max(1, currentPage), total);
    const pageItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    $('page-indicator').textContent = t('Page', 'Página') + ' ' + currentPage + ' ' + t('of', 'de') + ' ' + total;
    $('prev-btn').disabled = currentPage === 1;
    $('next-btn').disabled = currentPage === total;
    container.replaceChildren(...pageItems.map(winCard));
  }

  function changePage(dir) { currentPage += dir; renderWins(); }

  // ---------- Legal modal ----------
  function openModal(type) {
    const container = $('modal-container');
    container.dataset.type = type;
    $('modal-content').innerHTML = legalText[currentLang][type];
    container.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    lastFocused = document.activeElement;
    $('modal-close').focus();
  }

  function closeModal() {
    const container = $('modal-container');
    if (container.classList.contains('hidden')) return;
    container.classList.add('hidden');
    delete container.dataset.type;
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  // ---------- Mobile menu ----------
  function setMenu(open) {
    $('mobile-menu').classList.toggle('hidden', !open);
    $('menu-btn').setAttribute('aria-expanded', String(open));
    $('menu-icon').querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
  }

  // ---------- Wire up ----------
  function init() {
    $('year').textContent = String(new Date().getFullYear());

    document.querySelectorAll('.lang-btn').forEach((btn) => btn.addEventListener('click', () => changeLanguage(btn.dataset.lang, true)));
    document.querySelectorAll('.process-btn').forEach((btn) => btn.addEventListener('click', () => setStep(Number(btn.dataset.step))));
    document.querySelectorAll('.legal-btn').forEach((btn) => btn.addEventListener('click', () => openModal(btn.dataset.legal)));
    $('prev-btn').addEventListener('click', () => changePage(-1));
    $('next-btn').addEventListener('click', () => changePage(1));
    $('modal-close').addEventListener('click', closeModal);
    $('modal-overlay').addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); setMenu(false); } });

    $('menu-btn').addEventListener('click', () => setMenu($('mobile-menu').classList.contains('hidden')));
    document.querySelectorAll('.menu-link').forEach((a) => a.addEventListener('click', () => setMenu(false)));

    changeLanguage(detectLanguage(), false);
    fetchWins();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
