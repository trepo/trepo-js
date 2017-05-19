const pTree = require('@trepo/ptree');

module.exports = (root, {input}) => {
  return pTree.deleteName({vGraph: root.vGraph, input});
};
