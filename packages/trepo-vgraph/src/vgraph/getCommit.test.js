import VGraph from '../VGraph.js';

let expect = require('chai').expect;
let vGraph;

let uuid1 = '111defc1-7c54-4189-8ae9-166d24edd68e';

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
    let commit;
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(node => node.getId())
      .then(nodeId => {
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
    let commit;
    vGraph.init()
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => vGraph.addNode('label'))
      .then(node => node.getId())
      .then(nodeId => {
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
