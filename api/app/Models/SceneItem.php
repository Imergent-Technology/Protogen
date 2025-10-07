<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SceneItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'scene_id',
        'slide_id',
        'item_type',
        'item_id',
        'item_guid',
        'position',
        'dimensions',
        'style',
        'meta',
        'is_visible',
        'z_index'
    ];

    protected $casts = [
        'item_type' => 'string',
        'position' => 'array',
        'dimensions' => 'array',
        'style' => 'array',
        'meta' => 'array',
        'is_visible' => 'boolean'
    ];

    /**
     * Get the scene that owns the scene item.
     */
    public function scene(): BelongsTo
    {
        return $this->belongsTo(Scene::class);
    }

    /**
     * Get the default slide for this scene item.
     */
    public function slide(): BelongsTo
    {
        return $this->belongsTo(Slide::class);
    }

    /**
     * Get the core graph node if this item is a node.
     */
    public function node(): BelongsTo
    {
        return $this->belongsTo(CoreGraphNode::class, 'item_id');
    }

    /**
     * Get the core graph edge if this item is an edge.
     */
    public function edge(): BelongsTo
    {
        return $this->belongsTo(CoreGraphEdge::class, 'item_id');
    }

    /**
     * Get the actual item (node, edge, or other) based on item_type.
     */
    public function getItem()
    {
        switch ($this->item_type) {
            case 'node':
                return $this->node;
            case 'edge':
                return $this->edge;
            default:
                return null;
        }
    }

    /**
     * Check if this item is a node.
     */
    public function isNode(): bool
    {
        return $this->item_type === 'node';
    }

    /**
     * Check if this item is an edge.
     */
    public function isEdge(): bool
    {
        return $this->item_type === 'edge';
    }

    /**
     * Get the position coordinates.
     */
    public function getPosition(): array
    {
        return $this->position ?? ['x' => 0, 'y' => 0, 'z' => 0];
    }

    /**
     * Set the position coordinates.
     */
    public function setPosition(float $x, float $y, float $z = 0): void
    {
        $this->update(['position' => ['x' => $x, 'y' => $y, 'z' => $z]]);
    }

    /**
     * Get the dimensions.
     */
    public function getDimensions(): array
    {
        return $this->dimensions ?? ['width' => 100, 'height' => 100];
    }

    /**
     * Set the dimensions.
     */
    public function setDimensions(float $width, float $height): void
    {
        $this->update(['dimensions' => ['width' => $width, 'height' => $height]]);
    }
}