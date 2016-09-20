import Constant from './Constant.js';
import Node from './Node.js';
import Edge from './Edge.js';
import Direction from './Direction.js';
import Commit from './Commit.js';
import CommitNode from './CommitNode.js';
import CommitEdge from './CommitEdge.js';
import Util from './Util.js';
import Vagabond from 'vagabond-db';

/**
 * A Repository Identifier.
 *
 * @typedef {String} Repo
 */

/**
 * vGraph
 */
class VGraph {

  /**
   * Create a new vGraph instance.
   *
   * options = {
   *   name: = The name of the db to pass to Vagabond
   *   db: = A LevelDOWN compatible constructor to pass to Vagabond
   * }
   *
   * @param  {Repo} repo The repository identifier.
   * @param  {Object} options The options object.
   */
  constructor(repo, options = {}) {
    if (!Util.isValidRepo(repo)) {
      throw new Error('Invalid Repo');
    }
    this._vagabond = new Vagabond(options);

    this._initialized = false;
    this._version = Constant.SPEC_VERSION; // The version of the vGraph spec
    this._repo = repo;
    this._lastCommit = null;
    this._dirty = false;
    this._rootNode = null;
    this._lastCommitNode = null;
  }

  get repo() {
    return this._repo;
  }

  /**
   * The repository identifier.
   *
   * @param {Repo} value The repo.
   */
  set repo(value) {
    throw new Error('Cannot set repo after initialization');
  }

  /**
   * Initialize this vGraph instance.
   *
   * @return {Promise<Null>} A Promise resolving to Null.
   */
  init() {
    return new Promise((resolve, reject) => {
      if (this._initialized) {
        return reject(new Error('vGraph already initialized'));
      }
      this._initialized = true;
      this._vagabond.init()
        .then(ignored => this._vagabond.getNode(Constant.ROOT_ID))
        // Get and/or set root node
        .then(node => {
          this._rootNode = node;
          return new Promise((resolve, reject) => {
            node.getProperties()
              .then(properties => {
                if (properties[Constant.ROOT_VERION] !==
                    Constant.DATA_VERSION) {
                  throw new Error('Version Mismatch');
                }
                if (properties[Constant.ROOT_REPO] !== this._repo) {
                  throw new Error('Repo Mismatch');
                }
              })
              .then(resolve)
              .catch(reject);
          });
        }, error => {
          return new Promise((resolve, reject) => {
            this._vagabond.addNode(Constant.ROOT_ID, Constant.ROOT_LABEL)
              .then(node => {
                this._rootNode = node;
                let properties = {};
                properties[Constant.META] = Constant.ROOT_META;
                properties[Constant.ROOT_VERION] = Constant.DATA_VERSION;
                properties[Constant.ROOT_REPO] = this._repo;
                return node.setProperties(properties);
              })
              .then(resolve)
              .catch(reject);
          });
        })
        // this._rootNode is set to the root node now
        // Get last commit
        .then(ignored => {
          for (let commitNode of
            this._rootNode.getNodes(Direction.IN, Constant.COMMIT_EDGE_LABEL)) {
            this._lastCommitNode = commitNode;
            this._lastCommit = commitNode.id;
            return Promise.resolve(null);
          }
          return Promise.resolve(null);
        })
        // Check for dirty or not
        .then(ignored => {
          // Get all nodes that aren't clean
          let query = this._vagabond.query()
            .hasNot(Constant.META).filter(Util.changedFilter);
          for (let node of query.nodes()) { // eslint-disable-line no-unused-vars
            this._dirty = true;
            break;
          }

          // Get all edges that aren't clean
          query = this._vagabond.query()
            .hasNot(Constant.META).filter(Util.changedFilter);
          for (let edge of query.edges()) { // eslint-disable-line no-unused-vars
            this._dirty = true;
            break;
          }
        })
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Add a Node to vGraph.
   *
   * @param {Label} label The label.
   * @return {Promise<Node>} A Promise resolving to the new Node.
   */
  async addNode(label) {
    if (!Util.isValidLabel(label)) {
      throw new Error('Invalid Label');
    }
    let uuid = Util.generateUUIDv4();
    this._dirty = true;
    let node = await this._vagabond.addNode(uuid, label);
    await node.setProperty(Constant.STATUS, 1);

    return new Node(node, this);
  }

  /**
   * Remove a Node from vGraph.
   *
   * @param  {Id} id The Node Id.
   */
  async removeNode(id) {
    if (!Util.isValidUUIDv4(id)) {
      throw new Error('Invalid Id');
    }

    let node = await this._vagabond.getNode(id);

    if (node.label === Constant.COMMIT_NODE_LABEL) {
      throw new Error('Node Not Found');
    }

    let status = await node.getProperty(Constant.STATUS);
    if (status >= 4) {
      throw new Error('Deleted');
    }

    // Delete Node and Edges
    let promises = [];
    promises.push(node.setProperty(Constant.STATUS, status + 4));

    for (let edge of node.query(Direction.BOTH).edges()) {
      let edgeStatus = await edge.getProperty(Constant.STATUS);
      if (edgeStatus < 4) {
        promises.push(edge.setProperty(Constant.STATUS, edgeStatus + 4));
      }
    }

    this._dirty = true;
    await Promise.all(promises);
  }

  /**
   * Gets a Node from vGraph.
   *
   * @param  {Id} id The Node's ID.
   * @return {Promise<Node>} A Promise resolving to the Node.
   */
  async getNode(id) {
    if (!Util.isValidUUIDv4(id)) {
      throw new Error('Invalid Id');
    }

    let node = await this._vagabond.getNode(id);

    if (node.label === Constant.COMMIT_NODE_LABEL) {
      throw new Error('Node Not Found');
    }

    let status = await node.getProperty(Constant.STATUS);
    if (status >= 4) {
      throw new Error('Deleted');
    }

    return new Node(node, this);
  }

  /**
   * Returns a Generator iterating over the Nodes in the Graph.
   * If labels are passed in, it will only return nodes that
   * have one of the passed in labels.
   *
   * @param  {...String} labels The labels to filter on.
   */
  * getNodes(...labels) {
    let query = this._vagabond.query()
      .hasNot(Constant.META).filter(Util.notDeletedFilter);
    if (labels.length > 0) {
      query = query.labels(...labels);
    }

    for (let node of query.nodes()) {
      yield new Node(node, this);
    }
  }

  /**
   * Add an Edge to vGraph.
   *
   * @param {Label} label The label.
   * @param {Node} fromNode The label.
   * @param {Node} toNode The label.
   * @return {Promise<Edge>} A Promise resolving to the new Edge.
   */
  async addEdge(label, fromNode, toNode) {
    if (!(fromNode instanceof Node)) {
      throw new Error('Invalid From Node');
    }
    if (!(toNode instanceof Node)) {
      throw new Error('Invalid To Node');
    }
    if (fromNode._element.id === toNode._element.id) {
      throw new Error('Self Referencing Nodes Not Allowed');
    }
    if (!Util.isValidLabel(label)) {
      throw new Error('Invalid Label');
    }

    let uuid = Util.generateUUIDv4();
    this._dirty = true;
    let edge = await this._vagabond.addEdge(uuid, label,
      fromNode._element, toNode._element);
    await edge.setProperty(Constant.STATUS, 1);

    return new Edge(edge, this);
  }

  /**
   * Remove an Edge from vGraph.
   *
   * @param  {Id} id The Edge Id.
   */
  async removeEdge(id) {
    if (!Util.isValidUUIDv4(id)) {
      throw new Error('Invalid Id');
    }

    let edge = await this._vagabond.getEdge(id);

    if (edge.label === Constant.COMMIT_EDGE_LABEL) {
      throw new Error('Edge Not Found');
    }

    let status = await edge.getProperty(Constant.STATUS);
    if (status >= 4) {
      throw new Error('Deleted');
    }

    this._dirty = true;
    await edge.setProperty(Constant.STATUS, status + 4);
  }

  /**
   * Gets an Edge from vGraph.
   *
   * @param  {Id} id The Edge's ID.
   * @return {Promise<Edge>} A Promise resolving to the Edge.
   */
  async getEdge(id) {
    if (!Util.isValidUUIDv4(id)) {
      throw new Error('Invalid Id');
    }

    let edge = await this._vagabond.getEdge(id);
    if (edge.label === Constant.COMMIT_EDGE_LABEL) {
      throw new Error('Edge Not Found');
    }

    let status = await edge.getProperty(Constant.STATUS);
    if (status >= 4) {
      throw new Error('Deleted');
    }

    return new Edge(edge, this);
  }

  /**
   * Returns a Generator iterating over the Edges in the Graph.
   * If labels are passed in, it will only return nodes that
   * have one of the passed in labels.
   *
   * @param  {...String} labels The labels to filter on.
   */
  * getEdges(...labels) {
    let query = this._vagabond.query()
      .hasNot(Constant.META).filter(Util.notDeletedFilter);
    if (labels.length > 0) {
      query = query.labels(...labels);
    }

    for (let edge of query.edges()) {
      yield new Edge(edge, this);
    }
  }

  /**
   * Add a Boundary Node.
   *
   * @param {Id} id The Boundary Node's ID.
   * @param {Label} label The Boundary Node's label.
   * @param {Repo} repo The Boundary Node's repo.
   * @return {Promise<Node>} A Promise resolving to the Node.
   */
  async addBoundary(id, label, repo) {
    if (!Util.isValidUUIDv4(id)) {
      throw new Error('Invalid Id');
    }
    if (!Util.isValidLabel(label)) {
      throw new Error('Invalid Label');
    }
    if (!Util.isValidRepo(repo) || repo === this._repo) {
      throw new Error('Invalid Repo');
    }

    let node;

    try {
      node = await this._vagabond.addNode(id, label);
    } catch (error) {
      if (error.message === 'Duplicate Key') {
        throw new Error('Node Exists');
      } else {
        throw error;
      }
    }
    this._dirty = true;
    let properties = {};
    properties[Constant.REPO] = repo;
    properties[Constant.STATUS] = 1;
    await node.setProperties(properties);

    return new Node(node, this);
  }

  /**
   * Returns informtation about this vGraph instance,
   * such as the version, the repo, the last commit,
   * and if this instance has any uncommitted changes.
   *
   * @return {Object} The Info Object.
   */
  info() {
    return Promise.resolve({
      version: this._version,
      repo: this._repo,
      commit: this._lastCommit,
      clean: !this._dirty,
    });
  }

  /**
   * Gets a Commit.
   *
   * @param  {Id} id The Commit Id.
   * @return {Promise<Commit>} A Promise resolving to the commit.
   */
  getCommit(id) {
    return new Promise((resolve, reject) => {
      if (!Util.isValidUUIDv4(id)) {
        return reject(new Error('Invalid Id'));
      }
      let node;
      this._vagabond.getNode(id)
        .then(n => {
          node = n;
          if (node.label !== Constant.COMMIT_NODE_LABEL) {
            throw new Error('Node Not Found');
          }

          // Get Prev
          let prev = null;
          for (let prevNode of node.getNodes(Direction.IN)) {
            if (prevNode.id !== Constant.ROOT_ID) {
              prev = prevNode.id;
            }
            break;
          }

          return this._inflateCommit(node, prev);
        })
        .then(commit => resolve(commit))
        .catch(reject);
    });
  }

  /**
   * Gets the metadata about the last `number` of Commits.
   *
   * @param  {Integer} number The number of entries to return.
   * @param  {Integer} offset The number of entries to skip before starting to return.
   * @return {Object[]} An array of Log Entries.
   */
  log(number, offset) {
    return new Promise((resolve, reject) => {
      if (number < 1) {
        return reject(new Error('number must be greater than 0'));
      }
      if (offset < 0) {
        return reject(new Error('offset may not be less than 0'));
      }
      this._getLogNodes(this._rootNode, [], number, offset)
        .then(commitNodes => {
          let promises = [];
          for (let commitNode of commitNodes) {
            promises.push(this._getLogEntry(commitNode));
          }
          resolve(Promise.all(promises));
        })
        .catch(reject);
    });
  }

  _getLogNodes(currentNode, commitNodes, number, offset) {
    if (number === 0) {
      return Promise.resolve(commitNodes);
    }
    for (let nextNode of currentNode.getNodes(Direction.IN,
      Constant.COMMIT_EDGE_LABEL)) {
      // If we wrap around, return
      if (nextNode.id === Constant.ROOT_ID) {
        return Promise.resolve(commitNodes);
      }
      if (offset === 0) {
        commitNodes.push(nextNode);
        return this._getLogNodes(nextNode, commitNodes, number - 1, offset);
      }
      return this._getLogNodes(nextNode, commitNodes, number, offset - 1);
    }
    return Promise.resolve(commitNodes);
  }

  _getLogEntry(commitNode) {
    return new Promise((resolve, reject) => {
      commitNode.getProperties()
        .then(properties => {
          resolve({
            id: commitNode.id,
            repo: properties[Constant.COMMIT_NODE_REPO],
            timestamp: properties[Constant.COMMIT_NODE_TIMESTAMP],
            author: properties[Constant.COMMIT_NODE_AUTHOR],
            email: properties[Constant.COMMIT_NODE_EMAIL],
            message: properties[Constant.COMMIT_NODE_MESSAGE],
          });
        })
        .catch(reject);
    });
  }

  /**
   * Get a Commit Representing the uncommitted changes in vGraph.
   *
   * @param {String} author The author.
   * @param {Email} email The email.
   * @param {String} message The message.
   * @return {Promise<Commit>} A Promise resolving to the Commit.
   */
  async status(author = 'status()', email = '<>', message = '(none)') {
    let commit = new Commit();
    commit.id = Util.generateUUIDv4();
    if (this._lastCommit) {
      commit.prev = this._lastCommit;
    }
    commit.repo = this._repo;
    commit.timestamp = Date.now();
    commit.author = author;
    commit.email = email;
    commit.message = message;

    let query;
    let actuallyDelete;
    let deletePromises;

    /* Changed Nodes */
    actuallyDelete = [];
    query = this._vagabond.query()
      .hasNot(Constant.META).filter(Util.changedFilter);
    for (let node of query.nodes()) {
      let properties = await node.getProperties();
      // Deleted Nodes
      if (properties[Constant.STATUS] >= 4) {
        // Clean Delete
        if (properties[Constant.STATUS] === 4) {
          if (properties.hasOwnProperty(Constant.REPO)) {
            let commitNode = new CommitNode(node.id, node.label);
            commitNode.action = Constant.DELETE;
            commitNode.boundary = true;
            commitNode.origRepo = properties[Constant.REPO];
            commit.addNode(commitNode);
          } else {
            let commitNode = new CommitNode(node.id, node.label);
            commitNode.action = Constant.DELETE;
            commitNode.boundary = false;
            commitNode.origProps = Util.getProperties(properties);
            commit.addNode(commitNode);
          }
        // Update Delete
        } else if (properties[Constant.STATUS] === 6) {
          if (properties.hasOwnProperty(Constant.ORIG_PROPS)) {
            let commitNode = new CommitNode(node.id, node.label);
            commitNode.action = Constant.DELETE;
            commitNode.boundary = false;
            commitNode.origProps = JSON.parse(properties[Constant.ORIG_PROPS]);
            commit.addNode(commitNode);
          } else {
            let commitNode = new CommitNode(node.id, node.label);
            commitNode.action = Constant.DELETE;
            commitNode.boundary = true;
            commitNode.origRepo = properties[Constant.ORIG_REPO];
            commit.addNode(commitNode);
          }
        // Create Delete
        } else {
          actuallyDelete.push(node.id);
        }
      // Updated Nodes
      } else if (properties[Constant.STATUS] === 2) {
        if (properties.hasOwnProperty(Constant.REPO)) {
          if (properties.hasOwnProperty(Constant.ORIG_PROPS)) {
            let commitNode = new CommitNode(node.id, node.label);
            commitNode.action = Constant.UPDATE;
            commitNode.boundary = true;
            commitNode.repo = properties[Constant.REPO];
            commitNode.origProps = JSON.parse(properties[Constant.ORIG_PROPS]);
            commit.addNode(commitNode);
          } else {
            let commitNode = new CommitNode(node.id, node.label);
            commitNode.action = Constant.UPDATE;
            commitNode.boundary = true;
            commitNode.repo = properties[Constant.REPO];
            commitNode.origRepo = properties[Constant.ORIG_REPO];
            commit.addNode(commitNode);
          }
        } else {
          if (properties.hasOwnProperty(Constant.ORIG_PROPS)) {
            let commitNode = new CommitNode(node.id, node.label);
            commitNode.action = Constant.UPDATE;
            commitNode.boundary = false;
            commitNode.props = Util.getProperties(properties);
            commitNode.origProps = JSON.parse(properties[Constant.ORIG_PROPS]);
            commit.addNode(commitNode);
          } else {
            let commitNode = new CommitNode(node.id, node.label);
            commitNode.action = Constant.UPDATE;
            commitNode.boundary = false;
            commitNode.props = Util.getProperties(properties);
            commitNode.origRepo = properties[Constant.ORIG_REPO];
            commit.addNode(commitNode);
          }
        }
      // Created Nodes
      } else {
        if (properties.hasOwnProperty(Constant.REPO)) {
          let commitNode = new CommitNode(node.id, node.label);
          commitNode.action = Constant.CREATE;
          commitNode.boundary = true;
          commitNode.repo = properties[Constant.REPO];
          commit.addNode(commitNode);
        } else {
          let commitNode = new CommitNode(node.id, node.label);
          commitNode.action = Constant.CREATE;
          commitNode.boundary = false;
          commitNode.props = Util.getProperties(properties);
          commit.addNode(commitNode);
        }
      }
    }
    deletePromises = [];
    for (let id of actuallyDelete) {
      deletePromises.push(this._vagabond.removeNode(id));
    }
    await Promise.all(deletePromises);

    /* Changed Edges */
    actuallyDelete = [];
    query = this._vagabond.query()
      .hasNot(Constant.META).filter(Util.changedFilter);
    for (let edge of query.edges()) {
      let properties = await edge.getProperties();
      // Add reference nodes if this edge is not Created then Deleted
      if (properties[Constant.STATUS] !== 5 ||
          properties[Constant.STATUS] !== 7) {
        if (!commit.hasNode(edge.from)) {
          let node = await this._vagabond.getNode(edge.from);
          let nodeProperties = await node.getProperties();
          let commitNode = new CommitNode(node.id, node.label);
          commitNode.action = Constant.REFERENCE;
          commitNode.boundary = true;
          if (nodeProperties.hasOwnProperty(Constant.REPO)) {
            commitNode.repo = nodeProperties[Constant.REPO];
          } else {
            commitNode.repo = this._repo;
          }
          commit.addNode(commitNode);
        }
        if (!commit.hasNode(edge.to)) {
          let node = await this._vagabond.getNode(edge.to);
          let nodeProperties = await node.getProperties();
          let commitNode = new CommitNode(node.id, node.label);
          commitNode.action = Constant.REFERENCE;
          commitNode.boundary = true;
          if (nodeProperties.hasOwnProperty(Constant.REPO)) {
            commitNode.repo = nodeProperties[Constant.REPO];
          } else {
            commitNode.repo = this._repo;
          }
          commit.addNode(commitNode);
        }
      }
      // Deleted Edges
      if (properties[Constant.STATUS] >= 4) {
        // Clean Delete
        if (properties[Constant.STATUS] === 4) {
          let commitEdge =
            new CommitEdge(edge.id, edge.label, edge.from, edge.to);
          commitEdge.action = Constant.DELETE;
          commitEdge.origProps = Util.getProperties(properties);
          commit.addEdge(commitEdge);
        // Update Delete
        } else if (properties[Constant.STATUS] === 6) {
          let commitEdge =
            new CommitEdge(edge.id, edge.label, edge.from, edge.to);
          commitEdge.action = Constant.DELETE;
          commitEdge.origProps = JSON.parse(properties[Constant.ORIG_PROPS]);
          commit.addEdge(commitEdge);
        // Create Delete
        } else {
          actuallyDelete.push(edge.id);
        }
      // Updated Edges
      } else if (properties[Constant.STATUS] === 2) {
        let commitEdge =
          new CommitEdge(edge.id, edge.label, edge.from, edge.to);
        commitEdge.action = Constant.UPDATE;
        commitEdge.props = Util.getProperties(properties);
        commitEdge.origProps = JSON.parse(properties[Constant.ORIG_PROPS]);
        commit.addEdge(commitEdge);
      // Created Edges
      } else {
        let commitEdge =
          new CommitEdge(edge.id, edge.label, edge.from, edge.to);
        commitEdge.action = Constant.CREATE;
        commitEdge.props = Util.getProperties(properties);
        commit.addEdge(commitEdge);
      }
    }
    deletePromises = [];
    for (let id of actuallyDelete) {
      deletePromises.push(this._vagabond.removeEdge(id));
    }
    await Promise.all(deletePromises);

    return commit;
  }

  /**
   * Undo and wipe out any uncommitted changes.
   *
   * @return {Promise<Null>} A Promise resolving to Null.
   */
  async reset() {
    let query;
    let promises;
    let vagabond = this._vagabond;

    /* Changed Edges */
    promises = [];
    query = vagabond.query().hasNot(Constant.META).filter(Util.changedFilter);
    for (let edge of query.edges()) {
      let properties = await edge.getProperties();
      if (properties[Constant.STATUS] >= 4) {
        properties[Constant.STATUS] -= 4;
      }
      if (properties[Constant.STATUS] >= 2) {
        let newProperties = JSON.parse(properties[Constant.ORIG_PROPS]);
        newProperties[Constant.STATUS] = properties[Constant.STATUS] - 2;
        properties = newProperties;
      }
      if (properties[Constant.STATUS] > 0) {
        promises.push(vagabond.removeEdge(edge.id));
      } else {
        promises.push(edge.setProperties(properties));
      }
    }
    await Promise.all(promises);

    /* Changed Nodes */
    promises = [];
    query = vagabond.query().hasNot(Constant.META).filter(Util.changedFilter);
    for (let node of query.nodes()) {
      let properties = await node.getProperties();
      if (properties[Constant.STATUS] >= 4) {
        properties[Constant.STATUS] -= 4;
      }
      if (properties[Constant.STATUS] >= 2) {
        let newProperties;
        if (properties.hasOwnProperty(Constant.ORIG_PROPS)) {
          newProperties = JSON.parse(properties[Constant.ORIG_PROPS]);
        } else {
          newProperties = {};
          newProperties[Constant.REPO] = properties[Constant.ORIG_REPO];
        }
        newProperties[Constant.STATUS] = properties[Constant.STATUS] - 2;
        properties = newProperties;
      }
      if (properties[Constant.STATUS] > 0) {
        promises.push(vagabond.removeNode(node.id));
      } else {
        promises.push(node.setProperties(properties));
      }
    }
    await Promise.all(promises);

    this._dirty = false;

    return null;
  }

  /**
   * Commit any changes in the graph.
   *
   * @param  {String} author The author of the Commit.
   * @param  {Email} email The email of the author of this Commit.
   * @param  {String} message A Commit message.
   * @return {Promise<Commit>} A Promise resolving to the Commit.
   */
  async commit(author = null, email = null, message = null) {
    // Get and ensure we only have on latest commit node.
    let oldCommitEdge = null;
    let count = 0;
    for (let commitEdge of this._rootNode.getEdges(Direction.IN)) {
      oldCommitEdge = commitEdge;
      count++;
    }
    if (count > 1) {
      throw new Error('Invalid State: Multiple Commit Edges');
    }

    // Get a reference to the last commit node.
    let latestCommitNode;
    if (this._lastCommitNode !== null) {
      latestCommitNode = this._lastCommitNode;
    } else {
      latestCommitNode = this._rootNode;
    }

    // Get all uncommitted changes.
    let commit = await this.status(author, email, message);
    let promises;

    // Create new Commit Node
    let newCommitNode = await this._vagabond.addNode(commit.id,
      Constant.COMMIT_NODE_LABEL);
    let commitProperties = {};
    commitProperties[Constant.META] = Constant.COMMIT_NODE_META;
    commitProperties[Constant.COMMIT_NODE_ID] = commit.id;
    commitProperties[Constant.COMMIT_NODE_REPO] = commit.repo;
    commitProperties[Constant.COMMIT_NODE_TIMESTAMP] = commit.timestamp;
    commitProperties[Constant.COMMIT_NODE_AUTHOR] = commit.author;
    commitProperties[Constant.COMMIT_NODE_EMAIL] = commit.email;
    commitProperties[Constant.COMMIT_NODE_MESSAGE] = commit.message;
    commitProperties[Constant.COMMIT_NODE_NODES] = JSON.stringify(commit.nodes);
    commitProperties[Constant.COMMIT_NODE_EDGES] = JSON.stringify(commit.edges);
    await newCommitNode.setProperties(commitProperties);

    // Create Commit Edges
    let toNewCommit = await this._vagabond.addEdge(Util.generateUUIDv4(),
      Constant.COMMIT_EDGE_LABEL, latestCommitNode, newCommitNode);
    await toNewCommit.setProperty(Constant.META, Constant.COMMIT_EDGE_META);
    let fromNewCommit = await this._vagabond.addEdge(Util.generateUUIDv4(),
      Constant.COMMIT_EDGE_LABEL, newCommitNode, this._rootNode);
    await fromNewCommit.setProperty(Constant.META, Constant.COMMIT_EDGE_META);

    // Update Edges
    promises = [];
    for (let commitEdge of commit.edges) {
      let edge = await this._vagabond.getEdge(commitEdge.id);
      switch (commitEdge.action) {
        case Constant.CREATE:
          promises.push(edge.setProperty(Constant.STATUS, 0));
          break;
        case Constant.UPDATE:
          promises.push(edge.removeProperty(Constant.ORIG_PROPS));
          promises.push(edge.setProperty(Constant.STATUS, 0));
          break;
        case Constant.DELETE:
          promises.push(this._vagabond.removeEdge(commitEdge.id));
          break;
      }
    }
    await Promise.all(promises);

    // Update Nodes
    promises = [];
    for (let commitNode of commit.nodes) {
      let node = await this._vagabond.getNode(commitNode.id);
      switch (commitNode.action) {
        case Constant.CREATE:
          promises.push(node.setProperty(Constant.STATUS, 0));
          break;
        case Constant.UPDATE:
          promises.push(node.removeProperty(Constant.ORIG_PROPS));
          promises.push(node.removeProperty(Constant.ORIG_REPO));
          promises.push(node.setProperty(Constant.STATUS, 0));
          break;
        case Constant.DELETE:
          promises.push(this._vagabond.removeNode(commitNode.id));
          break;
      }
    }
    await Promise.all(promises);

    // Remove old commit edge.
    if (oldCommitEdge !== null) {
      await this._vagabond.removeEdge(oldCommitEdge.id);
    }

    this._lastCommit = commit.id;
    this._lastCommitNode = newCommitNode;
    this._dirty = false;

    return commit;
  }

  /**
   * Undo commits until id is the last commit.
   *
   * @param  {CommitId} id The Commit Id.
   * @return {Promise<CommitId[]>} A Promise resolving to
   * an array of undone Commit IDs.
   */
  async undo(id) {
    if (!Util.isValidUUIDv4(id)) {
      throw new Error('Invalid Id');
    }

    if (this._dirty) {
      throw new Error('Dirty Graph');
    }

    // Ensure Commit Node Exists
    let targetCommitNode = await this._vagabond.getNode(id);
    if (targetCommitNode.label !== Constant.COMMIT_NODE_LABEL) {
      throw new Error('Commit Not Found');
    }

    let undoneCommits = [];
    while (this._lastCommit !== id) {
      let newLastCommitNode = null;
      for (let node of this._lastCommitNode.getNodes(Direction.IN)) {
        newLastCommitNode = node;
      }
      let newEdge = await this._vagabond.addEdge(Util.generateUUIDv4(),
        Constant.COMMIT_EDGE_LABEL, newLastCommitNode, this._rootNode);
      await newEdge.setProperty(Constant.META, Constant.COMMIT_EDGE_META);

      let commit = await this._inflateCommit(this._lastCommitNode);

      await this._undoCommit(commit);

      await this._vagabond.removeNode(this._lastCommit);

      this._lastCommit = newLastCommitNode.id;
      this._lastCommitNode = newLastCommitNode;
      undoneCommits.push(commit.id);
    }

    return undoneCommits;
  }

  async _undoCommit(commit) {
    /* Deleted Nodes */
    for (let commitNode of commit.nodes) {
      if (commitNode.action !== Constant.DELETE) {
        continue;
      }
      let node = await this._vagabond.addNode(commitNode.id,
          commitNode.label);
      let properties = {};
      if (commitNode.boundary) {
        properties[Constant.REPO] = commitNode.origRepo;
      } else {
        properties = commitNode.origProps;
      }
      properties[Constant.STATUS] = 0;
      await node.setProperties(properties);
    }

    /* Deleted, Updated, and Created Edges */
    for (let commitEdge of commit.edges) {
      if (commitEdge.action === Constant.DELETE) {
        let fromNode = await this._vagabond.getNode(commitEdge.from);
        let toNode = await this._vagabond.getNode(commitEdge.to);
        let edge = await this._vagabond.addEdge(commitEdge.id,
          commitEdge.label, fromNode, toNode);
        let properties = commitEdge.origProps;
        properties[Constant.STATUS] = 0;
        await edge.setProperties(properties);
      }
      if (commitEdge.action === Constant.UPDATE) {
        let edge = await this._vagabond.getEdge(commitEdge.id);
        let properties = await edge.getProperties();
        let oldProperties = Util.getProperties(properties);
        let newProperties = commitEdge.origProps;
        for (let key of Object.keys(oldProperties)) {
          delete properties[key];
        }
        for (let key of Object.keys(newProperties)) {
          properties[key] = newProperties[key];
        }
        properties[Constant.STATUS] = 0;
        await edge.setProperties(properties);
      }
      if (commitEdge.action === Constant.CREATE) {
        await this._vagabond.removeEdge(commitEdge.id);
      }
    }

    /* Updated and Created Nodes */
    for (let commitNode of commit.nodes) {
      if (commitNode.action === Constant.UPDATE) {
        let node = await this._vagabond.getNode(commitNode.id);
        let properties = await node.getProperties();
        if (commitNode.boundary) {
          if (commitNode.origProps) {
            delete properties[Constant.REPO];
            let newProperties = commitNode.origProps;
            for (let key of Object.keys(newProperties)) {
              properties[key] = newProperties[key];
            }
          } else {
            properties[Constant.REPO] = commitNode.origRepo;
          }
        } else {
          if (commitNode.origRepo) {
            let oldProperties = Util.getProperties(properties);
            for (let key of Object.keys(oldProperties)) {
              delete properties[key];
            }
            properties[Constant.REPO] = commitNode.origRepo;
          } else {
            let oldProperties = Util.getProperties(properties);
            let newProperties = commitNode.origProps;
            for (let key of Object.keys(oldProperties)) {
              delete properties[key];
            }
            for (let key of Object.keys(newProperties)) {
              properties[key] = newProperties[key];
            }
          }
        }
        properties[Constant.STATUS] = 0;
        await node.setProperties(properties);
      }
      if (commitNode.action === Constant.CREATE) {
        await this._vagabond.removeNode(commitNode.id);
      }
    }
  }

  /**
   * Apply a commit to this vGraph instance.
   *
   * @param  {Commit} commit the Commit to apply.
   */
  async patch(commit) {
    try {
      commit.validate();
    } catch (error) {
      error.message = 'Invalid Commit: ' + error.message;
      throw error;
    }

    if (commit.prev !== this._lastCommit) {
      throw new Error('Previous Commit Mismatch');
    }

    if (this._dirty) {
      throw new Error('Dirty Graph');
    }

    // Get and ensure we only have on latest commit node.
    let oldCommitEdge = null;
    let count = 0;
    for (let commitEdge of this._rootNode.getEdges(Direction.IN)) {
      oldCommitEdge = commitEdge;
      count++;
    }
    if (count > 1) {
      throw new Error('Invalid State: Multiple Commit Edges');
    }

    // Get a reference to the last commit node.
    let latestCommitNode;
    if (this._lastCommitNode !== null) {
      latestCommitNode = this._lastCommitNode;
    } else {
      latestCommitNode = this._rootNode;
    }

    // Create new Commit Node
    let newCommitNode = await this._vagabond.addNode(commit.id,
      Constant.COMMIT_NODE_LABEL);
    let commitProperties = {};
    commitProperties[Constant.META] = Constant.COMMIT_NODE_META;
    commitProperties[Constant.COMMIT_NODE_ID] = commit.id;
    commitProperties[Constant.COMMIT_NODE_REPO] = commit.repo;
    commitProperties[Constant.COMMIT_NODE_TIMESTAMP] = commit.timestamp;
    commitProperties[Constant.COMMIT_NODE_AUTHOR] = commit.author;
    commitProperties[Constant.COMMIT_NODE_EMAIL] = commit.email;
    commitProperties[Constant.COMMIT_NODE_MESSAGE] = commit.message;
    commitProperties[Constant.COMMIT_NODE_NODES] = JSON.stringify(commit.nodes);
    commitProperties[Constant.COMMIT_NODE_EDGES] = JSON.stringify(commit.edges);
    await newCommitNode.setProperties(commitProperties);

    // Create Commit Edges
    let toNewCommit = await this._vagabond.addEdge(Util.generateUUIDv4(),
      Constant.COMMIT_EDGE_LABEL, latestCommitNode, newCommitNode);
    await toNewCommit.setProperty(Constant.META, Constant.COMMIT_EDGE_META);
    let fromNewCommit = await this._vagabond.addEdge(Util.generateUUIDv4(),
      Constant.COMMIT_EDGE_LABEL, newCommitNode, this._rootNode);
    await fromNewCommit.setProperty(Constant.META, Constant.COMMIT_EDGE_META);

    /* Create/Update Node */
    for (let commitNode of commit.nodes) {
      if (commitNode.action === Constant.DELETE) {
        continue;
      }
      if (commitNode.action === Constant.CREATE) {
        let node;
        try {
          node = await this._vagabond.getNode(commitNode.id);
          throw new Error('Node Exists');
        } catch (error) {
          if (error.message !== 'Node Not Found') {
            throw error;
          }
          node = await this._vagabond.addNode(commitNode.id,
            commitNode.label);
          let properties = {};
          if (commitNode.boundary) {
            properties[Constant.REPO] = commitNode.repo;
          } else {
            properties = commitNode.props;
          }
          properties[Constant.STATUS] = 0;
          await node.setProperties(properties);
        }
      }
      if (commitNode.action === Constant.UPDATE) {
        let node = await this._vagabond.getNode(commitNode.id);
        if (node.label !== commitNode.label) {
          throw new Error('Label Mismatch');
        }
        let properties = {};
        if (commitNode.boundary) {
          properties[Constant.REPO] = commitNode.repo;
        } else {
          properties = commitNode.props;
        }
        properties[Constant.STATUS] = 0;
        await node.setProperties(properties);
      }
    }

    /* Create/Update/Delete Edge */
    for (let commitEdge of commit.edges) {
      if (commitEdge.action === Constant.CREATE) {
        let edge;
        try {
          edge = await this._vagabond.getEdge(commitEdge.id);
          throw new Error('Edge Exists');
        } catch (error) {
          if (error.message !== 'Edge Not Found') {
            throw error;
          }
          let fromNode = await this._vagabond.getNode(commitEdge.from);
          let toNode = await this._vagabond.getNode(commitEdge.to);
          edge = await this._vagabond.addEdge(commitEdge.id,
            commitEdge.label, fromNode, toNode);
          let properties = commitEdge.props;
          properties[Constant.STATUS] = 0;
          await edge.setProperties(properties);
        }
      }
      if (commitEdge.action === Constant.UPDATE) {
        let edge = await this._vagabond.getEdge(commitEdge.id);
        if (edge.label !== commitEdge.label) {
          throw new Error('Label Mismatch');
        }
        if (edge.from !== commitEdge.from) {
          throw new Error('From Mismatch');
        }
        if (edge.to !== commitEdge.to) {
          throw new Error('To Mismatch');
        }
        let properties = commitEdge.props;
        properties[Constant.STATUS] = 0;
        await edge.setProperties(properties);
      }
      if (commitEdge.action === Constant.DELETE) {
        let edge = await this._vagabond.getEdge(commitEdge.id);
        if (edge.label !== commitEdge.label) {
          throw new Error('Label Mismatch');
        }
        if (edge.from !== commitEdge.from) {
          throw new Error('From Mismatch');
        }
        if (edge.to !== commitEdge.to) {
          throw new Error('To Mismatch');
        }
        await this._vagabond.removeEdge(commitEdge.id);
      }
    }

    /* Delete Node */
    for (let commitNode of commit.nodes) {
      if (commitNode.action !== Constant.DELETE) {
        continue;
      }
      let node = await this._vagabond.getNode(commitNode.id);
      if (node.label !== commitNode.label) {
        throw new Error('Label Mismatch');
      }
      let properties = await node.getProperties();
      if (commitNode.boundary) {
        if (!properties.hasOwnProperty(Constant.REPO)) {
          throw new Error('Boundary Mismatch');
        }
        await this._vagabond.removeNode(commitNode.id);
      } else {
        if (properties.hasOwnProperty(Constant.REPO)) {
          throw new Error('Node Mismatch');
        }
        await this._vagabond.removeNode(commitNode.id);
      }
    }

    // Remove old commit edge.
    if (oldCommitEdge !== null) {
      await this._vagabond.removeEdge(oldCommitEdge.id);
    }

    this._lastCommit = commit.id;
    this._lastCommitNode = newCommitNode;
  }

  /**
   * Clone the graph maintaining history,
   * optionally limited to the passed in Node IDs.
   *
   * @return {Promise<Commit[]>} A Promise resolving to an array of Commits.
   */
  async clone() {
    if (this._dirty) {
      throw new Error('Dirty Graph');
    }
    let commits = [];
    let lastCommit = null;
    for (let node of this._commitNodes(Direction.OUT)) {
      let commit = await this._inflateCommit(node, lastCommit);
      lastCommit = commit.id;
      commits.push(commit);
    }
    return commits;
  }

  /**
   * Copy the graph, not maintaining history,
   * optionally limited to the passed in Node IDs.
   *
   * @param  {String} author The author of the Commit.
   * @param  {Email} email The email of the author of this Commit.
   * @param  {String} message A Commit message.
   * @param  {Id[]}  nodes Node IDs.
   * @return {Promise<Commit>} A Promise resolving to a Commit.
   */
  async copy(author, email, message, nodes = []) {
    if (this._dirty) {
      throw new Error('Dirty Graph');
    }

    let commit = new Commit();
    commit.id = Util.generateUUIDv4();
    commit.repo = this._repo;
    commit.timestamp = Date.now();
    commit.author = author;
    commit.email = email;
    commit.message = message;

    if (nodes.length === 0) {
      let query = this._vagabond.query().hasNot(Constant.META);
      for (let node of query.nodes()) {
        let properties = await node.getProperties();
        let commitNode = new CommitNode(node.id, node.label);
        commitNode.action = Constant.CREATE;
        if (properties.hasOwnProperty(Constant.REPO)) {
          commitNode.boundary = true;
          commitNode.repo = properties[Constant.REPO];
        } else {
          commitNode.boundary = false;
          commitNode.props = Util.getProperties(properties);
        }
        commit.addNode(commitNode);
      }
      for (let edge of query.edges()) {
        let properties = await edge.getProperties();
        let commitEdge = new CommitEdge(edge.id, edge.label,
          edge.from, edge.to);
        commitEdge.action = Constant.CREATE;
        commitEdge.props = Util.getProperties(properties);
        commit.addEdge(commitEdge);
      }
    } else {
      let nodesTouched = new Set();
      let query = this._vagabond.query().hasNot(Constant.META);

      for (let node of query.nodes()) {
        if (nodes.indexOf(node.id) === -1) {
          continue;
        }
        let properties = await node.getProperties();
        let commitNode = new CommitNode(node.id, node.label);
        commitNode.action = Constant.CREATE;
        if (properties.hasOwnProperty(Constant.REPO)) {
          commitNode.boundary = true;
          commitNode.repo = properties[Constant.REPO];
        } else {
          commitNode.boundary = false;
          commitNode.props = Util.getProperties(properties);
        }
        commit.addNode(commitNode);

        for (let edge of node.getEdges(Direction.BOTH)) {
          if (commit.hasEdge(edge.id)) {
            continue;
          }
          let properties = await edge.getProperties();
          let commitEdge = new CommitEdge(edge.id, edge.label,
            edge.from, edge.to);
          commitEdge.action = Constant.CREATE;
          commitEdge.props = Util.getProperties(properties);
          commit.addEdge(commitEdge);

          nodesTouched.add(edge.from);
          nodesTouched.add(edge.to);
        }
      }

      for (let id of nodesTouched) {
        if (commit.hasNode(id)) {
          continue;
        }
        let node = await this._vagabond.getNode(id);
        let properties = await node.getProperties();
        let commitNode = new CommitNode(node.id, node.label);
        commitNode.action = Constant.CREATE;
        commitNode.boundary = true;
        if (properties.hasOwnProperty(Constant.REPO)) {
          commitNode.repo = properties[Constant.REPO];
        } else {
          commitNode.repo = this._repo;
        }
        commit.addNode(commitNode);
      }
    }

    return commit;
  }

  /**
   * Reformats a Commit so it can be applied to this Repository.
   *
   * @param  {Commit} commit The Commit to reformat.
   * @return {Promise<Commit>} A Promise resolving to a Commit.
   */
  async merge(commit) {
    commit.validate();
    if (this._dirty) {
      throw new Error('Dirty Graph');
    }

    let refSet = new Set();
    let newCommit = new Commit();
    newCommit.id = Util.generateUUIDv4();
    if (this._lastCommit) {
      newCommit.prev = this._lastCommit;
    }
    newCommit.timestamp = Date.now();
    newCommit.repo = commit.repo;
    newCommit.author = commit.author;
    newCommit.email = commit.email;
    newCommit.message = commit.message;

    /* Edges */
    for (let commitEdge of commit.edges) {
      let edge = null;
      let properties;
      try {
        edge = await this._vagabond.getEdge(commitEdge.id);
        properties = await edge.getProperties();
      } catch (error) {
        if (error.message !== 'Edge Not Found') {
          throw error;
        }
      }
      if (commitEdge === Constant.CREATE || commitEdge === Constant.UPDATE) {
        refSet.add(commitEdge.from);
        refSet.add(commitEdge.to);
        if (edge !== null) {
          let newCommitEdge = new CommitEdge(commitEdge.id, commitEdge.label,
            commitEdge.from, commitEdge.to);
          newCommitEdge.action = Constant.UPDATE;
          newCommitEdge.props = commitEdge.props;
          newCommitEdge.origProps = Util.getProperties(properties);
          newCommit.addEdge(newCommitEdge);
        } else {
          let newCommitEdge = new CommitEdge(commitEdge.id, commitEdge.label,
            commitEdge.from, commitEdge.to);
          newCommitEdge.action = Constant.CREATE;
          newCommitEdge.props = commitEdge.props;
          newCommit.addEdge(newCommitEdge);
        }
      }
      if (commitEdge === Constant.DELETE) {
        if (edge !== null) {
          let newCommitEdge = new CommitEdge(commitEdge.id, commitEdge.label,
            commitEdge.from, commitEdge.to);
          newCommitEdge.action = Constant.DELETE;
          newCommitEdge.origProps = Util.getProperties(properties);
          newCommit.addEdge(newCommitEdge);
        } else {
          continue;
        }
      }
    }

    /* Nodes */
    for (let commitNode of commit.nodes) {
      let node = null;
      let properties;
      try {
        node = await this._vagabond.getNode(commitNode.id);
        properties = await node.getProperties();
      } catch (error) {
        if (error.message !== 'Node Not Found') {
          throw error;
        }
      }
      if ((commitNode.action === Constant.CREATE ||
          commitNode.action === Constant.UPDATE) && !commitNode.boundary) {
        if (node !== null && !properties.hasOwnProperty(Constant.REPO)) {
          let newCommitNode = new CommitNode(commitNode.id, commitNode.label);
          newCommitNode.action = Constant.UPDATE;
          newCommitNode.boundary = false;
          newCommitNode.props = commitNode.props;
          newCommitNode.origProps = Util.getProperties(properties);
          newCommit.addNode(newCommitNode);
        } else if (node !== null && properties.hasOwnProperty(Constant.REPO)) {
          let newCommitNode = new CommitNode(commitNode.id, commitNode.label);
          newCommitNode.action = Constant.UPDATE;
          newCommitNode.boundary = false;
          newCommitNode.props = commitNode.props;
          newCommitNode.origRepo = properties[Constant.REPO];
          newCommit.addNode(newCommitNode);
        } else {
          let newCommitNode = new CommitNode(commitNode.id, commitNode.label);
          newCommitNode.action = Constant.CREATE;
          newCommitNode.boundary = false;
          newCommitNode.props = commitNode.props;
          newCommit.addNode(newCommitNode);
        }
      }
      if (commitNode.action === Constant.DELETE && !commitNode.boundary) {
        if (node !== null && !properties.hasOwnProperty(Constant.REPO)) {
          let newCommitNode = new CommitNode(commitNode.id, commitNode.label);
          newCommitNode.action = Constant.DELETE;
          newCommitNode.boundary = false;
          newCommitNode.origProps = Util.getProperties(properties);
          newCommit.addNode(newCommitNode);
        } else if (node !== null && properties.hasOwnProperty(Constant.REPO)) {
          let newCommitNode = new CommitNode(commitNode.id, commitNode.label);
          newCommitNode.action = Constant.DELETE;
          newCommitNode.boundary = true;
          newCommitNode.origRepo = properties[Constant.REPO];
          newCommit.addNode(newCommitNode);
        } else {
          continue;
        }
      }
      if ((commitNode.action === Constant.CREATE ||
          commitNode.action === Constant.UPDATE) && commitNode.boundary) {
        if (node !== null && !properties.hasOwnProperty(Constant.REPO)) {
          continue;
        } else if (node !== null && properties.hasOwnProperty(Constant.REPO)) {
          let newCommitNode = new CommitNode(commitNode.id, commitNode.label);
          newCommitNode.action = Constant.UPDATE;
          newCommitNode.boundary = true;
          newCommitNode.repo = commitNode.repo;
          newCommitNode.origRepo = properties[Constant.REPO];
          newCommit.addNode(newCommitNode);
        } else {
          let newCommitNode = new CommitNode(commitNode.id, commitNode.label);
          newCommitNode.action = Constant.CREATE;
          newCommitNode.boundary = true;
          newCommitNode.repo = commitNode.repo;
          newCommit.addNode(newCommitNode);
        }
      }
      if (commitNode.action === Constant.DELETE && commitNode.boundary) {
        if (node !== null && properties.hasOwnProperty(Constant.REPO)) {
          let newCommitNode = new CommitNode(commitNode.id, commitNode.label);
          newCommitNode.action = Constant.DELETE;
          newCommitNode.boundary = true;
          newCommitNode.origRepo = properties[Constant.REPO];
          newCommit.addNode(newCommitNode);
        } else {
          continue;
        }
      }
      if (commitNode.action === Constant.REFERENCE &&
          refSet.has(commitNode.id)) {
        if (node !== null) {
          continue;
        } else {
          let newCommitNode = new CommitNode(commitNode.id, commitNode.label);
          newCommitNode.action = Constant.CREATE;
          newCommitNode.boundary = true;
          newCommitNode.repo = commitNode.repo;
          newCommit.addNode(newCommitNode);
        }
      }
    }

    return newCommit;
  }

  async _inflateCommit(node, prev = null) {
    let properties = await node.getProperties();

    let commit = new Commit();
    commit.id = node.id;
    if (prev !== null) {
      commit.prev = prev;
    }
    commit.repo = properties[Constant.COMMIT_NODE_REPO];
    commit.timestamp = properties[Constant.COMMIT_NODE_TIMESTAMP];
    commit.author = properties[Constant.COMMIT_NODE_AUTHOR];
    commit.email = properties[Constant.COMMIT_NODE_EMAIL];
    commit.message = properties[Constant.COMMIT_NODE_MESSAGE];

    let commitNodes = JSON.parse(properties[Constant.COMMIT_NODE_NODES]);
    for (let commitNode of commitNodes) {
      let newCommitNode = new CommitNode();
      newCommitNode.fromJSON(commitNode);
      commit.addNode(newCommitNode);
    }

    let commitEdges = JSON.parse(properties[Constant.COMMIT_NODE_EDGES]);
    for (let commitEdge of commitEdges) {
      let newCommitEdge = new CommitEdge();
      newCommitEdge.fromJSON(commitEdge);
      commit.addEdge(newCommitEdge);
    }

    return commit;
  }

  * _commitNodes(direction) {
    if (this._lastCommitNode !== null) {
      let currentNode = this._nextCommitNode(this._rootNode, direction);
      while (currentNode !== null && currentNode.id !== Constant.ROOT_ID) {
        yield currentNode;
        currentNode = this._nextCommitNode(currentNode, direction);
      }
    }
  }

  _nextCommitNode(node, direction) {
    for (let nextNode of node.getNodes(direction)) {
      return nextNode;
    }
    return null;
  }

}

export {
  VGraph as default,
  VGraph as VGraph,
  Edge as Edge,
  Node as Node,
  Commit as Commit,
  Constant as Constant,
  Direction as Direction,
  Util as Util,
};
