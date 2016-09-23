const {makeExecutableSchema} = require('graphql-tools');
const {graphql} = require('graphql');
const apolloServer = require('apollo-server');

const schema = makeExecutableSchema({
  typeDefs: require('./schema.js'),
  resolvers: require('./resolvers.js'),
});

class Trepo {
  constructor() {
    this.apolloServer = apolloServer;
  }

  request(query, variables, operationName) {
    return graphql(
      schema,
      query,
      {root: true},
      {context: true},
      variables,
      operationName
    );
  }
}

module.exports = Trepo;
