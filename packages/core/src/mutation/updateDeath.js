const pTree = require('@trepo/ptree');

module.exports = (root, {input}) => {
  return pTree.updateDeath({vGraph: root.vGraph, input});
};
