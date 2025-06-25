"use client"

import { Sparkles, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface AISuggestionCardProps {
  suggestion: string
  onAccept?: () => void
  onDismiss?: () => void
}

export function AISuggestionCard({ suggestion, onAccept, onDismiss }: AISuggestionCardProps) {
  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader className="pb-2 md:pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-purple-100">
              <Sparkles className="h-3 w-3 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-900">AI Suggestion</span>
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
        <p className="text-sm text-purple-800 mb-3 md:mb-4">{suggestion}</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            size="sm"
            onClick={onAccept}
            className="bg-purple-600 hover:bg-purple-700 text-white flex-1 sm:flex-none"
          >
            <Check className="h-3 w-3 mr-1" />
            Apply
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDismiss}
            className="border-purple-200 text-purple-700 hover:bg-purple-50 flex-1 sm:flex-none"
          >
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
