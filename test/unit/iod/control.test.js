const Control = require('../../../iod/lib/control/index.js');
const {Image, Request, Response, File} = require('../../../iod/lib/control/index.js');

describe('Control', () => {
  describe('Constructor', () => {
    it('should construct with options', () => {
      const options = {};
      const control = new Control(options);

      expect(control).toBeInstanceOf(Control);
    });

    it('should construct without new', () => {
      const options = {};
      const control = Control(options);

      expect(control).toBeInstanceOf(Control);
    });
  });

  describe('# processor', () => {
    it('should get processor module', async() => {

      const options = {};
      const imageProcessor = Control(options).processor('Image');
      const requestProcessor = Control(options).processor('Request');
      const responseProcessor = Control(options).processor('Response');
      const fileProcessor = Control(options).processor('File');

      expect(imageProcessor).toBeInstanceOf(Image);
      expect(requestProcessor).toBeInstanceOf(Request);
      expect(responseProcessor).toBeInstanceOf(Response);
      expect(fileProcessor).toBeInstanceOf(File);

    });

    it('should get processor modules with array', async() => {

      const options = {};
      const [
        imageProcessor,
        requestProcessor,
        responseProcessor,
        fileProcessor
      ] = Control(options).processor(['Image', 'Request', 'Response', 'File']);

      expect(imageProcessor).toBeInstanceOf(Image);
      expect(requestProcessor).toBeInstanceOf(Request);
      expect(responseProcessor).toBeInstanceOf(Response);
      expect(fileProcessor).toBeInstanceOf(File);

    });
  });
});