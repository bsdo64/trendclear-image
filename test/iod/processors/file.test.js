/**
 * Created by dobyeongsu on 2017. 6. 21..
 */
const FileInfo = require('../../../iod/lib/fileInfo');
const FileProcess = require('../../../iod/lib/control/processor/File');
const fs = require('fs');

describe('Processing File', () => {
  let stubRename, stubFileInfoHash;

  beforeEach(() => {
    stubRename = jest.spyOn(fs, 'rename');
    stubFileInfoHash = jest.spyOn(FileInfo.prototype, 'hash');
  });

  afterEach(() => {
    stubRename.mockReset();
    stubRename.mockRestore();
    stubFileInfoHash.mockReset();
    stubFileInfoHash.mockRestore();
  });

  describe('Construct', () => {
    it('should return instance of FileProcess', () => {
      const options = {};
      const fp = new FileProcess(options);

      expect(fp).toBeInstanceOf(FileProcess);
      expect(fp.options).toEqual(options);
    });
  });

  describe('# renameFilesTmpToPublic', () => {
    it('should return array of fileInfo', () => {
      const options = {formidable: {uploadDir: ''}};
      const fp = new FileProcess(options);
      const fileInfos = [new FileInfo('test.jpg')];

      stubRename.mockImplementation((path, newPath, cb) => cb(null));

      return fp.renameFilesTmpToPublic(fileInfos)
        .then(r => {
          expect(r).toBeInstanceOf(Array);
          expect(r[0]).toBeInstanceOf(FileInfo);
        })
    });

    it('should throw error when file path is not correct', () => {
      const options = {formidable: {uploadDir: ''}};
      const expectError = new Error('errorPath');
      const ip = new FileProcess(options);
      const fileInfos = [new FileInfo('errorPath')];

      stubRename.mockImplementation((path, newPath, cb) => cb(expectError));

      return ip.renameFilesTmpToPublic(fileInfos)
        .catch(e => {
          expect(e).toEqual(expectError);
          expect(e).toBeInstanceOf(Error);
        })
    });
  });

  describe('# initUrls', () => {
    it('should set urls', () => {
      stubFileInfoHash.mockImplementation(() => 'TEST_UUID')

      const testPath = 'http://localhost/test/path';
      const options = {
        secret: '75a1b28ee65177fbb78000e0fc637b66324a83d2570b932fa475a0671223a1c8',
        server: {publicUrl: testPath},
        formidable: {uploadDir: '/upload/path'}
      };
      const fp = new FileProcess(options);
      const fileInfos = [new FileInfo('filename.ext')];

      const newFileInfos = fp.initUrls(fileInfos);

      expect(stubFileInfoHash).toHaveBeenCalledTimes(1);
      expect(fileInfos[0].url).toEqual('http://localhost/test/path/TEST_UUID?n=filename.ext')
      expect(newFileInfos[0].url).toEqual('http://localhost/test/path/TEST_UUID?n=filename.ext')
    });
  });

  describe('# makeFileInfos', () => {
    it('should return array of FileInfo instance by filepaths', () => {
      const filePaths = ['/path1', '/path2'];
      const options = {};
      const fp = new FileProcess(options);

      const fileInfos = fp.makeFileInfos(filePaths);

      expect(fileInfos).toBeInstanceOf(Array);
      expect(fileInfos.length).toEqual(2);
      expect(fileInfos[0]).toBeInstanceOf(FileInfo);
      expect(fileInfos[0].path).toEqual(filePaths[0]);
      expect(fileInfos[1]).toBeInstanceOf(FileInfo);
      expect(fileInfos[1].path).toEqual(filePaths[1]);
    });
  });
});