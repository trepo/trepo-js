const {expect} = require('chai');
const func = require('./getDate.js');
const {VGraph} = require('@trepo/vgraph');
const Label = require('../label.js');
const db = require('memdown');
let vGraph;

describe('birth - getDate', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo', {db});
    await vGraph.init();
  });

  it('should get date', async () => {
    const node = await vGraph.addNode(Label.BIRTH);
    const date = await vGraph.addNode(Label.DATE);
    const dateId = await date.getId();
    await vGraph.addEdge(Label.BIRTH_DATE, node, date);

    const ret = await func({vGraph, input: {node}});
    const retId = await ret._node.getId();
    expect(retId).to.equal(dateId);
  });
});
