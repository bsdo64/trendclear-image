/**
 * Created by dobyeongsu on 2017. 6. 21..
 */
const expect = require('chai').expect;
const ImageProcess = require('../../../iod/lib/control/processor/image');

describe('Processing Image', () => {

  describe('Construct', () => {
    it('Construct', () => {
      const options = {};
      const ip = new ImageProcess(options);

      expect(ip.options).to.be.equal(options);
    });
  });

  describe('# convert', () => {
    it('should ', () => {
      const options = {};
      const ip = new ImageProcess(options);

      expect(ip.options).to.be.equal(options);
    });
  });
});