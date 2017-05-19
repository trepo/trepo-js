const pTree = require('@trepo/ptree');

module.exports = {
  original: node => {
    if (node.original === undefined) {
      return node._node.getProperty(pTree.prop.DATE_ORIGINAL);
    }
    return node.original;
  },
  formal: node => {
    if (node.formal === undefined) {
      return node._node.getProperty(pTree.prop.DATE_FORMAL);
    }
    return node.formal;
  },
};
