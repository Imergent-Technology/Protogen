<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Feedback extends Model
{
    use HasFactory;

    protected $fillable = [
        'guid',
        'content_type',
        'content_id',
        'tenant_id',
        'user_id',
        'feedback_type',
        'content',
        'meta',
        'is_public',
        'is_moderated',
        'moderation_status',
        'moderated_by',
        'moderated_at',
    ];

    protected $casts = [
        'content' => 'array',
        'meta' => 'array',
        'is_public' => 'boolean',
        'is_moderated' => 'boolean',
        'moderated_at' => 'datetime',
    ];

    protected $attributes = [
        'is_public' => true,
        'is_moderated' => false,
        'moderation_status' => 'pending',
    ];

    // Feedback types
    const TYPE_COMMENT = 'comment';
    const TYPE_RATING = 'rating';
    const TYPE_BOOKMARK = 'bookmark';
    const TYPE_LIKE = 'like';
    const TYPE_REPORT = 'report';
    const TYPE_SUGGESTION = 'suggestion';

    // Moderation statuses
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';
    const STATUS_FLAGGED = 'flagged';

    // Content types
    const CONTENT_SCENE = 'scene';
    const CONTENT_DECK = 'deck';
    const CONTENT_CONTEXT = 'context';
    const CONTENT_CORE_NODE = 'core_node';
    const CONTENT_CORE_EDGE = 'core_edge';

    // Relationships
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }

    // Scopes
    public function scopeByType($query, string $type)
    {
        return $query->where('feedback_type', $type);
    }

    public function scopeByContentType($query, string $contentType)
    {
        return $query->where('content_type', $contentType);
    }

    public function scopeByTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeModerated($query)
    {
        return $query->where('is_moderated', true);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('moderation_status', $status);
    }

    public function scopeApproved($query)
    {
        return $query->where('moderation_status', self::STATUS_APPROVED);
    }

    public function scopePending($query)
    {
        return $query->where('moderation_status', self::STATUS_PENDING);
    }

    public function scopeRejected($query)
    {
        return $query->where('moderation_status', self::STATUS_REJECTED);
    }

    // Boot method to generate GUID
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($feedback) {
            if (empty($feedback->guid)) {
                $feedback->guid = Str::uuid();
            }
        });
    }

    // Helper methods
    public function isComment(): bool
    {
        return $this->feedback_type === self::TYPE_COMMENT;
    }

    public function isRating(): bool
    {
        return $this->feedback_type === self::TYPE_RATING;
    }

    public function isBookmark(): bool
    {
        return $this->feedback_type === self::TYPE_BOOKMARK;
    }

    public function isLike(): bool
    {
        return $this->feedback_type === self::TYPE_LIKE;
    }

    public function isReport(): bool
    {
        return $this->feedback_type === self::TYPE_REPORT;
    }

    public function isSuggestion(): bool
    {
        return $this->feedback_type === self::TYPE_SUGGESTION;
    }

    public function isPending(): bool
    {
        return $this->moderation_status === self::STATUS_PENDING;
    }

    public function isApproved(): bool
    {
        return $this->moderation_status === self::STATUS_APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->moderation_status === self::STATUS_REJECTED;
    }

    public function isFlagged(): bool
    {
        return $this->moderation_status === self::STATUS_FLAGGED;
    }

    public function getRatingValue(): ?int
    {
        if ($this->isRating() && isset($this->content['rating'])) {
            return (int) $this->content['rating'];
        }
        return null;
    }

    public function getCommentText(): ?string
    {
        if ($this->isComment() && isset($this->content['text'])) {
            return $this->content['text'];
        }
        return null;
    }

    public function getBookmarkTitle(): ?string
    {
        if ($this->isBookmark() && isset($this->content['title'])) {
            return $this->content['title'];
        }
        return null;
    }

    public function approve(User $moderator): void
    {
        $this->update([
            'moderation_status' => self::STATUS_APPROVED,
            'is_moderated' => true,
            'moderated_by' => $moderator->id,
            'moderated_at' => now(),
        ]);
    }

    public function reject(User $moderator, string $reason = null): void
    {
        $this->update([
            'moderation_status' => self::STATUS_REJECTED,
            'is_moderated' => true,
            'moderated_by' => $moderator->id,
            'moderated_at' => now(),
            'meta' => array_merge($this->meta ?? [], ['rejection_reason' => $reason]),
        ]);
    }

    public function flag(User $moderator, string $reason = null): void
    {
        $this->update([
            'moderation_status' => self::STATUS_FLAGGED,
            'is_moderated' => true,
            'moderated_by' => $moderator->id,
            'moderated_at' => now(),
            'meta' => array_merge($this->meta ?? [], ['flag_reason' => $reason]),
        ]);
    }

    public function getFeedbackTypes(): array
    {
        return [
            self::TYPE_COMMENT => 'Comment',
            self::TYPE_RATING => 'Rating',
            self::TYPE_BOOKMARK => 'Bookmark',
            self::TYPE_LIKE => 'Like',
            self::TYPE_REPORT => 'Report',
            self::TYPE_SUGGESTION => 'Suggestion',
        ];
    }

    public function getContentTypes(): array
    {
        return [
            self::CONTENT_SCENE => 'Scene',
            self::CONTENT_DECK => 'Deck',
            self::CONTENT_CONTEXT => 'Context',
            self::CONTENT_CORE_NODE => 'Core Node',
            self::CONTENT_CORE_EDGE => 'Core Edge',
        ];
    }

    public function getModerationStatuses(): array
    {
        return [
            self::STATUS_PENDING => 'Pending',
            self::STATUS_APPROVED => 'Approved',
            self::STATUS_REJECTED => 'Rejected',
            self::STATUS_FLAGGED => 'Flagged',
        ];
    }

    public function canBeModerated(): bool
    {
        return !$this->is_moderated || $this->isPending();
    }

    public function requiresModeration(): bool
    {
        // Some feedback types might not require moderation
        return in_array($this->feedback_type, [
            self::TYPE_COMMENT,
            self::TYPE_REPORT,
            self::TYPE_SUGGESTION,
        ]);
    }
} 