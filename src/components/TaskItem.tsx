"use client"

import { Task } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ExternalLink, Clock, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <Card className={cn(
      "p-4 transition-all duration-300 group hover:shadow-md border-l-4",
      task.completed ? "opacity-60 border-l-muted bg-muted/30" : "border-l-primary"
    )}>
      <div className="flex items-start gap-4">
        <div className="pt-1">
          <Checkbox 
            checked={task.completed} 
            onCheckedChange={() => onToggle(task.id)}
            className="h-5 w-5 rounded-full"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "text-base font-semibold transition-all duration-300 truncate",
            task.completed && "line-through text-muted-foreground"
          )}>
            {task.title}
          </h4>
          
          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
            {task.time && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.time}
              </span>
            )}
            {task.link && (
              <a 
                href={task.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Open Resource
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(task.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}