import { useState } from 'react';
import { Stage, DocumentStageConfig } from '@progress/shared';
import { TipTapEditor } from './TipTapEditor';

interface DocumentStageViewerProps {
  stage: Stage;
  isEditing?: boolean;
  onContentChange?: (content: string) => void;
  className?: string;
  stages?: Stage[];
  showError?: (title: string, message?: string) => void;
}

export function DocumentStageViewer({
  stage,
  isEditing = false,
  onContentChange,
  className = '',
  stages = [],
  showError
}: DocumentStageViewerProps) {
  const config = stage.config as DocumentStageConfig;
  const [content, setContent] = useState(config.content || '');

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    if (onContentChange) {
      onContentChange(newContent);
    }
  };

  if (isEditing) {
    return (
      <div className={`w-full h-full ${className}`}>
        <TipTapEditor
          content={content}
          onChange={handleContentChange}
          placeholder="Start writing your document..."
          editable={true}
          className="h-full"
          stages={stages}
          currentStageId={stage.id}
          showError={showError}
        />
      </div>
    );
  }

  // Display mode - render the HTML content
  const getLayoutClass = () => {
    switch (config.layout) {
      case 'two-column':
        return 'grid grid-cols-1 lg:grid-cols-2 gap-8';
      case 'custom':
        return 'max-w-4xl mx-auto';
      default:
        return 'max-w-4xl mx-auto';
    }
  };

  const getThemeClass = () => {
    switch (config.theme) {
      case 'minimal':
        return 'prose prose-lg max-w-none prose-headings:font-light prose-p:leading-relaxed';
      case 'professional':
        return 'prose prose-lg max-w-none prose-headings:font-semibold prose-p:leading-relaxed';
      case 'creative':
        return 'prose prose-lg max-w-none prose-headings:font-bold prose-p:leading-relaxed prose-headings:text-primary';
      default:
        return 'prose prose-lg max-w-none';
    }
  };

  return (
    <div className={`w-full h-full overflow-y-auto p-8 ${className}`}>
      <div className={getLayoutClass()}>
        <div 
          className={getThemeClass()}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
      
      {!content && (
        <div className="text-center text-muted-foreground py-12">
          <p className="text-lg">No content yet</p>
          <p className="text-sm">This document is empty</p>
        </div>
      )}
    </div>
  );
}
