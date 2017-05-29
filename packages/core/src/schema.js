const {parse, buildASTSchema} = require('graphql');

const resolvers = {
  Query: {
    birth: require('./query/birth.js'),
    commits: require('./query/commits.js'),
    death: require('./query/death.js'),
    info: require('./query/info.js'),
    marriage: require('./query/marriage.js'),
    name: require('./query/name.js'),
    person: require('./query/person.js'),
  },
  Mutation: {
    commit: require('./mutation/commit.js'),
    createBirth: require('./mutation/createBirth.js'),
    createDeath: require('./mutation/createDeath.js'),
    createMarriage: require('./mutation/createMarriage.js'),
    createName: require('./mutation/createName.js'),
    createPerson: require('./mutation/createPerson.js'),
    deleteBirth: require('./mutation/deleteBirth.js'),
    deleteDeath: require('./mutation/deleteDeath.js'),
    deleteMarriage: require('./mutation/deleteMarriage.js'),
    deleteName: require('./mutation/deleteName.js'),
    deletePerson: require('./mutation/deletePerson.js'),
    patch: require('./mutation/patch.js'),
    undo: require('./mutation/undo.js'),
    updateBirth: require('./mutation/updateBirth.js'),
    updateDeath: require('./mutation/updateDeath.js'),
    updateMarriage: require('./mutation/updateMarriage.js'),
    updateName: require('./mutation/updateName.js'),
  },
  // Types
  Birth: require('./type/Birth.js'),
  Commit: require('./type/Commit.js'),
  Date: require('./type/Date.js'),
  Death: require('./type/Death.js'),
  Info: require('./type/Info.js'),
  Marriage: require('./type/Marriage.js'),
  Name: require('./type/Name.js'),
  Person: require('./type/Person.js'),
  Place: require('./type/Place.js'),
  // Scalars
  JSON: require('./scalar/JSON.js'),
};

const definitions = [
  // Root
  `schema {
    query: Query
    mutation: Mutation
  }`,
  // Root Queries
  `type Query {
    birth(id: String): Birth
    commits(after: String limit: Int): JSON
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
    createPerson(input: PersonCreateInput): Person
    deleteBirth(input: DeleteInput): String
    deleteDeath(input: DeleteInput): String
    deleteMarriage(input: DeleteInput): String
    deleteName(input: DeleteInput): String
    deletePerson(input: DeleteInput): String
    patch(input: PatchInput): JSON
    undo(input: UndoInput): [String!]
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
    birth: Birth
    births: [Birth!]
    death: Death
    marriages: [Marriage!]
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
  `input PatchInput {
    commit: JSON!
  }`,
  `input PersonCreateInput {
    name: String
  }`,
  `input PlaceInput {
    name: String!
  }`,
  `input UndoInput {
    id: String!
  }`,
  // Scalars
  `scalar JSON`,
].join('\n');

const schema = buildASTSchema(parse(definitions));

// Adapted from graphql-tools makeExecutableSchema
// For each resolver
for (const typeName of Object.keys(resolvers)) {
  // Get the type from the schema
  const type = schema.getType(typeName);
  // Ensure we have a type for the resolver in the schema
  if (!type && typeName !== '__schema') {
    throw new Error(`"${typeName}" defined in resolvers, but not in schema`);
  }
  // For each field in the resolver
  for (const fieldName of Object.keys(resolvers[typeName])) {
    // Add __ resolver fields to the type instead of the field (i.e. scalars)
    if (fieldName.startsWith('__')) {
      type[fieldName.substring(2)] = resolvers[typeName][fieldName];
      continue;
    }
    // Get all of the fields for this type
    const fields = type.getFields();
    // Ensure we have the field in the schema
    if (!fields[fieldName]) {
      throw new Error(`${typeName}.${fieldName} defined in resolvers, but not in schema`); // eslint-disable-line max-len
    }
    // Get the field and the resolver for the field
    const field = fields[fieldName];
    const fieldResolve = resolvers[typeName][fieldName];
    // If the resolver is a function, add it as the resovler
    if (typeof fieldResolve === 'function') {
      field.resolve = fieldResolve;
    } else {
    // Otherwise, the resolver is a type definition
      for (const propertyName of Object.keys(fieldResolve)) {
        field[propertyName] = fieldResolve[propertyName];
      }
    }
  }
}

module.exports = schema;
