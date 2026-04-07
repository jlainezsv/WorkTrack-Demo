import { useState } from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/components/ui/dialog"
import { Button } from "@/ui/components/ui/button"
import { TimeEntryForm } from "@/ui/components/time-entry/TimeEntryForm"

interface Props {
  employeeId: string
  employeeName?: string
  onCreated: () => void
}

export function AddHoursDialog({ employeeId, employeeName, onCreated }: Props) {
  const [open, setOpen] = useState(false)

  const handleOpenChange = (value: boolean) => {
    setOpen(value)
  }

  const handleCreated = async () => {
    onCreated()
    setTimeout(() => {
      setOpen(false)
    }, 400)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Add Hours</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{employeeName ? `Add Hours to ${employeeName}` : "Add Worked Hours"}</DialogTitle>
        </DialogHeader>

        <TimeEntryForm fixedEmployeeId={employeeId} onCreated={handleCreated} />
      </DialogContent>
    </Dialog>
  )
}