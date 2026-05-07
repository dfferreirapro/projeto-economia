'use client';

import {
  Chart as ChartJS, LinearScale, PointElement,
  Tooltip, Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const OUR_CITIES = ['Sorocaba', 'Votorantim'];
const REF_CITIES = ['Sobral', 'São Caetano do Sul', 'Jaraguá do Sul', 'João Pessoa', 'Recife'];

interface CityRow {
  city: string;
  avgIdeb: number | null;
  avgInfra: number | null;
  isOurs: boolean;
}

interface Props { data: CityRow[]; theme: string; }

export default function ParadoxChart({ data, theme }: Props) {
  const gc = 'rgba(231,233,238,.8)';
  const tc = '#9AA0AB';

  const valid = data.filter(c => c.avgIdeb != null && c.avgInfra != null);

  const ourData  = valid.filter(c => OUR_CITIES.includes(c.city));
  const refData  = valid.filter(c => REF_CITIES.includes(c.city));
  const restData = valid.filter(c => !OUR_CITIES.includes(c.city) && !REF_CITIES.includes(c.city));

  const makePoints = (arr: typeof valid) =>
    arr.map(c => ({ x: +(c.avgInfra!).toFixed(1), y: +(c.avgIdeb!).toFixed(2), city: c.city }));

  return (
    <Scatter
      data={{
        datasets: [
          {
            label: 'Nossa região',
            data: makePoints(ourData),
            backgroundColor: 'rgba(255,107,44,.85)',
            borderColor: '#FF6B2C',
            borderWidth: 2,
            pointRadius: 10,
            pointHoverRadius: 13,
          },
          {
            label: 'Referências',
            data: makePoints(refData),
            backgroundColor: 'rgba(177,76,255,.8)',
            borderColor: '#B14CFF',
            borderWidth: 2,
            pointRadius: 9,
            pointHoverRadius: 12,
          },
          {
            label: 'Outras cidades',
            data: makePoints(restData),
            backgroundColor: 'rgba(231,233,238,.9)',
            borderColor: '#E7E9EE',
            borderWidth: 1,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, color: tc, font: { size: 12 } },
          },
          tooltip: {
            callbacks: {
              label: (item) => {
                const p = item.raw as { x: number; y: number; city: string };
                return ` ${p.city} — Infra: ${p.x}% · IDEB: ${p.y}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: 'Score de Infraestrutura (%)', color: tc, font: { size: 12 } },
            grid: { color: gc },
            ticks: { color: tc, callback: (v) => v + '%' },
          },
          y: {
            title: { display: true, text: 'IDEB médio', color: tc, font: { size: 12 } },
            min: 3, max: 10,
            grid: { color: gc },
            ticks: { color: tc },
          },
        },
      }}
    />
  );
}
