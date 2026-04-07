import { ApplicationError } from "./ApplicationError";

export class InvalidTimeEntryRangeError extends ApplicationError {
  constructor() {
    super("Start time must be before end time.");
  }

  getStatusCode(): number {
    return 400;
  }
}