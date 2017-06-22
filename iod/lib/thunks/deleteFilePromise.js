const { unlink } = require('fs');

module.exports = (realFilePath) => {
  return new Promise((resolve, reject) => {

    return unlink(realFilePath, (err) => {

      if (err) {
        return reject(err);
      }

      return resolve({
        deleted: realFilePath
      })
    });
  })
};
