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
      query: `query {
        info {
          repo
          lastCommit
          dirty
        }
      }`,
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('info');
    const data = response.data.info;
    expect(data).to.have.all.keys('repo', 'lastCommit', 'dirty');
    expect(data.repo).to.equal('repo');
    expect(data.lastCommit).to.equal(null);
    expect(data.dirty).to.equal(false);
  });
});
