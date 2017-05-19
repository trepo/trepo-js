const Label = require('../label.js');
const util = require('../util.js');

module.exports = async ({vGraph, input}) => {
  await util.checkNode({
    vGraph,
    id: input.id,
    label: Label.NAME,
  });

  await vGraph.removeNode(input.id);
};
