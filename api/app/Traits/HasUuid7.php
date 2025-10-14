<?php

namespace App\Traits;

use App\Support\Uuid7;
use Illuminate\Database\Eloquent\Model;

/**
 * Has UUID v7 Trait
 * 
 * Automatically generates UUID v7 for the 'guid' field when creating a new model.
 * 
 * Usage:
 * ```php
 * class MyModel extends Model
 * {
 *     use HasUuid7;
 *     
 *     protected $fillable = ['guid', ...];
 * }
 * ```
 * 
 * Features:
 * - Automatic UUID v7 generation on model creation
 * - Time-ordered UUIDs for better database performance
 * - Compatible with existing UUID v4 records
 * - Can be customized to use different field name
 */
trait HasUuid7
{
    /**
     * Boot the trait.
     * 
     * Register a creating event listener to generate UUID v7.
     */
    protected static function bootHasUuid7(): void
    {
        static::creating(function (Model $model) {
            // Get the UUID field name (defaults to 'guid')
            $uuidField = $model->getUuidFieldName();
            
            // Only generate if field is empty
            if (empty($model->{$uuidField})) {
                $model->{$uuidField} = Uuid7::generate();
            }
        });
    }
    
    /**
     * Get the name of the UUID field.
     * Override this method in your model to use a different field name.
     * 
     * @return string
     */
    public function getUuidFieldName(): string
    {
        return property_exists($this, 'uuidFieldName') 
            ? $this->uuidFieldName 
            : 'guid';
    }
    
    /**
     * Scope query to find by UUID (either ID or GUID field)
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $uuid
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFindByUuid($query, string $uuid)
    {
        $uuidField = $this->getUuidFieldName();
        return $query->where($uuidField, $uuid);
    }
    
    /**
     * Get the UUID value
     * 
     * @return string|null
     */
    public function getUuid(): ?string
    {
        $uuidField = $this->getUuidFieldName();
        return $this->{$uuidField};
    }
    
    /**
     * Get timestamp from UUID v7
     * 
     * @return int|null Timestamp in milliseconds, or null if not UUID v7
     */
    public function getUuidTimestamp(): ?int
    {
        $uuid = $this->getUuid();
        
        if (!$uuid) {
            return null;
        }
        
        try {
            if (Uuid7::isValid($uuid)) {
                return Uuid7::getTimestamp($uuid);
            }
        } catch (\Exception $e) {
            // Not a valid UUID v7, return null
        }
        
        return null;
    }
    
    /**
     * Get DateTime from UUID v7
     * 
     * @return \DateTime|null
     */
    public function getUuidDateTime(): ?\DateTime
    {
        $uuid = $this->getUuid();
        
        if (!$uuid) {
            return null;
        }
        
        try {
            if (Uuid7::isValid($uuid)) {
                return Uuid7::getDateTime($uuid);
            }
        } catch (\Exception $e) {
            // Not a valid UUID v7, return null
        }
        
        return null;
    }
    
    /**
     * Check if the model's UUID is a valid UUID v7
     * 
     * @return bool
     */
    public function hasUuidV7(): bool
    {
        $uuid = $this->getUuid();
        
        if (!$uuid) {
            return false;
        }
        
        return Uuid7::isValid($uuid);
    }
    
    /**
     * Generate a new UUID v7 for the model
     * Note: This does not save the model automatically
     * 
     * @return string The generated UUID
     */
    public function generateUuid(): string
    {
        $uuidField = $this->getUuidFieldName();
        $uuid = Uuid7::generate();
        $this->{$uuidField} = $uuid;
        
        return $uuid;
    }
}


