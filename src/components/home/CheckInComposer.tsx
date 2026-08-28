"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { api } from "@/lib/api-client";
import { todayKey } from "@/lib/dateKey";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";
import type { CheckIn } from "@/types";

export function CheckInComposer({
  projectId,
  checkIns,
  onChange,
}: {
  projectId: string;
  checkIns: CheckIn[];
  onChange: () => void;
}) {
  const today = todayKey();
  const todaysEntry = checkIns.find((c) => format(new Date(c.date), "yyyy-MM-dd") === today);

  const [built, setBuilt] = useState(todaysEntry?.built ?? "");
  const [blockers, setBlockers] = useState(todaysEntry?.blockers ?? "");
  const [learned, setLearned] = useState(todaysEntry?.learned ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBuilt(todaysEntry?.built ?? "");
    setBlockers(todaysEntry?.blockers ?? "");
    setLearned(todaysEntry?.learned ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todaysEntry?.id]);

  async function handleSave() {
    if (!built.trim()) return;
    setSaving(true);
    try {
      await api.upsertCheckIn(projectId, {
        built,
        blockers: blockers.trim() || undefined,
        learned: learned.trim() || undefined,
      });
      setSaved(true);
      onChange();
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  const past = [...checkIns]
    .filter((c) => c.id !== todaysEntry?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <h2 className="mb-2 text-xs font-medium tracking-wide text-charcoal-600/60 uppercase">Today&apos;s check-in</h2>
      <div className="rounded-lg border border-walnut-500/15 bg-parchment-paper p-4 shadow-soft">
        <div className="flex flex-col gap-3">
          <Field label="What did you build today?" required>
            <Textarea
              rows={2}
              value={built}
              onChange={(e) => setBuilt(e.target.value)}
              placeholder="A rough bootloader that prints to the screen…"
            />
          </Field>
          <Field label="What blocked you?" hint="Optional">
            <Textarea rows={2} value={blockers} onChange={(e) => setBlockers(e.target.value)} />
          </Field>
          <Field label="What did you learn?" hint="Optional">
            <Textarea rows={2} value={learned} onChange={(e) => setLearned(e.target.value)} />
          </Field>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSave} disabled={!built.trim() || saving}>
              {saving ? "Saving…" : todaysEntry ? "Update check-in" : "Save check-in"}
            </Button>
            {saved && <span className="text-xs text-moss-600">Saved.</span>}
          </div>
        </div>
      </div>

      {past.length > 0 && (
        <div className="mt-4 space-y-2">
          {past.map((c) => (
            <div key={c.id} className="rounded-md border border-walnut-500/10 bg-parchment-paper/60 px-3 py-2.5 text-sm">
              <p className="text-xs font-medium text-charcoal-600/50">{format(new Date(c.date), "EEE, MMM d")}</p>
              <p className="mt-1 text-charcoal-800">{c.built}</p>
              {c.blockers && <p className="mt-1 text-xs text-clay-500">Blocked: {c.blockers}</p>}
              {c.learned && <p className="mt-1 text-xs text-moss-600">Learned: {c.learned}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
