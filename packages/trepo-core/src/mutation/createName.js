const pTree = require('trepo-ptree');

module.exports = (root, {input}) => {
  return pTree.createName({vGraph: root.vGraph, input});
};
