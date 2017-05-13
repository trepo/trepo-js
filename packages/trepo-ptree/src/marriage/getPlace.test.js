const {expect} = require('chai');
const func = require('./getPlace.js');
const {VGraph} = require('trepo-vgraph');
const Label = require('../label.js');
const db = require('memdown');
let vGraph;

describe('marriage - getPlace', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo', {db});
    await vGraph.init();
  });

  it('should get place', async () => {
    const node = await vGraph.addNode(Label.MARRIAGE);
    const place = await vGraph.addNode(Label.PLACE);
    const placeId = await place.getId();
    await vGraph.addEdge(Label.MARRIAGE_PLACE, node, place);

    const ret = await func({vGraph, input: {node}});
    const retId = await ret._node.getId();
    expect(retId).to.equal(placeId);
  });
});
