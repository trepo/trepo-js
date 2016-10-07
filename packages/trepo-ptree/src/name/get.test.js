const {expect} = require('chai');
const func = require('./get.js');
const {VGraph} = require('trepo-vgraph');
const Label = require('../label.js');
let vGraph;

describe('name - get', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo');
    await vGraph.init();
  });

  it('should get name', async () => {
    const node = await vGraph.addNode(Label.NAME);
    const id = await node.getId();

    const ret = await func({vGraph, input: {id}});
    expect(ret).to.have.all.keys('_node', '_id', '_label');
    expect(ret._id).to.equal(id);
  });
});
