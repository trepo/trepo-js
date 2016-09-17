const {makeExecutableSchema} = require('graphql-tools');
const {graphql} = require('graphql');
const apolloServer = require('apollo-server');

const definitions = [
  `schema {
      query: TrepoQuery
      mutation: TrepoMutation
    }
  `,
  `type TrepoQuery {
      person(id: String): Person
    }
  `,
  `type Person {
      id: String
      name: String
    }
  `,
  `type TrepoMutation {
    commit(s: String): String
  }
  `,
];

const resolvers = {
  TrepoQuery: {
    person(root, {id}) {
      return {
        id,
        name: `name:${id}`,
      };
    },
  },
  Person: {
    id(person) {
      return person.id;
    },
    name(person) {
      return person.name;
    },
  },
  TrepoMutation: {
    commit() {
      // console.log(arguments);
      return '1234';
    },
  },
};

const schema = makeExecutableSchema({
  typeDefs: definitions,
  resolvers: resolvers,
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
