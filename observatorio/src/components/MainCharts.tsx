'use client';

import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Title, Tooltip, Legend,
  type ChartDataset,
} from 'chart.js';
import { Bar, Scatter } from 'react-chartjs-2';
import type { Escola } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const PALETTE = [
  'rgba(110,231,183,.75)', 'rgba(129,140,248,.75)', 'rgba(251,191,36,.75)',
  'rgba(249,168,212,.75)', 'rgba(167,139,250,.75)', 'rgba(251,146,60,.75)',
  'rgba(94,234,212,.75)',  'rgba(253,186,116,.75)', 'rgba(196,181,253,.75)',
  'rgba(134,239,172,.75)', 'rgba(253,224,71,.75)',  'rgba(248,113,113,.75)',
];
const BORDER_PALETTE = PALETTE.map(c => c.replace('.75)', '1)'));

const DEP_COLOR: Record<string, { bg: string; border: string }> = {
  Municipal: { bg: 'rgba(110,231,183,.7)', border: '#6ee7b7' },
  Estadual:  { bg: 'rgba(129,140,248,.7)', border: '#818cf8' },
  Federal:   { bg: 'rgba(251,191,36,.7)',  border: '#fbbf24' },
};

function gridColor(theme: string) { return theme === 'light' ? 'rgba(200,204,224,.6)' : 'rgba(35,41,68,.7)'; }
function tickColor(theme: string) { return theme === 'light' ? '#8890b0' : '#404868'; }
function trunc(s: string, n: number) { return s.length > n ? s.substring(0, n) + '…' : s; }

interface Props { filtered: Escola[]; theme: string; }

export default function MainCharts({ filtered, theme }: Props) {
  const gc = gridColor(theme);
  const tc = tickColor(theme);

  /* ── Top-40 IDEB bar ── */
  const top40 = [...filtered].filter(s => s.ideb != null).sort((a, b) => b.ideb! - a.ideb!).slice(0, 40);
  const avg40 = top40.length ? top40.reduce((s, x) => s + x.ideb!, 0) / top40.length : 0;

  /* ── IDEB by city ── */
  const cityMap: Record<string, number[]> = {};
  filtered.filter(s => s.ideb != null).forEach(s => { (cityMap[s.no_municipio] ??= []).push(s.ideb!); });
  const cityEntries = Object.entries(cityMap)
    .map(([city, vals]) => ({ city, avg: vals.reduce((a, b) => a + b, 0) / vals.length, count: vals.length }))
    .sort((a, b) => b.avg - a.avg).slice(0, 15);

  /* ── SAEB by city ── */
  const saebMap: Record<string, { lp: number[]; mt: number[] }> = {};
  filtered.filter(s => s.nota_lp != null).forEach(s => {
    saebMap[s.no_municipio] ??= { lp: [], mt: [] };
    saebMap[s.no_municipio].lp.push(s.nota_lp!);
    saebMap[s.no_municipio].mt.push(s.nota_mt ?? 0);
  });
  const saebEntries = Object.entries(saebMap).map(([city, v]) => ({
    city,
    lp: v.lp.reduce((a, b) => a + b, 0) / v.lp.length,
    mt: v.mt.reduce((a, b) => a + b, 0) / v.mt.length,
  })).sort((a, b) => b.lp - a.lp).slice(0, 10);

  /* ── IDEB by dep ── */
  const deps = ['Municipal', 'Estadual', 'Federal'];
  const depVals = deps.map(dep => {
    const arr = filtered.filter(s => s.dependencia === dep && s.ideb != null);
    return arr.length ? +(arr.reduce((a, b) => a + b.ideb!, 0) / arr.length).toFixed(2) : null;
  });

  /* ── Scatter IDEB × Fluxo ── */
  const scatterDeps = deps.filter(d => filtered.some(s => s.dependencia === d));

  const baseOpts = { responsive: true, maintainAspectRatio: false } as const;

  return (
    <div className="charts-grid">
      {/* Top 40 */}
      <div className="chart-card span-2">
        <div className="chart-header"><h3>Top 40 Escolas por IDEB</h3><span className="chart-badge">bar</span></div>
        <div className="chart-wrap tall">
          {top40.length > 0 && (
            <Bar
              data={{
                labels: top40.map(s => trunc(s.nome_escola, 22)),
                datasets: [
                  {
                    label: 'IDEB',
                    data: top40.map(s => s.ideb!),
                    backgroundColor: top40.map(s => DEP_COLOR[s.dependencia]?.bg ?? 'rgba(200,200,200,.5)'),
                    borderColor: top40.map(s => DEP_COLOR[s.dependencia]?.border ?? '#aaa'),
                    borderWidth: 1, borderRadius: 4,
                  },
                  {
                    label: `Média (${avg40.toFixed(2)})`,
                    data: Array(top40.length).fill(avg40),
                    type: 'line',
                    borderColor: 'rgba(129,140,248,.8)',
                    borderWidth: 1.5, borderDash: [6, 3], pointRadius: 0, fill: false,
                  } as unknown as ChartDataset<'bar'>,
                ],
              }}
              options={{
                ...baseOpts,
                plugins: {
                  legend: { display: true, position: 'top', labels: { boxWidth: 12, filter: (i: any) => i.datasetIndex === 1 } },
                  tooltip: { callbacks: {
                    title: (items: any) => top40[items[0].dataIndex]?.nome_escola,
                    label: (item: any) => item.datasetIndex === 0
                      ? `IDEB: ${item.raw} · ${top40[item.dataIndex]?.dependencia} · ${top40[item.dataIndex]?.no_municipio}`
                      : `Média: ${avg40.toFixed(2)}`,
                  }},
                },
                scales: {
                  y: { min: 0, max: 10, grid: { color: gc }, ticks: { color: tc } },
                  x: { grid: { display: false }, ticks: { maxRotation: 45, color: tc, font: { size: 10 } } },
                },
              }}
            />
          )}
        </div>
      </div>

      {/* IDEB by city */}
      <div className="chart-card">
        <div className="chart-header"><h3>IDEB Médio por Município</h3><span className="chart-badge">hbar</span></div>
        <div className="chart-wrap">
          {cityEntries.length > 0 && (
            <Bar
              data={{
                labels: cityEntries.map(e => e.city),
                datasets: [{ label: 'IDEB Médio', data: cityEntries.map(e => +e.avg.toFixed(2)), backgroundColor: cityEntries.map((_, i) => PALETTE[i % PALETTE.length]), borderColor: cityEntries.map((_, i) => BORDER_PALETTE[i % BORDER_PALETTE.length]), borderWidth: 1, borderRadius: 6 }],
              }}
              options={{ ...baseOpts, indexAxis: 'y' as const, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (item: any) => `IDEB: ${item.raw} (${cityEntries[item.dataIndex].count} escola${cityEntries[item.dataIndex].count !== 1 ? 's' : ''})` } } }, scales: { x: { min: 0, max: 10, grid: { color: gc }, ticks: { color: tc } }, y: { grid: { display: false }, ticks: { color: tc, font: { size: 11 } } } } }}
            />
          )}
        </div>
      </div>

      {/* SAEB by city */}
      <div className="chart-card">
        <div className="chart-header"><h3>SAEB LP e MT por Município</h3><span className="chart-badge">bar</span></div>
        <div className="chart-wrap">
          {saebEntries.length > 0 && (
            <Bar
              data={{
                labels: saebEntries.map(e => e.city),
                datasets: [
                  { label: 'LP', data: saebEntries.map(e => +e.lp.toFixed(1)), backgroundColor: 'rgba(110,231,183,.6)', borderColor: '#6ee7b7', borderWidth: 1, borderRadius: 4 },
                  { label: 'Matemática', data: saebEntries.map(e => +e.mt.toFixed(1)), backgroundColor: 'rgba(129,140,248,.6)', borderColor: '#818cf8', borderWidth: 1, borderRadius: 4 },
                ],
              }}
              options={{ ...baseOpts, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } }, scales: { y: { grid: { color: gc }, ticks: { color: tc } }, x: { grid: { display: false }, ticks: { color: tc, maxRotation: 35, font: { size: 10 } } } } }}
            />
          )}
        </div>
      </div>

      {/* IDEB by dep */}
      <div className="chart-card">
        <div className="chart-header"><h3>IDEB por Dependência Adm.</h3><span className="chart-badge">bar</span></div>
        <div className="chart-wrap">
          <Bar
            data={{
              labels: deps,
              datasets: [{ label: 'IDEB Médio', data: depVals, backgroundColor: deps.map(d => DEP_COLOR[d]?.bg), borderColor: deps.map(d => DEP_COLOR[d]?.border), borderWidth: 1, borderRadius: 8 }],
            }}
            options={{ ...baseOpts, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (item: any) => `IDEB médio: ${item.raw}` } } }, scales: { y: { min: 0, max: 10, grid: { color: gc }, ticks: { color: tc } }, x: { grid: { display: false }, ticks: { color: tc } } } }}
          />
        </div>
      </div>

      {/* Scatter IDEB × Fluxo */}
      <div className="chart-card">
        <div className="chart-header"><h3>IDEB × Fluxo (Aprovação)</h3><span className="chart-badge">scatter</span></div>
        <div className="chart-wrap">
          <Scatter
            data={{
              datasets: scatterDeps.map(dep => ({
                label: dep,
                data: filtered.filter(s => s.dependencia === dep && s.ideb != null && s.fluxo != null)
                  .map(s => ({ x: s.ideb!, y: +(s.fluxo! * 100).toFixed(1), nome: s.nome_escola, city: s.no_municipio })),
                backgroundColor: DEP_COLOR[dep].bg,
                borderColor: DEP_COLOR[dep].border,
                borderWidth: 1, pointRadius: 5, pointHoverRadius: 8,
              })),
            }}
            options={{
              ...baseOpts,
              plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } }, tooltip: { callbacks: { label: (item: any) => `${item.raw.nome} (${item.raw.city}) — IDEB ${item.raw.x}, Fluxo ${item.raw.y}%` } } },
              scales: {
                x: { title: { display: true, text: 'IDEB', color: tc }, grid: { color: gc }, ticks: { color: tc } },
                y: { title: { display: true, text: 'Fluxo / Aprovação (%)', color: tc }, grid: { color: gc }, ticks: { color: tc, callback: (v: any) => v + '%' } },
              },
            }}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="chart-card legend-card">
        <div className="legend-strip">
          {['Municipal', 'Estadual', 'Federal'].filter(d => filtered.some(s => s.dependencia === d)).map(d => (
            <span key={d} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: 16 }}>
              <span className="legend-dot" style={{ background: DEP_COLOR[d].border }} />
              {d}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
