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

describe('VGraph - status', () => {
  it('status should create a valid commit', done => {
    let prev;
    vGraph.init()
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(commit => {
        prev = commit.id;
        return vGraph.status('author', 'email', 'message');
      })
      .then(commit => {
        commit.validate();
        expect(commit.prev).to.equal(prev);
        expect(commit.author).to.equal('author');
        expect(commit.email).to.equal('email');
        expect(commit.message).to.equal('message');
        return vGraph.status();
      })
      .then(commit => {
        commit.validate();
        done();
      })
      .catch(error => done(error));
  });

  it('status should delete node converted to boundary then deleted', done => {
    let node;
    let id;
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(n => {
        node = n;
        return node.setProperties({
          foo: 'bar',
          props: true,
        });
      })
      .then(ignored => node.getId())
      .then(nodeId => {
        id = nodeId;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => node.convertToBoundary('external'))
      .then(ignored => vGraph.removeNode(id))
      .then(ignored => vGraph.status('author', 'email', 'message'))
      .then(commit => {
        commit.validate();
        expect(commit.nodes).to.have.length(1);
        let commitNode = commit.nodes[0];
        expect(commitNode.id).to.equal(id);
        expect(commitNode.label).to.equal('label');
        expect(commitNode.action).to.equal(Constant.DELETE);
        expect(commitNode.boundary).to.equal(false);
        expect(commitNode.origProps).to.deep.equal({
          foo: 'bar',
          props: true,
        });
        done();
      })
      .catch(error => done(error));
  });

  it('status should delete updated boundary then deleted', done => {
    let node;
    vGraph.init()
      .then(ignored => vGraph.addBoundary(uuid1, 'label', 'external'))
      .then(n => {
        node = n;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => node.setRepo('external2'))
      .then(ignored => vGraph.removeNode(uuid1))
      .then(ignored => vGraph.status('author', 'email', 'message'))
      .then(commit => {
        commit.validate();
        expect(commit.nodes).to.have.length(1);
        let commitNode = commit.nodes[0];
        expect(commitNode.id).to.equal(uuid1);
        expect(commitNode.label).to.equal('label');
        expect(commitNode.action).to.equal(Constant.DELETE);
        expect(commitNode.boundary).to.equal(true);
        expect(commitNode.origRepo).to.deep.equal('external');
        done();
      })
      .catch(error => done(error));
  });

  it('status should delete deleted boundary', done => {
    let node;
    vGraph.init()
      .then(ignored => vGraph.addBoundary(uuid1, 'label', 'external'))
      .then(n => {
        node = n;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => vGraph.removeNode(uuid1))
      .then(ignored => vGraph.status('author', 'email', 'message'))
      .then(commit => {
        commit.validate();
        expect(commit.nodes).to.have.length(1);
        let commitNode = commit.nodes[0];
        expect(commitNode.id).to.equal(uuid1);
        expect(commitNode.label).to.equal('label');
        expect(commitNode.action).to.equal(Constant.DELETE);
        expect(commitNode.boundary).to.equal(true);
        expect(commitNode.origRepo).to.deep.equal('external');
        done();
      })
      .catch(error => done(error));
  });

  it('status should actually delete boundary created then deleted', done => {
    vGraph.init()
      .then(ignored => vGraph.addBoundary(uuid1, 'label', 'external'))
      .then(ignored => vGraph.removeNode(uuid1))
      .then(ignored => vGraph.status('author', 'email', 'message'))
      .then(commit => {
        commit.validate();
        expect(commit.nodes).to.have.length(0);
        return vGraph._vagabond.getNode(uuid1);
      })
      .then(ignored => done(new Error('Should Have Errored')))
      .catch(error => {
        expect(error.message).to.equal('Node Not Found');
        done();
      })
      .catch(error => done(error));
  });

  it('status should delete boundary converted to node then deleted', done => {
    let node;
    vGraph.init()
      .then(ignored => vGraph.addBoundary(uuid1, 'label', 'external'))
      .then(n => {
        node = n;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => node.convertToNode())
      .then(ignored => node.setProperties({
        foo: 'bar',
        props: true,
      }))
      .then(ignored => vGraph.removeNode(uuid1))
      .then(ignored => vGraph.status('author', 'email', 'message'))
      .then(commit => {
        commit.validate();
        expect(commit.nodes).to.have.length(1);
        let commitNode = commit.nodes[0];
        expect(commitNode.id).to.equal(uuid1);
        expect(commitNode.label).to.equal('label');
        expect(commitNode.action).to.equal(Constant.DELETE);
        expect(commitNode.boundary).to.equal(true);
        expect(commitNode.origRepo).to.deep.equal('external');
        done();
      })
      .catch(error => done(error));
  });

  it('status should delete updated node then deleted', done => {
    let node;
    let id;
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(n => {
        node = n;
        return node.setProperties({
          foo: 'bar',
          props: true,
        });
      })
      .then(ignored => node.getId())
      .then(nodeId => {
        id = nodeId;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => node.setProperties({
        foo: 'bar2',
        props: false,
      }))
      .then(ignored => vGraph.removeNode(id))
      .then(ignored => vGraph.status('author', 'email', 'message'))
      .then(commit => {
        commit.validate();
        expect(commit.nodes).to.have.length(1);
        let commitNode = commit.nodes[0];
        expect(commitNode.id).to.equal(id);
        expect(commitNode.label).to.equal('label');
        expect(commitNode.action).to.equal(Constant.DELETE);
        expect(commitNode.boundary).to.equal(false);
        expect(commitNode.origProps).to.deep.equal({
          foo: 'bar',
          props: true,
        });
        done();
      })
      .catch(error => done(error));
  });

  it('status should delete deleted node', done => {
    let node;
    let id;
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(n => {
        node = n;
        return node.setProperties({
          foo: 'bar',
          props: true,
        });
      })
      .then(ignored => node.getId())
      .then(nodeId => {
        id = nodeId;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => vGraph.removeNode(id))
      .then(ignored => vGraph.status('author', 'email', 'message'))
      .then(commit => {
        commit.validate();
        expect(commit.nodes).to.have.length(1);
        let commitNode = commit.nodes[0];
        expect(commitNode.id).to.equal(id);
        expect(commitNode.label).to.equal('label');
        expect(commitNode.action).to.equal(Constant.DELETE);
        expect(commitNode.boundary).to.equal(false);
        expect(commitNode.origProps).to.deep.equal({
          foo: 'bar',
          props: true,
        });
        done();
      })
      .catch(error => done(error));
  });

  it('status should actually delete node created then deleted', done => {
    let node;
    let id;
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(n => {
        node = n;
        return node.setProperties({
          foo: 'bar',
          props: true,
        });
      })
      .then(ignored => node.getId())
      .then(nodeId => {
        id = nodeId;
        return vGraph.removeNode(id);
      })
      .then(ignored => vGraph.status('author', 'email', 'message'))
      .then(commit => {
        commit.validate();
        expect(commit.nodes).to.have.length(0);
        return vGraph._vagabond.getNode(id);
      })
      .then(ignored => done(new Error('Should Have Errored')))
      .catch(error => {
        expect(error.message).to.equal('Node Not Found');
        done();
      })
      .catch(error => done(error));
  });

  it('should delete and check references (+ existing references) on deleted');

  it('status should delete updated edge then deleted', done => {
    let fromNodeId;
    let toNodeId;
    let edge;
    let id;
    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label'),
      ]))
      .then(values => Promise.all([
        values[0].getId(),
        values[1].getId(),
        vGraph.addEdge('label', values[0], values[1]),
      ]))
      .then(values => {
        fromNodeId = values[0];
        toNodeId = values[1];
        edge = values[2];
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
      .then(ignored => vGraph.removeEdge(id))
      .then(ignored => vGraph.status('author', 'email', 'message'))
      .then(commit => {
        commit.validate();
        expect(commit.nodes).to.have.length(2);
        for (let commitNode of commit.nodes) {
          if (commitNode.id == fromNodeId || commitNode.id == toNodeId) {
            expect(commitNode.label).to.equal('label');
            expect(commitNode.action).to.equal(Constant.REFERENCE);
            expect(commitNode.boundary).to.equal(true);
            expect(commitNode.repo).to.equal('repo');
          } else {
            throw new Error('unknown commit node');
          }
        }
        expect(commit.edges).to.have.length(1);
        let commitEdge = commit.edges[0];
        expect(commitEdge.id).to.equal(id);
        expect(commitEdge.label).to.equal('label');
        expect(commitEdge.from).to.equal(fromNodeId);
        expect(commitEdge.to).to.equal(toNodeId);
        expect(commitEdge.action).to.equal(Constant.DELETE);
        expect(commitEdge.origProps).to.deep.equal({
          foo: 'bar',
          props: true,
        });
        done();
      })
      .catch(error => done(error));
  });

  it('status should delete deleted edge', done => {
    let fromNodeId;
    let toNodeId;
    let edge;
    let id;
    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label'),
      ]))
      .then(values => Promise.all([
        values[0].getId(),
        values[1].getId(),
        vGraph.addEdge('label', values[0], values[1]),
      ]))
      .then(values => {
        fromNodeId = values[0];
        toNodeId = values[1];
        edge = values[2];
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
      .then(ignored => vGraph.removeEdge(id))
      .then(ignored => vGraph.status('author', 'email', 'message'))
      .then(commit => {
        commit.validate();
        expect(commit.nodes).to.have.length(2);
        for (let commitNode of commit.nodes) {
          if (commitNode.id == fromNodeId || commitNode.id == toNodeId) {
            expect(commitNode.label).to.equal('label');
            expect(commitNode.action).to.equal(Constant.REFERENCE);
            expect(commitNode.boundary).to.equal(true);
            expect(commitNode.repo).to.equal('repo');
          } else {
            throw new Error('unknown commit node');
          }
        }
        expect(commit.edges).to.have.length(1);
        let commitEdge = commit.edges[0];
        expect(commitEdge.id).to.equal(id);
        expect(commitEdge.label).to.equal('label');
        expect(commitEdge.from).to.equal(fromNodeId);
        expect(commitEdge.to).to.equal(toNodeId);
        expect(commitEdge.action).to.equal(Constant.DELETE);
        expect(commitEdge.origProps).to.deep.equal({
          foo: 'bar',
          props: true,
        });
        done();
      })
      .catch(error => done(error));
  });

  it('status should actually delete edge created then deleted', done => {
    let edge;
    let id;
    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label'),
      ]))
      .then(values => vGraph.addEdge('label', values[0], values[1]))
      .then(e => {
        edge = e;
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
        return vGraph.removeEdge(id);
      })
      .then(ignored => vGraph.status('author', 'email', 'message'))
      .then(commit => {
        commit.validate();
        expect(commit.edges).to.have.length(0);
        return vGraph._vagabond.getEdge(id);
      })
      .then(ignored => done(new Error('Should Have Errored')))
      .catch(error => {
        expect(error.message).to.equal('Edge Not Found');
        done();
      })
      .catch(error => done(error));
  });

  it('status should update node converted to boundary', done => {
    let node;
    let id;
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(n => {
        node = n;
        return node.setProperties({
          foo: 'bar',
          props: true,
        });
      })
      .then(ignored => node.getId())
      .then(nodeId => {
        id = nodeId;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => node.convertToBoundary('external'))
      .then(ignored => vGraph.status('author', 'email', 'message'))
      .then(commit => {
        commit.validate();
        expect(commit.nodes).to.have.length(1);
        let commitNode = commit.nodes[0];
        expect(commitNode.id).to.equal(id);
        expect(commitNode.label).to.equal('label');
        expect(commitNode.action).to.equal(Constant.UPDATE);
        expect(commitNode.boundary).to.equal(true);
        expect(commitNode.repo).to.equal('external');
        expect(commitNode.origProps).to.deep.equal({
          foo: 'bar',
          props: true,
        });
        done();
      })
      .catch(error => done(error));
  });

  it('status should update updated boundary', done => {
    let node;
    vGraph.init()
      .then(ignored => vGraph.addBoundary(uuid1, 'label', 'external'))
      .then(n => {
        node = n;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => node.setRepo('external2'))
      .then(ignored => vGraph.status('author', 'email', 'message'))
      .then(commit => {
        commit.validate();
        expect(commit.nodes).to.have.length(1);
        let commitNode = commit.nodes[0];
        expect(commitNode.id).to.equal(uuid1);
        expect(commitNode.label).to.equal('label');
        expect(commitNode.action).to.equal(Constant.UPDATE);
        expect(commitNode.boundary).to.equal(true);
        expect(commitNode.repo).to.equal('external2');
        expect(commitNode.origRepo).to.equal('external');
        done();
      })
      .catch(error => done(error));
  });

  it('status should create created boundary', done => {
    let node;
    vGraph.init()
      .then(ignored => vGraph.addBoundary(uuid1, 'label', 'external'))
      .then(n => {
        node = n;
        return vGraph.status('author', 'email', 'message');
      })
      .then(commit => {
        commit.validate();
        expect(commit.nodes).to.have.length(1);
        let commitNode = commit.nodes[0];
        expect(commitNode.id).to.equal(uuid1);
        expect(commitNode.label).to.equal('label');
        expect(commitNode.action).to.equal(Constant.CREATE);
        expect(commitNode.boundary).to.equal(true);
        expect(commitNode.repo).to.equal('external');
        done();
      })
      .catch(error => done(error));
  });

  it('status should update boundary converted to node', done => {
    let node;
    vGraph.init()
      .then(ignored => vGraph.addBoundary(uuid1, 'label', 'external'))
      .then(n => {
        node = n;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => node.convertToNode())
      .then(ignored => node.setProperties({
        foo: 'bar',
        props: true,
      }))
      .then(ignored => vGraph.status('author', 'email', 'message'))
      .then(commit => {
        commit.validate();
        expect(commit.nodes).to.have.length(1);
        let commitNode = commit.nodes[0];
        expect(commitNode.id).to.equal(uuid1);
        expect(commitNode.label).to.equal('label');
        expect(commitNode.action).to.equal(Constant.UPDATE);
        expect(commitNode.boundary).to.equal(false);
        expect(commitNode.props).to.deep.equal({
          foo: 'bar',
          props: true,
        });
        expect(commitNode.origRepo).to.equal('external');
        done();
      })
      .catch(error => done(error));
  });

  it('status should update updated node', done => {
    let node;
    let id;
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(n => {
        node = n;
        return Promise.all([
          node.getId(),
          node.setProperties({
            foo: 'bar',
            props: true,
          }),
        ]);
      })
      .then(values => {
        id = values[0];
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => node.setProperties({
        foo: 'bar2',
        props: false,
      }))
      .then(ignored => vGraph.status('author', 'email', 'message'))
      .then(commit => {
        commit.validate();
        expect(commit.nodes).to.have.length(1);
        let commitNode = commit.nodes[0];
        expect(commitNode.id).to.equal(id);
        expect(commitNode.label).to.equal('label');
        expect(commitNode.action).to.equal(Constant.UPDATE);
        expect(commitNode.boundary).to.equal(false);
        expect(commitNode.props).to.deep.equal({
          foo: 'bar2',
          props: false,
        });
        expect(commitNode.origProps).to.deep.equal({
          foo: 'bar',
          props: true,
        });
        done();
      })
      .catch(error => done(error));
  });

  it('status should create created node', done => {
    let node;
    let id;
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(n => {
        node = n;
        return Promise.all([
          node.getId(),
          node.setProperties({
            foo: 'bar',
            props: true,
          }),
        ]);
      })
      .then(values => {
        id = values[0];
        return vGraph.status('author', 'email', 'message');
      })
      .then(commit => {
        commit.validate();
        expect(commit.nodes).to.have.length(1);
        let commitNode = commit.nodes[0];
        expect(commitNode.id).to.equal(id);
        expect(commitNode.label).to.equal('label');
        expect(commitNode.action).to.equal(Constant.CREATE);
        expect(commitNode.boundary).to.equal(false);
        expect(commitNode.props).to.deep.equal({
          foo: 'bar',
          props: true,
        });
        done();
      })
      .catch(error => done(error));
  });

  it('status should create with references on created edge', done => {
    let fromNode;
    let fromNodeId;
    let toNode;
    let toNodeId;
    let edge;
    let id;
    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label'),
      ]))
      .then(values => {
        fromNode = values[0];
        toNode = values[1];
        return Promise.all([
          values[0].getId(),
          values[1].getId(),
        ]);
      })
      .then(values => {
        fromNodeId = values[0];
        toNodeId = values[1];
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => vGraph.addEdge('label', fromNode, toNode))
      .then(e => {
        edge = e;
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
        return vGraph.status('author', 'email', 'message');
      })
      .then(commit => {
        commit.validate();
        expect(commit.nodes).to.have.length(2);
        for (let commitNode of commit.nodes) {
          if (commitNode.id == fromNodeId || commitNode.id == toNodeId) {
            expect(commitNode.label).to.equal('label');
            expect(commitNode.action).to.equal(Constant.REFERENCE);
            expect(commitNode.boundary).to.equal(true);
            expect(commitNode.repo).to.equal('repo');
          } else {
            throw new Error('unknown commit node');
          }
        }

        expect(commit.edges).to.have.length(1);
        let commitEdge = commit.edges[0];
        expect(commitEdge.id).to.equal(id);
        expect(commitEdge.label).to.equal('label');
        expect(commitEdge.from).to.equal(fromNodeId);
        expect(commitEdge.to).to.equal(toNodeId);
        expect(commitEdge.action).to.equal(Constant.CREATE);
        expect(commitEdge.props).to.deep.equal({
          foo: 'bar',
          props: true,
        });
        done();
      })
      .catch(error => done(error));
  });

  it('status should update with existing references on modified edge', done => {
    let fromNode;
    let toNode;
    let edge;
    let id;
    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addBoundary(uuid1, 'label', 'external'),
        vGraph.addBoundary(uuid2, 'label', 'external'),
      ]))
      .then(values => {
        fromNode = values[0];
        toNode = values[1];
        return vGraph.addEdge('label', fromNode, toNode);
      })
      .then(e => {
        edge = e;
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
      .then(ignored => vGraph.status('author', 'email', 'message'))
      .then(commit => {
        commit.validate();
        expect(commit.nodes).to.have.length(2);
        for (let commitNode of commit.nodes) {
          if (commitNode.id == uuid1 || commitNode.id == uuid2) {
            expect(commitNode.label).to.equal('label');
            expect(commitNode.action).to.equal(Constant.REFERENCE);
            expect(commitNode.boundary).to.equal(true);
            expect(commitNode.repo).to.equal('external');
          } else {
            throw new Error('unknown commit node');
          }
        }

        expect(commit.edges).to.have.length(1);
        let commitEdge = commit.edges[0];
        expect(commitEdge.id).to.equal(id);
        expect(commitEdge.label).to.equal('label');
        expect(commitEdge.from).to.equal(uuid1);
        expect(commitEdge.to).to.equal(uuid2);
        expect(commitEdge.action).to.equal(Constant.UPDATE);
        expect(commitEdge.props).to.deep.equal({
          foo: 'bar2',
          props: false,
        });
        expect(commitEdge.origProps).to.deep.equal({
          foo: 'bar',
          props: true,
        });
        done();
      })
      .catch(error => done(error));
  });
});
