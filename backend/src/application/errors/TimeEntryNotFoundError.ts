import { ApplicationError } from "./ApplicationError";

export class TimeEntryNotFoundError extends ApplicationError {
  constructor() {
    super("Time entry was not found.");
  }

  getStatusCode(): number {
    return 404;
  }
}