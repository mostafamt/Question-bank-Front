# Infinite Loop - Debug Guide

**Date:** November 6, 2025
**Status:** 🔧 Debugging Mode Enabled

---

## What I've Done

I've added **comprehensive debug logging** to identify exactly which prop is causing the infinite loop.

### Changes Made:

1. **Infinite Loop Breaker** (Lines 32-50 in StudioAreaSelector.jsx)
   - Detects if component renders more than 50 times per second
   - Shows error message instead of freezing browser
   - Logs warning to console

2. **Prop Change Tracker** (Lines 163-186 in StudioAreaSelector.jsx)
   - Logs EXACTLY which props are changing on each render
   - Shows old vs new values
   - Identifies the source of infinite re-renders

3. **Fixed Multiple Callbacks**:
   - Studio.jsx: `onChangeHandler`, `onClickDeleteArea` - removed state from deps
   - StudioAreaSelector.jsx: `onClickExistedArea` - uses functional setState
   - Hooks: `useAreaManagement`, `useCompositeBlocks` - use functional setState

---

## How to Debug

### Step 1: Run the Application

Open the Studio component in your browser.

### Step 2: Open Console

Press F12 to open Developer Console.

### Step 3: Look for Debug Logs

You'll see logs like this:

```
[StudioAreaSelector] Render #1, activeRightTab= Block Authoring
[StudioAreaSelector] Props that changed: {
  areas: { old: [...], new: [...], changed: true },
  onChangeHandler: { old: function, new: function, changed: true }
}
[StudioAreaSelector] Render #2, activeRightTab= Block Authoring
[StudioAreaSelector] Props that changed: {
  areasProperties: { old: [...], new: [...], changed: true }
}
```

### Step 4: Identify the Culprit

The prop that appears in **every render's "Props that changed"** log is the one causing the infinite loop.

Common culprits:
- `areas` - areas array changing
- `areasProperties` - properties array changing
- `onChangeHandler` - callback changing
- `setAreasProperties` - setter changing
- `compositeBlocks` - composite blocks object changing

---

## What to Send Me

Please run the app and send me:

1. **First 10 console logs** showing which props changed
2. **Error message** if infinite loop breaker triggers
3. **Screenshot** of the console output

With this information, I can tell you EXACTLY what's causing the issue and how to fix it.

---

## Expected Console Output

### If Fixed (Good):
```
[StudioAreaSelector] Render #1, activeRightTab= Block Authoring
[StudioAreaSelector] Props that changed: { ... initial props ... }
[StudioAreaSelector] Render #2, activeRightTab= Block Authoring
(no more renders unless you interact with the component)
```

### If Still Broken (Bad):
```
[StudioAreaSelector] Render #1, activeRightTab= Block Authoring
[StudioAreaSelector] Props that changed: { areas: {...} }
[StudioAreaSelector] Render #2, activeRightTab= Block Authoring
[StudioAreaSelector] Props that changed: { areas: {...} }
[StudioAreaSelector] Render #3, activeRightTab= Block Authoring
[StudioAreaSelector] Props that changed: { areas: {...} }
... (continues infinitely until breaker triggers)
INFINITE LOOP DETECTED! Stopping renders.
```

---

## Quick Test

1. Open Studio
2. Wait 2 seconds
3. Check console
4. If you see "INFINITE LOOP DETECTED", send me the console logs
5. If you see just 1-2 renders, it's FIXED! ✅

---

## Files Modified in This Attempt

1. `Studio.jsx`:
   - Added useRef import
   - Fixed `onChangeHandler` to not depend on areasProperties
   - Fixed `onClickDeleteArea` to not depend on areasProperties

2. `StudioAreaSelector.jsx`:
   - Added infinite loop breaker
   - Added prop change tracker
   - Fixed `onClickExistedArea` to use functional setState
   - Fixed `customRender` to not depend on areasProperties

3. `useAreaManagement.js`:
   - Fixed 4 callbacks to use functional setState

4. `useCompositeBlocks.js`:
   - Fixed `updateFromAreaSelector` to use functional setState

---

**Please test and send me the console output so I can identify the exact cause.**
