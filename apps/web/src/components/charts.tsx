'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AreaScore } from '@/lib/types';

function scoreColor(value: number) {
  if (value >= 80) return '#10b981';
  if (value >= 50) return '#f59e0b';
  return '#f43f5e';
}

export function ScoreGauge({ score }: { score: number }) {
  const data = [{ name: 'Score', value: score, fill: scoreColor(score) }];
  return (
    <div className="relative h-48 w-full">
      <ResponsiveContainer>
        <RadialBarChart
          data={data}
          innerRadius="72%"
          outerRadius="100%"
          startAngle={225}
          endAngle={-45}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#f1f5f9' }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color: scoreColor(score) }}>
          {score}%
        </span>
        <span className="mt-1 text-xs text-slate-500">Compliance-Score</span>
      </div>
    </div>
  );
}

export function AreaBars({ areas }: { areas: AreaScore[] }) {
  const data = areas.map((a) => ({ ...a, shortName: a.name.split('&')[0].trim() }));
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
          <YAxis
            type="category"
            dataKey="shortName"
            width={190}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, 'Umsetzungsgrad']}
            labelFormatter={(label) => String(label)}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={14}>
            {data.map((entry) => (
              <Cell key={entry.key} fill={scoreColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
