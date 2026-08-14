# B4Me Analysis Master-Detail Redesign

## UX structure

The B4Me Analysis page now uses a permanent Prospect master list and a tabbed detail workspace.

Detail tabs:

1. Overview
2. Observed Metrics
3. Research
4. Derived
5. Evaluation
6. Methodology
7. Team Context

No prospect is auto-selected on initial load. Selecting a prospect populates the detail workspace. The active detail tab is preserved when switching prospects to support class-wide comparisons in one analysis dimension.

## Prospect table

- Scrollable body with fixed/sticky headers.
- Pagination defaults to 25 rows with 25/50/100 options.
- Local name/school filtering.
- Prospect selection remains available while a queued B4Me class job is running.

## Pre-analysis safety check

The client restores the Prospect Identity pre-flight check already supported by the server:

- CURRENT scan + zero unresolved duplicate/identity reviews: run B4Me immediately.
- NEVER_RUN, STALE, or unresolved reviews: display B4Me Pre-Analysis Check.
- Run Duplicate Check First queues the duplicate-scan job and navigates to Prospect Identity Management.
- Continue B4Me Analysis proceeds; server-side skip protections remain authoritative.

## Server/schema

No server or Prisma schema changes are required for this layout redesign. The supplied server baseline already contains the pre-flight endpoint and queued B4Me handlers.
## Research attribution

The page title is **B4Me Analysis — Big 4 Metrics Enhanced**. The prior Jet-X title reference was removed.

A concise attribution appears directly beneath the page title, crediting Michael Nania's published Big 4 Metrics research concepts as a foundation. The Methodology tab contains the fuller Research Foundation statement, explains what DraftProAnalytics adds, and states that B4Me/DraftProAnalytics are not affiliated with, sponsored by, or endorsed by Michael Nania or Jets X-Factor.

