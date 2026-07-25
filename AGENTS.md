# DraftProAnalytics Client Agent Instructions

## Project

DraftProAnalytics is an NFL analytics and draft-management application.

This repository contains the client application.

### Technology

- Vue 3
- Vite
- TypeScript strict mode
- Composition API
- `<script setup lang="ts">`
- PrimeVue
- Pinia
- Vue Router 4
- Axios

## Required reading

Before making changes, read the documentation relevant to the task:

- `docs/architecture/overview.md`
- `docs/architecture/client-conventions.md`
- `docs/architecture/rbac.md` for authentication, authorization, menus, or routes
- The applicable file under `docs/modules/`
- `docs/development/testing.md`
- `docs/development/definition-of-done.md`

## Mandatory engineering rules

- Use Vue 3 Composition API only.
- Use `<script setup lang="ts">` for new and substantially modified components.
- Do not introduce Options API components.
- Keep TypeScript strict.
- Do not use `any`.
- Prefer explicit interfaces, DTOs, unions, and typed mapping functions.
- Follow the existing feature-module organization.
- Use domain-specific names from the DPA ubiquitous language.
- Reuse existing component, API, store, route, and error-handling patterns before creating new abstractions.
- Do not silently remove existing behavior.
- Preserve role-based route metadata and navigation authorization.
- Use `import.meta.env.VITE_API_BASE_URL` for API configuration.
- Use PrimeVue components consistently with the existing application.
- Keep transport DTOs separate from display/view models when their shapes differ.

## Ubiquitous language

Prefer domain names and verbs such as:

- `evaluateProspect`
- `seedDraftPicks`
- `assumeRole`
- `importCollegeProspects`
- `completeDraftPick`
- `loadSeasonSchedule`
- `calculateDraftOrder`
- `addTeamNeed`
- `removeTeamNeeds`

Avoid vague names such as:

- `handleData`
- `processItem`
- `doAction`
- `thing`
- `recordData`

## Change discipline

Before editing:

1. Inspect the relevant view or component.
2. Inspect related API modules, Pinia stores, routes, types, and tests.
3. Trace the request flow through the client.
4. Explain the current behavior and root cause.
5. Present a concise implementation plan.
6. List the files expected to change.

During implementation:

- Make the smallest complete change.
- Avoid unrelated formatting or refactoring.
- Preserve existing public component props, emitted events, stores, and API interfaces unless the task requires changing them.
- Add or update types instead of bypassing compiler errors.
- Handle loading, empty, success, validation, and error states.
- Prevent duplicate submissions.
- Refresh local state after successful create, update, or delete operations.
- Keep UI labels user-friendly while preserving domain codes internally when required.
- Do not hard-code backend URLs.

After implementation:

```bash
npm run build
```

Run relevant unit or component tests when available.

Report:

- Files changed
- Behavior implemented
- Commands executed
- Build and test results
- Remaining risks or assumptions

## Routing and authorization

- Preserve Vue Router metadata used by DPA authorization.
- Protected routes should declare the appropriate domain and action.
- Navigation visibility and route authorization are separate concerns; both must be correct.
- Do not use visual hiding as the sole authorization control.
- Public-user navigation rules must remain consistent with `docs/architecture/rbac.md`.

## API behavior

- Use the existing Axios/API wrapper pattern.
- Keep query parameter names aligned with server contracts.
- Normalize transport errors into useful UI messages.
- Do not swallow failed requests.
- Abort or ignore stale requests where rapid filter changes could cause out-of-order results.
- Do not duplicate server business rules in the client unless needed for display or immediate validation.

## PrimeVue behavior

- Use PrimeVue controls already established in the repository.
- Bind dropdown values explicitly.
- Use stable `optionLabel` and `optionValue` mappings.
- Use dialogs for create/edit forms when the task calls for focused data entry.
- DataTable columns that users need to reorder mentally should be sortable.
- Confirm destructive actions when accidental deletion is plausible.
- Maintain accessible labels and button text.

## Git safety

- Do not commit unless explicitly requested.
- Do not push unless explicitly requested.
- Do not change branches unless explicitly requested.
- Do not run destructive Git commands.
- Never modify `.env` files unless explicitly requested.
- Never expose credentials, tokens, cookies, or secrets.
- Do not delete untracked files without explicit approval.

## Delivery standard

A client feature is not complete until:

- UI behavior is implemented.
- API integration is wired.
- Types compile.
- Loading, empty, and error handling are present.
- Authorization metadata is correct where applicable.
- Existing functionality remains intact.
- Relevant tests pass.
- `npm run build` succeeds.
