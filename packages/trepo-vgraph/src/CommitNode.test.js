import CommitNode from './CommitNode.js';

let expect = require('chai').expect;
let uuidv4 = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
let commitNode;

beforeEach(() => {
  commitNode = new CommitNode();
});

describe('CommitNode', () => {
  it('constructor should work', () => {
    commitNode = new CommitNode(uuidv4, 'label');
    expect(commitNode.id).to.equal(uuidv4);
    expect(commitNode.label).to.equal('label');
  });

  it('constructor should error on invalid id', () => {
    expect(() => new CommitNode('1234')).to.throw('Invalid id');
  });

  it('id should work', () => {
    expect(commitNode.id).to.equal(undefined);
    commitNode.id = uuidv4;
    expect(commitNode.id).to.equal(uuidv4);
  });

  it('id should error in invalid id', () => {
    expect(() => {
      commitNode.id = '1234';
    }).to.throw('Invalid id');
  });

  it('label should work', () => {
    expect(commitNode.label).to.equal(undefined);
    commitNode.label = 'label';
    expect(commitNode.label).to.equal('label');
  });

  it('label should error in invalid label', () => {
    expect(() => {
      commitNode.label = '_invalid';
    }).to.throw('Invalid label');
  });

  it('action should work', () => {
    expect(commitNode.action).to.equal(undefined);
    commitNode.action = 'create';
    expect(commitNode.action).to.equal('create');
  });

  it('action should error in invalid action', () => {
    expect(() => {
      commitNode.action = 'read';
    }).to.throw('Invalid action');
  });

  it('boundary should work', () => {
    expect(commitNode.boundary).to.equal(undefined);
    commitNode.boundary = false;
    expect(commitNode.boundary).to.equal(false);
  });

  it('boundary should error in invalid boundary', () => {
    expect(() => {
      commitNode.boundary = null;
    }).to.throw('Invalid boundary');
  });

  it('repo should work', () => {
    expect(commitNode.repo).to.equal(undefined);
    commitNode.repo = 'repo';
    expect(commitNode.repo).to.equal('repo');
  });

  it('repo should error in invalid repo', () => {
    expect(() => {
      commitNode.repo = true;
    }).to.throw('Invalid repo');
  });

  it('origRepo should work', () => {
    expect(commitNode.origRepo).to.equal(undefined);
    commitNode.origRepo = 'repo';
    expect(commitNode.origRepo).to.equal('repo');
  });

  it('origRepo should error in invalid repo', () => {
    expect(() => {
      commitNode.origRepo = true;
    }).to.throw('Invalid origRepo');
  });

  it('origProps should work', () => {
    expect(commitNode.origProps).to.equal(undefined);
    commitNode.origProps = {};
    expect(commitNode.origProps).to.deep.equal({});
  });

  it('origProps should error in invalid origProps', () => {
    expect(() => {
      commitNode.origProps = undefined;
    }).to.throw('Invalid origProps');
  });

  it('props should work', () => {
    expect(commitNode.props).to.equal(undefined);
    commitNode.props = {foo: 'bar'};
    expect(commitNode.props).to.deep.equal({foo: 'bar'});
  });

  it('props should error in invalid props', () => {
    expect(() => {
      commitNode.props = 'str';
    }).to.throw('Invalid props');
  });

  it('validate should work on create regular node', () => {
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.action = 'create';
    commitNode.boundary = false;
    commitNode.props = {};

    commitNode.validate();
  });

  it('validate should work on create boundary node', () => {
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.action = 'create';
    commitNode.boundary = true;
    commitNode.repo = 'external';

    commitNode.validate();
  });

  it('validate should work on update boundary node', () => {
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.action = 'update';
    commitNode.boundary = true;
    commitNode.repo = 'external';
    commitNode.origRepo = 'external-old';

    commitNode.validate();
  });

  it('validate should work on delete boundary node', () => {
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.action = 'delete';
    commitNode.boundary = true;
    commitNode.origRepo = 'external-old';

    commitNode.validate();
  });

  it('validate should work on reference boundary node', () => {
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.action = 'reference';
    commitNode.boundary = true;
    commitNode.repo = 'external';

    commitNode.validate();
  });

  it('validate should work on update', () => {
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.action = 'update';
    commitNode.boundary = false;
    commitNode.props = {};
    commitNode.origProps = {foo: 'bar'};

    commitNode.validate();
  });

  it('validate should work on delete', () => {
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.action = 'delete';
    commitNode.boundary = false;
    commitNode.origProps = {};

    commitNode.validate();
  });

  it('validate should error on missing id', () => {
    commitNode.label = 'label';
    commitNode.action = 'create';
    commitNode.boundary = true;
    commitNode.repo = 'external';

    expect(() => commitNode.validate()).to.throw('Missing id');
  });

  it('validate should error on missing label', () => {
    commitNode.id = uuidv4;
    commitNode.action = 'create';
    commitNode.boundary = true;
    commitNode.repo = 'external';

    expect(() => commitNode.validate()).to.throw('Missing label');
  });

  it('validate should error on missing action', () => {
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.boundary = true;
    commitNode.repo = 'external';

    expect(() => commitNode.validate()).to.throw('Missing action');
  });

  it('validate should error on missing boundary', () => {
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.action = 'create';
    commitNode.repo = 'external';

    expect(() => commitNode.validate()).to.throw('Missing boundary');
  });

  it('validate should error on messed up create boundary', () => {
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.action = 'create';
    commitNode.boundary = true;
    commitNode.repo = 'repo';
    commitNode.origProps = {};

    expect(() => commitNode.validate())
      .to.throw('only repo must be set on create boundary');
  });

  it('validate should error on messed up update boundary', () => {
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.action = 'update';
    commitNode.boundary = true;
    commitNode.repo = 'repo';

    expect(() => commitNode.validate())
      .to.throw('repo and one of origRepo or origProps ' +
        'must be set on update boundary');
  });

  it('validate should error on messed up delete boundary', () => {
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.action = 'delete';
    commitNode.boundary = true;
    commitNode.origProps = {};
    commitNode.origRepo = 'repo';

    expect(() => commitNode.validate())
      .to.throw('only origRepo must be set on delete boundary');
  });

  it('validate should error on messed up reference boundary', () => {
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.action = 'reference';
    commitNode.boundary = true;
    commitNode.origProps = {};
    commitNode.repo = 'repo';

    expect(() => commitNode.validate())
      .to.throw('only repo must be set on create reference');
  });

  it('validate should error on messed up create', () => {
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.action = 'create';
    commitNode.boundary = false;
    commitNode.origProps = {};

    expect(() => commitNode.validate())
      .to.throw('only props must be set on create');
  });

  it('validate should error on messed up update', () => {
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.action = 'update';
    commitNode.boundary = false;
    commitNode.props = {};

    expect(() => commitNode.validate())
      .to.throw('props and one of origRepo or origProps ' +
        'must be set on update');
  });

  it('validate should error on update with origRepo and origProps', () => {
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.action = 'update';
    commitNode.boundary = false;
    commitNode.props = {};
    commitNode.origProps = {foo: 'bar'};
    commitNode.origRepo = 'external';

    expect(() => commitNode.validate())
      .to.throw('props and one of origRepo or origProps ' +
        'must be set on update');
  });

  it('validate should error on messed up delete', () => {
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.action = 'delete';
    commitNode.boundary = false;
    commitNode.props = {};

    expect(() => commitNode.validate())
      .to.throw('only origProps must be set on delete');
  });

  it('validate should error on reference node', () => {
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.action = 'reference';
    commitNode.boundary = false;
    commitNode.props = {};

    expect(() => commitNode.validate())
      .to.throw('reference is only allowed for boundaries');
  });

  it('fromJSON should import correctly', () => {
    let json = {
      id: uuidv4,
      label: 'label',
      action: 'update',
      boundary: false,
      origProps: {foo: 'bar'},
      props: {},
    };

    commitNode.fromJSON(json);

    expect(commitNode.id).to.equal(uuidv4);
    expect(commitNode.label).to.equal('label');
    expect(commitNode.action).to.equal('update');
    expect(commitNode.boundary).to.equal(false);
    expect(commitNode.repo).to.equal(undefined);
    expect(commitNode.origProps).to.deep.equal({foo: 'bar'});
    expect(commitNode.props).to.deep.equal({});

    commitNode.validate();
  });

  it('fromJSON should import correctly for boundary', () => {
    let json = {
      id: uuidv4,
      label: 'label',
      action: 'update',
      boundary: true,
      repo: 'external',
      origRepo: 'external-old',
    };

    commitNode.fromJSON(json);

    expect(commitNode.id).to.equal(uuidv4);
    expect(commitNode.label).to.equal('label');
    expect(commitNode.action).to.equal('update');
    expect(commitNode.boundary).to.equal(true);
    expect(commitNode.repo).to.equal('external');
    expect(commitNode.origRepo).to.equal('external-old');
    expect(commitNode.origProps).to.equal(undefined);
    expect(commitNode.props).to.equal(undefined);

    commitNode.validate();
  });

  it('fromJSON should error when invalid', () => {
    let json = {
      label: 'label',
      action: 'update',
      boundary: false,
      repo: undefined,
      origProps: {foo: 'bar'},
      props: {},
    };

    expect(() => commitNode.fromJSON(json)).to.throw('Invalid id');
  });

  it('toJSON should work', () => {
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.action = 'update';
    commitNode.boundary = false;
    commitNode.props = {};
    commitNode.origProps = {foo: 'bar'};

    commitNode.validate();

    let json = commitNode.toJSON();

    expect(json).to.deep.equal({
      id: uuidv4,
      label: 'label',
      action: 'update',
      boundary: false,
      repo: undefined,
      origRepo: undefined,
      origProps: {foo: 'bar'},
      props: {},
    });
  });
});
