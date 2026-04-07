import { ApplicationError } from "./ApplicationError";

export class TimeEntryPaidEditNotAllowedError extends ApplicationError {
  constructor() {
    super("Paid time entries cannot be edited.");
  }

  getStatusCode(): number {
    return 409;
  }
}