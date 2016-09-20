import Constant from '../Constant.js';
import VGraph from '../VGraph.js';

let expect = require('chai').expect;
let vGraph;

beforeEach(() => {
  vGraph = new VGraph('repo');
});

describe('VGraph - info', () => {
  it('info should work', done => {
    let commitId;
    vGraph.init()
      .then(ignored => vGraph.info())
      .then(info => {
        expect(info).to.deep.equal({
          version: Constant.SPEC_VERSION,
          repo: 'repo',
          commit: null,
          clean: true,
        });
        return vGraph.addNode('label');
      })
      .then(node => node.setProperty('foo', 'bar'))
      .then(ignored => vGraph.info())
      .then(info => {
        expect(info).to.deep.equal({
          version: Constant.SPEC_VERSION,
          repo: 'repo',
          commit: null,
          clean: false,
        });
        return vGraph.commit('author', 'email', 'message');
      })
      .then(commit => {
        commitId = commit.id;
        return vGraph.info();
      })
      .then(info => {
        expect(info).to.deep.equal({
          version: Constant.SPEC_VERSION,
          repo: 'repo',
          commit: commitId,
          clean: true,
        });
        done();
      })
      .catch(error => done(error));
  });
});