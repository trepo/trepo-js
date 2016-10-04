module.exports = {
  id: person => person._id || person._node.getId(),
};
