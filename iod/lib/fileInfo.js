/**
 * Created by dobyeongsu on 2017. 6. 20..
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const shortId = require('shortid');

class FileInfo {
  constructor(file) {
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

  renameFile(newPath) {
    return new Promise((resolve, reject) => {
      fs.rename(this.path, newPath, (err) => {
        if (err) {
          return reject(err);
        }

        this.path = newPath;
        this.sharp = sharp(newPath);

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
    return {
      size: this.size,
      path: this.path,
      name: this.name,
      type: this.type,
      mtime: this.mtime,
      original_name: this.original_name,
    }
  }
}

module.exports = FileInfo;