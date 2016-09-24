module.exports = [
  // Root
  `schema {
    query: Query
    mutation: Mutation
  }`,
  // Root Queries
  `type Query {
    info: Info
  }`,
  // Mutations
  `type Mutation {
    commit(input: CommitInput): Commit
  }`,
  // Types
  `type Info {
    repo: String
    lastCommit: String
    dirty: Boolean
  }`,
  `type Commit {
    id: String
    json: JSON
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
