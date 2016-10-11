module.exports = {
  Query: {
    info: require('./query/info.js'),
    name: require('./query/name.js'),
    person: require('./query/person.js'),
  },
  Mutation: {
    commit: require('./mutation/commit.js'),
    createName: require('./mutation/createName.js'),
    createPerson: require('./mutation/createPerson.js'),
    deleteName: require('./mutation/deleteName.js'),
    updateName: require('./mutation/updateName.js'),
  },
  // Types
  Commit: require('./type/Commit.js'),
  Info: require('./type/Info.js'),
  Name: require('./type/Name.js'),
  Person: require('./type/Person.js'),
  // Scalars
  JSON: require('./scalar/JSON.js'),
};
