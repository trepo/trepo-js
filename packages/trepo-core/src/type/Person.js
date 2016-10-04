module.exports = {
  id: person => person.id || person._node.getId(),
};
