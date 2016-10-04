const {expect} = require('chai');
const {VGraph, Util, Node} = require('trepo-vgraph');
const util = require('./util.js');
const uuidv4 = Util.generateUUIDv4();
let vGraph;

describe('util', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo');
    await vGraph.init();
  });

  it('getNode should return the node', async () => {
    const n = await vGraph.addNode('label');
    const id = await n.getId();
    const node = await util.getNode({vGraph, id, label: 'label'});
    expect(node).to.have.all.keys('_node', 'id', 'label');
    expect(node._node).to.be.instanceOf(Node);
    expect(node.id).to.equal(id);
    expect(node.label).to.equal('label');
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
