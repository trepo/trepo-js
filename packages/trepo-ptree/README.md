# trepo-ptree
> Working with pTree in vGraph

**You probably want `trepo-core` or `trepo-server`**

This module exports an object with utility functions on it (`getPerson`, `createBirth`, `updateMarriage`, `deleteDeath`).

Each function should return an object with the vGraph node set to `_node`. Other properties should be set if already passed in or fetched.

````javascript
{
  _node, // REQUIRED The root node of the conclusion, etc.
  name: {}, // Other nodes
  spouses: [], // or arrays of nodes
  ...
}
````
