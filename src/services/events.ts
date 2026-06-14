import mockEvents from "../../data/mock_events.json";
import { normalizeEvents, type NormalizeResult } from "./normalize";

/**
 * The data seam. Today it loads the bundled mock JSON; swapping in a real API
 * means changing only this function (e.g. `await getEvents()` from api.ts).
 * A small simulated latency exercises the loading states.
 */
export async function loadEvents(): Promise<NormalizeResult> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return normalizeEvents(mockEvents);
}
