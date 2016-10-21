const pTree = require('trepo-ptree');

module.exports = (root, {input}) => {
  return pTree.deleteDeath({vGraph: root.vGraph, input});
};
