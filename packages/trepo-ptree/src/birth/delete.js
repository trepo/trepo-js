const Label = require('../label.js');
const util = require('../util.js');
const removeDate = require('../date/remove.js');
const removePlace = require('../place/remove.js');

module.exports = async ({vGraph, input}) => {
  const node = await util.getNode({
    vGraph,
    id: input.id,
    label: Label.BIRTH,
  });

  await Promise.all([
    removeDate({
      vGraph,
      node,
      label: Label.BIRTH_DATE,
    }),
    removePlace({
      vGraph,
      node,
      label: Label.BIRTH_PLACE,
    }),
  ]);

  await vGraph.removeNode(input.id);
};
