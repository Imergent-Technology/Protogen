import { useState, useEffect } from 'react';
import { 
  CoreGraphNode, 
  CoreGraphEdgeType,
  apiClient 
} from '@progress/shared';
import { X, ArrowRight } from 'lucide-react';

interface EdgeCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEdgeCreated?: (edge: any) => void;
  availableNodes: CoreGraphNode[];
}

export function EdgeCreationDialog({
  isOpen,
  onClose,
  onEdgeCreated,
  availableNodes
}: EdgeCreationDialogProps) {
  const [edgeTypes, setEdgeTypes] = useState<CoreGraphEdgeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    sourceNodeGuid: '',
    targetNodeGuid: '',
    edgeTypeId: '',
    label: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadEdgeTypes();
      // Reset form when dialog opens
      setFormData({
        sourceNodeGuid: '',
        targetNodeGuid: '',
        edgeTypeId: '',
        label: '',
        description: ''
      });
      setError(null);
    }
  }, [isOpen]);

  const loadEdgeTypes = async () => {
    try {
      const response = await apiClient.getGraphEdgeTypes();
      if (response.success) {
        setEdgeTypes(response.data);
      }
    } catch (err) {
      setError('Failed to load edge types');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sourceNodeGuid || !formData.targetNodeGuid || !formData.edgeTypeId) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.sourceNodeGuid === formData.targetNodeGuid) {
      setError('Source and target nodes cannot be the same');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.createGraphEdge({
        source_node_guid: formData.sourceNodeGuid,
        target_node_guid: formData.targetNodeGuid,
        edge_type_id: parseInt(formData.edgeTypeId),
        label: formData.label || undefined,
        description: formData.description || undefined
      });

      if (response.success) {
        onEdgeCreated?.(response.data);
        onClose();
      } else {
        setError(response.message || 'Failed to create edge');
      }
    } catch (err) {
      setError('Failed to create edge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Create Edge</h2>
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
          {/* Source Node */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Source Node *
            </label>
            <select
              value={formData.sourceNodeGuid}
              onChange={(e) => handleInputChange('sourceNodeGuid', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select source node</option>
              {availableNodes.map((node) => (
                <option key={node.guid} value={node.guid}>
                  {node.label} ({node.node_type?.display_name})
                </option>
              ))}
            </select>
          </div>

          {/* Arrow indicator */}
          <div className="flex justify-center">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Target Node */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Target Node *
            </label>
            <select
              value={formData.targetNodeGuid}
              onChange={(e) => handleInputChange('targetNodeGuid', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select target node</option>
              {availableNodes
                .filter(node => node.guid !== formData.sourceNodeGuid)
                .map((node) => (
                  <option key={node.guid} value={node.guid}>
                    {node.label} ({node.node_type?.display_name})
                  </option>
                ))}
            </select>
          </div>

          {/* Edge Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Edge Type *
            </label>
            <select
              value={formData.edgeTypeId}
              onChange={(e) => handleInputChange('edgeTypeId', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select edge type</option>
              {edgeTypes.map((edgeType) => (
                <option key={edgeType.id} value={edgeType.id}>
                  {edgeType.display_name}
                </option>
              ))}
            </select>
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Label (Optional)
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              placeholder="Edge label"
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
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
              placeholder="Edge description"
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
              {loading ? 'Creating...' : 'Create Edge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
