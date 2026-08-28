export type TemperTier = "cold" | "cooling" | "warm" | "hot";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function daysSinceLastCheckIn(checkIns: { date: Date }[], now: Date): number | null {
  if (checkIns.length === 0) return null;
  const mostRecent = checkIns.reduce((latest, c) => (c.date > latest ? c.date : latest), checkIns[0].date);
  const diffDays = Math.round((startOfDay(now).getTime() - startOfDay(mostRecent).getTime()) / MS_PER_DAY);
  return Math.max(0, diffDays);
}

/**
 * How recently the project's been touched, not how consistently — a
 * week-long project doesn't need an unbroken daily streak to still feel
 * alive, just recent attention. Checked in today = hot, yesterday = warm,
 * two days ago = cooling, three or more (or never) = cold.
 */
export function temperTier(checkIns: { date: Date }[], now: Date = new Date()): TemperTier {
  const daysSince = daysSinceLastCheckIn(checkIns, now);
  if (daysSince === null) return "cold";
  if (daysSince === 0) return "hot";
  if (daysSince === 1) return "warm";
  if (daysSince === 2) return "cooling";
  return "cold";
}
