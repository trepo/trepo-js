const {expect} = require('chai');
const func = require('./delete.js');
const {VGraph, Direction} = require('trepo-vgraph');
const Label = require('../label.js');
const util = require('../util.js');
const db = require('memdown');
let vGraph;

describe('marriage - delete', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo', {db});
    await vGraph.init();
  });

  it('should cleanup everything', async () => {
    const node = await vGraph.addNode(Label.MARRIAGE);
    const id = await node.getId();
    const spouse1Node = await vGraph.addNode(Label.PERSON);
    await vGraph.addEdge(Label.MARRIAGE_SPOUSE, spouse1Node, node);
    const spouse2Node = await vGraph.addNode(Label.PERSON);
    await vGraph.addEdge(Label.MARRIAGE_SPOUSE, spouse2Node, node);
    const dateNode = await vGraph.addNode(Label.DATE);
    const date = await dateNode.getId();
    await vGraph.addEdge(Label.MARRIAGE_DATE, node, dateNode);
    const placeNode = await vGraph.addNode(Label.DATE);
    const place = await placeNode.getId();
    await vGraph.addEdge(Label.MARRIAGE_PLACE, node, placeNode);

    await func({vGraph, input: {id}});

    const adjacentSpouseNodes = await util.getAdjacentNodes({
      node,
      label: Label.MARRIAGE_SPOUSE,
      direction: Direction.IN,
    });
    expect(adjacentSpouseNodes.length).to.equal(0);

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
