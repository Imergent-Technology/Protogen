import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Grid, List, Check } from 'lucide-react';
import { Button, Input } from '@protogen/shared';

export interface SelectableItem {
  id: string;
  name: string;
  type: string;
  description?: string;
  thumbnail?: string;
  metadata?: {
    title?: string;
    author?: string;
    tags?: string[];
    createdAt?: string;
    updatedAt?: string;
  };
  stats?: {
    viewCount?: number;
    lastViewed?: string;
  };
  isActive?: boolean;
  isPublic?: boolean;
}

export interface EntitySelectorProps {
  isOpen?: boolean;
  onClose?: () => void;
  onConfirm: (selectedItems: SelectableItem[]) => void;
  title: string;
  items: SelectableItem[];
  selectedItems: SelectableItem[];
  multiSelect?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  confirmText?: string;
  className?: string;
  asModal?: boolean; // New prop to control modal vs inline rendering
}

const EntitySelector: React.FC<EntitySelectorProps> = ({
  isOpen = true,
  onClose,
  onConfirm,
  title,
  items,
  selectedItems,
  multiSelect = true,
  searchPlaceholder = "Search items...",
  emptyMessage = "No items found",
  confirmText = "Select",
  className = "",
  asModal = true
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [localSelectedItems, setLocalSelectedItems] = useState<SelectableItem[]>(selectedItems);
  const modalRef = useRef<HTMLDivElement>(null);

  // Update local selection when props change
  useEffect(() => {
    setLocalSelectedItems(selectedItems);
  }, [selectedItems]);

  // Close modal when clicking outside (only for modal mode)
  useEffect(() => {
    if (!asModal || !onClose) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, asModal]);

  // Filter items based on search
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.metadata?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  // Handle item selection
  const handleItemClick = (item: SelectableItem, event: React.MouseEvent) => {
    if (!multiSelect) {
      setLocalSelectedItems([item]);
      return;
    }

    const isSelected = localSelectedItems.some(selected => selected.id === item.id);
    
    if (event.ctrlKey || event.metaKey) {
      // Toggle selection
      if (isSelected) {
        setLocalSelectedItems(prev => prev.filter(selected => selected.id !== item.id));
      } else {
        setLocalSelectedItems(prev => [...prev, item]);
      }
    } else if (event.shiftKey && localSelectedItems.length > 0) {
      // Range selection
      const lastSelectedIndex = filteredItems.findIndex(filteredItem => 
        filteredItem.id === localSelectedItems[localSelectedItems.length - 1].id
      );
      const currentIndex = filteredItems.findIndex(filteredItem => filteredItem.id === item.id);
      
      const start = Math.min(lastSelectedIndex, currentIndex);
      const end = Math.max(lastSelectedIndex, currentIndex);
      
      const rangeItems = filteredItems.slice(start, end + 1);
      const newSelection = [...localSelectedItems];
      
      rangeItems.forEach(rangeItem => {
        if (!newSelection.some(selected => selected.id === rangeItem.id)) {
          newSelection.push(rangeItem);
        }
      });
      
      setLocalSelectedItems(newSelection);
    } else {
      // Single selection (replace current selection)
      setLocalSelectedItems([item]);
    }
  };

  // Handle confirm
  const handleConfirm = () => {
    onConfirm(localSelectedItems);
    if (asModal && onClose) {
      onClose();
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setLocalSelectedItems(selectedItems); // Reset to original selection
    if (asModal && onClose) {
      onClose();
    }
  };

  // Get item type icon
  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'graph': return '📊';
      case 'card': return '🃏';
      case 'document': return '📄';
      case 'dashboard': return '📈';
      default: return '📋';
    }
  };

  // Get item type color
  const getItemTypeColor = (type: string) => {
    switch (type) {
      case 'graph': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'card': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'document': return 'bg-green-100 text-green-800 border-green-200';
      case 'dashboard': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isOpen) return null;

  const containerClasses = asModal 
    ? "fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
    : "w-full";
    
  const contentClasses = asModal
    ? `bg-card border border-border rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] flex flex-col ${className}`
    : `bg-card border border-border rounded-lg shadow-lg w-full flex flex-col ${className}`;

  return (
    <div className={containerClasses}>
      <div 
        ref={modalRef}
        className={contentClasses}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            {multiSelect && (
              <p className="text-sm text-muted-foreground mt-1">
                {localSelectedItems.length} item{localSelectedItems.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
          {asModal && onClose && (
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {multiSelect && (
            <div className="text-sm text-muted-foreground">
              <p>• Click to select • Ctrl/Cmd+Click to toggle • Shift+Click for range selection</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 opacity-50">📋</div>
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const isSelected = localSelectedItems.some(selected => selected.id === item.id);
                return (
                  <div
                    key={item.id}
                    onClick={(e) => handleItemClick(item, e)}
                    className={`relative cursor-pointer transition-all duration-200 rounded-lg border-2 ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-border hover:border-primary/50 hover:shadow-sm'
                    }`}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-10">
                        <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    )}

                    {/* Item content */}
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="text-2xl">{getItemTypeIcon(item.type)}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{item.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${getItemTypeColor(item.type)}`}>
                              {item.type}
                            </span>
                            {item.isActive !== undefined && (
                              <span className={`w-2 h-2 rounded-full ${item.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {item.description}
                        </p>
                      )}
                      
                      {item.metadata?.tags && item.metadata.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.metadata.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-muted rounded">
                              {tag}
                            </span>
                          ))}
                          {item.metadata.tags.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-muted rounded">
                              +{item.metadata.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => {
                const isSelected = localSelectedItems.some(selected => selected.id === item.id);
                return (
                  <div
                    key={item.id}
                    onClick={(e) => handleItemClick(item, e)}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-border hover:border-primary/50 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Selection indicator */}
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'border-primary bg-primary text-primary-foreground' 
                          : 'border-border'
                      }`}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>

                      {/* Item icon */}
                      <div className="text-2xl">{getItemTypeIcon(item.type)}</div>

                      {/* Item info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${getItemTypeColor(item.type)}`}>
                            {item.type}
                          </span>
                          {item.isActive !== undefined && (
                            <span className={`w-2 h-2 rounded-full ${item.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                          )}
                          {item.metadata?.tags && item.metadata.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="text-xs text-muted-foreground">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    {item.stats && (
                      <div className="text-sm text-muted-foreground">
                        {item.stats.viewCount !== undefined && (
                          <div>{item.stats.viewCount} views</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {multiSelect ? (
              <span>{localSelectedItems.length} of {filteredItems.length} items selected</span>
            ) : (
              <span>{filteredItems.length} items available</span>
            )}
          </div>
          <div className="flex space-x-3">
            {asModal && onClose && (
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
            <Button 
              onClick={handleConfirm}
              disabled={localSelectedItems.length === 0}
            >
              {confirmText} {localSelectedItems.length > 0 && `(${localSelectedItems.length})`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntitySelector;

// Export both names for backward compatibility
export { EntitySelector as SelectionModal };
