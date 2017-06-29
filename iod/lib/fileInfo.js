/**
 * Created by dobyeongsu on 2017. 6. 20..
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const shortId = require('shortid');

class FileInfo {
  constructor(file) {
    /* istanbul ignore else*/
    if (typeof file === 'string') {
      this.path = file;
      this.original_name = this.name = path.basename(this.path);

    } else if (typeof file === 'object') {
      const json = file.toJSON();
      for(let prop in json) {
        if (json.hasOwnProperty(prop)) {
          this[prop] = json[prop];
        }
      }

      this.original_name = this.name;
    }

    this.sharp = sharp(this.path);
  }

  initMeta() {
    return this.sharp
      .metadata()
      .then(metaData => {

        Object.keys(metaData).map(key => this[key] = metaData[key]);

        return this;
      })
  }

  makeSaveFilePath(uploadDir, newFileName) {
    return uploadDir + '/' + newFileName;
  }

  renameFile(uploadDir) {
    return new Promise((resolve, reject) => {
      const newFileName = this.makeHashFileName();
      const newFilePath = this.makeSaveFilePath(uploadDir, newFileName);

      fs.rename(this.path, newFilePath, (err) => {
        if (err) {
          return reject(err);
        }

        this.updatePath(newFilePath);
        this.updateName(newFileName);
        this.sharp = sharp(newFilePath);

        resolve(this);
      });
    })
  }

  deleteFile() {
    return new Promise((resolve, reject) => {
      fs.unlink(this.path, (err) => {
        if (err) {
          return reject(err);
        }
        

        this.deleted = true;
        this.path = undefined;
        this.name = this.original_name;

        resolve(this);
      });
    })
  }

  makeHashFileName() {
    return shortId.generate() + path.extname(this.name);
  }

  updatePath(newPath) {
    this.path = newPath;
  }

  updateName(newName) {
    this.name = newName;
  }

  toJSON() {
    delete this.path;
    delete this.sharp;

    return Object.keys(this).reduce((obj, val)=> {
      obj[val] = this[val];
      return obj
    }, {});
  }
}

module.exports = FileInfo;