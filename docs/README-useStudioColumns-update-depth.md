
# useStudioColumns – Maximum Update Depth Warning Analysis

## Problem
You are still encountering:

> Warning: Maximum update depth exceeded

This means a `setState` is being triggered repeatedly in a render → effect → render loop.

Even though your hook is **much improved**, there is still **one remaining feedback loop**.

---

## Root Cause (Important)

### The real issue is NOT inside the hook alone

The stack trace shows:

```
dispatchSetState @ Studio.jsx:275
```

This means:

👉 **Studio.jsx is calling a state update in response to something coming from `useStudioColumns`**  
👉 That update causes `useStudioColumns` to recompute columns  
👉 Which causes the Studio effect to fire again  
👉 Infinite loop

So this is a **parent ↔ hook feedback loop**, not just a hook bug.

---

## The Hidden Trigger

### This part is still dangerous:

```js
useEffect(() => {
  setActiveLeftTab(leftColumns[0]);
}, [leftColumns]);
```

Even with guards, this still fires when:

- `leftColumns` is a **new array reference**
- `buildLeftColumns()` returns new objects (very likely)

React sees:
```
new array !== old array → effect runs → setState → rerender
```

---

## Correct Fix (Critical)

### ✅ Compare by VALUE, not by reference

You must **never** call `setActiveLeftTab` unless the tab actually changed.

### Replace LEFT tab sync effect with:

```js
useEffect(() => {
  if (!leftColumns.length) return;

  const next = leftColumns.find(
    col => col.label === activeLeftTabLabelRef.current
  ) || leftColumns[0];

  if (next.label !== activeLeftTabLabelRef.current) {
    setActiveLeftTab(next);
  }
}, [leftColumns]);
```

### Same fix for RIGHT tabs

```js
useEffect(() => {
  if (!rightColumns.length) return;

  const next = rightColumns.find(
    col => col.label === activeRightTabLabelRef.current
  ) || rightColumns[0];

  if (next.label !== activeRightTabLabelRef.current) {
    setActiveRightTab(next);
  }
}, [rightColumns]);
```

---

## Why This Works

✅ Prevents reference-based updates  
✅ Prevents re-render loops  
✅ Keeps tab stable across renders  
✅ Safe even if columns are rebuilt every render  

---

## Studio.jsx Check (Very Important)

In `Studio.jsx`, look for something like:

```js
useEffect(() => {
  setSomething(activeLeftTab);
}, [activeLeftTab]);
```

or

```js
useEffect(() => {
  setSomething(leftColumns);
}, [leftColumns]);
```

⚠️ If found → **guard it**:

```js
if (prevValue !== nextValue) {
  setSomething(nextValue);
}
```

---

## Final Rule of Thumb

> ❌ Never `setState` just because props changed  
> ✅ Only `setState` when the **meaningful value** changed

---

## Status

✔ Architecture: Good  
✔ Refs usage: Correct  
✔ Memoization: Correct  
⚠ Remaining issue: Parent ↔ hook feedback loop (fix above)

---

If you want, I can:
- Review `Studio.jsx`
- Refactor both sides safely
- Provide a final cleaned hook version

