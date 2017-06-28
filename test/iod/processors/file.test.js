/**
 * Created by dobyeongsu on 2017. 6. 21..
 */
const FileInfo = require('../../../iod/lib/fileInfo');
const FileProcess = require('../../../iod/lib/control/processor/file');
const fs = require('fs');

describe('Processing File', () => {
  let stubRename;

  beforeEach(() => {
    stubRename = jest.spyOn(fs, 'rename');
  });

  afterEach(() => {
    stubRename.mockReset();
    stubRename.mockRestore();
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
});