const fileInfo = require('../../iod/lib/fileInfo');
const {resolve} = require('path');
const fs = require('fs');
const sharp = require('sharp');
const shortId = require('shortid');

describe('FileInfo', () => {
  const path = resolve(__dirname, './test.jpg');
  let file = new fileInfo(path);
  let stubSharp, stubRename, stubUnlink, stubShortId;

  beforeAll(() => {
    stubSharp = jest.spyOn(file.sharp, 'metadata');
    stubRename = jest.spyOn(fs, 'rename');
    stubUnlink = jest.spyOn(fs, 'unlink');
    stubShortId = jest.spyOn(shortId, 'generate');
  });

  afterAll(() => {
    stubRename.mockRestore();
    stubUnlink.mockRestore();
    stubSharp.mockRestore();
    stubShortId.mockRestore();
  });

  describe('Constructor', () => {
    it('should construct with file path', () => {
      expect(file).toBeInstanceOf(fileInfo);
    });
  });

  describe('# initMeta', () => {
    it('should set properties with metadata', async() => {

      const result = {
        "path": '', 'height': '', 'format': '', 'width': '', 'space': '', 'depth': '', 'channels' : '',
      };
      stubSharp.mockImplementation(() => Promise.resolve(result))

      try {
        const fileMeta = await file.initMeta();

        expect(stubSharp).toHaveBeenCalledTimes(1);
        expect(fileMeta).toHaveProperty('path');
        expect(fileMeta).toHaveProperty('height');
        expect(fileMeta).toHaveProperty('format');
        expect(fileMeta).toHaveProperty('width');
        expect(fileMeta).toHaveProperty('space');
        expect(fileMeta).toHaveProperty('depth');
        expect(fileMeta).toHaveProperty('channels');

      } catch (e) {
        console.log(e);
        expect(e).toBeNull();
      }
    });
  });

  describe('# renameFile', () => {
    it('should rename file with given path', async() => {

      stubRename.mockImplementation((path, newPath, cb) => cb(null));
      stubShortId.mockImplementation(() => 'fileName');
      const uploadDir = __dirname;
      const expectPath = resolve(__dirname, 'fileName.jpg');

      try {
        const newFile = await file.renameFile(uploadDir);
        
        expect(file.path).toEqual(expectPath);
        expect(newFile.path).toEqual(expectPath);

      } catch (e) {
        console.log(e);
        expect(e).toBeNull();
      }
    });

    it('should throw error with error', async() => {

      const error = new Error();
      stubRename.mockImplementation((path, newPath, cb) => cb(error));
      const uploadDir = __dirname;

      try {
        await file.renameFile(uploadDir);

      } catch (e) {
        expect(e).toEqual(error);
      }
    });
  });

  describe('# deleteFile', () => {
    it('should delete file with given path', async() => {

      stubUnlink.mockImplementation((path, cb) => cb(null));
      try {
        const newFile = await file.deleteFile();
        expect(newFile.deleted).toEqual(true);

      } catch (e) {
        console.log(e);
        expect(e).toBeNull();
      }
    });

    it('should throw error with error', async() => {

      const error = new Error();
      stubUnlink.mockImplementation((path, cb) => cb(error));
      const renamePath = resolve(__dirname, 'test1.jpg');

      try {
        await file.deleteFile(renamePath);

      } catch (e) {
        expect(e).toEqual(error);
      }
    });
  });
});