const {Direction} = require('trepo-vgraph');
const Label = require('../label.js');
const util = require('../util.js');

module.exports = async ({vGraph, node, label, id}) => {
  const _node = await util.ensureEdge({
    vGraph,
    node,
    edgeLabel: label,
    direction: Direction.IN,
    id,
    nodeLabel: Label.PERSON,
  });

  return {_node};
};
