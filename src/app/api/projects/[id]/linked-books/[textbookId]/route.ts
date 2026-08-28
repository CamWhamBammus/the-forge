import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; textbookId: string }> }) {
  const { id, textbookId } = await params;
  await prisma.linkedBook.deleteMany({ where: { projectId: id, textbookId } });
  return NextResponse.json({ ok: true });
}
