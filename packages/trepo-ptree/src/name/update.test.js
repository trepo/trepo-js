const {expect} = require('chai');
const func = require('./update.js');
const {VGraph, Direction} = require('trepo-vgraph');
const Label = require('../label.js');
const Prop = require('../prop.js');
const util = require('../util.js');
let vGraph;

describe('name - update', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo');
    await vGraph.init();
  });

  it('should update name', async () => {
    const node = await vGraph.addNode(Label.NAME);
    const id = await node.getId();

    const obj = await func({vGraph, input: {id, name: 'name'}});
    expect(obj).to.have.all.keys('_node', 'person');
    expect(obj.person).to.equal(null);
    const label = await obj._node.getLabel();
    const properties = await obj._node.getProperties();
    expect(label).to.equal(Label.NAME);
    expect(properties).to.deep.equal({
      [Prop.NAME_NAME]: 'name',
    });
  });

  it('should associate person', async () => {
    const node = await vGraph.addNode(Label.NAME);
    const id = await node.getId();
    const person = await vGraph.addNode(Label.PERSON);
    const personId = await person.getId();

    const obj = await func({
      vGraph,
      input: {id, name: 'name', person: personId},
    });
    const retId = await obj.person.getId();
    expect(retId).to.equal(personId);
    const adjacentNode = await util.getAdjacentNode({
      node: obj._node,
      label: Label.NAME_PERSON,
      direction: Direction.IN,
    });
    const adjacentNodeId = await adjacentNode.getId();
    expect(adjacentNodeId).to.equal(personId);
  });
});
