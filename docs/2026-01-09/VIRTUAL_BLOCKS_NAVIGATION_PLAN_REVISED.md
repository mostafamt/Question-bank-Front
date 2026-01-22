# Virtual Blocks Navigation Feature - Reader Mode (REVISED)

**Date:** 2026-01-09
**Status:** Planning Phase - Revised Based on Requirements

---

## Overview

Add Previous/Next navigation buttons to virtual block modals in reader mode, allowing users to navigate between items **within the same virtual block** without closing the modal.

---

## Requirements (Confirmed)

✅ **Navigation Scope**: Within single virtual block only
- If "Notes" has 3 items, navigate only between those 3 items
- Cannot jump to other virtual blocks (Summary, Activity, etc.)

✅ **Navigation Style**: Linear navigation
- Previous button **disabled** on first item
- Next button **disabled** on last item
- No circular/looping navigation

✅ **Counter Display**: Index and count within current block
- Format: "2 of 3" (item 2 out of 3 items in current block)
- Simple and clear

✅ **Keyboard Shortcuts**: Optional (can add if time permits)

✅ **Content Display**: Inline in navigation modal
- One modal, content updates when navigating
- Smoother UX, no modal flickering

---

## Current Behavior vs. Desired Behavior

### Current Implementation

**When user clicks virtual block with multiple items (e.g., Notes with 3 items):**

1. Opens `VirtualBlockReaderModal`
2. Shows list of all 3 items as cards
3. User clicks "View/Open/Play" button on each card
4. Each item opens in separate modal (TextEditor or IframeDisplay)
5. User must close modal and go back to list to see next item

**Problem:** Too many clicks to view all items sequentially

### Desired Implementation

**When user clicks virtual block with multiple items:**

1. Opens new navigation modal showing **first item directly**
2. Footer has Previous/Next buttons
3. Click Next → Content updates to show item 2
4. Click Next → Content updates to show item 3
5. Next button disabled on item 3 (last item)

**Benefits:**
- Fewer clicks to view all items
- Natural sequential flow
- Stay in modal context

---

## Implementation Plan

### Phase 1: Create Navigation Hook

**Objective:** Manage navigation state within a single virtual block

**File to Create:** `src/hooks/useVirtualBlockNavigation.js`

```javascript
import { useState, useMemo, useCallback } from "react";

/**
 * Hook for navigating through virtual block content items
 * @param {Array} contents - Array of content items in virtual block
 * @param {number} initialIndex - Starting index (default 0)
 * @returns {Object} Navigation state and controls
 */
export const useVirtualBlockNavigation = (contents = [], initialIndex = 0) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Current item being displayed
  const currentItem = useMemo(() => {
    return contents[currentIndex] || null;
  }, [contents, currentIndex]);

  // Total number of items
  const totalItems = contents.length;

  // Navigation controls
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, totalItems - 1));
  }, [totalItems]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToIndex = useCallback((index) => {
    if (index >= 0 && index < totalItems) {
      setCurrentIndex(index);
    }
  }, [totalItems]);

  // Navigation state flags
  const hasNext = currentIndex < totalItems - 1;
  const hasPrevious = currentIndex > 0;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalItems - 1;

  return {
    currentItem,
    currentIndex,
    totalItems,
    goToNext,
    goToPrevious,
    goToIndex,
    hasNext,
    hasPrevious,
    isFirst,
    isLast,
  };
};

export default useVirtualBlockNavigation;
```

**Features:**
- ✅ Linear navigation (no looping)
- ✅ Index bounds checking
- ✅ State flags (hasNext, hasPrevious)
- ✅ Jump to specific index (optional feature)

---

### Phase 2: Create Content Display Components

**Objective:** Display different content types inline within modal

#### File 1: TextContentDisplay.jsx

**Path:** `src/components/Modal/VirtualBlockReaderNavigationModal/TextContentDisplay.jsx`

```javascript
import React from "react";
import { Box, Typography } from "@mui/material";

/**
 * Display text content with HTML rendering
 */
const TextContentDisplay = ({ value, title }) => {
  return (
    <Box sx={{ p: 2 }}>
      <div
        dangerouslySetInnerHTML={{ __html: value }}
        style={{
          minHeight: "400px",
          maxHeight: "600px",
          overflow: "auto",
        }}
      />
    </Box>
  );
};

export default TextContentDisplay;
```

#### File 2: IframeContentDisplay.jsx

**Path:** `src/components/Modal/VirtualBlockReaderNavigationModal/IframeContentDisplay.jsx`

```javascript
import React, { useState } from "react";
import { Box, CircularProgress, Alert, IconButton, Tooltip } from "@mui/material";
import { OpenInNew, Refresh } from "@mui/icons-material";

/**
 * Display link/object content in iframe
 */
const IframeContentDisplay = ({ url, title }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(false);
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenNewTab = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Box sx={{ position: "relative", width: "100%", height: "600px" }}>
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          p: 1,
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #ddd",
        }}
      >
        <Tooltip title="Refresh">
          <IconButton size="small" onClick={handleRefresh}>
            <Refresh />
          </IconButton>
        </Tooltip>
        <Tooltip title="Open in new tab">
          <IconButton size="small" onClick={handleOpenNewTab}>
            <OpenInNew />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Loading Indicator */}
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Box sx={{ p: 2 }}>
          <Alert severity="error" action={
            <IconButton size="small" onClick={handleRefresh}>
              <Refresh />
            </IconButton>
          }>
            Failed to load content. Click to retry.
          </Alert>
        </Box>
      )}

      {/* Iframe */}
      <iframe
        key={iframeKey}
        src={url}
        title={title}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: "100%",
          height: "calc(100% - 48px)",
          border: "none",
        }}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </Box>
  );
};

export default IframeContentDisplay;
```

#### File 3: ObjectContentDisplay.jsx

**Path:** `src/components/Modal/VirtualBlockReaderNavigationModal/ObjectContentDisplay.jsx`

```javascript
import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Alert } from "@mui/material";
import { getObjectUrl } from "../../../utils/object-url";
import IframeContentDisplay from "./IframeContentDisplay";

/**
 * Fetch object URL and display in iframe
 */
const ObjectContentDisplay = ({ objectId, title }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState(null);

  useEffect(() => {
    const fetchUrl = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedUrl = await getObjectUrl(objectId);
        setUrl(fetchedUrl);
      } catch (err) {
        setError(err.message || "Failed to load object");
      } finally {
        setLoading(false);
      }
    };

    fetchUrl();
  }, [objectId]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "600px",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (url) {
    return <IframeContentDisplay url={url} title={title} />;
  }

  return null;
};

export default ObjectContentDisplay;
```

---

### Phase 3: Create Navigation Modal Component

**Objective:** Main modal with Previous/Next navigation

**File to Create:** `src/components/Modal/VirtualBlockReaderNavigationModal/VirtualBlockReaderNavigationModal.jsx`

```javascript
import React, { useEffect } from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { Box, Button, Typography, IconButton } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import useVirtualBlockNavigation from "../../../hooks/useVirtualBlockNavigation";
import TextContentDisplay from "./TextContentDisplay";
import IframeContentDisplay from "./IframeContentDisplay";
import ObjectContentDisplay from "./ObjectContentDisplay";

import styles from "./virtualBlockReaderNavigationModal.module.scss";

/**
 * Virtual Block Reader Modal with Navigation
 * Displays virtual block content with Previous/Next navigation
 *
 * @param {Object} props
 * @param {string} props.blockLabel - Block label (e.g., "Notes 📝")
 * @param {Array} props.contents - Array of content items
 * @param {number} props.initialIndex - Starting index (default 0)
 * @param {Function} props.handleCloseModal - Close callback
 */
const VirtualBlockReaderNavigationModal = (props) => {
  const {
    blockLabel = "",
    contents = [],
    initialIndex = 0,
    handleCloseModal,
  } = props;

  const {
    currentItem,
    currentIndex,
    totalItems,
    goToNext,
    goToPrevious,
    hasNext,
    hasPrevious,
  } = useVirtualBlockNavigation(contents, initialIndex);

  console.log("VirtualBlockReaderNavigationModal:", {
    blockLabel,
    totalItems,
    currentIndex,
    currentItem,
  });

  // Optional: Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" && hasPrevious) {
        goToPrevious();
      } else if (e.key === "ArrowRight" && hasNext) {
        goToNext();
      } else if (e.key === "Escape") {
        handleCloseModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasPrevious, hasNext, goToPrevious, goToNext, handleCloseModal]);

  /**
   * Render content based on type
   */
  const renderContent = () => {
    if (!currentItem) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography color="text.secondary">No content available</Typography>
        </Box>
      );
    }

    switch (currentItem.type) {
      case "text":
        return (
          <TextContentDisplay
            value={currentItem.contentValue}
            title={currentItem.contentType}
          />
        );

      case "link":
        return (
          <IframeContentDisplay
            url={currentItem.contentValue}
            title={currentItem.contentType}
          />
        );

      case "object":
        return (
          <ObjectContentDisplay
            objectId={currentItem.contentValue}
            title={currentItem.contentType}
          />
        );

      default:
        return (
          <Box sx={{ p: 2 }}>
            <Typography color="error">Unknown content type: {currentItem.type}</Typography>
          </Box>
        );
    }
  };

  return (
    <div
      className={styles["vb-nav-modal"]}
      role="dialog"
      aria-labelledby="vb-nav-modal-title"
      aria-describedby="vb-nav-modal-content"
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title id="vb-nav-modal-title">
          {blockLabel}
        </BootstrapModal.Title>
      </BootstrapModal.Header>

      <BootstrapModal.Body id="vb-nav-modal-content">
        {renderContent()}
      </BootstrapModal.Body>

      <BootstrapModal.Footer>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Previous Button */}
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={goToPrevious}
            disabled={!hasPrevious}
            aria-label="Go to previous item"
          >
            Previous
          </Button>

          {/* Counter */}
          <Typography
            variant="body1"
            sx={{ fontWeight: "medium" }}
            aria-live="polite"
            aria-atomic="true"
          >
            {currentIndex + 1} of {totalItems}
          </Typography>

          {/* Next Button */}
          <Button
            variant="outlined"
            endIcon={<ArrowForward />}
            onClick={goToNext}
            disabled={!hasNext}
            aria-label="Go to next item"
          >
            Next
          </Button>
        </Box>
      </BootstrapModal.Footer>
    </div>
  );
};

export default VirtualBlockReaderNavigationModal;
```

---

### Phase 4: Add Styling

**File to Create:** `src/components/Modal/VirtualBlockReaderNavigationModal/virtualBlockReaderNavigationModal.module.scss`

```scss
.vb-nav-modal {
  // Modal content area
  :global(.modal-body) {
    padding: 0;
    max-height: 70vh;
    overflow: auto;
  }

  // Footer styling
  :global(.modal-footer) {
    padding: 1rem 1.5rem;
    border-top: 2px solid #e0e0e0;
  }

  // Button hover effects
  button {
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  // Counter styling
  .counter {
    font-weight: 500;
    color: #333;
  }
}
```

---

### Phase 5: Update VirtualBlock Component

**Objective:** Use navigation modal for multi-item blocks

**File to Modify:** `src/components/VirtualBlocks/VirtualBlock/VirtualBlock.jsx`

**Changes to `handlePlayReader` function:**

```javascript
const handlePlayReader = React.useCallback(async () => {
  if (!checkedObject?.contents || checkedObject.contents.length === 0) {
    return;
  }

  // Get the block label
  const blockLabel = checkedObject.contents[0].contentType;

  // If only one item, play it directly
  if (checkedObject.contents.length === 1) {
    const item = checkedObject.contents[0];

    if (item.type === "link") {
      openModal("iframe-display", {
        title: item.contentType,
        url: item.contentValue,
      });
    } else if (item.type === "text") {
      openModal("text-editor", {
        value: item.contentValue,
        title: item.contentType,
        onClickSubmit: null,
      });
    } else if (item.type === "object") {
      try {
        const url = await getObjectUrl(item.contentValue);
        openModal("iframe-display", {
          title: item.contentType,
          url: url,
        });
      } catch (error) {
        toast.error("Failed to load interactive object");
        console.error("Object URL fetch error:", error);
      }
    }
  } else {
    // Multiple items - open navigation modal
    openModal("virtual-block-reader-nav", {
      blockLabel: blockLabel,
      contents: checkedObject.contents,
      initialIndex: 0, // Start from first item
    });
  }
}, [checkedObject?.contents, openModal]);
```

**Key Changes:**
- Single item: Opens directly (unchanged behavior)
- Multiple items: Opens new navigation modal instead of list modal

---

### Phase 6: Register Modal

**File to Modify:** `src/components/Modal/Modal.jsx`

```javascript
import VirtualBlockReaderNavigationModal from "./VirtualBlockReaderNavigationModal/VirtualBlockReaderNavigationModal";

const MODAL_COMPONENTS = {
  // ... existing modals
  "virtual-block-reader": VirtualBlockReaderModal, // Keep existing for backward compatibility
  "virtual-block-reader-nav": VirtualBlockReaderNavigationModal, // NEW
  // ... other modals
};
```

---

### Phase 7: Update VirtualBlockReaderModal (Optional)

**Objective:** Add navigation to existing list modal as alternative

**File to Modify:** `src/components/Modal/VirtualBlockReaderModal/VirtualBlockReaderModal.jsx`

**Option A:** Keep existing behavior (list view)
**Option B:** Add "Start Viewing" button that opens navigation modal

**Recommendation:** Keep existing modal as-is. Navigation modal is opened directly from VirtualBlock component.

---

## Files Summary

### To Create (6 files)

1. ✅ `src/hooks/useVirtualBlockNavigation.js` - Navigation hook
2. ✅ `src/components/Modal/VirtualBlockReaderNavigationModal/VirtualBlockReaderNavigationModal.jsx` - Main modal
3. ✅ `src/components/Modal/VirtualBlockReaderNavigationModal/TextContentDisplay.jsx` - Text display
4. ✅ `src/components/Modal/VirtualBlockReaderNavigationModal/IframeContentDisplay.jsx` - Iframe display
5. ✅ `src/components/Modal/VirtualBlockReaderNavigationModal/ObjectContentDisplay.jsx` - Object display
6. ✅ `src/components/Modal/VirtualBlockReaderNavigationModal/virtualBlockReaderNavigationModal.module.scss` - Styling

### To Modify (2 files)

1. ✅ `src/components/VirtualBlocks/VirtualBlock/VirtualBlock.jsx` - Update handlePlayReader
2. ✅ `src/components/Modal/Modal.jsx` - Register modal

---

## Implementation Flow

```
User clicks virtual block icon in reader mode
    ↓
VirtualBlock.handlePlayReader() checks contents length
    ↓
If 1 item → Open directly (existing behavior)
    ↓
If 2+ items → Open VirtualBlockReaderNavigationModal
    ↓
Modal displays first item (index 0)
    ↓
User clicks "Next"
    ↓
useVirtualBlockNavigation hook updates currentIndex
    ↓
Modal re-renders with new content
    ↓
Repeat until last item
    ↓
Next button disabled on last item
```

---

## User Experience

### Example: Notes Block with 3 Items

**Current Flow (4 clicks + modals):**
1. Click Notes icon → Opens list modal
2. Click "View" on item 1 → Opens text modal → Close
3. Click "View" on item 2 → Opens iframe modal → Close
4. Click "View" on item 3 → Opens iframe modal → Close

**New Flow (2 clicks + arrows):**
1. Click Notes icon → Opens directly showing item 1
2. Click "Next" → Shows item 2
3. Click "Next" → Shows item 3 (Next disabled)
4. Click "Close" → Done

**Improvement:** 50% fewer clicks, smoother flow! 🎉

---

## Features

✅ **Linear Navigation**
- Previous/Next buttons
- Disabled at boundaries (first/last)
- No circular looping

✅ **Counter Display**
- Shows "2 of 3" (current of total)
- Updates in real-time

✅ **Content Display**
- Text content displayed inline with HTML
- Links displayed in iframe with toolbar
- Objects fetched and displayed in iframe

✅ **Keyboard Shortcuts** (Optional)
- Left Arrow → Previous
- Right Arrow → Next
- Escape → Close

✅ **Accessibility**
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Live region for counter updates

---

## Testing Checklist

### Functional Tests

**Single Item Block:**
- [ ] Opens directly (no navigation buttons)
- [ ] Existing behavior unchanged

**Two Item Block:**
- [ ] Opens showing item 1
- [ ] Previous button disabled
- [ ] Counter shows "1 of 2"
- [ ] Click Next → Shows item 2
- [ ] Counter shows "2 of 2"
- [ ] Next button disabled
- [ ] Previous button enabled

**Three+ Item Block:**
- [ ] Opens showing item 1
- [ ] Navigate through all items sequentially
- [ ] Counter updates correctly
- [ ] Buttons enable/disable at boundaries

**Content Type Tests:**
- [ ] Text content displays correctly
- [ ] Link content loads in iframe
- [ ] Object content fetches URL and loads
- [ ] Mixed content types work

**Keyboard Tests:**
- [ ] Left arrow goes to previous
- [ ] Right arrow goes to next
- [ ] Escape closes modal
- [ ] Tab navigation works

**Edge Cases:**
- [ ] Empty contents array
- [ ] Invalid content type
- [ ] Object URL fetch fails
- [ ] Iframe load fails

---

## Next Steps

1. ✅ Review this revised plan
2. ✅ Confirm requirements match your needs
3. ✅ Approve to start implementation
4. 🚀 Begin Phase 1: Create navigation hook

---

**Document Version**: 2.0 (Revised)
**Created**: 2026-01-09
**Status**: Ready for Implementation
