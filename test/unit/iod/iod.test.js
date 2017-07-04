const express = require('express');
const app = express();
const FileInfo = require('../../../iod/lib/fileInfo.js')
let Iod = require('../../../iod/index.js');

describe('Class Iod', () => {
  let server;
  let stubProcessor, stubHashMatchs, stubCheckExistFile, stubConverImg, 
      stubParseForm, stubCheckExistDir, stubTransFormQuery, stubFileInfoDelete;

  beforeAll(() => {
    server = app.listen(8080, () => {});
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(()=> {
    stubCheckExistDir = jest.spyOn(Iod.utils, 'checkExistDir');
    stubCheckExistFile = jest.spyOn(Iod.utils, 'checkExistFile');
    stubHashMatchs = jest.spyOn(Iod.utils, 'hashMatches');
    stubParseForm = jest.fn();
    stubTransFormQuery = jest.fn().mockImplementation(() => {});
    stubConverImg = jest.fn();
    stubFileInfoDelete = jest.spyOn(FileInfo.prototype, 'deleteFile');
    stubProcessor = jest.spyOn(Iod.Control, 'processor');
    stubProcessor.mockImplementation((name) => {
      const self = this;

      this.File = {
        initUrls: jest.fn(() => self.File),
        renameFilesTmpToPublic: jest.fn(() => Promise.resolve()),
        makeFileInfos: jest.fn(),
      };
      this.Image = {
        convertImage: stubConverImg
      };
      this.Request = {
        parseForm: stubParseForm,
        parseTransformQuery: stubTransFormQuery,
      };
      this.Response = {
        makeSendJson: jest.fn(() => ({the: 'response'})),
      };

      if (Array.isArray(name)) {
        return name.map(v => this[v])
      }

      return this[name];
    });
  });

  afterEach(()=> {
    stubProcessor.mockRestore();
    stubCheckExistDir.mockRestore();
    stubCheckExistFile.mockRestore();
    stubHashMatchs.mockRestore();
    stubFileInfoDelete.mockRestore();
  });

  describe('Constructor', () => {
    it('should have properties', () => {

      expect(Iod).toHaveProperty('config');
      expect(Iod).toHaveProperty('utils');
      expect(Iod).toHaveProperty('Control');

    });

    it('should have methods', () => {

      expect(Iod).hasOwnProperty('getLocalImage');
      expect(Iod).hasOwnProperty('postLocal');
      expect(Iod).hasOwnProperty('deleteLocalFile');
    });
  });

  describe('# postLocal', () => {
    it('should instance of Promise', () => {
      const postLocal = Iod.postLocal();
      return postLocal.catch(e => {
        expect(postLocal).toBeInstanceOf(Promise);
        expect(e).toBeInstanceOf(Error)
      });
    });

    it('should check exist of file directory', () => {
      return Iod.postLocal().catch((e) => {
        expect(e).toBeInstanceOf(Error);
        expect(stubCheckExistDir).toHaveBeenCalledTimes(2);
      })
    });

    it('should throw error with no args', () => {
      stubParseForm.mockImplementation(() => Promise.reject(new Error('No Request params')));

      return Iod.postLocal()
        .catch(err => {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toEqual('No Request params');
        })
    });

    it('should return json results', () => {
      
      stubCheckExistDir.mockImplementation(() => Promise.resolve());
      stubParseForm.mockImplementation(() => Promise.resolve({files: ['/path1', '/path2']}));

      return Iod.postLocal({})
        .then(r => {
          expect(r).toEqual({the: 'response'});
        })
        .catch(err => {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toEqual('No Request params');
        })
    });
  });

  describe('# getLocalImage', () => {
    let req = { query: { n: 'test.jpg' }, params: { hash: '1ed0886e' } };
    const sample = {
      "public_id": "eneivicys42bq5f2jpn2",
      "version": 1473596672,
      "signature": "abcdefghijklmnopqrstuvwxyz12345",
      "width": 1000,
      "height": 672,
      "access_mode": "public",
      "format": "jpg",
      "resource_type": "image",
      "created_at": "2016-09-11T12:24:32Z",
      "bytes": 350749,
      "type": "upload",
      "etag": "5297bd123ad4ddad723483c176e35f6e",
      "url": "http://res.cloudinary.com/demo/image/upload/v1473596672/eneivicys42bq5f2jpn2.jpg",
      "secure_url": "https://res.cloudinary.com/demo/image/upload/v1473596672/eneivicys42bq5f2jpn2.jpg",
      "original_filename": "sample"
    };

    it('should instance of Promise', function () {
      stubCheckExistFile.mockImplementation(() => (Promise.resolve(true)));

      const getLocal = Iod.getLocalImage(req);
      return getLocal
        .catch(e => {
          expect(e).toBeInstanceOf(Error);
          expect(getLocal).toBeInstanceOf(Promise);
        })
    });

    it('should throw error without req', function () {

      stubCheckExistFile.mockImplementation(() => (Promise.resolve(1)));

      return Iod.getLocalImage()
        .catch(result => {
          expect(result).toBeInstanceOf(Error);
        })
    });

    it('should throw error without req.query', function () {

      stubCheckExistFile.mockImplementation(() => (Promise.resolve(1)));

      return Iod.getLocalImage({query: 'test'})
        .catch(result => {
          expect(result).toBeInstanceOf(Error);
        })
    });

    it('should throw error hash not match', function () {

      const expectError =  new Error("Hash doesn't match");
      stubHashMatchs.mockImplementation(() => (Promise.reject(expectError)));

      return Iod.getLocalImage(req)
        .catch(e => {
          expect(e).toEqual(expectError);
        })
    });

    it('should return result of buffer image', function () {

      const buff = new Buffer('test');
      stubCheckExistFile.mockImplementation(() => (Promise.resolve(1)));
      stubConverImg.mockImplementation(() => (Promise.resolve(buff)));

      return Iod.getLocalImage(req)
        .then(result => {
          expect(result).toBeInstanceOf(Buffer);
          expect(result).toEqual(buff);
        })
        .catch(e => {
          console.log(e);
          expect(e).toBeNull();
        })
    });
  });

  describe('# deleteLocal', () => {
    let req = { body: { n: 'test.jpg' } };

    it('should instance of Promise', function () {
      stubCheckExistFile.mockImplementation(() => (Promise.resolve(true)));

      const deleteLocal = Iod.deleteLocalFile(req);

      return deleteLocal
        .catch(e => {
          expect(e.code).toEqual('ENOENT');
          expect(deleteLocal).toBeInstanceOf(Promise);
        })
    });

    it('should throw error without req', function () {

      const expectedError = new Error('No Req');

      return Iod.deleteLocalFile()
        .catch(result => {
          expect(result).toBeInstanceOf(Error);
          expect(result.message).toEqual(expectedError.message);
        })
    });

    it('should return deleted file', function () {

      const expectResult = { name: 'fileName', };
      stubCheckExistFile.mockImplementation(() => Promise.resolve());
      stubFileInfoDelete.mockImplementation(() => expectResult);

      return Iod.deleteLocalFile(req)
        .then(r => {
          expect(r.deleted).toEqual(expectResult);
        })
        .catch(err => {
          expect(err).toBeNull();
        })
    });
  });
});