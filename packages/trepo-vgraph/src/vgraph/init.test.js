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

describe('VGraph - init', () => {
  it('init should create root on empty graph', done => {
    vGraph.init()
      .then(ignored => {
        expect(vGraph._dirty).to.equal(false);

        let rootNode;
        for (let node of vGraph._vagabond.getNodes()) {
          expect(node.id).to.equal(Constant.ROOT_ID);
          expect(node.label).to.equal(Constant.ROOT_LABEL);
          rootNode = node;
        }
        return rootNode.getProperties();
      })
      .then(properties => {
        expect(properties).to.deep.equal({
          __meta: Constant.ROOT_META,
          __version: Constant.DATA_VERSION,
          __repo: 'repo',
        });
        done();
      })
      .catch(error => done(error));
  });

  it('init should set dirty from uncommitted nodes', done => {
    vGraph._vagabond.addNode(uuid1, 'label')
      .then(node => node.setProperty(Constant.STATUS, 1))
      .then(ignored => vGraph.init())
      .then(ignored => {
        expect(vGraph._dirty).to.equal(true);
        done();
      })
      .catch(error => done(error));
  });

  it('init should set dirty from uncommitted edges', done => {
    Promise.all([
      vGraph._vagabond.addNode(uuid1, 'label'),
      vGraph._vagabond.addNode(uuid2, 'label'),
    ])
      .then(values => Promise.all([
        vGraph._vagabond.addEdge(uuid3, 'label', values[0], values[1]),
        values[0].setProperty(Constant.STATUS, 0),
        values[1].setProperty(Constant.STATUS, 0),
      ]))
      .then(values => values[0].setProperty(Constant.STATUS, 1))
      .then(ignored => vGraph.init())
      .then(ignored => {
        expect(vGraph._dirty).to.equal(true);
        done();
      })
      .catch(error => done(error));
  });

  it('init should fail when called twice', done => {
    vGraph.init()
      .then(ignored => vGraph.init())
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('vGraph already initialized');
        done();
      })
      .catch(error => done(error));
  });
});
