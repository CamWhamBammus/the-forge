import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { dateKeyToDate, todayKey } from "@/lib/dateKey";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { date, built, blockers, learned } = body ?? {};

  if (!built || typeof built !== "string" || !built.trim()) {
    return NextResponse.json({ error: "built is required" }, { status: 400 });
  }

  const day = dateKeyToDate(typeof date === "string" && date ? date : todayKey());

  const checkIn = await prisma.checkIn.upsert({
    where: { projectId_date: { projectId: id, date: day } },
    update: {
      built: built.trim(),
      blockers: blockers && String(blockers).trim() ? String(blockers).trim() : null,
      learned: learned && String(learned).trim() ? String(learned).trim() : null,
    },
    create: {
      projectId: id,
      date: day,
      built: built.trim(),
      blockers: blockers && String(blockers).trim() ? String(blockers).trim() : null,
      learned: learned && String(learned).trim() ? String(learned).trim() : null,
    },
  });

  return NextResponse.json(checkIn, { status: 201 });
}
