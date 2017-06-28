const request = require('superagent');

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
        expect(err).not.toBeInstanceOf(Error);
        expect(result.body).toHaveProperty('files');
        expect(result.body.files).toBeInstanceOf(Array);

        testFile = result.body.files[0];
        done();
      })
  });

  it('should server get image', function (done) {
    request
      .get(url + '/uploaded/files/test.jpg')
      .end((err, result) => {
        expect(result.type).toEqual('image/jpeg');

        done();
      })
  });

  it('should server delete image', function (done) {

    request
      .delete(url + '/uploaded/files/')
      .type('form')
      .send({file: testFile.deleteUrl})
      .end((err, result) => {

        expect(err).toBeNull();
        expect(result.body.obj.success).toBe(true);
        done();
      })
  });
});