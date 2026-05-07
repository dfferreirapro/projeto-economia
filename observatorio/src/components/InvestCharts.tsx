'use client';

import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Tooltip, Legend,
} from 'chart.js';
import { Bar, Scatter } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

const PALETTE = [
  'rgba(110,231,183,.75)', 'rgba(129,140,248,.75)', 'rgba(251,191,36,.75)',
  'rgba(249,168,212,.75)', 'rgba(167,139,250,.75)', 'rgba(251,146,60,.75)',
  'rgba(94,234,212,.75)',  'rgba(253,186,116,.75)', 'rgba(196,181,253,.75)',
  'rgba(134,239,172,.75)', 'rgba(253,224,71,.75)',  'rgba(248,113,113,.75)',
];
const BORDER_PALETTE = PALETTE.map(c => c.replace('.75)', '1)'));

function gc(theme: string) { return theme === 'light' ? 'rgba(200,204,224,.6)' : 'rgba(35,41,68,.7)'; }
function tc(theme: string) { return theme === 'light' ? '#8890b0' : '#404868'; }

interface InvestItem { municipio: string; invest: number; avgIdeb: number; }

interface Props { investData: InvestItem[]; theme: string; }

export default function InvestCharts({ investData, theme }: Props) {
  if (!investData.length) return null;

  const effData = investData.map(m => ({ ...m, eff: +(m.avgIdeb / (m.invest / 1000)).toFixed(3) }));
  const sorted  = [...investData].sort((a, b) => b.invest - a.invest);
  const eSorted = [...effData].sort((a, b) => b.eff - a.eff);

  const base = { responsive: true, maintainAspectRatio: false } as const;

  return (
    <div className="charts-grid">
      {/* Scatter invest × IDEB */}
      <div className="chart-card">
        <div className="chart-header"><h3>IDEB × Investimento por Aluno</h3><span className="chart-badge">scatter</span></div>
        <div className="chart-wrap tall">
          <Scatter
            data={{
              datasets: [{
                label: 'Municípios',
                data: investData.map(m => ({ x: m.invest, y: +m.avgIdeb.toFixed(2), city: m.municipio })),
                backgroundColor: 'rgba(251,191,36,.7)', borderColor: '#fbbf24',
                borderWidth: 1, pointRadius: 7, pointHoverRadius: 10,
              }],
            }}
            options={{
              ...base,
              plugins: { legend: { display: false }, tooltip: { callbacks: { label: (item: any) => `${item.raw.city} — Invest: R$${item.raw.x.toLocaleString('pt-BR')} · IDEB: ${item.raw.y}` } } },
              scales: {
                x: { title: { display: true, text: 'Investimento por Aluno (R$)', color: tc(theme) }, grid: { color: gc(theme) }, ticks: { color: tc(theme), callback: (v: any) => 'R$' + (v / 1000).toFixed(0) + 'k' } },
                y: { title: { display: true, text: 'IDEB Médio', color: tc(theme) }, min: 4, max: 10, grid: { color: gc(theme) }, ticks: { color: tc(theme) } },
              },
            }}
          />
        </div>
      </div>

      {/* Bar invest */}
      <div className="chart-card">
        <div className="chart-header"><h3>Investimento por Aluno (R$/ano)</h3><span className="chart-badge">hbar</span></div>
        <div className="chart-wrap tall">
          <Bar
            data={{
              labels: sorted.map(m => m.municipio),
              datasets: [{ label: 'R$/aluno/ano', data: sorted.map(m => m.invest), backgroundColor: 'rgba(251,191,36,.65)', borderColor: '#fbbf24', borderWidth: 1, borderRadius: 5 }],
            }}
            options={{
              ...base, indexAxis: 'y' as const,
              plugins: { legend: { display: false }, tooltip: { callbacks: { label: (item: any) => `R$ ${item.raw.toLocaleString('pt-BR')}/aluno/ano` } } },
              scales: { x: { grid: { color: gc(theme) }, ticks: { color: tc(theme), callback: (v: any) => 'R$' + (v / 1000).toFixed(0) + 'k' } }, y: { grid: { display: false }, ticks: { color: tc(theme), font: { size: 10 } } } },
            }}
          />
        </div>
      </div>

      {/* Efficiency */}
      <div className="chart-card span-2">
        <div className="chart-header"><h3>Eficiência: IDEB por R$ mil Investidos</h3><span className="chart-badge">hbar</span></div>
        <div className="chart-wrap">
          <Bar
            data={{
              labels: eSorted.map(m => m.municipio),
              datasets: [{ label: 'IDEB / R$ mil', data: eSorted.map(m => m.eff), backgroundColor: eSorted.map((_, i) => PALETTE[i % PALETTE.length]), borderColor: eSorted.map((_, i) => BORDER_PALETTE[i % BORDER_PALETTE.length]), borderWidth: 1, borderRadius: 5 }],
            }}
            options={{
              ...base, indexAxis: 'y' as const,
              plugins: { legend: { display: false }, tooltip: { callbacks: { label: (item: any) => `${item.raw} IDEB por R$ mil` } } },
              scales: { x: { grid: { color: gc(theme) }, ticks: { color: tc(theme) } }, y: { grid: { display: false }, ticks: { color: tc(theme), font: { size: 10 } } } },
            }}
          />
        </div>
      </div>
    </div>
  );
}
