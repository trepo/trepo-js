module.exports = [
  // Root
  `schema {
    query: Query
    mutation: Mutation
  }`,
  // Root Queries
  `type Query {
    birth(id: String): Birth
    info: Info
    name(id: String): Name
    person(id: String): Person
  }`,
  // Mutations
  `type Mutation {
    commit(input: CommitInput): Commit
    createBirth(input: BirthCreateInput): Birth
    createName(input: NameCreateInput): Name
    createPerson: Person
    deleteBirth(input: DeleteInput): String
    deleteName(input: DeleteInput): String
    updateBirth(input: BirthUpdateInput): Birth
    updateName(input: NameUpdateInput): Name
  }`,
  // Types
  `type Birth {
    id: String
    father: Person
    mother: Person
    child: Person
    date: Date
    place: Place
  }`,
  `type Commit {
    id: String
    json: JSON
  }`,
  `type Date {
    original: String!
    formal: String
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
  `type Place {
    name: String!
  }`,
  // Inputs
  `input BirthCreateInput {
    father: String
    mother: String
    child: String
    date: DateInput
    place: PlaceInput
  }`,
  `input BirthUpdateInput {
    id: String!
    father: String
    mother: String
    child: String
    date: DateInput
    place: PlaceInput
  }`,
  `input CommitInput {
    author: String!
    email: String!
    message: String!
  }`,
  `input DateInput {
    original: String!
    formal: String
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
  `input PlaceInput {
    name: String!
  }`,
  // Scalars
  `scalar JSON`,
];
