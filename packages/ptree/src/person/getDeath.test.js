const {expect} = require('chai');
const func = require('./getDeath.js');
const {VGraph} = require('@trepo/vgraph');
const Label = require('../label.js');
const db = require('memdown');
let vGraph;

describe('person - getDeath', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo', {db});
    await vGraph.init();
  });

  it('should get adjacent node', async () => {
    const person = await vGraph.addNode(Label.PERSON);
    const node = await vGraph.addNode(Label.DEATH);
    const id = await node.getId();
    await vGraph.addEdge(Label.DEATH_PERSON, person, node);

    const ret = await func({vGraph, input: {node: person}});
    const retId = await ret._node.getId();
    expect(retId).to.equal(id);
  });
});
