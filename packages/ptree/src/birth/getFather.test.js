const {expect} = require('chai');
const func = require('./getFather.js');
const {VGraph} = require('@trepo/vgraph');
const Label = require('../label.js');
const db = require('memdown');
let vGraph;

describe('birth - getFather', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo', {db});
    await vGraph.init();
  });

  it('should get person', async () => {
    const node = await vGraph.addNode(Label.BIRTH);
    const person = await vGraph.addNode(Label.PERSON);
    const personId = await person.getId();
    await vGraph.addEdge(Label.BIRTH_FATHER, person, node);

    const ret = await func({vGraph, input: {node}});
    const retId = await ret._node.getId();
    expect(retId).to.equal(personId);
  });
});
