const pTree = require('trepo-ptree');

module.exports = {
  name: node => {
    if (node.name === undefined) {
      return node._node.getProperty(pTree.prop.PLACE_NAME);
    }
    return node.name;
  },
};
