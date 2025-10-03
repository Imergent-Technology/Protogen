# Permissions Architecture

## Overview

The Permissions Architecture provides a comprehensive, scalable system for managing user access and feature availability across the Protogen platform. This system integrates with the Standing System to provide dynamic, trust-based permissions that grow with the community.

## Core Principles

### 1. Standing-Based Access
Permissions are determined by user standing scores and trust levels, ensuring that access is earned through community contribution and reliability.

### 2. Progressive Permissions
Users gain access to more features as they advance through standing levels, creating a clear progression path.

### 3. Trust-Based Security
Sensitive operations require high trust scores, ensuring only reliable users can perform critical actions.

### 4. Multi-Tenant Isolation
Permissions are scoped to tenants, allowing different communities to have different permission models.

### 5. Granular Control
Fine-grained permissions for specific features, operations, and resources.

## Permission Categories

### Content Permissions
Control access to content creation and management:
- **Scene Creation**: Create different types of scenes
- **Scene Editing**: Modify existing scenes
- **Scene Publishing**: Make scenes public
- **Scene Deletion**: Remove scenes
- **Content Sharing**: Share content with others

### Authoring Permissions
Control access to authoring tools and features:
- **Card Authoring**: Use card scene authoring tools
- **Graph Authoring**: Use graph scene authoring tools
- **Document Authoring**: Use document scene authoring tools
- **Node Selection**: Access node selection interface
- **Advanced Features**: Use advanced authoring capabilities

### Graph Permissions
Control access to core graph operations:
- **Node Creation**: Create new nodes in core graph
- **Edge Creation**: Create new edges in core graph
- **Graph Modification**: Modify core graph structure
- **Metadata Access**: View node and edge metadata
- **Graph Administration**: Manage graph settings

### Tenant Permissions
Control access to tenant management:
- **Tenant Creation**: Create new tenants
- **Tenant Configuration**: Modify tenant settings
- **User Management**: Manage tenant users
- **Analytics Access**: View tenant analytics
- **Resource Management**: Manage tenant resources

### System Permissions
Control access to system administration:
- **User Administration**: Manage all users
- **System Configuration**: Modify system settings
- **Database Access**: Direct database access
- **API Management**: Manage API endpoints
- **Security Administration**: Manage security settings

## Permission Scopes

### Global Scope
System-wide permissions that apply across all tenants:
- User administration
- System configuration
- Global analytics
- Cross-tenant operations

### Tenant Scope
Tenant-specific permissions that apply within a tenant:
- Content creation and management
- User management within tenant
- Tenant configuration
- Tenant analytics

### Scene Scope
Scene-specific permissions for individual content:
- Scene editing
- Scene publishing
- Scene sharing
- Scene deletion

### User Scope
User-specific permissions for individual users:
- Profile management
- Personal settings
- Content ownership
- Privacy controls

## Access Levels

### Contributor
Basic viewing and limited content creation permissions:
- View public content
- Basic navigation
- Limited feedback
- Basic content creation

### Collaborator
Content creation permissions:
- Create scenes and decks
- Basic authoring tools
- Content editing
- Limited sharing

### Steward
Advanced authoring permissions:
- Advanced authoring tools
- Node selection interface
- Content curation
- Enhanced sharing

### Curator
Graph operation permissions:
- Core graph access
- Node and edge creation
- Advanced analytics
- Cross-tenant operations

### Guardian
Community leadership permissions:
- Content moderation
- User management
- Community analytics
- Leadership tools

### Architect
System architecture permissions:
- System administration
- Global configuration
- Security management
- Architecture decisions

## Permission Implementation

### Database Schema

#### Permissions Table
```sql
CREATE TABLE permissions (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    scope VARCHAR(20) NOT NULL,
    level VARCHAR(20) NOT NULL,
    dependencies JSON,
    metadata JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### User Permissions Table
```sql
CREATE TABLE user_permissions (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    tenant_id BIGINT,
    permission_id BIGINT NOT NULL,
    granted_by BIGINT,
    granted_at TIMESTAMP,
    expires_at TIMESTAMP,
    metadata JSON,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE(user_id, tenant_id, permission_id)
);
```

#### Tenant Permissions Table
```sql
CREATE TABLE tenant_permissions (
    id BIGINT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    configuration JSON,
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    
    UNIQUE(tenant_id, permission_id)
);
```

### Service Layer

#### Permission Service
```php
class PermissionService {
    public function check(User $user, string $permission, ?Tenant $tenant = null): bool
    public function grant(User $user, string $permission, ?Tenant $tenant = null): void
    public function revoke(User $user, string $permission, ?Tenant $tenant = null): void
    public function getPermissions(User $user, ?Tenant $tenant = null): array
    public function getRequiredLevel(string $permission): AccessLevel
    public function getRequiredTrust(string $permission): float
}
```

#### Standing-Based Permission Check
```php
public function check(User $user, string $permission, ?Tenant $tenant = null): bool
{
    $standing = $user->standingScore($tenant);
    $requiredLevel = $this->getRequiredLevel($permission);
    $requiredTrust = $this->getRequiredTrust($permission);
    
    return $standing->level >= $requiredLevel && 
           $standing->trust >= $requiredTrust;
}
```

### Frontend Integration

#### Permission Hooks
```typescript
export const usePermissions = () => {
  const { user, tenant } = useAuth();
  const { standingScore } = useStanding();
  
  const hasPermission = (permission: string): boolean => {
    return permissionService.check(user, permission, tenant);
  };
  
  const canAccess = (feature: string): boolean => {
    const requiredPermission = getPermissionForFeature(feature);
    return hasPermission(requiredPermission);
  };
  
  return { hasPermission, canAccess };
};
```

#### Scene Authoring Permissions
```typescript
export const useAuthoringPermissions = (): AuthoringPermissions => {
  const { hasPermission } = usePermissions();
  const { standingScore } = useStanding();
  
  return {
    canCreateScene: (type) => hasPermission(`scene.create.${type}`),
    canEditScene: (sceneId) => hasPermission(`scene.edit.${sceneId}`),
    canDeleteScene: (sceneId) => hasPermission(`scene.delete.${sceneId}`),
    canUseCardAuthoring: () => hasPermission('authoring.card'),
    canUseGraphAuthoring: () => hasPermission('authoring.graph'),
    canUseDocumentAuthoring: () => hasPermission('authoring.document'),
    canCreateNode: () => hasPermission('graph.node.create'),
    canCreateEdge: () => hasPermission('graph.edge.create'),
    canModifyCoreGraph: () => hasPermission('graph.modify.core'),
    canAccessNodeMetadata: () => hasPermission('graph.metadata.access'),
  };
};
```

## Permission Configuration

### Default Permissions
```php
$defaultPermissions = [
    // Content permissions
    'scene.create.card' => ['level' => 'collaborator', 'trust' => 0.3],
    'scene.create.graph' => ['level' => 'steward', 'trust' => 0.5],
    'scene.create.document' => ['level' => 'collaborator', 'trust' => 0.3],
    'scene.edit.own' => ['level' => 'collaborator', 'trust' => 0.3],
    'scene.edit.any' => ['level' => 'curator', 'trust' => 0.7],
    'scene.delete.own' => ['level' => 'collaborator', 'trust' => 0.5],
    'scene.delete.any' => ['level' => 'guardian', 'trust' => 0.8],
    
    // Authoring permissions
    'authoring.card' => ['level' => 'collaborator', 'trust' => 0.3],
    'authoring.graph' => ['level' => 'steward', 'trust' => 0.5],
    'authoring.document' => ['level' => 'collaborator', 'trust' => 0.3],
    'authoring.advanced' => ['level' => 'curator', 'trust' => 0.7],
    
    // Graph permissions
    'graph.node.create' => ['level' => 'curator', 'trust' => 0.7],
    'graph.edge.create' => ['level' => 'curator', 'trust' => 0.7],
    'graph.modify.core' => ['level' => 'curator', 'trust' => 0.8],
    'graph.metadata.access' => ['level' => 'steward', 'trust' => 0.5],
    
    // Tenant permissions
    'tenant.create' => ['level' => 'guardian', 'trust' => 0.8],
    'tenant.configure' => ['level' => 'guardian', 'trust' => 0.8],
    'tenant.manage.users' => ['level' => 'guardian', 'trust' => 0.8],
    'tenant.analytics' => ['level' => 'curator', 'trust' => 0.7],
    
    // System permissions
    'system.admin' => ['level' => 'architect', 'trust' => 0.9],
    'system.config' => ['level' => 'architect', 'trust' => 0.9],
    'system.users' => ['level' => 'architect', 'trust' => 0.9],
];
```

### Tenant-Specific Overrides
```php
class TenantPermissionOverride {
    public function overridePermission(string $permission, array $config): void
    {
        // Allow tenants to customize permission requirements
        // e.g., stricter requirements for sensitive operations
        // or relaxed requirements for trusted users
    }
}
```

## Security Considerations

### Trust-Based Security
- High-trust users can perform sensitive operations
- Trust scores are calculated from community feedback
- Trust cannot be artificially inflated
- Trust decays over time without activity

### Permission Inheritance
- Users inherit permissions from their merit level
- Additional permissions can be granted explicitly
- Permissions can be revoked for violations
- Permission changes are logged and auditable

### Multi-Tenant Isolation
- Permissions are scoped to tenants
- Cross-tenant permissions require special access
- Tenant administrators can override some permissions
- Global permissions apply across all tenants

## Implementation Phases

### Phase 5A: Permission Foundation
- [ ] Create permission database schema
- [ ] Implement PermissionService
- [ ] Add standing-based permission checks
- [ ] Create permission hooks for frontend
- [ ] Update scene authoring library with permissions

### Phase 5B: Advanced Permissions
- [ ] Add tenant-specific permission overrides
- [ ] Implement permission inheritance
- [ ] Add permission auditing and logging
- [ ] Create permission management UI
- [ ] Add permission-based feature toggles

### Phase 6: Security & Trust
- [ ] Implement trust-based security model
- [ ] Add permission violation detection
- [ ] Create security audit trails
- [ ] Add permission escalation controls
- [ ] Implement permission recovery mechanisms

This permissions architecture provides a comprehensive, scalable system that will grow with your community while maintaining security and encouraging quality participation.
