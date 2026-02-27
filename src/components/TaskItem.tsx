
"use client"

import { Task } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ExternalLink, Clock, Trash2, Pencil, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { AddTaskDialog } from "./AddTaskDialog"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Task>) => void
}

export function TaskItem({ task, onToggle, onDelete, onUpdate }: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={cn(
        "p-3 md:p-4 transition-all duration-200 group border-l-4",
        task.completed ? "opacity-60 border-l-muted bg-muted/20" : "border-l-primary hover:shadow-sm",
        isDragging && "shadow-2xl scale-[1.02] opacity-50 ring-2 ring-primary/20"
      )}>
        <div className="flex items-start gap-2 md:gap-3">
          <div 
            {...attributes} 
            {...listeners} 
            className="pt-1.5 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition-colors"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          <div className="pt-1">
            <Checkbox 
              checked={task.completed} 
              onCheckedChange={() => onToggle(task.id)}
              className="h-5 w-5 rounded-full border-2 transition-colors data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "text-sm md:text-base font-semibold transition-all duration-200 leading-tight",
              task.completed && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h4>
            
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2 text-[10px] md:text-xs text-muted-foreground">
              {task.time && (
                <span className="flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 rounded">
                  <Clock className="h-3 w-3" />
                  {task.time}
                </span>
              )}
              
              {task.links && task.links.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {task.links.map((link, idx) => (
                    <a 
                      key={idx}
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline font-medium bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10 transition-colors hover:bg-primary/10"
                    >
                      <ExternalLink className="h-2.5 w-2.5" />
                      {link.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center self-center md:self-start gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <AddTaskDialog 
              task={task} 
              onUpdate={onUpdate}
              trigger={
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 w-8"
                >
                  < Pencil className="h-4 w-4" />
                </Button>
              }
            />
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
    </div>
  )
}
