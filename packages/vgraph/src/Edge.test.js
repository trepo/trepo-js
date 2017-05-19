const Constant = require('./Constant.js');
const {Edge} = require('./Element.js');
const Direction = require('./Direction.js');
const {VGraph} = require('./VGraph.js');

let db = require('memdown');
let expect = require('chai').expect;
let vagabond;
let vGraph;

beforeEach(done => {
  vGraph = new VGraph('http://localhost:8080/', {db});
  vGraph.init()
    .then(ignored => {
      vagabond = vGraph._vagabond;
      done();
    })
    .catch(error => done(error));
});

describe('Edge', () => {
  it('getNode should work', done => {
    Promise.all([
      vagabond.addNode('1234', 'label'),
      vagabond.addNode('5678', 'label'),
    ])
    .then(values => {
      return vagabond.addEdge('e1', 'label', values[0], values[1]);
    })
    .then(edge => {
      return new Edge(edge, vGraph).getNode(Direction.OUT);
    })
    .then(edge => edge.getId())
    .then(id => {
      expect(id).to.equal('1234');
      done();
    })
    .catch(error => done(error));
  });
  it('getNode should error on deleted', done => {
    let rawEdge;
    Promise.all([
      vagabond.addNode('1234', 'label'),
      vagabond.addNode('5678', 'label'),
    ])
    .then(values => {
      return vagabond.addEdge('e1', 'label', values[0], values[1]);
    })
    .then(e => {
      rawEdge = e;
      return rawEdge.setProperty(Constant.STATUS, 4);
    })
    .then(edge => {
      return new Edge(edge, vGraph).getNode(Direction.OUT);
    })
    .then(ignored => done(new Error('should have errored')))
    .catch(error => {
      expect(error.message).to.equal('Deleted');
      done();
    })
    .catch(error => done(error));
  });
});
