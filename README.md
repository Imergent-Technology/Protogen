# Protogen

A community-driven platform for collaborative feedback and knowledge synthesis through interactive graph visualizations.

## Vision

Protogen is the foundational prototype for a larger vision:
- **Protogen**: Minimal viable foundation for community feedback on curated graphs
- **Endogen**: Community-driven growth and engagement platform
- **The Ethosphere**: Aligning commerce, advertising, and human activities through shared values

## Architecture

This is a monorepo containing:

- **`api/`** - Laravel backend with Inertia.js + React frontend
  - Stage manager system for multi-context navigation
  - Graph-based feedback system with privacy controls
  - PostgreSQL database with graph-like structure (JSONB optimized)
  - Ready for Sigma.js integration and future AGE extension

- **`ui/`** - Standalone React frontend
  - Alternative client interface
  - Can consume APIs from the main application

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

### Development Setup

#### Option 1: Quick Setup (Recommended)
```bash
# Clone the repository
git clone https://github.com/Imergent-Technology/Protogen.git
cd Protogen

# Run the setup script (Linux/macOS)
chmod +x scripts/setup-dev.sh
./scripts/setup-dev.sh

# Or manually run the commands:
# 1. Start PostgreSQL container
docker-compose up -d postgres

# 2. Create .env file with development settings
# (Copy the content from scripts/setup-dev.sh)

# 3. Install dependencies and run migrations
cd api
composer install
php artisan key:generate
php artisan migrate
npm install
```

#### Option 2: Manual Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/Imergent-Technology/Protogen.git
   cd Protogen
   ```

2. **Start PostgreSQL container**
   ```bash
   docker-compose up -d postgres
   ```

3. **Backend Setup (api/)**
   ```bash
   cd api
   composer install
   # Create .env file with development database settings
   php artisan key:generate
   php artisan migrate
   npm install
   npm run dev
   ```

4. **Frontend Setup (ui/)**
   ```bash
   cd ui
   npm install
   npm run dev
   ```

### Running the Application

```bash
# Start all services
docker-compose up

# Access the application
# Laravel API: http://localhost:8080
# React UI: http://localhost:3000
# PostgreSQL: localhost:5432
```

## Database Schema

The system uses a graph-like structure stored in PostgreSQL:

- **Stages**: Different contexts and views
- **Graph Nodes**: Vertices in the graph structure
- **Graph Edges**: Connections between nodes
- **Feedback**: User feedback with privacy levels
- **Stage Links**: Abstract links between contexts

## Secrets Management

For secure handling of credentials and sensitive configuration data, see our [Secrets Management Guide](docs/SECRETS_MANAGEMENT.md).

### Quick Security Notes:
- Never commit `.env` files to version control
- Use different credentials for development and production
- Consider using a password manager for credential storage
- Rotate passwords regularly

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