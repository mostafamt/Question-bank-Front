# Feature: Add Import Book Button to AutoGeneration Page

## Overview
Clone the import book functionality from the ScanAndUpload page to the AutoGeneration page. This feature allows users to import pages from book chapters directly into the AutoGeneration workflow.

## Current State
- **ScanAndUpload page**: Has working import book button with modal dialog for selecting books/chapters
- **AutoGeneration page**: Currently only supports PDF and image uploads, missing the import book functionality

## Implementation Plan

### 1. Required Imports
Add the following imports to `AutoGeneration.jsx`:

```javascript
import BookIcon from "@mui/icons-material/Book";
import Modal from "../../components/Modal/Modal";
import ChooseBookModalContent from "../../components/Modal/ChooseBookModalContent/ChooseBookModalContent";
import { getChapterPages } from "../../api/bookapi";
```

**Files to modify:**
- `/src/pages/AutoGeneration/AutoGeneration.jsx:1-15`

---

### 2. Add State Management
Add modal state management to the component:

```javascript
const [showModal, setShowModal] = React.useState(false);
```

**Location:** After line 21 in `AutoGeneration.jsx` (after existing state declarations)

---

### 3. Implement Event Handlers
Add two new handler functions:

#### 3.1 onChangeBook Handler
```javascript
const onChangeBook = async (event) => {
  console.log("onChangeBook");
  setShowModal(true);
};
```

#### 3.2 handleBookImport Handler
```javascript
const handleBookImport = async (chapterId) => {
  setLoading(true);
  try {
    const pages = await getChapterPages(chapterId);

    // Extract image URLs from pages
    const imageUrls = pages
      .map((page) => page.url || page.image || page)
      .filter((url) => url);

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

**Location:** After `onChangeImages` function (around line 61)

---

### 4. Add Modal Component
Add the Modal component in the JSX return statement:

```javascript
<Modal size="xl" show={showModal} handleClose={() => setShowModal(false)}>
  <ChooseBookModalContent onImport={handleBookImport} />
</Modal>
```

**Location:** Inside the main container div, before `<QuestionNameHeader>` (around line 73)

---

### 5. Add Import Book Button
Add the third button for importing from books:

```javascript
<Button
  component="label"
  variant="outlined"
  startIcon={<BookIcon />}
  onClick={onChangeBook}
  color="success"
>
  import Book
</Button>
```

**Location:** Inside the upload-buttons div, after the "Upload images" button (around line 107)

---

## Dependencies
The following components and APIs are already implemented and available:
- `Modal` component: `/src/components/Modal/Modal`
- `ChooseBookModalContent`: `/src/components/Modal/ChooseBookModalContent/ChooseBookModalContent.jsx`
- `getChapterPages` API: `/src/api/bookapi.js`
- `BookIcon` from Material-UI icons

---

## Testing Checklist
After implementation, verify:
- [ ] Import Book button is visible on the AutoGeneration page (before images are loaded)
- [ ] Clicking the button opens the book selection modal
- [ ] Can browse and select books/chapters in the modal
- [ ] Selected chapter pages are loaded into the images state
- [ ] Success toast appears with correct page count
- [ ] Modal closes after successful import
- [ ] Images appear in the AutoGenerationStudio component
- [ ] Error handling works (empty chapters, API failures)
- [ ] Loading state displays during import operation

---

## Code Reference
**Source Implementation:** `/src/pages/ScanAndUpload/ScanAndUpload.jsx:69-98` (handlers and modal logic)
**Target Implementation:** `/src/pages/AutoGeneration/AutoGeneration.jsx`

---

## Notes
- The implementation is a direct clone from ScanAndUpload page
- Maintains consistency with existing upload methods (PDF and images)
- Uses the same API and modal components for unified user experience
- No changes needed to `ChooseBookModalContent` or `bookapi` - they are reusable
