import { Archive, Award } from "lucide-react";
import { differenceInCalendarDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import type { ProjectWithRelations } from "@/types";

export function ForgePlaqueCard({ project }: { project: ProjectWithRelations }) {
  const completed = project.status === "COMPLETED";
  const milestonesTotal = project.milestones.length;
  const milestonesDone = project.milestones.filter((m) => m.completed).length;
  const focusSessions = project.focusLogs.reduce((sum, f) => sum + f.count, 0);
  const days = project.completedAt
    ? Math.max(1, differenceInCalendarDays(new Date(project.completedAt), new Date(project.startAt)))
    : null;

  return (
    <div
      className="rounded-lg border border-walnut-500/15 bg-parchment-paper p-4 shadow-soft"
      style={{ boxShadow: "inset 0 1px 0 rgba(253,251,245,0.6), 0 1px 2px rgba(42,30,22,0.06)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-lg text-canopy-900">{project.title}</h3>
          {project.techStack && <p className="mt-0.5 text-xs text-charcoal-600/60">{project.techStack}</p>}
        </div>
        <span
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
            completed ? "bg-moss-600/12 text-moss-600" : "bg-charcoal-600/8 text-charcoal-600"
          )}
        >
          {completed ? <Award size={11} /> : <Archive size={11} />}
          {completed ? "Completed" : "Abandoned"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal-600/60">
        {days !== null && (
          <span>
            {days} day{days === 1 ? "" : "s"}
          </span>
        )}
        {milestonesTotal > 0 && (
          <span>
            {milestonesDone}/{milestonesTotal} milestones
          </span>
        )}
        {focusSessions > 0 && (
          <span>
            {focusSessions} focus session{focusSessions === 1 ? "" : "s"}
          </span>
        )}
        {project.completedAt && <span>{format(new Date(project.completedAt), "MMM d, yyyy")}</span>}
      </div>

      {project.retro && (
        <p className="mt-3 border-t border-walnut-500/10 pt-3 text-sm text-charcoal-800 italic">
          &ldquo;{project.retro}&rdquo;
        </p>
      )}
    </div>
  );
}
