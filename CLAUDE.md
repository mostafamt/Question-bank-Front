# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based Question Bank application for creating, managing, and displaying educational content including interactive questions, books, and learning materials. The application supports multiple question types (multiple choice, true/false, fill-in-the-blank, essay, drag-the-words) and includes OCR capabilities for scanning and uploading questions.

## Development Commands

### Running the Application
- `npm start` - Run the development server (opens at http://localhost:3000)
- `npm run server` - Run the json-server mock backend on port 8000
- `npm run serve` - Run both frontend and backend concurrently

### Testing and Building
- `npm test` - Run tests in interactive watch mode
- `npm run build` - Build production bundle to `build/` folder

## Architecture Overview

### State Management
The application uses **Zustand** for global state management (`src/store/store.js`):
- `data` - Form state data shared across components
- `modal` - Global modal state (name, opened, size, props)
- Key methods: `setFormState()`, `openModal()`, `closeModal()`

### API Configuration
Two axios instances are configured in `src/axios.js`:
- **instance** (default) - Points to `REACT_APP_REMOTE_URL` or http://localhost:4000/api
- **NewInstance** - Points to `REACT_APP_NEW_REMOTE_URL` for newer API endpoints
- Environment variables in `.env`:
  - `REACT_APP_REMOTE_URL=https://questions-api-navy.vercel.app/api`
  - `REACT_APP_NEW_REMOTE_URL=https://interactive-objects.onrender.com/api`

### Key Architectural Patterns

#### Auto-UI System (DrawnUI)
The application features a dynamic form generation system (`src/utils/auto-ui.js` and `src/pages/DrawnUI/DrawnUI.jsx`):
- Automatically generates form UIs based on **abstractParameters** fetched from interactive object types
- Maps data types to React components via `AUTO_UI_TYPES_MAPPING` (text, number, image, video, voice, Bool, etc.)
- Supports nested objects (`ObjectUI`) and arrays (`ArrayUI`)
- Uses `react-hook-form` with Yup validation
- Key utilities:
  - `getTypeOfKey()` - Resolves field type from labels
  - `searchIfRequired()` - Checks if field is required (marked with `*`)
  - `searchIfHintExist()` - Retrieves field hints
  - `getSchema()` - Generates Yup validation schema dynamically

#### Modal System
Global modal management through Zustand store:
- Single `<Modal />` component rendered in App.js
- Open modals via `useStore().openModal(name, props)`
- Modal content determined by `name` parameter
- Common modals: EditParametersModal, EditObjectModal, SubObjectModal, PlayObjectModal, QuillModal, etc.

#### Book Reader System
The Book/Chapter reader (`src/pages/Book/Book.jsx`) features:
- Tab-based navigation with outer/inner tab levels
- Page thumbnails with active page tracking
- Block coordinate system for interactive areas on pages
- Uses `@tanstack/react-query` for data fetching and caching
- Configuration in `src/config/reader.js`

#### Virtual Blocks
A menu system for educational content blocks (`src/utils/virtual-blocks.js`):
- Predefined block types: Overview, Notes, Recall, Example, Check Yourself, Quizz, Activity, Summary, etc.
- Each block has category (object/text), label, and icon

#### Studio Component (Refactoring in Progress - Phase 1)
The Studio component (`src/components/Studio/`) is a content authoring tool for creating educational blocks on book pages. It's currently being refactored for better maintainability:

**Current Structure (Phase 1 - Foundation):**
- `types/studio.types.js` - JSDoc type definitions for all Studio data structures (Area, AreaProperty, VirtualBlock, etc.)
- `constants/` - Extracted constants for tabs, timeouts, storage keys, and defaults
  - `tabs.constants.js` - Tab names (LEFT_TAB_NAMES, RIGHT_TAB_NAMES)
  - `studio.constants.js` - Timeouts, defaults, OCR languages, storage keys
  - `index.js` - Barrel export for all constants
- `hooks/` - Custom hooks (planned for Phase 2)
- `services/` - Business logic services (planned for Phase 3)
- `utils/` - Helper functions (planned for Phase 2-3)
- `components/` - Sub-components (planned for Phase 4)
- `context/` - Context providers (planned for Phase 2)

**Usage:**
- Import constants: `import { LEFT_TAB_NAMES, TIMEOUTS, STORAGE_KEYS } from './constants'`
- Type definitions provide IDE autocomplete and documentation
- All magic strings/numbers have been extracted to constants

**Key Features:**
- Page navigation and thumbnail management
- Area selection for block creation (using @bmunozg/react-image-area)
- OCR text extraction from selected areas
- Composite block creation and management
- Virtual blocks for educational content organization
- Coordinate conversion (percentage ↔ pixels)

**Refactoring Plan:** See `docs/2025-11-06/STUDIO_REFACTORING_PLAN.md` and `docs/2025-11-06/PHASE_1_REFACTORING.md` for details

### Component Structure
Components are organized by feature/domain:
- `components/DrawnUI/` - Auto-generated form components (Text, Image, Video, Boolean, Select, ArrayUI, ObjectUI)
- `components/Modal/` - Modal variants
- `components/MultipleChoice/`, `components/TrueFalse/`, `components/FillBlank/` - Question type components
- `components/Book/`, `components/Studio/`, `components/StudyBook/` - Book-related components
- `components/VirtualBlocks/` - Educational content blocks

### Routing
Routes defined in `src/routes/index.js`:
- `/` - AddBook (landing page)
- `/book/:bookId/chapter/:chapterId` - ScanAndUpload
- `/read/book/:bookId/chapter/:chapterId` - Book reader
- `/add-question` - AddObject (question creation hub)
- `/add-question/:type` - DrawnUI (dynamic form for question types)
- `/edit-question/:type/:id` - DrawnUI (edit mode)
- Various question type routes with `/manual` suffix

### Services & API
Key API functions in `src/services/api.js`:
- `getTypes()` - Fetch interactive object types
- `fetchObjects(page, limit)` - Paginated object fetching
- `saveBlocks(data)` - Save block data
- Type definitions stored in `NewTypes.json` and `OldTypes.json`

### Utilities
Important utility modules in `src/utils/`:
- `auto-ui.js` - Dynamic form generation logic
- `virtual-blocks.js` - Virtual block definitions
- `book.js` - Book-related utilities
- `ocr.js` - OCR processing (uses tesseract.js)
- `upload.js` - File upload handling
- `quill.js` - Rich text editor utilities (react-quill)
- `data.js` - Data transformation utilities

## Technology Stack
- **React 18** with react-router-dom v6
- **Material-UI v5** (@mui/material, @mui/icons-material, @mui/x-data-grid, @mui/x-tree-view)
- **Form handling**: react-hook-form with Yup/Zod validation
- **State**: Zustand
- **Data fetching**: @tanstack/react-query, axios
- **Styling**: SCSS modules, Bootstrap 5
- **Rich text**: react-quill
- **OCR**: tesseract.js
- **Drag & drop**: @hello-pangea/dnd
- **Image areas**: @bmunozg/react-image-area
- **Notifications**: react-toastify

## Important Notes
- The application uses iframe-resizer for embedded content support
- Error boundaries wrap the main application routes
- Material-UI theme customization in `src/theme/theme.js`
- The DrawnUI system is central to the application - it powers dynamic question creation based on type definitions fetched from the backend
