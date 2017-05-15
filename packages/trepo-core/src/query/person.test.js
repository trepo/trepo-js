const {expect} = require('chai');
const Trepo = require('../Trepo.js');
const Label = require('trepo-ptree/src/label.js');
const db = require('memdown');

let trepo;

describe('person', () => {
  beforeEach(async () => {
    trepo = new Trepo('repo', {db});
    await trepo.start();
  });

  it('should work', async () => {
    const node = await trepo.vGraph.addNode(Label.PERSON);
    const id = await node.getId();
    const birthNode = await trepo.vGraph.addNode(Label.BIRTH);
    const birth = await birthNode.getId();
    await trepo.vGraph.addEdge(Label.BIRTH_CHILD, node, birthNode);
    const deathNode = await trepo.vGraph.addNode(Label.DEATH);
    const death = await deathNode.getId();
    await trepo.vGraph.addEdge(Label.DEATH_PERSON, node, deathNode);
    const nameNode = await trepo.vGraph.addNode(Label.NAME);
    const name = await nameNode.getId();
    await trepo.vGraph.addEdge(Label.NAME_PERSON, node, nameNode);
    const spouseNode = await trepo.vGraph.addNode(Label.PERSON);
    const spouse = await spouseNode.getId();
    await trepo.vGraph.addEdge(Label.MARRIAGE_SPOUSE, node, spouseNode);
    const response = await trepo.request({
      query: `query ($id: String) {
        node: person(id: $id) {
          id
          birth {
            id
          }
          births {
            id
          }
          death {
            id
          }
          marriages {
            id
          }
          name {
            id
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
    expect(data).to.have.all
      .keys('id', 'birth', 'births', 'death', 'marriages', 'name');
    expect(data.id).to.equal(id);
    expect(data.birth.id).to.equal(birth);
    expect(data.births.length).to.equal(1);
    expect(data.births[0].id).to.equal(birth);
    expect(data.death.id).to.equal(death);
    expect(data.marriages.length).to.equal(1);
    expect(data.marriages[0].id).to.equal(spouse);
    expect(data.name.id).to.equal(name);
  });
});
