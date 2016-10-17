const Label = require('../label.js');
const util = require('../util.js');
const checkPerson = require('../person/check.js');
const ensureDate = require('../date/ensure.js');
const ensurePerson = require('../person/ensure.js');
const ensurePlace = require('../place/ensure.js');

module.exports = async ({vGraph, input}) => {
  await Promise.all([
    checkPerson({
      vGraph,
      id: input.father,
    }),
    checkPerson({
      vGraph,
      id: input.mother,
    }),
    checkPerson({
      vGraph,
      id: input.child,
    }),
  ]);

  const node = await util.ensureNode({
    vGraph,
    id: input.id,
    label: Label.BIRTH,
  });

  const [father, mother, child, date, place] = await Promise.all([
    ensurePerson({
      vGraph,
      node,
      label: Label.BIRTH_FATHER,
      id: input.father,
    }),
    ensurePerson({
      vGraph,
      node,
      label: Label.BIRTH_MOTHER,
      id: input.mother,
    }),
    ensurePerson({
      vGraph,
      node,
      label: Label.BIRTH_CHILD,
      id: input.child,
    }),
    ensureDate({
      vGraph,
      node,
      label: Label.BIRTH_DATE,
      date: input.date,
    }),
    ensurePlace({
      vGraph,
      node,
      label: Label.BIRTH_PLACE,
      place: input.place,
    }),
  ]);

  return {
    _node: node,
    father,
    mother,
    child,
    date,
    place,
  };
};
