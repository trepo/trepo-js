import Constant from './Constant.js';
import Util from './Util.js';
import Node from './Node.js';
import Direction from './Direction.js';
import VGraph from './VGraph.js';

let expect = require('chai').expect;
let vagabond;
let vGraph;

beforeEach(done => {
  vGraph = new VGraph('http://localhost:8080/');
  vGraph.init()
    .then(ignored => {
      vagabond = vGraph._vagabond;
      done();
    })
    .catch(error => done(error));
});

describe('Node', () => {
  it('getRepo should return graph repo', done => {
    vagabond.addNode('1234', 'label')
      .then(rawNode => {
        return new Node(rawNode, vGraph).getRepo();
      })
      .then(repo => {
        expect(repo).to.equal('http://localhost:8080/');
        done();
      })
      .catch(error => done(error));
  });

  it('getRepo should return boundary node repo', done => {
    let rawNode;
    vagabond.addNode('1234', 'label')
      .then(n => {
        rawNode = n;
        return rawNode.setProperty(Constant.REPO, 'external');
      })
      .then(ignored => {
        return new Node(rawNode, vGraph).getRepo();
      })
      .then(repo => {
        expect(repo).to.equal('external');
        done();
      })
      .catch(error => done(error));
  });

  it('getRepo should error on deleted', done => {
    let rawNode;
    vagabond.addNode('1234', 'label')
      .then(n => {
        rawNode = n;
        return rawNode.setProperty(Constant.STATUS, 4);
      })
      .then(ignored => {
        return new Node(rawNode, vGraph).getRepo();
      }, error => done(error))
      .then(repo => done(new Error('Should have errored')))
      .catch(error => done());
  });

  it('setRepo should work', done => {
    let rawNode;
    let node;
    vagabond.addNode('1234', 'label')
      .then(n => {
        rawNode = n;
        node = new Node(rawNode, vGraph);
        return n.setProperty(Constant.REPO, 'external');
      })
      .then(ignored => node.getRepo())
      .then(repo => {
        expect(repo).to.equal('external');
        return node.setRepo('external2');
      })
      .then(ignored => rawNode.getProperties())
      .then(properties => {
        expect(properties[Constant.REPO]).to.equal('external2');
        expect(properties).to.not.have.property(Constant.ORIG_REPO);
        expect(vGraph._dirty).to.equal(true);
        done();
      })
      .catch(error => done(error));
  });

  it('setRepo should set origRepo', done => {
    let rawNode;
    let node;
    vagabond.addNode('1234', 'label')
      .then(n => {
        rawNode = n;
        node = new Node(rawNode, vGraph);
        return Promise.all([
          n.setProperty(Constant.REPO, 'external'),
          n.setProperty(Constant.STATUS, 0),
        ]);
      })
      .then(ignored => node.getRepo())
      .then(repo => {
        expect(repo).to.equal('external');
        return node.setRepo('external2');
      })
      .then(ignored => rawNode.getProperties())
      .then(properties => {
        expect(properties[Constant.REPO]).to.equal('external2');
        expect(properties[Constant.ORIG_REPO]).to.equal('external');
        expect(properties[Constant.STATUS]).to.equal(2);
        expect(vGraph._dirty).to.equal(true);
        done();
      })
      .catch(error => done(error));
  });

  it('setRepo should not touch hash if repo not different', done => {
    let rawNode;
    let node;
    vagabond.addNode('1234', 'label')
      .then(n => {
        rawNode = n;
        node = new Node(rawNode, vGraph);
        return Promise.all([
          n.setProperty(Constant.REPO, 'external'),
          n.setProperty(Constant.STATUS, 0),
        ]);
      })
      .then(ignored => node.getRepo())
      .then(repo => {
        expect(repo).to.equal('external');
        return node.setRepo('external');
      })
      .then(ignored => rawNode.getProperties())
      .then(properties => {
        expect(properties[Constant.REPO]).to.equal('external');
        expect(properties).to.not.have.property(Constant.ORIG_REPO);
        expect(properties[Constant.STATUS]).to.equal(0);
        expect(vGraph._dirty).to.equal(false);
        done();
      })
      .catch(error => done(error));
  });

  it('setRepo should error on invalid repo', done => {
    let node;
    vagabond.addNode('1234', 'label')
      .then(rawNode => {
        node = new Node(rawNode, vGraph);
        return node.setRepo('');
      })
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Invalid Repo');
      })
      .then(ignored => node.setRepo('http://localhost:8080/'))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Invalid Repo');
        done();
      })
      .catch(error => done(error));
  });

  it('setRepo should error on deleted', done => {
    let node;
    vagabond.addNode('1234', 'label')
      .then(rawNode => {
        node = new Node(rawNode, vGraph);
        return Promise.all([
          rawNode.setProperty(Constant.REPO, 'external'),
          rawNode.setProperty(Constant.STATUS, 4),
        ]);
      })
      .then(ignored => node.setRepo('external'))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Deleted');
        done();
      })
      .catch(error => done(error));
  });

  it('setRepo should error on not boundary', done => {
    vagabond.addNode('1234', 'label')
      .then(n => new Node(n, vGraph).setRepo('external'))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Not Boundary');
        done();
      })
      .catch(error => done(error));
  });

  it('isBoundary should return true on boundary node', done => {
    vagabond.addNode('1234', 'label')
      .then(rawNode => {
        return new Node(rawNode, vGraph).isBoundary();
      })
      .then(boundary => {
        expect(boundary).to.equal(false);
        done();
      })
      .catch(error => done(error));
  });

  it('isBoundary should return false on node', done => {
    let rawNode;
    vagabond.addNode('1234', 'label')
      .then(n => {
        rawNode = n;
        return rawNode.setProperty(Constant.REPO, 'external');
      })
      .then(ignored => {
        return new Node(rawNode, vGraph).isBoundary();
      })
      .then(boundary => {
        expect(boundary).to.equal(true);
        done();
      })
      .catch(error => done(error));
  });

  it('isBoundary should error on deleted', done => {
    let rawNode;
    vagabond.addNode('1234', 'label')
      .then(n => {
        rawNode = n;
        return rawNode.setProperty(Constant.STATUS, 4);
      })
      .then(ignored => {
        return new Node(rawNode, vGraph).isBoundary();
      }, error => done(error))
      .then(boundary => done(new Error('Should have errored')))
      .catch(error => done());
  });

  it('convertToBoundary should work', done => {
    let rawNode;
    vagabond.addNode('1234', 'label')
      .then(n => {
        rawNode = n;
        return n.setProperty('foo', 'bar');
      })
      .then(ignored => new Node(rawNode, vGraph).convertToBoundary('external'))
      .then(ignored => rawNode.getProperties())
      .then(properties => {
        expect(properties[Constant.REPO]).to.equal('external');
        expect(Util.getProperties(properties)).to.deep.equal({});
        expect(vGraph._dirty).to.equal(true);
        done();
      })
      .catch(error => done(error));
  });

  it('convertToBoundary should set origProps', done => {
    let rawNode;
    vagabond.addNode('1234', 'label')
      .then(n => {
        rawNode = n;
        return Promise.all([
          n.setProperty('foo', 'bar'),
          n.setProperty(Constant.STATUS, 0),
        ]);
      })
      .then(ignored => new Node(rawNode, vGraph).convertToBoundary('external'))
      .then(ignored => rawNode.getProperties())
      .then(properties => {
        expect(properties[Constant.REPO]).to.equal('external');
        expect(Util.getProperties(properties)).to.deep.equal({});
        expect(JSON.parse(properties[Constant.ORIG_PROPS])).to.deep.equal({
          foo: 'bar',
        });
        expect(properties[Constant.STATUS]).to.equal(2);
        expect(vGraph._dirty).to.equal(true);
        done();
      })
      .catch(error => done(error));
  });

  it('convertToBoundary should error on invalid repo', done => {
    let node;
    vagabond.addNode('1234', 'label')
      .then(rawNode => {
        node = new Node(rawNode, vGraph);
        return node.convertToBoundary('');
      })
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Invalid Repo');
      })
      .then(ignored => node.convertToBoundary('http://localhost:8080/'))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Invalid Repo');
        done();
      })
      .catch(error => done(error));
  });

  it('convertToBoundary should error on deleted', done => {
    let node;
    vagabond.addNode('1234', 'label')
      .then(rawNode => {
        node = new Node(rawNode, vGraph);
        return rawNode.setProperty(Constant.STATUS, 4);
      })
      .then(ignored => node.convertToBoundary('external'))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Deleted');
        done();
      })
      .catch(error => done(error));
  });

  it('convertToBoundary should error on boundary node', done => {
    let node;
    vagabond.addNode('1234', 'label')
      .then(rawNode => {
        node = new Node(rawNode, vGraph);
        return rawNode.setProperty(Constant.REPO, 'external');
      })
      .then(ignored => node.convertToBoundary('external'))
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Already A Boundary');
        done();
      })
      .catch(error => done(error));
  });

  it('convertToNode should work', done => {
    let rawNode;
    vagabond.addNode('1234', 'label')
      .then(n => {
        rawNode = n;
        return n.setProperty(Constant.REPO, 'external');
      })
      .then(ignored => new Node(rawNode, vGraph).convertToNode())
      .then(ignored => rawNode.getProperties())
      .then(properties => {
        expect(properties).to.not.have.property(Constant.REPO);
        expect(Util.getProperties(properties)).to.deep.equal({});
        expect(vGraph._dirty).to.equal(true);
        done();
      })
      .catch(error => done(error));
  });

  it('convertToNode should set origRepo', done => {
    let rawNode;
    vagabond.addNode('1234', 'label')
      .then(n => {
        rawNode = n;
        return Promise.all([
          n.setProperty(Constant.REPO, 'external'),
          n.setProperty(Constant.STATUS, 0),
        ]);
      })
      .then(ignored => new Node(rawNode, vGraph).convertToNode())
      .then(ignored => rawNode.getProperties())
      .then(properties => {
        expect(properties).to.not.have.property(Constant.REPO);
        expect(properties[Constant.ORIG_REPO]).to.equal('external');
        expect(Util.getProperties(properties)).to.deep.equal({});
        expect(properties[Constant.STATUS]).to.equal(2);
        expect(vGraph._dirty).to.equal(true);
        done();
      })
      .catch(error => done(error));
  });

  it('convertToNode should error on deleted', done => {
    let node;
    vagabond.addNode('1234', 'label')
      .then(rawNode => {
        node = new Node(rawNode, vGraph);
        return Promise.all([
          rawNode.setProperty(Constant.REPO, 'external'),
          rawNode.setProperty(Constant.STATUS, 4),
        ]);
      })
      .then(ignored => node.convertToNode())
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Deleted');
        done();
      })
      .catch(error => done(error));
  });

  it('convertToNode should error on regular node', done => {
    vagabond.addNode('1234', 'label')
      .then(rawNode => new Node(rawNode, vGraph).convertToNode())
      .then(ignored => done(new Error('should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Already A Node');
        done();
      })
      .catch(error => done(error));
  });

  it('addEdge should call graph.addEdge', done => {
    let called = false;
    let fakeGraph = {
      addEdge: function() {
        called = true;
        return Promise.resolve('fake edge');
      },
    };
    Promise.all([
      vagabond.addNode('1234', 'label'),
      vagabond.addNode('5678', 'label'),
    ])
    .then(values => {
      let fromNode = new Node(values[0], fakeGraph);
      let toNode = new Node(values[1], fakeGraph);
      return fromNode.addEdge('label', toNode);
    })
    .then(edge => {
      expect(called).to.equal(true);
      expect(edge).to.equal('fake edge');
      done();
    })
    .catch(error => done(error));
  });

  it('getEdges should get edges in the specified direction', done => {
    let rootNode;
    Promise.all([
      vagabond.addNode('n0', 'label'),
      vagabond.addNode('n1', 'label'),
      vagabond.addNode('n2', 'label'),
      vagabond.addNode('n3', 'label'),
      vagabond.addNode('n4', 'label'),
    ])
      .then(values => {
        rootNode = values[0];
        return Promise.all([
          vagabond.addEdge('e1', 'label1', rootNode, values[1]),
          vagabond.addEdge('e2', 'label2', rootNode, values[2]),
          vagabond.addEdge('e3', 'label3', values[3], rootNode),
          vagabond.addEdge('e4', 'label4', values[4], rootNode),
        ]);
      })
      .then(values => {
        let node = new Node(rootNode, vGraph);
        let promises = [];

        for (let edge of node.getEdges(Direction.OUT)) {
          promises.push(edge.getId());
        }
        return Promise.all(promises);
      })
      .then(ids => {
        expect(ids.sort()).to.deep.equal(['e1', 'e2']);
        done();
      })
      .catch(error => done(error));
  });

  it('getEdges should filter by labels', done => {
    let rootNode;
    Promise.all([
      vagabond.addNode('n0', 'label'),
      vagabond.addNode('n1', 'label'),
      vagabond.addNode('n2', 'label'),
      vagabond.addNode('n3', 'label'),
      vagabond.addNode('n4', 'label'),
    ])
      .then(values => {
        rootNode = values[0];
        return Promise.all([
          vagabond.addEdge('e1', 'label1', rootNode, values[1]),
          vagabond.addEdge('e2', 'label2', rootNode, values[2]),
          vagabond.addEdge('e3', 'label3', values[3], rootNode),
          vagabond.addEdge('e4', 'label4', values[4], rootNode),
        ]);
      })
      .then(values => {
        let node = new Node(rootNode, vGraph);
        let promises = [];

        for (let edge of node.getEdges(Direction.BOTH, 'label1', 'label4')) {
          promises.push(edge.getId());
        }
        return Promise.all(promises);
      })
      .then(ids => {
        expect(ids.sort()).to.deep.equal(['e1', 'e4']);
        done();
      })
      .catch(error => done(error));
  });

  it('getEdges should filter out deleted edges', done => {
    let rootNode;
    Promise.all([
      vagabond.addNode('n0', 'label'),
      vagabond.addNode('n1', 'label'),
      vagabond.addNode('n2', 'label'),
      vagabond.addNode('n3', 'label'),
      vagabond.addNode('n4', 'label'),
    ])
      .then(values => {
        rootNode = values[0];
        return Promise.all([
          vagabond.addEdge('e1', 'label1', rootNode, values[1]),
          vagabond.addEdge('e2', 'label2', rootNode, values[2]),
          vagabond.addEdge('e3', 'label3', values[3], rootNode),
          vagabond.addEdge('e4', 'label4', values[4], rootNode),
        ]);
      })
      .then(values => {
        return Promise.all([
          values[0].setProperty(Constant.STATUS, 4),
          values[3].setProperty(Constant.STATUS, 4),
        ]);
      })
      .then(values => {
        let node = new Node(rootNode, vGraph);
        let promises = [];

        for (let edge of node.getEdges(Direction.BOTH)) {
          promises.push(edge.getId());
        }
        return Promise.all(promises);
      })
      .then(ids => {
        expect(ids.sort()).to.deep.equal(['e2', 'e3']);
        done();
      })
      .catch(error => done(error));
  });

  it('getNodes should get nodes in the specified direction', done => {
    let rootNode;
    Promise.all([
      vagabond.addNode('n0', 'label'),
      vagabond.addNode('n1', 'label'),
      vagabond.addNode('n2', 'label'),
      vagabond.addNode('n3', 'label'),
      vagabond.addNode('n4', 'label'),
    ])
      .then(values => {
        rootNode = values[0];
        return Promise.all([
          vagabond.addEdge('e1', 'label1', rootNode, values[1]),
          vagabond.addEdge('e2', 'label2', rootNode, values[2]),
          vagabond.addEdge('e3', 'label3', values[3], rootNode),
          vagabond.addEdge('e4', 'label4', values[4], rootNode),
        ]);
      })
      .then(values => {
        let node = new Node(rootNode, vGraph);
        let promises = [];

        for (let outNode of node.getNodes(Direction.OUT)) {
          promises.push(outNode.getId());
        }
        return Promise.all(promises);
      })
      .then(ids => {
        expect(ids.sort()).to.deep.equal(['n1', 'n2']);
        done();
      })
      .catch(error => done(error));
  });

  it('getNodes should filter by edge labels', done => {
    let rootNode;
    Promise.all([
      vagabond.addNode('n0', 'label'),
      vagabond.addNode('n1', 'label'),
      vagabond.addNode('n2', 'label'),
      vagabond.addNode('n3', 'label'),
      vagabond.addNode('n4', 'label'),
    ])
      .then(values => {
        rootNode = values[0];
        return Promise.all([
          vagabond.addEdge('e1', 'label1', rootNode, values[1]),
          vagabond.addEdge('e2', 'label2', rootNode, values[2]),
          vagabond.addEdge('e3', 'label3', values[3], rootNode),
          vagabond.addEdge('e4', 'label4', values[4], rootNode),
        ]);
      })
      .then(values => {
        let node = new Node(rootNode, vGraph);
        let promises = [];

        for (let bothNode of node.getNodes(Direction.BOTH, 'label1', 'label4')) {
          promises.push(bothNode.getId());
        }
        return Promise.all(promises);
      })
      .then(ids => {
        expect(ids.sort()).to.deep.equal(['n1', 'n4']);
        done();
      })
      .catch(error => done(error));
  });

  it('getNodes should filter out deleted edges', done => {
    let rootNode;
    Promise.all([
      vagabond.addNode('n0', 'label'),
      vagabond.addNode('n1', 'label'),
      vagabond.addNode('n2', 'label'),
      vagabond.addNode('n3', 'label'),
      vagabond.addNode('n4', 'label'),
    ])
      .then(values => {
        rootNode = values[0];
        return Promise.all([
          vagabond.addEdge('e1', 'label1', rootNode, values[1]),
          vagabond.addEdge('e2', 'label2', rootNode, values[2]),
          vagabond.addEdge('e3', 'label3', values[3], rootNode),
          vagabond.addEdge('e4', 'label4', values[4], rootNode),
        ]);
      })
      .then(values => {
        return Promise.all([
          values[0].setProperty(Constant.STATUS, 4),
          values[3].setProperty(Constant.STATUS, 4),
        ]);
      })
      .then(values => {
        let node = new Node(rootNode, vGraph);
        let promises = [];

        for (let bothNode of node.getNodes(Direction.BOTH)) {
          promises.push(bothNode.getId());
        }
        return Promise.all(promises);
      })
      .then(ids => {
        expect(ids.sort()).to.deep.equal(['n2', 'n3']);
        done();
      })
      .catch(error => done(error));
  });

  it('getProperty should work on node', done => {
    let rawNode;
    let node;
    vagabond.addNode('1234', 'label')
      .then(n => {
        rawNode = n;
        node = new Node(rawNode, vGraph);
        return rawNode.setProperty('foo', 'bar');
      })
      .then(ignored => node.getProperty('foo'))
      .then(property => {
        expect(property).to.equal('bar');
        done();
      })
      .catch(error => done(error));
  });

  it('getProperty should error on boundary node', done => {
    let rawNode;
    vagabond.addNode('1234', 'label')
      .then(n => {
        rawNode = n;
        return rawNode.setProperty(Constant.REPO, 'external');
      })
      .then(ignored => {
        return new Node(rawNode, vGraph).getProperty('foo');
      }, error => done(error))
      .then(property => done(new Error('Should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Boundary');
        done();
      })
      .catch(error => done(error));
  });

  it('setProperty should work on node', done => {
    let rawNode;
    let node;
    vagabond.addNode('1234', 'label')
      .then(n => {
        rawNode = n;
        node = new Node(rawNode, vGraph);
        return node.setProperty('foo', 'bar');
      })
      .then(ignored => rawNode.getProperty('foo'))
      .then(property => {
        expect(property).to.equal('bar');
        done();
      })
      .catch(error => done(error));
  });

  it('setProperty should error on boundary node', done => {
    let rawNode;
    vagabond.addNode('1234', 'label')
      .then(n => {
        rawNode = n;
        return rawNode.setProperty(Constant.REPO, 'external');
      })
      .then(ignored => {
        return new Node(rawNode, vGraph).setProperty('foo', 'bar');
      }, error => done(error))
      .then(property => done(new Error('Should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Boundary');
        done();
      })
      .catch(error => done(error));
  });

  it('removeProperty should work on node', done => {
    let rawNode;
    vagabond.addNode('1234', 'label')
      .then(n => {
        rawNode = n;
        return rawNode.setProperty('foo', 'bar');
      })
      .then(ignored => {
        return new Node(rawNode, vGraph).removeProperty('foo');
      })
      .then(ignored => rawNode.getProperty('foo'))
      .then(property => {
        expect(property).to.be.undefined;
        done();
      })
      .catch(error => done(error));
  });

  it('removeProperty should error on boundary node', done => {
    let rawNode;
    vagabond.addNode('1234', 'label')
      .then(n => {
        rawNode = n;
        return rawNode.setProperty(Constant.REPO, 'external');
      })
      .then(ignored => {
        return new Node(rawNode, vGraph).removeProperty('foo');
      }, error => done(error))
      .then(property => done(new Error('Should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Boundary');
        done();
      })
      .catch(error => done(error));
  });

  it('getPropertyKeys should work on node', done => {
    let rawNode;
    let node;
    vagabond.addNode('1234', 'label')
      .then(n => {
        rawNode = n;
        node = new Node(rawNode, vGraph);
        return rawNode.setProperty('foo', 'bar');
      })
      .then(ignored => node.getPropertyKeys())
      .then(keys => {
        expect(keys).to.deep.equal(['foo']);
        done();
      })
      .catch(error => done(error));
  });

  it('getPropertyKeys should error on boundary node', done => {
    let rawNode;
    vagabond.addNode('1234', 'label')
      .then(n => {
        rawNode = n;
        return rawNode.setProperty(Constant.REPO, 'external');
      })
      .then(ignored => {
        return new Node(rawNode, vGraph).getPropertyKeys();
      }, error => done(error))
      .then(property => done(new Error('Should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Boundary');
        done();
      })
      .catch(error => done(error));
  });

  it('getProperties should work on node', done => {
    let rawNode;
    let node;
    vagabond.addNode('1234', 'label')
      .then(n => {
        rawNode = n;
        node = new Node(rawNode, vGraph);
        return Promise.all([
          rawNode.setProperty('foo', 'bar'),
          rawNode.setProperty('props', true),
        ]);
      })
      .then(ignored => node.getProperties())
      .then(properties => {
        expect(properties).to.deep.equal({
          foo: 'bar',
          props: true,
        });
        done();
      })
      .catch(error => done(error));
  });

  it('getProperties should error on boundary node', done => {
    let rawNode;
    vagabond.addNode('1234', 'label')
      .then(n => {
        rawNode = n;
        return rawNode.setProperty(Constant.REPO, 'external');
      })
      .then(ignored => {
        return new Node(rawNode, vGraph).getProperties();
      }, error => done(error))
      .then(property => done(new Error('Should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Boundary');
        done();
      })
      .catch(error => done(error));
  });

  it('setProperties should work on node', done => {
    let rawNode;
    let node;
    vagabond.addNode('1234', 'label')
      .then(n => {
        rawNode = n;
        node = new Node(rawNode, vGraph);
        return node.setProperties({
          foo: 'bar',
          props: true,
        });
      })
      .then(ignored => rawNode.getProperties())
      .then(properties => {
        expect(properties).to.deep.equal({
          foo: 'bar',
          props: true,
        });
        done();
      })
      .catch(error => done(error));
  });

  it('setProperties should error on boundary node', done => {
    let rawNode;
    vagabond.addNode('1234', 'label')
      .then(n => {
        rawNode = n;
        return rawNode.setProperty(Constant.REPO, 'external');
      })
      .then(ignored => {
        return new Node(rawNode, vGraph).setProperties({});
      }, error => done(error))
      .then(property => done(new Error('Should have errored')))
      .catch(error => {
        expect(error.message).to.equal('Boundary');
        done();
      })
      .catch(error => done(error));
  });
});
