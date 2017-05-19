const {expect} = require('chai');
const func = require('./getMarriages.js');
const {VGraph} = require('@trepo/vgraph');
const Label = require('../label.js');
const db = require('memdown');
let vGraph;

describe('person - getMarriages', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo', {db});
    await vGraph.init();
  });

  it('should get adjacent node', async () => {
    const person = await vGraph.addNode(Label.PERSON);
    const node = await vGraph.addNode(Label.MARRIAGE);
    const id = await node.getId();
    await vGraph.addEdge(Label.MARRIAGE_SPOUSE, person, node);

    const ret = await func({vGraph, input: {node: person}});
    expect(Array.isArray(ret)).to.equal(true);
    expect(ret.length).to.equal(1);
    const retId = await ret[0]._node.getId();
    expect(retId).to.equal(id);
  });
});
