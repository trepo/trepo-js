module.exports = {
  repo: info => info.repo,
  lastCommit: info => info.commit,
  dirty: info => !info.clean,
};
