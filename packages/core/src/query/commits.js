module.exports = (root, {after, limit}) => {
  if (!after) {
    after = null;
  }
  if (!limit) {
    limit = 10;
  }
  return root.vGraph.getCommits(after, limit);
};
