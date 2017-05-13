import Constant from './Constant.js';
import Element from './Element.js';
import Vagabond from 'vagabond-db';

let db = require('memdown');
let expect = require('chai').expect;
let vagabond;
let fakeVGraph;

beforeEach(done => {
  fakeVGraph = {
    _dirty: false,
  };
  vagabond = new Vagabond({db});
  vagabond.init()
    .then(() => {
      done();
    })
    .catch(error => done(error));
});

describe('Element', () => {
  it('getId should work', done => {
    vagabond.addNode('1234', 'label')
      .then(node => {
        return new Element(node, fakeVGraph).getId();
      })
      .then(val => {
        expect(val).to.equal('1234');
        done();
      })
      .catch(error => done(error));
  });

  it('getId should fail on deleted', done => {
    vagabond.addNode('1234', 'label')
      .then(node => {
        return node.setProperty(Constant.STATUS, 4);
      })
      .then(node => {
        return new Element(node, fakeVGraph).getId();
      })
      .catch(error => {
        expect(error.message).to.equal('Deleted');
        done();
      })
      .catch(error => done(error));
  });

  it('getLabel should work', done => {
    vagabond.addNode('1234', 'label')
      .then(node => {
        return new Element(node, fakeVGraph).getLabel();
      })
      .then(val => {
        expect(val).to.equal('label');
        done();
      })
      .catch(error => done(error));
  });

  it('getLabel should fail on deleted', done => {
    vagabond.addNode('1234', 'label')
      .then(node => {
        return node.setProperty(Constant.STATUS, 4);
      })
      .then(node => {
        return new Element(node, fakeVGraph).getLabel();
      })
      .catch(error => {
        expect(error.message).to.equal('Deleted');
        done();
      })
      .catch(error => done(error));
  });

  it('getPropertyKeys should work', done => {
    let node;
    let element;
    vagabond.addNode('1234', 'label')
      .then(newNode => {
        node = newNode;
        element = new Element(node, fakeVGraph);
        return element.getPropertyKeys();
      })
      .then(keys => {
        expect(keys).to.deep.equal([]);
        return element.setProperty('key', 'value');
      })
      .then(ignored => {
        return element.getPropertyKeys();
      })
      .then(keys => {
        expect(keys).to.deep.equal(['key']);
        return Promise.all([
          element.setProperty('key2', 'value2'),
          node.setProperty(Constant.STATUS, 0), // mimic commit
        ]);
      })
      .then(ignored => element.getPropertyKeys())
      .then(keys => {
        expect(keys).to.deep.equal(['key', 'key2']);
        done();
      })
      .catch(error => done(error));
  });

  it('getPropertyKeys should fail on deleted', done => {
    vagabond.addNode('1234', 'label')
      .then(node => {
        return node.setProperty(Constant.STATUS, 4);
      })
      .then(node => {
        return new Element(node, fakeVGraph).getPropertyKeys();
      })
      .catch(error => {
        expect(error.message).to.equal('Deleted');
        done();
      })
      .catch(error => done(error));
  });

  it('getProperty should work', done => {
    let element;
    vagabond.addNode('1234', 'label')
      .then(node => {
        element = new Element(node, fakeVGraph);
        return element.getProperty('foo');
      })
      .then(property => {
        expect(property).to.equal(undefined);
        return element.setProperty('foo', 'bar');
      })
      .then(ignored => element.getProperty('foo'))
      .then(property => {
        expect(property).to.equal('bar');
        done();
      })
      .catch(error => done(error));
  });

  it('getProperty should fail on invalid key', done => {
    let element;
    vagabond.addNode('1234', 'label')
      .then(node => {
        element = new Element(node, fakeVGraph);
        return element.getProperty('__invalid');
      })
      .then(ignored => done('Should have errored'), error => {
        expect(error.message).to.equal('Invalid Key');
        done();
      })
      .catch(error => done(error));
  });

  it('getProperty should fail on deleted', done => {
    vagabond.addNode('1234', 'label')
      .then(node => {
        return node.setProperty(Constant.STATUS, 4);
      })
      .then(node => {
        return new Element(node, fakeVGraph).getProperty('foo');
      })
      .catch(error => {
        expect(error.message).to.equal('Deleted');
        done();
      })
      .catch(error => done(error));
  });

  it('setProperty should work', done => {
    let element;
    vagabond.addNode('1234', 'label')
      .then(node => {
        element = new Element(node, fakeVGraph);
        expect(fakeVGraph._dirty).to.equal(false);
        return element.getProperty('foo');
      })
      .then(property => {
        expect(property).to.equal(undefined);
        return element.setProperty('foo', 'bar');
      })
      .then(ignored => element.getProperty('foo'))
      .then(property => {
        expect(fakeVGraph._dirty).to.equal(true);
        expect(property).to.equal('bar');
        return element.setProperty('foo', 'bar2');
      })
      .then(ignored => element.getProperty('foo'))
      .then(property => {
        expect(property).to.equal('bar2');
        done();
      })
      .catch(error => done(error));
  });

  it('setProperty should set original if status is 0', done => {
    let node;
    let element;
    vagabond.addNode('1234', 'label')
      .then(n => {
        node = n;
        element = new Element(node, fakeVGraph);
        expect(fakeVGraph._dirty).to.equal(false);
        return Promise.all([
          node.setProperty('foo', 'bar'),
          node.setProperty(Constant.STATUS, 0),
        ]);
      })
      .then(ignored => element.setProperty('foo', 'bar2'))
      .then(ignored => node.getProperties())
      .then(properties => {
        expect(fakeVGraph._dirty).to.equal(true);
        expect(properties.foo).to.equal('bar2');
        expect(properties[Constant.STATUS]).to.equal(2);
        expect(properties.hasOwnProperty(Constant.ORIG_PROPS)).to.equal(true);
        let original = JSON.parse(properties[Constant.ORIG_PROPS]);
        expect(original).to.deep.equal({foo: 'bar'});
        done();
      })
      .catch(error => done(error));
  });

  it('setProperty should not overwrite on duplicate update', done => {
    let node;
    let element;
    vagabond.addNode('1234', 'label')
      .then(n => {
        node = n;
        element = new Element(node, fakeVGraph);
        expect(fakeVGraph._dirty).to.equal(false);
        return Promise.all([
          node.setProperty('foo', 'bar'),
          node.setProperty(Constant.STATUS, 0),
        ]);
      })
      .then(ignored => element.setProperty('foo', 'bar'))
      .then(ignored => node.getProperties())
      .then(properties => {
        expect(fakeVGraph._dirty).to.equal(false);
        expect(properties.foo).to.equal('bar');
        expect(properties[Constant.STATUS]).to.equal(0);
        expect(properties.hasOwnProperty(Constant.ORIG_PROPS)).to.equal(false);
        done();
      })
      .catch(error => done(error));
  });

  it('setProperty should fail on invalid key', done => {
    let element;
    vagabond.addNode('1234', 'label')
      .then(node => {
        element = new Element(node, fakeVGraph);
        return element.setProperty('__invalid', 'value');
      })
      .then(ignored => done('Should have errored'), error => {
        expect(error.message).to.equal('Invalid Key');
        done();
      })
      .catch(error => done(error));
  });

  it('setProperty should fail on invalid value', done => {
    let element;

    let shouldWork = function(value) {
      return new Promise((resolve, reject) => {
        element.setProperty('foo', value)
          .then(ignored => resolve(null))
          .catch(error => reject(new Error(value + ' should have worked')));
      });
    };
    // If the set worked, then fail
    let shouldError = function(value) {
      return new Promise((resolve, reject) => {
        element.setProperty('foo', value).then(ignored => {
          reject(new Error(value + ' should have failed'));
        }).catch(error => {
          resolve(null);
        });
      });
    };

    vagabond.addNode('1234', 'label')
      .then(node => {
        element = new Element(node, fakeVGraph);
        return Promise.all([
          shouldWork(true),
          shouldWork([true, false]),
          shouldWork(123.456),
          shouldWork([1, 2.5, 3e10]),
          shouldWork('string'),
          shouldWork(['foo']),
          shouldWork([]),
          shouldError(undefined),
          shouldError(null),
          shouldError(function() { }),
          shouldError(/regex/),
          shouldError({}),
          shouldError({foo: 'bar'}),
          shouldError([true, 1, 'string']),
          shouldError([{foo: 'bar'}, {foo: 'bear'}]),
        ]);
      })
      .then(ignored => done())
      .catch(error => done(error));
  });

  it('setProperty should fail on deleted', done => {
    vagabond.addNode('1234', 'label')
      .then(node => {
        return node.setProperty(Constant.STATUS, 4);
      })
      .then(node => {
        return new Element(node, fakeVGraph).setProperty('key', 'value');
      })
      .catch(error => {
        expect(error.message).to.equal('Deleted');
        done();
      })
      .catch(error => done(error));
  });

  it('removeProperty should work', done => {
    let element;
    vagabond.addNode('1234', 'label')
      .then(node => {
        element = new Element(node, fakeVGraph);
        expect(fakeVGraph._dirty).to.equal(false);
        return element.getProperty('foo');
      })
      .then(property => {
        expect(property).to.equal(undefined);
        return element.setProperty('foo', 'bar');
      })
      .then(ignored => element.getProperty('foo'))
      .then(property => {
        expect(fakeVGraph._dirty).to.equal(true);
        expect(property).to.equal('bar');
        return element.removeProperty('foo');
      })
      .then(ignored => element.getProperty('foo'))
      .then(property => {
        expect(property).to.equal(undefined);
        done();
      })
      .catch(error => done(error));
  });

  it('removeProperty should set original if status is 0', done => {
    let node;
    let element;
    vagabond.addNode('1234', 'label')
      .then(n => {
        node = n;
        element = new Element(node, fakeVGraph);
        expect(fakeVGraph._dirty).to.equal(false);
        return Promise.all([
          node.setProperty('foo', 'bar'),
          node.setProperty(Constant.STATUS, 0),
        ]);
      })
      .then(ignored => element.removeProperty('foo'))
      .then(ignored => node.getProperties())
      .then(properties => {
        expect(fakeVGraph._dirty).to.equal(true);
        expect(properties.hasOwnProperty('foo')).to.equal(false);
        expect(properties[Constant.STATUS]).to.equal(2);
        expect(properties.hasOwnProperty(Constant.ORIG_PROPS)).to.equal(true);
        let original = JSON.parse(properties[Constant.ORIG_PROPS]);
        expect(original).to.deep.equal({foo: 'bar'});
        done();
      })
      .catch(error => done(error));
  });

  it('removeProperty should not overwrite when key not found', done => {
    let node;
    let element;
    vagabond.addNode('1234', 'label')
      .then(n => {
        node = n;
        element = new Element(node, fakeVGraph);
        expect(fakeVGraph._dirty).to.equal(false);
        return Promise.all([
          node.setProperty('foo', 'bar'),
          node.setProperty(Constant.STATUS, 0),
        ]);
      })
      .then(ignored => element.removeProperty('foo2'))
      .then(ignored => node.getProperties())
      .then(properties => {
        expect(fakeVGraph._dirty).to.equal(false);
        expect(properties.foo).to.equal('bar');
        expect(properties[Constant.STATUS]).to.equal(0);
        expect(properties.hasOwnProperty(Constant.ORIG_PROPS)).to.equal(false);
        done();
      })
      .catch(error => done(error));
  });

  it('removeProperty should fail on invalid key', done => {
    let element;
    vagabond.addNode('1234', 'label')
      .then(node => {
        element = new Element(node, fakeVGraph);
        return element.removeProperty('__invalid', 'value');
      })
      .then(ignored => done('Should have errored'), error => {
        expect(error.message).to.equal('Invalid Key');
        done();
      })
      .catch(error => done(error));
  });

  it('removeProperty should fail on deleted', done => {
    vagabond.addNode('1234', 'label')
      .then(node => {
        return node.setProperty(Constant.STATUS, 4);
      })
      .then(node => {
        return new Element(node, fakeVGraph).removeProperty('foo');
      })
      .catch(error => {
        expect(error.message).to.equal('Deleted');
        done();
      })
      .catch(error => done(error));
  });

  it('getProperties should work', done => {
    let element;
    vagabond.addNode('1234', 'label')
      .then(node => {
        element = new Element(node, fakeVGraph);
        return element.getProperties();
      })
      .then(properties => {
        expect(properties).to.deep.equal({});
        return element.setProperties({
          foo: 'bar',
          props: true,
        });
      })
      .then(ignored => element.getProperties())
      .then(properties => {
        expect(properties).to.deep.equal({
          foo: 'bar',
          props: true,
        });
        done();
      })
      .catch(error => done(error));
  });

  it('getProperties should fail on deleted', done => {
    vagabond.addNode('1234', 'label')
      .then(node => {
        return node.setProperty(Constant.STATUS, 4);
      })
      .then(node => {
        return new Element(node, fakeVGraph).getProperties();
      })
      .catch(error => {
        expect(error.message).to.equal('Deleted');
        done();
      })
      .catch(error => done(error));
  });

  it('setProperties should work', done => {
    let element;
    vagabond.addNode('1234', 'label')
      .then(node => {
        element = new Element(node, fakeVGraph);
        expect(fakeVGraph._dirty).to.equal(false);
        return element.getProperties();
      })
      .then(properties => {
        expect(properties).to.deep.equal({});
        return element.setProperties({
          foo: 'bar',
          props: true,
        });
      })
      .then(ignored => element.getProperties())
      .then(properties => {
        expect(fakeVGraph._dirty).to.equal(true);
        expect(properties).to.deep.equal({
          foo: 'bar',
          props: true,
        });
        return element.setProperties({
          foo: 'bar2',
          props: false,
        });
      })
      .then(ignored => element.getProperties('foo'))
      .then(properties => {
        expect(properties).to.deep.equal({
          foo: 'bar2',
          props: false,
        });
        done();
      })
      .catch(error => done(error));
  });

  it('setProperties should set original if status is 0', done => {
    let node;
    let element;
    vagabond.addNode('1234', 'label')
      .then(n => {
        node = n;
        element = new Element(node, fakeVGraph);
        expect(fakeVGraph._dirty).to.equal(false);
        return Promise.all([
          node.setProperty('foo', 'bar'),
          node.setProperty(Constant.STATUS, 0),
        ]);
      })
      .then(ignored => {
        return element.setProperties({
          foo: 'bar2',
          props: true});
      })
      .then(ignored => node.getProperties())
      .then(properties => {
        expect(fakeVGraph._dirty).to.equal(true);
        expect(properties.foo).to.equal('bar2');
        expect(properties.props).to.equal(true);
        expect(properties[Constant.STATUS]).to.equal(2);
        expect(properties.hasOwnProperty(Constant.ORIG_PROPS)).to.equal(true);
        let original = JSON.parse(properties[Constant.ORIG_PROPS]);
        expect(original).to.deep.equal({foo: 'bar'});
        done();
      })
      .catch(error => done(error));
  });

  it('setProperties should not overwrite on duplicate update', done => {
    let node;
    let element;
    vagabond.addNode('1234', 'label')
      .then(n => {
        node = n;
        element = new Element(node, fakeVGraph);
        expect(fakeVGraph._dirty).to.equal(false);
        return Promise.all([
          node.setProperty('foo', 'bar'),
          node.setProperty('props', true),
          node.setProperty(Constant.STATUS, 0),
        ]);
      })
      .then(ignored => {
        return element.setProperties({
          foo: 'bar',
          props: true});
      })
      .then(ignored => node.getProperties())
      .then(properties => {
        expect(fakeVGraph._dirty).to.equal(false);
        expect(properties.foo).to.equal('bar');
        expect(properties.props).to.equal(true);
        expect(properties[Constant.STATUS]).to.equal(0);
        expect(properties.hasOwnProperty(Constant.ORIG_PROPS)).to.equal(false);
        done();
      })
      .catch(error => done(error));
  });

  it('setProperties should fail on invalid key', done => {
    let element;
    vagabond.addNode('1234', 'label')
      .then(node => {
        element = new Element(node, fakeVGraph);
        return element.setProperties({__invalid: 'value'});
      })
      .then(ignored => done('Should have errored'), error => {
        expect(error.message).to.equal('Invalid Key');
        done();
      })
      .catch(error => done(error));
  });

  it('setProperties should fail on invalid value', done => {
    let element;

    let shouldWork = function(value) {
      return new Promise((resolve, reject) => {
        element.setProperties({foo: value})
          .then(ignored => resolve(null))
          .catch(error => reject(new Error(value + ' should have worked')));
      });
    };
    // If the set worked, then fail
    let shouldError = function(value) {
      return new Promise((resolve, reject) => {
        element.setProperties({foo: value}).then(ignored => {
          reject(new Error(value + ' should have failed'));
        }).catch(error => {
          resolve(null);
        });
      });
    };

    vagabond.addNode('1234', 'label')
      .then(node => {
        element = new Element(node, fakeVGraph);
        return Promise.all([
          shouldWork(true),
          shouldWork([true, false]),
          shouldWork(123.456),
          shouldWork([1, 2.5, 3e10]),
          shouldWork('string'),
          shouldWork(['foo']),
          shouldWork([]),
          shouldError(undefined),
          shouldError(null),
          shouldError(function() { }),
          shouldError(/regex/),
          shouldError({}),
          shouldError({foo: 'bar'}),
          shouldError([true, 1, 'string']),
          shouldError([{foo: 'bar'}, {foo: 'bear'}]),
        ]);
      })
      .then(ignored => done())
      .catch(error => done(error));
  });

  it('setProperties should fail on deleted', done => {
    vagabond.addNode('1234', 'label')
      .then(node => {
        return node.setProperty(Constant.STATUS, 4);
      })
      .then(node => {
        return new Element(node, fakeVGraph).setProperties({key: 'value'});
      })
      .catch(error => {
        expect(error.message).to.equal('Deleted');
        done();
      })
      .catch(error => done(error));
  });
});
