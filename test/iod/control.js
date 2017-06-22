const Control = require('../../iod/lib/control/index.js');
const {Image, Request, Response, File} = require('../../iod/lib/control/index.js');
const expect = require('chai').expect;
const sinon = require('sinon');
const path = require('path');
const fs = require('fs');

describe('Control', () => {
  describe('Constructor', () => {
    it('should construct with options', () => {
      const options = {};
      const control = new Control(options);

      expect(control).to.be.an.instanceOf(Control);
    });

    it('should construct without new', () => {
      const options = {};
      const control = Control(options);

      expect(control).to.be.an.instanceOf(Control);
    });
  });

  describe('# processor', () => {
    it('should get processor module', async() => {

      const options = {};
      const imageProcessor = Control(options).processor('Image');
      const requestProcessor = Control(options).processor('Request');
      const responseProcessor = Control(options).processor('Response');
      const fileProcessor = Control(options).processor('File');

      expect(imageProcessor).to.be.an.instanceOf(Image);
      expect(requestProcessor).to.be.an.instanceOf(Request);
      expect(responseProcessor).to.be.an.instanceOf(Response);
      expect(fileProcessor).to.be.an.instanceOf(File);

    });
  });
});