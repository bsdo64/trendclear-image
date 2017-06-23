const fileInfo = require('../../iod/lib/fileInfo');
const expect = require('chai').expect;
const sinon = require('sinon');
const {resolve} = require('path');
const fs = require('fs');
const sharp = require('sharp');

describe('FileInfo', () => {
  const path = resolve(__dirname, './test.jpg');

  describe('Constructor', () => {
    it('should construct with file path', () => {
      const file = new fileInfo(path);

      expect(file).to.be.an.instanceOf(fileInfo);
    });
  });

  describe('# initMeta', () => {
    it('should set properties with metadata', async() => {

      const result = {
        "path": '', 'height': '', 'format': '', 'width': '', 'space': '', 'depth': '', 'channels' : '',
      };
      const file = new fileInfo(path);
      const stub = sinon.stub(file.sharp, 'metadata').resolves(result);

      try {
        const fileMeta = await file.initMeta();

        sinon.assert.calledOnce(stub);
        expect(fileMeta).to.include.all.keys(
          'path', 'height', 'format', 'width', 'space', 'depth', 'channels'
        );

        stub.restore();

      } catch (e) {
        console.log(e);
        expect(e).to.be.equal(null);
      }
    });
  });

  describe('# renameFile', () => {
    it('should rename file with given path', async() => {

      const stub = sinon.stub(fs, 'rename').yields(null);

      const file = new fileInfo(path);
      const renamePath = resolve(__dirname, 'test1.jpg');

      try {
        const newFile = await file.renameFile(renamePath);
        expect(file.path).to.be.equal(renamePath);
        expect(newFile.path).to.be.equal(renamePath);

        stub.restore();

      } catch (e) {
        console.log(e);
        expect(e).to.be.equal(null);
      }
    });

    it('should throw error with error', async() => {

      const error = new Error();
      const stub = sinon.stub(fs, 'rename').yields(error);

      const file = new fileInfo(path);
      const renamePath = resolve(__dirname, 'test1.jpg');

      try {
        await file.renameFile(renamePath);

      } catch (e) {
        expect(e).to.be.equal(error);

        stub.restore();
      }
    });
  });

  describe('# deleteFile', () => {
    it('should delete file with given path', async() => {

      const stub = sinon.stub(fs, 'unlink').yields(null);

      const file = new fileInfo(path);

      try {
        const newFile = await file.deleteFile();
        expect(newFile.deleted).to.be.equal(true);

        stub.restore();

      } catch (e) {
        console.log(e);
        expect(e).to.be.equal(null);
      }
    });

    it('should throw error with error', async() => {

      const error = new Error();
      const stub = sinon.stub(fs, 'unlink').yields(error);

      const file = new fileInfo(path);
      const renamePath = resolve(__dirname, 'test1.jpg');

      try {
        await file.deleteFile(renamePath);

      } catch (e) {
        expect(e).to.be.equal(error);

        stub.restore();
      }
    });
  });
});