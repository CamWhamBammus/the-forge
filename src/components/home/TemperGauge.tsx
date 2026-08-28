import type { CSSProperties } from "react";
import type { TemperTier } from "@/lib/temper";
import { cn } from "@/lib/utils";

/** A single hand-drawn flame outline, matching the cabin's established one-off decorative glyph style. */
function FlameGlyph({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden="true">
      <path
        d="M12 21c-4 0-6.5-2.6-6.5-6 0-2.4 1.3-3.9 2.4-5.6.6 1 1.4 1.6 2.1 1.6-.5-2.6.4-5.4 3-8 .3 2.6 1.3 4 2.7 5.4 1.8 1.8 2.8 3.6 2.8 6.6 0 3.4-2.5 6-6.5 6Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M12 21c-1.8 0-3-1.2-3-2.8 0-1.2.7-1.9 1.2-2.7.4.7 1 1 1.3.9-.2-1.2.3-2.3 1.3-3.2.3 1.5 1.5 2.3 1.5 4 0 1.9-1.3 3.8-3.3 3.8Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface TierInfo {
  size: number;
  color: string;
  glow: boolean;
  label: string;
}

const TIERS: Record<TemperTier, TierInfo> = {
  cold: { size: 22, color: "text-charcoal-600/25", glow: false, label: "Cold — hasn't been touched in a few days" },
  cooling: { size: 24, color: "text-clay-500", glow: false, label: "Cooling — quiet for a couple days" },
  warm: { size: 27, color: "text-amber-500", glow: false, label: "Warm — checked in yesterday" },
  hot: { size: 30, color: "text-amber-500", glow: true, label: "Hot — checked in today" },
};

/** The project's momentum, at a glance — cools down if it goes quiet, flares back up the moment you check in. */
export function TemperGauge({ tier }: { tier: TemperTier }) {
  const info = TIERS[tier];

  return (
    <div className="flex items-center gap-2.5">
      <FlameGlyph
        className={cn(info.color, info.glow && "ember-glow drop-shadow-[0_0_6px_rgba(177,128,58,0.5)]")}
        style={{ width: info.size, height: info.size }}
      />
      <p className="text-sm text-charcoal-600/70">{info.label}</p>
    </div>
  );
}
