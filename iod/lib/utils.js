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
    let doesMatch = false;

    doesMatch = doesMatch || (this.config.testHash === hash);
    doesMatch = doesMatch || (this.config.secret.toString().length === 0);
    doesMatch = doesMatch || (this.hash(data) === hash);

    return doesMatch
  }

  parseFileName(filePath) {
    return path.parse(filePath)
  }

  makeFileName(parsedFilePath) {
    return shortId.generate() + parsedFilePath.ext;
  }

  makeSaveFilePath(newFileName, options) {
    return options.uploadDir + '/' + newFileName;
  }

  renameFile(file, options) {
    return new Promise((resolve, reject) => {
      const newFileName = this.makeFileName(this.parseFileName(file.name));

      fs.rename(file.path, this.makeSaveFilePath(newFileName, options), (err) => {
        if (err) {
          return reject(err);
        }

        resolve(newFileName)
      });
    })
  }

  hasImageFile(parsedUrl, cb) {
    return new Promise((resolve, reject) => {
      fs.access(this.getFilePath(parsedUrl), fs.constants.R_OK | fs.constants.W_OK, (err) => {
        if (err) {
          return cb(new Error('File not exist!'));
        }

        return cb(null, true);
      });
    })
  }

  deleteFile(path) {
    return new Promise((resolve, reject) => {
      fs.unlink(path, err => {
        if (err) {
          reject(err)
        }

        resolve();
      })
    })
  }

  checkExistDir(dir) {
    return new Promise((resolve, reject) => {
      fs.stat(dir, function(error, stat) {
        if (error) {
          // System error(maybe)
          if (error.code === 'ENOENT') {
            // No such dir/file
            return mkdirp(dir, function(err) {
              if (err) {
                return reject(err);
              } else {
                console.log('The uploads folder was not present, we have created it for you [' + dir + ']');
                return resolve();
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
          // ok
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