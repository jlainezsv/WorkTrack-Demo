import { Inject, Injectable } from "@nestjs/common";
import { TimeEntryRepository } from "../repositories/TimeEntryRepository";
import { TimeEntry } from "../../domain/entities/TimeEntry";
import { TimeEntryOverlapError } from "../errors/TimeEntryOverlapError";
import { TimeEntryPaidEditNotAllowedError } from "../errors/TimeEntryPaidEditNotAllowedError";
import { TimeEntryNotFoundError } from "../errors/TimeEntryNotFoundError";
import { buildTimeEntryDateRange } from "./shared/buildTimeEntryDateRange";

export interface UpdateTimeEntryInput {
  id: string
  date: string       // "YYYY-MM-DD"
  startTime: string  // "HH:MM"
  endTime: string    // "HH:MM"
    hasLunch?: boolean
  description?: string
}

@Injectable()
export class UpdateTimeEntry {
    constructor(
        @Inject("TimeEntryRepository")
        private readonly timeEntryRepository: TimeEntryRepository,
    ) {}

    async execute(input: UpdateTimeEntryInput): Promise<void> {
        const entryToUpdate = await this.timeEntryRepository.findById(input.id)

        if (!entryToUpdate) {
            throw new TimeEntryNotFoundError()
        }

        if (entryToUpdate.status === "paid") {
            throw new TimeEntryPaidEditNotAllowedError()
        }

        const { startDateTime, endDateTime } = buildTimeEntryDateRange({
            date: input.date,
            startTime: input.startTime,
            endTime: input.endTime,
        })

        const updatedEntry = new TimeEntry({
            id: entryToUpdate.id,
            employeeId: entryToUpdate.employeeId,
            startTime: startDateTime,
            endTime: endDateTime,
            hasLunch: input.hasLunch ?? entryToUpdate.hasLunch,
            clientName: entryToUpdate.clientName,
            description: input.description ?? entryToUpdate.description,
            status: entryToUpdate.status,
            paidAt: entryToUpdate.paidAt,
            createdAt: entryToUpdate.createdAt,
        })

        const overlapping = await this.timeEntryRepository.findOverlapping(
            entryToUpdate.employeeId,
            startDateTime,
            endDateTime
        )

        const overlappingOtherEntries = overlapping.filter(
            (entry) => entry.id !== entryToUpdate.id
        )

        if (overlappingOtherEntries.length > 0) {
            throw new TimeEntryOverlapError()
        }

        await this.timeEntryRepository.update(updatedEntry)
    }
}

