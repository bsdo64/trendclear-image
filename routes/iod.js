const express = require('express');
const router = express.Router();

const Iod = require('../iod/index.js');

router.get('/:hash', function (req, res) {

  /**
   * 1. Hash check
   * 2. Get image from server
   * 3. Processing image
   * 4. send image
   */
  Iod
    .getLocalImage(req)
    .then(image => {

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
      res.json(err);
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