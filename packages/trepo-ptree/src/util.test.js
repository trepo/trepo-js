const {expect} = require('chai');
const {VGraph, Util, Node, Direction} = require('trepo-vgraph');
const util = require('./util.js');
const uuidv4 = Util.generateUUIDv4();
let vGraph;

describe('util', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo');
    await vGraph.init();
  });

  it('checkNode should return on null id', async () => {
    await util.checkNode({id: null});
  });

  it('checkNode should throw on node not found', async () => {
    try {
      await util.checkNode({vGraph, id: uuidv4, label: 'bogus'});
    } catch (error) {
      expect(error.message).to.equal('Node Not Found');
      return;
    }
    throw new Error('Should have errored');
  });

  it('checkNode should throw on label mismatch', async () => {
    const node = await vGraph.addNode('label');
    const id = await node.getId();
    try {
      await util.checkNode({vGraph, id, label: 'bogus'});
    } catch (error) {
      expect(error.message).to.equal('Node Not Found');
      return;
    }
    throw new Error('Should have errored');
  });

  it('createNode should create node', async () => {
    const node = await util.createNode({vGraph, label: 'label'});
    const label = await node.getLabel();
    expect(label).to.equal('label');
  });

  it('createNode should set properties', async () => {
    const node = await util.createNode({
      vGraph,
      label: 'label',
      properties: {foo: 'bar'},
    });
    const properties = await node.getProperties();
    expect(properties).to.deep.equal({foo: 'bar'});
  });

  it('createNode should filter null/undefined properties', async () => {
    const node = await util.createNode({
      vGraph,
      label: 'label',
      properties: {foo: 'bar', a: null, b: undefined},
    });
    const properties = await node.getProperties();
    expect(properties).to.deep.equal({foo: 'bar'});
  });

  it('ensureAdjacentNode should delete existing node', async () => {
    const node = await vGraph.addNode('label');
    const adjacent = await vGraph.addNode('adjacent');
    const id = await adjacent.getId();
    await vGraph.addEdge('edge', node, adjacent);

    await util.ensureAdjacentNode({
      vGraph,
      node,
      edgeLabel: 'edge',
      direction: Direction.OUT,
      nodeLabel: 'adjacent',
      data: null,
    });
    try {
      await vGraph.getNode(id);
      throw new Error('should have errored');
    } catch (error) {
      expect(error.message).to.equal('Deleted');
    }
  });

  it('ensureAdjacentNode should create new node', async () => {
    const node = await vGraph.addNode('label');

    const adjacent = await util.ensureAdjacentNode({
      vGraph,
      node,
      edgeLabel: 'edge',
      direction: Direction.OUT,
      nodeLabel: 'adjacent',
      data: {foo: 'bar'},
    });
    expect(adjacent).to.not.equal(null);
    const label = await adjacent.getLabel();
    expect(label).to.equal('adjacent');
    const props = await adjacent.getProperties();
    expect(props).to.deep.equal({foo: 'bar'});

    const adjacentNode = await util.getAdjacentNode({
      node,
      label: 'edge',
      direction: Direction.OUT,
    });
    expect(adjacentNode._node).to.not.equal(null);
  });

  it('ensureAdjacentNode should update node', async () => {
    const node = await vGraph.addNode('label');
    const adjacent = await vGraph.addNode('adjacent');
    await adjacent.setProperties({foo: 'not-bar'});
    await vGraph.addEdge('edge', node, adjacent);

    await util.ensureAdjacentNode({
      vGraph,
      node,
      edgeLabel: 'edge',
      direction: Direction.OUT,
      nodeLabel: 'adjacent',
      data: {foo: 'bar'},
    });
    expect(adjacent).to.not.equal(null);
    const label = await adjacent.getLabel();
    expect(label).to.equal('adjacent');
    const props = await adjacent.getProperties();
    expect(props).to.deep.equal({foo: 'bar'});
  });

  it('ensureAdjacentNode should skip null/undefined data', async () => {
    const node = await vGraph.addNode('label');

    const adjacent = await util.ensureAdjacentNode({
      vGraph,
      node,
      edgeLabel: 'edge',
      direction: Direction.IN,
      nodeLabel: 'adjacent',
      data: {foo: 'bar', a: null, b: undefined},
    });
    expect(adjacent).to.not.equal(null);
    const label = await adjacent.getLabel();
    expect(label).to.equal('adjacent');
    const props = await adjacent.getProperties();
    expect(props).to.deep.equal({foo: 'bar'});

    const adjacentNode = await util.getAdjacentNode({
      node,
      label: 'edge',
      direction: Direction.IN,
    });
    expect(adjacentNode._node).to.not.equal(null);
  });

  it('ensureEdge should throw if id does not exist', async () => {
    try {
      await util.ensureEdge({
        vGraph,
        node: null,
        edgeLabel: 'edge',
        direction: Direction.OUT,
        id: uuidv4,
        nodeLabel: 'node',
      });
    } catch (error) {
      expect(error.message).to.equal('Node Not Found');
      return;
    }
    throw new Error('Should have errored');
  });

  it('ensureEdge should throw on label mismatch', async () => {
    const node = await vGraph.addNode('label');
    const id = await node.getId();
    try {
      await util.ensureEdge({
        vGraph,
        node: null,
        edgeLabel: 'edge',
        direction: Direction.OUT,
        id,
        nodeLabel: 'node',
      });
    } catch (error) {
      expect(error.message).to.equal('Node Not Found');
      return;
    }
    throw new Error('Should have errored');
  });

  it('ensureEdge should add outgoing edge when none exists', async () => {
    const node = await vGraph.addNode('source');
    const dest = await vGraph.addNode('dest');
    const id = await dest.getId();

    const ret = await util.ensureEdge({
      vGraph,
      node,
      edgeLabel: 'edge',
      direction: Direction.OUT,
      id,
      nodeLabel: 'dest',
    });

    const retId = await ret.getId();
    expect(retId).to.equal(id);

    const adjacentNode = await util.getAdjacentNode({
      node,
      label: 'edge',
      direction: Direction.OUT,
    });
    const adjacentNodeId = await adjacentNode._node.getId();
    expect(adjacentNodeId).to.equal(id);
  });

  it('ensureEdge should add incoming edge when none exists', async () => {
    const node = await vGraph.addNode('source');
    const dest = await vGraph.addNode('dest');
    const id = await dest.getId();

    const ret = await util.ensureEdge({
      vGraph,
      node,
      edgeLabel: 'edge',
      direction: Direction.IN,
      id,
      nodeLabel: 'dest',
    });
    const retId = await ret.getId();
    expect(retId).to.equal(id);

    const adjacentNode = await util.getAdjacentNode({
      node,
      label: 'edge',
      direction: Direction.IN,
    });
    const adjacentNodeId = await adjacentNode._node.getId();
    expect(adjacentNodeId).to.equal(id);
  });

  it('ensureEdge should replace existing edge', async () => {
    const node = await vGraph.addNode('source');
    const dest = await vGraph.addNode('dest');
    const id = await dest.getId();
    const other = await vGraph.addNode('dest');
    await vGraph.addEdge('edge', node, other);

    const ret = await util.ensureEdge({
      vGraph,
      node,
      edgeLabel: 'edge',
      direction: Direction.OUT,
      id,
      nodeLabel: 'dest',
    });
    const retId = await ret.getId();
    expect(retId).to.equal(id);

    const adjacentNode = await util.getAdjacentNode({
      node,
      label: 'edge',
      direction: Direction.OUT,
    });
    const adjacentNodeId = await adjacentNode._node.getId();
    expect(adjacentNodeId).to.equal(id);
  });

  it('ensureEdge should leave existing edge', async () => {
    const node = await vGraph.addNode('source');
    const dest = await vGraph.addNode('dest');
    const id = await dest.getId();
    const edge = await vGraph.addEdge('edge', dest, node);
    const edgeId = await edge.getId();

    const ret = await util.ensureEdge({
      vGraph,
      node,
      edgeLabel: 'edge',
      direction: Direction.IN,
      id,
      nodeLabel: 'dest',
    });
    const retId = await ret.getId();
    expect(retId).to.equal(id);

    let count = 0;
    for (const e of node.getEdges(Direction.IN, 'edge')) {
      count++;
      const eId = await e.getId();
      expect(eId).to.equal(edgeId);
    }
    expect(count).to.equal(1);
  });

  it('ensureEdge should remove edge', async () => {
    const node = await vGraph.addNode('source');
    const dest = await vGraph.addNode('dest');
    await vGraph.addEdge('edge', node, dest);

    const ret = await util.ensureEdge({
      vGraph,
      node,
      edgeLabel: 'edge',
      direction: Direction.OUT,
      id: null,
      nodeLabel: 'dest',
    });
    expect(ret).to.equal(null);

    const adjacentNode = await util.getAdjacentNode({
      node,
      label: 'edge',
      direction: Direction.OUT,
    });
    expect(adjacentNode).to.equal(null);
  });

  it('ensureNode should throw on missing node', async () => {
    try {
      await util.ensureNode({
        vGraph,
        id: uuidv4,
        label: 'bogus',
        properties: {},
      });
    } catch (error) {
      expect(error.message).to.equal('Node Not Found');
      return;
    }
    throw new Error('Should have errored');
  });

  it('ensureNode should throw label mismatch', async () => {
    const node = await vGraph.addNode('label');
    const id = await node.getId();
    try {
      await util.ensureNode({
        vGraph,
        id,
        label: 'bogus',
        properties: {},
      });
    } catch (error) {
      expect(error.message).to.equal('Node Not Found');
      return;
    }
    throw new Error('Should have errored');
  });

  it('ensureNode should setProperties', async () => {
    const node = await vGraph.addNode('label');
    const id = await node.getId();

    const ret = await util.ensureNode({
      vGraph,
      id,
      label: 'label',
      properties: {foo: 'bar'},
    });
    const retId = await ret.getId();
    expect(retId).to.equal(id);
    const props = await node.getProperties();
    expect(props).to.deep.equal({foo: 'bar'});
  });

  it('ensureNode should skip null/undefined properties', async () => {
    const node = await vGraph.addNode('label');
    const id = await node.getId();

    const ret = await util.ensureNode({
      vGraph,
      id,
      label: 'label',
      properties: {foo: 'bar', t: null, e: undefined},
    });
    const retId = await ret.getId();
    expect(retId).to.equal(id);
    const props = await node.getProperties();
    expect(props).to.deep.equal({foo: 'bar'});
  });

  it('getAdjacentNode should return adjacent node', async () => {
    const n1 = await vGraph.addNode('label');
    const n2 = await vGraph.addNode('label');
    const n2Id = await n2.getId();
    await n1.addEdge('edge', n2);

    const node = await util.getAdjacentNode({
      node: n1,
      label: 'edge',
      direction: Direction.OUT,
    });

    expect(node).to.not.equal(null);
    expect(node).to.have.all.keys('_node');
    const nodeId = await node._node.getId();
    expect(nodeId).to.equal(n2Id);
  });

  it('getAdjacentNode should return null on label mismatch', async () => {
    const n1 = await vGraph.addNode('label');
    const n2 = await vGraph.addNode('label');
    await n1.addEdge('edge', n2);

    const node = await util.getAdjacentNode({
      node: n1,
      label: 'nope',
      direction: Direction.OUT,
    });

    expect(node).to.equal(null);
  });

  it('getAdjacentNode should return null on no adjacent node', async () => {
    const n1 = await vGraph.addNode('label');

    const node = await util.getAdjacentNode({
      node: n1,
      label: 'nope',
      direction: Direction.OUT,
    });

    expect(node).to.equal(null);
  });

  it('getAdjacentNodes should return adjacent node', async () => {
    const node = await vGraph.addNode('label');
    const n1 = await vGraph.addNode('label');
    const n1Id = await n1.getId();
    await node.addEdge('edge', n1);
    const n2 = await vGraph.addNode('label');
    const n2Id = await n2.getId();
    await node.addEdge('edge', n2);

    const nodes = await util.getAdjacentNodes({
      node,
      label: 'edge',
      direction: Direction.OUT,
    });

    expect(nodes).to.not.equal(null);
    expect(Array.isArray(nodes)).to.equal(true);
    expect(nodes.length).to.equal(2);
    const id1 = await nodes[0]._node.getId();
    const id2 = await nodes[1]._node.getId();
    expect([id1, id2].sort()).to.deep.equal([n1Id, n2Id].sort());
  });

  it('getAdjacentNodes should empty array', async () => {
    const node = await vGraph.addNode('label');

    const nodes = await util.getAdjacentNodes({
      node,
      label: 'nope',
      direction: Direction.OUT,
    });

    expect(nodes).to.not.equal(null);
    expect(Array.isArray(nodes)).to.equal(true);
    expect(nodes.length).to.equal(0);
  });

  it('getNode should return the node', async () => {
    const n = await vGraph.addNode('label');
    const id = await n.getId();
    const node = await util.getNode({vGraph, id, label: 'label'});
    expect(node).to.have.all.keys('_node', 'id');
    expect(node._node).to.be.instanceOf(Node);
    expect(node.id).to.equal(id);
  });

  it('getNode should throw error when node not found', async () => {
    try {
      await util.getNode({vGraph, id: uuidv4, label: 'label'});
    } catch (error) {
      expect(error.message).to.equal('Node Not Found');
      return;
    }
    throw new Error('Should have errored');
  });

  it('getNode should throw error when label incorrect', async () => {
    const node = await vGraph.addNode('label');
    const id = await node.getId();
    try {
      await util.getNode({vGraph, id, label: 'bogus'});
    } catch (error) {
      expect(error.message).to.equal('Node Not Found');
      return;
    }
    throw new Error('Should have errored');
  });
});
