# onImageLoad Function Refactoring Plan

**Date:** 2025-11-13
**Location:** `src/components/Studio/Studio.jsx`
**Lines:** 216-354

---

## Executive Summary

The `onImageLoad` function handles coordinate conversion between percentage and pixel units for interactive areas on book pages. Currently, there are two versions:
1. **Old version** (lines 216-318, commented out) - Comprehensive with safety checks and metadata preservation
2. **Current version** (lines 319-354, active) - Simplified but lacks critical safety features

This document outlines a plan to refactor this function into a robust, maintainable, and testable utility.

---

## Current State Analysis

### Old Version (Commented, Lines 216-318)

**Strengths:**
- ✅ Comprehensive safety checks for ref existence
- ✅ Validates dimensions before conversion
- ✅ Preserves percentage coordinates (`_percentX`, `_percentY`, `_percentWidth`, `_percentHeight`)
- ✅ Respects `_updated` flag to prevent redundant conversions
- ✅ Fallback logic for backward compatibility
- ✅ Preserves all metadata fields

**Weaknesses:**
- ❌ Complex nested logic is hard to follow
- ❌ Tightly coupled to component state and refs
- ❌ No separation of concerns
- ❌ Difficult to test in isolation
- ❌ Long function (100+ lines)

### Current Version (Active, Lines 319-354)

**Strengths:**
- ✅ Simpler and more readable
- ✅ Concise implementation

**Weaknesses:**
- ❌ **CRITICAL:** No safety checks - will crash if refs are undefined
- ❌ No metadata preservation (loses `_percentX`, `_percentY`, etc.)
- ❌ No `_updated` flag checking - causes redundant conversions
- ❌ Directly accesses `studioEditorRef.current.studioEditorSelectorRef.current` without validation
- ❌ Tightly coupled to component internals
- ❌ Cannot be unit tested

---

## Identified Issues

### 1. **Crash Risk (High Priority)**
```javascript
const { clientHeight, clientWidth } =
  studioEditorRef.current.studioEditorSelectorRef.current;
```
If refs are not available, this will throw an error and crash the component.

### 2. **Lost Metadata (Medium Priority)**
The current version doesn't preserve:
- `_percentX`, `_percentY`, `_percentWidth`, `_percentHeight` - Original percentage coordinates
- `_updated` flag - Prevents redundant conversions
- Other metadata fields that may be needed for zoom/pan operations

### 3. **Redundant Conversions (Medium Priority)**
Without the `_updated` flag, the function reconverts coordinates on every call, even when already converted.

### 4. **Testability (Medium Priority)**
The function is not testable in isolation due to tight coupling with:
- Component refs (`studioEditorRef`)
- Component state (`areas`, `areasProperties`)
- React's `setAreas` callback

### 5. **Maintainability (Low Priority)**
Coordinate conversion logic is embedded in the component rather than being a reusable utility.

---

## Proposed Refactoring Approach

### Architecture Decision: Move to Utilities

**Recommendation:** Create new utility module `src/utils/coordinates.js`

**Rationale:**
- Coordinate conversion is a **pure transformation** with no side effects
- Can be unit tested in isolation
- Reusable across other components (e.g., `StudioEditor`, `BookColumn`)
- Separates business logic from React component concerns
- Aligns with existing architecture (e.g., `src/utils/ocr.js`, `src/utils/studio.js`)

### Three-Tier Refactoring Strategy

#### Tier 1: Core Utilities (Pure Functions)
**Location:** `src/utils/coordinates.js`

```javascript
// Pure coordinate conversion functions
- convertPercentageToPixels(area, dimensions)
- convertPixelsToPercentage(area, dimensions)
- validateDimensions(dimensions)
- preserveMetadata(originalArea, convertedArea)
```

#### Tier 2: Service Layer (Business Logic)
**Location:** `src/components/Studio/services/coordinate.service.js`

```javascript
// Business logic for batch processing
- processAreasForImageLoad(areas, areasProperties, refDimensions)
- shouldConvertArea(area)
- validateRefAccess(ref)
```

#### Tier 3: Component Integration
**Location:** `src/components/Studio/Studio.jsx`

```javascript
// Thin wrapper in component
- onImageLoad() calls service layer with minimal logic
```

---

## Detailed Refactoring Plan

### Phase 1: Create Core Utilities (Days 1-2)

**File:** `src/utils/coordinates.js`

**Functions to implement:**

1. **`validateDimensions(dimensions)`**
   - Input: `{ clientWidth, clientHeight, naturalWidth?, naturalHeight? }`
   - Output: `{ isValid: boolean, errors: string[] }`
   - Purpose: Validate dimensions before conversion

2. **`convertPercentageToPixels(area, dimensions)`**
   - Input: Area object with percentage coordinates, client dimensions
   - Output: Area object with pixel coordinates
   - Purpose: Pure conversion logic
   - Handles: Validation, boundary checks

3. **`convertPixelsToPercentage(area, dimensions)`**
   - Input: Area object with pixel coordinates, client dimensions
   - Output: Area object with percentage coordinates
   - Purpose: Inverse conversion for saving

4. **`preserveMetadata(originalArea, convertedArea)`**
   - Input: Original and converted area objects
   - Output: Merged area with all metadata preserved
   - Purpose: Ensure no data loss during conversion

5. **`createAreaWithMetadata(area, metadata)`**
   - Input: Area object and metadata object
   - Output: Area with properly initialized metadata
   - Purpose: Standardize metadata initialization

**Type Definitions:**
```javascript
/**
 * @typedef {Object} Dimensions
 * @property {number} clientWidth - Current rendered width
 * @property {number} clientHeight - Current rendered height
 * @property {number} [naturalWidth] - Original image width
 * @property {number} [naturalHeight] - Original image height
 */

/**
 * @typedef {Object} Area
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} width - Width
 * @property {number} height - Height
 * @property {'px'|'%'} unit - Current unit
 * @property {boolean} isChanging - Is being modified
 * @property {boolean} isNew - Is newly created
 * @property {'px'|'percentage'} [_unit] - Original unit type
 * @property {boolean} [_updated] - Has been converted
 * @property {number} [_percentX] - Stored percentage X
 * @property {number} [_percentY] - Stored percentage Y
 * @property {number} [_percentWidth] - Stored percentage width
 * @property {number} [_percentHeight] - Stored percentage height
 */
```

### Phase 2: Create Service Layer (Days 2-3)

**File:** `src/components/Studio/services/coordinate.service.js`

**Functions to implement:**

1. **`validateRefAccess(studioEditorRef)`**
   - Input: React ref object
   - Output: `{ isValid: boolean, dimensions: Dimensions | null, error?: string }`
   - Purpose: Safe ref access with error handling

2. **`shouldConvertArea(area)`**
   - Input: Area object
   - Output: boolean
   - Purpose: Determine if area needs conversion (checks `_unit` and `_updated`)

3. **`processAreasForImageLoad(allAreas, areasProperties, studioEditorRef, activePageIndex?)`**
   - Input: Full areas array, properties, ref, optional page index
   - Output: Processed areas array
   - Purpose: Main business logic for batch processing
   - Handles:
     - Ref validation
     - Per-page processing
     - Selective conversion
     - Metadata preservation

4. **`processPageAreas(pageAreas, pageProperties, dimensions)`**
   - Input: Areas for single page, properties, dimensions
   - Output: Processed areas for that page
   - Purpose: Process all areas on a single page

5. **`getOriginalPercentageCoords(area, properties)`**
   - Input: Area and its properties
   - Output: Percentage coordinates (with fallback logic)
   - Purpose: Handle backward compatibility for stored coordinates

### Phase 3: Refactor Component (Day 3)

**File:** `src/components/Studio/Studio.jsx`

**Changes:**

1. **Import new utilities:**
```javascript
import { processAreasForImageLoad, validateRefAccess } from './services/coordinate.service';
```

2. **Replace `onImageLoad` function:**
```javascript
const onImageLoad = () => {
  // Validate ref access first
  const refValidation = validateRefAccess(studioEditorRef);

  if (!refValidation.isValid) {
    console.warn('Cannot convert coordinates:', refValidation.error);
    return; // Early return prevents crashes
  }

  // Delegate to service layer
  const processedAreas = processAreasForImageLoad(
    areas,
    areasProperties,
    studioEditorRef,
    activePageIndex
  );

  // Update state only if processing succeeded
  if (processedAreas) {
    setAreas(processedAreas);
  }
};
```

3. **Remove old commented code** (lines 216-318)

4. **Add error boundaries** around Studio component if not already present

### Phase 4: Add Comprehensive Tests (Days 4-5)

**File:** `src/utils/__tests__/coordinates.test.js`

**Test cases:**

1. **`validateDimensions`**
   - Valid dimensions
   - Missing dimensions
   - Zero dimensions
   - Negative dimensions

2. **`convertPercentageToPixels`**
   - Standard conversion
   - Edge cases (0%, 100%)
   - Invalid inputs
   - Boundary values

3. **`convertPixelsToPercentage`**
   - Standard conversion
   - Edge cases
   - Division by zero handling

4. **`preserveMetadata`**
   - All metadata preserved
   - Partial metadata
   - No metadata

**File:** `src/components/Studio/services/__tests__/coordinate.service.test.js`

**Test cases:**

1. **`validateRefAccess`**
   - Valid ref
   - Null ref
   - Undefined nested properties
   - Missing dimensions

2. **`shouldConvertArea`**
   - Should convert (percentage, not updated)
   - Should not convert (already updated)
   - Should not convert (already pixels)

3. **`processAreasForImageLoad`**
   - Empty areas
   - Mixed unit types
   - All percentage areas
   - All pixel areas
   - Invalid ref handling

4. **Integration tests**
   - Full conversion workflow
   - Multi-page processing
   - Metadata preservation across conversions

**File:** `src/components/Studio/__tests__/Studio.imageLoad.test.jsx`

**Integration test cases:**

1. **Component integration**
   - onImageLoad called on mount
   - onImageLoad called on zoom change
   - onImageLoad called on page change
   - Graceful degradation when refs unavailable

---

## Implementation Steps

### Step 1: Setup (30 minutes)
- [ ] Create `src/utils/coordinates.js`
- [ ] Create `src/components/Studio/services/coordinate.service.js`
- [ ] Create test files structure
- [ ] Add JSDoc type definitions

### Step 2: Implement Core Utilities (4 hours)
- [ ] `validateDimensions` + tests
- [ ] `convertPercentageToPixels` + tests
- [ ] `convertPixelsToPercentage` + tests
- [ ] `preserveMetadata` + tests
- [ ] `createAreaWithMetadata` + tests

### Step 3: Implement Service Layer (4 hours)
- [ ] `validateRefAccess` + tests
- [ ] `shouldConvertArea` + tests
- [ ] `getOriginalPercentageCoords` + tests
- [ ] `processPageAreas` + tests
- [ ] `processAreasForImageLoad` + tests

### Step 4: Refactor Component (2 hours)
- [ ] Import new utilities
- [ ] Replace `onImageLoad` function
- [ ] Remove old commented code
- [ ] Add error handling
- [ ] Test in browser (manual QA)

### Step 5: Testing (4 hours)
- [ ] Unit tests for utilities (aim for 100% coverage)
- [ ] Unit tests for services (aim for 95% coverage)
- [ ] Integration tests for component
- [ ] Manual testing with different scenarios:
  - [ ] Page navigation
  - [ ] Zoom in/out
  - [ ] Creating new areas
  - [ ] Loading existing blocks
  - [ ] Virtual blocks toggle

### Step 6: Documentation (1 hour)
- [ ] Add JSDoc comments to all functions
- [ ] Update CLAUDE.md with coordinate system documentation
- [ ] Add usage examples in comments
- [ ] Document known edge cases

### Step 7: Code Review & Cleanup (1 hour)
- [ ] Review all changes
- [ ] Ensure consistent naming
- [ ] Check for console.logs
- [ ] Verify no regressions

**Total Estimated Time:** ~16 hours (2 days)

---

## API Design

### Core Utility: `coordinates.js`

```javascript
/**
 * Validates that dimensions are suitable for coordinate conversion
 */
export function validateDimensions(dimensions) {
  const errors = [];

  if (!dimensions) {
    return { isValid: false, errors: ['Dimensions object is required'] };
  }

  if (!dimensions.clientWidth || dimensions.clientWidth <= 0) {
    errors.push('Invalid clientWidth');
  }

  if (!dimensions.clientHeight || dimensions.clientHeight <= 0) {
    errors.push('Invalid clientHeight');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Converts an area from percentage units to pixels
 */
export function convertPercentageToPixels(area, dimensions) {
  const validation = validateDimensions(dimensions);
  if (!validation.isValid) {
    throw new Error(`Invalid dimensions: ${validation.errors.join(', ')}`);
  }

  const { clientWidth, clientHeight } = dimensions;

  // Use stored percentage coordinates if available, otherwise use current values
  const percentX = area._percentX ?? area.x;
  const percentY = area._percentY ?? area.y;
  const percentWidth = area._percentWidth ?? area.width;
  const percentHeight = area._percentHeight ?? area.height;

  return {
    x: (percentX / 100) * clientWidth,
    y: (percentY / 100) * clientHeight,
    width: (percentWidth / 100) * clientWidth,
    height: (percentHeight / 100) * clientHeight,
    unit: 'px',
    isChanging: true,
    isNew: true,
  };
}

/**
 * Preserves metadata from original area in converted area
 */
export function preserveMetadata(originalArea, convertedArea) {
  return {
    ...convertedArea,
    _unit: originalArea._unit || 'percentage',
    _updated: true,
    _percentX: originalArea._percentX ?? originalArea.x,
    _percentY: originalArea._percentY ?? originalArea.y,
    _percentWidth: originalArea._percentWidth ?? originalArea.width,
    _percentHeight: originalArea._percentHeight ?? originalArea.height,
  };
}
```

### Service Layer: `coordinate.service.js`

```javascript
import {
  convertPercentageToPixels,
  preserveMetadata,
  validateDimensions
} from '../../../utils/coordinates';

/**
 * Safely accesses ref and returns dimensions if valid
 */
export function validateRefAccess(studioEditorRef) {
  if (!studioEditorRef?.current?.studioEditorSelectorRef?.current) {
    return {
      isValid: false,
      dimensions: null,
      error: 'Ref is not available'
    };
  }

  const { clientHeight, clientWidth, naturalWidth, naturalHeight } =
    studioEditorRef.current.studioEditorSelectorRef.current;

  const dimensions = {
    clientWidth,
    clientHeight,
    naturalWidth,
    naturalHeight
  };

  const validation = validateDimensions(dimensions);

  if (!validation.isValid) {
    return {
      isValid: false,
      dimensions: null,
      error: `Invalid dimensions: ${validation.errors.join(', ')}`
    };
  }

  return {
    isValid: true,
    dimensions
  };
}

/**
 * Determines if an area needs conversion
 */
export function shouldConvertArea(area) {
  return area._unit === 'percentage' && !area._updated;
}

/**
 * Processes all areas for image load
 */
export function processAreasForImageLoad(
  allAreas,
  areasProperties,
  studioEditorRef,
  activePageIndex = null
) {
  // Validate ref access
  const refValidation = validateRefAccess(studioEditorRef);
  if (!refValidation.isValid) {
    console.warn('Cannot process areas:', refValidation.error);
    return allAreas; // Return unchanged
  }

  const { dimensions } = refValidation;

  // Process all pages or just active page
  return allAreas?.map((page, pageIdx) => {
    // Skip if processing only active page and this isn't it
    if (activePageIndex !== null && pageIdx !== activePageIndex) {
      return page;
    }

    return processPageAreas(page, areasProperties[pageIdx], dimensions);
  });
}

/**
 * Processes areas for a single page
 */
export function processPageAreas(pageAreas, pageProperties, dimensions) {
  return pageAreas?.map((area, areaIdx) => {
    // Only convert if necessary
    if (!shouldConvertArea(area)) {
      // Return with preserved metadata
      return {
        ...area,
        unit: 'px',
        isChanging: true,
        isNew: true,
        _unit: area._unit || 'px',
        _updated: area._updated || false,
      };
    }

    // Convert coordinates
    const convertedArea = convertPercentageToPixels(area, dimensions);

    // Preserve metadata
    return preserveMetadata(area, convertedArea);
  });
}
```

---

## Migration Strategy

### Option A: Big Bang (Recommended for this case)
- Implement all phases in a feature branch
- Comprehensive testing before merge
- Single PR with full refactoring
- **Pros:** Clean cut, all benefits at once, easier to review as a whole
- **Cons:** Longer branch lifetime

### Option B: Incremental
- Merge utilities first (non-breaking)
- Add service layer in parallel
- Switch component to use new code
- Remove old code last
- **Pros:** Smaller PRs, gradual integration
- **Cons:** More complex, temporary duplication

**Recommendation:** Option A (Big Bang) because:
1. This is a contained refactoring within one component
2. No public API changes
3. Easier to test as a complete unit
4. Reduces intermediate states

---

## Risk Assessment

### High Risk
- **Crash during coordinate conversion**
  - *Mitigation:* Comprehensive ref validation before accessing
  - *Fallback:* Return unchanged areas if ref unavailable

### Medium Risk
- **Metadata loss causing zoom/pan issues**
  - *Mitigation:* Comprehensive metadata preservation in all code paths
  - *Testing:* Extensive tests for metadata preservation

- **Performance regression with many areas**
  - *Mitigation:* Only convert when necessary (check `_updated` flag)
  - *Testing:* Performance tests with large area arrays

### Low Risk
- **Breaking existing block coordinates**
  - *Mitigation:* Backward compatibility for old data format
  - *Testing:* Test with real production data

---

## Success Criteria

### Functional
- [ ] All existing functionality works (page navigation, zoom, area creation)
- [ ] No crashes or console errors
- [ ] Coordinates display correctly at all zoom levels
- [ ] Existing blocks load correctly
- [ ] New blocks can be created and saved

### Code Quality
- [ ] All utility functions are pure and testable
- [ ] Service layer has no React dependencies
- [ ] Component integration is minimal (<20 lines)
- [ ] Code coverage >90% for new utilities
- [ ] No ESLint warnings

### Performance
- [ ] No noticeable performance degradation
- [ ] Coordinate conversion <10ms for typical page (50 areas)
- [ ] No memory leaks

### Maintainability
- [ ] All functions have JSDoc comments
- [ ] Type definitions for all complex objects
- [ ] Clear separation of concerns
- [ ] Easy to add new coordinate systems (e.g., 'rem', 'em')

---

## Future Enhancements

### Phase 2 (Post-refactoring)
1. **Add coordinate system abstraction**
   - Support for multiple unit types (rem, em, vh, vw)
   - Pluggable conversion strategies

2. **Optimize performance**
   - Memoization for repeated conversions
   - Web Worker for large area processing

3. **Enhanced error handling**
   - Error boundaries at component level
   - User-friendly error messages
   - Automatic recovery mechanisms

4. **Developer experience**
   - TypeScript migration for type safety
   - Visual debugging tools for coordinates
   - Automated coordinate validation in dev mode

---

## References

- Current implementation: `src/components/Studio/Studio.jsx:216-354`
- Related utilities: `src/utils/studio.js`, `src/utils/ocr.js`
- Coordinate system documentation: `CLAUDE.md` (Studio section)
- Similar patterns: `src/utils/book.js` (coordinate conversions for book reader)

---

## Appendix A: Current Function Comparison

| Feature | Old Version | Current Version | Proposed Version |
|---------|-------------|-----------------|------------------|
| Safety checks | ✅ Yes | ❌ No | ✅ Yes |
| Metadata preservation | ✅ Yes | ❌ No | ✅ Yes |
| _updated flag | ✅ Yes | ❌ No | ✅ Yes |
| Testability | ❌ No | ❌ No | ✅ Yes |
| Performance optimization | ✅ Yes | ❌ No | ✅ Yes |
| Error handling | ⚠️ Partial | ❌ No | ✅ Comprehensive |
| Code length | ❌ ~100 lines | ✅ ~35 lines | ✅ ~20 lines (component) |
| Reusability | ❌ No | ❌ No | ✅ Yes |

---

## Appendix B: Example Usage After Refactoring

```javascript
// Component code becomes much simpler
import { processAreasForImageLoad, validateRefAccess } from './services/coordinate.service';

const onImageLoad = () => {
  // Safe validation
  const refValidation = validateRefAccess(studioEditorRef);

  if (!refValidation.isValid) {
    console.warn('Image load skipped:', refValidation.error);
    return;
  }

  // Business logic in service layer
  const processedAreas = processAreasForImageLoad(
    areas,
    areasProperties,
    studioEditorRef
  );

  // Simple state update
  setAreas(processedAreas);
};

// Utility can be reused elsewhere
import { convertPercentageToPixels } from '../../utils/coordinates';

// In another component
const pixelCoords = convertPercentageToPixels(
  { x: 50, y: 50, width: 25, height: 25 },
  { clientWidth: 800, clientHeight: 600 }
);
```

---

**End of Document**
