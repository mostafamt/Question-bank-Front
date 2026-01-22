# Tab Filtering Implementation Plan

**Date:** 2026-01-01
**Status:** Implementation Plan
**Related:** `docs/READER_VS_STUDIO_FEATURES.md`

## Overview

This document outlines the implementation plan for dynamic tab filtering based on Reader vs Studio mode. The system will use a JSON configuration file to determine which tabs should be visible in each mode.

## Goals

1. Create a centralized JSON configuration for all tabs
2. Detect mode (reader vs studio) from the URL
3. Filter tabs dynamically based on mode
4. Maintain backwards compatibility with existing code
5. Make it easy to add/modify tab visibility rules

## Mode Detection Strategy

### URL-Based Detection

The mode will be determined by checking if the URL path contains `/read/`:

```javascript
// Reader Mode URLs
/read/book/:bookId/chapter/:chapterId

// Studio Mode URLs
/book/:bookId/chapter/:chapterId
```

### Implementation

```javascript
// src/utils/mode.js or src/utils/studio.js
export const detectModeFromUrl = () => {
  const pathname = window.location.pathname;
  return pathname.includes('/read/') ? 'reader' : 'studio';
};

// Alternative: using useLocation from react-router-dom
export const useAppMode = () => {
  const location = useLocation();
  return location.pathname.includes('/read/') ? 'reader' : 'studio';
};
```

## JSON Configuration Structure

### File Location

`src/config/tabs.config.json`

### Schema

```json
{
  "$schema": "./tabs.schema.json",
  "version": "1.0.0",
  "lastUpdated": "2026-01-01",
  "tabs": {
    "left": [
      {
        "id": "thumbnails",
        "label": "Thumbnails",
        "icon": "ViewModuleIcon",
        "modes": ["reader", "studio"],
        "position": "left",
        "order": 1,
        "component": "StudioThumbnails",
        "readerComponent": "BookThumbnails",
        "enabled": true
      }
    ],
    "right": [
      {
        "id": "table-of-contents",
        "label": "Table of Contents",
        "icon": "TocIcon",
        "modes": ["reader", "studio"],
        "position": "right",
        "order": 1,
        "component": "TableOfContents",
        "enabled": true
      }
    ]
  }
}
```

### Field Descriptions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique identifier for the tab | `"thumbnails"` |
| `label` | string | Display name of the tab | `"Thumbnails"` |
| `icon` | string | MUI icon component name | `"ViewModuleIcon"` |
| `modes` | array | Which modes show this tab | `["reader", "studio"]` or `["studio"]` |
| `position` | string | Sidebar position | `"left"` or `"right"` |
| `order` | number | Display order within sidebar | `1`, `2`, `3`, etc. |
| `component` | string | Component to render (studio mode) | `"StudioThumbnails"` |
| `readerComponent` | string | Component to render (reader mode) | `"BookThumbnails"` |
| `enabled` | boolean | Whether tab is currently active | `true` or `false` |

### Complete JSON Configuration

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-01-01",
  "tabs": {
    "left": [
      {
        "id": "thumbnails",
        "label": "Thumbnails",
        "icon": "ViewModuleIcon",
        "modes": ["reader", "studio"],
        "position": "left",
        "order": 1,
        "component": "StudioThumbnails",
        "readerComponent": "BookThumbnails",
        "enabled": true
      },
      {
        "id": "recalls",
        "label": "Recalls",
        "icon": "LightbulbIcon",
        "modes": ["reader", "studio"],
        "position": "left",
        "order": 2,
        "component": "List",
        "enabled": true
      },
      {
        "id": "micro-learning",
        "label": "Micro Learning",
        "icon": "SchoolIcon",
        "modes": ["reader", "studio"],
        "position": "left",
        "order": 3,
        "component": "List",
        "enabled": true
      },
      {
        "id": "enriching-content",
        "label": "Enriching Content",
        "icon": "AutoStoriesIcon",
        "modes": ["reader", "studio"],
        "position": "left",
        "order": 4,
        "component": "List",
        "enabled": true
      },
      {
        "id": "check-yourself-left",
        "label": "Check Yourself",
        "icon": "QuizIcon",
        "modes": ["studio"],
        "position": "left",
        "order": 5,
        "component": "List",
        "enabled": true,
        "note": "In reader mode, this appears on the right sidebar"
      }
    ],
    "right": [
      {
        "id": "table-of-contents",
        "label": "Table of Contents",
        "icon": "TocIcon",
        "modes": ["reader", "studio"],
        "position": "right",
        "order": 1,
        "component": "TableOfContents",
        "enabled": true
      },
      {
        "id": "glossary-keywords",
        "label": "Glossary & Keywords",
        "icon": "MenuBookIcon",
        "modes": ["reader", "studio"],
        "position": "right",
        "order": 2,
        "component": "List",
        "enabled": true
      },
      {
        "id": "illustrative-interactions",
        "label": "Illustrative Interactions",
        "icon": "InteractionIcon",
        "modes": ["reader", "studio"],
        "position": "right",
        "order": 3,
        "component": "List",
        "enabled": true
      },
      {
        "id": "check-yourself-right",
        "label": "Check Yourself",
        "icon": "QuizIcon",
        "modes": ["reader"],
        "position": "right",
        "order": 4,
        "component": "List",
        "enabled": true,
        "note": "In studio mode, this appears on the left sidebar"
      },
      {
        "id": "block-authoring",
        "label": "Block Authoring",
        "icon": "EditIcon",
        "modes": ["studio"],
        "position": "right",
        "order": 5,
        "component": "StudioActions",
        "enabled": true,
        "description": "Create and edit content blocks"
      },
      {
        "id": "composite-blocks",
        "label": "Composite Blocks",
        "icon": "LayersIcon",
        "modes": ["studio"],
        "position": "right",
        "order": 6,
        "component": "StudioCompositeBlocks",
        "enabled": true,
        "description": "Manage grouped content blocks"
      }
    ]
  }
}
```

## Implementation Steps

### Phase 1: Setup Configuration

**Files to create:**
- `src/config/tabs.config.json` - Tab configuration
- `src/utils/tabFiltering.js` - Filtering utilities

**Step 1.1: Create JSON Configuration**

Create `src/config/tabs.config.json` with the complete configuration above.

**Step 1.2: Create Utility Functions**

Create `src/utils/tabFiltering.js`:

```javascript
import tabsConfig from '../config/tabs.config.json';
import { useLocation } from 'react-router-dom';

/**
 * Detect app mode from URL
 * @returns {'reader' | 'studio'}
 */
export const detectModeFromUrl = () => {
  const pathname = window.location.pathname;
  return pathname.includes('/read/') ? 'reader' : 'studio';
};

/**
 * React hook to get current app mode
 * @returns {'reader' | 'studio'}
 */
export const useAppMode = () => {
  const location = useLocation();
  return location.pathname.includes('/read/') ? 'reader' : 'studio';
};

/**
 * Filter tabs by mode
 * @param {Array} tabs - Array of tab configurations
 * @param {'reader' | 'studio'} mode - Current mode
 * @returns {Array} Filtered tabs
 */
export const filterTabsByMode = (tabs, mode) => {
  return tabs
    .filter(tab => tab.enabled && tab.modes.includes(mode))
    .sort((a, b) => a.order - b.order);
};

/**
 * Get tabs for a specific sidebar in a specific mode
 * @param {'left' | 'right'} position - Sidebar position
 * @param {'reader' | 'studio'} mode - Current mode
 * @returns {Array} Filtered and sorted tabs
 */
export const getTabsForSidebar = (position, mode) => {
  const tabs = tabsConfig.tabs[position] || [];
  return filterTabsByMode(tabs, mode);
};

/**
 * Get all tabs configuration
 * @returns {Object} Full tabs configuration
 */
export const getTabsConfig = () => {
  return tabsConfig;
};
```

### Phase 2: Update Column Builders

**Files to modify:**
- `src/components/Studio/columns/index.js` (Studio mode)
- `src/components/Studio/columns/reader.columns.js` (Reader mode)

**Step 2.1: Update Studio Column Builders**

Modify `src/components/Studio/columns/index.js`:

```javascript
import { getTabsForSidebar } from '../../../utils/tabFiltering';
import tabsConfig from '../../../config/tabs.config.json';

export const buildLeftColumns = (props) => {
  const mode = 'studio'; // We know this is studio mode
  const tabConfigs = getTabsForSidebar('left', mode);

  // Map tab configurations to column objects
  return tabConfigs.map(config => {
    switch(config.id) {
      case 'thumbnails':
        return buildThumbnailsTab(props, config);
      case 'recalls':
        return buildRecallsTab(props, config);
      case 'micro-learning':
        return buildMicroLearningTab(props, config);
      case 'enriching-content':
        return buildEnrichingContentTab(props, config);
      case 'check-yourself-left':
        return buildCheckYourselfTab(props, config);
      default:
        console.warn(`Unknown tab: ${config.id}`);
        return null;
    }
  }).filter(Boolean); // Remove nulls
};

export const buildRightColumns = (props) => {
  const mode = 'studio';
  const tabConfigs = getTabsForSidebar('right', mode);

  return tabConfigs.map(config => {
    switch(config.id) {
      case 'table-of-contents':
        return buildTableOfContentsTab(props, config);
      case 'glossary-keywords':
        return buildGlossaryTab(props, config);
      case 'illustrative-interactions':
        return buildIllustrativeInteractionsTab(props, config);
      case 'block-authoring':
        return buildBlockAuthoringTab(props, config);
      case 'composite-blocks':
        return buildCompositeBlocksTab(props, config);
      default:
        console.warn(`Unknown tab: ${config.id}`);
        return null;
    }
  }).filter(Boolean);
};

// Helper functions to build individual tabs
const buildThumbnailsTab = (props, config) => {
  const { pages, chapterId, activePageIndex, changePageByIndex, thumbnailsRef } = props;

  return {
    id: config.id,
    label: config.label,
    icon: config.icon,
    component: StudioThumbnails,
    componentProps: {
      pages,
      chapterId,
      activePage: activePageIndex,
      onClick: changePageByIndex,
      ref: thumbnailsRef,
    },
  };
};

// ... similar helper functions for other tabs
```

**Step 2.2: Update Reader Column Builders**

Modify `src/components/Studio/columns/reader.columns.js`:

```javascript
import { getTabsForSidebar } from '../../../utils/tabFiltering';

export const buildReaderLeftColumns = (props) => {
  const mode = 'reader';
  const tabConfigs = getTabsForSidebar('left', mode);

  return tabConfigs.map(config => {
    // Use readerComponent if specified, otherwise use component
    const componentName = config.readerComponent || config.component;

    switch(config.id) {
      case 'thumbnails':
        return buildThumbnailsTab(props, config);
      case 'recalls':
        return buildRecallsTab(props, config);
      case 'micro-learning':
        return buildMicroLearningTab(props, config);
      case 'enriching-content':
        return buildEnrichingContentTab(props, config);
      default:
        console.warn(`Unknown reader tab: ${config.id}`);
        return null;
    }
  }).filter(Boolean);
};

export const buildReaderRightColumns = (props) => {
  const mode = 'reader';
  const tabConfigs = getTabsForSidebar('right', mode);

  return tabConfigs.map(config => {
    switch(config.id) {
      case 'table-of-contents':
        return buildTableOfContentsTab(props, config);
      case 'glossary-keywords':
        return buildGlossaryTab(props, config);
      case 'illustrative-interactions':
        return buildIllustrativeInteractionsTab(props, config);
      case 'check-yourself-right':
        return buildCheckYourselfTab(props, config);
      default:
        console.warn(`Unknown reader tab: ${config.id}`);
        return null;
    }
  }).filter(Boolean);
};
```

### Phase 3: Update Studio Component

**File to modify:**
- `src/components/Studio/Studio.jsx`

**Step 3.1: Add Mode Detection**

```javascript
import { useLocation } from 'react-router-dom';
import { useAppMode } from '../../utils/tabFiltering';

const Studio = (props) => {
  // ... existing code

  // Detect mode from URL
  const mode = useAppMode(); // 'reader' or 'studio'
  const isReaderMode = mode === 'reader';

  // ... existing code

  // Build columns based on mode
  const LEFT_COLUMNS = isReaderMode
    ? buildReaderLeftColumns({ /* reader props */ })
    : buildLeftColumns({ /* studio props */ });

  const RIGHT_COLUMNS = isReaderMode
    ? buildReaderRightColumns({ /* reader props */ })
    : buildRightColumns({ /* studio props */ });

  // ... rest of component
};
```

### Phase 4: Testing & Validation

**Step 4.1: Unit Tests**

Create `src/utils/__tests__/tabFiltering.test.js`:

```javascript
import {
  detectModeFromUrl,
  filterTabsByMode,
  getTabsForSidebar
} from '../tabFiltering';

describe('Tab Filtering Utilities', () => {
  describe('detectModeFromUrl', () => {
    it('should detect reader mode from URL', () => {
      // Mock window.location
      delete window.location;
      window.location = { pathname: '/read/book/123/chapter/456' };

      expect(detectModeFromUrl()).toBe('reader');
    });

    it('should detect studio mode from URL', () => {
      window.location = { pathname: '/book/123/chapter/456' };

      expect(detectModeFromUrl()).toBe('studio');
    });
  });

  describe('filterTabsByMode', () => {
    const mockTabs = [
      { id: 'tab1', modes: ['reader', 'studio'], enabled: true, order: 1 },
      { id: 'tab2', modes: ['studio'], enabled: true, order: 2 },
      { id: 'tab3', modes: ['reader'], enabled: true, order: 3 },
      { id: 'tab4', modes: ['reader', 'studio'], enabled: false, order: 4 },
    ];

    it('should filter tabs for reader mode', () => {
      const result = filterTabsByMode(mockTabs, 'reader');
      expect(result).toHaveLength(2);
      expect(result.map(t => t.id)).toEqual(['tab1', 'tab3']);
    });

    it('should filter tabs for studio mode', () => {
      const result = filterTabsByMode(mockTabs, 'studio');
      expect(result).toHaveLength(2);
      expect(result.map(t => t.id)).toEqual(['tab1', 'tab2']);
    });

    it('should exclude disabled tabs', () => {
      const result = filterTabsByMode(mockTabs, 'reader');
      expect(result.find(t => t.id === 'tab4')).toBeUndefined();
    });
  });
});
```

**Step 4.2: Integration Tests**

- [ ] Test reader mode URL shows only reader tabs
- [ ] Test studio mode URL shows only studio tabs
- [ ] Test tab ordering is correct
- [ ] Test disabled tabs are hidden
- [ ] Test switching between modes works correctly

**Step 4.3: Manual Testing Checklist**

**Reader Mode (`/read/book/:bookId/chapter/:chapterId`):**
- [ ] Left sidebar shows 4 tabs: Thumbnails, Recalls, Micro Learning, Enriching Content
- [ ] Right sidebar shows 4 tabs: TOC, Glossary, Illustrative Interactions, Check Yourself
- [ ] No Block Authoring tab visible
- [ ] No Composite Blocks tab visible
- [ ] Check Yourself NOT on left sidebar

**Studio Mode (`/book/:bookId/chapter/:chapterId`):**
- [ ] Left sidebar shows 5 tabs: Thumbnails, Recalls, Micro Learning, Enriching Content, Check Yourself
- [ ] Right sidebar shows 5 tabs: TOC, Glossary, Illustrative Interactions, Block Authoring, Composite Blocks
- [ ] Check Yourself on left sidebar (not right)
- [ ] Block Authoring tab visible and functional
- [ ] Composite Blocks tab visible and functional

## Benefits

### 1. Centralized Configuration
- Single source of truth for tab configuration
- Easy to modify tab visibility without code changes
- Can be loaded from API in the future

### 2. Maintainability
- Clear separation between configuration and logic
- Easy to add new tabs
- Easy to modify existing tabs
- Self-documenting through JSON structure

### 3. Flexibility
- Can add new modes easily (e.g., 'preview', 'admin')
- Can enable/disable tabs without code changes
- Can reorder tabs by changing `order` field
- Can A/B test different tab configurations

### 4. Type Safety (Future Enhancement)
- Can generate TypeScript types from JSON schema
- Can validate JSON configuration at build time
- Can provide IDE autocomplete for tab IDs

## Migration Strategy

### Backwards Compatibility

During migration, both old and new systems can coexist:

```javascript
// Feature flag approach
const USE_JSON_CONFIG = process.env.REACT_APP_USE_TAB_CONFIG === 'true';

const LEFT_COLUMNS = USE_JSON_CONFIG
  ? buildLeftColumnsFromConfig(props, mode)
  : buildLeftColumns(props); // Old implementation
```

### Migration Steps

1. **Phase 1:** Create JSON config and utilities (no breaking changes)
2. **Phase 2:** Add mode detection to Studio component (no breaking changes)
3. **Phase 3:** Update column builders to use config (behind feature flag)
4. **Phase 4:** Test thoroughly in both modes
5. **Phase 5:** Remove feature flag and old code

## Future Enhancements

### 1. Dynamic Tab Loading
Load tab configuration from API:

```javascript
const { data: tabsConfig } = useQuery({
  queryKey: ['tabs-config'],
  queryFn: () => fetch('/api/config/tabs').then(res => res.json()),
});
```

### 2. User Preferences
Allow users to customize visible tabs:

```javascript
const userPreferences = {
  hiddenTabs: ['micro-learning'],
  tabOrder: ['thumbnails', 'recalls', 'enriching-content'],
};
```

### 3. Role-Based Access
Add role-based tab visibility:

```json
{
  "id": "analytics",
  "label": "Analytics",
  "modes": ["studio"],
  "roles": ["admin", "teacher"],
  "enabled": true
}
```

### 4. Conditional Features
Add feature flag support:

```json
{
  "id": "ai-assistant",
  "label": "AI Assistant",
  "modes": ["reader", "studio"],
  "featureFlag": "ENABLE_AI_ASSISTANT",
  "enabled": true
}
```

## File Structure

```
src/
├── config/
│   ├── tabs.config.json          # Tab configuration
│   └── tabs.schema.json          # JSON schema (optional)
├── utils/
│   ├── tabFiltering.js           # Filtering utilities
│   └── __tests__/
│       └── tabFiltering.test.js  # Unit tests
├── components/
│   └── Studio/
│       ├── Studio.jsx            # Updated with mode detection
│       └── columns/
│           ├── index.js          # Updated studio columns
│           └── reader.columns.js # Updated reader columns
└── docs/
    ├── TAB_FILTERING_IMPLEMENTATION_PLAN.md  # This file
    └── READER_VS_STUDIO_FEATURES.md          # Reference doc
```

## Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|---------------|
| **Phase 1: Setup** | Create JSON config, create utilities | 2-3 hours |
| **Phase 2: Column Builders** | Update both column builders | 3-4 hours |
| **Phase 3: Studio Component** | Add mode detection, integrate config | 2-3 hours |
| **Phase 4: Testing** | Unit tests, integration tests, manual testing | 3-4 hours |
| **Total** | | **10-14 hours** |

## Success Criteria

- [ ] JSON configuration file created and validated
- [ ] Mode detection working from URL
- [ ] Reader mode shows correct tabs (4 left, 4 right)
- [ ] Studio mode shows correct tabs (5 left, 5 right)
- [ ] Tab ordering matches configuration
- [ ] Disabled tabs are hidden
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing checklist completed
- [ ] No breaking changes to existing functionality
- [ ] Documentation updated

## References

- **Related Documentation:** `docs/READER_VS_STUDIO_FEATURES.md`
- **Tab Configuration Section:** Lines 31-60
- **Current Implementation:**
  - `src/components/Studio/columns/index.js`
  - `src/components/Studio/columns/reader.columns.js`
- **Studio Component:** `src/components/Studio/Studio.jsx`

## Questions & Decisions

### Q: Should we use JSON or TypeScript for configuration?
**Decision:** Start with JSON for simplicity, migrate to TypeScript in future if needed.

### Q: Should mode detection be in Studio or higher up?
**Decision:** Start in Studio, can move to route level if needed.

### Q: Should we support hot-reloading of tab config?
**Decision:** Not in initial implementation, add in future enhancement.

### Q: Should we validate JSON schema at runtime?
**Decision:** Add schema validation in development mode only.

## Appendix

### Example: Adding a New Tab

To add a new tab, simply add it to `tabs.config.json`:

```json
{
  "id": "notes",
  "label": "Notes",
  "icon": "NoteIcon",
  "modes": ["reader", "studio"],
  "position": "left",
  "order": 6,
  "component": "NotesList",
  "enabled": true
}
```

Then add the mapping in column builder:

```javascript
case 'notes':
  return buildNotesTab(props, config);
```

### Example: Disabling a Tab

Change `enabled` to `false`:

```json
{
  "id": "micro-learning",
  "enabled": false  // Tab will not appear in any mode
}
```

### Example: Making a Tab Studio-Only

Change `modes` array:

```json
{
  "id": "analytics",
  "modes": ["studio"]  // Only appears in studio mode
}
```
