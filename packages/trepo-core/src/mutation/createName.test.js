const {expect} = require('chai');
const Trepo = require('../Trepo.js');
const Label = require('trepo-ptree/dist/label.js');

let trepo;

describe('createName', () => {
  beforeEach(async () => {
    trepo = new Trepo('repo');
    await trepo.start();
  });

  it('should work', async () => {
    const person = await trepo.vGraph.addNode(Label.PERSON);
    const id = await person.getId();
    const response = await trepo.request({
      query: `mutation ($input: NameCreateInput){
        name: createName(input: $input) {
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
          name: 'my name',
          person: id,
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
    expect(data.person.id).to.equal(id);
    expect(data.person.name.id).to.equal(data.id);
  });
});
