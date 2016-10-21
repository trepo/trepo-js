const {Direction} = require('trepo-vgraph');
const Label = require('../label.js');
const util = require('../util.js');

module.exports = async ({input}) => util.getAdjacentNode({
  node: input.node,
  label: Label.BIRTH_MOTHER,
  direction: Direction.IN,
});
