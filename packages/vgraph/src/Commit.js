const CommitNode = require('./CommitNode.js');
const CommitEdge = require('./CommitEdge.js');
const Constant = require('./Constant.js');
const Util = require('./Util.js');

/**
 * A Universally Unique Identifier (UUIDv4) assigned to an Commit.
 *
 * @typedef {String} CommitId
 */

/**
 * The action to take when applying this change to vGraph.
 * Can be one of `create`, `update`, or `delete`.
 *
 * @typedef {String} Action
 */

/**
 * A vGraph Commit.
 */
class Commit {

  /**
   * Create a new Commit.
   */
  constructor() {
    this._prev = null; // Default prev to null
    this._nodes = [];
    this._nodesSet = new Set();
    this._edges = [];
    this._edgesSet = new Set();
  }

  get version() {
    return Constant.COMMIT_VERSION;
  }

  /**
   * The Commit syntax version.
   *
   * @param {Integer} value The value.
   */
  set version(value) {
    throw new Error('Cannot set version');
  }

  get id() {
    return this._id;
  }

  /**
   * The commit ID.
   *
   * @param {Id} value The commit id.
   */
  set id(value) {
    if (!Util.isValidUUIDv4(value)) {
      throw new Error('Invalid id');
    }
    this._id = value;
  }

  get prev() {
    return this._prev;
  }

  /**
   * The previous commit ID.
   *
   * @param {Id} value The previous commit id.
   */
  set prev(value) {
    if (!Util.isValidUUIDv4(value)) {
      throw new Error('Invalid prev');
    }
    this._prev = value;
  }

  get repo() {
    return this._repo;
  }

  /**
   * The Repository this Commit belongs to.
   *
   * @param {Repo} value The repository.
   */
  set repo(value) {
    if (typeof value !== 'string') {
      throw new Error('Invalid repo');
    }
    this._repo = value;
  }

  get timestamp() {
    return this._timestamp;
  }

  /**
   * When this Commit was made (milliseconds from epoch).
   *
   * @param {Integer} value The timestamp.
   */
  set timestamp(value) {
    if (typeof value !== 'number') {
      throw new Error('Invalid timestamp');
    }
    this._timestamp = value;
  }

  get author() {
    return this._author;
  }

  /**
   * The name of the person authoring this Commit.
   *
   * @param {String} value The author.
   */
  set author(value) {
    if (typeof value !== 'string') {
      throw new Error('Invalid author');
    }
    this._author = value;
  }

  get email() {
    return this._email;
  }

  /**
   * The email of the person authoring this Commit.
   *
   * @param {Email} value The email.
   */
  set email(value) {
    if (typeof value !== 'string') {
      throw new Error('Invalid email');
    }
    this._email = value;
  }

  get message() {
    return this._message;
  }

  /**
   * The message associated with this Commit.
   *
   * @param {String} value The message.
   */
  set message(value) {
    if (typeof value !== 'string') {
      throw new Error('Invalid message');
    }
    this._message = value;
  }

  get nodes() {
    return this._nodes;
  }

  /**
   * The Commit Nodes in this Commit.
   *
   * @param {CommitNode[]} value The commit nodes.
   */
  set nodes(value) {
    throw new Error('Cannot set nodes');
  }

  /**
   * Gets a CommitNode by ID.
   *
   * @param  {ID} id The Commit Node ID.
   * @return {CommitNode} The Commit Node.
   */
  getNode(id) {
    for (let node of this._nodes) {
      if (node.id === id) {
        return node;
      }
    }
    throw new Error('Node not found');
  }

  /**
   * Returns True if the ID is in the set of Commit Nodes.
   *
   * @param  {Id} id The Commit Node Id.
   * @return {Boolean} True if the Node is present, false otherwise.
   */
  hasNode(id) {
    return this._nodesSet.has(id);
  }

  /**
   * Add a Node to this Commit.
   *
   * @param {CommitNode} commitNode The Commit Node.
   */
  addNode(commitNode) {
    if (!(commitNode instanceof CommitNode)) {
      throw new Error('Invalid CommitNode');
    }
    commitNode.validate();
    if (this._nodesSet.has(commitNode.id)) {
      throw new Error('Duplicate CommitNode');
    }
    this._nodesSet.add(commitNode.id);
    this._nodes.push(commitNode);
  }

  get edges() {
    return this._edges;
  }

  /**
   * The Commit Edges in this Commit.
   *
   *  @param {CommitEdge[]} value The commit edges.
   */
  set edges(value) {
    throw new Error('Cannot set edges');
  }

  /**
   * Gets a CommitEdge by ID.
   *
   * @param  {ID} id The Commit Edge ID.
   * @return {CommitEdge} The Commit Edge.
   */
  getEdge(id) {
    for (let edge of this._edges) {
      if (edge.id === id) {
        return edge;
      }
    }
    throw new Error('Edge not found');
  }

  /**
   * Returns True if the ID is in the set of Commit Edges.
   *
   * @param  {Id} id The Commit Edge Id.
   * @return {Boolean} True if the Edge is present, false otherwise.
   */
  hasEdge(id) {
    return this._edgesSet.has(id);
  }

  /**
   * Add an Edge to this Commit.
   *
   * @param {CommitEdge} commitEdge The Commit Edge.
   */
  addEdge(commitEdge) {
    if (!(commitEdge instanceof CommitEdge)) {
      throw new Error('Invalid CommitEdge');
    }
    commitEdge.validate();
    if (this._edgesSet.has(commitEdge.id)) {
      throw new Error('Duplicate CommitEdge');
    }
    this._edgesSet.add(commitEdge.id);
    this._edges.push(commitEdge);
  }

  /**
   * Validates this Commit.
   */
  validate() {
    if (!this._id) {
      throw new Error('Missing id');
    }

    if (!this._repo) {
      throw new Error('Missing repo');
    }

    if (!this._timestamp) {
      throw new Error('Missing timestamp');
    }

    if (this._author === undefined) {
      throw new Error('Missing author');
    }

    if (this._email === undefined) {
      throw new Error('Missing email');
    }

    if (this._message === undefined) {
      throw new Error('Missing message');
    }

    for (let edge of this._edges) {
      if (!this._nodesSet.has(edge.from)) {
        throw new Error('CommitEdge ' +
          edge.id + ' references non-existing from');
      }
      if (!this._nodesSet.has(edge.to)) {
        throw new Error('CommitEdge ' +
          edge.id + ' references non-existing to');
      }
    }
  }

  /**
   * Initialize this Commit from JSON.
   *
   * @param  {Object} obj The JSON Object.
   * @return {Commit} this commit.
   */
  fromJSON(obj) {
    obj = JSON.parse(JSON.stringify(obj));
    if (obj.version !== this.version) {
      throw new Error('Invalid version');
    }

    this.id = obj.id;
    if (obj.prev) {
      this.prev = obj.prev;
    }
    this.repo = obj.repo;
    this.timestamp = obj.timestamp;
    this.author = obj.author;
    this.email = obj.email;
    this.message = obj.message;

    for (let node of obj.nodes) {
      this.addNode(new CommitNode().fromJSON(node));
    }

    for (let edge of obj.edges) {
      this.addEdge(new CommitEdge().fromJSON(edge));
    }

    return this;
  }

  /**
   * Serialize this Commit to JSON.
   *
   * @return {JSON} Pure JSON.
   */
  toJSON() {
    let json = {
      version: this.version,
      id: this._id,
      prev: this._prev,
      repo: this._repo,
      timestamp: this._timestamp,
      author: this._author,
      email: this._email,
      message: this._message,
      nodes: [],
      edges: [],
    };

    for (let node of this._nodes) {
      json.nodes.push(node.toJSON());
    }

    for (let edge of this._edges) {
      json.edges.push(edge.toJSON());
    }

    return json;
  }

}

module.exports = Commit;
