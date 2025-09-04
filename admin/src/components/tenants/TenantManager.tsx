import React, { useState, useEffect } from 'react';
import { Button } from '@progress/shared';
import { Input } from '@progress/shared';
import { Label } from '@progress/shared';
import { Textarea } from '@progress/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@progress/shared';
import { Badge } from '@progress/shared';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@progress/shared';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@progress/shared';
import { Switch } from '@progress/shared';
import { 
  Building2, 
  Settings, 
  Palette, 
  Globe, 
  Users, 
  BarChart3, 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface Tenant {
  id: number;
  guid: string;
  name: string;
  slug: string;
  description: string;
  domain: string | null;
  config: Record<string, any>;
  branding: Record<string, any>;
  is_active: boolean;
  is_public: boolean;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

interface TenantConfiguration {
  id: number;
  tenant_id: number;
  key: string;
  value: any;
  scope: string;
  description: string;
}

const TenantManager: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [configurations, setConfigurations] = useState<TenantConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showCreateTenant, setShowCreateTenant] = useState(false);
  const [showEditTenant, setShowEditTenant] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  
  const [tenantForm, setTenantForm] = useState({
    name: '',
    slug: '',
    description: '',
    domain: '',
    is_active: true,
    is_public: false,
  });

  const [configForm, setConfigForm] = useState({
    key: '',
    value: '',
    scope: 'global',
    description: '',
  });

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockTenants: Tenant[] = [
        {
          id: 1,
          guid: 'default-tenant-guid',
          name: 'Default Tenant',
          slug: 'default',
          description: 'Default tenant for existing content and new deployments',
          domain: null,
          config: { is_default: true, migration_source: 'stage_system' },
          branding: {
            logo_url: null,
            primary_color: '#3b82f6',
            secondary_color: '#64748b',
            theme: 'light',
          },
          is_active: true,
          is_public: true,
          created_by: 1,
          created_at: '2025-01-15T00:00:00Z',
          updated_at: '2025-01-15T00:00:00Z',
        },
      ];
      
      setTenants(mockTenants);
      setError(null);
    } catch (err) {
      setError('Failed to load tenants');
      console.error('Error loading tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async () => {
    try {
      // TODO: Replace with actual API call
      const newTenant: Tenant = {
        id: tenants.length + 1,
        guid: `tenant-${Date.now()}`,
        name: tenantForm.name,
        slug: tenantForm.slug,
        description: tenantForm.description,
        domain: tenantForm.domain || null,
        config: {},
        branding: {
          primary_color: '#3b82f6',
          secondary_color: '#64748b',
          theme: 'light',
        },
        is_active: tenantForm.is_active,
        is_public: tenantForm.is_public,
        created_by: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setTenants([...tenants, newTenant]);
      setShowCreateTenant(false);
      resetTenantForm();
    } catch (err) {
      setError('Failed to create tenant');
      console.error('Error creating tenant:', err);
    }
  };

  const handleEditTenant = async () => {
    if (!selectedTenant) return;

    try {
      // TODO: Replace with actual API call
      const updatedTenants = tenants.map(tenant =>
        tenant.id === selectedTenant.id
          ? { ...tenant, ...tenantForm }
          : tenant
      );

      setTenants(updatedTenants);
      setShowEditTenant(false);
      setSelectedTenant(null);
      resetTenantForm();
    } catch (err) {
      setError('Failed to update tenant');
      console.error('Error updating tenant:', err);
    }
  };

  const handleDeleteTenant = async (tenantId: number) => {
    if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      const updatedTenants = tenants.filter(tenant => tenant.id !== tenantId);
      setTenants(updatedTenants);
    } catch (err) {
      setError('Failed to delete tenant');
      console.error('Error deleting tenant:', err);
    }
  };

  const resetTenantForm = () => {
    setTenantForm({
      name: '',
      slug: '',
      description: '',
      domain: '',
      is_active: true,
      is_public: false,
    });
  };

  const openEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setTenantForm({
      name: tenant.name,
      slug: tenant.slug,
      description: tenant.description,
      domain: tenant.domain || '',
      is_active: tenant.is_active,
      is_public: tenant.is_public,
    });
    setShowEditTenant(true);
  };

  const getStatusBadge = (tenant: Tenant) => {
    if (!tenant.is_active) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    if (tenant.is_public) {
      return <Badge variant="default">Public</Badge>;
    }
    return <Badge variant="secondary">Private</Badge>;
  };

  const getContentCount = (tenant: Tenant) => {
    // TODO: Replace with actual content counts
    return {
      scenes: 12,
      decks: 3,
      contexts: 45,
      feedback: 67,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tenants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Tenants</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={loadTenants}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tenant Management</h1>
          <p className="text-muted-foreground">
            Manage multi-tenant environments with isolated content and shared feedback
          </p>
        </div>
        <Dialog open={showCreateTenant} onOpenChange={setShowCreateTenant}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Tenant</DialogTitle>
              <DialogDescription>
                Create a new tenant environment with isolated content and configuration.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={tenantForm.name}
                    onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })}
                    placeholder="Tenant Name"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={tenantForm.slug}
                    onChange={(e) => setTenantForm({ ...tenantForm, slug: e.target.value })}
                    placeholder="tenant-slug"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={tenantForm.description}
                  onChange={(e) => setTenantForm({ ...tenantForm, description: e.target.value })}
                  placeholder="Describe this tenant's purpose..."
                />
              </div>
              <div>
                <Label htmlFor="domain">Custom Domain (Optional)</Label>
                <Input
                  id="domain"
                  value={tenantForm.domain}
                  onChange={(e) => setTenantForm({ ...tenantForm, domain: e.target.value })}
                  placeholder="tenant.example.com"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                                      <Switch
                      checked={tenantForm.is_active}
                      onCheckedChange={(checked) => setTenantForm({ ...tenantForm, is_active: checked })}
                    />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                                      <Switch
                      checked={tenantForm.is_public}
                      onCheckedChange={(checked) => setTenantForm({ ...tenantForm, is_public: checked })}
                    />
                  <Label htmlFor="is_public">Public</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateTenant(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTenant}>Create Tenant</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tenant List */}
      <div className="grid gap-6">
        {tenants.map((tenant) => (
          <Card key={tenant.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      {tenant.name}
                      {tenant.config?.is_default && (
                        <Badge variant="outline">Default</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{tenant.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(tenant)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditTenant(tenant)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!tenant.config?.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTenant(tenant.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value="overview" onValueChange={() => {}} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="config">Configuration</TabsTrigger>
                  <TabsTrigger value="branding">Branding</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Slug</Label>
                      <p className="text-sm text-muted-foreground">{tenant.slug}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Domain</Label>
                      <p className="text-sm text-muted-foreground">
                        {tenant.domain || 'No custom domain'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Created</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tenant.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Updated</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tenant.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(getContentCount(tenant)).map(([key, count]) => (
                      <div key={key} className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">{count}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {key}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="config" className="space-y-4">
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Configuration Management</h3>
                    <p className="text-muted-foreground">
                      Tenant-specific configuration management coming soon...
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="branding" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Primary Color</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: tenant.branding?.primary_color }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {tenant.branding?.primary_color}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Secondary Color</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: tenant.branding?.secondary_color }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {tenant.branding?.secondary_color}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Theme</Label>
                      <p className="text-sm text-muted-foreground capitalize">
                        {tenant.branding?.theme || 'light'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Logo</Label>
                      <p className="text-sm text-muted-foreground">
                        {tenant.branding?.logo_url ? 'Custom logo set' : 'No custom logo'}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Tenant Dialog */}
      <Dialog open={showEditTenant} onOpenChange={setShowEditTenant}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
            <DialogDescription>
              Update tenant settings and configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={tenantForm.name}
                  onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })}
                  placeholder="Tenant Name"
                />
              </div>
              <div>
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  value={tenantForm.slug}
                  onChange={(e) => setTenantForm({ ...tenantForm, slug: e.target.value })}
                  placeholder="tenant-slug"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={tenantForm.description}
                onChange={(e) => setTenantForm({ ...tenantForm, description: e.target.value })}
                placeholder="Describe this tenant's purpose..."
              />
            </div>
            <div>
              <Label htmlFor="edit-domain">Custom Domain (Optional)</Label>
              <Input
                id="edit-domain"
                value={tenantForm.domain}
                onChange={(e) => setTenantForm({ ...tenantForm, domain: e.target.value })}
                placeholder="tenant.example.com"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                                  <Switch
                    checked={tenantForm.is_active}
                    onCheckedChange={(checked) => setTenantForm({ ...tenantForm, is_active: checked })}
                  />
                <Label htmlFor="edit-is_active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                                  <Switch
                    checked={tenantForm.is_public}
                    onCheckedChange={(checked) => setTenantForm({ ...tenantForm, is_public: checked })}
                  />
                <Label htmlFor="edit-is_public">Public</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTenant(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTenant}>Update Tenant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantManager;
