<?php

namespace App\Models;

// Removed HasUuids since we're using bigint IDs
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Slide extends Model
{
    use HasFactory;

    protected $fillable = [
        'scene_id',
        'name',
        'description',
        'slide_index',
        'is_active',
        'transition_config',
        'entrance_animation',
        'exit_animation',
    ];

    protected $casts = [
        'transition_config' => 'array',
        'entrance_animation' => 'array',
        'exit_animation' => 'array',
        'is_active' => 'boolean',
        'slide_index' => 'integer',
    ];

    protected $attributes = [
        'slide_index' => 0,
        'is_active' => false,
    ];

    /**
     * Get the scene that owns the slide.
     */
    public function scene(): BelongsTo
    {
        return $this->belongsTo(Scene::class);
    }

    /**
     * Get the slide items for the slide.
     */
    public function slideItems(): HasMany
    {
        return $this->hasMany(SlideItem::class);
    }

    /**
     * Get the scene items that reference this slide as their default state.
     */
    public function sceneItems(): HasMany
    {
        return $this->hasMany(SceneItem::class);
    }

    /**
     * Scope to get active slides.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to order by slide index.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('slide_index');
    }

    /**
     * Get the next slide in the sequence.
     */
    public function getNextSlide(): ?Slide
    {
        return $this->scene->slides()
            ->where('slide_index', '>', $this->slide_index)
            ->ordered()
            ->first();
    }

    /**
     * Get the previous slide in the sequence.
     */
    public function getPreviousSlide(): ?Slide
    {
        return $this->scene->slides()
            ->where('slide_index', '<', $this->slide_index)
            ->ordered()
            ->latest('slide_index')
            ->first();
    }

    /**
     * Check if this is the first slide.
     */
    public function isFirstSlide(): bool
    {
        return $this->scene->slides()->min('slide_index') === $this->slide_index;
    }

    /**
     * Check if this is the last slide.
     */
    public function isLastSlide(): bool
    {
        return $this->scene->slides()->max('slide_index') === $this->slide_index;
    }

    /**
     * Get the slide state for the Navigator System.
     */
    public function getSlideState(): array
    {
        return [
            'id' => $this->id,
            'sceneId' => $this->scene_id,
            'slideIndex' => $this->slide_index,
            'name' => $this->name,
            'description' => $this->description,
            'isActive' => $this->is_active,
            'transitionConfig' => $this->transition_config,
            'entranceAnimation' => $this->getEntranceAnimation(),
            'exitAnimation' => $this->getExitAnimation(),
            'nodeStates' => $this->slideItems->map(function ($item) {
                return [
                    'nodeId' => $item->node_id,
                    'position' => $item->position,
                    'scale' => $item->scale,
                    'rotation' => $item->rotation,
                    'opacity' => $item->opacity,
                    'visible' => $item->visible,
                    'style' => $item->style,
                ];
            })->toArray(),
        ];
    }

    // Slide Animation Management

    /**
     * Get effective entrance animation (override or fall back to scene default).
     */
    public function getEntranceAnimation(): array
    {
        if ($this->entrance_animation) {
            return $this->entrance_animation;
        }
        
        return $this->scene->getDefaultAnimation('entrance');
    }

    /**
     * Get effective exit animation (override or fall back to scene default).
     */
    public function getExitAnimation(): array
    {
        if ($this->exit_animation) {
            return $this->exit_animation;
        }
        
        return $this->scene->getDefaultAnimation('exit');
    }

    /**
     * Set entrance animation override.
     */
    public function setEntranceAnimation(array $animation): void
    {
        $this->update(['entrance_animation' => $animation]);
    }

    /**
     * Set exit animation override.
     */
    public function setExitAnimation(array $animation): void
    {
        $this->update(['exit_animation' => $animation]);
    }

    /**
     * Clear entrance animation override (use scene default).
     */
    public function clearEntranceAnimation(): void
    {
        $this->update(['entrance_animation' => null]);
    }

    /**
     * Clear exit animation override (use scene default).
     */
    public function clearExitAnimation(): void
    {
        $this->update(['exit_animation' => null]);
    }
}
