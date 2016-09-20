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

describe('VGraph - basic', () => {

  it('Constructor should error on invalid repo', () => {
    expect(() => new VGraph('')).to.throw(Error);
  });

  it('repo should work', () => {
    expect(vGraph.repo).to.equal('repo');
    expect(() => vGraph.repo = 'foo').to.throw(Error);
  });

  it('addNode should work', done => {
    let id;
    vGraph.addNode('label')
      .then(node => {
        expect(vGraph._dirty).to.equal(true);
        return node.getId();
      })
      .then(newId => {
        id = newId;
        expect(id.length).to.equal(36);
        return vGraph.getNode(id);
      })
      .then(ignored => vGraph._vagabond.getNode(id))
      .then(node => node.getProperties())
      .then(properties => {
        expect(properties).to.deep.equal({
          __status: 1
        });
        done();
      })
      .catch(error => done(error));
  });

  it('addNode should error on invalid label', done => {
    vGraph.addNode('__invalid')
      .then(node => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Invalid Label');
        done();
      })
      .catch(error => done(error));
  });

  it('removeNode should work', done => {
    let id;
    vGraph.addNode('label')
      .then(node => {
        expect(vGraph._dirty).to.equal(true);
        vGraph._dirty = false; // Fake it out
        return node.getId();
      })
      .then(newId => {
        id = newId;
        return vGraph.removeNode(id);
      })
      .then(ignored => {
        expect(vGraph._dirty).to.equal(true);
        return vGraph.getNode(id);
      })
      .then(ignored => done(new Error('Should have errored on node missing')))
      .catch(error => {
        expect(error.message).to.equal('Deleted');
        return vGraph._vagabond.getNode(id);
      })
      .then(node => node.getProperties())
      .then(properties => {
        expect(properties[Constant.STATUS]).to.equal(5);
        done();
      })
      .catch(error => done(error));
  });

  it('removeNode should error on invalid id', done => {
    vGraph.removeNode('1234')
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Invalid Id');
        done();
      })
      .catch(error => done(error));
  });

  it('removeNode should error on missing node', done => {
    vGraph.removeNode(uuid1)
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Node Not Found');
        done();
      })
      .catch(error => done(error));
  });

  it('removeNode should error on already deleted node', done => {
    vGraph._vagabond.addNode(uuid1, 'label')
      .then(node => node.setProperty(Constant.STATUS, 4))
      .then(ignored =>
        vGraph.removeNode(uuid1))
      .then(ignored => done(new Error('Should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Deleted');
        done();
      })
      .catch(error => done(error));
  });

  it('removeNode should delete all attached edges as well', done => {
    let nodes;
    let edges;
    Promise.all([
        vGraph._vagabond.addNode(uuid1, 'label'),
        vGraph._vagabond.addNode(uuid2, 'label'),
        vGraph._vagabond.addNode(uuid3, 'label')
      ])
    .then(values => {
      nodes = values;
      return Promise.all([
          vGraph._vagabond.addEdge(uuid4, 'label', nodes[0], nodes[1]),
          vGraph._vagabond.addEdge(uuid5, 'label', nodes[2], nodes[0]),
          values[0].setProperty(Constant.STATUS, 0),
          values[1].setProperty(Constant.STATUS, 0),
          values[2].setProperty(Constant.STATUS, 0)
        ]);
    })
    .then(values => {
      edges = values;
      return Promise.all([
          values[0].setProperty(Constant.STATUS, 0),
          values[1].setProperty(Constant.STATUS, 0)
        ]);
    })
    .then(ignored => vGraph.removeNode(uuid1))
    .then(ignored => {
      let promises = [];
      for (let edge of nodes[0].getEdges(Direction.BOTH)) {
        promises.push(edge.getProperties());
      }
      return Promise.all(promises);
    })
    .then(values => {
      for (let properties of values) {
        expect(properties[Constant.STATUS]).to.equal(4);
      }
      done();
    })
    .catch(error => done(error));
  });

  it('removeNode should not overwrite deleted edges', done => {
    // In edges have been deleted already
    let nodes;
    let edges;
    Promise.all([
        vGraph._vagabond.addNode(uuid1, 'label'),
        vGraph._vagabond.addNode(uuid2, 'label'),
        vGraph._vagabond.addNode(uuid3, 'label')
      ])
    .then(values => {
      nodes = values;
      return Promise.all([
          vGraph._vagabond.addEdge(uuid4, 'label', nodes[0], nodes[1]),
          vGraph._vagabond.addEdge(uuid5, 'label', nodes[1], nodes[0]),
          vGraph._vagabond.addEdge(uuid6, 'label', nodes[0], nodes[2]),
          vGraph._vagabond.addEdge(uuid7, 'label', nodes[2], nodes[0]),
          values[0].setProperty(Constant.STATUS, 0),
          values[1].setProperty(Constant.STATUS, 0),
          values[2].setProperty(Constant.STATUS, 0)
        ]);
    })
    .then(values => {
      edges = values;
      return Promise.all([
          edges[0].setProperty(Constant.STATUS, 0),
          edges[1].setProperty(Constant.STATUS, 5),
          edges[2].setProperty(Constant.STATUS, 0),
          edges[3].setProperty(Constant.STATUS, 5),
        ]);
    })
    .then(ignored => vGraph.removeNode(uuid1))
    .then(ignored => {
      let promises = [];
      for (let edge of nodes[0].getEdges(Direction.OUT)) {
        promises.push(edge.getProperties());
      }
      return Promise.all(promises);
    })
    .then(values => {
      for (let properties of values) {
        expect(properties[Constant.STATUS]).to.equal(4);
      }
    })
    .then(ignored => {
      let promises = [];
      for (let edge of nodes[0].getEdges(Direction.IN)) {
        promises.push(edge.getProperties());
      }
      return Promise.all(promises);
    })
    .then(values => {
      for (let properties of values) {
        expect(properties[Constant.STATUS]).to.equal(5);
      }
      done();
    })
    .catch(error => done(error));
  });

  it('getNode should work', done => {
    vGraph._vagabond.addNode(uuid1, 'label')
      .then(ignored => vGraph.getNode(uuid1))
      .then(node => {
        expect(node).to.be.instanceof(Node);
        done();
      })
      .catch(error => done(error));
  });

  it('getNode should error on invalid id', done => {
    vGraph.getNode('1234')
      .then(node => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Invalid Id');
        done();
      })
      .catch(error => done(error));
  });

  it('getNode should error on missing node', done => {
    vGraph.getNode(uuid1)
      .then(node => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Node Not Found');
        done();
      })
      .catch(error => done(error));
  });

  it('getNode should error on id of commit', done => {
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(commit => vGraph.getNode(commit.id))
      .then(node => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Node Not Found');
        done();
      })
      .catch(error => done(error));
  });

  it('getNode should error on deleted node', done => {
    vGraph._vagabond.addNode(uuid1, 'label')
      .then(node => node.setProperty(Constant.STATUS, 4))
      .then(ignored => vGraph.getNode(uuid1))
      .then(node => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Deleted');
        done();
      })
      .catch(error => done(error));
  });

  it('getNodes should work', done => {
    Promise.all([
        vGraph._vagabond.addNode(uuid1, 'label'),
        vGraph._vagabond.addNode(uuid2, 'label'),
        vGraph._vagabond.addNode(uuid3, 'label'),
        vGraph._vagabond.addNode(uuid4, 'label')
      ])
      .then(values => {
        return Promise.all([
            values[0].setProperty(Constant.STATUS, 0),
            values[1].setProperty(Constant.STATUS, 0),
            values[2].setProperty(Constant.STATUS, 0),
            values[3].setProperty(Constant.STATUS, 0)
          ]);
      })
      .then(ignored => {
        let promises = [];
        for (let node of vGraph.getNodes()) {
          promises.push(node.getId());
        }
        return Promise.all(promises);
      })
      .then(ids => {
        expect(ids.sort()).to.deep.equal([uuid1, uuid2, uuid3, uuid4]);
        done();
      })
      .catch(error => done(error));
  });

  it('getNodes should filter out deleted nodes', done => {
    Promise.all([
        vGraph._vagabond.addNode(uuid1, 'label'),
        vGraph._vagabond.addNode(uuid2, 'label'),
        vGraph._vagabond.addNode(uuid3, 'label'),
        vGraph._vagabond.addNode(uuid4, 'label')
      ])
      .then(values => {
        return Promise.all([
            values[0].setProperty(Constant.STATUS, 0),
            values[1].setProperty(Constant.STATUS, 4),
            values[2].setProperty(Constant.STATUS, 0),
            values[3].setProperty(Constant.STATUS, 4)
          ]);
      })
      .then(ignored => {
        let promises = [];
        for (let node of vGraph.getNodes()) {
          promises.push(node.getId());
        }
        return Promise.all(promises);
      })
      .then(ids => {
        expect(ids.sort()).to.deep.equal([uuid1, uuid3]);
        done();
      })
      .catch(error => done(error));
  });

  it('getNodes should filter on labels', done => {
    Promise.all([
        vGraph._vagabond.addNode(uuid1, 'label'),
        vGraph._vagabond.addNode(uuid2, 'label_nope'),
        vGraph._vagabond.addNode(uuid3, 'label'),
        vGraph._vagabond.addNode(uuid4, 'label_nope')
      ])
      .then(values => {
        return Promise.all([
            values[0].setProperty(Constant.STATUS, 0),
            values[1].setProperty(Constant.STATUS, 0),
            values[2].setProperty(Constant.STATUS, 0),
            values[3].setProperty(Constant.STATUS, 0)
          ]);
      })
      .then(ignored => {
        let promises = [];
        for (let node of vGraph.getNodes('label')) {
          promises.push(node.getId());
        }
        return Promise.all(promises);
      })
      .then(ids => {
        expect(ids.sort()).to.deep.equal([uuid1, uuid3]);
        done();
      })
      .catch(error => done(error));
  });

  it('addEdge should work', done => {
    Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label')
      ])
      .then(values => {
        expect(vGraph._dirty).to.equal(true);
        vGraph._dirty = false; // Fake a commit
        return vGraph.addEdge('label', values[0], values[1]);
      })
      .then(edge => {
        expect(vGraph._dirty).to.equal(true);
        return edge.getId();
      })
      .then(id => vGraph._vagabond.getEdge(id))
      .then(edge => {
        expect(edge.label).to.equal('label');
        return edge.getProperties();
      })
      .then(properties => {
        expect(properties).to.deep.equal({
          __status: 1
        });
        done();
      })
      .catch(error => done(error));
  });

  it('addEdge should error on invalid from node', done => {
    vGraph.addNode('label')
      .then(node => vGraph.addEdge('label', 'id', node))
      .then(edge => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Invalid From Node');
        done();
      })
      .catch(error => done(error));
  });

  it('addEdge should error on invalid to node', done => {
    vGraph.addNode('label')
      .then(node => vGraph.addEdge('label', node, null))
      .then(edge => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Invalid To Node');
        done();
      })
      .catch(error => done(error));
  });

  it('addEdge should error on same from/to node', done => {
    vGraph.addNode('label')
      .then(node => vGraph.addEdge('label', node, node))
      .then(edge => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Self Referencing Nodes Not Allowed');
        done();
      })
      .catch(error => done(error));
  });

  it('addEdge should error on invalid label', done => {
    Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label')
      ])
      .then(values => vGraph.addEdge('__invalid', values[0], values[1]))
      .then(edge => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Invalid Label');
        done();
      })
      .catch(error => done(error));
  });

  it('removeEdge should work', done => {
    let id;
    Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label')
      ])
      .then(values => vGraph.addEdge('label', values[0], values[1]))
      .then(edge => edge.getId())
      .then(newId => {
        id = newId;
        expect(vGraph._dirty).to.equal(true);
        vGraph._dirty = false;
        return vGraph.removeEdge(id);
      })
      .then(ignored => {
        expect(vGraph._dirty).to.equal(true);
        return vGraph.getEdge(id);
      })
      .then(ignored => done(new Error('Should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Deleted');
        return vGraph._vagabond.getEdge(id);
      })
      .then(edge => edge.getProperties())
      .then(properties => {
        expect(properties[Constant.STATUS]).to.equal(5);
        done();
      })
      .catch(error => done(error));
  });

  it('removeEdge should error on invalid id', done => {
    vGraph.removeEdge('1234')
      .then(ignored => done(new Error('Should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Invalid Id');
        done();
      })
      .catch(error => done(error));
  });

  it('removeEdge should error on missing edge', done => {
    vGraph.removeEdge(uuid1)
      .then(ignored => done(new Error('Should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Edge Not Found');
        done();
      })
      .catch(error => done(error));
  });

  it('removeEdge should error on already deleted edge', done => {
    let id;
    Promise.all([
        vGraph.addNode('label'),
        vGraph.addNode('label')
      ])
      .then(values => vGraph.addEdge('label', values[0], values[1]))
      .then(edge => edge.getId())
      .then(newId => {
        id = newId;
        return vGraph.removeEdge(id);
      })
      .then(ignored => vGraph.removeEdge(id))
      .then(ignored => done(new Error('Should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Deleted');
        done();
      })
      .catch(error => done(error));
  });

  it('getEdge should work', done => {
    Promise.all([
        vGraph._vagabond.addNode(uuid1, 'label'),
        vGraph._vagabond.addNode(uuid2, 'label')
      ])
      .then(values => vGraph._vagabond.addEdge(uuid3, 'label',
        values[0], values[1]))
      .then(edge => edge.setProperty(Constant.STATUS, 0))
      .then(ignored => vGraph.getEdge(uuid3))
      .then(edge => {
        expect(edge).to.be.instanceof(Edge);
        done();
      })
      .catch(error => done(error));
  });

  it('getEdge should error on invalid id', done => {
    vGraph.getEdge('1234')
      .then(ignored => done(new Error('Should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Invalid Id');
        done();
      })
      .catch(error => done(error));
  });

  it('getEdge should error on missing edge', done => {
    vGraph.getEdge(uuid1)
      .then(ignored => done(new Error('Should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Edge Not Found');
        done();
      })
      .catch(error => done(error));
  });

  it('getEdge should error on id of commit edge', done => {
    vGraph.init()
      .then(ignored => vGraph.addNode('label'))
      .then(ignored => vGraph.commit('author', 'email', 'message'))
      .then(commit => {
        for (let edge of vGraph._vagabond.getEdges()) {
          return vGraph.getEdge(edge.id);
        }
      })
      .then(node => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Edge Not Found');
        done();
      })
      .catch(error => done(error));
  });

  it('getEdge should error on deleted edge', done => {
    Promise.all([
        vGraph._vagabond.addNode(uuid1, 'label'),
        vGraph._vagabond.addNode(uuid2, 'label')
      ])
      .then(values => vGraph._vagabond.addEdge(uuid3, 'label',
        values[0], values[1]))
      .then(edge => edge.setProperty(Constant.STATUS, 4))
      .then(ignored => vGraph.getEdge(uuid3))
      .then(ignored => done(new Error('Should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Deleted');
        done();
      })
      .catch(error => done(error));
  });

  it('getEdges should work', done => {
    Promise.all([
        vGraph._vagabond.addNode(uuid1, 'label'),
        vGraph._vagabond.addNode(uuid2, 'label'),
        vGraph._vagabond.addNode(uuid3, 'label'),
        vGraph._vagabond.addNode(uuid4, 'label'),
        vGraph._vagabond.addNode(uuid5, 'label')
      ])
      .then(values => {
        return Promise.all([
            vGraph._vagabond.addEdge(uuid6, 'label', values[0], values[1]),
            vGraph._vagabond.addEdge(uuid7, 'label', values[2], values[0]),
            vGraph._vagabond.addEdge(uuid8, 'label', values[0], values[3]),
            vGraph._vagabond.addEdge(uuid9, 'label', values[4], values[0])
          ]);
      })
      .then(values => {
        return Promise.all([
            values[0].setProperty(Constant.STATUS, 0),
            values[1].setProperty(Constant.STATUS, 0),
            values[2].setProperty(Constant.STATUS, 0),
            values[3].setProperty(Constant.STATUS, 0)
          ]);
      })
      .then(ignored => {
        let promises = [];
        for (let edge of vGraph.getEdges()) {
          promises.push(edge.getId());
        }
        return Promise.all(promises);
      })
      .then(ids => {
        expect(ids.sort()).to.deep.equal([uuid6, uuid7, uuid8, uuid9]);
        done();
      })
      .catch(error => done(error));
  });

  it('getEdges should filter out deleted edges', done => {
    Promise.all([
        vGraph._vagabond.addNode(uuid1, 'label'),
        vGraph._vagabond.addNode(uuid2, 'label'),
        vGraph._vagabond.addNode(uuid3, 'label'),
        vGraph._vagabond.addNode(uuid4, 'label'),
        vGraph._vagabond.addNode(uuid5, 'label')
      ])
      .then(values => {
        return Promise.all([
            vGraph._vagabond.addEdge(uuid6, 'label', values[0], values[1]),
            vGraph._vagabond.addEdge(uuid7, 'label', values[2], values[0]),
            vGraph._vagabond.addEdge(uuid8, 'label', values[0], values[3]),
            vGraph._vagabond.addEdge(uuid9, 'label', values[4], values[0])
          ]);
      })
      .then(values => {
        return Promise.all([
            values[0].setProperty(Constant.STATUS, 0),
            values[1].setProperty(Constant.STATUS, 4),
            values[2].setProperty(Constant.STATUS, 0),
            values[3].setProperty(Constant.STATUS, 4)
          ]);
      })
      .then(ignored => {
        let promises = [];
        for (let edge of vGraph.getEdges()) {
          promises.push(edge.getId());
        }
        return Promise.all(promises);
      })
      .then(ids => {
        expect(ids.sort()).to.deep.equal([uuid6, uuid8]);
        done();
      })
      .catch(error => done(error));
  });

  it('getEdges should filter on labels', done => {
    Promise.all([
        vGraph._vagabond.addNode(uuid1, 'label'),
        vGraph._vagabond.addNode(uuid2, 'label'),
        vGraph._vagabond.addNode(uuid3, 'label'),
        vGraph._vagabond.addNode(uuid4, 'label'),
        vGraph._vagabond.addNode(uuid5, 'label')
      ])
      .then(values => {
        return Promise.all([
            vGraph._vagabond.addEdge(uuid6, 'label1', values[0], values[1]),
            vGraph._vagabond.addEdge(uuid7, 'label2', values[2], values[0]),
            vGraph._vagabond.addEdge(uuid8, 'label3', values[0], values[3]),
            vGraph._vagabond.addEdge(uuid9, 'label4', values[4], values[0])
          ]);
      })
      .then(values => {
        return Promise.all([
            values[0].setProperty(Constant.STATUS, 0),
            values[1].setProperty(Constant.STATUS, 0),
            values[2].setProperty(Constant.STATUS, 0),
            values[3].setProperty(Constant.STATUS, 0)
          ]);
      })
      .then(ignored => {
        let promises = [];
        for (let edge of vGraph.getEdges('label2', 'label4')) {
          promises.push(edge.getId());
        }
        return Promise.all(promises);
      })
      .then(ids => {
        expect(ids.sort()).to.deep.equal([uuid7, uuid9]);
        done();
      })
      .catch(error => done(error));
  });

  it('addBoundary should work', done => {
    vGraph.addBoundary(uuid1, 'label', 'external')
      .then(node => {
        expect(vGraph._dirty).to.equal(true);
        return vGraph._vagabond.getNode(uuid1);
      })
      .then(node => {
        expect(node.label).to.equal('label');
        return node.getProperties();
      })
      .then(properties => {
        expect(properties[Constant.REPO]).to.equal('external');
        done();
      })
      .catch(error => done(error));
  });

  it('addBoundary should error on invalid id', done => {
    vGraph.addBoundary('1234', 'label', 'external')
      .then(node => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Invalid Id');
        done();
      })
      .catch(error => done(error));
  });

  it('addBoundary should error on invalid label', done => {
    vGraph.addBoundary(uuid1, '__invalid', 'external')
      .then(node => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Invalid Label');
        done();
      })
      .catch(error => done(error));
  });

  it('addBoundary should error on invalid repo', done => {
    vGraph.addBoundary(uuid1, 'label', '')
      .then(node => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Invalid Repo');
        done();
      })
      .catch(error => done(error));
  });

  it('addBoundary should error on node exists', done => {
    vGraph._vagabond.addNode(uuid1, 'label')
    .then(ignored => vGraph.addBoundary(uuid1, 'label', 'external'))
      .then(node => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Node Exists');
        done();
      })
      .catch(error => done(error));
  });

});
