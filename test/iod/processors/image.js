/**
 * Created by dobyeongsu on 2017. 6. 21..
 */
const expect = require('chai').expect;
const sinon = require('sinon');
const FileInfo = require('../../../iod/lib/fileInfo');
const FileProcess = require('../../../iod/lib/control/processor/file');
const fs = require('fs');

describe('Processing File', () => {
  let sandbox,
      stubRename;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    stubRename = sandbox.stub(fs, 'rename');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Construct', () => {
    it('should return instance of FileProcess', () => {
      const options = {};
      const ip = new FileProcess(options);

      expect(ip).to.be.an.instanceOf(FileProcess);
      expect(ip.options).to.be.equal(options);
    });
  });

  describe('# renameFilesTmpToPublic', () => {
    it('should return array of fileInfo', () => {
      const options = {formidable: {uploadDir: ''}};
      const ip = new FileProcess(options);
      const fileInfos = [new FileInfo('test.jpg')];

      stubRename.yields(null);

      return ip.renameFilesTmpToPublic(fileInfos)
        .then(r => {
          expect(r).to.be.an('array');
          expect(r[0]).to.be.an.instanceOf(FileInfo);
        })
    });

    it('should throw error when file path is not correct', () => {
      const options = {formidable: {uploadDir: ''}};
      const expectError = new Error('errorPath');
      const ip = new FileProcess(options);
      const fileInfos = [new FileInfo('errorPath')];

      stubRename.yields(expectError);

      return ip.renameFilesTmpToPublic(fileInfos)
        .catch(e => {
          expect(e).to.be.equal(expectError);
          expect(e).to.be.an.instanceOf(Error);
        })
    });
  });
});