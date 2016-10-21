const {expect} = require('chai');
const Trepo = require('../Trepo.js');

let trepo;

describe('commit', () => {
  beforeEach(async () => {
    trepo = new Trepo('repo');
    await trepo.start();
  });

  it('should work', async () => {
    const response = await trepo.request({
      query: `mutation ($input: PersonCreateInput){
        node: createPerson(input: $input) {
          id
        }
      }`,
      variables: {
        input: {
        },
      },
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('node');
    const data = response.data.node;
    expect(data).to.have.all.keys('id');
    expect(data.id).to.not.equal(null);
  });
});
