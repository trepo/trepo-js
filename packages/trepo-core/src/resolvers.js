module.exports = {
  Query: {
    info: require('./query/info.js'),
    person: require('./query/person.js'),
  },
  Mutation: {
    commit: require('./mutation/commit.js'),
    createPerson: require('./mutation/createPerson.js'),
  },
  // Types
  Commit: require('./type/Commit.js'),
  Info: require('./type/Info.js'),
  Person: require('./type/Person.js'),
  // Scalars
  JSON: require('./scalar/JSON.js'),
};
