# Plan: Validate Page Is Saved Before Submitting Blocks

## Goal

When the user clicks **Submit** in the Studio to save area/blocks for the active
page, verify that the active page actually exists in the backend's page list
for the chapter before sending the request. If the page was only added
locally (new page / pasted page / imported page) and hasn't been saved yet,
block the submit and show an alert telling the user to save the page first.

---

## Background: how a "page" can be unsaved

Pages in the Studio can exist in two states:

| State | How it's created | `_isPending` |
|---|---|---|
| Saved (exists on backend, part of the chapter's page list) | Fetched via `getChapterPages(chapterId)` on load, or after `submitPages` succeeds | `false` / absent |
| Pending (local only, not yet linked to the chapter) | `addEmptyPage`, `addImportedPages`, paste (`handlePaste`) | `true` |

Relevant code:
- `src/components/Studio/hooks/usePageNavigation.js:90-118` — `addEmptyPage` and
  `addImportedPages` create page objects with `_isPending: true`.
- `src/components/Studio/StudioThumbnails/StudioThumbnails.jsx:82-94` —
  `handleSave` (the "save" thumbnail action) is what calls `submitPages()` and
  then clears every page's `_isPending` flag. **This is the only place a
  pending page becomes a saved one.**
- `src/components/Studio/StudioThumbnails/StudioThumbnails.jsx:113-119` —
  `handlePaste` also creates a page with `_isPending: true`.

So `_isPending` is already the exact signal for "not yet in the backend's
page list" — no new backend call or extra state is needed to answer the
question this feature asks.

## Current submit flow (blocks)

```
StudioActions "Submit" button
  → onClickSubmit()                         (src/components/Studio/hooks/useAreaManagement.js:336)
    → handleSubmit(activePageId, areasProperties[activePageIndex], virtualBlocks[activePageIndex], pageSnapshot)
                                              (passed down from ScanAndUpload.jsx:66, wired at Studio.jsx:133)
      → saveBlocks({ pageId, chapterId, blocks, ... })   (src/services/api.js:46, POST /save-blocks)
```

Today, `onClickSubmit` never checks whether `activePageId` corresponds to a
page the backend actually knows about — it will happily snapshot the page,
upload images to Cloudinary, and POST `/save-blocks` with a `pageId` that
doesn't exist in the chapter's page list yet, because the page was never
submitted via `/pages/submit`.

Note: this only applies to the **main object flow** (`else` branch of
`onClickSubmit`). The `subObject` branch (blocks created inside a modal for a
sub-object, e.g. `SubObjectModal`) doesn't submit with a `pageId` at all and
is out of scope.

---

## Proposed change

Add a guard at the top of the non-subObject branch of `onClickSubmit` in
`useAreaManagement.js`. Fail fast, before the expensive snapshot-capture /
image-upload work:

```js
const onClickSubmit = async () => {
  setLoadingSubmit(true);
  if (subObject) {
    // ...unchanged
  } else {
    const activePage = pages[activePageIndex];
    if (activePage?._isPending) {
      toast.error("Please save this page first before submitting blocks.");
      setLoadingSubmit(false);
      return;
    }

    const hasDeepBlock = areasProperties[activePageIndex]?.some(isDeepBlock);
    // ...unchanged
  }
  setLoadingSubmit(false);
};
```

`pages` is already a prop of `useAreaManagement` (`src/components/Studio/hooks/useAreaManagement.js:23-24`),
so no new prop threading is required — this is a self-contained, single-file
change.

`toast` (react-toastify) is already imported in this file and is the
convention used elsewhere in Studio for this kind of user-facing error (e.g.
`StudioThumbnails.jsx:78,92`), so the alert style stays consistent with the
rest of the app.

### Why check `_isPending` and not re-fetch the backend list

`pages` in Studio is kept in sync with the backend list at every point that
matters:
- Initial load comes straight from `getChapterPages` (`ScanAndUpload.jsx:50-64`).
- `_isPending` is set the moment a page is added only locally, and cleared
  only after `submitPages()` (the real backend write) succeeds.

Re-fetching/re-deriving the backend list at submit time would just be
re-deriving the same fact `_isPending` already encodes, with an extra network
round trip and a race between the fetch and the check. Trusting the flag that
is already the single source of truth for this state is simpler and
consistent with how `StudioThumbnails.jsx` already treats it.

---

## Optional UX enhancement (not required, worth considering separately)

Right now the **Submit** button (`StudioActions.jsx:168-182`) is always
enabled once there are areas on the page. A follow-up improvement could
disable it (or show a small inline hint) whenever the active page is
pending, so the user finds out before drawing blocks instead of after
clicking Submit. Left out of this plan to keep the change minimal and
reactive-alert-only, per the request — call out separately if wanted.

---

## Edge cases

| Case | Handling |
|---|---|
| User submits on a freshly-added empty page (`addEmptyPage`) without saving | Blocked, toast shown |
| User pastes a page (`handlePaste`) and submits immediately | Blocked, toast shown (paste sets `_isPending: true`) |
| User clicks the thumbnail "save" action first, then submits | `_isPending` cleared by `handleSave`, submit proceeds normally |
| Page came from `getChapterPages` on initial load | `_isPending` is absent/false, submit proceeds normally |
| `subObject` modal flow | Unaffected — no `pageId`/backend page-list concept there |

---

## Files to change

| File | Change |
|---|---|
| `src/components/Studio/hooks/useAreaManagement.js` | Add the `_isPending` guard + `toast.error` at the top of the non-subObject branch of `onClickSubmit` |

---

## Test plan

1. Add a new page (thumbnail "new" action) → immediately draw an area and
   click Submit → expect toast error, no network call to `/save-blocks`.
2. Same as above, but click "save" (thumbnail save action) first, then
   Submit → expect normal submit flow (POST `/save-blocks` fires,
   success toast).
3. Import pages via the Import modal → submit on an imported-but-unsaved
   page → expect toast error.
4. Paste a copied page → submit before saving → expect toast error.
5. Submit on a page that was present from the initial backend fetch →
   expect normal submit flow (regression check).
