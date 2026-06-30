import { format, subMonths } from "date-fns";

export function getDefaultDateRange() {
  const today = new Date();
  const oneMonthAgo = subMonths(today, 1);

  return {
    from: format(oneMonthAgo, "yyyy-MM-dd"),
    to: format(today, "yyyy-MM-dd"),
  };
}

/**
 * Converts a Date (or string/number) to an ISO-8601 string representation in UTC+7 timezone.
 * Format: YYYY-MM-DDTHH:mm:ss.SSS+07:00
 */
export function toUTC7String(dateInput?: Date | string | number): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(date.getTime())) {
    return "";
  }
  // Offset UTC+7 is +7 hours from UTC
  const utcOffset = 7 * 60 * 60 * 1000;
  const utc7Date = new Date(date.getTime() + utcOffset);
  return utc7Date.toISOString().replace(/Z$/, "+07:00");
}

