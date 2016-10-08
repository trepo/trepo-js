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
      query: `mutation {
        person: createPerson {
          id
        }
      }`,
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('person');
    const data = response.data.person;
    expect(data).to.have.all.keys('id');
    expect(data.id).to.not.equal(null);
  });
});
