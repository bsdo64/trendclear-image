/**
 * Created by dobyeongsu on 2017. 6. 21..
 */
const sharp = require('sharp');

class Image {
  constructor(options) {
    this.options = options;
  }

  sharp(path) {
    return sharp(path)
      .resize(null, null, {
        kernel: sharp.kernel.lanczos2,
        interpolator: sharp.interpolator.nohalo
      })
      .toBuffer({resolveWithObject: true})
  }
}

module.exports = Image;