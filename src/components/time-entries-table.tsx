"use client"

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { useTimeEntries, type TimeEntry } from "@/contexts/time-entries-context"

interface TimeEntriesTableProps {
  data: TimeEntry[]
  viewType: "day" | "week" | "month"
}

const categoryColors = {
  growth: "bg-green-100 text-green-800 hover:bg-green-200",
  maintenance: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  shrink: "bg-red-100 text-red-800 hover:bg-red-200",
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
  })
}

// Mobile card component for entries
function MobileEntryCard({ entry, onDelete }: { entry: TimeEntry; onDelete: (id: string) => void }) {
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this time entry?")) {
      onDelete(entry.id)
    }
  }

  return (
    <Card className="mb-3">
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={categoryColors[entry.category]}>
                {entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}
              </Badge>
              <span className="text-sm font-medium">{formatDuration(entry.duration)}</span>
            </div>

            <div className="space-y-1">
              <div className="font-mono text-sm text-muted-foreground">
                {entry.startTime} - {entry.endTime}
              </div>
              <div className="text-sm">{entry.activity}</div>
              <div className="text-xs text-muted-foreground">{formatDate(entry.date)}</div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit entry
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete entry
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

export function TimeEntriesTable({ data, viewType }: TimeEntriesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const { deleteTimeEntry } = useTimeEntries()

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this time entry?")) {
      deleteTimeEntry(id)
    }
  }

  const columns: ColumnDef<TimeEntry>[] = [
    ...(viewType !== "day"
      ? [
          {
            accessorKey: "date",
            header: ({ column }: any) => {
              return (
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                  className="h-auto p-0 font-semibold"
                >
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              )
            },
            cell: ({ row }: any) => <div className="font-medium">{formatDate(row.getValue("date"))}</div>,
          },
        ]
      : []),
    {
      accessorKey: "startTime",
      header: ({ column }: any) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }: any) => (
        <div className="font-mono text-sm">
          {row.getValue("startTime")} - {row.original.endTime}
        </div>
      ),
    },
    {
      accessorKey: "activity",
      header: ({ column }: any) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Activity
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }: any) => <div className="max-w-[200px] md:max-w-[300px] truncate">{row.getValue("activity")}</div>,
    },
    {
      accessorKey: "category",
      header: ({ column }: any) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Category
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }: any) => {
        const category = row.getValue("category") as keyof typeof categoryColors
        return (
          <Badge className={categoryColors[category]}>
            <span className="hidden sm:inline">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
            <span className="sm:hidden">{category.charAt(0).toUpperCase()}</span>
          </Badge>
        )
      },
    },
    {
      accessorKey: "duration",
      header: ({ column }: any) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            <span className="hidden sm:inline">Duration</span>
            <span className="sm:hidden">Time</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }: any) => <div className="font-medium">{formatDuration(row.getValue("duration"))}</div>,
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit entry
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(row.original.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete entry
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  })

  const filteredData = table.getFilteredRowModel().rows.map((row) => row.original)

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} of {data.length} entries
        </div>
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-3">
        {filteredData.length > 0 ? (
          filteredData.map((entry) => <MobileEntryCard key={entry.id} entry={entry} onDelete={deleteTimeEntry} />)
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No time entries found.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getFilteredRowModel().rows?.length ? (
              table.getFilteredRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No time entries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
