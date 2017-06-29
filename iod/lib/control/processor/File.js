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