# Protogen - Community-Driven Value Factory

A foundational prototype for collaborative feedback, knowledge synthesis, and multi-tenant content management with advanced graph visualization and presentation capabilities. Protogen serves as the first milestone in a larger vision toward community-driven governance and collective knowledge synthesis.

## 🎯 Overview

Protogen is a modern, multi-tenant platform that enables organizations to create, manage, and present complex knowledge through interactive graphs, rich documents, and engaging presentations. Built with a clean architecture that separates content creation from presentation, it supports multiple communities with isolated content while maintaining shared knowledge aggregation.

As the **foundational prototype** in a three-phase evolution (Protogen → Endogen → Ethosphere), Protogen focuses on sharing the vision, building community engagement, and validating concepts that will inform the development of more sophisticated platforms in future phases.

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
   # Start all services (Docker-first approach)
   docker-compose up -d
   
   # Start frontend development servers (for hot-reload)
   npm run dev:all
   ```
   
   **Note**: This project uses Docker-first development. All backend services run in containers. Frontend development servers provide hot-reload capabilities.

3. **Access the applications**
   - **User Portal**: http://protogen.local:3000
   - **Admin Panel**: http://protogen.local:3001
   - **API**: http://protogen.local:8080
   - **Database Admin**: http://protogen.local:5050

### First-Time Setup

Run the setup script to configure your environment:
```bash
./scripts/setup-complete.sh
```

For detailed setup instructions, see [DEVELOPMENT.md](docs/DEVELOPMENT.md).

## 📚 Documentation

### ⭐ Current Strategic Focus

**📍 START HERE for current development priorities:**

| Document | Description |
|----------|-------------|
| [**Strategic Focus**](docs/active-development/strategic-focus/README.md) | **Current North Star** - Graph-first development plan, active sprint, and prioritized backlog |
| [**Current Sprint**](docs/active-development/strategic-focus/CURRENT_SPRINT.md) | Active sprint tasks and progress (Sprint 1: Graph Studio Extraction) |
| [**Backlog**](docs/active-development/strategic-focus/BACKLOG.md) | Prioritized feature backlog (P0-P4) with sprint breakdown |
| [**Strategic Decisions**](docs/active-development/strategic-focus/DECISIONS.md) | Key decisions and rationale (Graph-first priority, Card authoring pause) |

**For AI Agents**: Reference `/docs/active-development/strategic-focus/` to orient on current priorities.

---

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
| [**Development Roadmap**](docs/active-development/DEVELOPMENT_ROADMAP.md) | Current development phases and status |
| [**Central Graph Roadmap**](docs/active-development/CENTRAL_GRAPH_ROADMAP.md) | Central graph system implementation |
| [**Project Status Summary**](docs/active-development/PROJECT_STATUS_SUMMARY.md) | Current project status and metrics |

### 📊 System Documentation

| Document | Description |
|----------|-------------|
| [**Snapshot System**](docs/snapshot-system.md) | Versioning, storage, and content delivery system |
| [**Multi-Tenancy Vision**](docs/MULTI_TENANCY_VISION.md) | Multi-tenant architecture design and implementation status |

### 🎯 Architectural Decisions

| Document | Description |
|----------|-------------|
| [**ADR-001: Graph Dual Execution**](docs/decisions/ADR-001-graph-dual-execution.md) | Graph execution on server and client |
| [**ADR-002: Flow System**](docs/decisions/ADR-002-flow-system.md) | Flow System over Wizard pattern |
| [**ADR-003: Central Graph**](docs/decisions/ADR-003-central-graph.md) | Central Graph architecture |
| [**ADR-004: Scene Routing**](docs/decisions/ADR-004-scene-routing.md) | Scene-first routing design |
| [**ADR-005: SSR Architecture**](docs/decisions/ADR-005-ssr-architecture.md) | Server-side rendering architecture |
| [**ADR-006: Unified Portal**](docs/decisions/ADR-006-unified-portal.md) | Unified portal design strategy |

### 📝 Project History

| Document | Description |
|----------|-------------|
| [**Changelog**](docs/changelog.md) | Version history and release notes |
| [**Documentation Archive**](docs/archive/README.md) | Historical documentation and completed phases |

## 🏗️ Project Structure

```
protogen/
├── admin/                 # React admin interface (Vite + TypeScript)
├── portal/               # React user-facing tenant portal (Vite + TypeScript)
├── shared/               # Core UI library - shared components, hooks, services
│   └── src/
│       ├── systems/      # System modules (navigator, authoring, scene, slide)
│       ├── components/   # Shared UI components
│       ├── hooks/        # Shared React hooks
│       ├── services/     # Shared services
│       └── types/        # TypeScript type definitions
├── api/                  # Laravel backend API (PHP)
├── config/               # Shared configuration files
├── docs/                 # Comprehensive documentation
├── docker/               # Docker configuration files
├── scripts/              # Setup and utility scripts
└── docker-compose.yml    # Development environment (Docker-first)
```

## 🎯 Current Status

### ✅ Completed Phases

- **Phase 1**: Core Foundation (Edge weights, Registry system)
- **Phase 2**: Scene & Deck Layer (Models, API, Context system)
- **Phase 3**: Snapshot System (Versioning, retention, rollback)
- **Phase 4**: Shared Library & Hydration (TypeScript types, services)
- **Phase 7**: Stage System Removal (Clean architecture migration)

### 🚀 **Current Evolution: Central Graph System**

**Status**: Completed October 2025 - See [Central Graph Roadmap](docs/active-development/CENTRAL_GRAPH_ROADMAP.md)

The system is evolving to a **Central Graph System** that simplifies graph traversal while maintaining the excellent multi-tenant, snapshot, and scene type systems. This evolution introduces:

- **Central Graph**: Single source of truth for all graph data
- **Subgraph System**: Logical groupings of nodes for efficient traversal
- **Enhanced Scene Items**: Spatial positioning for all scene types
- **Improved Performance**: Optimized graph operations and caching

### 🎨 Current Focus: Authoring-Viewing Unification

**Status**: Planning Complete (October 2025) - Ready for Implementation

Comprehensive plan for unified authoring-viewing experience:

- 📋 **18 Specifications Complete**: Architecture, integration, scene types, testing
- 🎯 **3 Milestones Defined**: M1 (Card+Core, 6-8 weeks), M2 (Document, 4-6 weeks), M3 (Graph, 4-6 weeks)
- 🏗️ **Extends Existing Systems**: Navigator, Toolbar, Scene, Dialog, Orchestrator
- 🎬 **Scene Types**: Card (text/image/layered), Document (multi-page, anchors), Graph (design workshop), Video (deferred)
- ✨ **New Capabilities**: Authoring overlay, preview service, ToC drawer, preview carousel
- 🎪 **Implementation Ready**: Target start December 2025, completion June 2026

See [Authoring-Viewing Unification Plan](docs/active-development/AUTHORING_VIEWING_UNIFICATION.md) for details.

### 🔄 Previous Achievements

- ✅ **Scene Management**: CRUD operations with Flow System (Phase 2.5)
- ✅ **Flow System**: Multi-step workflows replacing wizards
- ✅ **Central Graph System**: Subgraphs and scene items (October 2025)
- ✅ **Navigation**: Breadcrumbs, history, scene-first routing
- ✅ **Dialog System**: 6 dialog types including full-screen
- ✅ **Toolbar System**: Multi-edge support with drawers

### 📋 Upcoming Phases

- **Central Graph System**: Complete the central graph architecture
- **Unified Interface**: Merge admin and portal interfaces
- **Modular Navigator**: Enhanced scene navigation and authoring
- **User Registration**: Modern authentication and OAuth integration
- **Tenant Templates**: Advanced tenant configuration system

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
- **Laravel 12** with PHP 8.2
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

## 🎯 Vision & Evolution

Protogen is the foundational prototype in a larger vision for community-driven knowledge synthesis and collective governance. It represents the first milestone in a three-phase evolution toward a more connected and transparent world.

### 🌱 Vision Milestone 1: Protogen (Current)

**Technology**: React + Laravel + PostgreSQL  
**Objective**: Share the vision and build a rich community engagement ecosystem with discussions, advanced feedback, and user involvement tracking.

**Current Features**:
- Multi-tenant knowledge platform with graph visualization
- Advanced content authoring and presentation tools
- Community feedback and engagement systems
- Snapshot-based versioning and content delivery

**Future Goals for Protogen**:
- **User Dashboard**: Track discussions, feedback, and project involvement
- **Skill Profiles**: Self-assessed interests, skills, and proficiencies
- **Flexible Taxonomy**: Community-driven activity/interest/skill categorization
- **Involvement Tracking**: Interface for managing assigned tasks and project participation
- **Hosting Flexibility**: Potential refactoring to PHP client for broader deployment options

### 🚀 Vision Milestone 2: Endogen

**Technology**: Complete rebuild with C#/.NET backend, Rust components, Event-Store DB, Neo4j graph projections  
**Objective**: Enable anyone to launch their own community instance with sophisticated governance and feature ecosystems.

**Architectural Evolution**:
- **Event-Based Architecture**: Event-Store DB with Neo4j graph projections
- **Plugin System**: Powerful feature sets through modular architecture
- **Web3 Integration**: Balanced blockchain technologies for decentralized operation
- **Deployment Flexibility**: Hybrid micro-service/modular monolith design
- **Installation Wizard**: Easy local or cloud deployment with feature-based pricing

**Goals**:
- Personal, organizational, and community instance deployment
- Rich governance models and community management
- Commercial and community-driven feature ecosystems
- Advanced multi-tenant security and scalability

### 🌍 Vision Milestone 3: Ethosphere

**Technology**: TBD based on community feedback and research  
**Objective**: Create a collectively operated bridge between communities to guide and cultivate collective vision through transparent governance mechanisms.

**Core Principles**:
- **Collective Governance**: New mechanisms that elevate transparency in matters of collective good
- **Public Oversight**: Intelligent checks and balances that scale with responsibility
- **Evolving Values**: Self-correcting systems that adapt to humanity's changing challenges
- **Community Autonomy**: Preserve individuality and community self-governance
- **Contextual Dialog**: Region and topic-based community matching for relevant discussions

### 🔄 The Evolution Path

Protogen serves as the **proof of concept** and **community building platform** that:

1. **Validates the Vision**: Demonstrates the power of community-driven knowledge synthesis
2. **Builds Community**: Creates engaged users who understand and contribute to the larger goals
3. **Informs Development**: Provides real-world feedback for Endogen's architecture decisions
4. **Establishes Patterns**: Develops governance and engagement models for future phases

The progression from Protogen → Endogen → Ethosphere represents a journey from **prototype** to **platform** to **ecosystem**, each building upon the lessons and community built in the previous phase.

---

*For the most up-to-date information, always refer to the documentation in the `docs/` directory.*