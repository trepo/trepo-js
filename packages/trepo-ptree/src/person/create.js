const Label = require('../label.js');

module.exports = async ({vGraph, input}) => {
  const _node = await vGraph.addNode(Label.PERSON);
  return {
    _node,
    _label: Label.PERSON,
  };
};
