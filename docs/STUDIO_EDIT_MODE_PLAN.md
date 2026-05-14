# Plan: Studio Edit Mode via `/studio/:object_id`

## Goal

When a user re-scans images for an **existing** interactive object, the Studio should
know which object is being edited. Opening **Map to Form** in that context should:

1. Pre-fill the form with the object's **existing saved parameters**.
2. Overlay the **newly scanned areas** on the right-side AreaList so the user can
   drag them over the pre-filled fields to update specific values.
3. On submit, **PATCH** the existing object instead of creating a new one.

---

## Current Behaviour (baseline)

| Step | Route | State passed |
|------|-------|--------------|
| EditObject (`/edit/:id`) → "Edit Question" | → `/uploads` | `{ name, type, baseType, id }` |
| UploadsPage | → `/studio` | `{ images, questionName, type }` — **`id` is dropped** |
| Studio opens Map to Form | opens DrawnUIModal | no objectId → always POST on submit |

The `id` is already threaded from `EditObject` into `UploadsPage`, but it is **lost**
when navigating to `/studio`.

---

## Proposed Changes

### 1. Route definition — `src/routes/index.js`

Change the studio route from a static path to one that accepts an optional object ID:

```diff
- { path: "/studio", component: StudioPage }
+ { path: "/studio/:object_id?", component: StudioPage }
```

`?` makes the parameter optional so the **create flow** (`/studio` with no ID)
continues to work without any changes to how UploadsPage navigates there today.

---

### 2. UploadsPage — preserve `id` in the studio URL

When UploadsPage navigates to Studio it currently does something like:

```js
navigate("/studio", { state: { images, questionName, type } });
```

Update this so that when a `id` (from location state) is present, it is embedded
in the URL:

```js
const destination = id ? `/studio/${id}` : "/studio";
navigate(destination, { state: { images, questionName, type } });
```

No other change is needed in UploadsPage; the `id` is now carried by the URL.

---

### 3. StudioPage — read `object_id` from URL params

```diff
+ import { useParams } from "react-router-dom";

  export default function StudioPage() {
+   const { object_id } = useParams();
    // ... existing state / effects ...

    return (
      <Studio
        images={images}
        questionName={questionName}
        type={type}
+       objectId={object_id ?? null}
      />
    );
  }
```

---

### 4. Studio component — forward `objectId` to DrawnUIModal

**Props**

```diff
- function Studio({ images, questionName, type })
+ function Studio({ images, questionName, type, objectId })
```

**`handleMapToForm` handler** (currently ~line 261–280 in `Studio.jsx`)

```diff
  setDrawnUIOpen(true);
+ // also store objectId so DrawnUIModal can pass it down
```

Pass `objectId` to DrawnUIModal:

```diff
  <DrawnUIModal
    open={drawnUIOpen}
    onClose={...}
    baseType={...}
    displayType={...}
    initialValues={mappedValues}
    initialColors={initialColors}
    trialAreas={trialAreas}
    isMapToFormMode={true}
+   objectId={objectId}
  />
```

---

### 5. DrawnUIModal — accept and forward `objectId`

```diff
  function DrawnUIModal({
    open, onClose, baseType, displayType,
    initialValues, initialColors, trialAreas,
-   isMapToFormMode
+   isMapToFormMode, objectId
  })
```

Pass it through to `DrawnUIForm`:

```diff
  <DrawnUIForm
    baseType={baseType}
    displayType={displayType}
    initialValues={initialValues}
    isMapToFormMode={isMapToFormMode}
+   objectId={objectId}
  />
```

---

### 6. DrawnUIForm — core logic changes

This is the most involved change.

#### 6-a. New `isEditMapToForm` flag

```js
const isEditMode        = Boolean(objectId) && !isMapToFormMode;   // existing
const isEditMapToForm   = Boolean(objectId) &&  isMapToFormMode;   // NEW
```

#### 6-b. Fetch existing parameters when in edit + map-to-form mode

Add a `useQuery` (or plain `useEffect`) that fires when `isEditMapToForm` is true:

```js
const { data: savedParams } = useQuery(
  ["object-params", objectId],
  () => axios.get(`/interactive-objects/${objectId}`).then(r => r.data.parameters),
  { enabled: isEditMapToForm }
);
```

#### 6-c. Merge saved parameters with scanned-area values

When both `savedParams` and `initialValues` (from mapToForm) are available,
produce the effective default values:

```js
const effectiveDefaults = isEditMapToForm
  ? deepMerge(savedParams, initialValues)   // saved base + scanned overlay
  : initialValues;
```

- `savedParams` provides the **full existing form** so no field is blank.
- `initialValues` (from mapToForm) **overrides** fields that were successfully
  mapped from the newly scanned areas.
- Fields that the user did **not** scan remain at their saved values.

`deepMerge` is a small utility (already exists or trivial to add) that does a
recursive merge, with the second argument winning on conflicts.

Pass `effectiveDefaults` to React Hook Form's `defaultValues` / `reset()`.

#### 6-d. Submit: PATCH when `isEditMapToForm`

```diff
  const onSubmit = async (formValues) => {
-   if (isEditMode) {
+   if (isEditMode || isEditMapToForm) {
      await axios.patch(`/interactive-objects/${objectId}`, {
        parameters: { ...formValues },
      });
    } else {
      await axios.post("/interactive-objects", { ... });
    }
  };
```

---

### 7. Scanned areas in the right panel (AreaList)

No new code needed. `DrawnUIModal` already renders `AreaList` whenever
`isMapToFormMode` is true and `trialAreas` is non-empty. The newly scanned
areas will appear there automatically once the above props are threaded through.

---

## Data Flow (after this change)

```
EditObject /edit/:id
  └─ "Edit Question" → /uploads  { name, type, baseType, id }
        └─ UploadsPage  (scan images)
              └─ navigate(`/studio/${id}`, { images, questionName, type })
                    └─ StudioPage  useParams() → object_id
                          └─ Studio  objectId={object_id}
                                └─ "Map to Form" button
                                      └─ DrawnUIModal  objectId={object_id}  isMapToFormMode
                                            ├─ AreaList (right)  ← new scanned areas
                                            └─ DrawnUIForm
                                                  ├─ fetch /interactive-objects/:id  → savedParams
                                                  ├─ deepMerge(savedParams, mappedFromScan)
                                                  ├─ React Hook Form reset(effectiveDefaults)
                                                  └─ submit → PATCH /interactive-objects/:id
```

---

## Files to Change

| File | Change |
|------|--------|
| `src/routes/index.js` | `/studio` → `/studio/:object_id?` |
| `src/pages/UploadsPage/UploadsPage.jsx` | Embed `id` in navigation URL |
| `src/pages/StudioPage/StudioPage.jsx` | `useParams()` → pass `objectId` to Studio |
| `src/components/Studio/Studio.jsx` | Accept + forward `objectId` prop to DrawnUIModal |
| `src/components/DrawnUIModal/DrawnUIModal.jsx` | Accept + forward `objectId` to DrawnUIForm |
| `src/components/DrawnUI/DrawnUIForm/DrawnUIForm.jsx` | `isEditMapToForm` flag, fetch params, merge, PATCH submit |
| `src/utils/helper.js` (or new util) | `deepMerge` helper if not already present |

---

## Edge Cases

| Case | Behaviour |
|------|-----------|
| `/studio` with no ID (create flow) | `object_id` is undefined → all new-object logic unchanged |
| Object ID present but fetch fails | Show error toast; form falls back to scanned-area values only |
| Scan produces no areas (user skips scanning) | `initialValues` is empty; form shows saved params only |
| Mixed scan (some fields mapped, some not) | deepMerge leaves unmapped fields at their saved values |
| User discards DrawnUIModal | No PATCH is sent; object unchanged |

---

## Out of Scope

- Changing how `AreaList` renders (already correct).
- Changing the create flow in any way.
- Supporting Studio edit mode without Map to Form (i.e., Studio → direct submit →
  PATCH). That is a separate feature.
