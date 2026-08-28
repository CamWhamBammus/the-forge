"use client";

import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { Milestone } from "@/types";

export function MilestoneChecklist({
  projectId,
  milestones,
  onChange,
}: {
  projectId: string;
  milestones: Milestone[];
  onChange: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);

  const sorted = [...milestones].sort((a, b) => a.order - b.order);
  const done = sorted.filter((m) => m.completed).length;

  async function handleAdd() {
    const title = draft.trim();
    if (!title) return;
    setAdding(true);
    try {
      await api.createMilestone(projectId, title);
      setDraft("");
      onChange();
    } finally {
      setAdding(false);
    }
  }

  async function toggle(m: Milestone) {
    await api.updateMilestone(m.id, { completed: !m.completed });
    onChange();
  }

  async function remove(id: string) {
    await api.deleteMilestone(id);
    onChange();
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-xs font-medium tracking-wide text-charcoal-600/60 uppercase">Milestones</h2>
        {sorted.length > 0 && (
          <span className="text-xs text-charcoal-600/50">
            {done}/{sorted.length}
          </span>
        )}
      </div>

      <div className="rounded-lg border border-walnut-500/15 bg-parchment-paper shadow-soft">
        {sorted.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-charcoal-600/50">
            No milestones yet — break the goal into a few daily targets.
          </p>
        ) : (
          <div className="divide-y divide-walnut-500/8">
            {sorted.map((m) => (
              <div key={m.id} className="group flex items-center gap-3 px-4 py-2.5">
                <button
                  onClick={() => toggle(m)}
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                    m.completed
                      ? "border-moss-600 bg-moss-600 text-parchment-50"
                      : "border-walnut-500/40 hover:border-moss-500"
                  )}
                >
                  {m.completed && <Check size={12} />}
                </button>
                <span
                  className={cn(
                    "flex-1 text-sm",
                    m.completed ? "text-charcoal-600/40 line-through" : "text-charcoal-800"
                  )}
                >
                  {m.title}
                </span>
                <button
                  onClick={() => remove(m.id)}
                  className="rounded p-1 text-charcoal-600/30 opacity-0 transition-opacity hover:bg-clay-500/10 hover:text-clay-500 group-hover:opacity-100"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-walnut-500/10 px-3 py-2.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Add a milestone…"
            className="h-8 flex-1 rounded-md border border-walnut-500/20 bg-transparent px-2.5 text-sm text-charcoal-800 placeholder:text-charcoal-600/40 focus:border-moss-500 focus:outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={!draft.trim() || adding}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-moss-600 hover:bg-moss-600/10 disabled:opacity-40"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
