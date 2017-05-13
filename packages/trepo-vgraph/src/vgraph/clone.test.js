import VGraph from '../VGraph.js';

let db = require('memdown');
let expect = require('chai').expect;
let vGraph;

beforeEach(() => {
  vGraph = new VGraph('repo', {db});
});

describe('VGraph - clone', () => {
  it('clone should error on dirty graph', done => {
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(ignored => vGraph.clone())
      .then(ignored => done(new Error('Should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Dirty Graph');
        done();
      })
      .catch(error => done(error));
  });

  it('clone should work', done => {
    let commits = [];
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(commit => {
        commits.push(commit);
        return vGraph.addNode('label');
      })
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(commit => {
        commits.push(commit);
        return vGraph.addNode('label');
      })
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(commit => {
        commits.push(commit);
        return vGraph.clone();
      })
      .then(clonedCommits => {
        expect(clonedCommits.length).to.equal(commits.length);
        for (let i = 0; i < commits.length; i++) {
          let commit = commits[i];
          let clonedCommit = clonedCommits[i];

          expect(clonedCommit.id).to.equal(commit.id);
          expect(clonedCommit.prev).to.equal(commit.prev);
          expect(clonedCommit.repo).to.equal(commit.repo);
          expect(clonedCommit.timestamp).to.equal(commit.timestamp);
          expect(clonedCommit.author).to.equal(commit.author);
          expect(clonedCommit.email).to.equal(commit.email);
          expect(clonedCommit.message).to.equal(commit.message);

          expect(clonedCommit.nodes.length).to.equal(commit.nodes.length);
          for (let j = 0; j < commit.nodes.length; j++) {
            let commitNode = commit.nodes[j].toJSON();
            let clonedCommitNode = clonedCommit.nodes[j].toJSON();
            expect(clonedCommitNode).to.deep.equal(commitNode);
          }
        }
        done();
      })
      .catch(error => done(error));
  });
});
