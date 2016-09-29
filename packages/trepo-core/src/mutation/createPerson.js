module.exports = (root, {input}) => {
  return root.pTree.createPerson({vGraph: root.vGraph, input});
};
