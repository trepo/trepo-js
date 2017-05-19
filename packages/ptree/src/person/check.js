const Label = require('../label.js');
const util = require('../util.js');

module.exports = async ({vGraph, id}) => {
  return util.checkNode({
    vGraph,
    id,
    label: Label.PERSON,
  });
};
