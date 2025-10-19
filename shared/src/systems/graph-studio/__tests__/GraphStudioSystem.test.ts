/**
 * GraphStudioSystem Tests
 * 
 * Unit tests for Graph Studio system
 */

import { GraphStudioSystem, graphStudioSystem } from '../GraphStudioSystem';
import { GraphStudioEvent, GraphViewMode } from '../types';
import { CoreGraphNode, CoreGraphEdge } from '../../../services/ApiClient';

describe('GraphStudioSystem', () => {
  let system: GraphStudioSystem;

  beforeEach(() => {
    system = GraphStudioSystem.getInstance();
    system.reset();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = GraphStudioSystem.getInstance();
      const instance2 = GraphStudioSystem.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should export pre-created instance', () => {
      expect(graphStudioSystem).toBeInstanceOf(GraphStudioSystem);
      expect(graphStudioSystem).toBe(GraphStudioSystem.getInstance());
    });
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      system.initialize();
      
      const state = system.getState();
      expect(state.nodes).toEqual([]);
      expect(state.edges).toEqual([]);
      expect(state.selectedNode).toBeNull();
      expect(state.viewMode).toBe('explore');
      expect(state.displayMode).toBe('graph');
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should reset to initial state', () => {
      const mockNode: CoreGraphNode = {
        id: 1,
        guid: 'node-1',
        node_type_id: 1,
        label: 'Test Node',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      system.selectNode(mockNode);
      expect(system.getSelectedNode()).toBe(mockNode);

      system.reset();
      expect(system.getSelectedNode()).toBeNull();
      expect(system.getNodes()).toEqual([]);
    });
  });

  describe('Graph Loading', () => {
    it('should load nodes and edges', async () => {
      const mockNodes: CoreGraphNode[] = [
        {
          id: 1,
          guid: 'node-1',
          node_type_id: 1,
          label: 'Node 1',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          guid: 'node-2',
          node_type_id: 1,
          label: 'Node 2',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const mockEdges: CoreGraphEdge[] = [
        {
          id: 1,
          guid: 'edge-1',
          source_node_guid: 'node-1',
          target_node_guid: 'node-2',
          edge_type_id: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      await system.loadGraph(mockNodes, mockEdges);

      expect(system.getNodes()).toEqual(mockNodes);
      expect(system.getEdges()).toEqual(mockEdges);
    });

    it('should emit GRAPH_LOADED event', async () => {
      const mockNodes: CoreGraphNode[] = [];
      const mockEdges: CoreGraphEdge[] = [];

      const handler = jest.fn();
      system.on(GraphStudioEvent.GRAPH_LOADED, handler);

      await system.loadGraph(mockNodes, mockEdges);

      expect(handler).toHaveBeenCalledWith({
        nodeCount: 0,
        edgeCount: 0,
      });
    });
  });

  describe('Node Selection', () => {
    it('should select a node', () => {
      const mockNode: CoreGraphNode = {
        id: 1,
        guid: 'node-1',
        node_type_id: 1,
        label: 'Test Node',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      system.selectNode(mockNode);
      expect(system.getSelectedNode()).toBe(mockNode);
    });

    it('should emit NODE_SELECTED event', () => {
      const mockNode: CoreGraphNode = {
        id: 1,
        guid: 'node-1',
        node_type_id: 1,
        label: 'Test Node',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const handler = jest.fn();
      system.on(GraphStudioEvent.NODE_SELECTED, handler);

      system.selectNode(mockNode);
      expect(handler).toHaveBeenCalledWith(mockNode);
    });

    it('should deselect node', () => {
      const mockNode: CoreGraphNode = {
        id: 1,
        guid: 'node-1',
        node_type_id: 1,
        label: 'Test Node',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      system.selectNode(mockNode);
      system.selectNode(null);
      
      expect(system.getSelectedNode()).toBeNull();
    });

    it('should emit NODE_DESELECTED event', () => {
      const mockNode: CoreGraphNode = {
        id: 1,
        guid: 'node-1',
        node_type_id: 1,
        label: 'Test Node',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const handler = jest.fn();
      system.on(GraphStudioEvent.NODE_DESELECTED, handler);

      system.selectNode(mockNode);
      system.selectNode(null);
      
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('View Mode', () => {
    it('should set view mode', () => {
      const modes: GraphViewMode[] = ['explore', 'edit', 'design'];
      
      modes.forEach(mode => {
        system.setViewMode(mode);
        expect(system.getViewMode()).toBe(mode);
      });
    });

    it('should emit VIEW_MODE_CHANGED event', () => {
      const handler = jest.fn();
      system.on(GraphStudioEvent.VIEW_MODE_CHANGED, handler);

      system.setViewMode('edit');
      expect(handler).toHaveBeenCalledWith('edit');
    });
  });

  describe('Filtering', () => {
    beforeEach(async () => {
      const mockNodes: CoreGraphNode[] = [
        {
          id: 1,
          guid: 'node-1',
          node_type_id: 1,
          label: 'Concept Node',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          node_type: {
            id: 1,
            name: 'concept',
            display_name: 'Concept',
            is_system: true,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
        {
          id: 2,
          guid: 'node-2',
          node_type_id: 2,
          label: 'Document Node',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          node_type: {
            id: 2,
            name: 'document',
            display_name: 'Document',
            is_system: true,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
        {
          id: 3,
          guid: 'node-3',
          node_type_id: 1,
          label: 'Isolated Concept',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          node_type: {
            id: 1,
            name: 'concept',
            display_name: 'Concept',
            is_system: true,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
      ];

      const mockEdges: CoreGraphEdge[] = [
        {
          id: 1,
          guid: 'edge-1',
          source_node_guid: 'node-1',
          target_node_guid: 'node-2',
          edge_type_id: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      await system.loadGraph(mockNodes, mockEdges);
    });

    it('should filter by search term', () => {
      system.setFilters({ searchTerm: 'Document' });
      const filtered = system.getFilteredNodes();
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].label).toBe('Document Node');
    });

    it('should filter by node type', () => {
      system.setFilters({ nodeType: 'document' });
      const filtered = system.getFilteredNodes();
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].node_type?.name).toBe('document');
    });

    it('should filter by connection status', () => {
      system.setFilters({ connections: 'isolated' });
      const filtered = system.getFilteredNodes();
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].label).toBe('Isolated Concept');
    });

    it('should combine multiple filters', () => {
      system.setFilters({ 
        searchTerm: 'Concept',
        connections: 'connected'
      });
      const filtered = system.getFilteredNodes();
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].label).toBe('Concept Node');
    });
  });
});

