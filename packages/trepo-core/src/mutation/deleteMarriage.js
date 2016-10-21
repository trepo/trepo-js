const pTree = require('trepo-ptree');

module.exports = (root, {input}) => {
  return pTree.deleteMarriage({vGraph: root.vGraph, input});
};
