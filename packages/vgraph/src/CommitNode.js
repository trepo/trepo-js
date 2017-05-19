const Util = require('./Util.js');

/**
 * A Commit Node.
 */
class CommitNode {

  /**
   * Create a new CommitNode.
   *
   * @param {Id} id The Id.
   * @param {Label} label The Label.
   */
  constructor(id = null, label = null) {
    if (id !== null) {
      this.id = id;
    }
    if (label !== null) {
      this.label = label;
    }
  }

  get id() {
    return this._id;
  }

  /**
   * The Node's ID.
   *
   * @param {Id} value The node id.
   */
  set id(value) {
    if (!Util.isValidUUIDv4(value)) {
      throw new Error('Invalid id');
    }
    this._id = value;
  }

  get label() {
    return this._label;
  }

  /**
   * The Node's Label.
   *
   * @param {Label} value The node label.
   */
  set label(value) {
    if (!Util.isValidLabel(value)) {
      throw new Error('Invalid label');
    }
    this._label = value;
  }

  get action() {
    return this._action;
  }

  /**
   * The action to take when applying this change.
   * May be `create`, `update`, or `delete`.
   *
   * @param {Action} value The node action.
   */
  set action(value) {
    if (value !== 'create' && value !== 'update' &&
      value !== 'delete' && value !== 'reference') {
      throw new Error('Invalid action');
    }
    this._action = value;
  }

  get boundary() {
    return this._boundary;
  }

  /**
   * If this Node is a Boundary Node.
   *
   * @param {Boolean} value If the node is a boundary.
   */
  set boundary(value) {
    if (typeof value !== 'boolean') {
      throw new Error('Invalid boundary');
    }
    this._boundary = value;
  }

  get repo() {
    return this._repo;
  }

  /**
   * The Repository this Node belongs to.
   *
   * @param {Repo} value The node's repo.
   */
  set repo(value) {
    if (typeof value !== 'string') {
      throw new Error('Invalid repo');
    }
    this._repo = value;
  }

  get origRepo() {
    return this._origRepo;
  }

  /**
   * The Repository this Node originally belongs to.
   *
   * @param {Repo} value The node's original repo.
   */
  set origRepo(value) {
    if (typeof value !== 'string') {
      throw new Error('Invalid origRepo');
    }
    this._origRepo = value;
  }

  get origProps() {
    return this._origProps;
  }

  /**
   * The original Properties (Set on Action: `delete`).
   *
   * @param {Object} value The original properties.
   */
  set origProps(value) {
    if (typeof value !== 'object') {
      throw new Error('Invalid origProps');
    }
    this._origProps = value;
  }

  get props() {
    return this._props;
  }

  /**
   * The new props (Set on Action: `create` or `update`).
   *
   * @param {Object} value The new properties.
   */
  set props(value) {
    if (typeof value !== 'object') {
      throw new Error('Invalid props');
    }
    this._props = value;
  }

  /**
   * Validates this Commit Node.
   */
  validate() {
    if (!this._id) {
      throw new Error('Missing id');
    }

    if (!this._label) {
      throw new Error('Missing label');
    }

    if (!this._action) {
      throw new Error('Missing action');
    }

    if (this._boundary === undefined) {
      throw new Error('Missing boundary');
    }

    if (this._boundary) {
      switch (this._action) {
        case 'create':
          if (this._repo === undefined ||
              this._origRepo !== undefined ||
              this._props !== undefined ||
              this._origProps !== undefined) {
            throw new Error('only repo ' +
              'must be set on create boundary');
          }
          break;
        case 'update':
          if (this._repo === undefined ||
              (this._origRepo !== undefined && this._origProps !== undefined) ||
              (this._origRepo === undefined && this._origProps === undefined) ||
              this._props !== undefined) {
            throw new Error('repo and one of origRepo or origProps ' +
              'must be set on update boundary');
          }
          break;
        case 'delete':
          if (this._repo !== undefined ||
              this._origRepo === undefined ||
              this._props !== undefined ||
              this._origProps !== undefined) {
            throw new Error('only origRepo ' +
              'must be set on delete boundary');
          }
          break;
        case 'reference':
          if (this._repo === undefined ||
              this._origRepo !== undefined ||
              this._props !== undefined ||
              this._origProps !== undefined) {
            throw new Error('only repo ' +
              'must be set on create reference');
          }
          break;
        default:
          throw new Error('Invalid Action');
      }
    } else {
      switch (this._action) {
        case 'create':
          if (this._repo !== undefined ||
              this._origRepo !== undefined ||
              this._props === undefined ||
              this._origProps !== undefined) {
            throw new Error('only props ' +
              'must be set on create');
          }
          break;
        case 'update':
          if (this._repo !== undefined ||
              (this._origRepo !== undefined && this._origProps !== undefined) ||
              (this._origRepo === undefined && this._origProps === undefined) ||
              this._props === undefined) {
            throw new Error('props and one of origRepo or origProps ' +
              'must be set on update');
          }
          break;
        case 'delete':
          if (this._repo !== undefined ||
              this._origRepo !== undefined ||
              this._props !== undefined ||
              this._origProps === undefined) {
            throw new Error('only origProps ' +
              'must be set on delete');
          }
          break;
        case 'reference':
          throw new Error('reference is only allowed for boundaries');
        default:
          throw new Error('Invalid Action');
      }
    }
  }

  /**
   * Initialize this Node from JSON.
   *
   * @param  {Object} obj The JSON Object.
   * @return {CommitNode} this node.
   */
  fromJSON(obj) {
    this.id = obj.id;
    this.label = obj.label;
    this.action = obj.action;
    this.boundary = obj.boundary;
    if (obj.repo !== undefined) {
      this.repo = obj.repo;
    }
    if (obj.origRepo !== undefined) {
      this.origRepo = obj.origRepo;
    }
    if (obj.props !== undefined) {
      this.props = obj.props;
    }
    if (obj.origProps !== undefined) {
      this.origProps = obj.origProps;
    }

    return this;
  }

  /**
   * Serialize this Node to JSON.
   *
   * @return {JSON} Pure JSON.
   */
  toJSON() {
    return {
      id: this._id,
      label: this._label,
      action: this._action,
      boundary: this._boundary,
      repo: this._repo,
      origRepo: this._origRepo,
      props: this._props,
      origProps: this._origProps,
    };
  }

}

module.exports = CommitNode;
