# Preview Service API Endpoints

**M1 Week 5: Preview Service**  
Based on Spec 07: Preview Service Specification

---

## Endpoints

### 1. Generate Preview

**POST** `/api/previews/generate`

Generate a preview for a specific target.

**Request Body:**
```json
{
  "target": {
    "type": "slide",
    "sceneId": "scene-123",
    "slideId": "slide-456"
  },
  "size": "sm",
  "options": {
    "priority": "normal",
    "skipCache": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "targetType": "slide",
    "targetId": "slide-456",
    "size": "sm",
    "hash": "abc123",
    "width": 160,
    "height": 120,
    "dataUrl": "data:image/jpeg;base64,...",
    "generatedAt": "2025-10-15T10:30:00Z"
  }
}
```

---

### 2. Get Preview

**GET** `/api/previews/{targetType}/{targetId}`

Retrieve an existing preview.

**Query Parameters:**
- `size` (optional): Preview size (`xs`, `sm`, `md`). Default: `sm`
- `regenerate` (optional): Force regeneration. Default: `false`

**Example:**
```
GET /api/previews/slide/slide-456?size=sm
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "targetType": "slide",
    "targetId": "slide-456",
    "size": "sm",
    "dataUrl": "data:image/jpeg;base64,...",
    "cached": true,
    "generatedAt": "2025-10-15T10:30:00Z"
  }
}
```

---

### 3. Batch Generate

**POST** `/api/previews/batch`

Generate previews for multiple targets at once.

**Request Body:**
```json
{
  "targets": [
    {
      "type": "slide",
      "sceneId": "scene-123",
      "slideId": "slide-1"
    },
    {
      "type": "slide",
      "sceneId": "scene-123",
      "slideId": "slide-2"
    }
  ],
  "size": "xs"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "previews": [
      {
        "targetId": "slide-1",
        "dataUrl": "data:image/jpeg;base64,...",
        "cached": false
      },
      {
        "targetId": "slide-2",
        "dataUrl": "data:image/jpeg;base64,...",
        "cached": true
      }
    ],
    "total": 2,
    "cached": 1,
    "generated": 1
  }
}
```

---

### 4. Invalidate Preview

**DELETE** `/api/previews/{targetType}/{targetId}`

Invalidate cached preview for a target.

**Query Parameters:**
- `allSizes` (optional): Invalidate all sizes. Default: `true`

**Response:**
```json
{
  "success": true,
  "message": "Preview invalidated",
  "data": {
    "targetType": "slide",
    "targetId": "slide-456",
    "sizesInvalidated": 3
  }
}
```

---

### 5. Invalidate Scene

**DELETE** `/api/previews/scene/{sceneId}`

Invalidate all previews for a scene.

**Response:**
```json
{
  "success": true,
  "message": "Scene previews invalidated",
  "data": {
    "sceneId": "scene-123",
    "previewsInvalidated": 15
  }
}
```

---

### 6. Get Cache Stats

**GET** `/api/previews/stats`

Get preview cache statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPreviews": 1250,
    "sizeBreakdown": {
      "xs": 450,
      "sm": 600,
      "md": 200
    },
    "storageUsed": "45.2 MB",
    "oldestPreview": "2025-10-01T08:00:00Z",
    "newestPreview": "2025-10-15T10:30:00Z"
  }
}
```

---

## Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TARGET",
    "message": "Invalid preview target",
    "details": {
      "field": "target.type",
      "value": "unknown"
    }
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "PREVIEW_NOT_FOUND",
    "message": "Preview not found for target"
  }
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": {
    "code": "GENERATION_FAILED",
    "message": "Failed to generate preview",
    "retryable": true
  }
}
```

---

## Rate Limiting

- Generation requests: **60 per minute** per user
- Batch requests: **20 per minute** per user
- Retrieval requests: **300 per minute** per user

---

## Implementation Notes

1. **Caching Strategy**: 
   - In-memory cache (Redis) for frequently accessed previews
   - Database for persistence
   - CDN for large previews (md size)

2. **Queue Processing**:
   - Background jobs for batch generation
   - Priority queue for user-initiated vs. prefetch

3. **Cleanup**:
   - Daily job to remove previews older than 90 days
   - LRU eviction when cache is full

4. **Performance**:
   - Target: < 200ms for cached preview
   - Target: < 1s for generation (sm size)
   - Batch: Max 4 concurrent generations

