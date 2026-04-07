import { useState } from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/components/ui/dialog"
import { Button } from "@/ui/components/ui/button"
import { TimeEntryForm } from "@/ui/components/time-entry/TimeEntryForm"

interface Props {
  variant?: "link" | "ghost" | "outline" | "default" | "secondary" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function AddHoursMenuDialog({ variant = "link", size = "lg", className }: Props = {}) {
  const [open, setOpen] = useState(false)

  const handleOpenChange = (value: boolean) => {
    setOpen(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          Add Hours
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Worked Hours</DialogTitle>
        </DialogHeader>

        <TimeEntryForm />
      </DialogContent>
    </Dialog>
  )
}
