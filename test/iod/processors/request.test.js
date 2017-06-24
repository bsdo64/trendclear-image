/**
 * Created by dobyeongsu on 2017. 6. 21..
 */
const express = require('express');
const expect = require('chai').expect;
const ProcessingRequest = require('../../../iod/lib/control/processor/request');
const request = require('superagent');

describe('Processing Request', () => {

  describe('Construct', () => {
    it('should return instance of Request', () => {
      const options = {};
      const rqst = new ProcessingRequest(options);

      expect(rqst).to.be.an.instanceOf(ProcessingRequest);
      expect(rqst.options).to.be.equal(options);
    });
  });

  describe('# parseForm', () => {
    let rqst;
    let server, app;

    it('should throw error without req', () => {
      rqst = new ProcessingRequest();

      return rqst
        .parseForm()
        .catch(e => {
          expect(e).to.be.an.instanceOf(Error);
          expect(e.message).to.be.equal('No Request params');
        })
    });

    it('should return values', () => {
      app = express();
      app.use((req, res) => {
        const options = {
          formidable: {
            tmpDir: require('os').tmpdir(),
            maxFields: 1000,
            maxFieldsSize: 2097152,
            keepExtensions: false,
            encoding: 'utf-8',
            type: null,
            multiples: false,
          }
        };

        rqst = new ProcessingRequest(options);

        rqst
          .parseForm(req)
          .then(r => {
            res.send(r);
          })
      });

      server = app.listen(8080);

      return request
        .post('http://localhost:8080')
        .attach('file', __dirname + '/test.jpg')
        .field('hello', 'world')
        .field('arr[]', 'world1')
        .field('arr[]', 'world2')
        .field('arr2', [1, 2, 3])
        .then(r => {
          server.close();

          expect(r.body).to.have.property('fields');
          expect(r.body).to.have.property('files');
        })
        .catch(e => {
          server.close();
          expect(e).to.be.a(null);
        })
    });
  });
});