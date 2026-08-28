import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { daysRemaining } from "@/lib/countdown";
import { temperTier } from "@/lib/temper";

export async function GET() {
  const project = await prisma.project.findFirst({
    where: { status: "ACTIVE" },
    include: { milestones: true, checkIns: true },
  });

  if (!project) return NextResponse.json(null);

  return NextResponse.json({
    title: project.title,
    daysRemaining: daysRemaining(project.deadlineAt),
    temperTier: temperTier(project.checkIns),
    milestonesDone: project.milestones.filter((m) => m.completed).length,
    milestonesTotal: project.milestones.length,
  });
}
