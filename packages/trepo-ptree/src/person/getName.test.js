const {expect} = require('chai');
const func = require('./getName.js');
const {VGraph} = require('trepo-vgraph');
const Label = require('../label.js');
let vGraph;

describe('name - getPerson', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo');
    await vGraph.init();
  });

  it('should get adjacent person', async () => {
    const name = await vGraph.addNode(Label.NAME);
    const nameId = await name.getId();
    const person = await vGraph.addNode(Label.PERSON);
    await vGraph.addEdge(Label.NAME_PERSON, person, name);

    const ret = await func({vGraph, input: {node: person}});
    const retId = await ret._node.getId();
    expect(retId).to.equal(nameId);
  });
});
