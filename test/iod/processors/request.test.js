/**
 * Created by dobyeongsu on 2017. 6. 21..
 */
const express = require('express');
const ProcessingRequest = require('../../../iod/lib/control/processor/request');
const request = require('superagent');

describe('Processing Request', () => {

  describe('Construct', () => {
    it('should return instance of Request', () => {
      const options = {
        fileTypes: /\.(gif|jpe?g|png)/i
      };
      const rqst = new ProcessingRequest(options);

      expect(rqst).toBeInstanceOf(ProcessingRequest);
      expect(rqst.options).toEqual(options);
    });
  });

  describe('# parseForm', () => {
    let rqst;
    let server, app;
    let options;

    it('should throw error without req', () => {
      rqst = new ProcessingRequest();

      return rqst
        .parseForm()
        .catch(e => {
          expect(e).toBeInstanceOf(Error);
          expect(e.message).toEqual('No Request params');
        })
    });

    it('should return values', () => {
      app = express();
      app.use((req, res) => {
        options = {
          formidable: {
            tmpDir: require('os').tmpdir(),
            maxFields: 1000,
            maxFieldsSize: 2097152,
            keepExtensions: false,
            encoding: 'utf-8',
            type: null,
            multiples: false,
          },
          fileTypes: /\.(gif|jpe?g|png)/i
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

          expect(r.body).toHaveProperty('fields');
          expect(r.body).toHaveProperty('files');
        })
        .catch(e => {
          server.close();
          expect(e).toBeNull();
        })
    });

    it('should throw error and unlink file when ext is not valid', () => {
      const EventEmitter = require('events');
      const req = new EventEmitter();
      const form = req;
      form.parse = jest.fn();
      
      const fs = require('fs');
      const spy = jest.spyOn(fs, 'unlink').mockImplementation((path, cb) => {
        return cb(null)
      });

      rqst = new ProcessingRequest(options);
      const spyForm = jest.spyOn(rqst.formidable, 'IncomingForm');
      spyForm.mockImplementation(() => {
        return form;
      });

      const fileName = 'test.abc';
      const fileValue = {
        name: 'test.abc',
        path: '/path/to/tmp/invalidFile'
      };
      
      setTimeout(function() {
        req.emit('file', fileName, fileValue);
      }, 1)

      return rqst
        .parseForm(req)
        .catch(e => {
          expect(e).toEqual(new Error('No file types'));

          spy.mockReset();
          spy.mockRestore();
          spyForm.mockReset();
          spyForm.mockRestore();
        })
    });

    it('should throw error and unlink error (system error)', () => {
      const EventEmitter = require('events');
      const req = new EventEmitter();
      const form = req;
      form.parse = jest.fn();
      
      const fs = require('fs');
      const spy = jest.spyOn(fs, 'unlink').mockImplementation((path, cb) => {
        return cb({fake: 'error'})
      });

      rqst = new ProcessingRequest(options);
      const spyForm = jest.spyOn(rqst.formidable, 'IncomingForm');
      spyForm.mockImplementation(() => {
        return form;
      });

      const fileName = 'test.abc';
      const fileValue = {
        name: 'test.abc',
        path: '/path/to/tmp/invalidFile'
      };
      setTimeout(function() {
        req.emit('file', fileName, fileValue);
      }, 1)

      return rqst
        .parseForm(req)
        .catch(e => {
          expect(e).toEqual(new Error('File couldn`t removed'));
          
          spy.mockReset();
          spy.mockRestore();
          spyForm.mockReset();
          spyForm.mockRestore();
        })
    });

    it('should throw error when formidable gets error', () => {
      const EventEmitter = require('events');
      const req = new EventEmitter();
      const form = req;
      form.parse = jest.fn();

      rqst = new ProcessingRequest(options);
      const spyForm = jest.spyOn(rqst.formidable, 'IncomingForm');
      spyForm.mockImplementation(() => {
        return form;
      });

      const formidableError = {hello: 'world'};
      setTimeout(function() {
        req.emit('error', formidableError);
      }, 1)

      return rqst
        .parseForm(req)
        .catch(e => {
          expect(e).toEqual(formidableError);

          spyForm.mockRestore();
        })
    });

    it('should throw error when formidable throw aborted', () => {
      const EventEmitter = require('events');
      const form = new EventEmitter();
      form.parse = jest.fn();

      rqst = new ProcessingRequest(options);
      const spyForm = jest.spyOn(rqst.formidable, 'IncomingForm');
      spyForm.mockImplementation(() => {
        return form;
      });

      setTimeout(function() {
        form.emit('aborted');
      }, 1)

      return rqst
        .parseForm(form)
        .catch(e => {
          expect(e).toEqual(new Error('aborted'));

          spyForm.mockRestore();
        })
    });
  });

  describe('# parseTransformQuery', () => {
    let rqst;
    let options = {
      formidable: {
        tmpDir: require('os').tmpdir(),
        maxFields: 1000,
        maxFieldsSize: 2097152,
        keepExtensions: false,
        encoding: 'utf-8',
        type: null,
        multiples: false,
      },
      fileTypes: /\.(gif|jpe?g|png)/i
    };
    let queryT;

    it('should return parsed object with transform string query t', () => {
      rqst = new ProcessingRequest(options);
      queryT = 'w_120,h_120,c_crop';
      
      const queryObj = rqst.parseTransformQuery(queryT);
      return expect(queryObj).toEqual({ w: 120, h: 120, c: { crop: true }});
    });

    it('should return parsed object with merged transform string query t', () => {
      rqst = new ProcessingRequest(options);
      queryT = 'w_120,h_120,c_crop,c_fit,c_limit';
      
      const queryObj = rqst.parseTransformQuery(queryT);
      return expect(queryObj).toEqual({ w: 120, c: { crop: true, fit: true, limit: true }, h: 120});
    });

    it('should return empty object without transform string query t', () => {
      rqst = new ProcessingRequest(options);
      queryT = undefined;
      
      const queryObj = rqst.parseTransformQuery(queryT);
      return expect(queryObj).toEqual({});
    });

    it('should return empty object with empty string transform string query t', () => {
      rqst = new ProcessingRequest(options);
      queryT = '';
      
      const queryObj = rqst.parseTransformQuery(queryT);
      return expect(queryObj).toEqual({});
    });
  });
});