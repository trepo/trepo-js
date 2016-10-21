const {Direction} = require('trepo-vgraph');
const Label = require('../label.js');
const util = require('../util.js');

module.exports = async ({input}) => util.getAdjacentNodes({
  node: input.node,
  label: Label.MARRIAGE_SPOUSE,
  direction: Direction.OUT,
});
