'use client';

import {
  Chart as ChartJS, RadialLinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function gc(theme: string) { return theme === 'light' ? 'rgba(200,204,224,.6)' : 'rgba(35,41,68,.7)'; }
function tc(theme: string) { return theme === 'light' ? '#8890b0' : '#404868'; }

const RADAR_NORM: Record<string, { mn: number; mx: number }> = {
  ideb:        { mn: 0,   mx: 10  },
  nota_lp:     { mn: 180, mx: 340 },
  nota_mt:     { mn: 180, mx: 340 },
  fluxo:       { mn: 70,  mx: 100 },
  aprendizado: { mn: 0,   mx: 10  },
};

function norm(val: number, key: string): number {
  const { mn, mx } = RADAR_NORM[key];
  return Math.min(100, Math.max(0, ((val - mn) / (mx - mn)) * 100));
}

const RADAR_LABELS = ['IDEB', 'SAEB LP', 'SAEB MT', '% Aprovação', 'Aprendizado'];
const RADAR_KEYS   = ['ideb', 'nota_lp', 'nota_mt', 'fluxo', 'aprendizado'];

interface CityGroup {
  city: string;
  n: number;
  ideb: number;
  nota_lp: number;
  nota_mt: number;
  fluxo: number;
  aprendizado: number;
  depDist: Record<string, number>;
  color: { bg: string; border: string; hex: string };
}

interface Props { groups: CityGroup[]; theme: string; }

export default function CompareCharts({ groups, theme }: Props) {
  return (
    <div className="compare-bottom">
      {/* Radar */}
      <div className="chart-card">
        <div className="chart-header"><h3>Radar de Desempenho (normalizado)</h3><span className="chart-badge">radar</span></div>
        <div className="chart-wrap tall">
          <Radar
            data={{
              labels: RADAR_LABELS,
              datasets: groups.map(g => ({
                label: g.city,
                data: RADAR_KEYS.map(k => norm(g[k as keyof CityGroup] as number, k)),
                backgroundColor: g.color.bg.replace('.7)', '.12)'),
                borderColor: g.color.border, borderWidth: 2,
                pointBackgroundColor: g.color.border, pointRadius: 4, pointHoverRadius: 6,
              })),
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12 } },
                tooltip: { callbacks: { label: (item: any) => {
                  const g = groups[item.datasetIndex];
                  const k = RADAR_KEYS[item.dataIndex];
                  const val = g[k as keyof CityGroup] as number;
                  return ` ${g.city}: ${k === 'fluxo' ? val.toFixed(1) + '%' : k === 'ideb' || k === 'aprendizado' ? val.toFixed(2) : val.toFixed(1)}`;
                }}},
              },
              scales: { r: {
                min: 0, max: 100,
                ticks: { display: false },
                grid: { color: gc(theme) },
                pointLabels: { color: tc(theme), font: { size: 11 } },
                angleLines: { color: gc(theme) },
              }},
            }}
          />
        </div>
      </div>

      {/* Dep table */}
      <div className="chart-card">
        <div className="chart-header"><h3>Distribuição por Dependência Administrativa</h3></div>
        <div className="infra-compare-table-wrap">
          <table className="infra-compare-table">
            <thead>
              <tr>
                <th>Dep. Adm.</th>
                {groups.map(g => <th key={g.city} style={{ color: g.color.hex }}>{g.city}</th>)}
              </tr>
            </thead>
            <tbody>
              {['Municipal', 'Estadual', 'Federal'].map(dep => (
                <tr key={dep}>
                  <td><span className={`dep-pill dep-${dep}`}>{dep}</span></td>
                  {groups.map(g => {
                    const count = g.depDist[dep] || 0;
                    const pct = g.n ? Math.round((count / g.n) * 100) : 0;
                    const maxPct = Math.max(...groups.map(gg => gg.n ? Math.round(((gg.depDist[dep] || 0) / gg.n) * 100) : 0));
                    const isLeader = pct === maxPct && maxPct > 0;
                    return (
                      <td key={g.city}>
                        <div className="infra-pct-cell">
                          <div className="infra-dot-bar"><div className="infra-dot-fill" style={{ width: `${pct}%`, background: g.color.hex }} /></div>
                          <span className={isLeader ? 'infra-cell-leader' : ''} style={isLeader ? { color: g.color.hex } : undefined}>{pct}%</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr style={{ borderTop: '1px solid var(--border2)' }}>
                <td style={{ fontWeight: 600, color: 'var(--text)' }}>Total</td>
                {groups.map(g => <td key={g.city} style={{ fontFamily: 'var(--font-mono)', color: g.color.hex, fontWeight: 600 }}>{g.n} escolas</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
