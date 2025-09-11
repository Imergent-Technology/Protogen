# Protogen Shared Library

The **Shared Library** is the foundational codebase of Protogen, providing common components, types, services, and utilities that ensure consistency across all applications in the ecosystem.

## 🎯 Purpose

The Shared Library serves as the **common foundation** of the Protogen ecosystem, providing:

- **Reusable Components**: UI components used across admin interface and user portal
- **Type Definitions**: Shared TypeScript interfaces and types for data consistency
- **Business Logic**: Common services and utilities for data processing
- **Theme System**: Centralized styling and branding that works across all applications
- **API Contracts**: Shared interfaces for frontend-backend communication

## 🏗️ Architecture

The shared library provides a **unified foundation** that ensures:

- **Code Reuse**: Avoid duplication across admin and portal applications
- **Type Safety**: Consistent data models and API contracts
- **Design Consistency**: Shared UI components and styling system
- **Maintainability**: Single source of truth for common functionality
- **Scalability**: Easy addition of new shared features across the platform

## 🔗 System Integration

The Shared Library is used by:

- **Admin Interface**: Content creation and management components
- **User Portal**: Content consumption and community features
- **API Backend**: Type definitions and data model contracts
- **Build System**: Shared configuration and tooling

## 🚀 Key Features

### UI Components
- **Base Components**: Buttons, modals, forms, and layout components
- **Content Components**: Scene renderers, deck viewers, and interactive elements
- **Navigation Components**: Menus, breadcrumbs, and routing utilities
- **Theme Components**: Theme toggles, color schemes, and branding elements

### Type Definitions
- **Data Models**: Scene, Deck, User, and Community type definitions
- **API Contracts**: Request/response interfaces for all API endpoints
- **Component Props**: Shared prop types for consistent component interfaces
- **Utility Types**: Common TypeScript utility types and helpers

### Services & Utilities
- **API Services**: HTTP client and data fetching utilities
- **State Management**: Shared state patterns and data flow utilities
- **Validation**: Common validation rules and data sanitization
- **Formatting**: Date, text, and data formatting utilities

## 🛠️ Development

### Quick Start
```bash
# From project root
npm run build:shared    # Build shared library
npm run dev:shared      # Watch for changes during development
```

### Usage in Projects
```typescript
// Import shared components
import { Button, Modal, SceneRenderer } from '@protogen/shared';

// Import shared types
import { Scene, Deck, User } from '@protogen/shared';

// Import shared services
import { apiClient, validationUtils } from '@protogen/shared';
```

## 🎨 Styling & Theming

### CSS Architecture
- **Input CSS**: `shared/src/styles/input.css` (CSS variables and Tailwind imports)
- **Output CSS**: `shared/src/styles/output.css` (generated Tailwind classes)
- **Build Process**: Centralized CSS generation from project root

### Why This Architecture?
- **Consistency**: All applications use the same Tailwind configuration
- **Performance**: Prevents duplicate CSS generation and conflicts
- **Maintainability**: Centralized theme management across the entire platform
- **Flexibility**: Easy customization and theme switching

### Usage in Projects
```css
/* In admin/src/index.css or portal/src/index.css */
@import "../../shared/src/styles/input.css";  /* CSS variables */
@import "../../shared/src/styles/output.css"; /* Generated Tailwind classes */
```

## 📋 Component Architecture

### Base Components
Provide core functionality that can be extended by specific applications:

```typescript
// Base component with core functionality
<SceneRenderer scene={scene} />

// Extended with admin capabilities
<SceneRenderer scene={scene} isAdmin={true}>
  <AdminControls onEdit={handleEdit} />
</SceneRenderer>
```

### Extensibility Pattern
1. **Base Components**: Core functionality and consistent styling
2. **Application Extensions**: Admin or portal-specific features through props
3. **Context Adaptation**: Components adapt behavior based on usage context

## 🔄 Development Workflow

1. **Define Types**: Create shared TypeScript interfaces for new features
2. **Build Components**: Develop reusable UI components with consistent styling
3. **Implement Services**: Add common business logic and API utilities
4. **Test Integration**: Ensure components work across all applications
5. **Document Usage**: Provide clear examples and usage guidelines

## 🛡️ Quality Assurance

### Type Safety
- **Strict TypeScript**: Comprehensive type checking across all shared code
- **API Contracts**: Enforced consistency between frontend and backend
- **Component Props**: Type-safe component interfaces and prop validation

### Testing
- **Unit Tests**: Test individual components and utilities
- **Integration Tests**: Verify components work across different applications
- **Visual Regression**: Ensure consistent styling and behavior

The Shared Library is the glue that holds Protogen together, ensuring that all applications in the ecosystem share a common foundation while maintaining the flexibility to serve their specific purposes. 