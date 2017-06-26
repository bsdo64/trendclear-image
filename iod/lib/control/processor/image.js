/**
 * Created by dobyeongsu on 2017. 6. 21..
 */
const sharp = require('sharp');

class Image {
  constructor(options) {
    this.options = options;
    this.sharp = sharp;
  }

  convert(path) {

    const s = this.sharp(path);

    return s.toBuffer({resolveWithObject: true});
  }
}

module.exports = Image;