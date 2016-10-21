const pTree = require('trepo-ptree');

module.exports = (root, {input}) => {
  return pTree.deletePerson({vGraph: root.vGraph, input});
};
