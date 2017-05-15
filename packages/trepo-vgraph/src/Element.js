const Constant = require('./Constant.js');
const Util = require('./Util.js');

/**
 * A Universally Unique Identifier (UUIDv4) assigned to an Element.
 *
 * @typedef {String} Id
 */

/**
 * A Label on an Element.
 *
 * @typedef {String} Label
 */

/**
 * The SHA1 Hash of an Element's Properties.
 *
 * @typedef {String} Hash
 */

/**
 * An Element in vGraph.
 */
class Element {

  /**
   * Create a new Element.
   *
   * @param  {Vagabond} element The Vagabond Element to wrap.
   * @param  {VGraph} vGraph The vGraph instance.
   */
  constructor(element, vGraph) {
    this._element = element;
    this._vGraph = vGraph;
  }

  /**
   * Get the Element's ID.
   *
   * @return {Promise<Id>} A Promise resolving to the ID.
   */
  getId() {
    return new Promise((resolve, reject) => {
      this._element.getProperty(Constant.STATUS)
        .then(status => {
          if (status >= 4) {
            reject(new Error('Deleted'));
          } else {
            resolve(this._element.id);
          }
        })
        .catch(reject);
    });
  }

  /**
   * Get the Element's Label.
   *
   * @return {Promise<Label>} A Promise resolving to the label.
   */
  getLabel() {
    return new Promise((resolve, reject) => {
      this._element.getProperty(Constant.STATUS)
        .then(status => {
          if (status >= 4) {
            reject(new Error('Deleted'));
          } else {
            resolve(this._element.label);
          }
        })
        .catch(reject);
    });
  }

  /**
   * Get a property by key.
   *
   * @param  {String} key The property key.
   * @return {Promise<T>} A Promise resolving to the property value.
   */
  getProperty(key) {
    return new Promise((resolve, reject) => {
      if (!Util.isValidPropertyKey(key)) {
        return reject(new Error('Invalid Key'));
      }

      Promise.all([
        this._element.getProperty(Constant.STATUS),
        this._element.getProperty(key),
      ])
        .then(values => {
          if (values[0] >= 4) {
            reject(new Error('Deleted'));
          } else {
            resolve(values[1]);
          }
        })
        .catch(reject);
    });
  }

  /**
   * Set a property key to value.
   *
   * @param {String} key The property key.
   * @param {T} value The property value.
   * @return {Promise<Null>} A Promise resolving to Null.
   */
  setProperty(key, value) {
    return new Promise((resolve, reject) => {
      if (!Util.isValidPropertyKey(key)) {
        return reject(new Error('Invalid Key'));
      }
      if (!Util.isValidPropertyValue(value)) {
        return reject(new Error('Invalid Value'));
      }

      this._element.getProperties()
        .then(properties => {
          if (properties[Constant.STATUS] >= 4) {
            reject(new Error('Deleted'));
          } else if (properties.hasOwnProperty(key) &&
            properties[key] === value) {
            resolve(null);
          } else {
            if (properties[Constant.STATUS] === 0) {
              let originalProperties = Util.getProperties(properties);
              properties[Constant.ORIG_PROPS] =
                JSON.stringify(originalProperties);
              properties[Constant.STATUS] = 2;
            }
            properties[key] = value;
            this._vGraph._dirty = true;
            this._element.setProperties(properties)
              .then(resolve, reject);
          }
        })
        .catch(reject);
    });
  }

  /**
   * Remove a property value by key.
   *
   * @param  {String} key The property key.
   * @return {Promise<Null>} A Promise that resolves to Null.
   */
  removeProperty(key) {
    return new Promise((resolve, reject) => {
      if (!Util.isValidPropertyKey(key)) {
        return reject(new Error('Invalid Key'));
      }

      this._element.getProperties()
        .then(properties => {
          if (properties[Constant.STATUS] >= 4) {
            reject(new Error('Deleted'));
          } else if (properties.hasOwnProperty(key) === false) {
            resolve(null);
          } else {
            if (properties[Constant.STATUS] === 0) {
              let originalProperties = Util.getProperties(properties);
              properties[Constant.ORIG_PROPS] =
                JSON.stringify(originalProperties);
              properties[Constant.STATUS] = 2;
            }
            delete properties[key];
            this._vGraph._dirty = true;
            this._element.setProperties(properties)
              .then(resolve, reject);
          }
        })
        .catch(reject);
    });
  }

  /**
   * Get an array of property keys.
   *
   * @return {Promise<String[]>} A Promise resolving to the keys.
   */
  getPropertyKeys() {
    return new Promise((resolve, reject) => {
      Promise.all([
        this._element.getProperty(Constant.STATUS),
        this._element.getPropertyKeys(),
      ])
        .then(values => {
          if (values[0] >= 4) {
            reject(new Error('Deleted'));
          } else {
            let keys = [];
            for (let key of values[1]) {
              if (key.charAt(0) !== '_') {
                keys.push(key);
              }
            }
            resolve(keys);
          }
        })
        .catch(reject);
    });
  }

  /**
   * Get properties.
   *
   * @return {Promise<Object>} A Promise resolving to the properties.
   */
  getProperties() {
    return new Promise((resolve, reject) => {
      this._element.getProperties()
        .then(properties => {
          if (properties[Constant.STATUS] >= 4) {
            reject(new Error('Deleted'));
          } else {
            resolve(Util.getProperties(properties));
          }
        })
        .catch(reject);
    });
  }

  /**
   * Set properties.
   *
   * @param {Promise<Null>} properties A Promise that resolves to Null.
   * @return {Promise} a Promise.
   */
  setProperties(properties) {
    return new Promise((resolve, reject) => {
      for (let key in properties) {
        if (!Util.isValidPropertyKey(key)) {
          return reject(new Error('Invalid Key'));
        }
        if (!Util.isValidPropertyValue(properties[key])) {
          return reject(new Error('Invalid Value'));
        }
      }

      this._element.getProperties()
        .then(elementProperties => {
          let originalProperties = Util.getProperties(elementProperties);
          if (elementProperties[Constant.STATUS] >= 4) {
            reject(new Error('Deleted'));
          } else if (Util.calculateHash(properties) ===
            Util.calculateHash(originalProperties)) {
            resolve(null);
          } else {
            if (elementProperties[Constant.STATUS] === 0) {
              elementProperties[Constant.ORIG_PROPS] =
                JSON.stringify(originalProperties);
              elementProperties[Constant.STATUS] = 2;
            }
            for (let key of Object.keys(originalProperties)) {
              delete elementProperties[key];
            }
            for (let key of Object.keys(properties)) {
              elementProperties[key] = properties[key];
            }
            this._vGraph._dirty = true;
            this._element.setProperties(elementProperties)
              .then(resolve, reject);
          }
        })
        .catch(reject);
    });
  }

}

// We put this here to avoid circular dependencies

/**
 * A Node (or Boundary Node) in vGraph. goo
 *
 * @augments Element
 */
class Node extends Element {

  /**
   * Get the repository this Node resides in.
   *
   * This will return the vGraph's repository for regular nodes,
   * and the remote repository for boundary nodes.
   *
   * @return {Promise<String>} A Promise resolving to the repository.
   */
  getRepo() {
    return new Promise((resolve, reject) => {
      this._element.getProperties()
        .then(properties => {
          if (properties[Constant.STATUS] >= 4) {
            reject(new Error('Deleted'));
          } else if (properties.hasOwnProperty(Constant.REPO)) {
            resolve(properties.__repo);
          } else {
            resolve(this._vGraph._repo);
          }
        })
        .catch(reject);
    });
  }

  /**
   * Set the Repo.
   *
   * @param {REPO} repo The repository.
   * @return {Promise<Null>} A Promise resolving to null.
   */
  setRepo(repo) {
    return new Promise((resolve, reject) => {
      if (!Util.isValidRepo(repo) || repo === this._vGraph._repo) {
        return reject(new Error('Invalid Repo'));
      }

      this._element.getProperties()
        .then(properties => {
          if (properties[Constant.STATUS] >= 4) {
            reject(new Error('Deleted'));
          } else if (!properties.hasOwnProperty(Constant.REPO)) {
            reject(new Error('Not Boundary'));
          } else if (repo === properties[Constant.REPO]) {
            resolve(null);
          } else {
            if (properties[Constant.STATUS] === 0) {
              properties[Constant.ORIG_REPO] = properties[Constant.REPO];
              properties[Constant.STATUS] = 2;
            }
            properties[Constant.REPO] = repo;
            this._vGraph._dirty = true;
            this._element.setProperties(properties)
              .then(resolve, reject);
          }
        })
        .catch(reject);
    });
  }

  /**
   * If this Node is a Boundary Node.
   *
   * @return {Promise<Boolean>} A Promise resolving to True if Boundary Node, False otherwise.
   */
  isBoundary() {
    return new Promise((resolve, reject) => {
      this._element.getProperties()
        .then(properties => {
          if (properties[Constant.STATUS] >= 4) {
            reject(new Error('Deleted'));
          } else if (properties.hasOwnProperty(Constant.REPO)) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch(reject);
    });
  }

  /**
   * Converts a Boundary Node to a regular Node.
   *
   * @param  {Repo} repo The repository.
   * @return {Promise<Null>} A Promise resolving to null.
   */
  convertToBoundary(repo) {
    return new Promise((resolve, reject) => {
      if (!Util.isValidRepo(repo) || repo === this._vGraph._repo) {
        return reject(new Error('Invalid Repo'));
      }

      this._element.getProperties()
        .then(properties => {
          if (properties[Constant.STATUS] >= 4) {
            reject(new Error('Deleted'));
          } else if (properties.hasOwnProperty(Constant.REPO)) {
            reject(new Error('Already A Boundary'));
          } else {
            let originalProperties = Util.getProperties(properties);
            if (properties[Constant.STATUS] === 0) {
              properties[Constant.ORIG_PROPS] =
                JSON.stringify(originalProperties);
              properties[Constant.STATUS] = 2;
            }
            for (let key of Object.keys(originalProperties)) {
              delete properties[key];
            }
            properties[Constant.REPO] = repo;
            this._vGraph._dirty = true;
            this._element.setProperties(properties)
              .then(resolve, reject);
          }
        })
        .catch(reject);
    });
  }

  /**
   * Convert a Boundary Node to a regular Node.
   *
   * @return {Promise<Null>} A Promise resolving to null.
   */
  convertToNode() {
    return new Promise((resolve, reject) => {
      this._element.getProperties()
        .then(properties => {
          if (properties[Constant.STATUS] >= 4) {
            reject(new Error('Deleted'));
          } else if (properties.hasOwnProperty(Constant.REPO) === false) {
            reject(new Error('Already A Node'));
          } else {
            if (properties[Constant.STATUS] === 0) {
              properties[Constant.ORIG_REPO] = properties[Constant.REPO];
              properties[Constant.STATUS] = 2;
            }
            delete properties[Constant.REPO];
            this._vGraph._dirty = true;
            this._element.setProperties(properties)
              .then(resolve, reject);
          }
        })
        .catch(reject);
    });
  }

  /**
   * Add an Edge from this Node to the supplied Node.
   *
   * @param {String} label The new Edge's Label.
   * @param {Node} to The to Node.
   * @return {Edge} A Promise resolving to the new Edge.
   */
  addEdge(label, to) {
    return this._vGraph.addEdge(label, this, to);
  }

  /**
   * Get all of the connected edges in the specified direction,
   * optionally filtered by labels. Yields Edges.
   *
   * @param  {Direction} direction The Direction to limit to.
   * @param  {...String} labels The labels to filter on.
   */
  * getEdges(direction, ...labels) {
    let query = this._element.query(direction).filter(this._deletedFilter);
    if (labels.length > 0) {
      query = query.labels(...labels);
    }

    for (let edge of query.edges()) {
      yield new Edge(edge, this._vGraph); // eslint-disable-line no-use-before-define
    }
  }

  /**
   * Get all of the connected Nodes in the specified direction,
   * optionally filtered by the passed in edge labels. Yields Nodes.
   *
   * @param  {Direction} direction The Direction to limit to.
   * @param  {...String} labels The edge labels to filter on.
   */
  * getNodes(direction, ...labels) {
    let query = this._element.query(direction).filter(this._deletedFilter);
    if (labels.length > 0) {
      query = query.labels(...labels);
    }

    for (let node of query.nodes()) {
      yield new Node(node, this._vGraph);
    }
  }

  /**
   * @override
   */
  getProperty(key) {
    // We have to rebind this for now until this bug is fixed.
    // https://bugs.chromium.org/p/v8/issues/detail?id=4466
    let superFunc = super.getProperty;
    return new Promise((resolve, reject) => {
      this._element.getProperty(Constant.REPO)
        .then(repo => {
          if (repo) {
            reject(new Error('Boundary'));
          } else {
            resolve(superFunc.call(this, key));
          }
        })
        .catch(reject);
    });
  }

  /**
   * @override
   */
  setProperty(key, value) {
    // We have to rebind this for now until this bug is fixed.
    // https://bugs.chromium.org/p/v8/issues/detail?id=4466
    let superFunc = super.setProperty;
    return new Promise((resolve, reject) => {
      this._element.getProperty(Constant.REPO)
        .then(repo => {
          if (repo) {
            reject(new Error('Boundary'));
          } else {
            resolve(superFunc.call(this, key, value));
          }
        })
        .catch(reject);
    });
  }

  /**
   * @override
   */
  removeProperty(key) {
    // We have to rebind this for now until this bug is fixed.
    // https://bugs.chromium.org/p/v8/issues/detail?id=4466
    let superFunc = super.removeProperty;
    return new Promise((resolve, reject) => {
      this._element.getProperty(Constant.REPO)
        .then(repo => {
          if (repo) {
            reject(new Error('Boundary'));
          } else {
            resolve(superFunc.call(this, key));
          }
        })
        .catch(reject);
    });
  }

  /**
   * @override
   */
  getPropertyKeys() {
    // We have to rebind this for now until this bug is fixed.
    // https://bugs.chromium.org/p/v8/issues/detail?id=4466
    let superFunc = super.getPropertyKeys;
    return new Promise((resolve, reject) => {
      this._element.getProperty(Constant.REPO)
        .then(repo => {
          if (repo) {
            reject(new Error('Boundary'));
          } else {
            resolve(superFunc.call(this));
          }
        })
        .catch(reject);
    });
  }

  /**
   * @override
   */
  getProperties() {
    // We have to rebind this for now until this bug is fixed.
    // https://bugs.chromium.org/p/v8/issues/detail?id=4466
    let superFunc = super.getProperties;
    return new Promise((resolve, reject) => {
      this._element.getProperty(Constant.REPO)
        .then(repo => {
          if (repo) {
            reject(new Error('Boundary'));
          } else {
            resolve(superFunc.call(this));
          }
        })
        .catch(reject);
    });
  }

  /**
   * @override
   */
  setProperties(properties) {
    // We have to rebind this for now until this bug is fixed.
    // https://bugs.chromium.org/p/v8/issues/detail?id=4466
    let superFunc = super.setProperties;
    return new Promise((resolve, reject) => {
      this._element.getProperty(Constant.REPO)
        .then(repo => {
          if (repo) {
            reject(new Error('Boundary'));
          } else {
            resolve(superFunc.call(this, properties));
          }
        })
        .catch(reject);
    });
  }

  _deletedFilter(properties) {
    if (properties[Constant.STATUS] >= 4) {
      return false;
    }
    return true;
  }
}

// We put this here to avoid circular dependencies

/**
 * An Edge in vGraph.
 */
class Edge extends Element {
  /**
   * Get the Node this Edge is connected to.
   *
   *  Node --OUT--> Edge --IN--> Node
   *
   * @param  {Direction} direction The Direction.
   * @return {Promise<Node>} A Promise resolving to the connected Node.
   */
  getNode(direction) {
    return new Promise((resolve, reject) => {
      this._element.getProperty(Constant.STATUS)
        .then(status => {
          if (status >= 4) {
            throw new Error('Deleted');
          } else {
            return this._element.getNode(direction);
          }
        })
        .then(node => resolve(new Node(node, this._vGraph)))
        .catch(reject);
    });
  }
}

module.exports = {
  Edge,
  Element,
  Node,
};
