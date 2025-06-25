"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import type { TimeEntry } from "@/contexts/time-entries-context"

interface ActivityTrendsChartProps {
  entries: TimeEntry[]
  startDate: Date
  endDate: Date
}

const COLORS = {
  growth: "#22c55e",
  maintenance: "#3b82f6",
  shrink: "#ef4444",
}

export function ActivityTrendsChart({ entries, startDate, endDate }: ActivityTrendsChartProps) {
  // Generate daily data
  const dailyData = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0]
    const dayEntries = entries.filter((entry) => entry.date === dateStr)

    const dayStats = dayEntries.reduce(
      (acc, entry) => {
        acc[entry.category] += entry.duration / 60 // Convert to hours
        return acc
      },
      { growth: 0, maintenance: 0, shrink: 0 },
    )

    dailyData.push({
      date: dateStr,
      displayDate: currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      growth: Math.round(dayStats.growth * 10) / 10,
      maintenance: Math.round(dayStats.maintenance * 10) / 10,
      shrink: Math.round(dayStats.shrink * 10) / 10,
      total: Math.round((dayStats.growth + dayStats.maintenance + dayStats.shrink) * 10) / 10,
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}h
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (dailyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Activity Trends
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
          <TrendingUp className="h-5 w-5" />
          Activity Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                label={{ value: "Hours", angle: -90, position: "insideLeft" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="growth"
                stroke={COLORS.growth}
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Growth"
              />
              <Line
                type="monotone"
                dataKey="maintenance"
                stroke={COLORS.maintenance}
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Maintenance"
              />
              <Line
                type="monotone"
                dataKey="shrink"
                stroke={COLORS.shrink}
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Shrink"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
