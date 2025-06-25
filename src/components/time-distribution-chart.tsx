"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChartIcon } from "lucide-react"
import type { TimeEntry } from "@/contexts/time-entries-context"

interface TimeDistributionChartProps {
  entries: TimeEntry[]
}

const COLORS = {
  growth: "#22c55e",
  maintenance: "#3b82f6",
  shrink: "#ef4444",
}

export function TimeDistributionChart({ entries }: TimeDistributionChartProps) {
  const data = entries.reduce(
    (acc, entry) => {
      acc[entry.category] += entry.duration
      return acc
    },
    { growth: 0, maintenance: 0, shrink: 0 },
  )

  const chartData = [
    {
      name: "Growth",
      value: Math.round((data.growth / 60) * 10) / 10,
      hours: Math.round((data.growth / 60) * 10) / 10,
      color: COLORS.growth,
    },
    {
      name: "Maintenance",
      value: Math.round((data.maintenance / 60) * 10) / 10,
      hours: Math.round((data.maintenance / 60) * 10) / 10,
      color: COLORS.maintenance,
    },
    {
      name: "Shrink",
      value: Math.round((data.shrink / 60) * 10) / 10,
      hours: Math.round((data.shrink / 60) * 10) / 10,
      color: COLORS.shrink,
    },
  ].filter((item) => item.value > 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">{data.hours}h total</p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm font-medium">{entry.value}</span>
            <span className="text-sm text-muted-foreground">({entry.payload.hours}h)</span>
          </div>
        ))}
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Time Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No data available for the selected period
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Time Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
