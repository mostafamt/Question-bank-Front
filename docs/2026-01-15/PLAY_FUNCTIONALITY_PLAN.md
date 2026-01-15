# Play Functionality for VirtualBlockContentModal - Implementation Plan

## Overview
Add play/preview functionality to ContentItemList component, allowing users to view content items directly from the edit modal without needing to navigate to reader mode.

---

## Current State Analysis

### ContentItemList Component
**Location:** `src/components/Modal/VirtualBlockContentModal/ContentItemList.jsx`

**Current Features:**
- Displays list of content items with type badges (Text 📄, Link 🔗, Object 🎮)
- Shows truncated content preview (100 chars)
- Edit button (✏️) - opens ContentItemForm in edit mode
- Delete button (🗑️) - removes item from list

**Current Button Order:** [Edit] [Delete]

### Existing Play Functionality (Reader Mode)
**Location:** `src/components/VirtualBlocks/VirtualBlock/VirtualBlock.jsx`

**Play Logic:**
- **Single Item:** Opens appropriate modal directly
  - Text → `text-editor` modal (read-only)
  - Link → `iframe-display` modal
  - Object → Fetches URL then opens `iframe-display` modal

- **Multiple Items:** Opens `virtual-block-reader-nav` modal with navigation (Previous/Next)

**Related Modals:**
1. `IframeDisplayModal` - For links and objects
2. `TextEditorModal` - For rich text content
3. `VirtualBlockReaderNavigationModal` - For navigating multiple items

---

## Proposed Solution

### 1. Add Play Button to ContentItemList

**New Button Order:** [▶️ Play] [✏️ Edit] [🗑️ Delete]

**Visual Changes:**
- Play button should be primary color to indicate it's the main action
- Edit and Delete remain as icon buttons
- Play button icon: `PlayArrow` from MUI icons

### 2. Play Functionality Options

#### **Option A: Separate Modal (RECOMMENDED)**
**Pros:**
- ✅ Consistent with reader mode UX
- ✅ Reuses existing battle-tested modal components
- ✅ Better user experience (full screen, proper navigation)
- ✅ No additional modal components needed
- ✅ Clean separation of concerns
- ✅ Works seamlessly with existing object URL caching
- ✅ Keyboard shortcuts already implemented

**Cons:**
- User needs to close play modal to return to edit modal

**Implementation:**
- Use `openModal()` from Zustand store
- Call appropriate modal based on item type (text-editor, iframe-display)
- Reuse `getObjectUrl()` utility for objects
- For multiple items, could open `virtual-block-reader-nav` with specific starting index

**Code Example:**
```javascript
const handlePlay = async (index) => {
  const item = items[index];
  const title = `${item.contentType} - Preview`;

  if (item.type === "text") {
    openModal("text-editor", {
      value: item.contentValue,
      title,
      onClickSubmit: null  // Read-only mode
    });
  }
  else if (item.type === "link") {
    openModal("iframe-display", {
      title,
      url: item.contentValue
    });
  }
  else if (item.type === "object") {
    const url = await getObjectUrl(item.contentValue);
    openModal("iframe-display", { title, url });
  }
};
```

---

#### **Option B: Same Modal (Expandable View)**
**Pros:**
- User stays in same context
- No modal stacking

**Cons:**
- ❌ Complicated state management (list view vs play view)
- ❌ Limited space for content display
- ❌ Breaks single responsibility principle
- ❌ Need to recreate display logic that already exists in other modals
- ❌ Poor UX for iframes and rich text (needs full screen)

**Implementation:**
- Add `playingIndex` state to VirtualBlockContentModal
- Conditionally render ContentItemList OR play view
- Back button to return to list

---

#### **Option C: Inline Preview (Accordion Style)**
**Pros:**
- Quick preview without leaving list
- Can see multiple items at once

**Cons:**
- ❌ Very limited space (especially for iframes)
- ❌ Poor UX for interactive objects
- ❌ Complex CSS/layout issues
- ❌ Doesn't work well with react-quill or iframes
- ❌ Still need to duplicate display logic

---

#### **Option D: Quick Preview Overlay**
**Pros:**
- Lightweight preview
- Doesn't stack modals

**Cons:**
- ❌ Need to create new overlay component
- ❌ Duplicates existing modal functionality
- ❌ Not consistent with reader mode
- ❌ Additional maintenance burden

---

## Recommended Approach: **Option A (Separate Modal)**

### Justification
1. **Code Reuse:** Leverages existing modals (IframeDisplayModal, TextEditorModal)
2. **Consistency:** Same UX as reader mode (users already familiar)
3. **Simplicity:** Minimal changes to ContentItemList component
4. **Best UX:** Full-screen content display with proper controls
5. **Future-Proof:** Easy to extend (e.g., add navigation between items later)

### Enhancement: Navigation Support
We could enhance this by opening `virtual-block-reader-nav` modal even for single items, allowing users to navigate through all items while previewing:

```javascript
const handlePlayAll = (startIndex) => {
  openModal("virtual-block-reader-nav", {
    blockLabel: selectedLabel,
    contents: items,
    initialIndex: startIndex
  });
};
```

This would give users:
- Previous/Next navigation between items
- Counter display (e.g., "2 of 5")
- Keyboard shortcuts (Arrow keys)
- Consistent experience with reader mode

---

## Implementation Steps

### Phase 1: Basic Play Functionality
1. ✅ Read existing code (ContentItemList, VirtualBlock, modals)
2. Update ContentItemList.jsx:
   - Import `PlayArrow` icon from MUI
   - Import `useStore` hook for `openModal`
   - Import `getObjectUrl` utility
   - Add `handlePlay` function
   - Add Play IconButton (first position)
   - Style Play button (primary color)
3. Test each content type:
   - Text items → TextEditorModal
   - Link items → IframeDisplayModal
   - Object items → IframeDisplayModal (after URL fetch)

### Phase 2: Enhanced Navigation (Optional)
1. Update `handlePlay` to use `virtual-block-reader-nav` modal
2. Pass full items array with starting index
3. Test navigation between items
4. Add keyboard shortcut documentation

### Phase 3: Polish
1. Loading states for object URL fetching
2. Error handling for invalid objects/URLs
3. Tooltip on Play button ("Preview content")
4. Accessibility improvements (aria-labels)

---

## Technical Considerations

### Dependencies
- **Zustand Store:** `openModal()` function
- **Object URL Utility:** `/src/utils/object-url.js`
- **Existing Modals:**
  - `IframeDisplayModal` - iframe-display
  - `TextEditorModal` - text-editor
  - `VirtualBlockReaderNavigationModal` - virtual-block-reader-nav

### Error Handling
- Handle invalid object IDs (show error toast)
- Handle broken links (iframe error handling already exists)
- Handle empty content (should be prevented by form validation)

### Performance
- Object URLs are already cached (30 minutes)
- No additional API calls needed for text/link types
- Lazy loading for iframe content already implemented

### Accessibility
- Keyboard navigation already works (Tab, Enter)
- Add aria-label to Play button
- Screen reader announcements for modal transitions

---

## Files to Modify

### Core Changes
1. **src/components/Modal/VirtualBlockContentModal/ContentItemList.jsx**
   - Add Play button and handler
   - Import dependencies (icons, hooks, utils)

### Optional Enhancements
2. **src/components/Modal/VirtualBlockContentModal/ContentItemList.module.scss**
   - Style adjustments for button group
   - Play button primary color

---

## Testing Checklist

### Functional Testing
- [ ] Play text content → Opens TextEditorModal (read-only)
- [ ] Play link content → Opens IframeDisplayModal with URL
- [ ] Play object content → Fetches URL and opens IframeDisplayModal
- [ ] Play button appears first in button group
- [ ] Play button has correct icon (PlayArrow)
- [ ] Loading state during object URL fetch
- [ ] Error handling for invalid objects
- [ ] Modal closes and returns to list
- [ ] Edit and Delete still work correctly

### UX Testing
- [ ] Play button is visually distinct (primary color)
- [ ] Tooltip appears on hover
- [ ] Keyboard navigation works (Tab + Enter)
- [ ] Mobile responsive (touch targets)

### Edge Cases
- [ ] Empty content items (should be prevented)
- [ ] Invalid object IDs
- [ ] Broken links
- [ ] Very long text content
- [ ] Large iframe content

---

## Visual Mockup (Text Description)

**Before:**
```
┌─────────────────────────────────────────────────┐
│ Text 📄                                         │
│ This is some sample content that will be tru... │
│                                   [✏️] [🗑️]    │
└─────────────────────────────────────────────────┘
```

**After:**
```
┌─────────────────────────────────────────────────┐
│ Text 📄                                         │
│ This is some sample content that will be tru... │
│                          [▶️] [✏️] [🗑️]        │
└─────────────────────────────────────────────────┘
```

---

## Timeline Estimate

- **Phase 1 (Basic Play):** 2-3 hours
  - Code changes: 1 hour
  - Testing: 1-2 hours

- **Phase 2 (Navigation):** 1-2 hours (optional)
  - Implementation: 30 min
  - Testing: 30-90 min

- **Phase 3 (Polish):** 1 hour
  - Error handling: 30 min
  - Accessibility: 30 min

**Total:** 4-6 hours (3-4 hours for Phase 1 + Polish)

---

## Future Enhancements (Out of Scope)

1. **Quick Preview Mode:** Hold Shift+Click to open preview overlay instead of full modal
2. **Preview Thumbnails:** Show small preview image/icon for each content type
3. **Auto-play for Multiple Items:** "Play All" button that auto-advances
4. **Edit While Playing:** Quick edit button in play modals
5. **Drag to Reorder:** Drag handles to reorder items in list

---

## Questions for Review

1. **Do you prefer basic play (single modal per item) or enhanced navigation (reader-nav modal)?**
   - Basic: Simpler, less code
   - Enhanced: Better UX, consistent with reader mode

2. **Should we add a loading indicator for object URL fetching?**
   - Could use MUI CircularProgress on Play button
   - Or show toast notification

3. **Should Play button be icon-only or have text label?**
   - Icon-only: More compact, consistent with Edit/Delete
   - With label: More discoverable for new users

4. **Color for Play button?**
   - Primary (blue): Emphasizes main action
   - Success (green): Indicates "safe" action
   - Default (gray): Same as Edit/Delete

---

## Recommendation Summary

**Implement Option A (Separate Modal) with Basic Play functionality first**, then optionally add enhanced navigation if user feedback is positive.

**Rationale:**
- Minimal code changes
- Maximum code reuse
- Best user experience
- Easiest to maintain
- Can be enhanced later without breaking changes

**Next Steps:**
1. Get approval on approach (Option A confirmed?)
2. Decide on basic vs enhanced navigation
3. Implement Phase 1
4. Test and iterate
5. Deploy

---

**Author:** Claude Code
**Date:** January 15, 2026
**Status:** Awaiting Review
