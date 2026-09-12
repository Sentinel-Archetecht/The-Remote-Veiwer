import type { ErrorComponentProps } from "@tanstack/react-router";
import { MOTTO, NETWORK_NAME } from "@/lib/trv";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-[#070910] px-6 text-center text-[#ecece8]">
      <p className="text-xs font-medium tracking-[0.28em] text-[#c9a24a] uppercase">{MOTTO}</p>
      <h1 className="font-display text-2xl font-semibold tracking-tight">{NETWORK_NAME}</h1>
      <p className="max-w-md text-sm leading-relaxed text-[#9aa3ae]">
        The watch did not load. Reload. If it still fails, the field is down — not your keys.
      </p>
      <p className="max-w-md font-mono text-[11px] break-words text-[#5c6570]">{error.message}</p>
    </main>
  );
}
