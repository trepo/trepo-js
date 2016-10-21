const Label = require('../label.js');
const util = require('../util.js');
const createName = require('../name/create.js');

module.exports = async ({vGraph, input}) => {
  const _node = await util.createNode({
    vGraph,
    label: Label.PERSON,
  });

  if (input.name) {
    const id = await _node.getId();
    await createName({vGraph, input: {
      name: input.name,
      person: id,
    }});
  }

  return {
    _node,
  };
};
