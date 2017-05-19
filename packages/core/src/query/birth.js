const pTree = require('@trepo/ptree');

module.exports = (root, {id}) => {
  return pTree.getBirth({vGraph: root.vGraph, input: {id}});
};
