'use client';

import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, BarController, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, BarController, Tooltip, Legend);

const OUR_CITIES = ['Sorocaba', 'Votorantim'];

interface CityRow {
  city: string;
  avgIdeb: number | null;
  isOurs: boolean;
}

interface Props {
  data: CityRow[];
  theme: string;
}

export default function RankingChart({ data, theme }: Props) {
    const gc = 'rgba(231,233,238,.8)';
  const tc = '#9AA0AB';

  const sorted = [...data]
    .filter(c => c.avgIdeb != null)
    .sort((a, b) => b.avgIdeb! - a.avgIdeb!);

  const labels = sorted.map(c => c.city);
  const values = sorted.map(c => c.avgIdeb!);
  const colors = sorted.map(c =>
    OUR_CITIES.includes(c.city) ? 'rgba(255,107,44,.85)' : 'rgba(236,238,243,.9)'
  );
  const borders = sorted.map(c =>
    OUR_CITIES.includes(c.city) ? '#FF6B2C' : '#E7E9EE'
  );

  return (
    <Bar
      data={{
        labels,
        datasets: [{
          label: 'IDEB médio',
          data: values,
          backgroundColor: colors,
          borderColor: borders,
          borderWidth: 1,
          borderRadius: 4,
        }],
      }}
      options={{
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => {
                const c = sorted[item.dataIndex];
                return ` IDEB ${item.raw} ${OUR_CITIES.includes(c.city) ? '← nossa região' : ''}`;
              },
            },
          },
        },
        scales: {
          x: {
            min: 0, max: 10,
            grid: { color: gc },
            ticks: { color: tc, font: { size: 11 } },
          },
          y: {
            grid: { display: false },
            ticks: {
              color: (ctx) =>
                OUR_CITIES.includes(labels[ctx.index]) ? '#FF6B2C' : tc,
              font: { size: 11 },
            },
          },
        },
      }}
    />
  );
}
