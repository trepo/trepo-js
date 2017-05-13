const {expect} = require('chai');
const func = require('./create.js');
const util = require('../util.js');
const {VGraph, Node, Direction} = require('trepo-vgraph');
const Label = require('../label.js');
const Prop = require('../prop.js');
const db = require('memdown');

let vGraph;

describe('person - create', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo', {db});
    await vGraph.init();
  });

  it('should create a person', async () => {
    const obj = await func({vGraph, input: {}});
    expect(obj).to.have.all.keys('_node');
    expect(obj._node).to.be.instanceOf(Node);
    const label = await obj._node.getLabel();
    expect(label).to.equal(Label.PERSON);
  });

  it('should create a person with name', async () => {
    const obj = await func({vGraph, input: {name: 'me'}});

    const adjacentNode = await util.getAdjacentNode({
      node: obj._node,
      label: Label.NAME_PERSON,
      direction: Direction.OUT,
    });
    const props = await adjacentNode._node.getProperties();
    expect(props).to.deep.equal({
      [Prop.NAME_NAME]: 'me',
    });
  });
});
