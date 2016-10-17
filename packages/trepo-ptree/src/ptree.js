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

  createName: require('./name/create.js'),
  getName: require('./name/get.js'),
  getNamePerson: require('./name/getPerson.js'),
  updateName: require('./name/update.js'),
  deleteName: require('./name/delete.js'),

  createPerson: require('./person/create.js'),
  getPerson: require('./person/get.js'),
  getPersonName: require('./person/getName.js'),
};
