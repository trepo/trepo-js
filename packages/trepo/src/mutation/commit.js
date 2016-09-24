module.exports = (root, {input}) => {
  return root.vGraph.commit(input.author, input.email, input.message);
};
