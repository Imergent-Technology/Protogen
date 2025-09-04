<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Context extends Model
{
    use HasFactory;

    protected $fillable = [
        'guid',
        'name',
        'slug',
        'description',
        'context_type',
        'target_scene_id',
        'target_deck_id',
        'coordinates',
        'anchor_data',
        'meta',
        'is_active',
        'is_public',
        'created_by',
        'tenant_id',
    ];

    protected $casts = [
        'coordinates' => 'array',
        'anchor_data' => 'array',
        'meta' => 'array',
        'is_active' => 'boolean',
        'is_public' => 'boolean',
    ];

    protected $attributes = [
        'context_type' => 'coordinate',
        'is_active' => true,
        'is_public' => false,
    ];

    // Relationships
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function targetScene(): BelongsTo
    {
        return $this->belongsTo(Scene::class, 'target_scene_id');
    }

    public function targetDeck(): BelongsTo
    {
        return $this->belongsTo(Deck::class, 'target_deck_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('context_type', $type);
    }

    public function scopeForScene($query, $sceneId)
    {
        return $query->where('target_scene_id', $sceneId);
    }

    public function scopeForDeck($query, $deckId)
    {
        return $query->where('target_deck_id', $deckId);
    }

    public function scopeForTenant($query, $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    // Boot method to generate GUID
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($context) {
            if (empty($context->guid)) {
                $context->guid = Str::uuid();
            }
        });
    }

    // Helper methods
    public function isSceneContext(): bool
    {
        return $this->context_type === 'scene';
    }

    public function isDeckContext(): bool
    {
        return $this->context_type === 'deck';
    }

    public function isDocumentContext(): bool
    {
        return $this->context_type === 'document';
    }

    public function isCoordinateContext(): bool
    {
        return $this->context_type === 'coordinate';
    }

    public function getCoordinates(): array
    {
        return $this->coordinates ?? ['x' => 0, 'y' => 0, 'z' => 0];
    }

    public function setCoordinates(float $x, float $y, float $z = 0): void
    {
        $this->update(['coordinates' => ['x' => $x, 'y' => $y, 'z' => $z]]);
    }

    public function getAnchorData(): array
    {
        return $this->anchor_data ?? [];
    }

    public function setAnchorData(array $data): void
    {
        $this->update(['anchor_data' => $data]);
    }

    public function resolveTarget(): ?array
    {
        if ($this->isSceneContext() && $this->target_scene_id) {
            return [
                'type' => 'scene',
                'id' => $this->target_scene_id,
                'coordinates' => $this->coordinates,
                'anchor_data' => $this->anchor_data
            ];
        }

        if ($this->isDeckContext() && $this->target_deck_id) {
            return [
                'type' => 'deck',
                'id' => $this->target_deck_id,
                'coordinates' => $this->coordinates,
                'anchor_data' => $this->anchor_data
            ];
        }

        if ($this->isDocumentContext()) {
            return [
                'type' => 'document',
                'coordinates' => $this->coordinates,
                'anchor_data' => $this->anchor_data
            ];
        }

        if ($this->isCoordinateContext()) {
            return [
                'type' => 'coordinate',
                'coordinates' => $this->coordinates,
                'anchor_data' => $this->anchor_data
            ];
        }

        return null;
    }

    public function validateCoordinates(): bool
    {
        $coordinates = $this->coordinates;
        
        if (!$coordinates || !is_array($coordinates)) {
            return false;
        }

        // Validate coordinate structure based on context type
        switch ($this->context_type) {
            case 'scene':
            case 'coordinate':
                return isset($coordinates['x']) && isset($coordinates['y']) &&
                       is_numeric($coordinates['x']) && is_numeric($coordinates['y']);
            
            case 'document':
                return isset($coordinates['position']) && is_numeric($coordinates['position']);
            
            case 'deck':
                return isset($coordinates['index']) && is_numeric($coordinates['index']);
            
            default:
                return false;
        }
    }
}
