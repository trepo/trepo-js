const {expect} = require('chai');
const func = require('./delete.js');
const {VGraph, Util} = require('@trepo/vgraph');
const Label = require('../label.js');
const db = require('memdown');
const uuidv4 = Util.generateUUIDv4();
let vGraph;

describe('name - delete', () => {
  beforeEach(async () => {
    vGraph = new VGraph('repo', {db});
    await vGraph.init();
  });

  it('should error on name not found', async () => {
    try {
      await func({vGraph, input: {id: uuidv4}});
    } catch (error) {
      expect(error.message).to.equal('Node Not Found');
      return;
    }
    throw new Error('Should have errored');
  });

  it('should delete name', async () => {
    const node = await vGraph.addNode(Label.NAME);
    const id = await node.getId();

    await func({vGraph, input: {id}});

    try {
      await vGraph.getNode(id);
      throw new Error('should have errored');
    } catch (error) {
      expect(error.message).to.equal('Deleted');
    }
  });
});
