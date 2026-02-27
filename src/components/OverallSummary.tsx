"use client"

import { useState, useMemo } from "react"
import { Task } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { TrendingUp } from "lucide-react"
import { 
  subDays, 
  subMonths, 
  subYears, 
  isWithinInterval, 
  parseISO, 
  startOfDay, 
  endOfDay 
} from "date-fns"

interface OverallSummaryProps {
  tasks: Task[]
}

type FilterType = "weekly" | "monthly" | "yearly" | "custom"

export function OverallSummary({ tasks }: OverallSummaryProps) {
  const [filter, setFilter] = useState<FilterType>("weekly")
  const [customStart, setCustomStart] = useState<string>("")
  const [customEnd, setCustomEnd] = useState<string>("")

  const filteredStats = useMemo(() => {
    const now = new Date()
    let start: Date
    let end: Date = endOfDay(now)

    if (filter === "weekly") {
      start = startOfDay(subDays(now, 7))
    } else if (filter === "monthly") {
      start = startOfDay(subMonths(now, 1))
    } else if (filter === "yearly") {
      start = startOfDay(subYears(now, 1))
    } else {
      // Custom
      if (!customStart || !customEnd) {
        return { completed: 0, pending: 0, total: 0 }
      }
      try {
        start = startOfDay(parseISO(customStart))
        end = endOfDay(parseISO(customEnd))
      } catch {
        return { completed: 0, pending: 0, total: 0 }
      }
    }

    const filtered = tasks.filter(task => {
      try {
        const taskDate = parseISO(task.date)
        return isWithinInterval(taskDate, { start, end })
      } catch {
        return false
      }
    })

    const completed = filtered.filter(t => t.completed).length
    const pending = filtered.length - completed

    return {
      completed,
      pending,
      total: filtered.length
    }
  }, [tasks, filter, customStart, customEnd])

  const progress = filteredStats.total > 0 
    ? Math.round((filteredStats.completed / filteredStats.total) * 100) 
    : 0

  return (
    <Card className="border-none shadow-none bg-accent/5 overflow-hidden rounded-none sm:rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-accent uppercase tracking-wider">
          <TrendingUp className="h-5 w-5" /> Overall Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Range Filter</Label>
          <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
            <SelectTrigger className="h-10 bg-background/50 border-none shadow-none focus:ring-accent/20">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Last 7 Days</SelectItem>
              <SelectItem value="monthly">Last 30 Days</SelectItem>
              <SelectItem value="yearly">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filter === "custom" && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="space-y-1">
              <Label className="text-[9px] uppercase text-muted-foreground">Start Date</Label>
              <Input 
                type="date" 
                value={customStart} 
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-9 text-sm bg-background/50 border-none focus-visible:ring-accent/20"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] uppercase text-muted-foreground">End Date</Label>
              <Input 
                type="date" 
                value={customEnd} 
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-9 text-sm bg-background/50 border-none focus-visible:ring-accent/20"
              />
            </div>
          </div>
        )}

        <div className="pt-2 space-y-5">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-muted-foreground">Total Completion</span>
            <span className="text-2xl font-black text-accent">{progress}%</span>
          </div>
          
          <div className="h-3 w-full bg-accent/10 rounded-full overflow-hidden">
             <div 
              className="h-full bg-accent transition-all duration-700 ease-out" 
              style={{ width: `${progress}%` }} 
             />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background/80 p-4 rounded-xl border border-accent/5 shadow-sm">
              <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Total Done</p>
              <p className="text-3xl font-black text-accent">{filteredStats.completed}</p>
            </div>
            <div className="bg-background/80 p-4 rounded-xl border border-primary/5 shadow-sm">
              <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Total Pending</p>
              <p className="text-3xl font-black text-primary">{filteredStats.pending}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
