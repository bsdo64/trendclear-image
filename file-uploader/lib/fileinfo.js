/*jslint node: true */
'use strict';

const fs = require('fs');
const path = require('path');

// Since Node 0.8, .existsSync() moved from path to fs: 
const _existsSync = fs.existsSync || path.existsSync;

const getFileKey = function(filePath) {

    return path.basename(filePath);

};
let udf;

class FileInfo {
  constructor(file, opts, fields) {
    this.name = file.name;
    this.size = file.size;
    this.type = file.type;
    this.modified = file.lastMod;
    this.deleteType = 'DELETE';
    this.options = opts;
    this.key = getFileKey(file.path);
    this.versions = {};
    this.proccessed = false;
    this.width = udf;
    this.height = udf;
    this.fields = fields;
    if (opts.saveFile) {
      this.safeName();
    }
  }

  update(file) {
    this.size = file.size;
  }

  safeName() {
    const nameCountRegexp = /(?:(?: \(([\d]+)\))?(\.[^.]+))?$/;

    function nameCountFunc(s, index, ext) {
      return ' (' + ((parseInt(index, 10) || 0) + 1) + ')' + (ext || '');
    }

    // Prevent directory traversal and creating hidden system files:
    this.name = path.basename(this.name).replace(/^\.+/, '');
    // Prevent overwriting existing files:
    while (_existsSync(this.options.uploadDir + '/' + this.name)) {
      this.name = this.name.replace(nameCountRegexp, nameCountFunc);
    }
  }

  initUrls() {

    const that = this;
    const baseUrl = (that.options.useSSL ? 'https:' : 'http:') +
      '//' + that.options.host +
      (that.options.proxy ? that.options.proxy : '') +
      that.options.uploadUrl;
    if (this.error) return;
    if (!this.awsFile) {
      that.url = baseUrl + encodeURIComponent(that.name);
      that.deleteUrl = baseUrl + encodeURIComponent(that.name);
      if (!that.hasVersionImages()) return;
      Object.keys(that.options.imageVersions).forEach(function(version) {
        if (_existsSync(that.options.uploadDir + '/' + version + '/' + that.name)) {
          that[version + 'Url'] = baseUrl + version + '/' + encodeURIComponent(that.name);
        } else {
          // create version failed, use the default url as version url
          that[version + 'Url'] = that.url;
        }
      });
      return;
    }

    that.url = that.awsFile.url;
    that.deleteUrl = that.options.uploadUrl + that.url.split('/')[that.url.split('/').length - 1].split('?')[0];
    if (!that.hasVersionImages()) return;
    Object.keys(that.options.imageVersions).forEach(function(version) {
      that[version + 'Url'] = that.url;
    });

  }

  validate() {
    if (this.options.minFileSize && this.options.minFileSize > this.size) {
      this.error = 'File is too small';
    } else if (this.options.maxFileSize && this.options.maxFileSize < this.size) {
      this.error = 'File is too big';
    } else if (!this.options.acceptFileTypes.test(this.name)) {
      this.error = 'Filetype not allowed';
    }
    return !this.error;
  }

  hasVersionImages() {
    return (this.options.copyImgAsThumb && this.options.imageTypes.test(this.url));
  }
}

module.exports = FileInfo;

module.exports.getFileKey = getFileKey;
