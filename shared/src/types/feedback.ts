// Feedback System Types
// This file defines the TypeScript interfaces for the Feedback layer of the Protogen architecture

export interface Feedback {
  id: number;
  guid: string;
  content_type: FeedbackContentType;
  content_id: number;
  tenant_id: number;
  feedback_type: FeedbackType;
  content: FeedbackContent;
  meta: FeedbackMetadata;
  is_public: boolean;
  is_moderated: boolean;
  moderation_status: ModerationStatus;
  moderated_by?: number;
  moderated_at?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  
  // Relationships
  tenant?: any; // Tenant type from shared library
  creator?: any; // User type from shared library
  moderator?: any; // User type from shared library
  replies?: FeedbackReply[];
  reactions?: FeedbackReaction[];
}

export type FeedbackContentType = 'scene' | 'deck' | 'context' | 'node' | 'edge' | 'document' | 'pin';
export type FeedbackType = 'comment' | 'rating' | 'bookmark' | 'volunteer' | 'poll' | 'emoji' | 'custom';
export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged' | 'archived';

export interface FeedbackContent {
  // Base content
  text?: string;
  html?: string;
  markdown?: string;
  
  // Rating content
  rating?: number;
  ratingScale?: number;
  ratingLabels?: string[];
  
  // Poll content
  poll?: FeedbackPoll;
  
  // Emoji content
  emoji?: string;
  emojiCategory?: string;
  
  // Volunteer content
  volunteer?: FeedbackVolunteer;
  
  // Custom content
  custom?: Record<string, any>;
  
  // Media content
  attachments?: FeedbackAttachment[];
  
  // Metadata
  metadata?: Record<string, any>;
}

export interface FeedbackPoll {
  question: string;
  options: FeedbackPollOption[];
  allowMultiple: boolean;
  allowCustom: boolean;
  expiresAt?: string;
  isAnonymous: boolean;
  results?: FeedbackPollResults;
}

export interface FeedbackPollOption {
  id: string;
  text: string;
  description?: string;
  votes: number;
  voters: number[];
}

export interface FeedbackPollResults {
  totalVotes: number;
  totalVoters: number;
  options: FeedbackPollOption[];
  breakdown: Record<string, number>;
  lastUpdated: string;
}

export interface FeedbackVolunteer {
  title: string;
  description: string;
  skills: string[];
  timeCommitment: string;
  location?: string;
  contactMethod: string;
  status: VolunteerStatus;
  volunteers: VolunteerSignup[];
}

export type VolunteerStatus = 'open' | 'closed' | 'filled' | 'cancelled';

export interface VolunteerSignup {
  user_id: number;
  message?: string;
  skills: string[];
  availability: string;
  contactInfo: string;
  signedUpAt: string;
  status: VolunteerSignupStatus;
}

export type VolunteerSignupStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface FeedbackAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'link';
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
  metadata?: Record<string, any>;
}

export interface FeedbackMetadata {
  // Location metadata
  location?: FeedbackLocation;
  
  // Focus metadata
  focus?: FeedbackFocus;
  
  // Thread metadata
  thread?: FeedbackThread;
  
  // Custom metadata
  custom?: Record<string, any>;
  
  // System metadata
  system?: FeedbackSystemMetadata;
}

export interface FeedbackLocation {
  type: FeedbackContentType;
  id: number;
  name: string;
  path: string[];
  coordinates?: {
    x: number;
    y: number;
    z?: number;
  };
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface FeedbackFocus {
  isInFocus: boolean;
  focusScore: number;
  visibleElements: string[];
  activeElements: string[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
    rotation: number;
  };
}

export interface FeedbackThread {
  threadId: string;
  parentId?: number;
  depth: number;
  isRoot: boolean;
  replyCount: number;
  lastReplyAt?: string;
}

export interface FeedbackSystemMetadata {
  userAgent: string;
  ipAddress: string;
  sessionId: string;
  referrer?: string;
  source: 'web' | 'mobile' | 'api' | 'admin';
  version: string;
}

export interface FeedbackReply {
  id: number;
  feedback_id: number;
  content: FeedbackContent;
  meta: FeedbackMetadata;
  is_public: boolean;
  is_moderated: boolean;
  moderation_status: ModerationStatus;
  moderated_by?: number;
  moderated_at?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  
  // Relationships
  parent?: Feedback;
  creator?: any; // User type from shared library
  moderator?: any; // User type from shared library
  reactions?: FeedbackReaction[];
}

export interface FeedbackReaction {
  id: number;
  feedback_id: number;
  reply_id?: number;
  reaction_type: ReactionType;
  emoji: string;
  created_by: number;
  created_at: string;
  
  // Relationships
  feedback?: Feedback;
  reply?: FeedbackReply;
  creator?: any; // User type from shared library
}

export type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry' | 'custom';

// Feedback Creation and Update Types
export interface CreateFeedbackRequest {
  content_type: FeedbackContentType;
  content_id: number;
  tenant_id: number;
  feedback_type: FeedbackType;
  content: FeedbackContent;
  meta?: Partial<FeedbackMetadata>;
  is_public?: boolean;
  is_moderated?: boolean;
}

export interface UpdateFeedbackRequest extends Partial<CreateFeedbackRequest> {
  id: number;
}

export interface CreateFeedbackReplyRequest {
  feedback_id: number;
  content: FeedbackContent;
  meta?: Partial<FeedbackMetadata>;
  is_public?: boolean;
  is_moderated?: boolean;
}

export interface UpdateFeedbackReplyRequest extends Partial<CreateFeedbackReplyRequest> {
  id: number;
}

export interface CreateFeedbackReactionRequest {
  feedback_id: number;
  reply_id?: number;
  reaction_type: ReactionType;
  emoji: string;
}

export interface UpdateFeedbackReactionRequest extends Partial<CreateFeedbackReactionRequest> {
  id: number;
}

// Feedback Moderation Types
export interface FeedbackModerationRequest {
  feedback_id: number;
  moderation_status: ModerationStatus;
  reason?: string;
  notes?: string;
}

export interface FeedbackModerationResult {
  success: boolean;
  feedback: Feedback;
  changes: FeedbackModerationChange[];
  notifications: FeedbackNotification[];
}

export interface FeedbackModerationChange {
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
  moderator: number;
}

export interface FeedbackNotification {
  type: 'email' | 'in_app' | 'push';
  recipient: number;
  template: string;
  data: Record<string, any>;
  sent: boolean;
  sentAt?: string;
}

// Feedback Validation Types
export interface FeedbackValidationResult {
  isValid: boolean;
  errors: FeedbackValidationError[];
  warnings: FeedbackValidationWarning[];
  suggestions: FeedbackValidationSuggestion[];
}

export interface FeedbackValidationError {
  type: 'error';
  code: string;
  message: string;
  path: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  data?: any;
}

export interface FeedbackValidationWarning {
  type: 'warning';
  code: string;
  message: string;
  path: string[];
  severity: 'medium' | 'low';
  data?: any;
}

export interface FeedbackValidationSuggestion {
  type: 'suggestion';
  code: string;
  message: string;
  path: string[];
  impact: 'high' | 'medium' | 'low';
  data?: any;
}

// Feedback Statistics Types
export interface FeedbackStatistics {
  tenant: any; // Tenant type from shared library
  period: {
    start: string;
    end: string;
    type: 'day' | 'week' | 'month' | 'year';
  };
  totals: {
    feedback: number;
    comments: number;
    ratings: number;
    bookmarks: number;
    volunteers: number;
    polls: number;
    emojis: number;
  };
  engagement: {
    activeUsers: number;
    newUsers: number;
    replyRate: number;
    reactionRate: number;
    averageRating: number;
  };
  moderation: {
    pending: number;
    approved: number;
    rejected: number;
    flagged: number;
    averageModerationTime: number;
  };
  content: {
    byType: Record<FeedbackContentType, number>;
    byLocation: Record<string, number>;
    byFocus: {
      inFocus: number;
      outOfFocus: number;
    };
  };
  trends: {
    daily: Record<string, number>;
    weekly: Record<string, number>;
    monthly: Record<string, number>;
  };
}

// Feedback Event Types
export interface FeedbackEvent {
  type: 'created' | 'updated' | 'deleted' | 'replied' | 'reacted' | 
        'moderated' | 'flagged' | 'archived' | 'restored';
  target: 'feedback' | 'reply' | 'reaction' | 'moderation';
  data: any;
  timestamp: number;
  source: 'user' | 'system' | 'api' | 'moderator';
  metadata?: Record<string, any>;
}

// Feedback State Management
export interface FeedbackState {
  feedback: Feedback[];
  currentFeedback: Feedback | null;
  replies: FeedbackReply[];
  reactions: FeedbackReaction[];
  statistics: FeedbackStatistics | null;
  loading: boolean;
  error: string | null;
  events: FeedbackEvent[];
  validation: FeedbackValidationResult | null;
  moderation: FeedbackModerationResult | null;
}

// Feedback Export/Import Types
export interface FeedbackExport {
  version: string;
  feedback: Omit<Feedback, 'id' | 'created_at' | 'updated_at'>;
  replies: Omit<FeedbackReply, 'id' | 'created_at' | 'updated_at'>[];
  reactions: Omit<FeedbackReaction, 'id' | 'created_at'>[];
  metadata: {
    exportedAt: string;
    exportedBy: string;
    source: string;
    format: string;
  };
}

export interface FeedbackImport {
  feedback: CreateFeedbackRequest;
  replies: CreateFeedbackReplyRequest[];
  reactions: CreateFeedbackReactionRequest[];
  options: {
    overwrite?: boolean;
    merge?: boolean;
    validateOnly?: boolean;
    preserveIds?: boolean;
  };
}

// Feedback Search and Filter Types
export interface FeedbackSearchOptions {
  query?: string;
  content_type?: FeedbackContentType[];
  feedback_type?: FeedbackType[];
  tenant_id?: number[];
  content_id?: number[];
  created_by?: number[];
  moderation_status?: ModerationStatus[];
  is_public?: boolean;
  is_moderated?: boolean;
  date_range?: {
    start: string;
    end: string;
  };
  focus?: {
    in_focus_only: boolean;
    focus_score_min: number;
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    per_page: number;
  };
}

export interface FeedbackSearchResult {
  feedback: Feedback[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  facets: FeedbackSearchFacets;
  suggestions: string[];
}

export interface FeedbackSearchFacets {
  content_types: Record<FeedbackContentType, number>;
  feedback_types: Record<FeedbackType, number>;
  tenants: Record<string, number>;
  moderators: Record<string, number>;
  dates: Record<string, number>;
  focus: {
    in_focus: number;
    out_of_focus: number;
  };
}

// Utility Types
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'urgent';
export type FeedbackVisibility = 'public' | 'private' | 'restricted' | 'internal';
export type FeedbackSource = 'web' | 'mobile' | 'api' | 'admin' | 'import';
export type FeedbackStatus = 'active' | 'archived' | 'deleted' | 'spam';
