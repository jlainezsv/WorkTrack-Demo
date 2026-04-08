import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/ui/components/ui/table"
import { Button } from "@/ui/components/ui/button"
import { StatusBadge } from "@/ui/components/StatusBadge"
import { Badge } from "@/ui/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/ui/components/ui/tooltip"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/ui/components/ui/menubar"
import { EditTimeEntryDialog } from "@/ui/components/time-entry/EditTimeEntryDialog"
import { EllipsisVertical } from "lucide-react"

import { Employee } from "@domain/entities/Employee"
import { TimeEntry } from "@domain/entities/TimeEntry"

interface Props {
  employee: Employee | null
  entries: TimeEntry[]
  totalHours: number
  paidHours: number
  unpaidHours: number
}

export function EmployeeProfileDesktop({
  entries,
  handleToggleStatus,
  onEntryUpdated,
}: Props & { handleToggleStatus: (entry: TimeEntry, paidAt?: string) => void; onEntryUpdated: () => void }) {
  const [payingEntryId, setPayingEntryId] = useState<string | null>(null)
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split("T")[0])
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const beginPayFlow = (entryId: string) => {
    setPayingEntryId(entryId)
    setPaidDate(new Date().toISOString().split("T")[0])
  }

  const cancelPayFlow = () => {
    setPayingEntryId(null)
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
    <div className="hidden md:block">
      <TooltipProvider delayDuration={100}>
      <Table className="mb-2">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/12 text-center">Date</TableHead>
              <TableHead className="w-1/6">Client</TableHead>
              <TableHead className="w-1/2">Description</TableHead>
              <TableHead className="w-1/12">Start</TableHead>
              <TableHead className="w-1/12">End</TableHead>
              <TableHead className=""></TableHead>
              <TableHead className="w-1/12 text-center">Total</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                {(() => {
                  const startsAt = new Date(entry.startTime)
                  const endsAt = new Date(entry.endTime)
                  const isNextDay = startsAt.toDateString() !== endsAt.toDateString()

                  return (
                    <>
                <TableCell className="text-center">{new Date(entry.startTime).toLocaleDateString()}</TableCell>
                <TableCell>{entry.clientName || "-"}</TableCell>
                <TableCell>{entry.description || "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>
                      {new Date(entry.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>
                      {new Date(entry.endTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {isNextDay && (
                      <Badge className="text-nowrap">
                        +1 Day
                      </Badge>
                    )}
                </TableCell>
                <TableCell className="text-center">
                  {entry.getDurationInHours().toFixed(1)}
                </TableCell>
                
                
                <TableCell className="text-center capitalize">
                  {entry.status === "paid" ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="cursor-help"
                          aria-label={`Paid on ${getPaidDateLabel(entry)}`}
                        >
                          <Badge className="bg-green-600 hover:bg-green-600 text-white text-sm p-2">
                            Paid
                          </Badge>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        Paid on: {getPaidDateLabel(entry)}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <StatusBadge status={entry.status} />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {entry.status === "paid" ? (
                    <Menubar className="h-auto border-0 bg-transparent p-0 shadow-none inline-flex">
                      <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer rounded-md border px-2 py-1">
                          <EllipsisVertical className="size-4" />
                        </MenubarTrigger>
                        <MenubarContent align="end" sideOffset={4}>
                          <MenubarItem onClick={() => handleToggleStatus(entry)}>
                            Mark as Unpaid
                          </MenubarItem>
                          <MenubarItem onClick={() => openEdit(entry)}>
                            Edit
                          </MenubarItem>
                        </MenubarContent>
                      </MenubarMenu>
                    </Menubar>
                  ) : payingEntryId === entry.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={paidDate}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setPaidDate(e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                      />
                      <Button onClick={() => confirmPay(entry)} variant="outline" size="sm">
                        Save
                      </Button>
                      <Button onClick={cancelPayFlow} variant="ghost" size="sm">
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Menubar className="h-auto border-0 bg-transparent p-0 shadow-none inline-flex">
                      <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer rounded-md border px-2 py-1">
                          <EllipsisVertical className="size-4" />
                        </MenubarTrigger>
                        <MenubarContent align="end" sideOffset={4}>
                          <MenubarItem onClick={() => beginPayFlow(entry.id)}>
                            Mark as Paid
                          </MenubarItem>
                          <MenubarItem onClick={() => openEdit(entry)}>
                            Edit
                          </MenubarItem>
                        </MenubarContent>
                      </MenubarMenu>
                    </Menubar>
                  )}
                </TableCell>
                    </>
                  )
                })()}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TooltipProvider>

      <EditTimeEntryDialog
        entry={editingEntry}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={onEntryUpdated}
      />

    </div>
  )
}