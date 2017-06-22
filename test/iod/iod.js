const request = require('superagent');
const expect = require('chai').expect;
const fs = require('fs');
const express = require('express');
const app = express();
const sinon = require('sinon');
const formData = require('form-data');

describe('Class Iod', () => {
  let server;

  before(function (){
    server = app.listen(8080, () => {});
  });

  after(function (){
    server.close();
  });

  describe('Constructor', () => {
    let Iod = require('../../iod/index.js');

    it('should have properties', () => {

      expect(Iod).to.have.property('config');
      expect(Iod).to.have.property('utils');
      expect(Iod).to.have.property('thunks');

    });

    it('should have methods', () => {
      expect(Iod).to.have.property('getRemote');

      expect(Iod).to.have.property('getLocalImage');
      expect(Iod).to.have.property('postLocal');
      expect(Iod).to.have.property('deleteLocalFile');
    });
  });

  describe('# postLocal', () => {
    let Iod = require('../../iod/index');
    let sandbox,
      stubRenameFiles, stubFormidable, stubCheckExistDir, stubSummary;

    beforeEach(()=> {
      sandbox = sinon.sandbox.create();

      stubCheckExistDir = sandbox.stub(Iod.utils, 'checkExistDir');
      stubFormidable = sandbox.stub(Iod.thunks, 'formidablePromise');
      stubRenameFiles = sandbox.stub(Iod.thunks, 'renameFiles');
      stubSummary = sandbox.stub(Iod.thunks, 'summaryResults');
    });

    afterEach(()=> {
      sandbox.restore();
    });

    it('should instance of Promise', () => {
      expect(Iod.postLocal()).to.be.an.instanceOf(Promise);
    });

    it('should check exist of file directory', () => {

      return Iod.postLocal().catch(e => {
        expect(stubCheckExistDir.calledTwice).to.be.equal(true);
      })
    });

    it('should throw error with no args', async() => {

      const expectedError = new Error('No Req - fake');
      stubFormidable.returns(Promise.reject(expectedError));

      try {
        await Iod.postLocal();
      } catch (e) {
        expect(stubFormidable.called).to.be.equal(true);
        expect(e).to.be.equal(expectedError);
        sinon.assert.calledWith(stubFormidable, undefined);
      }
    });

    it('should return information about uploaded files', async() => {

      const expected = { files: [ /* {original_filename, public_id, width, height, format, created_at, size, url ..} */] };
      const fakeReq = {};
      const fakeFiles = [];
      stubFormidable.resolves(fakeFiles);
      stubRenameFiles.resolves(fakeFiles);
      stubSummary.resolves(expected);

      try {
        const result = await Iod.postLocal(fakeReq);

        sinon.assert.calledTwice(stubCheckExistDir);

        sinon.assert.calledOnce(stubFormidable);
        sinon.assert.calledWith(stubFormidable, fakeReq, Iod.config.formidable);

        sinon.assert.calledOnce(stubRenameFiles);
        sinon.assert.calledWith(stubRenameFiles, fakeFiles, Iod.utils, Iod.config.formidable);

        sinon.assert.calledOnce(stubSummary);
        sinon.assert.calledWith(stubSummary, fakeFiles);

        expect(result).to.be.equal(expected);
      } catch (err) {
        expect(err).to.be.equal(null);
      }
    });
  });

  describe('# getLocalImage', () => {
    let req = { query: { fn: 'test.jpg' }, params: { hash: '1ed0886e' } };
    let Iod = require('../../iod/index.js');
    let sandbox,
      stubImgProcessing, stubCheckExistFile;

    beforeEach(()=> {
      sandbox = sinon.sandbox.create();

      stubCheckExistFile = sandbox.stub(Iod.utils, 'checkExistFile');
      stubImgProcessing = sandbox.stub(Iod.thunks, 'imageProcessing');
    });

    afterEach(()=> {
      sandbox.restore();
    });

    it('should instance of Promise', function () {
      stubCheckExistFile.returns(Promise.resolve(true));

      expect(Iod.getLocalImage(req)).to.be.an.instanceOf(Promise);
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

      stubCheckExistFile.returns(Promise.resolve(1));
      stubImgProcessing.returns(Promise.resolve(new Buffer('test')));

      return Iod.getLocalImage(req)
        .then(result => {
          expect(result).to.be.an.instanceOf(Buffer);
        })
    })
  });

  describe('# deleteLocal', () => {
    let req = { body: { fn: 'test.jpg' } };
    let Iod = require('../../iod/index.js');
    let sandbox,
      stubDeleteFile, stubCheckExistFile;

    beforeEach(()=> {
      sandbox = sinon.sandbox.create();

      stubCheckExistFile = sandbox.stub(Iod.utils, 'checkExistFile');
      stubDeleteFile = sandbox.stub(Iod.thunks, 'deleteFile');
    });

    afterEach(()=> {
      sandbox.restore();
    });

    it('should instance of Promise', function () {
      stubCheckExistFile.returns(Promise.resolve(true));

      expect(Iod.deleteLocalFile(req)).to.be.an.instanceOf(Promise);
    });

    it('should throw error without req', function () {

      const expectedError = new Error('No Req');

      return Iod.deleteLocalFile()
        .catch(result => {
          expect(result).to.be.an.instanceOf(Error);
          expect(result.message).to.be.equal(expectedError.message);
        })
    });

    it('should return delete message after delete', function () {

      const data = {
        deleted: 'test.jpg'
      };

      stubCheckExistFile.returns(Promise.resolve(true));
      stubDeleteFile.returns(Promise.resolve(data));

      return Iod.deleteLocalFile(req)
        .then(result => {
          expect(result).to.be.an.equal(data);
          expect(result).to.have.property('deleted');
        })
    });
  });
});