const Label = require('../label.js');
const Prop = require('../prop.js');
const util = require('../util.js');
const checkPerson = require('../person/check.js');
const ensurePerson = require('../person/ensure.js');

module.exports = async ({vGraph, input}) => {
  await checkPerson({
    vGraph,
    id: input.person,
  });

  const node = await util.ensureNode({
    vGraph,
    id: input.id,
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
    person,
  };
};
