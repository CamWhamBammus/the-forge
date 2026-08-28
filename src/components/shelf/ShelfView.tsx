"use client";

import { useEffect, useState } from "react";
import { Award } from "lucide-react";
import { api } from "@/lib/api-client";
import { EmptyState } from "@/components/ui/EmptyState";
import { ForgePlaqueCard } from "./ForgePlaqueCard";
import { ForgeStatsPanel } from "./ForgeStatsPanel";
import type { ProjectWithRelations } from "@/types";

export function ShelfView() {
  const [projects, setProjects] = useState<ProjectWithRelations[] | null>(null);

  useEffect(() => {
    api.listProjects().then(setProjects);
  }, []);

  if (!projects) return <div className="p-10 text-sm text-charcoal-600/50">Looking over the shelf…</div>;

  const finished = projects
    .filter((p) => p.status !== "ACTIVE")
    .sort((a, b) => new Date(b.completedAt ?? 0).getTime() - new Date(a.completedAt ?? 0).getTime());

  return (
    <div>
      <h1 className="font-serif text-3xl text-canopy-950">The Forge Shelf</h1>
      <p className="mt-1 text-sm text-charcoal-600">
        Everything you&apos;ve built — and everything you didn&apos;t finish. Both count.
      </p>

      <div className="mt-8">
        {finished.length > 0 && <ForgeStatsPanel projects={projects} />}

        {finished.length === 0 ? (
          <EmptyState
            icon={Award}
            message="Nothing on the shelf yet — finish or abandon a project and it'll show up here."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {finished.map((p) => (
              <ForgePlaqueCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
