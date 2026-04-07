import { InvalidTimeEntryRangeError } from "../../errors/InvalidTimeEntryRangeError";

interface BuildTimeEntryDateRangeInput {
  date: string;
  startTime: string;
  endTime: string;
}

export function buildTimeEntryDateRange(input: BuildTimeEntryDateRangeInput): {
  startDateTime: Date;
  endDateTime: Date;
} {
  const startDateTime = new Date(`${input.date}T${input.startTime}`);
  const endDateTime = new Date(`${input.date}T${input.endTime}`);

  if (Number.isNaN(startDateTime.getTime()) || Number.isNaN(endDateTime.getTime())) {
    throw new InvalidTimeEntryRangeError();
  }

  // Overnight shift: if end is earlier than start, move end to next day.
  if (endDateTime < startDateTime) {
    endDateTime.setDate(endDateTime.getDate() + 1);
  }

  if (startDateTime >= endDateTime) {
    throw new InvalidTimeEntryRangeError();
  }

  return { startDateTime, endDateTime };
}