const pTree = require('trepo-ptree');

module.exports = (root, {input}) => {
  return pTree.createBirth({vGraph: root.vGraph, input});
};
