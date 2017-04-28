const {Direction} = require('trepo-vgraph');
const Label = require('../label.js');
const util = require('../util.js');

module.exports = async ({vGraph, node, label, ids}) => {
  const _nodes = await util.ensureEdges({
    vGraph,
    node,
    edgeLabel: label,
    direction: Direction.IN,
    ids: ids.filter(n => n !== null),
    nodeLabel: Label.PERSON,
  });

  return _nodes.map(n => ({_node: n}));
};
