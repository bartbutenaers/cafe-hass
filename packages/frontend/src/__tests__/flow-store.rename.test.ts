import { beforeEach, describe, expect, it } from 'vitest';
import { useFlowStore } from '../store/flow-store';

describe('flow-store renameNode', () => {
  beforeEach(() => {
    // Reset store to initial empty state
    const s = useFlowStore.getState();
    s.reset();
  });

  it('renames node id and updates edges and nodeErrors', () => {
    const s = useFlowStore.getState();

    // seed nodes and edges
    const nodeA = { id: 'a', type: 'trigger', position: { x: 0, y: 0 }, data: {} };
    const nodeB = { id: 'b', type: 'action', position: { x: 10, y: 10 }, data: {} };
    const edge = { id: 'edge-a-b', source: 'a', target: 'b', animated: false };

    s.setNodes([nodeA, nodeB]);
    s.setEdges([edge]);

    // add node error for 'a'
    s.setNodes([nodeA, nodeB]);
    s.validateAllNodes();
    // directly inject a node error to ensure it moves
    const errors = new Map<string, any>();
    errors.set('a', [{ message: 'dummy' }]);
    useFlowStore.setState({ nodeErrors: errors } as any);

    // perform rename
    s.renameNode('a', 'new-a');

    const state = useFlowStore.getState();
    expect(state.nodes.find((n) => n.id === 'new-a')).toBeDefined();
    expect(state.nodes.find((n) => n.id === 'a')).toBeUndefined();

    // edge source should be updated
    expect(state.edges[0].source).toBe('new-a');
    // edge id should have been updated
    expect(state.edges[0].id).toContain('new-a');

    // nodeErrors key moved
    expect(state.nodeErrors.has('new-a')).toBe(true);
    expect(state.nodeErrors.has('a')).toBe(false);
  });

  it('throws when target id already exists', () => {
    const s = useFlowStore.getState();

    const nodeA = { id: 'a', type: 'trigger', position: { x: 0, y: 0 }, data: {} };
    const nodeB = { id: 'b', type: 'action', position: { x: 10, y: 10 }, data: {} };

    s.setNodes([nodeA, nodeB]);

    expect(() => s.renameNode('a', 'b')).toThrow();
  });
});
