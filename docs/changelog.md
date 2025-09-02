# Protogen Changelog

## [Unreleased] - 2025-01-02

### Added
- **Edge Weight System**: Added numeric weight field to CoreGraphEdge model with 5-decimal precision
- **Registry System**: Implemented comprehensive metadata registry with validation rules
- **Form Validation**: Created CoreGraphEdgeRequest for edge creation/update validation
- **API Endpoints**: Added registry management API with CRUD operations
- **Testing**: Comprehensive unit tests for edge weights and registry validation
- **Complete Development Environment Setup Automation**:
  - `scripts/setup-complete.sh` for Linux/macOS/WSL2 environments
  - `scripts/setup-windows.ps1` for Windows PowerShell environments
  - Automated DNS configuration with `progress.local` domain
  - Automated database setup with admin user creation
  - Comprehensive setup verification and testing
- **Enhanced Documentation and Troubleshooting**:
  - Updated README with automated setup instructions
  - Comprehensive troubleshooting guide (`docs/TROUBLESHOOTING.md`)
  - Platform-specific setup instructions (Linux/macOS/Windows)
  - Common issue solutions and debugging commands

### Changed
- **CoreGraphEdge Model**: Added weight field with proper casting and validation
- **API Validation**: Updated edge creation to use form request validation
- **Database Schema**: Added weight column to core_graph_edges table
- **DNS Configuration**: Migrated from `localhost` to `progress.local` domain
  - Updated all frontend API calls to use `progress.local:8080`
  - Updated CORS configuration for consistent domain usage
  - Updated Vite configuration with `allowedHosts` for `progress.local`
  - Updated Nginx configuration for `progress.local` server name
  - Updated all documentation and scripts to reference new domain
- **CORS Handling**: Simplified to use Laravel CORS middleware exclusively
  - Removed duplicate CORS headers from Nginx configuration
  - Added `Accept: application/json` headers to frontend requests
  - Resolved CORS policy and redirect issues

### Technical Details
- **Edge Weight Range**: 0.00001 to 999.99999 (5 decimal precision)
- **Default Weight**: 1.00000 for all edges
- **Registry Scopes**: core.node, core.edge, scene.node, scene.edge
- **Validation Types**: string, number, boolean, array, object
- **Custom Rules**: min/max, min_length/max_length, enum values

### Files Added
- `api/database/migrations/2025_01_02_000001_add_weight_to_core_graph_edges.php`
- `api/database/migrations/2025_01_02_000002_create_registry_catalog_table.php`
- `api/app/Http/Requests/CoreGraphEdgeRequest.php`
- `api/app/Models/RegistryCatalog.php`
- `api/app/Services/RegistryValidationService.php`
- `api/app/Http/Controllers/Api/RegistryApiController.php`
- `api/database/seeders/BackfillEdgeWeightsSeeder.php`
- `api/database/seeders/RegistryCatalogSeeder.php`
- `api/tests/Unit/CoreGraphEdgeWeightTest.php`
- `api/tests/Unit/RegistryValidationTest.php`

### Files Modified
- `api/app/Models/CoreGraphEdge.php` - Added weight field and casting
- `api/app/Http/Controllers/Api/CoreGraphApiController.php` - Updated edge creation
- `api/routes/api.php` - Added registry API routes

### Database Changes
- Added `weight` column (decimal(8,5)) to `core_graph_edges` table
- Created `registry_catalog` table for metadata definitions
- Added proper indexes for performance

### API Changes
- **POST /api/graph/edges**: Now requires and validates weight field
- **GET /api/registry**: List all registry entries
- **GET /api/registry/scope/{scope}**: Get entries for specific scope
- **POST /api/registry/validate**: Validate metadata against registry rules
- **GET /api/registry/{scope}/schema**: Get metadata schema for scope

### Testing
- **Edge Weight Tests**: 7 test cases covering creation, validation, and updates
- **Registry Tests**: 12 test cases covering validation, defaults, and metadata handling
- **Database Tests**: Proper setup/teardown with RefreshDatabase trait

### Next Steps
- [ ] Run migrations and seeders
- [ ] Test edge weight functionality in GraphStudio
- [ ] Implement Scene layer (Phase 2)
- [ ] Add Snapshot system (Phase 3)
- [ ] Create UI components for registry management

### Known Issues
- None currently identified

### Breaking Changes
- **Edge Creation**: All new edges must now include a weight field
- **API Validation**: Stricter validation for edge creation

### Migration Notes
1. Run the new migrations: `php artisan migrate`
2. Backfill existing edges: `php artisan db:seed --class=BackfillEdgeWeightsSeeder`
3. Seed registry catalog: `php artisan db:seed --class=RegistryCatalogSeeder`
4. Update any existing edge creation code to include weight field

### Performance Impact
- **Minimal**: Weight field adds negligible storage overhead
- **Registry**: Fast lookups with proper indexing
- **Validation**: Efficient metadata validation with caching potential

### Security Considerations
- **Input Validation**: All metadata validated against registry rules
- **Type Safety**: Strict type checking for metadata values
- **Admin Only**: Registry management restricted to admin users

---

## [Previous Versions]

### [v0.1.0] - 2025-08-22
- Initial Core Graph system implementation
- Basic node and edge management
- Graph Studio UI foundation
- Stage system architecture

### [v0.0.1] - 2024-01-01
- Project initialization
- Basic Laravel setup
- Initial database schema
- Basic authentication system
