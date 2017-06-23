const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');
const sinon = require('sinon');
const config = require('../../iod/config');
const Utils = require('../../iod/lib/utils');
const crypto = require('crypto');
const mkdirp = require('mkdirp');

describe('Class Utils', () => {
  const utils = new Utils(config);
  let sandbox,
    stubFsStat, stubMkdirp;

  beforeEach(()=> {
    sandbox = sinon.sandbox.create();

    stubFsStat = sandbox.stub(fs, 'stat');
    stubMkdirp = sandbox.stub(utils, 'mkdir');
  });

  afterEach(()=> {
    sandbox.restore();
  });

  describe('Constructor', () => {
    it('should have properties', () => {

      expect(utils).to.have.property('config');
    });

    it('should have methods', () => {
      expect(utils).to.have.property('hash');
      expect(utils).to.have.property('hashMatches');
      expect(utils).to.have.property('parseFileName');
      expect(utils).to.have.property('checkExistDir');
      expect(utils).to.have.property('checkExistFile');
      expect(utils).to.have.property('getPathWithFileName');
    });
  });

  describe('# hash', () => {
    it('should return hashs with string', () => {
      const hashString = utils.hash('someString');
      expect(hashString).to.have.lengthOf(8);
    });
  });

  describe('# hashMatches', () => {
    it('should return true when hash match', () => {
      const expectHash = utils.hash('someString');
      return utils.hashMatches(expectHash, 'someString')
        .then(result => {
          expect(result).to.be.equal(true);
        })
        .catch(e => {
          console.log(e);
          expect(e).to.be.equal(null);
        })
    });

    it('should throw error when hash doesn`t match', () => {
      const expectHash = utils.hash('notmatch');
      return utils.hashMatches(expectHash, 'someString')
        .then(result => {
          expect(result).to.be.equal(null);
        })
        .catch(e => {
          expect(e).to.be.an.instanceOf(Error);
        })
    });
  });

  describe('# parseFileName', () => {
    it('should return obj parsed path', () => {
      const expectPath = path.parse('/path/to/file.ext');
      const parsed = utils.parseFileName('/path/to/file.ext');
      expect(parsed).to.deep.equal(expectPath);
    });
  });

  describe('# checkExistDir', () => {
    it('should return dir path if dir not exist', () => {

      stubFsStat.yields({ code: 'ENOENT' }, null);
      stubMkdirp.yields(null, null);

      return utils.checkExistDir('/path/to/file.ext')
        .then(r => {
          expect(r).to.be.equal('/path/to/file.ext');
        });
    });

    it('should throw error if don`t have access permission', () => {

      stubFsStat.yields({ code: 'ENOENT' }, null);
      stubMkdirp.yields({ code: 'EACCESS' }, null);

      return utils.checkExistDir('/path/to/file.ext')
        .catch(e => {
          expect(e.code).to.be.equal('EACCESS');
        });
    });
  });
});