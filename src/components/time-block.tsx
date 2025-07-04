"use client"

import { useState } from "react"
import { Trash2, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

export interface TimeBlockProps {
  id: string
  startTime?: string
  endTime?: string
  activity?: string
  category?: "growth" | "shrink" | "maintenance"
  onDelete?: (id: string) => void
  onUpdate?: (id: string, data: Partial<TimeBlockData>) => void
}

export interface TimeBlockData {
  startTime: string
  endTime: string
  activity: string
  category: "growth" | "shrink" | "maintenance"
}

const categoryColors = {
  growth: "border-l-green-500 bg-green-50/50",
  shrink: "border-l-red-500 bg-red-50/50",
  maintenance: "border-l-blue-500 bg-blue-50/50",
}

export function TimeBlock({
  id,
  startTime = "",
  endTime = "",
  activity = "",
  category,
  onDelete,
  onUpdate,
}: TimeBlockProps) {
  const [data, setData] = useState<TimeBlockData>({
    startTime,
    endTime,
    activity,
    category: category || "maintenance",
  })

  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleUpdate = (field: keyof TimeBlockData, value: string) => {
    const newData = { ...data, [field]: value }
    setData(newData)
    onUpdate?.(id, newData)
  }

  return (
    <Card className={`border-l-4 ${categoryColors[data.category]} transition-all hover:shadow-md`}>
      <CardContent className="">
        <div className="flex items-start gap-2 md:gap-4">
          <div className="flex-shrink-0 mt-2 flex flex-col gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>

          <div className="flex-1 min-w-0">
            {/* Collapsed View - Time Frame Only */}
            {isCollapsed ? (
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 md:gap-4 min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium flex-shrink-0">
                    <span>{data.startTime || "--:--"}</span>
                    <span className="text-muted-foreground">→</span>
                    <span>{data.endTime || "--:--"}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${data.category === "growth"
                          ? "bg-green-500"
                          : data.category === "shrink"
                            ? "bg-red-500"
                            : "bg-blue-500"
                        }`}
                    />
                    <span className="text-sm text-muted-foreground truncate">{data.activity || "No activity"}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(id)}
                  className="text-muted-foreground hover:text-destructive h-6 w-6 p-0 flex-shrink-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              /* Expanded View - Full Form */
              <div className="space-y-3 md:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`start-${id}`} className="text-sm font-medium">
                      Start Time
                    </Label>
                    <Input
                      id={`start-${id}`}
                      type="time"
                      value={data.startTime}
                      onChange={(e) => handleUpdate("startTime", e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`end-${id}`} className="text-sm font-medium">
                      End Time
                    </Label>
                    <Input
                      id={`end-${id}`}
                      type="time"
                      value={data.endTime}
                      onChange={(e) => handleUpdate("endTime", e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-3 md:w-full">
                  <div className="space-y-2 md:w-3/4">
                    <Label htmlFor={`activity-${id}`} className="text-sm font-medium">
                      Activity Description
                    </Label>
                    <Input
                      id={`activity-${id}`}
                      placeholder="What did you work on?"
                      value={data.activity}
                      onChange={(e) => handleUpdate("activity", e.target.value)}
                      className=""
                    />
                    </div>
                    <div className="space-y-2 md:w-1/4">
                      <Label className="text-sm font-medium">Category</Label>
                      <Select
                        value={data.category}
                        onValueChange={(value: "growth" | "shrink" | "maintenance") => handleUpdate("category", value)}
                      >
                        <SelectTrigger className="w-full  ">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="growth">
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500" />
                              Growth
                            </span>
                          </SelectItem>
                          <SelectItem value="maintenance">
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500" />
                              Maintenance
                            </span>
                          </SelectItem>
                          <SelectItem value="shrink">
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500" />
                              Shrink
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">


                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(id)}
                    className="text-muted-foreground hover:text-destructive self-start sm:self-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
