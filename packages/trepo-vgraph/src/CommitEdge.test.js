import CommitEdge from './CommitEdge.js';

let expect = require('chai').expect;
let uuidv4 = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
let uuid1 = '6911bdc1-3b72-4827-91ce-92daf6a9a29c';
let uuid2 = 'a3167aff-a1aa-43d0-b12e-3fbea6ed7b9d';

let commitEdge;

beforeEach(() => {
  commitEdge = new CommitEdge();
});

describe('CommitEdge', () => {
  it('constructor should work', () => {
    commitEdge = new CommitEdge(uuidv4, 'label', uuid1, uuid2);
    expect(commitEdge.id).to.equal(uuidv4);
    expect(commitEdge.label).to.equal('label');
    expect(commitEdge.from).to.equal(uuid1);
    expect(commitEdge.to).to.equal(uuid2);
  });

  it('constructor should error on invalid id', () => {
    expect(() => new CommitEdge('1234')).to.throw('Invalid id');
  });

  it('id should work', () => {
    expect(commitEdge.id).to.equal(undefined);
    commitEdge.id = uuidv4;
    expect(commitEdge.id).to.equal(uuidv4);
  });

  it('id should error in invalid id', () => {
    expect(() => {
      commitEdge.id = '1234';
    }).to.throw('Invalid id');
  });

  it('label should work', () => {
    expect(commitEdge.label).to.equal(undefined);
    commitEdge.label = 'label';
    expect(commitEdge.label).to.equal('label');
  });

  it('label should error in invalid label', () => {
    expect(() => {
      commitEdge.label = '_invalid';
    }).to.throw('Invalid label');
  });

  it('from should work', () => {
    expect(commitEdge.from).to.equal(undefined);
    commitEdge.from = uuid1;
    expect(commitEdge.from).to.equal(uuid1);
  });

  it('from should error in invalid from', () => {
    expect(() => {
      commitEdge.from = 1234;
    }).to.throw('Invalid from');
  });

  it('to should work', () => {
    expect(commitEdge.to).to.equal(undefined);
    commitEdge.to = uuid2;
    expect(commitEdge.to).to.equal(uuid2);
  });

  it('to should error in invalid to', () => {
    expect(() => {
      commitEdge.to = false;
    }).to.throw('Invalid to');
  });

  it('action should work', () => {
    expect(commitEdge.action).to.equal(undefined);
    commitEdge.action = 'create';
    expect(commitEdge.action).to.equal('create');
  });

  it('action should error in invalid action', () => {
    expect(() => {
      commitEdge.action = 'read';
    }).to.throw('Invalid action');
  });

  it('origProps should work', () => {
    expect(commitEdge.origProps).to.equal(undefined);
    commitEdge.origProps = {foo: 'bar'};
    expect(commitEdge.origProps).to.deep.equal({foo: 'bar'});
  });

  it('origProps should error in invalid origProps', () => {
    expect(() => {
      commitEdge.origProps = '1234';
    }).to.throw('Invalid origProps');
  });

  it('props should work', () => {
    expect(commitEdge.props).to.equal(undefined);
    commitEdge.props = {foo: 'bar'};
    expect(commitEdge.props).to.deep.equal({foo: 'bar'});
  });

  it('props should error in invalid props', () => {
    expect(() => {
      commitEdge.props = 'false';
    }).to.throw('Invalid props');
  });

  it('validate should work on create', () => {
    commitEdge.id = uuidv4;
    commitEdge.label = 'label';
    commitEdge.from = uuid1;
    commitEdge.to = uuid2;
    commitEdge.action = 'create';
    commitEdge.props = {};

    commitEdge.validate();
  });

  it('validate should work on update', () => {
    commitEdge.id = uuidv4;
    commitEdge.label = 'label';
    commitEdge.from = uuid1;
    commitEdge.to = uuid2;
    commitEdge.action = 'update';
    commitEdge.props = {};
    commitEdge.origProps = {foo: 'bar'};

    commitEdge.validate();
  });

  it('validate should work on delete', () => {
    commitEdge.id = uuidv4;
    commitEdge.label = 'label';
    commitEdge.from = uuid1;
    commitEdge.to = uuid2;
    commitEdge.action = 'delete';
    commitEdge.origProps = {};

    commitEdge.validate();
  });

  it('validate should error on missing id', () => {
    commitEdge.label = 'label';
    commitEdge.from = uuid1;
    commitEdge.to = uuid2;
    commitEdge.action = 'create';
    commitEdge.props = {};

    expect(() => commitEdge.validate()).to.throw('Missing id');
  });

  it('validate should error on missing label', () => {
    commitEdge.id = uuidv4;
    commitEdge.from = uuid1;
    commitEdge.to = uuid2;
    commitEdge.action = 'create';
    commitEdge.props = {};

    expect(() => commitEdge.validate()).to.throw('Missing label');
  });

  it('validate should error on missing from', () => {
    commitEdge.id = uuidv4;
    commitEdge.label = 'label';
    commitEdge.to = uuid2;
    commitEdge.action = 'create';
    commitEdge.props = {};

    expect(() => commitEdge.validate()).to.throw('Missing from');
  });

  it('validate should error on invalid from', () => {
    commitEdge.id = uuidv4;
    commitEdge.label = 'label';
    commitEdge.from = uuidv4;
    commitEdge.to = uuid2;
    commitEdge.action = 'create';
    commitEdge.props = {};

    expect(() => commitEdge.validate()).to.throw('Invalid from');
  });

  it('validate should error on missing to', () => {
    commitEdge.id = uuidv4;
    commitEdge.label = 'label';
    commitEdge.from = uuid1;
    commitEdge.action = 'create';
    commitEdge.props = {};

    expect(() => commitEdge.validate()).to.throw('Missing to');
  });

  it('validate should error on invalid to', () => {
    commitEdge.id = uuidv4;
    commitEdge.label = 'label';
    commitEdge.from = uuid1;
    commitEdge.to = uuidv4;
    commitEdge.action = 'create';
    commitEdge.props = {};

    expect(() => commitEdge.validate()).to.throw('Invalid to');
  });

  it('validate should error on circular edge', () => {
    commitEdge.id = uuidv4;
    commitEdge.label = 'label';
    commitEdge.from = uuid1;
    commitEdge.to = uuid1;
    commitEdge.action = 'create';
    commitEdge.props = {};

    expect(() => commitEdge.validate()).to.throw('Circular Edges not allowed');
  });

  it('validate should error on missing action', () => {
    commitEdge.id = uuidv4;
    commitEdge.label = 'label';
    commitEdge.from = uuid1;
    commitEdge.to = uuid2;
    commitEdge.props = {};

    expect(() => commitEdge.validate()).to.throw('Missing action');
  });

  it('validate should error on messed up create', () => {
    commitEdge.id = uuidv4;
    commitEdge.label = 'label';
    commitEdge.from = uuid1;
    commitEdge.to = uuid2;
    commitEdge.action = 'create';
    commitEdge.origProps = {};

    expect(() => commitEdge.validate())
      .to.throw('props (not origProps) must be set on create');
  });

  it('validate should error on messed up update', () => {
    commitEdge.id = uuidv4;
    commitEdge.label = 'label';
    commitEdge.from = uuid1;
    commitEdge.to = uuid2;
    commitEdge.action = 'update';
    commitEdge.props = {};

    expect(() => commitEdge.validate())
      .to.throw('props and origProps must be set on update');
  });

  it('validate should error on messed up delete', () => {
    commitEdge.id = uuidv4;
    commitEdge.label = 'label';
    commitEdge.from = uuid1;
    commitEdge.to = uuid2;
    commitEdge.action = 'delete';
    commitEdge.props = {};

    expect(() => commitEdge.validate())
      .to.throw('origProps (not props) must be set on delete');
  });

  it('fromJSON should import create correctly', () => {
    let json = {
      id: uuidv4,
      label: 'label',
      from: uuid1,
      to: uuid2,
      action: 'create',
      props: {},
    };

    commitEdge.fromJSON(json);

    expect(commitEdge.id).to.equal(uuidv4);
    expect(commitEdge.label).to.equal('label');
    expect(commitEdge.from).to.equal(uuid1);
    expect(commitEdge.to).to.equal(uuid2);
    expect(commitEdge.action).to.equal('create');
    expect(commitEdge.origProps).to.equal(undefined);
    expect(commitEdge.props).to.deep.equal({});

    commitEdge.validate();
  });

  it('fromJSON should import update correctly', () => {
    let json = {
      id: uuidv4,
      label: 'label',
      from: uuid1,
      to: uuid2,
      action: 'update',
      origProps: {foo: 'bar'},
      props: {},
    };

    commitEdge.fromJSON(json);

    expect(commitEdge.id).to.equal(uuidv4);
    expect(commitEdge.label).to.equal('label');
    expect(commitEdge.from).to.equal(uuid1);
    expect(commitEdge.to).to.equal(uuid2);
    expect(commitEdge.action).to.equal('update');
    expect(commitEdge.origProps).to.deep.equal({foo: 'bar'});
    expect(commitEdge.props).to.deep.equal({});

    commitEdge.validate();
  });

  it('fromJSON should import delete correctly', () => {
    let json = {
      id: uuidv4,
      label: 'label',
      from: uuid1,
      to: uuid2,
      action: 'delete',
      origProps: {foo: 'bar'},
    };

    commitEdge.fromJSON(json);

    expect(commitEdge.id).to.equal(uuidv4);
    expect(commitEdge.label).to.equal('label');
    expect(commitEdge.from).to.equal(uuid1);
    expect(commitEdge.to).to.equal(uuid2);
    expect(commitEdge.action).to.equal('delete');
    expect(commitEdge.origProps).to.deep.equal({foo: 'bar'});
    expect(commitEdge.props).to.equal(undefined);

    commitEdge.validate();
  });

  it('fromJSON should error when invalid', () => {
    let json = {
      label: 'label',
      from: uuid1,
      to: uuid2,
      action: 'update',
      origProps: {foo: 'bar'},
      props: {},
    };

    expect(() => commitEdge.fromJSON(json)).to.throw('Invalid id');
  });

  it('toJSON should work', () => {
    commitEdge.id = uuidv4;
    commitEdge.label = 'label';
    commitEdge.from = uuid1;
    commitEdge.to = uuid2;
    commitEdge.action = 'create';
    commitEdge.props = {};

    commitEdge.validate();

    let json = commitEdge.toJSON();

    expect(json).to.deep.equal({
      id: uuidv4,
      label: 'label',
      from: uuid1,
      to: uuid2,
      action: 'create',
      origProps: undefined,
      props: {},
    });
  });
});
