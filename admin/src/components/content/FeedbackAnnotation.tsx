import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackAnnotationProps {
  id: string;
  text: string;
  feedback: string;
  author: string;
  timestamp: string;
  onClose: () => void;
  onReply?: (feedbackId: string, reply: string) => void;
  isAdmin?: boolean;
}

interface FeedbackMarkerProps {
  text: string;
  onAddFeedback: (text: string, selection: string) => void;
  isAdmin?: boolean;
}

export function FeedbackAnnotation({
  id,
  text,
  feedback,
  author,
  timestamp,
  onClose,
  onReply,
  isAdmin = false
}: FeedbackAnnotationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [reply, setReply] = useState('');

  const handleReply = () => {
    if (reply.trim() && onReply) {
      onReply(id, reply);
      setReply('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative"
    >
      {/* Highlighted Text */}
      <span 
        className="bg-yellow-200 cursor-pointer hover:bg-yellow-300 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {text}
      </span>

      {/* Feedback Popup */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 top-full left-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Feedback</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>

              {/* Feedback Content */}
              <div className="mb-3">
                <p className="text-sm text-foreground mb-2">{feedback}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>By {author}</span>
                  <span>{timestamp}</span>
                </div>
              </div>

              {/* Reply Section */}
              {isAdmin && onReply && (
                <div className="border-t border-border pt-3">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Add a reply..."
                    className="w-full p-2 text-sm border border-border rounded resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={2}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleReply}
                      disabled={!reply.trim()}
                      className="flex items-center space-x-1 px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-3 w-3" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FeedbackMarker({ text, onAddFeedback }: FeedbackMarkerProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        setSelectedText(selection.toString());
        setIsSelecting(true);
      } else {
        setIsSelecting(false);
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  const handleAddFeedback = () => {
    if (feedback.trim() && selectedText) {
      onAddFeedback(text, selectedText);
      setFeedback('');
      setShowFeedbackForm(false);
      setIsSelecting(false);
      setSelectedText('');
    }
  };

  return (
    <div className="relative">
      <span ref={textRef}>{text}</span>
      
      {/* Feedback Button */}
      <AnimatePresence>
        {isSelecting && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setShowFeedbackForm(true)}
            className="absolute z-40 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            style={{
              top: '-40px',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          >
            <MessageSquare className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Feedback Form */}
      <AnimatePresence>
        {showFeedbackForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute z-50 top-full left-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Add Feedback</h4>
                <button
                  onClick={() => setShowFeedbackForm(false)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">Selected text:</p>
                <p className="text-sm bg-muted p-2 rounded">{selectedText}</p>
              </div>
              
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter your feedback..."
                className="w-full p-2 text-sm border border-border rounded resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
              
              <div className="flex justify-end space-x-2 mt-3">
                <button
                  onClick={() => setShowFeedbackForm(false)}
                  className="px-3 py-1 text-xs border border-border rounded hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFeedback}
                  disabled={!feedback.trim()}
                  className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
