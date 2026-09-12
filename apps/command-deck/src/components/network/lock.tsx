import { useEffect, useState } from "react";
import { Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  canBiometric,
  enrollBiometric,
  gateVaultUnlock,
  hasEnrolledBiometric,
  hasSessionPin,
  unlockWithPin,
} from "@/lib/biometric";
import { useIdentity } from "@/lib/identity";
import { MOTTO, NETWORK_NAME } from "@/lib/trv";

export function LockGate({ onOpen }: { onOpen: () => void }) {
  const pubkey = useIdentity((s) => s.pubkey);
  const short = useIdentity((s) => s.short);
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [bio, setBio] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    void canBiometric().then(setBio);
    setEnrolled(hasEnrolledBiometric());
  }, []);

  async function finger() {
    setBusy(true);
    setNote(null);
    try {
      const gate = enrolled
        ? await gateVaultUnlock("Unlock The Remote Viewer")
        : await enrollBiometric(pubkey || "viewer", short || "Viewer");
      if (gate.ok) {
        onOpen();
        return;
      }
      if (gate.reason === "cancelled") setNote("Fingerprint cancelled. Use PIN.");
      else setNote("Fingerprint unavailable on this device. Use PIN.");
    } finally {
      setBusy(false);
    }
  }

  async function pinUnlock() {
    setBusy(true);
    setNote(null);
    try {
      const gate = await unlockWithPin(pin);
      if (gate.ok) {
        onOpen();
        return;
      }
      setNote("Wrong PIN.");
    } catch (err) {
      setNote(err instanceof Error ? err.message : "PIN failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      className="grid min-h-dvh place-items-center bg-background px-4 text-foreground"
      data-lock-gate="1"
    >
      <div className="w-full max-w-sm rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <p className="text-center text-[10px] font-medium tracking-[0.32em] text-sage uppercase">{MOTTO}</p>
        <h1 className="font-display mt-2 text-center text-2xl font-semibold tracking-tight">{NETWORK_NAME}</h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-muted">
          Unlock this Viewer. Fingerprint first. PIN if the sensor is dark.
        </p>
        <Button className="mt-5 w-full" variant="primary" disabled={busy || !bio} onClick={() => void finger()}>
          <Fingerprint className="size-4" strokeWidth={1.75} />
          {enrolled ? "Unlock with fingerprint" : "Enroll fingerprint"}
        </Button>
        <p className="mt-4 text-center text-xs tracking-[0.16em] text-muted uppercase">or use PIN</p>
        <label className="mt-2 block">
          <span className="sr-only">Six-digit PIN</span>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            aria-label="Six-digit unlock PIN"
            className="h-11 w-full rounded-md bg-card-2 px-3 font-mono text-lg tracking-[0.4em] text-foreground shadow-[var(--shadow-border)] outline-none"
          />
        </label>
        <Button
          className="mt-2 w-full"
          variant="solid"
          disabled={busy || pin.length !== 6}
          onClick={() => void pinUnlock()}
        >
          {hasSessionPin() ? "Unlock with PIN" : "Set PIN and unlock"}
        </Button>
        {note ? <p className="mt-3 text-center text-sm text-ember">{note}</p> : null}
      </div>
    </main>
  );
}
