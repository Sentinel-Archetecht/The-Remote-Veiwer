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

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "set"] as const;

export function LockGate({ onOpen }: { onOpen: () => void }) {
  const pubkey = useIdentity((s) => s.pubkey);
  const short = useIdentity((s) => s.short);
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [stage, setStage] = useState<"enter" | "confirm">(hasSessionPin() ? "enter" : "confirm");
  const [busy, setBusy] = useState(false);
  const [bio, setBio] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const setting = !hasSessionPin();
  const shown = setting && stage === "confirm" && pin.length === 6 ? confirm : pin;

  useEffect(() => {
    void canBiometric().then(setBio);
    setEnrolled(hasEnrolledBiometric());
    setStage(hasSessionPin() ? "enter" : "confirm");
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
      if (gate.reason === "cancelled") setNote("Fingerprint cancelled. Set a six-digit PIN below.");
      else setNote("No fingerprint on this screen. Set a six-digit PIN.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(next: string) {
    if (next.length !== 6 || busy) return;
    setBusy(true);
    setNote(null);
    try {
      if (setting) {
        if (stage !== "confirm" || pin.length !== 6) {
          setPin(next);
          setConfirm("");
          setStage("confirm");
          setNote("Enter those six digits again to lock them in.");
          setBusy(false);
          return;
        }
        if (next !== pin) {
          setPin("");
          setConfirm("");
          setStage("confirm");
          setNote("PINs did not match. Set it again.");
          setBusy(false);
          return;
        }
      }
      const gate = await unlockWithPin(setting ? pin || next : next);
      if (gate.ok) {
        onOpen();
        return;
      }
      setNote(setting ? "Could not save the PIN on this device." : "Wrong PIN.");
      setPin("");
      setConfirm("");
    } catch (err) {
      setNote(err instanceof Error ? err.message : "PIN failed.");
    } finally {
      setBusy(false);
    }
  }

  function tap(key: string) {
    if (busy) return;
    const target = setting && stage === "confirm" && pin.length === 6 ? confirm : pin;
    const write = setting && stage === "confirm" && pin.length === 6 ? setConfirm : setPin;
    if (key === "⌫") {
      write(target.slice(0, -1));
      return;
    }
    if (key === "set") {
      void submit(target);
      return;
    }
    if (target.length >= 6) return;
    const next = (target + key).slice(0, 6);
    write(next);
    if (next.length === 6) void submit(next);
  }

  return (
    <main
      className="grid min-h-dvh place-items-center bg-background px-4 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] text-foreground"
      data-lock-gate="1"
    >
      <div className="w-full max-w-sm rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <p className="text-center text-[10px] font-medium tracking-[0.32em] text-sage uppercase">{MOTTO}</p>
        <h1 className="font-display mt-2 text-center text-2xl font-semibold tracking-tight">{NETWORK_NAME}</h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-muted">
          {setting
            ? stage === "confirm" && pin.length === 6
              ? "Again. Same six digits. That sets your PIN."
              : "Set a six-digit PIN. Tap the pad. This is yours — not a vendor login."
            : "Unlock this Viewer. Fingerprint if the sensor is live. PIN always works."}
        </p>
        {bio ? (
          <Button className="mt-4 w-full" variant="primary" disabled={busy} onClick={() => void finger()}>
            <Fingerprint className="size-4" strokeWidth={1.75} />
            {enrolled ? "Unlock with fingerprint" : "Enroll fingerprint"}
          </Button>
        ) : (
          <p className="mt-4 text-center text-xs text-subtle">Fingerprint needs this device, not a preview frame.</p>
        )}

        <div className="mt-5 flex justify-center gap-2" aria-label="PIN digits">
          {Array.from({ length: 6 }, (_, i) => (
            <span
              key={i}
              className={`grid size-10 place-items-center rounded-md font-mono text-lg shadow-[var(--shadow-border)] ${
                shown[i] ? "bg-primary text-primary-foreground" : "bg-card-2 text-muted"
              }`}
            >
              {shown[i] ? "•" : ""}
            </span>
          ))}
        </div>
        <p className="mt-2 text-center font-mono text-xs text-subtle">{shown.length}/6</p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {KEYS.map((key) => (
            <button
              key={key}
              type="button"
              disabled={busy}
              onClick={() => tap(key)}
              className="h-14 touch-manipulation rounded-md bg-card-2 text-lg font-medium shadow-[var(--shadow-border)] active:scale-[0.96]"
              aria-label={key === "⌫" ? "Backspace" : key === "set" ? "Set PIN" : `Digit ${key}`}
            >
              {key === "set" ? (setting ? "Set" : "Go") : key}
            </button>
          ))}
        </div>
        {note ? <p className="mt-3 text-center text-sm text-ember">{note}</p> : null}
      </div>
    </main>
  );
}
