/**
 * Created by dobyeongsu on 2017. 6. 21..
 */
const fs = require('fs');

const r = fs.readdirSync(__dirname + '/processor');

r.map(v => {
  let fileName = v.slice(0, v.length - 3);
  let upperFileName = fileName.charAt(0).toUpperCase() + fileName.slice(1);;

  console.log(1);

  module.exports[upperFileName]
      = Control[upperFileName]
      = require('./processor/' + fileName + '.js');
});

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
