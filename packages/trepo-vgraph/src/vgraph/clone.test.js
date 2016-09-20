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
