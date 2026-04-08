import { TimeEntry } from "@domain/entities/TimeEntry"
import type { TimeEntryRepository } from "@application/repositories/TimeEntryRepository"
import type { EmployeeRepository } from "@application/repositories/EmployeeRepository"
export interface RegisterTimeEntryInput {
  id: string
  employeeId: string
  date: string       // "YYYY-MM-DD"
  startTime: string  // "HH:MM"
  endTime: string    // "HH:MM"
  clientName?: string
  description?: string
}
export class RegisterTimeEntry {
    constructor(
        private timeEntryRepository: TimeEntryRepository,
        private employeeRepository: EmployeeRepository
    ) {}

    async execute(input: RegisterTimeEntryInput): Promise<void> {
        const employee = await this.employeeRepository.findById(input.employeeId)

        if (!employee) {
        throw new Error("Employee does not exist")
        }
        const startDateTime = new Date(`${input.date}T${input.startTime}`)
        let endDateTime = new Date(`${input.date}T${input.endTime}`)

        if (endDateTime <= startDateTime) {
          endDateTime.setDate(endDateTime.getDate() + 1)
        }

        const newEntry = new TimeEntry(
            input.id,
            input.employeeId,
            startDateTime,
            endDateTime,
            input.clientName,
            input.description
        )

        const existingEntries = await this.timeEntryRepository.findByEmployeeId(
            input.employeeId
        )

        const hasOverlap = existingEntries.some(entry =>
            newEntry.overlapsWith(entry)
        )

        if (hasOverlap) {
            throw new Error("Time entry overlaps with an existing entry")
        }

        await this.timeEntryRepository.save(newEntry)
    }
}