import { useState, useMemo } from 'react';
import { Search, ChevronDown, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SceneNavigationProps {
  onNavigateToSection: (section: string) => void;
  currentView?: string;
}

interface Tenant {
  id: number;
  name: string;
  slug: string;
  is_default: boolean;
}

interface NavigationNode {
  id: string;
  name: string;
  type: 'section' | 'system';
  icon: string;
  children?: NavigationNode[];
}

export function SceneNavigation({
  onNavigateToSection,
  currentView
}: SceneNavigationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['system', 'content']));
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isTenantMenuOpen, setIsTenantMenuOpen] = useState(false);

  // Mock tenant data - replace with actual API call
  const tenants: Tenant[] = [
    {
      id: 1,
      name: 'Progress',
      slug: 'progress',
      is_default: true
    }
  ];

  // Set default tenant on component mount
  useMemo(() => {
    if (!selectedTenant && tenants.length > 0) {
      setSelectedTenant(tenants.find(t => t.is_default) || tenants[0]);
    }
  }, [tenants, selectedTenant]);

  // Build navigation structure
  const navigationTree = useMemo(() => {
    const tree: NavigationNode[] = [
      {
        id: 'system',
        name: 'System',
        type: 'section',
        icon: '⚙️',
        children: [
          {
            id: 'admin-dashboard',
            name: 'Protogen Admin',
            type: 'system',
            icon: '🏠'
          }
        ]
      },
      {
        id: 'content',
        name: 'Content Management',
        type: 'section',
        icon: '📄',
        children: [
          {
            id: 'scenes',
            name: 'Scenes',
            type: 'system',
            icon: '🎬'
          },
          {
            id: 'decks',
            name: 'Decks',
            type: 'system',
            icon: '🃏'
          },
          {
            id: 'contexts',
            name: 'Contexts',
            type: 'system',
            icon: '🎯'
          }
        ]
      },
      {
        id: 'management',
        name: 'System Management',
        type: 'section',
        icon: '🔧',
        children: [
          {
            id: 'tenants',
            name: 'Tenant Management',
            type: 'system',
            icon: '🏢'
          },
          {
            id: 'users',
            name: 'User Management',
            type: 'system',
            icon: '👥'
          },
          {
            id: 'analytics',
            name: 'Analytics',
            type: 'system',
            icon: '📊'
          }
        ]
      },
      {
        id: 'tools',
        name: 'Tools',
        type: 'section',
        icon: '🛠️',
        children: [
          {
            id: 'graph-studio',
            name: 'Graph Studio',
            type: 'system',
            icon: '🔗'
          }
        ]
      }
    ];

    return tree;
  }, []);

  // Filter tree based on search query
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return navigationTree;

    const searchLower = searchQuery.toLowerCase();
    
    const filterNode = (node: NavigationNode): NavigationNode | null => {
      const matchesSearch = node.name.toLowerCase().includes(searchLower);
      
      if (node.children) {
        const filteredChildren = node.children
          .map(filterNode)
          .filter(Boolean) as NavigationNode[];
        
        if (filteredChildren.length > 0 || matchesSearch) {
          return {
            ...node,
            children: filteredChildren
          };
        }
      }
      
      return matchesSearch ? node : null;
    };

    return navigationTree
      .map(filterNode)
      .filter(Boolean) as NavigationNode[];
  }, [navigationTree, searchQuery]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleNodeClick = (node: NavigationNode) => {
    if (node.type === 'system') {
      onNavigateToSection(node.id);
    } else if (node.type === 'section') {
      toggleNode(node.id);
    }
  };

  const handleTenantSelect = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsTenantMenuOpen(false);
    // TODO: Implement tenant switching logic
  };

  const renderNode = (node: NavigationNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isCurrentView = currentView === node.id;

    return (
      <motion.div
        key={node.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: depth * 0.05 }}
      >
        <div
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
            isCurrentView
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-muted/50'
          }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          onClick={() => handleNodeClick(node)}
        >
          {/* Expand/Collapse arrow */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="p-1 hover:bg-muted rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
              )}
            </button>
          )}
          
          {/* Icon */}
          <span className="text-lg">{node.icon}</span>
          
          {/* Name */}
          <span className="flex-1 text-sm font-medium truncate">
            {node.name}
          </span>
        </div>
        
        {/* Children */}
        {hasChildren && isExpanded && (
          <AnimatePresence>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {node.children!.map(child => renderNode(child, depth + 1))}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-background border-r border-border">
      {/* Tenant Selection Header */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <button
            onClick={() => setIsTenantMenuOpen(!isTenantMenuOpen)}
            className="w-full flex items-center justify-between p-3 text-left bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">
                {selectedTenant?.name || 'Select Tenant'}
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isTenantMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Tenant Dropdown */}
          {isTenantMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50">
              {tenants.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => handleTenantSelect(tenant)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-accent transition-colors ${
                    selectedTenant?.id === tenant.id ? 'bg-accent' : ''
                  }`}
                >
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">{tenant.name}</span>
                  {tenant.is_default && (
                    <span className="ml-auto text-xs text-muted-foreground">Default</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search Header */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search navigation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Navigation Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        <AnimatePresence>
          {filteredTree.map(node => renderNode(node))}
        </AnimatePresence>
        
        {filteredTree.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No navigation items found</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="text-center text-xs text-muted-foreground">
          <div className="font-semibold text-primary mb-1">Protogen Admin</div>
          <div>Scene & Deck System</div>
        </div>
      </div>
    </div>
  );
}
