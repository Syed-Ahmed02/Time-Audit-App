"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TimeEntry } from "@/contexts/time-entries-context"

interface CalendarGridProps {
  currentDate: Date
  timeEntries: TimeEntry[]
  onDateSelect: (date: Date) => void
}

const categoryColors = {
  growth: "bg-green-500",
  maintenance: "bg-blue-500",
  shrink: "bg-red-500",
}

export function CalendarGrid({ currentDate, timeEntries, onDateSelect }: CalendarGridProps) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and how many days in month
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  // Get days from previous month to fill the grid
  const daysFromPrevMonth = startingDayOfWeek
  const prevMonth = new Date(year, month - 1, 0)
  const daysInPrevMonth = prevMonth.getDate()

  // Calculate total cells needed (6 weeks * 7 days = 42)
  const totalCells = 42
  const daysFromNextMonth = totalCells - daysFromPrevMonth - daysInMonth

  const getDayEntries = (date: Date): TimeEntry[] => {
    const dateStr = date.toISOString().split("T")[0]
    return timeEntries.filter((entry) => entry.date === dateStr)
  }

  const getDayStats = (entries: TimeEntry[]) => {
    const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration, 0)
    const categories = entries.reduce(
      (acc, entry) => {
        acc[entry.category] = (acc[entry.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      categories,
      hasEntries: entries.length > 0,
    }
  }

  const renderDay = (day: number, isCurrentMonth: boolean, isPrevMonth: boolean) => {
    const date = isPrevMonth
      ? new Date(year, month - 1, day)
      : isCurrentMonth
        ? new Date(year, month, day)
        : new Date(year, month + 1, day)

    const entries = getDayEntries(date)
    const stats = getDayStats(entries)
    const isToday = date.toDateString() === new Date().toDateString()
    const isSelected = date.toDateString() === currentDate.toDateString()

    // Check if date is in the future
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    const isFuture = date > today

    return (
      <Card
        key={`${isPrevMonth ? "prev" : isCurrentMonth ? "current" : "next"}-${day}`}
        className={`
          transition-all min-h-[60px] md:min-h-[100px]
          ${!isCurrentMonth ? "opacity-40" : ""}
          ${isToday ? "ring-2 ring-blue-500" : ""}
          ${isSelected ? "ring-2 ring-purple-500" : ""}
          ${stats.hasEntries ? "bg-muted/30" : ""}
          ${isFuture ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:shadow-md"}
        `}
        onClick={() => !isFuture && onDateSelect(date)}
      >
        <CardContent className="p-1 md:p-2 h-full">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-1">
              <span
                className={`
                text-xs md:text-sm font-medium 
                ${isToday ? "text-blue-600 font-bold" : ""} 
                ${isFuture ? "text-muted-foreground" : ""}
              `}
              >
                {day}
              </span>
              {stats.hasEntries && (
                <Badge variant="secondary" className="text-xs px-1 py-0 hidden md:inline-flex">
                  {stats.totalHours}h
                </Badge>
              )}
              {isFuture && <span className="text-xs text-muted-foreground hidden md:inline">Future</span>}
            </div>

            {stats.hasEntries && !isFuture && (
              <div className="flex-1 space-y-1">
                <div className="flex gap-1 flex-wrap">
                  {Object.entries(stats.categories).map(([category, count]) => (
                    <div
                      key={category}
                      className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${categoryColors[category as keyof typeof categoryColors]}`}
                      title={`${category}: ${count} entries`}
                    />
                  ))}
                </div>

                {/* Show total hours on mobile, activity details on desktop */}
                <div className="md:hidden">
                  {stats.hasEntries && <div className="text-xs text-muted-foreground">{stats.totalHours}h</div>}
                </div>

                <div className="hidden md:block space-y-1">
                  {entries.slice(0, 2).map((entry, index) => (
                    <div key={entry.id} className="text-xs text-muted-foreground truncate" title={entry.activity}>
                      {entry.startTime} {entry.activity}
                    </div>
                  ))}

                  {entries.length > 2 && (
                    <div className="text-xs text-muted-foreground">+{entries.length - 2} more</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const weekDaysMobile = ["S", "M", "T", "W", "T", "F", "S"]

  return (
    <Card>
      <CardContent className="p-2 md:p-4">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 md:mb-4">
          {weekDays.map((day, index) => (
            <div key={day} className="text-center text-xs md:text-sm font-medium text-muted-foreground py-1 md:py-2">
              <span className="hidden md:inline">{day}</span>
              <span className="md:hidden">{weekDaysMobile[index]}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {/* Previous month days */}
          {Array.from({ length: daysFromPrevMonth }, (_, i) =>
            renderDay(daysInPrevMonth - daysFromPrevMonth + i + 1, false, true),
          )}

          {/* Current month days */}
          {Array.from({ length: daysInMonth }, (_, i) => renderDay(i + 1, true, false))}

          {/* Next month days */}
          {Array.from({ length: daysFromNextMonth }, (_, i) => renderDay(i + 1, false, false))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mt-2 md:mt-4 pt-2 md:pt-4 border-t">
          <div className="flex items-center gap-1 md:gap-2 text-xs">
            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500" />
            <span className="hidden sm:inline">Growth</span>
            <span className="sm:hidden">G</span>
          </div>
          <div className="flex items-center gap-1 md:gap-2 text-xs">
            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-blue-500" />
            <span className="hidden sm:inline">Maintenance</span>
            <span className="sm:hidden">M</span>
          </div>
          <div className="flex items-center gap-1 md:gap-2 text-xs">
            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500" />
            <span className="hidden sm:inline">Shrink</span>
            <span className="sm:hidden">S</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
