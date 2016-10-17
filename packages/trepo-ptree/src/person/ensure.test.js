const {expect} = require('chai');
const func = require('./ensure.js');
const util = require('../util.js');
const Label = require('../label.js');
const {VGraph, Direction} = require('trepo-vgraph');

let vGraph;

describe('date - ensure', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo');
    await vGraph.init();
  });

  it('should ensure a place', async () => {
    const node = await vGraph.addNode('label');
    const person = await vGraph.addNode(Label.PERSON);
    const id = await person.getId();
    const place = await func({
      vGraph,
      node,
      label: 'edge',
      id,
    });
    expect(place._node).to.not.equal(null);
    const personNode = await util.getAdjacentNode({
      node,
      label: 'edge',
      direction: Direction.IN,
    });
    expect(personNode).to.not.equal(null);
    expect(personNode._node).to.not.equal(undefined);
  });
});
