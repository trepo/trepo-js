const {expect} = require('chai');
const Trepo = require('../Trepo.js');
const db = require('memdown');

let trepo;

describe('commit', () => {
  beforeEach(async () => {
    trepo = new Trepo('repo', {db});
    await trepo.start();
  });

  it('should work', async () => {
    const response = await trepo.request({
      query: `mutation ($input: PersonCreateInput){
        node: createPerson(input: $input) {
          id
          name {
            name
          }
        }
      }`,
      variables: {
        input: {
          name: 'my name',
        },
      },
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('node');
    const data = response.data.node;
    expect(data).to.have.all.keys('id', 'name');
    expect(data.id).to.not.equal(null);
    expect(data.name).to.not.equal(null);
    expect(data.name.name).to.equal('my name');
  });
});
