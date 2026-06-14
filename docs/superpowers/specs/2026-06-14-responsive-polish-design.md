# Responsive & Polish — Design Spec

**Date:** 2026-06-14
**Branch:** `responsive-polish`
**Status:** Approved, in build

## Goal

Make the console usable on small screens and friendlier to operate — chiefly,
make persona switching reachable without scrolling to the bottom of the sidebar.
Add modest visual polish.

## Features

### 1. Persona menu in the top bar (priority)
- New `src/components/PersonaMenu.tsx` — a header dropdown showing the current
  persona; opens to switch to Analyst/Admin/Viewer instantly (calls
  `enter(role)`) plus "Sign out" (`signOut`). Always visible; no scrolling.
- Sidebar's bottom persona block is reduced to a small "signed in as" line; the
  actionable control lives in the header.
- Accessible: button with `aria-haspopup`/`aria-expanded`, Esc + outside-click
  close, arrow/Enter friendly, focus returns to trigger.

### 2. Responsive / mobile
- Below `lg`, the sidebar becomes an off-canvas **drawer** toggled by a
  hamburger in the header (backdrop, Esc/close, focus handling). At `lg`+ it
  stays a static rail.
- Events table → **stacked card list** under `sm` (severity, title, host, time,
  tags per card; still opens the modal). Table view at `sm`+.
- Verify Overview grids stack cleanly; touch targets ≥44px.

### 3. Visual polish
- Header shows the current page name for orientation.
- Lightweight **severity donut** on the Overview (inline SVG, no new dep).
- Consistent hover/press micro-interactions.

## Guardrails
- No new npm packages. Tailwind + inline SVG only.
- Dark-mode, accessible (focus, contrast, reduced-motion), explainable.
- Role/persona remains a UX simulation, not real authorization.

## Build / commit order
1. Persona menu in top bar (+ trim sidebar)
2. Mobile drawer sidebar + hamburger
3. Responsive events card list
4. Polish (page title, severity donut, micro-interactions)

Each step: commit + push.
