/**
 * Created by dobyeongsu on 2017. 6. 14..
 */
const conf = require('./config');
const Utils = require('./lib/utils');
const Thunks = require('./lib/thunks/index.js');

class Iod {
  constructor(config) {
    this.config = conf || config;
    this.utils = new Utils(this.config);
    this.thunks = Thunks;
  }

  // Sending processing(ed) image
  async getLocalImage(req) {
    if (!req || !(req && req.query) || !(req && req.query && req.query.fn)) {
      return Promise.reject(new Error('No Req'));
    }

    try {
      const hash = req.params.hash;
      const fileName = req.query.fn;
      const getFilePath = this.utils.getPathWithFileName(fileName);

      await this.utils.hashMatches(hash, fileName);
      const checkFile = await this.utils.checkExistFile(getFilePath);
      const imgProcessing = await this.thunks.imageProcessing(checkFile);

      return imgProcessing;
    } catch (e) {
      throw e;
    }
  }

  // Sending processing(ed) image
  async getLocalImageInfo(req) {
    if (!req || !(req && req.query) || !(req && req.query && req.query.fn)) {
      return Promise.reject(new Error('No Req'));
    }

    try {
      const hash = req.params.hash;
      const fileName = req.query.fn;
      const getFilePath = this.utils.getPathWithFileName(fileName);

      const hashCheck = await this.utils.hashMatches(hash, fileName);
      const checkFile = await this.utils.checkExistFile(getFilePath);
      const imgProcessing = await this.thunks.imageProcessing(checkFile);

      return imgProcessing;
    } catch (e) {
      throw e;
    }
  }

  getRemote() {

  }

  async deleteLocalFile(req) {
    if (!req || !(req && req.body) || !(req && req.body && req.body.fn)) {
      return Promise.reject(new Error('No Req'));
    }

    try {
      const getFilePath = this.utils.getPathWithFileName(req.body.fn);

      const checkFile = await this.utils.checkExistFile(getFilePath);
      return this.thunks.deleteFile(checkFile)
    } catch (e) {
      throw e;
    }
  }

  // Save image and Sending image info
  async postLocal(req) {

    try {

      await Promise.all([
        this.utils.checkExistDir(this.config.formidable.tmpDir),
        this.utils.checkExistDir(this.config.formidable.uploadDir)
      ]);

      const formidableResults = await this.thunks.formidablePromise(req, this.config.formidable);
      const renameFiles = await this.thunks.renameFiles(formidableResults, this.utils, this.config.formidable);
      const summary = await this.thunks.summaryResults(renameFiles);

      return summary
    } catch (e) {
      throw e;
    }
  }
}

module.exports = new Iod();