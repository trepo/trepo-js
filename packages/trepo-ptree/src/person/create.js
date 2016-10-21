const Label = require('../label.js');
const util = require('../util.js');

module.exports = async ({vGraph, input}) => {
  const _node = await util.createNode({
    vGraph,
    label: Label.BIRTH,
  });
  return {
    _node,
  };
};
