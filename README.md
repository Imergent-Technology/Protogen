# Protogen - Community-Driven Knowledge Platform

A comprehensive platform for collaborative feedback, knowledge synthesis, and multi-tenant content management with advanced graph visualization and presentation capabilities.

## 🎯 Overview

Protogen is a modern, multi-tenant platform that enables organizations to create, manage, and present complex knowledge through interactive graphs, rich documents, and engaging presentations. Built with a clean architecture that separates content creation from presentation, it supports multiple communities with isolated content while maintaining shared knowledge aggregation.

### Key Features

- **🏗️ Multi-Tenant Architecture**: Isolated content environments with shared knowledge aggregation
- **📊 Interactive Graph Visualization**: Advanced graph authoring and presentation tools
- **📄 Rich Document System**: TipTap-powered rich text editing with media embedding
- **🃏 Advanced Card Presentations**: Sophisticated slideshow system with animations and CTAs
- **⚡ Snapshot System**: Fast, CDN-friendly content delivery with versioning
- **🎨 Theme System**: Customizable branding and styling per tenant
- **🔗 Context System**: Precise content anchoring and navigation
- **📈 Analytics & Feedback**: Comprehensive engagement tracking and community insights

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd protogen
   ```

2. **Start the development environment**
   ```bash
   # Start all services
   docker-compose up -d
   
   # Start CSS watching (required for styling)
   npm run dev
   
   # Start all development servers
   npm run dev:all
   ```

3. **Access the applications**
   - **Admin Panel**: http://protogen.local:3001
   - **User Portal**: http://protogen.local:3000
   - **API**: http://protogen.local:8080
   - **Database Admin**: http://protogen.local:5050

### First-Time Setup

Run the setup script to configure your environment:
```bash
./scripts/setup-complete.sh
```

For detailed setup instructions, see [DEVELOPMENT.md](docs/DEVELOPMENT.md).

## 📚 Documentation

### 🏗️ Architecture & Foundation

| Document | Description |
|----------|-------------|
| [**Core Foundation**](docs/core-foundation.md) | Complete architectural principles, data models, and system invariants |
| [**Multi-Tenancy Vision**](docs/MULTI_TENANCY_VISION.md) | Multi-tenant architecture design and implementation strategy |
| [**Context System**](docs/context-system.md) | Content anchoring and coordinate system documentation |
| [**Theme System**](docs/THEME_SYSTEM.md) | Customizable styling and branding system |

### 🛠️ Development & Operations

| Document | Description |
|----------|-------------|
| [**Development Guide**](docs/DEVELOPMENT.md) | Complete development setup, workflow, and project structure |
| [**Artisan Commands**](docs/artisan-commands.md) | CLI commands for snapshot management and maintenance |
| [**Deployment Guide**](docs/DEPLOYMENT.md) | Production deployment and hosting instructions |
| [**Troubleshooting**](docs/TROUBLESHOOTING.md) | Common issues and solutions |

### 📋 Implementation & Roadmap

| Document | Description |
|----------|-------------|
| [**Implementation Roadmap**](docs/implementation-roadmap.md) | Complete phase-by-phase development plan |
| [**Phase 5 Authoring Vision**](docs/phase-5-authoring-vision.md) | UI integration and authoring tools expansion |
| [**Graph Studio Enhancement**](docs/GRAPH_STUDIO_ENHANCEMENT.md) | Advanced graph visualization capabilities |
| [**Flow System Vision**](docs/FLOW_SYSTEM_VISION.md) | Sophisticated content navigation and exploration system |

### 📊 System Documentation

| Document | Description |
|----------|-------------|
| [**Snapshot System**](docs/snapshot-system.md) | Versioning, storage, and content delivery system |
| [**Multi-Tenancy Vision**](docs/MULTI_TENANCY_VISION.md) | Multi-tenant architecture design and implementation status |

### 📝 Project History

| Document | Description |
|----------|-------------|
| [**Changelog**](docs/changelog.md) | Version history and release notes |

## 🏗️ Project Structure

```
protogen/
├── admin/                 # React admin interface (Vite + TypeScript)
├── portal/               # React user-facing tenant portal (Vite + TypeScript)
├── shared/               # Shared components, hooks, services, and types
├── api/                  # Laravel backend API (PHP)
├── config/               # Shared configuration files
├── docs/                 # Comprehensive documentation
├── docker/               # Docker configuration files
├── scripts/              # Setup and utility scripts
└── docker-compose.yml    # Development environment
```

## 🎯 Current Status

### ✅ Completed Phases

- **Phase 1**: Core Foundation (Edge weights, Registry system)
- **Phase 2**: Scene & Deck Layer (Models, API, Context system)
- **Phase 3**: Snapshot System (Versioning, retention, rollback)
- **Phase 4**: Shared Library & Hydration (TypeScript types, services)
- **Phase 7**: Stage System Removal (Clean architecture migration)

### 🔄 Current Phase: UI Integration & Authoring

**Phase 5** focuses on building sophisticated authoring tools:

- ✅ **Card-Based Scene Management**: Preview thumbnails, hover metadata, click-to-edit
- ✅ **Enhanced Card Scene Authoring**: Advanced slideshow system with backgrounds, text, and CTAs
- ✅ **Preview Thumbnail System**: Automatic base64 generation for all scene types
- 🔄 **Document Scene Authoring**: Rich text editing with TipTap integration
- 🔄 **Node Selection Interface**: Global node selection across scene types
- 🔄 **Graph Studio Integration**: Admin panel integration

### 📋 Upcoming Phases

- **Phase 8**: Performance & Polish
- **Phase 9**: Content Sharing System
- **Phase 10**: Music & Audio System
- **Phase 11**: Flow System
- **Phase 12**: Advanced Flow Features

## 🛠️ Development Commands

### Root Level Scripts (Run from project root)

```bash
# Development
npm run dev                # Start CSS watching
npm run dev:all           # Start all development servers
npm run dev:admin         # Start admin development server
npm run dev:portal        # Start portal development server

# Building
npm run build:all         # Build all modules
npm run build:admin       # Build admin module
npm run build:portal      # Build portal module

# Code Quality
npm run lint:all          # Lint all modules
npm run format:all        # Format all code
npm run clean:all         # Clean all build artifacts

# Dependencies
npm run install:all       # Install dependencies for all modules
```

### Docker Commands

```bash
# Container Management
docker-compose up -d      # Start all services
docker-compose down       # Stop all services
docker-compose restart    # Restart all services
docker-compose logs -f    # View logs

# Database Operations
docker exec -it api php artisan migrate
docker exec -it api php artisan db:seed
```

## 🎨 Key Technologies

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Sigma.js** for graph visualization

### Backend
- **Laravel 10** with PHP 8.2
- **PostgreSQL** for data storage
- **Laravel Sanctum** for API authentication
- **Laravel Storage** for file management

### Infrastructure
- **Docker** for containerization
- **Nginx** for web server
- **pgAdmin** for database management

## 🏢 Multi-Tenant Architecture

Protogen supports multiple isolated communities with shared knowledge aggregation:

- **Content Isolation**: Each tenant has isolated scenes, decks, and contexts
- **Shared Knowledge**: Core Graph serves as shared knowledge base
- **Feedback Aggregation**: All feedback flows to centralized Core Graph
- **Custom Branding**: Tenant-specific themes and configurations
- **Scalable Deployment**: Independent scaling per tenant

## 📊 Scene Types

### Graph Scenes
Interactive graph visualizations with nodes, edges, and advanced layouts.

### Document Scenes
Rich text documents with embedded media, internal/external linking, and collaborative editing.

### Card Scenes
Advanced slideshow presentations with:
- Multiple background types (color, image, video, gradient)
- Text positioning and styling with contrast management
- Call-to-action systems (button, fullscreen, timed)
- Animation and transition effects
- Full-screen presentation capabilities

## 🔧 Configuration

### Environment Setup
- Copy `env.template` to `api/.env` and configure
- Ensure `protogen.local` is in your hosts file
- Run setup scripts for initial configuration

### Shared Configuration
- **TypeScript**: `config/tsconfig.base.json`
- **ESLint**: `config/eslint.base.js`
- **Prettier**: `config/prettier.config.js`
- **Tailwind**: `config/tailwind.css`

## 🤝 Contributing

1. **Read the Documentation**: Start with [DEVELOPMENT.md](docs/DEVELOPMENT.md)
2. **Set Up Environment**: Follow the quick start guide above
3. **Check Roadmap**: Review [Implementation Roadmap](docs/implementation-roadmap.md)
4. **Follow Guidelines**: Use the established patterns and conventions
5. **Test Changes**: Ensure all tests pass and builds succeed

## 📞 Support

- **Documentation**: Comprehensive guides in the `docs/` directory
- **Troubleshooting**: See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
- **Development Issues**: Check [DEVELOPMENT.md](docs/DEVELOPMENT.md)
- **Architecture Questions**: Review [Core Foundation](docs/core-foundation.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Vision

Protogen aims to be the premier platform for community-driven knowledge synthesis, enabling organizations to:

- **Create Engaging Content**: Interactive graphs, rich documents, and compelling presentations
- **Manage Multiple Communities**: Isolated content with shared knowledge aggregation
- **Scale Efficiently**: CDN-friendly delivery with advanced caching and optimization
- **Foster Collaboration**: Comprehensive feedback systems and community engagement tools

---

*For the most up-to-date information, always refer to the documentation in the `docs/` directory.*