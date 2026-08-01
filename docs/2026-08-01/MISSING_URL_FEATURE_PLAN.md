# Feature Plan: Handle Missing Page URLs in Studio

**Date**: 2026-08-01  
**Feature**: Graceful handling of missing page image URLs in Studio component  
**Status**: Planning

---

## 1. Problem Statement

When fetching pages via the `/pages` endpoint with a `chapterId`, the response includes page objects with the following structure:

```json
{
  "_id": "page-id",
  "url": "http://res.cloudinary.com/...",
  "blocks": [...],
  "v_blocks": [...]
}
```

### Issue
The `url` property may be missing from some page objects, causing:

- **Broken image displays** in the Studio page viewer
- **Potential errors** when trying to render or select areas on non-existent images
- **Poor user experience** with no fallback UI feedback
- **Confusion** about whether the URL failed to load or was never provided

### Current Impact
- Pages without URLs display as broken images
- Users cannot interact with these pages in the Studio component
- No visual indication that the URL is missing vs. failed to load

---

## 2. Solution Design

When a page URL is missing, display a white background canvas in the `studio_area_selector` div while **keeping area selection active**:

- **Visual**: Solid white background filling the entire studio area selector (acts as a blank canvas)
- **Area Selection**: Remain **enabled** — users can draw and select areas normally on the white background
- **Use Case**: Allows content authoring on pages without images (blank pages or pages waiting for image upload)
- **Behavior**: Full functionality preserved — coordinates, blocks, and virtual blocks work as usual on the white canvas

---

## 3. Implementation Details

### 3.1 Components Affected

**Primary file**: `src/components/Studio/Studio.jsx` (or `src/pages/Studio/Studio.jsx` depending on structure)

**Key areas to modify**:
- Page rendering logic where images are displayed
- Area selector container (`studio_area_selector` div)
- Conditional rendering based on URL presence
- State management for handling missing URLs

### 3.2 Proposed Code Changes

#### Image Display Logic

**Before**:
```jsx
<img 
  src={page.url} 
  alt="Page" 
  className="page-image" 
/>
```

**After**:
```jsx
{page.url ? (
  <img 
    src={page.url} 
    alt="Page" 
    className="page-image" 
  />
) : (
  <div className="studio_area_selector studio-no-image-placeholder">
    <div className="placeholder-content">
      <p>No image available for this page</p>
    </div>
  </div>
)}
```

#### Styling for Blank Canvas

Add to `Studio.module.scss` or `Studio.css` (if using overlay approach):

```scss
.studio-image-area-wrapper {
  position: relative;
  
  .white-background-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #ffffff;
    z-index: 0;
    pointer-events: none;
  }
  
  // Ensure ImageArea renders on top
  img, canvas {
    position: relative;
    z-index: 1;
  }
}
```

**Note**: The white SVG data URI approach requires no additional CSS.

#### Area Selection Enabled (Blank Canvas)

Keep area selection **active** on pages without URLs. Options:

**Option 1**: Pass a white SVG/image data URI as fallback:

```jsx
<ImageArea 
  src={page.url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600"%3E%3Crect fill="white" width="1200" height="1600"/%3E%3C/svg%3E'}
  alt="Page"
  // ... other props - area selection remains enabled
/>
```

**Option 2**: Render ImageArea with white background wrapper:

```jsx
<div className="studio-image-area-wrapper">
  {!page.url && <div className="white-background-overlay" />}
  <ImageArea 
    src={page.url}
    alt="Page"
    // ... other props - always enabled
  />
</div>
```

This allows users to author content (draw areas, add blocks) on blank pages.

### 3.3 State/Props Handling

- **Page Object Check**: Add validation in the page rendering logic to check for `page.url`
- **Conditional Rendering**: Use ternary operators or conditional logic to show placeholder
- **Error Logging**: Consider logging pages with missing URLs for debugging/analytics

---

## 4. Files to Modify

| File Path | Changes | Priority |
|-----------|---------|----------|
| `src/components/Studio/Studio.jsx` | Add URL check and fallback white image/SVG | **High** |
| `src/components/Studio/Studio.module.scss` | Add overlay wrapper styles (if using overlay approach) | **Medium** |
| `src/services/api.js` | Optional: Add logging for pages without URLs | **Low** |

---

## 5. Test Cases

### 5.1 Functional Tests

- **TC-1**: Display pages with valid URLs normally
  - **Expected**: Image loads and displays correctly
  
- **TC-2**: Handle pages without URL property
  - **Expected**: White canvas displays, area selection remains active
  
- **TC-3**: Area selection active on blank canvas
  - **Expected**: Can draw/select areas on white background normally
  
- **TC-4**: Mixed page navigation (with and without URLs)
  - **Expected**: Toggle between pages, placeholders show/hide appropriately
  
- **TC-5**: Block display on missing URL pages
  - **Expected**: Blocks array still processes normally, but UI shows placeholder

### 5.2 Edge Cases

- **TC-6**: URL property is null vs. undefined vs. empty string
  - **Expected**: All treated as "missing" and show placeholder
  
- **TC-7**: URL is invalid/broken (404)
  - **Expected**: Image error handler catches this (separate from missing URL)
  
- **TC-8**: Page object with empty v_blocks and no URL
  - **Expected**: Clean placeholder display

### 5.3 Visual/UX Tests

- [ ] Placeholder sizing matches expected dimensions
- [ ] White background is sufficient contrast for accessibility
- [ ] Message text is readable and clear
- [ ] Transition between pages with/without URLs is smooth

---

## 6. API Response Handling

### Example Response with Missing URL

```json
{
  "_id": "6a6de1cbdec1f50004bfb3e6",
  "blocks": [],
  "v_blocks": []
}
```

Note: The `url` property is completely absent

### Implementation Approach

Check for URL in multiple ways to be safe:

```jsx
const hasImageUrl = page?.url && typeof page.url === 'string' && page.url.trim().length > 0;

if (hasImageUrl) {
  // Render image and area selector
} else {
  // Render placeholder
}
```

---

## 7. Constants to Add (Optional)

For a white SVG fallback, you can define it as a constant in `src/utils/` or inline:

```javascript
// White SVG data URI (1200x1600px)
export const WHITE_PAGE_SVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600"%3E%3Crect fill="white" width="1200" height="1600"/%3E%3C/svg%3E';
```

This eliminates the need for CSS changes and works seamlessly with the ImageArea component.

---

## 8. Acceptance Criteria

- [ ] All pages render without errors, with or without URLs
- [ ] Missing URL pages show white background (blank canvas)
- [ ] Area selection remains **active and functional** on missing-URL pages
- [ ] Users can draw areas, create blocks on blank pages normally
- [ ] Existing functionality for pages with URLs remains unchanged
- [ ] All test cases pass
- [ ] Code follows project conventions and patterns

---

## 9. Future Enhancements

- Add retry mechanism for failed URL loading
- Implement image upload functionality for pages without URLs
- Add visual indicator/badge for pages without images in page thumbnail navigation
- Collect analytics on how many pages are missing URLs
- Add keyboard accessibility to the placeholder area

---

## 10. Implementation Checklist

- [ ] Create feature branch
- [ ] Update Studio component with URL check logic
- [ ] Add placeholder CSS/styling
- [ ] Update constants file
- [ ] Write unit tests for URL validation logic
- [ ] Manual testing in browser (dev server)
- [ ] Test with endpoint that returns mixed URL/no-URL pages
- [ ] Code review
- [ ] Update CLAUDE.md documentation if needed
- [ ] Merge to development branch

---

## Appendix: Related Code References

**Current Studio Location**: Based on CLAUDE.md, likely one of:
- `src/components/Studio/`
- `src/pages/Studio/Studio.jsx`

**API Call**: Fetching pages happens via:
- Endpoint: `https://questions-api-navy.vercel.app/api/pages?chapterId={chapterId}`
- Likely in: `src/services/api.js`

**Image Area Selector**: Uses:
- Package: `@bmunozg/react-image-area`
- Purpose: Allow users to select rectangular areas on page image for creating blocks
- Current usage: See `Studio.jsx` for implementation

---

## Related Documents

- `docs/2025-11-06/STUDIO_REFACTORING_PLAN.md` - Studio refactoring phases
- `docs/2026-01-09/VIRTUAL_BLOCKS_NAVIGATION_PLAN.md` - Virtual blocks implementation
- `CLAUDE.md` - Project architecture and conventions
