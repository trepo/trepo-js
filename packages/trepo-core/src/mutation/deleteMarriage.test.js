const {expect} = require('chai');
const Trepo = require('../Trepo.js');
const Label = require('trepo-ptree/dist/label.js');

let trepo;

describe('deleteMarriage', () => {
  beforeEach(async () => {
    trepo = new Trepo('repo');
    await trepo.start();
  });

  it('should work', async () => {
    const node = await trepo.vGraph.addNode(Label.MARRIAGE);
    const id = await node.getId();
    const response = await trepo.request({
      query: `mutation ($input: DeleteInput){
        node: deleteMarriage(input: $input)
      }`,
      variables: {
        input: {
          id,
        },
      },
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('node');
    const data = response.data.node;
    expect(data).to.equal(null);
  });
});