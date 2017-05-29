// n:<nid> = [label, props]
// n:<nid>:o:<nid> = [elabel]
// n:<nid>:i:<nid> = [elabel]
// a:<nid>:<elabel>:i:<nid> = [label, props]
// a:<nid>:<elabel>:o:<nid> = [label, props]
// e:<eid> = [label, from, to, props]
//
// Add node - just set n:<nid>
// Update node - get node + edjacent nodes/edgeLabels && update n:<nid> && a:<nid>:...
// Delete node - get node + edjacent nodes/edgeLabels && delete n:<nid> && a:<nid>:...
//
// Add edge - set e:<eid> && create n:<nid>:i/o:... && a:<nid>
// Update edge - get edge && set edge
// Delete edge - get edge && delete e:<eid> && n:<nid>:i/o:... && a:<nid>
class Graph {
  constructor({db}) {
    this.db = db;
  }

  // Should verify that the node does not exist
  // Needs to be reasonably efficient
  addNode({id, label, props = {}}) {}

  // Should verify that the node exists
  // Needs to be reasonably efficient
  removeNode({id}) {}

  updateNode({id, props}) {}

  updateNodes([{id, props}]) {}

  // Undefined/null on missing
  // Needs to be efficient
  getNode({id}) {}

  // Does not need to be efficient if we keep an index of changes
  // i.e. on update add a marker node in the db (nu:<nid> = timestamp)
  getNodes({labels}) {}

  // Needs to be efficient
  getNodeNodes({id, direction, labels}) {}

  // Needs to be reasonably efficient
  getNodeNode({id, direction, label}) {}

  // Does not need to be efficient
  getNodeEdges({id, direction, labels}) {}

  // Needs to be reasonably efficient
  addEdge({id, label, from, to}) {}

  // Needs to be reasonably efficient
  removeEdge({id, props = {}}) {}

  updateEdge({id, props}) {}

  updateEdges([{id, props}]) {}

  // Needs to be efficient
  getEdge({id}) {}

  // Does not need to be efficient if we keep an index of changes
  getEdges({labels}) {}

  // Does not need to be efficient
  getEdgeFrom({id}) {}

  // Does not need to be efficient
  getEdgeTo({id}) {}
}

module.exports = Graph;
