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
  })

  describe('Construct', () => {
    it('should return instance of ImageProcess', () => {

      expect(ip).toBeInstanceOf(ImageProcess);
      expect(ip.options).toEqual(options);
    });
  });

  describe('# convert', () => {
    it('should ', () => {

      return ip.convert('/file/path')
        .then(r => {
          expect(r).toBeInstanceOf(Buffer);
        })
    });
  });
});