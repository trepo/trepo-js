import Constant from '../Constant.js';
import Node from '../Node.js';
import Edge from '../Edge.js';
import Direction from '../Direction.js';
import Commit from '../Commit.js';
import VGraph from '../VGraph.js';

let expect = require('chai').expect;
let vGraph;

let uuid1 = '111defc1-7c54-4189-8ae9-166d24edd68e';
let uuid2 = '2a086114-ad06-4e5e-826f-f653a73492bd';
let uuid3 = '347d858f-d27e-4e95-80fd-8893412021f5';
let uuid4 = '44465625-8aac-4cd2-8b07-fc918ec6f202';
let uuid5 = '51c8a50a-d61f-48e6-955f-e893a36f74b0';
let uuid6 = '659c0d14-ddf4-4033-bb95-c474e9a4a435';
let uuid7 = '7b70fed7-29a9-405d-b07e-c32516780276';
let uuid8 = '86919ef3-bcea-4d11-b154-3495b9167628';
let uuid9 = '93ae3afe-48ef-4d51-9f31-4e254ad86148';

beforeEach(() => {
  vGraph = new VGraph('repo');
});

describe('VGraph - reset', () => {
  it('reset should undo deleted edge', done => {
    let id;
    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label'),
      ]))
      .then(values => vGraph.addEdge('label', values[0], values[1]))
      .then(edge => edge.getId())
      .then(edgeId => {
        id = edgeId;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => vGraph.removeEdge(id))
      .then(ignored => vGraph.getEdge(id))
      .then(ignored => done(new Error('Should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Deleted');
        return vGraph.reset();
      })
      .then(ignored => vGraph.getEdge(id))
      .then(edge => done())
      .catch(error => done(error));
  });

  it('reset should undo deleted node', done => {
    let id;
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(node => node.getId())
      .then(nodeId => {
        id = nodeId;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => vGraph.removeNode(id))
      .then(ignored => vGraph.getNode(id))
      .then(ignored => done(new Error('Should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Deleted');
        return vGraph.reset();
      })
      .then(ignored => vGraph.getNode(id))
      .then(node => done())
      .catch(error => done(error));
  });

  it('reset should restore updated edge', done => {
    let edge;
    let id;
    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label'),
      ]))
      .then(values => vGraph.addEdge('label', values[0], values[1]))
      .then(newEdge => {
        edge = newEdge;
        return Promise.all([
          edge.getId(),
          edge.setProperties({
            foo: 'bar',
            props: true,
          }),
        ]);
      })
      .then(values => {
        id = values[0];
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => edge.setProperties({
        foo: 'bar2',
        props: false,
      }))
      .then(ignored => vGraph.reset())
      .then(ignored => edge.getProperties())
      .then(properties => {
        expect(properties).to.deep.equal({
          foo: 'bar',
          props: true,
        });
        done();
      })
      .catch(error => done(error));
  });

  it('reset should remove created edge', done => {
    let fromNode;
    let toNode;
    let id;
    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label'),
      ]))
      .then(values => {
        fromNode = values[0];
        toNode = values[1];
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => vGraph.addEdge('label', fromNode, toNode))
      .then(edge => edge.getId())
      .then(edgeId => {
        id = edgeId;
        return vGraph.reset();
      })
      .then(ignored => vGraph.getEdge(id))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Edge Not Found');
        done();
      })
      .catch(error => done(error));
  });

  it('reset should restore updated node', done => {
    let node;
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(newNode => {
        node = newNode;
        return node.setProperties({
          foo: 'bar',
          props: true,
        });
      })
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => node.setProperties({
        foo: 'bar2',
        props: false,
      }))
      .then(ignored => vGraph.reset())
      .then(ignored => node.getProperties())
      .then(properties => {
        expect(properties).to.deep.equal({
          foo: 'bar',
          props: true,
        });
        done();
      })
      .catch(error => done(error));
  });

  it('reset should restore converted node', done => {
    let node;
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(newNode => {
        node = newNode;
        return node.setProperties({
          foo: 'bar',
          props: true,
        });
      })
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => node.convertToBoundary('external'))
      .then(ignored => vGraph.reset())
      .then(ignored => node.getProperties())
      .then(properties => {
        expect(properties).to.deep.equal({
          foo: 'bar',
          props: true,
        });
        done();
      })
      .catch(error => done(error));
  });

  it('reset should restore updated boundary', done => {
    let node;
    vGraph.init()
      .then(ignored => vGraph.addBoundary(uuid1, 'label', 'external'))
      .then(newNode => {
        node = newNode;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => node.setRepo('external2'))
      .then(ignored => vGraph.reset())
      .then(ignored => node.getRepo())
      .then(repo => {
        expect(repo).to.equal('external');
        done();
      })
      .catch(error => done(error));
  });

  it('reset should restore converted boundary', done => {
    let node;
    vGraph.init()
      .then(ignored => vGraph.addBoundary(uuid1, 'label', 'external'))
      .then(newNode => {
        node = newNode;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => node.convertToNode())
      .then(ignored => node.setProperties({
        foo: 'bar2',
        props: false,
      }))
      .then(ignored => vGraph.reset())
      .then(ignored => node.getRepo())
      .then(repo => {
        expect(repo).to.equal('external');
        done();
      })
      .catch(error => done(error));
  });

  it('reset should remove created node', done => {
    let id;
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(node => node.getId())
      .then(nodeId => {
        id = nodeId;
        return vGraph.reset();
      })
      .then(ignored => vGraph.getNode(id))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Node Not Found');
        done();
      })
      .catch(error => done(error));
  });
});
