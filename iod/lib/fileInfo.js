/**
 * Created by dobyeongsu on 2017. 6. 20..
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class FileInfo {
  constructor(filePath) {
    this.filePath = filePath;
  }

  initMeta() {
    return sharp(this.filePath)
      .metadata()
      .then(metaData => {

        Object.keys(metaData).map(key => {
          if (metaData.hasOwnProperty(key)) {
            this[key] = metaData[key];
          }
        });

        return this;
      })
  }

  renameFile(newPath) {
    return new Promise((resolve, reject) => {
      fs.rename(this.filePath, newPath, (err) => {
        if (err) {
          return reject(err);
        }

        this.filePath = newPath;
        resolve(this);
      });
    })
  }

  deleteFile() {
    return new Promise((resolve, reject) => {
      fs.unlink(this.filePath, (err) => {
        if (err) {
          return reject(err);
        }

        this.deleted = true;
        this.filePath = null;
        resolve(this);
      });
    })
  }
}

module.exports = FileInfo;