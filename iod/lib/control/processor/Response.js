/**
 * Created by dobyeongsu on 2017. 6. 21..
 */


class Response {
  constructor(options) {
    this.options = options;
  }

  makeSendJson(fileInfos) {
    const results = {
      files: fileInfos.map(fileInfo => fileInfo.toJSON())
    };
    return results;
  }
}

module.exports = Response;