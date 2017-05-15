const Constant = require('../Constant.js');
const Commit = require('../Commit.js');
const {VGraph} = require('../VGraph.js');

let db = require('memdown');
let expect = require('chai').expect;
let vGraph;
let commitJSON = {
  version: Constant.COMMIT_VERSION,
  id: 'e793dac9-0365-4ae2-98b3-f9acd19b0358',
  prev: null,
  repo: 'repo',
  timestamp: 1441294877135,
  author: 'author',
  email: 'email',
  message: 'message',
  nodes: [
    {
      id: 'cab8b6ef-0244-4a33-a1fe-2c9b98f5d925',
      label: 'label',
      action: 'create',
      boundary: true,
      repo: 'externalRepo',
    },
    {
      id: 'c5b011d2-d2aa-457b-88a5-dcfbdf2a7534',
      label: 'label',
      action: 'create',
      boundary: false,
      hash: 'a5e744d0164540d33b1d7ea616c28f2fa97e754a',
      props: {foo: 'bar'},
    },
  ],
  edges: [
    {
      id: '523f993f-f271-493e-a860-84e93af3dae7',
      label: 'label',
      from: 'cab8b6ef-0244-4a33-a1fe-2c9b98f5d925',
      to: 'c5b011d2-d2aa-457b-88a5-dcfbdf2a7534',
      action: 'create',
      hash: 'a5e744d0164540d33b1d7ea616c28f2fa97e754a',
      props: {foo: 'bar'},
    },
  ],
};

beforeEach(() => {
  vGraph = new VGraph('repo', {db});
});

describe('VGraph - copy', () => {
  it('copy should error on dirty graph', done => {
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(ignored => vGraph.copy('author', 'email', 'message'))
      .then(ignored => done(new Error('Should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Dirty Graph');
        done();
      })
      .catch(error => done(error));
  });

  it('copy should copy everything', done => {
    let commit = new Commit();
    commit.fromJSON(commitJSON);
    commit.validate();

    let node1 = commit.nodes[0];
    let node2 = commit.nodes[1];
    let edge1 = commit.edges[0];

    vGraph.init()
      .then(ignored => vGraph.patch(commit))
      .then(ignored => vGraph.copy('newAuthor', 'newEmail', 'newMessage'))
      .then(copiedCommit => {
        copiedCommit.validate();
        expect(copiedCommit.id).to.not.equal(commit.id);
        expect(copiedCommit.prev).to.equal(null);
        expect(copiedCommit.repo).to.equal('repo');
        expect(copiedCommit.author).to.equal('newAuthor');
        expect(copiedCommit.email).to.equal('newEmail');
        expect(copiedCommit.message).to.equal('newMessage');

        expect(copiedCommit.nodes.length).to.equal(2);
        for (let node of copiedCommit.nodes) {
          if (node.id === node1.id) {
            expect(node.label).to.equal(node1.label);
            expect(node.action).to.equal('create');
            expect(node.boundary).to.equal(true);
            expect(node.repo).to.equal(node1.repo);
          } else {
            expect(node.id).to.equal(node2.id);
            expect(node.label).to.equal(node2.label);
            expect(node.action).to.equal('create');
            expect(node.boundary).to.equal(false);
            expect(node.properties).to.deep.equal(node2.properties);
          }
        }

        expect(copiedCommit.edges.length).to.equal(1);
        for (let edge of copiedCommit.edges) {
          expect(edge.id).to.equal(edge1.id);
          expect(edge.label).to.equal(edge1.label);
          expect(edge.from).to.equal(edge1.from);
          expect(edge.to).to.equal(edge1.to);
          expect(edge.action).to.equal('create');
          expect(edge.properties).to.deep.equal(edge1.properties);
        }

        done();
      })
      .catch(error => done(error));
  });

  it('copy should copy only the nodes passed in', done => {
    let commit = new Commit();
    commit.fromJSON(commitJSON);
    commit.validate();

    let node1 = commit.nodes[0];
    let node2 = commit.nodes[1];
    let edge1 = commit.edges[0];

    vGraph.init()
      .then(ignored => vGraph.patch(commit))
      .then(ignored => vGraph.copy('newAuthor', 'newEmail',
        'newMessage', [node1.id, node2.id]))
      .then(copiedCommit => {
        copiedCommit.validate();
        expect(copiedCommit.id).to.not.equal(commit.id);
        expect(copiedCommit.prev).to.equal(null);
        expect(copiedCommit.repo).to.equal('repo');
        expect(copiedCommit.author).to.equal('newAuthor');
        expect(copiedCommit.email).to.equal('newEmail');
        expect(copiedCommit.message).to.equal('newMessage');

        expect(copiedCommit.nodes.length).to.equal(2);
        for (let node of copiedCommit.nodes) {
          if (node.id === node1.id) {
            expect(node.label).to.equal(node1.label);
            expect(node.action).to.equal('create');
            expect(node.boundary).to.equal(true);
            expect(node.repo).to.equal(node1.repo);
          } else {
            expect(node.id).to.equal(node2.id);
            expect(node.label).to.equal(node2.label);
            expect(node.action).to.equal('create');
            expect(node.boundary).to.equal(false);
            expect(node.properties).to.deep.equal(node2.properties);
          }
        }

        expect(copiedCommit.edges.length).to.equal(1);
        for (let edge of copiedCommit.edges) {
          expect(edge.id).to.equal(edge1.id);
          expect(edge.label).to.equal(edge1.label);
          expect(edge.from).to.equal(edge1.from);
          expect(edge.to).to.equal(edge1.to);
          expect(edge.action).to.equal('create');
          expect(edge.properties).to.deep.equal(edge1.properties);
        }
      })
      .then(ignored => vGraph.copy('newAuthor', 'newEmail',
        'newMessage', [node1.id]))
      .then(copiedCommit => {
        copiedCommit.validate();
        expect(copiedCommit.id).to.not.equal(commit.id);
        expect(copiedCommit.prev).to.equal(null);
        expect(copiedCommit.repo).to.equal('repo');
        expect(copiedCommit.author).to.equal('newAuthor');
        expect(copiedCommit.email).to.equal('newEmail');
        expect(copiedCommit.message).to.equal('newMessage');

        expect(copiedCommit.nodes.length).to.equal(2);
        for (let node of copiedCommit.nodes) {
          if (node.id === node1.id) {
            expect(node.label).to.equal(node1.label);
            expect(node.action).to.equal('create');
            expect(node.boundary).to.equal(true);
            expect(node.repo).to.equal(node1.repo);
          } else {
            expect(node.id).to.equal(node2.id);
            expect(node.label).to.equal(node2.label);
            expect(node.action).to.equal('create');
            expect(node.boundary).to.equal(true);
            expect(node.repo).to.equal('repo');
          }
        }

        expect(copiedCommit.edges.length).to.equal(1);
        for (let edge of copiedCommit.edges) {
          expect(edge.id).to.equal(edge1.id);
          expect(edge.label).to.equal(edge1.label);
          expect(edge.from).to.equal(edge1.from);
          expect(edge.to).to.equal(edge1.to);
          expect(edge.action).to.equal('create');
          expect(edge.properties).to.deep.equal(edge1.properties);
        }
      })
      .then(ignored => vGraph.copy('newAuthor', 'newEmail',
        'newMessage', [node2.id]))
      .then(copiedCommit => {
        copiedCommit.validate();
        expect(copiedCommit.id).to.not.equal(commit.id);
        expect(copiedCommit.prev).to.equal(null);
        expect(copiedCommit.repo).to.equal('repo');
        expect(copiedCommit.author).to.equal('newAuthor');
        expect(copiedCommit.email).to.equal('newEmail');
        expect(copiedCommit.message).to.equal('newMessage');

        expect(copiedCommit.nodes.length).to.equal(2);
        for (let node of copiedCommit.nodes) {
          if (node.id === node1.id) {
            expect(node.label).to.equal(node1.label);
            expect(node.action).to.equal('create');
            expect(node.boundary).to.equal(true);
            expect(node.repo).to.equal(node1.repo);
          } else {
            expect(node.id).to.equal(node2.id);
            expect(node.label).to.equal(node2.label);
            expect(node.action).to.equal('create');
            expect(node.boundary).to.equal(false);
            expect(node.properties).to.deep.equal(node2.properties);
          }
        }

        expect(copiedCommit.edges.length).to.equal(1);
        for (let edge of copiedCommit.edges) {
          expect(edge.id).to.equal(edge1.id);
          expect(edge.label).to.equal(edge1.label);
          expect(edge.from).to.equal(edge1.from);
          expect(edge.to).to.equal(edge1.to);
          expect(edge.action).to.equal('create');
          expect(edge.properties).to.deep.equal(edge1.properties);
        }

        done();
      })
      .catch(error => done(error));
  });
});
