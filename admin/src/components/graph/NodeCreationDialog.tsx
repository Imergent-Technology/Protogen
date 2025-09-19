import { useState, useEffect } from 'react';
import { 
  CoreGraphNodeType, 
  CreateNodeRequest, 
  apiClient 
} from '@protogen/shared';
import { X, Save, Loader2 } from 'lucide-react';

interface NodeCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onNodeCreated?: (node: any) => void;
}

export function NodeCreationDialog({
  isOpen,
  onClose,
  onNodeCreated
}: NodeCreationDialogProps) {
  const [nodeTypes, setNodeTypes] = useState<CoreGraphNodeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateNodeRequest>({
    node_type_id: 0,
    label: '',
    description: '',
    properties: {}
  });

  // Load node types when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadNodeTypes();
    }
  }, [isOpen]);

  const loadNodeTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getGraphNodeTypes();
      if (response.success) {
        setNodeTypes(response.data);
        // Set first node type as default if available
        if (response.data.length > 0 && !formData.node_type_id) {
          setFormData(prev => ({ ...prev, node_type_id: response.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Error loading node types:', err);
      setError('Failed to load node types');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.node_type_id || !formData.label.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.createGraphNode(formData);
      if (response.success) {
        onNodeCreated?.(response.data);
        handleClose();
      } else {
        setError(response.message || 'Failed to create node');
      }
    } catch (err) {
      console.error('Error creating node:', err);
      setError('Failed to create node');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      node_type_id: 0,
      label: '',
      description: '',
      properties: {}
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Create New Node</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-muted rounded transition-colors"
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Node Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Node Type *
            </label>
            <select
              value={formData.node_type_id}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                node_type_id: parseInt(e.target.value) 
              }))}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
              required
            >
              <option value={0}>Select a node type...</option>
              {nodeTypes.map((nodeType) => (
                <option key={nodeType.id} value={nodeType.id}>
                  {nodeType.display_name}
                </option>
              ))}
            </select>
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Label *
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                label: e.target.value 
              }))}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter node label..."
              disabled={loading}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                description: e.target.value 
              }))}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Enter node description..."
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.node_type_id || !formData.label.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Node
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
