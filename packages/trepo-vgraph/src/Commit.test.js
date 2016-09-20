import Constant from './Constant.js';
import Commit from './Commit.js';
import CommitNode from './CommitNode.js';
import CommitEdge from './CommitEdge.js';

let expect = require('chai').expect;
let uuidv4 = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
let uuid1 = '6911bdc1-3b72-4827-91ce-92daf6a9a29c';
let uuid2 = 'a3167aff-a1aa-43d0-b12e-3fbea6ed7b9d';
let uuid3 = '4059dbde-1400-4dde-9ee6-5abc7756ae4a';
let now = Date.now();

let commit;

beforeEach(() => {
  commit = new Commit();
});

describe('Commit', () => {
  it('version should work', () => {
    expect(commit.version).to.equal(Constant.COMMIT_VERSION);
  });

  it('version should error when set', () => {
    expect(() => {
      commit.version = '1234';
    }).to.throw('Cannot set version');
  });

  it('id should work', () => {
    expect(commit.id).to.equal(undefined);
    commit.id = uuidv4;
    expect(commit.id).to.equal(uuidv4);
  });

  it('id should error when invalid', () => {
    expect(() => {
      commit.id = '1234';
    }).to.throw('Invalid id');
  });

  it('prev should work', () => {
    expect(commit.prev).to.equal(null);
    commit.prev = uuidv4;
    expect(commit.prev).to.equal(uuidv4);
  });

  it('prev should error when invalid', () => {
    expect(() => {
      commit.prev = '1234';
    }).to.throw('Invalid prev');
  });

  it('repo should work', () => {
    expect(commit.repo).to.equal(undefined);
    commit.repo = 'repo';
    expect(commit.repo).to.equal('repo');
  });

  it('repo should error when invalid', () => {
    expect(() => {
      commit.repo = false;
    }).to.throw('Invalid repo');
  });

  it('timestamp should work', () => {
    expect(commit.timestamp).to.equal(undefined);
    commit.timestamp = 1234;
    expect(commit.timestamp).to.equal(1234);
  });

  it('timestamp should error when invalid', () => {
    expect(() => {
      commit.timestamp = null;
    }).to.throw('Invalid timestamp');
  });

  it('author should work', () => {
    expect(commit.author).to.equal(undefined);
    commit.author = 'author';
    expect(commit.author).to.equal('author');
  });

  it('author should error when invalid', () => {
    expect(() => {
      commit.author = false;
    }).to.throw('Invalid author');
  });

  it('email should work', () => {
    expect(commit.email).to.equal(undefined);
    commit.email = 'email';
    expect(commit.email).to.equal('email');
  });

  it('email should error when invalid', () => {
    expect(() => {
      commit.email = 1234;
    }).to.throw('Invalid email');
  });

  it('message should work', () => {
    expect(commit.message).to.equal(undefined);
    commit.message = 'message';
    expect(commit.message).to.equal('message');
  });

  it('message should error when invalid', () => {
    expect(() => {
      commit.message = 1234;
    }).to.throw('Invalid message');
  });

  it('nodes should work', () => {
    expect(commit.nodes).to.deep.equal([]);

    let commitNode = new CommitNode();
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.action = 'create';
    commitNode.boundary = false;
    commitNode.props = {};

    commitNode.validate();

    commit.addNode(commitNode);

    expect(commit.nodes).to.deep.equal([commitNode]);
  });

  it('nodes should error when set', () => {
    expect(() => {
      commit.nodes = [];
    }).to.throw('Cannot set nodes');
  });

  it('getNode should work', () => {
    expect(() => commit.getNode(uuidv4)).to.throw('Node not found');

    let commitNode1 = new CommitNode();
    commitNode1.id = uuid1;
    commitNode1.label = 'label';
    commitNode1.action = 'create';
    commitNode1.boundary = false;
    commitNode1.props = {};
    commitNode1.validate();
    commit.addNode(commitNode1);

    expect(() => commit.getNode(uuidv4)).to.throw('Node not found');

    let commitNode = new CommitNode();
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.action = 'create';
    commitNode.boundary = false;
    commitNode.props = {};
    commitNode.validate();
    commit.addNode(commitNode);

    expect(commit.getNode(uuidv4)).to.equal(commitNode);
  });

  it('hasNode should work', () => {
    expect(commit.hasNode(uuidv4)).to.equal(false);

    let commitNode = new CommitNode();
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.action = 'create';
    commitNode.boundary = false;
    commitNode.props = {};

    commitNode.validate();

    commit.addNode(commitNode);

    expect(commit.hasNode(uuidv4)).to.equal(true);
  });

  it('addNode should work', () => {
    expect(commit.nodes).to.deep.equal([]);

    let commitNode = new CommitNode();
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.action = 'create';
    commitNode.boundary = false;
    commitNode.props = {};

    commitNode.validate();

    commit.addNode(commitNode);

    expect(commit.nodes).to.deep.equal([commitNode]);
  });

  it('addNode should error when not instanceof', () => {
    expect(() => commit.addNode('id')).to.throw('Invalid CommitNode');
  });

  it('addNode should error when not valid', () => {
    expect(() => commit.addNode(new CommitNode()))
      .to.throw('Missing id');
  });

  it('addNode should error when duplicate', () => {
    expect(commit.nodes).to.deep.equal([]);

    let commitNode = new CommitNode();
    commitNode.id = uuidv4;
    commitNode.label = 'label';
    commitNode.action = 'create';
    commitNode.boundary = false;
    commitNode.props = {};

    commitNode.validate();

    commit.addNode(commitNode);

    expect(commit.nodes).to.deep.equal([commitNode]);

    expect(() => commit.addNode(commitNode)).to.throw('Duplicate CommitNode');
  });

  it('edges should work', () => {
    expect(commit.edges).to.deep.equal([]);

    let commitNode1 = new CommitNode();
    commitNode1.id = uuid1;
    commitNode1.label = 'label';
    commitNode1.action = 'create';
    commitNode1.boundary = false;
    commitNode1.props = {};
    commitNode1.validate();
    commit.addNode(commitNode1);

    let commitNode2 = new CommitNode();
    commitNode2.id = uuid2;
    commitNode2.label = 'label';
    commitNode2.action = 'create';
    commitNode2.boundary = false;
    commitNode2.props = {};
    commitNode2.validate();
    commit.addNode(commitNode2);

    let commitEdge = new CommitEdge();
    commitEdge.id = uuidv4;
    commitEdge.label = 'label';
    commitEdge.from = uuid1;
    commitEdge.to = uuid2;
    commitEdge.action = 'create';
    commitEdge.props = {};
    commitEdge.validate();
    commit.addEdge(commitEdge);

    expect(commit.edges).to.deep.equal([commitEdge]);
  });

  it('edges should error when set', () => {
    expect(() => {
      commit.edges = [];
    }).to.throw('Cannot set edges');
  });

  it('getEdge should work', () => {
    expect(() => commit.getEdge(uuidv4)).to.throw('Edge not found');

    let commitNode1 = new CommitNode();
    commitNode1.id = uuid1;
    commitNode1.label = 'label';
    commitNode1.action = 'create';
    commitNode1.boundary = false;
    commitNode1.props = {};
    commitNode1.validate();
    commit.addNode(commitNode1);

    let commitNode2 = new CommitNode();
    commitNode2.id = uuid2;
    commitNode2.label = 'label';
    commitNode2.action = 'create';
    commitNode2.boundary = false;
    commitNode2.props = {};
    commitNode2.validate();
    commit.addNode(commitNode2);

    let commitEdge1 = new CommitEdge();
    commitEdge1.id = uuid3;
    commitEdge1.label = 'label';
    commitEdge1.from = uuid2;
    commitEdge1.to = uuid1;
    commitEdge1.action = 'create';
    commitEdge1.props = {};
    commitEdge1.validate();
    commit.addEdge(commitEdge1);

    expect(() => commit.getEdge(uuidv4)).to.throw('Edge not found');

    let commitEdge = new CommitEdge();
    commitEdge.id = uuidv4;
    commitEdge.label = 'label';
    commitEdge.from = uuid1;
    commitEdge.to = uuid2;
    commitEdge.action = 'create';
    commitEdge.props = {};
    commitEdge.validate();
    commit.addEdge(commitEdge);

    expect(commit.getEdge(uuidv4)).to.equal(commitEdge);
  });

  it('hasEdge should work', () => {
    expect(commit.hasEdge(uuidv4)).to.equal(false);

    let commitNode1 = new CommitNode();
    commitNode1.id = uuid1;
    commitNode1.label = 'label';
    commitNode1.action = 'create';
    commitNode1.boundary = false;
    commitNode1.props = {};
    commitNode1.validate();
    commit.addNode(commitNode1);

    let commitNode2 = new CommitNode();
    commitNode2.id = uuid2;
    commitNode2.label = 'label';
    commitNode2.action = 'create';
    commitNode2.boundary = false;
    commitNode2.props = {};
    commitNode2.validate();
    commit.addNode(commitNode2);

    let commitEdge = new CommitEdge();
    commitEdge.id = uuidv4;
    commitEdge.label = 'label';
    commitEdge.from = uuid1;
    commitEdge.to = uuid2;
    commitEdge.action = 'create';
    commitEdge.props = {};
    commitEdge.validate();
    commit.addEdge(commitEdge);

    expect(commit.hasEdge(uuidv4)).to.equal(true);
  });

  it('addEdge should work', () => {
    expect(commit.edges).to.deep.equal([]);

    let commitNode1 = new CommitNode();
    commitNode1.id = uuid1;
    commitNode1.label = 'label';
    commitNode1.action = 'create';
    commitNode1.boundary = false;
    commitNode1.props = {};
    commitNode1.validate();
    commit.addNode(commitNode1);

    let commitNode2 = new CommitNode();
    commitNode2.id = uuid2;
    commitNode2.label = 'label';
    commitNode2.action = 'create';
    commitNode2.boundary = false;
    commitNode2.props = {};
    commitNode2.validate();
    commit.addNode(commitNode2);

    let commitEdge = new CommitEdge();
    commitEdge.id = uuidv4;
    commitEdge.label = 'label';
    commitEdge.from = uuid1;
    commitEdge.to = uuid2;
    commitEdge.action = 'create';
    commitEdge.props = {};
    commitEdge.validate();
    commit.addEdge(commitEdge);

    expect(commit.edges).to.deep.equal([commitEdge]);
  });

  it('addEdge should error when not instanceof', () => {
    expect(() => commit.addEdge('id')).to.throw('Invalid CommitEdge');
  });

  it('addEdge should error when not valid', () => {
    expect(() => commit.addEdge(new CommitEdge()))
      .to.throw('Missing id');
  });

  it('addEdge should error when duplicate', () => {
    expect(commit.edges).to.deep.equal([]);

    let commitNode1 = new CommitNode();
    commitNode1.id = uuid1;
    commitNode1.label = 'label';
    commitNode1.action = 'create';
    commitNode1.boundary = false;
    commitNode1.props = {};
    commitNode1.validate();
    commit.addNode(commitNode1);

    let commitNode2 = new CommitNode();
    commitNode2.id = uuid2;
    commitNode2.label = 'label';
    commitNode2.action = 'create';
    commitNode2.boundary = false;
    commitNode2.props = {};
    commitNode2.validate();
    commit.addNode(commitNode2);

    let commitEdge = new CommitEdge();
    commitEdge.id = uuidv4;
    commitEdge.label = 'label';
    commitEdge.from = uuid1;
    commitEdge.to = uuid2;
    commitEdge.action = 'create';
    commitEdge.props = {};
    commitEdge.validate();
    commit.addEdge(commitEdge);

    expect(() => commit.addEdge(commitEdge)).to.throw('Duplicate CommitEdge');
  });

  it('validate should work', () => {
    commit.id = uuidv4;
    commit.repo = 'repo';
    commit.timestamp = now;
    commit.author = 'author';
    commit.email = 'email';
    commit.message = 'message';

    let commitNode1 = new CommitNode();
    commitNode1.id = uuid1;
    commitNode1.label = 'label';
    commitNode1.action = 'create';
    commitNode1.boundary = false;
    commitNode1.props = {};
    commitNode1.validate();
    commit.addNode(commitNode1);

    let commitNode2 = new CommitNode();
    commitNode2.id = uuid2;
    commitNode2.label = 'label';
    commitNode2.action = 'create';
    commitNode2.boundary = false;
    commitNode2.props = {};
    commitNode2.validate();
    commit.addNode(commitNode2);

    let commitEdge = new CommitEdge();
    commitEdge.id = uuid3;
    commitEdge.label = 'label';
    commitEdge.from = uuid1;
    commitEdge.to = uuid2;
    commitEdge.action = 'create';
    commitEdge.props = {};
    commitEdge.validate();
    commit.addEdge(commitEdge);

    commit.validate();
  });

  it('validate should allow blank author, email, and message', () => {
    commit.id = uuidv4;
    commit.repo = 'repo';
    commit.timestamp = now;
    commit.author = '';
    commit.email = '';
    commit.message = '';

    commit.validate();
  });

  it('validate should error on missing id', () => {
    commit.repo = 'repo';
    commit.timestamp = now;
    commit.author = 'author';
    commit.email = 'email';
    commit.message = 'message';

    expect(() => commit.validate()).to.throw('Missing id');
  });

  it('validate should error on missing repo', () => {
    commit.id = uuidv4;
    commit.timestamp = now;
    commit.author = 'author';
    commit.email = 'email';
    commit.message = 'message';

    expect(() => commit.validate()).to.throw('Missing repo');
  });

  it('validate should error on missing timestamp', () => {
    commit.id = uuidv4;
    commit.repo = 'repo';
    commit.author = 'author';
    commit.email = 'email';
    commit.message = 'message';

    expect(() => commit.validate()).to.throw('Missing timestamp');
  });

  it('validate should error on missing author', () => {
    commit.id = uuidv4;
    commit.repo = 'repo';
    commit.timestamp = now;
    commit.email = 'email';
    commit.message = 'message';

    expect(() => commit.validate()).to.throw('Missing author');
  });

  it('validate should error on missing email', () => {
    commit.id = uuidv4;
    commit.repo = 'repo';
    commit.timestamp = now;
    commit.author = 'author';
    commit.message = 'message';

    expect(() => commit.validate()).to.throw('Missing email');
  });

  it('validate should error on missing message', () => {
    commit.id = uuidv4;
    commit.repo = 'repo';
    commit.timestamp = now;
    commit.author = 'author';
    commit.email = 'email';

    expect(() => commit.validate()).to.throw('Missing message');
  });

  it('validate should error on missing from', () => {
    commit.id = uuidv4;
    commit.repo = 'repo';
    commit.timestamp = now;
    commit.author = 'author';
    commit.email = 'email';
    commit.message = 'message';

    let commitNode2 = new CommitNode();
    commitNode2.id = uuid2;
    commitNode2.label = 'label';
    commitNode2.action = 'create';
    commitNode2.boundary = false;
    commitNode2.props = {};
    commitNode2.validate();
    commit.addNode(commitNode2);

    let commitEdge = new CommitEdge();
    commitEdge.id = uuid3;
    commitEdge.label = 'label';
    commitEdge.from = uuid1;
    commitEdge.to = uuid2;
    commitEdge.action = 'create';
    commitEdge.props = {};
    commitEdge.validate();
    commit.addEdge(commitEdge);

    expect(() => commit.validate())
      .to.throw('CommitEdge ' + uuid3 + ' references non-existing from');
  });

  it('validate should error on missing to', () => {
    commit.id = uuidv4;
    commit.repo = 'repo';
    commit.timestamp = now;
    commit.author = 'author';
    commit.email = 'email';
    commit.message = 'message';

    let commitNode1 = new CommitNode();
    commitNode1.id = uuid1;
    commitNode1.label = 'label';
    commitNode1.action = 'create';
    commitNode1.boundary = false;
    commitNode1.props = {};
    commitNode1.validate();
    commit.addNode(commitNode1);

    let commitEdge = new CommitEdge();
    commitEdge.id = uuid3;
    commitEdge.label = 'label';
    commitEdge.from = uuid1;
    commitEdge.to = uuid2;
    commitEdge.action = 'create';
    commitEdge.props = {};
    commitEdge.validate();
    commit.addEdge(commitEdge);

    expect(() => commit.validate())
      .to.throw('CommitEdge ' + uuid3 + ' references non-existing to');
  });

  it('fromJSON should import correctly', () => {
    let json = {
      version: Constant.COMMIT_VERSION,
      id: uuidv4,
      prev: '7a988b05-8f11-4cf6-8373-dbef7f122ed0',
      repo: 'repo',
      timestamp: now,
      author: 'author',
      email: 'email',
      message: 'message',
      nodes: [
        {
          id: uuid1,
          label: 'label',
          action: 'create',
          boundary: false,
          props: {},
        },
        {
          id: uuid2,
          label: 'label',
          action: 'create',
          boundary: false,
          props: {},
        },
      ],
      edges: [
        {
          id: uuid3,
          label: 'label',
          from: uuid1,
          to: uuid2,
          action: 'create',
          props: {},
        },
      ],
    };

    commit.fromJSON(json);

    expect(commit.id).to.equal(uuidv4);
    expect(commit.prev).to.equal('7a988b05-8f11-4cf6-8373-dbef7f122ed0');
    expect(commit.repo).to.equal('repo');
    expect(commit.timestamp).to.equal(now);
    expect(commit.author).to.equal('author');
    expect(commit.email).to.equal('email');
    expect(commit.message).to.equal('message');

    for (let node of commit.nodes) {
      expect([uuid1, uuid2]).to.contain(node.id);
    }

    for (let edge of commit.edges) {
      expect(edge.id).to.equal(uuid3);
    }

    commit.validate();
  });

  it('fromJSON should import correctly without prev', () => {
    let json = {
      version: Constant.COMMIT_VERSION,
      id: uuidv4,
      prev: null,
      repo: 'repo',
      timestamp: now,
      author: 'author',
      email: 'email',
      message: 'message',
      nodes: [],
      edges: [],
    };

    commit.fromJSON(json);

    expect(commit.id).to.equal(uuidv4);
    expect(commit.prev).to.equal(null);
    expect(commit.repo).to.equal('repo');
    expect(commit.timestamp).to.equal(now);
    expect(commit.author).to.equal('author');
    expect(commit.email).to.equal('email');
    expect(commit.message).to.equal('message');

    commit.validate();
  });

  it('fromJSON should error on wrong version', () => {
    let json = {
      id: uuidv4,
      prev: '7a988b05-8f11-4cf6-8373-dbef7f122ed0',
      repo: 'repo',
      timestamp: now,
      author: 'author',
      email: 'email',
      message: 'message',
      nodes: [],
      edges: [],
    };

    expect(() => commit.fromJSON(json)).to.throw('Invalid version');
  });

  it('fromJSON should error on invalid', () => {
    let json = {
      version: Constant.COMMIT_VERSION,
      prev: '7a988b05-8f11-4cf6-8373-dbef7f122ed0',
      repo: 'repo',
      timestamp: now,
      author: 'author',
      email: 'email',
      message: 'message',
      nodes: [],
      edges: [],
    };

    expect(() => commit.fromJSON(json)).to.throw('Invalid id');
  });

  it('toJSON should work', () => {
    commit.id = uuidv4;
    commit.repo = 'repo';
    commit.timestamp = now;
    commit.author = 'author';
    commit.email = 'email';
    commit.message = 'message';

    let commitNode1 = new CommitNode();
    commitNode1.id = uuid1;
    commitNode1.label = 'label';
    commitNode1.action = 'create';
    commitNode1.boundary = false;
    commitNode1.props = {};
    commitNode1.validate();
    commit.addNode(commitNode1);

    let commitNode2 = new CommitNode();
    commitNode2.id = uuid2;
    commitNode2.label = 'label';
    commitNode2.action = 'create';
    commitNode2.boundary = false;
    commitNode2.props = {};
    commitNode2.validate();
    commit.addNode(commitNode2);

    let commitEdge = new CommitEdge();
    commitEdge.id = uuid3;
    commitEdge.label = 'label';
    commitEdge.from = uuid1;
    commitEdge.to = uuid2;
    commitEdge.action = 'create';
    commitEdge.props = {};
    commitEdge.validate();
    commit.addEdge(commitEdge);

    commit.validate();

    expect(commit.toJSON()).to.deep.equal({
      version: Constant.COMMIT_VERSION,
      id: uuidv4,
      prev: null,
      repo: 'repo',
      timestamp: now,
      author: 'author',
      email: 'email',
      message: 'message',
      nodes: [
        {
          id: uuid1,
          label: 'label',
          action: 'create',
          boundary: false,
          repo: undefined,
          origRepo: undefined,
          props: {},
          origProps: undefined,
        },
        {
          id: uuid2,
          label: 'label',
          action: 'create',
          boundary: false,
          repo: undefined,
          origRepo: undefined,
          props: {},
          origProps: undefined,
        },
      ],
      edges: [
        {
          id: uuid3,
          label: 'label',
          from: uuid1,
          to: uuid2,
          action: 'create',
          props: {},
          origProps: undefined,
        },
      ],
    });
  });
});
