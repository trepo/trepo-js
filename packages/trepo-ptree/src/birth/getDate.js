const {Direction} = require('trepo-vgraph');
const Label = require('../label.js');
const util = require('../util.js');

// Return person node if there is one, or null
module.exports = async ({input}) => util.getAdjacentNode({
  node: input.node,
  label: Label.BIRTH_DATE,
  direction: Direction.OUT,
});
