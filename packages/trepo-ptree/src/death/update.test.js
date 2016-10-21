const {expect} = require('chai');
const func = require('./update.js');
const {VGraph, Direction, Util} = require('trepo-vgraph');
const Label = require('../label.js');
const util = require('../util.js');
const uuidv4 = Util.generateUUIDv4();
let vGraph;

describe('death - update', () => {
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

  it('should update node', async () => {
    const node = await vGraph.addNode(Label.DEATH);
    const id = await node.getId();
    const obj = await func({vGraph, input: {id, date: null, place: null}});
    expect(obj).to.have.all.keys('_node', 'person', 'date', 'place');
    expect(obj.person).to.equal(null);
    expect(obj.date).to.equal(null);
    expect(obj.place).to.equal(null);
    const label = await obj._node.getLabel();
    const properties = await obj._node.getProperties();
    expect(label).to.equal(Label.DEATH);
    expect(properties).to.deep.equal({});
  });

  it('should ensure/link to everything', async () => {
    const node = await vGraph.addNode(Label.DEATH);
    const id = await node.getId();
    const personNode = await vGraph.addNode(Label.PERSON);
    const person = await personNode.getId();
    const obj = await func({vGraph, input: {
      id,
      person,
      date: {original: 'my date'},
      place: {name: 'my place'},
    }});
    expect(obj).to.have.all.keys('_node', 'person', 'date', 'place');

    let personId = await obj.person._node.getId();
    expect(personId).to.equal(person);
    const adjacentPersonNode = await util.getAdjacentNode({
      node: obj._node,
      label: Label.DEATH_PERSON,
      direction: Direction.IN,
    });
    personId = await adjacentPersonNode._node.getId();
    expect(personId).to.equal(person);

    const adjacentDateNode = await util.getAdjacentNode({
      node: obj._node,
      label: Label.DEATH_DATE,
      direction: Direction.OUT,
    });
    const dateProps = await adjacentDateNode._node.getProperties();
    expect(dateProps).to.deep.equal({original: 'my date'});

    const adjacentPlaceNode = await util.getAdjacentNode({
      node: obj._node,
      label: Label.DEATH_PLACE,
      direction: Direction.OUT,
    });
    const placeProps = await adjacentPlaceNode._node.getProperties();
    expect(placeProps).to.deep.equal({name: 'my place'});
  });
});
