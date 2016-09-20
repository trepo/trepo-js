import Constant from '../Constant.js';
import Util from '../Util.js';
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

describe('VGraph - commit', () => {
  it('commit should error on invalid parameters', done => {
    vGraph.init()
      .then(ignored => vGraph.commit())
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Invalid author');
        done();
      })
      .catch(error => done(error));
  });

  it('commit should work and make graph clean', done => {
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(ignored => vGraph.info())
      .then(info => {
        expect(info.clean).to.equal(false);
        return vGraph.commit('author', 'email', 'message');
      })
      .then(commit => {
        expect(commit.nodes.length).to.equal(1);
        return vGraph.info();
      })
      .then(info => {
        expect(info.clean).to.equal(true);
        done();
      })
      .catch(error => done(error));
  });

  it('commit should error on multiple commit edges', done => {
    vGraph.init()
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(commit => Promise.all([
        vGraph._vagabond.getNode(Constant.ROOT_ID),
        vGraph._vagabond.getNode(commit.id),
      ]))
      .then(([rootNode, commitNode]) => vGraph._vagabond.addEdge(uuid1,
        Constant.COMMIT_EDGE_LABEL, commitNode, rootNode))
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Invalid State: Multiple Commit Edges');
        done();
      })
      .catch(error => done(error));
  });

  it('commit should create commit nodes/edges on first commit', done => {
    let commit;
    vGraph.init()
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(newCommit => {
        commit = newCommit;
        let fromCommitEdge;
        let toCommitEdge;
        let commitNode;
        for (let node of vGraph._vagabond.getNodes()) {
          let count = 0;
          if (node.id == Constant.ROOT_ID) {
            for (let edge of node.getEdges(Direction.OUT)) {
              expect(edge.label).to.equal(Constant.COMMIT_EDGE_LABEL);
              expect(edge.to).to.equal(commit.id);
              fromCommitEdge = edge;
              count++;
            }
            expect(count).to.equal(1);
          } else if (node.id == commit.id) {
            commitNode = node;
            for (let edge of node.getEdges(Direction.OUT)) {
              expect(edge.to).to.equal(Constant.ROOT_ID);
              toCommitEdge = edge;
              count++;
            }
            expect(count).to.equal(1);
          } else {
            return done(new Error('unknown node'));
          }
        }
        return Promise.all([
          fromCommitEdge.getProperties(),
          toCommitEdge.getProperties(),
          commitNode.getProperties(),
        ]);
      })
      .then(([fromCommitEdge, toCommitEdge, commitNode]) => {
        expect(fromCommitEdge[Constant.META])
          .to.equal(Constant.COMMIT_EDGE_META);
        expect(toCommitEdge[Constant.META])
          .to.equal(Constant.COMMIT_EDGE_META);
        expect(commitNode[Constant.META])
          .to.equal(Constant.COMMIT_NODE_META);

        expect(commitNode[Constant.COMMIT_NODE_ID]).to.equal(commit.id);
        expect(commitNode[Constant.COMMIT_NODE_REPO]).to.equal(commit.repo);
        expect(commitNode[Constant.COMMIT_NODE_TIMESTAMP])
          .to.equal(commit.timestamp);
        expect(commitNode[Constant.COMMIT_NODE_AUTHOR]).to.equal(commit.author);
        expect(commitNode[Constant.COMMIT_NODE_EMAIL]).to.equal(commit.email);
        expect(commitNode[Constant.COMMIT_NODE_MESSAGE])
          .to.equal(commit.message);
        expect(commitNode[Constant.COMMIT_NODE_NODES])
          .to.equal(JSON.stringify(commit.nodes));
        expect(commitNode[Constant.COMMIT_NODE_EDGES])
          .to.equal(JSON.stringify(commit.edges));
        done();
      })
      .catch(error => done(error));
  });

  it('commit should create commit nodes/edges on another commit', done => {
    let commit1;
    let commit2;
    let commit3;
    vGraph.init()
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(commit => {
        commit1 = commit.id;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(commit => {
        commit2 = commit.id;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(commit => {
        commit3 = commit.id;
        for (let node of vGraph._vagabond.getNodes()) {
          let count = 0;
          switch (node.id) {
            case Constant.ROOT_ID:
              for (let edge of node.getEdges(Direction.OUT)) {
                expect(edge.to).to.equal(commit1);
                count++;
              }
              expect(count).to.equal(1);
              break;
            case commit1:
              for (let edge of node.getEdges(Direction.OUT)) {
                expect(edge.to).to.equal(commit2);
                count++;
              }
              expect(count).to.equal(1);
              break;
            case commit2:
              for (let edge of node.getEdges(Direction.OUT)) {
                expect(edge.to).to.equal(commit3);
                count++;
              }
              expect(count).to.equal(1);
              break;
            case commit3:
              for (let edge of node.getEdges(Direction.OUT)) {
                expect(edge.to).to.equal(Constant.ROOT_ID);
                count++;
              }
              expect(count).to.equal(1);
              break;
            default:
              return done(new Error('unknown node'));
          }
        }
        done();
      })
      .catch(error => done(error));
  });

  it('commit should set status on created edge', done => {
    let fromNode;
    let toNode;
    let id;
    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label'),
      ]))
      .then(([node1, node2]) => {
        fromNode = node1;
        toNode = node2;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => vGraph.addEdge('label', fromNode, toNode))
      .then(edge => edge.getId())
      .then(edgeId => {
        id = edgeId;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(commit => {
        expect(commit.edges.length).to.equal(1);
        expect(commit.edges[0].id).to.equal(id);
        return vGraph._vagabond.getEdge(id);
      })
      .then(edge => edge.getProperties())
      .then(properties => {
        expect(properties[Constant.STATUS]).to.equal(0);
        done();
      })
      .catch(error => done(error));
  });

  it('commit should set status and remove origProps on updated edge', done => {
    let edge;
    let id;
    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label'),
      ]))
      .then(([node1, node2]) => vGraph.addEdge('label', node1, node2))
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
      .then(([edgeId, props]) => {
        id = edgeId;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => edge.setProperties({
        foo: 'bar2',
        props: false,
      }))
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(commit => {
        expect(commit.edges.length).to.equal(1);
        expect(commit.edges[0].id).to.equal(id);
        return vGraph._vagabond.getEdge(id);
      })
      .then(edge => edge.getProperties())
      .then(properties => {
        expect(properties[Constant.STATUS]).to.equal(0);
        expect(properties[Constant.ORIG_PROPS]).to.be.undefined;
        done();
      })
      .catch(error => done(error));
  });

  it('commit should remove edge on deleted edge', done => {
    let edge;
    let id;
    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label'),
      ]))
      .then(([node1, node2]) => vGraph.addEdge('label', node1, node2))
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
      .then(([edgeId, props]) => {
        id = edgeId;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => vGraph.removeEdge(id))
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(commit => {
        expect(commit.edges.length).to.equal(1);
        expect(commit.edges[0].id).to.equal(id);
        return vGraph._vagabond.getEdge(id);
      })
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Edge Not Found');
        done();
      })
      .catch(error => done(error));
  });

  it('commit should set status on created node', done => {
    let id;
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(node => node.getId())
      .then(nodeId => {
        id = nodeId;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(commit => {
        expect(commit.nodes.length).to.equal(1);
        expect(commit.nodes[0].id).to.equal(id);
        return vGraph._vagabond.getNode(id);
      })
      .then(node => node.getProperties())
      .then(properties => {
        expect(properties[Constant.STATUS]).to.equal(0);
        done();
      })
      .catch(error => done(error));
  });

  it('commit should set status and remove origProps on updated node', done => {
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
            props: true,
          }),
        ]);
      })
      .then(([nodeId, props]) => {
        id = nodeId;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => node.setProperties({
        foo: 'bar2',
        props: false,
      }))
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(commit => {
        expect(commit.nodes.length).to.equal(1);
        expect(commit.nodes[0].id).to.equal(id);
        return vGraph._vagabond.getNode(id);
      })
      .then(node => node.getProperties())
      .then(properties => {
        expect(properties[Constant.STATUS]).to.equal(0);
        expect(properties[Constant.ORIG_PROPS]).to.be.undefined;
        done();
      })
      .catch(error => done(error));
  });

  it('commit should set status and remove origRepo on updated boundary', done => {
    let node;
    let id;
    vGraph.init()
      .then(ignored => vGraph.addBoundary(uuid1, 'label', 'external'))
      .then(newNode => {
        node = newNode;
        return node.getId();
      })
      .then(nodeId => {
        id = nodeId;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => node.setRepo('external2'))
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(commit => {
        expect(commit.nodes.length).to.equal(1);
        expect(commit.nodes[0].id).to.equal(id);
        return vGraph._vagabond.getNode(id);
      })
      .then(node => node.getProperties())
      .then(properties => {
        expect(properties[Constant.STATUS]).to.equal(0);
        expect(properties[Constant.ORIG_REPO]).to.be.undefined;
        done();
      })
      .catch(error => done(error));
  });

  it('commit should remove node on deleted node', done => {
    vGraph.init()
      .then(ignored => vGraph.addBoundary(uuid1, 'label', 'external'))
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => vGraph.removeNode(uuid1))
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(commit => {
        expect(commit.nodes.length).to.equal(1);
        expect(commit.nodes[0].id).to.equal(uuid1);
        return vGraph._vagabond.getNode(uuid1);
      })
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Node Not Found');
        done();
      })
      .catch(error => done(error));
  });
});
