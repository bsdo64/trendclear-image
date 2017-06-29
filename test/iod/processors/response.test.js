/**
 * Created by dobyeongsu on 2017. 6. 21..
 */
const FileInfo = require('../../../iod/lib/fileInfo');
const FileProcess = require('../../../iod/lib/control/processor/Response');

describe('Processing File', () => {
  let spy;

  beforeAll(() => {
    spy = jest.spyOn(FileInfo.prototype, 'initMeta')
      .mockImplementation(() => Promise.resolve({
        toJSON: jest.fn(() => { return {
          format: 'jpeg',
          width: 742,
          height: 495,
          space: 'srgb',
          channels: 3,
          depth: 'uchar',
          density: 72,
          hasProfile: false,
          hasAlpha: false,
          orientation: 1,
          exif: new Buffer(''),

          size: 1234,
          name: '',
          type: '',
          mtime: '',
          original_name: '',
          url: ''
        }})
      }));
  })

  describe('Construct', () => {
    it('should return instance of FileProcess', () => {
      const options = {};
      const fp = new FileProcess(options);

      expect(fp).toBeInstanceOf(FileProcess);
      expect(fp.options).toEqual(options);
    });
  });

  describe('# makeSendJson', () => {
    it('should return json result', async() => {
      const options = {};
      const fp = new FileProcess(options);

      const fileInfos = [new FileInfo('/path/to/file.jpg')];
      const result = await fp.makeSendJson(fileInfos);
      
      expect(result).toBeInstanceOf(Object);
      expect(result.files).toBeInstanceOf(Array);
      expect(result.files.length).toBe(fileInfos.length);

      // from meta
      expect(result.files[0]).toHaveProperty('format');
      expect(result.files[0]).toHaveProperty('width');
      expect(result.files[0]).toHaveProperty('height');
      expect(result.files[0]).toHaveProperty('space');
      expect(result.files[0]).toHaveProperty('channels');
      expect(result.files[0]).toHaveProperty('depth');
      expect(result.files[0]).toHaveProperty('density');
      expect(result.files[0]).toHaveProperty('hasProfile');
      expect(result.files[0]).toHaveProperty('hasAlpha');
      expect(result.files[0]).toHaveProperty('orientation');
      expect(result.files[0]).toHaveProperty('exif');
      
      // from formidable
      expect(result.files[0]).toHaveProperty('size');
      expect(result.files[0]).not.toHaveProperty('path');
      expect(result.files[0]).toHaveProperty('name');
      expect(result.files[0]).toHaveProperty('type');
      expect(result.files[0]).toHaveProperty('mtime');
      expect(result.files[0]).toHaveProperty('original_name');
      expect(result.files[0]).toHaveProperty('url');

    });
  });
});