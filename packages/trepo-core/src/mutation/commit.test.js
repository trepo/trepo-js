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
      query: `mutation ($input: CommitInput) {
        commit(input: $input) {
          id
          json
        }
      }`,
      variables: {
        input: {
          author: 'author',
          email: 'a@b.c',
          message: 'message',
        },
      },
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('commit');
    const data = response.data.commit;
    expect(data).to.have.all.keys('id', 'json');
    expect(data.json.id).to.equal(data.id);
  });
});
