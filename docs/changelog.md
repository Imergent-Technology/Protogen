# Changelog

All notable changes to the Protogen system will be documented in this file.

## [Unreleased]

### Added
- **Multi-Tenant Architecture**: Complete tenant system with content isolation and shared feedback aggregation
- **Tenant Management**: Comprehensive tenant administration interface with configuration management
- **Feedback System**: Centralized feedback collection across all tenants with moderation support
- **Tenant Isolation**: Database-level tenant scoping for all content models
- **Configuration Management**: Scoped tenant configurations (global, content, presentation, feedback)

### Changed
- **Architecture**: Transitioned from Stage-based to Scene & Deck architecture with multi-tenant support
- **Content Models**: Updated Scene, Deck, and Context models to include tenant relationships
- **API Endpoints**: Added tenant-aware filtering and scoping to all content endpoints
- **Navigation**: Added Tenant Management to admin navigation and dashboard
- **Documentation**: Updated core foundation and roadmap to reflect multi-tenant architecture

### Deprecated
- **Stage System**: Marked for deprecation in favor of Scene & Deck system
- **Stage API Endpoints**: Marked as legacy with deprecation warnings

### Removed
- **Console Logging**: Cleaned up all console.log statements from frontend components
- **Debug Code**: Removed temporary debugging and placeholder code

### Fixed
- **Linter Errors**: Fixed missing slug properties in Scene and Deck creation forms
- **Type Safety**: Improved TypeScript type definitions for all new models

### Security
- **Tenant Isolation**: Implemented proper tenant isolation at database and API levels
- **Access Control**: Added tenant-aware authentication and authorization

## [2025-01-15] - Multi-Tenant Architecture & Scene System

### Added
- **Context System**: New coordinate and anchor system for content navigation
- **Deck System**: Collection-based scene organization with navigation configuration
- **Scene Models**: Complete Scene, SceneNode, and SceneEdge models with tenant isolation
- **Tenant System**: Multi-tenant architecture with content isolation and shared feedback
- **Feedback System**: Centralized feedback collection with moderation and aggregation
- **Registry System**: Comprehensive metadata validation and management
- **Snapshot System**: Deterministic serialization for fast loading and CDN delivery

### Changed
- **Architecture**: Fundamental shift from Stages to Scenes & Decks
- **Content Organization**: Scene-based content management with deck collections
- **Navigation**: Context-aware navigation with coordinate systems
- **API Structure**: New RESTful endpoints for all content types
- **Database Schema**: Updated schema to support new architecture

### Deprecated
- **Stage System**: Legacy stage system marked for deprecation
- **Stage API Endpoints**: Existing stage endpoints marked as legacy

### Removed
- **Stage Dependencies**: Removed stage dependencies from new content models
- **Legacy Code**: Cleaned up unused stage-related code

### Fixed
- **Type Safety**: Improved TypeScript type definitions
- **Validation**: Enhanced input validation and error handling
- **Performance**: Optimized database queries and relationships

### Security
- **Input Validation**: Enhanced security with comprehensive input validation
- **Access Control**: Improved authentication and authorization

## [Previous Versions]

### [2024-12-01] - Initial Release
- Basic stage management system
- User authentication and authorization
- Graph visualization capabilities
- Basic content management
