const pTree = require('trepo-ptree');

module.exports = (root, {id}) => {
  return pTree.getName({vGraph: root.vGraph, input: {id}});
};
