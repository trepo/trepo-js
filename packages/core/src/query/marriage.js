const pTree = require('@trepo/ptree');

module.exports = (root, {id}) => {
  return pTree.getMarriage({vGraph: root.vGraph, input: {id}});
};
