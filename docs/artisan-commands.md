# Artisan Commands Reference

## Snapshot Management

### `snapshots:manage`

Comprehensive snapshot management command with multiple actions.

#### Usage
```bash
php artisan snapshots:manage {action} [options]
```

#### Actions

##### `cleanup`
Apply retention policies to clean up old snapshots.

```bash
php artisan snapshots:manage cleanup [options]
```

**Options:**
- `--keep-drafts=7` - Days to keep draft snapshots (default: 7)
- `--keep-versions=5` - Number of published versions to keep per scene (default: 5)
- `--archive-after=30` - Days after which to archive published snapshots (default: 30)
- `--delete-archived=90` - Days after which to delete archived snapshots (default: 90)

**Examples:**
```bash
# Use default policies
php artisan snapshots:manage cleanup

# Custom retention policies
php artisan snapshots:manage cleanup --keep-drafts=14 --keep-versions=10

# Aggressive cleanup
php artisan snapshots:manage cleanup --keep-drafts=3 --keep-versions=3 --archive-after=14
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

##### `stats`
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

##### `validate`
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

##### `rollback`
Rollback a scene to a specific snapshot.

```bash
php artisan snapshots:manage rollback --scene-id=1 --snapshot-id=2
```

**Options:**
- `--scene-id` - ID of the scene to rollback (required)
- `--snapshot-id` - ID of the snapshot to rollback to (required)

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

## Other Commands

### `inspire`
Display an inspiring quote (Laravel default).

```bash
php artisan inspire
```

## Command Examples

### Daily Maintenance
```bash
# Run cleanup with default policies
php artisan snapshots:manage cleanup

# Check statistics
php artisan snapshots:manage stats
```

### Weekly Maintenance
```bash
# Validate all snapshots
php artisan snapshots:manage validate

# Aggressive cleanup for storage management
php artisan snapshots:manage cleanup --keep-drafts=3 --keep-versions=5
```

### Emergency Operations
```bash
# Rollback scene to previous state
php artisan snapshots:manage rollback --scene-id=1 --snapshot-id=2

# Validate specific snapshots after issues
php artisan snapshots:manage validate
```

## Automation

### Cron Jobs
Add to your crontab for automated maintenance:

```bash
# Daily cleanup at 2 AM
0 2 * * * cd /path/to/project && php artisan snapshots:manage cleanup

# Weekly validation on Sundays at 3 AM
0 3 * * 0 cd /path/to/project && php artisan snapshots:manage validate
```

### Laravel Scheduler
Add to `app/Console/Kernel.php` (if using Laravel < 11):

```php
protected function schedule(Schedule $schedule)
{
    // Daily cleanup
    $schedule->command('snapshots:manage cleanup')
             ->daily()
             ->at('02:00');

    // Weekly validation
    $schedule->command('snapshots:manage validate')
             ->weekly()
             ->sundays()
             ->at('03:00');
}
```

## Troubleshooting

### Common Issues

#### Command Not Found
```bash
# Clear command cache
php artisan clear-compiled
php artisan config:clear
```

#### Permission Errors
```bash
# Check storage permissions
ls -la storage/app/snapshots/

# Fix permissions if needed
chmod -R 755 storage/app/snapshots/
```

#### Memory Issues
```bash
# Increase memory limit for large operations
php -d memory_limit=512M artisan snapshots:manage validate
```

### Debug Mode
```bash
# Run with verbose output
php artisan snapshots:manage cleanup -v

# Run with debug logging
php artisan snapshots:manage validate --env=local
```
