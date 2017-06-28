/**
 * Created by dobyeongsu on 2017. 6. 21..
 */
const ImageProcess = require('../../../iod/lib/control/processor/image');

describe('Processing Image', () => {
  const options = {};  
  let sharpMock, ip = new ImageProcess(options);

  beforeAll(() => {
    sharpMock = jest.fn((path) => {
      const obj = {
       resize: jest.fn(() => { return obj; }), 
       toBuffer: jest.fn(() => { return Promise.resolve(new Buffer('hello')); }), 
      };
      return obj;
    });
    ip.sharp = sharpMock
  });

  describe('Construct', () => {
    it('should return instance of ImageProcess', () => {

      expect(ip).toBeInstanceOf(ImageProcess);
      expect(ip.options).toEqual(options);
    });
  });

  describe('# convertImage', () => {
    it('should return buffer', () => {

      return ip.convertImage('/file/path')
        .then(r => {
          expect(r).toBeInstanceOf(Buffer);
        })
    });

    it('should return buffer with options', () => {

      const opt = {
        w: 120,
        c: {
          fit: true,
          crop: true,
          limit: true,
        },
        h: 120,
      };
      return ip.convertImage('/file/path', opt)
          .then(r => {
            expect(r).toBeInstanceOf(Buffer);
          })
    });
  });
});