const Label = require('../label.js');
const util = require('../util.js');
const deleteDate = require('../date/delete.js');
const deletePlace = require('../place/delete.js');

module.exports = async ({vGraph, input}) => {
  const {_node: node} = await util.getNode({
    vGraph,
    id: input.id,
    label: Label.DEATH,
  });

  await Promise.all([
    deleteDate({
      vGraph,
      node,
      label: Label.DEATH_DATE,
    }),
    deletePlace({
      vGraph,
      node,
      label: Label.DEATH_PLACE,
    }),
  ]);

  await vGraph.removeNode(input.id);
};
