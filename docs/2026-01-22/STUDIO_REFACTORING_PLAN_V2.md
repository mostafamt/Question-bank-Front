# Studio Component Refactoring Plan v2

## Executive Summary

This document outlines the refactoring plan for `src/components/Studio/Studio.jsx`. The component has already undergone significant refactoring (reduced from 875 to 509 lines), but additional work is needed to complete the modularization effort.

### Current Status Overview

| Phase | Description | Status | Progress |
|-------|-------------|--------|----------|
| Phase 1 | Types & Constants | **Complete** | 100% |
| Phase 2 | Hooks & Context | In Progress | 60% |
| Phase 3 | Services & Utils | In Progress | 30% |
| Phase 4 | Sub-Components | Not Started | 0% |
| Phase 5 | TypeScript & Performance | Not Started | 0% |

---

## Table of Contents

1. [Current Architecture Analysis](#1-current-architecture-analysis)
2. [Pain Points & Technical Debt](#2-pain-points--technical-debt)
3. [Refactoring Phases](#3-refactoring-phases)
4. [Phase 2 Completion Plan](#4-phase-2-completion-plan)
5. [Phase 3 Completion Plan](#5-phase-3-completion-plan)
6. [Phase 4 Implementation Plan](#6-phase-4-implementation-plan)
7. [Phase 5 Future Enhancements](#7-phase-5-future-enhancements)
8. [Risk Mitigation](#8-risk-mitigation)
9. [Success Metrics](#9-success-metrics)

---

## 1. Current Architecture Analysis

### 1.1 File Structure

```
src/components/Studio/
├── Studio.jsx                    (509 lines - main component)
├── studio.module.scss            (styling)
│
├── types/
│   └── studio.types.js           (172 lines - JSDoc types) ✅
│
├── constants/                    ✅ COMPLETE
│   ├── tabs.constants.js         (tab configurations)
│   ├── studio.constants.js       (timeouts, defaults, storage keys)
│   └── index.js                  (barrel export)
│
├── hooks/                        ⚠️ PARTIAL
│   ├── usePageNavigation.js      ✅ Complete
│   ├── useAreaManagement.js      ✅ Mostly complete
│   ├── useCompositeBlocks.js     ✅ Mostly complete
│   ├── useVirtualBlocks.js       ⚠️ Needs expansion
│   ├── useStudioActions.js       ⚠️ Needs expansion
│   └── useStudioState.js         ⚠️ Placeholder
│
├── services/                     ⚠️ PARTIAL
│   ├── coordinate.service.js     ✅ Complete (382 lines, tested)
│   ├── styling.service.js        ⚠️ Needs review
│   └── __tests__/
│       └── coordinate.service.test.js ✅
│
├── utils/                        ⚠️ PARTIAL
│   ├── areaUtils.js              ⚠️ Needs review
│   └── coordinateUtils.js        ⚠️ Needs review
│
├── context/
│   └── StudioContext.jsx         ✅ Created, NOT integrated
│
├── components/                   ❌ EMPTY (Phase 4)
│
├── columns/                      (existing - column builders)
├── initializers/                 (data initialization)
├── LanguageSwitcher/             (sub-component)
├── StudioActions/                (sub-component)
├── StudioAreaSelector/           (sub-component)
├── StudioCompositeBlocks/        (sub-component)
├── StudioEditor/                 (sub-component)
├── StudioStickyToolbar/          (sub-component)
└── StudioThumbnails/             (sub-component)
```

### 1.2 Current State Management (14 useState hooks)

| State Variable | Purpose | Target Location |
|----------------|---------|-----------------|
| `virtualBlocks` | Educational block types | `useVirtualBlocks` |
| `language` | OCR language (eng/ara) | `useOCRSettings` (new) |
| `activeType` | Sub-object type being edited | `useSubObjectState` (new) |
| `typeOfActiveType` | Type of active type | `useSubObjectState` (new) |
| `loadingSubmit` | Form submission loading | `useAreaManagement` |
| `showStickyToolbar` | Sticky toolbar visibility | `useLayoutState` (new) |
| `colorIndex` | Color cycling for areas | `useAreaManagement` |
| `imageScaleFactor` | Image zoom level | `useLayoutState` (new) |
| `activeLeftTab` | Left column active tab | `useTabState` (new) |
| `activeRightTab` | Right column active tab | `useTabState` (new) |

### 1.3 Key Functions in Studio.jsx

| Function | Lines | Complexity | Target |
|----------|-------|------------|--------|
| `onPlayBlock` | ~25 | Medium | `useBlockPlayback` hook |
| `onChangeHandler` | ~15 | Low | `useAreaManagement` |
| `onChangeLabel` | ~40 | High | `useLabelManagement` hook |
| `navigateToBlock` | ~20 | Medium | `useBlockNavigation` hook |
| `useEffect` (3) | ~50 | Medium | Custom hooks |

---

## 2. Pain Points & Technical Debt

### 2.1 Critical Issues

| Issue | Severity | Impact | Solution |
|-------|----------|--------|----------|
| **Prop Drilling** | HIGH | 20+ props passed down 3+ levels | Integrate `StudioContext` |
| **State Sync** | HIGH | `areas` and `areasProperties` can get out of sync | Add validation layer |
| **No Context Integration** | HIGH | Context created but not used | Integrate in Phase 2 |

### 2.2 Medium Issues

| Issue | Severity | Impact | Solution |
|-------|----------|--------|----------|
| Modal Complexity | MEDIUM | Multiple modal types, nested callbacks | Extract modal handling |
| Component Size | MEDIUM | 509 lines still too large | Extract sub-components |
| Incomplete Hooks | MEDIUM | Some hooks are placeholders | Complete hook implementations |

### 2.3 Low Priority Issues

| Issue | Severity | Impact | Solution |
|-------|----------|--------|----------|
| Type Safety | LOW | JSDoc only, no runtime enforcement | Consider TypeScript (Phase 5) |
| OCR Coupling | LOW | Tightly coupled with component | Extract to service |
| Typos in API | LOW | `hightBlock`, `onClickToggleVirutalBlocks` | Fix during refactoring |

---

## 3. Refactoring Phases

### Phase Overview Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PHASE 1 (COMPLETE) ✅                     │
│  Types (studio.types.js) + Constants (tabs, studio)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  PHASE 2 (IN PROGRESS) ⚠️                    │
│  Hooks Completion + Context Integration                      │
│  - Complete useVirtualBlocks, useStudioActions              │
│  - Create useTabState, useLayoutState, useOCRSettings       │
│  - Integrate StudioContext into Studio.jsx                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  PHASE 3 (IN PROGRESS) ⚠️                    │
│  Services & Utils Completion                                 │
│  - Review and document existing services/utils              │
│  - Extract OCR logic to service                             │
│  - Create modal.service.js                                  │
│  - Create block.service.js                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PHASE 4 (PLANNED) ❌                      │
│  Sub-Component Extraction                                    │
│  - StudioLayout (main grid container)                       │
│  - StudioLeftPanel (thumbnails, tabs)                       │
│  - StudioRightPanel (block authoring, composite blocks)     │
│  - BlockAuthoringTab, CompositeBlocksTab, etc.              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PHASE 5 (FUTURE) ❌                       │
│  Performance & TypeScript                                    │
│  - TypeScript migration (optional)                          │
│  - React.memo, useMemo, useCallback optimization            │
│  - Lazy loading for heavy components                        │
│  - Error boundaries                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Phase 2 Completion Plan

### 4.1 Complete Existing Hooks

#### useVirtualBlocks.js (Current: 651 bytes)

**Current API:**
```javascript
{ showVB, setShowVB, onClickToggleVirutalBlocks }
```

**Target API:**
```javascript
{
  virtualBlocks,           // Array of virtual block definitions
  showVB,                  // Show/hide virtual blocks
  toggleVirtualBlocks,     // Renamed (fix typo)
  getVirtualBlockById,     // Find block by ID
  getVirtualBlocksByType,  // Filter by type (object/text)
  isVirtualBlockActive,    // Check if specific block is active
}
```

#### useStudioActions.js (Current: 633 bytes)

**Current API:**
```javascript
{ highlight, setHighlight, highlightedBlockId, hightBlock }
```

**Target API:**
```javascript
{
  highlight,               // Current highlight mode ('', 'hand')
  highlightedBlockId,      // Currently highlighted block
  highlightBlock,          // Renamed (fix typo)
  clearHighlight,          // Clear current highlight
  isBlockHighlighted,      // Check if specific block is highlighted
  toggleHighlightMode,     // Toggle between modes
}
```

### 4.2 Create New Hooks

#### useTabState.js (New)

```javascript
// Consolidates tab management logic
const useTabState = (initialLeftTab, initialRightTab) => {
  return {
    activeLeftTab,
    activeRightTab,
    setActiveLeftTab,
    setActiveRightTab,
    isLeftTabActive: (tabName) => boolean,
    isRightTabActive: (tabName) => boolean,
    resetTabs,
  };
};
```

#### useLayoutState.js (New)

```javascript
// Consolidates layout-related state
const useLayoutState = () => {
  return {
    showStickyToolbar,
    setShowStickyToolbar,
    imageScaleFactor,
    setImageScaleFactor,
    recalculateLayout,
  };
};
```

#### useOCRSettings.js (New)

```javascript
// Consolidates OCR-related state and logic
const useOCRSettings = () => {
  return {
    language,              // 'eng' | 'ara'
    setLanguage,
    languageCode,          // 'en' | 'ar' (derived)
    isRTL,                 // Right-to-left flag
    performOCR,            // Extract text from area
  };
};
```

#### useSubObjectState.js (New)

```javascript
// Consolidates sub-object editing state
const useSubObjectState = () => {
  return {
    activeType,
    setActiveType,
    typeOfActiveType,
    setTypeOfActiveType,
    clearSubObject,
    isEditingSubObject,
  };
};
```

### 4.3 Integrate StudioContext

**Step 1:** Update `StudioContext.jsx` to include new hooks

**Step 2:** Wrap Studio.jsx content with `StudioProvider`

**Step 3:** Replace prop drilling with `useStudioContext()` in child components

**Step 4:** Remove redundant props from component signatures

### 4.4 Phase 2 Tasks Checklist

- [ ] Complete `useVirtualBlocks` hook expansion
- [ ] Complete `useStudioActions` hook expansion
- [ ] Create `useTabState` hook
- [ ] Create `useLayoutState` hook
- [ ] Create `useOCRSettings` hook
- [ ] Create `useSubObjectState` hook
- [ ] Update `StudioContext.jsx` with all hooks
- [ ] Integrate `StudioProvider` into `Studio.jsx`
- [ ] Update child components to use context
- [ ] Fix typos (`hightBlock` → `highlightBlock`, `onClickToggleVirutalBlocks` → `toggleVirtualBlocks`)
- [ ] Add unit tests for new hooks
- [ ] Update JSDoc types for new APIs

---

## 5. Phase 3 Completion Plan

### 5.1 Review Existing Services

#### coordinate.service.js (✅ Complete)
- 382 lines with comprehensive tests
- Handles image load coordinate recalculation
- No changes needed

#### styling.service.js (⚠️ Needs Review)
- Document existing functionality
- Add unit tests if missing
- Ensure consistent API

### 5.2 Create New Services

#### ocr.service.js (New)

```javascript
// Extract OCR logic from component
export const ocrService = {
  extractText: async (imageData, language) => string,
  detectLanguage: (text) => 'eng' | 'ara',
  processResults: (results) => ProcessedText,
  cancelPending: () => void,
};
```

#### modal.service.js (New)

```javascript
// Centralize modal management
export const modalService = {
  openEditModal: (blockId, props) => void,
  openPlayModal: (area, areaProps) => void,
  openSubObjectModal: (type, props) => void,
  closeAllModals: () => void,
  getModalState: () => ModalState,
};
```

#### block.service.js (New)

```javascript
// Block manipulation operations
export const blockService = {
  findBlockById: (pages, blockId) => Block | null,
  findBlocksByPage: (pageId) => Block[],
  validateBlock: (block) => ValidationResult,
  transformBlockForSubmit: (block) => ServerBlock,
  transformBlockFromServer: (serverBlock) => Block,
};
```

### 5.3 Review Existing Utils

#### areaUtils.js (⚠️ Needs Review)
- Document all exported functions
- Add unit tests
- Ensure no duplication with services

#### coordinateUtils.js (⚠️ Needs Review)
- Document all exported functions
- Ensure alignment with coordinate.service.js
- Add unit tests

### 5.4 Phase 3 Tasks Checklist

- [ ] Review and document `styling.service.js`
- [ ] Add tests for `styling.service.js`
- [ ] Create `ocr.service.js`
- [ ] Create `modal.service.js`
- [ ] Create `block.service.js`
- [ ] Review and document `areaUtils.js`
- [ ] Review and document `coordinateUtils.js`
- [ ] Add unit tests for all utils
- [ ] Update imports in hooks to use services
- [ ] Remove duplicated logic from Studio.jsx

---

## 6. Phase 4 Implementation Plan

### 6.1 Component Decomposition Strategy

```
Studio.jsx (Target: <150 lines)
│
├── StudioLayout.jsx
│   ├── StudioHeader.jsx (sticky toolbar, mode switch)
│   ├── StudioLeftColumn.jsx
│   │   ├── StudioThumbnails (existing)
│   │   └── LeftColumnTabs.jsx
│   │       ├── RecallsTab.jsx
│   │       ├── MicroLearningTab.jsx
│   │       ├── EnrichingContentTab.jsx
│   │       └── CheckYourselfTab.jsx
│   │
│   ├── StudioMainArea.jsx
│   │   ├── StudioEditor (existing)
│   │   └── StudioAreaSelector (existing)
│   │
│   └── StudioRightColumn.jsx
│       └── RightColumnTabs.jsx
│           ├── BlockAuthoringTab.jsx
│           ├── CompositeBlocksTab.jsx
│           ├── TableOfContentsTab.jsx
│           ├── GlossaryTab.jsx
│           └── IllustrativeInteractionsTab.jsx
│
└── StudioModals.jsx (modal orchestration)
```

### 6.2 Extraction Priority

| Component | Priority | Reason |
|-----------|----------|--------|
| StudioLayout | HIGH | Reduces main component size significantly |
| StudioLeftColumn | HIGH | Contains complex tab logic |
| StudioRightColumn | HIGH | Contains block authoring logic |
| BlockAuthoringTab | MEDIUM | Most complex tab |
| StudioModals | MEDIUM | Centralizes modal handling |
| Individual tabs | LOW | Can be done incrementally |

### 6.3 Phase 4 Tasks Checklist

- [ ] Create `StudioLayout.jsx` component
- [ ] Extract `StudioLeftColumn.jsx`
- [ ] Extract `StudioRightColumn.jsx`
- [ ] Create `LeftColumnTabs.jsx` container
- [ ] Create `RightColumnTabs.jsx` container
- [ ] Extract `BlockAuthoringTab.jsx`
- [ ] Extract `CompositeBlocksTab.jsx`
- [ ] Create `StudioModals.jsx` orchestrator
- [ ] Update Studio.jsx to use new components
- [ ] Ensure all components use StudioContext
- [ ] Add prop-types or TypeScript types
- [ ] Write integration tests

---

## 7. Phase 5 Future Enhancements

### 7.1 TypeScript Migration (Optional)

**Scope:**
- Convert JSDoc types to TypeScript interfaces
- Add strict type checking
- Convert `.jsx` files to `.tsx`

**Approach:**
1. Create `*.d.ts` files first
2. Gradually convert files starting with utils/services
3. Convert hooks
4. Convert components last

### 7.2 Performance Optimization

**Memoization Strategy:**
```javascript
// Expensive computations
const memoizedColumns = useMemo(() => buildLeftColumns(...), [dependencies]);

// Callback stability
const stableOnChange = useCallback((areas) => {...}, [dependencies]);

// Component memoization
const MemoizedTab = React.memo(BlockAuthoringTab);
```

**Lazy Loading:**
```javascript
// Heavy components
const StudioEditor = lazy(() => import('./StudioEditor'));
const CompositeBlocksTab = lazy(() => import('./tabs/CompositeBlocksTab'));
```

### 7.3 Error Boundaries

```javascript
// Per-section error boundaries
<ErrorBoundary fallback={<LeftColumnError />}>
  <StudioLeftColumn />
</ErrorBoundary>

<ErrorBoundary fallback={<EditorError />}>
  <StudioEditor />
</ErrorBoundary>
```

### 7.4 Phase 5 Tasks Checklist

- [ ] Evaluate TypeScript migration feasibility
- [ ] Identify performance bottlenecks (React DevTools Profiler)
- [ ] Add React.memo to appropriate components
- [ ] Add useMemo for expensive computations
- [ ] Add useCallback for stable callbacks
- [ ] Implement lazy loading for heavy components
- [ ] Add error boundaries
- [ ] Set up performance monitoring
- [ ] Create performance benchmarks

---

## 8. Risk Mitigation

### 8.1 Refactoring Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing functionality | MEDIUM | HIGH | Comprehensive test coverage, feature flags |
| State synchronization bugs | HIGH | HIGH | Centralized state via context, validation |
| Performance regression | LOW | MEDIUM | Performance benchmarks, profiling |
| Merge conflicts with parallel work | MEDIUM | MEDIUM | Small PRs, frequent rebases |

### 8.2 Mitigation Strategies

#### Strangler Fig Pattern
- Never delete old code until new code is proven
- Use feature flags to toggle between old/new implementations
- Gradual migration with fallback capability

#### Testing Strategy
```
Unit Tests (jest)
├── Services (100% coverage target)
├── Hooks (90% coverage target)
└── Utils (100% coverage target)

Integration Tests
├── Component rendering
├── User interactions
└── State management

E2E Tests (if applicable)
├── Critical user flows
└── Regression tests
```

#### Code Review Checklist
- [ ] All new code has tests
- [ ] No regressions in existing functionality
- [ ] Types are properly defined
- [ ] No prop drilling introduced
- [ ] Performance considerations addressed

---

## 9. Success Metrics

### 9.1 Quantitative Metrics

| Metric | Current | Target | Phase |
|--------|---------|--------|-------|
| Studio.jsx lines | 509 | <150 | Phase 4 |
| Props passed | 20+ | <5 | Phase 2 |
| Test coverage (hooks) | ~40% | >90% | Phase 2-3 |
| Test coverage (services) | ~80% | >95% | Phase 3 |
| Cyclomatic complexity | High | Low | Phase 4 |

### 9.2 Qualitative Metrics

- [ ] New developers can understand component structure quickly
- [ ] Adding new features requires minimal changes to existing code
- [ ] Bug fixes are isolated and don't cause regressions
- [ ] Code reuse is maximized through hooks and services
- [ ] Documentation is complete and up-to-date

### 9.3 Definition of Done

**Phase 2 Complete When:**
- All hooks are fully implemented with tests
- StudioContext is integrated
- Prop drilling is eliminated
- No regressions in functionality

**Phase 3 Complete When:**
- All services are documented and tested
- Utils are reviewed and deduplicated
- Studio.jsx has no inline business logic

**Phase 4 Complete When:**
- Studio.jsx is <150 lines
- All sub-components use context
- Integration tests pass
- No visual regressions

**Phase 5 Complete When:**
- Performance benchmarks show no regression
- Error boundaries catch component failures gracefully
- TypeScript migration complete (if chosen)

---

## Appendix A: File Changes Summary

### Files to Create
- `hooks/useTabState.js`
- `hooks/useLayoutState.js`
- `hooks/useOCRSettings.js`
- `hooks/useSubObjectState.js`
- `services/ocr.service.js`
- `services/modal.service.js`
- `services/block.service.js`
- `components/StudioLayout.jsx`
- `components/StudioLeftColumn.jsx`
- `components/StudioRightColumn.jsx`
- `components/tabs/BlockAuthoringTab.jsx`
- `components/tabs/CompositeBlocksTab.jsx`
- `components/StudioModals.jsx`

### Files to Modify
- `Studio.jsx` (major reduction)
- `hooks/useVirtualBlocks.js` (expand)
- `hooks/useStudioActions.js` (expand)
- `context/StudioContext.jsx` (add new hooks)
- All child components (use context)

### Files to Delete (After Migration)
- None immediately (use strangler fig pattern)
- `Studio.jsx.backup` (after Phase 4 complete)

---

## Appendix B: Quick Reference

### Import Patterns (After Phase 2)

```javascript
// In child components
import { useStudioContext } from '../context/StudioContext';

const MyComponent = () => {
  const {
    pageManagement,
    areaManagement,
    tabState,
    layoutState,
  } = useStudioContext();

  // Use context values directly
};
```

### Hook Usage Patterns

```javascript
// Page navigation
const { activePageIndex, changePageById } = usePageNavigation(pages);

// Area management
const { areas, areasProperties, updateAreaProperty } = useAreaManagement(/*...*/);

// Tab state
const { activeLeftTab, setActiveLeftTab } = useTabState();
```

---

*Last Updated: 2026-01-20*
*Author: Claude Code Assistant*
*Version: 2.0*
