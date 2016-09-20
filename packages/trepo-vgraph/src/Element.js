import Constant from './Constant.js';
import Util from './Util.js';

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

export default Element;
