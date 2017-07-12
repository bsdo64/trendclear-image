/**
 * Created by dobyeongsu on 2017. 6. 21..
 */

const formidable = require('formidable');
const fs = require('fs');

class Request {
  constructor(options) {
    this.options = options;
    this.formidable = formidable;
    this.fields = {};
    this.fileFields = {};
    this.files = [];
  }

  _checkNaN(string) {
    return isNaN(string * 1)
  }

  parseTransformQuery(transformString) {
    if (!transformString) {
        return {};
      }
      
    return transformString.split(',').reduce((prev, curr) => {
      const [key, value] = curr.split('_');

      if (this._checkNaN(value)) {
        prev[key] = prev[key] || {};

        prev[key] = Object.assign({
          [value]: true
        }, prev[key]);
        
      } else {
        prev[key] = value * 1 > 0 ? parseInt(value * 1) : 1;
      }

      return prev;
    }, {});
  }

  parseForm(req) {
    return new Promise((resolve, reject) => {

      if (!req) {
        return reject(new Error('No Request params'))
      }

      const form = this.formidable.IncomingForm();
      const {
        tmpDir, 
        keepExtensions, 
        maxFields, 
        maxFieldsSize, 
        maxFileSize, 
        encoding, 
        type, 
        multiples
      } = this.options.formidable;

      form.uploadDir = tmpDir;
      form.keepExtensions = keepExtensions;
      form.maxFields = maxFields;
      form.maxFieldsSize = maxFieldsSize;
      form.encoding = encoding;
      form.type = type;
      form.multiples = multiples;
      form.maxFileSize = maxFileSize;

      form.on('error', (e) => {
        reject(e);
      });
      
      form.on('aborted', () => {
        reject(new Error('aborted'));
      });

      form.on('file', (name, value) => {
        if (!this.options.fileTypes.test(value.name)) {
          return fs.unlink(value.path, (err) => {
            if (err) {
              return reject(new Error('File couldn`t removed'))
            }
            return reject(new Error('No file types'));
          });
        }
        
        this.files.push(value);
        this.fileFields[name] = this.fileFields[name] || [];
        this.fileFields[name].push(value)
      });

      form.on('progress', (bytesReceived, bytesExpected) => {
        if (bytesExpected > form.maxFileSize) {
          return reject(new Error('Max file size sceeded!'));
        }

        if (bytesReceived > form.maxFileSize) {
          return reject(new Error('Max file size sceeded!'));
        }
      });

      form.on('field', (name, value) => {
        if (this.fields.hasOwnProperty(name)) {
          if (Array.isArray(this.fields[name])) {
            this.fields[name].push(value)
          } else {
            this.fields[name] = [this.fields[name], value]
          }
        } else {
          this.fields[name] = value
        }
      });

      form.on('end', () => {

        resolve({
          fields: Object.assign({}, this.fields, this.fileFields),
          files: this.files
        })
      });

      form.parse(req);
    })
  }
}

module.exports = Request;