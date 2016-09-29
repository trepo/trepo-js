module.exports = [
  // Root
  `schema {
    query: Query
    mutation: Mutation
  }`,
  // Root Queries
  `type Query {
    info: Info
    person(id: String): Person
  }`,
  // Mutations
  `type Mutation {
    commit(input: CommitInput): Commit
    createPerson: Person
  }`,
  // Types
  `type Commit {
    id: String
    json: JSON
  }`,
  `type Info {
    repo: String
    lastCommit: String
    dirty: Boolean
  }`,
  `type Person {
    id: String
  }`,
  // Inputs
  `input CommitInput {
    author: String!
    email: String!
    message: String!
  }`,
  // Scalars
  `scalar JSON`,
];
