const {expect} = require('chai');
const func = require('./delete.js');
const {VGraph, Direction} = require('trepo-vgraph');
const Label = require('../label.js');
const util = require('../util.js');
let vGraph;

describe('birth - delete', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo');
    await vGraph.init();
  });

  it('should cleanup everything', async () => {
    const node = await vGraph.addNode(Label.BIRTH);
    const id = await node.getId();
    const fatherNode = await vGraph.addNode(Label.PERSON);
    await vGraph.addEdge(Label.BIRTH_FATHER, fatherNode, node);
    const motherNode = await vGraph.addNode(Label.PERSON);
    await vGraph.addEdge(Label.BIRTH_MOTHER, motherNode, node);
    const childNode = await vGraph.addNode(Label.PERSON);
    await vGraph.addEdge(Label.BIRTH_CHILD, childNode, node);
    const dateNode = await vGraph.addNode(Label.DATE);
    const date = await dateNode.getId();
    await vGraph.addEdge(Label.BIRTH_DATE, node, dateNode);
    const placeNode = await vGraph.addNode(Label.DATE);
    const place = await placeNode.getId();
    await vGraph.addEdge(Label.BIRTH_PLACE, node, placeNode);

    await func({vGraph, input: {id}});

    const adjacentFatherNode = await util.getAdjacentNode({
      node,
      label: Label.BIRTH_FATHER,
      direction: Direction.IN,
    });
    expect(adjacentFatherNode).to.equal(null);

    const adjacentMotherNode = await util.getAdjacentNode({
      node,
      label: Label.BIRTH_FATHER,
      direction: Direction.IN,
    });
    expect(adjacentMotherNode).to.equal(null);

    const adjacentChildNode = await util.getAdjacentNode({
      node,
      label: Label.BIRTH_FATHER,
      direction: Direction.IN,
    });
    expect(adjacentChildNode).to.equal(null);

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
