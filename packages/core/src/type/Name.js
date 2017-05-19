const pTree = require('@trepo/ptree');

module.exports = {
  id: name => {
    if (name.id === undefined) {
      return name._node.getId();
    }
    return name.id;
  },
  name: name => {
    if (name.name === undefined) {
      return name._node.getProperty(pTree.prop.NAME_NAME);
    }
    return name.name;
  },
  person: name => {
    if (name.person === undefined) {
      return pTree.getNamePerson({input: {node: name._node}});
    }
    return name.person;
  },
};
