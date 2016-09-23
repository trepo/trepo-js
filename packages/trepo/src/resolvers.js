module.exports = {
  Query: {
    info: require('./query/info.js'),
  },
  Mutation: {
    commit: require('./mutation/commit.js'),
  },
  Info: require('./type/Info.js'),
  Commit: require('./type/Commit.js'),
};
