import { differenceInCalendarDays } from "date-fns";
import { cn } from "@/lib/utils";
import type { ProjectWithRelations } from "@/types";

function StatTile({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "positive" | "neutral" }) {
  return (
    <div className="rounded-lg border border-walnut-500/15 bg-parchment-paper p-4 shadow-soft">
      <p className="text-xs font-medium tracking-wide text-charcoal-600/50 uppercase">{label}</p>
      <p className={cn("mt-1 font-serif text-2xl", tone === "positive" ? "text-moss-600" : "text-canopy-950")}>
        {value}
      </p>
    </div>
  );
}

/**
 * Everything derived client-side from the same project list the Shelf grid
 * already fetches — no separate stats endpoint. Caller only renders this
 * once at least one project has finished (see ShelfView.tsx); the plain
 * "nothing here yet" EmptyState already covers the zero-finished case, so
 * this component doesn't need its own duplicate empty message.
 */
export function ForgeStatsPanel({ projects }: { projects: ProjectWithRelations[] }) {
  const finished = projects.filter((p) => p.status !== "ACTIVE");
  const completed = finished.filter((p) => p.status === "COMPLETED");
  const totalFocusSessions = projects.reduce(
    (sum, p) => sum + p.focusLogs.reduce((s, f) => s + f.count, 0),
    0
  );

  const completionRate = Math.round((completed.length / finished.length) * 100);
  const avgDays = Math.round(
    finished.reduce(
      (sum, p) => sum + Math.max(1, differenceInCalendarDays(new Date(p.completedAt!), new Date(p.startAt))),
      0
    ) / finished.length
  );
  const retros = finished.filter((p) => p.retro);

  return (
    <div className="mb-10">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Completion rate"
          value={`${completionRate}%`}
          tone={completionRate >= 50 ? "positive" : "neutral"}
        />
        <StatTile label="Projects finished" value={String(finished.length)} />
        <StatTile label="Avg. length" value={`${avgDays}d`} />
        <StatTile label="Focus sessions" value={String(totalFocusSessions)} />
      </div>

      {retros.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-xs font-medium tracking-wide text-charcoal-600/60 uppercase">Lessons learned</h2>
          <div className="flex flex-col gap-2">
            {retros.map((p) => (
              <div key={p.id} className="rounded-md border border-walnut-500/10 bg-parchment-paper/60 px-3 py-2.5">
                <p className="text-sm text-charcoal-800 italic">&ldquo;{p.retro}&rdquo;</p>
                <p className="mt-1 text-xs text-charcoal-600/50">
                  {p.title} · {p.status === "COMPLETED" ? "Completed" : "Abandoned"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
