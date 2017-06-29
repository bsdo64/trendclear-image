/**
 * Created by dobyeongsu on 2017. 6. 21..
 */


class Response {
  constructor(options) {
    this.options = options;
  }

  makeSendJson(fileInfos) {
    return new Promise((resolve, reject) => {
      
      const results = {};

      const files = fileInfos.map(fileInfo => {
        return fileInfo.initMeta();
      });

      return Promise.all(files)
        .then(newFileInfos => {
          results.files = newFileInfos.map(fileInfo => {
            return fileInfo.toJSON();
          });

          return resolve(results);
        })
        .catch(e => {
          reject(e);
        })
    })
  }
}

module.exports = Response;