const {expect} = require('chai');
const Trepo = require('../Trepo.js');
const Label = require('trepo-ptree/dist/label.js');

let trepo;

describe('commit', () => {
  beforeEach(async () => {
    trepo = new Trepo('repo');
    await trepo.start();
  });

  it('should work', async () => {
    const node = await trepo.vGraph.addNode(Label.PERSON);
    const id = await node.getId();
    const response = await trepo.request({
      query: `query ($id: String) {
        person(id: $id) {
          id
        }
      }`,
      variables: {
        id,
      },
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('person');
    const data = response.data.person;
    expect(data).to.have.all.keys('id');
    expect(data.id).to.equal(id);
  });
});
