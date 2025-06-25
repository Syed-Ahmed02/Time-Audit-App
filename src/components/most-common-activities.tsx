"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3 } from "lucide-react"
import type { TimeEntry } from "@/contexts/time-entries-context"

interface MostCommonActivitiesProps {
  entries: TimeEntry[]
}

const categoryColors = {
  growth: "bg-green-100 text-green-800 hover:bg-green-200",
  maintenance: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  shrink: "bg-red-100 text-red-800 hover:bg-red-200",
}

export function MostCommonActivities({ entries }: MostCommonActivitiesProps) {
  // Aggregate activities
  const activityStats = entries.reduce(
    (acc, entry) => {
      const key = entry.activity.toLowerCase().trim()
      if (!acc[key]) {
        acc[key] = {
          activity: entry.activity,
          category: entry.category,
          totalMinutes: 0,
          count: 0,
        }
      }
      acc[key].totalMinutes += entry.duration
      acc[key].count += 1
      return acc
    },
    {} as Record<string, { activity: string; category: string; totalMinutes: number; count: number }>,
  )

  // Sort by total time and take top 10
  const topActivities = Object.values(activityStats)
    .sort((a, b) => b.totalMinutes - a.totalMinutes)
    .slice(0, 10)
    .map((activity) => ({
      ...activity,
      hours: Math.round((activity.totalMinutes / 60) * 10) / 10,
      avgMinutes: Math.round(activity.totalMinutes / activity.count),
    }))

  const maxHours = topActivities[0]?.hours || 1

  if (topActivities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Most Common Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No activities found for the selected period
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Most Common Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topActivities.map((activity, index) => (
            <div key={activity.activity} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-sm font-medium text-muted-foreground w-6 flex-shrink-0">#{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{activity.activity}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={categoryColors[activity.category as keyof typeof categoryColors]}>
                        {activity.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {activity.count} {activity.count === 1 ? "session" : "sessions"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold">{activity.hours}h</p>
                  <p className="text-xs text-muted-foreground">{activity.avgMinutes}m avg</p>
                </div>
              </div>
              <Progress value={(activity.hours / maxHours) * 100} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
