<?php

namespace App\Models;

// Removed HasUuids since we're using bigint IDs
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SlideItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'slide_id',
        'node_id',
        'position',
        'scale',
        'rotation',
        'opacity',
        'visible',
        'style',
        'transition_config',
    ];

    protected $casts = [
        'position' => 'array',
        'scale' => 'array',
        'style' => 'array',
        'transition_config' => 'array',
        'rotation' => 'decimal:2',
        'opacity' => 'decimal:2',
        'visible' => 'boolean',
    ];

    protected $attributes = [
        'position' => '{"x": 0, "y": 0}',
        'scale' => '{"x": 1, "y": 1}',
        'rotation' => 0,
        'opacity' => 1.0,
        'visible' => true,
    ];

    /**
     * Get the slide that owns the slide item.
     */
    public function slide(): BelongsTo
    {
        return $this->belongsTo(Slide::class);
    }

    /**
     * Get the scene item (node) that this slide item references.
     */
    public function node(): BelongsTo
    {
        return $this->belongsTo(SceneItem::class, 'node_id');
    }

    /**
     * Get the position as an array with default values.
     */
    public function getPositionAttribute($value)
    {
        $position = is_string($value) ? json_decode($value, true) : $value;
        return array_merge(['x' => 0, 'y' => 0], $position ?? []);
    }

    /**
     * Set the position attribute.
     */
    public function setPositionAttribute($value)
    {
        $this->attributes['position'] = json_encode(array_merge(['x' => 0, 'y' => 0], $value ?? []));
    }

    /**
     * Get the scale as an array with default values.
     */
    public function getScaleAttribute($value)
    {
        $scale = is_string($value) ? json_decode($value, true) : $value;
        return array_merge(['x' => 1, 'y' => 1], $scale ?? []);
    }

    /**
     * Set the scale attribute.
     */
    public function setScaleAttribute($value)
    {
        $this->attributes['scale'] = json_encode(array_merge(['x' => 1, 'y' => 1], $value ?? []));
    }

    /**
     * Get the node state for the Navigator System.
     */
    public function getNodeState(): array
    {
        return [
            'nodeId' => $this->node_id,
            'position' => $this->position,
            'scale' => $this->scale,
            'rotation' => $this->rotation,
            'opacity' => $this->opacity,
            'visible' => $this->visible,
            'style' => $this->style ?? [],
        ];
    }

    /**
     * Create a slide item from a scene item's default state.
     */
    public static function createFromSceneItem(Slide $slide, SceneItem $sceneItem): self
    {
        return self::create([
            'slide_id' => $slide->id,
            'node_id' => $sceneItem->id,
            'position' => $sceneItem->position ?? ['x' => 100, 'y' => 100, 'z' => 0],
            'scale' => ['x' => 1, 'y' => 1], // Default scale since SceneItem doesn't have this
            'rotation' => 0, // Default rotation since SceneItem doesn't have this
            'opacity' => 1.0, // Default opacity since SceneItem doesn't have this
            'visible' => $sceneItem->is_visible ?? true,
            'style' => $sceneItem->style ?? ['backgroundColor' => '#e3f2fd', 'padding' => '16px'],
        ]);
    }

    /**
     * Apply this slide item's state to a scene item.
     */
    public function applyToSceneItem(SceneItem $sceneItem): SceneItem
    {
        $sceneItem->update([
            'position' => $this->position,
            'scale' => $this->scale,
            'rotation' => $this->rotation,
            'opacity' => $this->opacity,
            'visible' => $this->visible,
            'style' => $this->style,
        ]);

        return $sceneItem;
    }

    /**
     * Clone this slide item for another slide.
     */
    public function cloneForSlide(Slide $slide): self
    {
        return self::create([
            'slide_id' => $slide->id,
            'node_id' => $this->node_id,
            'position' => $this->position,
            'scale' => $this->scale,
            'rotation' => $this->rotation,
            'opacity' => $this->opacity,
            'visible' => $this->visible,
            'style' => $this->style,
            'transition_config' => $this->transition_config,
        ]);
    }
}
