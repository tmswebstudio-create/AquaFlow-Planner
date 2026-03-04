
"use client"

import { useRef, useState, useEffect } from "react"
import { Task, SubTask, TaskLink } from "@/lib/types"
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
  CalendarDays,
  ChevronLeft,
  ChevronRight
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

function SubtaskLinksCarousel({ links }: { links: TaskLink[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showArrows, setShowArrows] = useState(false)

  const checkArrows = () => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current
      setShowArrows(scrollWidth > clientWidth)
    }
  }

  useEffect(() => {
    checkArrows()
    window.addEventListener('resize', checkArrows)
    return () => window.removeEventListener('resize', checkArrows)
  }, [links])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 150
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="relative group/carousel w-full mt-1.5 pl-6">
      {showArrows && (
        <>
          <button 
            onClick={() => scroll('left')}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/90 border rounded-full p-0.5 shadow-sm opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-3 w-3 text-muted-foreground" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 border rounded-full p-0.5 shadow-sm opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          </button>
        </>
      )}
      <div 
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1"
      >
        {links.map((link, idx) => (
          <a 
            key={idx}
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 shrink-0 bg-primary/5 text-primary text-[10px] px-2 py-0.5 rounded-full border border-primary/10 hover:bg-primary/10 transition-colors"
          >
            <LinkIcon className="h-2.5 w-2.5" />
            <span className="max-w-[120px] truncate">{link.title}</span>
            <ExternalLink className="h-2 w-2 opacity-50" />
          </a>
        ))}
      </div>
    </div>
  )
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
        "flex flex-col group/sub bg-background/50 p-2 rounded-lg border border-transparent transition-all",
        isDragging && "shadow-md bg-white border-primary/20 scale-[1.01]"
      )}
    >
      <div className="flex items-center gap-2.5">
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
            "text-base transition-colors leading-tight",
            sub.completed ? "line-through text-muted-foreground/60" : "text-foreground/80 font-bold"
          )}>
            {sub.title}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onDelete(sub.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 opacity-0 group-hover/sub:opacity-100 transition-opacity"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {sub.links && sub.links.length > 0 && (
        <SubtaskLinksCarousel links={sub.links} />
      )}
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
