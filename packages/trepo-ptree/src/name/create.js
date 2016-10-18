const {Direction} = require('trepo-vgraph');
const Label = require('../label.js');
const Prop = require('../prop.js');
const util = require('../util.js');

module.exports = async ({vGraph, input}) => {
  await util.checkNode({
    vGraph,
    id: input.person,
    label: Label.PERSON,
  });

  const _node = await util.createNode({
    vGraph,
    label: Label.NAME,
    properties: {
      [Prop.NAME_NAME]: input.name,
    },
  });

  const person = await util.ensureEdge({
    vGraph,
    node: _node,
    edgeLabel: Label.NAME_PERSON,
    direction: Direction.IN,
    id: input.person,
    nodeLabel: Label.PERSON,
  });

  return {
    _node,
    name: input.name,
    person: person ? {_node: person} : null,
  };
};