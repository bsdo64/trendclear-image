const express = require('express');
const router = express.Router();

const Iod = require('../iod/index.js');
const LRU = require('lru-cache');
const cache = LRU({
  max: 500
});

router.get('/:hash', function (req, res) {

  let image = cache.get(req.url);
  if (image) {
    res.type(image.info.format);
    return res.send(image.data);
  }
  /**
   * 1. Hash check
   * 2. Get image from server
   * 3. Processing image
   * 4. send image
   */
  Iod
    .getLocalImage(req)
    .then(image => {
      cache.set(req.url, image);
      res.type(image.info.format);
      res.send(image.data);
    })
    .catch(err => {
      res.status(404).end();
    });
});

router.post('/upload', function (req, res) {

  if (!req.is('multipart')) {
    return res.status(404).send();
  }

  Iod
    .postLocal(req)
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      res.status(404).end();
    })
});

router.delete('/upload', function (req, res) {
  Iod
    .deleteLocalFile(req)
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      res.status(404).json(err);
    })
});

// router.get('/remote/:hash', function (req, res) {

//   Iod.getRemote(req, res, function (err, obj) {
//     if (!err) {
//       res.json(obj);
//     }
//   });
// });

module.exports = router;