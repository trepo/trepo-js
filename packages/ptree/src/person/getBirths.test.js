const {expect} = require('chai');
const func = require('./getBirths.js');
const {VGraph} = require('@trepo/vgraph');
const Label = require('../label.js');
const db = require('memdown');
let vGraph;

describe('person - getBirth', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo', {db});
    await vGraph.init();
  });

  it('should get adjacent node', async () => {
    const person = await vGraph.addNode(Label.PERSON);
    const childBirth = await vGraph.addNode(Label.BIRTH);
    const childBirthId = await childBirth.getId();
    const motherBirth = await vGraph.addNode(Label.BIRTH);
    const motherBirthId = await motherBirth.getId();
    const fatherBirth = await vGraph.addNode(Label.BIRTH);
    const fatherBirthId = await fatherBirth.getId();
    await vGraph.addEdge(Label.BIRTH_CHILD, person, childBirth);
    await vGraph.addEdge(Label.BIRTH_MOTHER, person, motherBirth);
    await vGraph.addEdge(Label.BIRTH_FATHER, person, fatherBirth);

    const ret = await func({vGraph, input: {node: person}});
    expect(ret.length).to.equal(3);
    for (var node of ret) {
      const retId = await node._node.getId();
      expect([childBirthId, motherBirthId, fatherBirthId]).to.include(retId);
    }
  });
});
