import { createFileRoute } from "@tanstack/react-router";
import { Playground } from "@/components/playground/playground";

/** Hub /hub/deck is Command Deck home. Neural watch, then God's Eye. */
export const Route = createFileRoute("/hub/deck")({ component: HubDeckHome });

function HubDeckHome() {
  return <Playground />;
}
