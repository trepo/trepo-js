const {expect} = require('chai');
const Trepo = require('../Trepo.js');
const db = require('memdown');

let trepo;

describe('commits', () => {
  beforeEach(async () => {
    trepo = new Trepo('repo', {db});
    await trepo.start();
  });

  it('should work', async () => {
    let response = await trepo.request({
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
    const id = response.data.commit.id;

    response = await trepo.request({
      query: `query {
        commits
      }`,
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('commits');
    let commits = response.data.commits;
    expect(commits.length).to.equal(1);
    expect(commits[0].id).to.equal(id);

    response = await trepo.request({
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
    const lastId = response.data.commit.id;

    await trepo.request({
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

    response = await trepo.request({
      query: `query {
        commits(after: "${id}" limit: 1)
      }`,
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('commits');
    commits = response.data.commits;
    expect(commits.length).to.equal(1);
    expect(commits[0].id).to.equal(lastId);
  });
});
