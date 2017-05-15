const {expect} = require('chai');
const Trepo = require('../Trepo.js');
const Label = require('trepo-ptree/src/label.js');
const db = require('memdown');

let trepo;

describe('deleteName', () => {
  beforeEach(async () => {
    trepo = new Trepo('repo', {db});
    await trepo.start();
  });

  it('should work', async () => {
    const name = await trepo.vGraph.addNode(Label.NAME);
    const nameId = await name.getId();
    const response = await trepo.request({
      query: `mutation ($input: DeleteInput){
        name: deleteName(input: $input)
      }`,
      variables: {
        input: {
          id: nameId,
        },
      },
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('name');
    const data = response.data.name;
    expect(data).to.equal(null);
  });
});
