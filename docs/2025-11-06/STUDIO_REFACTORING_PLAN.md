# Studio Component Refactoring Plan

## Executive Summary
The Studio component is a complex educational content authoring tool that spans ~875 lines of code with multiple responsibilities including page management, area selection, OCR processing, coordinate conversions, and composite block creation. This plan outlines a systematic approach to refactor it into a more maintainable, testable, and scalable architecture.

---

## Current State Analysis

### Component Structure
```
Studio.jsx (875 lines)
├── StudioThumbnails
├── StudioEditor
│   ├── ImageActions
│   └── StudioAreaSelector
├── StudioActions
├── StudioCompositeBlocks
├── StudioStickyToolbar
└── LanguageSwitcher
```

### Key Responsibilities
1. **Page Management** - Navigate between book pages, track active page
2. **Area Selection** - Create/edit rectangular areas on pages for content blocks
3. **Coordinate Management** - Convert between pixel and percentage coordinates
4. **OCR Processing** - Extract text from selected areas
5. **Block Authoring** - Create educational content blocks with metadata
6. **Composite Blocks** - Group multiple blocks into reusable components
7. **Virtual Blocks** - Manage educational block types (Recalls, Quizzes, etc.)
8. **State Synchronization** - Keep areas and areasProperties in sync
9. **Tab Management** - Handle left/right column tab navigation
10. **Auto-generation** - Generate content automatically for sub-objects

### Critical Issues

#### 1. Component Complexity (Severity: High)
- **875 lines** in a single component
- **17+ useState hooks** managing interdependent state
- **Multiple useEffect hooks** with complex dependencies
- **Cognitive load** - difficult to understand and modify

#### 2. State Management (Severity: High)
- **Deeply nested state** - `areas[pageIndex][areaIndex]`
- **State synchronization issues** - `areas` and `areasProperties` can get out of sync
- **Mutation risks** - Complex state updates prone to bugs
- **Coordinate metadata** - `_unit`, `_updated`, `_percentX` scattered in area objects

#### 3. Business Logic in Component (Severity: High)
- Coordinate conversion logic embedded in component
- OCR processing mixed with UI logic
- Area manipulation spread across multiple functions
- Difficult to test in isolation

#### 4. Prop Drilling (Severity: Medium)
- 15+ props passed through multiple component levels
- Callback functions passed down 3+ levels deep
- Makes component refactoring risky

#### 5. Code Duplication (Severity: Medium)
- Similar logic for `areas` and `compositeBlocks`
- Repeated area property updates
- Duplicate coordinate calculations

#### 6. Magic Values (Severity: Low)
- String literals for tab names
- Hard-coded delays (10ms, 20ms, 50ms)
- Magic numbers in coordinate calculations

---

## Refactoring Strategy

### Phase 1: Preparation & Foundation (Week 1)
**Goal:** Set up infrastructure without breaking existing functionality

#### 1.1 Create Type Definitions
**Files to create:**
- `src/components/Studio/types/studio.types.js` or `.ts`

**Tasks:**
- Define `Area` type
- Define `AreaProperty` type
- Define `VirtualBlock` type
- Define `CompositeBlock` type
- Define `CoordinateUnit` enum
- Define `TabConfig` type

**Acceptance Criteria:**
- All Studio data structures have clear type definitions
- JSDocs added for all types
- Examples provided for complex types

#### 1.2 Extract Constants
**Files to create:**
- `src/components/Studio/constants/tabs.constants.js`
- `src/components/Studio/constants/studio.constants.js`

**Tasks:**
- Extract tab names (RECALLS, MICRO_LEARNING, etc.)
- Extract timeout values
- Extract coordinate conversion constants
- Extract default values

**Example:**
```javascript
// tabs.constants.js
export const TAB_NAMES = {
  RECALLS: "Recalls",
  MICRO_LEARNING: "Micro Learning",
  ENRICHING_CONTENT: "Enriching Content",
  CHECK_YOURSELF: "Check Yourself",
  ILLUSTRATIVE_INTERACTIONS: "Illustrative Interactions",
};

export const TOOLBAR_TABS = {
  BLOCK_AUTHORING: "Block Authoring",
  COMPOSITE_BLOCKS: "Composite Blocks",
  TABLE_OF_CONTENTS: "Table Of Contents",
  GLOSSARY_KEYWORDS: "Glossary & keywords",
};
```

---

### Phase 2: State Management Refactoring (Week 2)

#### 2.1 Create Custom Hooks for State Logic

**Hook 1: usePageManagement**
```javascript
// src/components/Studio/hooks/usePageManagement.js
export const usePageManagement = (pages, subObject) => {
  const [activePageIndex, setActivePageIndex] = useState(/* logic */);

  const navigateToPage = (index) => { /* logic */ };
  const activePageId = pages?.[activePageIndex]?._id;

  return {
    activePageIndex,
    activePageId,
    navigateToPage,
  };
};
```

**Hook 2: useAreaManagement**
```javascript
// src/components/Studio/hooks/useAreaManagement.js
export const useAreaManagement = (pages, activePageIndex) => {
  const [areas, setAreas] = useState(/* logic */);
  const [areasProperties, setAreasProperties] = useState(/* logic */);

  const updateArea = (pageIndex, areaIndex, updates) => { /* logic */ };
  const deleteArea = (pageIndex, areaIndex) => { /* logic */ };
  const addArea = (pageIndex, area) => { /* logic */ };

  return {
    areas,
    areasProperties,
    updateArea,
    deleteArea,
    addArea,
    setAreas,
    setAreasProperties,
  };
};
```

**Hook 3: useCoordinateConversion**
```javascript
// src/components/Studio/hooks/useCoordinateConversion.js
export const useCoordinateConversion = (
  areas,
  setAreas,
  activePageIndex,
  imageRef
) => {
  const convertPercentageToPx = () => { /* logic */ };
  const convertPxToPercentage = () => { /* logic */ };

  return {
    convertPercentageToPx,
    convertPxToPercentage,
  };
};
```

**Hook 4: useCompositeBlocks**
```javascript
// src/components/Studio/hooks/useCompositeBlocks.js
export const useCompositeBlocks = () => {
  const [compositeBlocks, setCompositeBlocks] = useState(/* logic */);

  const updateCompositeBlock = (id, key, value) => { /* logic */ };
  const deleteCompositeBlock = (id) => { /* logic */ };
  const processCompositeBlock = async (id, typeOfLabel) => { /* logic */ };

  return {
    compositeBlocks,
    updateCompositeBlock,
    deleteCompositeBlock,
    processCompositeBlock,
    setCompositeBlocks,
  };
};
```

**Hook 5: useVirtualBlocks**
```javascript
// src/components/Studio/hooks/useVirtualBlocks.js
export const useVirtualBlocks = (pages, subObject, activePageIndex) => {
  const [virtualBlocks, setVirtualBlocks] = useState(/* logic */);
  const [showVB, setShowVB] = useState(false);

  const toggleVirtualBlocks = () => { /* logic */ };
  const updateVirtualBlock = (value) => { /* logic */ };

  return {
    virtualBlocks,
    showVB,
    toggleVirtualBlocks,
    updateVirtualBlock,
  };
};
```

#### 2.2 Create Context for Shared State

**File:** `src/components/Studio/context/StudioContext.jsx`

```javascript
const StudioContext = createContext();

export const StudioProvider = ({ children, initialProps }) => {
  const pageManagement = usePageManagement(/* ... */);
  const areaManagement = useAreaManagement(/* ... */);
  const coordinateConversion = useCoordinateConversion(/* ... */);
  const compositeBlocks = useCompositeBlocks(/* ... */);
  const virtualBlocks = useVirtualBlocks(/* ... */);

  const value = {
    ...pageManagement,
    ...areaManagement,
    ...coordinateConversion,
    ...compositeBlocks,
    ...virtualBlocks,
    // Other shared state
  };

  return (
    <StudioContext.Provider value={value}>
      {children}
    </StudioContext.Provider>
  );
};

export const useStudioContext = () => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudioContext must be used within StudioProvider');
  }
  return context;
};
```

---

### Phase 3: Business Logic Extraction (Week 3)

#### 3.1 Create Services for Business Logic

**Service 1: CoordinateService**
```javascript
// src/components/Studio/services/CoordinateService.js
export class CoordinateService {
  static percentageToPx(area, containerDimensions) {
    // Pure function for coordinate conversion
  }

  static pxToPercentage(area, containerDimensions) {
    // Pure function for coordinate conversion
  }

  static addMetadata(area, unit = 'percentage') {
    // Add _unit, _percentX, etc.
  }

  static preserveMetadata(area, existingArea) {
    // Preserve metadata during updates
  }
}
```

**Service 2: AreaService**
```javascript
// src/components/Studio/services/AreaService.js
export class AreaService {
  static createArea(coordinates, color, type) {
    // Factory function for creating areas
  }

  static updateAreaProperty(areas, pageIndex, areaIndex, property) {
    // Immutable update logic
  }

  static deleteArea(areas, pageIndex, areaIndex) {
    // Immutable delete logic
  }

  static syncAreasWithProperties(areas, areasProperties, pageIndex) {
    // Synchronization logic
  }
}
```

**Service 3: OCRService**
```javascript
// src/components/Studio/services/OCRService.js
export class OCRService {
  static async extractText(language, image) {
    // OCR processing
  }

  static extractCoordinates(area, naturalDimensions) {
    // Coordinate text extraction
  }

  static async processArea(area, language, typeOfLabel) {
    // Combined processing logic
  }
}
```

**Service 4: ImageProcessingService**
```javascript
// src/components/Studio/services/ImageProcessingService.js
export class ImageProcessingService {
  static extractImage(canvasRef, imageRef, area) {
    // Image extraction logic
  }

  static cropSelectedArea(canvasRef, imageRef, coordinates) {
    // Cropping logic
  }
}
```

#### 3.2 Extract Utility Functions
**File:** `src/components/Studio/utils/studioHelpers.js`

```javascript
export const getActivePageData = (pages, activePageIndex) => { /* ... */ };
export const initializeAreas = (pages, types) => { /* ... */ };
export const initializeAreasProperties = (pages, types) => { /* ... */ };
export const shouldOpenModal = (typeOfLabel) => { /* ... */ };
```

---

### Phase 4: Component Decomposition (Week 4)

#### 4.1 Break Down Studio Component

**New Component Structure:**
```
Studio/ (Container)
├── StudioProvider (Context Provider)
├── StudioLayout
│   ├── StudioLeftPanel
│   │   ├── StudioThumbnails
│   │   └── StudioTabContent (Lists)
│   ├── StudioCenterPanel
│   │   ├── StudioToolbar
│   │   ├── StudioCanvas
│   │   └── StudioImageEditor
│   └── StudioRightPanel
│       ├── BlockAuthoringTab
│       │   └── StudioActions
│       ├── CompositeBlocksTab
│       │   └── StudioCompositeBlocks
│       ├── TableOfContentsTab
│       └── GlossaryTab
└── StudioCanvas (hidden canvas)
```

**Main Container (Studio.jsx):**
```javascript
// Simplified to ~100-150 lines
const Studio = (props) => {
  return (
    <StudioProvider initialProps={props}>
      <LanguageSwitcher />
      <StudioStickyToolbar />
      <StudioLayout />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </StudioProvider>
  );
};
```

#### 4.2 Create Feature-Specific Components

**Component 1: BlockAuthoringTab**
```javascript
// Handles all block authoring functionality
// Uses: useStudioContext()
// Renders: StudioActions, AreaAction components
```

**Component 2: StudioCanvas**
```javascript
// Handles image rendering and area selection
// Uses: useStudioContext(), useCoordinateConversion()
// Isolated image/canvas logic
```

**Component 3: AreaActionsList**
```javascript
// Extracted from StudioActions
// Renders list of areas with actions
// Handles drag-and-drop ordering
```

---

### Phase 5: Improve Error Handling & Testing (Week 5)

#### 5.1 Add Error Boundaries

**File:** `src/components/Studio/components/StudioErrorBoundary.jsx`
```javascript
export class StudioErrorBoundary extends React.Component {
  // Handle Studio-specific errors
  // Provide recovery options
  // Log errors for debugging
}
```

#### 5.2 Add Validation Layer

**File:** `src/components/Studio/validation/studioValidation.js`
```javascript
export const validateArea = (area) => { /* ... */ };
export const validateCoordinates = (coordinates) => { /* ... */ };
export const validateCompositeBlock = (block) => { /* ... */ };
```

#### 5.3 Create Unit Tests
- Test custom hooks in isolation
- Test services with pure functions
- Test components with React Testing Library
- Mock API calls and external dependencies

**Test Structure:**
```
__tests__/
├── hooks/
│   ├── usePageManagement.test.js
│   ├── useAreaManagement.test.js
│   └── useCoordinateConversion.test.js
├── services/
│   ├── CoordinateService.test.js
│   ├── AreaService.test.js
│   └── OCRService.test.js
└── components/
    ├── Studio.test.jsx
    └── StudioCanvas.test.jsx
```

---

### Phase 6: Performance Optimization (Week 6)

#### 6.1 Memoization Strategy
```javascript
// Memoize expensive calculations
const memoizedAreas = useMemo(() => {
  return computeAreas(areas, activePageIndex);
}, [areas, activePageIndex]);

// Memoize callbacks
const handleAreaChange = useCallback((newArea) => {
  updateArea(activePageIndex, areaIndex, newArea);
}, [activePageIndex, updateArea]);
```

#### 6.2 Lazy Loading
```javascript
// Lazy load heavy components
const StudioCompositeBlocks = lazy(() =>
  import('./StudioCompositeBlocks/StudioCompositeBlocks')
);
```

#### 6.3 Debounce Expensive Operations
```javascript
// Debounce OCR processing
const debouncedOCR = useDebouncedCallback(
  async (image, language) => {
    const text = await ocr(language, image);
    updateAreaProperty(idx, { text, loading: false });
  },
  300
);
```

---

## Migration Strategy

### Approach: Gradual Refactoring (Strangler Fig Pattern)

**Week 1-2: Non-Breaking Changes**
1. Add type definitions (no code changes)
2. Extract constants (search & replace)
3. Create utility functions (alongside existing code)
4. Add tests for new utilities

**Week 3-4: Incremental Extraction**
1. Create custom hooks (use alongside useState)
2. Gradually migrate state to custom hooks
3. Create services (use alongside existing logic)
4. Update one feature at a time

**Week 5-6: Context Migration**
1. Introduce StudioProvider (wrap existing Studio)
2. Migrate one component at a time to use context
3. Remove prop drilling incrementally
4. Verify each step with tests

**Week 7-8: Component Decomposition**
1. Extract sub-components one by one
2. Move related logic to new components
3. Keep old code commented until verified
4. Clean up after full migration

---

## Testing Strategy

### Unit Tests (80% coverage target)
- **Hooks:** Test state updates, side effects
- **Services:** Test business logic with various inputs
- **Utils:** Test pure functions
- **Components:** Test rendering and user interactions

### Integration Tests
- **Page Navigation:** Test page switching and state persistence
- **Area Selection:** Test creating, editing, deleting areas
- **OCR Flow:** Test image selection → OCR → text extraction
- **Composite Blocks:** Test creation, editing, submission

### E2E Tests (Critical Paths)
1. Create a new block on a page
2. Extract text from selected area
3. Create and submit composite block
4. Navigate between pages and tabs

---

## Risk Mitigation

### High-Risk Areas
1. **Coordinate Conversion Logic**
   - **Risk:** Breaking existing coordinate calculations
   - **Mitigation:** Extensive unit tests, side-by-side comparison

2. **State Synchronization**
   - **Risk:** Areas and areasProperties getting out of sync
   - **Mitigation:** Validation layer, immutable updates

3. **OCR Processing**
   - **Risk:** Breaking image extraction
   - **Mitigation:** Integration tests with sample images

### Rollback Plan
- Feature flags for new code paths
- Keep old code commented for 2 sprints
- Ability to disable context provider
- Git branches for each phase

---

## Success Metrics

### Code Quality
- [ ] Reduce main component from 875 → ~150 lines
- [ ] Maximum component size: 300 lines
- [ ] Test coverage: >80%
- [ ] ESLint/Prettier compliance: 100%

### Maintainability
- [ ] New feature can be added in <4 hours
- [ ] Bug fix time reduced by 50%
- [ ] New developer onboarding time: <2 days

### Performance
- [ ] Component re-render count reduced by 40%
- [ ] Initial load time: <200ms
- [ ] Page switch time: <100ms

### Developer Experience
- [ ] Clear separation of concerns
- [ ] Easy to locate specific functionality
- [ ] Reduced prop drilling (max 2 levels)
- [ ] Self-documenting code with types

---

## Post-Refactoring Improvements

### Future Enhancements (Nice-to-Have)
1. **TypeScript Migration**
   - Convert to .tsx files
   - Add strict type checking
   - Improve IDE autocomplete

2. **State Machine for Modes**
   - Use XState for mode management
   - Clear state transitions
   - Prevent invalid states

3. **Undo/Redo Functionality**
   - Implement command pattern
   - Track history of area changes

4. **Real-time Collaboration**
   - WebSocket integration
   - Conflict resolution
   - Multi-user editing

5. **Accessibility Improvements**
   - Keyboard navigation for areas
   - Screen reader support
   - ARIA labels

---

## Appendix

### A. File Structure (After Refactoring)
```
src/components/Studio/
├── Studio.jsx                           # Main container (~150 lines)
├── StudioLayout.jsx                     # Layout wrapper
├── context/
│   └── StudioContext.jsx                # Context provider
├── hooks/
│   ├── usePageManagement.js
│   ├── useAreaManagement.js
│   ├── useCoordinateConversion.js
│   ├── useCompositeBlocks.js
│   └── useVirtualBlocks.js
├── services/
│   ├── CoordinateService.js
│   ├── AreaService.js
│   ├── OCRService.js
│   └── ImageProcessingService.js
├── utils/
│   ├── studioHelpers.js
│   └── studioValidation.js
├── constants/
│   ├── tabs.constants.js
│   └── studio.constants.js
├── types/
│   └── studio.types.js
├── components/
│   ├── StudioLeftPanel/
│   ├── StudioCenterPanel/
│   ├── StudioRightPanel/
│   ├── BlockAuthoringTab/
│   ├── CompositeBlocksTab/
│   └── StudioErrorBoundary/
├── LanguageSwitcher/
├── StudioThumbnails/
├── StudioEditor/
├── StudioAreaSelector/
├── StudioActions/
├── StudioCompositeBlocks/
├── StudioStickyToolbar/
└── __tests__/
    ├── hooks/
    ├── services/
    └── components/
```

### B. Key Dependencies
- `react` - Core framework
- `@bmunozg/react-image-area` - Area selection
- `tesseract.js` - OCR processing
- `uuid` - ID generation
- `@mui/material` - UI components
- `@hello-pangea/dnd` - Drag and drop
- `zustand` - Global state (existing)

### C. Breaking Changes to Watch
1. Prop interface changes for Studio component
2. Context value structure
3. Area/AreaProperty object shape
4. Callback function signatures

### D. Resources
- [React Custom Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Context Performance](https://react.dev/reference/react/useContext#optimizing-re-renders-when-passing-objects-and-functions)
- [Strangler Fig Pattern](https://martinfowler.com/bliki/StranglerFigApplication.html)
- [Testing Library Best Practices](https://testing-library.com/docs/react-testing-library/intro/)

---

## Conclusion

This refactoring plan transforms the Studio component from a monolithic 875-line component into a modular, maintainable architecture. By following the phased approach, we minimize risk while steadily improving code quality, testability, and developer experience.

**Estimated Timeline:** 6-8 weeks
**Team Size:** 1-2 developers
**Risk Level:** Medium (with proper testing and gradual migration)

**Next Steps:**
1. Review and approve this plan
2. Set up initial project structure (Week 1)
3. Begin Phase 1 implementation
4. Weekly progress reviews
5. Adjust timeline as needed

