const formidable = require('formidable');
const fs = require('fs');

const parseForm = function (req, options, done) {
  const config = options;
  const fields = {};
  const fileFields = {};
  const files = [];
  const form = formidable.IncomingForm();

  form.uploadDir = config.tmpDir;
  form.keepExtensions = config.keepExtensions;
  form.maxFields = config.maxFields;
  form.maxFieldsSize = config.maxFieldsSize;
  form.encoding = config.encoding;
  form.type = config.type;
  form.multiples = config.multiples;

  form.on('error', function (e) {
    done(e);
  });

  form.on('aborted', function () {
    done('aborted');
  });

  form.on('file', function (name, value) {
    files.push(value);
    fileFields[name] = fileFields[name] || [];
    fileFields[name].push(value)
  });

  form.on('field', function (name, value) {
    if (fields.hasOwnProperty(name)) {
      if (Array.isArray(fields[name])) {
        fields[name].push(value)
      } else {
        fields[name] = [fields[name], value]
      }
    } else {
      fields[name] = value
    }
  });

  form.on('end', function () {

    done(null, {
      fields: Object.assign({}, fields, fileFields),
      files: files
    })
  });

  form.parse(req);

};

const FormidablePromise = function (req, options) {

  return function thunk() {

    return new Promise((resolve, reject) => {

      if (!req || req instanceof require('http').ClientRequest ) {

        return reject(new Error('No Request'))
      }

      return parseForm(req, options, (err, data) => {

        if (err) {
          return reject(err);
        }

        return resolve(data)
      });
    })
  }
};

module.exports = FormidablePromise;