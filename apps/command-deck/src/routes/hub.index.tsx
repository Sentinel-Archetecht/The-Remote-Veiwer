import { createFileRoute } from "@tanstack/react-router";
import { BrainCircuit, Globe, Map as MapIcon, Radio, Shield } from "lucide-react";
import { HUB_MAP, MOTTO, NETWORK_NAME, NETWORK_SHORT } from "@/lib/trv";

export const Route = createFileRoute("/hub/")({ component: HubMap });

const ICONS = {
  network: Radio,
  neural: BrainCircuit,
  orbit: Globe,
  deck: Shield,
  gateway: MapIcon,
} as const;

function HubMap() {
  return (
    <main
      className="min-h-dvh bg-background px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-16 text-foreground"
      data-hub-map="1"
    >
      <p className="text-center text-[10px] font-medium tracking-[0.32em] text-sage uppercase">{MOTTO}</p>
      <p className="mt-3 text-center text-[10px] tracking-[0.22em] text-muted uppercase">{NETWORK_SHORT} HUB</p>
      <h1 className="font-display mt-1 text-center text-3xl font-semibold tracking-tight">{NETWORK_NAME}</h1>
      <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-relaxed text-muted">
        Map of the Network. Synapse is Neural Link. God's Eye is later. The watch is a door — not the home.
      </p>

      <ol className="mx-auto mt-8 flex max-w-lg flex-col gap-3">
        {HUB_MAP.map((room) => {
          const Icon = ICONS[room.door];
          return (
            <li key={room.door}>
              <a
                href={room.to}
                className="flex items-start gap-3 rounded-xl bg-card p-4 shadow-[var(--shadow-border)] transition-[transform,box-shadow] duration-[var(--motion-quick)] hover:shadow-[var(--shadow-border-hover)] active:scale-[0.99]"
              >
                <span className="mt-0.5 text-sage">
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-lg">{room.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{room.line}</span>
                  <span className="mt-2 block font-mono text-[11px] text-subtle">{room.to}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
