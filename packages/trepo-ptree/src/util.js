module.exports = {
  async getNode({vGraph, id, label}) {
    const node = await vGraph.getNode(id);
    const nodeLabel = await node.getLabel();
    if (label !== nodeLabel) {
      throw new Error('Node Not Found');
    }
    return node;
  },
};
