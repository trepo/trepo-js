module.exports = [
  // Root
  `schema {
    query: Query
    mutation: Mutation
  }`,
  // Root Queries
  `type Query {
    birth(id: String): Birth
    death(id: String): Death
    info: Info
    marriage(id: String): Marriage
    name(id: String): Name
    person(id: String): Person
  }`,
  // Mutations
  `type Mutation {
    commit(input: CommitInput): Commit
    createBirth(input: BirthCreateInput): Birth
    createDeath(input: DeathCreateInput): Death
    createMarriage(input: MarriageCreateInput): Marriage
    createName(input: NameCreateInput): Name
    createPerson: Person
    deleteBirth(input: DeleteInput): String
    deleteDeath(input: DeleteInput): String
    deleteMarriage(input: DeleteInput): String
    deleteName(input: DeleteInput): String
    deletePerson(input: DeleteInput): String
    updateBirth(input: BirthUpdateInput): Birth
    updateDeath(input: DeathUpdateInput): Death
    updateMarriage(input: MarriageUpdateInput): Marriage
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
  `type Death {
    id: String
    person: Person
    date: Date
    place: Place
  }`,
  `type Info {
    repo: String
    lastCommit: String
    dirty: Boolean
  }`,
  `type Marriage {
    id: String
    spouses: [Person!]
    date: Date
    place: Place
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
  `input DeathCreateInput {
    person: String
    date: DateInput
    place: PlaceInput
  }`,
  `input DeathUpdateInput {
    id: String!
    person: String
    date: DateInput
    place: PlaceInput
  }`,
  `input DeleteInput {
    id: String!
  }`,
  `input MarriageCreateInput {
    spouses: [String!]
    date: DateInput
    place: PlaceInput
  }`,
  `input MarriageUpdateInput {
    id: String!
    spouses: [String!]
    date: DateInput
    place: PlaceInput
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
