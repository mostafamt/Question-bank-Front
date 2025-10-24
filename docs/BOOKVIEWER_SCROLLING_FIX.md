# BookViewer Scrolling Fix Plan

## Problem Statement
The BookViewer component in the Book reader page does not allow scrolling. Users cannot scroll through the page content, making it impossible to view content that extends beyond the visible viewport.

## User Experience Issue
1. User navigates to a Book reader page (e.g., `/read/book/{bookId}/chapter/{chapterId}`)
2. The page displays with content in the BookViewer component
3. User attempts to scroll the page content
4. **ISSUE**: Scrolling does not work - the page remains static
5. **EXPECTED**: Users should be able to scroll through page content vertically

## Root Cause Analysis

### Component Hierarchy

```
BookHeaderLayout (container)
└─ BookTabsLayout (.book-content-layout)
   ├─ BookColumn2 (left side columns)
   ├─ BookViewer (.book-viewer)         ← The problem component
   │  ├─ BookViewerTopBar (.actions)
   │  └─ .blocks (height: 94%)
   │     ├─ VirtualBlock components (grid items)
   │     └─ .viewer-box (grid item)
   │        ├─ background-image (page image)
   │        └─ .area-button elements (absolutely positioned)
   └─ BookColumn2 (right side columns)
```

### The Core Issues

#### Issue 1: Conflicting Height Declarations

**BookViewer styles** (`bookViewer.module.scss`):
```scss
.book-viewer {
  position: relative;
  flex: 0 1 auto;          // ← Allows shrinking but no growth
  overflow: scroll;        // ← Trying to enable scroll
  overflow-y: scroll;      // ← Redundant with above
  height: 100%;            // ← Problem: depends on parent height
}
```

**Problems:**
- `flex: 0 1 auto` means "don't grow, but shrink if needed, use content size"
- `height: 100%` conflicts with `flex: 0 1 auto` - which takes precedence?
- Parent container has fixed height but BookViewer isn't properly sized

#### Issue 2: Parent Container Constraints

**BookTabsLayout styles** (`bookTabsLayout.module.scss`):
```scss
.book-content-layout {
  display: flex;
  height: 64rem;           // ← Fixed height container

  & > div {
    width: 100%;           // ← All children take full width
  }
}
```

**Problems:**
- Fixed `height: 64rem` constrains all children
- The middle div (BookViewer) must fit within this height
- With fixed height, there's no room for content to overflow and scroll

#### Issue 3: Content Has No Natural Height

**viewer-box element** (`bookViewer.module.scss:38-77`):
```scss
.viewer-box {
  grid-column: 2 / 6;
  grid-row: 2 / 8;
  height: 100%;            // ← Takes 100% of grid cell
  position: relative;
  background-image: url(...);   // ← Background doesn't create scrollable content
  background-size: cover;
}
```

**Problems:**
- Uses `background-image` instead of `<img>` tag
- Backgrounds don't create natural document height
- No actual content height to scroll through
- Grid positioning with `height: 100%` makes it fit the grid cell exactly

#### Issue 4: Nested Height Percentages

```
.book-viewer (height: 100%)
└─ .blocks (height: 94%)
   └─ .viewer-box (height: 100% of grid cell)
```

**Problems:**
- Multiple nested percentage heights create ambiguity
- Each level depends on its parent having a defined height
- Grid layout further complicates the height calculation
- No element actually has natural/intrinsic content height

### Why Scrolling Doesn't Work

**For scrolling to work, you need:**
1. ✅ Container with `overflow: scroll` - **Present**
2. ❌ Content height > Container height - **Missing**
3. ❌ Proper height constraints on container - **Conflicting**

**Current situation:**
- Container: `height: 100%` of parent (64rem)
- Content: Also constrained to 100% of parent
- Result: Content height = Container height → No overflow → No scroll

## Solution Options

### Option 1: Make Content Taller Than Container (Recommended)

Allow the content (`.viewer-box`) to have its natural height based on the image, making it overflow the container.

**Approach:**
- Remove `height: 100%` from `.viewer-box`
- Use `min-height` instead to allow growth
- Let the image determine the natural height
- Consider switching from `background-image` to `<img>` tag

**Advantages:**
- ✅ Respects natural image dimensions
- ✅ Content can be taller than viewport
- ✅ Natural scrolling behavior
- ✅ Works with different image aspect ratios

**Disadvantages:**
- May require adjusting grid layout
- Absolutely positioned buttons need testing
- VirtualBlocks positioning may need updates

### Option 2: Use Explicit Content Height

Set a fixed or calculated height on the content that's larger than the container.

**Approach:**
- Calculate image height based on aspect ratio
- Set explicit `height` on `.viewer-box`
- Ensure height exceeds container height

**Advantages:**
- ✅ Predictable layout
- ✅ Guaranteed scrollability

**Disadvantages:**
- ❌ Requires knowing image dimensions
- ❌ Not responsive to different images
- ❌ More complex calculation logic

### Option 3: Use Actual <img> Instead of Background

Replace `background-image` with an actual `<img>` element.

**Approach:**
- Replace background-image with `<img src={activePage?.url} />`
- Let image have natural dimensions
- Overlay buttons on top

**Advantages:**
- ✅ Natural content height
- ✅ Better accessibility (alt text)
- ✅ Proper image loading states
- ✅ SEO benefits

**Disadvantages:**
- Requires updating button positioning logic
- May affect VirtualBlock layout
- Need to ensure overlay buttons work correctly

### Option 4: Change Container Sizing Strategy

Instead of `height: 100%`, use `max-height` or different flex properties.

**Approach:**
- Change `height: 100%` to `max-height: 64rem` on `.book-viewer`
- Allow content to overflow naturally
- Adjust flex properties

**Advantages:**
- ✅ Allows content overflow
- ✅ Simpler fix

**Disadvantages:**
- May affect other layout aspects
- Less predictable behavior

## Recommended Solution: Hybrid Approach (Option 1 + Option 3)

Combine switching to `<img>` tag with proper height management for best results.

### Step-by-Step Implementation

#### Step 1: Update BookViewer Component JSX

**File:** `/src/components/Book/BookViewer/BookViewer.jsx`

**Current code (lines 87-109):**
```jsx
<div
  className={styles["viewer-box"]}
  style={{
    gridColumn: showVB ? "2 / 6" : "1 / 8",
    gridRow: showVB ? "2 / 8" : "1 / 8",
    backgroundImage: `url(${activePage?.url})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    height: showVB ? "94%" : "99%",
  }}
  ref={ref}
>
  {/* {activePage && <img src={activePage.url} alt={activePage.url} />} */}
  {areas?.map((area) => (
    <button
      key={area.blockId}
      className={styles["area-button"]}
      style={getStyle(area)}
      onClick={() => onClickArea(area)}
    ></button>
  ))}
</div>
```

**Updated code:**
```jsx
<div
  className={styles["viewer-box"]}
  style={{
    gridColumn: showVB ? "2 / 6" : "1 / 8",
    gridRow: showVB ? "2 / 8" : "1 / 8",
  }}
  ref={ref}
>
  {activePage && (
    <img
      src={activePage.url}
      alt={`Page ${activePage.pageNumber || ''}`}
      className={styles["page-image"]}
    />
  )}
  {areas?.map((area) => (
    <button
      key={area.blockId}
      className={styles["area-button"]}
      style={getStyle(area)}
      onClick={() => onClickArea(area)}
    ></button>
  ))}
</div>
```

**Changes:**
1. Remove `backgroundImage`, `backgroundSize`, `backgroundRepeat` from inline styles
2. Remove dynamic `height` from inline styles
3. Uncomment and use the `<img>` tag with proper className
4. Add descriptive alt text for accessibility

#### Step 2: Update BookViewer Styles

**File:** `/src/components/Book/BookViewer/bookViewer.module.scss`

**Current `.book-viewer` (lines 1-14):**
```scss
.book-viewer {
  position: relative;
  flex: 0 1 auto;
  overflow: scroll;
  overflow-y: scroll;
  // height: 120vh;
  height: 100%;

  & .actions {
    border-bottom: 2px solid #ccc;
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
  }
```

**Updated `.book-viewer`:**
```scss
.book-viewer {
  position: relative;
  flex: 1 1 auto;           // Allow growth
  overflow-y: auto;         // Enable vertical scroll
  max-height: 100%;         // Don't exceed parent height

  & .actions {
    border-bottom: 2px solid #ccc;
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
  }
```

**Changes:**
1. Change `flex: 0 1 auto` → `flex: 1 1 auto` (allow growth)
2. Change `overflow-y: scroll` → `overflow-y: auto` (only show scrollbar when needed)
3. Remove redundant `overflow: scroll`
4. Change `height: 100%` → `max-height: 100%` (don't exceed parent)

**Current `.blocks` (lines 16-36):**
```scss
& .blocks {
  height: 94%;

  $block-size: 4rem;
  display: grid;
  grid-template-columns: $block-size repeat(4, 1fr) $block-size;
  grid-template-rows: $block-size repeat(6, 1fr) $block-size;

  // ... grid positioning for virtual blocks
}
```

**Updated `.blocks`:**
```scss
& .blocks {
  min-height: 100%;         // At least full viewport height

  $block-size: 4rem;
  display: grid;
  grid-template-columns: $block-size repeat(4, 1fr) $block-size;
  grid-template-rows: $block-size repeat(6, minmax(auto, 1fr)) $block-size;

  // ... grid positioning for virtual blocks (unchanged)
}
```

**Changes:**
1. Change `height: 94%` → `min-height: 100%` (allow growth beyond viewport)
2. Change `grid-template-rows` to use `minmax(auto, 1fr)` for flexible rows

**Current `.viewer-box` (lines 38-77):**
```scss
& .viewer-box {
  border: none !important;
  grid-column: 2 / 6;
  grid-row: 2 / 8;

  height: 100%;
  position: relative;

  & img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    // height: 100%;
    // object-fit: contain;
    overflow-y: scroll;
    // width: 100%;
    height: 100%;
    object-fit: contain;
    overflow-y: scroll;
  }

  & .area-button {
    // ... button styles
  }
}
```

**Updated `.viewer-box`:**
```scss
& .viewer-box {
  border: none !important;
  grid-column: 2 / 6;
  grid-row: 2 / 8;

  position: relative;
  display: flex;
  align-items: flex-start;  // Align image to top
  justify-content: center;  // Center image horizontally

  & .page-image {
    width: 100%;
    height: auto;            // Maintain aspect ratio
    display: block;
  }

  & .area-button {
    position: absolute;
    background-color: transparent;
    border: 0;
    background-color: rgba(#eee, 0.1);
    box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px, rgba(0, 0, 0, 0.1) 0px 1px 2px;

    &:hover {
      box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px,
        rgba(0, 0, 0, 0.24) 0px 1px 2px;
      background-color: rgba(#eee, 0.5);
    }
  }
}
```

**Changes:**
1. Remove `height: 100%` from `.viewer-box`
2. Add `display: flex` with alignment for proper image positioning
3. Replace complex nested `img` styles with new `.page-image` class
4. Use `height: auto` to maintain image aspect ratio
5. Keep `.area-button` styles unchanged

## Alternative Quick Fix (If Full Solution Too Risky)

If the full solution seems too invasive, try this simpler fix first:

**File:** `/src/components/Book/BookViewer/bookViewer.module.scss`

**Just change line 17:**
```scss
& .blocks {
  height: 94%;              // ← Current

  // Change to:
  min-height: 94vh;         // ← New (viewport-based minimum height)
```

This may enable scrolling by making the blocks container tall enough to overflow.

## Testing Checklist

After implementing the fix:

### Basic Scrolling
- [ ] Page loads correctly
- [ ] Vertical scrollbar appears (if content is tall)
- [ ] Can scroll up and down through the page
- [ ] Scroll is smooth (not jumpy)
- [ ] Scrollbar disappears when not needed

### Image Display
- [ ] Page image displays correctly
- [ ] Image maintains aspect ratio
- [ ] Image is centered horizontally
- [ ] No distortion or stretching
- [ ] Image loads properly

### Interactive Buttons
- [ ] Area buttons (.area-button) are visible
- [ ] Buttons are positioned correctly over the image
- [ ] Hover effects work
- [ ] Click handlers trigger correctly
- [ ] Buttons move with scroll (stay in position relative to image)

### VirtualBlocks
- [ ] VirtualBlocks display correctly
- [ ] Grid layout is maintained
- [ ] VirtualBlocks toggle works (show/hide)
- [ ] When VirtualBlocks are shown, layout adjusts correctly
- [ ] When VirtualBlocks are hidden, viewer uses full width

### Navigation
- [ ] Previous/Next page buttons work
- [ ] Page changes maintain scroll position appropriately
- [ ] Thumbnails navigation works
- [ ] Table of Contents navigation works

### Responsive Behavior
- [ ] Desktop (>768px): Scrolling works, image sized correctly
- [ ] Tablet (768px): Scrolling works, layout adjusts
- [ ] Mobile (<768px): Scrolling works, readable on small screens

### Edge Cases
- [ ] Very tall images: Scrollable
- [ ] Very wide images: Fit properly, scroll vertically
- [ ] Small images: Centered, no unnecessary scrollbar
- [ ] Empty/missing images: No errors, graceful fallback
- [ ] Rapid page switching: No visual artifacts

## Potential Side Effects to Watch

1. **Button Positioning**: Area buttons are absolutely positioned. After changing from background-image to <img>, verify their coordinates still work.

2. **VirtualBlocks Layout**: The grid layout might shift. Test with VirtualBlocks both shown and hidden.

3. **Performance**: Using <img> instead of background might affect rendering performance slightly. Monitor for issues.

4. **Aspect Ratios**: Different page images may have different aspect ratios. Ensure all look good.

## Rollback Plan

If the fix causes issues:

1. **Revert BookViewer.jsx**:
   - Comment out the `<img>` tag
   - Restore `backgroundImage` inline styles
   - Restore dynamic `height` inline styles

2. **Revert bookViewer.module.scss**:
   - Restore `flex: 0 1 auto`
   - Restore `overflow-y: scroll`
   - Restore `height: 100%` on `.book-viewer`
   - Restore `height: 94%` on `.blocks`
   - Restore `height: 100%` on `.viewer-box`

3. **Test Alternative**: Try the "Quick Fix" approach instead

## Browser Compatibility

- ✅ Chrome/Edge: Full support for flex, grid, overflow
- ✅ Firefox: Full support
- ✅ Safari: Full support
- ✅ Mobile browsers: Full support

No compatibility concerns with the proposed changes.

## Accessibility Improvements

The recommended fix also improves accessibility:

- ✅ `<img>` tag is accessible to screen readers
- ✅ `alt` attribute describes the page content
- ✅ Keyboard navigation works with scrolling
- ✅ Focus management unaffected

## Performance Considerations

**Before (background-image):**
- Background rendering on GPU
- No separate element
- Faster initial render

**After (<img> tag):**
- Image element in DOM
- Proper loading states
- Slightly more memory

**Impact:** Negligible performance difference. The benefits (scrolling, accessibility, maintainability) outweigh any minimal performance cost.

## Files to Modify

1. `/src/components/Book/BookViewer/BookViewer.jsx` - Update JSX to use <img> tag
2. `/src/components/Book/BookViewer/bookViewer.module.scss` - Update styles for scrolling

## Estimated Effort

- **Code changes**: 10-15 minutes
- **Testing**: 20-30 minutes
- **Edge case testing**: 10-15 minutes
- **Total**: 40-60 minutes

## Success Criteria

✅ **Fix is successful when:**
1. Users can scroll vertically through BookViewer content
2. Page images display correctly with proper aspect ratio
3. Interactive area buttons work and are positioned correctly
4. VirtualBlocks show/hide functionality works
5. Page navigation maintains expected behavior
6. No visual artifacts or layout breaks
7. Works across all screen sizes (responsive)
8. No console errors or warnings

## Future Enhancements

After fixing scrolling, consider:

1. **Zoom functionality**: Allow users to zoom in/out on pages
2. **Keyboard shortcuts**: Arrow keys for scrolling, PgUp/PgDn for navigation
3. **Scroll position memory**: Remember scroll position when navigating away and back
4. **Smooth scroll to annotations**: When clicking area buttons, smooth scroll to that location
5. **Lazy loading**: Load images only when needed for performance

## Notes

- The root cause is a combination of conflicting height constraints and using background-image instead of actual content
- The fix addresses both issues: proper sizing and real scrollable content
- The solution is more maintainable and accessible
- VirtualBlocks grid layout may need minor tweaks after testing
