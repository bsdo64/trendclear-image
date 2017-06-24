/*jslint node: true */
'use strict';

const FileInfo = require('./lib/fileinfo.js');
const configs = require('./lib/configs.js');
const formidable = require('formidable');
const fs = require('fs');

module.exports = uploadService;

function uploadService(opts) {
    const options = configs.apply(opts);
    let transporter = options.storage.type === 'local' ? require('./lib/transport/local.js') : require('./lib/transport/aws.js');

    transporter = transporter(options);

    const fileUploader = {};

    fileUploader.config = options;

    function setNoCacheHeaders(res) {
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.setHeader('Content-Disposition', 'inline; filename="files.json"');
    }

    fileUploader.get = function(req, res, callback) {
        this.config.host = req.headers.host;
        setNoCacheHeaders(res);
        transporter.get(callback);
    };

    fileUploader.post = function(req, res, callback) {
        setNoCacheHeaders(res);
        const form = new formidable.IncomingForm();
        const tmpFiles = [];
        const files = [];
        const map = {};
        const fields = {};
        let redirect;

        this.config.host = req.headers.host;

        const configs = this.config;

        req.body = req.body || {};

        function finish(error, fileInfo) {

            if (error) return callback(error, {
                files: files
            }, redirect);

            if (!fileInfo) return callback(null, {
                files: files
            }, redirect);

            let allFilesProccessed = true;

            files.forEach(function(file, idx) {
                allFilesProccessed = allFilesProccessed && file.proccessed;
            });

            if (allFilesProccessed) {
                callback(null, {
                    files: files
                }, redirect);
            }
        }

        form.uploadDir = configs.tmpDir;

        form.on('fileBegin', function(name, file) {
            tmpFiles.push(file.path);
            // fix #41
            configs.saveFile = true;
            const fileInfo = new FileInfo(file, configs, fields);
            map[fileInfo.key] = fileInfo;
            files.push(fileInfo);
        }).on('field', function(name, value) {
            fields[name] = value;
            if (name === 'redirect') {
                redirect = value;
            }
        }).on('file', function(name, file) {
            const fileInfo = map[FileInfo.getFileKey(file.path)];
            fileInfo.update(file);
            if (!fileInfo.validate()) {
                finish(fileInfo.error);
                fs.unlink(file.path);
                return;
            }

            transporter.post(fileInfo, file, finish);

        }).on('aborted', function() {
            finish('aborted');
            tmpFiles.forEach(function(file) {
                fs.unlink(file);
            });
        }).on('error', function(e) {
            console.log('form.error', e);
            finish(e);
        }).on('progress', function(bytesReceived) {
            if (bytesReceived > configs.maxPostSize) {
                req.connection.destroy();
            }
        }).on('end', function() {
            //if (configs.storage.type == 'local') {
            //    finish();
            //}
        }).parse(req);
    };

    fileUploader.delete = function(req, res, callback) {
        transporter.delete(req, res, callback);
    };

    fileUploader.localDelete = function(file, callback) {
        transporter.localDelete(file, callback);
    };

    return fileUploader;
}
