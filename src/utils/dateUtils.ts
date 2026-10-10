/**
 * Safe local date and time formatting utilities to prevent UTC timezone offset drift.
 */

// Formats a Date object to YYYY-MM-DD in the user's local timezone
export function formatLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Gets relative date offset from today in local time
export function getRelativeLocalDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatLocalDate(d);
}

// Parses YYYY-MM-DD string into a local Date object without UTC timezone conversion skew
export function parseLocalDate(dateStr: string): Date {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  return new Date(
    parseInt(yearStr, 10),
    parseInt(monthStr, 10) - 1,
    parseInt(dayStr, 10)
  );
}

// Returns human-friendly date label: "Today", "Tomorrow", "Yesterday", or "Oct 12"
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const todayStr = formatLocalDate(new Date());
  if (dateStr === todayStr) return 'Today';

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateStr === formatLocalDate(tomorrow)) return 'Tomorrow';

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === formatLocalDate(yesterday)) return 'Yesterday';

  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Calculate next recurrence date given current due date and recurrence rule
export function calculateNextRecurrenceDate(
  currentDueDateStr: string,
  recurrence: 'daily' | 'weekly' | 'monthly'
): string {
  const baseDate = currentDueDateStr ? parseLocalDate(currentDueDateStr) : new Date();

  if (recurrence === 'daily') {
    baseDate.setDate(baseDate.getDate() + 1);
  } else if (recurrence === 'weekly') {
    baseDate.setDate(baseDate.getDate() + 7);
  } else if (recurrence === 'monthly') {
    baseDate.setMonth(baseDate.getMonth() + 1);
  }

  return formatLocalDate(baseDate);
}
