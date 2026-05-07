'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Escola } from '@/lib/types';

const RankingChart = dynamic(() => import('./RankingChart'),  { ssr: false });
const ParadoxChart = dynamic(() => import('./ParadoxChart'),  { ssr: false });

/* ─── CONSTANTS ─── */
const PAGE_SIZE   = 25;
const OUR_CITIES  = ['Sorocaba', 'Votorantim'];
const PARADOX_CITIES = ['São Caetano do Sul', 'Jaraguá do Sul', 'Sobral', 'Sorocaba', 'Votorantim', 'João Pessoa'];
const INFRA_CITIES   = ['Jaraguá do Sul', 'Sobral', 'Votorantim', 'Sorocaba', 'João Pessoa', 'Recife'];

const INVESTIMENTOS = [
  { municipio: 'São Caetano do Sul', invest: 14200 },
  { municipio: 'Jaraguá do Sul',     invest: 10800 },
  { municipio: 'Sobral',             invest: 9500  },
  { municipio: 'Pato Branco',        invest: 9200  },
  { municipio: 'Brasília',           invest: 9100  },
  { municipio: 'Marau',              invest: 8600  },
  { municipio: 'Sorocaba',           invest: 8100  },
  { municipio: 'Votorantim',         invest: 7700  },
  { municipio: 'Cuiabá',             invest: 7400  },
  { municipio: 'Londrina',           invest: 8400  },
  { municipio: 'João Pessoa',        invest: 6600  },
  { municipio: 'Recife',             invest: 6800  },
  { municipio: 'Fortaleza',          invest: 6500  },
];

const INFRA_METRICS: { key: keyof Escola; label: string }[] = [
  { key: 'IN_INTERNET',               label: 'Internet' },
  { key: 'IN_LABORATORIO_INFORMATICA', label: 'Lab. Informática' },
  { key: 'IN_BIBLIOTECA',             label: 'Biblioteca' },
  { key: 'IN_QUADRA_ESPORTES',        label: 'Quadra Esportiva' },
  { key: 'IN_LABORATORIO_CIENCIAS',   label: 'Lab. Ciências' },
  { key: 'IN_ACESSIBILIDADE_RAMPAS',  label: 'Acessibilidade' },
];

const DATA_DICT = [
  { field: 'ideb',        name: 'IDEB',           desc: 'Índice de Desenvolvimento da Educação Básica. Produto do Fluxo pelo Aprendizado.',  range: '0.0 – 10.0 | null' },
  { field: 'fluxo',       name: 'Fluxo',          desc: 'Taxa de aprovação escolar média entre as séries avaliadas.',                        range: '0.0 – 1.0' },
  { field: 'nota_lp',     name: 'SAEB Língua Port.',desc: 'Proficiência média em Língua Portuguesa medida pelo SAEB.',                       range: '~150 – 350' },
  { field: 'nota_mt',     name: 'SAEB Matemática', desc: 'Proficiência média em Matemática medida pelo SAEB.',                               range: '~150 – 350' },
  { field: 'aprendizado', name: 'Aprendizado',     desc: 'Nota padronizada do SAEB convertida para escala de 0 a 10.',                       range: '0.0 – 10.0' },
  { field: 'dependencia', name: 'Dep. Administrativa', desc: 'Órgão responsável pela administração da escola.',                             range: 'Municipal | Estadual | Federal' },
  { field: 'infra_score', name: 'Infra Score',     desc: '% de 12 itens-chave de infraestrutura presentes na escola.',                       range: '0 – 100' },
];

const TEAM = [
  { name: 'Douglas Ferreira', role: 'Estudante de Ciência de Dados', initials: 'DF', linkedin: '#', cls: 'orange' },
  { name: 'Gabriel Ferreira', role: 'Estudante de Ciência de Dados', initials: 'GF', linkedin: '#', cls: 'purple' },
  { name: 'Mateus Mariano',   role: 'Estudante de Ciência de Dados', initials: 'MM', linkedin: '#', cls: 'dark'   },
  { name: 'Peterson Alves',   role: 'Estudante de Ciência de Dados', initials: 'PA', linkedin: '#', cls: 'orange' },
];

const SIDEBAR_SECTIONS = [
  { id: 'dash',       label: 'Dashboard',      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 3v9l6 5" strokeWidth="2.5"/></svg> },
  { id: 'ranking',    label: 'Ranking',         icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="14" width="4" height="7"/><rect x="10" y="9" width="4" height="12"/><rect x="17" y="4" width="4" height="17"/></svg> },
  { id: 'paradox',    label: 'Paradoxo',        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
  { id: 'infra',      label: 'Infraestrutura',  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 17h20M5 17V9l5-4 5 4v8M9 17v-4h4v4"/></svg> },
  { id: 'escolas',    label: 'Escolas',         icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/></svg> },
  { id: 'comparativo',label: 'Comparativo',     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg> },
  { id: 'equipe',     label: 'Equipe',          icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
];

/* ─── HELPERS ─── */
function avg(arr: number[]) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null; }
function pct(arr: number[]) { const a = avg(arr); return a != null ? Math.round(a * 100) : null; }

function applyFilters(data: Escola[], f: { city: string; dep: string; idebRange: string; onlyIdeb: boolean; search: string }): Escola[] {
  const q = f.search.toLowerCase();
  return data.filter(s => {
    if (f.city && s.no_municipio !== f.city) return false;
    if (f.dep  && s.dependencia  !== f.dep)  return false;
    if (q && !s.nome_escola.toLowerCase().includes(q)) return false;
    if (f.onlyIdeb && s.ideb == null) return false;
    if (f.idebRange === 'high'   && !(s.ideb != null && s.ideb >= 7))               return false;
    if (f.idebRange === 'mid'    && !(s.ideb != null && s.ideb >= 5 && s.ideb < 7)) return false;
    if (f.idebRange === 'low'    && !(s.ideb != null && s.ideb < 5))                return false;
    if (f.idebRange === 'nodata' && s.ideb != null)                                 return false;
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

function idebBadge(v: number | null) {
  if (v == null) return 'na';
  if (v >= 7) return 'high';
  if (v >= 5) return 'mid';
  return 'low';
}

function infraBadge(v: number | null) {
  if (v == null) return 'na';
  if (v >= 70) return 'high';
  if (v >= 50) return 'mid';
  return 'low';
}

/* ─── COMPONENT ─── */
export default function Dashboard({ initialData }: { initialData: Escola[] }) {
  const [allData]    = useState(initialData);
  const [activeSection, setActiveSection] = useState(0);
  const [filters, setFilters] = useState({ city: '', dep: '', idebRange: '', onlyIdeb: false, search: '' });
  const [sortKey, setSortKey] = useState('ideb');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage]       = useState(1);
  const [compareCity1, setCompareCity1] = useState('Sorocaba');
  const [compareCity2, setCompareCity2] = useState('Votorantim');
  const [toastMsg, setToastMsg]     = useState<string | null>(null);
  const [explainModal, setExplainModal] = useState<'ideb' | 'infra' | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* toast */
  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 3000);
  }, []);
  useEffect(() => { showToast(`${allData.length} escolas carregadas`); }, [allData.length, showToast]);

  /* section observer */
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) { const idx = SIDEBAR_SECTIONS.findIndex(s => s.id === e.target.id); if (idx >= 0) setActiveSection(idx); } }); },
      { threshold: 0.25, rootMargin: '-5% 0px -5% 0px' },
    );
    SIDEBAR_SECTIONS.forEach(s => { const el = document.getElementById(s.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  /* ── city aggregation ── */
  const cityAgg = useMemo(() => {
    const map = new Map<string, { idebVals: number[]; infraVals: number[]; internet: number[]; biblioteca: number[]; labInfo: number[]; quadra: number[]; labCiencias: number[]; acessib: number[]; n: number; }>();
    allData.forEach(s => {
      if (!map.has(s.no_municipio)) map.set(s.no_municipio, { idebVals: [], infraVals: [], internet: [], biblioteca: [], labInfo: [], quadra: [], labCiencias: [], acessib: [], n: 0 });
      const c = map.get(s.no_municipio)!;
      c.n++;
      if (s.ideb != null) c.idebVals.push(s.ideb);
      if (s.infra_score != null) c.infraVals.push(s.infra_score);
      if (s.IN_INTERNET != null) c.internet.push(s.IN_INTERNET);
      if (s.IN_BIBLIOTECA != null) c.biblioteca.push(s.IN_BIBLIOTECA);
      if (s.IN_LABORATORIO_INFORMATICA != null) c.labInfo.push(s.IN_LABORATORIO_INFORMATICA);
      if (s.IN_QUADRA_ESPORTES != null) c.quadra.push(s.IN_QUADRA_ESPORTES);
      if (s.IN_LABORATORIO_CIENCIAS != null) c.labCiencias.push(s.IN_LABORATORIO_CIENCIAS);
      if (s.IN_ACESSIBILIDADE_RAMPAS != null) c.acessib.push(s.IN_ACESSIBILIDADE_RAMPAS);
    });
    return Array.from(map.entries()).map(([city, d]) => ({
      city, n: d.n,
      avgIdeb: avg(d.idebVals), avgInfra: avg(d.infraVals),
      pctInternet: pct(d.internet), pctBiblioteca: pct(d.biblioteca),
      pctLabInfo: pct(d.labInfo), pctQuadra: pct(d.quadra),
      pctLabCiencias: pct(d.labCiencias), pctAcessib: pct(d.acessib),
      isOurs: OUR_CITIES.includes(city),
    })).sort((a, b) => (b.avgIdeb ?? 0) - (a.avgIdeb ?? 0));
  }, [allData]);

  const sorocaba   = useMemo(() => cityAgg.find(c => c.city === 'Sorocaba'),   [cityAgg]);
  const votorantim = useMemo(() => cityAgg.find(c => c.city === 'Votorantim'), [cityAgg]);

  const ourStats = useMemo(() => {
    const ours = allData.filter(s => OUR_CITIES.includes(s.no_municipio));
    const wi   = ours.filter(s => s.ideb != null);
    const wif  = ours.filter(s => s.infra_score != null);
    return {
      n: ours.length, withIdeb: wi.length,
      avgIdeb:  avg(wi.map(s => s.ideb!)),
      avgInfra: avg(wif.map(s => s.infra_score!)),
      avgLp:    avg(ours.filter(s => s.nota_lp != null).map(s => s.nota_lp!)),
      avgMt:    avg(ours.filter(s => s.nota_mt != null).map(s => s.nota_mt!)),
      avgFluxo: avg(ours.filter(s => s.fluxo != null).map(s => s.fluxo!)),
    };
  }, [allData]);

  const ourRankPos = useMemo(() => {
    const ranked = cityAgg.filter(c => c.avgIdeb != null);
    return Math.min(
      ranked.findIndex(c => c.city === 'Sorocaba')   + 1 || 999,
      ranked.findIndex(c => c.city === 'Votorantim') + 1 || 999,
    );
  }, [cityAgg]);

  const topSchools = useMemo(() =>
    allData.filter(s => OUR_CITIES.includes(s.no_municipio) && s.ideb != null)
      .sort((a, b) => b.ideb! - a.ideb!).slice(0, 5),
  [allData]);

  const ourDepDist = useMemo(() => {
    const ours = allData.filter(s => OUR_CITIES.includes(s.no_municipio));
    const n = ours.length;
    return ['Municipal', 'Estadual', 'Federal'].map(dep => {
      const count = ours.filter(s => s.dependencia === dep).length;
      const depPct = n ? Math.round((count / n) * 100) : 0;
      const wi = ours.filter(s => s.dependencia === dep && s.ideb != null);
      const ai = wi.length ? (wi.reduce((a, b) => a + b.ideb!, 0) / wi.length).toFixed(2) : '—';
      return { dep, count, pct: depPct, avgIdeb: ai };
    });
  }, [allData]);

  const paradoxData = useMemo(() =>
    PARADOX_CITIES.map(city => cityAgg.find(c => c.city === city)).filter(Boolean) as typeof cityAgg,
  [cityAgg]);

  const infraData = useMemo(() =>
    INFRA_CITIES.map(city => cityAgg.find(c => c.city === city)).filter(Boolean) as typeof cityAgg,
  [cityAgg]);

  const investData = useMemo(() => {
    const cityIdeb: Record<string, number[]> = {};
    allData.filter(s => s.ideb != null).forEach(s => { (cityIdeb[s.no_municipio] ??= []).push(s.ideb!); });
    return INVESTIMENTOS.map(inv => {
      const vals = cityIdeb[inv.municipio] || [];
      const ai = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
      return { ...inv, avgIdeb: ai };
    }).filter(m => m.avgIdeb != null) as Array<{ municipio: string; invest: number; avgIdeb: number }>;
  }, [allData]);

  const investKpis = useMemo(() => {
    if (!investData.length) return null;
    const maxInv = investData.reduce((a, b) => b.invest > a.invest ? b : a);
    const eff = investData.map(m => ({ ...m, eff: +(m.avgIdeb / (m.invest / 1000)).toFixed(3) }));
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
    return { maxInv, bestEff: bestEff.eff, bestEffCity: bestEff.municipio, corr };
  }, [investData]);

  const compareData = useMemo(() => {
    const c1 = cityAgg.find(c => c.city === compareCity1);
    const c2 = cityAgg.find(c => c.city === compareCity2);
    if (!c1 || !c2) return null;
    return [c1, c2];
  }, [cityAgg, compareCity1, compareCity2]);

  const cities    = useMemo(() => Array.from(new Set(allData.map(s => s.no_municipio))).sort(), [allData]);
  const filtered  = useMemo(() => applyFilters(allData, filters), [allData, filters]);
  const sorted    = useMemo(() => sortData(filtered, sortKey, sortDir), [filtered, sortKey, sortDir]);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageItems  = useMemo(() => sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [sorted, page]);

  const setFilter = useCallback((k: string, v: string | boolean) => { setFilters(p => ({ ...p, [k]: v })); setPage(1); }, []);
  const clearFilters = useCallback(() => { setFilters({ city: '', dep: '', idebRange: '', onlyIdeb: false, search: '' }); setPage(1); }, []);
  const handleSort = useCallback((col: string) => {
    setSortKey(prev => { if (prev === col) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return prev; } setSortDir('desc'); return col; });
    setPage(1);
  }, []);

  const infraPct = useCallback((city: typeof cityAgg[number] | undefined, metric: keyof Escola) => {
    if (!city) return null;
    const schools = allData.filter(s => s.no_municipio === city.city && s[metric] != null);
    return schools.length ? Math.round(schools.reduce((a, s) => a + (s[metric] as number), 0) / schools.length * 100) : null;
  }, [allData]);

  const idebPct = ourStats.avgIdeb ? Math.round((ourStats.avgIdeb / 10) * 100) : 0;
  const maxInvest = investData.length ? Math.max(...investData.map(m => m.invest)) : 1;

  /* ─── RENDER ─── */
  return (
    <div className="app">

      {/* ══ SIDEBAR ══ */}
      <aside className="sidebar">
        <div className="sb-logo">
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
            <rect x="5"  y="18" width="5" height="5"  rx="1.5" fill="#fff" fillOpacity="0.4"/>
            <rect x="11.5" y="13" width="5" height="10" rx="1.5" fill="#fff" fillOpacity="0.7"/>
            <rect x="18" y="8"  width="5" height="15" rx="1.5" fill="#FF6B2C"/>
          </svg>
        </div>
        {SIDEBAR_SECTIONS.map((s, i) => (
          <button key={s.id} className={`sb-item${activeSection === i ? ' active' : ''}`}
            title={s.label} onClick={() => scrollTo(s.id)}>
            {s.icon}
          </button>
        ))}
        <div className="sb-spacer" />
        <button className="sb-item" title="INEP 2023">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>
          </svg>
        </button>
      </aside>

      {/* ══ MAIN ══ */}
      <main className="main">

        {/* TOPBAR */}
        <div className="topbar" id="dash">
          <div className="topbar-left">
            <div>
              <h1 className="page-title">Observatório Educacional</h1>
              <div className="page-sub">Sorocaba × Votorantim · Ensino Fundamental I</div>
            </div>
          </div>
          <div className="badge-tag">INEP 2023 <span className="arrow">↗</span></div>
        </div>

        {/* MAIN GRID */}
        <div className="grid">
          <div>

            {/* HERO: city cards */}
            <div className="hero-card">
              <div className="hero-head">
                <h2>Cidades em análise</h2>
                <div className="meta-bar">
                  <div className="meta-bar-label">
                    <span>Progresso IDEB médio:</span>
                    <span><strong style={{ color: 'var(--text)' }}>{ourStats.avgIdeb?.toFixed(2) ?? '—'}</strong> / 10.0</span>
                  </div>
                  <div className="meta-bar-track">
                    <div className="meta-bar-fill" style={{ width: `${idebPct}%` }} />
                  </div>
                </div>
              </div>

              <div className="cities-row">
                <div className="city-card purple">
                  <div className="cc-head">
                    <span className="cc-tag">SP · Município A</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', opacity: .85 }}>IDH 0.798</span>
                  </div>
                  <div>
                    <div className="cc-name">Sorocaba</div>
                    <div className="cc-meta">~723 mil habitantes · Centro industrial</div>
                  </div>
                  <div className="cc-stats">
                    <div>
                      <div className="cc-stat-label">IDEB médio</div>
                      <div className="cc-stat-val">{sorocaba?.avgIdeb?.toFixed(2) ?? '—'}</div>
                    </div>
                    <div>
                      <div className="cc-stat-label">Infra score</div>
                      <div className="cc-stat-val">{sorocaba?.avgInfra?.toFixed(0) ?? '—'}%</div>
                    </div>
                  </div>
                </div>
                <div className="city-card orange">
                  <div className="cc-head">
                    <span className="cc-tag">SP · Município B</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', opacity: .85 }}>IDH 0.769</span>
                  </div>
                  <div>
                    <div className="cc-name">Votorantim</div>
                    <div className="cc-meta">~120 mil habitantes · Parceria PPP educação</div>
                  </div>
                  <div className="cc-stats">
                    <div>
                      <div className="cc-stat-label">IDEB médio</div>
                      <div className="cc-stat-val">{votorantim?.avgIdeb?.toFixed(2) ?? '—'}</div>
                    </div>
                    <div>
                      <div className="cc-stat-label">Infra score</div>
                      <div className="cc-stat-val">{votorantim?.avgInfra?.toFixed(0) ?? '—'}%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-blocks">
                <div className="info-block">
                  <div className="ib-val">{ourStats.n}<sub>esc</sub></div>
                  <div className="ib-sub">total das duas cidades</div>
                  <div className="ib-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 17h20M5 17V9l5-4 5 4v8M9 17v-4h4v4"/></svg></div>
                  <div className="ib-label">Escolas</div>
                </div>
                <div className="info-block">
                  <div className="ib-val">{ourStats.avgLp?.toFixed(1) ?? '—'}</div>
                  <div className="ib-sub">SAEB Língua Port.</div>
                  <div className="ib-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5h14M3 9h9M3 13h12M3 17h6"/></svg></div>
                  <div className="ib-label">Leitura</div>
                </div>
                <div className="info-block">
                  <div className="ib-val">{ourStats.avgFluxo != null ? (ourStats.avgFluxo * 100).toFixed(1) : '—'}<sub>%</sub></div>
                  <div className="ib-sub">aprovação média</div>
                  <div className="ib-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/></svg></div>
                  <div className="ib-label">Fluxo</div>
                </div>
              </div>
            </div>

            {/* KPIs */}
            <div className="kpi-row">
              <div className="kpi feature">
                <div className="ring" style={{ background: `conic-gradient(#FF6B2C 0% ${idebPct}%, rgba(255,255,255,.12) ${idebPct}% 100%)` }}>
                  <span>{idebPct}%</span>
                </div>
                <div className="kpi-label">IDEB Médio</div>
                <div className="kpi-val">{ourStats.avgIdeb?.toFixed(2) ?? '—'}</div>
                <div className="kpi-sub">{ourStats.withIdeb} escolas com dados</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">SAEB LP</div>
                <div className="kpi-val">{ourStats.avgLp?.toFixed(1) ?? '—'}</div>
                <div className="kpi-sub">proficiência média</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">SAEB MT</div>
                <div className="kpi-val">{ourStats.avgMt?.toFixed(1) ?? '—'}</div>
                <div className="kpi-sub">proficiência média</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Ranking Nacional</div>
                <div className="kpi-val">#{ourRankPos || '—'}</div>
                <div className="kpi-sub">entre {cityAgg.filter(c => c.avgIdeb != null).length} municípios</div>
              </div>
            </div>

            {/* CHARTS */}
            <div className="chart-row">
              <div className="chart-card">
                <div className="chart-card-head">
                  <h3>Distribuição IDEB</h3>
                  <span className="chart-card-sub">Faixas (escolas da região)</span>
                </div>
                <div className="chart-area">
                  {(() => {
                    const ours = allData.filter(s => OUR_CITIES.includes(s.no_municipio) && s.ideb != null);
                    const buckets = [
                      ours.filter(s => s.ideb! < 3).length,
                      ours.filter(s => s.ideb! >= 3 && s.ideb! < 4).length,
                      ours.filter(s => s.ideb! >= 4 && s.ideb! < 5).length,
                      ours.filter(s => s.ideb! >= 5 && s.ideb! < 6).length,
                      ours.filter(s => s.ideb! >= 6 && s.ideb! < 7).length,
                      ours.filter(s => s.ideb! >= 7 && s.ideb! < 8).length,
                      ours.filter(s => s.ideb! >= 8).length,
                    ];
                    const maxB = Math.max(...buckets, 1);
                    const labels = ['<3','3-4','4-5','5-6','6-7','7-8','>8'];
                    const maxIdx = buckets.indexOf(Math.max(...buckets));
                    return (
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: '100%', paddingBottom: 24 }}>
                        {buckets.map((count, i) => (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                            {i === maxIdx && count > 0 && <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#fff', background: 'var(--ink)', padding: '2px 8px', borderRadius: 6 }}>{count}</span>}
                            <div style={{ width: '100%', borderRadius: '10px 10px 0 0', height: `${Math.max((count / maxB) * 85, count > 0 ? 8 : 0)}%`, background: i === maxIdx ? 'linear-gradient(180deg, #FF8A4C, #FF6B2C)' : '#FFE4D5' }} />
                            <span style={{ fontSize: '.68rem', color: 'var(--text-dim)', position: 'absolute', bottom: 0, fontFamily: 'var(--font-mono)' }}>{labels[i]}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                <div className="feature-pill">
                  <div className="donut orange" style={{ '--p': `${idebPct}%` } as React.CSSProperties}><span>{idebPct}%</span></div>
                  <div>
                    <div className="fp-title">IDEB Médio Regional</div>
                    <div className="fp-stats">
                      <div><div className="fp-stat-label">Sorocaba</div><div className="fp-stat-val">{sorocaba?.avgIdeb?.toFixed(2) ?? '—'}</div></div>
                      <div><div className="fp-stat-label">Votorantim</div><div className="fp-stat-val">{votorantim?.avgIdeb?.toFixed(2) ?? '—'}</div></div>
                    </div>
                  </div>
                  <button className="fp-arrow" onClick={() => setExplainModal('ideb')} title="O que é o IDEB?"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 6l6 6-6 6"/></svg></button>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-card-head">
                  <h3>Infra Score por Dependência</h3>
                  <span className="chart-card-sub">Escolas da região</span>
                </div>
                <div className="chart-area" style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', paddingBottom: 0 }}>
                  {ourDepDist.map(({ dep, pct: p, avgIdeb }) => (
                    <div key={dep}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '.8rem' }}>
                        <span style={{ fontWeight: 700 }}>{dep}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.74rem', color: 'var(--text-muted)' }}>IDEB {avgIdeb}</span>
                      </div>
                      <div style={{ height: 8, background: 'var(--surface-3)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${p}%`, background: dep === 'Municipal' ? 'var(--accent-grad)' : dep === 'Estadual' ? 'var(--purple-grad)' : 'var(--ink)', borderRadius: 99 }} />
                      </div>
                      <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>{p}% das escolas</div>
                    </div>
                  ))}
                </div>
                <div className="feature-pill">
                  <div className="donut purple" style={{ '--p': `${ourStats.avgInfra?.toFixed(0) ?? 0}%` } as React.CSSProperties}><span>{ourStats.avgInfra?.toFixed(0) ?? 0}%</span></div>
                  <div>
                    <div className="fp-title">Infra Score Médio</div>
                    <div className="fp-stats">
                      <div><div className="fp-stat-label">Sorocaba</div><div className="fp-stat-val">{sorocaba?.avgInfra?.toFixed(0) ?? '—'}%</div></div>
                      <div><div className="fp-stat-label">Votorantim</div><div className="fp-stat-val">{votorantim?.avgInfra?.toFixed(0) ?? '—'}%</div></div>
                    </div>
                  </div>
                  <button className="fp-arrow" onClick={() => setExplainModal('infra')} title="O que é o Infra Score?"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 6l6 6-6 6"/></svg></button>
                </div>
              </div>
            </div>
          </div>

          {/* SIDE PANEL */}
          <aside className="side-panel">
            <div className="summary-card">
              <div className="summary-ring" style={{ background: `conic-gradient(from 220deg, #FF6B2C 0deg, #B14CFF 80deg, transparent 130deg, transparent 230deg, #B14CFF 280deg, #FF6B2C 360deg)` }}>
                <div className="summary-inner">
                  <div>
                    <div className="summary-inner-num">{ourStats.avgIdeb?.toFixed(1) ?? '—'}</div>
                    <div className="summary-inner-lbl">IDEB</div>
                  </div>
                </div>
              </div>
              <div className="summary-name">Resultado Consolidado</div>
              <div className="summary-balance-label">Total de escolas avaliadas</div>
              <div className="summary-balance">{ourStats.n}</div>
              <div className="summary-balance-sub">{ourStats.withIdeb} com IDEB · {ourStats.n - ourStats.withIdeb} sem dados</div>
            </div>

            <div className="rank-card">
              <div className="rank-head">
                <h3>Top Escolas</h3>
                <button className="view-all" onClick={() => scrollTo('escolas')}>Ver todas</button>
              </div>
              <div className="rank-date">Ranking IDEB 2023</div>
              <div className="rank-list">
                {topSchools.map((s, i) => (
                  <div key={s.inep_id} className={`rank-row${i === 2 ? ' highlight' : ''}`}>
                    <div className={`rank-icon${i === 0 ? ' gold' : i === 1 ? ' silver' : i === 2 ? ' bronze' : ''}`}>{i + 1}</div>
                    <div className="rank-info">
                      <div className="rank-name" title={s.nome_escola}>{s.nome_escola.length > 24 ? s.nome_escola.substring(0, 24) + '…' : s.nome_escola}</div>
                      <div className="rank-cat">{s.no_municipio} · {s.dependencia}</div>
                    </div>
                    <div className={`rank-score${s.ideb! < 6 ? ' mid' : ''}`}>{s.ideb!.toFixed(1)}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* ══ RANKING ══ */}
        <section className="section" id="ranking">
          <div className="section-head">
            <div>
              <h2 className="section-title">Ranking Nacional</h2>
              <p className="section-sub">Todos os {cityAgg.filter(c => c.avgIdeb != null).length} municípios por IDEB médio · Nossa região em laranja</p>
            </div>
          </div>
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22 }}>
            <div style={{ height: 520 }}>
              <RankingChart data={cityAgg} theme="light" />
            </div>
          </div>
        </section>

        {/* ══ PARADOXO ══ */}
        <section className="section" id="paradox">
          <div className="section-head">
            <div>
              <h2 className="section-title">O Paradoxo do Nordeste</h2>
              <p className="section-sub">Municípios que fazem mais com menos — o argumento central do projeto</p>
            </div>
          </div>
          <div className="paradox-grid">
            {paradoxData.map(c => {
              const isOurs = OUR_CITIES.includes(c.city);
              const isRef  = ['Sobral', 'João Pessoa'].includes(c.city);
              return (
                <div key={c.city} className={`paradox-card${isOurs ? ' is-ours' : isRef ? ' is-ref' : ''}`}>
                  <span className="paradox-label">{c.city}{isOurs ? ' · nossa região' : isRef ? ' · referência NE' : ''}</span>
                  <span className="paradox-ideb">{c.avgIdeb?.toFixed(1) ?? '—'}</span>
                  <div className="paradox-metrics">
                    {[
                      ['Infra Score',   c.avgInfra?.toFixed(0)  != null ? c.avgInfra!.toFixed(0) + '%' : '—'],
                      ['Internet',      c.pctInternet  != null ? c.pctInternet  + '%' : '—'],
                      ['Lab. Info.',    c.pctLabInfo   != null ? c.pctLabInfo   + '%' : '—'],
                      ['Biblioteca',    c.pctBiblioteca!= null ? c.pctBiblioteca+ '%' : '—'],
                    ].map(([k, v]) => (
                      <div key={k} className="paradox-metric-row">
                        <span className="paradox-metric-key">{k}</span>
                        <span className="paradox-metric-val">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 20, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22 }}>
            <div style={{ marginBottom: 12, fontWeight: 700, fontSize: '.95rem' }}>IDEB × Score de Infraestrutura</div>
            <div style={{ height: 320 }}><ParadoxChart data={cityAgg} theme="light" /></div>
          </div>
          <div className="insight-pill" style={{ marginTop: 16 }}>
            <span className="insight-pill-icon">⚡</span>
            <p className="insight-pill-text">
              <strong>Sobral (CE)</strong> supera nossa região no IDEB com IDH 0.714 (vs 0.798 de Sorocaba) e infraestrutura inferior. O diferencial não é recurso — é <strong>qualidade de gestão pedagógica e formação docente</strong>.
            </p>
          </div>
        </section>

        {/* ══ INFRAESTRUTURA ══ */}
        <section className="section" id="infra">
          <div className="section-head">
            <div>
              <h2 className="section-title">Infraestrutura Comparada</h2>
              <p className="section-sub">% de escolas com cada recurso por município · <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Laranja = nossa região</span> · <span style={{ color: 'var(--accent-2)', fontWeight: 700 }}>Roxo = referências</span></p>
            </div>
          </div>
          <div className="infra-section-grid">
            {INFRA_METRICS.map(metric => (
              <div key={metric.key} className="infra-metric-block" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 18 }}>
                <div className="infra-metric-title">{metric.label}</div>
                {infraData.map(c => {
                  const value = infraPct(c, metric.key);
                  const isOurs = OUR_CITIES.includes(c.city);
                  const isRef  = ['Sobral', 'João Pessoa', 'Recife'].includes(c.city);
                  return (
                    <div key={c.city} className={`infra-city-row${isOurs ? ' is-ours' : isRef ? ' is-ref' : ''}`}>
                      <span className={`infra-city-name${isOurs ? ' is-ours' : isRef ? ' is-ref' : ''}`}>{c.city}</span>
                      <div className="infra-bar-bg"><div className="infra-bar-fill" style={{ width: `${value ?? 0}%` }} /></div>
                      <span className="infra-pct">{value != null ? value + '%' : '—'}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        {/* ══ ESCOLAS (tabela) ══ */}
        <section className="section" id="escolas">
          <div className="section-head">
            <div>
              <h2 className="section-title">Ranking de Escolas</h2>
              <p className="section-sub">Dados individuais de todas as {allData.length} escolas da base</p>
            </div>
            <div className="chips">
              {[['ideb_desc','IDEB ↓'],['infra_score_desc','Infra ↓'],['nota_lp_desc','LP ↓'],['nota_mt_desc','MT ↓'],['fluxo_desc','Fluxo ↓']].map(([v,l]) => (
                <button key={v} className={`chip${sortKey+'_'+sortDir === v ? ' active' : ''}`} onClick={() => {
                  const p = v.split('_'); const d = p.pop() as 'asc'|'desc'; setSortKey(p.join('_')); setSortDir(d); setPage(1);
                }}>{l}</button>
              ))}
            </div>
          </div>

          <div className="filter-inline">
            <div className="filter-group">
              <label className="filter-label">Município</label>
              <select className="filter-select" value={filters.city} onChange={e => setFilter('city', e.target.value)}>
                <option value="">Todos</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Dependência</label>
              <select className="filter-select" value={filters.dep} onChange={e => setFilter('dep', e.target.value)}>
                <option value="">Todas</option>
                <option value="Municipal">Municipal</option>
                <option value="Estadual">Estadual</option>
                <option value="Federal">Federal</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">IDEB</label>
              <select className="filter-select" value={filters.idebRange} onChange={e => setFilter('idebRange', e.target.value)}>
                <option value="">Todos</option>
                <option value="high">Alto (≥ 7)</option>
                <option value="mid">Médio (5–7)</option>
                <option value="low">Baixo (&lt; 5)</option>
                <option value="nodata">Sem dados</option>
              </select>
            </div>
            <div className="filter-group" style={{ flex: 1 }}>
              <label className="filter-label">Buscar</label>
              <div className="filter-search">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#9AA0AB" strokeWidth="2"><circle cx="9" cy="9" r="6"/><path d="M14 14l4 4"/></svg>
                <input type="text" placeholder="Nome da escola..." value={filters.search} onChange={e => setFilter('search', e.target.value)} />
              </div>
            </div>
            <button className="filter-clear" onClick={clearFilters}>Limpar</button>
            <span className="filter-count">{filtered.length} escola{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="table-card">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>#</th>
                    <th className={`sortable${sortKey==='nome_escola'?' '+sortDir:''}`} onClick={() => handleSort('nome_escola')}>Escola</th>
                    <th className={`sortable${sortKey==='no_municipio'?' '+sortDir:''}`} onClick={() => handleSort('no_municipio')}>Município</th>
                    <th className={`sortable${sortKey==='dependencia'?' '+sortDir:''}`} onClick={() => handleSort('dependencia')}>Dependência</th>
                    <th className={`sortable${sortKey==='ideb'?' '+sortDir:''}`} onClick={() => handleSort('ideb')}>IDEB</th>
                    <th className={`sortable${sortKey==='nota_lp'?' '+sortDir:''}`} onClick={() => handleSort('nota_lp')}>LP</th>
                    <th className={`sortable${sortKey==='nota_mt'?' '+sortDir:''}`} onClick={() => handleSort('nota_mt')}>MT</th>
                    <th style={{ minWidth: 140 }}>Fluxo</th>
                    <th className={`sortable${sortKey==='infra_score'?' '+sortDir:''}`} onClick={() => handleSort('infra_score')}>Infra</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0
                    ? <tr><td colSpan={9}><div className="empty-state">Nenhuma escola encontrada.</div></td></tr>
                    : pageItems.map((s, i) => (
                        <tr key={s.inep_id}>
                          <td><span className={`rank-badge${s.ideb != null && s.ideb >= 8 ? ' top' : ''}`}>{(page-1)*PAGE_SIZE+i+1}</span></td>
                          <td><span className="school-name" title={s.nome_escola}>{s.nome_escola}</span></td>
                          <td style={{ color: 'var(--text-muted)' }}>{s.no_municipio}</td>
                          <td><span className={`pill ${s.dependencia === 'Municipal' ? 'muni' : s.dependencia === 'Estadual' ? 'est' : 'fed'}`}>{s.dependencia}</span></td>
                          <td><span className={`ideb-badge ${idebBadge(s.ideb)}`}>{s.ideb != null ? s.ideb.toFixed(1) : '—'}</span></td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '.8rem' }}>{s.nota_lp != null ? s.nota_lp.toFixed(1) : '—'}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '.8rem' }}>{s.nota_mt != null ? s.nota_mt.toFixed(1) : '—'}</td>
                          <td>
                            <div className="mini-bar">
                              <div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: `${s.fluxo != null ? s.fluxo * 100 : 0}%` }} /></div>
                              <span className="mini-bar-val">{s.fluxo != null ? (s.fluxo*100).toFixed(1)+'%' : '—'}</span>
                            </div>
                          </td>
                          <td><span className={`infra-badge ${infraBadge(s.infra_score)}`}>{s.infra_score != null ? s.infra_score.toFixed(0)+'%' : '—'}</span></td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
            <div className="table-foot">
              <span>Mostrando {Math.min((page-1)*PAGE_SIZE+1, sorted.length)}–{Math.min(page*PAGE_SIZE, sorted.length)} de {sorted.length} escolas</span>
              <div className="pager">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1}>← Anterior</button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pg = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i, totalPages));
                  return <button key={pg} className={page === pg ? 'pg-active' : ''} onClick={() => setPage(pg)}>{pg}</button>;
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages}>Próximo →</button>
              </div>
            </div>
          </div>
        </section>

        {/* ══ COMPARATIVO ══ */}
        <section className="section" id="comparativo">
          <div className="section-head">
            <div>
              <h2 className="section-title">Lupa Local — Comparativo</h2>
              <p className="section-sub">Compare métricas-chave entre municípios</p>
            </div>
          </div>
          <div className="vs-card">
            <div className="vs-selectors">
              <div className="vs-selector a">
                <label>Município A</label>
                <select value={compareCity1} onChange={e => setCompareCity1(e.target.value)}>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="vs-sep">VS</div>
              <div className="vs-selector b">
                <label>Município B</label>
                <select value={compareCity2} onChange={e => setCompareCity2(e.target.value)}>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            {compareData && (
              <div className="vs-metrics">
                {[
                  { label: 'IDEB Médio',       vals: compareData.map(c => c.avgIdeb ?? 0),        fmt: (v: number) => v.toFixed(2), max: 10  },
                  { label: 'SAEB LP',          vals: compareData.map(c => { const s = allData.filter(e => e.no_municipio === c.city && e.nota_lp != null); const a = avg(s.map(e => e.nota_lp!)); return a ?? 0; }), fmt: (v: number) => v.toFixed(1), max: 350 },
                  { label: 'SAEB MT',          vals: compareData.map(c => { const s = allData.filter(e => e.no_municipio === c.city && e.nota_mt != null); const a = avg(s.map(e => e.nota_mt!)); return a ?? 0; }), fmt: (v: number) => v.toFixed(1), max: 350 },
                  { label: 'Taxa Aprovação',   vals: compareData.map(c => { const s = allData.filter(e => e.no_municipio === c.city && e.fluxo != null); const a = avg(s.map(e => e.fluxo!)); return a ? a * 100 : 0; }), fmt: (v: number) => v.toFixed(1)+'%', max: 100 },
                  { label: 'Infra Score',      vals: compareData.map(c => c.avgInfra ?? 0),        fmt: (v: number) => v.toFixed(0)+'%', max: 100 },
                  { label: 'Nº de Escolas',    vals: compareData.map(c => c.n),                    fmt: (v: number) => v.toString(),     max: Math.max(...compareData.map(c => c.n)) },
                ].map(({ label, vals, fmt, max }) => {
                  const maxVal = Math.max(...vals);
                  return (
                    <div key={label} className="vs-metric">
                      <div className="vs-metric-title">{label}</div>
                      {compareData.map((c, ci) => {
                        const v = vals[ci];
                        const pctV = max ? (v / max) * 100 : 0;
                        const isLeader = v === maxVal && vals[0] !== vals[1];
                        return (
                          <div key={c.city} className="vs-row">
                            <span className={`vs-name ${ci === 0 ? 'a' : 'b'}`}>{c.city}{isLeader && <span className="leader">★</span>}</span>
                            <div className="vs-bar-track"><div className={`vs-bar-fill ${ci === 0 ? 'a' : 'b'}`} style={{ width: `${pctV}%` }} /></div>
                            <span className="vs-val">{fmt(v)}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ══ INVESTIMENTO ══ */}
        <section className="section">
          <div className="section-head">
            <div>
              <h2 className="section-title">Investimento × Desempenho</h2>
              <p className="section-sub">Estimativas de R$/aluno/ano por município · Dados FNDE/Portais de Transparência</p>
            </div>
          </div>
          <div className="invest-card">
            <div className="invest-kpis">
              <div className="invest-kpi">
                <div className="invest-kpi-label">Maior Investimento</div>
                <div className="invest-kpi-val">{investKpis ? `R$ ${investKpis.maxInv.invest.toLocaleString('pt-BR')}` : '—'}</div>
                <div className="invest-kpi-sub">{investKpis?.maxInv.municipio ?? '—'}</div>
              </div>
              <div className="invest-kpi">
                <div className="invest-kpi-label">Melhor Eficiência</div>
                <div className="invest-kpi-val">{investKpis?.bestEff ?? '—'}</div>
                <div className="invest-kpi-sub">{investKpis?.bestEffCity ?? 'IDEB / R$ mil'}</div>
              </div>
              <div className="invest-kpi">
                <div className="invest-kpi-label">Correlação (Pearson)</div>
                <div className="invest-kpi-val">{investKpis?.corr ?? '—'}</div>
                <div className="invest-kpi-sub">invest × IDEB</div>
              </div>
            </div>
            <div className="invest-list">
              {[...investData].sort((a, b) => b.invest - a.invest).map(m => {
                const isOurs = OUR_CITIES.includes(m.municipio);
                const pctV = Math.round((m.invest / maxInvest) * 100);
                const idebColor = m.avgIdeb >= 7 ? 'var(--good)' : m.avgIdeb >= 5 ? 'var(--warn)' : 'var(--bad)';
                return (
                  <div key={m.municipio} className={`invest-row${isOurs ? ' is-ours' : ''}`}>
                    <span className="city">{m.municipio}{isOurs ? ' ←' : ''}</span>
                    <div className="invest-bar"><div className="invest-bar-fill" style={{ width: `${pctV}%` }} /></div>
                    <span className="invest-val">R$ {(m.invest / 1000).toFixed(1)}k</span>
                    <span className="invest-ideb-val" style={{ color: idebColor }}>{m.avgIdeb.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══ DICIONÁRIO ══ */}
        <section className="section">
          <div className="section-head">
            <div>
              <h2 className="section-title">Dicionário de Dados</h2>
              <p className="section-sub">Variáveis utilizadas na análise</p>
            </div>
          </div>
          <div className="dict-grid">
            {DATA_DICT.map(e => (
              <div key={e.field} className="dict-card">
                <div className="dict-field">{e.field}</div>
                <div className="dict-name">{e.name}</div>
                <div className="dict-desc">{e.desc}</div>
                <div className="dict-range">{e.range}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ EQUIPE ══ */}
        <section className="section" id="equipe">
          <div className="section-head">
            <div>
              <h2 className="section-title">Equipe</h2>
              <p className="section-sub">Ciência de Dados para Negócios</p>
            </div>
          </div>
          <div className="team-grid">
            {TEAM.map(m => (
              <div key={m.name} className="team-card">
                <div className={`team-avatar ${m.cls}`}>{m.initials}</div>
                <div className="team-name">{m.name}</div>
                <div className="team-role">{m.role}</div>
                <a className="team-link" href={m.linkedin}>↗ LinkedIn</a>
              </div>
            ))}
          </div>
        </section>

        <div className="footer">
          Observatório Educacional v3.0 — Dados INEP 2023 · Projeto acadêmico
        </div>

      </main>

      <div className={`toast${toastMsg ? ' show' : ''}`}>{toastMsg}</div>

      {/* EXPLAIN MODAL */}
      {explainModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(14,17,22,.55)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setExplainModal(null); }}
        >
          <div style={{ background: '#fff', borderRadius: 20, padding: '32px 36px', maxWidth: 480, width: '100%', position: 'relative', boxShadow: '0 24px 64px rgba(14,17,22,.18)' }}>
            <button onClick={() => setExplainModal(null)} style={{ position: 'absolute', top: 14, right: 18, background: 'none', border: 'none', fontSize: '1.4rem', color: 'var(--text-dim)', cursor: 'pointer', lineHeight: 1 }}>×</button>

            {explainModal === 'ideb' ? (
              <>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: 999, padding: '4px 12px', fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
                  IDEB — Índice de Desenvolvimento da Educação Básica
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-.02em', marginBottom: 12 }}>Como o IDEB é calculado?</h3>
                <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', fontFamily: 'var(--font-mono, monospace)', fontSize: '.92rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 16, textAlign: 'center', letterSpacing: '.02em' }}>
                  IDEB = N × P
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    ['N — Nota padronizada', 'Derivada das proficiências do SAEB em Língua Portuguesa e Matemática, convertida para escala 0–10.'],
                    ['P — Fluxo (Aprovação)', 'Taxa média de aprovação nas séries avaliadas. Valor 1.0 significa que todos os alunos avançaram sem reprovação ou abandono.'],
                    ['Escala', 'O IDEB varia de 0 a 10. A meta nacional para anos iniciais (1º–5º ano) em 2023 é 6,0. Nosso resultado atual é ' + (ourStats.avgIdeb?.toFixed(2) ?? '—') + '.'],
                    ['Frequência', 'Publicado a cada dois anos pelo INEP. O dado mais recente é de 2023.'],
                  ].map(([titulo, desc]) => (
                    <div key={titulo} style={{ padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 12, borderLeft: '3px solid var(--accent)' }}>
                      <div style={{ fontWeight: 700, fontSize: '.84rem', marginBottom: 4 }}>{titulo}</div>
                      <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent-2-soft)', color: 'var(--accent-2)', borderRadius: 999, padding: '4px 12px', fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
                  Infra Score — Score de Infraestrutura
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-.02em', marginBottom: 12 }}>Como o Infra Score é calculado?</h3>
                <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', fontFamily: 'var(--font-mono, monospace)', fontSize: '.88rem', fontWeight: 700, color: 'var(--accent-2)', marginBottom: 16, textAlign: 'center' }}>
                  Infra Score = itens presentes ÷ 12 × 100%
                </div>
                <p style={{ fontSize: '.84rem', color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>
                  Calculado a partir do Censo Escolar 2023. Cada escola recebe um percentual com base em <strong>12 itens-chave</strong> de infraestrutura:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {['Biblioteca','Lab. Informática','Quadra Esportiva','Internet','Internet para Alunos','Banda Larga','Computador','Água Potável','Energia Rede Pública','Esgoto Rede Pública','Lab. Ciências','Acessibilidade (Rampas)'].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.78rem', color: 'var(--text-muted)', padding: '6px 10px', background: 'var(--surface-2)', borderRadius: 8 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-2)', flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--accent-2-soft)', borderRadius: 12, fontSize: '.8rem', color: 'var(--accent-2)', fontWeight: 600 }}>
                  Score atual da região: {ourStats.avgInfra?.toFixed(0) ?? '—'}% — média de Sorocaba ({sorocaba?.avgInfra?.toFixed(0) ?? '—'}%) e Votorantim ({votorantim?.avgInfra?.toFixed(0) ?? '—'}%)
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
