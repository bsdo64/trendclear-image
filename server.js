var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var app = express();

// config the uploader
var options = {
  tmpDir:  __dirname + '/public/uploaded/tmp',
  uploadDir: __dirname + '/public/uploaded/files',
  uploadUrl:  '/uploaded/files/',
  proxy: '/image',
  maxPostSize: 11000000000, // 11 GB
  minFileSize:  1,
  maxFileSize:  10000000000, // 10 GB
  acceptFileTypes:  /.+/i,
  // Files not matched by this regular expression force a download dialog,
  // to prevent executing any scripts in the context of the service domain:
  inlineFileTypes:  /\.(gif|jpe?g|png)/i,
  imageTypes:  /\.(gif|jpe?g|png)/i,
  copyImgAsThumb : true, // required
  imageVersions: {
    maxWidth: 200,
    maxHeight: 'auto',
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
var uploader = require('./file-uploader')(options);

app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.get('/uploaded', function (req, res) {
  uploader.get(req, res, function (err, obj) {
    if (!err) {
      res.json(obj);
    }
  });

});

app.post('/upload', function (req, res) {
  uploader.post(req, res, function (error, obj, redirect) {
    if (!error) {
      res.json(obj);
    }
  });

});

// the path SHOULD match options.uploadUrl
app.delete('/uploaded/files', function (req, res) {
  uploader.delete(req, res, function (err, obj) {
    res.json({error: err, obj: obj});
  });
});

app.listen(3002);