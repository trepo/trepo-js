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

describe('VGraph - log', () => {
  it('log should work', done => {
    vGraph._vagabond.init()
      .then(ignored => Promise.all([
        vGraph._vagabond.addNode(Constant.ROOT_ID, Constant.ROOT_LABEL),
        vGraph._vagabond.addNode(uuid1, Constant.COMMIT_NODE_LABEL),
        vGraph._vagabond.addNode(uuid2, Constant.COMMIT_NODE_LABEL),
        vGraph._vagabond.addNode(uuid3, Constant.COMMIT_NODE_LABEL),
        vGraph._vagabond.addNode(uuid4, Constant.COMMIT_NODE_LABEL),
      ]))
      .then(values => {
        return Promise.all([
          vGraph._vagabond.addEdge(uuid5, Constant.COMMIT_EDGE_LABEL,
              values[0], values[1]),
          vGraph._vagabond.addEdge(uuid6, Constant.COMMIT_EDGE_LABEL,
              values[1], values[2]),
          vGraph._vagabond.addEdge(uuid7, Constant.COMMIT_EDGE_LABEL,
              values[2], values[3]),
          vGraph._vagabond.addEdge(uuid8, Constant.COMMIT_EDGE_LABEL,
              values[3], values[4]),
          vGraph._vagabond.addEdge(uuid9, Constant.COMMIT_EDGE_LABEL,
              values[4], values[0]),
          values[0].setProperties({__meta: Constant.ROOT_META,
              __version: Constant.DATA_VERSION, __repo: 'repo'}),
          values[1].setProperties({__meta: Constant.COMMIT_NODE_META,
              __id: uuid1, __repo: 'r', __timestamp: 1234, __author: 'a',
              __email: 'e', __message: 'm'}),
          values[2].setProperties({__meta: Constant.COMMIT_NODE_META,
              __id: uuid2, __repo: 'r', __timestamp: 1234, __author: 'a',
              __email: 'e', __message: 'm'}),
          values[3].setProperties({__meta: Constant.COMMIT_NODE_META,
              __id: uuid3, __repo: 'r', __timestamp: 1234, __author: 'a',
              __email: 'e', __message: 'm'}),
          values[4].setProperties({__meta: Constant.COMMIT_NODE_META,
              __id: uuid4, __repo: 'r', __timestamp: 1234, __author: 'a',
              __email: 'e', __message: 'm'}),
        ]);
      })
      .then(values => {
        return Promise.all([
          values[0].setProperties({__meta: Constant.COMMIT_EDGE_META}),
          values[1].setProperties({__meta: Constant.COMMIT_EDGE_META}),
          values[2].setProperties({__meta: Constant.COMMIT_EDGE_META}),
          values[3].setProperties({__meta: Constant.COMMIT_EDGE_META}),
          values[4].setProperties({__meta: Constant.COMMIT_EDGE_META}),
        ]);
      })
      .then(ignored => vGraph.init())
      .then(ignored => vGraph.log(2, 0))
      .then(entries => {
        expect(entries.length).to.equal(2);
        expect(entries[0]).to.deep.equal({
          id: uuid4,
          timestamp: 1234,
          author: 'a',
          email: 'e',
          message: 'm',
        });
        expect(entries[1].id).to.equal(uuid3);
      })
      .then(ignored => vGraph.log(10, 2))
      .then(entries => {
        expect(entries.length).to.equal(2);
        expect(entries[0].id).to.equal(uuid2);
        expect(entries[1].id).to.equal(uuid1);
        done();
      })
      .catch(error => done(error));
  });

  it('log should work with 0 commits', done => {
    vGraph._vagabond.addNode(Constant.ROOT_ID, Constant.ROOT_LABEL)
      .then(node => node.setProperties({__meta: Constant.ROOT_META,
              __version: Constant.DATA_VERSION, __repo: 'repo'}))
      .then(ignored => vGraph.init())
      .then(ignored => vGraph.log(2, 0))
      .then(entries => {
        expect(entries.length).to.equal(0);
        done();
      })
      .catch(error => done(error));
  });

  it('log should error on invalid number', done => {
    vGraph.log(0, 0)
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('number must be greater than 0');
        done();
      })
      .catch(error => done(error));
  });

  it('log should error on invalid offset', done => {
    vGraph.log(1, -1)
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('offset may not be less than 0');
        done();
      })
      .catch(error => done(error));
  });
});
