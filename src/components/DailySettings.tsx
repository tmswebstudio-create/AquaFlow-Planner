"use client"

import { DailySchedule } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Sun, Moon } from "lucide-react"

interface DailySettingsProps {
  schedule: DailySchedule
  onScheduleChange: (schedule: DailySchedule) => void
}

export function DailySettings({ schedule, onScheduleChange }: DailySettingsProps) {
  const handleChange = (key: keyof DailySchedule, value: string) => {
    onScheduleChange({ ...schedule, [key]: value })
  }

  return (
    <Card className="border-none shadow-sm bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary uppercase tracking-wider">
          Daily Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="wakeUp" className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
            <Sun className="h-3 w-3" /> Wake-up
          </Label>
          <Input 
            id="wakeUp"
            type="time" 
            value={schedule.wakeUpTime} 
            onChange={(e) => handleChange("wakeUpTime", e.target.value)}
            className="h-9 text-sm border-none shadow-none focus-visible:ring-primary/20 bg-background/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sleep" className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
            <Moon className="h-3 w-3" /> Sleep
          </Label>
          <Input 
            id="sleep"
            type="time" 
            value={schedule.sleepTime} 
            onChange={(e) => handleChange("sleepTime", e.target.value)}
            className="h-9 text-sm border-none shadow-none focus-visible:ring-primary/20 bg-background/50"
          />
        </div>
      </CardContent>
    </Card>
  )
}