
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
import { Plus } from "lucide-react"
import { Task } from "@/lib/types"

interface AddTaskDialogProps {
  onAdd: (task: Omit<Task, "id" | "createdAt" | "completed">) => void
  defaultDate?: string
}

export function AddTaskDialog({ onAdd, defaultDate }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [link, setLink] = useState("")
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split("T")[0])
  const [time, setTime] = useState("")
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError(true)
      return
    }

    // Create payload and avoid passing 'undefined' to Firestore
    const taskData: any = {
      title: title.trim(),
      date,
    }
    
    // Only include optional fields if they have values
    if (link.trim()) taskData.link = link.trim()
    if (time) taskData.time = time

    onAdd(taskData)
    
    setTitle("")
    setLink("")
    setTime("")
    setError(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full h-12 px-6 gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-5 w-5" /> New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input 
              id="title" 
              placeholder="e.g., Quarterly Review Prep" 
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (e.target.value) setError(false)
              }}
              className={error ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {error && <p className="text-xs text-destructive">Title is required.</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="link">Link (Optional)</Label>
            <Input 
              id="link" 
              type="url"
              placeholder="https://example.com" 
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time (Optional)</Label>
              <Input 
                id="time" 
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full">Create Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
