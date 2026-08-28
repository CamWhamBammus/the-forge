"use client";

import { useState } from "react";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StartProjectModal } from "./StartProjectModal";

export function EmptyProjectState({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-md py-16">
      <EmptyState icon={Flame} message="Nothing on the anvil right now." />
      <div className="mt-4 flex justify-center">
        <Button onClick={() => setOpen(true)}>Start this week&apos;s project</Button>
      </div>
      <StartProjectModal open={open} onClose={() => setOpen(false)} onCreated={onCreated} />
    </div>
  );
}
