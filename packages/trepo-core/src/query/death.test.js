const {expect} = require('chai');
const Trepo = require('../Trepo.js');
const Label = require('trepo-ptree/dist/label.js');
const Prop = require('trepo-ptree/dist/prop.js');

let trepo;

describe('death', () => {
  beforeEach(async () => {
    trepo = new Trepo('repo');
    await trepo.start();
  });

  it('should work', async () => {
    const node = await trepo.vGraph.addNode(Label.DEATH);
    const id = await node.getId();
    const personNode = await trepo.vGraph.addNode(Label.PERSON);
    const person = await personNode.getId();
    await trepo.vGraph.addEdge(Label.DEATH_PERSON, personNode, node);
    const date = await trepo.vGraph.addNode(Label.DATE);
    await date.setProperties({
      [Prop.DATE_FORMAL]: 'formal',
      [Prop.DATE_ORIGINAL]: 'original',
    });
    await trepo.vGraph.addEdge(Label.DEATH_DATE, node, date);
    const place = await trepo.vGraph.addNode(Label.DATE);
    await place.setProperties({
      [Prop.PLACE_NAME]: 'my place',
    });
    await trepo.vGraph.addEdge(Label.DEATH_PLACE, node, place);
    const response = await trepo.request({
      query: `query ($id: String) {
        node: death(id: $id) {
          id
          person {
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
    expect(data).to.have.all.keys('id', 'person', 'date', 'place');
    expect(data.id).to.equal(id);
    expect(data.person).to.have.all.keys('id');
    expect(data.person.id).to.equal(person);
    expect(data.date).to.have.all.keys('formal', 'original');
    expect(data.date.formal).to.equal('formal');
    expect(data.date.original).to.equal('original');
    expect(data.place).to.have.all.keys('name');
    expect(data.place.name).to.equal('my place');
  });
});
