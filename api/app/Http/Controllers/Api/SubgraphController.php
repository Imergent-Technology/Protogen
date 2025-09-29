<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subgraph;
use App\Models\CoreGraphNode;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class SubgraphController extends Controller
{
    /**
     * Display a listing of subgraphs for a tenant.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
        ]);

        $subgraphs = Subgraph::where('tenant_id', $request->tenant_id)
                            ->with(['nodes', 'createdBy'])
                            ->get();

        return response()->json([
            'success' => true,
            'data' => $subgraphs,
            'message' => 'Subgraphs retrieved successfully'
        ]);
    }

    /**
     * Store a newly created subgraph.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'tenant_id' => 'required|exists:tenants,id',
            'is_public' => 'boolean',
            'node_ids' => 'nullable|array',
            'node_ids.*' => 'exists:core_graph_nodes,id'
        ]);

        $subgraph = Subgraph::create([
            'name' => $request->name,
            'description' => $request->description,
            'tenant_id' => $request->tenant_id,
            'created_by' => auth()->id(),
            'is_public' => $request->is_public ?? false
        ]);

        // Add nodes if provided
        if ($request->has('node_ids') && is_array($request->node_ids)) {
            $subgraph->nodes()->attach($request->node_ids);
        }

        $subgraph->load(['nodes', 'createdBy']);

        return response()->json([
            'success' => true,
            'data' => $subgraph,
            'message' => 'Subgraph created successfully'
        ], 201);
    }

    /**
     * Display the specified subgraph.
     */
    public function show(Subgraph $subgraph): JsonResponse
    {
        $subgraph->load(['nodes', 'scenes', 'createdBy']);

        return response()->json([
            'success' => true,
            'data' => $subgraph,
            'message' => 'Subgraph retrieved successfully'
        ]);
    }

    /**
     * Update the specified subgraph.
     */
    public function update(Request $request, Subgraph $subgraph): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'is_public' => 'boolean',
            'node_ids' => 'nullable|array',
            'node_ids.*' => 'exists:core_graph_nodes,id'
        ]);

        $subgraph->update($request->only(['name', 'description', 'is_public']));

        // Update nodes if provided
        if ($request->has('node_ids')) {
            $subgraph->nodes()->sync($request->node_ids);
        }

        $subgraph->load(['nodes', 'createdBy']);

        return response()->json([
            'success' => true,
            'data' => $subgraph,
            'message' => 'Subgraph updated successfully'
        ]);
    }

    /**
     * Remove the specified subgraph.
     */
    public function destroy(Subgraph $subgraph): JsonResponse
    {
        $subgraph->delete();

        return response()->json([
            'success' => true,
            'message' => 'Subgraph deleted successfully'
        ]);
    }

    /**
     * Add a node to the subgraph.
     */
    public function addNode(Request $request, Subgraph $subgraph): JsonResponse
    {
        $request->validate([
            'node_id' => 'required|exists:core_graph_nodes,id'
        ]);

        $node = CoreGraphNode::findOrFail($request->node_id);
        $subgraph->addNode($node);

        return response()->json([
            'success' => true,
            'message' => 'Node added to subgraph successfully'
        ]);
    }

    /**
     * Remove a node from the subgraph.
     */
    public function removeNode(Request $request, Subgraph $subgraph): JsonResponse
    {
        $request->validate([
            'node_id' => 'required|exists:core_graph_nodes,id'
        ]);

        $node = CoreGraphNode::findOrFail($request->node_id);
        $subgraph->removeNode($node);

        return response()->json([
            'success' => true,
            'message' => 'Node removed from subgraph successfully'
        ]);
    }

    /**
     * Get all edges between nodes in the subgraph.
     */
    public function getEdges(Subgraph $subgraph): JsonResponse
    {
        $edges = $subgraph->getEdges();

        return response()->json([
            'success' => true,
            'data' => $edges,
            'message' => 'Subgraph edges retrieved successfully'
        ]);
    }

    /**
     * Get nodes in the subgraph.
     */
    public function getNodes(Subgraph $subgraph): JsonResponse
    {
        $nodes = $subgraph->nodes;

        return response()->json([
            'success' => true,
            'data' => $nodes,
            'message' => 'Subgraph nodes retrieved successfully'
        ]);
    }
}