import { randomUUID } from "crypto";
import { TimeEntry } from "../../domain/entities/TimeEntry";
import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { TimeEntryRepository } from "../repositories/TimeEntryRepository";
import { TimeEntryOverlapError } from "../errors/TimeEntryOverlapError";
import { EmployeeNotFoundError } from "../errors/EmployeeNotFoundError";
import { EmployeeInactiveError } from "../errors/EmployeeInactiveError";
import { buildTimeEntryDateRange } from "./shared/buildTimeEntryDateRange";

interface RegisterTimeEntryInput {
  employeeId: string;
  date: string;       // "2026-03-29"
  startTime: string;  // "22:00"
  endTime: string;    // "06:00"
  clientName: string;
  description?: string | null;
}

export class RegisterTimeEntry {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly timeEntryRepository: TimeEntryRepository
  ) {}



  async execute(input: RegisterTimeEntryInput): Promise<TimeEntry> {
    const employee = await this.employeeRepository.findById(
      input.employeeId
    );

    if (!employee) {
      throw new EmployeeNotFoundError();
    }

    if (!employee.active) {
      throw new EmployeeInactiveError();
    }

    const { startDateTime, endDateTime } = buildTimeEntryDateRange({
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
    });

    const newEntry = new TimeEntry({
      id: randomUUID(),
      employeeId: input.employeeId,
      startTime: startDateTime,
      endTime: endDateTime,
      clientName: input.clientName,
      description: input.description ?? null,
      status: "unpaid",
      createdAt: new Date()
    })

    const overlapping = await this.timeEntryRepository.findOverlapping(
      input.employeeId,
      startDateTime,
      endDateTime
    );

    if (overlapping.length > 0) {
      throw new TimeEntryOverlapError();
    }

    await this.timeEntryRepository.save(newEntry);

    return newEntry;
  }
}