import { format, subMonths } from "date-fns";

export function getDefaultDateRange() {
  const today = new Date();
  const oneMonthAgo = subMonths(today, 1);

  return {
    from: format(oneMonthAgo, "yyyy-MM-dd"),
    to: format(today, "yyyy-MM-dd"),
  };
}
