import type { CheckIn, FocusLog, LinkedBook, Milestone, Project, ProjectStatus } from "@prisma/client";

export type { CheckIn, FocusLog, LinkedBook, Milestone, Project, ProjectStatus };

export type ProjectWithRelations = Project & {
  milestones: Milestone[];
  checkIns: CheckIn[];
  focusLogs: FocusLog[];
  linkedBooks: LinkedBook[];
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  ABANDONED: "Abandoned",
};
