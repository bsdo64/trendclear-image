const request = require('superagent');
const expect = require('chai').expect;
const fs = require('fs');

describe('IOD Image Server', function() {
  let app = require('../app.js');
  let options = {
    port: 8080,
    host: 'http://localhost',
    formidable: {
      maxFields: 1000,
      maxFieldsSize: 2 * 1024 * 1024,
      keepExtensions: false,
      uploadDir: __dirname + '/tmp',
      encoding: 'utf-8',
      headers: null,
      type: 'multipart',
      multiples: false,
    }
  };
  let server;
  let url = options.host + ':' + options.port;
  let testFiles, testFields;

  before(function() {
    server = app.listen(options.port)
  });

  after(function () {
    server.close();
  });

  it('should server running at port', function () {
    return request
      .get(url)
      .catch((err) => {
        expect(err).to.be.a('error');
      });
  });

  it('should server post image', function () {
    return request
      .post(url + '/iod/upload')
      .attach('image_file', __dirname + '/test.jpg')
      .field('user[name]', 'Tobi')
      .then((result) => {

        expect(result.body).to.have.property('fields');
        expect(result.body).to.have.property('files');

        testFields = result.body.fields;
        testFiles = result.body.files;

      })
  });

  it('should server get image', function () {
    return request
      .get(url + '/iod/hash123')
      .query({fn: testFiles[0]})
      .then((result) => {

        expect(result.body).to.be.an.instanceof(Buffer);
      })
  });

  it('should server delete one image', function () {
    return request
      .delete(url + '/iod/upload')
      .type('form')
      .send({ fn: testFiles[0] })
      .then((result) => {

        expect(result.body).to.be.a('object');
        expect(result.body.deleted).to.be.a('string');

      })
  });
});