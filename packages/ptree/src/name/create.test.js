const {expect} = require('chai');
const func = require('./create.js');
const {VGraph, Direction, Util} = require('@trepo/vgraph');
const Label = require('../label.js');
const Prop = require('../prop.js');
const util = require('../util.js');
const db = require('memdown');
const uuidv4 = Util.generateUUIDv4();
let vGraph;

describe('name - create', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo', {db});
    await vGraph.init();
  });

  it('should error on person not found', async () => {
    try {
      await func({vGraph, input: {person: uuidv4}});
    } catch (error) {
      expect(error.message).to.equal('Node Not Found');
      return;
    }
    throw new Error('Should have errored');
  });

  it('should create name', async () => {
    const obj = await func({vGraph, input: {name: 'name'}});
    expect(obj).to.have.all.keys('_node', 'name', 'person');
    expect(obj.name).to.equal('name');
    expect(obj.person).to.equal(null);
    const label = await obj._node.getLabel();
    const properties = await obj._node.getProperties();
    expect(label).to.equal(Label.NAME);
    expect(properties).to.deep.equal({
      [Prop.NAME_NAME]: 'name',
    });
  });

  it('should link to person', async () => {
    const node = await vGraph.addNode(Label.PERSON);
    const id = await node.getId();
    const obj = await func({vGraph, input: {name: 'name', person: id}});
    expect(obj.person).to.have.all.keys('_node');
    const personId = await obj.person._node.getId();
    expect(personId).to.equal(id);
    const adjacentNode = await util.getAdjacentNode({
      node: obj._node,
      label: Label.NAME_PERSON,
      direction: Direction.IN,
    });
    const adjacentNodeId = await adjacentNode._node.getId();
    expect(adjacentNodeId).to.equal(id);
  });
});
