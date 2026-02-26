"use client"

import { useState, useMemo, useEffect } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Task, DailySchedule } from "@/lib/types"
import { DailySettings } from "@/components/DailySettings"
import { AddTaskDialog } from "@/components/AddTaskDialog"
import { TaskItem } from "@/components/TaskItem"
import { TimelineView } from "@/components/TimelineView"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Filter, Layers, Layout, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, addDays, isSameDay, subDays } from "date-fns"

export default function AquaFlowPlanner() {
  const [isClient, setIsClient] = useState(false)
  const [tasks, setTasks] = useLocalStorage<Task[]>("aquaflow_tasks", [])
  const [schedule, setSchedule] = useLocalStorage<DailySchedule>("aquaflow_schedule", {
    wakeUpTime: "07:00",
    sleepTime: "22:00"
  })
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewDate, setViewDate] = useState<Date>(new Date())
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">("all")

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleAddTask = (taskData: Omit<Task, "id" | "createdAt" | "completed">) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: Date.now()
    }
    setTasks([...tasks, newTask])
  }

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const handlePrevWeek = () => {
    setViewDate(prev => subDays(prev, 7))
  }

  const handleNextWeek = () => {
    setViewDate(prev => addDays(prev, 7))
  }

  const filteredTasks = useMemo(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd")
    return tasks
      .filter(t => t.date === dateStr)
      .filter(t => {
        if (filter === "completed") return t.completed
        if (filter === "incomplete") return !t.completed
        return true
      })
      .sort((a, b) => {
        if (a.time && b.time) return a.time.localeCompare(b.time)
        if (a.time) return -1
        if (b.time) return 1
        return a.createdAt - b.createdAt
      })
  }, [tasks, selectedDate, filter])

  // Week view generation based on viewDate
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      return addDays(viewDate, i - 3) // Center on viewDate
    })
  }, [viewDate])

  if (!isClient) return null

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
              <Layout className="text-white h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              AquaFlow<span className="text-accent">Planner</span>
            </h1>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <div className="flex bg-secondary p-1 rounded-lg">
              {(["all", "incomplete", "completed"] as const).map((f) => (
                <Button
                  key={f}
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter(f)}
                  className={cn(
                    "capitalize text-xs font-semibold px-4 h-8 rounded-md transition-all",
                    filter === f ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {f}
                </Button>
              ))}
            </div>
            <AddTaskDialog onAdd={handleAddTask} defaultDate={format(selectedDate, "yyyy-MM-dd")} />
          </div>
          
          {/* Mobile Add Button */}
          <div className="md:hidden">
             <AddTaskDialog onAdd={handleAddTask} defaultDate={format(selectedDate, "yyyy-MM-dd")} />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar / Left Column */}
          <div className="lg:col-span-4 space-y-6">
            <DailySettings schedule={schedule} onScheduleChange={setSchedule} />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                  <CalendarIcon className="h-4 w-4" /> Calendar
                </h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePrevWeek}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNextWeek}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((date) => {
                  const isActive = isSameDay(date, selectedDate)
                  const isToday = isSameDay(date, new Date())
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 border",
                        isActive 
                          ? "bg-primary text-white border-primary shadow-md scale-110 z-10" 
                          : "bg-white text-muted-foreground border-transparent hover:border-primary/30",
                        isToday && !isActive && "text-primary font-bold bg-primary/5 border-primary/10"
                      )}
                    >
                      <span className="text-[10px] uppercase font-bold opacity-70">
                        {format(date, "EEE")}
                      </span>
                      <span className="text-lg font-bold">
                        {format(date, "d")}
                      </span>
                    </button>
                  )
                })}
              </div>
              <p className="text-center text-xs text-muted-foreground italic">
                Focusing on: {format(selectedDate, "MMMM do, yyyy")}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50">
              <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Daily Progress</span>
                  <span className="text-sm font-bold text-primary">
                    {filteredTasks.length > 0 
                      ? Math.round((filteredTasks.filter(t => t.completed).length / filteredTasks.length) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-primary transition-all duration-500 ease-out" 
                    style={{ 
                      width: `${filteredTasks.length > 0 ? (filteredTasks.filter(t => t.completed).length / filteredTasks.length) * 100 : 0}%` 
                    }} 
                   />
                </div>
                <div className="flex gap-4 pt-2">
                  <div className="flex-1 bg-primary/5 p-3 rounded-xl border border-primary/10">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Done</p>
                    <p className="text-xl font-bold text-primary">{filteredTasks.filter(t => t.completed).length}</p>
                  </div>
                  <div className="flex-1 bg-accent/5 p-3 rounded-xl border border-accent/10">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Pending</p>
                    <p className="text-xl font-bold text-accent">{filteredTasks.filter(t => !t.completed).length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-foreground flex items-center gap-3">
                  {isSameDay(selectedDate, new Date()) ? "Today's Flow" : "Daily Planner"}
                </h2>
                <p className="text-muted-foreground">Manage your tasks for {format(selectedDate, "EEEE")}.</p>
              </div>

              {/* Mobile Only Filter Switch */}
              <div className="md:hidden flex bg-secondary p-1 rounded-lg w-fit">
                {(["all", "incomplete", "completed"] as const).map((f) => (
                  <Button
                    key={f}
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilter(f)}
                    className={cn(
                      "capitalize text-[10px] font-semibold px-3 h-7 rounded-md",
                      filter === f ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
                    )}
                  >
                    {f}
                  </Button>
                ))}
              </div>
            </div>

            <TimelineView schedule={schedule} tasks={filteredTasks} />

            <div className="space-y-3">
              {filteredTasks.length > 0 ? (
                <div className="grid gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {filteredTasks.map(task => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onToggle={handleToggleTask} 
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-3xl border border-dashed border-muted-foreground/20 text-center">
                  <div className="bg-secondary p-4 rounded-full mb-4">
                    <Layers className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-bold text-muted-foreground">No tasks scheduled</h3>
                  <p className="text-sm text-muted-foreground/60 max-w-[250px] mt-1">
                    Your flow is empty for this date. Add a new task to get started!
                  </p>
                  <div className="mt-6">
                    <AddTaskDialog onAdd={handleAddTask} defaultDate={format(selectedDate, "yyyy-MM-dd")} />
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <footer className="bg-white border-t py-8 px-6 text-center text-muted-foreground">
        <p className="text-sm">© {new Date().getFullYear()} AquaFlow Planner. Stay in the flow.</p>
      </footer>
    </div>
  )
}
