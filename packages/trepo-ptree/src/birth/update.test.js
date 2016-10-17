const {expect} = require('chai');
const func = require('./update.js');
const {VGraph, Direction, Util} = require('trepo-vgraph');
const Label = require('../label.js');
const util = require('../util.js');
const uuidv4 = Util.generateUUIDv4();
let vGraph;

describe('birth - update', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo');
    await vGraph.init();
  });

  it('should error on person not found', async () => {
    try {
      await func({vGraph, input: {child: uuidv4}});
    } catch (error) {
      expect(error.message).to.equal('Node Not Found');
      return;
    }
    throw new Error('Should have errored');
  });

  it('should update node', async () => {
    const node = await vGraph.addNode(Label.BIRTH);
    const id = await node.getId();
    const obj = await func({vGraph, input: {id, date: null, place: null}});
    expect(obj).to.have.all.keys('_node', 'father', 'mother', 'child',
      'date', 'place');
    expect(obj.father).to.equal(null);
    expect(obj.mother).to.equal(null);
    expect(obj.child).to.equal(null);
    expect(obj.date).to.equal(null);
    expect(obj.place).to.equal(null);
    const label = await obj._node.getLabel();
    const properties = await obj._node.getProperties();
    expect(label).to.equal(Label.BIRTH);
    expect(properties).to.deep.equal({});
  });

  it('should ensure/link to everything', async () => {
    const node = await vGraph.addNode(Label.BIRTH);
    const id = await node.getId();
    const fatherNode = await vGraph.addNode(Label.PERSON);
    const father = await fatherNode.getId();
    const motherNode = await vGraph.addNode(Label.PERSON);
    const mother = await motherNode.getId();
    const childNode = await vGraph.addNode(Label.PERSON);
    const child = await childNode.getId();
    const obj = await func({vGraph, input: {
      id,
      father,
      mother,
      child,
      date: {original: 'my date'},
      place: {name: 'my place'},
    }});
    expect(obj).to.have.all.keys('_node', 'father', 'mother', 'child',
      'date', 'place');

    let fatherId = await obj.father._node.getId();
    expect(fatherId).to.equal(father);
    const adjacentFatherNode = await util.getAdjacentNode({
      node: obj._node,
      label: Label.BIRTH_FATHER,
      direction: Direction.IN,
    });
    fatherId = await adjacentFatherNode._node.getId();
    expect(fatherId).to.equal(father);

    let motherId = await obj.mother._node.getId();
    expect(motherId).to.equal(mother);
    const adjacentMotherNode = await util.getAdjacentNode({
      node: obj._node,
      label: Label.BIRTH_MOTHER,
      direction: Direction.IN,
    });
    motherId = await adjacentMotherNode._node.getId();
    expect(motherId).to.equal(mother);

    let childId = await obj.child._node.getId();
    expect(childId).to.equal(child);
    const adjacentChildNode = await util.getAdjacentNode({
      node: obj._node,
      label: Label.BIRTH_CHILD,
      direction: Direction.IN,
    });
    childId = await adjacentChildNode._node.getId();
    expect(childId).to.equal(child);

    const adjacentDateNode = await util.getAdjacentNode({
      node: obj._node,
      label: Label.BIRTH_DATE,
      direction: Direction.OUT,
    });
    const dateProps = await adjacentDateNode._node.getProperties();
    expect(dateProps).to.deep.equal({original: 'my date'});

    const adjacentPlaceNode = await util.getAdjacentNode({
      node: obj._node,
      label: Label.BIRTH_PLACE,
      direction: Direction.OUT,
    });
    const placeProps = await adjacentPlaceNode._node.getProperties();
    expect(placeProps).to.deep.equal({name: 'my place'});
  });
});
