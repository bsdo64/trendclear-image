/**
 * Created by dobyeongsu on 2017. 6. 21..
 */
const Image = require('./processor/image.js');
const Request = require('./processor/request.js');
const Response = require('./processor/response.js');
const File = require('./processor/file.js');

function Control(options) {

  if (!(this instanceof Control)) {
    return new Control(options);
  }

  this.options = options;
}

Control.prototype.processor = function(type) {
  return new Control[type](this.options);
};

module.exports = Control;
module.exports.Image = Control.Image = Image;
module.exports.Request = Control.Request = Request;
module.exports.Response = Control.Response = Response;
module.exports.File = Control.File = File;