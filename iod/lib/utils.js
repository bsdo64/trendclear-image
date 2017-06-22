const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const mkdirp  = require('mkdirp');
const shortId = require('shortid');

class Utils {
  constructor(config) {
    this.config = config
  }

  hash(s) {
    return crypto.createHash('md5').update(s + this.config.secret).digest("hex").slice(0,8)
  }

  hashMatches(hash, data) {
    return new Promise((resolve, reject) => {
      let doesMatch = false;

      doesMatch = doesMatch || (this.config.testHash === hash);
      doesMatch = doesMatch || (this.config.secret.toString().length === 0);
      doesMatch = doesMatch || (this.hash(data) === hash);

      if (doesMatch) {
        return resolve(true);
      } else {
        return reject(new Error("Hash doesn't match"))
      }
    })
  }

  parseFileName(filePath) {
    return path.parse(filePath)
  }

  checkExistDir(dir) {
    return new Promise((resolve, reject) => {
      fs.stat(dir, function(error, stat) {
        if (error) {
          // System error(maybe)
          if (error.code === 'ENOENT') {
            // No such dir
            return mkdirp(dir, function(err, resultDir) {
              if (err) {
                return reject(err);
              } else {
                if (resultDir) {
                  console.log('The uploads folder was not present, we have created it for you [' + dir + ']');
                }

                return resolve(dir);
              }
            });
          } else {
            return reject(error);
          }

        } else if (stat && stat.isFile()) {
          // dir is file
          return reject(new Error('argument is exist file. Please check ' + dir));
        } else if (stat && stat.isDirectory()) {
          // ok
          return resolve();
        } else {
          return reject('Unknown error');
        }
      });
    });
  }

  checkExistFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.stat(filePath, function(error, stat) {
        if (error) {
          // System error(maybe)
          return reject(error);
        } else if (stat && stat.isFile()) {
          // dir is file
          return resolve(filePath);
        } else if (stat && stat.isDirectory()) {
          return reject('It is directory. check file path');
        } else {
          return reject('Unknown error');
        }
      });
    });
  }

  getPathWithFileName(fileName) {
    const parsed = this.parseFileName(fileName);

    return path.resolve(this.config.formidable.uploadDir, parsed.base);
  }
}

module.exports = Utils;