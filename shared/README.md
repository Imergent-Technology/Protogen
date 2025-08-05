# Progress Shared Components

This package contains shared components, types, and utilities used by both the frontend and backend applications.

## Architecture

The shared project serves as the foundation for the Progress application, providing:

- **Base Components**: Reusable UI components that can be extended by both frontend and backend
- **Stage System**: Core stage components that backend admin interfaces extend with editing capabilities
- **Theme System**: Centralized theming that works across all applications
- **Type Definitions**: Shared TypeScript types for consistency

## Usage

### Frontend (UI)
```typescript
import { ThemeToggle, StageContainer } from '@progress/shared';

// Use base components
<ThemeToggle size="sm" />
<StageContainer stage={stage} />
```

### Backend (API)
```typescript
import { ThemeToggle, StageContainer, BasicStage } from '@progress/shared';

// Extend base components with admin functionality
<StageContainer stage={stage} isAdmin={true}>
  <AdminControls stage={stage} onUpdate={handleUpdate} />
</StageContainer>
```

## Development

```bash
# Build the shared package
npm run build

# Watch for changes
npm run dev
```

## Extending Components

The shared components are designed to be extended:

1. **Base Components**: Provide core functionality
2. **Admin Extensions**: Backend adds editing capabilities through children props
3. **Context-Specific**: Components adapt based on `isAdmin` prop

This architecture ensures consistent UI while allowing backend admin interfaces to feel like natural extensions of the frontend experience. 