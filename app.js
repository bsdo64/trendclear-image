const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const logger = require('morgan');
const app = express();

// config the uploader
const options = {
  tmpDir:  __dirname + '/public/uploaded/tmp',
  uploadDir: __dirname + '/public/uploaded/files',
  uploadUrl:  '/uploaded/files/',
  proxy: '/image',
  maxPostSize: 100 * 1024 * 1024,// 100 MB
  minFileSize:  1,
  maxFileSize:  10 * 1024 * 1024, // 10 MB
  acceptFileTypes:  /\.(gif|jpe?g|png|bmp)/i,
  // Files not matched by this regular expression force a download dialog,
  // to prevent executing any scripts in the context of the service domain:
  inlineFileTypes:  /\.(gif|jpe?g|png|bmp)/i,
  imageTypes:  /\.(gif|jpe?g|png|bmp)/i,
  copyImgAsThumb : true, // required
  imageVersions: {
    maxWidth: 200,
    maxHeight: 'auto',
    avatar1: {
      width : 50,
      height : 'auto'
    },
    avatar2: {
      width : 35,
      height : 'auto'
    },
    post: {
      width : 600,
      height : 'auto'
    },
    "large" : {
      width : 600,
      height : 'auto'
    },
    "medium" : {
      width : 300,
      height : 'auto'
    },
    "small" : {
      width : 150,
      height : 'auto'
    }
  },
  accessControl: {
    allowOrigin: '*',
    allowMethods: 'OPTIONS, HEAD, GET, POST, PUT, DELETE',
    allowHeaders: 'Content-Type, Content-Range, Content-Disposition'
  },
  storage : {
    type : 'local'
  }
};

// init the uploader
const uploader = require('./file-uploader')(options);

app.use(compression());
if (process.env.DEV !== 'WHATCHING') {
  app.use(logger('common'));
}
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public', {maxAge: '1d'}));

const IodHandler = require('./routes/iod.js');
app.use('/iod', IodHandler);

app.get('/uploaded', function (req, res) {
  uploader.get(req, res, function (err, obj) {
    if (!err) {
      res.json(obj);
    }
  });
});

app.post('/upload', function (req, res) {
  uploader.post(req, res, function (error, obj) {
    if (!error) {
      return res.json(obj);
    }

    if (error) {
      let errorMessage = '알 수 없는 오류 입니다';
      if (error.message === 'JPEG decoding error') {
        errorMessage = '올바른 JPEG 형식이 아닙니다';
      }

      if (error.message === 'Invalid PNG buffer') {
        errorMessage = '올바른 PNG 형식이 아닙니다';
      }

      if (error.message === 'Data is not in GIF format') {
        errorMessage = '올바른 GIF 형식이 아닙니다';
      }

      if (obj.files && obj.files[0]) {
        uploader.localDelete(obj.files[0], function (err) {
          res.json({
            error: true,
            message: errorMessage,
            localError: err,
            uploaderError: error
          });
        });
      } else {
        res.json({
          error: true,
          message: errorMessage
        });
      }
    }
  });

});

// the path SHOULD match options.uploadUrl
app.delete('/uploaded/files', function (req, res) {
  uploader.delete(req, res, function (err, obj) {
    res.json({error: err, obj: obj});
  });
});

app.use('*', function (req, res) {

  res.status(404).end();
});

module.exports = app;