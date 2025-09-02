# Protogen

A community-driven platform for collaborative feedback and knowledge synthesis through interactive graph visualizations.

## Vision

Protogen is the foundational prototype for a larger vision:
- **Protogen**: Minimal viable foundation for community feedback on curated graphs
- **Endogen**: Community-driven growth and engagement platform
- **The Ethosphere**: Aligning commerce, advertising, and human activities through shared values

## Architecture

This is a single repository containing:

- **`api/`** - Laravel backend with Inertia.js + React frontend
  - Stage manager system for multi-context navigation
  - Graph-based feedback system with privacy controls
  - PostgreSQL database with graph-like structure (JSONB optimized)
  - Ready for Sigma.js integration and future AGE extension

- **`ui/`** - Standalone React frontend
  - Unconventional client interface
  - Multi-model stage manager
  - Graph traversal and interactions
  - Can consume APIs from the main application

- **`admin/`** - React admin interface
  - Administrative tools and user management
  - Stage configuration and content management

- **`shared/`** - Shared components and utilities
  - Common UI components and hooks
  - Shared configuration and types

## Key Features

### Stage Manager
- Multi-context navigation with different rendering types
- Abstract links between disparate contexts
- Layer-based interface for seamless context switching
- Support for different technology sets per stage

### Graph Visualization
- Sigma.js integration for interactive graph display
- Curated graph content with user feedback
- Contextual linking between graph elements

### Feedback System
- High-level and contextual feedback levels
- Privacy controls: private, group, public
- Nested comment threads
- Community-driven discussion

## Getting Started

### Prerequisites
- PHP 8.1+
- Node.js 18+
- PostgreSQL 12+
- Composer
- npm/yarn
- Docker (for development environment)

### Development Setup

**Important**: All Docker and Tailwind commands must be run from the base `progress` folder, not from individual project directories.

#### Prerequisites
- **Docker Desktop** (with WSL2 backend on Windows)
- **Node.js 18+** and **npm**
- **Git**

#### Option 1: Complete Automated Setup (Recommended)

##### Linux/macOS/WSL2
```bash
# Clone the repository
git clone https://github.com/Imergent-Technology/Protogen.git
cd Protogen

# Make setup script executable and run it
chmod +x scripts/setup-complete.sh
./scripts/setup-complete.sh
```

##### Windows (PowerShell as Administrator)
```powershell
# Clone the repository
git clone https://github.com/Imergent-Technology/Protogen.git
cd Protogen

# Run the PowerShell setup script
.\scripts\setup-windows.ps1
```

#### Option 2: Manual Setup

##### 1. Clone and Setup DNS
```bash
git clone https://github.com/Imergent-Technology/Protogen.git
cd Protogen

# Add progress.local to hosts file
# Linux/macOS/WSL2:
echo "127.0.0.1 progress.local" | sudo tee -a /etc/hosts

# Windows (PowerShell as Administrator):
Add-Content "$env:SystemRoot\System32\drivers\etc\hosts" "`n127.0.0.1 progress.local"
```

##### 2. Environment Configuration
```bash
# Copy environment template
cp env.template api/.env

# Generate Laravel app key
docker-compose run --rm api php artisan key:generate
```

##### 3. Start Services
```bash
# Build and start all containers
docker-compose up -d

# Wait for containers to be ready, then run migrations
docker-compose exec api php artisan migrate --force
docker-compose exec api php artisan db:seed --force

# Create admin user
docker-compose exec api php artisan tinker --execute="
\$user = new App\Models\User();
\$user->name = 'Admin User';
\$user->email = 'admin@example.com';
\$user->password = Hash::make('password');
\$user->email_verified_at = now();
\$user->is_admin = true;
\$user->save();
"
```

##### 4. Build Frontend Assets
```bash
# Install dependencies and build CSS
npm install
npm run build:css:prod
```

#### CSS Build Process
Before starting development, you need to build the shared CSS:

```bash
# Build shared CSS (required for styling) - run from base directory
npm run build:css:prod

# Or watch for changes during development - run from base directory
npm run build:css
```

### Running the Application

```bash
# Start all services (from base directory)
docker-compose up

# Access the application
# Laravel API: http://progress.local:8080
# React UI: http://progress.local:3000
# PostgreSQL: progress.local:5432
```

## Database Schema

The system uses a graph-like structure stored in PostgreSQL:

- **Stages**: Different contexts and views
- **Graph Nodes**: Vertices in the graph structure
- **Graph Edges**: Connections between nodes
- **Feedback**: User feedback with privacy levels
- **Stage Links**: Abstract links between contexts

## Security Notes

### Environment Configuration
- Never commit `.env` files to version control
- Use different credentials for development and production
- Consider using a password manager for credential storage
- Rotate passwords regularly

### Development vs Production
- Development uses Docker containers with default credentials
- Production requires secure, unique credentials
- Always use environment variables in production

## Contributing

This project is designed for community involvement. We welcome contributions that align with the vision of creating a platform for collaborative knowledge synthesis.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Roadmap

- [ ] Stage manager interface implementation
- [ ] Sigma.js graph visualization integration
- [ ] User registration and authentication
- [ ] Feedback system with privacy controls
- [ ] API endpoints for graph management
- [ ] Community features and group organization

## Future Goals

- **Monorepo Structure**: Consider migrating to a monorepo structure for better code organization and shared tooling
- **Microservices**: Potential decomposition into microservices for better scalability
- **Plugin System**: Extensible plugin architecture for custom stage types 