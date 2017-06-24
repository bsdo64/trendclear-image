/**
 * Created by dobyeongsu on 2017. 6. 21..
 */

const formidable = require('formidable');

class Request {
  constructor(options) {
    this.options = options;
    this.formidable = formidable;
    this.fields = {};
    this.fileFields = {};
    this.files = [];
  }

  parseForm(req) {
    return new Promise((resolve, reject) => {

      if (!req) {
        return reject(new Error('No Request params'))
      }

      const form = this.formidable.IncomingForm();
      const {
        tmpDir, keepExtensions, maxFields, maxFieldsSize, encoding, type, multiples
      } = this.options.formidable;

      form.uploadDir = tmpDir;
      form.keepExtensions = keepExtensions;
      form.maxFields = maxFields;
      form.maxFieldsSize = maxFieldsSize;
      form.encoding = encoding;
      form.type = type;
      form.multiples = multiples;

      form.on('error', (e) => {
        reject(e);
      });

      form.on('progress', (bytesReceived, bytesExpected) => {
        if (bytesExpected < bytesReceived) {
          reject(new Error('file size error'))
        }
      });

      form.on('aborted', () => {
        reject(new Error('aborted'));
      });

      form.on('file', (name, value) => {
        this.files.push(value);
        this.fileFields[name] = this.fileFields[name] || [];
        this.fileFields[name].push(value)
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