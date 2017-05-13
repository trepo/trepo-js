import Constant from '../Constant.js';
import Direction from '../Direction.js';
import VGraph from '../VGraph.js';

let db = require('memdown');
let expect = require('chai').expect;
let vGraph;

let uuid1 = '111defc1-7c54-4189-8ae9-166d24edd68e';
let uuid2 = '2a086114-ad06-4e5e-826f-f653a73492bd';

beforeEach(() => {
  vGraph = new VGraph('repo', {db});
});

describe('VGraph - undo', () => {
  it('undo should error on invalid id', done => {
    vGraph.init()
      .then(ignored => vGraph.undo('1234'))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Invalid Id');
        done();
      })
      .catch(error => done(error));
  });

  it('undo should error on dirty graph', done => {
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(ignored => vGraph.undo(uuid1))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Dirty Graph');
        done();
      })
      .catch(error => done(error));
  });

  it('undo should error on commit not found', done => {
    vGraph.init()
      .then(ignored => vGraph.undo(uuid1))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Node Not Found');
      })
      .then(ignored => vGraph.addBoundary(uuid1, 'label', 'external'))
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => vGraph.undo(uuid1))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Commit Not Found');
        done();
      })
      .catch(error => done(error));
  });

  it('undo should return commit ids and remove old commit nodes', done => {
    let commit1;
    let commit2;
    let commit3;
    vGraph.init()
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(commit => {
        commit1 = commit.id;
        return vGraph.addBoundary(uuid1, 'label', 'external');
      })
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(commit => {
        commit2 = commit.id;
        return vGraph.addBoundary(uuid2, 'label', 'external');
      })
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(commit => {
        commit3 = commit.id;
        return vGraph.undo(commit1);
      })
      .then(commits => {
        expect(commits).to.deep.equal([commit3, commit2]);

        for (let node of vGraph._vagabond.getNodes()) {
          let count = 0;
          if (node.id === Constant.ROOT_ID) {
            for (let edge of node.getEdges(Direction.OUT)) {
              expect(edge.label).to.equal(Constant.COMMIT_EDGE_LABEL);
              expect(edge.to).to.equal(commit1);
              count++;
            }
            expect(count).to.equal(1);
          } else if (node.id === commit1) {
            for (let edge of node.getEdges(Direction.OUT)) {
              expect(edge.to).to.equal(Constant.ROOT_ID);
              count++;
            }
            expect(count).to.equal(1);
          } else {
            return done(new Error('unknown node'));
          }
        }

        done();
      })
      .catch(error => done(error));
  });

  it('undo should restore deleted node', done => {
    let commitId;
    let id;
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(node => Promise.all([
        node.getId(),
        node.setProperties({
          foo: 'bar',
          props: false,
        }),
      ]))
      .then(([nodeId, ignored]) => {
        id = nodeId;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(commit => {
        commitId = commit.id;
        return vGraph.removeNode(id);
      })
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => vGraph.undo(commitId))
      .then(commits => vGraph._vagabond.getNode(id))
      .then(node => {
        expect(node.label).to.equal('label');
        return node.getProperties();
      })
      .then(properties => {
        expect(properties).to.have.all.keys([Constant.STATUS, 'foo', 'props']);
        expect(properties[Constant.STATUS]).to.equal(0);
        expect(properties.foo).to.equal('bar');
        expect(properties.props).to.equal(false);
        done();
      })
      .catch(error => done(error));
  });

  it('undo should restore deleted boundary', done => {
    let commitId;
    vGraph.init()
      .then(ignored => vGraph.addBoundary(uuid1, 'label', 'external'))
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(commit => {
        commitId = commit.id;
        return vGraph.removeNode(uuid1);
      })
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => vGraph.undo(commitId))
      .then(commits => vGraph._vagabond.getNode(uuid1))
      .then(node => {
        expect(node.label).to.equal('label');
        return node.getProperties();
      })
      .then(properties => {
        expect(properties).to.have.all.keys([Constant.STATUS, Constant.REPO]);
        expect(properties[Constant.STATUS]).to.equal(0);
        expect(properties[Constant.REPO]).to.equal('external');
        done();
      })
      .catch(error => done(error));
  });

  it('undo should restore deleted edge', done => {
    let commitId;
    let id;
    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addBoundary(uuid1, 'label', 'external'),
        vGraph.addBoundary(uuid2, 'label', 'external'),
      ]))
      .then(([node1, node2]) => vGraph.addEdge('label', node1, node2))
      .then(edge => Promise.all([
        edge.getId(),
        edge.setProperties({
          foo: 'bar',
          props: false,
        }),
      ]))
      .then(([edgeId, ignored]) => {
        id = edgeId;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(commit => {
        commitId = commit.id;
        return vGraph.removeEdge(id);
      })
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => vGraph.undo(commitId))
      .then(commits => vGraph._vagabond.getEdge(id))
      .then(edge => {
        expect(edge.label).to.equal('label');
        return edge.getProperties();
      })
      .then(properties => {
        expect(properties).to.have.all.keys([Constant.STATUS, 'foo', 'props']);
        expect(properties[Constant.STATUS]).to.equal(0);
        expect(properties.foo).to.equal('bar');
        expect(properties.props).to.equal(false);
        done();
      })
      .catch(error => done(error));
  });

  it('undo should undo updated edge', done => {
    let commitId;
    let edge;
    let id;
    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addBoundary(uuid1, 'label', 'external'),
        vGraph.addBoundary(uuid2, 'label', 'external'),
      ]))
      .then(([node1, node2]) => vGraph.addEdge('label', node1, node2))
      .then(newEdge => {
        edge = newEdge;
        return Promise.all([
          edge.getId(),
          edge.setProperties({
            foo: 'bar',
            props: false,
          }),
        ]);
      })
      .then(([edgeId, ignored]) => {
        id = edgeId;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(commit => {
        commitId = commit.id;
        return edge.setProperties({
          foo: 'bar2',
          props: true,
          newProp: 'boo!',
        });
      })
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => {
        return vGraph.undo(commitId);
      })
      .then(commits => vGraph._vagabond.getEdge(id))
      .then(edge => {
        expect(edge.label).to.equal('label');
        return edge.getProperties();
      })
      .then(properties => {
        expect(properties).to.have.all.keys([Constant.STATUS, 'foo', 'props']);
        expect(properties[Constant.STATUS]).to.equal(0);
        expect(properties.foo).to.equal('bar');
        expect(properties.props).to.equal(false);
        done();
      })
      .catch(error => done(error));
  });

  it('undo should delete created edge', done => {
    let commitId;
    let fromNode;
    let toNode;
    let id;
    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addBoundary(uuid1, 'label', 'external'),
        vGraph.addBoundary(uuid2, 'label', 'external'),
      ]))
      .then(([node1, node2]) => {
        fromNode = node1;
        toNode = node2;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(commit => {
        commitId = commit.id;
        return vGraph.addEdge('label', fromNode, toNode);
      })
      .then(edge => edge.getId())
      .then(edgeId => {
        id = edgeId;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => vGraph.undo(commitId))
      .then(ignored => vGraph._vagabond.getEdge(id))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Edge Not Found');
        done();
      })
      .catch(error => done(error));
  });

  it('undo should undo node to boundary conversion', done => {
    let commitId;
    let node;
    let id;
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(newNode => {
        node = newNode;
        return Promise.all([
          node.getId(),
          node.setProperties({
            foo: 'bar',
            props: false,
          }),
        ]);
      })
      .then(([nodeId, ignored]) => {
        id = nodeId;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(commit => {
        commitId = commit.id;
        return node.convertToBoundary('external');
      })
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => vGraph.undo(commitId))
      .then(ignored => vGraph._vagabond.getNode(id))
      .then(node => node.getProperties())
      .then(properties => {
        expect(properties).to.have.all.keys([Constant.STATUS, 'foo', 'props']);
        expect(properties[Constant.STATUS]).to.equal(0);
        expect(properties.foo).to.equal('bar');
        expect(properties.props).to.equal(false);
        done();
      })
      .catch(error => done(error));
  });

  it('undo should undo updated boundary', done => {
    let commitId;
    let node;
    vGraph.init()
      .then(ignored => vGraph.addBoundary(uuid1, 'label', 'external'))
      .then(newNode => {
        node = newNode;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(commit => {
        commitId = commit.id;
        return node.setRepo('external2');
      })
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => vGraph.undo(commitId))
      .then(ignored => vGraph._vagabond.getNode(uuid1))
      .then(node => node.getProperties())
      .then(properties => {
        expect(properties).to.have.all.keys([Constant.STATUS, Constant.REPO]);
        expect(properties[Constant.STATUS]).to.equal(0);
        expect(properties[Constant.REPO]).to.equal('external');
        done();
      })
      .catch(error => done(error));
  });

  it('undo should undo boundary to node conversion', done => {
    let commitId;
    let node;
    vGraph.init()
      .then(ignored => vGraph.addBoundary(uuid1, 'label', 'external'))
      .then(newNode => {
        node = newNode;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(commit => {
        commitId = commit.id;
        return node.convertToNode();
      })
      .then(ignored => node.setProperties({
        foo: 'bar',
        props: false,
      }))
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => vGraph.undo(commitId))
      .then(ignored => vGraph._vagabond.getNode(uuid1))
      .then(node => node.getProperties())
      .then(properties => {
        expect(properties).to.have.all.keys([Constant.STATUS, Constant.REPO]);
        expect(properties[Constant.STATUS]).to.equal(0);
        expect(properties[Constant.REPO]).to.equal('external');
        done();
      })
      .catch(error => done(error));
  });

  it('undo should undo updated node', done => {
    let commitId;
    let node;
    let id;
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(newNode => {
        node = newNode;
        return Promise.all([
          node.getId(),
          node.setProperties({
            foo: 'bar',
            props: false,
          }),
        ]);
      })
      .then(([nodeId, ignored]) => {
        id = nodeId;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(commit => {
        commitId = commit.id;
        return node.setProperties({
          foo: 'bar',
          hmm: [1, 2, 3],
        });
      })
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => vGraph.undo(commitId))
      .then(ignored => vGraph._vagabond.getNode(id))
      .then(node => node.getProperties())
      .then(properties => {
        expect(properties).to.have.all.keys([Constant.STATUS, 'foo', 'props']);
        expect(properties[Constant.STATUS]).to.equal(0);
        expect(properties.foo).to.equal('bar');
        expect(properties.props).to.equal(false);
        done();
      })
      .catch(error => done(error));
  });

  it('undo should delete created node', done => {
    let commitId;
    let id;
    vGraph.init()
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(commit => {
        commitId = commit.id;
        return vGraph.addNode('label');
      })
      .then(node => node.getId())
      .then(nodeId => {
        id = nodeId;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => vGraph.undo(commitId))
      .then(ignored => vGraph._vagabond.getNode(id))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Node Not Found');
        done();
      })
      .catch(error => done(error));
  });

  it('undo should delete created boundary', done => {
    let commitId;
    vGraph.init()
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(commit => {
        commitId = commit.id;
        return vGraph.addBoundary(uuid1, 'label', 'external');
      })
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => vGraph.undo(commitId))
      .then(ignored => vGraph._vagabond.getNode(uuid1))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Node Not Found');
        done();
      })
      .catch(error => done(error));
  });
});
