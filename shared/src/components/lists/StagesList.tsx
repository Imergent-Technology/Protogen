import { useState, useEffect } from 'react';
import { useStages } from '../hooks/useApi';
import { StageForm } from './StageForm';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  MoreHorizontal,
  Layers,
  FileText,
  BarChart3,
  Settings
} from 'lucide-react';

interface StagesListProps {
  onStageSelect?: (stage: any) => void;
  onStageEdit?: (stage: any) => void;
  onStageDelete?: (stageId: number) => void;
  onStagePreview?: (stage: any) => void;
  showCreateButton?: boolean;
  showActions?: boolean;
  className?: string;
}

export function StagesList({ 
  onStageSelect, 
  onStageEdit, 
  onStageDelete, 
  onStagePreview,
  showCreateButton = true,
  showActions = true,
  className = ""
}: StagesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStage, setEditingStage] = useState<any>(null);

  const { 
    stages, 
    loading, 
    error, 
    loadStages, 
    deleteStage
  } = useStages({
    autoLoad: true
  });

  // Handle errors in a stable way
  useEffect(() => {
    if (error) {
      console.error('Failed to load stages:', error);
    }
  }, [error]);



  const handleDeleteStage = async (stageId: number) => {
    if (window.confirm('Are you sure you want to delete this stage?')) {
      try {
        await deleteStage(stageId);
        onStageDelete?.(stageId);
      } catch (error) {
        console.error('Failed to delete stage:', error);
      }
    }
  };

  const handleStageSave = (stage: any) => {
    setShowCreateModal(false);
    setEditingStage(null);
    onStageEdit?.(stage);
  };

  const handleStageCancel = () => {
    setShowCreateModal(false);
    setEditingStage(null);
  };

  const getStageIcon = (type: string) => {
    switch (type) {
      case 'basic':
        return <FileText className="h-4 w-4" />;
      case 'graph':
        return <BarChart3 className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'table':
        return <BarChart3 className="h-4 w-4" />;
      case 'custom':
        return <Settings className="h-4 w-4" />;
      default:
        return <Layers className="h-4 w-4" />;
    }
  };

  const filteredStages = stages.filter(stage => {
    const matchesSearch = stage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stage.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || stage.type === filterType;
    return matchesSearch && matchesFilter;
  });



  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading stages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
        <p className="text-destructive">Error loading stages: {error.message}</p>
        <button 
          onClick={() => loadStages()}
          className="mt-2 text-sm text-destructive hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Stages</h2>
          <p className="text-muted-foreground">
            Manage your stages and their relationships
          </p>
        </div>
        {showCreateButton && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Stage</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search stages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Types</option>
          <option value="basic">Basic</option>
          <option value="graph">Graph</option>
          <option value="document">Document</option>
          <option value="table">Table</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {/* Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStages.map((stage) => (
          <div
            key={stage.id}
            className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getStageIcon(stage.type)}
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {stage.type}
                </span>
              </div>
              {showActions && (
                <div className="relative">
                  <button className="p-1 hover:bg-muted rounded">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <h3 className="text-lg font-semibold mb-2">{stage.name}</h3>
            {stage.description && (
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {stage.description}
              </p>
            )}

            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <span>ID: {stage.id}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                stage.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {stage.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            {showActions && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onStageSelect?.(stage)}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded transition-colors"
                >
                  <Eye className="h-3 w-3" />
                  <span>View</span>
                </button>
                {onStagePreview && (
                  <button
                    onClick={() => onStagePreview(stage)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Preview</span>
                  </button>
                )}
                {onStageEdit && (
                  <button
                    onClick={() => setEditingStage(stage)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-muted-foreground hover:bg-muted rounded transition-colors"
                  >
                    <Edit className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                )}
                {onStageDelete && (
                  <button
                    onClick={() => handleDeleteStage(stage.id!)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-destructive hover:bg-destructive/10 rounded transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredStages.length === 0 && (
        <div className="text-center py-12">
          <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No stages found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first stage'
            }
          </p>
          {!searchTerm && filterType === 'all' && showCreateButton && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Create First Stage</span>
            </button>
          )}
        </div>
      )}

      {/* Stage Form Modal */}
      <StageForm
        stage={editingStage}
        isOpen={showCreateModal || !!editingStage}
        onSave={handleStageSave}
        onCancel={handleStageCancel}
      />
    </div>
  );
} 