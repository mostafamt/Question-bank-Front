# ScanAndUpload + Studio Refactor Plan

**Date:** 2026-08-18
**Scope:** `src/pages/ScanAndUpload/`, `src/components/Studio/` and every child component underneath it
**Status:** Proposed — not started

## Why this doc exists

`ScanAndUpload` renders exactly one meaningful child: `Studio`. So in practice this is
one refactor, not two. Studio already went through a documented "Phase 1" refactor
(see `docs/2025-11-06/`), and `CLAUDE.md` still describes it as "Phase 1 of 6, hooks
and services planned for later." That's stale. Hooks, services, utils, and a context
layer all exist today — Phases 1–4 of the original 6-phase plan were substantially
built. But the migration was never finished and was never cleaned up behind itself,
so the codebase now carries **two parallel implementations of the same state
management** (local hooks in `Studio.jsx` vs. an unused `StudioContext`), plus dead
files, duplicated logic, and an untested 590-line hook doing five jobs at once.

This plan starts from that reality, not from re-running the old plan.

## Current state, in one paragraph

`Studio.jsx` (490 lines) wires 12 custom hooks locally and pushes a ~35-key prop
object down through `StudioLayout` → `StudioEditor` → columns → `StudioActions`/
`StudioCompositeBlocks`. A parallel `StudioContext.jsx` (322 lines) re-implements the
same hook wiring but is never consumed — `Studio.jsx` doesn't call
`useStudioContext()`, and the only component that would use the context
(`StudioWithContext.jsx`) isn't imported anywhere. `ScanAndUpload.jsx` hand-rolls a
~90-line block-submission transform inside `handleSubmit` that duplicates
`Studio/services/block.service.js`'s `transformBlockForSubmit`, which sits unused.
Coordinate math exists in three places (`utils/coordinates.js`,
`Studio/services/coordinate.service.js`, and an orphaned `Studio/utils/
coordinateUtils.js` that nothing imports). Test coverage is 6 files, all on
low-level services/utils — zero tests on `Studio.jsx`, `ScanAndUpload.jsx`, any hook,
or any feature component.

None of this is broken today — it works. The risk is velocity: every new feature has
to guess which of two state systems to extend, which of three coordinate utilities to
call, and touches a 590-line hook with no tests around it.

## Goals

1. Collapse to **one** state-management path (finish or delete the Context migration).
2. Remove dead code and duplicate implementations so there's one obvious place to add
   new logic.
3. Break up the two most overloaded files (`useAreaManagement.js`, `ScanAndUpload.jsx`'s
   `handleSubmit`) into single-responsibility pieces.
4. Add tests to the pieces that currently have none and are riskiest to change
   (submit flow, page reorder, `Studio.jsx` orchestration).
5. Bring `CLAUDE.md` and the Studio docs back in sync with what's actually in the repo.

## Non-goals

- No visual/UX changes.
- No new features (Phase 5/6 "error boundaries" and "lazy loading" from the old plan
  are deferred — call out as future work, not part of this pass).
- No dependency swaps (keep `@bmunozg/react-image-area`, Zustand, react-query as-is).

---

## Phase 0 — Cleanup (no behavior change, do this first)

Low-risk deletions and fixes that shrink the surface area before anything else moves.

- [ ] Delete `Studio.jsx.backup` (526 lines, stale copy already superseded by git history).
- [ ] Delete `Studio/hooks/useStudioState.js` (5-line no-op placeholder, unused).
- [ ] Delete `Studio/utils/coordinateUtils.js` and its barrel export (104 lines,
      confirmed orphaned — nothing outside its own `index.js` imports it).
- [ ] Remove the stray `console.log` in `StudioAreaSelector/hooks/
      useAreaCustomRenderer.js`.
- [ ] Fix the `type={"state.type"}` literal string in `ScanAndUpload.jsx` (line ~167)
      — looks like a leftover placeholder rather than intentional code; confirm
      intended value before shipping.
- [ ] Decide the fate of `StudioActions.jsx`'s `onDragEnd` (line ~40): it returns
      early and leaves ~15 lines of unreachable reorder logic behind an
      `eslint-disable-next-line no-unreachable`. Either finish the reorder feature or
      delete the dead branch and file a follow-up ticket — don't leave disabled code
      with a bare `// TODO`.

**Exit criteria:** build passes, no functional change, ~650 fewer lines in the tree.

---

## Phase 1 — Resolve the state-management fork

This is the highest-leverage change: it removes the biggest source of drift risk
(two copies of the same wiring going out of sync, which has already happened once —
`StudioContext.jsx`'s `useAreaManagement` call is missing `pageContainerRef`/
`setShowBlocksStyling` that `Studio.jsx` passes).

**Recommendation: delete the Context path, keep hooks-in-component.** The hooks
architecture already exists, is what's actually running in production, and the prop
list, while long, is passed through exactly two layers (`StudioLayout`,
`StudioEditor`) — not deep drilling. Reintroducing Context now would mean redoing
work that was already abandoned once, for a payoff (shorter prop lists) that can be
achieved more cheaply with prop grouping (Phase 2 below).

- [ ] Delete `Studio/context/StudioContext.jsx` and `Studio/StudioWithContext.jsx`.
- [ ] Remove their exports from `Studio/index.js`.
- [ ] Grep for any remaining references (`useStudioContext`, `StudioProvider`) to
      confirm nothing else assumed the context existed.

*(If, on review, the team would rather finish the Context migration instead of
deleting it — e.g. because more consumers of Studio state are planned — flip this
phase to "finish wiring `Studio.jsx` onto `StudioContext`" instead. Either direction
is fine; leaving both half-alive is the only wrong answer.)*

**Exit criteria:** one state-management implementation exists; `StudioWithContext`
either gone or actually used.

---

## Phase 2 — Deduplicate business logic

- [ ] **Block submission.** Replace `ScanAndUpload.jsx`'s inline `handleSubmit`
      transform with `Studio/services/block.service.js`'s `transformBlockForSubmit`
      (extending it if it's missing a case `ScanAndUpload` currently handles, e.g.
      the Cloudinary base64 upload branch). One implementation of "turn an area into
      a submittable block," not two.
- [ ] **Coordinate math.** Confirm `utils/coordinates.js` (generic math) +
      `Studio/services/coordinate.service.js` (image-load-aware wrapper) is the
      pair to keep — it already has the best test coverage (756-line test file) and
      the clearest separation of concerns. Nothing else to do here once Phase 0
      removes the orphaned third copy.
- [ ] **Status constants.** Pick one home for block-status strings
      (`CREATED`/`DELETED`/`UPDATED`) — currently duplicated between `utils/ocr.js`
      and `Studio/constants/studio.constants.js`'s `AREA_STATUS`. Keep
      `AREA_STATUS` (it's already scoped to Studio's constants module) and have
      `ocr.js` import from it instead of redefining.
- [ ] **Split `utils/ocr.js`.** It currently mixes OCR language constants, block
      status constants, and unrelated area/label helper functions
      (`reorder`, `onEditTextField`, `updateAreasProperties`,
      `getTypeNameOfLabelKey`, `getTypeOfLabel`) used by both `ScanAndUpload` and
      `Studio`. Split into `ocr.js` (OCR-only), and move the area/label helpers into
      `Studio/utils/` or a shared `utils/areaHelpers.js`, since they're really
      Studio-domain functions that happen to be imported from outside.

**Exit criteria:** grep for `transformBlockForSubmit` shows one call site producing
the submission payload; `ocr.js` no longer defines block-status constants.

---

## Phase 3 — Break up the largest files

- [ ] **`Studio/hooks/useAreaManagement.js` (590 lines, largest file in the tree).**
      Currently owns area CRUD, coordinate recalculation, page insert/delete/reorder
      syncing (near-identical logic repeated across `insertPageAt`/`insertPagesAt`/
      `deletePageAt`/`reorderPageAt` for three parallel arrays), *and* the submit
      orchestration (snapshot capture → `handleSubmit` → refetch/resync). Split into:
      - `useAreaCRUD.js` — area/areasProperties state and mutation.
      - `usePageSync.js` — the four insert/delete/reorder-page synchronizers,
        deduplicated into one parameterized helper instead of four copies.
      - Keep submit orchestration in `useAreaManagement` (or rename it
        `useSubmitFlow.js`) so it's obviously one job.
- [ ] **`ScanAndUpload.jsx`'s `handleSubmit`.** Once Phase 2 removes the duplicated
      transform logic, what's left (Cloudinary upload branching, calling
      `saveBlocks`) should move into a `services/scanAndUpload.service.js` (new,
      small) so the page component is routing + data-fetching only, matching how
      `Studio` already keeps API calls out of its components (with the one exception
      noted below).
- [ ] **`Studio/hooks/useStudioColumns.js` (385 lines).** The 5 separate `useEffect`
      blocks that exist purely to keep refs in sync with props (same pattern repeats
      for `insertPageAtRef`/`insertPagesAtRef`/`deletePageAtRef`/`reorderPageAtRef` in
      `Studio.jsx` itself) are a good candidate for one small `useLatestRef(value)`
      hook, replacing ~9 near-identical effect blocks across the tree with a single
      three-line utility hook.
- [ ] **`ExerciseTab.jsx`.** Move its direct `getExercises(chapterId)` call out of
      the component's `useEffect` into a `useExercises` hook or a react-query call,
      matching the pattern used everywhere else in Studio (components receive data
      via props/hooks, not by calling the API themselves).

**Exit criteria:** no file in `Studio/hooks/` exceeds ~250 lines; `ScanAndUpload.jsx`
under ~80 lines; no component makes a raw API call from inside itself.

---

## Phase 4 — Reduce structural duplication (lower priority)

These are real but lower-impact — do after Phases 0–3 land and the team has bandwidth.

- [ ] `Studio/columns/index.js` (author mode) and `Studio/columns/reader.columns.js`
      (reader mode) share the same `switch(config.id)`-over-`tabConfigs` shape with
      different components wired in. Consider a single `buildColumns(tabConfigs, mode)`
      that takes a mode-to-component map, rather than two parallel switch statements.
- [ ] `StudioAreaSelector/renderers/` has 4 renderer variants (Edit/Reader/HandTool/
      Default) with overlapping "render an area box + overlay" structure. Worth a
      pass to extract the shared box/overlay rendering into one component,
      parameterized by mode-specific bits.

**Exit criteria:** optional — track as a follow-up ticket if not done in this pass.

---

## Phase 5 — Test coverage for the risky paths

Current coverage (6 files, ~1,400 lines) sits entirely on pure services/utils near
the edges. Add tests for the stateful, high-traffic paths this plan touches:

- [ ] `useAreaManagement` split (Phase 3) — unit tests per new hook, especially the
      deduplicated page-sync helper (this is exactly the kind of "four copies of
      similar logic" code that regressions hide in).
  - [ ] The submit flow end-to-end (`ScanAndUpload` → transform → `saveBlocks`) —
      currently the single riskiest untested path in the app, since it's the actual
      save-user-work operation.
- [ ] `Studio.jsx` orchestration — smoke test that it renders with a minimal
      `types`/`pages`/`compositeBlocksTypes` fixture and that the core callbacks wire
      through without throwing.
- [ ] `block.service.js`'s `transformBlockForSubmit` once it becomes the single
      source of truth (Phase 2) — cover the CREATED/UPDATED/DELETED and
      text/image/audio/video branches that were previously only exercised
      implicitly through `ScanAndUpload`.

**Exit criteria:** the submit path and the new post-split hooks have tests; this
doesn't need to hit the old plan's ">80% coverage" target to be worth doing.

---

## Phase 6 — Documentation sync

- [ ] Rewrite the "Studio Component (Refactoring in Progress - Phase 1)" section of
      `CLAUDE.md` to describe the actual current architecture (hooks/services/utils
      all populated, no Context layer, submit flow centralized in
      `block.service.js`) instead of the stale Phase-1 snapshot.
- [ ] Add a short note at the top of `docs/2025-11-06/STUDIO_REFACTORING_PLAN.md`
      pointing to this document, so future readers don't follow the old 6-phase
      numbering (which no longer matches what was actually built) and assume Phase 2
      "hasn't started" when most of it already shipped.

---

## Suggested order of work

Phases 0 → 1 → 2 → 3 are meant to run in that order — each shrinks the file(s) the
next phase has to touch. Phase 4 and Phase 5 can interleave with Phase 3 (write the
test for a hook right after splitting it, rather than batching all tests to the end).
Phase 6 is a five-minute doc update, do it last so it reflects what actually landed
rather than what was planned.

## Risk notes

- Phase 1 (deleting `StudioContext`) is safe precisely because nothing renders it
  today — verify with a repo-wide grep for `useStudioContext`/`StudioProvider`/
  `StudioWithContext` immediately before deleting, in case something changed since
  this plan was written.
- Phase 2's block-submission unification is the one place with real behavioral risk
  — `ScanAndUpload`'s inline transform and `block.service.js`'s
  `transformBlockForSubmit` may have already diverged in a case-by-case way. Diff
  them carefully before switching call sites, and cover the switch with the Phase 5
  tests before removing the old inline code.
- Everything else in Phases 0, 3, 4 is pure mechanical extraction with no intended
  behavior change — safe to do without a feature flag, verified by existing manual
  QA of the Studio authoring flow after each phase.
