# Protogen User Portal

The **User Portal** is the public-facing interface of Protogen, where community members discover, explore, and interact with the rich content created through the admin interface.

## 🎯 Purpose

The User Portal serves as the **content consumption hub** of the Protogen ecosystem, providing users with:

- **Content Discovery**: Browse and explore scenes, decks, and community content
- **Interactive Experiences**: Engage with graphs, documents, and presentations
- **Community Features**: Participate in discussions and feedback systems
- **Multi-tenant Access**: Access content from different communities and organizations
- **Personalized Experience**: Customized content based on user preferences and community membership

## 🏗️ Architecture

Built with **React 18 + TypeScript + Vite**, the user portal delivers:

- **Content Rendering**: Display scenes and decks created in the admin interface
- **Interactive Components**: Engage with graphs, documents, and presentation cards
- **Community Features**: User profiles, discussions, and feedback systems
- **Responsive Design**: Optimized for desktop, tablet, and mobile experiences
- **Performance Optimization**: Fast loading through snapshot-based content delivery

## 🔗 System Integration

The User Portal works closely with:

- **Admin Interface**: Consumes content created by administrators and content creators
- **API Backend**: Fetches content, user data, and community information
- **Shared Components**: Uses shared UI components for consistent experience
- **Snapshot System**: Delivers optimized, versioned content for fast loading
- **Theme System**: Adapts to community-specific branding and styling

## 🚀 Key Features

### Content Consumption
- **Scene Viewing**: Interactive graphs, rich documents, and presentation cards
- **Deck Navigation**: Browse through organized presentation decks
- **Search & Discovery**: Find relevant content across the community
- **Bookmarking**: Save favorite content for later access

### Community Engagement
- **User Profiles**: Personal dashboards and activity tracking
- **Discussion Forums**: Community discussions around content
- **Feedback Systems**: Provide input and suggestions on content
- **Social Features**: Share and recommend content to others

### Multi-tenant Experience
- **Community Switching**: Access content from different organizations
- **Custom Branding**: Experience community-specific themes and styling
- **Isolated Content**: Secure access to community-specific information
- **Shared Knowledge**: Access to public content across communities

## 🛠️ Development

### Quick Start
```bash
# From project root
npm run dev:portal    # Start portal development server
npm run build:portal  # Build for production
```

### Access
- **Development**: http://protogen.local:3000
- **Authentication**: Community-specific login systems

### Key Directories
- `src/components/`: User-facing UI components
- `src/pages/`: Main application pages and routes
- `src/hooks/`: Custom React hooks for data management
- `src/services/`: API integration and data fetching

## 📋 Content Types

### Graph Experiences
Interactive visualizations where users can explore complex relationships, zoom into details, and discover connections between concepts.

### Document Reading
Rich text documents with embedded media, cross-references, and collaborative annotations for deep knowledge consumption.

### Presentation Viewing
Immersive slideshow experiences with animations, call-to-action elements, and full-screen presentation modes.

## 🔄 User Journey

1. **Discovery**: Browse community content through search and recommendations
2. **Exploration**: Dive into scenes and decks that match interests
3. **Interaction**: Engage with interactive elements and provide feedback
4. **Community**: Participate in discussions and connect with other users
5. **Contribution**: Provide feedback and suggestions to improve content

## 🎨 User Experience

The User Portal prioritizes:

- **Performance**: Fast loading through optimized content delivery
- **Accessibility**: Inclusive design for users with different abilities
- **Responsiveness**: Seamless experience across all device types
- **Community Feel**: Features that foster connection and collaboration
- **Content Quality**: Rich, engaging experiences that educate and inspire

The User Portal transforms the content created in the admin interface into meaningful, interactive experiences that bring communities together around shared knowledge and interests.