/**
 * Created by dobyeongsu on 2017. 6. 14..
 */
const conf = require('./config');
const Utils = require('./lib/utils');
const Control = require('./lib/control/index.js');
const FileInfo = require('./lib/fileInfo');

class Iod {
  constructor() {
    this.config = conf;
    this.utils = new Utils(this.config);
    this.Control = Control(this.config);
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
      await this.utils.checkExistFile(getFilePath);

      const imgProcessing = await this.Control.processor('Image').convert(getFilePath);

      return imgProcessing;
    } catch (e) {
      throw e;
    }
  }

  // // Sending processing(ed) image
  // async getLocalImageInfo() {

  // }

  // async getRemote() {

  // }

  async deleteLocalFile(req) {
    if (!req || !(req && req.body) || !(req && req.body && req.body.fn)) {
      return Promise.reject(new Error('No Req'));
    }

    try {
      const getFilePath = this.utils.getPathWithFileName(req.body.fn);
      await this.utils.checkExistFile(getFilePath);
      const fileInfo = new FileInfo(getFilePath);
      const newFile = await fileInfo.deleteFile();

      return {
        deleted: newFile
      };
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

      const fileProcessor = this.Control.processor('File');
      const requestProcessor = this.Control.processor('Request');

      const formidableResults = await requestProcessor.parseForm(req);
      const fileInfos = fileProcessor.makeFileInfos(formidableResults.files);
      const newFileInfos = await fileProcessor.renameFilesTmpToPublic(fileInfos);

      const results = {};
      results.files = newFileInfos.map(fileInfo => fileInfo.toJSON());

      return results;

    } catch (e) {
      throw e;
    }
  }
}

module.exports = new Iod();