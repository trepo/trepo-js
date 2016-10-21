module.exports = {
  Query: {
    birth: require('./query/birth.js'),
    info: require('./query/info.js'),
    marriage: require('./query/marriage.js'),
    name: require('./query/name.js'),
    person: require('./query/person.js'),
  },
  Mutation: {
    commit: require('./mutation/commit.js'),
    createBirth: require('./mutation/createBirth.js'),
    createMarriage: require('./mutation/createMarriage.js'),
    createName: require('./mutation/createName.js'),
    createPerson: require('./mutation/createPerson.js'),
    deleteBirth: require('./mutation/deleteBirth.js'),
    deleteMarriage: require('./mutation/deleteMarriage.js'),
    deleteName: require('./mutation/deleteName.js'),
    updateBirth: require('./mutation/updateBirth.js'),
    updateMarriage: require('./mutation/updateMarriage.js'),
    updateName: require('./mutation/updateName.js'),
  },
  // Types
  Birth: require('./type/Birth.js'),
  Commit: require('./type/Commit.js'),
  Date: require('./type/Date.js'),
  Info: require('./type/Info.js'),
  Marriage: require('./type/Marriage.js'),
  Name: require('./type/Name.js'),
  Person: require('./type/Person.js'),
  Place: require('./type/Place.js'),
  // Scalars
  JSON: require('./scalar/JSON.js'),
};
