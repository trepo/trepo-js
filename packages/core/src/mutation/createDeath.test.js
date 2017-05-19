const {expect} = require('chai');
const Trepo = require('../Trepo.js');
const Label = require('@trepo/ptree/src/label.js');
const db = require('memdown');

let trepo;

describe('createDeath', () => {
  beforeEach(async () => {
    trepo = new Trepo('repo', {db});
    await trepo.start();
  });

  it('should work', async () => {
    const personNode = await trepo.vGraph.addNode(Label.PERSON);
    const person = await personNode.getId();

    const response = await trepo.request({
      query: `mutation ($input: DeathCreateInput){
        node: createDeath(input: $input) {
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
        input: {
          person,
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
    expect(data).to.have.all.keys('id', 'person', 'date', 'place');
    expect(data.id).to.not.equal(null);
    expect(data.person).to.have.all.keys('id');
    expect(data.person.id).to.equal(person);
    expect(data.date).to.have.all.keys('formal', 'original');
    expect(data.date.formal).to.equal('formal');
    expect(data.date.original).to.equal('original');
    expect(data.place).to.have.all.keys('name');
    expect(data.place.name).to.equal('my place');
  });
});
