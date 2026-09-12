import { create } from "zustand";

const STORAGE = "trv.drill";

export type DrillStep = {
  id: string;
  kicker: string;
  title: string;
  need: string;
  how: string[];
};

export const DRILL: DrillStep[] = [
  {
    id: "pill",
    kicker: "The pills",
    title: "How facts arrive",
    need: "Pick a lens. Same facts. Two deliveries. Not two truths.",
    how: [
      "Red: raw wire. The fact lands as-is.",
      "Blue: briefing. Same fact, guided.",
      "Tap Red or Blue on the visor anytime. Glimpse is eight seconds of the other side.",
    ],
  },
  {
    id: "field",
    kicker: "Neural watch",
    title: "Walk the neuron",
    need: "The tissue is the world. Drag to look around. Threats spawn in it. Tap one.",
    how: [
      "Drag to look — you are in the cerebrospinal fluid.",
      "HSV, West Nile, and rabies appear in the gyri like wild contacts.",
      "Tap a contact to mark it. Gold THC walks to it, analyzes, destroys, and learns.",
      "Call lures one more of the type you selected.",
    ],
  },
  {
    id: "eye",
    kicker: "God's Eye",
    title: "Then the galaxy",
    need: "Name the neuron first. Then the same watch, from orbit.",
    how: [
      "Three contacts each on HSV, West Nile, and rabies unlocks God's Eye.",
      "There you walk a mesh of systems — emission, runoff, worm. Never a body.",
    ],
  },
];

export type LiveOrder = { need: string; how: string };

export function liveOrder(opts: {
  theater: "neural" | "orbit";
  label: string;
  count: number;
  look: boolean;
  now: boolean;
  wait: boolean;
  locked: number;
}): LiveOrder {
  if (opts.locked >= 3) {
    return {
      need: `${opts.label} is named.`,
      how: "Keep looking. Name all three to open God's Eye — the same watch from orbit.",
    };
  }
  if (opts.count === 0) {
    return {
      need: "The field is quiet",
      how: "Drag to look. Tap Call to lure a contact into view.",
    };
  }
  return {
    need: `Look around · ${opts.label} ${opts.locked}/3`,
    how: "Drag the world. Tap a contact. THC walks to it.",
  };
}

type DrillState = {
  ready: boolean;
  open: boolean;
  step: number;
  hydrate: () => void;
  start: () => void;
  next: () => void;
  skip: () => void;
  close: () => void;
};

function unread() {
  if (typeof window === "undefined") return true;
  try {
    const q = new URLSearchParams(window.location.search);
    if (q.get("drill") === "1") return true;
    return window.localStorage.getItem(STORAGE) !== "1";
  } catch {
    return true;
  }
}

function markRead() {
  try {
    window.localStorage.setItem(STORAGE, "1");
  } catch {
    /* blocked */
  }
}

export const useDrill = create<DrillState>((set, get) => ({
  ready: false,
  open: false,
  step: 0,
  hydrate: () => {
    const fresh = unread();
    set({ ready: true, open: fresh, step: 0 });
  },
  start: () => set({ open: true, step: 0 }),
  next: () => {
    const i = get().step + 1;
    if (i >= DRILL.length) {
      markRead();
      set({ open: false, step: 0 });
      return;
    }
    set({ step: i });
  },
  skip: () => {
    markRead();
    set({ open: false, step: 0 });
  },
  close: () => {
    markRead();
    set({ open: false, step: 0 });
  },
}));
