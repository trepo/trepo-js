const pTree = require('trepo-ptree');

module.exports = {
  id: node => {
    if (node.id === undefined) {
      return node._node.getId();
    }
    return node.id;
  },
  person: node => {
    if (node.person === undefined) {
      return pTree.getDeathPerson({input: {node: node._node}});
    }
    return node.person;
  },
  date: node => {
    if (node.date === undefined) {
      return pTree.getDeathDate({input: {node: node._node}});
    }
    return node.date;
  },
  place: node => {
    if (node.place === undefined) {
      return pTree.getDeathPlace({input: {node: node._node}});
    }
    return node.place;
  },
};
