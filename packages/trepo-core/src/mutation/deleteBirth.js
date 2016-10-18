const pTree = require('trepo-ptree');

module.exports = (root, {input}) => {
  return pTree.deleteBirth({vGraph: root.vGraph, input});
};
