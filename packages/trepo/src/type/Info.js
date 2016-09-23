module.exports = {
  repo(info) {
    return info.repo;
  },
  lastCommit(info) {
    return info.lastCommit;
  },
  dirty(info) {
    return info.dirty;
  },
};
