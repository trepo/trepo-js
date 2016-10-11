const pTree = require('trepo-ptree');

module.exports = {
  id: person => {
    if (person.id === undefined) {
      return person._node.getId();
    }
    return person.id;
  },
  name: person => {
    if (person.name === undefined) {
      return pTree.getPersonName({input: {node: person._node}});
    }
    return person.name;
  },
};
