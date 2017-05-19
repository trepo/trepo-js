const {expect} = require('chai');
const func = require('./delete.js');
const {VGraph, Direction} = require('@trepo/vgraph');
const Label = require('../label.js');
const util = require('../util.js');
const db = require('memdown');
let vGraph;

describe('death - delete', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo', {db});
    await vGraph.init();
  });

  it('should cleanup everything', async () => {
    const node = await vGraph.addNode(Label.DEATH);
    const id = await node.getId();
    const personNode = await vGraph.addNode(Label.PERSON);
    await vGraph.addEdge(Label.DEATH_PERSON, personNode, node);
    const dateNode = await vGraph.addNode(Label.DATE);
    const date = await dateNode.getId();
    await vGraph.addEdge(Label.DEATH_DATE, node, dateNode);
    const placeNode = await vGraph.addNode(Label.DATE);
    const place = await placeNode.getId();
    await vGraph.addEdge(Label.DEATH_PLACE, node, placeNode);

    await func({vGraph, input: {id}});

    const adjacentPersonNode = await util.getAdjacentNode({
      node,
      label: Label.DEATH_PERSON,
      direction: Direction.IN,
    });
    expect(adjacentPersonNode).to.equal(null);

    try {
      await vGraph.getNode(date);
      throw new Error('should have errored');
    } catch (error) {
      expect(error.message).to.equal('Deleted');
    }

    try {
      await vGraph.getNode(place);
      throw new Error('should have errored');
    } catch (error) {
      expect(error.message).to.equal('Deleted');
    }

    try {
      await vGraph.getNode(id);
      throw new Error('should have errored');
    } catch (error) {
      expect(error.message).to.equal('Deleted');
    }
  });
});
