const {expect} = require('chai');
const Trepo = require('../Trepo.js');
const db = require('memdown');

let trepo;

describe('patch', () => {
  beforeEach(async () => {
    trepo = new Trepo('repo', {db});
    await trepo.start();
  });

  it('should work', async () => {
    let response = await trepo.request({
      query: `mutation ($input: CommitInput) {
        commit(input: $input) {
          id
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
    const commit = response.data.commit.json.toJSON();

    await trepo.request({
      query: `mutation ($input: UndoInput) {
        undo(input: $input)
      }`,
      variables: {
        input: {
          id,
        },
      },
    });

    response = await trepo.request({
      query: `mutation ($input: PatchInput) {
        patch(input: $input)
      }`,
      variables: {
        input: {
          commit,
        },
      },
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('patch');
    const data = response.data.patch;
    expect(data).to.equal(null);

    response = await trepo.request({
      query: `query { info {lastCommit}}`,
    });
    expect(response.data.info.lastCommit).to.equal(commit.id);
  });
});
