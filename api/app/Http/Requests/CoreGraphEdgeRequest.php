<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CoreGraphEdgeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $rules = [
            'source_node_guid' => 'required|uuid|exists:core_graph_nodes,guid',
            'target_node_guid' => 'required|uuid|exists:core_graph_nodes,guid',
            'edge_type_id' => 'required|exists:core_graph_edge_types,id',
            'weight' => 'required|numeric|min:0.00001|max:999.99999',
            'label' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'properties' => 'nullable|array',
            'is_active' => 'boolean',
        ];

        // Prevent self-loops
        if ($this->source_node_guid && $this->target_node_guid) {
            $rules['target_node_guid'] .= '|different:source_node_guid';
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'source_node_guid.required' => 'Source node is required.',
            'source_node_guid.uuid' => 'Source node must be a valid UUID.',
            'source_node_guid.exists' => 'Source node does not exist.',
            'target_node_guid.required' => 'Target node is required.',
            'target_node_guid.uuid' => 'Target node must be a valid UUID.',
            'target_node_guid.exists' => 'Target node does not exist.',
            'target_node_guid.different' => 'Source and target nodes must be different.',
            'edge_type_id.required' => 'Edge type is required.',
            'edge_type_id.exists' => 'Edge type does not exist.',
            'weight.required' => 'Weight is required.',
            'weight.numeric' => 'Weight must be a number.',
            'weight.min' => 'Weight must be at least 0.00001.',
            'weight.max' => 'Weight cannot exceed 999.99999.',
            'label.max' => 'Label cannot exceed 255 characters.',
            'description.max' => 'Description cannot exceed 1000 characters.',
            'properties.array' => 'Properties must be an array.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure weight is properly formatted
        if ($this->has('weight')) {
            $this->merge([
                'weight' => (float) $this->weight
            ]);
        }

        // Set default weight if not provided
        if (!$this->has('weight')) {
            $this->merge([
                'weight' => 1.00000
            ]);
        }

        // Ensure is_active defaults to true
        if (!$this->has('is_active')) {
            $this->merge([
                'is_active' => true
            ]);
        }
    }
}
