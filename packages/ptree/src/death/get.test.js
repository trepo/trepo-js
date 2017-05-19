const {expect} = require('chai');
const func = require('./get.js');
const {VGraph} = require('@trepo/vgraph');
const Label = require('../label.js');
const db = require('memdown');
let vGraph;

describe('death - get', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo', {db});
    await vGraph.init();
  });

  it('should get node', async () => {
    const node = await vGraph.addNode(Label.DEATH);
    const id = await node.getId();

    const ret = await func({vGraph, input: {id}});
    expect(ret).to.have.all.keys('_node', 'id');
    expect(ret.id).to.equal(id);
  });
});
