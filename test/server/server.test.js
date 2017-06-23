const request = require('superagent');
const exp = require('chai').expect;
const fs = require('fs');
const { URL } = require('url');

describe('Image Server (deprecated) ', function() {
  let app = require('../../app.js');
  let options = {
    port: 8080,
    host: 'http://localhost'
  };
  let server;
  let url = options.host + ':' + options.port;
  let testFile;

  beforeAll(function() {
    server = app.listen(options.port, () => {});
  });

  afterAll(function () {
    server.close();
  });

  it('should server running at port', function (done) {
    request
      .get(url + '/')
      .end((err, result) => {
        exp(err).to.be.a('error');
        exp(err).not.to.be.a('null');
        exp(result).to.be.a('object');

        expect(err).toBeInstanceOf(Error);
        expect(err).not.toBeNull();
        expect(result).toHaveProperty('status');

        done();
      })
  });

  it('should server post a image', function (done) {
    request
      .post(url + '/upload')
      .attach('test.jpg', __dirname + '/test.jpg')
      .end((err, result) => {
        exp(err).not.to.be.an('error');

        exp(result).to.be.a('object');
        exp(result.body).have.property('files');
        exp(result.body.files).to.be.an.instanceof(Array);

        testFile = result.body.files[0];
        done();
      })
  });

  it('should server get image', function (done) {
    request
      .get(url + '/uploaded/files/test.jpg')
      .end((err, result) => {
        exp(result.type).to.equal('image/jpeg');

        done();
      })
  });

  it('should server delete image', function (done) {

    request
      .delete(url + '/uploaded/files/')
      .type('form')
      .send({file: testFile.deleteUrl})
      .end((err, result) => {
        exp(err).to.be.null;

        exp(result).to.be.a('object');
        exp(result.body.obj.success).to.be.true;

        done();
      })
  });
});