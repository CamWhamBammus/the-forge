"use client";

import { useEffect, useState } from "react";
import { Award, Flame } from "lucide-react";
import { api } from "@/lib/api-client";
import { temperTier } from "@/lib/temper";
import { todayKey } from "@/lib/dateKey";
import { format } from "date-fns";
import type { ProjectWithRelations } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Field";
import { CountdownHero } from "@/components/home/CountdownHero";
import { TemperGauge } from "@/components/home/TemperGauge";
import { MilestoneChecklist } from "@/components/home/MilestoneChecklist";
import { CheckInComposer } from "@/components/home/CheckInComposer";
import { FocusTimer } from "@/components/home/FocusTimer";
import { EmptyProjectState } from "@/components/home/EmptyProjectState";
import { LinkedBooksPanel } from "@/components/home/LinkedBooksPanel";

type OutcomeAction = "complete" | "abandon" | null;

export default function HomePage() {
  const [project, setProject] = useState<ProjectWithRelations | null | undefined>(undefined);
  const [outcomeAction, setOutcomeAction] = useState<OutcomeAction>(null);
  const [retro, setRetro] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    api.getActiveProject().then(setProject);
  }

  useEffect(refresh, []);

  if (project === undefined) {
    return <div className="p-10 text-sm text-charcoal-600/50">Stoking the forge…</div>;
  }

  if (project === null) {
    return (
      <main className="paper-grain mx-auto min-h-screen max-w-2xl px-6 py-12">
        <EmptyProjectState onCreated={refresh} />
      </main>
    );
  }

  const tier = temperTier(project.checkIns);
  const sessionsToday = project.focusLogs.find((f) => format(new Date(f.date), "yyyy-MM-dd") === todayKey())?.count ?? 0;

  async function handleOutcome() {
    if (!outcomeAction) return;
    setSubmitting(true);
    try {
      if (outcomeAction === "complete") await api.completeProject(project!.id, retro.trim() || undefined);
      else await api.abandonProject(project!.id, retro.trim() || undefined);
      setOutcomeAction(null);
      setRetro("");
      refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="paper-grain mx-auto min-h-screen max-w-3xl px-6 py-12">
      <header className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 className="font-serif text-3xl text-canopy-950">{project.title}</h1>
          {project.techStack && <p className="mt-1 text-sm text-charcoal-600/60">{project.techStack}</p>}
          {project.description && <p className="mt-2 text-sm text-charcoal-600">{project.description}</p>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3">
          <CountdownHero deadlineAt={project.deadlineAt} />
          <TemperGauge tier={tier} />
        </div>
      </header>

      <div className="mt-8 flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => setOutcomeAction("complete")}>
          <Award size={14} />
          Mark complete
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOutcomeAction("abandon")}>
          <Flame size={14} />
          Abandon
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <MilestoneChecklist projectId={project.id} milestones={project.milestones} onChange={refresh} />
        <FocusTimer projectId={project.id} sessionsToday={sessionsToday} />
      </div>

      <div className="mt-8">
        <LinkedBooksPanel projectId={project.id} linkedBooks={project.linkedBooks} onChange={refresh} />
      </div>

      <div className="mt-8">
        <CheckInComposer projectId={project.id} checkIns={project.checkIns} onChange={refresh} />
      </div>

      <Modal
        open={outcomeAction !== null}
        onClose={() => setOutcomeAction(null)}
        title={outcomeAction === "complete" ? "Mark this project complete?" : "Abandon this project?"}
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-charcoal-600">
            {outcomeAction === "complete"
              ? "It'll move to the Forge Shelf as finished."
              : "That's fine — honest data is still data. It'll move to the Forge Shelf as abandoned."}
          </p>
          <Textarea
            rows={3}
            value={retro}
            onChange={(e) => setRetro(e.target.value)}
            placeholder="Any reflection — what worked, what you'd do differently…"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOutcomeAction(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleOutcome} disabled={submitting}>
              {submitting ? "Saving…" : outcomeAction === "complete" ? "Complete it" : "Abandon it"}
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
