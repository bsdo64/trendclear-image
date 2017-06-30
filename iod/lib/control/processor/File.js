/**
 * Created by dobyeongsu on 2017. 6. 21..
 */
const fs = require('fs');
const FileInfo = require('../../fileInfo');

/**
 * Class File
 * 
 * @Class File
 */
class File {
  constructor(options) {
    this.options = options;
  }

  initUrls(fileInfos) {
    return fileInfos.map(fileInfo => {
      const url = this.options.server.publicUrl + 
                  '/' + 
                  fileInfo.hash(fileInfo.get('name'), this.options.secret) + 
                  '?n=' + 
                  fileInfo.get('name');

      return fileInfo.set('url', url);
    });
  }
  /**
   * 
   * @param {*} files 
   */
  makeFileInfos(files) {
    return files.map(file => new FileInfo(file));
  }

  renameFilesTmpToPublic(fileInfos) {
    const files = fileInfos.map(fileInfo => {
      return fileInfo.renameFile(this.options.formidable.uploadDir);
    });
    return Promise.all(files)
  }
}

module.exports = File;