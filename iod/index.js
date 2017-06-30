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
    if (!req || !(req && req.query) || !(req && req.query && req.query.n)) {
      return Promise.reject(new Error('No Req'));
    }

    try {
      const hash = req.params.hash;
      const fileName = req.query.n;
      const t = req.query.t;
      const getFilePath = this.utils.getPathWithFileName(fileName);

      await this.utils.hashMatches(hash, fileName);
      await this.utils.checkExistFile(getFilePath);

      const [imgP, reqP] = this.Control.processor(['Image', 'Request']);
      const transFormObj = reqP.parseTransformQuery(t);
      const imgProcessing = await imgP.convertImage(getFilePath, transFormObj);
      
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
    if (!req || !(req && req.body) || !(req && req.body && req.body.n)) {
      return Promise.reject(new Error('No Req'));
    }

    try {
      const getFilePath = this.utils.getPathWithFileName(req.body.n);
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

      const [
        fileP, 
        reqP,
        resP,
      ] = this.Control.processor(['File', 'Request', 'Response']);

      const formidableResults = await reqP.parseForm(req);
      const fileInfos = fileP.makeFileInfos(formidableResults.files);
      const newFileInfos = await fileP.initUrls(fileInfos).renameFilesTmpToPublic(fileInfos);

      return await resP.makeSendJson(newFileInfos);

    } catch (e) {
      throw e;
    }
  }
}

module.exports = new Iod();