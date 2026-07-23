# Plan: Render Deep Object Block Inline with an Iframe

## How object rendering currently works

`PlayObjectModal2` (the full-screen modal):
1. Reads `activeId` from the Zustand store
2. Calls `GET /interactive-objects/{id}` via `getObject(id)` → receives `{ url, ... }`
3. Renders `<iframe src={object.url} />`

The object's embed URL lives in `object.url`. That is the only thing we need to
render an object inline in the area.

---

## The core challenge — hooks can't run inside `customRender`

`customRender` in `StudioAreaSelector` is a `useCallback`, not a React component, so
`useQuery` cannot be called inside it. **Solution: make `DeepBlockObject` a
self-fetching component.** It receives `objectId` as a prop, calls `useQuery`
itself, and renders the iframe. `customRender` just passes `objectId` through —
exactly as it does today.

---

## Interaction model (studio vs reader)

| Mode | Desired behaviour | `pointer-events` |
|------|-------------------|-----------------|
| Studio (authoring) | Author must be able to click/drag/resize the area block. The iframe is a visual preview only. | `none` |
| Reader (student) | Student interacts directly with the embedded object — no modal needed. Iframe captures clicks naturally. | `auto` |

`StudioAreaSelector` already computes `isReaderMode` from `useAppMode()`. It is
passed to `DeepBlockObject` as an `interactive` prop to control the CSS class.

---

## Data fetching strategy

- `queryKey: ['deep-object', objectId]` — one cached entry per object ID
- `staleTime: Infinity` — object URLs are stable; no need to re-fetch on every
  window focus or component remount
- `enabled: Boolean(objectId)` — no fetch if no ID

React Query's cache means a page with five object blocks that share the same
objectId fires only one network request.

---

## Files to change

### 1. `DeepBlockContent/DeepBlockObject.jsx` *(rewrite)*

Replace the static badge with a self-fetching component.

```jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getObject } from "../../../api/bookapi";
import styles from "./deepBlockContent.module.scss";

/**
 * Renders a deep object block's linked interactive object inline as an iframe.
 * Fetches object.url from the API; shows a loading indicator while pending and
 * a text badge if no URL is returned.
 *
 * @param {Object}  props
 * @param {string}  props.objectId   - The linked object's ID (from area.text)
 * @param {boolean} props.interactive - true in reader mode (pointer-events: auto)
 */
const DeepBlockObject = ({ objectId, interactive = false }) => {
  const { data: object, isLoading } = useQuery({
    queryKey: ["deep-object", objectId],
    queryFn: () => getObject(objectId),
    enabled: Boolean(objectId),
    staleTime: Infinity,
  });

  if (!objectId) return null;

  if (isLoading) {
    return <div className={styles["deep-block-object-loading"]}>Loading…</div>;
  }

  if (!object?.url) {
    return <div className={styles["deep-block-object"]}>Object linked</div>;
  }

  return (
    <iframe
      src={object.url}
      title="interactive-object"
      frameBorder="0"
      className={
        interactive
          ? styles["deep-block-object-iframe-interactive"]
          : styles["deep-block-object-iframe"]
      }
    />
  );
};

export default DeepBlockObject;
```

---

### 2. `DeepBlockContent/deepBlockContent.module.scss`

Replace the current `.deep-block-object` badge with four new classes.

```scss
// Shared iframe base
%deep-block-iframe-base {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  background-color: #fff;
  user-select: none;
}

// Studio mode: non-interactive preview — author can still click/resize the area
.deep-block-object-iframe {
  @extend %deep-block-iframe-base;
  pointer-events: none;
}

// Reader mode: fully interactive — student uses the object directly
.deep-block-object-iframe-interactive {
  @extend %deep-block-iframe-base;
  pointer-events: auto;
}

// Shown while object.url is being fetched
.deep-block-object-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.85);
  font-size: 0.75rem;
  color: #666;
  pointer-events: none;
  user-select: none;
}

// Fallback when the API returns no URL
.deep-block-object {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.85);
  font-size: 0.75rem;
  font-weight: 600;
  color: #1976d2;
  pointer-events: none;
  user-select: none;
}
```

> SCSS `@extend` requires a placeholder (`%`) or a class. If the project's SCSS
> setup doesn't support `@extend` across files, inline the shared properties instead.

---

### 3. `StudioAreaSelector/StudioAreaSelector.jsx`

Two small changes:

**a) Pass `interactive` to `DeepBlockObject`:**

```jsx
// Before:
{deepObjectId ? <DeepBlockObject objectId={deepObjectId} /> : null}

// After:
{deepObjectId ? <DeepBlockObject objectId={deepObjectId} interactive={isReaderMode} /> : null}
```

**b) Add `isReaderMode` to `customRender`'s `useCallback` deps:**

```js
[
  onClickExistedArea,
  activePage,
  activeRightTab.id,
  compositeBlocks,
  areasProperties,
  readOnly,
  onAreaClick,
  isReaderMode,   // ← add this
]
```

---

## Checklist

- [ ] `DeepBlockObject.jsx` — rewrite: self-fetching, renders `<iframe>` or fallbacks
- [ ] `deepBlockContent.module.scss` — replace badge with iframe + loading + fallback styles
- [ ] `StudioAreaSelector.jsx` — pass `interactive={isReaderMode}` + add to deps

**No changes needed to:**
- `deepHandlers.service.js` — handler and getter are unchanged
- `getObject` in `bookapi.js` — already returns `{ url }`, used as-is
- `PlayObjectModal2` — still used for the full-screen play flow (click on area in
  non-reader mode still opens the modal via `onClickExistedArea`)

---

## Data flow

```
Area renders → customRender → deepObjectId = getDeepBlockObject(area)
  → <DeepBlockObject objectId={deepObjectId} interactive={isReaderMode} />
  → useQuery(['deep-object', objectId]) → GET /interactive-objects/{id}
  → object.url available
  → <iframe src={object.url} pointer-events={isReaderMode ? auto : none} />

Studio click → onClickExistedArea → opens the side panel (unchanged)
Reader click on iframe → captured by iframe → student interacts with object directly
```
