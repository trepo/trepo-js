const {expect} = require('chai');
const func = require('./update.js');
const {VGraph, Direction, Util} = require('trepo-vgraph');
const Label = require('../label.js');
const util = require('../util.js');
const uuidv4 = Util.generateUUIDv4();
let vGraph;

describe('marriage - update', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo');
    await vGraph.init();
  });

  it('should error on person not found', async () => {
    try {
      await func({vGraph, input: {spouses: [uuidv4]}});
    } catch (error) {
      expect(error.message).to.equal('Node Not Found');
      return;
    }
    throw new Error('Should have errored');
  });

  it('should update node', async () => {
    const node = await vGraph.addNode(Label.MARRIAGE);
    const id = await node.getId();
    const obj = await func({vGraph, input: {id, date: null, place: null}});
    expect(obj).to.have.all.keys('_node', 'spouses', 'date', 'place');
    expect(obj.spouses).to.deep.equal([]);
    expect(obj.date).to.equal(null);
    expect(obj.place).to.equal(null);
    const label = await obj._node.getLabel();
    const properties = await obj._node.getProperties();
    expect(label).to.equal(Label.MARRIAGE);
    expect(properties).to.deep.equal({});
  });

  it('should ensure/link to everything', async () => {
    const node = await vGraph.addNode(Label.MARRIAGE);
    const id = await node.getId();
    const spouse1Node = await vGraph.addNode(Label.PERSON);
    const spouse1 = await spouse1Node.getId();
    const spouse2Node = await vGraph.addNode(Label.PERSON);
    const spouse2 = await spouse2Node.getId();
    const obj = await func({vGraph, input: {
      id,
      spouses: [spouse1, spouse2],
      date: {original: 'my date'},
      place: {name: 'my place'},
    }});
    expect(obj).to.have.all.keys('_node', 'spouses', 'date', 'place');

    let spouse1Id = await obj.spouses[0]._node.getId();
    let spouse2Id = await obj.spouses[1]._node.getId();
    expect([spouse1Id, spouse2Id].sort())
      .to.deep.equal([spouse1, spouse2].sort());

    const adjacentSpouseNodes = await util.getAdjacentNodes({
      node: obj._node,
      label: Label.MARRIAGE_SPOUSE,
      direction: Direction.IN,
    });
    spouse1Id = await adjacentSpouseNodes[0]._node.getId();
    spouse2Id = await adjacentSpouseNodes[1]._node.getId();
    expect([spouse1Id, spouse2Id].sort())
      .to.deep.equal([spouse1, spouse2].sort());

    const adjacentDateNode = await util.getAdjacentNode({
      node: obj._node,
      label: Label.MARRIAGE_DATE,
      direction: Direction.OUT,
    });
    const dateProps = await adjacentDateNode._node.getProperties();
    expect(dateProps).to.deep.equal({original: 'my date'});

    const adjacentPlaceNode = await util.getAdjacentNode({
      node: obj._node,
      label: Label.MARRIAGE_PLACE,
      direction: Direction.OUT,
    });
    const placeProps = await adjacentPlaceNode._node.getProperties();
    expect(placeProps).to.deep.equal({name: 'my place'});
  });

  it('should update without dropping edges', async () => {
    const node = await vGraph.addNode(Label.MARRIAGE);
    const id = await node.getId();
    const spouse1Node = await vGraph.addNode(Label.PERSON);
    const spouse1 = await spouse1Node.getId();
    await vGraph.addEdge(Label.MARRIAGE_SPOUSE, spouse1Node, node);
    const spouse2Node = await vGraph.addNode(Label.PERSON);
    const spouse2 = await spouse2Node.getId();
    await vGraph.addEdge(Label.MARRIAGE_SPOUSE, spouse2Node, node);
    const obj = await func({vGraph, input: {
      id,
      spouses: [spouse1, spouse2],
      date: {original: 'my date'},
      place: {name: 'my place'},
    }});
    expect(obj).to.have.all.keys('_node', 'spouses', 'date', 'place');

    let spouse1Id = await obj.spouses[0]._node.getId();
    let spouse2Id = await obj.spouses[1]._node.getId();
    expect([spouse1Id, spouse2Id].sort())
      .to.deep.equal([spouse1, spouse2].sort());

    const adjacentSpouseNodes = await util.getAdjacentNodes({
      node: obj._node,
      label: Label.MARRIAGE_SPOUSE,
      direction: Direction.IN,
    });
    spouse1Id = await adjacentSpouseNodes[0]._node.getId();
    spouse2Id = await adjacentSpouseNodes[1]._node.getId();
    expect([spouse1Id, spouse2Id].sort())
      .to.deep.equal([spouse1, spouse2].sort());

    const adjacentDateNode = await util.getAdjacentNode({
      node: obj._node,
      label: Label.MARRIAGE_DATE,
      direction: Direction.OUT,
    });
    const dateProps = await adjacentDateNode._node.getProperties();
    expect(dateProps).to.deep.equal({original: 'my date'});

    const adjacentPlaceNode = await util.getAdjacentNode({
      node: obj._node,
      label: Label.MARRIAGE_PLACE,
      direction: Direction.OUT,
    });
    const placeProps = await adjacentPlaceNode._node.getProperties();
    expect(placeProps).to.deep.equal({name: 'my place'});
  });
});
