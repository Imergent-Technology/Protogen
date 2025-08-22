<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StageRegistry extends Model
{
    use HasFactory;

    protected $fillable = [
        'stage_id',
        'registry_key',
        'registry_value',
    ];

    protected $casts = [
        'registry_value' => 'array',
    ];

    /**
     * Get the stage that owns this registry entry.
     */
    public function stage(): BelongsTo
    {
        return $this->belongsTo(Stage::class);
    }

    /**
     * Scope to get entries by key.
     */
    public function scopeByKey($query, $key)
    {
        return $query->where('registry_key', $key);
    }

    /**
     * Scope to get entries for a specific stage.
     */
    public function scopeForStage($query, $stageId)
    {
        return $query->where('stage_id', $stageId);
    }

    /**
     * Get a specific registry value for a stage.
     */
    public static function getValue($stageId, $key, $default = null)
    {
        $entry = static::where('stage_id', $stageId)
            ->where('registry_key', $key)
            ->first();
        
        return $entry ? $entry->registry_value : $default;
    }

    /**
     * Set a registry value for a stage.
     */
    public static function setValue($stageId, $key, $value)
    {
        return static::updateOrCreate(
            ['stage_id' => $stageId, 'registry_key' => $key],
            ['registry_value' => $value]
        );
    }
}
