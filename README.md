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
  - MySQL database with graph-like structure
  - Ready for Sigma.js integration

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
- MySQL 8.0+
- Composer
- npm/yarn

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Imergent-Technology/Protogen.git
   cd Protogen
   ```

2. **Backend Setup (api/)**
   ```bash
   cd api
   composer install
   cp .env.example .env
   # Configure your .env file with database settings
   php artisan key:generate
   php artisan migrate
   npm install
   npm run dev
   ```

3. **Frontend Setup (ui/)**
   ```bash
   cd ui
   npm install
   npm run dev
   ```

## Database Schema

The system uses a graph-like structure stored in MySQL:

- **Stages**: Different contexts and views
- **Graph Nodes**: Vertices in the graph structure
- **Graph Edges**: Connections between nodes
- **Feedback**: User feedback with privacy levels
- **Stage Links**: Abstract links between contexts

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