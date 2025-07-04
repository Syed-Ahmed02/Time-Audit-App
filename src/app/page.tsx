"use client"

import { useState, useMemo } from "react"
import { CalendarDays, Plus, Zap, FileText, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TimeBlock } from "@/components/time-block"
import { AISuggestionCard } from "@/components/ai-suggestion-card"
import { useTimeEntries } from "@/contexts/time-entries-context"

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [showAISuggestion, setShowAISuggestion] = useState(true)
  const [allCollapsed, setAllCollapsed] = useState(false)

  const { timeEntries, addTimeEntry, updateTimeEntry, deleteTimeEntry, getEntriesForDate } = useTimeEntries()

  // Get entries for the selected date
  const dayEntries = useMemo(() => {
    return getEntriesForDate(selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [getEntriesForDate, selectedDate])

  // Calculate real-time stats for the selected date including undocumented hours
  const dayStats = useMemo(() => {
    const totalMinutes = dayEntries.reduce((sum, entry) => sum + entry.duration, 0)
    const growthMinutes = dayEntries
      .filter((e) => e.category === "growth")
      .reduce((sum, entry) => sum + entry.duration, 0)
    const maintenanceMinutes = dayEntries
      .filter((e) => e.category === "maintenance")
      .reduce((sum, entry) => sum + entry.duration, 0)
    const shrinkMinutes = dayEntries
      .filter((e) => e.category === "shrink")
      .reduce((sum, entry) => sum + entry.duration, 0)

    const totalHours = Math.round((totalMinutes / 60) * 10) / 10
    const totalDayHours = 24
    const undocumentedHours = Math.max(0, totalDayHours - totalHours)

    return {
      total: totalHours,
      undocumented: Math.round(undocumentedHours * 10) / 10,
      totalDay: totalDayHours,
      growth: Math.round((growthMinutes / 60) * 10) / 10,
      maintenance: Math.round((maintenanceMinutes / 60) * 10) / 10,
      shrink: Math.round((shrinkMinutes / 60) * 10) / 10,
    }
  }, [dayEntries])

  const toggleAllBlocks = () => {
    setAllCollapsed(!allCollapsed)
  }

  const addTimeBlock = () => {
    addTimeEntry({
      date: selectedDate,
      startTime: "",
      endTime: "",
      activity: "",
      category: "maintenance",
    })
  }

  const deleteTimeBlock = (id: string) => {
    deleteTimeEntry(id)
  }

  const updateTimeBlock = (
    id: string,
    data: Partial<{
      startTime: string
      endTime: string
      activity: string
      category: "growth" | "shrink" | "maintenance"
    }>,
  ) => {
    updateTimeEntry(id, data)
  }

  const handleAISuggestionAccept = () => {
    const socialMediaEntry = dayEntries.find(
      (entry) =>
        entry.activity.toLowerCase().includes("twitter") || entry.activity.toLowerCase().includes("social media"),
    )

    if (socialMediaEntry) {
      updateTimeEntry(socialMediaEntry.id, { category: "shrink" })
    }
    setShowAISuggestion(false)
  }

  // Check if there are any entries that could be reclassified
  const hasSuggestionCandidate = dayEntries.some(
    (entry) =>
      (entry.activity.toLowerCase().includes("twitter") ||
        entry.activity.toLowerCase().includes("social media") ||
        entry.activity.toLowerCase().includes("browsing")) &&
      entry.category !== "shrink",
  )

  return (
    <div className="flex-1 space-y-4 p-4 md:space-y-6 md:p-6">
      {/* Desktop Header */}
      <div className="hidden md:flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Log</h1>
          <p className="text-muted-foreground">Track your time and categorize your activities</p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="date-picker" className="sr-only">
              Select date
            </Label>
            <Input
              id="date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Log</h1>
          <p className="text-sm text-muted-foreground">Track your time and activities</p>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1"
            max={new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

      {/* AI Suggestion */}
      {showAISuggestion && hasSuggestionCandidate && (
        <AISuggestionCard
          suggestion="Reclassify social media or browsing activities as Shrink? These activities might not be contributing to your productivity goals."
          onAccept={handleAISuggestionAccept}
          onDismiss={() => setShowAISuggestion(false)}
        />
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 md:gap-3">
        <Button className="bg-blue-600 hover:bg-blue-700 flex-1 md:flex-none">
          <Zap className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Auto-Fill</span>
          <span className="sm:hidden">Auto</span>
        </Button>
        <Button variant="outline" className="flex-1 md:flex-none">
          <FileText className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Summarize My Day</span>
          <span className="sm:hidden">Summary</span>
        </Button>
        <Button variant="outline" className="flex-1 md:flex-none">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Import from Calendar</span>
          <span className="sm:hidden">Import</span>
        </Button>
      </div>

      {/* Time Blocks */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg md:text-xl">Time Blocks</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={toggleAllBlocks} className="hidden md:flex">
                {allCollapsed ? "Expand All" : "Collapse All"}
              </Button>
              <Button onClick={addTimeBlock} size="sm">
                <Plus className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Add Block</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          {dayEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No time blocks yet. Add your first one!</p>
            </div>
          ) : (
            dayEntries.map((entry) => (
              <TimeBlock
                key={entry.id}
                id={entry.id}
                startTime={entry.startTime}
                endTime={entry.endTime}
                activity={entry.activity}
                category={entry.category}
                onDelete={deleteTimeBlock}
                onUpdate={updateTimeBlock}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Real-time Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium">Total Time</p>
                <p className="text-lg md:text-2xl font-bold">
                  {dayStats.total}h<span className="text-sm text-muted-foreground">/{dayStats.totalDay}h</span>
                </p>
                <p className="text-xs text-muted-foreground">{dayStats.undocumented}h undocumented</p>
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
                <p className="text-lg md:text-2xl font-bold">{dayStats.growth}h</p>
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
                <p className="text-lg md:text-2xl font-bold">{dayStats.maintenance}h</p>
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
                <p className="text-lg md:text-2xl font-bold">{dayStats.shrink}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
