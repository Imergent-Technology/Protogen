<?php

namespace App\Services;

use App\Models\RegistryCatalog;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class RegistryValidationService
{
    /**
     * Validate metadata against registry rules.
     */
    public function validateMetadata(string $scope, array $metadata): array
    {
        $errors = [];
        $validated = [];

        // Get all registry entries for this scope
        $registryEntries = RegistryCatalog::getScopeEntries($scope);
        
        // Validate each metadata key
        foreach ($metadata as $key => $value) {
            $registryEntry = $registryEntries->first(function ($entry) use ($key) {
                return $entry->key === $key;
            });

            if ($registryEntry) {
                // Validate against registry rules
                if (!$registryEntry->validateValue($value)) {
                    $errors[$key] = $registryEntry->getValidationErrorMessage($value);
                } else {
                    $validated[$key] = $value;
                }
            } else {
                // Key not in registry - this might be an error depending on strict mode
                $validated[$key] = $value;
            }
        }

        // Apply default values for missing required keys
        foreach ($registryEntries as $entry) {
            if (!array_key_exists($entry->key, $validated) && $entry->default_value !== null) {
                $validated[$entry->key] = $entry->default_value;
            }
        }

        if (!empty($errors)) {
            throw new ValidationException(
                validator([], []),
                response()->json([
                    'message' => 'Metadata validation failed',
                    'errors' => $errors
                ], 422)
            );
        }

        return $validated;
    }

    /**
     * Validate a single metadata key-value pair.
     */
    public function validateKey(string $scope, string $key, $value): bool
    {
        $registryEntry = RegistryCatalog::getEntry($scope, $key);
        
        if (!$registryEntry) {
            return true; // Allow unknown keys (could be configurable)
        }

        return $registryEntry->validateValue($value);
    }

    /**
     * Get validation errors for metadata.
     */
    public function getValidationErrors(string $scope, array $metadata): array
    {
        $errors = [];
        $registryEntries = RegistryCatalog::getScopeEntries($scope);

        foreach ($metadata as $key => $value) {
            $registryEntry = $registryEntries->first(function ($entry) use ($key) {
                return $entry->key === $key;
            });

            if ($registryEntry && !$registryEntry->validateValue($value)) {
                $errors[$key] = $registryEntry->getValidationErrorMessage($value);
            }
        }

        return $errors;
    }

    /**
     * Get default values for a scope.
     */
    public function getDefaultValues(string $scope): array
    {
        $registryEntries = RegistryCatalog::getScopeEntries($scope);
        $defaults = [];

        foreach ($registryEntries as $entry) {
            if ($entry->default_value !== null) {
                $defaults[$entry->key] = $entry->default_value;
            }
        }

        return $defaults;
    }

    /**
     * Get presentational keys for a scope.
     */
    public function getPresentationalKeys(string $scope): Collection
    {
        return RegistryCatalog::getPresentationalKeys($scope);
    }

    /**
     * Check if a key is presentational.
     */
    public function isPresentational(string $scope, string $key): bool
    {
        $entry = RegistryCatalog::getEntry($scope, $key);
        return $entry ? $entry->is_presentational : false;
    }

    /**
     * Get the type for a metadata key.
     */
    public function getKeyType(string $scope, string $key): ?string
    {
        $entry = RegistryCatalog::getEntry($scope, $key);
        return $entry ? $entry->type : null;
    }

    /**
     * Get description for a metadata key.
     */
    public function getKeyDescription(string $scope, string $key): ?string
    {
        $entry = RegistryCatalog::getEntry($scope, $key);
        return $entry ? $entry->description : null;
    }

    /**
     * Validate and merge metadata with defaults.
     */
    public function validateAndMerge(string $scope, array $metadata, bool $strict = false): array
    {
        $errors = [];
        $validated = [];
        $registryEntries = RegistryCatalog::getScopeEntries($scope);

        // Validate provided metadata
        foreach ($metadata as $key => $value) {
            $registryEntry = $registryEntries->first(function ($entry) use ($key) {
                return $entry->key === $key;
            });

            if ($registryEntry) {
                if (!$registryEntry->validateValue($value)) {
                    $errors[$key] = $registryEntry->getValidationErrorMessage($value);
                } else {
                    $validated[$key] = $value;
                }
            } else {
                if ($strict) {
                    $errors[$key] = "Unknown metadata key: {$key}";
                } else {
                    $validated[$key] = $value;
                }
            }
        }

        // Apply defaults for missing keys
        foreach ($registryEntries as $entry) {
            if (!array_key_exists($entry->key, $validated) && $entry->default_value !== null) {
                $validated[$entry->key] = $entry->default_value;
            }
        }

        if (!empty($errors)) {
            throw new ValidationException(
                validator([], []),
                response()->json([
                    'message' => 'Metadata validation failed',
                    'errors' => $errors
                ], 422)
            );
        }

        return $validated;
    }

    /**
     * Get all registry entries for a scope with their metadata.
     */
    public function getScopeMetadata(string $scope): array
    {
        $registryEntries = RegistryCatalog::getScopeEntries($scope);
        $metadata = [];

        foreach ($registryEntries as $entry) {
            $metadata[$entry->key] = [
                'type' => $entry->type,
                'description' => $entry->description,
                'default_value' => $entry->default_value,
                'is_presentational' => $entry->is_presentational,
                'validation_rules' => $entry->validation_rules,
            ];
        }

        return $metadata;
    }
}
