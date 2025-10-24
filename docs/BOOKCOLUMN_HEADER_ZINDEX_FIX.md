# BookColumn Header Z-Index Fix Plan

## Problem Statement
When there is a lot of data in the BookColumn component and the user scrolls down, the scrolling content appears **above** the BookColumnHeader (which displays names like "BlockAuthoring", "Recalls", etc.) instead of scrolling **beneath** it. This makes the header text unreadable and breaks the sticky header functionality.

## User Experience Issue
1. User opens a BookColumn tab (e.g., "Thumbnails", "Recalls", "Micro Learning")
2. The BookColumnHeader displays the column name at the top
3. User scrolls down through the content
4. **ISSUE**: Content scrolls OVER the header, obscuring the column name
5. **EXPECTED**: Content should scroll UNDER the header, keeping the header visible

## Root Cause Analysis

### Current Implementation

**BookColumnHeader Component** (`src/components/Book/BookColumnHeader/BookColumnHeader.jsx`):
- Simple header with column name and close button
- Uses `position: sticky` in its stylesheet

**BookColumnHeader Styles** (`src/components/Book/BookColumnHeader/bookColumnHeader.module.scss`):
```scss
.book-column-header {
  position: sticky;        // ✓ Correct: stays at top during scroll
  top: 0;                  // ✓ Correct: positioned at top
  left: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 2px solid #ccc;
  background-color: #fff;  // ✓ Correct: opaque background
  // ❌ MISSING: z-index property!
}
```

**BookColumn Styles** (`src/components/Book/BookColumn/bookColumn.module.scss`):
```scss
.book-column {
  overflow-y: scroll;      // ✓ Scrollable container
  box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px,
    rgba(0, 0, 0, 0.3) 0px 30px 60px -30px,
    rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;
  height: 100%;
}
```

**BookColumn Component Structure** (`src/components/Book/BookColumn/BookColumn.jsx:22-28`):
```jsx
<div style={{ height: "100%" }}>
  <BookColumnHeader
    columnName={column.label}
    close={() => onChangeActiveTab("")}
  />
  {column.component}  // Content scrolls here
</div>
```

### The Core Issue: Missing Z-Index

**Problem:**
- The BookColumnHeader uses `position: sticky` which removes it from normal document flow
- Without an explicit `z-index`, the header has a default stacking context
- When content scrolls, it can appear above the sticky header due to:
  1. Natural stacking order (later DOM elements can appear on top)
  2. Child components (like Lists, Tables) may have their own z-index values
  3. Complex nested layouts creating new stacking contexts

**Why sticky alone isn't enough:**
- `position: sticky` controls **positioning behavior** (stick to top on scroll)
- `z-index` controls **layering/stacking** (what appears on top of what)
- Both are needed for a proper sticky header that stays visible

### Stacking Context Hierarchy

Current stacking (simplified):
```
BookColumn (overflow-y: scroll)
├─ BookColumnHeader (position: sticky, z-index: auto)  ← Problem!
└─ Content (various components)
   ├─ List components (may have z-index)
   ├─ Tables (may have z-index)
   └─ Other content
```

When scrolling, content can render above the header because:
- The header has no explicit z-index (defaults to `auto`)
- Child components might have positive z-index values
- Stacking order follows DOM order when z-index is equal

## Solution

### Primary Fix: Add Z-Index to BookColumnHeader

Add `z-index: 10` (or higher) to ensure the header stays on top of all scrolling content.

**File to modify:** `src/components/Book/BookColumnHeader/bookColumnHeader.module.scss`

**Change required:**

```scss
.book-column-header {
  position: sticky;
  top: 0;
  left: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 2px solid #ccc;
  background-color: #fff;
  z-index: 10;  // ← ADD THIS LINE
}
```

### Why z-index: 10?

**Rationale for the value:**
- `z-index: 1` might conflict with child components that have z-index: 1
- `z-index: 10` provides a buffer for most content
- Not too high (like 1000) to avoid conflicts with modals/overlays
- Standard practice for sticky headers in the UI layer

**Stacking context considerations:**
- Modals typically use z-index: 1000+
- Tooltips/Popovers use z-index: 100-500
- Sticky headers use z-index: 10-50
- Regular content uses z-index: 0-5 or auto

### Recommended Z-Index: 10
This places the header:
- ✅ Above all normal scrolling content
- ✅ Below tooltips and popovers
- ✅ Well below modals and overlays
- ✅ Consistent with Material-UI's AppBar default (z-index: 1100 for modals, but sticky headers typically 10-20)

## Alternative Solutions (Not Recommended)

### Alternative 1: Use Higher Z-Index (z-index: 100)
```scss
z-index: 100;
```
**Pros:**
- Guaranteed to be above most content
- No risk of conflicts with child components

**Cons:**
- Unnecessarily high for a sticky header
- May interfere with tooltips/popovers (typically 100-500)
- Harder to maintain consistent z-index hierarchy

**Verdict:** Overkill for this use case

### Alternative 2: Restructure DOM (Wrapper Approach)
Create a new wrapper container:
```jsx
<div className="book-column-wrapper">
  <BookColumnHeader ... />
  <div className="book-column-content">
    {column.component}
  </div>
</div>
```
**Pros:**
- More semantic HTML structure
- Better separation of concerns

**Cons:**
- Requires changes to multiple files (JSX + CSS)
- More complex refactor
- Potential layout side effects
- Not necessary when z-index solves the issue

**Verdict:** Over-engineered for this simple fix

### Alternative 3: Add `isolation: isolate`
```scss
.book-column-header {
  position: sticky;
  top: 0;
  isolation: isolate;  // Creates new stacking context
}
```
**Pros:**
- Modern CSS approach
- Creates clean stacking context

**Cons:**
- Doesn't guarantee header stays on top (still needs z-index)
- Less browser support than z-index
- Adds unnecessary complexity

**Verdict:** Incomplete solution without z-index

## Implementation Steps

### Step 1: Update BookColumnHeader Styles

**File:** `/src/components/Book/BookColumnHeader/bookColumnHeader.module.scss`

**Current code (line 1-10):**
```scss
.book-column-header {
  position: sticky;
  top: 0;
  left: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 2px solid #ccc;
  background-color: #fff;
```

**Updated code:**
```scss
.book-column-header {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 10;              // ← ADD THIS LINE
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 2px solid #ccc;
  background-color: #fff;
```

**Exact change:**
- Add `z-index: 10;` after line 4 (after `left: 0;`)
- Maintains logical property grouping (positioning properties together)

### Step 2: Test the Fix

After implementing, verify the following scenarios:

#### Basic Functionality
- [ ] Open a BookColumn tab (e.g., "Thumbnails", "Recalls")
- [ ] Header displays correctly at the top
- [ ] Scroll down through content
- [ ] **Verify:** Header stays visible and on top
- [ ] **Verify:** Content scrolls UNDER the header, not OVER it
- [ ] **Verify:** Header text remains readable during scroll

#### Multiple Columns
Test with different column types:
- [ ] "Thumbnails" column
- [ ] "Recalls" column
- [ ] "Micro Learning" column
- [ ] "Enriching Content" column
- [ ] "Check Yourself" column
- [ ] "Illustrative Interactions" column
- [ ] "Table of Contents" column
- [ ] "Glossary" column

#### Edge Cases
- [ ] Column with very long content (100+ items)
- [ ] Column with mixed content types (images, text, tables)
- [ ] Rapidly switching between columns
- [ ] Scroll to bottom, then scroll back to top
- [ ] Open column, close it, reopen it
- [ ] Multiple rapid scrolls (stress test)

#### Visual Regression
- [ ] Header border-bottom still visible
- [ ] Close button (MinimizeIcon) still clickable
- [ ] No visual artifacts or flickering
- [ ] No layout shifts when scrolling
- [ ] Background color (#fff) fills entire header area
- [ ] No transparent gaps between header and content

#### Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browsers (responsive check)

### Step 3: Verify No Side Effects

Check that the z-index doesn't interfere with:
- [ ] Modals opening over the header
- [ ] Tooltips appearing correctly
- [ ] Dropdowns/Selects in the column content
- [ ] Context menus
- [ ] Any overlays or popovers

## Expected Behavior After Fix

### Before Fix:
```
[Scrolling Content Appears Here]  ← Obscures header
┌─────────────────────────────────┐
│ Recalls                    [-]  │ ← Hidden/obscured
└─────────────────────────────────┘
[More Content...]
```

### After Fix:
```
┌─────────────────────────────────┐
│ Recalls                    [-]  │ ← Always visible on top
└─────────────────────────────────┘
[Scrolling Content Below Header]
[More Content...]
[Content scrolls under the header]
```

## Why This Fix Works

1. **`position: sticky`** - Makes the header stick to the top during scroll
2. **`top: 0`** - Defines where the header sticks (at the very top)
3. **`background-color: #fff`** - Makes the header opaque (hides content behind it)
4. **`z-index: 10`** - **NEW** - Ensures the header is layered ABOVE the scrolling content

All four properties work together:
- Sticky positioning → Header stays at top when scrolling
- Background color → Header is opaque (not transparent)
- Z-index → Header is stacked on top (not behind)
- Result → Content scrolls smoothly underneath a visible header

## CSS Specificity & Cascade

**Verify no conflicts:**
- Check that no parent components override `z-index`
- Ensure BookColumn doesn't create new stacking context that isolates the header
- Confirm no global styles that might interfere

**Current cascade:**
```
.book-column-header (module scoped) ← Our change here
  └─ No parent overrides expected
```

## Rollback Plan (If Needed)

If the fix causes unexpected issues:

1. **Remove the z-index line:**
   ```diff
   - z-index: 10;
   ```

2. **Alternative temporary fix:**
   ```scss
   z-index: 1;  // Minimal z-index
   ```

3. **If that still causes issues:**
   - Investigate which child components have z-index
   - Adjust the header z-index to be higher than child max z-index

## Additional Considerations

### Performance
- Z-index changes do NOT impact performance
- Sticky positioning is hardware-accelerated in modern browsers
- No reflows or repaints from this change

### Accessibility
- Header remains keyboard-accessible
- Screen readers can still access header content
- No ARIA changes needed
- Focus management unaffected

### Responsiveness
- Fix works on all screen sizes
- Mobile scrolling behavior preserved
- No media query changes needed

### Browser Compatibility
- `position: sticky` is well-supported (95%+ browsers)
- `z-index` has universal support
- No polyfills needed

## Files Modified

1. `/src/components/Book/BookColumnHeader/bookColumnHeader.module.scss` - Add `z-index: 10` on line 5 (after `left: 0;`)

## Estimated Effort

- **Implementation**: 1 minute (add one line)
- **Testing**: 10-15 minutes (comprehensive scroll testing)
- **Total**: ~15 minutes

## Success Criteria

✅ **Fix is successful when:**
1. BookColumnHeader stays visible at the top during scroll
2. Content scrolls smoothly UNDER the header (not over it)
3. Header text remains readable at all times
4. No visual artifacts or layout shifts
5. Works across all column types
6. No interference with modals, tooltips, or other overlays

## Notes for Future Development

- **Convention**: Use z-index: 10 for sticky headers throughout the app
- **Documentation**: Document z-index hierarchy in a central location
- **Consistency**: Apply same pattern to other sticky elements (if any)
- **Monitoring**: Watch for child components that set high z-index values

## Related Components

These components are part of the BookColumn system:
- `BookColumn.jsx` - Container with overflow scroll
- `BookColumnHeader.jsx` - The sticky header
- `BookColumn2.jsx` - Alternative column implementation
- `BookThumnails.jsx` - Thumbnails column content
- `TableOfContents.jsx` - TOC column content
- `List.jsx` - Generic list column content
- `GlossaryAndKeywords.jsx` - Glossary column content

If similar issues appear in other components, apply the same z-index pattern.
