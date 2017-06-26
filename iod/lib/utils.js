const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const mkdirp  = require('mkdirp');

class Utils {
  constructor(config) {
    this.config = config;
    this.mkdir = mkdirp;
  }

  hash(s) {
    return crypto.createHash('md5').update(s + this.config.secret).digest("hex").slice(0,8)
  }

  hashMatches(hash, data) {
    return new Promise((resolve, reject) => {
      let doesMatch = false;

      doesMatch = doesMatch || (this.config.testHash === hash);
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
      fs.stat(dir, (error, stat) => {
        /* istanbul ignore else*/
        if (error) {
          // System error(maybe)
          if (error.code === 'ENOENT') {
            // No such dir
            return this.mkdir(dir, function(err, resultDir) {
              if (err) {
                // EACCESS
                return reject(err);
              } else {
                /* istanbul ignore else*/
                if (resultDir) {
                  //dir not exist and made it
                  console.log('The uploads folder was not present, we have created it for you [' + dir + ']');
                }

                return resolve(dir);
              }
            });
          }
          
          let err;
          /* istanbul ignore else*/
          if (error.name === 'TypeError') {
            err = new Error('file not exist!');
          }

          err = error;
          return reject(err);

        } else if (stat && stat.isFile()) {
          // dir is file
          return reject(new Error('argument is exist file. Please check ' + dir));
        } else if (stat && stat.isDirectory()) {
          // ok
          return resolve();
        }
      });
    });
  }

  checkExistFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.stat(filePath, function(error, stat) {
        /* istanbul ignore else*/
        if (error) {
          let err;

          if (error.code === 'ENOENT') {
            err = new Error('file not exist!');
          }

          if (error.name === 'TypeError') {
            err = new Error('file not exist!');
          }

          return reject(err);
        } else if (stat && stat.isFile()) {
          // dir is file
          return resolve(filePath);
        } else if (stat && stat.isDirectory()) {
          return reject(new Error('It is directory. check file path'));
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