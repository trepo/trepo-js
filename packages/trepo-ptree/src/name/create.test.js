const {expect} = require('chai');
const func = require('./create.js');
const {VGraph, Direction, Util} = require('trepo-vgraph');
const Label = require('../label.js');
const Prop = require('../prop.js');
const util = require('../util.js');
const uuidv4 = Util.generateUUIDv4();
let vGraph;

describe('name - create', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo');
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
    expect(obj).to.have.all.keys('_node', 'person');
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
    const personId = await obj.person.getId();
    expect(personId).to.equal(id);
    const adjacentNode = await util.getAdjacentNode({
      node: obj._node,
      label: Label.NAME_PERSON,
      direction: Direction.IN,
    });
    const adjacentNodeId = await adjacentNode.getId();
    expect(adjacentNodeId).to.equal(id);
  });
});
