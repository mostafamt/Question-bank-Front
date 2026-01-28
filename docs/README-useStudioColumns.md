# Infinite Re-render Fix -- `useStudioColumns`

This document explains **why `useStudioColumns` was re-rendering
infinitely** and how to fix it correctly and safely.

------------------------------------------------------------------------

## 🔥 Root Cause (Summary)

The infinite re-render happens because:

1.  `rightColumnProps` is a **new object on every render**
2.  It is included in `useMemo` dependencies
3.  `rightColumns` is recalculated every render
4.  `useEffect([rightColumns])` runs
5.  `setActiveRightTab()` updates state
6.  Component re-renders → loop repeats

------------------------------------------------------------------------

## ⚠️ The Main Problem

### ❌ Unstable dependency

``` js
useMemo(() => {
  ...
}, [rightColumnProps]);
```

Objects passed inline from a parent are **never stable** unless
memoized.

------------------------------------------------------------------------

## ❌ Why `useRef` Didn't Help

You stored `rightColumnProps` in a ref:

``` js
const rightColumnPropsRef = useRef(rightColumnProps);
```

But you still **used the original object** in `useMemo`.

Refs only help **if you read from them**.

------------------------------------------------------------------------

## ✅ Correct Fix (Recommended)

### Step 1 -- Store props in a ref

``` js
const rightColumnPropsRef = useRef(rightColumnProps);

useEffect(() => {
  rightColumnPropsRef.current = rightColumnProps;
});
```

### Step 2 -- Remove unstable dependency

``` diff
useMemo(() => {
  ...
-}, [rightColumnProps]);
+}, []);
```

### Step 3 -- Read from the ref

``` js
const props = rightColumnPropsRef.current;
```

------------------------------------------------------------------------

## 🔥 Secondary Issue (Tabs Loop)

Avoid updating tab state unless the **tab no longer exists**.

### ✅ Safe tab sync logic

``` js
useEffect(() => {
  if (!rightColumns.length) return;

  const currentLabel = activeRightTabLabelRef.current;
  if (!currentLabel || !rightColumns.some(c => c.label === currentLabel)) {
    setActiveRightTab(rightColumns[0]);
  }
}, [rightColumns]);
```

------------------------------------------------------------------------

## 🧠 Key Mental Model

> `useMemo` does NOT stop re-renders\
> It only avoids recalculation **if dependencies are stable**

Unstable dependencies = infinite loops.

------------------------------------------------------------------------

## ✅ Final Checklist

✔ Do not put inline objects in dependency arrays\
✔ Use refs to stabilize complex props\
✔ Never set state just because a memo returned a new object\
✔ Compare by identifiers (labels), not object references

------------------------------------------------------------------------

## 🧪 Debug Tip

``` js
console.count("useStudioColumns render");
```

If the number increases rapidly → you still have a loop.

------------------------------------------------------------------------

## 🏁 Result

After applying these fixes: - No infinite re-render - Stable tabs -
Predictable column updates - Better performance

------------------------------------------------------------------------

Happy refactoring 🚀
