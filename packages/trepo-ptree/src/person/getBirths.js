const {Direction} = require('trepo-vgraph');
const Label = require('../label.js');
const util = require('../util.js');

module.exports = async ({input}) => util.getAdjacentNodes({
  node: input.node,
  labels: [Label.BIRTH_CHILD, Label.BIRTH_MOTHER, Label.BIRTH_FATHER],
  direction: Direction.OUT,
});
