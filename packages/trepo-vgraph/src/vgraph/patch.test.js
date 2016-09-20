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

let commitJSON = {
    'version': Constant.COMMIT_VERSION,
    'id': 'e793dac9-0365-4ae2-98b3-f9acd19b0358',
    'prev': null,
    'repo': 'repo',
    'timestamp': 1441294877135,
    'author': 'author',
    'email': 'email',
    'message': 'message',
    'nodes': [
      {
        'id': 'cab8b6ef-0244-4a33-a1fe-2c9b98f5d925',
        'label': 'label',
        'action': 'create',
        'boundary': true,
        'repo': 'externalRepo'
      },
      {
        'id': 'c5b011d2-d2aa-457b-88a5-dcfbdf2a7534',
        'label': 'label',
        'action': 'create',
        'boundary': false,
        'props': {'foo': 'bar'}
      }
    ],
    'edges': [
      {
        'id': '523f993f-f271-493e-a860-84e93af3dae7',
        'label': 'label',
        'from': 'cab8b6ef-0244-4a33-a1fe-2c9b98f5d925',
        'to': 'c5b011d2-d2aa-457b-88a5-dcfbdf2a7534',
        'action': 'create',
        'props': {'foo': 'bar'}
      }
    ]
  };

let emptyCommitJSON = {
    'version': Constant.COMMIT_VERSION,
    'id': 'e793dac9-0365-4ae2-98b3-f9acd19b0358',
    'prev': null,
    'repo': 'repo',
    'timestamp': 1441294877135,
    'author': 'author',
    'email': 'email',
    'message': 'message',
    'nodes': [],
    'edges': []
  };

beforeEach(() => {
  vGraph = new VGraph('repo');
});

describe('VGraph - patch', () => {

  it('patch should validate commit', done => {
    let commit = new Commit();
    commit.fromJSON(commitJSON);
    delete commit._id;

    vGraph.init()
      .then(ignored => vGraph.patch(commit))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Invalid Commit: Missing id');
        done();
      })
      .catch(error => done(error));
  });

  it('patch should verify prev matches', done => {
    let commit = new Commit();
    commit.fromJSON(commitJSON);
    commit.prev = uuid1;
    vGraph.init()
      .then(ignored => vGraph.patch(commit))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Previous Commit Mismatch');
        done();
      })
      .catch(error => done(error));
  });

  it('patch should error on dirty graph', done => {
    let commit = new Commit();
    commit.fromJSON(commitJSON);

    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(ignored => vGraph.patch(commit))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Dirty Graph');
        done();
      })
      .catch(error => done(error));
  });

  it('patch should error on too many commit edges', done => {
    let commit = new Commit();
    commit.fromJSON(commitJSON);

    vGraph.init()
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(newCommit => {
        commit.prev = newCommit.id;
        return Promise.all([
          vGraph._vagabond.getNode(Constant.ROOT_ID),
          vGraph._vagabond.getNode(newCommit.id)
        ]);
      })
      .then(([rootNode, commitNode]) => vGraph._vagabond.addEdge(uuid1,
        Constant.COMMIT_EDGE_LABEL, commitNode, rootNode))
      .then(ignored => vGraph.patch(commit))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Invalid State: Multiple Commit Edges');
        done();
      })
      .catch(error => done(error));
  });

  it('patch should create commit node/edges with no prior commit', done => {
    let commit = new Commit();
    commit.fromJSON(emptyCommitJSON);

    vGraph.init()
      .then(ignored => vGraph.patch(commit))
      .then(ignored => {
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
            commitNode.getProperties()
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

  it('patch should create commit node/edges with prior commit', done => {
    let commit1 = new Commit();
    commit1.fromJSON(emptyCommitJSON);
    let commit2 = new Commit();
    commit2.fromJSON(emptyCommitJSON);
    commit2.id = uuid1;
    commit2.prev = commit1.id;

    vGraph.init()
      .then(ignored => vGraph.patch(commit1))
      .then(ignored => vGraph.patch(commit2))
      .then(ignored => {
        for (let node of vGraph._vagabond.getNodes()) {
          let count = 0;
          switch (node.id){
            case Constant.ROOT_ID:
              for (let edge of node.getEdges(Direction.OUT)) {
                expect(edge.to).to.equal(commit1.id);
                count++;
              }
              expect(count).to.equal(1);
              break;
            case commit1.id:
              for (let edge of node.getEdges(Direction.OUT)) {
                expect(edge.to).to.equal(commit2.id);
                count++;
              }
              expect(count).to.equal(1);
              break;
            case commit2.id:
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

  it('patch should error if create node exists', done => {
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(commit => {
        commit.prev = commit.id;
        commit.id = uuid1;
        return vGraph.patch(commit);
      })
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Node Exists');
        done();
      })
      .catch(error => done(error));
  });

  it('patch should create boundary', done => {
    let commit;
    let id = uuid1;

    vGraph.init()
      .then(ignored => vGraph.addBoundary(id, 'label', 'external'))
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(newCommit => {
        commit = newCommit;
        vGraph = new VGraph('repo');
        return vGraph.init();
      })
      .then(ignored => vGraph.patch(commit))
      .then(ignored => vGraph.getNode(id))
      .then(node => Promise.all([
        node.getLabel(),
        node.isBoundary(),
        node.getRepo(),
        node._element.getProperty(Constant.STATUS)
      ]))
      .then(values => {
        expect(values[0]).to.equal('label');
        expect(values[1]).to.equal(true);
        expect(values[2]).to.equal('external');
        expect(values[3]).to.equal(0);
        done();
      })
      .catch(error => done(error));
  });

  it('patch should create node', done => {
    let commit;
    let id = uuid1;

    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(node => Promise.all([
        node.getId(),
        node.setProperties({
          foo: 'bar',
          props: true
        })
      ]))
      .then(values => {
        id = values[0];
        return vGraph.commit('author', 'email', 'message');
      })
      .then(newCommit => {
        commit = newCommit;
        vGraph = new VGraph('repo');
        return vGraph.init();
      })
      .then(ignored => vGraph.patch(commit))
      .then(ignored => vGraph.getNode(id))
      .then(node => Promise.all([
        node.getLabel(),
        node.isBoundary(),
        node.getRepo(),
        node.getProperties(),
        node._element.getProperty(Constant.STATUS)
      ]))
      .then(values => {
        expect(values[0]).to.equal('label');
        expect(values[1]).to.equal(false);
        expect(values[2]).to.equal('repo');
        expect(values[3]).to.deep.equal({
          foo: 'bar',
          props: true
        });
        expect(values[4]).to.equal(0);
        done();
      })
      .catch(error => done(error));
  });

  it('patch should error if update node label does not match', done => {
    let id;
    let node;
    let commit = new Commit();
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(newNode => {
        node = newNode;
        return Promise.all([
          node.getId(),
          vGraph.commit('author', 'email', 'message')
        ]);
      })
      .then(values => {
        id = values[0];
        return node.setProperties({
          foo: 'bar',
          props: true
        });
      })
      .then(ignored => vGraph.status())
      .then(diffCommit => {
        let json = diffCommit.toJSON();
        // mess up label
        json.nodes[0].label = 'bogus';
        commit.fromJSON(json);
        return vGraph.reset();
      })
      .then(ignored => vGraph.patch(commit))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Label Mismatch');
        done();
      })
      .catch(error => done(error));
  });

  it('patch should update boundary', done => {
    let node;
    let commit;

    vGraph.init()
      .then(ignored => vGraph.addBoundary(uuid1, 'label', 'external'))
      .then(newNode => {
        node = newNode;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => node.setRepo('external2'))
      .then(ignored => vGraph.status())
      .then(statusCommit => {
        commit = statusCommit;
        return vGraph.reset();
      })
      .then(ignored => vGraph.patch(commit))
      .then(ignored => Promise.all([
        node.getLabel(),
        node.isBoundary(),
        node.getRepo(),
        node._element.getProperty(Constant.STATUS)
      ]))
      .then(values => {
        expect(values[0]).to.equal('label');
        expect(values[1]).to.equal(true);
        expect(values[2]).to.equal('external2');
        expect(values[3]).to.equal(0);
        done();
      })
      .catch(error => done(error));
  });

  it('patch should convert node to boundary', done => {
    let node;
    let commit;

    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(newNode => {
        node = newNode;
        return node.setProperties({
          byebye: true
        });
      })
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => node.convertToBoundary('external2'))
      .then(ignored => vGraph.status())
      .then(statusCommit => {
        commit = statusCommit;
        return vGraph.reset();
      })
      .then(ignored => vGraph.patch(commit))
      .then(ignored => Promise.all([
        node.getLabel(),
        node.isBoundary(),
        node.getRepo(),
        node._element.getProperty(Constant.STATUS)
      ]))
      .then(values => {
        expect(values[0]).to.equal('label');
        expect(values[1]).to.equal(true);
        expect(values[2]).to.equal('external2');
        expect(values[3]).to.equal(0);
        done();
      })
      .catch(error => done(error));
  });

  it('patch should convert boundary to node', done => {
    let node;
    let commit;

    vGraph.init()
      .then(ignored => vGraph.addBoundary(uuid1, 'label', 'external'))
      .then(newNode => {
        node = newNode;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => node.convertToNode())
      .then(ignored => node.setProperties({
        foo: 'bar',
        props: true
      }))
      .then(ignored => vGraph.status())
      .then(statusCommit => {
        commit = statusCommit;
        return vGraph.reset();
      })
      .then(ignored => vGraph.patch(commit))
      .then(ignored => Promise.all([
        node.getLabel(),
        node.isBoundary(),
        node.getRepo(),
        node.getProperties(),
        node._element.getProperty(Constant.STATUS)
      ]))
      .then(values => {
        expect(values[0]).to.equal('label');
        expect(values[1]).to.equal(false);
        expect(values[2]).to.equal('repo');
        expect(values[3]).to.deep.equal({
          foo: 'bar',
          props: true
        });
        expect(values[4]).to.equal(0);
        done();
      })
      .catch(error => done(error));
  });

  it('patch should update node', done => {
    let node;
    let commit;

    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(newNode => {
        node = newNode;
        return node.setProperties({
          byebye: true
        });
      })
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => node.setProperties({
        foo: 'bar',
        props: true
      }))
      .then(ignored => vGraph.status())
      .then(statusCommit => {
        commit = statusCommit;
        return vGraph.reset();
      })
      .then(ignored => vGraph.patch(commit))
      .then(ignored => Promise.all([
        node.getLabel(),
        node.isBoundary(),
        node.getRepo(),
        node.getProperties(),
        node._element.getProperty(Constant.STATUS)
      ]))
      .then(values => {
        expect(values[0]).to.equal('label');
        expect(values[1]).to.equal(false);
        expect(values[2]).to.equal('repo');
        expect(values[3]).to.deep.equal({
          foo: 'bar',
          props: true
        });
        expect(values[4]).to.equal(0);
        done();
      })
      .catch(error => done(error));
  });

  it('patch should error if create edge exists', done => {
    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label')
      ]))
      .then(values => Promise.all([
        values[0],
        values[1],
        vGraph.commit('author', 'email', 'message')
      ]))
      .then(values => vGraph.addEdge('label', values[0], values[1]))
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(commit => {
        commit.prev = commit.id;
        commit.id = uuid1;
        return vGraph.patch(commit);
      })
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Edge Exists');
        done();
      })
      .catch(error => done(error));
  });

  it('patch should create edge', done => {
    let commit;
    let id;

    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label')
      ]))
      .then(values => Promise.all([
        values[0],
        values[1],
        vGraph.commit('author', 'email', 'message')
      ]))
      .then(values => vGraph.addEdge('label', values[0], values[1]))
      .then(edge => Promise.all([
        edge.getId(),
        edge.setProperties({
          foo: 'bar',
          props: true
        })
      ]))
      .then(values => {
        id = values[0];
        return vGraph.status();
      })
      .then(statusCommit => {
        commit = statusCommit;
        return vGraph.reset();
      })
      .then(ignored => vGraph.patch(commit))
      .then(ignored => vGraph.getEdge(id))
      .then(edge => Promise.all([
        edge.getLabel(),
        edge.getProperties(),
        edge._element.getProperty(Constant.STATUS)
      ]))
      .then(values => {
        expect(values[0]).to.equal('label');
        expect(values[1]).to.deep.equal({
          foo: 'bar',
          props: true
        });
        expect(values[2]).to.equal(0);
        done();
      })
      .catch(error => done(error));
  });

  it('patch should error if update edge label does not match', done => {
    let edge;
    let commit;

    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label')
      ]))
      .then(values => vGraph.addEdge('label', values[0], values[1]))
      .then(newEdge => {
        edge = newEdge;
        return edge.setProperties({
          byebye: true
        });
      })
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => edge.setProperties({
        foo: 'bar',
        props: true
      }))
      .then(ignored => vGraph.status())
      .then(statusCommit => {
        commit = statusCommit;
        return vGraph.reset();
      })
      .then(ignored => {
        // mess with commit
        commit.edges[0].label = 'bogus';
        return vGraph.patch(commit);
      })
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Label Mismatch');
        done();
      })
      .catch(error => done(error));
  });

  it('patch should error if update edge from does not match', done => {
    let edge;
    let commit;

    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label')
      ]))
      .then(values => vGraph.addEdge('label', values[0], values[1]))
      .then(newEdge => {
        edge = newEdge;
        return edge.setProperties({
          byebye: true
        });
      })
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => edge.setProperties({
        foo: 'bar',
        props: true
      }))
      .then(ignored => vGraph.status())
      .then(statusCommit => {
        commit = statusCommit;
        return vGraph.reset();
      })
      .then(ignored => {
        // mess with commit
        commit.edges[0].from = commit.edges[0].to;
        return vGraph.patch(commit);
      })
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('From Mismatch');
        done();
      })
      .catch(error => done(error));
  });

  it('patch should error if update edge to does not match', done => {
    let edge;
    let commit;

    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label')
      ]))
      .then(values => vGraph.addEdge('label', values[0], values[1]))
      .then(newEdge => {
        edge = newEdge;
        return edge.setProperties({
          byebye: true
        });
      })
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => edge.setProperties({
        foo: 'bar',
        props: true
      }))
      .then(ignored => vGraph.status())
      .then(statusCommit => {
        commit = statusCommit;
        return vGraph.reset();
      })
      .then(ignored => {
        // mess with commit
        commit.edges[0].to = commit.edges[0].from;
        return vGraph.patch(commit);
      })
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('To Mismatch');
        done();
      })
      .catch(error => done(error));
  });

  it('patch should update edge', done => {
    let id;
    let edge;
    let commit;

    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label')
      ]))
      .then(values => vGraph.addEdge('label', values[0], values[1]))
      .then(newEdge => {
        edge = newEdge;
        return Promise.all([
          edge.getId(),
          edge.setProperties({
            byebye: true
          })
        ]);
      })
      .then(values => {
        id = values[0];
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => edge.setProperties({
        foo: 'bar',
        props: true
      }))
      .then(ignored => vGraph.status())
      .then(statusCommit => {
        commit = statusCommit;
        return vGraph.reset();
      })
      .then(ignored => vGraph.patch(commit))
      .then(ignored => vGraph.getEdge(id))
      .then(edge => Promise.all([
        edge.getLabel(),
        edge.getProperties(),
        edge._element.getProperty(Constant.STATUS)
      ]))
      .then(values => {
        expect(values[0]).to.equal('label');
        expect(values[1]).to.deep.equal({
          foo: 'bar',
          props: true
        });
        expect(values[2]).to.equal(0);
        done();
      })
      .catch(error => done(error));
  });

  it('patch should error if delete edge label does not match', done => {
    let id;
    let edge;
    let commit;

    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label')
      ]))
      .then(values => vGraph.addEdge('label', values[0], values[1]))
      .then(newEdge => {
        edge = newEdge;
        return Promise.all([
          edge.getId(),
          edge.setProperties({
            byebye: true
          })
        ]);
      })
      .then(values => {
        id = values[0];
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => vGraph.removeEdge(id))
      .then(ignored => vGraph.status())
      .then(statusCommit => {
        commit = statusCommit;
        return vGraph.reset();
      })
      .then(ignored => {
        // mess with commit
        commit.edges[0].label = 'bogus';
        return vGraph.patch(commit);
      })
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Label Mismatch');
        done();
      })
      .catch(error => done(error));
  });

  it('patch should error if delete edge from does not match', done => {
    let id;
    let edge;
    let commit;

    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label')
      ]))
      .then(values => vGraph.addEdge('label', values[0], values[1]))
      .then(newEdge => {
        edge = newEdge;
        return Promise.all([
          edge.getId(),
          edge.setProperties({
            byebye: true
          })
        ]);
      })
      .then(values => {
        id = values[0];
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => vGraph.removeEdge(id))
      .then(ignored => vGraph.status())
      .then(statusCommit => {
        commit = statusCommit;
        return vGraph.reset();
      })
      .then(ignored => {
        // mess with commit
        commit.edges[0].from = commit.edges[0].to;
        return vGraph.patch(commit);
      })
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('From Mismatch');
        done();
      })
      .catch(error => done(error));
  });

  it('patch should error if delete edge to does not match', done => {
    let id;
    let edge;
    let commit;

    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label')
      ]))
      .then(values => vGraph.addEdge('label', values[0], values[1]))
      .then(newEdge => {
        edge = newEdge;
        return Promise.all([
          edge.getId(),
          edge.setProperties({
            byebye: true
          })
        ]);
      })
      .then(values => {
        id = values[0];
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => vGraph.removeEdge(id))
      .then(ignored => vGraph.status())
      .then(statusCommit => {
        commit = statusCommit;
        return vGraph.reset();
      })
      .then(ignored => {
        // mess with commit
        commit.edges[0].to = commit.edges[0].from;
        return vGraph.patch(commit);
      })
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('To Mismatch');
        done();
      })
      .catch(error => done(error));
  });

  it('patch should delete edge', done => {
    let id;
    let edge;
    let commit;

    vGraph.init()
      .then(ignored => Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label')
      ]))
      .then(values => vGraph.addEdge('label', values[0], values[1]))
      .then(newEdge => {
        edge = newEdge;
        return Promise.all([
          edge.getId(),
          edge.setProperties({
            byebye: true
          })
        ]);
      })
      .then(values => {
        id = values[0];
        return vGraph.commit('author', 'email', 'message');
      })
      .then(ignored => vGraph.removeEdge(id))
      .then(ignored => vGraph.status())
      .then(statusCommit => {
        commit = statusCommit;
        return vGraph.reset();
      })
      .then(ignored => vGraph.patch(commit))
      .then(ignored => vGraph.getEdge(id))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Edge Not Found');
        done();
      })
      .catch(error => done(error));
  });

  it('patch should error if delete node label does not match', done => {
    let id;
    let node;
    let commit = new Commit();
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(newNode => {
        node = newNode;
        return Promise.all([
          node.getId(),
          vGraph.commit('author', 'email', 'message')
        ]);
      })
      .then(values => {
        id = values[0];
        return vGraph.removeNode(id);
      })
      .then(ignored => vGraph.status())
      .then(diffCommit => {
        let json = diffCommit.toJSON();
        // mess up label
        json.nodes[0].label = 'bogus';
        commit.fromJSON(json);
        return vGraph.reset();
      })
      .then(ignored => vGraph.patch(commit))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Label Mismatch');
        done();
      })
      .catch(error => done(error));
  });

  it('patch should error if delete boundary is not a boundary', done => {
    let id;
    let node;
    let commit = new Commit();
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(newNode => {
        node = newNode;
        return Promise.all([
          node.getId(),
          vGraph.commit('author', 'email', 'message')
        ]);
      })
      .then(values => {
        id = values[0];
        return vGraph.removeNode(id);
      })
      .then(ignored => vGraph.status())
      .then(diffCommit => {
        let json = diffCommit.toJSON();
        json.nodes[0].boundary = true;
        delete json.nodes[0].origProps;
        json.nodes[0].origRepo = 'external';
        commit.fromJSON(json);
        return vGraph.reset();
      })
      .then(ignored => vGraph.patch(commit))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Boundary Mismatch');
        done();
      })
      .catch(error => done(error));
  });

  it('patch should error if delete node is not a node', done => {
    let id;
    let node;
    let commit = new Commit();
    vGraph.init()
      .then(ignored => vGraph.addBoundary(uuid1, 'label', 'external'))
      .then(newNode => {
        node = newNode;
        return Promise.all([
          node.getId(),
          vGraph.commit('author', 'email', 'message')
        ]);
      })
      .then(values => {
        id = values[0];
        return vGraph.removeNode(id);
      })
      .then(ignored => vGraph.status())
      .then(diffCommit => {
        let json = diffCommit.toJSON();
        json.nodes[0].boundary = false;
        delete json.nodes[0].origRepo;
        json.nodes[0].origProps = {};
        commit.fromJSON(json);
        return vGraph.reset();
      })
      .then(ignored => vGraph.patch(commit))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Node Mismatch');
        done();
      })
      .catch(error => done(error));
  });

  it('patch should delete boundary', done => {
    let id;
    let node;
    let commit;
    vGraph.init()
      .then(ignored => vGraph.addBoundary(uuid1, 'label', 'external'))
      .then(newNode => {
        node = newNode;
        return Promise.all([
          node.getId(),
          vGraph.commit('author', 'email', 'message')
        ]);
      })
      .then(values => {
        id = values[0];
        return vGraph.removeNode(id);
      })
      .then(ignored => vGraph.status())
      .then(statusCommit => {
        commit = statusCommit;
        return vGraph.reset();
      })
      .then(ignored => vGraph.patch(commit))
      .then(ignored => vGraph.getNode(id))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Node Not Found');
        done();
      })
      .catch(error => done(error));
  });

  it('patch should delete node', done => {
    let id;
    let node;
    let commit;
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(newNode => {
        node = newNode;
        return Promise.all([
          node.getId(),
          vGraph.commit('author', 'email', 'message')
        ]);
      })
      .then(values => {
        id = values[0];
        return vGraph.removeNode(id);
      })
      .then(ignored => vGraph.status())
      .then(statusCommit => {
        commit = statusCommit;
        return vGraph.reset();
      })
      .then(ignored => vGraph.patch(commit))
      .then(ignored => vGraph.getNode(id))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Node Not Found');
        done();
      })
      .catch(error => done(error));
  });

});
