"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Clock, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TimeEntriesTable } from "@/components/time-entries-table"
import { CalendarGrid } from "@/components/calendar-grid"
import { useTimeEntries } from "@/contexts/time-entries-context"

type ViewType = "day" | "week" | "month"

export type TimeEntry = {
  id: string
  date: string
  startTime: string
  endTime: string
  activity: string
  category: "growth" | "shrink" | "maintenance"
  duration: number // in minutes
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState<ViewType>("week")
  const { timeEntries } = useTimeEntries()

  const formatDateHeader = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
    }

    switch (viewType) {
      case "day":
        return currentDate.toLocaleDateString("en-US", {
          ...options,
          day: "numeric",
          weekday: "long",
        })
      case "week":
        const startOfWeek = new Date(currentDate)
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)

        return `${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
      case "month":
        return currentDate.toLocaleDateString("en-US", options)
      default:
        return ""
    }
  }

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    switch (viewType) {
      case "day":
        newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1))
        break
      case "week":
        newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7))
        break
      case "month":
        newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1))
        break
    }

    if (direction === "next" && newDate > today) {
      return
    }

    setCurrentDate(newDate)
  }

  const getFilteredEntries = (): TimeEntry[] => {
    const currentDateStr = currentDate.toISOString().split("T")[0]

    switch (viewType) {
      case "day":
        return timeEntries.filter((entry) => entry.date === currentDateStr)

      case "week":
        const startOfWeek = new Date(currentDate)
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)

        return timeEntries.filter((entry) => {
          const entryDate = new Date(entry.date)
          return entryDate >= startOfWeek && entryDate <= endOfWeek
        })

      case "month":
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

        return timeEntries.filter((entry) => {
          const entryDate = new Date(entry.date)
          return entryDate >= startOfMonth && entryDate <= endOfMonth
        })

      default:
        return []
    }
  }

  const getStats = (entries: TimeEntry[]) => {
    const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration, 0)
    const growthMinutes = entries.filter((e) => e.category === "growth").reduce((sum, entry) => sum + entry.duration, 0)
    const maintenanceMinutes = entries
      .filter((e) => e.category === "maintenance")
      .reduce((sum, entry) => sum + entry.duration, 0)
    const shrinkMinutes = entries.filter((e) => e.category === "shrink").reduce((sum, entry) => sum + entry.duration, 0)

    const totalHours = Math.round((totalMinutes / 60) * 10) / 10

    // Calculate undocumented hours based on view type
    let totalPossibleHours = 24
    if (viewType === "week") totalPossibleHours = 24 * 7
    if (viewType === "month") {
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
      totalPossibleHours = 24 * daysInMonth
    }

    const undocumentedHours = Math.max(0, totalPossibleHours - totalHours)

    return {
      total: totalHours,
      undocumented: Math.round(undocumentedHours * 10) / 10,
      totalPossible: totalPossibleHours,
      growth: Math.round((growthMinutes / 60) * 10) / 10,
      maintenance: Math.round((maintenanceMinutes / 60) * 10) / 10,
      shrink: Math.round((shrinkMinutes / 60) * 10) / 10,
    }
  }

  const isNextDisabled = (): boolean => {
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    const nextDate = new Date(currentDate)

    switch (viewType) {
      case "day":
        nextDate.setDate(currentDate.getDate() + 1)
        break
      case "week":
        nextDate.setDate(currentDate.getDate() + 7)
        break
      case "month":
        nextDate.setMonth(currentDate.getMonth() + 1)
        break
    }

    return nextDate > today
  }

  const filteredEntries = getFilteredEntries()
  const stats = getStats(filteredEntries)

  return (
    <div className="flex-1 space-y-4 p-4 md:space-y-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Calendar View</h1>
          <p className="text-sm md:text-base text-muted-foreground">View and analyze your time entries</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={viewType} onValueChange={(value: ViewType) => setViewType(value)}>
            <SelectTrigger className="w-24 md:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <h2 className="text-base md:text-xl font-semibold min-w-0 truncate">{formatDateHeader()}</h2>

          <Button variant="outline" size="sm" onClick={() => navigateDate("next")} disabled={isNextDisabled()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
          Today
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium">Total Time</p>
                <p className="text-lg md:text-2xl font-bold">
                  {stats.total}h<span className="text-sm text-muted-foreground">/{stats.totalPossible}h</span>
                </p>
                <p className="text-xs text-muted-foreground truncate">{stats.undocumented}h undocumented</p>
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
                <p className="text-lg md:text-2xl font-bold">{stats.growth}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium">Maintenance</p>
                <p className="text-lg md:text-2xl font-bold">{stats.maintenance}h</p>
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
                <p className="text-lg md:text-2xl font-bold">{stats.shrink}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid for Month View */}
      {viewType === "month" && (
        <CalendarGrid
          currentDate={currentDate}
          timeEntries={filteredEntries}
          onDateSelect={(date) => {
            setCurrentDate(date)
            setViewType("day")
          }}
        />
      )}

      {/* Time Entries Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <BarChart3 className="h-4 md:h-5 w-4 md:w-5" />
            <span className="hidden sm:inline">Time Entries</span>
            <span className="sm:hidden">Entries</span>
            <Badge variant="secondary" className="ml-2 text-xs">
              {filteredEntries.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TimeEntriesTable data={filteredEntries} viewType={viewType} />
        </CardContent>
      </Card>
    </div>
  )
}
