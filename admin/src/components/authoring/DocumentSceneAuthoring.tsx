import React, { useState, useEffect } from 'react';
import { Save, Eye, Image, Video, Link, Upload, X, Plus, ExternalLink } from 'lucide-react';
import { Button, Input, Label, Textarea, Card, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@progress/shared';
import NodeSelectionInterface, { NodeMetadata } from './NodeSelectionInterface';

// Types for document scene authoring
export interface DocumentSceneData {
  id?: string;
  name: string;
  description?: string;
  type: 'document';
  metadata: {
    title?: string;
    subtitle?: string;
    author?: string;
    version?: string;
    tags?: string[];
  };
  content: {
    html: string;
    markdown?: string;
    media: DocumentMedia[];
    links: DocumentLink[];
  };
  style: {
    theme?: string;
    typography?: {
      fontFamily?: string;
      fontSize?: string;
      lineHeight?: string;
    };
    layout?: {
      maxWidth?: string;
      padding?: string;
      margin?: string;
    };
  };
  config: {
    showTableOfContents?: boolean;
    enableSearch?: boolean;
    allowComments?: boolean;
    autoSave?: boolean;
  };
}

export interface DocumentMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  fullscreen?: boolean;
  autoplay?: boolean;
  controls?: boolean;
}

export interface DocumentLink {
  id: string;
  type: 'external' | 'internal' | 'node';
  url?: string;
  text: string;
  target?: '_blank' | '_self';
  nodeId?: string;
  sceneId?: string;
  deckId?: string;
  contextId?: string;
}

export interface DocumentSceneAuthoringProps {
  scene?: DocumentSceneData;
  availableNodes: NodeMetadata[];
  onSave: (scene: DocumentSceneData) => void;
  onPreview: (scene: DocumentSceneData) => void;
  onCancel: () => void;
  className?: string;
}

const DocumentSceneAuthoring: React.FC<DocumentSceneAuthoringProps> = ({
  scene,
  availableNodes,
  onSave,
  onPreview,
  onCancel,
  className = ''
}) => {
  // Form state
  const [formData, setFormData] = useState<DocumentSceneData>({
    name: '',
    description: '',
    type: 'document',
    metadata: {
      title: '',
      subtitle: '',
      author: '',
      version: '1.0.0',
      tags: []
    },
    content: {
      html: '',
      markdown: '',
      media: [],
      links: []
    },
    style: {
      theme: 'default',
      typography: {
        fontFamily: 'system-ui',
        fontSize: '16px',
        lineHeight: '1.6'
      },
      layout: {
        maxWidth: '800px',
        padding: '2rem',
        margin: '0 auto'
      }
    },
    config: {
      showTableOfContents: true,
      enableSearch: true,
      allowComments: false,
      autoSave: true
    }
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'content' | 'media' | 'links' | 'style' | 'config'>('content');
  const [showNodeSelection, setShowNodeSelection] = useState(false);
  const [selectedLinkType, setSelectedLinkType] = useState<'external' | 'internal' | 'node'>('external');
  const [newTag, setNewTag] = useState('');
  const [htmlContent, setHtmlContent] = useState('');

  // Initialize form data
  useEffect(() => {
    if (scene) {
      setFormData(scene);
      setHtmlContent(scene.content.html);
    }
  }, [scene]);

  // Handle form field changes
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMetadataChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }));
  };

  const handleConfigChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value
      }
    }));
  };

  const handleStyleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      style: {
        ...prev.style,
        [field]: value
      }
    }));
  };

  // Handle HTML content changes
  const handleHtmlChange = (html: string) => {
    setHtmlContent(html);
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        html
      }
    }));
  };

  // Handle media management (for future use)
  // const addMedia = (media: Omit<DocumentMedia, 'id'>) => {
  //   const newMedia: DocumentMedia = {
  //     ...media,
  //     id: `media_${Date.now()}`
  //   };
  //   setFormData(prev => ({
  //     ...prev,
  //     content: {
  //       ...prev.content,
  //       media: [...prev.content.media, newMedia]
  //     }
  //   }));
  // };

  const removeMedia = (mediaId: string) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        media: prev.content.media.filter(media => media.id !== mediaId)
      }
    }));
  };

  // Handle link management
  const addLink = (link: Omit<DocumentLink, 'id'>) => {
    const newLink: DocumentLink = {
      ...link,
      id: `link_${Date.now()}`
    };
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        links: [...prev.content.links, newLink]
      }
    }));
  };

  const removeLink = (linkId: string) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        links: prev.content.links.filter(link => link.id !== linkId)
      }
    }));
  };

  // Handle node selection for internal links
  const handleNodeSelection = (nodeIds: string[]) => {
    if (nodeIds.length > 0) {
      const node = availableNodes.find(n => n.id === nodeIds[0]);
      if (node) {
        addLink({
          type: 'node',
          text: node.name,
          nodeId: node.id
        });
      }
    }
    setShowNodeSelection(false);
  };

  // Handle tag management
  const addTag = () => {
    if (newTag.trim() && !formData.metadata.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          tags: [...(prev.metadata.tags || []), newTag.trim()]
        }
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags: prev.metadata.tags?.filter(tag => tag !== tagToRemove) || []
      }
    }));
  };

  // Handle save
  const handleSave = () => {
    console.log('=== DocumentSceneAuthoring handleSave function called ===');
    const sceneToSave = {
      ...formData,
      content: {
        ...formData.content,
        html: htmlContent
      }
    };
    console.log('DocumentSceneAuthoring handleSave called with:', sceneToSave);
    console.log('DocumentSceneAuthoring onSave function:', onSave);
    console.log('DocumentSceneAuthoring onSave function type:', typeof onSave);
    
    if (typeof onSave === 'function') {
      console.log('Calling onSave function...');
      onSave(sceneToSave);
      console.log('onSave function called successfully');
    } else {
      console.error('onSave is not a function!', onSave);
    }
  };

  // Handle preview
  const handlePreview = () => {
    const sceneToPreview = {
      ...formData,
      content: {
        ...formData.content,
        html: htmlContent
      }
    };
    onPreview(sceneToPreview);
  };

  return (
    <div className={`document-scene-authoring ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            {scene ? 'Edit Document Scene' : 'Create Document Scene'}
          </h2>
          <p className="text-muted-foreground">
            Create rich text content with embedded media and interactive links
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={() => {
            console.log('Save button clicked');
            handleSave();
          }}>
            <Save className="h-4 w-4 mr-2" />
            Save Scene
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Note: Click "Save Scene" to save your design before completing the workflow.
        </div>
      </div>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="mb-6">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Document Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.metadata.title || ''}
                  onChange={(e) => handleMetadataChange('title', e.target.value)}
                  placeholder="Document title"
                />
              </div>
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.metadata.subtitle || ''}
                  onChange={(e) => handleMetadataChange('subtitle', e.target.value)}
                  placeholder="Document subtitle"
                />
              </div>
              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.metadata.author || ''}
                  onChange={(e) => handleMetadataChange('author', e.target.value)}
                  placeholder="Document author"
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Describe the document purpose and content"
                rows={3}
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.metadata.tags && formData.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.metadata.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Rich Text Content</h3>
            <div className="border border-border rounded-lg">
              <div className="p-4 border-b border-border bg-muted/20">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Image className="h-4 w-4 mr-1" />
                    Image
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4 mr-1" />
                    Video
                  </Button>
                  <Button variant="outline" size="sm">
                    <Link className="h-4 w-4 mr-1" />
                    Link
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <Textarea
                  value={htmlContent}
                  onChange={(e) => handleHtmlChange(e.target.value)}
                  placeholder="Enter your rich text content here. You can use HTML tags for formatting, or switch to the TipTap editor when implemented."
                  rows={12}
                  className="min-h-[300px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Tip: Use HTML tags for formatting. TipTap rich text editor integration coming soon.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Media Library</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                <Button variant="outline" size="sm">
                  <Video className="h-4 w-4 mr-2" />
                  Add Video
                </Button>
              </div>
            </div>
            
            {formData.content.media.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formData.content.media.map((media) => (
                  <div key={media.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">
                        {media.type}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedia(media.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="aspect-video bg-muted rounded mb-2 flex items-center justify-center">
                      {media.type === 'image' ? (
                        <Image className="h-8 w-8 text-muted-foreground" />
                      ) : (
                        <Video className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <Input
                        placeholder="Alt text"
                        value={media.alt || ''}
                        onChange={(e) => {
                          const updatedMedia = formData.content.media.map(m => 
                            m.id === media.id ? { ...m, alt: e.target.value } : m
                          );
                          setFormData(prev => ({
                            ...prev,
                            content: { ...prev.content, media: updatedMedia }
                          }));
                        }}
                        className="text-xs"
                      />
                      <Input
                        placeholder="Caption"
                        value={media.caption || ''}
                        onChange={(e) => {
                          const updatedMedia = formData.content.media.map(m => 
                            m.id === media.id ? { ...m, caption: e.target.value } : m
                          );
                          setFormData(prev => ({
                            ...prev,
                            content: { ...prev.content, media: updatedMedia }
                          }));
                        }}
                        className="text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No media added yet</p>
                <p className="text-sm">Upload images or add videos to enhance your document</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Links Tab */}
        <TabsContent value="links" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Document Links</h3>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedLinkType}
                  onChange={(e) => setSelectedLinkType(e.target.value as any)}
                  className="px-3 py-1 border border-border rounded-md bg-background text-foreground text-sm"
                >
                  <option value="external">External Link</option>
                  <option value="internal">Internal Link</option>
                  <option value="node">Node Link</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedLinkType === 'node') {
                      setShowNodeSelection(true);
                    } else {
                      // TODO: Show link creation form
                      console.log('Link creation form not yet implemented');
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </div>
            </div>
            
            {formData.content.links.length > 0 ? (
              <div className="space-y-3">
                {formData.content.links.map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">
                        {link.type}
                      </Badge>
                      <div>
                        <p className="font-medium">{link.text}</p>
                        {link.url && (
                          <p className="text-sm text-muted-foreground">{link.url}</p>
                        )}
                        {link.nodeId && (
                          <p className="text-sm text-muted-foreground">Node: {link.nodeId}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {link.url && (
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLink(link.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Link className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No links added yet</p>
                <p className="text-sm">Add external, internal, or node links to enhance navigation</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Style Tab */}
        <TabsContent value="style" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Document Styling</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <select
                  id="theme"
                  value={formData.style.theme || 'default'}
                  onChange={(e) => handleStyleChange('theme', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="default">Default</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="academic">Academic</option>
                  <option value="modern">Modern</option>
                </select>
              </div>
              <div>
                <Label htmlFor="fontFamily">Font Family</Label>
                <select
                  id="fontFamily"
                  value={formData.style.typography?.fontFamily || 'system-ui'}
                  onChange={(e) => handleStyleChange('typography', {
                    ...formData.style.typography,
                    fontFamily: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="system-ui">System UI</option>
                  <option value="serif">Serif</option>
                  <option value="sans-serif">Sans Serif</option>
                  <option value="monospace">Monospace</option>
                </select>
              </div>
              <div>
                <Label htmlFor="fontSize">Font Size</Label>
                <Input
                  id="fontSize"
                  value={formData.style.typography?.fontSize || '16px'}
                  onChange={(e) => handleStyleChange('typography', {
                    ...formData.style.typography,
                    fontSize: e.target.value
                  })}
                  placeholder="16px"
                />
              </div>
              <div>
                <Label htmlFor="lineHeight">Line Height</Label>
                <Input
                  id="lineHeight"
                  value={formData.style.typography?.lineHeight || '1.6'}
                  onChange={(e) => handleStyleChange('typography', {
                    ...formData.style.typography,
                    lineHeight: e.target.value
                  })}
                  placeholder="1.6"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Document Configuration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showTableOfContents">Show Table of Contents</Label>
                  <p className="text-sm text-muted-foreground">Automatically generate TOC from headings</p>
                </div>
                <input
                  type="checkbox"
                  id="showTableOfContents"
                  checked={formData.config.showTableOfContents || false}
                  onChange={(e) => handleConfigChange('showTableOfContents', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableSearch">Enable Search</Label>
                  <p className="text-sm text-muted-foreground">Allow users to search within the document</p>
                </div>
                <input
                  type="checkbox"
                  id="enableSearch"
                  checked={formData.config.enableSearch || false}
                  onChange={(e) => handleConfigChange('enableSearch', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowComments">Allow Comments</Label>
                  <p className="text-sm text-muted-foreground">Enable user comments and feedback</p>
                </div>
                <input
                  type="checkbox"
                  id="allowComments"
                  checked={formData.config.allowComments || false}
                  onChange={(e) => handleConfigChange('allowComments', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoSave">Auto Save</Label>
                  <p className="text-sm text-muted-foreground">Automatically save changes while editing</p>
                </div>
                <input
                  type="checkbox"
                  id="autoSave"
                  checked={formData.config.autoSave || false}
                  onChange={(e) => handleConfigChange('autoSave', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Node Selection Modal */}
      {showNodeSelection && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Select Node for Link</h3>
                <Button variant="ghost" onClick={() => setShowNodeSelection(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              <NodeSelectionInterface
                nodes={availableNodes}
                selectedNodes={[]}
                onSelectionChange={handleNodeSelection}
                options={{
                  mode: 'single',
                  viewMode: 'cards',
                  searchEnabled: true,
                  filterEnabled: true,
                  showMetadata: true,
                  allowCreate: false
                }}
              />
            </div>
            <div className="p-4 border-t border-border flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowNodeSelection(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentSceneAuthoring;
