# Phase 2 Bug Fix Plan - Props Access Issue

**Date:** November 6, 2025
**Issue Type:** 🐛 Critical Bug
**Status:** 📋 Plan Created

---

## Problem Description

### The Issue

In the refactored `Studio.jsx`, there's a critical bug in the `onClickSubmit` function when Studio is used as a **sub-object modal**:

```javascript
const onClickSubmit = async () => {
  setLoadingSubmit(true);
  if (subObject) {
    const id = await handleSubmit(areasProperties[activePageIndex]);
    props.updateAreaProperty(-1, { text: id }); // ❌ ERROR: props is undefined
    id && toast.success("Sub-Object created successfully!");
    handleClose();
  }
  // ...
};
```

**Error:** `props.updateAreaProperty` is undefined because `props` is not available in `StudioContent`.

### Why This Happens

1. **Original Studio.jsx:**
   ```javascript
   const Studio = (props) => {
     const { updateAreaProperty, handleClose, ... } = props;
     // updateAreaProperty is directly accessible
   }
   ```

2. **Refactored Studio.jsx:**
   ```javascript
   const Studio = (props) => {
     return (
       <StudioProvider studioProps={props}>
         <StudioContent />
       </StudioProvider>
     );
   };

   const StudioContent = () => {
     // ❌ props is not available here!
     // ✅ Context is available via useStudioContext()
   }
   ```

### When This Bug Occurs

This bug occurs in a specific use case:

**Scenario:** Studio as a Sub-Object Modal
1. User is authoring a block with a complex content type (e.g., MultipleChoice, TrueFalse)
2. Parent Studio opens a modal with child Studio component to edit the sub-object
3. Parent passes `updateAreaProperty` function as a prop
4. Child Studio needs to call this function to update parent's area
5. **Bug:** Child Studio can't access parent's `updateAreaProperty`

### Impact

- **Severity:** 🔴 High (blocks sub-object creation)
- **Scope:** Sub-object modal functionality only
- **User Impact:** Cannot save complex interactive objects (MCQ, T/F, etc.)

---

## Root Cause Analysis

### Props Flow in Original Architecture

```
Parent Studio
  └─> props: { updateAreaProperty, handleClose, ... }
      └─> Studio component (receives all props directly)
          └─> Can call props.updateAreaProperty()
```

### Props Flow in Refactored Architecture

```
Parent Studio
  └─> props: { updateAreaProperty, handleClose, ... }
      └─> Studio component
          └─> StudioProvider (receives studioProps)
              ├─> Spreads into context: { ...restProps }
              └─> StudioContent (consumes context)
                  └─> Can access via useStudioContext()
```

### The Disconnect

- Props ARE passed to StudioProvider ✅
- Props ARE spread into context as `restProps` ✅
- Props ARE available in context ✅
- **BUT** StudioContent tries to access `props.updateAreaProperty` instead of context ❌

---

## Solution Strategy

### Option 1: Access from Context (Recommended) ⭐

**Approach:** Access the parent's `updateAreaProperty` from context

**Changes Required:**
1. Destructure `updateAreaProperty` from `useStudioContext()` in StudioContent
2. Update the call to use context value instead of `props`
3. Rename context variable to avoid conflict with hook's `updateAreaProperty`

**Pros:**
- Minimal changes
- Maintains refactored architecture
- Type-safe with TypeScript/JSDoc

**Cons:**
- Naming collision (two `updateAreaProperty` functions)
- Need to rename one of them

### Option 2: Pass Props to StudioContent

**Approach:** Pass props as a parameter to StudioContent

**Changes Required:**
```javascript
const Studio = (props) => {
  return (
    <StudioProvider studioProps={props}>
      <StudioContent parentProps={props} />
    </StudioProvider>
  );
};
```

**Pros:**
- Clear distinction between parent and local props
- Explicit prop passing

**Cons:**
- Redundant (props already in context)
- Breaks the context pattern
- More prop drilling

### Option 3: Separate Context for Parent Props

**Approach:** Create a separate context value for parent-passed props

**Changes Required:**
- Add `parentProps` to context structure
- Access via `parentProps.updateAreaProperty`

**Pros:**
- Clear namespace separation
- No naming collisions

**Cons:**
- More complex context structure
- Unnecessary for this issue

---

## Recommended Solution: Option 1 (Modified)

### Approach

1. **In Context:** Store parent's updateAreaProperty with a different name
2. **In StudioContent:** Destructure with alias to avoid collision

### Implementation Plan

#### Step 1: Identify Naming Conflict

We have TWO different `updateAreaProperty` functions:

1. **Local (from useAreaManagement):** Updates areas in current Studio instance
   - Updates `areasProperties` state
   - Used for regular area editing

2. **Parent (from props):** Updates parent Studio's area when in sub-object mode
   - Calls parent's updateAreaProperty function
   - Only used when `subObject === true`

#### Step 2: Create Naming Convention

**Naming Strategy:**
- Local: `updateAreaProperty` (keep as-is)
- Parent: `parentUpdateAreaProperty` or `updateParentArea`

#### Step 3: Update Context Provider

```javascript
// In StudioContext.jsx
export const StudioProvider = ({ children, studioProps }) => {
  const {
    pages,
    types,
    subObject,
    language: lang,
    chapterId,
    updateAreaProperty: parentUpdateAreaProperty, // Extract and rename
    handleClose,
    ...restProps
  } = studioProps;

  // ...

  const value = {
    // Parent-passed props (when Studio is a sub-object)
    parentUpdateAreaProperty, // Add explicitly
    handleClose,

    // Other props
    pages,
    types,
    subObject,
    chapterId,
    ...restProps,

    // ... rest of context
  };
};
```

#### Step 4: Update StudioContent

```javascript
const StudioContent = () => {
  const {
    // Parent props (for sub-object mode)
    parentUpdateAreaProperty,
    handleClose,

    // ... rest of context
  } = useStudioContext();

  const onClickSubmit = async () => {
    setLoadingSubmit(true);
    if (subObject) {
      const id = await handleSubmit(areasProperties[activePageIndex]);
      // ✅ Use parent's updateAreaProperty
      parentUpdateAreaProperty?.(-1, { text: id });
      id && toast.success("Sub-Object created successfully!");
      handleClose();
    } else {
      // ... regular submit
    }
    setLoadingSubmit(false);
  };
};
```

---

## Additional Issues to Check

While fixing this bug, check for other similar issues:

### 1. `handleClose` Function

**Location:** Same function, line:
```javascript
handleClose();
```

**Status:** ✅ Should work (handleClose is destructured from context)

### 2. `refetch` Function

**Location:** Non-subObject path:
```javascript
refetch();
```

**Status:** ✅ Should work (refetch is in restProps)

### 3. Other Parent Callbacks

Check if any other parent callbacks are used:
- `onSubmitAutoGenerate` - ✅ Destructured in StudioContent
- `loadingAutoGenerate` - ✅ Destructured in StudioContent
- `typeOfActiveType` (tOfActiveType) - ✅ Destructured in StudioContent

---

## Testing Plan

### Test Cases

#### Test 1: Sub-Object Creation Flow
1. Open main Studio
2. Create new area
3. Select complex content type (e.g., "Multiple Choice Question")
4. Sub-object modal should open
5. Create multiple choice options in sub-object Studio
6. Click submit
7. **Expected:** Sub-object ID passed to parent area
8. **Expected:** Parent area shows object ID as text
9. **Expected:** Modal closes
10. **Expected:** Success toast appears

#### Test 2: Regular (Non-Sub-Object) Flow
1. Open Studio normally
2. Create areas and blocks
3. Click submit
4. **Expected:** Blocks saved to server
5. **Expected:** Success toast appears
6. **Expected:** No errors in console

#### Test 3: Edge Cases
1. Submit with no areas created
2. Submit with OCR in progress
3. Rapid submit clicks (double-click)
4. Cancel sub-object modal without submitting

---

## Implementation Checklist

### Phase 1: Fix Context Provider
- [ ] Open `src/components/Studio/context/StudioContext.jsx`
- [ ] Extract `updateAreaProperty` from studioProps
- [ ] Rename to `parentUpdateAreaProperty`
- [ ] Add explicitly to context value
- [ ] Add JSDoc comment explaining purpose

### Phase 2: Fix StudioContent
- [ ] Open `src/components/Studio/Studio.jsx`
- [ ] Destructure `parentUpdateAreaProperty` from context
- [ ] Update `onClickSubmit` to use `parentUpdateAreaProperty`
- [ ] Add optional chaining (`?.`) for safety
- [ ] Verify `handleClose` is properly used

### Phase 3: Verify Other Props
- [ ] Check all uses of parent-passed props
- [ ] Ensure all are destructured from context
- [ ] Add null checks where needed

### Phase 4: Testing
- [ ] Test sub-object creation flow
- [ ] Test regular Studio flow
- [ ] Check console for errors
- [ ] Verify all parent callbacks work

### Phase 5: Documentation
- [ ] Update implementation summary
- [ ] Document naming convention
- [ ] Add comment in code explaining the distinction

---

## Files to Modify

1. **`src/components/Studio/context/StudioContext.jsx`**
   - Extract and rename parent's updateAreaProperty
   - Add to context value explicitly
   - Add JSDoc comment

2. **`src/components/Studio/Studio.jsx`**
   - Destructure `parentUpdateAreaProperty` from context
   - Update `onClickSubmit` function
   - Add safety checks

3. **`docs/2025-11-06/PHASE_2_IMPLEMENTATION_SUMMARY.md`**
   - Add bug fix section
   - Document naming convention

---

## Risk Assessment

**Risk Level:** 🟡 Medium

**Risks:**
1. **Breaking sub-object functionality:** Mitigated by thorough testing
2. **Breaking regular Studio:** Mitigated by only changing sub-object path
3. **Introducing new bugs:** Mitigated by minimal changes

**Mitigation:**
- Test both sub-object and regular flows
- Add optional chaining for safety
- Keep backup file for rollback

---

## Alternative Quick Fix (Not Recommended)

If time is critical, a quick fix would be:

```javascript
// In Studio component
const Studio = (props) => {
  return (
    <StudioProvider studioProps={props}>
      <StudioContent studioPropsForSubObject={props} />
    </StudioProvider>
  );
};

const StudioContent = ({ studioPropsForSubObject }) => {
  // Access via studioPropsForSubObject
};
```

**Why not recommended:**
- Defeats purpose of context
- Props passed twice (redundant)
- Not consistent with refactored architecture

---

## Post-Fix Improvements (Future)

### Improvement 1: Type Safety

Add TypeScript or better JSDoc types to distinguish:
```typescript
interface StudioOwnProps {
  pages: Page[];
  types: Type[];
  // ... Studio's own props
}

interface StudioParentProps {
  updateAreaProperty?: (idx: number, property: object) => void;
  handleClose?: () => void;
  // ... Props passed when Studio is a child
}
```

### Improvement 2: Separate Contexts

If this pattern repeats, consider:
```javascript
const StudioParentContext = createContext();
const StudioLocalContext = createContext();
```

### Improvement 3: Hook for Parent Communication

Create a dedicated hook:
```javascript
const useParentCommunication = () => {
  const { parentUpdateAreaProperty, handleClose } = useStudioContext();
  return {
    updateParent: parentUpdateAreaProperty,
    closeModal: handleClose,
  };
};
```

---

## Timeline

**Estimated Time:** 30 minutes

- Planning: ✅ Complete (this document)
- Implementation: 15 minutes
- Testing: 10 minutes
- Documentation: 5 minutes

---

## Success Criteria

- [x] Plan document created
- [ ] Context provider updated
- [ ] StudioContent updated
- [ ] Sub-object flow tested successfully
- [ ] Regular flow tested successfully
- [ ] No console errors
- [ ] Documentation updated

---

## References

- Original Studio.jsx: `src/components/Studio/Studio.jsx.backup`
- Phase 2 Summary: `docs/2025-11-06/PHASE_2_IMPLEMENTATION_SUMMARY.md`
- Context file: `src/components/Studio/context/StudioContext.jsx`

---

**Next Action:** Implement the fix following this plan.
