import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const project = await prisma.project.findFirst({
    where: { status: "ACTIVE" },
    include: {
      milestones: { orderBy: { order: "asc" } },
      checkIns: { orderBy: { date: "desc" } },
      focusLogs: true,
      linkedBooks: true,
    },
  });
  return NextResponse.json(project);
}
