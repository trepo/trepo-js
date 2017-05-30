const {VGraph} = require('../VGraph.js');

let db = require('memdown');
let expect = require('chai').expect;
let vGraph;

let uuid1 = '111defc1-7c54-4189-8ae9-166d24edd68e';

beforeEach(() => {
  vGraph = new VGraph('repo', {db});
});

describe('VGraph - getCommits', () => {
  it('should error on invalid id', done => {
    vGraph.init()
      .then(ignored => vGraph.getCommits('1234'))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Invalid Id');
        done();
      })
      .catch(error => done(error));
  });

  it('should error on node not found', done => {
    vGraph.init()
      .then(ignored => vGraph.getCommits(uuid1))
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
      .then(id => vGraph.getCommits(id))
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
        return vGraph.getCommits(null);
      })
      .then(commits => {
        expect(commits.length).to.equal(1);
        expect(commits[0].toJSON()).to.deep.equal(commit.toJSON());
        done();
      })
      .catch(error => done(error));
  });

  it('should return commit with prev', done => {
    let id;
    let commit;
    vGraph.init()
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(commit => {
        id = commit.id;
        return vGraph.addNode('label');
      })
      .then(node => node.getId())
      .then(nodeId => {
        return vGraph.commit('author', 'email', 'message');
      })
      .then(newCommit => {
        commit = newCommit;
        return vGraph.getCommits(id);
      })
      .then(commits => {
        expect(commits.length).to.equal(1);
        expect(commits[0].toJSON()).to.deep.equal(commit.toJSON());
        done();
      })
      .catch(error => done(error));
  });

  it('should respect limit', done => {
    vGraph.init()
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(newCommit => {
        return vGraph.getCommits(null, 1);
      })
      .then(commits => {
        expect(commits.length).to.equal(1);
        done();
      })
      .catch(error => done(error));
  });

  it('should return empty array when no commits', done => {
    vGraph.init()
      .then(ignored => vGraph.getCommits(null))
      .then(commits => {
        expect(commits.length).to.equal(0);
        done();
      })
      .catch(error => done(error));
  });
});
