import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { textbookId } = body ?? {};

  if (!textbookId || typeof textbookId !== "string") {
    return NextResponse.json({ error: "textbookId is required" }, { status: 400 });
  }

  const existing = await prisma.linkedBook.findUnique({
    where: { projectId_textbookId: { projectId: id, textbookId } },
  });
  if (existing) return NextResponse.json(existing);

  const linkedBook = await prisma.linkedBook.create({ data: { projectId: id, textbookId } });
  return NextResponse.json(linkedBook, { status: 201 });
}
