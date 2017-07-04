const fs = require('fs');
const path = require('path');
const config = require('../../../iod/config');
const Utils = require('../../../iod/lib/utils');

describe('Class Utils', () => {
  const utils = new Utils(config);
  let stubFsStat, stubMkdirp;

  beforeEach(()=> {
    stubFsStat = jest.spyOn(fs, 'stat');
    stubMkdirp = jest.spyOn(utils, 'mkdir');
  });

  afterEach(()=> {
    stubFsStat.mockRestore();
    stubMkdirp.mockRestore();
  });

  describe('Constructor', () => {
    it('should have properties', () => {
      expect(utils).toHaveProperty('config');
    });

    it('should have methods', () => {
      expect(utils).hasOwnProperty('hash');
      expect(utils).hasOwnProperty('hashMatches');
      expect(utils).hasOwnProperty('parseFileName');
      expect(utils).hasOwnProperty('checkExistDir');
      expect(utils).hasOwnProperty('checkExistFile');
      expect(utils).hasOwnProperty('getPathWithFileName');
    });
  });
  
  describe('# hash', () => {
    it('should return hashs with string', () => {
      const hashString = utils.hash('someString');
      expect(hashString.length).toBe(8);
    });
  });

  describe('# hashMatches', () => {
    it('should return true when hash match', () => {
      const expectHash = utils.hash('someString');
      return utils.hashMatches(expectHash, 'someString')
        .then(result => {
          expect(result).toEqual(true);
        })
        .catch(e => {
          expect(e).toEqual(null);
        })
    });

    it('should throw error when hash doesn`t match', () => {
      const expectHash = utils.hash('notmatch');
      return utils.hashMatches(expectHash, 'someString')
        .then(result => {
          expect(result).toEqual(null);
        })
        .catch(e => {
          expect(e).toBeInstanceOf(Error);
        })
    });
  });

  describe('# parseFileName', () => {
    it('should return obj parsed path', () => {
      const expectPath = path.parse('/path/to/file.ext');
      const parsed = utils.parseFileName('/path/to/file.ext');
      expect(parsed).toEqual(expectPath);
    });
  });

  describe('# checkExistDir', () => {
    it('should return dir path if dir not exist', () => {

      stubFsStat.mockImplementation((dir, cb) => cb({ code: 'ENOENT' }, null));
      stubMkdirp.mockImplementation((dir, cb) => cb(null, {file: 'ok'}));

      return utils.checkExistDir('/path/to/dir')
        .then(r => {
          expect(r).toEqual('/path/to/dir');
        });
    });

    it('should throw error if don`t have access permission', () => {
      stubFsStat.mockImplementation((dir, cb) => cb({ code: 'ENOENT' }, null));
      stubMkdirp.mockImplementation((dir, cb) => cb({ code: 'EACCESS' }, null));

      return utils.checkExistDir('/path/to/dir')
        .catch(e => {
          expect(e.code).toEqual('EACCESS');
        });
    });

    it('should throw error if don`t have fs access permission', () => {

      stubFsStat.mockImplementation((dir, cb) => cb(new TypeError(), null));
      stubMkdirp.mockImplementation((dir, cb) => cb({ code: 'ENOENT' }, null));

      return utils.checkExistDir('/path/to/dir')
        .catch(e => {
          expect(e).toBeInstanceOf(TypeError);
        });
    });

    it('should throw error if path is file', () => {

      stubFsStat.mockImplementation((dir, cb) => cb(null, { isFile: () => true }));

      return utils.checkExistDir('/path/to/dir')
        .catch(e => {
          expect(e).toBeInstanceOf(Error);
        });
    });
  });

  describe('# checkExistFile', () => {
    it('should return file path if file exist', () => {

      stubFsStat.mockImplementation((dir, cb) => cb(null, { isFile: () => true }));

      return utils.checkExistFile('/path/to/exist/file.ext')
        .then(r => {
          expect(r).toEqual('/path/to/exist/file.ext');
        });
    });
    
    it('should throw error if file not exist', () => {
      stubFsStat.mockImplementation((dir, cb) => cb({code: 'ENOENT'}, null));

      return utils.checkExistFile('/path/to/exist/file.ext')
        .catch(e => {
          expect(e).toBeInstanceOf(Error);
        });
    });

    it('should throw error if path is null', () => {

      stubFsStat.mockImplementation((dir, cb) => cb({name: 'TypeError'}, null));

      return utils.checkExistFile()
        .catch(e => {
          expect(e).toBeInstanceOf(Error);
        });
    });

    it('should throw error if path is directory', () => {

      stubFsStat.mockImplementation((dir, cb) => cb(null, {
        isFile: () => false,
        isDirectory: () => true
      }));

      return utils.checkExistFile()
        .catch(e => {
          expect(e).toBeInstanceOf(Error);
        });
    });
  });
});