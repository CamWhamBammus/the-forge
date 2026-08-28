const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

export function msRemaining(deadlineAt: Date, now: Date = new Date()): number {
  return deadlineAt.getTime() - now.getTime();
}

export function isOverdue(deadlineAt: Date, now: Date = new Date()): boolean {
  return msRemaining(deadlineAt, now) < 0;
}

/** Whole days remaining, ceiled — "14 hours left" reads as 1 day, never 0 while still active. Floored at 0 once overdue. */
export function daysRemaining(deadlineAt: Date, now: Date = new Date()): number {
  return Math.max(0, Math.ceil(msRemaining(deadlineAt, now) / MS_PER_DAY));
}

/** "5d 14h left" / "3h 12m left" / "42m left", or "Overdue by 2h 5m" once past the deadline — always two units, never more. */
export function formatCountdown(deadlineAt: Date, now: Date = new Date()): string {
  const ms = msRemaining(deadlineAt, now);
  const overdue = ms < 0;
  const abs = Math.abs(ms);

  const days = Math.floor(abs / MS_PER_DAY);
  const hours = Math.floor((abs % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((abs % MS_PER_HOUR) / MS_PER_MINUTE);

  let primary: string;
  if (days > 0) primary = `${days}d ${hours}h`;
  else if (hours > 0) primary = `${hours}h ${minutes}m`;
  else primary = `${minutes}m`;

  return overdue ? `Overdue by ${primary}` : `${primary} left`;
}
