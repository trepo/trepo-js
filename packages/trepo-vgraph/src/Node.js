import Constant from './Constant.js';
import Util from './Util.js';
import Element from './Element.js';
import Edge from './Edge.js';

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
      yield new Edge(edge, this._vGraph);
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

export default Node;
