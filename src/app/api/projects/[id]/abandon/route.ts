import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { retro } = body ?? {};

  const project = await prisma.project.update({
    where: { id },
    data: {
      status: "ABANDONED",
      completedAt: new Date(),
      retro: retro && String(retro).trim() ? String(retro).trim() : null,
    },
  });

  return NextResponse.json(project);
}
