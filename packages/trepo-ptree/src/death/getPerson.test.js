const {expect} = require('chai');
const func = require('./getPerson.js');
const {VGraph} = require('trepo-vgraph');
const Label = require('../label.js');
const db = require('memdown');
let vGraph;

describe('death - getPerson', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo', {db});
    await vGraph.init();
  });

  it('should get adjacent person', async () => {
    const node = await vGraph.addNode(Label.DEATH);
    const person = await vGraph.addNode(Label.PERSON);
    const personId = await person.getId();
    await vGraph.addEdge(Label.DEATH_PERSON, person, node);

    const ret = await func({vGraph, input: {node}});
    const retId = await ret._node.getId();
    expect(retId).to.equal(personId);
  });
});
