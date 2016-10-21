const {expect} = require('chai');
const func = require('./getPlace.js');
const {VGraph} = require('trepo-vgraph');
const Label = require('../label.js');
let vGraph;

describe('death - getDate', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo');
    await vGraph.init();
  });

  it('should get place', async () => {
    const node = await vGraph.addNode(Label.DEATH);
    const date = await vGraph.addNode(Label.PLACE);
    const dateId = await date.getId();
    await vGraph.addEdge(Label.DEATH_PLACE, node, date);

    const ret = await func({vGraph, input: {node}});
    const retId = await ret._node.getId();
    expect(retId).to.equal(dateId);
  });
});
