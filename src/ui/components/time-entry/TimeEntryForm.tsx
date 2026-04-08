import { useEffect, useState } from "react"

import { RegisterTimeEntry } from "@application/use-cases/RegisterTimeEntry"
import {
  sharedClientRepository,
  sharedEmployeeRepository,
  sharedTimeEntryRepository,
} from "@infrastructure/SharedRepository"

import { Button } from "@/ui/components/ui/button"
import { Field, FieldLabel } from "@/ui/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/components/ui/select"
import { Textarea } from "@/ui/components/ui/textarea"
import { Calendar } from "@/ui/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/components/ui/popover"
import { NativeTimeField } from "@/ui/components/time-entry/NativeTimeField"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

const registerTimeEntry = new RegisterTimeEntry(
  sharedTimeEntryRepository,
  sharedEmployeeRepository
)

interface EmployeeOption {
  id: string
  name: string
  employeeCode?: string
}

interface ClientOption {
  id: string
  name: string
}

interface TimeEntryFormProps {
  fixedEmployeeId?: string
  onCreated?: () => void | Promise<void>
  submitLabel?: string
}

export function TimeEntryForm({ fixedEmployeeId, onCreated, submitLabel = "Register Time Entry" }: TimeEntryFormProps) {
  const [employeeId, setEmployeeId] = useState(fixedEmployeeId ?? "")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [clientName, setClientName] = useState("")
  const [description, setDescription] = useState("")
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [clients, setClients] = useState<ClientOption[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const selectedDate = date ? new Date(`${date}T00:00:00`) : undefined


  useEffect(() => {
    setEmployeeId(fixedEmployeeId ?? "")
  }, [fixedEmployeeId])

  useEffect(() => {
    sharedClientRepository.findAll().then(setClients)

    if (!fixedEmployeeId) {
      sharedEmployeeRepository.findAll().then(setEmployees)
    }
  }, [fixedEmployeeId])

  const resetForm = () => {
    if (!fixedEmployeeId) {
      setEmployeeId("")
    }

    setDate("")
    setStartTime("")
    setEndTime("")
    setClientName("")
    setDescription("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!employeeId) {
      setError("Please select an employee")
      return
    }

    if (!date || !startTime || !endTime) {
      setError("Date, start time, and end time are required")
      return
    }

    try {
      await registerTimeEntry.execute({
        id: crypto.randomUUID(),
        employeeId,
        date,
        startTime,
        endTime,
        clientName: clientName || undefined,
        description: description || undefined,
      })

      setSuccess("Time entry registered successfully")
      resetForm()

      if (onCreated) {
        await onCreated()
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!fixedEmployeeId && (
        <div>
          <label className="block text-sm font-medium mb-1">Employee *</label>
          <Select value={employeeId} onValueChange={setEmployeeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.employeeCode} - {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Field>
        <FieldLabel htmlFor="date">Date</FieldLabel>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date"
              type="button"
              className="w-full justify-between font-normal"
            >
              <span className={date ? "text-foreground" : "text-muted-foreground"}>
                {selectedDate ? format(selectedDate, "MM/dd/yyyy") : "mm/dd/yyyy"}
              </span>
              <CalendarIcon className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              defaultMonth={selectedDate}
              captionLayout="dropdown"
              onSelect={(nextDate) => {
                if (!nextDate) {
                  return
                }

                setDate(format(nextDate, "yyyy-MM-dd"))
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </Field>
              
      <div className="grid grid-cols-2 gap-2">
        <NativeTimeField
          id="start-time"
          label="Start Time"
          value={startTime}
          onChange={setStartTime}
          required
        />

        <NativeTimeField
          id="end-time"
          label="End Time"
          value={endTime}
          onChange={setEndTime}
          required
        />
      </div>
      

      <Field>
        <FieldLabel>Client</FieldLabel>
        <Select value={clientName} onValueChange={setClientName}>
          <SelectTrigger>
            <SelectValue placeholder="Select Client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.name}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Description</FieldLabel>
        <Textarea
          placeholder="Type your message here."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Field>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  )
}