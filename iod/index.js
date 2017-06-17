/**
 * Created by dobyeongsu on 2017. 6. 14..
 */
const conf = require('./config');
const Utils = require('./lib/utils');
const sharp = require('sharp');
const Thunks = require('./lib/thunks/index.js');

class Iod {
  constructor(config) {
    this.config = conf || config;
    this.utils = new Utils(this.config);
    this.sharp = sharp;
    this.thunks = Thunks;
  }

  getLocal(req) {
    const getFilePath = this.utils.getPathWithFileName(req.query.fn);

    return this.utils
      .checkExistFile(getFilePath)
      .then(this.thunks.imageProcessing(this.sharp))
      .catch(err => {
        console.log(err);

        throw err;
      });
  }

  getRemote() {

  }

  deleteLocalFile(req) {

    const getFilePath = this.utils.getPathWithFileName(req.body.fn);

    return this.utils
      .checkExistFile(getFilePath)
      .then(this.thunks.deleteFile())
      .catch(err => {
        console.log(err);

        throw err;
      })
  }

  postLocal(req) {
    const checkDir = [
      this.utils.checkExistDir(this.config.formidable.tmpDir),
      this.utils.checkExistDir(this.config.formidable.uploadDir)
    ];

    return Promise.all(checkDir)
      .then(this.thunks.formidablePromise(req, this.config.formidable))
      .then(formidableResults => {

        const files = formidableResults.files.map(file => {
          return this.utils.renameFile(file, this.config.formidable)
        });

        return Promise.all(files)
          .then(files => {

            formidableResults.files = files;

            return formidableResults;
          });
      })
      .catch(err => {
        throw err;
      });
  }
}

module.exports = new Iod();