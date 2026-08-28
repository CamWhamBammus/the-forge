"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "the-forge:focus-durations";
const DEFAULT_WORK_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;
const MAX_WORK_MINUTES = 180;
const MAX_BREAK_MINUTES = 60;

type Phase = "work" | "break";

/** A personal preference, not project data — kept in localStorage, same pattern as useDailyGoal in Reading Cabin. */
function readStoredDurations(): { work: number; break: number } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { work: DEFAULT_WORK_MINUTES, break: DEFAULT_BREAK_MINUTES };
    const parsed = JSON.parse(raw);
    const work = Number(parsed.work);
    const brk = Number(parsed.break);
    return {
      work: Number.isFinite(work) && work > 0 ? work : DEFAULT_WORK_MINUTES,
      break: Number.isFinite(brk) && brk > 0 ? brk : DEFAULT_BREAK_MINUTES,
    };
  } catch {
    return { work: DEFAULT_WORK_MINUTES, break: DEFAULT_BREAK_MINUTES };
  }
}

export function FocusTimer({ projectId, sessionsToday }: { projectId: string; sessionsToday: number }) {
  const [workMinutes, setWorkMinutes] = useState(DEFAULT_WORK_MINUTES);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK_MINUTES);
  const [phase, setPhase] = useState<Phase>("work");
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_WORK_MINUTES * 60);
  const [running, setRunning] = useState(false);
  const [completedCount, setCompletedCount] = useState(sessionsToday);
  const [editing, setEditing] = useState(false);
  const [workDraft, setWorkDraft] = useState(String(DEFAULT_WORK_MINUTES));
  const [breakDraft, setBreakDraft] = useState(String(DEFAULT_BREAK_MINUTES));

  useEffect(() => {
    const stored = readStoredDurations();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWorkMinutes(stored.work);
    setBreakMinutes(stored.break);
    setSecondsLeft(stored.work * 60);
    setWorkDraft(String(stored.work));
    setBreakDraft(String(stored.break));
  }, []);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  // Reacting to secondsLeft hitting 0 (rather than embedding the phase
  // transition inside the tick's setState updater) keeps the side effects —
  // the focus-log POST, the phase flip — out of a React state updater,
  // which must stay pure.
  useEffect(() => {
    if (secondsLeft !== 0) return;
    if (phase === "work") {
      api.logFocusSession(projectId).then(() => setCompletedCount((c) => c + 1));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("break");
      setSecondsLeft(breakMinutes * 60);
    } else {
      setPhase("work");
      setSecondsLeft(workMinutes * 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  function reset() {
    setRunning(false);
    setPhase("work");
    setSecondsLeft(workMinutes * 60);
  }

  function saveDurations() {
    const work = Math.max(1, Math.min(MAX_WORK_MINUTES, Math.round(Number(workDraft)) || DEFAULT_WORK_MINUTES));
    const brk = Math.max(1, Math.min(MAX_BREAK_MINUTES, Math.round(Number(breakDraft)) || DEFAULT_BREAK_MINUTES));
    setWorkMinutes(work);
    setBreakMinutes(brk);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ work, break: brk }));
    setEditing(false);
    // Only snap the live countdown to the new duration if nothing's
    // running — don't yank time out from under a session in progress.
    // It'll pick up the new length on the next phase change either way.
    if (!running) {
      setPhase("work");
      setSecondsLeft(work * 60);
    }
  }

  function startEditing() {
    setWorkDraft(String(workMinutes));
    setBreakDraft(String(breakMinutes));
    setEditing(true);
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-xs font-medium tracking-wide text-charcoal-600/60 uppercase">Focus timer</h2>
        <span className="text-xs text-charcoal-600/50">
          {completedCount} session{completedCount === 1 ? "" : "s"} today
        </span>
      </div>
      <div className="rounded-lg border border-walnut-500/15 bg-parchment-paper p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p
              className={cn(
                "font-serif text-3xl leading-none",
                phase === "work" ? "text-canopy-950" : "text-moss-600"
              )}
            >
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </p>
            <p className="mt-1 text-xs text-charcoal-600/50">{phase === "work" ? "Work" : "Break"}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRunning((r) => !r)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-moss-600 text-parchment-50 hover:bg-canopy-800"
            >
              {running ? <Pause size={15} /> : <Play size={15} />}
            </button>
            <button
              onClick={reset}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-walnut-500/25 text-charcoal-600 hover:border-walnut-500/50"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {editing ? (
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-walnut-500/10 pt-3">
            <label className="flex items-center gap-1.5 text-xs text-charcoal-600">
              Work
              <input
                type="number"
                min={1}
                max={MAX_WORK_MINUTES}
                value={workDraft}
                onChange={(e) => setWorkDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveDurations()}
                className="h-7 w-14 rounded border border-walnut-500/25 bg-parchment-50 px-1.5 text-xs text-charcoal-800 focus:border-moss-500 focus:outline-none"
              />
              min
            </label>
            <label className="flex items-center gap-1.5 text-xs text-charcoal-600">
              Break
              <input
                type="number"
                min={1}
                max={MAX_BREAK_MINUTES}
                value={breakDraft}
                onChange={(e) => setBreakDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveDurations()}
                className="h-7 w-14 rounded border border-walnut-500/25 bg-parchment-50 px-1.5 text-xs text-charcoal-800 focus:border-moss-500 focus:outline-none"
              />
              min
            </label>
            <button onClick={saveDurations} className="text-xs font-medium text-moss-600 hover:underline">
              Save
            </button>
            <button onClick={() => setEditing(false)} className="text-xs text-charcoal-600/50 hover:text-charcoal-600">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={startEditing}
            className="mt-3 block w-full border-t border-walnut-500/10 pt-3 text-left text-xs text-charcoal-600/50 hover:text-moss-600"
          >
            {workMinutes} min work / {breakMinutes} min break — edit
          </button>
        )}
      </div>
    </div>
  );
}
