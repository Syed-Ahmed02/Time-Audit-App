"use client"

import { Sparkles, X, TrendingUp, TrendingDown, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AISummaryCardProps {
  analytics: {
    totalHours: number
    avgDailyHours: number
    productivityScore: number
    growth: { hours: number; count: number }
    maintenance: { hours: number; count: number }
    shrink: { hours: number; count: number }
  }
  dateRange: string
  onDismiss: () => void
}

export function AISummaryCard({ analytics, dateRange, onDismiss }: AISummaryCardProps) {
  const generateInsights = () => {
    const insights = []

    // Productivity insights
    if (analytics.productivityScore >= 80) {
      insights.push({
        type: "positive",
        icon: TrendingUp,
        text: `Excellent productivity score of ${analytics.productivityScore}%! You're maintaining a great balance of growth and maintenance activities.`,
      })
    } else if (analytics.productivityScore >= 60) {
      insights.push({
        type: "neutral",
        icon: Clock,
        text: `Good productivity score of ${analytics.productivityScore}%. Consider increasing growth activities to boost your score.`,
      })
    } else {
      insights.push({
        type: "warning",
        icon: TrendingDown,
        text: `Productivity score of ${analytics.productivityScore}% suggests room for improvement. Focus on reducing shrink activities.`,
      })
    }

    // Time allocation insights
    if (analytics.shrink.hours > analytics.growth.hours) {
      insights.push({
        type: "warning",
        icon: TrendingDown,
        text: `You spent more time on shrink activities (${analytics.shrink.hours}h) than growth activities (${analytics.growth.hours}h). Consider reallocating this time.`,
      })
    }

    // Daily average insights
    if (analytics.avgDailyHours < 6) {
      insights.push({
        type: "neutral",
        icon: Clock,
        text: `Your daily average of ${analytics.avgDailyHours}h suggests you might be under-tracking. Consider logging more activities.`,
      })
    } else if (analytics.avgDailyHours > 12) {
      insights.push({
        type: "warning",
        icon: Clock,
        text: `High daily average of ${analytics.avgDailyHours}h. Make sure to include breaks and rest time in your schedule.`,
      })
    }

    // Growth activity insights
    if (analytics.growth.hours > analytics.maintenance.hours + analytics.shrink.hours) {
      insights.push({
        type: "positive",
        icon: TrendingUp,
        text: `Great focus on growth activities! ${analytics.growth.hours}h spent on personal and professional development.`,
      })
    }

    return insights.slice(0, 3) // Limit to 3 insights
  }

  const insights = generateInsights()

  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100">
              <Sparkles className="h-3 w-3 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-900">AI Summary</span>
            <Badge variant="secondary" className="text-xs">
              {dateRange}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <p className="text-2xl font-bold text-purple-800">{analytics.totalHours}h</p>
              <p className="text-xs text-purple-600">Total Tracked</p>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <p className="text-2xl font-bold text-purple-800">{analytics.productivityScore}%</p>
              <p className="text-xs text-purple-600">Productivity Score</p>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <p className="text-2xl font-bold text-purple-800">{analytics.avgDailyHours}h</p>
              <p className="text-xs text-purple-600">Daily Average</p>
            </div>
          </div>

          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/30 rounded-lg">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full flex-shrink-0 ${
                    insight.type === "positive"
                      ? "bg-green-100"
                      : insight.type === "warning"
                        ? "bg-orange-100"
                        : "bg-blue-100"
                  }`}
                >
                  <insight.icon
                    className={`h-3 w-3 ${
                      insight.type === "positive"
                        ? "text-green-600"
                        : insight.type === "warning"
                          ? "text-orange-600"
                          : "text-blue-600"
                    }`}
                  />
                </div>
                <p className="text-sm text-purple-800 leading-relaxed">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
