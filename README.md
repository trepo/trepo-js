# Trepo
> Javascript implementation of [Trepo](https://github.com/trepo/trepo).

This repo contains the following packages:

* `treo-core` - The main Trepo class, exposing a request method that calls graphql.
* `trepo-npipes` - Traversals
* `trepo-ptree` - Genealogical data model helper functions
* `trepo-server` - Run a Trepo http server
* `trepo-vgraph` - vGraph implementation on top of vagabond-db
* `trepo-xsearch` - Searching

### Developing
`trepo-js` is a mono-repo managed by [lerna](https://lernajs.io/). To get started clone this repo and run:

````bash
npm install # Installs lerna and dev dependencies
npm bootstrap # Links packages and installs regular dependencies
````

Development is tracked via Github [projects](https://github.com/trepo/trepo-js/projects) and [issues](https://github.com/trepo/trepo-js/issues).

### License
[MIT](./LICENSE)
