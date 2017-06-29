const request = require('superagent');
const Iod = require('../../iod/index');

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

  beforeAll(function() {
    server = app.listen(options.port, () => {})
  });

  afterAll(function () {
    server.close();
  });

  it('should server running at port', function () {
    return request
      .get(url)
      .catch((err) => {
        expect(err).toBeInstanceOf(Error);
      });
  });

  it('should throw error with not multipart/form-data', function () {
    return request
      .post(url + '/iod/upload')
      .send({hello: 'world'})
      .catch((error) => {

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual('Not Found');
      })
  });

  it('should throw error with invalid params', function () {
    return request
      .post(url + '/iod/upload')
      .attach('image_file', __dirname + '/test.abc')
      .catch((error) => {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual('Not Found');
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

        expect(result.body).toHaveProperty('files');
        expect(result.body.files[0]).toHaveProperty('original_name', 'test.jpg');

        testFiles = result.body.files;
      });
  });

  it('should server get image', function () {
    const hash = Iod.utils.hash(testFiles[0].name);

    return request
      .get(url + `/iod/${hash}`)
      .query({n: testFiles[0].name})
      .then((result) => {

        expect(result.body).toBeInstanceOf(Buffer);
      })
  });

  it('should server throw error with invalid hash', function () {
    return request
      .get(url + `/iod/__hash__`)
      .query({n: testFiles[0].name})
      .catch((error) => {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual("Not Found");
      })
  });

  it('should server delete one image', function () {
    return request
      .delete(url + '/iod/upload')
      .type('form')
      .send({ n: testFiles[0].name })
      .then((result) => {


        expect(result.body.deleted).toHaveProperty('name');
        expect(result.body.deleted).toHaveProperty('name');

      })
  });

  it('should server throw error without fileName', function () {
    return request
      .delete(url + '/iod/upload')
      .type('form')
      .send({ n: null })
      .catch((result) => {

        expect(result).toBeInstanceOf(Error);
        expect(result.message).toEqual('Not Found');

      })
  });

  it('should server throw error without n parameter', function () {
    return request
      .delete(url + '/iod/upload')
      .type('form')
      .catch((result) => {

        expect(result).toBeInstanceOf(Error);
        expect(result.message).toEqual('Not Found');

      })
  });
});