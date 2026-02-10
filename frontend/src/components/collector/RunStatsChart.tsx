import React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import type { CrawlRun } from "@/types/run"

interface RunStatsChartProps {
  run: CrawlRun
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} className="tooltip-value" style={{ color: entry.fill || entry.color }}>
          {entry.name}: {entry.value}건
        </p>
      ))}
    </div>
  )
}

const RunStatsChart: React.FC<RunStatsChartProps> = ({ run }) => {
  const data = [
    { name: "성공", count: run.success_count, color: "#20c997" },
    { name: "실패", count: run.failed_count, color: "#EF5350" },
    { name: "건너뜀", count: run.skipped_count, color: "#FF8C00" },
  ]

  const pendingOrRunning = run.total_tasks - run.success_count - run.failed_count - run.skipped_count
  if (pendingOrRunning > 0) {
    data.push({ name: "진행중/대기", count: pendingOrRunning, color: "#006FBD" })
  }

  const allZero = data.every((d) => d.count === 0)
  if (allZero) return null

  return (
    <div className="collector-chart-wrapper">
      <h4>태스크 실행 결과</h4>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis dataKey="name" fontSize={12} tick={{ fill: "#666" }} />
          <YAxis fontSize={12} tick={{ fill: "#666" }} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} iconType="square" iconSize={10} />
          <Bar dataKey="count" name="건수" radius={[4, 4, 0, 0]} maxBarSize={60}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RunStatsChart
