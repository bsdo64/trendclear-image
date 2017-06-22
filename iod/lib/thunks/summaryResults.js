const fileInfo = require('../fileInfo');

const f = (filePaths) => {
  const results = {};
  results.files = filePaths;

  return results;
};

module.exports = f;