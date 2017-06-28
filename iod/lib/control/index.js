/**
 * Created by dobyeongsu on 2017. 6. 21..
 */
module.exports.Image = Control.Image = require('./processor/Image.js');
module.exports.File = Control.File = require('./processor/File.js');
module.exports.Request = Control.Request = require('./processor/Request.js');
module.exports.Response = Control.Response = require('./processor/Response.js');

function Control(options) {

  if (!(this instanceof Control)) {
    return new Control(options);
  }

  this.options = options;
}

Control.prototype.processor = function(type) {
  if (Array.isArray(type)) {

    return type.reduce((a, b) => {
      a.push(new Control[b](this.options));
      return a;
    }, []);
  }

  return new Control[type](this.options);
};

module.exports = Control;
