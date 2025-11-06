# Import Book Flow - Implementation Plan

**Date:** November 6, 2025
**Feature:** Complete "Import Book" button flow in ScanAndUpload page
**Goal:** Minimal changes to complete the flow for importing book chapter images

---

## Current State

### What Works ✅
1. "Import Book" button opens modal (`onChangeBook` function)
2. Modal displays `ChooseBookModalContent` with `AddBook` component
3. User can select book and chapter
4. `getChapterPages(chapterId)` API exists and works

### What's Missing ❌
1. No callback to handle chapter selection from modal
2. Selected chapter pages not fetched
3. Modal doesn't close after selection
4. `setImages` not updated with chapter pages

---

## Desired Flow

```
1. User clicks "Import Book" button
   ↓
2. Modal opens showing book/chapter selection
   ↓
3. User selects book and chapter
   ↓
4. User clicks "Select" or "Import" button
   ↓
5. Fetch chapter pages using getChapterPages(chapterId)
   ↓
6. Update setImages(pages)
   ↓
7. Close modal
   ↓
8. Studio component renders with chapter images
```

---

## Implementation Plan

### Step 1: Add Callback to ScanAndUpload.jsx

**File:** `/src/pages/ScanAndUpload/ScanAndUpload.jsx`

**Add new function:**

```javascript
// After line 70 (after onChangeBook function)

const handleBookImport = async (chapterId) => {
  setLoading(true);
  try {
    const pages = await getChapterPages(chapterId);

    // Extract image URLs from pages
    const imageUrls = pages.map(page => page.url);

    setImages(imageUrls);
    setShowModal(false);

    toast.success("Book chapter imported successfully!");
  } catch (error) {
    toast.error("Failed to import book chapter");
    console.error(error);
  } finally {
    setLoading(false);
  }
};
```

**Add import:**
```javascript
// At top, add to existing imports from bookapi
import { getChapterPages } from "../../api/bookapi";
```

**Update Modal component:**
```javascript
// Line 83-85: Pass callback to modal
<Modal size="xl" show={showModal} handleClose={() => setShowModal(false)}>
  <ChooseBookModalContent onImport={handleBookImport} />
</Modal>
```

**Changes Summary:**
- Lines to add: ~20 lines
- Lines to modify: 1 line (Modal component)
- New imports: 1

---

### Step 2: Update ChooseBookModalContent.jsx

**File:** `/src/components/Modal/ChooseBookModalContent/ChooseBookModalContent.jsx`

**Update component to accept and pass callback:**

```javascript
// Line 5: Accept onImport prop
const ChooseBookModalContent = ({ onImport }) => {
  return (
    <div>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>Select From Library</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <AddBook onImport={onImport} isModal={true} />
      </BootstrapModal.Body>
      <BootstrapModal.Footer></BootstrapModal.Footer>
    </div>
  );
};
```

**Changes Summary:**
- Lines to modify: 2 lines (function signature, AddBook component)
- New lines: 0

---

### Step 3: Update AddBook.jsx

**File:** `/src/pages/AddBook/AddBook.jsx`

**Add new prop and import button:**

```javascript
// Line 15: Update function signature
const AddBook = ({ legend = "", onImport = null, isModal = false }) => {
```

**Add new submit handler for import:**

```javascript
// After line 54 (after handleAuthor function)

const handleImport = async ({ book, chapter }) => {
  if (onImport) {
    await onImport(chapter);
  }
};
```

**Update onSubmit function:**

```javascript
// Line 56: Update onSubmit
const onSubmit = async (values, event) => {
  const submitterName = event?.nativeEvent?.submitter?.name;

  if (submitterName === "read") {
    handleRead(values);
  } else if (submitterName === "import") {
    await handleImport(values);
  } else {
    await handleAuthor(values);
  }
};
```

**Add "Import" button (conditionally shown):**

```javascript
// Line 110-128: Update actions div
<div className={styles.actions}>
  <Button
    variant="contained"
    type="submit"
    disabled={loadingScan}
    startIcon={renderButtonIcon("author")}
    name="author"
  >
    Author
  </Button>
  <Button
    variant="contained"
    type="submit"
    disabled={loadingScan}
    startIcon={renderButtonIcon("read")}
    name="read"
  >
    Read
  </Button>

  {/* NEW: Only show in modal mode */}
  {isModal && (
    <Button
      variant="contained"
      type="submit"
      disabled={loadingScan}
      startIcon={<ImportContactsIcon />}
      name="import"
      color="success"
    >
      Import
    </Button>
  )}
</div>
```

**Changes Summary:**
- Lines to modify: 2 lines (function signature, onSubmit)
- Lines to add: ~20 lines (handleImport function, Import button)

---

## Alternative Simpler Approach (Recommended)

If you want **MINIMAL changes**, here's an even simpler approach:

### Option 2: Reuse "Author" Button

Instead of adding a new "Import" button, modify the existing "Author" button behavior when in modal mode.

**File:** `/src/pages/AddBook/AddBook.jsx`

**Changes:**

```javascript
// Line 15: Update function signature
const AddBook = ({ legend = "", onImport = null, isModal = false }) => {

// Line 41: Update handleAuthor
const handleAuthor = async ({ book, chapter }) => {
  // If in modal mode and onImport callback exists, use it
  if (isModal && onImport) {
    await onImport(chapter);
    return;
  }

  // Otherwise, normal author flow
  setLoadingScan(true);
  try {
    const types = await getTypes();
    setFormState({ types });

    const chapterDetails = chapters.find((c) => c._id === chapter);
    const language = chapterDetails?.language || "en";

    navigate(`/book/${book}/chapter/${chapter}`, { state: { language } });
  } finally {
    setLoadingScan(false);
  }
};
```

**File:** `/src/components/Modal/ChooseBookModalContent/ChooseBookModalContent.jsx`

```javascript
const ChooseBookModalContent = ({ onImport }) => {
  return (
    <div>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>Import Chapter Images</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <AddBook onImport={onImport} isModal={true} />
      </BootstrapModal.Body>
      <BootstrapModal.Footer>
        <small className="text-muted">
          Select a book and chapter, then click "Author" to import
        </small>
      </BootstrapModal.Footer>
    </div>
  );
};
```

**File:** `/src/pages/ScanAndUpload/ScanAndUpload.jsx`

```javascript
// Add import
import { getChapterPages } from "../../api/bookapi";

// Add function (after line 70)
const handleBookImport = async (chapterId) => {
  setLoading(true);
  try {
    const pages = await getChapterPages(chapterId);
    const imageUrls = pages.map(page => page.url);
    setImages(imageUrls);
    setShowModal(false);
    toast.success("Chapter imported successfully!");
  } catch (error) {
    toast.error("Failed to import chapter");
    console.error(error);
  } finally {
    setLoading(false);
  }
};

// Update Modal (line 83-85)
<Modal size="xl" show={showModal} handleClose={() => setShowModal(false)}>
  <ChooseBookModalContent onImport={handleBookImport} />
</Modal>
```

---

## Summary of Changes (Option 2 - Minimal)

### Total Files Modified: 3

#### 1. ScanAndUpload.jsx
- **Add import:** 1 line
- **Add function:** ~15 lines
- **Modify Modal:** 1 line
- **Total:** ~17 lines added/modified

#### 2. ChooseBookModalContent.jsx
- **Modify function:** 1 line (add onImport prop)
- **Modify AddBook:** 1 line (pass props)
- **Modify footer:** 3 lines (add instruction)
- **Total:** ~5 lines modified

#### 3. AddBook.jsx
- **Modify function:** 1 line (add props)
- **Modify handleAuthor:** 5 lines (add conditional)
- **Total:** ~6 lines modified

**Grand Total: ~28 lines added/modified across 3 files**

---

## Testing Checklist

After implementation:

- [ ] Click "Import Book" button opens modal
- [ ] Can select book from dropdown
- [ ] Can select chapter from dropdown
- [ ] Click "Author" button (or "Import" in Option 1)
- [ ] Loading indicator appears
- [ ] Modal closes
- [ ] Images from chapter load in Studio
- [ ] Can work with images in Studio normally
- [ ] Error handling works (show toast on failure)

---

## Potential Issues & Solutions

### Issue 1: Page data structure unknown

**Problem:** We don't know if `page.url` exists

**Solution:** Check API response first, adjust mapping:
```javascript
// Flexible mapping
const imageUrls = pages.map(page => page.url || page.image || page);
```

### Issue 2: Pages might not have images yet

**Problem:** Some pages might not have uploaded images

**Solution:** Filter out empty URLs:
```javascript
const imageUrls = pages
  .map(page => page.url || page.image)
  .filter(url => url); // Remove null/undefined

if (imageUrls.length === 0) {
  toast.warning("This chapter has no images yet");
  return;
}
```

### Issue 3: Large chapters with many pages

**Problem:** Loading 100+ images might be slow

**Solution:** Add page count info:
```javascript
toast.success(`Imported ${imageUrls.length} pages from chapter`);
```

---

## Implementation Order

1. **First:** Implement `handleBookImport` in ScanAndUpload.jsx
2. **Second:** Pass `onImport` prop through ChooseBookModalContent
3. **Third:** Update AddBook.jsx to handle `isModal` mode
4. **Fourth:** Test the flow end-to-end
5. **Fifth:** Add error handling and loading states
6. **Sixth:** Polish UI messages and feedback

---

## Code Snippets Ready to Copy

### ScanAndUpload.jsx Addition

```javascript
// Add after line 70

const handleBookImport = async (chapterId) => {
  setLoading(true);
  try {
    const pages = await getChapterPages(chapterId);

    // Extract image URLs from pages
    const imageUrls = pages
      .map(page => page.url || page.image || page)
      .filter(url => url);

    if (imageUrls.length === 0) {
      toast.warning("This chapter has no images");
      return;
    }

    setImages(imageUrls);
    setShowModal(false);
    toast.success(`Imported ${imageUrls.length} pages`);
  } catch (error) {
    toast.error("Failed to import chapter");
    console.error(error);
  } finally {
    setLoading(false);
  }
};
```

### AddBook.jsx handleAuthor Update

```javascript
const handleAuthor = async ({ book, chapter }) => {
  // If in modal mode with import callback, use it
  if (isModal && onImport) {
    await onImport(chapter);
    return;
  }

  // Normal author flow
  setLoadingScan(true);
  try {
    const types = await getTypes();
    setFormState({ types });
    const chapterDetails = chapters.find((c) => c._id === chapter);
    const language = chapterDetails?.language || "en";
    navigate(`/book/${book}/chapter/${chapter}`, { state: { language } });
  } finally {
    setLoadingScan(false);
  }
};
```

---

## Expected Result

After implementation, the user flow will be:

1. ✅ User on ScanAndUpload page clicks "Import Book"
2. ✅ Modal opens showing book/chapter selection
3. ✅ User selects book → chapters load
4. ✅ User selects chapter → enabled buttons
5. ✅ User clicks "Author" button
6. ✅ Loading indicator appears
7. ✅ Chapter pages fetched from API
8. ✅ Images loaded into Studio
9. ✅ Modal closes
10. ✅ User can now author blocks on chapter images

---

**Status:** 📋 Ready for implementation
**Recommended Approach:** Option 2 (Minimal - reuse Author button)
**Estimated Time:** 15-20 minutes
**Files to Modify:** 3 files, ~28 lines

---

**Next Action:** Implement Option 2 approach for minimal changes
