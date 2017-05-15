const {graphql} = require('graphql');
const {VGraph} = require('trepo-vgraph');
const schema = require('./schema.js');

class Trepo {
  constructor(repo, options = {}) {
    this.vGraph = new VGraph(repo, options);
  }

  start() {
    return this.vGraph.init();
  }

  request({query, variables, operationName}) {
    return graphql(
      schema,
      query,
      { // root
        vGraph: this.vGraph,
      },
      {context: true}, // ctx, TODO pass through commitOnly flag to mutations
      variables,
      operationName
    );
  }
}

module.exports = Trepo;
