const pTree = require('@trepo/ptree');

module.exports = (root, {input}) => {
  return pTree.updateName({vGraph: root.vGraph, input});
};
