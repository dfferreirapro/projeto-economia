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

  // Total de slides (11 slides após reordenação lógica e remoção de redundâncias)
  const TOTAL_SLIDES = 11;

  // Teclado para passar slides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        setCurrentSlide(prev => Math.min(prev + 1, TOTAL_SLIDES - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlide(prev => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
  const { ourStats, cityAgg, bestSchool } = useMemo(() => {
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

    return { ourStats: stats, cityAgg: agg, bestSchool: best };
  }, [initialData]);

  const { sorocaba, votorantim } = useMemo(() => {
    const s = cityAgg.find(c => c.city === 'Sorocaba');
    const v = cityAgg.find(c => c.city === 'Votorantim');
    return { sorocaba: s, votorantim: v };
  }, [cityAgg]);

  return (
    <div className="pres-container">
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
          <span className="pres-logo-tag">Apresentação Principal</span>
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
          <div className="pres-slide" key="cover">
            <div className="slide-cover-split">
              {/* Coluna Esquerda */}
              <div className="slide-cover-left">
                <span className="slide-cover-badge">📊 Inteligência de Dados Públicos</span>
                <h1>Onde Está a Diferença?</h1>
                <p className="subtitle">
                  Desmistificando os limitadores do IDEB: Uma análise comparativa e orientada a dados sobre infraestrutura, fluxo e proficiência pedagógica nas redes municipais de Sorocaba e Votorantim.
                </p>
                
                <button className="slide-cover-btn" onClick={() => setCurrentSlide(1)}>
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
          <div className="pres-slide" key="justificativa">
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

        {/* SLIDE 3: O PARADOXO */}
        {currentSlide === 2 && (
          <div className="pres-slide" key="paradoxo">
            <div className="slide-header">
              <span className="slide-num">Slide 03 / {TOTAL_SLIDES}</span>
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
                      <h5>O Benchmark Sobral (CE) — O Outlier Nacional</h5>
                      <p><strong>Sobral lidera o ranking do IDEB nacional (média de rede 9.2) com infraestrutura simples (58%).</strong> O foco absoluto de Sobral é na formação docente e na gestão de sala de aula, superando orçamentos bilionários.</p>
                    </div>
                  </div>

                  <div className="desc-bullet">
                    <span className="desc-bullet-dot green" />
                    <div className="desc-bullet-body">
                      <h5>São Caetano do Sul (SP)</h5>
                      <p>IDEB excelente (7.4) suportado por infraestrutura máxima (98%). Modelo de alto custo financeiro e baixíssima replicabilidade para a nossa realidade regional.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: RECORTE ESTRATÉGICO */}
        {currentSlide === 3 && (
          <div className="pres-slide" key="recorte">
            <div className="slide-header">
              <span className="slide-num">Slide 04 / {TOTAL_SLIDES}</span>
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

        {/* SLIDE 5: DICIONÁRIO DE MÉTRICAS */}
        {currentSlide === 4 && (
          <div className="pres-slide" key="metricas">
            <div className="slide-header">
              <span className="slide-num">Slide 05 / {TOTAL_SLIDES}</span>
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
                      <code style={{ fontSize: '0.9rem', color: 'var(--accent)' }}>IDEB = N × P</code>
                    </h3>
                    <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>
                      Métrica unificada nacional. Ele é o produto de duas dimensões: a nota média de aprendizado nos exames padronizados (<strong>N</strong>) e a taxa de fluxo/aprovação escolar (<strong>P</strong>). Varia de 0 a 10.
                    </p>
                  </div>

                  <div className="pres-card">
                    <h3>🔄 Fluxo Escolar (Aprovação - P)</h3>
                    <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>
                      Mede a retenção e progressão dos alunos. Um fluxo de <strong>1.0 (ou 100%)</strong> significa que todos os alunos avançaram de ano sem repetência ou abandono ao longo do ano avaliado.
                    </p>
                  </div>
                </div>

                <div className="pres-list" style={{ gap: '12px' }}>
                  <div className="pres-card pres-card-highlight-purple">
                    <h3>📝 SAEB (Exame de Proficiência - N)</h3>
                    <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>
                      Avaliação nacional aplicada pelo INEP. Testa os alunos do 5º ano em **Língua Portuguesa (leitura/interpretação)** e **Matemática (cálculo/geometria)**, padronizada em uma nota de 0 a 10.
                    </p>
                  </div>

                  <div className="pres-card">
                    <h3>⚡ Score de Infraestrutura (infra_score)</h3>
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

        {/* SLIDE 6: PANORAMA REGIONAL */}
        {currentSlide === 5 && (
          <div className="pres-slide" key="indicadores">
            <div className="slide-header">
              <span className="slide-num">Slide 06 / {TOTAL_SLIDES}</span>
              <h2 className="slide-title">Indicadores da Nossa Região (Dados Consolidados)</h2>
            </div>
            <div className="slide-body">
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
                Estatísticas dinâmicas agregadas a partir das escolas das redes municipais de <strong>Sorocaba</strong> e <strong>Votorantim</strong> gravadas em nosso banco:
              </p>

              <div className="pres-kpi-grid">
                <div className="pres-kpi-card">
                  <span className="pres-kpi-icon" style={{ color: '#FF6B2C' }}>🏫</span>
                  <div className="pres-kpi-body">
                    <span className="pres-kpi-label">Volume de Escolas</span>
                    <span className="pres-kpi-val">{ourStats.n}</span>
                    <span className="pres-kpi-sub">Rede Municipal Estudada</span>
                  </div>
                </div>

                <div className="pres-kpi-card">
                  <span className="pres-kpi-icon" style={{ color: '#6ee7b7' }}>📊</span>
                  <div className="pres-kpi-body">
                    <span className="pres-kpi-label">IDEB Médio Regional</span>
                    <span className="pres-kpi-val">{ourStats.avgIdeb?.toFixed(2) || 'N/A'}</span>
                    <span className="pres-kpi-sub">Média Sorocaba + Votorantim</span>
                  </div>
                </div>

                <div className="pres-kpi-card">
                  <span className="pres-kpi-icon" style={{ color: '#818cf8' }}>⚡</span>
                  <div className="pres-kpi-body">
                    <span className="pres-kpi-label">Score de Infraestrutura</span>
                    <span className="pres-kpi-val">{ourStats.avgInfra?.toFixed(1) || 'N/A'}%</span>
                    <span className="pres-kpi-sub">Média de recursos físicos ativos</span>
                  </div>
                </div>

                <div className="pres-kpi-card">
                  <span className="pres-kpi-icon" style={{ color: '#fbbf24' }}>📝</span>
                  <div className="pres-kpi-body">
                    <span className="pres-kpi-label">Proficiência Média LP</span>
                    <span className="pres-kpi-val">{ourStats.avgLp?.toFixed(1) || 'N/A'}</span>
                    <span className="pres-kpi-sub">Nota SAEB Língua Portuguesa</span>
                  </div>
                </div>

                <div className="pres-kpi-card">
                  <span className="pres-kpi-icon" style={{ color: '#EC4899' }}>🔢</span>
                  <div className="pres-kpi-body">
                    <span className="pres-kpi-label">Proficiência Média MT</span>
                    <span className="pres-kpi-val">{ourStats.avgMt?.toFixed(1) || 'N/A'}</span>
                    <span className="pres-kpi-sub">Nota SAEB Matemática</span>
                  </div>
                </div>

                <div className="pres-kpi-card" style={{ borderLeft: '4px solid var(--accent)' }}>
                  <span className="pres-kpi-icon" style={{ color: '#10B981' }}>🏆</span>
                  <div className="pres-kpi-body">
                    <span className="pres-kpi-label">Líder de IDEB da Região</span>
                    <span className="pres-kpi-val" style={{ fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }} title={bestSchool?.nome_escola || 'N/A'}>
                      {bestSchool ? bestSchool.nome_escola : 'N/A'}
                    </span>
                    <span className="pres-kpi-sub" style={{ fontWeight: 800, color: 'var(--accent)' }}>IDEB Recorde: {bestSchool?.ideb || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '12px 16px', background: 'rgba(255, 107, 44, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 107, 44, 0.15)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
                💡 <strong>Análise Rápida da Região:</strong> Nossa infraestrutura física é excelente (<strong>{ourStats.avgInfra?.toFixed(1)}%</strong>) e as taxas de fluxo escolar são próximas a perfeitas (<strong>{(ourStats.avgFluxo ? ourStats.avgFluxo * 100 : 0).toFixed(0)}%</strong> de aprovação). No entanto, o IDEB médio de <strong>{ourStats.avgIdeb?.toFixed(2)}</strong> está longe da proficiência perfeita do país. Onde está a quebra?
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 7: O ABISMO DA EXCELÊNCIA */}
        {currentSlide === 6 && (
          <div className="pres-slide" key="excelencia">
            <div className="slide-header">
              <span className="slide-num">Slide 07 / {TOTAL_SLIDES}</span>
              <h2 className="slide-title">O Abismo da Excelência: Gap Analysis Real</h2>
            </div>
            <div className="slide-body">
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
                Análise de gap absoluto cruzando as melhores escolas de Sorocaba e Votorantim contra os líderes históricos nacionais:
              </p>

              <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: '14px 16px', color: '#fff', fontWeight: 700 }}>Município / Escola</th>
                      <th style={{ padding: '14px 16px', color: 'var(--accent)', fontWeight: 700, textAlign: 'center' }}>IDEB 2023</th>
                      <th style={{ padding: '14px 16px', color: '#fff', fontWeight: 700, textAlign: 'center' }}>Fluxo (Aprovação)</th>
                      <th style={{ padding: '14px 16px', color: '#fff', fontWeight: 700, textAlign: 'center' }}>Aprendizado SAEB</th>
                      <th style={{ padding: '14px 16px', color: '#fff', fontWeight: 700, textAlign: 'center' }}>Infra Score (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(177, 76, 255, 0.05)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700 }}>🏆 Sobral (CE) — E.M. Leonília Gomes Parente</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 800, color: 'var(--accent-2)' }}>10.0</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>1.0 (100%)</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700 }}>10.00</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>58.3%</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(177, 76, 255, 0.03)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700 }}>🏆 Sobral (CE) — E.M. Raimundo Santana</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 800, color: 'var(--accent-2)' }}>10.0</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>1.0 (100%)</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700 }}>10.00</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>66.7%</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 16px' }}>🏙️ Sorocaba (SP) — E.M. Enéas Proença de Arruda</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: 'var(--accent)' }}>7.3</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>1.0 (100%)</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700 }}>7.28</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>75.0%</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 16px' }}>🏙️ Sorocaba (SP) — E.M. Waldemar de Freitas Rosa</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: 'var(--accent)' }}>7.2</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>1.0 (100%)</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700 }}>7.16</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>83.3%</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 16px' }}>🏘️ Votorantim (SP) — EMEIEF Lucinda R. P. Ignácio</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#fbbf24' }}>7.1</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>1.0 (100%)</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700 }}>7.08</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>75.0%</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 16px' }}>🏘️ Votorantim (SP) — EMEIEF Betty de Souza Oliveira</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#fbbf24' }}>7.0</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>1.0 (100%)</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700 }}>7.05</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>66.7%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="pres-card pres-card-highlight" style={{ marginTop: '16px', padding: '14px 20px' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>🔎 A Revelação Analítica do Gap:</h4>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px', lineHeight: '1.5' }}>
                  Ambas as redes locais (Sorocaba e Votorantim) entregam **Fluxo Perfeito de 1.0 (100% de aprovação de alunos)** em suas escolas de ponta. O gap de quase <strong>2.8 pontos no IDEB</strong> em relação ao topo do país é <strong>exclusivamente de proficiência SAEB (leitura e matemática básica)</strong>. A infraestrutura física local supera Sobral em até 20 pontos percentuais, provando que o limitador educacional é pedagógico, não material.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 8: ANÁLISE LOCAL */}
        {currentSlide === 7 && (
          <div className="pres-slide" key="local">
            <div className="slide-header">
              <span className="slide-num">Slide 08 / {TOTAL_SLIDES}</span>
              <h2 className="slide-title">Análise Local: Sorocaba × Votorantim</h2>
            </div>
            <div className="slide-body">
              <div className="pres-grid-2">
                <div className="pres-card pres-card-highlight">
                  <h3>🏙️ Rede Municipal de Sorocaba (SP)</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>IDEB Médio da Rede:</span>
                      <strong style={{ color: 'var(--accent)' }}>{sorocaba?.avgIdeb?.toFixed(2) || 'N/A'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Infra Score Médio:</span>
                      <strong>{sorocaba?.avgInfra?.toFixed(1) || 'N/A'}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Volume de Escolas:</span>
                      <strong>{sorocaba?.n || 'N/A'} unidades</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Custo Anual Estimado:</span>
                      <strong>R$ 8.100 por aluno</strong>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: '14px', lineHeight: '1.45' }}>
                    Sorocaba administra uma malha escolar densa e complexa (polo industrial regional). Embora possua unidades de alta performance pontual e orçamento robusto, a média geral da rede reflete a complexidade do tamanho populacional e das disparidades periféricas da cidade.
                  </p>
                </div>

                <div className="pres-card pres-card-highlight-purple">
                  <h3>🏘️ Rede Municipal de Votorantim (SP)</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>IDEB Médio da Rede:</span>
                      <strong style={{ color: 'var(--accent-2)' }}>{votorantim?.avgIdeb?.toFixed(2) || 'N/A'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Infra Score Médio:</span>
                      <strong>{votorantim?.avgInfra?.toFixed(1) || 'N/A'}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Volume de Escolas:</span>
                      <strong>{votorantim?.n || 'N/A'} unidades</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Custo Anual Estimado:</span>
                      <strong>R$ 7.700 por aluno</strong>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: '14px', lineHeight: '1.45' }}>
                    Votorantim opera uma rede enxuta e compacta, o que possibilita acompanhamento pedagógico centralizado. A cidade adota parcerias e forte engajamento, conseguindo manter médias homogêneas de alto padrão mesmo dispondo de menor custo por aluno que a vizinha Sorocaba.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 9: RECOMENDAÇÕES */}
        {currentSlide === 8 && (
          <div className="pres-slide" key="recomendacoes">
            <div className="slide-header">
              <span className="slide-num">Slide 09 / {TOTAL_SLIDES}</span>
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

        {/* SLIDE 10: ENGENHARIA DE DADOS */}
        {currentSlide === 9 && (
          <div className="pres-slide" key="metodologia">
            <div className="slide-header">
              <span className="slide-num">Slide 10 / {TOTAL_SLIDES}</span>
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

        {/* SLIDE 11: ENCERRAMENTO */}
        {currentSlide === 10 && (
          <div className="pres-slide" key="encerramento">
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

          <div className="pres-nav-buttons">
            <button 
              className="pres-btn-nav" 
              onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
              disabled={currentSlide === 0}
              title="Slide Anterior (Seta Esquerda)"
            >
              ◀
            </button>
            <button 
              className="pres-btn-nav" 
              onClick={() => setCurrentSlide(prev => Math.min(prev + 1, TOTAL_SLIDES - 1))}
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
