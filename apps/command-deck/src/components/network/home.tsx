import { useEffect, useState } from "react";
import { BrainCircuit, Fingerprint, Radio, Scale, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DigitalLife } from "@/components/playground/life";
import { LensBar } from "@/components/playground/pill";
import { useIdentity } from "@/lib/identity";
import { licenseFor, useNetwork, type LicenseType } from "@/lib/network";
import { MOTTO, NETWORK_NAME, NETWORK_SHORT } from "@/lib/trv";

function LicenseMark({ license }: { license: LicenseType }) {
  if (license === "corporate") {
    return <p className="text-xs tracking-[0.16em] text-muted uppercase">Corporate license</p>;
  }
  return <p className="text-xs tracking-[0.16em] text-sage uppercase">Sovereign · We The People</p>;
}

export function NetworkHome() {
  const hydrate = useNetwork((s) => s.hydrate);
  const profile = useNetwork((s) => s.profile);
  const saveProfile = useNetwork((s) => s.saveProfile);
  const addInterest = useNetwork((s) => s.addInterest);
  const dropInterest = useNetwork((s) => s.dropInterest);
  const addFinance = useNetwork((s) => s.addFinance);
  const patchFinance = useNetwork((s) => s.patchFinance);
  const dropFinance = useNetwork((s) => s.dropFinance);
  const activateMesh = useNetwork((s) => s.activateMesh);
  const meshOn = useNetwork((s) => s.meshOn);
  const peers = useNetwork((s) => s.peers);
  const proposals = useNetwork((s) => s.proposals);
  const vote = useNetwork((s) => s.vote);
  const setSurface = useNetwork((s) => s.setSurface);
  const license = useNetwork((s) => s.license);
  const short = useIdentity((s) => s.short);
  const pubkey = useIdentity((s) => s.pubkey);
  const [tag, setTag] = useState("");
  const [tab, setTab] = useState<"profile" | "mesh" | "governance">("profile");

  useEffect(() => {
    hydrate();
    activateMesh();
  }, [activateMesh, hydrate]);

  useEffect(() => {
    if (pubkey) useNetwork.setState({ license: licenseFor(pubkey) });
  }, [pubkey]);

  const livePeers = peers.filter((p) => Date.now() - p.at < 45_000);

  return (
    <main
      className="min-h-dvh overflow-y-auto bg-background text-foreground"
      data-network="1"
      data-license={license}
    >
      <header className="sticky top-0 z-20 border-b border-border bg-background/92 px-4 pt-[max(0.7rem,env(safe-area-inset-top))] pb-3 backdrop-blur-md">
        <p className="text-center text-[10px] font-medium tracking-[0.32em] text-sage uppercase">{MOTTO}</p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <a href="/hub" className="min-w-0">
            <p className="text-[10px] tracking-[0.22em] text-muted uppercase">{NETWORK_SHORT} Network</p>
            <h1 className="font-display text-2xl font-semibold tracking-tight">{NETWORK_NAME}</h1>
          </a>
          <LicenseMark license={license} />
        </div>
        <LensBar />
      </header>

      <nav className="mx-auto flex max-w-lg gap-1 px-4 pt-3" aria-label="Network">
        {(
          [
            ["profile", "Profile"],
            ["mesh", "Mesh"],
            ["governance", "Governance"],
          ] as const
        ).map(([id, label]) => (
          <Button
            key={id}
            size="sm"
            variant={tab === id ? "selected" : "ghost"}
            aria-pressed={tab === id}
            onClick={() => setTab(id)}
          >
            {label}
          </Button>
        ))}
      </nav>

      <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-4 pb-28">
        {tab === "profile" ? (
          <section className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]" data-profile="1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl">Your Viewer</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  This profile lives on this device. Interests, finances, name — yours. Not a feed owned by a vendor.
                </p>
              </div>
              <Fingerprint className="size-5 text-sage" strokeWidth={1.75} />
            </div>
            <p className="mt-3 font-mono text-xs text-subtle">DID {short || "minting…"}</p>

            <label className="mt-4 block text-xs tracking-[0.14em] text-muted uppercase">
              Display name
              <input
                className="mt-1 w-full rounded-md bg-card-2 px-3 py-2 text-sm text-foreground outline-none shadow-[var(--shadow-border)]"
                value={profile.name}
                maxLength={48}
                placeholder="Your name on the Network"
                onChange={(e) => saveProfile({ name: e.target.value })}
              />
            </label>
            <label className="mt-3 block text-xs tracking-[0.14em] text-muted uppercase">
              Handle
              <input
                className="mt-1 w-full rounded-md bg-card-2 px-3 py-2 text-sm text-foreground outline-none shadow-[var(--shadow-border)]"
                value={profile.handle}
                maxLength={24}
                placeholder="@viewer"
                onChange={(e) => saveProfile({ handle: e.target.value.replace(/\s/g, "") })}
              />
            </label>
            <label className="mt-3 block text-xs tracking-[0.14em] text-muted uppercase">
              About
              <textarea
                className="mt-1 min-h-24 w-full rounded-md bg-card-2 px-3 py-2 text-sm text-foreground outline-none shadow-[var(--shadow-border)]"
                value={profile.bio}
                maxLength={280}
                placeholder="What this Viewer stands for."
                onChange={(e) => saveProfile({ bio: e.target.value })}
              />
            </label>

            <p className="mt-4 text-xs tracking-[0.14em] text-muted uppercase">Interests</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {profile.interests.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="rounded-full bg-card-2 px-2.5 py-1 text-xs text-foreground shadow-[var(--shadow-border)]"
                  onClick={() => dropInterest(item)}
                >
                  {item} ×
                </button>
              ))}
            </div>
            <form
              className="mt-2 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                addInterest(tag);
                setTag("");
              }}
            >
              <input
                className="min-w-0 flex-1 rounded-md bg-card-2 px-3 py-2 text-sm outline-none shadow-[var(--shadow-border)]"
                value={tag}
                maxLength={32}
                placeholder="Add an interest"
                onChange={(e) => setTag(e.target.value)}
              />
              <Button size="sm" variant="solid" type="submit">
                Add
              </Button>
            </form>

            <p className="mt-5 text-xs tracking-[0.14em] text-muted uppercase">Finances — local vault</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Notes on this device. Not a bank. Not a vendor ledger. You edit it.
            </p>
            <ul className="mt-2 space-y-2">
              {profile.finance.map((row) => (
                <li key={row.id} className="rounded-lg bg-card-2 p-2 shadow-[var(--shadow-border)]">
                  <input
                    className="w-full bg-transparent text-sm outline-none"
                    value={row.label}
                    maxLength={32}
                    aria-label="Finance label"
                    onChange={(e) => patchFinance(row.id, { label: e.target.value })}
                  />
                  <input
                    className="mt-1 w-full bg-transparent text-xs text-muted outline-none"
                    value={row.note}
                    maxLength={120}
                    placeholder="Amount, hold, or note"
                    onChange={(e) => patchFinance(row.id, { note: e.target.value })}
                  />
                  <button type="button" className="mt-1 text-[11px] text-ember" onClick={() => dropFinance(row.id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <Button size="sm" variant="ghost" className="mt-2" onClick={addFinance}>
              Add a finance line
            </Button>

            <DigitalLife />
          </section>
        ) : null}

        {tab === "mesh" ? (
          <section className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]" data-mesh="1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl">Hydra mesh</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  This browser node broadcasts on the local channel. Pixel / GrapheneOS ARM64 Hydra
                  (`remote-viewer-android-arm64`) is the native node — same DID, Wi-Fi Direct, Titan M2.
                </p>
              </div>
              <Radio className={`size-5 ${meshOn ? "text-sage" : "text-muted"}`} strokeWidth={1.75} />
            </div>
            <p className="mt-3 text-sm">
              Mesh {meshOn ? "active" : "idle"} · {livePeers.length} peer{livePeers.length === 1 ? "" : "s"} on this
              device channel
            </p>
            <Button size="sm" variant="primary" className="mt-3" onClick={activateMesh}>
              Activate node
            </Button>
            <ul className="mt-3 space-y-1 font-mono text-xs text-subtle">
              {livePeers.length === 0 ? <li>No other tab on this mesh yet. Open a second Viewer on this Wi-Fi.</li> : null}
              {livePeers.map((p) => (
                <li key={p.id}>{p.id.slice(0, 8)}…</li>
              ))}
            </ul>
          </section>
        ) : null}

        {tab === "governance" ? (
          <section className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]" data-governance="1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl">Sentinel governance</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Votes bind to this device DID. Integrity is local first.
                </p>
              </div>
              <Scale className="size-5 text-sage" strokeWidth={1.75} />
            </div>
            <p className="mt-2 text-xs text-sage">Network integrity: Stable</p>
            <ul className="mt-3 space-y-3">
              {proposals.map((p) => {
                const mine = pubkey ? p.votes[pubkey] : undefined;
                const ayes = Object.values(p.votes).filter((v) => v === "aye").length;
                const nays = Object.values(p.votes).filter((v) => v === "nay").length;
                return (
                  <li key={p.id} className="rounded-lg bg-card-2 p-3 shadow-[var(--shadow-border)]">
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{p.body}</p>
                    <p className="mt-2 font-mono text-[11px] text-subtle">
                      Aye {ayes} · Nay {nays}
                      {mine ? ` · you ${mine}` : ""}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant={mine === "aye" ? "selected" : "ghost"} onClick={() => vote(p.id, "aye")}>
                        Aye
                      </Button>
                      <Button size="sm" variant={mine === "nay" ? "selected" : "ghost"} onClick={() => vote(p.id, "nay")}>
                        Nay
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <section className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
          <div className="flex items-center gap-2 text-sage">
            <Shield className="size-4" strokeWidth={1.75} />
            <p className="text-xs tracking-[0.16em] uppercase">Doors — not the home</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            The Network is first. Neural watch is optional. God's Eye waits until you name the neuron.
          </p>
          <Button
            variant="solid"
            className="mt-3 w-full"
            onClick={() => {
              useNetwork.getState().setSurface("watch");
              window.location.assign("/hub/deck?door=neural");
            }}
            aria-label="Open Neural Link"
          >
            <BrainCircuit className="size-4" strokeWidth={1.75} />
            Open Neural Link
          </Button>
        </section>
      </div>
    </main>
  );
}
