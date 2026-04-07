import { useState } from "react"
import { Employee } from "@domain/entities/Employee"
import { TimeEntry } from "@domain/entities/TimeEntry"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/ui/components/ui/collapsible"

import { StatusBadge } from "@/ui/components/StatusBadge"

import { Button } from "@/ui/components/ui/button"
import { Badge } from "@/ui/components/ui/badge"
import { EditTimeEntryDialog } from "@/ui/components/time-entry/EditTimeEntryDialog"
import { ChevronsUpDown } from "lucide-react"

interface Props {
  employee: Employee | null
  entries: TimeEntry[]
  totalHours: number
  paidHours: number
  unpaidHours: number
}

export function EmployeeProfileMobile({
  entries,
  handleToggleStatus,
  onEntryUpdated,
}: Props & { handleToggleStatus: (entry: TimeEntry, paidAt?: string) => void; onEntryUpdated: () => void }) {

  // 🔹 ahora guardamos el ID abierto
  const [openId, setOpenId] = useState<string | null>(null)
  const [payingEntryId, setPayingEntryId] = useState<string | null>(null)
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split("T")[0])
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const beginPayFlow = (entryId: string) => {
    setPayingEntryId(entryId)
    setPaidDate(new Date().toISOString().split("T")[0])
  }

  const confirmPay = (entry: TimeEntry) => {
    handleToggleStatus(entry, paidDate)
    setPayingEntryId(null)
  }

  const getPaidDateLabel = (entry: TimeEntry) => {
    if (!entry.paidAt) return "not set"
    return new Date(`${entry.paidAt}T00:00:00`).toLocaleDateString()
  }

  const openEdit = (entry: TimeEntry) => {
    setEditingEntry(entry)
    setEditOpen(true)
  }

  return (
    <div className="md:hidden">

      {entries.map((entry) => {

        const isOpen = openId === entry.id
        const startsAt = new Date(entry.startTime)
        const endsAt = new Date(entry.endTime)
        const isNextDay = startsAt.toDateString() !== endsAt.toDateString()

        return (
          <Collapsible
            key={entry.id}
            open={isOpen}
            onOpenChange={() =>
              setOpenId(isOpen ? null : entry.id)
            }
            className="w-full flex flex-col border rounded-md p-4 mb-2"
          >

            <div className="flex items-center justify-between gap-2">

                <div className="flex items-center justify-between flex-grow">
                    <div className="flex flex-col">
                        <p className="font-semibold text-lg">
                        {entry.getDurationInHours().toFixed(1)} h
                        </p>

                        <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>
                            {new Date(entry.startTime).toLocaleDateString()}
                        </span>
                        </div>
                    </div>

                    <span>
                        <StatusBadge status={entry.status} />
                    </span>
                </div>
              

                <CollapsibleTrigger asChild>
                    <Button
                    variant="ghost"
                    size="icon"
                    className="size-12"
                    >
                    <ChevronsUpDown />
                    </Button>
                </CollapsibleTrigger>

            </div>

            <CollapsibleContent className="">
                <div className="pt-3 flex flex-col gap-2">
                    {entry.status === "paid" && (
                      <div className="rounded-md border border-green-300 bg-green-100/60 px-3 py-2 text-sm text-green-900">
                        Paid on: {getPaidDateLabel(entry)}
                      </div>
                    )}

                    <div className="flex justify-between border rounded-md px-3 py-2 text-sm">
                        <span className="text-muted-foreground">Client</span>
                        <span>{entry.clientName || "-"}</span>
                    </div>

                    <div className="flex justify-between border rounded-md px-3 py-2 text-sm">
                        <span className="text-muted-foreground">Description</span>
                        <span>{entry.description}</span>
                    </div>

                    <div className="flex justify-between border rounded-md px-3 py-2 text-sm">
                      <span className="text-muted-foreground">Lunch Break</span>
                      <span>{entry.hasLunch ? "Yes (-30m paid)" : "No"}</span>
                    </div>

                    <div className="flex justify-between border rounded-md px-3 py-2 text-sm">
                        <span className="text-muted-foreground">Start</span>
                        <span className="flex items-center gap-2">
                          {new Date(entry.startTime).toLocaleTimeString()}
                        </span>
                    </div>

                    <div className="flex justify-between border rounded-md px-3 py-2 text-sm">
                        <span className="text-muted-foreground">End 
                          
                        </span>
                        
                        <span className="flex items-center gap-2">
                          {isNextDay && (
                            <Badge variant="secondary">
                              +1 Day
                            </Badge>
                          )}
                          {new Date(entry.endTime).toLocaleTimeString()}
                          
                        </span>
                    </div>

                    <div className="pt-3">
                        {entry.status === "paid" ? (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleToggleStatus(entry)}
                              variant="secondary"
                              className="w-full"
                            >
                              Mark as Unpaid
                            </Button>
                            <Button
                              onClick={() => openEdit(entry)}
                              variant="outline"
                              className="w-full"
                            >
                              Edit
                            </Button>
                          </div>
                        ) : payingEntryId === entry.id ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="date"
                              value={paidDate}
                              max={new Date().toISOString().split("T")[0]}
                              onChange={(e) => setPaidDate(e.target.value)}
                              className="h-10 rounded-md border border-input bg-background px-2 text-sm"
                            />
                            <div className="flex gap-2">
                              <Button onClick={() => confirmPay(entry)} variant="secondary" className="w-full">
                                Save Paid Date
                              </Button>
                              <Button onClick={() => setPayingEntryId(null)} variant="ghost" className="w-full">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => beginPayFlow(entry.id)}
                              variant="secondary"
                              className="w-full"
                            >
                              Mark as Paid
                            </Button>
                            <Button
                              onClick={() => openEdit(entry)}
                              variant="outline"
                              className="w-full"
                            >
                              Edit
                            </Button>
                          </div>
                        )}
                    </div>
                </div>
            </CollapsibleContent>

          </Collapsible>
        )
      })}

      <EditTimeEntryDialog
        entry={editingEntry}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={onEntryUpdated}
      />

    </div>
  )
}