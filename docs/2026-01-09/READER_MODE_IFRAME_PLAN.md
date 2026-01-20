# Virtual Blocks Reader Mode - Iframe Display Enhancement

## Overview
Enhance the virtual blocks reader mode to display content within iframes instead of opening in new tabs/modals, providing a seamless reading experience.

---

## Current Behavior vs. Desired Behavior

### Current Implementation (What We Have Now)

**Text Content:**
- Opens in TextEditorModal (read-only)
- ✅ Keep as-is

**Link Content:**
- Opens in new browser tab (`window.open()`)
- ❌ Change to iframe display

**Object Content:**
- Opens in PlayObjectModal
- ❌ Change to iframe display with URL fetched from object ID

**Reader Permissions:**
- Cannot add new virtual blocks ✅
- Cannot edit virtual blocks ✅
- Cannot delete virtual blocks ✅
- Can only view/play content ✅

### Desired Implementation (What We Want)

**Text Content:**
- Display in TextEditorModal (read-only) - No change needed
- ✅ Already works correctly

**Link Content:**
- Display URL in iframe within modal
- Show link controls (open in new tab, refresh)
- Proper loading states

**Object Content:**
- Fetch URL from object ID via API
- Display URL in iframe within modal
- Show object controls (open in new tab, refresh)
- Handle loading and errors

---

## Implementation Plan

### Phase 1: Create Iframe Display Modal

**File to Create:** `src/components/Modal/IframeDisplayModal/IframeDisplayModal.jsx`

**Purpose:**
- Unified modal for displaying iframe content
- Works for both links and objects
- Includes loading states, error handling
- Provides controls (open in new tab, refresh, close)

**Features:**
1. Responsive iframe that fills modal
2. Loading spinner while content loads
3. Error state if iframe fails to load
4. Toolbar with:
   - Open in new tab button
   - Refresh iframe button
   - Close button

**Props:**
```javascript
{
  title: string,           // Modal title
  url: string,             // URL to display in iframe
  onClose: function        // Close handler
}
```

**UI Structure:**
```
┌────────────────────────────────────────────────┐
│  [Title]                              [Close]  │
├────────────────────────────────────────────────┤
│  [↻ Refresh] [↗ Open in New Tab]              │
├────────────────────────────────────────────────┤
│                                                │
│           [IFRAME CONTENT]                     │
│                                                │
│                                                │
├────────────────────────────────────────────────┤
│                                    [Close]     │
└────────────────────────────────────────────────┘
```

---

### Phase 2: Fetch Object URL Helper Function

**File to Modify:** `src/services/api.js` or create `src/utils/object-url.js`

**Purpose:**
- Fetch URL from object ID
- Handle different object types
- Cache results for performance

**Function:**
```javascript
/**
 * Get playable URL from object ID
 * @param {string} objectId - Interactive object ID
 * @returns {Promise<string>} - URL to display in iframe
 */
export const getObjectUrl = async (objectId) => {
  try {
    // Fetch object data
    const response = await axios.get(`/interactive-objects/${objectId}`);

    // Extract URL based on object structure
    // Option 1: Object has direct URL field
    if (response.data.url) {
      return response.data.url;
    }

    // Option 2: Construct URL from object type and ID
    // e.g., /play/multiple-choice/123
    if (response.data.type && response.data._id) {
      return `/play/${response.data.type}/${response.data._id}`;
    }

    // Option 3: Return embedded player URL
    return `/object-player/${objectId}`;

  } catch (error) {
    console.error('Failed to fetch object URL:', error);
    throw error;
  }
};
```

**Considerations:**
- What is the actual object data structure?
- Does backend provide a playable URL?
- Do we need to construct URL client-side?
- Should we cache URLs?

---

### Phase 3: Update VirtualBlockReaderModal

**File to Modify:** `src/components/Modal/VirtualBlockReaderModal/VirtualBlockReaderModal.jsx`

**Changes Needed:**

1. **Update handleViewContent function:**

```javascript
const handleViewContent = async (item) => {
  switch (item.type) {
    case "text":
      // Keep current behavior - open text editor
      openModal("text-editor", {
        value: item.contentValue,
        title: item.contentType,
        onClickSubmit: null, // Read-only
      });
      break;

    case "link":
      // NEW: Open iframe display modal
      openModal("iframe-display", {
        title: item.contentType,
        url: item.contentValue,
      });
      break;

    case "object":
      // NEW: Fetch URL and open iframe display modal
      try {
        setLoading(true);
        const url = await getObjectUrl(item.contentValue);
        openModal("iframe-display", {
          title: item.contentType,
          url: url,
        });
      } catch (error) {
        toast.error("Failed to load object");
        console.error(error);
      } finally {
        setLoading(false);
      }
      break;

    default:
      console.warn("Unknown content type:", item.type);
  }
};
```

2. **Add loading state:**
```javascript
const [loading, setLoading] = React.useState(false);
```

3. **Add loading indicator to UI:**
```javascript
{loading && (
  <Box className={styles.loadingOverlay}>
    <CircularProgress />
  </Box>
)}
```

---

### Phase 4: Register Iframe Display Modal

**File to Modify:** `src/components/Modal/Modal.jsx`

**Changes:**
```javascript
import IframeDisplayModal from "./IframeDisplayModal/IframeDisplayModal";

const MODAL_COMPONENTS = {
  // ... existing modals
  "iframe-display": IframeDisplayModal,
};
```

---

### Phase 5: Verify Reader Permissions (Already Implemented)

**Files to Review:**
- `src/components/VirtualBlocks/VirtualBlock/VirtualBlock.jsx`
- `src/components/VirtualBlocks/VirtualBlocks.jsx`

**Current Implementation:**
```javascript
// In VirtualBlock.jsx
if (!reader) {
  // Show dropdown and edit controls
} else {
  // Only show play button
}
```

**Verification Checklist:**
- ✅ Reader cannot see add button
- ✅ Reader cannot see edit button
- ✅ Reader cannot see delete button
- ✅ Reader can only click to view content

---

## Detailed Implementation Steps

### Step 1: Create IframeDisplayModal Component

**Create:** `src/components/Modal/IframeDisplayModal/IframeDisplayModal.jsx`

```javascript
import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { Box, IconButton, CircularProgress, Alert } from "@mui/material";
import { OpenInNew, Refresh } from "@mui/icons-material";

const IframeDisplayModal = (props) => {
  const { title = "Content", url, handleCloseModal } = props;

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [iframeKey, setIframeKey] = React.useState(0);

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
    setIframeKey(prev => prev + 1);
  };

  const handleOpenNewTab = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="iframe-display-modal">
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>{title}</BootstrapModal.Title>
      </BootstrapModal.Header>

      <BootstrapModal.Body>
        <Box className="toolbar">
          <IconButton onClick={handleRefresh} title="Refresh">
            <Refresh />
          </IconButton>
          <IconButton onClick={handleOpenNewTab} title="Open in new tab">
            <OpenInNew />
          </IconButton>
        </Box>

        <Box className="iframe-container">
          {loading && (
            <Box className="loading">
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error">
              Failed to load content.
              <Button onClick={handleRefresh}>Try Again</Button>
            </Alert>
          )}

          <iframe
            key={iframeKey}
            src={url}
            title={title}
            onLoad={handleLoad}
            onError={handleError}
            className="content-iframe"
            sandbox="allow-same-origin allow-scripts allow-forms"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </Box>
      </BootstrapModal.Body>
    </div>
  );
};

export default IframeDisplayModal;
```

**Create:** `src/components/Modal/IframeDisplayModal/iframeDisplayModal.module.scss`

```scss
.iframe-display-modal {
  .toolbar {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
  }

  .iframe-container {
    position: relative;
    width: 100%;
    height: 70vh;
    min-height: 500px;

    .loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
    }

    .content-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  }
}
```

### Step 2: Create Object URL Utility

**Create:** `src/utils/object-url.js`

```javascript
import axios from "../axios";

// Cache for object URLs to avoid repeated API calls
const urlCache = new Map();

/**
 * Get playable URL from object ID
 * @param {string} objectId - Interactive object ID
 * @returns {Promise<string>} - URL to display in iframe
 */
export const getObjectUrl = async (objectId) => {
  // Check cache first
  if (urlCache.has(objectId)) {
    return urlCache.get(objectId);
  }

  try {
    // Fetch object data
    const response = await axios.get(`/interactive-objects/${objectId}`);
    const objectData = response.data;

    let url;

    // Determine URL based on object structure
    // TODO: Adjust based on actual API response structure
    if (objectData.playUrl) {
      url = objectData.playUrl;
    } else if (objectData.url) {
      url = objectData.url;
    } else if (objectData.type) {
      // Construct URL from type and ID
      url = `/play/${objectData.type}/${objectId}`;
    } else {
      // Fallback to generic player
      url = `/object-player/${objectId}`;
    }

    // Cache the URL
    urlCache.set(objectId, url);

    return url;
  } catch (error) {
    console.error('Failed to fetch object URL:', error);
    throw new Error('Could not load object URL');
  }
};

/**
 * Clear URL cache (useful for testing)
 */
export const clearUrlCache = () => {
  urlCache.clear();
};
```

### Step 3: Update VirtualBlockReaderModal

**Modify:** `src/components/Modal/VirtualBlockReaderModal/VirtualBlockReaderModal.jsx`

Add imports:
```javascript
import { CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import { getObjectUrl } from "../../../utils/object-url";
```

Add loading state:
```javascript
const [loadingObjectUrl, setLoadingObjectUrl] = React.useState(false);
```

Update handleViewContent:
```javascript
const handleViewContent = async (item) => {
  switch (item.type) {
    case "text":
      // Text content - open text viewer (read-only)
      openModal("text-editor", {
        value: item.contentValue,
        title: item.contentType,
        onClickSubmit: null,
      });
      break;

    case "link":
      // Link content - open in iframe
      openModal("iframe-display", {
        title: item.contentType,
        url: item.contentValue,
      });
      break;

    case "object":
      // Object content - fetch URL and open in iframe
      setLoadingObjectUrl(true);
      try {
        const url = await getObjectUrl(item.contentValue);
        openModal("iframe-display", {
          title: item.contentType,
          url: url,
        });
      } catch (error) {
        toast.error("Failed to load interactive object");
        console.error("Object URL fetch error:", error);
      } finally {
        setLoadingObjectUrl(false);
      }
      break;

    default:
      console.warn("Unknown content type:", item.type);
  }
};
```

Add loading overlay to UI:
```javascript
{loadingObjectUrl && (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999,
    }}
  >
    <CircularProgress />
  </Box>
)}
```

### Step 4: Update Modal Registry

**Modify:** `src/components/Modal/Modal.jsx`

```javascript
import IframeDisplayModal from "./IframeDisplayModal/IframeDisplayModal";

const MODAL_COMPONENTS = {
  // ... existing modals
  "iframe-display": IframeDisplayModal,
};
```

---

## Questions to Answer Before Implementation

### 1. Object URL Structure
**Question:** How do we get a playable URL from an object ID?

**Options:**
- A) Object data includes a `playUrl` or `url` field
- B) Construct URL from object type: `/play/{type}/{id}`
- C) Use generic player route: `/object-player/{id}`
- D) Backend provides an endpoint: `/api/objects/{id}/play-url`

**Decision Needed:** Which approach does your backend support?

### 2. Iframe Sandbox Permissions
**Question:** What permissions should the iframe have?

**Current:**
```javascript
sandbox="allow-same-origin allow-scripts allow-forms"
```

**Considerations:**
- Do interactive objects need localStorage?
- Do they need to open popups?
- Do they need to navigate parent frame?

**Decision Needed:** What permissions are required?

### 3. Iframe Size
**Question:** What size should the iframe be?

**Current:** 70vh (70% of viewport height)

**Options:**
- Fixed height (e.g., 600px)
- Percentage of viewport (70vh, 80vh)
- Full screen option
- Responsive based on content

**Decision Needed:** Preferred sizing?

### 4. Error Handling
**Question:** How to handle iframe load failures?

**Current Plan:**
- Show error message
- Provide refresh button
- Option to open in new tab

**Decision Needed:** Is this sufficient?

### 5. Reader Restrictions
**Question:** Are there any other reader-mode restrictions needed?

**Currently Prevented:**
- ✅ Cannot add virtual blocks
- ✅ Cannot edit virtual blocks
- ✅ Cannot delete virtual blocks

**Decision Needed:** Any other restrictions?

---

## Testing Plan

### Unit Tests
- [ ] getObjectUrl fetches URL correctly
- [ ] getObjectUrl handles errors
- [ ] URL caching works
- [ ] IframeDisplayModal renders
- [ ] Loading states work
- [ ] Error states work

### Integration Tests
- [ ] Link content opens in iframe
- [ ] Object content fetches URL and opens
- [ ] Text content still opens in text editor
- [ ] Refresh button works
- [ ] Open in new tab works

### Manual Tests
- [ ] Test all three content types
- [ ] Test with various URLs (http, https, relative)
- [ ] Test error scenarios (invalid URL, network error)
- [ ] Test on mobile devices
- [ ] Test iframe sandbox restrictions
- [ ] Verify reader cannot edit

---

## Implementation Estimate

- **Phase 1** (IframeDisplayModal): 2-3 hours
- **Phase 2** (getObjectUrl): 1-2 hours
- **Phase 3** (Update VirtualBlockReaderModal): 1 hour
- **Phase 4** (Modal Registry): 15 minutes
- **Testing**: 2-3 hours

**Total**: ~6-9 hours

---

## Files Summary

### To Create (3 files)
1. `src/components/Modal/IframeDisplayModal/IframeDisplayModal.jsx`
2. `src/components/Modal/IframeDisplayModal/iframeDisplayModal.module.scss`
3. `src/utils/object-url.js`

### To Modify (2 files)
1. `src/components/Modal/VirtualBlockReaderModal/VirtualBlockReaderModal.jsx`
2. `src/components/Modal/Modal.jsx`

### To Review (2 files)
1. `src/components/VirtualBlocks/VirtualBlock/VirtualBlock.jsx` - Verify reader permissions
2. Backend API - Verify object URL structure

---

## Next Steps

1. **Review this plan** - Confirm approach is correct
2. **Answer questions** - Especially object URL structure
3. **Approve phases** - Which phases to implement first
4. **Begin implementation** - Start with Phase 1

---

**Document Version**: 1.0
**Created**: 2026-01-09
**Status**: Awaiting Review
