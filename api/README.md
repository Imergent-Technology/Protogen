# Protogen API Backend

The **API Backend** is the core server infrastructure of Protogen, providing data persistence, business logic, and API endpoints that power both the admin interface and user portal.

## 🎯 Purpose

The API Backend serves as the **data and logic foundation** of the Protogen ecosystem, handling:

- **Data Persistence**: Store and manage scenes, decks, users, and community data
- **Business Logic**: Implement content workflows, validation, and processing
- **API Endpoints**: Provide RESTful APIs for frontend applications
- **Authentication**: Manage user sessions and multi-tenant access control
- **File Management**: Handle media uploads, snapshots, and content delivery
- **Multi-tenancy**: Isolate data and functionality across different communities

## 🏗️ Architecture

Built with **Laravel 10 + PHP 8.2**, the API backend provides:

- **RESTful APIs**: Clean, consistent endpoints for all frontend operations
- **Database Management**: PostgreSQL for reliable data storage and relationships
- **Authentication**: Laravel Sanctum for secure API token management
- **File Storage**: Laravel Storage for media files and content snapshots
- **Multi-tenant Support**: Isolated data and functionality per community
- **Content Versioning**: Snapshot system for content history and rollback

## 🔗 System Integration

The API Backend works closely with:

- **Admin Interface**: Provides content creation and management APIs
- **User Portal**: Serves content consumption and community APIs
- **Shared Components**: Defines data models and business logic contracts
- **Database**: PostgreSQL for data persistence and complex queries
- **File Storage**: Manages media files, snapshots, and content delivery

## 🚀 Key Features

### Content Management
- **Scene APIs**: Create, update, and manage different types of content scenes
- **Deck APIs**: Organize scenes into presentation decks with navigation
- **Linking APIs**: Associate scenes with decks and manage relationships
- **Version Control**: Track content changes and manage snapshots

### User & Community Management
- **Authentication**: Secure login and session management
- **Multi-tenancy**: Isolated data and functionality per community
- **User Profiles**: Manage user data and community memberships
- **Permissions**: Role-based access control for different user types

### Data Processing
- **Content Validation**: Ensure data integrity and business rule compliance
- **File Processing**: Handle media uploads and content optimization
- **Snapshot Generation**: Create optimized content versions for delivery
- **Search & Indexing**: Enable content discovery and search functionality

## 🛠️ Development

### Quick Start
```bash
# From project root
docker-compose up -d    # Start API container
docker exec -it api php artisan migrate    # Run database migrations
docker exec -it api php artisan db:seed    # Seed initial data
```

### Access
- **API Base URL**: http://protogen.local:8080
- **Database Admin**: http://protogen.local:5050 (pgAdmin)
- **API Documentation**: Available through Laravel's built-in tools

### Key Directories
- `app/Http/Controllers/`: API endpoint controllers
- `app/Models/`: Eloquent models for data relationships
- `app/Services/`: Business logic and data processing
- `database/migrations/`: Database schema definitions
- `routes/api.php`: API route definitions

## 📋 Core Models

### Content Models
- **Scenes**: Individual content pieces (graphs, documents, cards)
- **Decks**: Collections of scenes organized for presentation
- **Snapshots**: Versioned content for optimized delivery
- **Media**: File attachments and embedded content

### Community Models
- **Tenants**: Isolated community environments
- **Users**: Community members with roles and permissions
- **Contexts**: Content organization and navigation structures
- **Feedback**: User input and community engagement data

## 🔄 API Workflow

1. **Authentication**: Validate user credentials and permissions
2. **Request Processing**: Parse and validate incoming API requests
3. **Business Logic**: Apply business rules and data processing
4. **Data Persistence**: Store or retrieve data from database
5. **Response Generation**: Format and return data to frontend
6. **Content Delivery**: Serve optimized content through snapshot system

## 🛡️ Security & Performance

### Security Features
- **API Authentication**: Token-based authentication with Laravel Sanctum
- **Input Validation**: Comprehensive request validation and sanitization
- **Multi-tenant Isolation**: Secure data separation between communities
- **Role-based Access**: Granular permissions for different user types

### Performance Optimizations
- **Database Indexing**: Optimized queries for fast data retrieval
- **Content Caching**: Snapshot system for efficient content delivery
- **File Optimization**: Compressed media and optimized file serving
- **API Rate Limiting**: Prevent abuse and ensure fair resource usage

The API Backend is the engine that powers Protogen, transforming user interactions into persistent data and delivering optimized content experiences across the entire platform.
