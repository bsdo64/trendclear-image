const request = require('superagent');
const expect = require('chai').expect;
const fs = require('fs');
const Iod = require('../index.js');
const express = require('express');
const app = express();
const sinon = require('sinon');
const formData = require('form-data');

describe('Class Iod', () => {
  let server;

  before(function (){
    server = app.listen(8080);
  });

  after(function (){
    server.close();
  });

  describe('Constructor', () => {

    it('should have properties', () => {

      expect(Iod).to.have.property('config');
      expect(Iod).to.have.property('utils');
      expect(Iod).to.have.property('sharp');
      expect(Iod).to.have.property('thunks');

    });

    it('should have methods', () => {
      expect(Iod).to.have.property('getRemote');

      expect(Iod).to.have.property('getLocal');
      expect(Iod).to.have.property('postLocal');
      expect(Iod).to.have.property('deleteLocalFile');
    });
  });

  describe('# postLocal', () => {
    let postLocal;

    it('should instance of Promise', () => {
      postLocal = Iod.postLocal();

      expect(postLocal).to.be.an.instanceOf(Promise);
    });

    it('should check exist of file directory', () => {
      const stubCheckExistDir = sinon.stub(Iod.utils, 'checkExistDir');

      postLocal = Iod.postLocal();
      expect(stubCheckExistDir.calledTwice).to.be.a.true;

      stubCheckExistDir.restore();
    });

    it('should throw error with no args', function () {
      const expectedError = new Error('No Request');
      const stubFormidable = sinon.stub(Iod.thunks, 'formidablePromise').rejects(expectedError);
      const spy = sinon.spy();

      postLocal = Iod.postLocal();

      return postLocal
        .catch(e => {

          console.log(stubFormidable);

          expect(stubFormidable.called).to.be.a.true;

          stubFormidable.restore();
        })
    });

    it('should return uploaded file info', function () {
      const spyCheckExistDir = sinon.spy(Iod.utils, 'checkExistDir');
      return postLocal
        .then(result => {
          expect(result).to.be.an.instanceof(Object);
        });
    })
  });

  describe('# getLocal', () => {
    let getLocal;

    it('should instance of Promise', function () {
      const req = {
        query: {
          fn: 'test.test'
        }
      };

      getLocal = Iod.getLocal(req);
      expect(getLocal).to.be.an.instanceof(Promise);

    });

    it('should return result of buffer image', function () {
      return getLocal
        .then(result => {
          expect(result).to.be.an.instanceof(Buffer);
        })
    })
  });

});