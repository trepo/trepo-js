const Label = require('../label.js');
const Prop = require('../prop.js');
const util = require('../util.js');
const ensurePerson = require('../person/ensure.js');

module.exports = async ({vGraph, input}) => {
  await util.checkNode({
    vGraph,
    id: input.person,
    label: Label.PERSON,
  });

  const node = await util.createNode({
    vGraph,
    label: Label.NAME,
    properties: {
      [Prop.NAME_NAME]: input.name,
    },
  });

  const person = await ensurePerson({
    vGraph,
    node,
    label: Label.NAME_PERSON,
    id: input.person,
  });

  return {
    _node: node,
    name: input.name,
    person,
  };
};
