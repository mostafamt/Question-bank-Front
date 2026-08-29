# ImageActions — Publish Language Dropdown Plan

## Goal

Turn the single-click "publish" icon button in `ImageActions` into a
button-with-dropdown: clicking it opens a small menu with **Arabic** /
**English**, and picking one publishes the chapter in that language —
sending `{ "languages": ["ar"] }` or `{ "languages": ["en"] }` — instead of
always publishing in whatever language the Studio's OCR toggle happens to be
set to.

---

## Current State

```
ImageActions
  props: publishLanguage  ← derived once in Studio.jsx from the OCR
                             language toggle (ARABIC/ENGLISH state),
                             threaded through StudioLayout → StudioHeader /
                             StudioEditor → StudioStickyToolbar → ImageActions

  onClickPublish()
    → publishChapter(chapterId, [publishLanguage])   // fires immediately, no choice
```

`publishChapter` (`src/services/api.js:180`) already does exactly what's
needed:
```js
export const publishChapter = async (chapterId, languages) => {
  const res = await axios2.post(`/publish/${chapterId}`, { languages });
  ...
};
```
`POST /publish/:chapterId` with body `{ languages: [...] }` is the existing,
unchanged contract — `languages` already accepts `["ar"]` or `["en"]`, so
**no backend/service change is needed**, only how `ImageActions` decides what
to pass.

---

## Proposed Flow

```
click publish icon
  → opens a Menu anchored to the button, with two items: "Arabic" | "English"
      (pre-highlighted item = current `publishLanguage` prop, so the
       existing OCR-toggle-driven default still "just works" if the user
       doesn't think about it)
click "Arabic"  → publishChapter(chapterId, ["ar"])
click "English" → publishChapter(chapterId, ["en"])
click elsewhere / Esc → menu closes, nothing published
```

This is fully self-contained inside `ImageActions.jsx` — the `publishLanguage`
prop keeps flowing in from Studio unchanged and is reused only as the menu's
default highlighted item, so none of the existing prop-threading
(`Studio.jsx` → `StudioLayout` → `StudioHeader`/`StudioEditor` →
`StudioStickyToolbar` → `ImageActions`) needs to change.

---

## Files Changed

### `src/components/ImageActions/ImageActions.jsx`

1. **Imports** — add `Menu`, `MenuItem` from `@mui/material`; add
   `LANGUAGE_CODES` from `../Studio/constants` (already exports
   `{ ENGLISH: "en", ARABIC: "ar" }`).

2. **State** — add a menu anchor:
```js
const [publishMenuAnchor, setPublishMenuAnchor] = React.useState(null);
```

3. **Handlers** — replace the direct-fire `onClickPublish` with an
   open/close pair plus the actual publish call, parameterized by language:
```js
const handleOpenPublishMenu = (event) => {
  if (isPublishing) return;
  setPublishMenuAnchor(event.currentTarget);
};

const handleClosePublishMenu = () => setPublishMenuAnchor(null);

const handlePublish = async (languageCode) => {
  handleClosePublishMenu();
  if (!chapterId || isPublishing) return;
  setIsPublishing(true);
  await publishChapter(chapterId, [languageCode]);
  setIsPublishing(false);
};
```

4. **JSX** — swap the existing publish `IconButton` block for a button +
   menu pair:
```jsx
<IconButton
  aria-label="publish-chapter"
  aria-haspopup="true"
  aria-controls={publishMenuAnchor ? "publish-language-menu" : undefined}
  onClick={handleOpenPublishMenu}
  disabled={isPublishing}
>
  {isPublishing ? (
    <CircularProgress size={24} />
  ) : (
    <PublishIcon fontSize={iconFontSize} />
  )}
</IconButton>
<Menu
  id="publish-language-menu"
  anchorEl={publishMenuAnchor}
  open={Boolean(publishMenuAnchor)}
  onClose={handleClosePublishMenu}
>
  <MenuItem
    selected={publishLanguage === LANGUAGE_CODES.ARABIC}
    onClick={() => handlePublish(LANGUAGE_CODES.ARABIC)}
  >
    Arabic
  </MenuItem>
  <MenuItem
    selected={publishLanguage === LANGUAGE_CODES.ENGLISH}
    onClick={() => handlePublish(LANGUAGE_CODES.ENGLISH)}
  >
    English
  </MenuItem>
</Menu>
```
   (Placed in the same `!isReaderMode` block the publish button already
   lives in — no change to when the button is shown.)

---

## Edge Cases

| Case | Handling |
|---|---|
| User opens the menu, then clicks away / presses Esc | `Menu`'s `onClose` fires, `publishMenuAnchor` resets to `null`, nothing is published |
| User opens the menu while a previous publish is still in flight | `handleOpenPublishMenu` no-ops while `isPublishing`; the button is also `disabled` during that time so it's unreachable by click anyway |
| `chapterId` missing | `handlePublish` keeps the existing guard (`if (!chapterId ...) return`) |
| Rapid double-click on a menu item | `handleClosePublishMenu()` runs first (closes menu, so a second click has no menu item to hit); `isPublishing` guard also blocks a concurrent second call |
| Studio's OCR language toggle changes while the menu is closed | `publishLanguage` prop updates as before; only affects which item shows as pre-highlighted next time the menu opens — doesn't affect an in-flight publish |

---

## What Is NOT Changed

- `publishChapter` / `POST /publish/:chapterId` contract — unchanged.
- `publishLanguage` prop and its threading through `Studio.jsx` →
  `StudioLayout` → `StudioHeader`/`StudioEditor` → `StudioStickyToolbar` —
  unchanged; now used only as the menu's default highlight instead of the
  sole publish language.
- Reader mode — publish action isn't shown there today and stays that way.
- Toast/success/error handling — already inside `publishChapter` itself, untouched.

---

## Summary of Changes

| File | Change |
|---|---|
| `src/components/ImageActions/ImageActions.jsx` | Import `Menu`/`MenuItem`/`LANGUAGE_CODES`; add `publishMenuAnchor` state; replace `onClickPublish` with `handleOpenPublishMenu`/`handleClosePublishMenu`/`handlePublish(languageCode)`; render a `Menu` with "Arabic"/"English" items anchored to the publish button |
