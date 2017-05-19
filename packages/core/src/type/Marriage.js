const pTree = require('@trepo/ptree');

module.exports = {
  id: node => {
    if (node.id === undefined) {
      return node._node.getId();
    }
    return node.id;
  },
  spouses: node => {
    if (node.spouses === undefined) {
      return pTree.getMarriageSpouses({input: {node: node._node}});
    }
    return node.spouses;
  },
  date: node => {
    if (node.date === undefined) {
      return pTree.getMarriageDate({input: {node: node._node}});
    }
    return node.date;
  },
  place: node => {
    if (node.place === undefined) {
      return pTree.getMarriagePlace({input: {node: node._node}});
    }
    return node.place;
  },
};
