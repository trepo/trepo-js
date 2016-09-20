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

describe('VGraph - getCommit', () => {
  it('should error on invalid id', done => {
    vGraph.init()
      .then(ignored => vGraph.getCommit('1234'))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Invalid Id');
        done();
      })
      .catch(error => done(error));
  });

  it('should error on node not found', done => {
    vGraph.init()
      .then(ignored => vGraph.getCommit(uuid1))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Node Not Found');
        done();
      })
      .catch(error => done(error));
  });

  it('should error if node is not a commit', done => {
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(node => node.getId())
      .then(id => vGraph.getCommit(id))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Node Not Found');
        done();
      })
      .catch(error => done(error));
  });

  it('should return commit with no prev', done => {
    let id;
    let commit;
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(node => node.getId())
      .then(nodeId => {
        id = nodeId;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(newCommit => {
        commit = newCommit;
        return vGraph.getCommit(commit.id);
      })
      .then(getCommit => {
        expect(getCommit.toJSON()).to.deep.equal(commit.toJSON());
        done();
      })
      .catch(error => done(error));
  });

  it('should return commit with prev', done => {
    let id;
    let commit;
    vGraph.init()
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => vGraph.addNode('label'))
      .then(node => node.getId())
      .then(nodeId => {
        id = nodeId;
        return vGraph.commit('author', 'email', 'message');
      })
      .then(newCommit => {
        commit = newCommit;
        return vGraph.getCommit(commit.id);
      })
      .then(getCommit => {
        expect(getCommit.toJSON()).to.deep.equal(commit.toJSON());
        done();
      })
      .catch(error => done(error));
  });
});
