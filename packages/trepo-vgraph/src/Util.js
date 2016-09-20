import Sha1 from './vendor/Sha1.js';
import Constant from './Constant.js';

let Util = {
  isValidUUIDv4: (id) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id);
  },

  isValidSHA1: (sha) => {
    return /^[0-9a-f]{40}$/.test(sha);
  },

  isValidLabel: (label) => {
    return /^[A-Za-z][A-Za-z_]{0,254}$/.test(label);
  },

  isValidPropertyKey: (key) => {
    return /^[A-Za-z][A-Za-z0-9_]{0,254}$/.test(key);
  },

  isValidPropertyValue: (value) => {
    let allowed = ['boolean', 'number', 'string'];

    // Allow basic values
    if (allowed.indexOf((typeof value)) >= 0) {
      return true;
    }

    // Allow homogeneous arrays of basic values
    if (Array.isArray(value)) {
      let initialType;
      let i = 0;
      for (let x in value) {
        if (i === 0) {
          initialType = typeof value[x];
          if (allowed.indexOf(initialType) < 0) {
            return false;
          }
        } else {
          if (typeof value[x] !== initialType) {
            return false;
          }
        }
        i++;
      }
      return true;
    }

    return false;
  },

  isValidRepo(repo) {
    return /^.{1,255}$/.test(repo);
  },

  getProperties: (obj) => {
    let properties = {};

    Object.keys(obj).forEach(key => {
      if (key.charAt(0) != '_') {
        // Clone objects to prevent old object refs
        if (typeof obj[key] === 'object') {
          properties[key] = JSON.parse(JSON.stringify(obj[key]));
        } else {
          properties[key] = obj[key];
        }
      }
    });
    return properties;
  },

  generateUUIDv4: () => {
    // From http://blog.snowfinch.net/post/3254029029/uuid-v4-js
    let uuid = '';
    for (let i = 0; i < 32; i++) {
      let random = Math.random() * 16 | 0;

      if (i == 8 || i == 12 || i == 16 || i == 20) {
        uuid += '-';
      }

      uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random))
        .toString(16);
    }

    return uuid;
  },

  calculateHash: (obj) => {
    let keys = Object.keys(obj).sort();
    let json = '{';

    for (let i = 0; i < keys.length; i++) {
      if (i > 0) {
        json += ',';
      }
      json += '"' + keys[i] + '":' + JSON.stringify(obj[keys[i]]);
    }
    json += '}';
    return Sha1.hash(json);
  },

  // Returns true if element is not deleted
  notDeletedFilter: (properties) => {
    if (properties[Constant.STATUS] >= 4) {
      return false;
    }
    return true;
  },

  // Returns true if element has been changed
  changedFilter: (properties, id) => {
    if (properties[Constant.STATUS] == undefined) {
      throw new Error('Invalid State: Missing Status on ' + id);
    }
    if (properties[Constant.STATUS] == 0) {
      return false;
    }
    return true;
  }
};

export default Util;
