import { NextResponse } from "next/server";
import { fetchReadingCabinBooks, ReadingCabinUnreachableError } from "@/lib/readingCabin";

export async function GET() {
  try {
    const books = await fetchReadingCabinBooks();
    return NextResponse.json(books);
  } catch (err) {
    if (err instanceof ReadingCabinUnreachableError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    throw err;
  }
}
