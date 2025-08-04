<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeedbackComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'feedback_id',
        'user_id',
        'parent_id',
        'content',
        'metadata',
        'is_active',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the feedback this comment belongs to.
     */
    public function feedback(): BelongsTo
    {
        return $this->belongsTo(Feedback::class);
    }

    /**
     * Get the user who created this comment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent comment.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(FeedbackComment::class, 'parent_id');
    }

    /**
     * Get the child comments.
     */
    public function children(): HasMany
    {
        return $this->hasMany(FeedbackComment::class, 'parent_id');
    }

    /**
     * Get all descendants (children, grandchildren, etc.).
     */
    public function descendants(): HasMany
    {
        return $this->children()->with('descendants');
    }

    /**
     * Scope to get only active comments.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get top-level comments (no parent).
     */
    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope to get comments by user.
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get comments for a specific feedback.
     */
    public function scopeForFeedback($query, $feedbackId)
    {
        return $query->where('feedback_id', $feedbackId);
    }
} 