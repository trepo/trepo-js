const {expect} = require('chai');
const func = require('./ensure.js');
const util = require('../util.js');
const {VGraph, Direction} = require('trepo-vgraph');
const db = require('memdown');

let vGraph;

describe('date - ensure', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo', {db});
    await vGraph.init();
  });

  it('should ensure a date', async () => {
    const node = await vGraph.addNode('label');
    const date = await func({
      vGraph,
      node,
      label: 'edge',
      date: {original: 'my date'},
    });
    expect(date._node).to.not.equal(null);
    const dateNode = await util.getAdjacentNode({
      node,
      label: 'edge',
      direction: Direction.OUT,
    });
    expect(dateNode).to.not.equal(null);
    expect(dateNode._node).to.not.equal(undefined);
  });
});
