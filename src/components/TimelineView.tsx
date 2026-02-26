"use client"

import { DailySchedule, Task } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TimelineViewProps {
  schedule: DailySchedule
  tasks: Task[]
}

export function TimelineView({ schedule, tasks }: TimelineViewProps) {
  // Convert time string to minutes for percentage calculation
  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number)
    return h * 60 + m
  }

  const start = toMinutes(schedule.wakeUpTime)
  const end = toMinutes(schedule.sleepTime)
  const duration = end > start ? end - start : (1440 - start) + end

  const timedTasks = tasks.filter(t => t.time)

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">
        <span>{schedule.wakeUpTime}</span>
        <span>Daily Flow</span>
        <span>{schedule.sleepTime}</span>
      </div>
      <div className="relative h-6 w-full bg-secondary rounded-full overflow-hidden border border-border shadow-inner">
        {/* Progress Fill */}
        <div 
          className="absolute h-full bg-primary/20 transition-all"
          style={{ left: 0, width: "100%" }}
        />
        
        {/* Task Markers */}
        {timedTasks.map(task => {
          const taskTime = toMinutes(task.time!)
          let relativePos = 0
          
          if (end > start) {
            relativePos = ((taskTime - start) / duration) * 100
          } else {
            // Over midnight
            if (taskTime >= start) {
              relativePos = ((taskTime - start) / duration) * 100
            } else {
              relativePos = (((1440 - start) + taskTime) / duration) * 100
            }
          }

          if (relativePos < 0 || relativePos > 100) return null

          return (
            <div 
              key={task.id}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-white shadow-sm transition-all duration-300",
                task.completed ? "bg-muted" : "bg-primary"
              )}
              style={{ left: `${relativePos}%` }}
              title={`${task.time} - ${task.title}`}
            />
          )
        })}
      </div>
    </div>
  )
}