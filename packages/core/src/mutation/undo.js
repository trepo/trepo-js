module.exports = (root, {input}) => {
  return root.vGraph.undo(input.id);
};
