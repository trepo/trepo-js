const {expect} = require('chai');
const Trepo = require('../Trepo.js');
const Label = require('@trepo/ptree/src/label.js');
const db = require('memdown');

let trepo;

describe('updateBirth', () => {
  beforeEach(async () => {
    trepo = new Trepo('repo', {db});
    await trepo.start();
  });

  it('should work', async () => {
    const node = await trepo.vGraph.addNode(Label.BIRTH);
    const id = await node.getId();
    const fatherNode = await trepo.vGraph.addNode(Label.PERSON);
    const father = await fatherNode.getId();
    const motherNode = await trepo.vGraph.addNode(Label.PERSON);
    const mother = await motherNode.getId();
    const childNode = await trepo.vGraph.addNode(Label.PERSON);
    const child = await childNode.getId();

    const response = await trepo.request({
      query: `mutation ($input: BirthUpdateInput){
        node: updateBirth(input: $input) {
          id
          father {
            id
          }
          mother {
            id
          }
          child {
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
          father,
          mother,
          child,
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
    expect(data).to.have.all.keys('id', 'father', 'mother', 'child',
      'date', 'place');
    expect(data.id).to.equal(id);
    expect(data.father).to.have.all.keys('id');
    expect(data.father.id).to.equal(father);
    expect(data.mother).to.have.all.keys('id');
    expect(data.mother.id).to.equal(mother);
    expect(data.child).to.have.all.keys('id');
    expect(data.child.id).to.equal(child);
    expect(data.date).to.have.all.keys('formal', 'original');
    expect(data.date.formal).to.equal('formal');
    expect(data.date.original).to.equal('original');
    expect(data.place).to.have.all.keys('name');
    expect(data.place.name).to.equal('my place');
  });
});
