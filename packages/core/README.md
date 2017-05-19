# trepo-core
> GraphQL implementation of Trepo

For more information see the [Trepo Spec](https://github.com/trepo/trepo) or [trepo.io](http://trepo.io/).

````javascript
const Trepo = require('trepo-core');

const trepo = new Trepo('my-repo');

await trepo.start();

const response = await trepo.request({
  query,
  variables,
  operationName,
});
````
