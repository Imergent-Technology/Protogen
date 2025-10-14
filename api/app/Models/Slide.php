<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * M1 Week 7-8: Slide Model
 * 
 * Represents a slide in a Card scene.
 * Supports three variants: text, image, layered.
 * 
 * Based on Spec 09: Card Scene Type
 * 
 * @property int $id
 * @property int $scene_id
 * @property string $kind
 * @property int $order
 * @property string|null $title
 * @property string|null $notes
 * @property int|null $duration
 * @property string|null $text
 * @property int|null $font_size
 * @property string|null $font_family
 * @property string $alignment
 * @property string|null $text_color
 * @property int|null $image_asset_id
 * @property string|null $fit
 * @property array|null $position
 * @property array|null $caption
 * @property int|null $background_asset_id
 * @property array|null $text_overlay
 * @property string|null $background_color
 * @property array|null $background_gradient
 * @property int $padding
 * @property string $enter_animation
 * @property int $animation_duration
 */
class Slide extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'scene_id',
        'kind',
        'order',
        'title',
        'notes',
        'duration',
        'text',
        'font_size',
        'font_family',
        'alignment',
        'text_color',
        'image_asset_id',
        'fit',
        'position',
        'caption',
        'background_asset_id',
        'text_overlay',
        'background_color',
        'background_gradient',
        'padding',
        'enter_animation',
        'animation_duration',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'order' => 'integer',
        'duration' => 'integer',
        'font_size' => 'integer',
        'padding' => 'integer',
        'animation_duration' => 'integer',
        'position' => 'array',
        'caption' => 'array',
        'text_overlay' => 'array',
        'background_gradient' => 'array',
    ];

    /**
     * Default values for attributes.
     */
    protected $attributes = [
        'alignment' => 'center',
        'padding' => 32,
        'enter_animation' => 'fade',
        'animation_duration' => 300,
    ];

    /**
     * Get the scene that owns the slide.
     */
    public function scene(): BelongsTo
    {
        return $this->belongsTo(Scene::class);
    }

    /**
     * Get the image asset for image slides.
     */
    public function imageAsset(): BelongsTo
    {
        return $this->belongsTo(Asset::class, 'image_asset_id');
    }

    /**
     * Get the background asset for layered slides.
     */
    public function backgroundAsset(): BelongsTo
    {
        return $this->belongsTo(Asset::class, 'background_asset_id');
    }

    /**
     * Scope to get slides for a scene ordered by order field.
     */
    public function scopeForScene($query, int $sceneId)
    {
        return $query->where('scene_id', $sceneId)->orderBy('order');
    }

    /**
     * Scope to get slides by kind.
     */
    public function scopeOfKind($query, string $kind)
    {
        return $query->where('kind', $kind);
    }

    /**
     * Reorder slide within scene.
     */
    public function reorder(int $newOrder): void
    {
        $this->order = $newOrder;
        $this->save();
    }

    /**
     * Duplicate slide.
     */
    public function duplicate(): self
    {
        $attributes = $this->toArray();
        unset($attributes['id'], $attributes['created_at'], $attributes['updated_at']);
        
        $duplicate = self::create($attributes);
        $duplicate->order = $this->order + 1;
        $duplicate->save();
        
        return $duplicate;
    }

    /**
     * Check if slide is text slide.
     */
    public function isTextSlide(): bool
    {
        return $this->kind === 'text';
    }

    /**
     * Check if slide is image slide.
     */
    public function isImageSlide(): bool
    {
        return $this->kind === 'image';
    }

    /**
     * Check if slide is layered slide.
     */
    public function isLayeredSlide(): bool
    {
        return $this->kind === 'layered';
    }
}
