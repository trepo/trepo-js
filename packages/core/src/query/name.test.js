const {expect} = require('chai');
const Trepo = require('../Trepo.js');
const Label = require('@trepo/ptree/src/label.js');
const Prop = require('@trepo/ptree/src/prop.js');
const db = require('memdown');

let trepo;

describe('name', () => {
  beforeEach(async () => {
    trepo = new Trepo('repo', {db});
    await trepo.start();
  });

  it('should work', async () => {
    const name = await trepo.vGraph.addNode(Label.NAME);
    await name.setProperty(Prop.NAME_NAME, 'my name');
    const nameId = await name.getId();
    const person = await trepo.vGraph.addNode(Label.PERSON);
    const personId = await person.getId();
    await trepo.vGraph.addEdge(Label.NAME_PERSON, person, name);
    const response = await trepo.request({
      query: `query ($id: String) {
        name(id: $id) {
          id
          name
          person {
            id
          }
        }
      }`,
      variables: {
        id: nameId,
      },
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('name');
    const data = response.data.name;
    expect(data).to.have.all.keys('id', 'name', 'person');
    expect(data.id).to.not.equal(null);
    expect(data.name).to.equal('my name');
    expect(data.person).to.have.all.keys('id');
    expect(data.person.id).to.equal(personId);
  });
});
