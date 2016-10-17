const {Direction} = require('trepo-vgraph');
const Label = require('../label.js');
const util = require('../util.js');

module.exports = async ({vGraph, node, label}) => {
  await util.ensureAdjacentNode({
    vGraph,
    node,
    edgeLabel: label,
    direction: Direction.OUT,
    nodeLabel: Label.PLACE,
    data: null,
  });
};
