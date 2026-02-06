# Virtual Blocks & Exercise Tab Feature Extraction Plan

## Objective
Extract the Virtual Blocks and Exercise Tab features from the current development branch into a dedicated feature branch, then merge that branch into the IBook branch.

---

## Phase 1: Preparation

### 1.1 Verify Current Branch State
```bash
# Check current branch and status
git branch
git status

# Ensure working directory is clean
git stash  # if there are uncommitted changes
```

### 1.2 Identify Target Branches
- **Source Branch**: `IBook-2-development` (current)
- **Feature Branch**: `feature/virtual-blocks-exercise-tab` (to create)
- **Target Branch**: `IBook` (to merge into)

---

## Phase 2: Files to Extract

### 2.1 Core Virtual Blocks Files (REQUIRED)

| File Path | Description |
|-----------|-------------|
| `src/utils/virtual-blocks.js` | Core utility functions and constants |
| `src/utils/virtual-blocks.test.js` | Unit tests |

### 2.2 Virtual Blocks Components (REQUIRED)

| File Path | Description |
|-----------|-------------|
| `src/components/VirtualBlocks/VirtualBlocks.jsx` | Parent container component |
| `src/components/VirtualBlocks/virtualBlocks.module.scss` | Styles |
| `src/components/VirtualBlocks/VirtualBlock/VirtualBlock.jsx` | Individual block component |
| `src/components/VirtualBlocks/VirtualBlock/virtualBlock.module.scss` | Styles |

### 2.3 Virtual Blocks Modals (REQUIRED)

| File Path | Description |
|-----------|-------------|
| `src/components/Modal/VirtualBlockContentModal/VirtualBlockContentModal.jsx` | Content management modal |
| `src/components/Modal/VirtualBlockContentModal/ContentItemList.jsx` | List sub-component |
| `src/components/Modal/VirtualBlockContentModal/ContentItemForm.jsx` | Form sub-component |
| `src/components/Modal/VirtualBlockContentModal/virtualBlockContentModal.module.scss` | Styles |
| `src/components/Modal/VirtualBlockReaderModal/VirtualBlockReaderModal.jsx` | Reader modal |
| `src/components/Modal/VirtualBlockReaderModal/virtualBlockReaderModal.module.scss` | Styles |
| `src/components/Modal/VirtualBlockReaderNavigationModal/VirtualBlockReaderNavigationModal.jsx` | Navigation modal |
| `src/components/Modal/VirtualBlockReaderNavigationModal/TextContentDisplay.jsx` | Text display |
| `src/components/Modal/VirtualBlockReaderNavigationModal/IframeContentDisplay.jsx` | Iframe display |
| `src/components/Modal/VirtualBlockReaderNavigationModal/ObjectContentDisplay.jsx` | Object display |
| `src/components/Modal/VirtualBlockReaderNavigationModal/virtualBlockReaderNavigationModal.module.scss` | Styles |

### 2.4 Virtual Blocks Hooks (REQUIRED)

| File Path | Description |
|-----------|-------------|
| `src/components/Studio/hooks/useVirtualBlocks.js` | Studio hook |
| `src/hooks/useVirtualBlockNavigation.js` | Navigation hook |

### 2.5 Exercise Tab Components (REQUIRED)

| File Path | Description |
|-----------|-------------|
| `src/components/Studio/components/ExerciseTab/ExerciseTab.jsx` | Exercise tab component |
| `src/components/Studio/components/ExerciseTab/ExercisePlayerModal.jsx` | Player modal |

### 2.6 Integration Files (MODIFY - Do Not Remove)

These files contain virtual blocks/exercise tab code but also contain other features. You need to include the relevant changes, not remove the entire file:

| File Path | What to Include |
|-----------|-----------------|
| `src/components/Modal/Modal.jsx` | Modal registry entries for virtual block modals |
| `src/components/Studio/Studio.jsx` | Virtual blocks state and props |
| `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx` | VirtualBlocks component usage |
| `src/components/Studio/context/StudioContext.jsx` | Virtual blocks context |
| `src/components/Book/BookViewer/BookViewer.jsx` | Virtual blocks rendering |
| `src/components/Studio/constants/tabs.constants.js` | Exercise tab constant |
| `src/config/tabs.config.json` | Exercise tab configuration |
| `src/services/api.js` | `getExercises()` function |

### 2.7 Documentation Files (OPTIONAL)

| File Path | Description |
|-----------|-------------|
| `docs/EXERCISE_TAB_PLAN.md` | Exercise tab planning doc |
| `docs/EXERCISE_TAB_QUIZ_MODE_PLAN.md` | Quiz mode planning doc |
| `docs/2026-01-09/VIRTUAL_BLOCKS_REFACTORING_SUMMARY.md` | Refactoring summary |
| `docs/2026-01-09/VIRTUAL_BLOCKS_NAVIGATION_PLAN.md` | Navigation plan |
| `docs/2026-01-09/VIRTUAL_BLOCKS_NAVIGATION_IMPLEMENTATION_COMPLETE.md` | Implementation doc |
| `docs/2026-01-09/VIRTUALBLOCKS_REFACTORING_PLAN.md` | Refactoring plan |

---

## Phase 3: Extraction Strategy

### Option A: Cherry-Pick Commits (Recommended if commits are clean)

Use this approach if virtual blocks/exercise tab changes are in separate commits:

```bash
# 1. Switch to IBook branch
git checkout IBook

# 2. Create feature branch from IBook
git checkout -b feature/virtual-blocks-exercise-tab

# 3. Find commits related to virtual blocks and exercise tab
git log --oneline --all -- "src/utils/virtual-blocks.js" "src/components/VirtualBlocks/*" "src/components/Studio/components/ExerciseTab/*"

# 4. Cherry-pick each relevant commit
git cherry-pick <commit-hash-1>
git cherry-pick <commit-hash-2>
# ... continue for all relevant commits

# 5. Resolve conflicts if any (see Phase 4)
```

### Option B: Manual File Copy (Recommended if commits are mixed)

Use this approach if virtual blocks changes are mixed with other features:

```bash
# 1. Ensure you're on the development branch with the features
git checkout IBook-2-development

# 2. Create a list of files to extract (save current state)
# Create a temporary directory
mkdir -p /tmp/vb-extract

# 3. Copy all virtual blocks files
cp -r src/utils/virtual-blocks.js /tmp/vb-extract/
cp -r src/utils/virtual-blocks.test.js /tmp/vb-extract/
cp -r src/components/VirtualBlocks /tmp/vb-extract/
cp -r src/components/Modal/VirtualBlockContentModal /tmp/vb-extract/
cp -r src/components/Modal/VirtualBlockReaderModal /tmp/vb-extract/
cp -r src/components/Modal/VirtualBlockReaderNavigationModal /tmp/vb-extract/
cp -r src/components/Studio/hooks/useVirtualBlocks.js /tmp/vb-extract/
cp -r src/hooks/useVirtualBlockNavigation.js /tmp/vb-extract/
cp -r src/components/Studio/components/ExerciseTab /tmp/vb-extract/

# 4. Save integration file diffs
git diff IBook -- src/components/Modal/Modal.jsx > /tmp/vb-extract/modal-diff.patch
git diff IBook -- src/components/Studio/Studio.jsx > /tmp/vb-extract/studio-diff.patch
git diff IBook -- src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx > /tmp/vb-extract/selector-diff.patch
git diff IBook -- src/services/api.js > /tmp/vb-extract/api-diff.patch
git diff IBook -- src/components/Studio/constants/tabs.constants.js > /tmp/vb-extract/tabs-diff.patch
git diff IBook -- src/config/tabs.config.json > /tmp/vb-extract/config-diff.patch

# 5. Switch to IBook and create feature branch
git checkout IBook
git checkout -b feature/virtual-blocks-exercise-tab

# 6. Copy files back
cp /tmp/vb-extract/virtual-blocks.js src/utils/
cp /tmp/vb-extract/virtual-blocks.test.js src/utils/
cp -r /tmp/vb-extract/VirtualBlocks src/components/
mkdir -p src/components/Modal/VirtualBlockContentModal
mkdir -p src/components/Modal/VirtualBlockReaderModal
mkdir -p src/components/Modal/VirtualBlockReaderNavigationModal
cp -r /tmp/vb-extract/VirtualBlockContentModal/* src/components/Modal/VirtualBlockContentModal/
cp -r /tmp/vb-extract/VirtualBlockReaderModal/* src/components/Modal/VirtualBlockReaderModal/
cp -r /tmp/vb-extract/VirtualBlockReaderNavigationModal/* src/components/Modal/VirtualBlockReaderNavigationModal/
cp /tmp/vb-extract/useVirtualBlocks.js src/components/Studio/hooks/
mkdir -p src/hooks
cp /tmp/vb-extract/useVirtualBlockNavigation.js src/hooks/
mkdir -p src/components/Studio/components/ExerciseTab
cp -r /tmp/vb-extract/ExerciseTab/* src/components/Studio/components/ExerciseTab/

# 7. Apply patches for integration files (review each one)
git apply --check /tmp/vb-extract/modal-diff.patch  # Check first
git apply /tmp/vb-extract/modal-diff.patch          # Apply if check passes
# Repeat for other patches, resolving conflicts manually if needed

# 8. Stage and commit
git add -A
git commit -m "Add Virtual Blocks and Exercise Tab features

- Add virtual blocks utility functions and constants
- Add VirtualBlocks and VirtualBlock components
- Add virtual block modals (Content, Reader, Navigation)
- Add useVirtualBlocks and useVirtualBlockNavigation hooks
- Add ExerciseTab component and ExercisePlayerModal
- Update Modal registry with new modals
- Update Studio integration
- Add getExercises API function

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 4: Conflict Resolution

### Common Conflicts and Solutions

#### 4.1 Modal.jsx Conflicts
If Modal.jsx has different modal registrations:
```javascript
// Ensure these entries exist in MODAL_COMPONENTS:
const MODAL_COMPONENTS = {
  // ... existing modals
  "virtual-block-content": VirtualBlockContentModal,
  "virtual-block-reader": VirtualBlockReaderModal,
  "virtual-block-reader-nav": VirtualBlockReaderNavigationModal,
};
```

#### 4.2 Studio.jsx Conflicts
Ensure these imports and usages exist:
```javascript
// Imports
import { parseVirtualBlocksFromPages } from "../../utils/virtual-blocks";
import useVirtualBlocks from "./hooks/useVirtualBlocks";

// State initialization
const [virtualBlocks, setVirtualBlocks] = React.useState(() =>
  subObject ? [] : parseVirtualBlocksFromPages(pages)
);

// Hook usage
const { showVB, onClickToggleVirutalBlocks } = useVirtualBlocks({...});
```

#### 4.3 tabs.constants.js Conflicts
Ensure EXERCISE tab is defined:
```javascript
export const LEFT_TAB_NAMES = {
  // ... other tabs
  EXERCISE: {
    label: "Exercise",
    icon: "Exercise",
    modes: ["studio"],
    component: "ExerciseTab",
  },
};
```

#### 4.4 api.js Conflicts
Ensure getExercises function exists:
```javascript
export const getExercises = async (chapterId) => {
  try {
    const response = await instance.get(`/chapters/${chapterId}/exercises`);
    return response.data;
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return [];
  }
};
```

---

## Phase 5: Testing

### 5.1 Build Verification
```bash
# Ensure the app builds without errors
npm install
npm run build
```

### 5.2 Feature Testing Checklist

#### Virtual Blocks
- [ ] Virtual blocks toggle button works
- [ ] Virtual blocks grid appears when toggled
- [ ] Can add content to virtual block locations
- [ ] Can edit content in virtual blocks
- [ ] Can delete content from virtual blocks
- [ ] Virtual block content modal opens
- [ ] Virtual block reader modal works
- [ ] Navigation between content items works
- [ ] Text, link, and object content types display correctly

#### Exercise Tab
- [ ] Exercise tab appears in Studio left panel
- [ ] Exercises load for chapter
- [ ] Can select and play exercises
- [ ] Exercise player modal works
- [ ] Question navigation works

### 5.3 Unit Tests
```bash
npm test -- --testPathPattern="virtual-blocks"
```

---

## Phase 6: Merge to IBook

### 6.1 Push Feature Branch
```bash
git push -u origin feature/virtual-blocks-exercise-tab
```

### 6.2 Create Pull Request
```bash
gh pr create \
  --base IBook \
  --head feature/virtual-blocks-exercise-tab \
  --title "Add Virtual Blocks and Exercise Tab features" \
  --body "## Summary
- Adds Virtual Blocks feature for educational content organization
- Adds Exercise Tab for chapter exercises
- Includes all modals, hooks, and components

## Features Added
### Virtual Blocks
- 9 block types: Overview, Notes, Recall, Example, etc.
- 18 position locations on page grid
- Content types: text, link, object
- Reader and editor modes

### Exercise Tab
- Exercise list display
- Exercise player modal
- Question navigation

## Test Plan
- [ ] Build passes
- [ ] Virtual blocks toggle works
- [ ] Can add/edit/delete virtual block content
- [ ] Exercise tab loads exercises
- [ ] Exercise player works

🤖 Generated with Claude Code"
```

### 6.3 Merge After Review
```bash
# After PR approval
git checkout IBook
git merge feature/virtual-blocks-exercise-tab
git push origin IBook
```

---

## Phase 7: Cleanup

### 7.1 Delete Feature Branch (Optional)
```bash
# Local
git branch -d feature/virtual-blocks-exercise-tab

# Remote
git push origin --delete feature/virtual-blocks-exercise-tab
```

### 7.2 Verify IBook Branch
```bash
git checkout IBook
npm install
npm run build
npm start
```

---

## Quick Reference: File Count Summary

| Category | Files | Lines (approx) |
|----------|-------|----------------|
| Core Utils | 2 | ~350 |
| Components | 6 | ~600 |
| Modals | 11 | ~800 |
| Hooks | 2 | ~200 |
| Integration Changes | 7 | varies |
| **Total New Files** | **21** | ~1,950 |

---

## Troubleshooting

### Issue: "File not found" errors after merge
**Solution**: Check if directory structure exists. Create missing directories:
```bash
mkdir -p src/components/VirtualBlocks/VirtualBlock
mkdir -p src/components/Modal/VirtualBlockContentModal
mkdir -p src/components/Modal/VirtualBlockReaderModal
mkdir -p src/components/Modal/VirtualBlockReaderNavigationModal
mkdir -p src/components/Studio/components/ExerciseTab
mkdir -p src/hooks
```

### Issue: Import errors
**Solution**: Verify all imports match the new file locations. Check barrel exports (index.js files).

### Issue: Missing dependencies
**Solution**: These features use standard dependencies already in package.json. If any are missing, install:
```bash
npm install uuid  # for v4 uuid generation
```

### Issue: Styles not applying
**Solution**: Check SCSS module imports use correct paths and file names.

---

## Notes

- The Virtual Blocks feature is integrated into both Studio (authoring) and BookViewer (reading)
- Exercise Tab is currently only in Studio mode
- Both features use the global modal system via Zustand store
- Virtual blocks data is stored in `page.v_blocks` structure on the backend
