# Snapshot System Documentation

## Overview

The Snapshot System provides comprehensive versioning, storage, and management capabilities for scenes in the Protogen platform. It enables deterministic serialization, content-addressed storage, and advanced lifecycle management with retention policies and rollback functionality.

## Architecture

### Core Components

- **SnapshotBuilderService**: Creates and builds snapshots from scenes
- **SnapshotManagementService**: Manages snapshot lifecycle and retention policies
- **Snapshot Model**: Eloquent model representing snapshot metadata
- **SnapshotApiController**: RESTful API endpoints for snapshot operations
- **SnapshotManagementCommand**: CLI commands for maintenance operations

### Data Flow

```
Scene → SnapshotBuilderService → Compressed Storage → Snapshot Model
                ↓
        SnapshotManagementService → Retention Policies → Cleanup
                ↓
        Rollback Operations → Scene Restoration
```

## Snapshot Structure

### Database Schema

```sql
CREATE TABLE snapshots (
    id BIGINT PRIMARY KEY,
    guid UUID UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    scene_id BIGINT REFERENCES scenes(id),
    version VARCHAR(50) DEFAULT '1.0.0',
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    manifest JSON,
    content_hash VARCHAR(64) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    compression_type ENUM('brotli', 'gzip', 'none') DEFAULT 'brotli',
    file_size INTEGER,
    metadata JSON,
    published_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Snapshot Data Format

```json
{
  "schema": {
    "name": "protogen.scene",
    "version": "1.0.0"
  },
  "scene": {
    "ids": {
      "stage": "stage-slug",
      "scene": "scene-slug"
    },
    "timestamps": {
      "created": "2025-01-15T00:00:00Z",
      "updated": "2025-01-15T00:00:00Z"
    },
    "source": {
      "generator": "protogen-snapshot-builder",
      "commit": "abc123",
      "coreRev": "def456"
    },
    "theme": {
      "theme": "default",
      "layout": "auto",
      "node_spacing": 100,
      "edge_curvature": 0.3,
      "colors": {
        "primary": "#4F46E5",
        "secondary": "#6B7280",
        "background": "#FFFFFF",
        "text": "#1F2937"
      }
    },
    "nodes": [...],
    "edges": [...],
    "contexts": [...],
    "indices": {
      "search": [...],
      "tags": [...],
      "types": [...]
    }
  },
  "integrity": {
    "hash": "sha256-hash",
    "algo": "sha256"
  },
  "cache": {
    "ttl": 86400,
    "immutable": true
  }
}
```

## API Endpoints

### Base URL
All snapshot API endpoints are prefixed with `/api/snapshots` and require authentication.

### Authentication
All endpoints require `auth:sanctum` and `admin` middleware.

### Endpoints

#### List Snapshots
```http
GET /api/snapshots
```

**Query Parameters:**
- `scene_id` (optional): Filter by scene ID
- `status` (optional): Filter by status (draft, published, archived)
- `compression` (optional): Filter by compression type
- `search` (optional): Search by name or description
- `page` (optional): Page number for pagination
- `per_page` (optional): Items per page (default: 15)

**Response:**
```json
{
  "success": true,
  "data": {
    "snapshots": [...],
    "pagination": {
      "current_page": 1,
      "per_page": 15,
      "total": 100,
      "last_page": 7
    }
  }
}
```

#### Get Snapshot Statistics
```http
GET /api/snapshots/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "published": 120,
    "draft": 20,
    "archived": 10,
    "compression_types": {
      "brotli": 140,
      "gzip": 8,
      "none": 2
    },
    "total_size": 52428800,
    "average_size": 349525
  }
}
```

#### Get Detailed Statistics
```http
GET /api/snapshots/detailed-stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "published": 120,
    "drafts": 20,
    "archived": 10,
    "total_size": 52428800,
    "average_size": 349525,
    "oldest_published": "2025-01-01T00:00:00Z",
    "newest_published": "2025-01-15T12:00:00Z"
  }
}
```

#### Create Snapshot
```http
POST /api/snapshots
```

**Request Body:**
```json
{
  "scene_id": 1,
  "name": "My Snapshot",
  "description": "Description of the snapshot",
  "version": "1.0.0",
  "compression": "brotli",
  "metadata": {
    "tags": ["production", "stable"]
  }
}
```

#### Get Snapshot
```http
GET /api/snapshots/{guid}
```

#### Publish Snapshot
```http
POST /api/snapshots/{guid}/publish
```

#### Archive Snapshot
```http
POST /api/snapshots/{guid}/archive
```

#### Get Snapshot Manifest
```http
GET /api/snapshots/{guid}/manifest
```

#### Download Snapshot
```http
GET /api/snapshots/{guid}/download
```

#### Validate Snapshot
```http
GET /api/snapshots/{guid}/validate
```

**Response:**
```json
{
  "success": true,
  "data": {
    "snapshot_id": 1,
    "is_valid": true,
    "issues": []
  }
}
```

#### Apply Retention Policies
```http
POST /api/snapshots/cleanup
```

**Request Body:**
```json
{
  "keep_drafts_days": 7,
  "keep_published_versions": 5,
  "archive_after_days": 30,
  "delete_archived_after_days": 90
}
```

**Response:**
```json
{
  "success": true,
  "message": "Retention policies applied successfully",
  "data": {
    "drafts_cleaned": 5,
    "versions_cleaned": 12,
    "archived_cleaned": 8,
    "deleted_cleaned": 3
  }
}
```

#### Rollback Scene
```http
POST /api/snapshots/rollback
```

**Request Body:**
```json
{
  "scene_id": 1,
  "snapshot_id": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Scene rolled back successfully",
  "data": {
    "scene_id": 1,
    "snapshot_id": 2
  }
}
```

#### Delete Snapshot
```http
DELETE /api/snapshots/{guid}
```

## Artisan Commands

### Snapshot Management Command

The `snapshots:manage` command provides comprehensive snapshot management capabilities.

#### Command Signature
```bash
php artisan snapshots:manage {action} [options]
```

#### Available Actions

##### 1. Cleanup
Apply retention policies to clean up old snapshots.

```bash
php artisan snapshots:manage cleanup [options]
```

**Options:**
- `--keep-drafts=7`: Days to keep draft snapshots (default: 7)
- `--keep-versions=5`: Number of published versions to keep per scene (default: 5)
- `--archive-after=30`: Days after which to archive published snapshots (default: 30)
- `--delete-archived=90`: Days after which to delete archived snapshots (default: 90)

**Example:**
```bash
php artisan snapshots:manage cleanup --keep-drafts=14 --keep-versions=10
```

**Output:**
```
Starting snapshot cleanup...
Cleanup completed:
  - Drafts cleaned: 5
  - Excess versions cleaned: 12
  - Snapshots archived: 8
  - Archived snapshots deleted: 3
```

##### 2. Statistics
Display comprehensive snapshot statistics.

```bash
php artisan snapshots:manage stats
```

**Output:**
```
Snapshot Statistics:
  Total snapshots: 150
  Published: 120
  Drafts: 20
  Archived: 10
  Total size: 50.0 MB
  Average size: 349.5 KB
  Oldest published: 2025-01-01 00:00:00
  Newest published: 2025-01-15 12:00:00
```

##### 3. Validation
Validate integrity of all snapshots.

```bash
php artisan snapshots:manage validate
```

**Output:**
```
Validating snapshots...
████████████████████████████████████████ 100%

Validation completed: 148 valid, 2 invalid

Snapshot 45 (My Snapshot) has issues:
  - Storage file missing
  - Content hash mismatch
```

##### 4. Rollback
Rollback a scene to a specific snapshot.

```bash
php artisan snapshots:manage rollback --scene-id=1 --snapshot-id=2
```

**Options:**
- `--scene-id`: ID of the scene to rollback (required)
- `--snapshot-id`: ID of the snapshot to rollback to (required)

**Example:**
```bash
php artisan snapshots:manage rollback --scene-id=1 --snapshot-id=2
```

**Interactive Output:**
```
Are you sure you want to rollback scene 'My Scene' to snapshot 'My Snapshot'? (yes/no) [no]:
> yes

Starting rollback...
Rollback completed successfully
```

## Retention Policies

### Default Policies

The system applies the following default retention policies:

- **Draft Snapshots**: Kept for 7 days
- **Published Versions**: Keep 5 latest versions per scene
- **Auto-Archive**: Archive published snapshots after 30 days
- **Auto-Delete**: Delete archived snapshots after 90 days

### Policy Configuration

Policies can be configured via:

1. **API Request**: Pass custom values in the cleanup endpoint
2. **CLI Command**: Use command options to override defaults
3. **Service Method**: Call `applyRetentionPolicies()` with custom array

### Policy Types

#### Draft Cleanup
Removes draft snapshots older than specified days.

```php
$policies = ['keep_drafts_days' => 14];
```

#### Version Management
Keeps only the N most recent published versions per scene.

```php
$policies = ['keep_published_versions' => 10];
```

#### Auto-Archive
Automatically archives published snapshots after specified days.

```php
$policies = ['archive_after_days' => 60];
```

#### Auto-Delete
Deletes archived snapshots after specified days.

```php
$policies = ['delete_archived_after_days' => 180];
```

## Rollback Operations

### How Rollback Works

1. **Validation**: Ensures snapshot is published and belongs to the scene
2. **Backup Creation**: Creates automatic backup of current scene state
3. **Data Loading**: Loads and decompresses snapshot data
4. **Scene Restoration**: Replaces scene nodes, edges, and metadata
5. **Logging**: Records rollback operation with backup reference

### Rollback Safety

- **Automatic Backup**: Always creates backup before rollback
- **Validation**: Ensures snapshot integrity before restoration
- **Error Handling**: Comprehensive error handling with rollback on failure
- **Logging**: Detailed logging of all rollback operations

### Rollback Limitations

- Only published snapshots can be used for rollback
- Snapshot must belong to the target scene
- Scene must exist and be accessible
- Rollback creates a new snapshot (backup) which counts toward retention limits

## Storage Management

### File Organization

Snapshots are stored using content-addressed paths:

```
storage/app/snapshots/
├── a1b2c3d4e5f6...json.br    # Brotli compressed
├── f6e5d4c3b2a1...json.gz    # Gzip compressed
└── 1234567890ab...json       # Uncompressed
```

### Compression Support

- **Brotli**: Default compression (best ratio)
- **Gzip**: Fallback compression
- **None**: Uncompressed fallback

### Storage Configuration

Configure in `config/filesystems.php`:

```php
'snapshots' => [
    'driver' => 'local',
    'root' => storage_path('app/snapshots'),
    'url' => env('APP_URL').'/storage/snapshots',
    'visibility' => 'public',
],
```

## Error Handling

### Common Errors

#### Storage Errors
- **File Not Found**: Snapshot file missing from storage
- **Permission Denied**: Insufficient storage permissions
- **Disk Full**: Storage disk out of space

#### Validation Errors
- **Content Hash Mismatch**: File content doesn't match stored hash
- **Invalid JSON**: Corrupted snapshot data
- **Schema Mismatch**: Snapshot format incompatible

#### Rollback Errors
- **Scene Not Found**: Target scene doesn't exist
- **Snapshot Not Found**: Rollback snapshot doesn't exist
- **Permission Denied**: Insufficient permissions for rollback

### Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

## Monitoring and Logging

### Log Channels

The system logs to the `laravel.log` channel with the following contexts:

- **Snapshot Creation**: `snapshot.created`
- **Snapshot Publishing**: `snapshot.published`
- **Retention Cleanup**: `snapshot.cleanup`
- **Rollback Operations**: `snapshot.rollback`
- **Validation Errors**: `snapshot.validation`

### Monitoring Metrics

Track these key metrics:

- **Snapshot Count**: Total, published, draft, archived
- **Storage Usage**: Total size, average size, growth rate
- **Retention Effectiveness**: Cleanup statistics
- **Rollback Frequency**: Usage patterns
- **Error Rates**: Validation failures, storage errors

## Best Practices

### Snapshot Creation

1. **Regular Snapshots**: Create snapshots before major changes
2. **Descriptive Names**: Use clear, descriptive snapshot names
3. **Version Management**: Use semantic versioning for snapshots
4. **Metadata**: Include relevant tags and metadata

### Retention Management

1. **Regular Cleanup**: Run cleanup operations regularly
2. **Policy Tuning**: Adjust policies based on usage patterns
3. **Storage Monitoring**: Monitor storage usage and growth
4. **Backup Strategy**: Ensure important snapshots are backed up

### Rollback Operations

1. **Test Rollbacks**: Test rollback procedures in development
2. **Documentation**: Document rollback procedures
3. **Access Control**: Limit rollback permissions to trusted users
4. **Monitoring**: Monitor rollback operations and outcomes

## Troubleshooting

### Common Issues

#### Snapshots Not Creating
- Check storage permissions
- Verify scene exists and is accessible
- Check available disk space
- Review Laravel logs for errors

#### Rollback Failures
- Ensure snapshot is published
- Verify scene and snapshot relationship
- Check storage file integrity
- Review validation results

#### Cleanup Not Working
- Check retention policy configuration
- Verify snapshot statuses
- Review cleanup command output
- Check storage permissions

### Debug Commands

```bash
# Check snapshot integrity
php artisan snapshots:manage validate

# Get detailed statistics
php artisan snapshots:manage stats

# Test cleanup with dry-run (if implemented)
php artisan snapshots:manage cleanup --dry-run
```

## Security Considerations

### Access Control

- All endpoints require admin authentication
- Rollback operations should be restricted to trusted users
- Storage files should be properly secured

### Data Protection

- Snapshots contain sensitive scene data
- Implement proper backup and recovery procedures
- Consider encryption for sensitive snapshots
- Regular security audits of snapshot storage

### Audit Trail

- All operations are logged with timestamps
- User attribution for all snapshot operations
- Rollback operations include backup references
- Retention policies maintain audit history
