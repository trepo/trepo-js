const {expect} = require('chai');
const func = require('./getSpouses.js');
const {VGraph} = require('@trepo/vgraph');
const Label = require('../label.js');
const db = require('memdown');
let vGraph;

describe('marriage - getPlace', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo', {db});
    await vGraph.init();
  });

  it('should get spouses', async () => {
    const node = await vGraph.addNode(Label.MARRIAGE);
    const person = await vGraph.addNode(Label.PERSON);
    const personId = await person.getId();
    await vGraph.addEdge(Label.MARRIAGE_SPOUSE, person, node);

    const ret = await func({vGraph, input: {node}});
    expect(Array.isArray(ret)).to.equal(true);
    expect(ret.length).to.equal(1);
    const retId = await ret[0]._node.getId();
    expect(retId).to.equal(personId);
  });
});
