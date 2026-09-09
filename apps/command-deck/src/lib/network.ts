import { create } from "zustand";
import { useIdentity } from "@/lib/identity";

export type LicenseType = "sovereign" | "corporate";
export type Surface = "network" | "watch" | "governance";
export type Vote = "aye" | "nay";

export type FinanceRow = { id: string; label: string; note: string };

export type ViewerProfile = {
  name: string;
  handle: string;
  bio: string;
  interests: string[];
  finance: FinanceRow[];
};

export type MeshPeer = { id: string; at: number };

export type Proposal = {
  id: string;
  title: string;
  body: string;
  votes: Record<string, Vote>;
};

const PROFILE_KEY = "trv.profile.v1";
const LICENSE_KEY = "trv.license.v1";
const SURFACE_KEY = "trv.surface.v1";
const VOTE_KEY = "trv.governance.v1";
const MESH_CH = "trv-hydra-mesh-v1";
const CORPORATE_KEYS: string[] = [];

const STARTER_PROPOSALS: Proposal[] = [
  {
    id: "protocol-1-1",
    title: "Protocol Update v1.1",
    body: "Keep the Network first. Neural watch is a door, not the landing.",
    votes: {},
  },
  {
    id: "mesh-wifi",
    title: "Mesh presence on Wi-Fi",
    body: "Each Viewer broadcasts on the local mesh. WebRTC here. Hydra Wi-Fi Direct on the native node.",
    votes: {},
  },
  {
    id: "sovereign-default",
    title: "Sovereign default license",
    body: "We The People. Corporate only if a signed corporate DID is on this device.",
    votes: {},
  },
];

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage blocked */
  }
}

function emptyProfile(): ViewerProfile {
  return { name: "", handle: "", bio: "", interests: [], finance: [] };
}

export function licenseFor(pubkey: string): LicenseType {
  if (pubkey && CORPORATE_KEYS.includes(pubkey)) return "corporate";
  return "sovereign";
}

type NetworkState = {
  ready: boolean;
  surface: Surface;
  profile: ViewerProfile;
  license: LicenseType;
  meshOn: boolean;
  peers: MeshPeer[];
  proposals: Proposal[];
  hydrate: () => void;
  setSurface: (surface: Surface) => void;
  saveProfile: (patch: Partial<ViewerProfile>) => void;
  addInterest: (tag: string) => void;
  dropInterest: (tag: string) => void;
  addFinance: () => void;
  patchFinance: (id: string, patch: Partial<FinanceRow>) => void;
  dropFinance: (id: string) => void;
  activateMesh: () => void;
  vote: (proposalId: string, vote: Vote) => void;
};

let mesh: BroadcastChannel | null = null;
let meshTimer: number | null = null;

function openMesh(onPeer: (peer: MeshPeer) => void) {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return;
  if (mesh) return;
  mesh = new BroadcastChannel(MESH_CH);
  mesh.onmessage = (ev) => {
    const data = ev.data as { t?: string; id?: string } | null;
    if (!data || data.t !== "ping" || !data.id) return;
    const self = useIdentity.getState().pubkey;
    if (data.id === self) return;
    onPeer({ id: data.id, at: Date.now() });
  };
}

function pingMesh() {
  const id = useIdentity.getState().pubkey || "anon";
  try {
    mesh?.postMessage({ t: "ping", id, at: Date.now() });
  } catch {
    /* channel closed */
  }
}

export const useNetwork = create<NetworkState>((set, get) => ({
  ready: false,
  surface: "network",
  profile: emptyProfile(),
  license: "sovereign",
  meshOn: false,
  peers: [],
  proposals: STARTER_PROPOSALS,
  hydrate: () => {
    const profile = { ...emptyProfile(), ...readJson<Partial<ViewerProfile>>(PROFILE_KEY, {}) };
    if (!Array.isArray(profile.interests)) profile.interests = [];
    if (!Array.isArray(profile.finance)) profile.finance = [];
    const storedVotes = readJson<Record<string, Record<string, Vote>>>(VOTE_KEY, {});
    const proposals = STARTER_PROPOSALS.map((p) => ({
      ...p,
      votes: storedVotes[p.id] ?? {},
    }));
    const surface = readJson<Surface>(SURFACE_KEY, "network");
    set({
      ready: true,
      profile,
      proposals,
      surface: surface === "watch" || surface === "governance" ? surface : "network",
      license: readJson<LicenseType>(LICENSE_KEY, "sovereign"),
    });
    const pubkey = useIdentity.getState().pubkey;
    if (pubkey) set({ license: licenseFor(pubkey) });
  },
  setSurface: (surface) => {
    writeJson(SURFACE_KEY, surface);
    set({ surface });
  },
  saveProfile: (patch) => {
    const profile = { ...get().profile, ...patch };
    writeJson(PROFILE_KEY, profile);
    set({ profile });
  },
  addInterest: (tag) => {
    const clean = tag.trim().slice(0, 32);
    if (!clean) return;
    const interests = get().profile.interests;
    if (interests.includes(clean) || interests.length >= 16) return;
    get().saveProfile({ interests: [...interests, clean] });
  },
  dropInterest: (tag) => {
    get().saveProfile({ interests: get().profile.interests.filter((t) => t !== tag) });
  },
  addFinance: () => {
    const row: FinanceRow = { id: `f-${Date.now()}`, label: "Hold", note: "" };
    get().saveProfile({ finance: [...get().profile.finance, row] });
  },
  patchFinance: (id, patch) => {
    get().saveProfile({
      finance: get().profile.finance.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    });
  },
  dropFinance: (id) => {
    get().saveProfile({ finance: get().profile.finance.filter((row) => row.id !== id) });
  },
  activateMesh: () => {
    openMesh((peer) => {
      const peers = get().peers.filter((p) => p.id !== peer.id && Date.now() - p.at < 45_000);
      set({ peers: [...peers, peer] });
    });
    pingMesh();
    if (meshTimer) window.clearInterval(meshTimer);
    meshTimer = window.setInterval(pingMesh, 4000);
    set({ meshOn: true });
  },
  vote: (proposalId, vote) => {
    const did = useIdentity.getState().pubkey;
    if (!did) return;
    const proposals = get().proposals.map((p) => {
      if (p.id !== proposalId) return p;
      return { ...p, votes: { ...p.votes, [did]: vote } };
    });
    const bag: Record<string, Record<string, Vote>> = {};
    for (const p of proposals) bag[p.id] = p.votes;
    writeJson(VOTE_KEY, bag);
    set({ proposals });
  },
}));
