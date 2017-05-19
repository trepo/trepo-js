const pTree = require('@trepo/ptree');

module.exports = (root, {input}) => {
  return pTree.createMarriage({vGraph: root.vGraph, input});
};
