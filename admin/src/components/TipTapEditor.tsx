import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { LinkCreationDialog } from './LinkCreationDialog';
import { Stage } from '@progress/shared';
import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';

// Custom StageLink extension for internal stage links
const StageLink = Extension.create({
  name: 'stageLink',
  
  addOptions() {
    return {
      showError: null as ((title: string, message?: string) => void) | null,
      navigate: null as ((path: string) => void) | null,
    }
  },
  
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          stageLink: {
            default: null,
            parseHTML: element => element.getAttribute('data-stage-link'),
            renderHTML: attributes => {
              if (!attributes.stageLink) {
                return {}
              }
              return {
                'data-stage-link': attributes.stageLink,
                class: 'stage-link text-primary underline cursor-pointer hover:text-primary/80'
              }
            },
          },
        },
      },
    ]
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            click: (view, event) => {
              // More aggressive event handling
              const target = event.target as HTMLElement;
              
              // Check if the clicked element is a link or inside a link
              const linkElement = target.closest('a[href]');
              
              if (linkElement) {
                // Check if Ctrl/Cmd is pressed
                const isCtrlOrCmd = event.ctrlKey || event.metaKey;
                
                if (isCtrlOrCmd) {
                  // Check if it's a stage link
                  const isStageLink = linkElement.classList.contains('stage-link');
                  
                  if (isStageLink) {
                    // Use React Router navigation for stage links
                    const navigateFn = this.options.navigate;
                    if (navigateFn) {
                      const stageId = linkElement.getAttribute('data-stage-id');
                      if (stageId) {
                        navigateFn(`/stage/${stageId}`);
                      }
                    }
                  } else {
                    // Open external links in new tab
                    window.open(linkElement.getAttribute('href') || '#', '_blank');
                  }
                  return true;
                } else {
                  // Always prevent navigation in edit mode
                  event.preventDefault();
                  event.stopPropagation();
                  
                  // Check if it's a stage link
                  const isStageLink = linkElement.classList.contains('stage-link');
                  
                  if (isStageLink) {
                    // Dispatch custom event for stage link
                    const customEvent = new CustomEvent('stageLinkClick', {
                      detail: {
                        linkElement,
                        view
                      }
                    });
                    document.dispatchEvent(customEvent);
                  } else {
                    // Show toast for external links
                    const showErrorFn = this.options.showError;
                    if (showErrorFn) {
                      showErrorFn('External Link', 'Use Ctrl/Cmd+Click to open external links in a new tab.');
                    }
                  }
                  
                  return true;
                }
              }
              
              return false;
            },
          },
        },
      }),
    ];
  },
});

import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Link as LinkIcon, 
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ExternalLink
} from 'lucide-react';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  stages?: Stage[];
  currentStageId?: number;
  showError?: (title: string, message?: string) => void;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}

function ToolbarButton({ onClick, isActive, disabled, children, title }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-muted transition-colors ${
        isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}

export function TipTapEditor({ 
  content, 
  onChange, 
  placeholder = 'Start writing...', 
  editable = true,
  className = '',
  stages = [],
  currentStageId,
  showError
}: TipTapEditorProps) {
  const navigate = useNavigate();
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [existingLinkData, setExistingLinkData] = useState<any>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  
  // Reset dialog state when it closes
  useEffect(() => {
    if (!isLinkDialogOpen) {
      setSelectedText('');
      setIsEditingLink(false);
      setExistingLinkData(null);
    }
  }, [isLinkDialogOpen]);

  // Listen for stage link clicks
  useEffect(() => {
    const handleStageLinkClick = (event: CustomEvent) => {
      if (editorInstance) {
        const { linkElement } = event.detail;
        
        // Select the text of the clicked link
        const linkText = linkElement.textContent || linkElement.innerText || '';
        
        // Find and select the link in the editor
        const { state } = editorInstance;
        const { doc } = state;
        
        // Search for the link text in the document
        let found = false;
        doc.descendants((node: any, pos: number) => {
          if (!found && node.isText && node.text.includes(linkText)) {
            const start = pos + node.text.indexOf(linkText);
            const end = start + linkText.length;
            editorInstance.commands.setTextSelection({ from: start, to: end });
            found = true;
          }
        });
        
        // Trigger addStageLink to open edit dialog
        addStageLink();
      }
    };

    document.addEventListener('stageLinkClick', handleStageLinkClick as EventListener);
    
    return () => {
      document.removeEventListener('stageLinkClick', handleStageLinkClick as EventListener);
    };
  }, [editorInstance]);
  
  const editor = useEditor({
    extensions: [
      StarterKit, // Re-enable StarterKit with default link extension
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer hover:text-primary/80'
        },
        validate: href => /^https?:\/\//.test(href),
        protocols: ['http', 'https'],
      }),
      StageLink.configure({
        showError: showError,
        navigate: navigate
      }), // Add our custom stage link extension
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg'
        }
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty'
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      })
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onBeforeCreate: ({ editor }) => {
      setEditorInstance(editor);
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };



  const addCodeBlock = () => {
    editor.chain().focus().toggleCodeBlock().run();
  };

  const addStageLink = () => {
    // Get current selection and analyze existing links
    const { from, to } = editor.state.selection;
    const currentSelectedText = editor.state.doc.textBetween(from, to);
    const isCollapsed = from === to;
    
    // Analyze existing links in the selection
    const linkAnalysis = analyzeLinksInSelection(editor, from, to);
    
    if (linkAnalysis.hasMultipleLinks) {
      if (showError) {
        showError('Cannot Create Stage Link', 'Multiple links are selected. Please select only one link or no links.');
      }
      return;
    }
    
    if (linkAnalysis.hasExternalLink) {
      if (showError) {
        showError('Cannot Create Stage Link', 'External link is selected. Please select only stage links or no links.');
      }
      return;
    }
    
    // If a StageLink is already selected, open the edit dialog for it
    if (linkAnalysis.hasStageLink && linkAnalysis.existingLinkData) {
      setSelectedText(currentSelectedText);
      setIsEditingLink(true);
      setExistingLinkData(linkAnalysis.existingLinkData);
      setIsLinkDialogOpen(true);
      return;
    }
    
    // Set up dialog state for new link
    setSelectedText(currentSelectedText);
    setIsEditingLink(false);
    setExistingLinkData(null);
    
    // If no text is selected, insert placeholder text
    if (isCollapsed) {
      editor.chain().focus().insertContent('New Stage Link').run();
      // Update selection to include the inserted text
      const newFrom = from;
      const newTo = from + 'New Stage Link'.length;
      editor.chain().focus().setTextSelection({ from: newFrom, to: newTo }).run();
      setSelectedText('New Stage Link');
    }
    
    setIsLinkDialogOpen(true);
  };

  const handleStageLinkCreate = (linkData: { targetStageId: number; label: string; url: string; isEdit: boolean }) => {
    const { from, to } = editor.state.selection;
    
    if (linkData.isEdit) {
      // Update existing link
      editor.chain().focus().extendMarkRange('link').setLink({ 
        href: '#', // Use placeholder href to prevent browser navigation
        'data-stage-id': linkData.targetStageId.toString(),
        class: 'stage-link'
      }).run();
    } else {
      // Create new link
      editor.chain().focus().setLink({ 
        href: '#', // Use placeholder href to prevent browser navigation
        'data-stage-id': linkData.targetStageId.toString(),
        class: 'stage-link'
      }).run();
    }
  };

  // Helper function to analyze links in the current selection
  const analyzeLinksInSelection = (editor: any, from: number, to: number) => {
    const result = {
      hasStageLink: false,
      hasExternalLink: false,
      hasMultipleLinks: false,
      existingLinkData: null as any
    };
    
    const links: any[] = [];
    
    // Traverse the selection to find all links
    editor.state.doc.nodesBetween(from, to, (node: any, pos: number) => {
      node.marks.forEach((mark: any) => {
        if (mark.type.name === 'link') {
          links.push({
            href: mark.attrs.href,
            class: mark.attrs.class,
            from: pos,
            to: pos + node.nodeSize
          });
        }
      });
    });
    
    if (links.length > 1) {
      result.hasMultipleLinks = true;
    } else if (links.length === 1) {
      const link = links[0];
      if (link.class && link.class.includes('stage-link')) {
        result.hasStageLink = true;
        result.existingLinkData = link;
      } else {
        result.hasExternalLink = true;
      }
    }
    
    return result;
  };

  return (
    <div className={`border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      {editable && (
        <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="Underline"
            >
              <Underline className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              title="Code"
            >
              <Code className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <div className="w-px h-6 bg-border mx-2" />

          {/* Headings */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <div className="w-px h-6 bg-border mx-2" />

          {/* Lists */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <div className="w-px h-6 bg-border mx-2" />

          {/* Alignment */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              isActive={editor.isActive({ textAlign: 'justify' })}
              title="Justify"
            >
              <AlignJustify className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <div className="w-px h-6 bg-border mx-2" />

          {/* Media */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={addLink}
              isActive={editor.isActive('link')}
              title="Add External Link"
            >
              <LinkIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={addStageLink}
              title="Add Internal Stage Link"
            >
              <ExternalLink className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={addImage}
              title="Add Image"
            >
              <ImageIcon className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <div className="w-px h-6 bg-border mx-2" />

          {/* Advanced */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={addCodeBlock}
              title="Add Code Block"
            >
              <Code className="h-4 w-4" />
            </ToolbarButton>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="p-4">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm max-w-none focus:outline-none"
        />
      </div>

      {/* Link Creation Dialog */}
      <LinkCreationDialog
        isOpen={isLinkDialogOpen}
        onClose={() => setIsLinkDialogOpen(false)}
        onLinkCreate={handleStageLinkCreate}
        stages={stages}
        currentStageId={currentStageId}
        selectedText={selectedText}
        isEditing={isEditingLink}
        existingLinkData={existingLinkData}
      />
    </div>
  );
}
