const pTree = require('@trepo/ptree');

module.exports = (root, {input}) => {
  return pTree.createPerson({vGraph: root.vGraph, input});
};
