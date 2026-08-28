import type { Milestone, ProjectWithRelations } from "@/types";
import type { TemperTier } from "./temper";
import type { ReadingCabinBook } from "./readingCabin";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? "Something went wrong.");
  }
  return res.json();
}

export interface ForgeSummary {
  title: string;
  daysRemaining: number;
  temperTier: TemperTier;
  milestonesDone: number;
  milestonesTotal: number;
}

export const api = {
  listProjects: () => fetch("/api/projects", { cache: "no-store" }).then((r) => json<ProjectWithRelations[]>(r)),

  getActiveProject: () =>
    fetch("/api/projects/active", { cache: "no-store" }).then((r) => json<ProjectWithRelations | null>(r)),

  createProject: (data: {
    title: string;
    description?: string;
    techStack?: string;
    deadlineAt: string;
    linkedBookIds?: string[];
  }) =>
    fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => json<ProjectWithRelations>(r)),

  updateProject: (
    id: string,
    data: Partial<{ title: string; description: string | null; techStack: string | null; deadlineAt: string }>
  ) =>
    fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => json<ProjectWithRelations>(r)),

  deleteProject: (id: string) => fetch(`/api/projects/${id}`, { method: "DELETE" }).then((r) => json(r)),

  completeProject: (id: string, retro?: string) =>
    fetch(`/api/projects/${id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ retro }),
    }).then((r) => json<ProjectWithRelations>(r)),

  abandonProject: (id: string, retro?: string) =>
    fetch(`/api/projects/${id}/abandon`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ retro }),
    }).then((r) => json<ProjectWithRelations>(r)),

  createMilestone: (projectId: string, title: string) =>
    fetch(`/api/projects/${projectId}/milestones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).then((r) => json<Milestone>(r)),

  updateMilestone: (id: string, data: Partial<{ title: string; completed: boolean; order: number }>) =>
    fetch(`/api/milestones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => json<Milestone>(r)),

  deleteMilestone: (id: string) => fetch(`/api/milestones/${id}`, { method: "DELETE" }).then((r) => json(r)),

  upsertCheckIn: (projectId: string, data: { date?: string; built: string; blockers?: string; learned?: string }) =>
    fetch(`/api/projects/${projectId}/checkins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => json(r)),

  logFocusSession: (projectId: string, date?: string) =>
    fetch(`/api/projects/${projectId}/focus-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date }),
    }).then((r) => json(r)),

  getSummary: () => fetch("/api/summary", { cache: "no-store" }).then((r) => json<ForgeSummary | null>(r)),

  listReadingCabinBooks: () =>
    fetch("/api/reading-cabin/books", { cache: "no-store" }).then((r) => json<ReadingCabinBook[]>(r)),

  linkBook: (projectId: string, textbookId: string) =>
    fetch(`/api/projects/${projectId}/linked-books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ textbookId }),
    }).then((r) => json(r)),

  unlinkBook: (projectId: string, textbookId: string) =>
    fetch(`/api/projects/${projectId}/linked-books/${textbookId}`, { method: "DELETE" }).then((r) => json(r)),
};
