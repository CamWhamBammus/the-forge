// Reading Cabin is a separate app/process in the same local "cabin" —
// reached over plain HTTP on its own port, same as any other localhost
// service. No shared code, no shared database: this is the only coupling
// point between the two apps, and it's just their public API. Mirrors
// mailroom/src/lib/almanac.ts exactly.
const READING_CABIN_URL = "http://localhost:3000";

export class ReadingCabinUnreachableError extends Error {
  constructor() {
    super("Couldn't reach Reading Cabin. Make sure it's running (The Lodge → Reading Cabin → Launch).");
  }
}

export interface ReadingCabinBook {
  id: string;
  title: string;
  subtitle: string | null;
  author: string | null;
  status: string;
  currentPage: number;
  totalPages: number;
  percentComplete: number;
  coverPath: string | null;
}

export async function fetchReadingCabinBooks(): Promise<ReadingCabinBook[]> {
  let res: Response;
  try {
    res = await fetch(`${READING_CABIN_URL}/api/textbooks`, { signal: AbortSignal.timeout(5000) });
  } catch {
    throw new ReadingCabinUnreachableError();
  }
  if (!res.ok) throw new ReadingCabinUnreachableError();
  return res.json();
}

export function readingCabinBookUrl(id: string): string {
  return `${READING_CABIN_URL}/book/${id}`;
}

export function readingCabinCoverUrl(id: string): string {
  return `${READING_CABIN_URL}/api/textbooks/${id}/cover`;
}
