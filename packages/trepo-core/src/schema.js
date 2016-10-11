module.exports = [
  // Root
  `schema {
    query: Query
    mutation: Mutation
  }`,
  // Root Queries
  `type Query {
    info: Info
    name(id: String): Name
    person(id: String): Person
  }`,
  // Mutations
  `type Mutation {
    commit(input: CommitInput): Commit
    createName(input: NameCreateInput): Name
    createPerson: Person
    deleteName(input: DeleteInput): String
    updateName(input: NameUpdateInput): Name
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
  `type Name {
    id: String
    name: String
    person: Person
  }`,
  `type Person {
    id: String
    name: Name
  }`,
  // Inputs
  `input CommitInput {
    author: String!
    email: String!
    message: String!
  }`,
  `input DeleteInput {
    id: String!
  }`,
  `input NameCreateInput {
    name: String!
    person: String
  }`,
  `input NameUpdateInput {
    id: String!
    name: String!
    person: String
  }`,
  // Scalars
  `scalar JSON`,
];
