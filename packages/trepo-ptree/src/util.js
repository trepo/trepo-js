module.exports = {
  async getNode({vGraph, id, label}) {
    const _node = await vGraph.getNode(id);
    const nodeLabel = await _node.getLabel();
    if (label !== nodeLabel) {
      throw new Error('Node Not Found');
    }
    return {
      _node,
      id,
      label,
    };
  },
};
