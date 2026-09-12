import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOTTO } from "@/lib/trv";
import { DRILL, liveOrder, useDrill, type LiveOrder } from "@/lib/tutorial";
import { KIND_LABEL, usePlayground } from "./store";
import { samplesOf, sigKey, useProgress } from "@/lib/progress";
import { usePulse } from "@/lib/pulse";
import { useSnapPressure } from "@/lib/live";

export function OrderStrip() {
  const theater = usePlayground((s) => s.theater);
  const selected = usePlayground((s) => s.selected);
  const count = usePlayground((s) => s.bodies.filter((b) => b.role === "threat").length);
  const look = usePlayground((s) => s.lookMode);
  const missed = usePulse((s) => s.missed);
  const snap = usePulse((s) => s.lastPhase === "snap");
  const now = useSnapPressure().lock;
  const wait = missed && !snap && !now;
  const learned = useProgress((s) => s.learned);
  const label = KIND_LABEL[theater][selected];
  const locked = samplesOf(learned, sigKey(theater, selected));
  const order = liveOrder({ theater, label, count, look, now, wait, locked });
  const bodies = usePlayground((s) => s.bodies);
  const labels = KIND_LABEL[theater];
  const n = { sphere: 0, box: 0, cylinder: 0 };
  for (const b of bodies) {
    if (b.role === "threat") n[b.kind] += 1;
  }
  return (
    <div>
      <p className="px-1 font-mono text-[10px] tracking-wide text-muted tabular-nums">
        Nearby {labels.sphere} {n.sphere} · {labels.box} {n.box} · {labels.cylinder} {n.cylinder}
      </p>
      <OrderCard order={order} />
    </div>
  );
}

function OrderCard({ order }: { order: LiveOrder }) {
  return (
    <div data-order="1" className="px-1 py-0.5">
      <p className="text-[11px] leading-snug text-foreground">
        <span className="mr-1 font-medium tracking-[0.16em] text-sage uppercase">Need</span>
        {order.need}
        <span className="mx-1.5 text-subtle">·</span>
        <span className="mr-1 font-medium tracking-[0.16em] text-sage uppercase">How</span>
        <span className="text-muted">{order.how}</span>
      </p>
    </div>
  );
}

export function DrillGate() {
  const ready = useDrill((s) => s.ready);
  const open = useDrill((s) => s.open);
  const step = useDrill((s) => s.step);
  const next = useDrill((s) => s.next);
  const skip = useDrill((s) => s.skip);
  if (!ready || !open) return null;
  const row = DRILL[step] ?? DRILL[0];
  const last = step >= DRILL.length - 1;
  const n = DRILL.length;

  return (
    <div
      role="dialog"
      aria-label="Command Deck drill"
      data-drill="1"
      data-drill-step={row.id}
      className="drill-gate pointer-events-auto absolute inset-0 z-40"
    >
      <div className="drill-veil" aria-hidden="true" />
      <div className="drill-card">
        <p className="text-xs font-medium tracking-[0.28em] text-sage uppercase">{row.kicker}</p>
        <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-foreground">{row.title}</h2>
        <p className="mt-4 text-xs font-medium tracking-[0.18em] text-sage uppercase">Need</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">{row.need}</p>
        <p className="mt-3 text-xs font-medium tracking-[0.18em] text-sage uppercase">How</p>
        <ol className="mt-1 list-decimal space-y-1 pl-4 text-sm leading-relaxed text-muted">
          {(Array.isArray(row.how) ? row.how : [String(row.how)]).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
        <p className="mt-4 font-mono text-xs text-subtle tabular-nums">
          {step + 1} / {n}
        </p>
        <div className="mt-4 flex gap-2">
          <Button variant="primary" className="flex-1" onClick={next} aria-label={last ? "Begin watch" : "Next drill step"} data-drill-next="1">
            {last ? "Begin watch" : "Next"}
          </Button>
          {last ? null : (
            <Button variant="ghost" onClick={skip} aria-label="Skip drill" data-drill-skip="1">
              Skip
            </Button>
          )}
        </div>
        <p className="mt-3 text-center text-xs tracking-[0.18em] text-sage uppercase">{MOTTO}</p>
      </div>
    </div>
  );
}

export function DrillChip({ onOpen }: { onOpen: () => void }) {
  return (
    <Button variant="ghost" aria-label="Replay Command Deck drill" onClick={onOpen} data-drill-chip="1">
      <BookOpen className="size-4" strokeWidth={1.75} />
    </Button>
  );
}
