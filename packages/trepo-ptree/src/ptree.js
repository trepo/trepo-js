module.exports = {
  prop: require('./prop.js'),

  createBirth: require('./birth/create.js'),
  getBirth: require('./birth/get.js'),
  getBirthChild: require('./birth/getChild.js'),
  getBirthDate: require('./birth/getDate.js'),
  getBirthFather: require('./birth/getFather.js'),
  getBirthMother: require('./birth/getMother.js'),
  getBirthPlace: require('./birth/getPlace.js'),
  updateBirth: require('./birth/update.js'),
  deleteBirth: require('./birth/delete.js'),

  createDeath: require('./death/create.js'),
  getDeath: require('./death/get.js'),
  getDeathDate: require('./death/getDate.js'),
  getDeathPerson: require('./death/getPerson.js'),
  getDeathPlace: require('./death/getPlace.js'),
  updateDeath: require('./death/update.js'),
  deleteDeath: require('./death/delete.js'),

  createMarriage: require('./marriage/create.js'),
  getMarriage: require('./marriage/get.js'),
  getMarriageDate: require('./marriage/getDate.js'),
  getMarriagePlace: require('./marriage/getPlace.js'),
  getMarriageSpouses: require('./marriage/getSpouses.js'),
  updateMarriage: require('./marriage/update.js'),
  deleteMarriage: require('./marriage/delete.js'),

  createName: require('./name/create.js'),
  getName: require('./name/get.js'),
  getNamePerson: require('./name/getPerson.js'),
  updateName: require('./name/update.js'),
  deleteName: require('./name/delete.js'),

  createPerson: require('./person/create.js'),
  getPerson: require('./person/get.js'),
  getPersonName: require('./person/getName.js'),
};
