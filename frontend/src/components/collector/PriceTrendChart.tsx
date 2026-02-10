import React, { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { KBPrice } from "@/types/data"
import type { Area } from "@/types/complex"

interface PriceTrendChartProps {
  prices: KBPrice[]
  areaMap?: Record<number, Area>
}

interface ChartDataPoint {
  date: string
  general: number | null
  high: number | null
  low: number | null
}

const formatPriceAxis = (value: number) => {
  if (value >= 10000) return `${(value / 10000).toFixed(0)}억`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}천`
  return `${value}`
}

const formatPriceTooltip = (value: number | null) => {
  if (value == null) return "-"
  if (value >= 10000) return `${(value / 10000).toFixed(1)}억원`
  return `${value.toLocaleString()}만원`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} className="tooltip-value" style={{ color: entry.color }}>
          {entry.name}: {formatPriceTooltip(entry.value)}
        </p>
      ))}
    </div>
  )
}

const PriceTrendChart: React.FC<PriceTrendChartProps> = ({ prices }) => {
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!prices || prices.length === 0) return []

    const dateMap = new Map<string, ChartDataPoint>()

    const sorted = [...prices].sort(
      (a, b) => new Date(a.as_of_date).getTime() - new Date(b.as_of_date).getTime()
    )

    for (const p of sorted) {
      const existing = dateMap.get(p.as_of_date)
      if (!existing) {
        dateMap.set(p.as_of_date, {
          date: p.as_of_date,
          general: p.general_price,
          high: p.high_avg_price,
          low: p.low_avg_price,
        })
      } else {
        // Average across areas if multiple on same date
        if (p.general_price != null) {
          existing.general =
            existing.general != null
              ? Math.round((existing.general + p.general_price) / 2)
              : p.general_price
        }
        if (p.high_avg_price != null) {
          existing.high =
            existing.high != null
              ? Math.round((existing.high + p.high_avg_price) / 2)
              : p.high_avg_price
        }
        if (p.low_avg_price != null) {
          existing.low =
            existing.low != null
              ? Math.round((existing.low + p.low_avg_price) / 2)
              : p.low_avg_price
        }
      }
    }

    return Array.from(dateMap.values())
  }, [prices])

  if (chartData.length === 0) {
    return (
      <div className="collector-chart-wrapper">
        <h4>KB 시세 추이</h4>
        <div className="collector-empty">차트 데이터가 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="collector-chart-wrapper">
      <h4>KB 시세 추이</h4>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis
            dataKey="date"
            fontSize={11}
            tick={{ fill: "#666" }}
            tickLine={{ stroke: "#E0E0E0" }}
          />
          <YAxis
            fontSize={11}
            tick={{ fill: "#666" }}
            tickFormatter={formatPriceAxis}
            tickLine={{ stroke: "#E0E0E0" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            iconType="circle"
            iconSize={8}
          />
          <Line
            type="monotone"
            dataKey="general"
            name="일반가"
            stroke="#006FBD"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="high"
            name="상위평균"
            stroke="#EF5350"
            strokeWidth={1.5}
            dot={{ r: 2 }}
            strokeDasharray="5 5"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="low"
            name="하위평균"
            stroke="#20c997"
            strokeWidth={1.5}
            dot={{ r: 2 }}
            strokeDasharray="5 5"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PriceTrendChart
