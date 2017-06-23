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
   * @param {*} newFileName 
   */
  makeSaveFilePath(newFileName) {
    return this.options.formidable.uploadDir + '/' + newFileName;
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
      return new Promise((resolve, reject) => {
        const newFileName = fileInfo.makeHashFileName();
        const newFilePath = this.makeSaveFilePath(newFileName);
        fs.rename(fileInfo.path, newFilePath, (err) => {
          if (err) {
            return reject(err);
          }

          fileInfo.updatePath(newFilePath);
          fileInfo.updateName(newFileName);
          resolve(fileInfo);
        });
      })
    });
    return Promise.all(files)
  }
}

module.exports = File;