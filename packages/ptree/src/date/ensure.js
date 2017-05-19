const {Direction} = require('@trepo/vgraph');
const Label = require('../label.js');
const util = require('../util.js');

module.exports = async ({vGraph, node, label, date}) => {
  const _node = await util.ensureAdjacentNode({
    vGraph,
    node,
    edgeLabel: label,
    direction: Direction.OUT,
    nodeLabel: Label.DATE,
    data: date,
  });

  return _node === null ? null : {_node};
};
