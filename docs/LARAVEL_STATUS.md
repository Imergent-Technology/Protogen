# Laravel Version Status

**Current Version**: Laravel 12.x  
**PHP Version**: 8.2  
**Last Reviewed**: October 14, 2025  
**Status**: ✅ Up-to-date

---

## Current Dependencies

Based on `api/composer.json`:

### Core Framework
```json
{
  "laravel/framework": "^12.0",
  "laravel/sanctum": "^4.2",
  "laravel/socialite": "*",
  "laravel/tinker": "^2.10.1"
}
```

### Database & ORM
```json
{
  "doctrine/dbal": "^4.3"
}
```

### Frontend Integration
```json
{
  "inertiajs/inertia-laravel": "^2.0",
  "tightenco/ziggy": "^2.4"
}
```

### Development Dependencies
```json
{
  "fakerphp/faker": "^1.23",
  "laravel/pail": "^1.2.2",
  "laravel/pint": "^1.18",
  "laravel/sail": "^1.41",
  "mockery/mockery": "^1.6",
  "nunomaduro/collision": "^8.6",
  "phpunit/phpunit": "^11.5.3"
}
```

---

## Laravel 12 Release Information

- **Release Date**: February 24, 2025
- **Type**: Maintenance Release
- **Breaking Changes**: Minimal
- **Support Status**: Active LTS

### Key Changes in Laravel 12

1. **UUID v7 Support**: The `HasUuids` trait now returns UUIDs compatible with version 7 of the UUID specification
   - For ordered UUIDv4 strings, use `HasVersion4Uuids` trait instead

2. **Image Validation**: The `image` validation rule now excludes SVG images by default
   - To allow SVGs, explicitly permit them in validation rules

3. **Updated Dependencies**: 
   - PHPUnit 11.0+
   - Pest 3.0+
   - PHP 8.2+ required

---

## Upgrade Assessment

### Current Status

✅ **Already on Laravel 12** - No upgrade needed

The project is already using Laravel 12.x as specified in `composer.json`. This was likely upgraded in early 2025 when Laravel 12 was released.

### Compatibility Status

✅ **All dependencies compatible**
- Sanctum 4.2 (Laravel 12 compatible)
- Inertia 2.0 (Laravel 12 compatible)
- PHPUnit 11.5.3 (Latest compatible version)
- All dev dependencies up-to-date

---

## Recommendations

### Immediate Actions

**None required** - System is up-to-date

### Ongoing Maintenance

1. **Monitor Patch Releases**: Watch for Laravel 12.x patch releases
2. **Security Updates**: Apply security patches promptly
3. **Dependency Updates**: Keep dependencies current within compatible versions
4. **Testing**: Ensure test suite remains compatible with PHPUnit 11

### Future Considerations

1. **Laravel 13**: Monitor announcements for Laravel 13 (expected ~Q1 2026)
2. **PHP 8.3**: Consider upgrading to PHP 8.3 for performance improvements
3. **Dependency Audits**: Regular security audits of all dependencies

---

## Version History

### 2025-02-24: Upgraded to Laravel 12
- Upgraded from Laravel 11 to Laravel 12
- Updated all dependencies for compatibility
- Minimal breaking changes required

### Previous Versions
- Laravel 11: Used until February 2025
- Laravel 10: Referenced in older documentation (2024)

---

## Related Documentation

- [Laravel 12 Release Notes](https://laravel.com/docs/12.x/releases)
- [Laravel 12 Upgrade Guide](https://laravel.com/docs/12.x/upgrade)
- [Composer Dependencies](../api/composer.json)

---

## Notes

**No action required for Laravel upgrade**. The project is already on the latest LTS version (Laravel 12) with all compatible dependencies properly updated.

Future upgrade paths should follow Laravel's release schedule:
- Laravel 13: Expected Q1 2026
- Laravel 14: Expected Q1 2027

The current Laravel 12 installation is stable and production-ready with no known compatibility issues.

