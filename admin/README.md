# Protogen Admin Interface

The **Admin Interface** is the content management and authoring system for Protogen, providing administrators and content creators with powerful tools to build and manage the platform's knowledge base.

## 🎯 Purpose

The Admin Interface serves as the **content creation hub** of the Protogen ecosystem, enabling users to:

- **Create & Manage Scenes**: Build interactive graphs, rich documents, and presentation cards
- **Organize Content**: Structure scenes into presentation decks with custom navigation
- **Link Relationships**: Connect scenes to decks and manage content associations
- **Preview & Test**: Preview content before publishing to the user portal
- **Manage Tenants**: Configure multi-tenant settings and branding

## 🏗️ Architecture

Built with **React 18 + TypeScript + Vite**, the admin interface provides:

- **Scene Management**: Create, edit, and organize different types of content scenes
- **Deck Management**: Build presentation decks by linking scenes together
- **Workflow System**: Guided creation workflows for complex content types
- **Context Menus**: Right-click interfaces for quick actions and content linking
- **Real-time Preview**: Live preview of content as it's being created

## 🔗 System Integration

The Admin Interface works closely with:

- **API Backend**: Communicates with Laravel API for data persistence
- **Shared Components**: Uses shared UI components and TypeScript types
- **User Portal**: Content created here is consumed by the user-facing portal
- **Snapshot System**: Manages content versioning and delivery optimization

## 🚀 Key Features

### Content Authoring
- **Graph Scenes**: Interactive node-and-edge visualizations
- **Document Scenes**: Rich text editing with TipTap integration
- **Card Scenes**: Advanced slideshow presentations with animations

### Content Organization
- **Scene-Deck Linking**: Associate scenes with presentation decks
- **Context Menus**: Quick access to edit, link, and manage content
- **Workflow Wizards**: Guided creation process for complex content

### Management Tools
- **Multi-tenant Support**: Manage content across different communities
- **Preview System**: Test content before publishing
- **Version Control**: Track changes and manage content history

## 🛠️ Development

### Quick Start
```bash
# From project root
npm run dev:admin    # Start admin development server
npm run build:admin  # Build for production
```

### Access
- **Development**: http://protogen.local:3001
- **Login**: Use admin credentials from your environment setup

### Key Directories
- `src/components/`: Reusable UI components
- `src/stores/`: State management with Zustand
- `src/workflows/`: Content creation workflows
- `src/authoring/`: Scene-specific authoring tools

## 📋 Content Types

### Graph Scenes
Interactive visualizations with nodes, edges, and advanced layouts for complex knowledge representation.

### Document Scenes  
Rich text documents with embedded media, internal/external linking, and collaborative editing capabilities.

### Card Scenes
Advanced presentation slides with multiple background types, text positioning, call-to-action systems, and full-screen presentation modes.

## 🔄 Workflow

1. **Create Scenes**: Build individual content pieces (graphs, documents, cards)
2. **Organize Decks**: Group related scenes into presentation decks
3. **Link Content**: Associate scenes with decks for structured presentations
4. **Preview & Test**: Review content before publishing
5. **Publish**: Make content available to users through the portal

The Admin Interface is where the magic happens - transforming ideas into the rich, interactive content that users experience in the Protogen portal.