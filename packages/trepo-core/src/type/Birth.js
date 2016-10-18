const pTree = require('trepo-ptree');

module.exports = {
  id: node => {
    if (node.id === undefined) {
      return node._node.getId();
    }
    return node.id;
  },
  father: node => {
    if (node.father === undefined) {
      return pTree.getBirthFather({input: {node: node._node}});
    }
    return node.father;
  },
  mother: node => {
    if (node.mother === undefined) {
      return pTree.getBirthMother({input: {node: node._node}});
    }
    return node.mother;
  },
  child: node => {
    if (node.child === undefined) {
      return pTree.getBirthChild({input: {node: node._node}});
    }
    return node.child;
  },
  date: node => {
    if (node.date === undefined) {
      return pTree.getBirthDate({input: {node: node._node}});
    }
    return node.date;
  },
  place: node => {
    if (node.place === undefined) {
      return pTree.getBirthPlace({input: {node: node._node}});
    }
    return node.place;
  },
};
