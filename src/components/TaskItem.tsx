
"use client"

import { Task, SubTask } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { 
  ExternalLink, 
  Clock, 
  Trash2, 
  Pencil, 
  GripVertical, 
  Link as LinkIcon,
  CalendarDays
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AddTaskDialog } from "./AddTaskDialog"
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { format } from "date-fns"

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Task>) => void
  onMoveToToday?: () => void
}

interface SortableSubtaskItemProps {
  sub: SubTask
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

function SortableSubtaskItem({ sub, onToggle, onDelete }: SortableSubtaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sub.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "flex items-center gap-2.5 group/sub bg-background/50 p-1.5 rounded-lg border border-transparent transition-all",
        isDragging && "shadow-md bg-white border-primary/20 scale-[1.01]"
      )}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </div>
      <Checkbox 
        checked={sub.completed} 
        onCheckedChange={() => onToggle(sub.id)}
        className="h-4 w-4 rounded-sm"
      />
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className={cn(
          "text-sm transition-colors",
          sub.completed ? "line-through text-muted-foreground/60" : "text-foreground/80 font-medium"
        )}>
          {sub.title}
        </span>
        {sub.url && (
          <a 
            href={sub.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/70 transition-colors"
            title="Visit Link"
          >
            <LinkIcon className="h-3 w-3" />
          </a>
        )}
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => onDelete(sub.id)}
        className="h-6 w-6 opacity-0 group-hover/sub:opacity-100 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function TaskItem({ task, onToggle, onDelete, onUpdate, onMoveToToday }: TaskItemProps) {
  const todayKey = format(new Date(), "yyyy-MM-dd")
  const isCurrentlyToday = task.date === todayKey

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

  const handleToggleSubtask = (subtaskId: string) => {
    if (!task.subtasks) return;
    const updatedSubtasks = task.subtasks.map(s => 
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    onUpdate(task.id, { subtasks: updatedSubtasks });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (!task.subtasks) return;
    const updatedSubtasks = task.subtasks.filter(s => s.id !== subtaskId);
    onUpdate(task.id, { subtasks: updatedSubtasks });
  };

  const handleSubtaskDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && task.subtasks) {
      const oldIndex = task.subtasks.findIndex((s) => s.id === active.id);
      const newIndex = task.subtasks.findIndex((s) => s.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedSubtasks = arrayMove(task.subtasks, oldIndex, newIndex);
        onUpdate(task.id, { subtasks: reorderedSubtasks });
      }
    }
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

              {task.date && (
                <span className="flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 rounded italic">
                  {task.date}
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

            {task.subtasks && task.subtasks.length > 0 && (
              <div className="mt-4 space-y-1.5 border-t pt-3 border-border/40">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleSubtaskDragEnd}
                >
                  <SortableContext
                    items={task.subtasks.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {task.subtasks.map((sub) => (
                      <SortableSubtaskItem 
                        key={sub.id} 
                        sub={sub} 
                        onToggle={handleToggleSubtask} 
                        onDelete={handleDeleteSubtask}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>

          <div className="flex items-center self-center md:self-start gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            {onMoveToToday && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onMoveToToday}
                className={cn(
                  "h-8 w-8 transition-colors",
                  isCurrentlyToday ? "text-accent hover:bg-accent/10" : "text-muted-foreground hover:text-accent hover:bg-accent/10"
                )}
                title={isCurrentlyToday ? "Move to Overdue" : "Move to Today"}
              >
                <CalendarDays className="h-4 w-4" />
              </Button>
            )}
            <AddTaskDialog 
              task={task} 
              onUpdate={onUpdate}
              trigger={
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
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
