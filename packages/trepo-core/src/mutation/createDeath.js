const pTree = require('trepo-ptree');

module.exports = (root, {input}) => {
  return pTree.createDeath({vGraph: root.vGraph, input});
};
