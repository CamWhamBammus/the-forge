import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { title, completed, order } = body ?? {};

  const data: { title?: string; completed?: boolean; completedAt?: Date | null; order?: number } = {};

  if (title !== undefined) data.title = String(title).trim();
  if (order !== undefined) data.order = Number(order);
  if (completed !== undefined) {
    data.completed = Boolean(completed);
    data.completedAt = data.completed ? new Date() : null;
  }

  const milestone = await prisma.milestone.update({ where: { id }, data });
  return NextResponse.json(milestone);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.milestone.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
