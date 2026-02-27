
"use client"

import { useState, useMemo, useEffect } from "react"
import { Task, DailySchedule } from "@/lib/types"
import { DailySettings } from "@/components/DailySettings"
import { AddTaskDialog } from "@/components/AddTaskDialog"
import { TaskItem } from "@/components/TaskItem"
import { TimelineView } from "@/components/TimelineView"
import { OverallSummary } from "@/components/OverallSummary"
import { Button } from "@/components/ui/button"
import { 
  Calendar as CalendarIcon, 
  Layers, 
  Layout, 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  LogOut,
  User as UserIcon,
  Plus
} from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { format, addDays, isSameDay, subDays, startOfDay } from "date-fns"
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useDoc, 
  useMemoFirebase,
  useAuth 
} from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { 
  updateDocumentNonBlocking, 
  deleteDocumentNonBlocking,
  setDocumentNonBlocking 
} from "@/firebase/non-blocking-updates"
import { useRouter } from "next/navigation"

export default function AquaFlowPlanner() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const auth = useAuth()
  const router = useRouter()
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewDate, setViewDate] = useState<Date>(new Date())
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login")
    }
  }, [user, isUserLoading, router])

  const dateKey = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate])

  const prefRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid, "preferences", "profile")
  }, [db, user])
  
  const { data: prefData } = useDoc<DailySchedule & { [key: string]: DailySchedule }>(prefRef)

  const currentSchedule = useMemo(() => {
    if (prefData && prefData[dateKey]) {
      return prefData[dateKey]
    }
    return { wakeUpTime: "07:00", sleepTime: "22:00" }
  }, [prefData, dateKey])

  const tasksRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, "users", user.uid, "tasks")
  }, [db, user])

  const { data: tasksData, isLoading: isTasksLoading } = useCollection<Task>(tasksRef)
  const tasks = useMemo(() => tasksData || [], [tasksData])

  const handleAddTask = (taskData: Omit<Task, "id" | "createdAt" | "completed">) => {
    if (!db || !user) return
    const newTaskRef = doc(collection(db, "users", user.uid, "tasks"))
    setDocumentNonBlocking(newTaskRef, {
      ...taskData,
      id: newTaskRef.id,
      completed: false,
      ownerId: user.uid,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }, { merge: true })
  }

  const handleToggleTask = (id: string) => {
    if (!db || !user) return
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const docRef = doc(db, "users", user.uid, "tasks", id)
    updateDocumentNonBlocking(docRef, { 
      completed: !task.completed,
      updatedAt: Date.now()
    })
  }

  const handleDeleteTask = (id: string) => {
    if (!db || !user) return
    const docRef = doc(db, "users", user.uid, "tasks", id)
    deleteDocumentNonBlocking(docRef)
  }

  const handleScheduleChange = (newSchedule: DailySchedule) => {
    if (!prefRef || !user) return
    setDocumentNonBlocking(prefRef, {
      id: "profile",
      [dateKey]: newSchedule,
      wakeUpTime: newSchedule.wakeUpTime,
      sleepTime: newSchedule.sleepTime
    }, { merge: true })
  }

  const handlePrevWeek = () => setViewDate(prev => subDays(prev, 7))
  const handleNextWeek = () => setViewDate(prev => addDays(prev, 7))

  const dailyTasks = useMemo(() => {
    return tasks
      .filter(t => t.date === dateKey)
      .sort((a, b) => {
        if (a.time && b.time) return a.time.localeCompare(b.time)
        if (a.time) return -1
        if (b.time) return 1
        return (a.createdAt || 0) - (b.createdAt || 0)
      })
  }, [tasks, dateKey])

  const pendingTasks = useMemo(() => dailyTasks.filter(t => !t.completed), [dailyTasks])
  const completedTasks = useMemo(() => dailyTasks.filter(t => t.completed), [dailyTasks])

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(viewDate, i - 3))
  }, [viewDate])

  if (!isMounted || isUserLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Layout className="h-12 w-12 text-primary/20" />
          <p className="text-muted-foreground text-sm font-medium">Flowing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-30 px-4 md:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-primary p-1.5 md:p-2 rounded-xl shadow-lg shadow-primary/20">
              <Layout className="text-white h-5 w-5 md:h-6 md:w-6" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-primary">
              AquaFlow<span className="text-accent hidden sm:inline">Planner</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 md:h-10 md:w-10 text-accent hover:bg-accent/10">
                  <BarChart3 className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-none shadow-2xl bg-white">
                <DialogHeader className="sr-only">
                  <DialogTitle>Overall Performance Summary</DialogTitle>
                </DialogHeader>
                <OverallSummary tasks={tasks} />
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 md:h-10 md:w-10 rounded-full p-0 overflow-hidden border border-border/50">
                  <Avatar className="h-9 w-9 md:h-10 md:w-10">
                    <AvatarImage src={user.photoURL || ""} alt={user.email || "User"} />
                    <AvatarFallback className="bg-secondary text-primary">
                      {user.email ? user.email.substring(0, 2).toUpperCase() : <UserIcon className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">Account</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                  onClick={() => auth.signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          <div className="lg:col-span-4 space-y-6">
            <DailySettings schedule={currentSchedule} onScheduleChange={handleScheduleChange} />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-widest">
                  <CalendarIcon className="h-4 w-4" /> Calendar
                </h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevWeek}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextWeek}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {weekDays.map((date) => {
                  const isActive = isSameDay(date, selectedDate)
                  const isToday = isSameDay(date, new Date())
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all border",
                        isActive 
                          ? "bg-primary text-white border-primary shadow-md scale-105" 
                          : "bg-white text-muted-foreground border-transparent hover:border-primary/20",
                        isToday && !isActive && "text-primary font-bold bg-primary/5 border-primary/10"
                      )}
                    >
                      <span className="text-[10px] uppercase font-bold opacity-70">
                        {format(date, "EEE")}
                      </span>
                      <span className="text-base font-bold">
                        {format(date, "d")}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-border/50 hidden lg:block">
              <h3 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest">Daily Progress</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Completion Rate</span>
                  <span className="font-bold text-accent">
                    {dailyTasks.length > 0 ? Math.round((completedTasks.length / dailyTasks.length) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-accent transition-all duration-500 ease-out" 
                    style={{ width: `${dailyTasks.length > 0 ? (completedTasks.length / dailyTasks.length) * 100 : 0}%` }} 
                   />
                </div>
                <div className="flex gap-3 pt-2">
                  <div className="flex-1 bg-accent/5 p-3 rounded-xl border border-accent/10">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Done</p>
                    <p className="text-xl font-bold text-accent">{completedTasks.length}</p>
                  </div>
                  <div className="flex-1 bg-primary/5 p-3 rounded-xl border border-primary/10">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Pending</p>
                    <p className="text-xl font-bold text-primary">{pendingTasks.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
                  {isSameDay(selectedDate, new Date()) ? "Today's Flow" : format(selectedDate, "MMMM do")}
                </h2>
                <p className="text-sm text-muted-foreground">Plan your flow for {format(selectedDate, "EEEE")}.</p>
              </div>
              <AddTaskDialog onAdd={handleAddTask} defaultDate={dateKey} />
            </div>

            <TimelineView schedule={currentSchedule} tasks={dailyTasks} />

            <div className="space-y-4">
              {dailyTasks.length > 0 ? (
                <div className="grid gap-4">
                  {pendingTasks.map(task => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onToggle={handleToggleTask} 
                      onDelete={handleDeleteTask}
                    />
                  ))}

                  {completedTasks.length > 0 && (
                    <div className="space-y-3 pt-4">
                      <div className="flex items-center gap-3 px-1">
                        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">
                          Completed
                        </span>
                        <div className="h-px bg-border/60 flex-1" />
                      </div>
                      <div className="grid gap-3 opacity-75">
                        {completedTasks.map(task => (
                          <TaskItem 
                            key={task.id} 
                            task={task} 
                            onToggle={handleToggleTask} 
                            onDelete={handleDeleteTask}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-6 bg-white rounded-3xl border border-dashed border-muted-foreground/20 text-center">
                  <div className="bg-secondary/50 p-4 rounded-full mb-4">
                    <Layers className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-bold text-muted-foreground">Your flow is empty</h3>
                  <p className="text-sm text-muted-foreground/60 mt-1 max-w-xs">
                    Start your journey by adding a task for this date.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <footer className="bg-white border-t py-6 px-4 text-center text-xs text-muted-foreground mt-auto">
        <p>© {new Date().getFullYear()} AquaFlow Planner • Performance Optimized</p>
      </footer>
    </div>
  )
}
