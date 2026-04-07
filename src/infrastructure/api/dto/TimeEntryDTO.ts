export interface TimeEntryDTO {
  id: string
  employeeId: string
  startTime: string
  endTime: string
  hasLunch: boolean
  clientName?: string
  description?: string
  status: "paid" | "unpaid"
  paidAt?: string
  createdAt?: string
}