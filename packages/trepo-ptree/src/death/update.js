const Label = require('../label.js');
const util = require('../util.js');
const checkPerson = require('../person/check.js');
const ensureDate = require('../date/ensure.js');
const ensurePerson = require('../person/ensure.js');
const ensurePlace = require('../place/ensure.js');

module.exports = async ({vGraph, input}) => {
  await checkPerson({
    vGraph,
    id: input.person,
  });

  const node = await util.ensureNode({
    vGraph,
    id: input.id,
    label: Label.DEATH,
  });

  const [person, date, place] = await Promise.all([
    ensurePerson({
      vGraph,
      node,
      label: Label.DEATH_PERSON,
      id: input.person,
    }),
    ensureDate({
      vGraph,
      node,
      label: Label.DEATH_DATE,
      date: input.date,
    }),
    ensurePlace({
      vGraph,
      node,
      label: Label.DEATH_PLACE,
      place: input.place,
    }),
  ]);

  return {
    _node: node,
    person,
    date,
    place,
  };
};
