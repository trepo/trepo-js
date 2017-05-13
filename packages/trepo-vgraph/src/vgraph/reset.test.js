import VGraph from '../VGraph.js';

let db = require('memdown');
let expect = require('chai').expect;
let vGraph;

let uuid1 = '111defc1-7c54-4189-8ae9-166d24edd68e';

beforeEach(() => {
  vGraph = new VGraph('repo', {db});
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
