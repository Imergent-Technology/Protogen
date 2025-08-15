import { useState } from 'react';
import { Stage } from '@progress/shared';
import { TipTapEditor } from './TipTapEditor';

interface DocumentStageViewerProps {
  stage: Stage;
  isEditing?: boolean;
  onContentChange?: (content: string) => void;
  className?: string;
}

export function DocumentStageViewer({
  stage,
  isEditing = false,
  onContentChange,
  className = ''
}: DocumentStageViewerProps) {
  const [content, setContent] = useState(stage.config.content || '');

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
        />
      </div>
    );
  }

  // Display mode - render the HTML content
  return (
    <div className={`w-full h-full overflow-y-auto p-8 ${className}`}>
      <div 
        className="prose prose-lg max-w-none mx-auto"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      
      {!content && (
        <div className="text-center text-muted-foreground py-12">
          <p className="text-lg">No content yet</p>
          <p className="text-sm">This document is empty</p>
        </div>
      )}
    </div>
  );
}
