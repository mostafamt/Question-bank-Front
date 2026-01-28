# Fixing Maximum Update Depth Exceeded in React Hooks

## Problem

You encountered the React warning:

> **Maximum update depth exceeded**

This happens when a component repeatedly updates state during render cycles, causing an infinite render loop.

---

## Root Cause

The issue was **not** caused by `useMemo` or column builders.

The real problem was **`useEffect` hooks without dependency arrays** that were:

- Running on **every render**
- Updating refs used by memoized callbacks
- Triggering downstream state updates
- Causing an infinite render → effect → state → render loop

### Problematic Example

```js
useEffect(() => {
  changePageByIdRef.current = changePageById;
  hightBlockRef.current = hightBlock;
  changePageByIndexRef.current = changePageByIndex;
  getBlockFromBlockIdRef.current = getBlockFromBlockId;
  pagesRef.current = pages;
});
```

And:

```js
useEffect(() => {
  rightColumnPropsRef.current = rightColumnProps;
});
```

---

## Why This Causes a Loop

Even though refs don’t trigger re-renders:

- Effects **without dependencies run every render**
- Those effects mutate refs
- Memoized callbacks depending on refs change behavior
- State updates occur downstream
- React re-renders again → infinite loop

---

## Correct Fix

Add **proper dependency arrays** so effects run **only when values actually change**.

### Fixed Version

```js
useEffect(() => {
  changePageByIdRef.current = changePageById;
}, [changePageById]);

useEffect(() => {
  hightBlockRef.current = hightBlock;
}, [hightBlock]);

useEffect(() => {
  changePageByIndexRef.current = changePageByIndex;
}, [changePageByIndex]);

useEffect(() => {
  getBlockFromBlockIdRef.current = getBlockFromBlockId;
}, [getBlockFromBlockId]);

useEffect(() => {
  pagesRef.current = pages;
}, [pages]);
```

And:

```js
useEffect(() => {
  rightColumnPropsRef.current = rightColumnProps;
}, [rightColumnProps]);
```

---

## Result

✔ Infinite render loop resolved  
✔ Tabs and columns stabilize  
✔ No more maximum update depth warning  
✔ Architecture remains clean and scalable  

---

## Debug Tip

To verify the fix:

```js
console.count("useStudioColumns render");
```

- Before fix → count increases rapidly
- After fix → count increases only on real changes

---

## Final Notes

- Your ref-based architecture is sound
- `useMemo` usage is correct
- Missing dependency arrays were the sole issue

Optional hardening:
- Guard state updates (`if (activeTab === nextTab) return`)
- Extract ref syncing into a reusable `useStableRef` hook

---

Happy coding 🚀
