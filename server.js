var express = require('express');
var app = express();

// config the uploader
var options = {
  tmpDir:  __dirname + '/public/uploaded/tmp',
  uploadDir: __dirname + '/public/uploaded/files',
  uploadUrl:  '/uploaded/files/',
  maxPostSize: 11000000000, // 11 GB
  minFileSize:  1,
  maxFileSize:  10000000000, // 10 GB
  acceptFileTypes:  /.+/i,
  // Files not matched by this regular expression force a download dialog,
  // to prevent executing any scripts in the context of the service domain:
  inlineFileTypes:  /\.(gif|jpe?g|png)/i,
  imageTypes:  /\.(gif|jpe?g|png)/i,
  copyImgAsThumb : true, // required
  imageVersions :{
    maxWidth : 200,
    maxHeight : 200
  },
  accessControl: {
    allowOrigin: '*',
    allowMethods: 'OPTIONS, HEAD, GET, POST, PUT, DELETE',
    allowHeaders: 'Content-Type, Content-Range, Content-Disposition'
  },
  storage : {
    type : 'local',
    aws : {
      accessKeyId :  'xxxxxxxxxxxxxxxxx',
      secretAccessKey : 'xxxxxxxxxxxxxxxxx',
      region : 'us-east-1',//make sure you know the region, else leave this option out
      bucketName : 'xxxxxxxxxxxxxxxxx'
    }
  }
};

// init the uploader
var uploader = require('blueimp-file-upload-expressjs')(options);

app.use(express.static('public'));

app.get('/upload', function (req, res) {
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
app.delete('/uploaded/files/:name', function (req, res) {
  uploader.delete(req, res, function (err, obj) {
    res.json({error: err});
  });
});

app.listen(3002);