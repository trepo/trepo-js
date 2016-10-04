# trepo-ptree
> Working with pTree in vGraph

This module exports an object with utility functions on it (`getPerson`, `createBirth`, `updateMarriage`, `deleteDeath`).

Each get, create, and update should return as much of the following object as reasonably possible. The resolver functions in trepo-core will retrieve them if not preset.

````javascript
{
  _node, // REQUIRED The root node of the conclusion, etc.
  _id,
  _label,
  _repo,
  _props,

  name: {}, // Other nodes
  spouses: [], // or arrays of nodes
}
````

### Developing
* `npm test` Tests using mocha/chai
* `npm run build` Builds to `./dist`
* `npm run watch` Runs build with the watch flag
