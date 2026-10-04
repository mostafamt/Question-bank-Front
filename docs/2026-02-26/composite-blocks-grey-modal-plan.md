# Plan: Composite Blocks – Grey Modal Blocks + Random Color on Click (Persistent)

## Overview

Update the Composite Blocks feature so that:
1. When the **hand icon** is clicked, the modal shows all available blocks in **grey color** (unselected state)
2. When the user **clicks a block inside the modal**, that block **immediately turns a random color in the modal itself** (visual feedback)
3. The block is added to composite blocks carrying that same random color
4. When the modal is **re-opened**, previously selected blocks still show their assigned color; unselected blocks remain grey

---

## Current Behavior

| Step | What happens now |
|------|-----------------|
| User clicks `BackHand` icon | Opens `composite-blocks-modal` |
| Modal renders | Blocks shown with their **existing saved colors** |
| User clicks a block | `onSelectObject(blockId)` fires → modal closes |
| Block added to composite list | Gets a **sequential** color: `colors[areas.length % colors.length]` |
| User re-opens modal | Same saved colors again — no visual distinction between selected/unselected |

---

## Desired Behavior

| Step | What should happen |
|------|-------------------|
| User clicks `BackHand` icon | Opens `composite-blocks-modal` |
| Modal renders | All blocks shown in **grey** — unselected state |
| Previously selected blocks | Show their **assigned random color** (persisted from previous interaction) |
| User clicks a block | That block **immediately turns a random color in the modal** |
| Block added to composite list | Carries the **same random color** shown in the modal |
| Modal closes | — |
| User re-opens modal | Selected blocks still show their random color; unselected remain grey |

---

## Root Cause of the Persistence Problem

If `selectedColors` lives as local state inside `CompositeBlocksModal`, it is **destroyed every time the modal closes** and resets to `{}` on the next open. The state must live in `useCompositeBlocks.js` (which persists for the lifetime of the Studio session) and be passed into the modal as a prop.

---

## Files to Change

### 1. `src/components/Studio/hooks/useCompositeBlocks.js`

**A) Add `selectedColors` persistent state**

Add a new state object that maps `blockId → color`. This lives in the hook so it survives modal open/close cycles.

```javascript
const [selectedColors, setSelectedColors] = React.useState({}); // { blockId: color }
```

**B) Update `onClickHand()` to pass `selectedColors` and a color-aware `onSelectObject`**

```javascript
const onClickHand = () => {
  openModal("composite-blocks-modal", {
    onSelectObject: (blockId, color) => {
      // Update persistent color map
      setSelectedColors((prev) => ({ ...prev, [blockId]: color }));

      // Find selected object in areasProperties
      let selectedObject = null;
      for (let i = 0; i < areasProperties.length; i++) {
        const found = areasProperties[i].find((area) => area.blockId === blockId);
        if (found) { selectedObject = found; break; }
      }
      if (!selectedObject) return;

      // Add to composite blocks using the color from the modal
      const newArea = {
        id: uuidv4(),
        x: selectedObject.x,
        y: selectedObject.y,
        width: selectedObject.width,
        height: selectedObject.height,
        unit: "%",
        type: "",
        text: selectedObject.text,
        color, // ← color decided in the modal, not here
        loading: false,
        open: true,
        img: null,
      };

      setCompositeBlocks((prevState) => ({
        ...prevState,
        areas: [...prevState.areas, newArea],
      }));
    },
    selectedColors, // ← pass current map so modal knows which blocks are already selected
    pages,
    areasProperties,
  });
};
```

**C) Return `selectedColors` and `setSelectedColors` from the hook** (so they can be reset if needed)

```javascript
return {
  compositeBlocks,
  setCompositeBlocks,
  selectedColors,        // new
  setSelectedColors,     // new
  loadingSubmitCompositeBlocks,
  onChangeCompositeBlocks,
  DeleteCompositeBlocks,
  processCompositeBlock,
  onSubmitCompositeBlocks,
  onChangeCompositeBlockArea,
  onClickHand,
};
```

---

### 2. `src/components/Modal/CompositeBlocksModal/CompositeBlocksModal.jsx`

**A) Accept `selectedColors` as a prop (no local state for colors)**

```javascript
const {
  handleCloseModal,
  onSelectObject,
  selectedColors = {}, // ← from hook, persists across opens
  pages,
  areasProperties,
} = props;
```

**B) Keep `selectableAreas` for filtering only**

```javascript
const selectableAreas = useMemo(() => {
  if (!areasProperties || !Array.isArray(areasProperties)) return [];
  return areasProperties.map((pageAreas) => {
    if (!Array.isArray(pageAreas)) return [];
    return pageAreas.filter(
      (area) =>
        area.blockId &&
        (area.type === "Question" || area.type === "Illustrative object")
    );
  });
}, [areasProperties]);
```

**C) Build `displayAreas` — grey for unselected, persistent random color for selected**

```javascript
const displayAreas = useMemo(() => {
  return selectableAreas.map((pageAreas) =>
    pageAreas.map((area) => ({
      ...area,
      color: selectedColors[area.blockId] ?? "#808080", // grey if not yet selected
    }))
  );
}, [selectableAreas, selectedColors]);
```

**D) On click: pick random color, call `onSelectObject(blockId, color)`, close modal**

The `onSelectObject` callback (defined in the hook) now handles both updating `selectedColors` (persistent) and adding the area to composite blocks.

```javascript
const onAreaClick = useCallback(
  (areaProps) => {
    const areaIndex = areaProps.areaNumber - 1;
    const area = selectableAreas[activePage]?.[areaIndex];

    if (area?.blockId && onSelectObject) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      // Hook updates selectedColors (persistent) and composite blocks
      onSelectObject(area.blockId, randomColor);
      handleCloseModal();
    }
  },
  [activePage, selectableAreas, onSelectObject, handleCloseModal]
);
```

**E) Pass `displayAreas` to `StudioEditor`**

```jsx
<StudioEditor
  areasProperties={displayAreas}  // was selectableAreas
  areas={displayAreas}            // was selectableAreas
  ...
/>
```

---

## No Other Changes Needed

- `StudioAreaSelector.jsx` — no changes; reads `color` from areas passed in
- `StudioCompositeBlocks.jsx` — no changes
- `Studio.jsx` — no changes
- `Modal.jsx` (registry) — no changes

---

## Data Flow (Final)

```
useCompositeBlocks
  ├─ selectedColors: { blockId → color }   ← persists across modal opens
  └─ onClickHand()
       └─ openModal("composite-blocks-modal", { onSelectObject, selectedColors, ... })
            ↓
       CompositeBlocksModal renders
         ├─ selectableAreas  (filtered, no color override)
         └─ displayAreas     (grey if blockId not in selectedColors, else stored color)
              ↓ StudioEditor shows grey/colored blocks

       User clicks a block
         ↓
       onAreaClick()
         ├─ randomColor = colors[random index]
         ├─ onSelectObject(blockId, randomColor)
         │    ↓ back in useCompositeBlocks:
         │    ├─ setSelectedColors({ ...prev, [blockId]: randomColor })  ← persists
         │    └─ setCompositeBlocks → new area with randomColor
         └─ handleCloseModal()

       User re-opens modal
         └─ displayAreas uses updated selectedColors → selected blocks show their color
```

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| `selectedColors` grows stale if composite blocks are deleted | Low | On `onSubmitCompositeBlocks` or reset, also reset `selectedColors` via `setSelectedColors({})` |
| Two blocks get same random color | Low | 7-color palette; acceptable for typical use |
| Breaking `StudioEditor` by swapping to `displayAreas` | None | Only color values change; all coordinates, blockIds, and types remain intact |

---

## Summary of Changes

| File | Change |
|------|--------|
| `useCompositeBlocks.js` | Add `selectedColors` state; update `onClickHand` to pass `selectedColors` into modal and accept `color` in `onSelectObject`; update `setSelectedColors` on selection; return `selectedColors` from hook |
| `CompositeBlocksModal.jsx` | Accept `selectedColors` prop (no local color state); add `displayAreas` memo using `selectedColors`; update `onAreaClick` to pick random color and pass to `onSelectObject`; pass `displayAreas` to `StudioEditor` |
