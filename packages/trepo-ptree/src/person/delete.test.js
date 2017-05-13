const {expect} = require('chai');
const func = require('./delete.js');
const {VGraph} = require('trepo-vgraph');
const Label = require('../label.js');
const db = require('memdown');
let vGraph;

describe('person - delete', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo', {db});
    await vGraph.init();
  });

  it('should cleanup everything', async () => {
    const node = await vGraph.addNode(Label.PERSON);
    const id = await node.getId();
    const nameNode = await vGraph.addNode(Label.NAME);
    const name = await nameNode.getId();
    await vGraph.addEdge(Label.NAME_PERSON, node, nameNode);
    const deathNode = await vGraph.addNode(Label.DEATH);
    await vGraph.addEdge(Label.DEATH_PERSON, node, deathNode);
    const death = await deathNode.getId();

    await func({vGraph, input: {id}});

    try {
      await vGraph.getNode(name);
      throw new Error('should have errored');
    } catch (error) {
      expect(error.message).to.equal('Deleted');
    }

    try {
      await vGraph.getNode(death);
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
