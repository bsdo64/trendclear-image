const request = require('superagent');
const expect = require('chai').expect;
const fs = require('fs');
const { URL } = require('url');

describe('Image Server (deprecated) ', function() {
  let app = require('../app.js');
  let options = {
    port: 8080,
    host: 'http://localhost'
  };
  let server;
  let url = options.host + ':' + options.port;
  let testFile;

  before(function() {
    server = app.listen(options.port);
  });

  after(function () {
    server.close();
  });

  it('should server running at port', function (done) {
    request
      .get(url + '/')
      .end((err, result) => {
        expect(err).to.be.a('error');
        expect(err).not.to.be.a('null');
        expect(result).to.be.a('object');

        done();
      })
  });

  it('should server post a image', function (done) {
    request
      .post(url + '/upload')
      .attach('test.jpg', __dirname + '/test.jpg')
      .end((err, result) => {
        expect(err).not.to.be.an('error');

        expect(result).to.be.a('object');
        expect(result.body).have.property('files');
        expect(result.body.files).to.be.an.instanceof(Array);

        testFile = result.body.files[0];
        done();
      })
  });

  it('should server get image', function (done) {
    request
      .get(url + '/uploaded/files/test.jpg')
      .end((err, result) => {
        expect(result.type).to.equal('image/jpeg');

        done();
      })
  });

  it('should server delete image', function (done) {

    request
      .delete(url + '/uploaded/files/')
      .type('form')
      .send({file: testFile.deleteUrl})
      .end((err, result) => {
        expect(err).to.be.null;

        expect(result).to.be.a('object');
        expect(result.body.obj.success).to.be.true;

        done();
      })
  });
});