'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Escola } from '@/lib/types';

const MainCharts   = dynamic(() => import('./MainCharts'),   { ssr: false });
const InvestCharts = dynamic(() => import('./InvestCharts'), { ssr: false });
const CompareCharts = dynamic(() => import('./CompareCharts'), { ssr: false });

/* ──────────────────────────────────────────────
   CONSTANTS
────────────────────────────────────────────── */
const PAGE_SIZE = 25;

const INVESTIMENTOS = [
  { municipio: 'Sobral',             invest: 9500  },
  { municipio: 'São Caetano do Sul', invest: 14200 },
  { municipio: 'Jaraguá do Sul',     invest: 10800 },
  { municipio: 'Pato Branco',        invest: 9200  },
  { municipio: 'Marau',              invest: 8600  },
  { municipio: 'Sorocaba',           invest: 8100  },
  { municipio: 'Votorantim',         invest: 7700  },
  { municipio: 'Brasília',           invest: 9100  },
  { municipio: 'Cuiabá',             invest: 7400  },
  { municipio: 'Londrina',           invest: 8400  },
  { municipio: 'João Pessoa',        invest: 6600  },
  { municipio: 'Recife',             invest: 6800  },
  { municipio: 'Fortaleza',          invest: 6500  },
  { municipio: 'Rio Branco',         invest: 7200  },
  { municipio: 'São Luís',           invest: 6300  },
  { municipio: 'Teresina',           invest: 6100  },
  { municipio: 'Palmas',             invest: 8800  },
];

const DATA_DICT = [
  { field: 'inep_id',     name: 'Código INEP',         desc: 'Identificador único da escola no cadastro do INEP.',                              range: 'Numérico, 8 dígitos' },
  { field: 'nome_escola', name: 'Nome da Escola',       desc: 'Denominação oficial da instituição de ensino.',                                  range: 'Texto' },
  { field: 'no_municipio',name: 'Município',            desc: 'Município sede da escola, conforme divisão administrativa do IBGE.',              range: 'Texto' },
  { field: 'no_estado',   name: 'Estado',               desc: 'Unidade federativa onde a escola está localizada.',                              range: 'Texto' },
  { field: 'uf_estado',   name: 'UF',                   desc: 'Sigla da Unidade Federativa (ex: SP, RJ, MG).',                                  range: '2 caracteres' },
  { field: 'dependencia', name: 'Dep. Administrativa',  desc: 'Órgão responsável pela administração da escola.',                                range: 'Municipal | Estadual | Federal' },
  { field: 'ano',         name: 'Ano de Referência',    desc: 'Ano de coleta dos dados do IDEB.',                                               range: 'Inteiro (ex: 2023)' },
  { field: 'ideb',        name: 'IDEB',                 desc: 'Índice de Desenvolvimento da Educação Básica. Produto do Fluxo pelo Aprendizado.', range: '0.0 – 10.0 | null' },
  { field: 'fluxo',       name: 'Fluxo',                desc: 'Taxa de aprovação escolar média entre as séries avaliadas.',                     range: '0.0 – 1.0' },
  { field: 'aprendizado', name: 'Aprendizado',          desc: 'Nota padronizada do SAEB (0–10).',                                               range: '0.0 – 10.0' },
  { field: 'nota_mt',     name: 'Nota SAEB MT',         desc: 'Proficiência média em Matemática medida pelo SAEB.',                             range: '~150 – 350' },
  { field: 'nota_lp',     name: 'Nota SAEB LP',         desc: 'Proficiência média em Língua Portuguesa medida pelo SAEB.',                      range: '~150 – 350' },
];

const TEAM = [
  { name: 'Douglas Ferreira', role: 'Estudante de Cientista de Dados', initials: 'DF', linkedin: 'https://linkedin.com/in/-----' },
  { name: 'Gabriel Ferreira', role: 'Estudante de Ciência de Dados',   initials: 'GF', linkedin: 'https://linkedin.com/in/-----' },
  { name: 'Mateus Mariano',   role: 'Estudante de Ciência de Dados',   initials: 'MM', linkedin: 'https://linkedin.com/in/----'  },
];

const MODAL_CONTENT: Record<string, { title: string; body: string }> = {
  ideb: {
    title: 'Como o IDEB é calculado?',
    body: `<p style="margin-bottom:12px">O <strong>IDEB</strong> foi criado em 2007 pelo INEP para medir a qualidade do aprendizado.</p>
      <div style="background:var(--surface2);border-radius:8px;padding:12px;font-family:var(--font-mono);font-size:.85rem;color:var(--accent2);margin-bottom:12px">IDEB = N × P</div>
      <p style="margin-bottom:6px">• <strong>N</strong> = Nota padronizada (0–10) derivada das proficiências do SAEB em LP e Matemática</p>
      <p>• <strong>P</strong> = Taxa de aprovação (Fluxo), valor entre 0 e 1</p>`,
  },
  fluxo: {
    title: 'O que é o Fluxo Escolar?',
    body: `<p style="margin-bottom:12px">O <strong>Fluxo</strong> representa a taxa de aprovação escolar média.</p>
      <div style="background:var(--surface2);border-radius:8px;padding:12px;font-family:var(--font-mono);font-size:.85rem;color:var(--accent2);margin-bottom:12px">Fluxo = Taxa média de aprovação (0 a 1)</div>
      <p>Um valor de <strong>1.0</strong> indica que todos os alunos avançaram sem reprovação ou abandono.</p>`,
  },
  saeb: {
    title: 'O que é o SAEB?',
    body: `<p style="margin-bottom:12px">O <strong>SAEB</strong> avalia alunos do 5º e 9º ano do Ensino Fundamental.</p>
      <p style="margin-bottom:6px">• <strong>Língua Portuguesa (LP)</strong> — compreensão leitora</p>
      <p style="margin-bottom:12px">• <strong>Matemática (MT)</strong> — raciocínio lógico-matemático</p>
      <div style="background:var(--surface2);border-radius:8px;padding:12px;font-size:.78rem;color:var(--text-muted)">Escala típica: ~150 (baixo) a ~350 (alto).</div>`,
  },
};

const CMP_COLORS = [
  { bg: 'rgba(110,231,183,.7)', border: '#6ee7b7', hex: '#6ee7b7' },
  { bg: 'rgba(129,140,248,.7)', border: '#818cf8', hex: '#818cf8' },
  { bg: 'rgba(251,191,36,.7)',  border: '#fbbf24', hex: '#fbbf24' },
];

const VERSUS_METRICS = [
  { key: 'ideb',        label: 'IDEB Médio',       fmt: (v: number) => v.toFixed(2), max: 10  },
  { key: 'nota_lp',     label: 'SAEB Língua Port.', fmt: (v: number) => v.toFixed(1), max: 350 },
  { key: 'nota_mt',     label: 'SAEB Matemática',   fmt: (v: number) => v.toFixed(1), max: 350 },
  { key: 'fluxo',       label: 'Taxa Aprovação',    fmt: (v: number) => v.toFixed(1) + '%', max: 100 },
  { key: 'aprendizado', label: 'Aprendizado',       fmt: (v: number) => v.toFixed(2), max: 10  },
];

/* ──────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────── */
function applyFilters(
  data: Escola[],
  f: { city: string; dep: string; idebRange: string; onlyIdeb: boolean; search: string },
): Escola[] {
  const q = f.search.toLowerCase();
  return data.filter(s => {
    if (f.city      && s.no_municipio !== f.city) return false;
    if (f.dep       && s.dependencia  !== f.dep)  return false;
    if (q           && !s.nome_escola.toLowerCase().includes(q)) return false;
    if (f.onlyIdeb  && s.ideb == null)            return false;
    if (f.idebRange === 'high'   && !(s.ideb != null && s.ideb >= 7))             return false;
    if (f.idebRange === 'mid'    && !(s.ideb != null && s.ideb >= 5 && s.ideb < 7)) return false;
    if (f.idebRange === 'low'    && !(s.ideb != null && s.ideb < 5))              return false;
    if (f.idebRange === 'nodata' && s.ideb != null)                               return false;
    return true;
  });
}

function sortData(data: Escola[], key: string, dir: 'asc' | 'desc'): Escola[] {
  return [...data].sort((a, b) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const av = (a as any)[key], bv = (b as any)[key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    const al = typeof av === 'string' ? av.toLowerCase() : av;
    const bl = typeof bv === 'string' ? bv.toLowerCase() : bv;
    return dir === 'asc' ? (al > bl ? 1 : -1) : (al < bl ? 1 : -1);
  });
}

function computeKPIs(filtered: Escola[]) {
  if (!filtered.length) return null;
  const withIdeb  = filtered.filter(s => s.ideb   != null);
  const withNotes = filtered.filter(s => s.nota_lp != null);
  const withFluxo = filtered.filter(s => s.fluxo  != null);
  const avg = (arr: Escola[], k: keyof Escola) =>
    arr.length ? arr.reduce((s, x) => s + ((x[k] as number) || 0), 0) / arr.length : null;
  const best = withIdeb.length ? withIdeb.reduce((a, b) => b.ideb! > a.ideb! ? b : a) : null;
  return {
    idebAvg: avg(withIdeb, 'ideb'),
    lpAvg:   avg(withNotes, 'nota_lp'),
    mtAvg:   avg(withNotes, 'nota_mt'),
    total:   filtered.length,
    withIdeb:withIdeb.length,
    fluxoAvg: withFluxo.length ? (avg(withFluxo, 'fluxo')! * 100) : null,
    bestIdeb: best?.ideb ?? null,
    bestIdebSchool: best?.nome_escola ?? null,
  };
}

function aggregateCity(allData: Escola[], city: string) {
  const schools   = allData.filter(s => s.no_municipio === city);
  if (!schools.length) return null;
  const withIdeb  = schools.filter(s => s.ideb   != null);
  const withLp    = schools.filter(s => s.nota_lp != null);
  const withFluxo = schools.filter(s => s.fluxo  != null);
  const avg = (arr: Escola[], k: keyof Escola) =>
    arr.length ? arr.reduce((s, x) => s + ((x[k] as number) || 0), 0) / arr.length : 0;
  const depDist: Record<string, number> = {};
  schools.forEach(s => { depDist[s.dependencia] = (depDist[s.dependencia] || 0) + 1; });
  return {
    city, n: schools.length,
    ideb:        +avg(withIdeb, 'ideb').toFixed(2),
    nota_lp:     +avg(withLp, 'nota_lp').toFixed(1),
    nota_mt:     +avg(withLp, 'nota_mt').toFixed(1),
    fluxo:       +(avg(withFluxo, 'fluxo') * 100).toFixed(1),
    aprendizado: +avg(withIdeb, 'aprendizado').toFixed(2),
    depDist,
  };
}

/* ──────────────────────────────────────────────
   COMPONENT
────────────────────────────────────────────── */
export default function Dashboard({ initialData }: { initialData: Escola[] }) {
  const [allData]          = useState(initialData);
  const [filters, setFilters] = useState({ city: '', dep: '', idebRange: '', onlyIdeb: false, search: '' });
  const [sortKey, setSortKey] = useState('ideb');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage]     = useState(1);
  const [theme, setTheme]   = useState<'dark' | 'light'>('dark');
  const [filterOpen, setFilterOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [compareCity1, setCompareCity1] = useState('Sorocaba');
  const [compareCity2, setCompareCity2] = useState('Votorantim');
  const [compareCity3, setCompareCity3] = useState('');
  const [activeModal, setActiveModal]   = useState<string | null>(null);
  const [toastMsg, setToastMsg]         = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* theme */
  useEffect(() => {
    const saved = localStorage.getItem('edu-theme');
    if (saved === 'light') setTheme('light');
  }, []);

  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('edu-theme', next);
      return next;
    });
  }, []);

  /* toast */
  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 3500);
  }, []);

  useEffect(() => { showToast(`${allData.length} escolas carregadas ✓`); }, [allData.length, showToast]);

  /* derived */
  const cities     = useMemo(() => Array.from(new Set(allData.map(s => s.no_municipio))).sort(), [allData]);
  const filtered   = useMemo(() => applyFilters(allData, filters), [allData, filters]);
  const sorted     = useMemo(() => sortData(filtered, sortKey, sortDir), [filtered, sortKey, sortDir]);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageItems  = useMemo(() => sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [sorted, page]);
  const kpis       = useMemo(() => computeKPIs(filtered), [filtered]);

  const depDist = useMemo(() => ['Municipal', 'Estadual', 'Federal'].map(dep => {
    const count = filtered.filter(s => s.dependencia === dep).length;
    const pct   = filtered.length ? Math.round((count / filtered.length) * 100) : 0;
    const wi    = filtered.filter(s => s.dependencia === dep && s.ideb != null);
    const avgIdeb = wi.length ? (wi.reduce((s, x) => s + x.ideb!, 0) / wi.length).toFixed(2) : '—';
    return { dep, count, pct, avgIdeb };
  }), [filtered]);

  const compareGroups = useMemo(() => {
    const sel    = [compareCity1, compareCity2, compareCity3].filter(Boolean);
    const unique = Array.from(new Set(sel));
    if (unique.length < 2) return null;
    const groups = unique
      .map((city, i) => { const a = aggregateCity(allData, city); return a ? { ...a, color: CMP_COLORS[i] } : null; })
      .filter((g): g is NonNullable<typeof g> => g !== null && g.n > 0);
    return groups.length >= 2 ? groups : null;
  }, [allData, compareCity1, compareCity2, compareCity3]);

  const investData = useMemo(() => {
    const cityIdeb: Record<string, number[]> = {};
    allData.filter(s => s.ideb != null).forEach(s => { (cityIdeb[s.no_municipio] ??= []).push(s.ideb!); });
    return INVESTIMENTOS.map(inv => {
      const vals    = cityIdeb[inv.municipio] || [];
      const avgIdeb = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
      return { ...inv, avgIdeb };
    }).filter((m): m is { municipio: string; invest: number; avgIdeb: number } => m.avgIdeb != null);
  }, [allData]);

  const investKpis = useMemo(() => {
    if (!investData.length) return null;
    const maxInv = investData.reduce((a, b) => b.invest > a.invest ? b : a);
    const eff    = investData.map(m => ({ ...m, eff: +(m.avgIdeb / (m.invest / 1000)).toFixed(3) }));
    const bestEff = eff.reduce((a, b) => +b.eff > +a.eff ? b : a);
    const n = investData.length;
    let corr = '—';
    if (n >= 3) {
      const xi = investData.map(m => m.invest), yi = investData.map(m => m.avgIdeb);
      const xm = xi.reduce((a, b) => a + b) / n, ym = yi.reduce((a, b) => a + b) / n;
      const num = xi.reduce((s, x, i) => s + (x - xm) * (yi[i] - ym), 0);
      const den = Math.sqrt(xi.reduce((s, x) => s + (x - xm) ** 2, 0) * yi.reduce((s, y) => s + (y - ym) ** 2, 0));
      if (den) corr = (num / den).toFixed(3);
    }
    return { maxInv, bestEff, corr };
  }, [investData]);

  /* handlers */
  const setFilter  = useCallback((k: string, v: string | boolean) => { setFilters(p => ({ ...p, [k]: v })); setPage(1); }, []);
  const clearFilters = useCallback(() => { setFilters({ city: '', dep: '', idebRange: '', onlyIdeb: false, search: '' }); setPage(1); }, []);

  const handleSort = useCallback((col: string) => {
    setSortKey(prev => { if (prev === col) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return prev; } setSortDir('desc'); return col; });
    setPage(1);
  }, []);

  /* ─── RENDER ─── */
  return (
    <>
      <div className="noise" />

      {/* NAVBAR */}
      <header className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <span className="navbar-logo-icon">📊</span>
            <span className="navbar-logo-text">Observatório</span>
            <span className="logo-version">v3.0</span>
          </div>
          <nav className={`navbar-links${mobileMenu ? ' open' : ''}`}>
            {[['hero','Início'],['kpis','Dados'],['graficos','Gráficos'],['panorama','Panorama'],['comparativo','Comparativo'],['metodologia','Metodologia'],['equipe','Equipe']].map(([id, label]) => (
              <a key={id} href={`#${id}`} className="nav-link" onClick={() => setMobileMenu(false)}>{label}</a>
            ))}
          </nav>
          <div className="navbar-actions">
            <button className="theme-toggle" onClick={toggleTheme} title="Alternar tema">{theme === 'dark' ? '🌙' : '☀️'}</button>
            <button className="mobile-menu-toggle" onClick={() => setMobileMenu(o => !o)}>☰</button>
          </div>
        </div>
      </header>

      {/* FILTER BAR */}
      <section className="filter-bar">
        <div className="filter-bar-inner">
          <div className="filter-bar-left">
            <button className={`filter-toggle-btn${filterOpen ? ' open' : ''}`} onClick={() => setFilterOpen(o => !o)}>
              <span className="filter-toggle-icon">🔽</span>
              <span>Filtros</span>
            </button>
          </div>
          <div className="topbar-right">
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input className="search-input" type="text" placeholder="Buscar escola..." value={filters.search} onChange={e => setFilter('search', e.target.value)} />
            </div>
          </div>
        </div>
        <div className={`filter-bar-content${filterOpen ? ' open' : ''}`}>
          <div className="filter-bar-grid">
            <div className="filter-bar-item">
              <label className="filter-bar-label">Município</label>
              <select className="filter-select" value={filters.city} onChange={e => setFilter('city', e.target.value)}>
                <option value="">Todos os municípios</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="filter-bar-item">
              <label className="filter-bar-label">Dependência</label>
              <select className="filter-select" value={filters.dep} onChange={e => setFilter('dep', e.target.value)}>
                <option value="">Todas</option>
                <option value="Municipal">Municipal</option>
                <option value="Estadual">Estadual</option>
                <option value="Federal">Federal</option>
              </select>
            </div>
            <div className="filter-bar-item">
              <label className="filter-bar-label">IDEB</label>
              <select className="filter-select" value={filters.idebRange} onChange={e => setFilter('idebRange', e.target.value)}>
                <option value="">Todos IDEB</option>
                <option value="high">Alto (≥ 7)</option>
                <option value="mid">Médio (5–7)</option>
                <option value="low">Baixo (&lt; 5)</option>
                <option value="nodata">Sem dados</option>
              </select>
            </div>
            <div className="filter-bar-item">
              <div className="switch-wrap">
                <span className="switch-label">Apenas com IDEB</span>
                <label className="switch">
                  <input type="checkbox" checked={filters.onlyIdeb} onChange={e => setFilter('onlyIdeb', e.target.checked)} />
                  <span className="switch-slider" />
                </label>
              </div>
            </div>
            <div className="filter-bar-item filter-bar-actions">
              <button className="clear-btn" onClick={clearFilters}>Limpar Filtros</button>
            </div>
          </div>
        </div>
        <div className="filter-bar-footer">{filtered.length} escola{filtered.length !== 1 ? 's' : ''}</div>
      </section>

      {/* MAIN */}
      <main className="main">

        {/* HERO */}
        <section id="hero" className="hero-section">
          <div>
            <h1 className="hero-title">Observatório Educacional</h1>
            <p className="hero-subtitle">Ensino Fundamental I (1º ao 5º ano) — INEP 2023</p>
            <p className="hero-desc" style={{ marginTop: 8 }}>Análise dos dados educacionais das redes municipais de <strong>Sorocaba</strong> e <strong>Votorantim</strong> (SP). Cruzamos indicadores de desempenho (IDEB, SAEB) com contexto socioeconômico e infraestrutura para entender os <em>porquês</em> por trás dos números e embasar políticas públicas educacionais.</p>
          </div>
          <div className="hero-strip">
            <div className="hero-city-card" style={{ '--c': '#6ee7b7' } as React.CSSProperties}>
              <span className="hero-city-tag" style={{ '--c': '#6ee7b7' } as React.CSSProperties}>🏙 Sorocaba</span>
              <div className="hero-city-title">~723 mil habitantes · IDH 0,798</div>
              <div className="hero-city-desc">Centro industrial com rede municipal consolidada. Investimento est. <strong>R$ 8.100/aluno/ano</strong>.</div>
            </div>
            <span className="hero-vs">VS</span>
            <div className="hero-city-card" style={{ '--c': '#818cf8' } as React.CSSProperties}>
              <span className="hero-city-tag" style={{ '--c': '#818cf8' } as React.CSSProperties}>🏘 Votorantim</span>
              <div className="hero-city-title">~120 mil habitantes · IDH 0,769</div>
              <div className="hero-city-desc">Forte parceria público-privada na educação. Investimento est. <strong>R$ 7.700/aluno/ano</strong>.</div>
            </div>
          </div>
        </section>

        {/* KPIS */}
        <section id="kpis" className="content-section">
          <div className="section-inner">
            <h2 className="section-title">Indicadores Principais</h2>
            <div className="kpi-grid">
              {[
                { icon: '📊', label: 'IDEB Médio',      val: kpis?.idebAvg != null ? kpis.idebAvg.toFixed(2) : '—', sub: kpis ? `${kpis.withIdeb} escolas com dados` : '—' },
                { icon: '📝', label: 'SAEB LP Médio',   val: kpis?.lpAvg   != null ? kpis.lpAvg.toFixed(1)   : '—', sub: 'proficiência' },
                { icon: '🔢', label: 'SAEB MT Médio',   val: kpis?.mtAvg   != null ? kpis.mtAvg.toFixed(1)   : '—', sub: 'proficiência' },
                { icon: '🏫', label: 'Total de Escolas', val: kpis ? kpis.total.toLocaleString('pt-BR') : '—', sub: kpis ? `${kpis.withIdeb} com IDEB` : '—' },
                { icon: '🔄', label: 'Fluxo (Aprovação)',val: kpis?.fluxoAvg != null ? kpis.fluxoAvg.toFixed(1) + '%' : '—', sub: 'taxa média' },
                { icon: '🏆', label: 'Melhor IDEB',     val: kpis?.bestIdeb != null ? kpis.bestIdeb.toFixed(1) : '—', sub: kpis?.bestIdebSchool ? (kpis.bestIdebSchool.length > 28 ? kpis.bestIdebSchool.substring(0, 28) + '…' : kpis.bestIdebSchool) : '—' },
              ].map(({ icon, label, val, sub }) => (
                <div key={label} className="kpi-card">
                  <span className="kpi-icon">{icon}</span>
                  <div className="kpi-body">
                    <span className="kpi-label">{label}</span>
                    <span className="kpi-value">{val}</span>
                    <span className="kpi-sub">{sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EXPLICAÇÕES */}
        <section id="explicacoes" className="content-section alt-bg">
          <div className="section-inner">
            <h2 className="section-title">Entenda os Indicadores</h2>
            <div className="metric-info-strip">
              {[
                { key: 'ideb',  title: 'Como o IDEB é calculado?', formula: 'IDEB = N × P',          desc: 'N = Nota padronizada SAEB (0–10) · P = Taxa de aprovação (Fluxo, 0–1)' },
                { key: 'fluxo', title: 'O que é o Fluxo Escolar?', formula: 'Fluxo = Aprovação média', desc: 'Taxa de aprovação nas séries avaliadas. Valor 1.0 = todos avançaram.' },
                { key: 'saeb',  title: 'O que é o SAEB?',          formula: 'SAEB → LP + MT',          desc: 'Avalia proficiência em Língua Portuguesa e Matemática para alunos do 5º ano.' },
              ].map(({ key, title, formula, desc }) => (
                <div key={key} className="metric-info-card">
                  <span className="mic-tag">?</span>
                  <div className="mic-title">{title}</div>
                  <div className="mic-formula">{formula}</div>
                  <div className="mic-desc">{desc}</div>
                  <button className="mic-btn" onClick={() => setActiveModal(key)}>Saiba mais →</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DISTRIBUIÇÃO */}
        <section id="distribuicao" className="content-section">
          <div className="section-inner">
            <div className="dist-section">
              <h2 className="section-title">
                Distribuição por Dependência Administrativa
                <span className="section-count">{filtered.length ? `(${filtered.length} escolas)` : ''}</span>
              </h2>
              <div className="dist-grid">
                {depDist.map(({ dep, count, pct, avgIdeb }) => (
                  <div key={dep} className="dist-item">
                    <div className="dist-row">
                      <span className="dist-name">{dep}</span>
                      <span className="dist-pct">{pct}%</span>
                    </div>
                    <div className="dist-bar-bg"><div className="dist-bar-fill" style={{ width: `${pct}%` }} /></div>
                    <div className="dist-count">{count} escolas · IDEB médio: {avgIdeb}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* GRÁFICOS */}
        <section id="graficos" className="content-section alt-bg">
          <div className="section-inner">
            <h2 className="section-title">Visualizações</h2>
            <MainCharts filtered={filtered} theme={theme} />
          </div>
        </section>

        {/* TABELA */}
        <section id="tabela" className="content-section">
          <div className="section-inner">
            <h2 className="section-title">Escolas <span className="result-count">{sorted.length} resultado{sorted.length !== 1 ? 's' : ''}</span></h2>
            <div className="table-section">
              <div className="table-header">
                <div className="table-controls">
                  <select className="sort-select" value={`${sortKey}_${sortDir}`} onChange={e => {
                    const p = e.target.value.split('_'); const d = p.pop() as 'asc' | 'desc';
                    setSortKey(p.join('_')); setSortDir(d); setPage(1);
                  }}>
                    <option value="ideb_desc">IDEB ↓</option>
                    <option value="ideb_asc">IDEB ↑</option>
                    <option value="nome_escola_asc">Nome A–Z</option>
                    <option value="nota_lp_desc">LP ↓</option>
                    <option value="nota_mt_desc">MT ↓</option>
                    <option value="fluxo_desc">Fluxo ↓</option>
                  </select>
                </div>
                <div className="table-controls">
                  <button className="clear-btn" style={{ width: 'auto' }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>← Anterior</button>
                  <span style={{ fontSize: '.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    Página {page} de {Math.max(1, totalPages)} · {sorted.length} registros
                  </span>
                  <button className="clear-btn" style={{ width: 'auto' }} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Próximo →</button>
                </div>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      {[['nome_escola','Escola'],['no_municipio','Município']].map(([col, lbl]) => (
                        <th key={col} className={`sortable${sortKey === col ? ' ' + sortDir : ''}`} onClick={() => handleSort(col)}>{lbl}</th>
                      ))}
                      <th>UF</th>
                      <th className={`sortable${sortKey === 'dependencia' ? ' ' + sortDir : ''}`} onClick={() => handleSort('dependencia')}>Dependência</th>
                      {[['ideb','IDEB'],['nota_lp','LP'],['nota_mt','MT'],['fluxo','Fluxo'],['aprendizado','Aprend.']].map(([col, lbl]) => (
                        <th key={col} className={`sortable${sortKey === col ? ' ' + sortDir : ''}`} onClick={() => handleSort(col)}>{lbl}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.length === 0
                      ? <tr><td colSpan={10}><div className="empty-state"><div className="empty-icon">◌</div><p>Nenhuma escola encontrada com os filtros selecionados.</p></div></td></tr>
                      : pageItems.map((s, i) => {
                          const ic = s.ideb == null ? 'ideb-na' : s.ideb >= 7 ? 'ideb-high' : s.ideb >= 5 ? 'ideb-mid' : 'ideb-low';
                          return (
                            <tr key={s.inep_id} className={s.ideb != null && s.ideb >= 8 ? 'highlight-row' : ''}>
                              <td><span className="rank-badge">{(page - 1) * PAGE_SIZE + i + 1}</span></td>
                              <td><span className="school-name" title={s.nome_escola}>{s.nome_escola}</span></td>
                              <td style={{ color: 'var(--text-muted)' }}>{s.no_municipio}</td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', color: 'var(--text-dim)' }}>{s.uf_estado}</td>
                              <td><span className={`dep-pill dep-${s.dependencia}`}>{s.dependencia}</span></td>
                              <td><span className={`ideb-val ${ic}`}>{s.ideb != null ? s.ideb.toFixed(1) : '—'}</span></td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '.8rem' }}>{s.nota_lp != null ? s.nota_lp.toFixed(1) : '—'}</td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '.8rem' }}>{s.nota_mt != null ? s.nota_mt.toFixed(1) : '—'}</td>
                              <td>
                                <div className="mini-bar-wrap">
                                  <div className="mini-bar-bg"><div className="mini-bar-fill" style={{ width: `${s.fluxo != null ? s.fluxo * 100 : 0}%` }} /></div>
                                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.74rem' }}>{s.fluxo != null ? (s.fluxo * 100).toFixed(1) + '%' : '—'}</span>
                                </div>
                              </td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '.8rem' }}>{s.aprendizado != null ? s.aprendizado.toFixed(2) : '—'}</td>
                            </tr>
                          );
                        })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* PANORAMA */}
        <section id="panorama" className="content-section alt-bg">
          <div className="section-inner">
            <h2 className="section-title">Panorama Regional — O Brasil</h2>
            <p className="panorama-desc">O Brasil é um país continental com desigualdades profundas refletidas na educação. Analisamos o desempenho do Ensino Fundamental I nas 5 regiões e a correlação entre investimento e desempenho.</p>
            <div className="method-card">
              <h3>📖 Por que as regiões têm desempenhos tão diferentes?</h3>
              <div className="method-steps">
                {[
                  [1,'Sudeste — Maior desenvolvimento econômico','Concentra o maior PIB do país e maior investimento por aluno. Municípios como São Caetano do Sul e Sorocaba se beneficiam de infraestrutura consolidada.'],
                  [2,'Sul — Tradição em gestão pública eficiente','Estados como Santa Catarina e Paraná possuem modelos de gestão educacional reconhecidos nacionalmente.'],
                  [3,'Centro-Oeste — Crescimento e desafios','A expansão do agronegócio gerou riqueza, mas a distribuição é desigual. Brasília concentra recursos federais.'],
                  [4,'Nordeste — Avanços recentes, defasagem histórica','Décadas de subinvestimento criaram um passivo difícil de reverter. Programas como o Pacto pela Educação mostraram resultados.'],
                  [5,'Norte — Logística e densidade populacional','A maior região territorial com menor densidade. Escolas rurais e ribeirinhas enfrentam desafios logísticos imensos.'],
                ].map(([num, title, text]) => (
                  <div key={num} className="method-step">
                    <div className="step-num">{num}</div>
                    <div className="step-content"><h4>{title as string}</h4><p>{text as string}</p></div>
                  </div>
                ))}
              </div>
            </div>

            <h2 className="section-title" style={{ marginTop: 4 }}>Investimento × Desempenho por Município</h2>
            <div className="kpi-grid" style={{ paddingTop: 0 }}>
              {[
                { icon: '💰', label: 'Maior Investimento', val: investKpis ? `R$ ${investKpis.maxInv.invest.toLocaleString('pt-BR')}` : '—', sub: investKpis?.maxInv.municipio ?? '—' },
                { icon: '⚡', label: 'Melhor Eficiência',  val: investKpis ? String(investKpis.bestEff.eff) : '—', sub: investKpis?.bestEff.municipio ?? 'IDEB/R$ mil' },
                { icon: '📐', label: 'Correlação (Pearson)', val: investKpis?.corr ?? '—', sub: 'invest × IDEB' },
              ].map(({ icon, label, val, sub }) => (
                <div key={label} className="kpi-card">
                  <span className="kpi-icon">{icon}</span>
                  <div className="kpi-body">
                    <span className="kpi-label">{label}</span>
                    <span className="kpi-value">{val}</span>
                    <span className="kpi-sub">{sub}</span>
                  </div>
                </div>
              ))}
            </div>

            <InvestCharts investData={investData} theme={theme} />

            {['Mapa de Calor Interativo do Brasil','Gráficos por 5 Regiões do Brasil'].map(title => (
              <div key={title} className="method-card dev-card">
                <span className="dev-badge">🚧 EM DESENVOLVIMENTO</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '.96rem', fontWeight: 700, color: 'var(--text)', margin: '12px 0 8px' }}>{title}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* COMPARATIVO */}
        <section id="comparativo" className="content-section">
          <div className="section-inner">
            <h2 className="section-title">Lupa Local — Sorocaba × Votorantim</h2>
            <p className="compare-subtitle">Compare IDEB, notas SAEB, taxa de aprovação e distribuição por dependência administrativa.</p>

            <div className="compare-selectors">
              {([
                { val: compareCity1, set: setCompareCity1, color: '#6ee7b7', label: 'Município A', sep: null },
                { val: compareCity2, set: setCompareCity2, color: '#818cf8', label: 'Município B', sep: 'VS' },
                { val: compareCity3, set: setCompareCity3, color: '#fbbf24', label: 'Município C', sep: '+', optional: true },
              ] as const).map(({ val, set, color, label, sep, optional }: any, i: number) => (
                <React.Fragment key={i}>
                  {sep && <span className="compare-vs" style={i === 2 ? { opacity: .4 } : undefined}>{sep}</span>}
                  <div className="city-selector-wrap" style={{ '--c': color } as React.CSSProperties}>
                    <label className="city-selector-label" style={{ '--c': color } as React.CSSProperties}>
                      {label}{optional && <span className="optional"> (opcional)</span>}
                    </label>
                    <select className="compare-select" style={{ '--c': color } as React.CSSProperties} value={val} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set(e.target.value)}>
                      <option value="">—</option>
                      {cities.map((c: string) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </React.Fragment>
              ))}
            </div>

            {!compareGroups ? (
              <div className="compare-empty">
                <div className="compare-empty-icon">⬢</div>
                <p>Selecione pelo menos 2 municípios para comparar.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="versus-grid">
                  {VERSUS_METRICS.map(metric => {
                    const vals    = compareGroups.map(g => g[metric.key as keyof typeof g] as number);
                    const maxVal  = Math.max(...vals);
                    const isEqual = vals.every(v => v === vals[0]);
                    return (
                      <div key={metric.key} className={`versus-card${!isEqual ? ' has-leader' : ''}`}>
                        <div className="versus-card-title">{metric.label}</div>
                        <div className="versus-rows">
                          {compareGroups.map(g => {
                            const val     = g[metric.key as keyof typeof g] as number;
                            const pct     = metric.max ? (val / metric.max) * 100 : (maxVal ? (val / maxVal) * 100 : 0);
                            const isLeader = !isEqual && val === maxVal;
                            return (
                              <div key={g.city} className="versus-row">
                                <span className="versus-city-name" style={{ color: g.color.hex }}>
                                  {g.city}{isLeader && <span className="leader-badge">★</span>}
                                </span>
                                <div className="vbar-track">
                                  <div className="vbar-fill" style={{ width: `${pct}%`, background: g.color.bg, border: `1px solid ${g.color.border}` }} />
                                </div>
                                <span className="versus-val" style={{ color: g.color.hex }}>{metric.fmt(val)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <CompareCharts groups={compareGroups} theme={theme} />
              </div>
            )}

            {['Relação Aluno/Professor','Infraestrutura Detalhada das Escolas Municipais','Comparação com Média Estadual e Nacional'].map(title => (
              <div key={title} className="method-card dev-card">
                <span className="dev-badge">🚧 EM DESENVOLVIMENTO</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '.96rem', fontWeight: 700, color: 'var(--text)', margin: '12px 0 8px' }}>{title}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* METODOLOGIA */}
        <section id="metodologia" className="content-section alt-bg">
          <div className="section-inner">
            <h2 className="section-title">Metodologia e Fontes de Dados</h2>
            <div className="method-card">
              <h3>📋 Metodologia</h3>
              <div className="method-steps">
                {[
                  [1,'Coleta de Dados','Dados obtidos diretamente do INEP (Censo Escolar 2023), incluindo IDEB, proficiências SAEB e taxas de fluxo.'],
                  [2,'Tratamento e Limpeza','Os microdados foram tratados com Python (Pandas) para padronizar nomes de municípios e remover duplicatas.'],
                  [3,'Foco no 1º ao 5º Ano','Optamos por focar no Ensino Fundamental I pois é a fase mais crítica de alfabetização e letramento.'],
                  [4,'Análise Cruzada','Correlacionamos dados educacionais com indicadores socioeconômicos e estimativas de investimento público por aluno.'],
                  [5,'Banco de Dados','Dados armazenados em MongoDB, servidos via API Next.js para maior escalabilidade e facilidade de atualização.'],
                ].map(([n, t, p]) => (
                  <div key={n} className="method-step">
                    <div className="step-num">{n}</div>
                    <div className="step-content"><h4>{t as string}</h4><p>{p as string}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="method-card">
              <h3>🗂️ Dicionário de Dados</h3>
              <div className="dict-grid">
                {DATA_DICT.map(e => (
                  <div key={e.field} className="dict-card">
                    <span className="dict-field">{e.field}</span>
                    <div className="dict-name">{e.name}</div>
                    <div className="dict-desc">{e.desc}</div>
                    <div className="dict-range">Intervalo: {e.range}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="method-card">
              <h3>📌 Fontes</h3>
              <div className="sources-list">
                {[['INEP','Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira'],['Censo Escolar 2023','Dados de infraestrutura, dependência administrativa e matrícula'],['IDEB 2023','Índice de Desenvolvimento da Educação Básica'],['SAEB','Sistema de Avaliação da Educação Básica (proficiências LP e MT)'],['IBGE','Estimativas populacionais e dados socioeconômicos municipais']].map(([k, v]) => (
                  <p key={k}><strong>{k}</strong> — {v}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* EQUIPE */}
        <section id="equipe" className="content-section">
          <div className="section-inner">
            <h2 className="section-title">Equipe do Projeto</h2>
            <div className="team-grid">
              {TEAM.map(m => (
                <div key={m.name} className="team-card">
                  <div className="team-avatar">{m.initials}</div>
                  <div className="team-name">{m.name}</div>
                  <div className="team-role">{m.role}</div>
                  <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="team-linkedin">↗ LinkedIn</a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-inner">
            <p>Observatório Educacional v3.0 — Dados INEP 2023</p>
            <p className="footer-note">Projeto acadêmico — Ciência de Dados para Negócios</p>
          </div>
        </footer>
      </main>

      {/* MODAL */}
      {activeModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setActiveModal(null); }}>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>
              {MODAL_CONTENT[activeModal]?.title}
            </h3>
            <div style={{ fontSize: '.82rem', color: 'var(--text-muted)', lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: MODAL_CONTENT[activeModal]?.body ?? '' }} />
          </div>
        </div>
      )}

      {/* TOAST */}
      <div className={`toast${toastMsg ? ' show' : ''}`}>{toastMsg}</div>
    </>
  );
}
