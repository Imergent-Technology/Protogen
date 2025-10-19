/**
 * NodeDetailDialog Component
 * 
 * Displays detailed information about a selected graph node.
 */
import { CoreGraphNode } from '@protogen/shared';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@protogen/shared/components';

export interface NodeDetailDialogProps {
  /**
   * Node to display details for
   */
  node: CoreGraphNode;
  
  /**
   * Dialog open state
   */
  isOpen: boolean;
  
  /**
   * Close handler
   */
  onClose: () => void;
}

/**
 * NodeDetailDialog - Display node information
 * 
 * Shows node label, type, description, and metadata in a dialog.
 */
export function NodeDetailDialog({
  node,
  isOpen,
  onClose,
}: NodeDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{node.label}</DialogTitle>
          <DialogDescription>
            {node.node_type?.display_name || 'Node'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Description */}
          {node.description && (
            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{node.description}</p>
            </div>
          )}

          {/* Node Type */}
          <div>
            <h3 className="text-sm font-medium mb-2">Type</h3>
            <div className="flex items-center gap-2">
              {node.node_type?.icon && (
                <span className="text-lg">{node.node_type.icon}</span>
              )}
              <span className="text-sm">
                {node.node_type?.display_name || 'Unknown'}
              </span>
            </div>
          </div>

          {/* Properties */}
          {node.properties && Object.keys(node.properties).length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Properties</h3>
              <div className="bg-muted p-3 rounded-md">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(node.properties, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">ID:</span>
              <span className="ml-2 text-muted-foreground">{node.id}</span>
            </div>
            <div>
              <span className="font-medium">GUID:</span>
              <span className="ml-2 text-muted-foreground font-mono text-xs">
                {node.guid}
              </span>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <span className={`ml-2 ${node.is_active ? 'text-green-600' : 'text-red-600'}`}>
                {node.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <span className="font-medium">Created:</span>
              <span className="ml-2 text-muted-foreground text-xs">
                {new Date(node.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Connected Nodes - Future enhancement */}
          {/* TODO: Add in Sprint 3 with "Explore related" functionality */}
        </div>
      </DialogContent>
    </Dialog>
  );
}

