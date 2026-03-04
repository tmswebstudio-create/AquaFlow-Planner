
"use client"

import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X, Link as LinkIcon, CheckCircle2 } from "lucide-react"
import { Task, TaskLink, SubTask } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AddTaskDialogProps {
  onAdd?: (task: Omit<Task, "id" | "createdAt" | "completed" | "updatedAt" | "ownerId">) => void
  onUpdate?: (id: string, updates: Partial<Task>) => void
  task?: Task
  defaultDate?: string
  trigger?: React.ReactNode
}

export function AddTaskDialog({ onAdd, onUpdate, task, defaultDate, trigger }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(task?.title || "")
  const [links, setLinks] = useState<TaskLink[]>(task?.links || [])
  const [subtasks, setSubtasks] = useState<SubTask[]>(task?.subtasks || [])
  
  // Overall task link state
  const [newLinkTitle, setNewLinkTitle] = useState("")
  const [newLinkUrl, setNewLinkUrl] = useState("")
  
  // Subtask creation state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [newSubtaskLinks, setNewSubtaskLinks] = useState<TaskLink[]>([])
  const [newSubtaskLinkTitle, setNewSubtaskLinkTitle] = useState("")
  const [newSubtaskLinkUrl, setNewSubtaskLinkUrl] = useState("")

  const [date, setDate] = useState(task?.date || defaultDate || new Date().toISOString().split("T")[0])
  const [time, setTime] = useState(task?.time || "")
  const [error, setError] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(task?.title || "")
      setLinks(task?.links || [])
      setSubtasks(task?.subtasks || [])
      setDate(task?.date || defaultDate || new Date().toISOString().split("T")[0])
      setTime(task?.time || "")
      setError(false)
      
      setNewSubtaskTitle("")
      setNewSubtaskLinks([])
      setNewSubtaskLinkTitle("")
      setNewSubtaskLinkUrl("")
    }
  }, [open, task, defaultDate])

  const handleAddLink = () => {
    if (newLinkTitle.trim() && newLinkUrl.trim()) {
      setLinks([...links, { title: newLinkTitle.trim(), url: newLinkUrl.trim() }])
      setNewLinkTitle("")
      setNewLinkUrl("")
    }
  }

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index))
  }

  const handleAddLinkToSubtask = () => {
    if (newSubtaskLinkTitle.trim() && newSubtaskLinkUrl.trim()) {
      setNewSubtaskLinks([...newSubtaskLinks, { title: newSubtaskLinkTitle.trim(), url: newSubtaskLinkUrl.trim() }])
      setNewSubtaskLinkTitle("")
      setNewSubtaskLinkUrl("")
    }
  }

  const handleRemoveLinkFromSubtask = (index: number) => {
    setNewSubtaskLinks(newSubtaskLinks.filter((_, i) => i !== index))
  }

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      const subtask: SubTask = { 
        id: Math.random().toString(36).substr(2, 9), 
        title: newSubtaskTitle.trim(), 
        completed: false,
        links: newSubtaskLinks.length > 0 ? [...newSubtaskLinks] : []
      }

      setSubtasks([...subtasks, subtask])
      setNewSubtaskTitle("")
      setNewSubtaskLinks([])
      setNewSubtaskLinkTitle("")
      setNewSubtaskLinkUrl("")
    }
  }

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError(true)
      return
    }

    // Ensure links and subtasks are never undefined when sending to Firestore
    const taskData: any = {
      title: title.trim(),
      date,
      links: links.length > 0 ? links : [],
      subtasks: subtasks.length > 0 ? subtasks : [],
      time: time || ""
    }

    if (task && onUpdate) {
      onUpdate(task.id, taskData)
    } else if (onAdd) {
      onAdd(taskData)
    }
    
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="rounded-full h-10 px-4 md:px-5 gap-1.5 md:gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 md:h-5 md:w-5" /> 
            <span className="hidden sm:inline">New Task</span>
            <span className="sm:hidden">Add</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Task Title *</Label>
            <Input 
              id="title" 
              placeholder="e.g., Quarterly Review Prep" 
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (e.target.value) setError(false)
              }}
              className={cn("h-11", error && "border-destructive focus-visible:ring-destructive")}
            />
            {error && <p className="text-[10px] font-bold text-destructive uppercase">Title is required.</p>}
          </div>

          <div className="space-y-3 bg-secondary/30 p-4 rounded-xl border border-border/50">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Subtasks</Label>
            
            <div className="space-y-3 border-b border-border/50 pb-4 mb-2">
              <Input 
                placeholder="Step title..." 
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="h-9 text-sm font-medium"
              />
              
              <div className="bg-background/50 p-3 rounded-lg border border-border/30 space-y-2">
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Add Link to Step</p>
                <div className="flex flex-col gap-2">
                  <Input 
                    placeholder="Link Name" 
                    value={newSubtaskLinkTitle}
                    onChange={(e) => setNewSubtaskLinkTitle(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <div className="flex gap-2">
                    <Input 
                      placeholder="https://..." 
                      value={newSubtaskLinkUrl}
                      onChange={(e) => setNewSubtaskLinkUrl(e.target.value)}
                      className="h-8 text-xs flex-1"
                    />
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="secondary" 
                      className="h-8 w-8 shrink-0" 
                      onClick={handleAddLinkToSubtask}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {newSubtaskLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newSubtaskLinks.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-1 bg-primary/10 text-primary text-[10px] px-2 py-1 rounded-full border border-primary/20">
                        <span className="truncate max-w-[80px]">{link.title}</span>
                        <X className="h-2.5 w-2.5 cursor-pointer hover:text-destructive" onClick={() => handleRemoveLinkFromSubtask(idx)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                type="button" 
                size="sm" 
                className="w-full h-9 gap-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                onClick={handleAddSubtask}
              >
                <Plus className="h-4 w-4" /> Add Subtask Step
              </Button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-2 mt-2 max-h-[200px] overflow-y-auto pr-1">
                {subtasks.map((s) => (
                  <div key={s.id} className="flex flex-col bg-background p-2.5 rounded-lg border border-border/50 gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                        {s.title}
                      </span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive hover:bg-destructive hover:text-white transition-all rounded-md" 
                        onClick={() => handleRemoveSubtask(s.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    {s.links && s.links.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pl-5">
                        {s.links.map((link, lIdx) => (
                          <div key={lIdx} className="flex items-center gap-1 text-[9px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded border border-border/30">
                            <LinkIcon className="h-2.5 w-2.5" />
                            {link.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 bg-secondary/30 p-4 rounded-xl border border-border/50">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Main Task Links</Label>
            <div className="space-y-2">
              <Input 
                placeholder="Link Title (e.g., Document)" 
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                className="h-9 text-sm"
              />
              <div className="flex gap-2">
                <Input 
                  type="url"
                  placeholder="https://..." 
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="h-9 text-sm flex-1"
                />
                <Button type="button" size="icon" variant="outline" className="h-9 w-9 shrink-0" onClick={handleAddLink}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {links.length > 0 && (
              <div className="space-y-2 mt-3">
                {links.map((link, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-background p-2 rounded-lg border border-border/50 text-xs">
                    <span className="font-medium truncate max-w-[200px] flex items-center gap-2">
                      <LinkIcon className="h-3 w-3 text-primary" />
                      {link.title}
                    </span>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive hover:text-white transition-all rounded-md" onClick={() => handleRemoveLink(idx)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Time</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-11" />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full h-12 text-base font-bold">
              {task ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
