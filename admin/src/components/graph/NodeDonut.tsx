
import { CoreGraphNode } from '@progress/shared';
import { Lock, Unlock, X, Edit3, Trash2 } from 'lucide-react';

interface NodeDonutProps {
  node: CoreGraphNode;
  position: { x: number; y: number };
  isLocked: boolean;
  onLockToggle: (locked: boolean) => void;
  onClose: () => void;
  onEdit?: (node: CoreGraphNode) => void;
  onDelete?: (node: CoreGraphNode) => void;
}

export function NodeDonut({
  node,
  position,
  isLocked,
  onLockToggle,
  onClose,
  onEdit,
  onDelete
}: NodeDonutProps) {
  const donutSize = 120;


  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: position.x - donutSize / 2,
        top: position.y - donutSize / 2,
        width: donutSize,
        height: donutSize
      }}
    >
      {/* Donut background */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm border-2 border-primary/20 rounded-full shadow-lg" />
      
      {/* Node info in center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <div className="text-xs font-medium text-muted-foreground mb-1">
          {node.node_type?.display_name || 'Unknown'}
        </div>
        <div className="text-sm font-semibold text-foreground truncate max-w-[80px]">
          {node.label}
        </div>
      </div>

      {/* Lock toggle button (top) */}
      <button
        onClick={() => onLockToggle(!isLocked)}
        className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 transition-all duration-200 pointer-events-auto ${
          isLocked
            ? 'bg-primary text-primary-foreground border-primary shadow-lg'
            : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-primary'
        }`}
        title={isLocked ? 'Unlock position' : 'Lock position'}
      >
        {isLocked ? (
          <Lock className="w-4 h-4 mx-auto" />
        ) : (
          <Unlock className="w-4 h-4 mx-auto" />
        )}
      </button>

      {/* Close button (right) */}
      <button
        onClick={onClose}
        className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background text-muted-foreground border-2 border-border hover:border-primary hover:text-primary transition-all duration-200 pointer-events-auto"
        title="Close"
      >
        <X className="w-4 h-4 mx-auto" />
      </button>

      {/* Edit button (bottom) */}
      {onEdit && (
        <button
          onClick={() => onEdit(node)}
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-8 h-8 rounded-full bg-background text-muted-foreground border-2 border-border hover:border-primary hover:text-primary transition-all duration-200 pointer-events-auto"
          title="Edit node"
        >
          <Edit3 className="w-4 h-4 mx-auto" />
        </button>
      )}

      {/* Delete button (left) */}
      {onDelete && (
        <button
          onClick={() => onDelete(node)}
          className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background text-destructive border-2 border-border hover:border-destructive hover:bg-destructive/10 transition-all duration-200 pointer-events-auto"
          title="Delete node"
        >
          <Trash2 className="w-4 h-4 mx-auto" />
        </button>
      )}
    </div>
  );
}
