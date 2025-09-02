<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class RegistryCatalog extends Model
{
    use HasFactory;

    protected $table = 'registry_catalog';

    protected $fillable = [
        'scope',
        'key',
        'type',
        'description',
        'default_value',
        'is_presentational',
        'validation_rules',
        'is_active',
    ];

    protected $casts = [
        'default_value' => 'array',
        'validation_rules' => 'array',
        'is_presentational' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get the scope and key as a combined identifier.
     */
    public function getFullKeyAttribute(): string
    {
        return "{$this->scope}.{$this->key}";
    }

    /**
     * Scope to get only active registry entries.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get entries by scope.
     */
    public function scopeOfScope($query, string $scope)
    {
        return $query->where('scope', $scope);
    }

    /**
     * Scope to get presentational keys.
     */
    public function scopePresentational($query)
    {
        return $query->where('is_presentational', true);
    }

    /**
     * Get the default value for this registry entry.
     */
    public function getDefaultValue()
    {
        return $this->default_value;
    }

    /**
     * Validate a value against this registry entry's rules.
     */
    public function validateValue($value): bool
    {
        // Basic type validation
        if (!$this->validateType($value)) {
            return false;
        }

        // Custom validation rules
        if ($this->validation_rules && !$this->validateCustomRules($value)) {
            return false;
        }

        return true;
    }

    /**
     * Validate the basic type of a value.
     */
    protected function validateType($value): bool
    {
        switch ($this->type) {
            case 'string':
                return is_string($value);
            case 'number':
                return is_numeric($value);
            case 'boolean':
                return is_bool($value);
            case 'array':
                return is_array($value);
            case 'object':
                return is_array($value) && !array_is_list($value);
            default:
                return false;
        }
    }

    /**
     * Validate custom validation rules.
     */
    protected function validateCustomRules($value): bool
    {
        // This is a simplified validation - in production, you might want to use
        // a more robust JSON schema validation library
        if (!is_array($this->validation_rules)) {
            return true;
        }

        // Example validation rules
        if (isset($this->validation_rules['min_length']) && is_string($value)) {
            if (strlen($value) < $this->validation_rules['min_length']) {
                return false;
            }
        }

        if (isset($this->validation_rules['max_length']) && is_string($value)) {
            if (strlen($value) > $this->validation_rules['max_length']) {
                return false;
            }
        }

        if (isset($this->validation_rules['min']) && is_numeric($value)) {
            if ($value < $this->validation_rules['min']) {
                return false;
            }
        }

        if (isset($this->validation_rules['max']) && is_numeric($value)) {
            if ($value > $this->validation_rules['max']) {
                return false;
            }
        }

        if (isset($this->validation_rules['enum']) && is_array($this->validation_rules['enum'])) {
            if (!in_array($value, $this->validation_rules['enum'])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get validation error message for a value.
     */
    public function getValidationErrorMessage($value): ?string
    {
        if ($this->validateValue($value)) {
            return null;
        }

        if (!$this->validateType($value)) {
            return "Value must be of type {$this->type}";
        }

        if ($this->validation_rules && !$this->validateCustomRules($value)) {
            return "Value failed custom validation rules";
        }

        return "Value validation failed";
    }

    /**
     * Check if this registry entry is for a specific scope and key.
     */
    public function matches(string $scope, string $key): bool
    {
        return $this->scope === $scope && $this->key === $key;
    }

    /**
     * Get all registry entries for a specific scope.
     */
    public static function getScopeEntries(string $scope): \Illuminate\Database\Eloquent\Collection
    {
        return static::active()->ofScope($scope)->get();
    }

    /**
     * Get a specific registry entry by scope and key.
     */
    public static function getEntry(string $scope, string $key): ?self
    {
        return static::active()->where('scope', $scope)->where('key', $key)->first();
    }

    /**
     * Get all presentational keys for a scope.
     */
    public static function getPresentationalKeys(string $scope): \Illuminate\Database\Eloquent\Collection
    {
        return static::active()->ofScope($scope)->presentational()->get();
    }
}
