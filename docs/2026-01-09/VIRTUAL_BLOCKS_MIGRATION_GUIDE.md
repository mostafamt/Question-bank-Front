# Virtual Blocks Migration Guide

## Overview

This guide explains how the Virtual Blocks system handles backward compatibility with legacy data and how to test migration functionality.

---

## Data Structure Changes

### Legacy Format (Old)

```javascript
virtualBlocks = {
  TM: {
    label: "Notes 📝",
    id: "<p>content</p>",
    status: "updated",
    contentType: "text"
  },
  // ... other locations
}
```

**Characteristics:**
- Single item per location
- Flat structure with label, id, status, contentType
- Used in older versions of the application

### New Format (Current)

```javascript
virtualBlocks = {
  TM: {
    contents: [
      {
        type: "text",
        iconLocation: "TM",
        contentType: "Notes 📝",
        contentValue: "<p>content</p>"
      },
      // Multiple items supported
    ]
  },
  // ... other locations
}
```

**Characteristics:**
- Multiple items per location
- Contents array structure
- Each item has type, iconLocation, contentType, contentValue
- Supports text, link, and object content types

---

## How Migration Works

### Automatic Migration

The system automatically detects and migrates legacy data when:

1. **Loading Pages**: `parseVirtualBlocksFromPages(pages)`
2. **Loading Active Page**: `parseVirtualBlocksFromActivePage(page)`

### Detection Logic

The parsing functions detect legacy format by checking:
- If `v_block.contents` exists → New format
- If `v_block.iconLocation` and `v_block.contentValue` exist → Legacy format

### Migration Process

1. **Detect Format**: Check if data is legacy or new
2. **Convert Structure**: Transform flat structure to contents array
3. **Infer Content Type**: Use `inferContentType()` to determine type
4. **Preserve Data**: All original data is maintained

---

## Testing Migration

### Running Tests in Browser Console

1. **Open Application** in browser
2. **Open Developer Console** (F12)
3. **Run Tests**:
   ```javascript
   // Run all tests
   virtualBlocksTests.runAllTests()

   // Run individual tests
   virtualBlocksTests.testMigrateLegacyVirtualBlocks()
   virtualBlocksTests.testParseLegacyPage()
   virtualBlocksTests.testParseNewPage()
   virtualBlocksTests.testParseMultiplePages()
   virtualBlocksTests.testFormatForSubmission()
   virtualBlocksTests.testFormatEmptyBlocks()
   ```

### Test Coverage

The test suite covers:

**✅ Test 1: Migrate Legacy Virtual Blocks**
- Converts old single-item structure to new contents array
- Verifies correct type inference
- Checks empty location handling

**✅ Test 2: Parse Legacy Page Data**
- Tests parsing old page data from API
- Verifies conversion to new structure
- Ensures data integrity

**✅ Test 3: Parse New Page Data**
- Tests parsing new page data format
- Verifies multiple items per location
- Checks content types

**✅ Test 4: Parse Multiple Pages (Mixed Formats)**
- Tests handling mix of old and new pages
- Verifies array processing
- Ensures consistency

**✅ Test 5: Format for Submission**
- Tests submission format generation
- Verifies API schema compliance
- Checks all required fields

**✅ Test 6: Format Empty Virtual Blocks**
- Tests handling of pages with no virtual blocks
- Verifies null return for empty data
- Ensures no unnecessary API calls

---

## Migration Examples

### Example 1: Migrating Single Item

**Input (Legacy):**
```javascript
{
  TM: {
    label: "Notes 📝",
    id: "<p>My note</p>",
    status: "updated",
    contentType: "text"
  }
}
```

**Output (Migrated):**
```javascript
{
  TM: {
    contents: [
      {
        type: "text",
        iconLocation: "TM",
        contentType: "Notes 📝",
        contentValue: "<p>My note</p>"
      }
    ]
  }
}
```

### Example 2: Parsing Legacy Page

**Input (API Response):**
```javascript
{
  _id: "66e45a62435fef004a665159",
  v_blocks: [
    {
      iconLocation: "TM",
      contentType: "Notes 📝",
      contentValue: "<p>Legacy note</p>"
    },
    {
      iconLocation: "TR",
      contentType: "Recall",
      contentValue: "507f1f77bcf86cd799439011"
    }
  ]
}
```

**Output (Parsed):**
```javascript
{
  TM: {
    contents: [
      {
        type: "text",
        iconLocation: "TM",
        contentType: "Notes 📝",
        contentValue: "<p>Legacy note</p>"
      }
    ]
  },
  TR: {
    contents: [
      {
        type: "object",
        iconLocation: "TR",
        contentType: "Recall",
        contentValue: "507f1f77bcf86cd799439011"
      }
    ]
  },
  // ... other locations with empty arrays
}
```

---

## Content Type Inference

The system automatically infers content type when not explicitly provided:

### Inference Rules

1. **Text**: If `contentType` is "Notes 📝" or "Summary 📋"
2. **Link**: If `contentValue` matches URL pattern (`/^https?:\/\//`)
3. **Object**: Default for all other cases (interactive objects)

### Example

```javascript
// Infers "text"
{ contentType: "Notes 📝", contentValue: "<p>Text</p>" }

// Infers "link"
{ contentValue: "https://example.com" }

// Infers "object"
{ contentType: "Recall", contentValue: "507f1f77bcf86cd799439011" }
```

---

## Submission Format

### Generated Format (matches submit.json)

```json
{
  "blocks": [...],
  "v_blocks": [
    {
      "pageId": "66e45a6f435fef004a66515d",
      "contents": [
        {
          "type": "text",
          "iconLocation": "TM",
          "contentType": "Notes 📝",
          "contentValue": "<p>test</p>"
        },
        {
          "type": "link",
          "iconLocation": "TM",
          "contentType": "Notes 📝",
          "contentValue": "https://example.com"
        },
        {
          "type": "object",
          "iconLocation": "TR",
          "contentType": "Recall",
          "contentValue": "66e45a6f435fef004a66515d"
        }
      ]
    }
  ]
}
```

---

## Common Migration Scenarios

### Scenario 1: Existing Book with Legacy Data

**What happens:**
1. User opens existing book
2. API returns legacy v_blocks format
3. `parseVirtualBlocksFromPages()` detects legacy format
4. Data is automatically converted to new format
5. User sees virtual blocks normally
6. On save, data is submitted in new format

**Result:** ✅ Seamless migration, no data loss

### Scenario 2: New Book with New Data

**What happens:**
1. User creates new book
2. Adds virtual blocks with multiple items
3. Data is stored in new format
4. Parsing recognizes new format
5. No migration needed

**Result:** ✅ Direct usage of new format

### Scenario 3: Mixed Pages

**What happens:**
1. Book has some pages with legacy data
2. Other pages have new format data
3. Parser handles each page individually
4. Legacy pages migrate automatically
5. New pages pass through unchanged

**Result:** ✅ Both formats coexist during transition

---

## Troubleshooting

### Issue: Virtual blocks not displaying

**Check:**
1. Are v_blocks present in page data?
2. Is data in recognized format?
3. Are contents arrays properly formed?

**Solution:**
- Open console and run `virtualBlocksTests.runAllTests()`
- Check for parsing errors in console
- Verify API response format

### Issue: Data not saving correctly

**Check:**
1. Is `formatVirtualBlocksForSubmission()` being called?
2. Is formatted data included in submission?
3. Does API accept new format?

**Solution:**
- Check `handleSubmit` in ScanAndUpload.jsx
- Verify submission payload in Network tab
- Confirm with backend team about API schema

### Issue: Legacy data lost after migration

**Diagnosis:**
- This should not happen - migration preserves all data
- Run test suite to verify migration logic

**Solution:**
- Check console for errors during parsing
- Verify `inferContentType()` is working correctly
- Report issue if data loss occurs

---

## Best Practices

### For Frontend Development

1. **Always use parsing functions** when loading page data
2. **Use helper functions** for modifying virtual blocks:
   - `addContentToLocation()`
   - `removeContentFromLocation()`
   - `updateContentAtLocation()`
3. **Use formatting function** when submitting:
   - `formatVirtualBlocksForSubmission()`
4. **Test with mixed data** during development

### For Backend Development

1. **Accept both formats** during transition period
2. **Store data in new format** going forward
3. **Provide migration endpoint** if needed
4. **Document API schema** clearly

### For Testing

1. **Run test suite** after any virtual blocks changes
2. **Test with real data** from production
3. **Verify backward compatibility** before deployment
4. **Monitor errors** in production after deployment

---

## Migration Timeline

### Phase 1: Implementation (Complete)
- ✅ New data structures implemented
- ✅ Migration functions created
- ✅ Parsing functions updated
- ✅ UI components refactored

### Phase 2: Testing (Current)
- ✅ Test suite created
- ⏳ Manual testing with real data
- ⏳ Edge case testing

### Phase 3: Deployment
- ⏳ Backend API updates
- ⏳ Frontend deployment
- ⏳ Monitor migration in production

### Phase 4: Cleanup (Future)
- Legacy format support can be removed after all data migrated
- Simplify parsing logic
- Remove inference code if no longer needed

---

## API Schema Reference

### Legacy v_blocks Format

```json
"v_blocks": [
  {
    "iconLocation": "TM",
    "contentType": "Notes 📝",
    "contentValue": "<p>content</p>",
    "status": "updated"
  }
]
```

### New v_blocks Format

```json
"v_blocks": [
  {
    "pageId": "66e45a6f435fef004a66515d",
    "contents": [
      {
        "type": "text",
        "iconLocation": "TM",
        "contentType": "Notes 📝",
        "contentValue": "<p>content</p>"
      }
    ]
  }
]
```

---

## Support

For questions or issues:
1. Check this migration guide
2. Run test suite to verify functionality
3. Review console logs for errors
4. Contact development team

---

**Last Updated**: 2026-01-09
**Version**: 1.0
**Status**: Active Migration Period
