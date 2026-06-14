# Console UX Upgrade — Design Spec

**Date:** 2026-06-14
**Branch:** `console-ux-upgrade`
**Status:** Approved, in build

## Goal

Raise PenguWave from a working SOC dashboard to a polished, console-grade
experience: a credentialed persona entrance with an animated ocean scene,
a centered (not side) event-detail view, console-style drill-downs, a more
legible sidebar, and a first-time guided tour.

## Guardrails (from `CLAUDE.md`)

- **No proprietary Upwind branding.** We deliver a *premium modern
  cloud-security console feel* (dark theme, teal/ice accents, dense readable
  tables, strong hierarchy) but do **not** reproduce Upwind's logo, exact brand
  palette, or claim affiliation. All "UX simulation, not real authorization"
  disclaimers stay.
- **No real credentials.** The login gate is a mock simulation. Passwords are
  compared in memory and **never logged, never persisted**. Only the role
  string is stored (localStorage), as today.
- **No new npm packages.** Tailwind + hand-rolled components only; animations
  via CSS keyframes + inline SVG.
- **Untrusted data, plain-text rendering, CSV formula-injection guard** all
  remain in force.

## Features

### 1. Credential gate (per-persona, hidden creds)
- `src/auth/credentials.ts` — `DEMO_CREDENTIALS: Record<Role, {username, password}>`,
  commented as mock-only, documented in README (not shown on screen).
- `verifyCredentials(role, username, password)` — pure, in-memory compare.
- `RoleEntrance` becomes two-step: **pick persona → credential form**
  (username + password + submit). Wrong creds → inline error, no logging.
  On success → `enter(role)`. Back button returns to persona grid.
- "Switch persona" (sign out) returns to the entrance and re-prompts.

### 2. Animated ocean entrance background
- `src/components/EntranceBackground.tsx` — layered CSS-keyframe wave gradients,
  inline-SVG drifting icebergs, 1–2 penguins. Sits behind a glass login card.
- Honors `prefers-reduced-motion` → static gradient fallback.

### 3. Event detail → centered modal
- `src/components/EventModal.tsx` replaces side `EventDrawer`. Centered, wider,
  calmer layout: header + severity badge, context grid (asset/IP/identity/source/
  tags), plain-text description, related-events pivot, collapsible raw JSON.
- A11y: `role="dialog"`, `aria-modal`, focus trap, Esc + backdrop close, return
  focus to the triggering row. (Port existing drawer logic.)

### 4. Drill-downs (Overview → Events)
- Overview severity tiles, top hosts, and top tags become clickable and
  navigate to `/events` with the corresponding filter pre-applied (via filter
  state passed through the router / URL search params).

### 5. Sidebar readability
- Larger nav targets, clearer active state, a section label ("Navigation"),
  cleaner inline-SVG icons, improved contrast/spacing. Role panel + disclaimer
  unchanged in meaning.

### 6. First-time guided tour
- `src/components/onboarding/` — `FirstTimePrompt` ("First time here?") shown
  once after entering the console when `penguwave-tour-done` is absent.
- If yes → `GuidedTour`: spotlight overlay stepping through sidebar → overview
  tiles → events filters → export, with positioned tooltips and Next/Skip.
- Dismissal sets `penguwave-tour-done`. A persistent header **"?"** button
  re-launches the tour anytime.

## Build / commit order

1. Credential gate
2. Entrance ocean animation
3. Event centered modal (replace drawer)
4. Drill-downs + sidebar readability
5. Guided tour + help button
6. README update

Each step: commit + push. On completion: merge to `main`, open next branch.

## Out of scope

- Real authentication/authorization (backend concern).
- Breadcrumb drill-up trail (can follow later if time allows).
- Any networked/API behavior beyond the existing mock seam.
