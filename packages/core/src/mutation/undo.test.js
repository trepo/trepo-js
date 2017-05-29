const {expect} = require('chai');
const Trepo = require('../Trepo.js');
const db = require('memdown');

let trepo;

describe('undo', () => {
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
    const undoneId = response.data.commit.id;

    response = await trepo.request({
      query: `mutation ($input: UndoInput) {
        undo(input: $input)
      }`,
      variables: {
        input: {
          id,
        },
      },
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('undo');
    const data = response.data.undo;
    expect(data.length).to.equal(1);
    expect(data[0]).to.equal(undoneId);
  });
});
