module.exports = (root, {id}) => {
  return root.pTree.getPerson({vGraph: root.vGraph, input: {id}});
};
