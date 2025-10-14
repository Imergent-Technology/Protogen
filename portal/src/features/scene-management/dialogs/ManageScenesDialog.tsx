/**
 * Manage Scenes Dialog
 * 
 * Full-screen dialog for viewing, creating, editing, and deleting scenes.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { dialogSystem } from '@protogen/shared/systems/dialog';
import { sceneManagementService } from '@protogen/shared/systems/scene-management';
import type { SceneConfig } from '@protogen/shared/systems/scene-management';
import { Button, Input, Label } from '@protogen/shared/components';
import { Pencil, Trash2, Eye, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { openCreateSceneDialog } from './CreateSceneDialog';
import { openEditSceneDialog } from './EditSceneDialog';

interface ManageScenesDialogProps {}

const ManageScenesContent: React.FC<ManageScenesDialogProps> = () => {
  const [scenes, setScenes] = useState<SceneConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loadScenes = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await sceneManagementService.getScenes();
      // Unwrap the API response
      const scenesData = Array.isArray(result) ? result : (result as any)?.data?.data || (result as any)?.data || [];
      console.log('Loaded scenes:', scenesData);
      setScenes(scenesData);
    } catch (err) {
      console.error('Failed to load scenes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load scenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScenes();
  }, []);

  // Filter and paginate scenes
  const filteredScenes = useMemo(() => {
    let filtered = scenes;

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(scene =>
        scene.name.toLowerCase().includes(query) ||
        scene.slug.toLowerCase().includes(query) ||
        scene.description?.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(scene => scene.type === typeFilter);
    }

    // Apply status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(scene => scene.is_active);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(scene => !scene.is_active);
    } else if (statusFilter === 'public') {
      filtered = filtered.filter(scene => scene.is_public);
    } else if (statusFilter === 'private') {
      filtered = filtered.filter(scene => !scene.is_public);
    }

    return filtered;
  }, [scenes, searchQuery, typeFilter, statusFilter]);

  const paginatedScenes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredScenes.slice(startIndex, endIndex);
  }, [filteredScenes, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredScenes.length / itemsPerPage);

  const handleEdit = (scene: SceneConfig) => {
    openEditSceneDialog({
      sceneId: scene.id,
      onSuccess: () => {
        loadScenes();
      }
    });
  };

  const handleDelete = async (scene: SceneConfig) => {
    const confirmed = await new Promise<boolean>((resolve) => {
      dialogSystem.openConfirmation({
        title: 'Delete Scene',
        message: `Are you sure you want to delete "${scene.name}"? This action cannot be undone.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        variant: 'destructive',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });

    if (!confirmed) return;

    try {
      await sceneManagementService.deleteScene(scene.id);
      dialogSystem.openToast({
        title: 'Scene Deleted',
        description: `Scene "${scene.name}" has been deleted.`,
        variant: 'success',
        duration: 3000,
      });
      await loadScenes();
    } catch (err) {
      dialogSystem.openToast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete scene',
        variant: 'error',
        duration: 5000,
      });
    }
  };

  const handleCreateNew = () => {
    openCreateSceneDialog({
      onSuccess: () => {
        loadScenes();
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading scenes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-destructive">Error: {error}</div>
        <Button onClick={loadScenes}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Search by name, slug, or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div className="w-40">
          <Label htmlFor="type-filter">Type</Label>
          <select
            id="type-filter"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            <option value="all">All Types</option>
            <option value="graph">Graph</option>
            <option value="card">Card</option>
            <option value="document">Document</option>
            <option value="dashboard">Dashboard</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-40">
          <Label htmlFor="status-filter">Status</Label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        {/* Create Button */}
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Create Scene
        </Button>
      </div>

      {/* Results Info */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredScenes.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
        {Math.min(currentPage * itemsPerPage, filteredScenes.length)} of {filteredScenes.length} scene{filteredScenes.length !== 1 ? 's' : ''}
      </div>

      {/* Scenes Table */}
      {filteredScenes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 border border-dashed rounded-lg">
          <div className="text-muted-foreground">
            {scenes.length === 0 ? 'No scenes found' : 'No scenes match your filters'}
          </div>
          {scenes.length === 0 && (
            <Button onClick={handleCreateNew} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Scene
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {paginatedScenes.map((scene) => (
                <tr key={scene.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium">{scene.name}</div>
                    {scene.description && (
                      <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {scene.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                    {scene.slug}
                  </td>
                  <td className="px-6 py-4 text-sm capitalize">
                    {scene.type}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {scene.is_active && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                      {!scene.is_active && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                      {scene.is_public && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Public
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          dialogSystem.openToast({
                            title: 'View Scene',
                            description: 'Scene viewing not yet implemented',
                            variant: 'default',
                            duration: 2000,
                          });
                        }}
                        title="View scene"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(scene)}
                        title="Edit scene"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(scene)}
                        title="Delete scene"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="items-per-page" className="text-sm">Items per page:</Label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1 border border-input rounded-md bg-background text-sm"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export interface ManageScenesDialogOptions {
  onClose?: () => void;
}

export function openManageScenesDialog(props?: ManageScenesDialogOptions) {
  dialogSystem.openFullScreen({
    title: 'Scene Management',
    description: 'Create, edit, and manage all scenes',
    fullscreenSize: 'xlarge',
    content: React.createElement(ManageScenesContent, {}),
    closeOnEscape: true,
    closeOnBackdrop: true,
    onClose: () => {
      props?.onClose?.();
    }
  });
}
