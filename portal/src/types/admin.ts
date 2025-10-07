// Admin-specific types for Portal

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  reputation: number;
  engagement: number;
  affinity: number;
  standing: number;
  standing_level: string;
  trust_level: number;
  is_admin: boolean;
  last_active_at: string | null;
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  type: 'system' | 'tenant' | 'user';
  permissions: string[];
  is_system: boolean;
  is_earnable: boolean;
  standing_requirement: number | null;
  tenant_id: number | null;
}

export interface Permission {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  category: 'system' | 'tenant' | 'content' | 'user';
  scope: 'global' | 'tenant' | 'resource' | 'user';
  is_system: boolean;
  is_tenant_scoped: boolean;
  standing_requirement: number | null;
}

export interface TenantMembership {
  id: number;
  user_id: number;
  tenant_id: number;
  role: string;
  status: 'active' | 'pending' | 'suspended' | 'left';
  joined_at: string | null;
  invited_by: number | null;
  permissions: string[] | null;
  standing_in_tenant: number;
}

export interface Tenant {
  id: number;
  guid: string;
  name: string;
  slug: string;
  description: string | null;
  domain: string | null;
  config: Record<string, any> | null;
  branding: Record<string, any> | null;
  standing_levels: StandingLevel[] | null;
  is_active: boolean;
  is_public: boolean;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface StandingLevel {
  min: number;
  name: string;
}

export interface AdminDashboardStats {
  users: {
    total: number;
    active_today: number;
    new_this_week: number;
    by_standing_level: Record<string, number>;
  };
  content: {
    total_scenes: number;
    published_scenes: number;
    draft_scenes: number;
    total_decks: number;
  };
  tenants: {
    total: number;
    active: number;
  };
  engagement: {
    total_feedback: number;
    total_comments: number;
    average_standing: number;
  };
}

