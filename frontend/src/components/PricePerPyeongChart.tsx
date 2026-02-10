import React from 'react';
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import type { PricePerPyeongTrend } from '@/types/loan';

interface PricePerPyeongChartProps {
  data: PricePerPyeongTrend | null | undefined;
}

export default function PricePerPyeongChart({ data }: PricePerPyeongChartProps) {
  if (!data) return null;

  // 오토 스케일: 데이터 최소/최대에서 ±5% 마진
  const allValues = data.data.flatMap((d) => [d.complex, d.dong, d.sigungu]);
  const dataMin = Math.min(...allValues);
  const dataMax = Math.max(...allValues);
  const margin = Math.max(Math.round((dataMax - dataMin) * 0.15), 50);
  const yMin = Math.max(0, Math.floor((dataMin - margin) / 100) * 100);
  const yMax = Math.ceil((dataMax + margin) / 100) * 100;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} className="tooltip-value" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}만원/평
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="info-card">
      <h3>단지/읍면동/시군구 평단가 추이</h3>
      <div className="pyeong-chart-labels">
        <span className="pyeong-label">단지: {data.complex_name}</span>
        <span className="pyeong-label">동: {data.dong_name}</span>
        <span className="pyeong-label">구: {data.sigungu_name}</span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data.data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis
            domain={[yMin, yMax]}
            tickFormatter={(v: number) => `${v.toLocaleString()}`}
            tick={{ fontSize: 11 }}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
          />
          <Line
            type="monotone"
            dataKey="complex"
            stroke="#006FBD"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#006FBD' }}
            name={data.complex_name}
          />
          <Line
            type="monotone"
            dataKey="dong"
            stroke="#FF8C00"
            strokeWidth={2}
            dot={{ r: 4, fill: '#FF8C00' }}
            name={data.dong_name}
          />
          <Line
            type="monotone"
            dataKey="sigungu"
            stroke="#20c997"
            strokeWidth={2}
            dot={{ r: 4, fill: '#20c997' }}
            name={data.sigungu_name}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
