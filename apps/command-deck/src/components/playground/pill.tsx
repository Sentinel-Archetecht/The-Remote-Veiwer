import { useEffect, useRef, useState } from "react";
import { Eye, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOTTO, NETWORK_NAME } from "@/lib/trv";
import { PILL_TAG, usePill, viewingLens } from "@/lib/pill";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

const X_PROVIDER = GROK_PROVIDERS.find((p) => p.idp === "twitter");
const WIDE_MQ = "(min-width: 880px) and (min-aspect-ratio: 4/3)";

function signInWithX() {
  if (!authEnabled || !X_PROVIDER) return;
  void signIn(X_PROVIDER.providerId, { callbackURL: "/" });
}

function GatewayFilm() {
  const ref = useRef<HTMLVideoElement>(null);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(WIDE_MQ);
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (reduce.matches) {
        video.pause();
        return;
      }
      void video.play().catch(() => undefined);
    };
    sync();
    reduce.addEventListener("change", sync);
    return () => reduce.removeEventListener("change", sync);
  }, [wide]);

  const src = wide ? "/gateway/eye-wide.mp4" : "/gateway/eye.mp4";
  const poster = wide ? "/gateway/eye-wide.jpg" : "/gateway/eye.jpg";

  return (
    <video
      key={src}
      ref={ref}
      className="gateway-film"
      data-gateway-eye="1"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={poster}
      aria-hidden="true"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

export function useHydratePill() {
  useEffect(() => {
    usePill.getState().hydrate();
  }, []);
}

export function PillGate() {
  const lens = usePill((s) => s.lens);
  const choose = usePill((s) => s.choose);

  if (lens) return null;

  return (
    <div
      role="dialog"
      aria-label="Gateway. Choose red or blue lens"
      data-pill-gate="1"
      className="gateway-gate pointer-events-auto absolute inset-0 z-50 overflow-hidden text-foreground"
    >
      <GatewayFilm />
      <div className="gateway-veil" aria-hidden="true" />
      <div className="gateway-copy">
        <p className="gateway-rise text-center text-xs font-medium tracking-[0.32em] text-sage uppercase">{MOTTO}</p>
        <h1 className="gateway-rise font-display mt-3 text-center text-4xl font-semibold tracking-tight sm:text-5xl">
          {NETWORK_NAME}
        </h1>
        <p className="gateway-rise mt-2 text-center text-sm tracking-[0.18em] text-muted uppercase">How you hear the facts</p>
        <p className="gateway-rise mx-auto mt-2 max-w-sm text-center text-sm leading-relaxed text-muted">
          Same facts. Two deliveries. Red is the raw wire. Blue is the briefing.
        </p>
      </div>
      <div className="gateway-cta">
        <p className="mb-2 text-center text-xs tracking-[0.16em] text-sage uppercase">Tap a pill to enter</p>
        <div className="gateway-pills">
          <button
            type="button"
            className="gateway-pill gateway-pill-red"
            aria-label="Take the red pill. Raw wire. Same facts. No frame."
            data-pill-choose="red"
            onPointerUp={(e) => {
              e.preventDefault();
              choose("red");
            }}
          >
            <span className="gateway-pill-gloss" aria-hidden="true" />
            <span className="relative text-xs font-medium tracking-[0.22em] uppercase">Red pill</span>
            <span className="relative mt-1 text-sm">Raw wire</span>
            <span className="relative mt-1 text-xs leading-snug text-muted">No frame. Same facts.</span>
          </button>
          <button
            type="button"
            className="gateway-pill gateway-pill-blue"
            aria-label="Take the blue pill. Briefing. Same facts. Guided."
            data-pill-choose="blue"
            onPointerUp={(e) => {
              e.preventDefault();
              choose("blue");
            }}
          >
            <span className="gateway-pill-gloss" aria-hidden="true" />
            <span className="relative text-xs font-medium tracking-[0.22em] uppercase">Blue pill</span>
            <span className="relative mt-1 text-sm">Briefing</span>
            <span className="relative mt-1 text-xs leading-snug text-muted">Guided. Same facts.</span>
          </button>
        </div>
        <p className="mt-2 text-center text-xs leading-relaxed text-muted">Not two truths. One fact. Two ways it arrives.</p>
      </div>
    </div>
  );
}

export function LensBar() {
  const lens = usePill((s) => s.lens);
  const glimpse = usePill((s) => s.glimpse);
  const choose = usePill((s) => s.choose);
  const peek = usePill((s) => s.peek);
  const viewing = viewingLens({ lens, glimpse });
  if (!lens || !viewing) return null;
  const other = lens === "red" ? "blue" : "red";
  return (
    <div data-lens-bar="1" className="pointer-events-auto mt-1 w-fit max-w-full rounded-lg bg-card/85 p-1 shadow-[var(--shadow-border)]">
      <div className="flex items-center gap-0.5" role="group" aria-label="Choose how facts arrive">
        <Button
          size="sm"
          variant={lens === "red" && !glimpse ? "selected" : "ghost"}
          aria-pressed={lens === "red"}
          aria-label="Red pill. Raw wire. Same facts. No frame."
          data-pill-choose="red"
          onClick={() => choose("red")}
        >
          Red
        </Button>
        <Button
          size="sm"
          variant={lens === "blue" && !glimpse ? "selected" : "ghost"}
          aria-pressed={lens === "blue"}
          aria-label="Blue pill. Briefing. Same facts. Guided."
          data-pill-choose="blue"
          onClick={() => choose("blue")}
        >
          Blue
        </Button>
        <Button
          size="sm"
          variant={glimpse ? "selected" : "ghost"}
          aria-pressed={glimpse}
          aria-label={`Glimpse the ${other} lens of the same fact`}
          data-pill-glimpse="1"
          onClick={() => peek()}
        >
          <Eye className="size-3.5" strokeWidth={1.75} />
          Glimpse
        </Button>
      </div>
      <p className={`px-1.5 pt-0.5 text-[11px] leading-snug ${viewing === "red" ? "text-ember" : "text-muted"}`} data-pill-chip={viewing}>
        {glimpse ? `Glimpse · ${PILL_TAG[viewing]}` : PILL_TAG[lens]}
      </p>
    </div>
  );
}

export function PillChip() {
  return <LensBar />;
}

export function PillAfter({ onPlay }: { onPlay: () => void }) {
  const lens = usePill((s) => s.lens);
  if (!lens) return null;
  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm leading-relaxed text-muted">{PILL_TAG[lens]}</p>
      {authEnabled && X_PROVIDER ? (
        <Button variant="primary" className="w-full" onClick={signInWithX} aria-label="Sign in with X">
          <LogIn className="size-4" strokeWidth={1.75} />
          Sign in with X
        </Button>
      ) : null}
      <Button variant="ghost" className="w-full" onClick={onPlay} aria-label="Play as Viewer key">
        Play as Viewer key
      </Button>
    </div>
  );
}
