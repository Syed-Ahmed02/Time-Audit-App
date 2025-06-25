"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Clock } from "lucide-react"

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-14 items-center px-4">
        <SidebarTrigger className="mr-3" />
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Clock className="h-3 w-3" />
          </div>
          <span className="font-semibold">TimeTracker</span>
        </div>
      </div>
    </header>
  )
}
