/**
 * Created by dobyeongsu on 2017. 6. 21..
 */
const ImageProcess = require('../../../../iod/lib/control/processor/Image');

describe('Processing Image', () => {
  const options = {};  
  let sharpMock, ip = new ImageProcess(options);
  let preMock;

  beforeAll(() => {
    preMock = ip.sharp;

    sharpMock = (path) => {
      const obj = {
        metadata: jest.fn(() => { return Promise.resolve({ width: 1, height: 1 }); }), 
        resize: jest.fn(() => { return obj; }), 
        max: jest.fn(() => { return obj; }), 
        ignoreAspectRatio: jest.fn(() => { return obj; }), 
        toBuffer: jest.fn(() => { return Promise.resolve(new Buffer('hello')); }), 
      };
      return obj;
    };
    
    ip.sharp = sharpMock;
  });

  afterAll(() => {
    ip.sharp = preMock;
  })

  describe('Construct', () => {
    it('should return instance of ImageProcess', () => {

      expect(ip).toBeInstanceOf(ImageProcess);
      expect(ip.options).toEqual(options);
    });
  });

  describe('# _parseTransform', () => {
    const meta = {width: 100, height: 100};

    it('should return object', () => {
      const transform = {w: 50, h: 50, c: { fit: true }};
      const obj = ip._parseTransform(transform, meta);
      expect(obj).toBeInstanceOf(Object);
    });

    it('should return fit unlimited size', () => {
      const transform = {c: { fit: true }};
      const obj = ip._parseTransform(transform, meta);

      expect(obj.w).toBe(undefined);
      expect(obj.h).toBe(undefined);
    });

    it('should return fit unlimited size', () => {
      const transform = {w: 150, h: 50, c: { fit: true }};
      const obj = ip._parseTransform(transform, meta);

      expect(obj.w).toBe(null);
      expect(obj.h).toBe(50);
    });

    it('should return fit unlimited size', () => {
      const transform = {w: 100, h: 150, c: { fit: true }};
      const obj = ip._parseTransform(transform, meta);

      expect(obj.w).toBe(100);
      expect(obj.h).toBe(null);
    });

    it('should return fit unlimited size', () => {
      const transform = {w: 1000, h: 150, c: { fit: true }};
      const obj = ip._parseTransform(transform, meta);

      expect(obj.w).toBe(null);
      expect(obj.h).toBe(150);
    });

    it('should return fit unlimited size', () => {
      const transform = {w: 60, h: 20, c: { fit: true }};
      const obj = ip._parseTransform(transform, meta);

      expect(obj.w).toBe(null);
      expect(obj.h).toBe(20);
    });

    it('should return fit unlimited size', () => {
      const transform = {w: 20, h: 60, c: { fit: true }};
      const obj = ip._parseTransform(transform, meta);

      expect(obj.w).toBe(20);
      expect(obj.h).toBe(null);
    });

    it('should return limit limited size small than original size', () => {
      const transform = {w: 20, c: { limit: true }};
      const obj = ip._parseTransform(transform, meta);

      expect(obj.w).toBe(20);
      expect(obj.h).toBe(undefined);
    });

    it('should return limit limited size small than original size', () => {
      const transform = {h: 20, c: { limit: true }};
      const obj = ip._parseTransform(transform, meta);

      expect(obj.w).toBe(undefined);
      expect(obj.h).toBe(20);
    });

    it('should return limit limited size small than original size', () => {
      const transform = {h: 120, c: { limit: true }};
      const obj = ip._parseTransform(transform, meta);

      expect(obj.w).toBe(undefined);
      expect(obj.h).toBe(100);
    });

    it('should return limit limited size small than original size', () => {
      const transform = {w: 120, c: { limit: true }};
      const obj = ip._parseTransform(transform, meta);

      expect(obj.w).toBe(100);
      expect(obj.h).toBe(undefined);
    });

    it('should return limit limited size small than original size', () => {
      const transform = {w: 20, h: 60, c: { limit: true }};
      const obj = ip._parseTransform(transform, meta);

      expect(obj.w).toBe(20);
      expect(obj.h).toBe(null);
    });

    it('should return limit limited size small than original size', () => {
      const transform = {w: 1000, h: 150, c: { limit: true }};
      const obj = ip._parseTransform(transform, meta);

      expect(obj.w).toBe(null);
      expect(obj.h).toBe(100);
    });

    it('should return limit limited size small than original size', () => {
      const transform = {w: 80, h: 10, c: { limit: true }};
      const obj = ip._parseTransform(transform, meta);

      expect(obj.w).toBe(null);
      expect(obj.h).toBe(10);
    });

    it('should return limit limited size small than original size', () => {
      const transform = {w: 150, h: 1000, c: { limit: true }};
      const obj = ip._parseTransform(transform, meta);

      expect(obj.w).toBe(100);
      expect(obj.h).toBe(null);
    });

    it('should return limit limited size small than original size', () => {
      const transform = {c: { limit: true }};
      const obj = ip._parseTransform(transform, meta);

      expect(obj.w).toBe(undefined);
      expect(obj.h).toBe(undefined);
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

    it('should return buffer with options', () => {

      const opt = {
        w: 120,
        h: 120,
      };
      return ip.convertImage('/file/path', opt)
          .then(r => {
            expect(r).toBeInstanceOf(Buffer);
          })
    });
  });
});