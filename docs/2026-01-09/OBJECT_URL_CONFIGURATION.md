# Object URL Configuration Guide

## Overview

The `object-url.js` utility provides flexible URL retrieval for interactive objects to be displayed in iframes. It supports multiple strategies and includes caching for performance.

---

## Quick Start

### Basic Usage

```javascript
import { getObjectUrl } from '../utils/object-url';

// Get URL for an object
const url = await getObjectUrl('507f1f77bcf86cd799439011');

// Use in iframe
<iframe src={url} />
```

---

## URL Resolution Strategies

The utility tries multiple strategies in order:

### Strategy 1: Direct URL from API ✅ Recommended
If your API returns a URL field in the object response:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "playUrl": "https://example.com/play/abc123",
  // OR
  "url": "/play/multiple-choice/507f1f77bcf86cd799439011",
  // OR
  "embedUrl": "...",
  "playerUrl": "...",
  "contentUrl": "..."
}
```

The utility checks these fields in order: `playUrl`, `url`, `embedUrl`, `playerUrl`, `contentUrl`

### Strategy 2: Construct from Type
If your object has a type field:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "type": "Multiple Choice"
}
```

Generates: `/play/multiple-choice/507f1f77bcf86cd799439011`

### Strategy 3: Construct from Name
If your object has a name field:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Math Quiz Question 1"
}
```

Generates: `/play/math-quiz-question-1/507f1f77bcf86cd799439011`

### Strategy 4: Embedded HTML Content
If your object has embedded content:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "embedCode": "<div>Interactive content here</div>",
  // OR
  "htmlContent": "..."
}
```

Creates data URL with embedded HTML

### Strategy 5: Fallback Player
If none of the above work:

Generates: `/object-player/507f1f77bcf86cd799439011`

---

## Configuration

### Configure at App Initialization

**File**: `src/index.js` or `src/App.js`

```javascript
import { configureObjectUrl } from './utils/object-url';

// Configure based on your backend structure
configureObjectUrl({
  playerBasePath: '/play',           // Base path for player routes
  fallbackPlayer: '/object-player',  // Fallback player route
  useApiUrl: true,                   // Use URLs from API (Strategy 1)
  constructFromType: true,           // Construct from type (Strategy 2)
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `playerBasePath` | string | `/play` | Base path for constructed player routes |
| `fallbackPlayer` | string | `/object-player` | Fallback player route when no URL available |
| `useApiUrl` | boolean | `true` | Whether to use direct URLs from API response |
| `constructFromType` | boolean | `true` | Whether to construct URLs from object type |

---

## Recommended Configurations

### Option A: API Provides URLs (Recommended)

**Backend**: Returns `playUrl` or `url` field in object response

**Frontend Configuration**:
```javascript
configureObjectUrl({
  useApiUrl: true,
  constructFromType: false,  // Disable client-side URL construction
});
```

**Example API Response**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "playUrl": "/interactive/multiple-choice/507f1f77bcf86cd799439011",
  "questionName": "Question 1"
}
```

### Option B: Client-Side URL Construction

**Backend**: Provides object type, frontend constructs URL

**Frontend Configuration**:
```javascript
configureObjectUrl({
  playerBasePath: '/play',
  useApiUrl: false,
  constructFromType: true,
});
```

**Example API Response**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "type": "Multiple Choice",
  "questionName": "Question 1"
}
```

**Generated URL**: `/play/multiple-choice/507f1f77bcf86cd799439011`

### Option C: Hybrid Approach (Flexible)

**Frontend Configuration**:
```javascript
configureObjectUrl({
  useApiUrl: true,           // Try API URL first
  constructFromType: true,   // Fall back to construction
});
```

This tries Strategy 1, then Strategy 2, then fallback.

---

## Caching

URLs are automatically cached for 30 minutes to reduce API calls.

### Clear Cache

```javascript
import { clearUrlCache } from '../utils/object-url';

// Clear specific object
clearUrlCache('507f1f77bcf86cd799439011');

// Clear all cache
clearUrlCache();
```

### Cache Statistics

```javascript
import { getCacheStats } from '../utils/object-url';

const stats = getCacheStats();
console.log(stats);
// {
//   totalEntries: 10,
//   validEntries: 8,
//   expiredEntries: 2,
//   expiryTimeMs: 1800000
// }
```

---

## Prefetching (Performance Optimization)

Prefetch URLs for multiple objects at once:

```javascript
import { prefetchObjectUrls } from '../utils/object-url';

const objectIds = ['id1', 'id2', 'id3'];
const results = await prefetchObjectUrls(objectIds);

console.log(results);
// {
//   id1: { success: true, url: '/play/...' },
//   id2: { success: false, error: 'Object not found' },
//   id3: { success: true, url: '/play/...' }
// }
```

**Use case**: When loading a page with multiple virtual blocks, prefetch all object URLs.

---

## Error Handling

The utility throws descriptive errors:

```javascript
try {
  const url = await getObjectUrl(objectId);
} catch (error) {
  if (error.message === 'Object not found') {
    // Handle 404
  } else if (error.message.includes('Network error')) {
    // Handle network issues
  } else {
    // Generic error
  }
}
```

**Error Types**:
- `"Object ID is required"` - Missing object ID
- `"Object not found"` - 404 from API
- `"Network error. Please check your connection."` - Network failure
- `"Could not load object URL"` - Generic error

---

## URL Safety Validation

Validate URLs before using:

```javascript
import { isSafeUrl } from '../utils/object-url';

const url = "https://example.com";
if (isSafeUrl(url)) {
  // Safe to use in iframe
}
```

**Allowed**:
- Relative URLs: `/play/...`
- HTTP/HTTPS: `https://...`
- Data URLs: `data:text/html,...`

**Blocked**:
- JavaScript: `javascript:...`
- File: `file:///...`
- Other protocols

---

## Development Tools

In development mode, utilities are exposed to `window.objectUrlUtils`:

```javascript
// In browser console
window.objectUrlUtils.getObjectUrl('507f1f77bcf86cd799439011')
window.objectUrlUtils.getCacheStats()
window.objectUrlUtils.clearUrlCache()
window.objectUrlUtils.getUrlConfig()
```

---

## Backend Requirements

### Minimum Requirements

Your backend must provide:
1. **GET endpoint**: `/api/interactive-objects/:id`
2. **Response**: JSON object with at least `_id` field

### Recommended Response Structure

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "playUrl": "/play/multiple-choice/507f1f77bcf86cd799439011",  // Recommended
  "type": "Multiple Choice",                                      // Fallback
  "questionName": "Math Question 1",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Optimal Response (Option A)

Include `playUrl` field with ready-to-use URL:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "playUrl": "/interactive/507f1f77bcf86cd799439011",
  "type": "Multiple Choice",
  "questionName": "Question 1"
}
```

---

## Integration with VirtualBlockReaderModal

**File**: `src/components/Modal/VirtualBlockReaderModal/VirtualBlockReaderModal.jsx`

```javascript
import { getObjectUrl } from '../../../utils/object-url';

const handleViewContent = async (item) => {
  if (item.type === 'object') {
    setLoading(true);
    try {
      const url = await getObjectUrl(item.contentValue);
      openModal('iframe-display', {
        title: item.contentType,
        url: url,
      });
    } catch (error) {
      toast.error('Failed to load object');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
};
```

---

## Testing

### Manual Testing

```javascript
// 1. Test with real object ID
const url = await getObjectUrl('YOUR_REAL_OBJECT_ID');
console.log(url);

// 2. Test cache
getCacheStats(); // Should show 1 entry

// 3. Clear and test again
clearUrlCache();
getCacheStats(); // Should show 0 entries
```

### Unit Tests (Recommended)

```javascript
describe('getObjectUrl', () => {
  it('should fetch URL from API', async () => {
    const url = await getObjectUrl('mock-id');
    expect(url).toBeDefined();
  });

  it('should cache URLs', async () => {
    await getObjectUrl('mock-id');
    const stats = getCacheStats();
    expect(stats.validEntries).toBe(1);
  });

  it('should handle errors', async () => {
    await expect(getObjectUrl('invalid-id')).rejects.toThrow();
  });
});
```

---

## Troubleshooting

### Issue: URLs not working

**Check**:
1. API endpoint returns data: `GET /api/interactive-objects/:id`
2. Object has URL field or type field
3. Configuration matches backend structure
4. Browser console for errors

**Debug**:
```javascript
// Check configuration
window.objectUrlUtils.getUrlConfig()

// Check cache
window.objectUrlUtils.getCacheStats()

// Test specific object
window.objectUrlUtils.getObjectUrl('YOUR_ID')
  .then(console.log)
  .catch(console.error)
```

### Issue: Iframe not loading

**Check**:
1. URL is valid: `isSafeUrl(url)`
2. CORS settings on backend
3. Content-Security-Policy headers
4. Network tab in browser dev tools

### Issue: Cache not clearing

**Solution**:
```javascript
// Force clear
clearUrlCache();

// Or reload page
location.reload();
```

---

## Performance Tips

1. **Prefetch URLs**: Use `prefetchObjectUrls()` when loading pages
2. **Configure wisely**: Disable unused strategies
3. **Cache duration**: Default 30 minutes, adjust if needed
4. **Monitor cache**: Use `getCacheStats()` to optimize

---

## Migration Guide

### From Old System

If you have existing object playing functionality:

**Before**:
```javascript
openModal('play-object', { id: objectId });
```

**After**:
```javascript
const url = await getObjectUrl(objectId);
openModal('iframe-display', { title: 'Object', url });
```

---

## Next Steps

1. **Configure**: Add configuration to your app initialization
2. **Test**: Test with real object IDs
3. **Adjust**: Fine-tune based on your backend response
4. **Deploy**: Deploy with confidence

---

## Support

For questions:
1. Check this guide
2. Use development tools: `window.objectUrlUtils`
3. Check browser console for logs
4. Review backend API response structure

---

**Document Version**: 1.0
**Created**: 2026-01-09
**Status**: Active
