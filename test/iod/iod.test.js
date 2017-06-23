const expect = require('chai').expect;
const fs = require('fs');
const express = require('express');
const app = express();
const sinon = require('sinon');
let Iod = require('../../iod/index.js');

describe('Class Iod', () => {
  let server;
  let sandbox,
    stubProcessor, stubCheckExistFile, stubImgSharp, stubParseForm, stubCheckExistDir;

  beforeAll(function (){
    server = app.listen(8080, () => {});
  });

  afterAll(function (){
    server.close();
  });

  beforeEach(()=> {
    sandbox = sinon.sandbox.create();

    stubCheckExistDir = sandbox.stub(Iod.utils, 'checkExistDir');
    stubCheckExistFile = sandbox.stub(Iod.utils, 'checkExistFile');
    stubParseForm = sandbox.stub();
    stubImgSharp = sandbox.stub();
    stubProcessor = sandbox.stub(Iod.Control, 'processor');
    stubProcessor.withArgs('Image').returns({
      sharp: stubImgSharp,
    });
    stubProcessor.withArgs('Request').returns({
      parseForm: stubParseForm,
    });
  });

  afterEach(()=> {
    sandbox.restore();
  });

  describe('Constructor', () => {
    it('should have properties', () => {

      expect(Iod).to.have.property('config');
      expect(Iod).to.have.property('utils');
      expect(Iod).to.have.property('Control');

    });

    it('should have methods', () => {
      expect(Iod).to.have.property('getRemote');

      expect(Iod).to.have.property('getLocalImage');
      expect(Iod).to.have.property('postLocal');
      expect(Iod).to.have.property('deleteLocalFile');
    });
  });

  describe('# postLocal', () => {
    it('should instance of Promise', () => {
      const postLocal = Iod.postLocal();
      return postLocal.catch(e => {
        expect(postLocal).to.be.an.instanceOf(Promise);
        expect(e).to.be.an.instanceOf(Error)
      });
    });

    it('should check exist of file directory', () => {

      return Iod.postLocal().catch(e => {
        expect(stubCheckExistDir.calledTwice).to.be.equal(true);
      })
    });

    it('should throw error with no args', async() => {

      try {
        stubParseForm.rejects(new Error('No Request params'));

        await Iod.postLocal();
      } catch (e) {

        expect(e).to.be.an.instanceOf(Error);
        expect(e.message).to.be.equal('No Request params');
      }
    });
  });

  describe('# getLocalImage', () => {
    let req = { query: { fn: 'test.jpg' }, params: { hash: '1ed0886e' } };
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
      stubCheckExistFile.returns(Promise.resolve(true));

      const getLocal = Iod.getLocalImage(req);
      return getLocal
        .catch(e => {
          expect(e).to.be.an.instanceOf(Error);
          expect(getLocal).to.be.an.instanceOf(Promise);
        })
    });

    it('should throw error without req', function () {

      stubCheckExistFile.returns(Promise.resolve(1));

      return Iod.getLocalImage()
        .catch(result => {
          expect(result).to.be.an.instanceOf(Error);
        })
    });

    it('should throw error without req.query', function () {

      stubCheckExistFile.returns(Promise.resolve(1));

      return Iod.getLocalImage({query: 'test'})
        .catch(result => {
          expect(result).to.be.an.instanceOf(Error);
        })
    });

    it('should return result of buffer image', function () {

      const buff = new Buffer('test');
      stubCheckExistFile.returns(Promise.resolve(1));
      stubImgSharp.resolves(buff);

      return Iod.getLocalImage(req)
        .then(result => {
          expect(result).to.be.an.instanceOf(Buffer);
          expect(result).to.be.equal(buff);
        })
        .catch(e => {
          console.log(e);
          expect(e).to.be.a(null);
        })
    })
  });

  describe('# deleteLocal', () => {
    let req = { body: { fn: 'test.jpg' } };

    it('should instance of Promise', function () {
      stubCheckExistFile.returns(Promise.resolve(true));

      const deleteLocal = Iod.deleteLocalFile(req);

      return deleteLocal
        .catch(e => {
          expect(e.code).to.be.equal('ENOENT');
          expect(deleteLocal).to.be.an.instanceOf(Promise);
        })
    });

    it('should throw error without req', function () {

      const expectedError = new Error('No Req');

      return Iod.deleteLocalFile()
        .catch(result => {
          expect(result).to.be.an.instanceOf(Error);
          expect(result.message).to.be.equal(expectedError.message);
        })
    });
  });
});