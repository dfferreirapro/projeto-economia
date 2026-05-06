/* ============================================================
   EduMetrics Enterprise — script.js v3.0
   Landing page architecture
   ============================================================ */
'use strict';

(function () {

  /* ══════════════════════════════════════════════════════════
     DATASET: INVESTIMENTO (estimado por município)
     ══════════════════════════════════════════════════════════ */
  const INVESTIMENTOS = [
    { municipio: 'Sobral',              invest: 9500,  ano: 2023 },
    { municipio: 'São Caetano do Sul',  invest: 14200, ano: 2023 },
    { municipio: 'Jaraguá do Sul',      invest: 10800, ano: 2023 },
    { municipio: 'Pato Branco',         invest: 9200,  ano: 2023 },
    { municipio: 'PATO BRANCO',         invest: 9200,  ano: 2023 },
    { municipio: 'Marau',               invest: 8600,  ano: 2023 },
    { municipio: 'Sorocaba',            invest: 8100,  ano: 2023 },
    { municipio: 'SOROCABA',            invest: 8100,  ano: 2023 },
    { municipio: 'Votorantim',          invest: 7700,  ano: 2023 },
    { municipio: 'Brasília',            invest: 9100,  ano: 2023 },
    { municipio: 'BRASÍLIA',            invest: 9100,  ano: 2023 },
    { municipio: 'Cuiabá',              invest: 7400,  ano: 2023 },
    { municipio: 'Londrina',            invest: 8400,  ano: 2023 },
    { municipio: 'João Pessoa',         invest: 6600,  ano: 2023 },
    { municipio: 'Recife',              invest: 6800,  ano: 2023 },
    { municipio: 'RECIFE',              invest: 6800,  ano: 2023 },
    { municipio: 'Fortaleza',           invest: 6500,  ano: 2023 },
    { municipio: 'Rio Branco',          invest: 7200,  ano: 2023 },
    { municipio: 'São Luís',            invest: 6300,  ano: 2023 },
    { municipio: 'Teresina',            invest: 6100,  ano: 2023 },
    { municipio: 'Palmas',              invest: 8800,  ano: 2023 },
  ];

  /* ══════════════════════════════════════════════════════════
     DATASET: HISTÓRICO 2019 (estimado – pandemia)
     ══════════════════════════════════════════════════════════ */
  const HISTORICO_2019 = {
    'Sobral':             9.1,
    'São Caetano do Sul': 6.9,
    'Jaraguá do Sul':     6.8,
    'Pato Branco':        7.0,
    'PATO BRANCO':        7.0,
    'Marau':              5.8,
    'Sorocaba':           6.1,
    'SOROCABA':           6.1,
    'Votorantim':         6.2,
    'Brasília':           5.5,
    'BRASÍLIA':           5.5,
    'Cuiabá':             5.3,
    'Londrina':           6.6,
    'João Pessoa':        4.8,
    'Recife':             5.1,
    'RECIFE':             5.1,
    'Fortaleza':          5.4,
    'Rio Branco':         5.6,
    'São Luís':           4.9,
    'Teresina':           5.2,
    'Palmas':             5.8,
  };

  /* ══════════════════════════════════════════════════════════
     AI INSIGHTS MOCK DATA
     ══════════════════════════════════════════════════════════ */
  const AI_CITY_DATA = {
    'Sobral':             { pop: 232000, idh: 0.714, regiao: 'Nordeste', pib_per_capita: 18400, ranking_ideb: 1,  destaque: 'Referência nacional em gestão educacional municipal.' },
    'São Caetano do Sul': { pop: 165000, idh: 0.862, regiao: 'Sudeste',  pib_per_capita: 87300, ranking_ideb: 2,  destaque: 'Maior IDH municipal do Brasil; forte investimento em educação.' },
    'Jaraguá do Sul':     { pop: 192000, idh: 0.803, regiao: 'Sul',      pib_per_capita: 52100, ranking_ideb: 3,  destaque: 'Tradição industrial e alta participação do ensino privado de qualidade.' },
    'Pato Branco':        { pop: 88000,  idh: 0.817, regiao: 'Sul',      pib_per_capita: 41200, ranking_ideb: 4,  destaque: 'Modelo de gestão pública eficiente na educação paranaense.' },
    'PATO BRANCO':        { pop: 88000,  idh: 0.817, regiao: 'Sul',      pib_per_capita: 41200, ranking_ideb: 4,  destaque: 'Modelo de gestão pública eficiente na educação paranaense.' },
    'Sorocaba':           { pop: 723000, idh: 0.798, regiao: 'Sudeste',  pib_per_capita: 35600, ranking_ideb: 8,  destaque: 'Centro industrial com rede municipal consolidada e programas de alfabetização.' },
    'SOROCABA':           { pop: 723000, idh: 0.798, regiao: 'Sudeste',  pib_per_capita: 35600, ranking_ideb: 8,  destaque: 'Centro industrial com rede municipal consolidada e programas de alfabetização.' },
    'Votorantim':         { pop: 120000, idh: 0.769, regiao: 'Sudeste',  pib_per_capita: 29800, ranking_ideb: 9,  destaque: 'Município com forte parceria público-privada na educação.' },
    'Brasília':           { pop: 3094000,idh: 0.824, regiao: 'Centro-Oeste', pib_per_capita: 81400, ranking_ideb: 12, destaque: 'Capital federal com alta desigualdade educacional entre regiões administrativas.' },
    'BRASÍLIA':           { pop: 3094000,idh: 0.824, regiao: 'Centro-Oeste', pib_per_capita: 81400, ranking_ideb: 12, destaque: 'Capital federal com alta desigualdade educacional entre regiões administrativas.' },
    'Recife':             { pop: 1648000,idh: 0.772, regiao: 'Nordeste', pib_per_capita: 22100, ranking_ideb: 25, destaque: 'Avanços significativos após implementação do Pacto pela Educação em 2019.' },
    'RECIFE':             { pop: 1648000,idh: 0.772, regiao: 'Nordeste', pib_per_capita: 22100, ranking_ideb: 25, destaque: 'Avanços significativos após implementação do Pacto pela Educação em 2019.' },
    'Cuiabá':             { pop: 654000, idh: 0.785, regiao: 'Centro-Oeste', pib_per_capita: 31200, ranking_ideb: 18, destaque: 'Capital do Mato Grosso com crescimento acelerado e demanda por novas escolas.' },
    'João Pessoa':        { pop: 833000, idh: 0.763, regiao: 'Nordeste', pib_per_capita: 18900, ranking_ideb: 30, destaque: 'Programa municipal de educação integral em expansão desde 2020.' },
  };

  /* ══════════════════════════════════════════════════════════
     DATA DICTIONARY
     ══════════════════════════════════════════════════════════ */
  const DATA_DICT = [
    { field: 'inep_id',      name: 'Código INEP',     desc: 'Identificador único da escola no cadastro do INEP (Instituto Nacional de Estudos e Pesquisas Educacionais).', range: 'Numérico, 8 dígitos' },
    { field: 'nome_escola',  name: 'Nome da Escola',  desc: 'Denominação oficial da instituição de ensino conforme cadastro no Censo Escolar.', range: 'Texto' },
    { field: 'no_municipio', name: 'Município',        desc: 'Município sede da escola, conforme divisão administrativa do IBGE.', range: 'Texto' },
    { field: 'no_estado',    name: 'Estado',           desc: 'Unidade federativa (estado) onde a escola está localizada.', range: 'Texto' },
    { field: 'uf_estado',    name: 'UF',               desc: 'Sigla da Unidade Federativa (ex: SP, RJ, MG).', range: '2 caracteres' },
    { field: 'dependencia',  name: 'Dep. Administrativa', desc: 'Órgão responsável pela administração da escola: Municipal, Estadual ou Federal.', range: 'Municipal | Estadual | Federal' },
    { field: 'ano',          name: 'Ano de Referência', desc: 'Ano de coleta dos dados do IDEB. O IDEB é publicado a cada dois anos (anos ímpares).', range: 'Inteiro (ex: 2023)' },
    { field: 'ideb',         name: 'IDEB',             desc: 'Índice de Desenvolvimento da Educação Básica. Calculado como produto do Fluxo pelo Aprendizado padronizado.', range: '0.0 – 10.0 | null se sem dados' },
    { field: 'fluxo',        name: 'Fluxo',            desc: 'Taxa de aprovação escolar média entre as séries avaliadas. Representa a proporção de alunos que avançam sem reprovação ou abandono.', range: '0.0 – 1.0' },
    { field: 'aprendizado',  name: 'Aprendizado',      desc: 'Nota padronizada do SAEB (0–10), derivada da média das proficiências em LP e Matemática.', range: '0.0 – 10.0' },
    { field: 'nota_mt',      name: 'Nota SAEB MT',     desc: 'Proficiência média em Matemática medida pelo SAEB, na escala de proficiência do INEP.', range: '~150 – 350' },
    { field: 'nota_lp',      name: 'Nota SAEB LP',     desc: 'Proficiência média em Língua Portuguesa medida pelo SAEB, na escala de proficiência do INEP.', range: '~150 – 350' },
  ];

  /* ══════════════════════════════════════════════════════════
     TEAM DATA
     ══════════════════════════════════════════════════════════ */
  const TEAM = [
    {
      name: 'Douglas Ferreira',
      role: 'Estudante de Cientista de Dados',
      bio: 'Especialista em análise de dados educacionais e políticas públicas. Mestre em Ciência da Computação pela USP.',
      linkedin: 'https://linkedin.com/in/-----',
      initials: 'AB',
    },
    {
      name: 'Gabriel Ferreira',
      role: 'Estudante de Ciencia de dados',
      bio: 'Engenheiro de software com foco em visualização de dados e dashboards interativos. 5 anos de experiência.',
      linkedin: 'https://linkedin.com/in/-----',
      initials: 'CE',
    },
    {
      name: 'Mateus Mariano',
      role: 'Estudante de Ciencia de dados',
      bio: 'Designer de produto especializada em interfaces de análise de dados e acessibilidade digital.',
      linkedin: 'https://linkedin.com/in/----',
      initials: 'PM',
    }
  ];

  /* ══════════════════════════════════════════════════════════
     STATE
     ══════════════════════════════════════════════════════════ */
  let allData = [];
  let filtered = [];
  let sortKey = 'ideb';
  let sortDir = 'desc';
  let currentPage = 1;
  const PAGE_SIZE = 25;

  const charts = {};

  /* ══════════════════════════════════════════════════════════
     CHART GLOBAL DEFAULTS
     ══════════════════════════════════════════════════════════ */
  function applyChartDefaults() {
    const isDark = document.documentElement.classList.contains('theme-dark') ||
                   document.body.classList.contains('theme-dark');
    Chart.defaults.color          = isDark ? '#7b83a6' : '#4a5178';
    Chart.defaults.borderColor    = isDark ? 'rgba(35,41,68,.7)' : 'rgba(200,204,224,.6)';
    Chart.defaults.font.family    = "'DM Sans', sans-serif";
    Chart.defaults.font.size      = 12;
  }

  applyChartDefaults();

  function getGridColor() {
    return document.body.classList.contains('theme-light') ? 'rgba(200,204,224,.6)' : 'rgba(35,41,68,.7)';
  }

  function getTickColor() {
    return document.body.classList.contains('theme-light') ? '#8890b0' : '#404868';
  }

  /* ══════════════════════════════════════════════════════════
     PALETTES
     ══════════════════════════════════════════════════════════ */
  const PALETTE = [
    'rgba(110,231,183,.75)', 'rgba(129,140,248,.75)', 'rgba(251,191,36,.75)',
    'rgba(249,168,212,.75)', 'rgba(167,139,250,.75)', 'rgba(251,146,60,.75)',
    'rgba(94,234,212,.75)',  'rgba(253,186,116,.75)', 'rgba(196,181,253,.75)',
    'rgba(134,239,172,.75)', 'rgba(253,224,71,.75)',  'rgba(248,113,113,.75)',
  ];

  const BORDER_PALETTE = PALETTE.map(c => c.replace('.75)', '1)'));

  const DEP_COLOR = {
    Municipal: { bg: 'rgba(110,231,183,.7)', border: '#6ee7b7' },
    Estadual:  { bg: 'rgba(129,140,248,.7)', border: '#818cf8' },
    Federal:   { bg: 'rgba(251,191,36,.7)',  border: '#fbbf24' },
  };

  const CMP_COLORS = [
    { bg: 'rgba(110,231,183,.7)', border: '#6ee7b7', hex: '#6ee7b7' },
    { bg: 'rgba(129,140,248,.7)', border: '#818cf8', hex: '#818cf8' },
    { bg: 'rgba(251,191,36,.7)',  border: '#fbbf24', hex: '#fbbf24' },
  ];

  /* ══════════════════════════════════════════════════════════
     DOM REFS
     ══════════════════════════════════════════════════════════ */
  const $ = id => document.getElementById(id);

  const cityFilter    = $('cityFilter');
  const depFilter     = $('depFilter');
  const idebFilter    = $('idebFilter');
  const hasIdebToggle = $('hasIdebToggle');
  const searchInput   = $('searchInput');
  const sortSelect    = $('sortSelect');
  const tableBody     = $('tableBody');
  const toast         = $('toast');
  const themeToggle   = $('themeToggle');
  const filterToggle  = $('filterToggle');
  const filterContent = $('filterContent');
  const mobileMenuToggle = $('mobileMenuToggle');
  const navbarLinks   = $('navbarLinks');

  /* ══════════════════════════════════════════════════════════
     THEME SYSTEM
     ══════════════════════════════════════════════════════════ */
  function setTheme(dark) {
    const cl = document.body.classList;
    const hl = document.documentElement.classList;
    if (dark) {
      cl.remove('theme-light'); cl.add('theme-dark');
      hl.remove('theme-light'); hl.add('theme-dark');
      themeToggle.textContent = '🌙';
    } else {
      cl.remove('theme-dark');  cl.add('theme-light');
      hl.remove('theme-dark'); hl.add('theme-light');
      themeToggle.textContent = '☀️';
    }
    localStorage.setItem('edu-theme', dark ? 'dark' : 'light');
    applyChartDefaults();
    setTimeout(() => { renderCharts(); renderInvestmentCharts(); }, 50);
  }

  const savedTheme = localStorage.getItem('edu-theme');
  setTheme(savedTheme !== 'light');

  themeToggle.addEventListener('click', () => {
    setTheme(document.body.classList.contains('theme-light'));
  });

  /* ══════════════════════════════════════════════════════════
     FILTER BAR TOGGLE
     ══════════════════════════════════════════════════════════ */
  filterToggle.addEventListener('click', () => {
    filterToggle.classList.toggle('open');
    filterContent.classList.toggle('open');
  });

  /* ══════════════════════════════════════════════════════════
     MOBILE MENU TOGGLE
     ══════════════════════════════════════════════════════════ */
  mobileMenuToggle.addEventListener('click', () => {
    navbarLinks.classList.toggle('open');
  });

  document.addEventListener('click', e => {
    if (navbarLinks.classList.contains('open') &&
        !navbarLinks.contains(e.target) && e.target !== mobileMenuToggle) {
      navbarLinks.classList.remove('open');
    }
  });

  /* ══════════════════════════════════════════════════════════
     SMOOTH SCROLL NAV LINKS + ACTIVE STATE
     ══════════════════════════════════════════════════════════ */
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      navbarLinks.classList.remove('open');
    });
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll('.content-section, .hero-section');
  const navLinksAll = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 140;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    navLinksAll.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', debounce(updateActiveNav, 100), { passive: true });

  /* ══════════════════════════════════════════════════════════
     RENDER INVESTMENT ON SCROLL (IntersectionObserver)
     ══════════════════════════════════════════════════════════ */
  let investmentRendered = false;
  const panoramaSection = $('panorama');

  if (panoramaSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !investmentRendered) {
          investmentRendered = true;
          renderInvestmentCharts();
        }
      });
    }, { threshold: 0.1 });
    observer.observe(panoramaSection);
  }

  /* ══════════════════════════════════════════════════════════
     RENDER TEAM & DICTIONARY ON SCROLL
     ══════════════════════════════════════════════════════════ */
  let teamRendered = false;
  let dictRendered = false;

  if ('IntersectionObserver' in window) {
    const teamObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !teamRendered) {
          teamRendered = true;
          renderTeam();
        }
      });
    }, { threshold: 0.1 });
    const teamEl = $('equipe');
    if (teamEl) teamObserver.observe(teamEl);

    const dictObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !dictRendered) {
          dictRendered = true;
          renderDictionary();
        }
      });
    }, { threshold: 0.1 });
    const metodEl = $('metodologia');
    if (metodEl) dictObserver.observe(metodEl);
  }

  /* ══════════════════════════════════════════════════════════
     BOOTSTRAP — LOAD DATA
     ══════════════════════════════════════════════════════════ */
  fetch('base_escolas_tratada.json')
    .then(r => { if (!r.ok) throw new Error('Erro ao buscar dados'); return r.json(); })
    .then(raw => {
      allData = raw.map(d => ({
        inep_id:      d.inep_id,
        nome_escola:  d.nome_escola,
        no_municipio: normCity(d.no_municipio),
        no_estado:    d.no_estado,
        uf_estado:    d.uf_estado,
        dependencia:  d.dependencia,
        ano:          d.ano,
        ideb:         d.ideb,
        fluxo:        d.fluxo,
        aprendizado:  d.aprendizado,
        nota_lp:      d.nota_lp,
        nota_mt:      d.nota_mt,
      }));
      filtered = [...allData];
      initFilters();
      applyFilters();
      showToast(`${allData.length} escolas carregadas ✓`);
    })
    .catch(err => {
      console.error(err);
      showToast('Em desenvolvimento.', true);
    });

  function normCity(name) {
    if (!name) return '';
    const m = {
      'SOROCABA': 'Sorocaba',
      'BRASÍLIA':  'Brasília',
      'RECIFE':    'Recife',
      'PATO BRANCO': 'Pato Branco',
    };
    return m[name] || name;
  }

  /* ══════════════════════════════════════════════════════════
     FILTER INITIALIZATION
     ══════════════════════════════════════════════════════════ */
  function initFilters() {
    const cities = [...new Set(allData.map(s => s.no_municipio))].sort();

    cities.forEach(c => {
      cityFilter.appendChild(opt(c, c));
    });

    // Compare dropdowns
    ['compareCity1', 'compareCity2', 'compareCity3'].forEach(id => {
      const sel = $(id);
      cities.forEach(c => sel.appendChild(opt(c, c)));
    });

    $('compareCity1').value = 'Sorocaba';
    $('compareCity2').value = 'Votorantim';

    ['compareCity1', 'compareCity2', 'compareCity3'].forEach(id => {
      $(id)?.addEventListener('change', renderCompare);
    });
  }

  function opt(val, label) {
    const o = document.createElement('option');
    o.value = val; o.textContent = label; return o;
  }

  /* ══════════════════════════════════════════════════════════
     FILTERS
     ══════════════════════════════════════════════════════════ */
  function applyFilters() {
    const city    = cityFilter.value;
    const dep     = depFilter.value;
    const idebRng = idebFilter.value;
    const onlyIdeb = hasIdebToggle.checked;
    const search  = searchInput.value.trim().toLowerCase();

    filtered = allData.filter(s => {
      if (city   && s.no_municipio !== city)    return false;
      if (dep    && s.dependencia  !== dep)     return false;
      if (search && !s.nome_escola.toLowerCase().includes(search)) return false;
      if (onlyIdeb && s.ideb == null)           return false;
      if (idebRng === 'high'   && !(s.ideb >= 7))              return false;
      if (idebRng === 'mid'    && !(s.ideb >= 5 && s.ideb < 7)) return false;
      if (idebRng === 'low'    && !(s.ideb != null && s.ideb < 5)) return false;
      if (idebRng === 'nodata' && s.ideb != null)              return false;
      return true;
    });

    sortFiltered();
    currentPage = 1;
    render();
  }

  function sortFiltered() {
    filtered.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'string') { av = av.toLowerCase(); bv = (bv||'').toLowerCase(); }
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }

  $('clearFilters').addEventListener('click', () => {
    cityFilter.value = depFilter.value = idebFilter.value = '';
    hasIdebToggle.checked = false;
    searchInput.value = '';
    applyFilters();
  });

  [cityFilter, depFilter, idebFilter].forEach(el => el.addEventListener('change', applyFilters));
  hasIdebToggle.addEventListener('change', applyFilters);
  searchInput.addEventListener('input', debounce(applyFilters, 250));

  sortSelect.addEventListener('change', () => {
    const parts = sortSelect.value.split('_');
    const keyParts = parts.slice(0, -1).join('_');
    sortKey = keyParts; sortDir = parts[parts.length - 1];
    sortFiltered(); renderTable();
  });

  document.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (sortKey === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      else { sortKey = col; sortDir = 'desc'; }
      document.querySelectorAll('th.sortable').forEach(t => t.classList.remove('asc', 'desc'));
      th.classList.add(sortDir);
      sortFiltered(); renderTable();
    });
  });

  $('prevPage').addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderTable(); } });
  $('nextPage').addEventListener('click', () => {
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    if (currentPage < totalPages) { currentPage++; renderTable(); }
  });

  /* ══════════════════════════════════════════════════════════
     RENDER ALL
     ══════════════════════════════════════════════════════════ */
  function render() {
    renderKPIs();
    renderDist();
    renderCharts();
    renderTable();
    $('schoolCount').textContent = `${filtered.length} escola${filtered.length !== 1 ? 's' : ''}`;
    $('resultCount').textContent = `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`;
    renderLegend();
  }

  /* ══════════════════════════════════════════════════════════
     KPIs
     ══════════════════════════════════════════════════════════ */
  function renderKPIs() {
    const n = filtered.length;
    if (!n) {
      ['idebAverage','lpAverage','mtAverage','totalSchools','fluxoAverage','maxIdeb']
        .forEach(id => { const el = $(id); if (el) el.textContent = '—'; });
      return;
    }

    const withIdeb = filtered.filter(s => s.ideb != null);
    const withNotes = filtered.filter(s => s.nota_lp != null);

    const avg = (arr, key) => arr.length ? arr.reduce((s, x) => s + (x[key] || 0), 0) / arr.length : null;

    $('idebAverage').textContent = withIdeb.length ? avg(withIdeb, 'ideb').toFixed(2) : '—';
    $('idebSub').textContent = `${withIdeb.length} escolas com dados`;
    $('lpAverage').textContent  = withNotes.length ? avg(withNotes, 'nota_lp').toFixed(1) : '—';
    $('mtAverage').textContent  = withNotes.length ? avg(withNotes, 'nota_mt').toFixed(1) : '—';
    $('totalSchools').textContent = n.toLocaleString('pt-BR');
    $('schoolsSub').textContent = `${withIdeb.length} com IDEB`;

    const withFluxo = filtered.filter(s => s.fluxo != null);
    $('fluxoAverage').textContent = withFluxo.length ? (avg(withFluxo, 'fluxo') * 100).toFixed(1) + '%' : '—';

    if (withIdeb.length) {
      const best = withIdeb.reduce((a, b) => b.ideb > a.ideb ? b : a);
      $('maxIdeb').textContent = best.ideb.toFixed(1);
      $('maxIdebSchool').textContent = best.nome_escola.substring(0, 28) + (best.nome_escola.length > 28 ? '…' : '');
    } else {
      $('maxIdeb').textContent = '—';
      $('maxIdebSchool').textContent = '—';
    }
  }

  /* ══════════════════════════════════════════════════════════
     DISTRIBUTION BARS
     ══════════════════════════════════════════════════════════ */
  function renderDist() {
    const n = filtered.length;
    $('dist-count').textContent = n ? `(${n} escolas)` : '';

    const bars = $('distBars');
    bars.innerHTML = '';

    const deps = ['Municipal', 'Estadual', 'Federal'];
    deps.forEach(dep => {
      const count = filtered.filter(s => s.dependencia === dep).length;
      const pct   = n ? Math.round((count / n) * 100) : 0;
      const withIdeb = filtered.filter(s => s.dependencia === dep && s.ideb != null);
      const avgIdeb  = withIdeb.length ? (withIdeb.reduce((s,x) => s + x.ideb, 0) / withIdeb.length).toFixed(2) : '—';

      bars.insertAdjacentHTML('beforeend', `
        <div class="dist-item">
          <div class="dist-row">
            <span class="dist-name">${dep}</span>
            <span class="dist-pct">${pct}%</span>
          </div>
          <div class="dist-bar-bg">
            <div class="dist-bar-fill" style="width:${pct}%"></div>
          </div>
          <div class="dist-count">${count} escolas · IDEB médio: ${avgIdeb}</div>
        </div>
      `);
    });
  }

  /* ══════════════════════════════════════════════════════════
     LEGEND STRIP
     ══════════════════════════════════════════════════════════ */
  function renderLegend() {
    const strip = $('legendStrip');
    if (!strip) return;
    const deps = [...new Set(filtered.map(s => s.dependencia))].sort();
    strip.innerHTML = deps.map(d => {
      const c = DEP_COLOR[d] || { hex: '#999' };
      const hex = c.border;
      return `<span class="legend-dot" style="background:${hex}"></span> ${d}`;
    }).join('<span style="margin-left:16px"></span>');
  }

  /* ══════════════════════════════════════════════════════════
     CHARTS
     ══════════════════════════════════════════════════════════ */
  function destroyChart(name) {
    if (charts[name]) { charts[name].destroy(); delete charts[name]; }
  }

  function ctx(id) { const el = $(id); return el ? el.getContext('2d') : null; }

  function renderCharts() {
    renderIdebBar();
    renderIdebCityChart();
    renderSaebCityChart();
    renderIdebDepChart();
    renderScatter();
  }

  /* ── 1. IDEB por escola (top 40) ── */
  function renderIdebBar() {
    destroyChart('idebBar');
    const withIdeb = [...filtered].filter(s => s.ideb != null).sort((a, b) => b.ideb - a.ideb).slice(0, 40);
    if (!withIdeb.length) return;

    const labels = withIdeb.map(s => truncate(s.nome_escola, 22));
    const values = withIdeb.map(s => s.ideb);
    const colors = withIdeb.map(s => DEP_COLOR[s.dependencia]?.bg || 'rgba(200,200,200,.5)');
    const borders= withIdeb.map(s => DEP_COLOR[s.dependencia]?.border || '#aaa');
    const avgAll  = values.reduce((a,b) => a+b, 0) / values.length;

    const c = ctx('idebBarChart'); if (!c) return;
    charts.idebBar = new Chart(c, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'IDEB',
            data: values,
            backgroundColor: colors,
            borderColor: borders,
            borderWidth: 1,
            borderRadius: 4,
          },
          {
            label: `Média filtro (${avgAll.toFixed(2)})`,
            data: Array(values.length).fill(avgAll),
            type: 'line',
            borderColor: 'rgba(129,140,248,.8)',
            borderWidth: 1.5,
            borderDash: [6,3],
            pointRadius: 0,
            fill: false,
            tension: 0,
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top', labels: { boxWidth: 12, filter: i => i.datasetIndex === 1 } },
          tooltip: { callbacks: {
            title: items => withIdeb[items[0].dataIndex]?.nome_escola,
            label: item => item.datasetIndex === 0
              ? `IDEB: ${item.raw} · ${withIdeb[item.dataIndex]?.dependencia} · ${withIdeb[item.dataIndex]?.no_municipio}`
              : `Média: ${avgAll.toFixed(2)}`
          }}
        },
        scales: {
          y: { min: 0, max: 10, grid: { color: getGridColor() }, ticks: { color: getTickColor() } },
          x: { grid: { display: false }, ticks: { maxRotation: 45, color: getTickColor(), font: { size: 10 } } }
        }
      }
    });
  }

  /* ── 2. IDEB médio por cidade (top 15) ── */
  function renderIdebCityChart() {
    destroyChart('idebCity');
    const cityMap = {};
    filtered.filter(s => s.ideb != null).forEach(s => {
      if (!cityMap[s.no_municipio]) cityMap[s.no_municipio] = [];
      cityMap[s.no_municipio].push(s.ideb);
    });

    const entries = Object.entries(cityMap).map(([city, vals]) => ({
      city,
      avg: vals.reduce((a,b) => a+b, 0) / vals.length,
      count: vals.length
    })).sort((a, b) => b.avg - a.avg).slice(0, 15);

    if (!entries.length) return;

    const c = ctx('idebCityChart'); if (!c) return;
    charts.idebCity = new Chart(c, {
      type: 'bar',
      data: {
        labels: entries.map(e => e.city),
        datasets: [{
          label: 'IDEB Médio',
          data: entries.map(e => +e.avg.toFixed(2)),
          backgroundColor: entries.map((_, i) => PALETTE[i % PALETTE.length]),
          borderColor: entries.map((_, i) => BORDER_PALETTE[i % BORDER_PALETTE.length]),
          borderWidth: 1,
          borderRadius: 6,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: {
            label: (item) => {
              const e = entries[item.dataIndex];
              return `IDEB: ${item.raw} (${e.count} escola${e.count !== 1 ? 's' : ''})`;
            }
          }}
        },
        scales: {
          x: { min: 0, max: 10, grid: { color: getGridColor() }, ticks: { color: getTickColor() } },
          y: { grid: { display: false }, ticks: { color: getTickColor(), font: { size: 11 } } }
        }
      }
    });
  }

  /* ── 3. SAEB LP e MT por cidade (top 10) ── */
  function renderSaebCityChart() {
    destroyChart('saebCity');
    const cityMap = {};
    filtered.filter(s => s.nota_lp != null).forEach(s => {
      if (!cityMap[s.no_municipio]) cityMap[s.no_municipio] = { lp: [], mt: [] };
      cityMap[s.no_municipio].lp.push(s.nota_lp);
      cityMap[s.no_municipio].mt.push(s.nota_mt || 0);
    });

    const entries = Object.entries(cityMap).map(([city, v]) => ({
      city,
      lp: v.lp.reduce((a,b) => a+b, 0) / v.lp.length,
      mt: v.mt.reduce((a,b) => a+b, 0) / v.mt.length,
    })).sort((a, b) => b.lp - a.lp).slice(0, 10);

    if (!entries.length) return;

    const c = ctx('saebCityChart'); if (!c) return;
    charts.saebCity = new Chart(c, {
      type: 'bar',
      data: {
        labels: entries.map(e => e.city),
        datasets: [
          {
            label: 'LP',
            data: entries.map(e => +e.lp.toFixed(1)),
            backgroundColor: 'rgba(110,231,183,.6)',
            borderColor: '#6ee7b7', borderWidth: 1, borderRadius: 4,
          },
          {
            label: 'Matemática',
            data: entries.map(e => +e.mt.toFixed(1)),
            backgroundColor: 'rgba(129,140,248,.6)',
            borderColor: '#818cf8', borderWidth: 1, borderRadius: 4,
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } },
        scales: {
          y: { grid: { color: getGridColor() }, ticks: { color: getTickColor() } },
          x: { grid: { display: false }, ticks: { color: getTickColor(), maxRotation: 35, font: { size: 10 } } }
        }
      }
    });
  }

  /* ── 4. IDEB por Dep. Adm. ── */
  function renderIdebDepChart() {
    destroyChart('idebDep');
    const deps = ['Municipal', 'Estadual', 'Federal'];
    const vals  = deps.map(dep => {
      const arr = filtered.filter(s => s.dependencia === dep && s.ideb != null);
      return arr.length ? +(arr.reduce((a,b) => a + b.ideb, 0) / arr.length).toFixed(2) : null;
    });

    const c = ctx('idebDepChart'); if (!c) return;
    charts.idebDep = new Chart(c, {
      type: 'bar',
      data: {
        labels: deps,
        datasets: [{
          label: 'IDEB Médio',
          data: vals,
          backgroundColor: deps.map(d => DEP_COLOR[d]?.bg),
          borderColor: deps.map(d => DEP_COLOR[d]?.border),
          borderWidth: 1, borderRadius: 8,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: item => `IDEB médio: ${item.raw}` } }
        },
        scales: {
          y: { min: 0, max: 10, grid: { color: getGridColor() }, ticks: { color: getTickColor() } },
          x: { grid: { display: false }, ticks: { color: getTickColor() } }
        }
      }
    });
  }

  /* ── 5. Scatter IDEB × Fluxo ── */
  function renderScatter() {
    destroyChart('scatter');
    const deps = ['Municipal', 'Estadual', 'Federal'].filter(d => filtered.some(s => s.dependencia === d));

    const datasets = deps.map(dep => ({
      label: dep,
      data: filtered
        .filter(s => s.dependencia === dep && s.ideb != null && s.fluxo != null)
        .map(s => ({ x: s.ideb, y: +(s.fluxo * 100).toFixed(1), nome: s.nome_escola, city: s.no_municipio })),
      backgroundColor: DEP_COLOR[dep].bg,
      borderColor: DEP_COLOR[dep].border,
      borderWidth: 1,
      pointRadius: 5,
      pointHoverRadius: 8,
    }));

    const c = ctx('scatterChart'); if (!c) return;
    charts.scatter = new Chart(c, {
      type: 'scatter',
      data: { datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12 } },
          tooltip: { callbacks: {
            label: item => `${item.raw.nome} (${item.raw.city}) — IDEB ${item.raw.x}, Fluxo ${item.raw.y}%`
          }}
        },
        scales: {
          x: { title: { display: true, text: 'IDEB', color: getTickColor() }, grid: { color: getGridColor() }, ticks: { color: getTickColor() } },
          y: { title: { display: true, text: 'Fluxo / Aprovação (%)', color: getTickColor() }, grid: { color: getGridColor() }, ticks: { color: getTickColor(), callback: v => v + '%' } }
        }
      }
    });
  }

  /* ══════════════════════════════════════════════════════════
     TABLE WITH PAGINATION
     ══════════════════════════════════════════════════════════ */
  function renderTable() {
    tableBody.innerHTML = '';
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const start = (currentPage - 1) * PAGE_SIZE;
    const page  = filtered.slice(start, start + PAGE_SIZE);

    $('paginationInfo').textContent = `Página ${currentPage} de ${Math.max(1, totalPages)} · ${filtered.length} registros`;
    $('prevPage').disabled = currentPage <= 1;
    $('nextPage').disabled = currentPage >= totalPages;

    if (!page.length) {
      tableBody.innerHTML = `<tr><td colspan="10">
        <div class="empty-state">
          <div class="empty-icon">◌</div>
          <p>Nenhuma escola encontrada com os filtros selecionados.</p>
        </div></td></tr>`;
      return;
    }

    const frag = document.createDocumentFragment();
    page.forEach((s, i) => {
      const tr = document.createElement('tr');
      if (s.ideb >= 8) tr.classList.add('highlight-row');

      const idebClass = s.ideb == null ? 'ideb-na' : s.ideb >= 7 ? 'ideb-high' : s.ideb >= 5 ? 'ideb-mid' : 'ideb-low';
      const idebText  = s.ideb != null ? s.ideb.toFixed(1) : '—';

      const fluxoPct  = s.fluxo  != null ? (s.fluxo * 100).toFixed(1) + '%' : '—';
      const lpText    = s.nota_lp != null ? s.nota_lp.toFixed(1) : '—';
      const mtText    = s.nota_mt != null ? s.nota_mt.toFixed(1) : '—';
      const aprText   = s.aprendizado != null ? s.aprendizado.toFixed(2) : '—';

      const depClass = `dep-${s.dependencia}`;

      tr.innerHTML = `
        <td><span class="rank-badge">${start + i + 1}</span></td>
        <td><span class="school-name" title="${s.nome_escola}">${s.nome_escola}</span></td>
        <td style="color:var(--text-muted)">${s.no_municipio}</td>
        <td style="font-family:var(--font-mono);font-size:.72rem;color:var(--text-dim)">${s.uf_estado}</td>
        <td><span class="dep-pill ${depClass}">${s.dependencia}</span></td>
        <td><span class="ideb-val ${idebClass}">${idebText}</span></td>
        <td style="font-family:var(--font-mono);font-size:.8rem">${lpText}</td>
        <td style="font-family:var(--font-mono);font-size:.8rem">${mtText}</td>
        <td>
          <div class="mini-bar-wrap">
            <div class="mini-bar-bg">
              <div class="mini-bar-fill" style="width:${s.fluxo != null ? (s.fluxo * 100) : 0}%"></div>
            </div>
            <span style="font-family:var(--font-mono);font-size:.74rem">${fluxoPct}</span>
          </div>
        </td>
        <td style="font-family:var(--font-mono);font-size:.8rem">${aprText}</td>
      `;
      frag.appendChild(tr);
    });
    tableBody.appendChild(frag);
  }

  /* ══════════════════════════════════════════════════════════
     COMPARATIVO DE CIDADES
     ══════════════════════════════════════════════════════════ */
  function aggregateCity(city) {
    const schools = allData.filter(s => s.no_municipio === city);
    if (!schools.length) return null;
    const withIdeb  = schools.filter(s => s.ideb != null);
    const withLp    = schools.filter(s => s.nota_lp != null);
    const withFluxo = schools.filter(s => s.fluxo != null);
    const avg = (arr, key) => arr.length ? arr.reduce((s, x) => s + (x[key] || 0), 0) / arr.length : 0;
    const depDist = {};
    schools.forEach(s => depDist[s.dependencia] = (depDist[s.dependencia] || 0) + 1);
    return {
      city, n: schools.length,
      ideb:    +avg(withIdeb, 'ideb').toFixed(2),
      nota_lp: +avg(withLp, 'nota_lp').toFixed(1),
      nota_mt: +avg(withLp, 'nota_mt').toFixed(1),
      fluxo:   +(avg(withFluxo, 'fluxo') * 100).toFixed(1),
      aprendizado: +avg(withIdeb, 'aprendizado').toFixed(2),
      depDist, schools,
    };
  }

  function renderCompare() {
    const c1 = $('compareCity1')?.value;
    const c2 = $('compareCity2')?.value;
    const c3 = $('compareCity3')?.value;
    const selected = [c1, c2, c3].filter(Boolean);
    const valid = [...new Set(selected)];

    const empty = $('compareEmpty');
    const body  = $('compareBody');

    if (valid.length < 2) {
      empty.style.display = ''; body.style.display = 'none'; return;
    }

    const groups = valid.map((city, i) => ({ ...aggregateCity(city), color: CMP_COLORS[i] })).filter(g => g.n > 0);

    if (groups.length < 2) { empty.style.display = ''; body.style.display = 'none'; return; }

    empty.style.display = 'none'; body.style.display = 'flex';

    renderVersusCards(groups);
    renderRadarChart(groups);
    renderDepTable(groups);
  }

  const VERSUS_METRICS = [
    { key: 'ideb',       label: 'IDEB Médio',       format: v => v.toFixed(2), max: 10 },
    { key: 'nota_lp',    label: 'SAEB Língua Port.', format: v => v.toFixed(1), max: 350 },
    { key: 'nota_mt',    label: 'SAEB Matemática',   format: v => v.toFixed(1), max: 350 },
    { key: 'fluxo',      label: 'Taxa Aprovação',    format: v => v.toFixed(1) + '%', max: 100 },
    { key: 'aprendizado',label: 'Aprendizado',       format: v => v.toFixed(2), max: 10 },
  ];

  function renderVersusCards(groups) {
    const grid = $('versusGrid'); grid.innerHTML = '';
    VERSUS_METRICS.forEach(metric => {
      const values   = groups.map(g => g[metric.key]);
      const maxVal   = Math.max(...values);
      const isEqual  = values.every(v => v === values[0]);

      const card = document.createElement('div');
      card.className = 'versus-card' + (!isEqual ? ' has-leader' : '');
      card.innerHTML = `<div class="versus-card-title">${metric.label}</div>
        <div class="versus-rows">${groups.map((g) => {
          const val = g[metric.key];
          const pct = metric.max ? (val / metric.max) * 100 : (maxVal ? (val / maxVal) * 100 : 0);
          const isLeader = !isEqual && val === maxVal;
          return `<div class="versus-row">
            <span class="versus-city-name" style="color:${g.color.hex}">${g.city}${isLeader ? ' <span class="leader-badge">★</span>' : ''}</span>
            <div class="vbar-track">
              <div class="vbar-fill" style="width:${pct}%;background:${g.color.bg};border:1px solid ${g.color.border}"></div>
            </div>
            <span class="versus-val" style="color:${g.color.hex}">${metric.format(val)}</span>
          </div>`;
        }).join('')}</div>`;
      grid.appendChild(card);
    });
  }

  function renderRadarChart(groups) {
    destroyChart('radar');
    const RADAR_NORM = {
      ideb:    { mn: 0,   mx: 10  },
      nota_lp: { mn: 180, mx: 340 },
      nota_mt: { mn: 180, mx: 340 },
      fluxo:   { mn: 70,  mx: 100 },
      aprendizado: { mn: 0, mx: 10 },
    };
    function norm(val, key) {
      const { mn, mx } = RADAR_NORM[key];
      return Math.min(100, Math.max(0, ((val - mn) / (mx - mn)) * 100));
    }
    const labels = ['IDEB', 'SAEB LP', 'SAEB MT', '% Aprovação', 'Aprendizado'];
    const keys   = ['ideb', 'nota_lp', 'nota_mt', 'fluxo', 'aprendizado'];

    const c = ctx('radarChart'); if (!c) return;
    charts.radar = new Chart(c, {
      type: 'radar',
      data: {
        labels,
        datasets: groups.map(g => ({
          label: g.city,
          data: keys.map(k => norm(g[k], k)),
          backgroundColor: g.color.bg.replace('.7)', '.12)'),
          borderColor: g.color.border, borderWidth: 2,
          pointBackgroundColor: g.color.border, pointRadius: 4, pointHoverRadius: 6,
        }))
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12 } },
          tooltip: { callbacks: {
            label: item => {
              const g = groups[item.datasetIndex];
              const k = keys[item.dataIndex];
              const fmt = VERSUS_METRICS.find(m => m.key === k)?.format;
              return ` ${g.city}: ${fmt ? fmt(g[k]) : g[k]}`;
            }
          }}
        },
        scales: { r: {
          min: 0, max: 100,
          ticks: { display: false },
          grid: { color: getGridColor() },
          pointLabels: { color: getTickColor(), font: { size: 11 } },
          angleLines: { color: getGridColor() },
        }}
      }
    });
  }

  function renderDepTable(groups) {
    const head = $('infraCompareHead');
    const body = $('infraCompareBody');
    head.innerHTML = `<tr><th>Dep. Adm.</th>${groups.map(g => `<th style="color:${g.color.hex}">${g.city}</th>`).join('')}</tr>`;
    body.innerHTML = '';
    ['Municipal', 'Estadual', 'Federal'].forEach(dep => {
      const cells = groups.map(g => {
        const count = (g.depDist[dep] || 0);
        const pct = g.n ? Math.round((count / g.n) * 100) : 0;
        const maxG = Math.max(...groups.map(gg => gg.n ? Math.round(((gg.depDist[dep]||0)/gg.n)*100) : 0));
        const isLeader = pct === maxG && maxG > 0;
        return `<td><div class="infra-pct-cell">
          <div class="infra-dot-bar"><div class="infra-dot-fill" style="width:${pct}%;background:${g.color.hex}"></div></div>
          <span class="${isLeader ? 'infra-cell-leader' : ''}" style="${isLeader ? `color:${g.color.hex}` : ''}">${pct}%</span>
        </div></td>`;
      }).join('');
      body.insertAdjacentHTML('beforeend', `<tr><td><span class="dep-pill dep-${dep}">${dep}</span></td>${cells}</tr>`);
    });
    const totals = groups.map(g => `<td style="font-family:var(--font-mono);color:${g.color.hex};font-weight:600">${g.n} escolas</td>`).join('');
    body.insertAdjacentHTML('beforeend', `<tr style="border-top:1px solid var(--border2)"><td style="font-weight:600;color:var(--text)">Total</td>${totals}</tr>`);
  }

  /* ══════════════════════════════════════════════════════════
     INVESTMENT CHARTS
     ══════════════════════════════════════════════════════════ */
  function renderInvestmentCharts() {
    const cityIdeb = {};
    allData.filter(s => s.ideb != null).forEach(s => {
      if (!cityIdeb[s.no_municipio]) cityIdeb[s.no_municipio] = [];
      cityIdeb[s.no_municipio].push(s.ideb);
    });

    const merged = INVESTIMENTOS.map(inv => {
      const key = normCity(inv.municipio);
      const vals = cityIdeb[key] || [];
      const avgIdeb = vals.length ? vals.reduce((a,b) => a+b,0)/vals.length : null;
      return { ...inv, city: key, avgIdeb };
    }).filter(m => m.avgIdeb != null);

    const maxInv = merged.reduce((a,b) => b.invest > a.invest ? b : a, merged[0]);
    if (maxInv) {
      $('maxInvest').textContent = `R$ ${maxInv.invest.toLocaleString('pt-BR')}`;
      $('maxInvestCity').textContent = maxInv.city;
    }

    const effData = merged.map(m => ({ ...m, eff: +(m.avgIdeb / (m.invest / 1000)).toFixed(3) }));
    const bestEff = effData.reduce((a,b) => b.eff > a.eff ? b : a, effData[0]);
    if (bestEff) {
      $('bestEff').textContent = bestEff.eff.toFixed(3);
      $('bestEffCity').textContent = bestEff.city;
    }

    const n = merged.length;
    if (n >= 3) {
      const xi = merged.map(m => m.invest);
      const yi = merged.map(m => m.avgIdeb);
      const xm = xi.reduce((a,b)=>a+b)/n, ym = yi.reduce((a,b)=>a+b)/n;
      const num = xi.reduce((s,x,i) => s + (x-xm)*(yi[i]-ym), 0);
      const den = Math.sqrt(xi.reduce((s,x) => s+(x-xm)**2,0) * yi.reduce((s,y) => s+(y-ym)**2,0));
      const r = den ? (num/den).toFixed(3) : '—';
      $('investCorr').textContent = r;
    }

    // Scatter
    destroyChart('investScatter');
    const c1 = ctx('investScatterChart'); if (c1) {
      charts.investScatter = new Chart(c1, {
        type: 'scatter',
        data: { datasets: [{
          label: 'Municípios',
          data: merged.map(m => ({ x: m.invest, y: +m.avgIdeb.toFixed(2), city: m.city })),
          backgroundColor: 'rgba(251,191,36,.7)',
          borderColor: '#fbbf24',
          borderWidth: 1, pointRadius: 7, pointHoverRadius: 10,
        }]},
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: item => `${item.raw.city} — Invest: R$${item.raw.x.toLocaleString('pt-BR')} · IDEB: ${item.raw.y}` }}
          },
          scales: {
            x: { title: { display: true, text: 'Investimento por Aluno (R$)', color: getTickColor() }, grid: { color: getGridColor() }, ticks: { color: getTickColor(), callback: v => 'R$' + (v/1000).toFixed(0) + 'k' } },
            y: { title: { display: true, text: 'IDEB Médio', color: getTickColor() }, min: 4, max: 10, grid: { color: getGridColor() }, ticks: { color: getTickColor() } }
          }
        }
      });
    }

    // Bar
    const sorted = [...merged].sort((a,b) => b.invest - a.invest);
    destroyChart('investBar');
    const c2 = ctx('investBarChart'); if (c2) {
      charts.investBar = new Chart(c2, {
        type: 'bar',
        data: {
          labels: sorted.map(m => m.city),
          datasets: [{
            label: 'R$/aluno/ano',
            data: sorted.map(m => m.invest),
            backgroundColor: 'rgba(251,191,36,.65)',
            borderColor: '#fbbf24', borderWidth: 1, borderRadius: 5,
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: item => `R$ ${item.raw.toLocaleString('pt-BR')}/aluno/ano` } } },
          scales: {
            x: { grid: { color: getGridColor() }, ticks: { color: getTickColor(), callback: v => 'R$' + (v/1000).toFixed(0)+'k' } },
            y: { grid: { display: false }, ticks: { color: getTickColor(), font: { size: 10 } } }
          }
        }
      });
    }

    // Efficiency
    const eSorted = [...effData].sort((a,b) => b.eff - a.eff);
    destroyChart('efficiency');
    const c3 = ctx('efficiencyChart'); if (c3) {
      charts.efficiency = new Chart(c3, {
        type: 'bar',
        data: {
          labels: eSorted.map(m => m.city),
          datasets: [{
            label: 'IDEB / R$ mil',
            data: eSorted.map(m => m.eff),
            backgroundColor: eSorted.map((_,i) => PALETTE[i % PALETTE.length]),
            borderColor: eSorted.map((_,i) => BORDER_PALETTE[i % BORDER_PALETTE.length]),
            borderWidth: 1, borderRadius: 5,
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: item => `${item.raw} IDEB por R$ mil` } } },
          scales: {
            x: { grid: { color: getGridColor() }, ticks: { color: getTickColor() } },
            y: { grid: { display: false }, ticks: { color: getTickColor(), font: { size: 10 } } }
          }
        }
      });
    }
  }

  /* ══════════════════════════════════════════════════════════
     TRANSPARENCY / DATA DICTIONARY
     ══════════════════════════════════════════════════════════ */
  function renderDictionary() {
    const grid = $('dictGrid'); if (!grid || grid.children.length) return;
    DATA_DICT.forEach(entry => {
      grid.insertAdjacentHTML('beforeend', `
        <div class="dict-card">
          <span class="dict-field">${entry.field}</span>
          <div class="dict-name">${entry.name}</div>
          <div class="dict-desc">${entry.desc}</div>
          <div class="dict-range">Intervalo: ${entry.range}</div>
        </div>`);
    });
  }

  /* ══════════════════════════════════════════════════════════
     METRIC INFO MODAL
     ══════════════════════════════════════════════════════════ */
  const MODAL_CONTENT = {
    ideb: {
      title: 'Como o IDEB é calculado?',
      body: `
        <p style="margin-bottom:12px">O <strong>IDEB (Índice de Desenvolvimento da Educação Básica)</strong> foi criado em 2007 pelo INEP para medir a qualidade do aprendizado.</p>
        <div style="background:var(--surface2);border-radius:8px;padding:12px;font-family:var(--font-mono);font-size:.85rem;color:var(--accent2);margin-bottom:12px">
          IDEB = N × P
        </div>
        <p style="margin-bottom:8px">Onde:</p>
        <p>• <strong>N</strong> = Nota padronizada (0–10) derivada das proficiências do SAEB em LP e Matemática</p>
        <p>• <strong>P</strong> = Taxa de aprovação (Fluxo), valor entre 0 e 1</p>
        <p style="margin-top:12px;color:var(--text-dim);font-size:.78rem">Referência: INEP — <em>Nota Técnica IDEB</em></p>`
    },
    fluxo: {
      title: 'O que é o Fluxo Escolar?',
      body: `
        <p style="margin-bottom:12px">O <strong>Fluxo</strong> representa a taxa de aprovação escolar média nas séries avaliadas.</p>
        <div style="background:var(--surface2);border-radius:8px;padding:12px;font-family:var(--font-mono);font-size:.85rem;color:var(--accent2);margin-bottom:12px">
          Fluxo = Taxa média de aprovação (0 a 1)
        </div>
        <p>Um valor de <strong>1.0</strong> indica que todos os alunos avançaram sem reprovação ou abandono.</p>
        <p style="margin-top:8px">Escolas com alto fluxo mas baixa nota SAEB terão IDEB moderado — garantindo que <em>quantidade</em> não substitua <em>qualidade</em>.</p>`
    },
    saeb: {
      title: 'O que é o SAEB?',
      body: `
        <p style="margin-bottom:12px">O <strong>SAEB (Sistema de Avaliação da Educação Básica)</strong> avalia alunos do 5º e 9º ano do Ensino Fundamental e do 3º ano do Ensino Médio.</p>
        <p style="margin-bottom:8px">Avalia proficiência em:</p>
        <p>• <strong>Língua Portuguesa (LP)</strong> — compreensão leitora</p>
        <p>• <strong>Matemática (MT)</strong> — raciocínio lógico-matemático</p>
        <div style="background:var(--surface2);border-radius:8px;padding:12px;margin-top:12px;font-size:.78rem;color:var(--text-muted)">
          Escala típica: ~150 (baixo) a ~350 (alto). O ponto 200 equivale ao esperado para o 4º ano.
        </div>`
    }
  };

  document.querySelectorAll('.mic-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.modal;
      const content = MODAL_CONTENT[key];
      if (!content) return;
      $('modalContent').innerHTML = `
        <h3 style="font-family:var(--font-display);font-size:1.05rem;font-weight:800;color:var(--text);margin-bottom:16px">${content.title}</h3>
        <div style="font-size:.82rem;color:var(--text-muted);line-height:1.7">${content.body}</div>`;
      $('modalOverlay').style.display = 'flex';
    });
  });

  $('modalClose').addEventListener('click', () => { $('modalOverlay').style.display = 'none'; });
  $('modalOverlay').addEventListener('click', e => { if (e.target === $('modalOverlay')) $('modalOverlay').style.display = 'none'; });

  /* ══════════════════════════════════════════════════════════
     TEAM
     ══════════════════════════════════════════════════════════ */
  function renderTeam() {
    const grid = $('teamGrid'); if (!grid || grid.children.length) return;
    TEAM.forEach(member => {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(member.linkedin)}`;
      grid.insertAdjacentHTML('beforeend', `
        <div class="team-card">
          <div class="team-avatar">${member.initials}</div>
          <div class="team-name">${member.name}</div>
          <div class="team-role">${member.role}</div>
          <div class="team-bio">${member.bio}</div>
          <div class="team-qr"><img src="${qrUrl}" alt="QR LinkedIn ${member.name}" loading="lazy" width="56" height="56"></div>
          <a href="${member.linkedin}" target="_blank" rel="noopener" class="team-linkedin">↗ LinkedIn</a>
        </div>`);
    });
  }

  /* ══════════════════════════════════════════════════════════
     HELPERS
     ══════════════════════════════════════════════════════════ */
  function truncate(str, n) {
    return str && str.length > n ? str.substring(0, n) + '…' : (str || '');
  }

  function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  let toastTimer;
  function showToast(msg, err = false) {
    toast.textContent = msg;
    toast.style.borderColor = err ? 'var(--danger)' : 'var(--accent)';
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
  }

})();
