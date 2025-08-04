<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Feedback extends Model
{
    use HasFactory;

    protected $table = 'feedback';

    protected $fillable = [
        'user_id',
        'stage_id',
        'level',
        'privacy',
        'title',
        'content',
        'context',
        'metadata',
        'is_active',
    ];

    protected $casts = [
        'context' => 'array',
        'metadata' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user who created this feedback.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the stage this feedback belongs to.
     */
    public function stage(): BelongsTo
    {
        return $this->belongsTo(Stage::class);
    }

    /**
     * Get the comments for this feedback.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(FeedbackComment::class);
    }

    /**
     * Get the top-level comments (no parent).
     */
    public function topLevelComments(): HasMany
    {
        return $this->hasMany(FeedbackComment::class)->whereNull('parent_id');
    }

    /**
     * Scope to get only active feedback.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get feedback by level.
     */
    public function scopeOfLevel($query, $level)
    {
        return $query->where('level', $level);
    }

    /**
     * Scope to get feedback by privacy level.
     */
    public function scopeOfPrivacy($query, $privacy)
    {
        return $query->where('privacy', $privacy);
    }

    /**
     * Scope to get feedback for a specific stage.
     */
    public function scopeForStage($query, $stageId)
    {
        return $query->where('stage_id', $stageId);
    }

    /**
     * Scope to get public feedback.
     */
    public function scopePublic($query)
    {
        return $query->where('privacy', 'public');
    }

    /**
     * Scope to get feedback by user.
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
} 