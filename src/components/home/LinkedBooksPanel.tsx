"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { api } from "@/lib/api-client";
import { readingCabinBookUrl, readingCabinCoverUrl } from "@/lib/readingCabin";
import type { ReadingCabinBook } from "@/lib/readingCabin";
import { Select } from "@/components/ui/Field";
import type { LinkedBook } from "@/types";

export function LinkedBooksPanel({
  projectId,
  linkedBooks,
  onChange,
}: {
  projectId: string;
  linkedBooks: LinkedBook[];
  onChange: () => void;
}) {
  const [books, setBooks] = useState<ReadingCabinBook[] | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api
      .listReadingCabinBooks()
      .then(setBooks)
      .catch(() => setUnavailable(true));
  }, []);

  const linkedIds = new Set(linkedBooks.map((lb) => lb.textbookId));
  const linked = (books ?? []).filter((b) => linkedIds.has(b.id));
  const unlinked = (books ?? []).filter((b) => !linkedIds.has(b.id));

  async function handleAdd() {
    if (!selectedToAdd) return;
    setAdding(true);
    try {
      await api.linkBook(projectId, selectedToAdd);
      setSelectedToAdd("");
      onChange();
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(textbookId: string) {
    await api.unlinkBook(projectId, textbookId);
    onChange();
  }

  return (
    <div>
      <h2 className="mb-2 text-xs font-medium tracking-wide text-charcoal-600/60 uppercase">Reading for this</h2>

      {unavailable ? (
        <p className="rounded-lg border border-walnut-500/15 bg-parchment-paper px-4 py-4 text-sm text-charcoal-600/50 shadow-soft">
          Reading Cabin isn&apos;t running — launch it from The Lodge to link and track books.
        </p>
      ) : (
        <div className="rounded-lg border border-walnut-500/15 bg-parchment-paper shadow-soft">
          {linkedBooks.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-charcoal-600/50">
              No books linked yet — pull in what you&apos;re reading for this project.
            </p>
          ) : (
            <div className="divide-y divide-walnut-500/8">
              {linked.map((book) => (
                <div key={book.id} className="group flex items-center gap-3 px-4 py-3">
                  <div className="h-14 w-10 shrink-0 overflow-hidden rounded-sm shadow-soft ring-1 ring-walnut-900/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={readingCabinCoverUrl(book.id)}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.visibility = "hidden";
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-canopy-900">{book.title}</p>
                    {book.author && <p className="truncate text-xs text-charcoal-600/50">{book.author}</p>}
                    <div className="mt-1.5 flex max-w-32 items-center gap-2">
                      <span className="h-1 flex-1 overflow-hidden rounded-full bg-walnut-500/15">
                        <span className="block h-full bg-moss-600" style={{ width: `${book.percentComplete}%` }} />
                      </span>
                      <span className="shrink-0 text-[11px] text-charcoal-600/50">{book.percentComplete}%</span>
                    </div>
                  </div>
                  <a
                    href={readingCabinBookUrl(book.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-xs font-medium text-moss-600 hover:underline"
                  >
                    Continue →
                  </a>
                  <button
                    onClick={() => handleRemove(book.id)}
                    aria-label={`Unlink ${book.title}`}
                    className="shrink-0 rounded p-1 text-charcoal-600/30 opacity-0 transition-opacity hover:bg-clay-500/10 hover:text-clay-500 group-hover:opacity-100"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {unlinked.length > 0 && (
            <div className="flex items-center gap-2 border-t border-walnut-500/10 px-3 py-2.5">
              <Select
                value={selectedToAdd}
                onChange={(e) => setSelectedToAdd(e.target.value)}
                className="h-8 flex-1 text-sm"
              >
                <option value="">Add a book…</option>
                {unlinked.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </Select>
              <button
                onClick={handleAdd}
                disabled={!selectedToAdd || adding}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-moss-600 hover:bg-moss-600/10 disabled:opacity-40"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
