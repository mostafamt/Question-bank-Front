# VirtualBlocks "Save All" Bug — Root Cause & Fix

## Summary

Clicking **Save All** in `VirtualBlockContentModal` corrupts the UI because `handleSetVirtualBlocks` in `Studio.jsx` does not handle functional updaters. It receives a **function** from `VirtualBlocks.jsx` and stores it directly as a page's virtual-blocks value instead of calling it.

---

## Data Flow

```
VirtualBlockContentModal
  → onSave(contents)                       [VirtualBlockContentModal calls prop]

VirtualBlock.jsx : handleSaveContents
  → setCheckedObject({ contents })         [line 58-60]

VirtualBlocks.jsx : getSetCheckedObject callback
  → setVirtualBlocks((prev) => ({          [line 27-30]  ← passes a FUNCTION
        ...prev,
        [label]: value
     }))

Studio.jsx : handleSetVirtualBlocks
  → newBlocks[activePageIndex] = value     [line 323]    ← value is the FUNCTION above!
```

---

## Root Cause

`VirtualBlocks.jsx` follows React's **functional updater** pattern when calling `setVirtualBlocks`:

```js
// VirtualBlocks.jsx  lines 26-30
callbacksRef.current[label] = (value) => {
  setVirtualBlocks((prev) => ({   // <-- passes a function
    ...prev,
    [label]: value,
  }));
};
```

React's built-in `useState` setter detects when you pass a function and calls it with the previous state. But `handleSetVirtualBlocks` in Studio is a **custom wrapper**, not a real setter — it does not do that check:

```js
// Studio.jsx  lines 319-328  (BROKEN)
const handleSetVirtualBlocks = React.useCallback(
  (value) => {
    setVirtualBlocks((prev) => {
      const newBlocks = [...prev];
      newBlocks[activePageIndex] = value;  // value is a function here — BUG!
      return newBlocks;
    });
  },
  [activePageIndex]
);
```

So `newBlocks[activePageIndex]` becomes the updater function itself. On the next render `virtualBlocks[activePageIndex]` is a function, every property access (`virtualBlocks[label]`, `for...in`) returns `undefined` or iterates over function properties, and the UI breaks.

---

## The Fix

Add a functional-updater check inside `handleSetVirtualBlocks`, exactly the same way React's own `useState` works:

```js
// Studio.jsx  lines 319-328  (FIXED)
const handleSetVirtualBlocks = React.useCallback(
  (value) => {
    setVirtualBlocks((prev) => {
      const newBlocks = [...prev];
      // Support functional updaters — same pattern as React's setState
      newBlocks[activePageIndex] =
        typeof value === "function"
          ? value(newBlocks[activePageIndex])  // call it with current page's object
          : value;
      return newBlocks;
    });
  },
  [activePageIndex]
);
```

**One-line diff:**
```diff
-      newBlocks[activePageIndex] = value;
+      newBlocks[activePageIndex] =
+        typeof value === "function" ? value(newBlocks[activePageIndex]) : value;
```

---

## Files Involved

| File | Line(s) | Role |
|------|---------|------|
| `src/components/Studio/Studio.jsx` | 319-328 | **Where the fix must be applied** |
| `src/components/VirtualBlocks/VirtualBlocks.jsx` | 26-30 | Passes functional updater to `setVirtualBlocks` |
| `src/components/VirtualBlocks/VirtualBlock/VirtualBlock.jsx` | 50-64 | Calls `setCheckedObject({ contents })` on Save All |
| `src/components/Modal/VirtualBlockContentModal/VirtualBlockContentModal.jsx` | — | Triggers the chain via `onSave` prop |

---

## Why No Other Files Need Changing

`VirtualBlocks.jsx` is correct — using a functional updater is the right pattern to avoid stale-closure bugs. The wrapper in `Studio.jsx` is simply missing the standard guard that React provides automatically for real `useState` setters.
