'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { Escola } from '@/lib/types';

// Carregar gráfico do paradoxo dinamicamente para evitar erro de SSR (Canvas depende de Window)
const ParadoxChart = dynamic(() => import('./ParadoxChart'), { ssr: false });

interface Props {
  initialData: Escola[];
}

const OUR_CITIES = ['Sorocaba', 'Votorantim'];

/* ─── HELPERS ─── */
function avg(arr: number[]) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
}

export default function Presentation({ initialData }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // Timer para apresentadores
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Total de slides segmentados (16 slides)
  const TOTAL_SLIDES = 16;

  // Controle de tempo do apresentador
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const goToNextSlide = () => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      setDirection('forward');
      setCurrentSlide(prev => prev + 1);
    }
  };

  const goToPrevSlide = () => {
    if (currentSlide > 0) {
      setDirection('backward');
      setCurrentSlide(prev => prev - 1);
    }
  };

  const jumpToSlide = (index: number) => {
    if (index >= 0 && index < TOTAL_SLIDES) {
      setDirection(index > currentSlide ? 'forward' : 'backward');
      setCurrentSlide(index);
    }
  };

  // Teclado para passar slides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        goToNextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevSlide();
      } else if (e.key === 'Home') {
        e.preventDefault();
        jumpToSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        jumpToSlide(TOTAL_SLIDES - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  // Monitorar tela cheia
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Erro ao ativar tela cheia: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  /* ── Aggregation local para slides de dados e insights ── */
  const { 
    ourStats, 
    cityAgg, 
    bestSchool,
    sorocabaStats,
    votorantimStats,
    sobralStats,
    saoCaetanoStats,
    sorocabaTop3,
    votorantimTop3,
    sobralTop3
  } = useMemo(() => {
    const ours = initialData.filter(s => OUR_CITIES.includes(s.no_municipio));
    const wi = ours.filter(s => s.ideb != null);
    const wif = ours.filter(s => s.infra_score != null);

    const stats = {
      n: ours.length,
      withIdeb: wi.length,
      avgIdeb: avg(wi.map(s => s.ideb!)),
      avgInfra: avg(wif.map(s => s.infra_score!)),
      avgLp: avg(ours.filter(s => s.nota_lp != null).map(s => s.nota_lp!)),
      avgMt: avg(ours.filter(s => s.nota_mt != null).map(s => s.nota_mt!)),
      avgFluxo: avg(ours.filter(s => s.fluxo != null).map(s => s.fluxo!)),
    };

    // Sorocaba
    const sSchools = initialData.filter(s => s.no_municipio === 'Sorocaba');
    const sWi = sSchools.filter(s => s.ideb != null);
    const sWif = sSchools.filter(s => s.infra_score != null);
    const sStats = {
      n: sSchools.length,
      avgIdeb: avg(sWi.map(s => s.ideb!)),
      avgInfra: avg(sWif.map(s => s.infra_score!)),
      avgLp: avg(sSchools.filter(s => s.nota_lp != null).map(s => s.nota_lp!)),
      avgMt: avg(sSchools.filter(s => s.nota_mt != null).map(s => s.nota_mt!)),
      avgFluxo: avg(sSchools.filter(s => s.fluxo != null).map(s => s.fluxo!)),
    };
    const sTop3 = [...sWi].sort((a, b) => (b.ideb ?? 0) - (a.ideb ?? 0)).slice(0, 3);

    // Votorantim
    const vSchools = initialData.filter(s => s.no_municipio === 'Votorantim');
    const vWi = vSchools.filter(s => s.ideb != null);
    const vWif = vSchools.filter(s => s.infra_score != null);
    const vStats = {
      n: vSchools.length,
      avgIdeb: avg(vWi.map(s => s.ideb!)),
      avgInfra: avg(vWif.map(s => s.infra_score!)),
      avgLp: avg(vSchools.filter(s => s.nota_lp != null).map(s => s.nota_lp!)),
      avgMt: avg(vSchools.filter(s => s.nota_mt != null).map(s => s.nota_mt!)),
      avgFluxo: avg(vSchools.filter(s => s.fluxo != null).map(s => s.fluxo!)),
    };
    const vTop3 = [...vWi].sort((a, b) => (b.ideb ?? 0) - (a.ideb ?? 0)).slice(0, 3);

    // Sobral
    const sobSchools = initialData.filter(s => s.no_municipio === 'Sobral');
    const sobWi = sobSchools.filter(s => s.ideb != null);
    const sobWif = sobSchools.filter(s => s.infra_score != null);
    const sobStats = {
      n: sobSchools.length,
      avgIdeb: avg(sobWi.map(s => s.ideb!)),
      avgInfra: avg(sobWif.map(s => s.infra_score!)),
      avgLp: avg(sobSchools.filter(s => s.nota_lp != null).map(s => s.nota_lp!)),
      avgMt: avg(sobSchools.filter(s => s.nota_mt != null).map(s => s.nota_mt!)),
      avgFluxo: avg(sobSchools.filter(s => s.fluxo != null).map(s => s.fluxo!)),
    };
    const sobTop3 = [...sobWi].sort((a, b) => (b.ideb ?? 0) - (a.ideb ?? 0)).slice(0, 3);

    // São Caetano do Sul
    const scSchools = initialData.filter(s => s.no_municipio === 'São Caetano do Sul');
    const scWi = scSchools.filter(s => s.ideb != null);
    const scWif = scSchools.filter(s => s.infra_score != null);
    const scStats = {
      n: scSchools.length,
      avgIdeb: avg(scWi.map(s => s.ideb!)),
      avgInfra: avg(scWif.map(s => s.infra_score!)),
      avgLp: avg(scSchools.filter(s => s.nota_lp != null).map(s => s.nota_lp!)),
      avgMt: avg(scSchools.filter(s => s.nota_mt != null).map(s => s.nota_mt!)),
      avgFluxo: avg(scSchools.filter(s => s.fluxo != null).map(s => s.fluxo!)),
    };

    const map = new Map<string, { idebVals: number[]; infraVals: number[]; n: number }>();
    initialData.forEach(s => {
      if (!map.has(s.no_municipio)) map.set(s.no_municipio, { idebVals: [], infraVals: [], n: 0 });
      const c = map.get(s.no_municipio)!;
      c.n++;
      if (s.ideb != null) c.idebVals.push(s.ideb);
      if (s.infra_score != null) c.infraVals.push(s.infra_score);
    });

    const agg = Array.from(map.entries()).map(([city, d]) => ({
      city,
      n: d.n,
      avgIdeb: avg(d.idebVals),
      avgInfra: avg(d.infraVals),
      isOurs: OUR_CITIES.includes(city),
    }));

    const rankedOurs = [...wi].sort((a, b) => (b.ideb ?? 0) - (a.ideb ?? 0));
    const best = rankedOurs[0] || null;

    return { 
      ourStats: stats, 
      cityAgg: agg, 
      bestSchool: best,
      sorocabaStats: sStats,
      votorantimStats: vStats,
      sobralStats: sobStats,
      saoCaetanoStats: scStats,
      sorocabaTop3: sTop3,
      votorantimTop3: vTop3,
      sobralTop3: sobTop3
    };
  }, [initialData]);

  // Auroras dinâmicas por bloco de slide
  const glowThemeClass = useMemo(() => {
    if (currentSlide === 0) return 'glow-theme-default';
    if (currentSlide >= 1 && currentSlide <= 3) return 'glow-theme-intro';
    if (currentSlide >= 4 && currentSlide <= 6) return 'glow-theme-paradox';
    if (currentSlide >= 7 && currentSlide <= 9) return 'glow-theme-local';
    if (currentSlide >= 10 && currentSlide <= 12) return 'glow-theme-benchmark';
    return 'glow-theme-conclusion';
  }, [currentSlide]);

  return (
    <div className={`pres-container ${glowThemeClass}`}>
      {/* Aurora glow blobs for modern aesthetics */}
      <div className="glow-blob glow-blob-1" />
      <div className="glow-blob glow-blob-2" />

      {/* ══ HEADER ══ */}
      <header className="pres-header">
        <div className="pres-logo">
          <div className="pres-logo-icon">
            <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
              <rect x="5" y="18" width="5" height="5" rx="1.5" fill="#fff" fillOpacity="0.4" />
              <rect x="11.5" y="13" width="5" height="10" rx="1.5" fill="#fff" fillOpacity="0.7" />
              <rect x="18" y="8" width="5" height="15" rx="1.5" fill="#FF6B2C" />
            </svg>
          </div>
          <span className="pres-logo-text">Observatório Educacional</span>
          <span className="pres-logo-tag">Apresentação Avançada</span>
        </div>

        {/* Presenter Helper (Timer) */}
        <div className="pres-timer-widget">
          <span className="timer-label">⏱️ TEMPO:</span>
          <span className="timer-clock">{formatTime(timerSeconds)}</span>
          <button 
            className="timer-control-btn"
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            title={isTimerRunning ? 'Pausar Timer' : 'Iniciar Timer'}
          >
            {isTimerRunning ? '⏸️' : '▶️'}
          </button>
          <button 
            className="timer-control-btn"
            onClick={() => { setTimerSeconds(0); setIsTimerRunning(false); }}
            title="Resetar Timer"
          >
            🔄
          </button>
        </div>

        <div className="pres-actions">
          <button className="pres-btn-exit" onClick={toggleFullscreen}>
            {isFullscreen ? '📺 Sair de Tela Cheia' : '📺 Tela Cheia (F11)'}
          </button>
          <Link href="/" className="pres-btn-exit">
            📊 Painel Interativo
          </Link>
        </div>
      </header>

      {/* ══ SLIDE WRAPPER ══ */}
      <div className="pres-slide-wrap">
        {/* SLIDE 1: CAPA SPLIT */}
        {currentSlide === 0 && (
          <div className={`pres-slide slide-dir-${direction}`} key="cover">
            <div className="slide-cover-split">
              {/* Coluna Esquerda */}
              <div className="slide-cover-left">
                <span className="slide-cover-badge">📊 Inteligência de Dados Públicos</span>
                <h1>Onde Está a Diferença?</h1>
                <p className="subtitle">
                  Desmistificando os limitadores do IDEB: Uma análise comparativa e orientada a dados sobre infraestrutura, fluxo e proficiência pedagógica nas redes municipais de Sorocaba e Votorantim.
                </p>
                
                <button className="slide-cover-btn" onClick={goToNextSlide}>
                  Iniciar Diagnóstico de Impacto ➔
                </button>

                <div className="slide-cover-team">
                  <span className="slide-cover-member">👥 Douglas Ferreira</span>
                  <span className="slide-cover-member">👥 Gabriel Ferreira</span>
                  <span className="slide-cover-member">👥 Mateus Mariano</span>
                  <span className="slide-cover-member">👥 Peterson Alves</span>
                </div>
              </div>

              {/* Coluna Direita: Tese em 3 Pilares */}
              <div className="slide-cover-right">
                <div className="thesis-card">
                  <h3 className="thesis-title">🎯 A Tese Analítica em 3 Pilares</h3>
                  
                  <div className="thesis-step">
                    <span className="thesis-step-num">1</span>
                    <div className="thesis-step-text">
                      <strong>Recorte de Governança (Fund. I)</strong>
                      <p>Foco nos Anos Iniciais (3º e 4º anos) municipais. A base da pirâmide onde o investimento público gera o maior retorno pedagógico e social.</p>
                    </div>
                  </div>

                  <div className="thesis-step">
                    <span className="thesis-step-num">2</span>
                    <div className="thesis-step-text">
                      <strong>O Paradoxo Estrutural</strong>
                      <p>Derrubando o mito de que tijolo e cimento garantem IDEB. Escolas regionais excelentes fisicamente (75-80%) entregam resultados medianos (~6.0).</p>
                    </div>
                  </div>

                  <div className="thesis-step">
                    <span className="thesis-step-num">3</span>
                    <div className="thesis-step-text">
                      <strong>O Gargalo Pedagógico</strong>
                      <p>Isolando a causa raiz. Nossos colégios possuem fluxo perfeito (100% aprovação). A queda de qualidade está estritamente na proficiência SAEB.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: JUSTIFICATIVA */}
        {currentSlide === 1 && (
          <div className={`pres-slide slide-dir-${direction}`} key="justificativa">
            <div className="slide-header">
              <span className="slide-num">Slide 02 / {TOTAL_SLIDES}</span>
              <h2 className="slide-title">A Justificativa & O Problema</h2>
            </div>
            <div className="slide-body">
              <div className="pres-grid-2">
                <div className="pres-list">
                  <div className="pres-card pres-card-highlight">
                    <h3>💡 O Ponto de Inflexão Educacional</h3>
                    <p>
                      Mapear se as escolas de Sorocaba e Votorantim possuem a mesma qualidade média não basta. O verdadeiro desafio público reside em <strong>isolar o ponto de queda em que escolas de mesma região geográfica e orçamentos similares passam a entregar resultados discrepantes.</strong>
                    </p>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
                    Esta pesquisa propõe um diagnóstico estatístico, cruzando dados de infraestrutura com exames nacionais de proficiência. O objetivo é demonstrar de forma empírica como podemos melhorar o retorno social de cada real investido na educação municipal.
                  </p>
                </div>
                <div className="pres-list">
                  <div className="pres-list-item">
                    <span className="pres-list-icon">1</span>
                    <div className="pres-list-body">
                      <h4>Isolamento de Fatores</h4>
                      <p>Mapear a correlação matemática entre os recursos físicos disponíveis e o aprendizado das crianças.</p>
                    </div>
                  </div>
                  <div className="pres-list-item">
                    <span className="pres-list-icon">2</span>
                    <div className="pres-list-body">
                      <h4>Substituição de Opinião por Evidência</h4>
                      <p>Nortear a alocação de verba pública com base em lacunas específicas (ex: laboratórios vs. pedagogia).</p>
                    </div>
                  </div>
                  <div className="pres-list-item">
                    <span className="pres-list-icon">3</span>
                    <div className="pres-list-body">
                      <h4>Mapeamento de Distância</h4>
                      <p>Identificar o tamanho real do "abismo" que nos separa das melhores escolas públicas do Brasil.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: RECORTE ESTRATÉGICO */}
        {currentSlide === 2 && (
          <div className={`pres-slide slide-dir-${direction}`} key="recorte">
            <div className="slide-header">
              <span className="slide-num">Slide 03 / {TOTAL_SLIDES}</span>
              <h2 className="slide-title">Recorte de Foco: Por que o 3º e 4º anos?</h2>
            </div>
            <div className="slide-body">
              <div className="pres-grid-2">
                <div className="pres-list">
                  <div className="pres-card pres-card-highlight">
                    <h3>🏛️ A Linha da Governabilidade Municipal</h3>
                    <p>
                      Nos anos finais (8º/9º anos), a oferta educacional na região é majoritariamente gerida pelo **Estado**. Para medir o impacto das políticas públicas das **prefeituras locais**, nosso estudo focou nos **Anos Iniciais (Fundamental I - 3º e 4º anos)**, onde a gestão, corpo docente e orçamento são 100% de responsabilidade do município.
                    </p>
                  </div>
                  <div className="pres-card pres-card-highlight-purple">
                    <h3>📈 Economia da Educação: O Retorno na Base</h3>
                    <p>
                      A neurociência e a economia da educação provam: intervenções de alfabetização na "idade de ouro" têm alto retorno pedagógico. Falhas nesta etapa geram um **"prejuízo acumulado"** caríssimo para ser corrigido mais tarde pelo Estado.
                    </p>
                  </div>
                </div>

                <div className="recorte-base-visual">
                  <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '8px' }}>🎯 Estrutura de Oferta e Impacto Econômico</h3>
                  
                  <div className="recorte-step highlight">
                    <span className="recorte-num">3º/4º</span>
                    <div>
                      <h4>Foco do Nosso Estudo (Gestão Municipal)</h4>
                      <p>Fase crítica de alfabetização e base de cálculo. Máximo retorno por real investido.</p>
                    </div>
                  </div>

                  <div className="recorte-step">
                    <span className="recorte-num">5º</span>
                    <div>
                      <h4>Consolidação do Ciclo Fundamental I</h4>
                      <p>Prova SAEB que determina a fatia de repasse do ICMS educacional do município.</p>
                    </div>
                  </div>

                  <div className="recorte-step" style={{ opacity: 0.5 }}>
                    <span className="recorte-num">8º/9º</span>
                    <div>
                      <h4>Anos Finais (Gestão Estadual)</h4>
                      <p>Fora do escopo direto de políticas públicas escolares das prefeituras da região.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: DICIONÁRIO DE MÉTRICAS */}
        {currentSlide === 3 && (
          <div className={`pres-slide slide-dir-${direction}`} key="metricas">
            <div className="slide-header">
              <span className="slide-num">Slide 04 / {TOTAL_SLIDES}</span>
              <h2 className="slide-title">Dicionário de Métricas Educacionais</h2>
            </div>
            <div className="slide-body">
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>
                Para entender de forma cristalina os dados que analisamos, eis a matemática por trás dos indicadores do INEP:
              </p>

              <div className="pres-grid-2">
                <div className="pres-list" style={{ gap: '12px' }}>
                  <div className="pres-card pres-card-highlight">
                    <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>📊 IDEB (Índice Geral)</span>
                      <code style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>IDEB = N × P</code>
                    </h3>
                    <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>
                      Métrica unificada nacional. Ele é o produto de duas dimensões: a nota média de aprendizado nos exames padronizados (<strong>N</strong>) e a taxa de fluxo/aprovação escolar (<strong>P</strong>). Varia de 0 a 10.
                    </p>
                  </div>

                  <div className="pres-card">
                    <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>🔄 Fluxo Escolar (Aprovação)</span>
                      <code style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>P</code>
                    </h3>
                    <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>
                      Mede a retenção e progressão dos alunos. Um fluxo de <strong>1.0 (ou 100%)</strong> significa que todos os alunos avançaram de ano sem repetência ou abandono ao longo do ano avaliado.
                    </p>
                  </div>
                </div>

                <div className="pres-list" style={{ gap: '12px' }}>
                  <div className="pres-card pres-card-highlight-purple">
                    <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>📝 SAEB (Proficiência)</span>
                      <code style={{ fontSize: '0.85rem', color: 'var(--accent-2)' }}>N</code>
                    </h3>
                    <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>
                      Avaliação nacional aplicada pelo INEP. Testa os alunos do 5º ano em **Língua Portuguesa (leitura/interpretação)** e **Matemática (cálculo/geometria)**, padronizada em uma nota de 0 a 10.
                    </p>
                  </div>

                  <div className="pres-card">
                    <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>⚡ Score de Infraestrutura</span>
                      <code style={{ fontSize: '0.85rem', color: 'var(--accent-2)' }}>infra_score</code>
                    </h3>
                    <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>
                      Métrica customizada desenvolvida nesta pesquisa. Avalia o percentual de presença de <strong>12 itens estruturais e digitais indispensáveis</strong> (laboratórios, computadores, internet rápida, esgoto e água potável).
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '12px 16px', background: 'rgba(129, 140, 248, 0.05)', borderRadius: '12px', border: '1px solid rgba(129, 140, 248, 0.15)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', lineHeight: '1.5' }}>
                ⚖️ <strong>Por que a fórmula do IDEB é um produto (N × P)?</strong> Para evitar fraudes estratégicas: impede que redes reprovem alunos com dificuldade para "inflar a nota SAEB" (o que derrubaria P), ou que aprovem alunos sem saber nada (o que derrubaria N). Exige **qualidade pedagógica com fluxo contínuo**.
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 5: O PARADOXO GERAL */}
        {currentSlide === 4 && (
          <div className={`pres-slide slide-dir-${direction}`} key="paradoxo">
            <div className="slide-header">
              <span className="slide-num">Slide 05 / {TOTAL_SLIDES}</span>
              <h2 className="slide-title">O Paradoxo: Infraestrutura excelente vs. IDEB mediano</h2>
            </div>
            <div className="slide-body">
              <div className="pres-chart-container">
                <div className="pres-chart-box">
                  <ParadoxChart data={cityAgg} theme="dark" />
                </div>

                <div className="pres-chart-desc">
                  <div className="desc-bullet">
                    <span className="desc-bullet-dot orange" />
                    <div className="desc-bullet-body">
                      <h5>Nossa Região (Sorocaba e Votorantim)</h5>
                      <p>Excelente infraestrutura física e digital (Score de 70% a 80%), contudo nossos IDEBs concentram-se no patamar intermediário (5.9 a 6.2). Prova empírica de que cimento e prédios não garantem excelência.</p>
                    </div>
                  </div>

                  <div className="desc-bullet">
                    <span className="desc-bullet-dot purple" />
                    <div className="desc-bullet-body">
                      <h5>O Benchmark Sobral (CE)</h5>
                      <p>Líder nacional do IDEB. Nível máximo de proficiência real com investimentos infraestruturais extremamente simples.</p>
                    </div>
                  </div>

                  <div className="desc-bullet">
                    <span className="desc-bullet-dot green" />
                    <div className="desc-bullet-body">
                      <h5>O Modelo de Alto Custo (São Caetano do Sul)</h5>
                      <p>IDEB excelente de 7.4 atrelado a 98% de score de infraestrutura física. Dificílima replicação fiscal em larga escala nacional.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 6: DEEP DIVE SOBRAL */}
        {currentSlide === 5 && (
          <div className={`pres-slide slide-dir-${direction}`} key="sobral-fenomeno">
            <div className="slide-header">
              <span className="slide-num">Slide 06 / {TOTAL_SLIDES}</span>
              <h2 className="slide-title">Deep Dive: O Fenômeno de Sobral (CE)</h2>
            </div>
            <div className="slide-body">
              <div className="pres-grid-2">
                <div className="pres-list">
                  <div className="pres-card pres-card-highlight">
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                      <span style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--accent)', lineHeight: 1 }}>9.2</span>
                      <div>
                        <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800 }}>IDEB Médio da Rede</h4>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Benchmark absoluto do Brasil</p>
                      </div>
                    </div>
                    <p style={{ marginTop: '16px', fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                      Sobral lidera a educação pública brasileira mesmo operando com um <strong>Score de Infraestrutura de apenas 58.3%</strong>. Suas escolas são simples, desprovidas de equipamentos luxuosos, mas operam com um método pedagógico de precisão cirúrgica.
                    </p>
                  </div>
                  <div className="pres-card">
                    <h3>🛠️ Gestão de Foco Pedagógico</h3>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                      Em vez de computadores de última geração, o investimento de Sobral reside integralmente na capacitação sistemática de professores, material didático estruturado e leitura fluente na idade correta.
                    </p>
                  </div>
                </div>

                <div className="pres-list">
                  <div className="pres-list-item">
                    <span className="pres-list-icon">1</span>
                    <div className="pres-list-body">
                      <h4>Foco Radical na Alfabetização Plena</h4>
                      <p>Garantia de que 100% das crianças leem fluentemente até o fim do 2º ano do Ensino Fundamental.</p>
                    </div>
                  </div>
                  <div className="pres-list-item">
                    <span className="pres-list-icon">2</span>
                    <div className="pres-list-body">
                      <h4>Valorização e Meritocracia Docente</h4>
                      <p>Seleção técnica de diretores sem influência política e premiação financeira por resultados de aprendizado.</p>
                    </div>
                  </div>
                  <div className="pres-list-item">
                    <span className="pres-list-icon">3</span>
                    <div className="pres-list-body">
                      <h4>Avaliação e Monitoramento Mensal</h4>
                      <p>Exames mensais centralizados na secretaria que identificam exatamente quais alunos precisam de reforço imediato.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 7: SÃO CAETANO DO SUL CONTRASTE */}
        {currentSlide === 6 && (
          <div className={`pres-slide slide-dir-${direction}`} key="saocaetano-contraste">
            <div className="slide-header">
              <span className="slide-num">Slide 07 / {TOTAL_SLIDES}</span>
              <h2 className="slide-title">O Contraponto: São Caetano do Sul (SP)</h2>
            </div>
            <div className="slide-body">
              <div className="pres-grid-2">
                <div className="pres-list">
                  <div className="pres-card pres-card-highlight-purple">
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                      <span style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--accent-2)', lineHeight: 1 }}>98%</span>
                      <div>
                        <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800 }}>Infra Score</h4>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Estrutura física máxima</p>
                      </div>
                    </div>
                    <p style={{ marginTop: '16px', fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                      São Caetano do Sul representa o modelo de <strong>alto custo por aluno</strong>. Prédios escolares impecáveis, laboratórios, acessibilidade total e climatização perfeita ajudam a rede a obter um excelente <strong>IDEB de 7.4</strong>.
                    </p>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                    Embora o resultado de São Caetano seja muito positivo, sua tese depende de um orçamento per capita municipal gigantesco. Este modelo de tijolo, cimento e tecnologia física de alto custo é financeiramente inviável para 95% dos municípios brasileiros da nossa região e de todo o país.
                  </p>
                </div>

                <div className="pres-list">
                  <div className="pres-card" style={{ borderLeft: '4px solid #10B981', background: 'rgba(16, 185, 129, 0.04)' }}>
                    <h3 style={{ color: '#10B981' }}>📈 Comparação de Eficiência Pedagógica</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Rede Municipal:</span>
                        <span><strong>Sobral (CE)</strong> vs <strong>S. Caetano (SP)</strong></span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>IDEB Médio:</span>
                        <span><strong style={{ color: 'var(--accent)' }}>9.2</strong> vs <strong>7.4</strong></span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Infraestrutura Física:</span>
                        <span><strong>58.3%</strong> vs <strong style={{ color: 'var(--accent-2)' }}>98.0%</strong></span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Investimento Anual / Aluno:</span>
                        <span><strong>R$ 3.800</strong> vs <strong style={{ color: 'var(--bad)' }}>R$ 14.500</strong></span>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.4' }}>
                    💡 <strong>Conclusão Fiscal:</strong> Sobral prova que é possível obter o triplo da eficiência educacional por aluno gastando um quarto do capital físico de São Caetano, focando exclusivamente nas práticas de ensino-aprendizagem.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 8: PANORAMA SOROCABA */}
        {currentSlide === 7 && (
          <div className={`pres-slide slide-dir-${direction}`} key="sorocaba-panorama">
            <div className="slide-header">
              <span className="slide-num">Slide 08 / {TOTAL_SLIDES}</span>
              <h2 className="slide-title">Mergulho na Rede de Sorocaba (SP)</h2>
            </div>
            <div className="slide-body">
              <div className="pres-grid-2">
                <div>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
                    Estatísticas consolidadas dinamicamente a partir das <strong>{sorocabaStats.n} escolas</strong> da rede municipal de Sorocaba gravadas no banco:
                  </p>

                  <div className="pres-kpi-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="pres-kpi-card" style={{ padding: '14px' }}>
                      <span className="pres-kpi-icon" style={{ fontSize: '1.4rem', width: '38px', height: '38px' }}>🏫</span>
                      <div className="pres-kpi-body">
                        <span className="pres-kpi-label" style={{ fontSize: '0.62rem' }}>Total de Escolas</span>
                        <span className="pres-kpi-val" style={{ fontSize: '1.3rem' }}>{sorocabaStats.n}</span>
                      </div>
                    </div>

                    <div className="pres-kpi-card" style={{ padding: '14px' }}>
                      <span className="pres-kpi-icon" style={{ fontSize: '1.4rem', width: '38px', height: '38px', color: '#6ee7b7' }}>📊</span>
                      <div className="pres-kpi-body">
                        <span className="pres-kpi-label" style={{ fontSize: '0.62rem' }}>IDEB Médio da Rede</span>
                        <span className="pres-kpi-val" style={{ fontSize: '1.3rem', color: '#6ee7b7' }}>{sorocabaStats.avgIdeb?.toFixed(2) || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="pres-kpi-card" style={{ padding: '14px' }}>
                      <span className="pres-kpi-icon" style={{ fontSize: '1.4rem', width: '38px', height: '38px', color: '#818cf8' }}>⚡</span>
                      <div className="pres-kpi-body">
                        <span className="pres-kpi-label" style={{ fontSize: '0.62rem' }}>Infraestrutura Média</span>
                        <span className="pres-kpi-val" style={{ fontSize: '1.3rem' }}>{sorocabaStats.avgInfra?.toFixed(1) || 'N/A'}%</span>
                      </div>
                    </div>

                    <div className="pres-kpi-card" style={{ padding: '14px' }}>
                      <span className="pres-kpi-icon" style={{ fontSize: '1.4rem', width: '38px', height: '38px', color: '#fbbf24' }}>📝</span>
                      <div className="pres-kpi-body">
                        <span className="pres-kpi-label" style={{ fontSize: '0.62rem' }}>Proficiência Média LP</span>
                        <span className="pres-kpi-val" style={{ fontSize: '1.3rem' }}>{sorocabaStats.avgLp?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pres-card pres-card-highlight">
                  <h3 style={{ fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px', marginBottom: '12px' }}>
                    🏆 Líderes de IDEB em Sorocaba (Top 3)
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {sorocabaTop3.map((s, idx) => (
                      <div 
                        key={s.inep_id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          padding: '10px 14px', 
                          background: 'rgba(255,255,255,0.02)', 
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ 
                            width: '24px', 
                            height: '24px', 
                            borderRadius: '6px', 
                            background: idx === 0 ? 'var(--accent)' : 'rgba(255,255,255,0.08)', 
                            display: 'grid', 
                            placeItems: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            color: '#fff'
                          }}>
                            {idx + 1}
                          </span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }} title={s.nome_escola}>
                            {s.nome_escola.replace('E.M. ', '').replace('EM ', '')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className="ideb-badge high" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>{s.ideb?.toFixed(1)}</span>
                          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Infra: {s.infra_score?.toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '14px', lineHeight: 1.4 }}>
                    💡 A rede municipal de Sorocaba é robusta, de alta complexidade demográfica e industrial, dispondo de escolas de alto desempenho físico e IDEB de excelência isolado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 9: PANORAMA VOTORANTIM */}
        {currentSlide === 8 && (
          <div className={`pres-slide slide-dir-${direction}`} key="votorantim-panorama">
            <div className="slide-header">
              <span className="slide-num">Slide 09 / {TOTAL_SLIDES}</span>
              <h2 className="slide-title">Mergulho na Rede de Votorantim (SP)</h2>
            </div>
            <div className="slide-body">
              <div className="pres-grid-2">
                <div>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
                    Estatísticas consolidadas dinamicamente a partir das <strong>{votorantimStats.n} escolas</strong> da rede municipal de Votorantim gravadas no banco:
                  </p>

                  <div className="pres-kpi-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="pres-kpi-card" style={{ padding: '14px' }}>
                      <span className="pres-kpi-icon" style={{ fontSize: '1.4rem', width: '38px', height: '38px' }}>🏫</span>
                      <div className="pres-kpi-body">
                        <span className="pres-kpi-label" style={{ fontSize: '0.62rem' }}>Total de Escolas</span>
                        <span className="pres-kpi-val" style={{ fontSize: '1.3rem' }}>{votorantimStats.n}</span>
                      </div>
                    </div>

                    <div className="pres-kpi-card" style={{ padding: '14px' }}>
                      <span className="pres-kpi-icon" style={{ fontSize: '1.4rem', width: '38px', height: '38px', color: '#6ee7b7' }}>📊</span>
                      <div className="pres-kpi-body">
                        <span className="pres-kpi-label" style={{ fontSize: '0.62rem' }}>IDEB Médio da Rede</span>
                        <span className="pres-kpi-val" style={{ fontSize: '1.3rem', color: '#6ee7b7' }}>{votorantimStats.avgIdeb?.toFixed(2) || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="pres-kpi-card" style={{ padding: '14px' }}>
                      <span className="pres-kpi-icon" style={{ fontSize: '1.4rem', width: '38px', height: '38px', color: '#818cf8' }}>⚡</span>
                      <div className="pres-kpi-body">
                        <span className="pres-kpi-label" style={{ fontSize: '0.62rem' }}>Infraestrutura Média</span>
                        <span className="pres-kpi-val" style={{ fontSize: '1.3rem' }}>{votorantimStats.avgInfra?.toFixed(1) || 'N/A'}%</span>
                      </div>
                    </div>

                    <div className="pres-kpi-card" style={{ padding: '14px' }}>
                      <span className="pres-kpi-icon" style={{ fontSize: '1.4rem', width: '38px', height: '38px', color: '#fbbf24' }}>📝</span>
                      <div className="pres-kpi-body">
                        <span className="pres-kpi-label" style={{ fontSize: '0.62rem' }}>Proficiência Média LP</span>
                        <span className="pres-kpi-val" style={{ fontSize: '1.3rem' }}>{votorantimStats.avgLp?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pres-card pres-card-highlight-purple">
                  <h3 style={{ fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px', marginBottom: '12px' }}>
                    🏆 Líderes de IDEB em Votorantim (Top 3)
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {votorantimTop3.map((s, idx) => (
                      <div 
                        key={s.inep_id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          padding: '10px 14px', 
                          background: 'rgba(255,255,255,0.02)', 
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ 
                            width: '24px', 
                            height: '24px', 
                            borderRadius: '6px', 
                            background: idx === 0 ? 'var(--accent-2)' : 'rgba(255,255,255,0.08)', 
                            display: 'grid', 
                            placeItems: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            color: '#fff'
                          }}>
                            {idx + 1}
                          </span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }} title={s.nome_escola}>
                            {s.nome_escola.replace('EMEIEF ', '').replace('EMEIF ', '')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className="ideb-badge high" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>{s.ideb?.toFixed(1)}</span>
                          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Infra: {s.infra_score?.toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '14px', lineHeight: 1.4 }}>
                    💡 Votorantim opera uma rede enxuta e centralizada, alcançando médias homogêneas de alto padrão de infraestrutura física e resultados sólidos a menor custo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 10: CONFRONTO DE REDES */}
        {currentSlide === 9 && (
          <div className={`pres-slide slide-dir-${direction}`} key="confronto-redes">
            <div className="slide-header">
              <span className="slide-num">Slide 10 / {TOTAL_SLIDES}</span>
              <h2 className="slide-title">Confronto de Redes Locais: Sorocaba vs. Votorantim</h2>
            </div>
            <div className="slide-body">
              <div className="pres-grid-2">
                <div className="pres-card pres-card-highlight">
                  <h3>🏙️ Rede Municipal de Sorocaba (SP)</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>IDEB Médio da Rede:</span>
                      <strong style={{ color: 'var(--accent)' }}>{sorocabaStats.avgIdeb?.toFixed(2) || 'N/A'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Infra Score Médio:</span>
                      <strong>{sorocabaStats.avgInfra?.toFixed(1) || 'N/A'}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Proficiência Média LP / MT:</span>
                      <strong>{sorocabaStats.avgLp?.toFixed(1)} / {sorocabaStats.avgMt?.toFixed(1)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Volume de Escolas / Alunos:</span>
                      <strong>{sorocabaStats.n} unidades (~48 mil)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Custo Anual Estimado:</span>
                      <strong>R$ 8.100 por aluno</strong>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: '14px', lineHeight: '1.45' }}>
                    Sorocaba gerencia uma rede massiva e descentralizada com alta variação demográfica. Possui polos de excelência extrema pontuais, mas sofre para manter a homogeneidade nas periferias.
                  </p>
                </div>

                <div className="pres-card pres-card-highlight-purple">
                  <h3>🏘️ Rede Municipal de Votorantim (SP)</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>IDEB Médio da Rede:</span>
                      <strong style={{ color: 'var(--accent-2)' }}>{votorantimStats.avgIdeb?.toFixed(2) || 'N/A'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Infra Score Médio:</span>
                      <strong>{votorantimStats.avgInfra?.toFixed(1) || 'N/A'}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Proficiência Média LP / MT:</span>
                      <strong>{votorantimStats.avgLp?.toFixed(1)} / {votorantimStats.avgMt?.toFixed(1)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Volume de Escolas / Alunos:</span>
                      <strong>{votorantimStats.n} unidades (~9.2 mil)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Custo Anual Estimado:</span>
                      <strong>R$ 7.700 por aluno</strong>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: '14px', lineHeight: '1.45' }}>
                    Votorantim opera uma rede enxuta e centralizada. Embora seu investimento por aluno seja ligeiramente inferior, a proximidade da gestão e supervisão escolar garante resultados uniformes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 11: BENCHMARK TOPO NACIONAL */}
        {currentSlide === 10 && (
          <div className={`pres-slide slide-dir-${direction}`} key="bench-topo">
            <div className="slide-header">
              <span className="slide-num">Slide 11 / {TOTAL_SLIDES}</span>
              <h2 className="slide-title">O Topo Nacional: Benchmarks de Sobral (CE)</h2>
            </div>
            <div className="slide-body">
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
                Estatísticas de escolas líderes da rede pública nacional (Sobral) registradas em nossa base:
              </p>

              <div className="pres-table-wrapper">
                <table className="pres-table">
                  <thead>
                    <tr>
                      <th>Escola / Município</th>
                      <th style={{ textAlign: 'center' }}>IDEB 2023</th>
                      <th style={{ textAlign: 'center' }}>Fluxo (Aprovação)</th>
                      <th style={{ textAlign: 'center' }}>Aprendizado SAEB</th>
                      <th style={{ textAlign: 'center' }}>Infra Score (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: 'rgba(177, 76, 255, 0.06)' }}>
                      <td style={{ fontWeight: 700 }}>🏆 E.M. Leonília Gomes Parente (Sobral - CE)</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--accent)' }}>10.0</td>
                      <td style={{ textAlign: 'center' }}>1.00 (100%)</td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>10.00</td>
                      <td style={{ textAlign: 'center' }}>58.3%</td>
                    </tr>
                    <tr style={{ background: 'rgba(177, 76, 255, 0.03)' }}>
                      <td style={{ fontWeight: 700 }}>🏆 E.M. Raimundo Santana (Sobral - CE)</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--accent)' }}>10.0</td>
                      <td style={{ textAlign: 'center' }}>1.00 (100%)</td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>10.00</td>
                      <td style={{ textAlign: 'center' }}>66.7%</td>
                    </tr>
                    <tr>
                      <td>🏫 E.M. José da Mata e Silva (Sobral - CE)</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--accent-2)' }}>9.8</td>
                      <td style={{ textAlign: 'center' }}>1.00 (100%)</td>
                      <td style={{ textAlign: 'center' }}>9.78</td>
                      <td style={{ textAlign: 'center' }}>58.3%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '20px', padding: '12px 16px', background: 'rgba(255, 107, 44, 0.04)', borderRadius: '12px', border: '1px solid rgba(255, 107, 44, 0.12)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
                💡 <strong>Observação Pedagógica:</strong> Repare que o fluxo dessas escolas é perfeito (<strong>1.00</strong>) e a nota do SAEB é virtualmente perfeita (<strong>10.00</strong>). No entanto, o score infraestrutural atesta uma infraestrutura extremamente básica, demonstrando que as salas de aula e recursos físicos de alto custo não são os fatores determinantes do aprendizado no Ceará.
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 12: DESTAQUES REGIONAIS */}
        {currentSlide === 11 && (
          <div className={`pres-slide slide-dir-${direction}`} key="bench-regionais">
            <div className="slide-header">
              <span className="slide-num">Slide 12 / {TOTAL_SLIDES}</span>
              <h2 className="slide-title">Os Líderes Regionais: Destaques de Sorocaba e Votorantim</h2>
            </div>
            <div className="slide-body">
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
                Escolas municipais com melhor desempenho absoluto de IDEB na região metropolitana estudada:
              </p>

              <div className="pres-table-wrapper">
                <table className="pres-table">
                  <thead>
                    <tr>
                      <th>Escola / Município</th>
                      <th style={{ textAlign: 'center' }}>IDEB 2023</th>
                      <th style={{ textAlign: 'center' }}>Fluxo (Aprovação)</th>
                      <th style={{ textAlign: 'center' }}>Aprendizado SAEB</th>
                      <th style={{ textAlign: 'center' }}>Infra Score (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: 'rgba(255, 107, 44, 0.05)' }}>
                      <td style={{ fontWeight: 700 }}>🏙️ E.M. Enéas Proença de Arruda (Sorocaba - SP)</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--accent)' }}>7.3</td>
                      <td style={{ textAlign: 'center' }}>1.00 (100%)</td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>7.28</td>
                      <td style={{ textAlign: 'center' }}>75.0%</td>
                    </tr>
                    <tr style={{ background: 'rgba(255, 107, 44, 0.02)' }}>
                      <td style={{ fontWeight: 700 }}>🏙️ E.M. Waldemar de Freitas Rosa (Sorocaba - SP)</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--accent)' }}>7.2</td>
                      <td style={{ textAlign: 'center' }}>1.00 (100%)</td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>7.16</td>
                      <td style={{ textAlign: 'center' }}>83.3%</td>
                    </tr>
                    <tr style={{ background: 'rgba(177, 76, 255, 0.04)' }}>
                      <td style={{ fontWeight: 700 }}>🏘️ EMEIEF Lucinda R. P. Ignácio (Votorantim - SP)</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--accent-2)' }}>7.1</td>
                      <td style={{ textAlign: 'center' }}>1.00 (100%)</td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>7.08</td>
                      <td style={{ textAlign: 'center' }}>75.0%</td>
                    </tr>
                    <tr style={{ background: 'rgba(177, 76, 255, 0.01)' }}>
                      <td style={{ fontWeight: 700 }}>🏘️ EMEIEF Betty de Souza Oliveira (Votorantim - SP)</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--accent-2)' }}>7.0</td>
                      <td style={{ textAlign: 'center' }}>1.00 (100%)</td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>7.05</td>
                      <td style={{ textAlign: 'center' }}>66.7%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '16px', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                📝 Nossos destaques locais também possuem <strong>fluxo perfeito (1.00)</strong>, mas sua nota do SAEB atinge o teto na faixa de <strong>7.0 a 7.3</strong>, demonstrando que mesmo nossas melhores unidades estão longe da proficiência nacional.
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 13: GAP ANALYSIS */}
        {currentSlide === 12 && (
          <div className={`pres-slide slide-dir-${direction}`} key="gap-analysis">
            <div className="slide-header">
              <span className="slide-num">Slide 13 / {TOTAL_SLIDES}</span>
              <h2 className="slide-title">Gap Analysis: O Abismo da Proficiência Real</h2>
            </div>
            <div className="slide-body">
              <div className="pres-grid-2">
                <div className="pres-card pres-card-highlight">
                  <h3>📊 Onde o IDEB nos separa?</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Variável Escolar:</span>
                      <span><strong>Nossa Média</strong> vs <strong>Benchmark Sobral</strong></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                      <span>Fluxo (Aprovação):</span>
                      <span><strong>1.00 (100%)</strong> vs <strong>1.00 (100%)</strong></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                      <span>Score de Infraestrutura:</span>
                      <span><strong style={{ color: '#6ee7b7' }}>{ourStats.avgInfra?.toFixed(1)}%</strong> vs <strong>58.3%</strong></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                      <span>Aprendizado SAEB:</span>
                      <span><strong>{ourStats.avgLp?.toFixed(1) || 'N/A'}</strong> vs <strong style={{ color: 'var(--accent)' }}>10.00</strong></span>
                    </div>
                  </div>
                </div>

                <div className="pres-list">
                  <div className="pres-card" style={{ borderLeft: '4px solid var(--accent)', background: 'rgba(255, 107, 44, 0.05)' }}>
                    <h4 style={{ color: '#fff', fontWeight: 800 }}>🔎 A Revelação Analítica do Gap:</h4>
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', marginTop: '8px', lineHeight: '1.5' }}>
                      Ambas as redes locais (Sorocaba e Votorantim) entregam **Fluxo Perfeito de 1.0 (100% de aprovação de alunos)** em suas escolas de ponta. O gap de quase <strong>2.8 pontos no IDEB</strong> em relação ao topo do país é <strong>exclusivamente de proficiência SAEB (leitura e matemática básica)</strong>.
                      <br /><br />
                      A infraestrutura física local supera Sobral em até 20 pontos percentuais, provando com rigor matemático que <strong>o limitador educacional é pedagógico, não material.</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 14: RECOMENDAÇÕES */}
        {currentSlide === 13 && (
          <div className={`pres-slide slide-dir-${direction}`} key="recomendacoes">
            <div className="slide-header">
              <span className="slide-num">Slide 14 / {TOTAL_SLIDES}</span>
              <h2 className="slide-title">Recomendações e Plano de Ação Baseado em Dados</h2>
            </div>
            <div className="slide-body">
              <div className="pres-grid-2">
                <div className="pres-list">
                  <div className="pres-list-item">
                    <span className="pres-list-icon" style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16A34A' }}>1</span>
                    <div className="pres-list-body">
                      <h4>Foco Radical na Proficiência Básica (3º e 4º anos)</h4>
                      <p>Priorizar o aprendizado de alfabetização e matemática nas séries iniciais para blindar os alunos com conhecimento forte antes do repasse à Rede Estadual nos anos finais.</p>
                    </div>
                  </div>

                  <div className="pres-list-item">
                    <span className="pres-list-icon" style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16A34A' }}>2</span>
                    <div className="pres-list-body">
                      <h4>Gestão Pedagógica Baseada em Avaliações Bimestrais</h4>
                      <p>Criar exames de diagnóstico locais recorrentes gerados pela Secretaria de Educação, medindo o volume real de palavras lidas e equações de matemática básica resolvidas.</p>
                    </div>
                  </div>

                  <div className="pres-list-item">
                    <span className="pres-list-icon" style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16A34A' }}>3</span>
                    <div className="pres-list-body">
                      <h4>Equidade de Alocação Pedagógica</h4>
                      <p>Utilizar a inteligência de dados deste observatório para direcionar equipes de tutoria, psicopedagogia e coordenadores adicionais às escolas com queda de qualidade constatada.</p>
                    </div>
                  </div>
                </div>

                <div className="pres-card pres-card-highlight">
                  <h3>🎯 Conclusão Estratégica do Negócio</h3>
                  <p style={{ marginTop: '10px', fontSize: '0.88rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.75)' }}>
                    Nossos dados provam com rigor estatístico: **a queda de qualidade nas escolas regionais não é causada por falta de cimento, tijolo ou prédios luxuosos**.
                    <br /><br />
                    O ponto fraco e limitador reside estritamente na **gestão pedagógica ativa do tempo de aula**.
                    Focar o orçamento e blindar o aprendizado na base (3º e 4º anos) é a melhor e mais barata política pública para reverter o passivo educacional regional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 15: ENGENHARIA DE DADOS */}
        {currentSlide === 14 && (
          <div className={`pres-slide slide-dir-${direction}`} key="metodologia">
            <div className="slide-header">
              <span className="slide-num">Slide 15 / {TOTAL_SLIDES}</span>
              <h2 className="slide-title">A Engenharia de Dados: Por Trás do Observatório</h2>
            </div>
            <div className="slide-body">
              <div className="metod-grid">
                <div className="metod-card">
                  <span className="metod-step">Etapa 1</span>
                  <h4>Integração de Dados</h4>
                  <p>Unificação automatizada pelo ID do INEP das bases massivas de desempenho nacional (SAEB/IDEB) e do Censo Escolar.</p>
                </div>
                <div className="metod-card">
                  <span className="metod-step">Etapa 2</span>
                  <h4>Cálculo de Índices</h4>
                  <p>Estruturação e normalização dos dados das 1.357 escolas para extração e formulação da nossa métrica de <code>infra_score</code>.</p>
                </div>
                <div className="metod-card">
                  <span className="metod-step">Etapa 3</span>
                  <h4>Indexação MongoDB</h4>
                  <p>Configuração de índices de alto rendimento por município e dependência administrativa para carregamento ultrarrápido dos dashboards.</p>
                </div>
                <div className="metod-card">
                  <span className="metod-step">Etapa 4</span>
                  <h4>Servidor SSR</h4>
                  <p>Next.js 14 realizando a conexão ao banco direto no servidor, repassando o estado inicial rápido para plotagens seguras em React.</p>
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>🛠️ Ecossistema Tecnológico Utilizado:</span>
                <div className="tech-badges" style={{ marginTop: 0 }}>
                  <span className="tech-badge">MongoDB 7</span>
                  <span className="tech-badge">Next.js 14 (App Router)</span>
                  <span className="tech-badge">TypeScript & React 18</span>
                  <span className="tech-badge">Chart.js (react-chartjs-2)</span>
                  <span className="tech-badge">Docker Compose</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 16: ENCERRAMENTO */}
        {currentSlide === 15 && (
          <div className={`pres-slide slide-dir-${direction}`} key="encerramento">
            <div className="slide-end">
              <span className="slide-end-icon">💡</span>
              <h2>A Educação Começa na Base!</h2>
              <p>
                A inteligência analítica orientada a dados públicos é o único norte seguro para transformar a aprendizagem infantil e garantir eficiência ao orçamento das prefeituras.
              </p>

              <div style={{ marginTop: '12px' }}>
                <Link href="/" className="slide-end-btn">
                  Explorar o Dashboard Interativo Completo ➔
                </Link>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.35)', marginTop: '24px' }}>
                Observatório Educacional — Ciência de Dados para Negócios · Censo Escolar INEP 2023
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ FOOTER CONTROLS ══ */}
      <footer className="pres-footer">
        <div className="pres-nav">
          <div className="pres-progress-container">
            <span className="pres-slide-indicator">
              Slide {String(currentSlide + 1).padStart(2, '0')} / {String(TOTAL_SLIDES).padStart(2, '0')}
            </span>
            <div className="pres-progress-bar">
              <div 
                className="pres-progress-fill" 
                style={{ width: `${((currentSlide + 1) / TOTAL_SLIDES) * 100}%` }}
              />
            </div>
          </div>

          {/* Interactive Slide dots/click progress */}
          <div className="pres-slide-dots">
            {Array.from({ length: TOTAL_SLIDES }).map((_, index) => (
              <button 
                key={index} 
                className={`pres-slide-dot ${currentSlide === index ? 'active' : ''}`}
                onClick={() => jumpToSlide(index)}
                title={`Ir para o Slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="pres-nav-buttons">
            <button 
              className="pres-btn-nav" 
              onClick={goToPrevSlide}
              disabled={currentSlide === 0}
              title="Slide Anterior (Seta Esquerda)"
            >
              ◀
            </button>
            <button 
              className="pres-btn-nav" 
              onClick={goToNextSlide}
              disabled={currentSlide === TOTAL_SLIDES - 1}
              title="Próximo Slide (Seta Direita / Espaço)"
            >
              ▶
            </button>
          </div>
        </div>
        <div className="pres-keyboard-hint">
          ⌨️ Use as setas <strong>Esquerda (◀)</strong> e <strong>Direita (▶)</strong> do teclado ou a barra de <strong>Espaço</strong> para navegar.
        </div>
      </footer>
    </div>
  );
}
