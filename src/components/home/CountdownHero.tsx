"use client";

import { useEffect, useState } from "react";
import { formatCountdown, isOverdue } from "@/lib/countdown";
import { cn } from "@/lib/utils";

export function CountdownHero({ deadlineAt }: { deadlineAt: string | Date }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const deadline = typeof deadlineAt === "string" ? new Date(deadlineAt) : deadlineAt;
  const overdue = isOverdue(deadline, now);

  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-charcoal-600/50 uppercase">
        {overdue ? "Time's up" : "Time remaining"}
      </p>
      <p className={cn("mt-1 font-serif text-4xl leading-none", overdue ? "text-clay-500" : "text-canopy-950")}>
        {formatCountdown(deadline, now)}
      </p>
    </div>
  );
}
