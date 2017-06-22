const request = require('superagent');
const expect = require('chai').expect;
const Iod = require('../../iod/index');
const fs = require('fs');

describe('IOD Image Server', function() {
  let app = require('../../app.js');
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
  let testFiles;

  before(function() {
    server = app.listen(options.port, () => {})
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

  it('should throw error with not multipart/form-data', function () {
    return request
      .post(url + '/iod/upload')
      .send({hello: 'world'})
      .catch((error) => {

        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.be.equal('Not Found');
      })
  });

  it('should server post image', function () {
    return request
      .post(url + '/iod/upload')
      .type('png')
      .attach('image_file', __dirname + '/test.jpg', 'test.jpg')
      .field('user[name]', 'Tobi')
      .field('user[name]', 'Tobi1')
      .field('user[name]', 'Tobi2')
      .then((result) => {

        expect(result.body).to.be.an('object').that.has.all.keys('files');
        expect(result.body).to.nested.include({'files[0].original_name': 'test.jpg'});

        testFiles = result.body.files;
      })
  });

  it('should server get image', function () {
    const hash = Iod.utils.hash(testFiles[0].name);

    return request
      .get(url + `/iod/${hash}`)
      .query({fn: testFiles[0].name})
      .then((result) => {

        expect(result.body).to.be.an.instanceOf(Buffer);
      })
  });

  it('should server throw error with invalid hash', function () {
    return request
      .get(url + `/iod/__hash__`)
      .query({fn: testFiles[0].name})
      .catch((error) => {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.be.equal("Not Found");
      })
  });

  it('should server delete one image', function () {
    return request
      .delete(url + '/iod/upload')
      .type('form')
      .send({ fn: testFiles[0].name })
      .then((result) => {

        expect(result.body).to.be.a('object');
        expect(result.body.deleted).to.be.a('object').to.have.all.keys(['name', 'original_name']);

      })
  });

  it('should server throw error without fileName', function () {
    return request
      .delete(url + '/iod/upload')
      .type('form')
      .send({ fn: null })
      .catch((result) => {

        expect(result).to.be.an.instanceOf(Error);
        expect(result.message).to.be.equal('Not Found');

      })
  });

  it('should server throw error without fn parameter', function () {
    return request
      .delete(url + '/iod/upload')
      .type('form')
      .catch((result) => {

        expect(result).to.be.an.instanceOf(Error);
        expect(result.message).to.be.equal('Not Found');

      })
  });
});