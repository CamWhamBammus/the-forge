import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { title, description, techStack, deadlineAt } = body ?? {};

  const data: {
    title?: string;
    description?: string | null;
    techStack?: string | null;
    deadlineAt?: Date;
  } = {};

  if (title !== undefined) data.title = String(title).trim();
  if (description !== undefined) data.description = description && String(description).trim() ? String(description).trim() : null;
  if (techStack !== undefined) data.techStack = techStack && String(techStack).trim() ? String(techStack).trim() : null;
  if (deadlineAt !== undefined) data.deadlineAt = new Date(deadlineAt);

  const project = await prisma.project.update({
    where: { id },
    data,
    include: {
      milestones: { orderBy: { order: "asc" } },
      checkIns: { orderBy: { date: "desc" } },
      focusLogs: true,
      linkedBooks: true,
    },
  });

  return NextResponse.json(project);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
