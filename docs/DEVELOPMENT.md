# Development Guide

**Development Approach**: Docker-First  
**Alternative**: NPM-based workflow available for specific needs

---

## Project Structure

This is a monorepo with the following modules:

- **`admin/`** - React admin interface (Vite + TypeScript)
- **`portal/`** - React user-facing portal (Vite + TypeScript) 
- **`shared/`** - **Core UI library** with system modules (TypeScript + React)
  - `src/systems/navigator/` - Navigation system
  - `src/systems/scene/` - Scene system
  - `src/systems/slide/` - Slide system
  - `src/systems/authoring/` - Authoring system
  - `src/components/` - Shared UI components
  - `src/hooks/` - Shared React hooks
  - `src/services/` - Shared services (API, Graph Query, etc.)
  - `src/types/` - Shared TypeScript types
- **`api/`** - FastAPI backend (Python)
  - Serves SSR bundles from shared library
  - Provides REST API for all data operations
- **`config/`** - Shared configuration files

**Key Concept**: The `shared/` library is the core UI foundation. Portal and admin import systems and components from it. The API can server-side render (SSR) these systems for optimal performance.

## Shared Configuration

The project uses shared configuration files in the `config/` directory:

- **`config/tsconfig.base.json`** - Base TypeScript configuration
- **`config/eslint.base.js`** - Base ESLint configuration  
- **`config/prettier.config.js`** - Shared Prettier configuration
- **`config/tailwind.css`** - Shared Tailwind CSS configuration

Each module extends these base configurations and adds module-specific overrides.

## Development Workflow

### **Preferred: Docker-First Development**

**All services run in Docker containers by default. This is the recommended workflow.**

```bash
# Start all services (from project root)
docker compose up

# Services available at:
# - Portal:   http://localhost:3000
# - Admin:    http://localhost:3001
# - API:      http://localhost:8080
# - PgAdmin:  http://localhost:5050
# - Postgres: localhost:5432
```

**Benefits of Docker-First**:
- ✅ Consistent environment across team
- ✅ No local dependency management
- ✅ Database, API, and frontends all running
- ✅ Hot-reload enabled for all services
- ✅ Production-like setup

### **Alternative: NPM Development**

For specific needs (e.g., debugging, IDE integration), you can run frontends with NPM while keeping backend services in Docker.

**Important**: All commands must be run from the **project root**, not from individual module directories.

### Root Level Scripts

```bash
# CSS Development (run from base directory)
npm run build:css          # Watch mode for CSS changes
npm run build:css:prod     # Production CSS build

# Development (run from base directory)
npm run dev                # Start CSS watching
npm run dev:all           # Start all development servers
npm run dev:admin         # Start admin development server
npm run dev:portal        # Start portal development server

# Building (run from base directory)
npm run build:all         # Build all modules
npm run build:admin       # Build admin module
npm run build:portal      # Build portal module

# Cleaning (run from base directory)
npm run clean:all         # Clean all build artifacts
npm run clean:admin       # Clean admin build
npm run clean:portal      # Clean portal build
npm run clean:shared      # Clean shared CSS output

# Code Quality (run from base directory)
npm run lint:all          # Lint all modules
npm run lint:admin        # Lint admin module
npm run lint:portal       # Lint portal module
npm run lint:shared       # Lint shared library

# Formatting (run from base directory)
npm run format:all        # Format all code
npm run format:check      # Check formatting without changes

# Dependencies (run from base directory)
npm run install:all       # Install dependencies for all modules
```

### Module-Specific Scripts

Each module has its own `package.json` with module-specific scripts. Run these from within the module directory:

```bash
cd admin
npm run dev    # Start admin development server
npm run build  # Build admin for production
npm run lint   # Lint admin code

cd portal
npm run dev    # Start portal development server
npm run build  # Build portal for production
npm run lint   # Lint portal code
```

## Component Organization

### Shared Library Structure

```
shared/src/components/
├── ui-primitives/          # Base UI components (button, card, dialog, etc.)
├── stage/                  # Stage-specific components
├── navigation/             # Navigation & routing components
│   ├── breadcrumb/
│   ├── routing/
│   └── toolbar/
├── theme/                  # Theme-related components
├── modals/                 # Modal system
├── lists/                  # List components (StagesList, UsersList, etc.)
└── forms/                  # Form components (UserProfile, StageForm)
```

### Import Patterns

```typescript
// Import from shared library
import { Button } from '@progress/shared';
import { Stage } from '@progress/shared';
import { ThemeToggle } from '@progress/shared';

// Import module-specific components
import { AdminStage } from '@/components/core/AdminStage';
```

## Development Workflow

### Starting Development

1. **Start CSS watching** (required for styling) - run from base directory:
   ```bash
   npm run dev
   ```

2. **Start development servers** - run from base directory:
   ```bash
   # Start all servers
   npm run dev:all
   
   # Or start individually
   npm run dev:admin
   npm run dev:portal
   ```

3. **Access applications**:
   - Admin: http://protogen.local:3001
   - Portal: http://protogen.local:3000
- API: http://protogen.local:8080

### Code Quality

- **Linting**: Run `npm run lint:all` to check all modules (from base directory)
- **Formatting**: Run `npm run format:all` to format all code (from base directory)
- **Type checking**: TypeScript errors will show in your IDE and build process

### Adding New Components

1. **Shared components**: Add to `shared/src/components/` and export from `shared/src/components/index.ts`
2. **System components**: Add to `shared/src/systems/{system}/components/`
3. **Module-specific components**: Add to `portal/src/components/` or `admin/src/components/`
4. **Update exports**: Add exports to relevant `index.ts` files
5. **Build shared library**: Run `cd shared && npm run build`
6. **Test imports**: Ensure components can be imported correctly

**Example:**

```typescript
// In shared/src/components/MyComponent.tsx
export function MyComponent() { /*...*/ }

// Export in shared/src/components/index.ts
export { MyComponent } from './MyComponent';

// Use in portal
import { MyComponent } from '@protogen/shared/components';
```

### Developing Shared Library System Modules

The shared library contains system modules that are separately loadable:

```typescript
// Import entire system
import { NavigatorSystem, useNavigator } from '@protogen/shared/systems/navigator';

// Import specific system components
import { GraphSceneAuthoring } from '@protogen/shared/systems/authoring/components';
```

**System Module Structure:**

```
shared/src/systems/{system-name}/
├── index.ts              # Public API exports
├── {System}System.ts     # Core system class  
├── use{System}.ts        # React hooks
├── components/           # System UI components
├── services/             # System business logic
├── types/                # TypeScript interfaces
└── __tests__/            # Unit tests
```

**Adding a New System:**

1. Create directory: `shared/src/systems/my-system/`
2. Update `shared/package.json` exports:
   ```json
   "./systems/my-system": {
     "types": "./dist/src/systems/my-system/index.d.ts",
     "import": "./dist/src/systems/my-system/index.js"
   }
   ```
3. Build: `cd shared && npm run build`
4. Import: `import { MySystem } from '@protogen/shared/systems/my-system'`

**SSR-Ready Systems:**

Systems should work on both server (SSR) and client:

```typescript
export class MySystem {
  // Check if running on server
  private static isServer = typeof window === 'undefined';
  
  async loadData() {
    if (MySystem.isServer) {
      // Server: Direct database access
      return await db.query(...);
    } else {
      // Client: API fetch
      return await fetch('/api/...');
    }
  }
}
```

## Configuration Guidelines

### When to Use Shared vs Module-Specific

**Use shared components for:**
- UI primitives (Button, Card, Dialog, etc.)
- Business logic components (Stage, ThemeToggle, etc.)
- Utilities and hooks used across modules

**Use module-specific components for:**
- Admin-specific features (AdminStage, UserManagement, etc.)
- UI-specific features (GraphViewer, FeedbackPanel, etc.)
- Module-specific layouts and navigation

### Adding New Configuration

1. **Base configuration**: Add to `config/` directory
2. **Module override**: Extend base config in module's config file
3. **Update documentation**: Document new configuration here

## Troubleshooting

### Common Issues

**CSS not updating**: Make sure CSS watching is running (`npm run dev` from base directory)

**Import errors**: Check that components are properly exported from index files

**Build failures**: Run `npm run clean:all` and rebuild (from base directory)

**TypeScript errors**: Ensure all modules extend the base TypeScript config

**Docker issues**: Ensure all Docker commands are run from the base directory

### Getting Help

- Check this documentation first
- Review the configuration files in `config/`
- Check module-specific README files
- Review the project structure above
