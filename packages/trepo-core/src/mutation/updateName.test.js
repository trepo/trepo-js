const {expect} = require('chai');
const Trepo = require('../Trepo.js');
const Label = require('trepo-ptree/dist/label.js');
const db = require('memdown');

let trepo;

describe('updateName', () => {
  beforeEach(async () => {
    trepo = new Trepo('repo', {db});
    await trepo.start();
  });

  it('should work', async () => {
    const name = await trepo.vGraph.addNode(Label.NAME);
    const nameId = await name.getId();
    const person = await trepo.vGraph.addNode(Label.PERSON);
    const personId = await person.getId();
    const response = await trepo.request({
      query: `mutation ($input: NameUpdateInput){
        name: updateName(input: $input) {
          id
          name
          person {
            id
            name {
              id
            }
          }
        }
      }`,
      variables: {
        input: {
          id: nameId,
          name: 'my name',
          person: personId,
        },
      },
    });
    expect(response).to.have.all.keys('data');
    expect(response.data).to.have.all.keys('name');
    const data = response.data.name;
    expect(data).to.have.all.keys('id', 'name', 'person');
    expect(data.id).to.not.equal(null);
    expect(data.name).to.equal('my name');
    expect(data.person).to.have.all.keys('id', 'name');
    expect(data.person.id).to.equal(personId);
    expect(data.person.name.id).to.equal(data.id);
  });
});
