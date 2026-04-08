import { TimeEntry } from "@/domain/entities/TimeEntry"
import type { TimeEntryRepository } from "@/application/repositories/TimeEntryRepository"

export interface UpdateTimeEntryInput {
  id: string
  date: string
  startTime: string
  endTime: string
  description?: string
}

export class UpdateTimeEntry {
  constructor(private readonly repository: TimeEntryRepository) {}

  async execute(input: UpdateTimeEntryInput, existing: TimeEntry): Promise<void> {
    if (existing.status === "paid") {
      throw new Error("Paid time entries cannot be edited")
    }

    const startDateTime = new Date(`${input.date}T${input.startTime}`)
    const endDateTime = new Date(`${input.date}T${input.endTime}`)

    if (Number.isNaN(startDateTime.getTime()) || Number.isNaN(endDateTime.getTime())) {
      throw new Error("Invalid date or time")
    }

    if (endDateTime < startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1)
    }

    if (startDateTime >= endDateTime) {
      throw new Error("Start time must be before end time")
    }

    const updated = new TimeEntry(
      existing.id,
      existing.employeeId,
      startDateTime,
      endDateTime,
      existing.clientName,
      input.description ?? existing.description,
      existing.status,
      existing.createdAt,
      existing.paidAt,
    )

    await this.repository.update(updated)
  }
}