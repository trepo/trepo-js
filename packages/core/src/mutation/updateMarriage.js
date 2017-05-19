const pTree = require('@trepo/ptree');

module.exports = (root, {input}) => {
  return pTree.updateMarriage({vGraph: root.vGraph, input});
};
