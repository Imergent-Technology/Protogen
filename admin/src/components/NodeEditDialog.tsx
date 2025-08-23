import { useState, useEffect } from 'react';
import { 
  CoreGraphNode, 
  CoreGraphNodeType,
  apiClient 
} from '@progress/shared';
import { X } from 'lucide-react';

interface NodeEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onNodeUpdated: (node: CoreGraphNode) => void;
  node: CoreGraphNode | null;
}

export function NodeEditDialog({
  isOpen,
  onClose,
  onNodeUpdated,
  node
}: NodeEditDialogProps) {
  const [nodeTypes, setNodeTypes] = useState<CoreGraphNodeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nodeTypeId: '',
    label: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadNodeTypes();
      // Pre-populate form with existing node data
      if (node) {
        setFormData({
          nodeTypeId: node.node_type_id?.toString() || '',
          label: node.label || '',
          description: node.description || ''
        });
      }
      setError(null);
    }
  }, [isOpen, node]);

  const loadNodeTypes = async () => {
    try {
      const response = await apiClient.getGraphNodeTypes();
      if (response.success) {
        setNodeTypes(response.data);
      }
    } catch (err) {
      setError('Failed to load node types');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nodeTypeId || !formData.label.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!node) {
      setError('No node selected for editing');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.updateGraphNode(node.guid, {
        node_type_id: parseInt(formData.nodeTypeId),
        label: formData.label.trim(),
        description: formData.description.trim() || undefined
      });

      if (response.success) {
        onNodeUpdated(response.data);
        onClose();
      } else {
        setError(response.message || 'Failed to update node');
      }
    } catch (err) {
      setError('Failed to update node. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  if (!isOpen || !node) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Node</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Node Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Node Type *
            </label>
            <select
              value={formData.nodeTypeId}
              onChange={(e) => handleInputChange('nodeTypeId', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select node type</option>
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
              onChange={(e) => handleInputChange('label', e.target.value)}
              placeholder="Node label"
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Node description"
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Node'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
