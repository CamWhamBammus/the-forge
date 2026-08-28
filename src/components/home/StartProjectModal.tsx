"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Select, TextInput, Textarea } from "@/components/ui/Field";
import { api } from "@/lib/api-client";
import type { ReadingCabinBook } from "@/lib/readingCabin";

const PRESETS: { label: string; hours: number | null }[] = [
  { label: "48 hours", hours: 48 },
  { label: "1 week", hours: 24 * 7 },
  { label: "2 weeks", hours: 24 * 14 },
  { label: "Custom", hours: null },
];

export function StartProjectModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [presetLabel, setPresetLabel] = useState("1 week");
  const [customDeadline, setCustomDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [books, setBooks] = useState<ReadingCabinBook[] | null>(null);
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBooks(null);
    api
      .listReadingCabinBooks()
      .then(setBooks)
      .catch(() => setBooks([]));
  }, [open]);

  function toggleBook(id: string) {
    setSelectedBookIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function resolveDeadline(): Date | null {
    const preset = PRESETS.find((p) => p.label === presetLabel);
    if (preset?.hours) return new Date(Date.now() + preset.hours * 60 * 60 * 1000);
    if (customDeadline) return new Date(customDeadline);
    return null;
  }

  async function handleCreate() {
    setError(null);
    const deadline = resolveDeadline();
    if (!title.trim() || !deadline) {
      setError("Give it a title and a deadline.");
      return;
    }
    setCreating(true);
    try {
      await api.createProject({
        title: title.trim(),
        description: description.trim() || undefined,
        techStack: techStack.trim() || undefined,
        deadlineAt: deadline.toISOString(),
        linkedBookIds: selectedBookIds.size > 0 ? [...selectedBookIds] : undefined,
      });
      setTitle("");
      setDescription("");
      setTechStack("");
      setSelectedBookIds(new Set());
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Start this week's project" width="lg">
      <div className="flex flex-col gap-4">
        <Field label="What are you building?" required>
          <TextInput
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Build a computer from scratch in C++"
          />
        </Field>
        <Field label="Description" hint="Optional">
          <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label="Tech / language" hint="Optional">
          <TextInput value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="C++" />
        </Field>
        <Field label="Deadline" required>
          <Select value={presetLabel} onChange={(e) => setPresetLabel(e.target.value)}>
            {PRESETS.map((p) => (
              <option key={p.label} value={p.label}>
                {p.label}
              </option>
            ))}
          </Select>
        </Field>
        {presetLabel === "Custom" && (
          <Field label="Custom deadline">
            <TextInput
              type="datetime-local"
              value={customDeadline}
              onChange={(e) => setCustomDeadline(e.target.value)}
            />
          </Field>
        )}

        {books && books.length > 0 && (
          <Field label="Books you're reading for this" hint="Optional">
            <div className="flex flex-col gap-1.5 rounded-md border border-walnut-500/20 p-2.5">
              {books.map((b) => (
                <label key={b.id} className="flex items-center gap-2 text-sm text-charcoal-800">
                  <input
                    type="checkbox"
                    checked={selectedBookIds.has(b.id)}
                    onChange={() => toggleBook(b.id)}
                    className="accent-moss-600"
                  />
                  {b.title}
                </label>
              ))}
            </div>
          </Field>
        )}

        {error && <p className="text-sm text-clay-500">{error}</p>}
        <div className="mt-1 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={creating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? "Starting…" : "Start the clock"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
