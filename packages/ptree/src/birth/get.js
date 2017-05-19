const Label = require('../label.js');
const util = require('../util.js');

module.exports = async ({vGraph, input}) => util.getNode({
  vGraph,
  id: input.id,
  label: Label.BIRTH,
});
