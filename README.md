# PenguWave — Security Operations Portal

A polished, dark-mode **SOC investigation console** built on the bootcamp
frontend starter (React 19 + Vite + TypeScript). An analyst lands on an
at-a-glance overview, drills into a dense, filterable events table, and opens a
focused detail view for any alert — all over messy mock data that is normalized
into a single trusted shape.

> Frontend track only. There is no backend; all data comes from
> `data/mock_events.json` routed through a service/normalization seam so a real
> API can be swapped in later.

## Getting started

```bash
npm install
npm run dev
```

The app runs at http://localhost:5173 (Vite picks the next free port if it's
taken). Pick a persona, "sign in," and explore.

## Signing in

The entrance shows three demo **personas** (Analyst / Admin / Viewer) and a
sign-in form.

- **Any username and password are accepted.** The form only *visualizes* an
  authentication step and a persona's access level — it enforces nothing.
- **Roles are a UX simulation, not authorization.** They change which
  affordances appear (e.g. Admin sees Users; Viewer can't export). Real
  authorization must be enforced by a backend — never trust the client. The UI
  says this in several places.

## What's built

- **Overview dashboard** — severity mix, affected hosts/identities, top hosts &
  tags, recent critical/high. Tiles, severity rows, hosts, and tags are
  **drill-downs** that open the Events table pre-filtered to that slice.
- **Events table** — search + severity/tag/host filters with removable active
  chips, sortable columns, relative time, monospace IPs/hosts, graceful null
  handling.
- **Event detail modal** — a centered, readable dialog (context grid, plain-text
  description, related-event pivots, collapsible raw JSON). Focus-trapped,
  Esc/backdrop close, returns focus.
- **CSV / JSON export** — exports exactly the filtered set; hardened against
  spreadsheet **formula injection**; disabled for the read-only Viewer.
- **First-time guided tour** — a "first time here?" prompt launches a spotlight
  walkthrough (navigation → triage → filters → export → persona). Re-launch
  anytime from **Help & tour**. Remembered in `localStorage`.
- **Animated entrance** — a deep-ocean scene (flowing wave ribbons, icebergs,
  penguins) behind the sign-in card. Pure CSS/SVG; respects
  `prefers-reduced-motion`.
- **Designed states** — loading skeletons, empty vs. no-results, error/retry,
  and a badge when messy records were repaired.

## Key decisions

- **One normalization seam.** Every event passes through `normalizeEvent()`:
  unknown severities → `UNKNOWN`, nulls preserved, bad timestamps flagged,
  tags coerced to arrays, duplicates removed, plus derived fields
  (`severityRank`, `searchBlob`, …). One bad record can't blank the dashboard.
- **Tailwind v4 + hand-rolled shadcn-style components**, dark-mode only, themed
  from one set of tokens in `src/index.css`. No icon/animation dependencies —
  icons are inline SVG, animations are CSS keyframes.
- **Premium console feel, not proprietary branding.** The look evokes a modern
  cloud-security console without reproducing any specific product's branding.

## Security notes

- **All event data is treated as untrusted** and rendered as **plain text** —
  no `dangerouslySetInnerHTML`, no `innerHTML`. (The starter shipped a real XSS
  path in the feed; it's removed.)
- **No secrets in the client.** The starter's hardcoded API token and its
  credential `console.log` were removed; any future API key reads from
  `import.meta.env` (see `.env.example`).
- **No passwords** in the UI or client types. The mock sign-in reads the entered
  password in memory only — it is never logged and never persisted (only the
  chosen role string is stored).
- **CSV export neutralizes formula injection** (prefixes values starting with
  `=`, `+`, `-`, `@`).

## Known limitations / future work

- The leaked API token still exists in early git history; with more time we'd
  rotate it and rewrite history.
- Roles/sign-in are UX-only; real authn/authz belong on a backend.
- Data is mock JSON behind a swappable loader; wiring the real API is the next
  step.

## Stack

React 19 · React Router 7 · Vite 7 · TypeScript 5.9 (strict) · Tailwind v4.
Data in `data/mock_events.json`; loader/normalizer in `src/services/`,
`src/hooks/useEvents.ts`.
