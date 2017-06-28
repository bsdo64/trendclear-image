/**
 * Created by dobyeongsu on 2017. 6. 21..
 */
const sharp = require('sharp');

class Image {
  constructor(options) {
    this.options = options;
    this.sharp = sharp;
  }

  convertImage(path, transform = {}) {
    const s = this.sharp(path);

    console.log(transform);

    if (transform.w) {

    }

    return s.toBuffer({resolveWithObject: true});
  }
}

module.exports = Image;