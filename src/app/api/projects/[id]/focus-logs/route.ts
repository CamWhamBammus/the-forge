import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { dateKeyToDate, todayKey } from "@/lib/dateKey";

/** Called once per completed pomodoro-style work session — increments (or creates) today's count. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { date } = body ?? {};

  const day = dateKeyToDate(typeof date === "string" && date ? date : todayKey());

  const focusLog = await prisma.focusLog.upsert({
    where: { projectId_date: { projectId: id, date: day } },
    update: { count: { increment: 1 } },
    create: { projectId: id, date: day, count: 1 },
  });

  return NextResponse.json(focusLog, { status: 201 });
}
