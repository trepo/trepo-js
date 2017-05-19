const pTree = require('@trepo/ptree');

module.exports = (root, {id}) => {
  return pTree.getDeath({vGraph: root.vGraph, input: {id}});
};
