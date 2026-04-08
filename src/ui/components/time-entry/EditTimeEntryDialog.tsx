import { useEffect, useState } from "react"

import type { TimeEntry } from "@/domain/entities/TimeEntry"
import { UpdateTimeEntry } from "@/application/use-cases/UpdateTimeEntry"
import { sharedTimeEntryRepository } from "@/infrastructure/SharedRepository"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/components/ui/dialog"
import { Button } from "@/ui/components/ui/button"
import { Input } from "@/ui/components/ui/input"
import { Textarea } from "@/ui/components/ui/textarea"
import { NativeTimeField } from "@/ui/components/time-entry/NativeTimeField"

const updateTimeEntry = new UpdateTimeEntry(sharedTimeEntryRepository)

interface Props {
  entry: TimeEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: () => void
}

export function EditTimeEntryDialog({ entry, open, onOpenChange, onUpdated }: Props) {
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!entry) return

    const start = new Date(entry.startTime)
    const end = new Date(entry.endTime)
    const pad = (n: number) => n.toString().padStart(2, "0")

    setDate(`${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`)
    setStartTime(`${pad(start.getHours())}:${pad(start.getMinutes())}`)
    setEndTime(`${pad(end.getHours())}:${pad(end.getMinutes())}`)
    setNotes(entry.description ?? "")
    setError(null)
  }, [entry, open])

  if (!entry) {
    return null
  }

  const isPaid = entry.status === "paid"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isPaid) {
      return
    }

    if (!date || !startTime || !endTime) {
      setError("Date, start time, and end time are required")
      return
    }

    setSaving(true)
    setError(null)
    try {
      await updateTimeEntry.execute(
        {
          id: entry.id,
          date,
          startTime,
          endTime,
          description: notes || undefined,
        },
        entry,
      )

      onUpdated()
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "Could not update time entry")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isPaid ? "Edit not available" : "Edit Time Entry"}</DialogTitle>
        </DialogHeader>

        {isPaid ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This time entry is paid and cannot be edited.
            </p>
            <div className="flex justify-end">
              <Button type="button" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-md border p-3 text-sm space-y-1">
              <p><span className="text-muted-foreground">Client:</span> {entry.clientName || "-"}</p>
              <p><span className="text-muted-foreground">Status:</span> {entry.status}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <NativeTimeField
                id="edit-start-time"
                label="Start Time"
                value={startTime}
                onChange={setStartTime}
                required
              />
              <NativeTimeField
                id="edit-end-time"
                label="End Time"
                value={endTime}
                onChange={setEndTime}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
