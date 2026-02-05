# Studio Component Redesign Plan

> **Date:** 2026-02-05
> **Scope:** Full redesign of `src/components/Studio/` and all subcomponents
> **Current Size:** ~8,100 lines across 56 files

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Architecture & Pain Points](#2-current-architecture--pain-points)
3. [Design Principles](#3-design-principles)
4. [Design Patterns Used](#4-design-patterns-used)
5. [New Architecture Overview](#5-new-architecture-overview)
6. [Phase 1 — Unified Data Model](#phase-1--unified-data-model)
7. [Phase 2 — State Machine for Studio Modes](#phase-2--state-machine-for-studio-modes)
8. [Phase 3 — Strategy Pattern for Label Processing](#phase-3--strategy-pattern-for-label-processing)
9. [Phase 4 — Command Pattern for Undo/Redo](#phase-4--command-pattern-for-undoredo)
10. [Phase 5 — Compound Components for Area Selector](#phase-5--compound-components-for-area-selector)
11. [Phase 6 — Builder Pattern for Column Configuration](#phase-6--builder-pattern-for-column-configuration)
12. [Phase 7 — Context Redesign & Dependency Injection](#phase-7--context-redesign--dependency-injection)
13. [Phase 8 — Component Decomposition](#phase-8--component-decomposition)
14. [Phase 9 — Testing Strategy](#phase-9--testing-strategy)
15. [Phase 10 — Performance Optimization](#phase-10--performance-optimization)
16. [New Directory Structure](#new-directory-structure)
17. [Migration Strategy](#migration-strategy)
18. [Risk Assessment](#risk-assessment)

---

## 1. Executive Summary

The Studio component is a content authoring tool for creating educational blocks on book pages. While the existing Phase 1 refactoring laid good groundwork (constants, types, services), the component still suffers from:

- **Dual-array state** (`areas[]` + `areasProperties[]`) that must stay in sync manually
- **18-prop drilling** into `StudioAreaSelector`
- **4 implicit rendering modes** in a single component with no formal state management
- **~100-line monolithic functions** mixing OCR, modals, and type detection
- **Infinite loop risks** in `useStudioColumns` due to complex memoization

This plan introduces **6 design patterns** to address these issues systematically across **10 phases**, each independently shippable.

---

## 2. Current Architecture & Pain Points

### Current Data Flow

```
External Props (pages, types, handleSubmit)
    │
    ▼
Studio.jsx (392 lines, 8 hooks, 7 state vars, 4 refs)
    │
    ├─ useAreaManagement ──→ areas[][] + areasProperties[][] (DUAL ARRAYS)
    ├─ useCompositeBlocks ──→ compositeBlocks (duplicates area logic)
    ├─ useLabelManagement ──→ 100-line onChangeLabel() (mixed concerns)
    ├─ useStudioColumns ──→ leftColumns/rightColumns (infinite loop risk)
    │
    ▼
StudioLayout (3-column grid)
    │
    ├─ Left:  Thumbnails / Lists
    ├─ Center: StudioAreaSelector (404 lines, 18 props, 4 implicit modes)
    └─ Right:  StudioActions / CompositeBlocks
```

### Critical Pain Points

| # | Problem | Where | Impact |
|---|---------|-------|--------|
| 1 | Dual-array sync (`areas` + `areasProperties`) | `useAreaManagement` | Data corruption risk |
| 2 | 18-prop drilling | `StudioAreaSelector` | Maintenance nightmare |
| 3 | 4 implicit modes with no state machine | `StudioAreaSelector` | Bug-prone conditionals |
| 4 | 100-line `onChangeLabel()` | `useLabelManagement` | Untestable, mixed concerns |
| 5 | Infinite loop risk in column building | `useStudioColumns` | Runtime crashes |
| 6 | No undo/redo for area operations | `useAreaManagement` | Poor UX |
| 7 | Duplicated area logic in composite blocks | `useCompositeBlocks` | Code duplication |
| 8 | Typos in identifiers (`hightBlock`, `virutalBlocks`) | Multiple files | Confusing API |

---

## 3. Design Principles

1. **Single Source of Truth** — One unified `Block` model, not parallel arrays
2. **Explicit over Implicit** — State machines over boolean flags, strategies over switch statements
3. **Composition over Inheritance** — Compound components, hooks composition
4. **Independently Testable** — Every service, hook, and strategy testable in isolation
5. **Incrementally Shippable** — Each phase works without requiring the next
6. **Minimal API Surface** — Components receive context, not 18 individual props

---

## 4. Design Patterns Used

### 4.1 State Machine Pattern (Phase 2)
**Problem:** `StudioAreaSelector` uses implicit mode detection (`isReaderMode`, `readOnly`, `hand`, default edit`) via scattered boolean flags.

**Solution:** Explicit state machine with `useReducer` defining valid states, transitions, and guards.

```
┌─────────┐  openStudio  ┌──────────┐  toggleHand  ┌──────────┐
│  READER  │────────────→│  EDITING  │────────────→│   HAND   │
└─────────┘              └──────────┘              └──────────┘
     ▲                        │                         │
     │         setReadOnly    ▼                         │
     │                   ┌──────────┐                   │
     └───────────────────│ READONLY │←──────────────────┘
                         └──────────┘        cancel
```

**Why:** Eliminates impossible states, makes transitions explicit, simplifies conditionals from nested `if/else` to a single `switch(state)`.

---

### 4.2 Strategy Pattern (Phase 3)
**Problem:** `useLabelManagement.onChangeLabel()` is a ~100-line function with nested conditionals handling text, image, object, coordinate, and rich-text types.

**Solution:** Define a `LabelStrategy` interface. Each type gets its own strategy class.

```
LabelProcessor
    │
    ├─ TextLabelStrategy      → OCR extraction → plain text
    ├─ ImageLabelStrategy     → Image cropping → base64
    ├─ ObjectLabelStrategy    → Open SubObject modal → nested form
    ├─ CoordinateLabelStrategy → Format coordinates → string
    └─ RichTextLabelStrategy  → Open Quill modal → HTML
```

**Why:** Adding a new label type = adding one file, not modifying a 100-line function. Each strategy is independently testable.

---

### 4.3 Command Pattern (Phase 4)
**Problem:** Area operations (create, move, resize, delete, reorder) are irreversible. Users cannot undo mistakes.

**Solution:** Wrap every area mutation in a `Command` object with `execute()` and `undo()`. Maintain a command history stack.

```
CommandHistory
    │
    ├─ CreateAreaCommand    { execute: addArea,    undo: removeArea }
    ├─ DeleteAreaCommand    { execute: markDeleted, undo: restore }
    ├─ MoveAreaCommand      { execute: setCoords,  undo: restoreCoords }
    ├─ UpdatePropertyCommand{ execute: setProp,    undo: restoreProp }
    └─ ReorderAreasCommand  { execute: reorder,    undo: restoreOrder }
```

**Why:** Gives users Ctrl+Z / Ctrl+Y. Each command is a self-contained unit of work that can be tested independently.

---

### 4.4 Compound Component Pattern (Phase 5)
**Problem:** `StudioAreaSelector` (404 lines) handles 4 rendering modes in one file with 18 props.

**Solution:** Split into compound components that share context implicitly.

```jsx
<AreaSelector>
  <AreaSelector.EditMode />     {/* Drawing new areas */}
  <AreaSelector.ReaderMode />   {/* Clickable areas for playback */}
  <AreaSelector.HandMode />     {/* Select existing blocks */}
  <AreaSelector.ReadOnlyMode /> {/* Display only */}
</AreaSelector>
```

**Why:** Each mode is self-contained. The parent `AreaSelector` provides shared context (image, areas, scale). Modes don't share rendering logic and can evolve independently.

---

### 4.5 Builder Pattern (Phase 6)
**Problem:** `useStudioColumns` (309 lines) builds tab configurations with complex memoization, causing infinite loop risks.

**Solution:** A `ColumnBuilder` with fluent API that constructs configurations declaratively.

```javascript
const columns = new ColumnBuilder()
  .forMode("studio")
  .forSide("left")
  .addTab("thumbnails", ThumbnailsTab)
  .addTab("tableOfContents", TOCTab)
  .when(hasCompositeTypes, b => b.addTab("compositeBlocks", CompositeTab))
  .build();
```

**Why:** Separates column construction from React lifecycle. Pure function = no re-render loops. Configuration changes are declarative and readable.

---

### 4.6 Facade Pattern (Phase 7)
**Problem:** `StudioContext` aggregates 13 hooks into one mega-context, causing unnecessary re-renders when any value changes.

**Solution:** Split into focused contexts behind a facade hook.

```
useStudio()           ← Facade (composes focused hooks)
    │
    ├─ useStudioBlocks()     ← Block CRUD operations
    ├─ useStudioMode()       ← State machine (reader/edit/hand/readonly)
    ├─ useStudioNavigation() ← Page navigation & thumbnails
    ├─ useStudioLayout()     ← Zoom, toolbar, column config
    └─ useStudioOCR()        ← OCR language & operations
```

**Why:** Components subscribe only to the context slices they use. Changing OCR language doesn't re-render thumbnails. The facade provides a unified API for components that need everything.

---

## 5. New Architecture Overview

### Target Data Flow

```
External Props (pages, types, onSubmit)
    │
    ▼
┌──────────────────────────────────────────┐
│  StudioProvider (Facade)                 │
│                                          │
│  ┌─────────────┐  ┌──────────────────┐   │
│  │ BlocksCtx   │  │ ModeCtx          │   │
│  │ (blocks,    │  │ (state machine)  │   │
│  │  commands)  │  │                  │   │
│  └─────────────┘  └──────────────────┘   │
│                                          │
│  ┌─────────────┐  ┌──────────────────┐   │
│  │ NavigationCtx│  │ LayoutCtx       │   │
│  │ (pages,     │  │ (zoom, columns, │   │
│  │  activePage)│  │  toolbar)        │   │
│  └─────────────┘  └──────────────────┘   │
│                                          │
│  ┌─────────────┐  ┌──────────────────┐   │
│  │ OCRCtx      │  │ LabelProcessor  │   │
│  │ (language,  │  │ (strategies)     │   │
│  │  operations)│  │                  │   │
│  └─────────────┘  └──────────────────┘   │
└──────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────┐
│  StudioShell                             │
│  ┌──────┬─────────────────┬──────────┐   │
│  │ Left │     Center      │  Right   │   │
│  │      │                 │          │   │
│  │ Tabs │  AreaSelector   │  Tabs    │   │
│  │      │  (compound)     │          │   │
│  └──────┴─────────────────┴──────────┘   │
└──────────────────────────────────────────┘
```

---

## Phase 1 — Unified Data Model

> **Goal:** Replace dual arrays (`areas[][]` + `areasProperties[][]`) with a single `Block` model.
> **Files changed:** `types/`, `hooks/useAreaManagement.js`, `hooks/useCompositeBlocks.js`, `services/block.service.js`, `services/coordinate.service.js`

### 1.1 The Problem

Currently two parallel arrays must be kept in sync manually:

```javascript
// Current — two arrays indexed identically
areas[pageIndex][areaIndex] = { x, y, width, height, unit, ... }
areasProperties[pageIndex][areaIndex] = { id, blockId, type, label, value, ... }
```

Any operation that adds, removes, or reorders items must update both arrays atomically or risk data corruption.

### 1.2 New Unified Block Model

```javascript
/**
 * @typedef {Object} Block
 * @property {string} id - Client-side UUID
 * @property {string|null} blockId - Server-side ID (null if unsaved)
 * @property {Coordinates} coordinates - Position & size
 * @property {string} type - Content type (e.g., "text", "image")
 * @property {string} label - Selected label/field name
 * @property {*} value - Content value
 * @property {BlockMeta} meta - UI metadata (color, expanded, dirty)
 * @property {boolean} deleted - Soft-delete flag
 * @property {number} order - Display order within page
 */

/**
 * @typedef {Object} Coordinates
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} width - Width
 * @property {number} height - Height
 * @property {CoordinateUnit} unit - Current display unit
 * @property {PercentageCoords} original - Original % coordinates (source of truth)
 */

/**
 * @typedef {Object} PercentageCoords
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {Object} BlockMeta
 * @property {string} color - Display color
 * @property {boolean} expanded - UI expand state
 * @property {boolean} dirty - Has unsaved changes
 * @property {boolean} isNew - Created this session
 */
```

### 1.3 Pages State Structure

```javascript
// New — single array of blocks per page
const [pages, setPages] = useState([
  { // Page 0
    blocks: [Block, Block, Block],
    virtualBlocks: [VirtualBlock, ...]
  },
  { // Page 1
    blocks: [Block],
    virtualBlocks: []
  }
]);
```

### 1.4 Block Operations (Pure Functions)

Create a `blockOperations.js` module with pure functions:

```javascript
// blockOperations.js

/** Create a new block from area selection */
function createBlock(area, pageIndex, colorIndex) → Block

/** Update a single property on a block immutably */
function updateBlock(pages, pageIndex, blockId, updates) → pages

/** Soft-delete a block (keeps for server sync) */
function deleteBlock(pages, pageIndex, blockId) → pages

/** Reorder blocks within a page */
function reorderBlocks(pages, pageIndex, fromIndex, toIndex) → pages

/** Get all dirty blocks across all pages for submission */
function getDirtyBlocks(pages) → Block[]

/** Convert block coordinates for current image dimensions */
function recalculateBlockCoords(block, imageDimensions) → Block
```

### 1.5 Migration Approach

1. Create the new `Block` type and `blockOperations.js`
2. Add adapter functions: `blocksFromLegacy(areas, areasProperties) → Block[]` and `blocksToLegacy(blocks) → { areas, areasProperties }`
3. Swap internal state to use `Block[]` while keeping legacy adapters at the API boundary
4. Once all consumers are updated, remove adapters

---

## Phase 2 — State Machine for Studio Modes

> **Goal:** Replace implicit boolean-based mode detection with an explicit state machine.
> **Files changed:** New `machines/studioMode.js`, refactor `StudioAreaSelector`, `useStudioColumns`

### 2.1 The Problem

Current mode detection is scattered across components:

```javascript
// Current — implicit mode detection via booleans
const mode = useAppMode(); // 'reader' | 'studio'
const isReaderMode = mode === 'reader';
const readOnly = someCondition;
const isHandMode = activeRightTab?.name === RIGHT_TAB_NAMES.COMPOSITE_BLOCKS && hand;
// default = edit mode
```

This leads to impossible states (e.g., `isReaderMode && isHandMode`) and makes it hard to reason about what the component should render.

### 2.2 State Machine Definition

```javascript
// machines/studioMode.js

const MODES = {
  READER: 'reader',
  EDITING: 'editing',
  HAND: 'hand',
  READONLY: 'readonly',
};

const EVENTS = {
  OPEN_STUDIO: 'OPEN_STUDIO',
  OPEN_READER: 'OPEN_READER',
  TOGGLE_HAND: 'TOGGLE_HAND',
  SET_READONLY: 'SET_READONLY',
  CANCEL_HAND: 'CANCEL_HAND',
};

const transitions = {
  [MODES.READER]: {
    [EVENTS.OPEN_STUDIO]: MODES.EDITING,
  },
  [MODES.EDITING]: {
    [EVENTS.TOGGLE_HAND]: MODES.HAND,
    [EVENTS.SET_READONLY]: MODES.READONLY,
    [EVENTS.OPEN_READER]: MODES.READER,
  },
  [MODES.HAND]: {
    [EVENTS.TOGGLE_HAND]: MODES.EDITING,
    [EVENTS.CANCEL_HAND]: MODES.EDITING,
    [EVENTS.OPEN_READER]: MODES.READER,
  },
  [MODES.READONLY]: {
    [EVENTS.OPEN_STUDIO]: MODES.EDITING,
    [EVENTS.OPEN_READER]: MODES.READER,
  },
};
```

### 2.3 Hook: `useStudioMode`

```javascript
function useStudioMode(initialMode) {
  const [mode, dispatch] = useReducer(modeReducer, initialMode);

  return {
    mode,
    isReader:   mode === MODES.READER,
    isEditing:  mode === MODES.EDITING,
    isHand:     mode === MODES.HAND,
    isReadOnly: mode === MODES.READONLY,
    send: dispatch,       // send(EVENTS.TOGGLE_HAND)
    canEdit:    mode === MODES.EDITING,
    canSelect:  mode === MODES.EDITING || mode === MODES.HAND,
  };
}
```

### 2.4 Usage in Components

```jsx
// Before (scattered booleans)
if (isReaderMode) return <ReaderOverlay />;
if (readOnly) return <ReadOnlyOverlay />;
if (isHandMode) return <HandOverlay />;
return <EditOverlay />;

// After (explicit switch on machine state)
switch (mode) {
  case MODES.READER:   return <AreaSelector.ReaderMode />;
  case MODES.EDITING:  return <AreaSelector.EditMode />;
  case MODES.HAND:     return <AreaSelector.HandMode />;
  case MODES.READONLY: return <AreaSelector.ReadOnlyMode />;
}
```

---

## Phase 3 — Strategy Pattern for Label Processing

> **Goal:** Break down the ~100-line `onChangeLabel()` into composable, testable strategies.
> **Files changed:** New `strategies/` directory, refactor `hooks/useLabelManagement.js`

### 3.1 The Problem

`onChangeLabel()` in `useLabelManagement.js` handles every label type with nested conditionals:

```javascript
// Current — monolithic function (simplified)
const onChangeLabel = async (areaIndex, label, abstractParam) => {
  const typeOfLabel = getTypeOfKey(abstractParam, label);
  if (typeOfLabel === 'text' || typeOfLabel === 'number') {
    // ... 20 lines of OCR logic
  } else if (typeOfLabel === 'image') {
    // ... 15 lines of image extraction
  } else if (typeOfLabel === 'object') {
    // ... 25 lines of modal opening
  } else if (typeOfLabel === 'coordinate') {
    // ... 10 lines of coordinate formatting
  } else if (typeOfLabel === 'quill') {
    // ... 15 lines of rich text modal
  }
};
```

### 3.2 Strategy Interface

```javascript
/**
 * @typedef {Object} LabelStrategy
 * @property {string} type - Strategy identifier
 * @property {(context: LabelContext) => boolean} matches - Does this strategy handle the label?
 * @property {(context: LabelContext) => Promise<LabelResult>} process - Process the label
 */

/**
 * @typedef {Object} LabelContext
 * @property {Block} block - The block being edited
 * @property {string} label - Selected label name
 * @property {Object} abstractParam - Type definition
 * @property {HTMLCanvasElement} canvas - For image extraction
 * @property {string} ocrLanguage - OCR language code
 * @property {Function} openModal - Modal opener
 */

/**
 * @typedef {Object} LabelResult
 * @property {*} value - Extracted/processed value
 * @property {string} [type] - Override type if needed
 * @property {boolean} [deferred] - True if value comes from modal callback
 */
```

### 3.3 Strategy Implementations

```
strategies/
├── index.js                    — Registry & LabelProcessor
├── textLabel.strategy.js       — OCR text extraction
├── imageLabel.strategy.js      — Image cropping to base64
├── objectLabel.strategy.js     — SubObject modal delegation
├── coordinateLabel.strategy.js — Coordinate string formatting
└── richTextLabel.strategy.js   — Quill modal delegation
```

Each strategy file:

```javascript
// strategies/textLabel.strategy.js
export const textLabelStrategy = {
  type: 'text',

  matches(context) {
    const fieldType = getTypeOfKey(context.abstractParam, context.label);
    return fieldType === 'text' || fieldType === 'number' || fieldType === 'string';
  },

  async process(context) {
    const image = await extractAreaImage(context.block, context.canvas);
    const text = await performOCR(image, context.ocrLanguage);
    return { value: text };
  },
};
```

### 3.4 Label Processor (Registry)

```javascript
// strategies/index.js
class LabelProcessor {
  constructor(strategies) {
    this.strategies = strategies;
  }

  async process(context) {
    const strategy = this.strategies.find(s => s.matches(context));
    if (!strategy) {
      console.warn(`No strategy found for label: ${context.label}`);
      return { value: null };
    }
    return strategy.process(context);
  }
}

// Create processor with all strategies
export const labelProcessor = new LabelProcessor([
  textLabelStrategy,
  imageLabelStrategy,
  objectLabelStrategy,
  coordinateLabelStrategy,
  richTextLabelStrategy,
]);
```

### 3.5 Simplified Hook

```javascript
// After refactoring
const onChangeLabel = async (blockId, label) => {
  const block = findBlock(pages, blockId);
  const context = { block, label, abstractParam, canvas, ocrLanguage, openModal };
  const result = await labelProcessor.process(context);

  if (!result.deferred) {
    updateBlock(blockId, { label, value: result.value });
  }
};
```

From ~100 lines down to ~10 lines. Each strategy is independently testable.

---

## Phase 4 — Command Pattern for Undo/Redo

> **Goal:** Make all block mutations reversible with Ctrl+Z / Ctrl+Y.
> **Files changed:** New `commands/` directory, refactor `useAreaManagement` → `useBlockCommands`

### 4.1 Command Interface

```javascript
/**
 * @typedef {Object} Command
 * @property {string} type - Command identifier
 * @property {string} description - Human-readable description
 * @property {() => Pages} execute - Apply the command, return new state
 * @property {() => Pages} undo - Reverse the command, return previous state
 */
```

### 4.2 Command Implementations

```javascript
// commands/createBlock.command.js
export function createBlockCommand(pageIndex, block) {
  return {
    type: 'CREATE_BLOCK',
    description: `Create ${block.type} block`,
    execute(pages) {
      return addBlockToPage(pages, pageIndex, block);
    },
    undo(pages) {
      return removeBlockFromPage(pages, pageIndex, block.id);
    },
  };
}

// commands/deleteBlock.command.js
export function deleteBlockCommand(pageIndex, block) {
  const snapshot = { ...block };
  return {
    type: 'DELETE_BLOCK',
    description: `Delete ${block.type} block`,
    execute(pages) {
      return block.blockId
        ? softDeleteBlock(pages, pageIndex, block.id)    // Server-synced
        : removeBlockFromPage(pages, pageIndex, block.id); // Local-only
    },
    undo(pages) {
      return restoreBlock(pages, pageIndex, snapshot);
    },
  };
}

// commands/updateBlock.command.js
export function updateBlockCommand(pageIndex, blockId, updates) {
  let previousValues;
  return {
    type: 'UPDATE_BLOCK',
    description: `Update block ${blockId}`,
    execute(pages) {
      const block = findBlock(pages, pageIndex, blockId);
      previousValues = pick(block, Object.keys(updates));
      return updateBlockInPage(pages, pageIndex, blockId, updates);
    },
    undo(pages) {
      return updateBlockInPage(pages, pageIndex, blockId, previousValues);
    },
  };
}

// commands/reorderBlocks.command.js
export function reorderBlocksCommand(pageIndex, fromIndex, toIndex) {
  return {
    type: 'REORDER_BLOCKS',
    description: `Reorder blocks`,
    execute(pages) {
      return reorderBlocksInPage(pages, pageIndex, fromIndex, toIndex);
    },
    undo(pages) {
      return reorderBlocksInPage(pages, pageIndex, toIndex, fromIndex);
    },
  };
}
```

### 4.3 Command History Hook

```javascript
// hooks/useCommandHistory.js
function useCommandHistory(initialPages) {
  const [pages, setPages] = useState(initialPages);
  const [history, setHistory] = useState([]);   // Past commands
  const [future, setFuture] = useState([]);     // Undone commands

  const execute = useCallback((command) => {
    setPages(prev => {
      const next = command.execute(prev);
      setHistory(h => [...h, { command, before: prev }]);
      setFuture([]);  // Clear redo stack on new action
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setPages(prev => {
      const next = last.command.undo(prev);
      setHistory(h => h.slice(0, -1));
      setFuture(f => [last, ...f]);
      return next;
    });
  }, [history]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setPages(prev => {
      const result = next.command.execute(prev);
      setFuture(f => f.slice(1));
      setHistory(h => [...h, next]);
      return result;
    });
  }, [future]);

  return {
    pages,
    execute,
    undo,
    redo,
    canUndo: history.length > 0,
    canRedo: future.length > 0,
  };
}
```

### 4.4 Keyboard Shortcuts

```javascript
// Inside Studio component
useEffect(() => {
  const handler = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      redo();
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, [undo, redo]);
```

---

## Phase 5 — Compound Components for Area Selector

> **Goal:** Split `StudioAreaSelector` (404 lines, 4 modes) into focused compound components.
> **Files changed:** Refactor `StudioAreaSelector/` entirely

### 5.1 Current Problem

```jsx
// Current — one component, 4 modes, 18 props
<StudioAreaSelector
  areas={areas}
  areasProperties={areasProperties}
  activePage={activePage}
  imageScaleFactor={imageScaleFactor}
  // ... 14 more props
/>

// Inside: nested ternaries decide what to render
{isReaderMode ? <ReaderOverlay /> : readOnly ? <ReadOnlyView /> : isHand ? <HandMode /> : <EditMode />}
```

### 5.2 Compound Component Architecture

```
StudioAreaSelector/
├── AreaSelector.jsx           — Shared context provider + image container
├── AreaSelectorContext.js     — Shared state (image ref, dimensions, areas)
├── EditMode.jsx               — @bmunozg/react-image-area integration
├── ReaderMode.jsx             — Clickable overlays with playback
├── HandMode.jsx               — Block selection for composite blocks
├── ReadOnlyMode.jsx           — Display-only overlays
├── AreaOverlay.jsx            — Single area box (shared rendering)
├── AreaTooltip.jsx            — Hover tooltip for area info
└── index.js                   — Compound export
```

### 5.3 Shared Context

```javascript
// AreaSelectorContext.js
const AreaSelectorContext = createContext(null);

function AreaSelectorProvider({ children }) {
  const { pages, activePage } = useStudioNavigation();
  const { blocks } = useStudioBlocks();
  const { mode } = useStudioMode();
  const imageRef = useRef(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const pageBlocks = blocks[activePage] ?? [];
  const pageImage = pages[activePage]?.image;

  return (
    <AreaSelectorContext.Provider value={{
      imageRef, imageDimensions, setImageDimensions,
      pageBlocks, pageImage, mode,
    }}>
      {children}
    </AreaSelectorContext.Provider>
  );
}
```

### 5.4 Usage

```jsx
// StudioEditor.jsx — mode-aware rendering
function StudioEditor() {
  const { mode } = useStudioMode();

  return (
    <AreaSelector>
      {mode === MODES.EDITING  && <AreaSelector.EditMode />}
      {mode === MODES.READER   && <AreaSelector.ReaderMode />}
      {mode === MODES.HAND     && <AreaSelector.HandMode />}
      {mode === MODES.READONLY && <AreaSelector.ReadOnlyMode />}
    </AreaSelector>
  );
}
```

### 5.5 Individual Mode Components

Each mode component is focused and small (~80-120 lines):

**EditMode.jsx** — Renders `<AreaSelector />` from `@bmunozg/react-image-area`, handles `onChange` for new area drawing, manages area manipulation.

**ReaderMode.jsx** — Renders clickable `<AreaOverlay />` for each block. Click triggers `onPlayBlock()`. Shows tooltips on hover.

**HandMode.jsx** — Renders selectable `<AreaOverlay />` for each block. Click adds block to composite group. Visual selection state.

**ReadOnlyMode.jsx** — Renders non-interactive `<AreaOverlay />` for display purposes only.

---

## Phase 6 — Builder Pattern for Column Configuration

> **Goal:** Replace the 309-line `useStudioColumns` hook (with infinite loop risks) with a declarative column builder.
> **Files changed:** New `builders/ColumnBuilder.js`, refactor `useStudioColumns`, `columns/`

### 6.1 The Problem

Current column building happens inside React hooks with complex memoization:

```javascript
// Current — memoized column building inside hook (prone to infinite loops)
const leftColumns = useMemo(() => {
  return buildLeftColumns({
    // 15 parameters...
  });
}, [dep1, dep2, dep3, /* 12 more deps... */]);
```

### 6.2 ColumnBuilder Class

```javascript
// builders/ColumnBuilder.js
class ColumnBuilder {
  #tabs = [];
  #mode = 'studio';
  #side = 'left';

  forMode(mode) {
    this.#mode = mode;
    return this;
  }

  forSide(side) {
    this.#side = side;
    return this;
  }

  addTab(config) {
    this.#tabs.push({
      id: config.id,
      label: config.label,
      icon: config.icon,
      component: config.component,
      visible: config.visible ?? true,
      order: config.order ?? this.#tabs.length,
    });
    return this;
  }

  when(condition, builderFn) {
    if (condition) {
      builderFn(this);
    }
    return this;
  }

  build() {
    return this.#tabs
      .filter(tab => tab.visible)
      .sort((a, b) => a.order - b.order);
  }
}
```

### 6.3 Tab Registry

```javascript
// builders/tabRegistry.js
const TAB_REGISTRY = {
  thumbnails: {
    id: 'thumbnails',
    label: 'Pages',
    icon: PhotoLibraryIcon,
    modes: ['studio', 'reader'],
    sides: ['left'],
    component: (props) => <StudioThumbnails {...props} />,
  },
  actions: {
    id: 'actions',
    label: 'Blocks',
    icon: LayersIcon,
    modes: ['studio'],
    sides: ['right'],
    component: (props) => <StudioActions {...props} />,
  },
  compositeBlocks: {
    id: 'compositeBlocks',
    label: 'Composite',
    icon: GroupWorkIcon,
    modes: ['studio'],
    sides: ['right'],
    requires: (ctx) => ctx.hasCompositeTypes,
    component: (props) => <StudioCompositeBlocks {...props} />,
  },
  // ... more tabs
};
```

### 6.4 Simplified Hook

```javascript
// hooks/useColumns.js
function useColumns(mode, context) {
  const leftTabs = useMemo(() => {
    return new ColumnBuilder()
      .forMode(mode)
      .forSide('left')
      .addTab(TAB_REGISTRY.thumbnails)
      .when(mode === 'reader', b => b.addTab(TAB_REGISTRY.tableOfContents))
      .build();
  }, [mode]);

  const rightTabs = useMemo(() => {
    return new ColumnBuilder()
      .forMode(mode)
      .forSide('right')
      .addTab(TAB_REGISTRY.actions)
      .when(context.hasCompositeTypes, b => b.addTab(TAB_REGISTRY.compositeBlocks))
      .build();
  }, [mode, context.hasCompositeTypes]);

  return { leftTabs, rightTabs };
}
```

Minimal deps = no infinite loops. Pure builder = easy to test.

---

## Phase 7 — Context Redesign & Dependency Injection

> **Goal:** Replace the mega-context with focused, split contexts behind a facade.
> **Files changed:** Refactor `context/StudioContext.jsx`, new context files

### 7.1 Split Context Architecture

```
context/
├── StudioProvider.jsx          — Composes all providers
├── BlocksContext.jsx           — Block state & commands
├── ModeContext.jsx             — State machine
├── NavigationContext.jsx       — Page navigation
├── LayoutContext.jsx           — Zoom, toolbar, columns
├── OCRContext.jsx              — OCR settings & operations
└── index.js                   — Barrel exports + useStudio facade
```

### 7.2 Provider Composition

```jsx
// context/StudioProvider.jsx
function StudioProvider({ children, ...props }) {
  return (
    <ModeProvider initialMode={props.initialMode}>
      <NavigationProvider pages={props.pages}>
        <BlocksProvider initialBlocks={props.blocks}>
          <LayoutProvider>
            <OCRProvider>
              {children}
            </OCRProvider>
          </LayoutProvider>
        </BlocksProvider>
      </NavigationProvider>
    </ModeProvider>
  );
}
```

### 7.3 Facade Hook

```javascript
// context/index.js
export function useStudio() {
  return {
    ...useStudioBlocks(),
    ...useStudioMode(),
    ...useStudioNavigation(),
    ...useStudioLayout(),
    ...useStudioOCR(),
  };
}

// Components needing everything:
const studio = useStudio();

// Components needing only navigation (avoids re-renders from block changes):
const { activePage, goToPage } = useStudioNavigation();
```

### 7.4 Re-render Optimization

With split contexts, updates are scoped:

| Action | Re-renders |
|--------|-----------|
| Change OCR language | Only OCR consumers |
| Navigate to page | Only Navigation + Blocks consumers |
| Toggle zoom | Only Layout consumers |
| Create block | Only Blocks consumers |
| Toggle mode | Only Mode consumers |

This is a significant improvement over the current mega-context where any change re-renders everything.

---

## Phase 8 — Component Decomposition

> **Goal:** Break remaining large components into focused, single-responsibility components.
> **Files changed:** All subcomponents

### 8.1 New Component Tree

```
Studio/
├── StudioShell.jsx              — Top-level layout wrapper (replaces Studio.jsx)
│
├── Header/
│   ├── StudioHeader.jsx         — Sticky header bar
│   ├── ZoomControls.jsx         — Image scale slider
│   ├── UndoRedoControls.jsx     — Undo/Redo buttons
│   └── LanguageSwitcher.jsx     — OCR language toggle
│
├── Navigation/
│   ├── PageThumbnails.jsx       — Page thumbnail list
│   ├── PageThumbnail.jsx        — Single thumbnail
│   └── PageIndicator.jsx        — "Page X of Y" display
│
├── Editor/
│   ├── StudioEditor.jsx         — Center panel wrapper
│   └── AreaSelector/            — (Phase 5 compound components)
│       ├── AreaSelector.jsx
│       ├── EditMode.jsx
│       ├── ReaderMode.jsx
│       ├── HandMode.jsx
│       ├── ReadOnlyMode.jsx
│       ├── AreaOverlay.jsx
│       └── AreaTooltip.jsx
│
├── Sidebar/
│   ├── SidebarPanel.jsx         — Generic tabbed sidebar
│   ├── TabBar.jsx               — Tab navigation strip
│   │
│   ├── BlocksTab/               — Block list & management (replaces StudioActions)
│   │   ├── BlocksTab.jsx
│   │   ├── BlockItem.jsx        — Single block row
│   │   ├── BlockActions.jsx     — Edit/Delete/Expand actions
│   │   ├── LabelSelector.jsx   — Label dropdown
│   │   └── BlockDragHandle.jsx — DnD handle
│   │
│   ├── CompositeTab/            — Composite block management
│   │   ├── CompositeTab.jsx
│   │   ├── CompositeBlockForm.jsx
│   │   └── CompositeAreaList.jsx
│   │
│   ├── VirtualBlocksTab/        — Virtual block templates
│   │   ├── VirtualBlocksTab.jsx
│   │   └── VirtualBlockItem.jsx
│   │
│   └── ExerciseTab/             — Exercise playback (existing, keep)
│       ├── ExerciseTab.jsx
│       └── ExercisePlayerModal.jsx
│
├── machines/                    — (Phase 2)
│   └── studioMode.js
│
├── strategies/                  — (Phase 3)
│   ├── index.js
│   ├── textLabel.strategy.js
│   ├── imageLabel.strategy.js
│   ├── objectLabel.strategy.js
│   ├── coordinateLabel.strategy.js
│   └── richTextLabel.strategy.js
│
├── commands/                    — (Phase 4)
│   ├── index.js
│   ├── createBlock.command.js
│   ├── deleteBlock.command.js
│   ├── updateBlock.command.js
│   └── reorderBlocks.command.js
│
├── builders/                    — (Phase 6)
│   ├── ColumnBuilder.js
│   └── tabRegistry.js
│
├── context/                     — (Phase 7)
│   ├── StudioProvider.jsx
│   ├── BlocksContext.jsx
│   ├── ModeContext.jsx
│   ├── NavigationContext.jsx
│   ├── LayoutContext.jsx
│   ├── OCRContext.jsx
│   └── index.js
│
├── hooks/                       — Simplified hooks
│   ├── useCommandHistory.js     — (Phase 4)
│   ├── useColumns.js            — (Phase 6, simplified)
│   ├── useKeyboardShortcuts.js  — Ctrl+Z, Ctrl+Y
│   └── useImageDimensions.js    — Image load & resize tracking
│
├── services/                    — (Keep existing, well-designed)
│   ├── coordinate.service.js
│   ├── block.service.js
│   ├── modal.service.js
│   ├── ocr.service.js
│   └── styling.service.js
│
├── types/
│   └── studio.types.js          — Updated with Block model
│
├── constants/
│   ├── tabs.constants.js
│   └── studio.constants.js
│
└── utils/
    ├── areaUtils.js
    └── coordinateUtils.js
```

### 8.2 StudioShell (Replaces Studio.jsx)

The main component becomes a thin shell (~80 lines):

```jsx
function StudioShell(props) {
  return (
    <StudioProvider {...props}>
      <StudioHeader />
      <StudioLayout
        left={<SidebarPanel side="left" />}
        center={<StudioEditor />}
        right={<SidebarPanel side="right" />}
      />
    </StudioProvider>
  );
}
```

Down from 392 lines to ~80 lines. All logic lives in contexts and hooks.

### 8.3 Component Size Targets

| Component | Current Lines | Target Lines |
|-----------|--------------|-------------|
| Studio.jsx (→ StudioShell) | 392 | ~80 |
| StudioAreaSelector (→ AreaSelector compound) | 404 | ~60 (parent) + ~100 each mode |
| StudioActions (→ BlocksTab) | 179 | ~80 (parent) + ~40 each child |
| StudioCompositeBlocks (→ CompositeTab) | 235 | ~80 (parent) + ~40 each child |
| useStudioColumns (→ useColumns + Builder) | 309 | ~50 |
| useLabelManagement (→ strategies) | 220 | ~30 (hook) + ~40 each strategy |
| useAreaManagement (→ BlocksContext + commands) | 254 | ~100 (context) + ~20 each command |

---

## Phase 9 — Testing Strategy

> **Goal:** Achieve high test coverage for all business logic, commands, strategies, and critical paths.

### 9.1 Testing Layers

```
Unit Tests (jest)
├── commands/*.test.js         — Each command's execute/undo
├── strategies/*.test.js       — Each strategy's matches/process
├── machines/*.test.js         — State transitions & guards
├── builders/*.test.js         — Column builder output
├── services/*.test.js         — Pure function services (already exists for coordinate.service)
└── utils/*.test.js            — Utility functions

Integration Tests (React Testing Library)
├── context/*.test.js          — Provider behavior
├── hooks/*.test.js            — Hook combinations (renderHook)
└── components/*.test.js       — Component rendering per mode

E2E Tests (optional, Cypress/Playwright)
├── studio-editing.spec.js     — Create, edit, delete blocks
├── studio-reader.spec.js      — Block playback
├── studio-composite.spec.js   — Composite block workflow
└── studio-undo-redo.spec.js   — Undo/redo flow
```

### 9.2 Priority Tests

| Priority | Target | Type | Why |
|----------|--------|------|-----|
| P0 | Block operations (create/delete/update) | Unit | Core data integrity |
| P0 | Coordinate conversion (% ↔ px) | Unit | Already has tests, expand coverage |
| P0 | State machine transitions | Unit | Mode correctness |
| P1 | Command execute/undo symmetry | Unit | Undo must perfectly reverse |
| P1 | Label strategies | Unit | Each type processes correctly |
| P1 | Column builder output | Unit | Correct tabs for each mode |
| P2 | BlocksContext integration | Integration | State flows correctly |
| P2 | AreaSelector mode rendering | Integration | Correct UI per mode |
| P3 | Full editing workflow | E2E | End-to-end confidence |

### 9.3 Testing Utilities

```javascript
// test-utils/studioTestHelpers.js
export function createMockBlock(overrides = {}) { ... }
export function createMockPages(pageCount, blocksPerPage) { ... }
export function renderWithStudio(component, providerProps) { ... }
export function createMockLabelContext(overrides = {}) { ... }
```

---

## Phase 10 — Performance Optimization

> **Goal:** Eliminate unnecessary re-renders, optimize heavy operations.

### 10.1 React.memo Boundaries

```
StudioShell
├── StudioHeader          ← memo (rarely changes)
├── SidebarPanel (left)   ← memo (changes on tab switch)
│   └── PageThumbnails    ← memo + virtualization for many pages
├── StudioEditor          ← memo (changes on page/block changes)
│   └── AreaSelector.*    ← memo (only active mode renders)
└── SidebarPanel (right)  ← memo (changes on tab switch)
    └── BlocksTab         ← memo (changes on block changes)
```

### 10.2 Virtualization

For books with many pages (50+), the thumbnail list and block lists should use virtualization:

```javascript
// Use react-window or @tanstack/react-virtual
import { useVirtualizer } from '@tanstack/react-virtual';

function PageThumbnails({ pages }) {
  const virtualizer = useVirtualizer({
    count: pages.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 120,
  });
  // Render only visible thumbnails
}
```

### 10.3 Debounced Operations

```javascript
// Debounce area resize/move updates
const debouncedUpdateBlock = useDebouncedCallback(
  (blockId, coords) => execute(updateBlockCommand(pageIndex, blockId, { coordinates: coords })),
  150
);

// Debounce OCR (expensive operation)
const debouncedOCR = useDebouncedCallback(performOCR, 300);
```

### 10.4 Web Worker for OCR

Move Tesseract.js processing to a Web Worker to prevent UI thread blocking:

```javascript
// workers/ocr.worker.js
import Tesseract from 'tesseract.js';

self.onmessage = async ({ data: { image, language } }) => {
  const result = await Tesseract.recognize(image, language);
  self.postMessage({ text: result.data.text });
};
```

---

## New Directory Structure

Final target structure with all phases applied:

```
src/components/Studio/
│
├── index.js                        — Public API export
├── StudioShell.jsx                 — Main entry (~80 lines)
├── studio.module.scss
│
├── context/                        — Split contexts (Phase 7)
│   ├── index.js                    — Barrel + useStudio facade
│   ├── StudioProvider.jsx          — Provider composition
│   ├── BlocksContext.jsx
│   ├── ModeContext.jsx
│   ├── NavigationContext.jsx
│   ├── LayoutContext.jsx
│   └── OCRContext.jsx
│
├── machines/                       — State machines (Phase 2)
│   ├── studioMode.js
│   └── __tests__/
│       └── studioMode.test.js
│
├── strategies/                     — Label strategies (Phase 3)
│   ├── index.js
│   ├── textLabel.strategy.js
│   ├── imageLabel.strategy.js
│   ├── objectLabel.strategy.js
│   ├── coordinateLabel.strategy.js
│   ├── richTextLabel.strategy.js
│   └── __tests__/
│       └── labelStrategies.test.js
│
├── commands/                       — Undo/Redo commands (Phase 4)
│   ├── index.js
│   ├── createBlock.command.js
│   ├── deleteBlock.command.js
│   ├── updateBlock.command.js
│   ├── reorderBlocks.command.js
│   └── __tests__/
│       └── blockCommands.test.js
│
├── builders/                       — Column builder (Phase 6)
│   ├── ColumnBuilder.js
│   ├── tabRegistry.js
│   └── __tests__/
│       └── ColumnBuilder.test.js
│
├── hooks/                          — Simplified hooks
│   ├── index.js
│   ├── useCommandHistory.js
│   ├── useColumns.js
│   ├── useKeyboardShortcuts.js
│   └── useImageDimensions.js
│
├── components/                     — UI components
│   ├── Header/
│   │   ├── StudioHeader.jsx
│   │   ├── ZoomControls.jsx
│   │   ├── UndoRedoControls.jsx
│   │   └── LanguageSwitcher.jsx
│   │
│   ├── Navigation/
│   │   ├── PageThumbnails.jsx
│   │   ├── PageThumbnail.jsx
│   │   └── PageIndicator.jsx
│   │
│   ├── Editor/
│   │   ├── StudioEditor.jsx
│   │   └── AreaSelector/
│   │       ├── AreaSelector.jsx
│   │       ├── AreaSelectorContext.js
│   │       ├── EditMode.jsx
│   │       ├── ReaderMode.jsx
│   │       ├── HandMode.jsx
│   │       ├── ReadOnlyMode.jsx
│   │       ├── AreaOverlay.jsx
│   │       └── AreaTooltip.jsx
│   │
│   ├── Sidebar/
│   │   ├── SidebarPanel.jsx
│   │   ├── TabBar.jsx
│   │   │
│   │   ├── BlocksTab/
│   │   │   ├── BlocksTab.jsx
│   │   │   ├── BlockItem.jsx
│   │   │   ├── BlockActions.jsx
│   │   │   ├── LabelSelector.jsx
│   │   │   └── BlockDragHandle.jsx
│   │   │
│   │   ├── CompositeTab/
│   │   │   ├── CompositeTab.jsx
│   │   │   ├── CompositeBlockForm.jsx
│   │   │   └── CompositeAreaList.jsx
│   │   │
│   │   ├── VirtualBlocksTab/
│   │   │   ├── VirtualBlocksTab.jsx
│   │   │   └── VirtualBlockItem.jsx
│   │   │
│   │   └── ExerciseTab/
│   │       ├── ExerciseTab.jsx
│   │       └── ExercisePlayerModal.jsx
│   │
│   └── Layout/
│       └── StudioLayout.jsx
│
├── services/                       — Business logic (keep existing)
│   ├── index.js
│   ├── coordinate.service.js
│   ├── block.service.js
│   ├── modal.service.js
│   ├── ocr.service.js
│   ├── styling.service.js
│   └── __tests__/
│       ├── coordinate.service.test.js
│       └── block.service.test.js
│
├── types/
│   └── studio.types.js
│
├── constants/
│   ├── index.js
│   ├── tabs.constants.js
│   └── studio.constants.js
│
└── utils/
    ├── index.js
    ├── areaUtils.js
    ├── coordinateUtils.js
    └── blockOperations.js          — Pure block manipulation functions
```

**Estimated total:** ~65 files, ~7,500 lines (reduced from 8,100 while adding undo/redo, tests, and better organization)

---

## Migration Strategy

### Approach: Strangler Fig Pattern

Each phase wraps/replaces existing code incrementally. The old code continues to work until fully replaced.

### Phase Ordering & Dependencies

```
Phase 1 (Unified Data Model) ◄── Foundation, everything depends on this
    │
    ├─→ Phase 2 (State Machine) ◄── Independent
    ├─→ Phase 3 (Strategies) ◄── Independent
    │
    ▼
Phase 4 (Commands) ◄── Depends on Phase 1 (Block model)
    │
    ▼
Phase 5 (Compound Components) ◄── Depends on Phase 2 (modes)
    │
Phase 6 (Column Builder) ◄── Independent
    │
    ▼
Phase 7 (Context Redesign) ◄── Depends on Phases 1-6 being stable
    │
    ▼
Phase 8 (Component Decomposition) ◄── Depends on Phase 7 (context)
    │
    ▼
Phase 9 (Testing) ◄── Can start from Phase 1, grows with each phase
    │
    ▼
Phase 10 (Performance) ◄── Final polish
```

### Parallel Workstreams

Phases 2, 3, and 6 are independent and can be developed in parallel once Phase 1 is complete.

### Rollback Safety

Each phase uses adapter functions at boundaries so the old code can be restored by removing the adapter and reverting to the previous implementation. No big-bang migration.

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Data model migration breaks existing blocks | Medium | High | Adapter functions + comprehensive tests on legacy data |
| State machine misses an edge case transition | Low | Medium | Document all current mode combinations before building |
| Command history memory usage on large books | Low | Low | Cap history at 50 entries, discard oldest |
| Split contexts cause provider hell | Low | Medium | Facade hook hides nesting, max 5 providers |
| Strategy pattern over-engineers simple cases | Low | Low | Start with 3 strategies, add more only if needed |
| Infinite loop issue returns in column builder | Low | High | Builder is pure function, no React lifecycle involvement |
| Team unfamiliarity with patterns | Medium | Medium | Document each pattern with examples in code comments |

---

## Summary

| Phase | Pattern | Core Problem Solved | Effort |
|-------|---------|---------------------|--------|
| 1 | Unified Model | Dual-array sync bugs | Large |
| 2 | State Machine | Implicit mode bugs | Medium |
| 3 | Strategy | 100-line monolith | Medium |
| 4 | Command | No undo/redo | Medium |
| 5 | Compound Components | 404-line component + 18 props | Large |
| 6 | Builder | Infinite loop risk | Small |
| 7 | Facade + Split Context | Mega-context re-renders | Medium |
| 8 | Component Decomposition | Large file sizes | Large |
| 9 | — | No test coverage | Large |
| 10 | — | Performance issues | Small |

**Total estimated phases:** 10
**Independently shippable:** Yes, each phase
**Backwards compatible:** Yes, via adapter functions during migration
