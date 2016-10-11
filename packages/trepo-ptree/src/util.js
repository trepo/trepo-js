const {Direction} = require('trepo-vgraph');

module.exports = {
  async checkNode({vGraph, id, label}) {
    if (!id) {
      return;
    }
    const node = await vGraph.getNode(id);
    const nodeLabel = await node.getLabel();
    if (label !== nodeLabel) {
      throw new Error('Node Not Found');
    }
  },

  async createNode({vGraph, label, properties = null}) {
    const node = await vGraph.addNode(label);
    if (properties !== null) {
      for (const key of Object.keys(properties)) {
        if (properties[key] === null || properties[key] === undefined) {
          delete properties[key];
        }
      }
      await node.setProperties(properties);
    }
    return node;
  },

  async ensureEdge({vGraph, node, edgeLabel, direction, id, nodeLabel}) {
    // If id is set but node does not exist, we need to error early
    let destNode = null;
    if (id) {
      destNode = await vGraph.getNode(id);
      const actualLabel = await destNode.getLabel();
      if (actualLabel !== nodeLabel) {
        throw new Error('Node Not Found');
      }
    }
    let hasEdge = false;
    for (const edge of node.getEdges(direction, edgeLabel)) {
      if (id) {
        const adjacentNode = await edge.getNode(
          (direction === Direction.IN ? Direction.OUT : Direction.IN));
        const adjacentNodeId = await adjacentNode.getId();
        if (adjacentNodeId === id) {
          hasEdge = true;
        } else {
          const edgeId = await edge.getId();
          await vGraph.removeEdge(edgeId);
        }
      } else {
        // Remove Edge
        const edgeId = await edge.getId();
        await vGraph.removeEdge(edgeId);
      }
    }

    if (id && !hasEdge) {
      if (direction === Direction.IN) {
        await vGraph.addEdge(edgeLabel, destNode, node);
      } else {
        await vGraph.addEdge(edgeLabel, node, destNode);
      }
    }

    return destNode;
  },

  async ensureNode({vGraph, id, label, properties}) {
    const node = await vGraph.getNode(id);
    const nodeLabel = await node.getLabel();
    if (label !== nodeLabel) {
      throw new Error('Node Not Found');
    }
    for (const key of Object.keys(properties)) {
      if (properties[key] === null || properties[key] === undefined) {
        delete properties[key];
      }
    }
    await node.setProperties(properties);

    return node;
  },

  async getAdjacentNode({node, label, direction}) {
    for (const adjNode of node.getNodes(direction, label)) {
      return {
        _node: adjNode,
      };
    }
    return null;
  },

  async getNode({vGraph, id, label}) {
    const node = await vGraph.getNode(id);
    const nodeLabel = await node.getLabel();
    if (label !== nodeLabel) {
      throw new Error('Node Not Found');
    }
    return {
      _node: node,
      id: id,
    };
  },
};
