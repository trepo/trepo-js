import Constant from './Constant.js';
import Util from './Util.js';

/**
 * A Commit Edge.
 */
class CommitEdge {

  /**
   * Create a new CommitEdge
   *
   * @param {Id} id The Id.
   * @param {Label} label The Label.
   * @param {Id} from The From Id.
   * @param {Id} to The To Id.
   */
  constructor(id = null, label = null, from = null, to = null) {
    if (id != null) {
      this.id = id;
    }
    if (label != null) {
      this.label = label;
    }
    if (from != null) {
      this.from = from;
    }
    if (to != null) {
      this.to = to;
    }
  }

  get id() {
    return this._id;
  }

  /**
   * The Edge's ID.
   *
   * @type Id
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
   * The Edge's Label.
   *
   * @type Label
   */
  set label(value) {
    if (!Util.isValidLabel(value)) {
      throw new Error('Invalid label');
    }
    this._label = value;
  }

  get from() {
    return this._from;
  }

  /**
   * The ID of the From Node.
   *
   * @type Id
   */
  set from(value) {
    if (!Util.isValidUUIDv4(value)) {
      throw new Error('Invalid from');
    }
    this._from = value;
  }

  get to() {
    return this._to;
  }

  /**
   * The ID of the To Node.
   *
   * @type Id
   */
  set to(value) {
    if (!Util.isValidUUIDv4(value)) {
      throw new Error('Invalid to');
    }
    this._to = value;
  }

  get action() {
    return this._action;
  }

  /**
   * The action to take when applying this change.
   * May be `create`, `update`, or `delete`.
   *
   * @type Action
   */
  set action(value) {
    if (value !== Constant.CREATE && value !== Constant.UPDATE &&
        value !== Constant.DELETE) {
      throw new Error('Invalid action');
    }
    this._action = value;
  }

  get origProps() {
    return this._origProps;
  }

  /**
   * The original props (Set on Action: `delete`).
   *
   * @type Object
   */
  set origProps(value) {
    if (typeof value !== 'object') {
      throw new Error('Invalid origProps');
    }
    this._origProps = value;
  }

  /**
   * The new props (Set on Action: `create` or `update`).
   *
   * @type Object
   */
  get props() {
    return this._props;
  }

  set props(value) {
    if (typeof value !== 'object') {
      throw new Error('Invalid props');
    }
    this._props = value;
  }

  /**
   * Validates this Commit Edge.
   */
  validate() {
    if (!this._id) {
      throw new Error('Missing id');
    }

    if (!this._label) {
      throw new Error('Missing label');
    }

    if (!this._from) {
      throw new Error('Missing from');
    }

    if (this._from == this._id) {
      throw new Error('Invalid from');
    }

    if (!this._to) {
      throw new Error('Missing to');
    }

    if (this._to == this._id) {
      throw new Error('Invalid to');
    }

    if (this._to == this._from) {
      throw new Error('Circular Edges not allowed');
    }

    if (!this._action) {
      throw new Error('Missing action');
    }

    switch (this._action) {
      case Constant.CREATE:
        if (this._origProps !== undefined ||
          this._props === undefined) {
          throw new Error('props (not origProps) ' +
          'must be set on create');
        }
        break;
      case Constant.UPDATE:
        if (this._origProps === undefined ||
          this._props === undefined) {
          throw new Error('props and origProps ' +
          'must be set on update');
        }
        break;
      case Constant.DELETE:
        if (this._origProps === undefined ||
          this._props !== undefined) {
          throw new Error('origProps (not props) ' +
          'must be set on delete');
        }
        break;
    }
  }

  /**
   * Initialize this Node from JSON.
   *
   * @param  {Object} obj The JSON Object.
   */
  fromJSON(obj) {
    this.id = obj.id;
    this.label = obj.label;
    this.from = obj.from;
    this.to = obj.to;
    this.action = obj.action;
    if (obj.origProps !== undefined) {
      this.origProps = obj.origProps;
    }
    if (obj.props !== undefined) {
      this.props = obj.props;
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
      from: this._from,
      to: this._to,
      action: this._action,
      origProps: this._origProps,
      props: this._props,
    };
  }
}

export default CommitEdge;
