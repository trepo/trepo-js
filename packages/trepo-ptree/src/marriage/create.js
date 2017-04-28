const Label = require('../label.js');
const util = require('../util.js');
const checkPerson = require('../person/check.js');
const ensureDate = require('../date/ensure.js');
const ensurePersons = require('../person/ensureMultiple.js');
const ensurePlace = require('../place/ensure.js');

module.exports = async ({vGraph, input}) => {
  const [spouse1 = null, spouse2 = null] = input.spouses || [];

  await Promise.all([
    checkPerson({
      vGraph,
      id: spouse1,
    }),
    checkPerson({
      vGraph,
      id: spouse2,
    }),
  ]);

  const node = await util.createNode({
    vGraph,
    label: Label.MARRIAGE,
  });

  const [date, place, spouses] = await Promise.all([
    ensureDate({
      vGraph,
      node,
      label: Label.MARRIAGE_DATE,
      date: input.date,
    }),
    ensurePlace({
      vGraph,
      node,
      label: Label.MARRIAGE_PLACE,
      place: input.place,
    }),
    ensurePersons({
      vGraph,
      node,
      label: Label.MARRIAGE_SPOUSE,
      ids: [spouse1, spouse2],
    }),
  ]);

  return {
    _node: node,
    spouses,
    date,
    place,
  };
};
