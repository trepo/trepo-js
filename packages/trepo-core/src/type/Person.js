const pTree = require('trepo-ptree');

module.exports = {
  id: person => {
    if (person.id === undefined) {
      return person._node.getId();
    }
    return person.id;
  },
  birth: person => {
    if (person.birth === undefined) {
      return pTree.getPersonBirth({input: {node: person._node}});
    }
    return person.birth;
  },
  death: person => {
    if (person.death === undefined) {
      return pTree.getPersonDeath({input: {node: person._node}});
    }
    return person.death;
  },
  marriages: person => {
    if (person.marriages === undefined) {
      return pTree.getPersonMarriages({input: {node: person._node}});
    }
    return person.marriages;
  },
  name: person => {
    if (person.name === undefined) {
      return pTree.getPersonName({input: {node: person._node}});
    }
    return person.name;
  },
};
