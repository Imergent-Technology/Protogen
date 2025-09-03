import { useState, useMemo } from 'react';
import { Stage } from '@progress/shared';
import { Search, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StageNavigationProps {
  stages: Stage[];
  loading?: boolean;
  onStageSelect: (stage: Stage) => void;
  onNavigateToSection: (section: string) => void;
  currentStage?: Stage | null;
}

interface StageNode {
  id: string;
  name: string;
  type: 'stage' | 'section' | 'system';
  stage?: Stage;
  children?: StageNode[];
  isExpanded?: boolean;
  icon?: string;
}

export function StageNavigation({
  stages,
  loading = false,
  onStageSelect,
  onNavigateToSection,
  currentStage
}: StageNavigationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['system', 'stages']));

  const getStageTypeIcon = (type: string) => {
    switch (type) {
      case 'basic': return '📝';
      case 'document': return '📄';
      case 'graph': return '🔗';
      case 'table': return '📊';
      case 'custom': return '⚙️';
      default: return '📄';
    }
  };

  // Build hierarchical structure
  const stageTree = useMemo(() => {
    // If loading, return minimal tree
    if (loading) {
      return [
        {
          id: 'loading',
          name: 'Loading...',
          type: 'section' as const,
          icon: '⏳',
          children: []
        }
      ];
    }
    
    // Ensure stages is a valid array
    if (!Array.isArray(stages)) {
      console.warn('StageNavigation: stages is not an array:', stages);
      return [
        {
          id: 'error',
          name: 'Error loading stages',
          type: 'section' as const,
          icon: '❌',
          children: []
        }
      ];
    }
    
    const tree: StageNode[] = [
      {
        id: 'system',
        name: 'System',
        type: 'section',
        icon: '⚙️',
        children: [
          {
            id: 'admin-dashboard',
            name: 'Admin Dashboard',
            type: 'system',
            icon: '🏠'
          }
        ]
      },
      {
        id: 'stages',
        name: 'Stages',
        type: 'section',
        icon: '📄',
                 children: (stages || [])
           .filter(stage => stage && stage.id && !(stage as any).is_system) // Filter out system stages and invalid stages
          .map(stage => ({
            id: `stage-${stage.id}`,
            name: stage.name || 'Unnamed Stage',
            type: 'stage' as const,
            stage,
            icon: (stage.config?.icon) || getStageTypeIcon(stage.type || 'basic')
          }))
      },
      {
        id: 'management',
        name: 'Management',
        type: 'section',
        icon: '🔧',
        children: [
          {
            id: 'users',
            name: 'User Management',
            type: 'section',
            icon: '👥'
          },
          {
            id: 'analytics',
            name: 'Analytics',
            type: 'section',
            icon: '📊'
          }
        ]
      }
    ];

    return tree;
  }, [stages]);

  // Filter tree based on search query
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return stageTree;

    const searchLower = searchQuery.toLowerCase();
    
    const filterNode = (node: StageNode): StageNode | null => {
      const matchesSearch = node.name.toLowerCase().includes(searchLower);
      
      if (node.children) {
        const filteredChildren = node.children
          .map(filterNode)
          .filter(Boolean) as StageNode[];
        
        if (filteredChildren.length > 0 || matchesSearch) {
          return {
            ...node,
            children: filteredChildren
          };
        }
      }
      
      return matchesSearch ? node : null;
    };

    return stageTree
      .map(filterNode)
      .filter(Boolean) as StageNode[];
  }, [stageTree, searchQuery]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleNodeClick = (node: StageNode) => {
    if (node.type === 'stage' && node.stage) {
      onStageSelect(node.stage);
    } else if (node.type === 'section') {
      toggleNode(node.id);
      if (['users', 'analytics'].includes(node.id)) {
        onNavigateToSection(node.id);
      }
    } else if (node.type === 'system') {
      if (node.id === 'admin-dashboard') {
        onNavigateToSection('admin');
      }
    }
  };



  const renderNode = (node: StageNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isCurrentStage = currentStage && node.stage?.id === currentStage.id;

    return (
      <motion.div
        key={node.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: depth * 0.05 }}
      >
        <div
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
            isCurrentStage
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
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}
          
          {/* Icon */}
          <span className="text-lg">{node.icon}</span>
          
          {/* Name */}
          <span className="flex-1 text-sm font-medium truncate">
            {node.name}
          </span>
          
          {/* Stage status indicator */}
          {node.type === 'stage' && node.stage && (
            <div className={`w-2 h-2 rounded-full ${
              node.stage.is_active ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
          )}
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
      {/* Search Header */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={loading ? "Loading stages..." : "Search stages..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
        </div>
      </div>

      {/* Navigation Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm">Loading stages...</p>
          </div>
        ) : (
          <>
            <AnimatePresence>
              {filteredTree.map(node => renderNode(node))}
            </AnimatePresence>
            
            {filteredTree.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No stages found</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center">
            <div className="font-semibold text-primary">
              {loading ? '...' : stages.filter(s => s.is_active).length}
            </div>
            <div className="text-muted-foreground">Published</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-primary">
              {loading ? '...' : stages.filter(s => !s.is_active).length}
            </div>
            <div className="text-muted-foreground">Drafts</div>
          </div>
        </div>
      </div>
    </div>
  );
}
