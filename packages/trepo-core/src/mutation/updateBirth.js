const pTree = require('trepo-ptree');

module.exports = (root, {input}) => {
  return pTree.updateBirth({vGraph: root.vGraph, input});
};
