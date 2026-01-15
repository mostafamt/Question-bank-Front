# Object Metadata Display in ContentItemList - Implementation Plan

## Overview
Enhance the ContentItemList component to display meaningful object metadata (name and type/category) instead of just showing "Object ID: xyz" for object content items.

---

## Current State

### ContentItemList Preview Display
**Location:** `src/components/Modal/VirtualBlockContentModal/ContentItemList.jsx` (lines 82-83)

**Current Implementation:**
```javascript
case "object":
  return `Object ID: ${item.contentValue}`;
```

**Issues:**
- ❌ Shows cryptic MongoDB ObjectId instead of human-readable name
- ❌ No indication of what type of object it is (question, illustration, etc.)
- ❌ User must click Play to see what the object contains
- ❌ Poor UX for managing multiple objects

---

## API Response Structure

### Endpoint
```
GET https://questions-api-navy.vercel.app/api/interactive-objects/{objectId}
```

### Example Response
```json
{
  "_id": "6966958756cf6b0004125277",
  "questionName": "تكوين جزئ الهيدروجين",
  "type": "Image Blinder (Agamotto)",
  "baseType": "Image Blinder (Agamotto)",
  "domainName": "Science",
  "subDomainName": "Chemistry",
  "topic": "topic",
  "owner": "public",
  "objectOwner": "me",
  "language": "en",
  "isAnswered": "g",
  "createdAt": "2026-01-13T18:57:11.653Z",
  "updatedAt": "2026-01-13T18:57:15.078Z"
}
```

### Key Fields for Display
- **`questionName`** - Human-readable object name (may be in Arabic or English)
- **`type`** or **`baseType`** - Object type/category (e.g., "Image Blinder (Agamotto)", "Text MCQ", "TrueFalse")
- **`domainName`** - Subject domain (e.g., "Science", "Math")
- **`subDomainName`** - Sub-domain (e.g., "Chemistry", "Algebra")

---

## Existing Code Analysis

### Available API Function
**Location:** `src/api/bookapi.js`

```javascript
export const getObject = async (id) => {
  const url = `/interactive-objects/${id}`;
  try {
    const res = await axios.get(url);
    return res.data;  // Returns full object data
  } catch (error) {
    toast.error(error?.message);
    return "";
  }
};
```

### Current ContentItemList Structure
**Component:** ContentItemList.jsx

**Props:**
- `contents` - Array of content items
- `selectedLabel` - Block label
- `onEdit`, `onDelete` - Action handlers

**Content Item Structure:**
```javascript
{
  type: "object",
  iconLocation: "TM",
  contentType: "Notes 📝",
  contentValue: "6966958756cf6b0004125277"  // Object ID
}
```

---

## Proposed Solution

### Option A: Fetch Metadata on Component Mount (RECOMMENDED)

**Approach:**
1. Fetch object metadata for all object-type items when component mounts
2. Store metadata in component state
3. Display name and type in preview section
4. Show loading skeleton while fetching
5. Handle errors gracefully with fallback to object ID

**Pros:**
- ✅ Clean separation of concerns
- ✅ Better UX with loading states
- ✅ Can use React Query for caching
- ✅ Batch fetching possible (parallel Promise.all)
- ✅ Metadata available for all items immediately
- ✅ Consistent with existing patterns (PlayObjectModal2, RadioQuestionsTable)

**Cons:**
- Additional API calls on modal open
- Slight delay before metadata appears

**Implementation Strategy:**
```javascript
// State management
const [objectMetadata, setObjectMetadata] = useState({});
const [loadingMetadata, setLoadingMetadata] = useState(true);

// Fetch metadata on mount
useEffect(() => {
  const fetchObjectMetadata = async () => {
    const objectItems = contents.filter(item => item.type === 'object');
    if (objectItems.length === 0) {
      setLoadingMetadata(false);
      return;
    }

    setLoadingMetadata(true);
    try {
      // Fetch all objects in parallel
      const promises = objectItems.map(item =>
        getObject(item.contentValue)
          .then(data => ({ id: item.contentValue, data }))
          .catch(err => ({ id: item.contentValue, error: err }))
      );

      const results = await Promise.all(promises);

      // Build metadata map
      const metadataMap = {};
      results.forEach(result => {
        if (result.data) {
          metadataMap[result.id] = {
            name: result.data.questionName,
            type: result.data.type || result.data.baseType,
            domain: result.data.domainName,
            subDomain: result.data.subDomainName,
          };
        }
      });

      setObjectMetadata(metadataMap);
    } catch (error) {
      console.error("Error fetching object metadata:", error);
    } finally {
      setLoadingMetadata(false);
    }
  };

  fetchObjectMetadata();
}, [contents]);

// Display logic
const getContentPreview = (item) => {
  if (item.type === 'object') {
    const metadata = objectMetadata[item.contentValue];

    if (loadingMetadata) {
      return "Loading object details...";
    }

    if (metadata) {
      return (
        <>
          <strong>{metadata.name}</strong>
          <br />
          <small>Type: {metadata.type}</small>
          {metadata.domain && <small> • {metadata.domain}</small>}
        </>
      );
    }

    // Fallback if fetch failed
    return `Object ID: ${item.contentValue}`;
  }

  // ... existing text/link logic
};
```

---

### Option B: React Query for Individual Objects

**Approach:**
1. Create separate component `ObjectPreview` for object items
2. Use React Query to fetch metadata per object
3. Leverage automatic caching and refetching

**Pros:**
- ✅ Automatic caching per object ID
- ✅ Built-in loading/error states
- ✅ Refetch on stale data
- ✅ Deduplication of requests

**Cons:**
- ❌ More complex component structure
- ❌ Separate component needed
- ❌ N separate queries instead of batch

**Implementation:**
```javascript
// New component: ObjectPreview.jsx
const ObjectPreview = ({ objectId }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['object', objectId],
    queryFn: () => getObject(objectId),
    staleTime: 5 * 60 * 1000,  // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  if (isLoading) return <Skeleton variant="text" />;
  if (error) return <Typography variant="caption">Object ID: {objectId}</Typography>;

  return (
    <Box>
      <Typography variant="body2" fontWeight="bold">
        {data.questionName}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Type: {data.type} • {data.domainName}
      </Typography>
    </Box>
  );
};

// In ContentItemList
{item.type === 'object' ? (
  <ObjectPreview objectId={item.contentValue} />
) : (
  <Typography variant="body2">{getContentPreview(item)}</Typography>
)}
```

---

### Option C: Lazy Loading on Hover/Expand

**Approach:**
1. Show object ID initially
2. Fetch metadata on hover or expand action
3. Cache fetched data to avoid refetching

**Pros:**
- ✅ No API calls until needed
- ✅ Faster initial render

**Cons:**
- ❌ Poor UX (requires hover)
- ❌ Still shows cryptic IDs initially
- ❌ More complex interaction logic

**Not Recommended** - Doesn't solve the core UX issue.

---

## Recommended Approach: **Option A (Fetch on Mount)**

### Justification
1. **Better UX:** Users see meaningful names immediately
2. **Simpler Code:** Single useEffect, no new components
3. **Batch Performance:** Parallel fetching with Promise.all
4. **Graceful Degradation:** Falls back to ID if fetch fails
5. **Consistent Patterns:** Matches existing codebase patterns

### Visual Mockup

**Before:**
```
┌─────────────────────────────────────────────────┐
│ Object 🎮                                       │
│ Object ID: 6966958756cf6b0004125277             │
│                          [▶️] [✏️] [🗑️]        │
└─────────────────────────────────────────────────┘
```

**After (Loading):**
```
┌─────────────────────────────────────────────────┐
│ Object 🎮                                       │
│ Loading object details...                      │
│                          [▶️] [✏️] [🗑️]        │
└─────────────────────────────────────────────────┘
```

**After (Loaded):**
```
┌─────────────────────────────────────────────────┐
│ Object 🎮                                       │
│ تكوين جزئ الهيدروجين                            │
│ Type: Image Blinder (Agamotto) • Science       │
│                          [▶️] [✏️] [🗑️]        │
└─────────────────────────────────────────────────┘
```

**After (Error Fallback):**
```
┌─────────────────────────────────────────────────┐
│ Object 🎮                                       │
│ Object ID: 6966958756cf6b0004125277             │
│                          [▶️] [✏️] [🗑️]        │
└─────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Phase 1: Basic Metadata Fetching
1. ✅ Read current ContentItemList.jsx
2. Import `getObject` from `api/bookapi`
3. Add state for object metadata and loading
4. Add useEffect to fetch metadata on mount
5. Implement parallel fetching with Promise.all
6. Update `getContentPreview()` for object type

### Phase 2: Enhanced Display
1. Format object preview with name and type
2. Add loading skeleton/placeholder
3. Handle RTL text (Arabic names)
4. Truncate long names (keep 100 char limit)
5. Add domain/subdomain to display

### Phase 3: Error Handling & Optimization
1. Graceful fallback to object ID on error
2. Add error logging
3. Consider caching metadata in component state
4. Add optional tooltip with full metadata

---

## Technical Considerations

### Performance
- **Parallel Fetching:** Use `Promise.all()` to fetch all objects simultaneously
- **Request Limit:** For many objects (10+), consider implementing pagination or lazy loading
- **Caching:** Store in component state, refresh on contents change
- **Network Cost:** Each object = 1 API call (no batch endpoint available)

### Error Handling
- **Invalid Object ID:** Fall back to showing ID
- **Network Errors:** Show fallback, log to console
- **Empty Response:** Handle missing fields gracefully
- **Timeout:** No timeout needed (axios default is sufficient)

### Internationalization (i18n)
- **Arabic Text:** Object names may be in Arabic (RTL support needed)
- **Type Names:** May be in English or mixed
- **Display:** Use `Typography` component (handles RTL automatically)

### Loading States
- **Initial Load:** Show "Loading object details..."
- **Skeleton:** Optional Skeleton component for polished UX
- **Per-Item Loading:** Not needed (batch fetch on mount)

### Data Validation
```javascript
// Safe field access
const metadata = {
  name: result.data?.questionName || 'Unnamed Object',
  type: result.data?.type || result.data?.baseType || 'Unknown Type',
  domain: result.data?.domainName || '',
  subDomain: result.data?.subDomainName || '',
};
```

---

## Files to Modify

### Core Changes
1. **src/components/Modal/VirtualBlockContentModal/ContentItemList.jsx**
   - Add metadata fetching logic
   - Update preview display for objects
   - Import `getObject` from API

### Optional Enhancements (Future)
2. **src/utils/object-metadata.js** (new file)
   - Create reusable metadata caching utility
   - Similar to `object-url.js` but for full metadata
   - Cache expiry: 30 minutes

3. **src/components/Modal/VirtualBlockContentModal/ObjectPreview.jsx** (new component)
   - Separate component for object preview
   - If Option B is chosen later

---

## Testing Checklist

### Functional Testing
- [ ] Single object item displays name and type
- [ ] Multiple object items all fetch correctly
- [ ] Loading state shows before data loads
- [ ] Error handling works for invalid object IDs
- [ ] Fallback to object ID on fetch failure
- [ ] Non-object items (text, link) unaffected

### Display Testing
- [ ] Arabic text displays correctly (RTL)
- [ ] Long names are truncated appropriately
- [ ] Type and domain display clearly
- [ ] Matches visual mockup design
- [ ] Mobile responsive

### Performance Testing
- [ ] Multiple objects fetch in parallel
- [ ] No duplicate API calls
- [ ] Loading time acceptable (< 2 seconds for 5 objects)
- [ ] No memory leaks on unmount

### Edge Cases
- [ ] Empty object list (no objects)
- [ ] All objects fail to fetch
- [ ] Mixed valid/invalid object IDs
- [ ] Object deleted after content created
- [ ] Very long object names (100+ chars)
- [ ] Special characters in names

---

## API Call Examples

### Successful Response
```bash
GET /api/interactive-objects/6966958756cf6b0004125277

Response (200 OK):
{
  "_id": "6966958756cf6b0004125277",
  "questionName": "تكوين جزئ الهيدروجين",
  "type": "Image Blinder (Agamotto)",
  "domainName": "Science",
  "subDomainName": "Chemistry"
}
```

### Error Response
```bash
GET /api/interactive-objects/invalid-id

Response (404 Not Found):
{
  "error": "Object not found"
}
```

---

## Future Enhancements (Out of Scope)

1. **Metadata Caching Utility:**
   - Create `src/utils/object-metadata.js`
   - Similar to `object-url.js` with 30-min cache
   - Shared across components

2. **Thumbnail Preview:**
   - Fetch and display object thumbnail images
   - Show preview on hover

3. **Batch API Endpoint:**
   - Request backend team to create `POST /api/interactive-objects/batch`
   - Send array of IDs, receive array of metadata
   - Reduces API calls from N to 1

4. **Inline Editing:**
   - Edit object metadata directly in preview
   - Quick replace object without opening form

5. **Advanced Filtering:**
   - Filter content items by object type
   - Search by object name

---

## Questions for Review

1. **Should we show domain/subdomain in the preview?**
   - Pro: More context about object
   - Con: Takes more space
   - Recommendation: Show as optional chip or tooltip

2. **What to do with very long object names?**
   - Option A: Truncate to 100 chars (current limit)
   - Option B: Truncate to 50 chars, full name on hover
   - Recommendation: Option A (consistent with text preview)

3. **Loading state preference?**
   - Option A: Simple text "Loading..."
   - Option B: Skeleton component (polished but heavier)
   - Recommendation: Option A (simpler, faster)

4. **Should we cache metadata beyond component lifetime?**
   - Option A: State only (cleared on unmount)
   - Option B: Create metadata cache utility (persistent)
   - Recommendation: Option A for now, Option B if reused elsewhere

---

## Risk Assessment

### Low Risk
- ✅ API endpoint is stable and documented
- ✅ Existing `getObject()` function works reliably
- ✅ Similar patterns used throughout codebase
- ✅ Fallback to current behavior on error

### Medium Risk
- ⚠️ Performance with many objects (10+)
  - Mitigation: Parallel fetching, consider pagination
- ⚠️ Network latency on slow connections
  - Mitigation: Loading state, cache results

### Minimal Risk
- ⚡ Breaking existing functionality (only modifying preview)
- ⚡ API changes (stable endpoint)

---

## Timeline Estimate

- **Phase 1 (Basic Metadata):** 1-2 hours
  - Fetch logic: 30 min
  - Preview update: 30 min
  - Testing: 30-60 min

- **Phase 2 (Enhanced Display):** 1 hour
  - Formatting: 30 min
  - RTL/truncation: 30 min

- **Phase 3 (Error Handling):** 30-45 min
  - Fallbacks: 15 min
  - Testing edge cases: 15-30 min

**Total:** 2.5-4 hours

---

## Recommendation Summary

**Implement Option A (Fetch on Mount)** with parallel Promise.all fetching.

**Display Format:**
```
[Object Name]
Type: [Object Type] • [Domain]
```

**Rationale:**
- Simplest implementation
- Best UX (immediate metadata display)
- Minimal code changes
- Graceful error handling
- Consistent with existing patterns

**Next Steps:**
1. Get approval on approach (Option A confirmed?)
2. Decide on display format (name + type + domain?)
3. Implement Phase 1 (basic fetching)
4. Test and iterate
5. Deploy

---

**Author:** Claude Code
**Date:** January 15, 2026
**Status:** Awaiting Review
