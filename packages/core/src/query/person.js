const pTree = require('@trepo/ptree');

module.exports = (root, {id}) => {
  return pTree.getPerson({vGraph: root.vGraph, input: {id}});
};
