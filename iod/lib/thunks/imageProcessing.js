/**
 * Created by dobyeongsu on 2017. 6. 15..
 */
const sharp = require('sharp');
const sample = {
  "public_id": "eneivicys42bq5f2jpn2",
  "version": 1473596672,
  "signature": "abcdefghijklmnopqrstuvwxyz12345",
  "width": 1000,
  "height": 672,
  "access_mode": "public",
  "format": "jpg",
  "resource_type": "image",
  "created_at": "2016-09-11T12:24:32Z",
  "bytes": 350749,
  "type": "upload",
  "etag": "5297bd123ad4ddad723483c176e35f6e",
  "url": "http://res.cloudinary.com/demo/image/upload/v1473596672/eneivicys42bq5f2jpn2.jpg",
  "secure_url": "https://res.cloudinary.com/demo/image/upload/v1473596672/eneivicys42bq5f2jpn2.jpg",
  "original_filename": "sample"
};

module.exports = (realFilePath) => {
  if (!realFilePath) {
    return Promise.reject('File not exist!');
  }

  return sharp(realFilePath)
    .resize(null, null, {
      kernel: sharp.kernel.lanczos2,
      interpolator: sharp.interpolator.nohalo
    })
    .toBuffer({resolveWithObject: true})
};