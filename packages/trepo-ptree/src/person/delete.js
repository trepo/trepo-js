const {Direction} = require('trepo-vgraph');
const Label = require('../label.js');
const util = require('../util.js');
const deleteName = require('../name/delete.js');
const deleteDeath = require('../death/delete.js');

module.exports = async ({vGraph, input}) => {
  const {_node: node} = await util.getNode({
    vGraph,
    id: input.id,
    label: Label.PERSON,
  });

  const cleanup = [];

  for (const adjNode of node.getNodes(Direction.OUT, Label.NAME_PERSON)) {
    const id = await adjNode.getId();
    cleanup.push(deleteName({vGraph, input: {id}}));
  }
  for (const adjNode of node.getNodes(Direction.OUT, Label.DEATH_PERSON)) {
    const id = await adjNode.getId();
    cleanup.push(deleteDeath({vGraph, input: {id}}));
  }

  await Promise.all(cleanup);

  await vGraph.removeNode(input.id);
};
