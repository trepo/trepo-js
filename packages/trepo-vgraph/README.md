# trepo-vgraph
> vGraph implementation on top of vagabond-db

**You probably want `trepo-core` or `trepo-server`**

````javascript
const VGraph = require('trepo-vgraph');

const vGraph = new VGraph('my-repo');

await vGraph.init();

const node = await vGraph.addNode('label');
await node.setProperties({
  foo: 'bar',
});

const node2 = await vGraph.addNode('label2');
await vGraph.addEdge('edge_label', node, node2);

const commit = await vGraph.commit('author', 'email', 'message');
````
