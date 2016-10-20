const {expect} = require('chai');
const func = require('./getDate.js');
const {VGraph} = require('trepo-vgraph');
const Label = require('../label.js');
let vGraph;

describe('marriage - getDate', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo');
    await vGraph.init();
  });

  it('should get date', async () => {
    const node = await vGraph.addNode(Label.MARRIAGE);
    const date = await vGraph.addNode(Label.DATE);
    const dateId = await date.getId();
    await vGraph.addEdge(Label.MARRIAGE_DATE, node, date);

    const ret = await func({vGraph, input: {node}});
    const retId = await ret._node.getId();
    expect(retId).to.equal(dateId);
  });
});
