import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { UnifiedLinkDialog } from './UnifiedLinkDialog';
import { Scene } from '@protogen/shared';
import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';

// Simple link click handler extension
const LinkClickHandler = Extension.create({
  name: 'linkClickHandler',
  
  addOptions() {
    return {
      showError: null as ((title: string, message?: string) => void) | null,
      navigate: null as ((path: string) => void) | null,
      isEditMode: false as boolean,
      scenes: null as Stage[] | null,
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            click: (view, event) => {
              const target = event.target as HTMLElement;
              const linkElement = target.closest('a[href]');
              
              if (linkElement) {
                const isCtrlOrCmd = event.ctrlKey || event.metaKey;
                const href = linkElement.getAttribute('href');
                const isStageLink = href && href.startsWith('scene://');
                
                if (isCtrlOrCmd) {
                  // Navigate to link
                  if (isStageLink && href) {
                    const sceneId = href.replace('scene://', '');
                    const scene = this.options.scenes?.find((s: Stage) => s.id === parseInt(sceneId));
                    if (scene?.slug && this.options.navigate) {
                      this.options.navigate(`/scene/${scene.slug}`);
                    }
                  } else if (href && href !== '#') {
                    window.open(href, '_blank');
                  }
                  return true;
                } else if (this.options.isEditMode) {
                  // In edit mode, open edit dialog
                  event.preventDefault();
                  event.stopPropagation();
                  
                  const customEvent = new CustomEvent('linkClick', {
                    detail: { linkElement, view, isStageLink, href }
                  });
                  document.dispatchEvent(customEvent);
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
  scenes?: Stage[];
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
  scenes = [],
  currentStageId,
  showError
}: TipTapEditorProps) {
  const navigate = useNavigate();
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [existingLinkData, setExistingLinkData] = useState<any>(null);
  const [defaultLinkType, setDefaultLinkType] = useState<'external' | 'scene'>('external');
  

  const [editorInstance, setEditorInstance] = useState<any>(null);
  
  // Reset dialog state when it closes
  useEffect(() => {
    if (!isLinkDialogOpen) {
      setSelectedText('');
      setIsEditingLink(false);
      setExistingLinkData(null);
    }
  }, [isLinkDialogOpen]);

  // Listen for link clicks
  useEffect(() => {
    const handleLinkClick = (event: CustomEvent) => {
      if (editorInstance) {
        const { linkElement, isStageLink, href } = event.detail;
        
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
        
        // Open edit dialog for both external and internal links
        setSelectedText(linkText);
        setIsEditingLink(true);
        
        if (isStageLink) {
          // Set up scene link edit data
          const sceneId = href.replace('scene://', '');
          setExistingLinkData({ href, sceneId });
        } else {
          // Set up external link edit data
          setExistingLinkData({ href });
        }
        
        setIsLinkDialogOpen(true);
      }
    };

    document.addEventListener('linkClick', handleLinkClick as EventListener);
    
    return () => {
      document.removeEventListener('linkClick', handleLinkClick as EventListener);
    };
  }, [editorInstance, showError]);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false, // Disable default link extension
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer hover:text-primary/80'
        },
        validate: href => /^https?:\/\//.test(href) || href.startsWith('scene://'),
        protocols: ['http', 'https', 'scene'],
      }),
      LinkClickHandler.configure({
        showError: showError,
        navigate: navigate,
        isEditMode: editable,
        scenes: scenes
      }),
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
    // Set up dialog state for new external link
    const { from, to } = editor.state.selection;
    const currentSelectedText = editor.state.doc.textBetween(from, to);
    setSelectedText(currentSelectedText);
    setDefaultLinkType('external');
    setIsEditingLink(false);
    setExistingLinkData(null);
    setIsLinkDialogOpen(true);
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
        showError('Cannot Create Link', 'Multiple links are selected. Please select only one link or no links.');
      }
      return;
    }
    
    // If a link is already selected, open the edit dialog for it
    if ((linkAnalysis.hasStageLink || linkAnalysis.hasExternalLink) && linkAnalysis.existingLinkData) {
      setSelectedText(currentSelectedText);
      setIsEditingLink(true);
      setExistingLinkData(linkAnalysis.existingLinkData);
      setIsLinkDialogOpen(true);
      return;
    }
    
    // Set up dialog state for new scene link
    setSelectedText(currentSelectedText);
    setDefaultLinkType('scene');
    setIsEditingLink(false);
    setExistingLinkData(null);
    
    // If no text is selected, we'll insert the label text later in handleLinkCreate
    if (isCollapsed) {
      setSelectedText('');
    }
    
    setIsLinkDialogOpen(true);
  };

  const handleLinkCreate = (linkData: { 
    type: 'external' | 'scene';
    href: string;
    label: string;
    targetStageId?: number;
    isEdit: boolean;
  }) => {
    if (linkData.isEdit) {
      // Update existing link
      editor.chain().focus().extendMarkRange('link').setLink({ 
        href: linkData.href,
        class: linkData.type === 'scene' ? 'scene-link' : undefined
      }).run();
    } else {
      // Create new link
      const { from, to } = editor.state.selection;
      
      // Ensure we have a selection
      if (from === to) {
        // Insert the actual label text that the user entered
        const textToInsert = linkData.label || 'New Link';
        editor.chain().focus().insertContent(textToInsert).run();
        // Update selection to include the inserted text
        const newFrom = from;
        const newTo = from + textToInsert.length;
        editor.chain().focus().setTextSelection({ from: newFrom, to: newTo }).run();
      }
      
      // Apply the link
      editor.chain().focus().setLink({ 
        href: linkData.href,
        class: linkData.type === 'scene' ? 'scene-link' : undefined
      }).run();
    }
    
    setIsLinkDialogOpen(false);
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
      if (link.class && link.class.includes('scene-link')) {
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

      {/* Unified Link Dialog */}
      <UnifiedLinkDialog
        isOpen={isLinkDialogOpen}
        onClose={() => setIsLinkDialogOpen(false)}
        onLinkCreate={handleLinkCreate}
        scenes={scenes}
        currentStageId={currentStageId}
        selectedText={selectedText}
        isEditing={isEditingLink}
        existingLinkData={existingLinkData}
        defaultLinkType={defaultLinkType}
      />
    </div>
  );
}
