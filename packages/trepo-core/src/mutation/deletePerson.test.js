const {expect} = require('chai');
const Trepo = require('../Trepo.js');
const Label = require('trepo-ptree/dist/label.js');

let trepo;

describe('deletePerson', () => {
  beforeEach(async () => {
    trepo = new Trepo('repo');
    await trepo.start();
  });

  it('should work', async () => {
    const name = await trepo.vGraph.addNode(Label.PERSON);
    const nameId = await name.getId();
    const response = await trepo.request({
      query: `mutation ($input: DeleteInput){
        name: deletePerson(input: $input)
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
