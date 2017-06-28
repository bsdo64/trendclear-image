/**
 * Created by dobyeongsu on 2017. 6. 21..
 */
const sharp = require('sharp');

class Image {
  constructor(options) {
    this.options = options;
    this.sharp = sharp;
  }

  _parseTransform(transform, meta) {
    if (transform.c) {
      const aspectRatio = meta.width / meta.height;

      if (transform.c.fit) {

        if (transform.w && transform.h) {
          const reqAR = transform.w / transform.h;
          
          if (reqAR > aspectRatio) {
            transform.w = null;
          } else {
            transform.h = null;
          }
        }
      }

      if (transform.c.limit) {
        if (transform.w && transform.h) {
          const reqAR = transform.w / transform.h;
          
          if (reqAR > aspectRatio) {
            transform.w = null;
            
            if (transform.h > meta.height) {
              transform.h = meta.height
            }

          } else {
            transform.h = null;
            
            if (transform.w > meta.width) {
              transform.w = meta.width
            }
          }
        } else if (transform.w && !transform.h) {
          if (transform.w > meta.width) {
            transform.w = meta.width
          }
        } else if (!transform.w && transform.h) {
          if (transform.h > meta.height) {
            transform.h = meta.height
          }
        }
      }
    }
    
    return transform;
  }

  async convertImage(path, transform = {}) {
    let s = this.sharp(path);
    const meta = await s.metadata();
    const parseT = this._parseTransform(transform, meta);

    s = s.resize(parseT.w, parseT.h);

    if (!transform.c && transform.w && transform.h) {
      s = s.ignoreAspectRatio();
    }

    return s.toBuffer({resolveWithObject: true});
  }
}

module.exports = Image;