/**
 * Comment Thread Dialog Types
 */

import { BaseDialogConfig } from './base';

export interface CommentThreadDialogConfig extends BaseDialogConfig {
  type: 'comment-thread';
  targetId: string;
  targetType: 'scene' | 'slide' | 'content';
  title?: string;
  allowReply?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
}

