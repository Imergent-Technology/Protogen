<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\RegistryCatalog;
use App\Services\RegistryValidationService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RegistryValidationTest extends TestCase
{
    use RefreshDatabase;

    protected RegistryValidationService $validationService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->validationService = new RegistryValidationService();
    }

    /** @test */
    public function it_validates_string_metadata()
    {
        // Create registry entry for string type
        RegistryCatalog::create([
            'scope' => 'core.node',
            'key' => 'status',
            'type' => 'string',
            'description' => 'Node status',
            'default_value' => 'active',
            'is_presentational' => true,
        ]);

        $metadata = ['status' => 'inactive'];
        $result = $this->validationService->validateMetadata('core.node', $metadata);

        $this->assertEquals('inactive', $result['status']);
        $this->assertArrayHasKey('status', $result);
    }

    /** @test */
    public function it_validates_number_metadata()
    {
        // Create registry entry for number type
        RegistryCatalog::create([
            'scope' => 'core.node',
            'key' => 'priority',
            'type' => 'number',
            'description' => 'Node priority',
            'default_value' => 1,
            'is_presentational' => true,
            'validation_rules' => ['min' => 1, 'max' => 10],
        ]);

        $metadata = ['priority' => 5];
        $result = $this->validationService->validateMetadata('core.node', $metadata);

        $this->assertEquals(5, $result['priority']);
    }

    /** @test */
    public function it_validates_boolean_metadata()
    {
        // Create registry entry for boolean type
        RegistryCatalog::create([
            'scope' => 'core.node',
            'key' => 'visible',
            'type' => 'boolean',
            'description' => 'Node visibility',
            'default_value' => true,
            'is_presentational' => true,
        ]);

        $metadata = ['visible' => false];
        $result = $this->validationService->validateMetadata('core.node', $metadata);

        $this->assertFalse($result['visible']);
    }

    /** @test */
    public function it_validates_array_metadata()
    {
        // Create registry entry for array type
        RegistryCatalog::create([
            'scope' => 'core.node',
            'key' => 'tags',
            'type' => 'array',
            'description' => 'Node tags',
            'default_value' => [],
            'is_presentational' => true,
            'validation_rules' => ['min_length' => 0, 'max_length' => 10],
        ]);

        $metadata = ['tags' => ['important', 'urgent']];
        $result = $this->validationService->validateMetadata('core.node', $metadata);

        $this->assertEquals(['important', 'urgent'], $result['tags']);
    }

    /** @test */
    public function it_validates_object_metadata()
    {
        // Create registry entry for object type
        RegistryCatalog::create([
            'scope' => 'core.node',
            'key' => 'position',
            'type' => 'object',
            'description' => 'Node position',
            'default_value' => ['x' => 0, 'y' => 0],
            'is_presentational' => true,
        ]);

        $metadata = ['position' => ['x' => 100, 'y' => 200]];
        $result = $this->validationService->validateMetadata('core.node', $metadata);

        $this->assertEquals(['x' => 100, 'y' => 200], $result['position']);
    }

    /** @test */
    public function it_applies_default_values()
    {
        // Create registry entry with default value
        RegistryCatalog::create([
            'scope' => 'core.node',
            'key' => 'status',
            'type' => 'string',
            'description' => 'Node status',
            'default_value' => 'active',
            'is_presentational' => true,
        ]);

        $metadata = []; // No status provided
        $result = $this->validationService->validateMetadata('core.node', $metadata);

        $this->assertEquals('active', $result['status']);
    }

    /** @test */
    public function it_validates_custom_rules()
    {
        // Create registry entry with custom validation rules
        RegistryCatalog::create([
            'scope' => 'core.node',
            'key' => 'priority',
            'type' => 'number',
            'description' => 'Node priority',
            'default_value' => 1,
            'is_presentational' => true,
            'validation_rules' => ['min' => 1, 'max' => 10],
        ]);

        // Valid priority
        $metadata = ['priority' => 5];
        $result = $this->validationService->validateMetadata('core.node', $metadata);
        $this->assertEquals(5, $result['priority']);

        // Invalid priority (too low)
        $metadata = ['priority' => 0];
        $this->expectException(\Illuminate\Validation\ValidationException::class);
        $this->validationService->validateMetadata('core.node', $metadata);
    }

    /** @test */
    public function it_validates_enum_values()
    {
        // Create registry entry with enum validation
        RegistryCatalog::create([
            'scope' => 'core.node',
            'key' => 'status',
            'type' => 'string',
            'description' => 'Node status',
            'default_value' => 'active',
            'is_presentational' => true,
            'validation_rules' => ['enum' => ['active', 'inactive', 'draft']],
        ]);

        // Valid status
        $metadata = ['status' => 'draft'];
        $result = $this->validationService->validateMetadata('core.node', $metadata);
        $this->assertEquals('draft', $result['status']);

        // Invalid status
        $metadata = ['status' => 'invalid'];
        $this->expectException(\Illuminate\Validation\ValidationException::class);
        $this->validationService->validateMetadata('core.node', $metadata);
    }

    /** @test */
    public function it_handles_unknown_keys()
    {
        // Create registry entry
        RegistryCatalog::create([
            'scope' => 'core.node',
            'key' => 'status',
            'type' => 'string',
            'description' => 'Node status',
            'default_value' => 'active',
            'is_presentational' => true,
        ]);

        // Include unknown key
        $metadata = ['status' => 'active', 'unknown_key' => 'value'];
        $result = $this->validationService->validateMetadata('core.node', $metadata);

        $this->assertEquals('active', $result['status']);
        $this->assertEquals('value', $result['unknown_key']);
    }

    /** @test */
    public function it_gets_scope_metadata()
    {
        // Create multiple registry entries
        RegistryCatalog::create([
            'scope' => 'core.node',
            'key' => 'status',
            'type' => 'string',
            'description' => 'Node status',
            'default_value' => 'active',
            'is_presentational' => true,
        ]);

        RegistryCatalog::create([
            'scope' => 'core.node',
            'key' => 'priority',
            'type' => 'number',
            'description' => 'Node priority',
            'default_value' => 1,
            'is_presentational' => true,
        ]);

        $schema = $this->validationService->getScopeMetadata('core.node');

        $this->assertArrayHasKey('status', $schema);
        $this->assertArrayHasKey('priority', $schema);
        $this->assertEquals('string', $schema['status']['type']);
        $this->assertEquals('number', $schema['priority']['type']);
    }

    /** @test */
    public function it_gets_presentational_keys()
    {
        // Create presentational and non-presentational entries
        RegistryCatalog::create([
            'scope' => 'core.node',
            'key' => 'status',
            'type' => 'string',
            'description' => 'Node status',
            'default_value' => 'active',
            'is_presentational' => true,
        ]);

        RegistryCatalog::create([
            'scope' => 'core.node',
            'key' => 'internal_id',
            'type' => 'string',
            'description' => 'Internal ID',
            'default_value' => null,
            'is_presentational' => false,
        ]);

        $presentationalKeys = $this->validationService->getPresentationalKeys('core.node');

        $this->assertCount(1, $presentationalKeys);
        $this->assertEquals('status', $presentationalKeys->first()->key);
    }

    /** @test */
    public function it_gets_default_values()
    {
        // Create registry entries with defaults
        RegistryCatalog::create([
            'scope' => 'core.node',
            'key' => 'status',
            'type' => 'string',
            'description' => 'Node status',
            'default_value' => 'active',
            'is_presentational' => true,
        ]);

        RegistryCatalog::create([
            'scope' => 'core.node',
            'key' => 'priority',
            'type' => 'number',
            'description' => 'Node priority',
            'default_value' => 1,
            'is_presentational' => true,
        ]);

        $defaults = $this->validationService->getDefaultValues('core.node');

        $this->assertEquals('active', $defaults['status']);
        $this->assertEquals(1, $defaults['priority']);
    }
}
