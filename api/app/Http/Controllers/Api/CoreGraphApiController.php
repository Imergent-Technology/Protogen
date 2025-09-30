<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CoreGraphNode;
use App\Models\CoreGraphEdge;
use App\Models\CoreGraphNodeType;
use App\Models\CoreGraphEdgeType;
use App\Http\Requests\CoreGraphEdgeRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class CoreGraphApiController extends Controller
{
    /**
     * Get all nodes with optional filtering
     */
    public function getNodes(Request $request): JsonResponse
    {
        $query = CoreGraphNode::with(['nodeType'])->active();

        // Filter by node type
        if ($request->has('node_type_id')) {
            $query->ofType($request->node_type_id);
        }

        // Filter by node type name
        if ($request->has('node_type_name')) {
            $query->ofTypeName($request->node_type_name);
        }

        // Search by label
        if ($request->has('search')) {
            $query->where('label', 'ilike', '%' . $request->search . '%');
        }

        $nodes = $query->get();

        return response()->json([
            'success' => true,
            'data' => $nodes
        ]);
    }

    /**
     * Get a specific node by GUID
     */
    public function getNode(string $guid): JsonResponse
    {
        $node = CoreGraphNode::with(['nodeType', 'outgoingEdges.edgeType', 'incomingEdges.edgeType'])
            ->where('guid', $guid)
            ->first();

        if (!$node) {
            return response()->json([
                'success' => false,
                'message' => 'Node not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $node
        ]);
    }

    /**
     * Create a new node
     */
    public function createNode(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'node_type_id' => 'required|exists:node_types,id',
            'label' => 'required|string|max:255',
            'description' => 'nullable|string',
            'properties' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $node = CoreGraphNode::create($request->all());

        return response()->json([
            'success' => true,
            'data' => $node->load('nodeType'),
            'message' => 'Node created successfully'
        ], 201);
    }

    /**
     * Update a node
     */
    public function updateNode(Request $request, string $guid): JsonResponse
    {
        $node = CoreGraphNode::where('guid', $guid)->first();

        if (!$node) {
            return response()->json([
                'success' => false,
                'message' => 'Node not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'node_type_id' => 'sometimes|required|exists:node_types,id',
            'label' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'properties' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $node->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $node->load('nodeType'),
            'message' => 'Node updated successfully'
        ]);
    }

    /**
     * Delete a node
     */
    public function deleteNode(string $guid): JsonResponse
    {
        $node = CoreGraphNode::where('guid', $guid)->first();

        if (!$node) {
            return response()->json([
                'success' => false,
                'message' => 'Node not found'
            ], 404);
        }

        $node->delete();

        return response()->json([
            'success' => true,
            'message' => 'Node deleted successfully'
        ]);
    }

    /**
     * Get all edges
     */
    public function getEdges(Request $request): JsonResponse
    {
        $query = CoreGraphEdge::with(['sourceNode', 'targetNode', 'edgeType'])->active();

        // Filter by edge type
        if ($request->has('edge_type_id')) {
            $query->ofType($request->edge_type_id);
        }

        // Filter by connected node
        if ($request->has('node_guid')) {
            $query->connectedToNode($request->node_guid);
        }

        $edges = $query->get();

        return response()->json([
            'success' => true,
            'data' => $edges
        ]);
    }

    /**
     * Create a new edge
     */
    public function createEdge(CoreGraphEdgeRequest $request): JsonResponse
    {
        $edge = CoreGraphEdge::create($request->validated());

        return response()->json([
            'success' => true,
            'data' => $edge->load(['sourceNode', 'targetNode', 'edgeType']),
            'message' => 'Edge created successfully'
        ], 201);
    }

    /**
     * Delete an edge
     */
    public function deleteEdge(string $guid): JsonResponse
    {
        $edge = CoreGraphEdge::where('guid', $guid)->first();

        if (!$edge) {
            return response()->json([
                'success' => false,
                'message' => 'Edge not found'
            ], 404);
        }

        $edge->delete();

        return response()->json([
            'success' => true,
            'message' => 'Edge deleted successfully'
        ]);
    }

    /**
     * Get all node types
     */
    public function getNodeTypes(Request $request): JsonResponse
    {
        $query = CoreGraphNodeType::active();

        // Filter by system vs custom
        if ($request->has('is_system')) {
            $query->where('is_system', $request->boolean('is_system'));
        }

        $nodeTypes = $query->get();

        return response()->json([
            'success' => true,
            'data' => $nodeTypes
        ]);
    }

    /**
     * Create a custom node type
     */
    public function createNodeType(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:node_types,name',
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'icon_color' => 'nullable|string|max:7', // Hex color
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $nodeType = CoreGraphNodeType::create([
            ...$request->all(),
            'is_system' => false, // Always custom when created via API
        ]);

        return response()->json([
            'success' => true,
            'data' => $nodeType,
            'message' => 'Node type created successfully'
        ], 201);
    }

    /**
     * Get all edge types
     */
    public function getEdgeTypes(Request $request): JsonResponse
    {
        $query = CoreGraphEdgeType::active();

        // Filter by system vs custom
        if ($request->has('is_system')) {
            $query->where('is_system', $request->boolean('is_system'));
        }

        $edgeTypes = $query->get();

        return response()->json([
            'success' => true,
            'data' => $edgeTypes
        ]);
    }

    /**
     * Get the complete graph structure
     */
    public function getGraph(): JsonResponse
    {
        $nodes = CoreGraphNode::with(['nodeType'])->active()->get();
        $edges = CoreGraphEdge::with(['sourceNode', 'targetNode', 'edgeType'])->active()->get();

        return response()->json([
            'success' => true,
            'data' => [
                'nodes' => $nodes,
                'edges' => $edges
            ]
        ]);
    }

    /**
     * Update node position
     */
    public function updateNodePosition(Request $request, string $nodeGuid): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'position' => 'required|array',
            'position.x' => 'required|numeric',
            'position.y' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $node = CoreGraphNode::where('guid', $nodeGuid)->first();

        if (!$node) {
            return response()->json([
                'success' => false,
                'message' => 'Node not found'
            ], 404);
        }

        $node->position = $request->position;
        $node->save();

        return response()->json([
            'success' => true,
            'data' => $node,
            'message' => 'Node position updated successfully'
        ]);
    }

    /**
     * Update multiple node positions (batch update)
     */
    public function updateNodePositions(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'positions' => 'required|array',
            'positions.*.node_guid' => 'required|string',
            'positions.*.position' => 'required|array',
            'positions.*.position.x' => 'required|numeric',
            'positions.*.position.y' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $updatedNodes = [];
        
        foreach ($request->positions as $positionData) {
            $node = CoreGraphNode::where('guid', $positionData['node_guid'])->first();
            if ($node) {
                $node->position = $positionData['position'];
                $node->save();
                $updatedNodes[] = $node;
            }
        }

        return response()->json([
            'success' => true,
            'data' => $updatedNodes,
            'message' => 'Node positions updated successfully'
        ]);
    }
}
