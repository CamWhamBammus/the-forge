import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { title } = body ?? {};

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const last = await prisma.milestone.findFirst({
    where: { projectId: id },
    orderBy: { order: "desc" },
  });

  const milestone = await prisma.milestone.create({
    data: {
      projectId: id,
      title: title.trim(),
      order: (last?.order ?? -1) + 1,
    },
  });

  return NextResponse.json(milestone, { status: 201 });
}
