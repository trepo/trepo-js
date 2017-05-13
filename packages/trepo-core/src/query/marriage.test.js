const {expect} = require('chai');
const Trepo = require('../Trepo.js');
const Label = require('trepo-ptree/dist/label.js');
const Prop = require('trepo-ptree/dist/prop.js');
const db = require('memdown');

let trepo;

describe('marriage', () => {
  beforeEach(async () => {
    trepo = new Trepo('repo', {db});
    await trepo.start();
  });

  it('should work', async () => {
    const node = await trepo.vGraph.addNode(Label.MARRIAGE);
    const id = await node.getId();
    const spouse1Node = await trepo.vGraph.addNode(Label.PERSON);
    const spouse1 = await spouse1Node.getId();
    await trepo.vGraph.addEdge(Label.MARRIAGE_SPOUSE, spouse1Node, node);
    const spouse2Node = await trepo.vGraph.addNode(Label.PERSON);
    const spouse2 = await spouse2Node.getId();
    await trepo.vGraph.addEdge(Label.MARRIAGE_SPOUSE, spouse2Node, node);
    const date = await trepo.vGraph.addNode(Label.DATE);
    await date.setProperties({
      [Prop.DATE_FORMAL]: 'formal',
      [Prop.DATE_ORIGINAL]: 'original',
    });
    await trepo.vGraph.addEdge(Label.MARRIAGE_DATE, node, date);
    const place = await trepo.vGraph.addNode(Label.DATE);
    await place.setProperties({
      [Prop.PLACE_NAME]: 'my place',
    });
    await trepo.vGraph.addEdge(Label.MARRIAGE_PLACE, node, place);
    const response = await trepo.request({
      query: `query ($id: String) {
        node: marriage(id: $id) {
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
        id,
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
