const {Commit} = require('@trepo/vgraph');

module.exports = async (root, {input}) => {
  const commit = new Commit().fromJSON(input.commit);
  return root.vGraph.patch(commit);
};
