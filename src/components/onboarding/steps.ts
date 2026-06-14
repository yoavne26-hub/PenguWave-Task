/**
 * Guided-tour steps. Each step spotlights an element marked with a matching
 * `data-tour` attribute. `route` (if set) is navigated to before the step so the
 * target is on screen. Keep copy short — this is a 60-second orientation.
 */
export interface TourStep {
  /** Value of the target element's `data-tour` attribute. */
  target: string;
  title: string;
  body: string;
  /** Route to switch to before showing this step. */
  route?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    target: "nav",
    title: "Navigate the console",
    body: "Move between the Overview, the Events table, and (for Admins) Users from here.",
    route: "/overview",
  },
  {
    target: "overview-stats",
    title: "Triage at a glance",
    body: "Key counts for the current data. Click a highlighted card to jump straight to those events.",
    route: "/overview",
  },
  {
    target: "severity",
    title: "Drill down by severity",
    body: "Click any severity row, host, or tag to open the Events table pre-filtered to that slice.",
    route: "/overview",
  },
  {
    target: "filters",
    title: "Search & filter",
    body: "Combine search, severity, tag, and host filters. Active filters show as removable chips.",
    route: "/events",
  },
  {
    target: "export",
    title: "Export what you see",
    body: "Export exactly the filtered set as CSV or JSON. (Disabled for the read-only Viewer persona.)",
    route: "/events",
  },
  {
    target: "persona",
    title: "Switch persona",
    body: "Swap between Analyst, Admin, and Viewer to see how access changes. It's a UX simulation, not real auth.",
    route: "/events",
  },
  {
    target: "help",
    title: "Reopen this tour anytime",
    body: "Click the help button whenever you want to walk through the console again.",
  },
];
