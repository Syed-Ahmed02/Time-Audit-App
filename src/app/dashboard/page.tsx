"use client"

import { useState, useMemo } from "react"
import { Download, Sparkles, TrendingUp, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTimeEntries } from "@/contexts/time-entries-context"
import { TimeDistributionChart } from "@/components/time-distribution-chart"
import { ActivityTrendsChart } from "@/components/activity-trends-chart"
import { MostCommonActivities } from "@/components/most-common-activities"
import { AISummaryCard } from "@/components/ai-summary-card"
import { exportToPDF } from "@/lib/pdf-export"

type DateRange = "7d" | "14d" | "30d" | "custom"

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>("7d")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [showAISummary, setShowAISummary] = useState(false)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const { timeEntries, getEntriesForDateRange } = useTimeEntries()

  // Calculate date range
  const { startDate, endDate } = useMemo(() => {
    const today = new Date()
    let start: Date
    let end: Date = new Date(today)

    if (dateRange === "custom" && customStartDate && customEndDate) {
      start = new Date(customStartDate)
      end = new Date(customEndDate)
    } else {
      const days = dateRange === "7d" ? 7 : dateRange === "14d" ? 14 : 30
      start = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
    }

    return { startDate: start, endDate: end }
  }, [dateRange, customStartDate, customEndDate])

  // Get filtered entries
  const filteredEntries = useMemo(() => {
    return getEntriesForDateRange(startDate, endDate)
  }, [getEntriesForDateRange, startDate, endDate])

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalMinutes = filteredEntries.reduce((sum, entry) => sum + entry.duration, 0)
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10

    const categoryStats = filteredEntries.reduce(
      (acc, entry) => {
        acc[entry.category].minutes += entry.duration
        acc[entry.category].count += 1
        return acc
      },
      {
        growth: { minutes: 0, count: 0 },
        maintenance: { minutes: 0, count: 0 },
        shrink: { minutes: 0, count: 0 },
      },
    )

    const growthHours = Math.round((categoryStats.growth.minutes / 60) * 10) / 10
    const maintenanceHours = Math.round((categoryStats.maintenance.minutes / 60) * 10) / 10
    const shrinkHours = Math.round((categoryStats.shrink.minutes / 60) * 10) / 10

    const avgDailyHours =
      Math.round(
        (totalHours / Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))) * 10,
      ) / 10

    const productivityScore = Math.round(((growthHours + maintenanceHours * 0.5) / Math.max(1, totalHours)) * 100)

    return {
      totalHours,
      avgDailyHours,
      productivityScore,
      growth: { hours: growthHours, count: categoryStats.growth.count },
      maintenance: { hours: maintenanceHours, count: categoryStats.maintenance.count },
      shrink: { hours: shrinkHours, count: categoryStats.shrink.count },
    }
  }, [filteredEntries, startDate, endDate])

  const handleGenerateAISummary = async () => {
    setIsGeneratingSummary(true)
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setShowAISummary(true)
    setIsGeneratingSummary(false)
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      await exportToPDF({
        entries: filteredEntries,
        analytics,
        dateRange: { start: startDate, end: endDate },
      })
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const formatDateRange = () => {
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:space-y-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">Analytics and insights for {formatDateRange()}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          <Button
            onClick={handleGenerateAISummary}
            disabled={isGeneratingSummary}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isGeneratingSummary ? "Generating..." : "AI Summary"}
          </Button>
          <Button variant="outline" onClick={handleExportPDF} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Time Period</Label>
              <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="14d">Last 14 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === "custom" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-sm font-medium">
                    Start Date
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-sm font-medium">
                    End Date
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Summary */}
      {showAISummary && (
        <AISummaryCard analytics={analytics} dateRange={formatDateRange()} onDismiss={() => setShowAISummary(false)} />
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium">Total Hours</p>
                <p className="text-lg md:text-2xl font-bold">{analytics.totalHours}h</p>
                <p className="text-xs text-muted-foreground">{analytics.avgDailyHours}h/day avg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <TrendingUp className="h-4 w-4 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium">Productivity</p>
                <p className="text-lg md:text-2xl font-bold">{analytics.productivityScore}%</p>
                <p className="text-xs text-muted-foreground">Growth + Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium">Growth</p>
                <p className="text-lg md:text-2xl font-bold">{analytics.growth.hours}h</p>
                <p className="text-xs text-muted-foreground">{analytics.growth.count} activities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium">Shrink</p>
                <p className="text-lg md:text-2xl font-bold">{analytics.shrink.hours}h</p>
                <p className="text-xs text-muted-foreground">{analytics.shrink.count} activities</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <TimeDistributionChart entries={filteredEntries} />
        <ActivityTrendsChart entries={filteredEntries} startDate={startDate} endDate={endDate} />
      </div>

      {/* Most Common Activities */}
      <MostCommonActivities entries={filteredEntries} />
    </div>
  )
}
