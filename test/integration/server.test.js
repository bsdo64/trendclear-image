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

  it('should server running at port', function () {
    return request
      .get(url + '/')
      .then((result) => {
        expect(result).toHaveProperty('status');
        expect(result.body.obj.success).toBe(true);
      })
      .catch(err => {
        expect(err).toBeInstanceOf(Error);
      })
  });

  it('should server post a image', function () {
    return request
      .post(url + '/upload')
      .attach('test.jpg', __dirname + '/test.jpg')
      .then(result => {        
        expect(result.body).toHaveProperty('files');
        expect(result.body.files).toBeInstanceOf(Array);

        testFile = result.body.files[0];
      })
      .catch((err) => {
        expect(err).toBeNull();
        expect(err).not.toBeInstanceOf(Error);
      });
  });

  it('should server get image', function () {
    return request
      .get(url + '/uploaded/files/test.jpg')
      .then(result => {
        expect(result.type).toEqual('image/jpeg');
      })
      .catch(err => {
        expect(err).toBeNull();
        expect(err).not.toBeInstanceOf(Error);
      });
  });

  it('should server delete image', function () {

    return request
      .delete(url + '/uploaded/files/')
      .type('form')
      .send({file: testFile.deleteUrl})
      .then(result => {
        expect(result.body.obj.success).toBe(true);
      })
      .catch(err => {
        expect(err).toBeNull();
        expect(err).not.toBeInstanceOf(Error);
      });
  });
});