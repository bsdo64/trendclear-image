const request = require('superagent');
const expect = require('chai').expect;
const fs = require('fs');

describe('Image Server > ', function() {
  let app = require('../app.js');
  let options = {
    port: 8080,
    host: 'http://localhost'
  };
  let server;
  let url = options.host + ':' + options.port;

  before(function() {
    server = app.listen(options.port);
  });

  beforeEach(function () {
    server = require('../app.js');
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

        done();
      })
  });

  it('should server get image', function (done) {
    request
      .get(url + '/')
      .end((err, result) => {
        expect(err).to.be.a('error');
        expect(err).not.to.be.a('null');
        expect(result).to.be.a('object');

        done();
      })
  });


  it('should server delete image', function (done) {
    request
      .get(url + '/')
      .end((err, result) => {
        expect(err).to.be.a('error');
        expect(err).not.to.be.a('null');
        expect(result).to.be.a('object');

        done();
      })
  });
});