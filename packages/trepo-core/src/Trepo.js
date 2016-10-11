const {makeExecutableSchema} = require('graphql-tools');
const {graphql} = require('graphql');
const apolloServer = require('apollo-server');
const {VGraph} = require('trepo-vgraph');

const schema = makeExecutableSchema({
  typeDefs: require('./schema.js'),
  resolvers: require('./resolvers.js'),
});

class Trepo {
  constructor(repo) {
    this.apolloServer = apolloServer;
    this.vGraph = new VGraph(repo);
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
