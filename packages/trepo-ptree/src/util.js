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

  async ensureAdjacentNode({vGraph, node, edgeLabel, direction,
    nodeLabel, data}) {
    let adjacentNode = null;
    for (const adjNode of node.getNodes(direction, edgeLabel)) {
      adjacentNode = adjNode;
    }

    if (data !== null) {
      for (const key of Object.keys(data)) {
        if (data[key] === null || data[key] === undefined) {
          delete data[key];
        }
      }
    }

    if (data === null) {
      if (adjacentNode !== null) {
        const id = await adjacentNode.getId();
        await vGraph.removeNode(id);
      }
    } else if (adjacentNode === null) {
      adjacentNode = await vGraph.addNode(nodeLabel);
      if (direction === Direction.OUT) {
        await vGraph.addEdge(edgeLabel, node, adjacentNode);
      } else {
        await vGraph.addEdge(edgeLabel, adjacentNode, node);
      }
      await adjacentNode.setProperties(data);
    } else {
      await adjacentNode.setProperties(data);
    }
    return adjacentNode;
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

  // Ensures that the passed in ids are connected to node.
  // Returns a map of nodes
  async ensureEdges({vGraph, node, edgeLabel, direction, ids, nodeLabel}) {
    // If id is set but node does not exist, we need to error early
    let destNodes = {};
    for (let id of ids) {
      destNodes[id] = await vGraph.getNode(id);
      const actualLabel = await destNodes[id].getLabel();
      if (actualLabel !== nodeLabel) {
        throw new Error('Node Not Found');
      }
    }

    let hasEdge = {};
    for (const edge of node.getEdges(direction, edgeLabel)) {
      if (ids.length > 0) {
        const adjacentNode = await edge.getNode(
          (direction === Direction.IN ? Direction.OUT : Direction.IN));
        const adjacentNodeId = await adjacentNode.getId();
        if (ids.includes(adjacentNodeId)) {
          hasEdge[adjacentNodeId] = true;
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

    for (let id of ids) {
      if (id && hasEdge[id] === undefined) {
        if (direction === Direction.IN) {
          await vGraph.addEdge(edgeLabel, destNodes[id], node);
        } else {
          await vGraph.addEdge(edgeLabel, node, destNodes[id]);
        }
      }
    }

    return Object.values(destNodes);
  },

  async ensureNode({vGraph, id, label, properties = {}}) {
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

  async getAdjacentNodes({node, label, direction, labels = []}) {
    if (label) {
      labels = [label];
    }
    const nodes = [];
    for (const adjNode of node.getNodes(direction, ...labels)) {
      nodes.push({
        _node: adjNode,
      });
    }
    return nodes;
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
