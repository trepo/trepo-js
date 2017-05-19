const {expect} = require('chai');
const Trepo = require('../Trepo.js');
const Label = require('@trepo/ptree/src/label.js');
const db = require('memdown');

let trepo;

describe('updateMarriage', () => {
  beforeEach(async () => {
    trepo = new Trepo('repo', {db});
    await trepo.start();
  });

  it('should work', async () => {
    const node = await trepo.vGraph.addNode(Label.MARRIAGE);
    const id = await node.getId();
    const spouse1Node = await trepo.vGraph.addNode(Label.PERSON);
    const spouse1 = await spouse1Node.getId();
    const spouse2Node = await trepo.vGraph.addNode(Label.PERSON);
    const spouse2 = await spouse2Node.getId();

    const response = await trepo.request({
      query: `mutation ($input: MarriageUpdateInput){
        node: updateMarriage(input: $input) {
          id
          spouses {
            id
          }
          date {
            formal
            original
          }
          place {
            name
          }
        }
      }`,
      variables: {
        input: {
          id,
          spouses: [spouse1, spouse2],
          date: {
            original: 'original',
            formal: 'formal',
          },
          place: {
            name: 'my place',
          },
        },
      },
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('node');
    const data = response.data.node;
    expect(data).to.have.all.keys('id', 'spouses', 'date', 'place');
    expect(data.id).to.equal(id);
    expect(data.spouses.length).to.equal(2);
    expect([data.spouses[0].id, data.spouses[1].id].sort())
      .to.deep.equal([spouse1, spouse2].sort());
    expect(data.date).to.have.all.keys('formal', 'original');
    expect(data.date.formal).to.equal('formal');
    expect(data.date.original).to.equal('original');
    expect(data.place).to.have.all.keys('name');
    expect(data.place.name).to.equal('my place');
  });
});
