const {expect} = require('chai');
const Label = require('../label.js');
const func = require('./get.js');
const {VGraph, Util} = require('trepo-vgraph');
const uuidv4 = Util.generateUUIDv4();

let vGraph;

describe('person - get', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo');
    await vGraph.init();
  });

  it('should get a person', async () => {
    const n = await vGraph.addNode(Label.PERSON);
    const id = await n.getId();

    const node = await func({vGraph, input: {id}});
    const label = await node.getLabel();
    expect(label).to.equal('Person');
  });

  it('getNode should throw error when node not found', async () => {
    try {
      await func({vGraph, input: {id: uuidv4}});
    } catch (error) {
      expect(error.message).to.equal('Node Not Found');
      return;
    }
    throw new Error('Should have errored');
  });

  it('getNode should throw error when label incorrect', async () => {
    const node = await vGraph.addNode('label');
    const id = await node.getId();
    try {
      await func({vGraph, input: {id}});
    } catch (error) {
      expect(error.message).to.equal('Node Not Found');
      return;
    }
    throw new Error('Should have errored');
  });
});
