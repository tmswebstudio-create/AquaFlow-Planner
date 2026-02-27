
"use client"

import { useState } from "react"
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
import { Plus, X, Link as LinkIcon } from "lucide-react"
import { Task, TaskLink } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AddTaskDialogProps {
  onAdd: (task: Omit<Task, "id" | "createdAt" | "completed" | "updatedAt" | "ownerId">) => void
  defaultDate?: string
}

export function AddTaskDialog({ onAdd, defaultDate }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [links, setLinks] = useState<TaskLink[]>([])
  const [newLinkTitle, setNewLinkTitle] = useState("")
  const [newLinkUrl, setNewLinkUrl] = useState("")
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split("T")[0])
  const [time, setTime] = useState("")
  const [error, setError] = useState(false)

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError(true)
      return
    }

    const taskData: any = {
      title: title.trim(),
      date,
      links: links.length > 0 ? links : undefined,
    }
    
    if (time) taskData.time = time

    onAdd(taskData)
    
    setTitle("")
    setLinks([])
    setTime("")
    setError(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full h-10 px-4 md:px-5 gap-1.5 md:gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 md:h-5 md:w-5" /> 
          <span className="hidden sm:inline">New Task</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Links & Resources</Label>
            
            <div className="space-y-2">
              <Input 
                placeholder="Link Title (e.g., Figma Design)" 
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
                <Button 
                  type="button" 
                  size="icon" 
                  variant="outline"
                  className="h-9 w-9 shrink-0"
                  onClick={handleAddLink}
                >
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
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-destructive"
                      onClick={() => handleRemoveLink(idx)}
                    >
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
              <Input 
                id="date" 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Time</Label>
              <Input 
                id="time" 
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-11"
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full h-12 text-base font-bold">Create Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
