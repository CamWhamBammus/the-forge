import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      milestones: { orderBy: { order: "asc" } },
      focusLogs: true,
    },
  });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { title, description, techStack, deadlineAt, linkedBookIds } = body ?? {};

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!deadlineAt) {
    return NextResponse.json({ error: "deadlineAt is required" }, { status: 400 });
  }

  const existingActive = await prisma.project.findFirst({ where: { status: "ACTIVE" } });
  if (existingActive) {
    return NextResponse.json(
      { error: "A project is already active. Complete or abandon it before starting another." },
      { status: 409 }
    );
  }

  const bookIds = Array.isArray(linkedBookIds) ? linkedBookIds.filter((v) => typeof v === "string" && v) : [];

  const project = await prisma.project.create({
    data: {
      title: title.trim(),
      description: description && String(description).trim() ? String(description).trim() : null,
      techStack: techStack && String(techStack).trim() ? String(techStack).trim() : null,
      deadlineAt: new Date(deadlineAt),
      linkedBooks: bookIds.length > 0 ? { create: bookIds.map((textbookId) => ({ textbookId })) } : undefined,
    },
    include: { milestones: true, checkIns: true, focusLogs: true, linkedBooks: true },
  });

  return NextResponse.json(project, { status: 201 });
}
