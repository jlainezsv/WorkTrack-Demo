import type { TimeEntryRepository } from "@/application/repositories/TimeEntryRepository"
import { TimeEntry } from "@/domain/entities/TimeEntry"

import { ApiClient } from "./ApiClient"
import type { TimeEntryDTO } from "./dto/TimeEntryDTO"
import { TimeEntryMapper } from "./mappers/TimeEntryMapper"

const apiClient = new ApiClient()

export class ApiTimeEntryRepository implements TimeEntryRepository {

  async findByEmployeeId(employeeId: string): Promise<TimeEntry[]> {
    const dtos = await apiClient.get<TimeEntryDTO[]>(`/employees/${employeeId}/time-entries`)
    return dtos.map(TimeEntryMapper.toDomain)
  }

  async findAll(): Promise<TimeEntry[]> {
    const dtos = await apiClient.get<TimeEntryDTO[]>("/employees/time-entries/all")
    return dtos.map(TimeEntryMapper.toDomain)
  }

  async save(entry: TimeEntry): Promise<void> {
    const pad = (n: number) => n.toString().padStart(2, "0")
    const d = entry.startTime
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    const startTime = `${pad(d.getHours())}:${pad(d.getMinutes())}`
    const endTime = `${pad(entry.endTime.getHours())}:${pad(entry.endTime.getMinutes())}`

    await apiClient.post(
      `/employees/${entry.employeeId}/time-entries`,
      {
        date,
        startTime,
        endTime,
        hasLunch: entry.hasLunch,
        clientName: entry.clientName,
        description: entry.description,
      }
    )
  }

  async update(entry: TimeEntry): Promise<void> {
    const pad = (n: number) => n.toString().padStart(2, "0")
    const d = entry.startTime
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    const startTime = `${pad(d.getHours())}:${pad(d.getMinutes())}`
    const endTime = `${pad(entry.endTime.getHours())}:${pad(entry.endTime.getMinutes())}`

    await apiClient.patch(
      `/employees/time-entries/${entry.id}`,
      {
        date,
        startTime,
        endTime,
        hasLunch: entry.hasLunch,
        description: entry.description,
      }
    )
  }

  private apiClient = new ApiClient();

  async updateStatus(id: string, status: "paid" | "unpaid", paidAt?: string): Promise<void> {
    await this.apiClient.patch(`/employees/time-entries/${id}/status`, {
      status,
      paidAt,
    });
  }

}