"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type TimeEntry = {
  id: string
  date: string
  startTime: string
  endTime: string
  activity: string
  category: "growth" | "shrink" | "maintenance"
  duration: number // in minutes
}

interface TimeEntriesContextType {
  timeEntries: TimeEntry[]
  addTimeEntry: (entry: Omit<TimeEntry, "id" | "duration">) => void
  updateTimeEntry: (id: string, updates: Partial<Omit<TimeEntry, "id">>) => void
  deleteTimeEntry: (id: string) => void
  getEntriesForDate: (date: string) => TimeEntry[]
  getEntriesForDateRange: (startDate: Date, endDate: Date) => TimeEntry[]
}

const TimeEntriesContext = createContext<TimeEntriesContextType | undefined>(undefined)

// Calculate duration in minutes from start and end time
const calculateDuration = (startTime: string, endTime: string): number => {
  if (!startTime || !endTime) return 0

  const [startHour, startMin] = startTime.split(":").map(Number)
  const [endHour, endMin] = endTime.split(":").map(Number)

  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin

  return Math.max(0, endMinutes - startMinutes)
}

// Generate comprehensive mock data
const generateMockData = (): TimeEntry[] => {
  const entries: TimeEntry[] = []

  // Today's entries
  const today = new Date().toISOString().split("T")[0]
  entries.push(
    {
      id: "today-1",
      date: today,
      startTime: "08:00",
      endTime: "08:30",
      activity: "Morning routine and planning",
      category: "maintenance",
      duration: 30,
    },
    {
      id: "today-2",
      date: today,
      startTime: "08:30",
      endTime: "10:00",
      activity: "Deep work - Feature development",
      category: "growth",
      duration: 90,
    },
    {
      id: "today-3",
      date: today,
      startTime: "10:00",
      endTime: "10:15",
      activity: "Coffee break",
      category: "maintenance",
      duration: 15,
    },
    {
      id: "today-4",
      date: today,
      startTime: "10:15",
      endTime: "12:00",
      activity: "Client meeting and requirements review",
      category: "growth",
      duration: 105,
    },
  )

  // Generate entries for the past 14 days
  for (let i = 1; i <= 14; i++) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    // Generate 2-5 random entries per day
    const numEntries = Math.floor(Math.random() * 4) + 2

    const activities = [
      { activity: "Morning standup and code review", category: "growth" as const, duration: 90 },
      { activity: "Feature development", category: "growth" as const, duration: 120 },
      { activity: "Bug fixes and testing", category: "growth" as const, duration: 90 },
      { activity: "Documentation writing", category: "growth" as const, duration: 60 },
      { activity: "Learning new technology", category: "growth" as const, duration: 90 },
      { activity: "Code refactoring", category: "growth" as const, duration: 75 },
      { activity: "API development", category: "growth" as const, duration: 105 },
      { activity: "Database optimization", category: "growth" as const, duration: 120 },
      { activity: "Email and admin tasks", category: "maintenance" as const, duration: 30 },
      { activity: "Team meetings", category: "maintenance" as const, duration: 60 },
      { activity: "Sprint planning", category: "maintenance" as const, duration: 90 },
      { activity: "Coffee break", category: "maintenance" as const, duration: 15 },
      { activity: "Lunch break", category: "maintenance" as const, duration: 45 },
      { activity: "Social media scrolling", category: "shrink" as const, duration: 30 },
      { activity: "YouTube videos", category: "shrink" as const, duration: 45 },
      { activity: "Mindless web browsing", category: "shrink" as const, duration: 30 },
      { activity: "Unnecessary meetings", category: "shrink" as const, duration: 60 },
    ]

    let currentTime = 8 * 60 // Start at 8:00 AM (in minutes)

    for (let j = 0; j < numEntries; j++) {
      const randomActivity = activities[Math.floor(Math.random() * activities.length)]
      const startMinutes = currentTime + Math.floor(Math.random() * 60) // Add some random gap
      const endMinutes = startMinutes + randomActivity.duration

      const startTime = `${Math.floor(startMinutes / 60)
        .toString()
        .padStart(2, "0")}:${(startMinutes % 60).toString().padStart(2, "0")}`
      const endTime = `${Math.floor(endMinutes / 60)
        .toString()
        .padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`

      entries.push({
        id: `${date}-${j}`,
        date,
        startTime,
        endTime,
        activity: randomActivity.activity,
        category: randomActivity.category,
        duration: randomActivity.duration,
      })

      currentTime = endMinutes + 15 // Add 15 minute gap between activities
    }
  }

  return entries
}

export function TimeEntriesProvider({ children }: { children: ReactNode }) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])

  // Initialize with mock data
  useEffect(() => {
    setTimeEntries(generateMockData())
  }, [])

  const addTimeEntry = (entry: Omit<TimeEntry, "id" | "duration">) => {
    const duration = calculateDuration(entry.startTime, entry.endTime)
    const newEntry: TimeEntry = {
      ...entry,
      id: Date.now().toString(),
      duration,
    }
    setTimeEntries((prev) => [...prev, newEntry])
  }

  const updateTimeEntry = (id: string, updates: Partial<Omit<TimeEntry, "id">>) => {
    setTimeEntries((prev) =>
      prev.map((entry) => {
        if (entry.id === id) {
          const updatedEntry = { ...entry, ...updates }
          // Recalculate duration if start or end time changed
          if (updates.startTime || updates.endTime) {
            updatedEntry.duration = calculateDuration(updatedEntry.startTime, updatedEntry.endTime)
          }
          return updatedEntry
        }
        return entry
      }),
    )
  }

  const deleteTimeEntry = (id: string) => {
    setTimeEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  const getEntriesForDate = (date: string) => {
    return timeEntries.filter((entry) => entry.date === date)
  }

  const getEntriesForDateRange = (startDate: Date, endDate: Date) => {
    return timeEntries.filter((entry) => {
      const entryDate = new Date(entry.date)
      return entryDate >= startDate && entryDate <= endDate
    })
  }

  return (
    <TimeEntriesContext.Provider
      value={{
        timeEntries,
        addTimeEntry,
        updateTimeEntry,
        deleteTimeEntry,
        getEntriesForDate,
        getEntriesForDateRange,
      }}
    >
      {children}
    </TimeEntriesContext.Provider>
  )
}

export function useTimeEntries() {
  const context = useContext(TimeEntriesContext)
  if (context === undefined) {
    throw new Error("useTimeEntries must be used within a TimeEntriesProvider")
  }
  return context
}
