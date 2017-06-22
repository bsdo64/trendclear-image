/*jslint node: true */
const fs = require('fs');
const formidable = require('formidable');
const FileInfo = require('../fileinfo.js');
const sharp = require('sharp');
const path = require('path');
const async = require('async');

module.exports = function(opts) {

    const api = {
        options: opts,
        /**
         * get files
         */
        get: function(callback) {
            const files = [],
                options = this.options;
            // fix #41
            options.saveFile = false;
            fs.readdir(options.uploadDir, function(err, list) {
                list.forEach(function(name) {
                    const stats = fs.statSync(options.uploadDir + '/' + name);
                    if (stats.isFile() && name[0] !== '.') {
                        const fileInfo = new FileInfo({
                            name: name,
                            size: stats.size,
                            lastMod: stats.mtime
                        }, options);
                        fileInfo.initUrls();
                        files.push(fileInfo);
                    }
                });
                callback(null, {
                    files: files
                });
            });
        },
        proccessVersionFile: function(versionObj, cbk) {

            const options = api.options;
            const retVal = versionObj;

            // gm(options.uploadDir + '/' + versionObj.fileInfo.name)
            //   .size(function (error, size) {
            //       if (error) return cbk(error, versionObj.version);
            //
            //       //update pics width and height
            //       if (!retVal.fileInfo.width) {
            //           retVal.fileInfo.width = size.width || 50; //incase we don't get a valid width
            //           retVal.fileInfo.height = size.height || retVal.fileInfo.width;
            //       }
            //
            //       const opts0 = options.imageVersions[versionObj.version];
            //       if (opts0.height == 'auto') {
            //           retVal.width = opts0.width;
            //           retVal.height = (opts0.width / retVal.fileInfo.width) * retVal.fileInfo.height;
            //           gm(options.uploadDir + '/' + versionObj.fileInfo.name)
            //             .resize(opts0.width, retVal.height)
            //             .write(options.uploadDir + '/' + versionObj.version + '/' + versionObj.fileInfo.name, function(err) {
            //               if (err) {
            //                   cbk(err, retVal);
            //                   return;
            //               }
            //               cbk(null, retVal);
            //           });
            //           return
            //       }
            //
            //       retVal.width = opts0.width;
            //       retVal.height = opts0.height;
            //       gm(options.uploadDir + '/' + versionObj.fileInfo.name)
            //         .resize(opts0.width, opts0.height)
            //         .write(options.uploadDir + '/' + versionObj.version + '/' + versionObj.fileInfo.name, function(err) {
            //           if (err) {
            //               return cbk(err, retVal);
            //           }
            //           cbk(null, retVal);
            //       });
            //   });

/*
            lwip.open(options.uploadDir + '/' + versionObj.fileInfo.name, function(error, image) {

                if (error) return cbk(error, versionObj.version);

                //update pics width and height
                if (!retVal.fileInfo.width) {
                    retVal.fileInfo.width = image.width() || 50; //incase we don't get a valid width
                    retVal.fileInfo.height = image.height() || retVal.fileInfo.width;
                }

                console.log(image);

                const opts0 = options.imageVersions[versionObj.version];
                if (opts0.height == 'auto') {

                    retVal.width = opts0.width;
                    retVal.height = (opts0.width / retVal.fileInfo.width) * retVal.fileInfo.height;
                    image
                        .batch()
                        .resize(opts0.width, retVal.height)
                        .writeFile(
                            options.uploadDir + '/' + versionObj.version + '/' + versionObj.fileInfo.name,
                            {},
                            function(err) {
                                if (err) {
                                    cbk(err, retVal);
                                    return;
                                }
                                cbk(null, retVal);
                            });
                    return;
                }
                retVal.width = opts0.width;
                retVal.height = opts0.height;
                image
                    .batch()
                    .resize(opts0.width, opts0.height)
                    .writeFile(
                        options.uploadDir + '/' + versionObj.version + '/' + versionObj.fileInfo.name,
                        {},
                        function(err) {
                            if (err) {
                                cbk(err, retVal);
                                return;
                            }
                            cbk(null, retVal);
                        });
            });
*/

          const image = sharp(options.uploadDir + '/' + versionObj.fileInfo.name);
          image
              .metadata()
              .then(metadata => {
                if (!retVal.fileInfo.width) {
                  retVal.fileInfo.width = metadata.width || 50; //incase we don't get a valid width
                  retVal.fileInfo.height = metadata.height || retVal.fileInfo.width;
                }

                const opts0 = options.imageVersions[versionObj.version];
                if (opts0.height === 'auto') {

                  retVal.width = opts0.width;
                  retVal.height = parseInt((opts0.width / retVal.fileInfo.width) * retVal.fileInfo.height);
                  image
                      .resize(opts0.width, retVal.height)
                      .toFile(options.uploadDir + '/' + versionObj.version + '/' + versionObj.fileInfo.name, function(err, info) {
                        if (err) {
                          cbk(err, retVal);
                          return;
                        }
                        cbk(null, retVal);
                      });

                  return;
                }

                retVal.width = opts0.width;
                retVal.height = opts0.height;

                image
                    .resize(opts0.width, opts0.height)
                    .toFile(options.uploadDir + '/' + versionObj.version + '/' + versionObj.fileInfo.name, function(err, info) {
                      if (err) {
                        cbk(err, retVal);
                        return;
                      }
                      cbk(null, retVal);
                    });
              })
              .catch(err => {
                return cbk(err, versionObj.version);
              })
        },
        post: function(fileInfo, file, finish) {

            const me = this,
                options = this.options,
                versionFuncs = [];


            fs.renameSync(file.path, options.uploadDir + '/' + fileInfo.name);

            if ((!options.copyImgAsThumb) || (!options.imageTypes.test(fileInfo.name))) {
                fileInfo.initUrls();
                fileInfo.proccessed = true;
                return finish(null, fileInfo);
            }


            Object.keys(options.imageVersions).forEach(function(version) {

                versionFuncs.push({
                    version: version,
                    fileInfo: fileInfo
                });

            });


            async.map(versionFuncs, me.proccessVersionFile, function(err, results) {

                results.forEach(function(v, i) {
                    fileInfo.versions[v.version] = {
                        err: v.err,
                        width: v.width,
                        height: v.height
                    };
                });
                fileInfo.initUrls();
                fileInfo.proccessed = true;
                finish(err, fileInfo);

            });


        },
        delete: function(req, res, callback) {
            const options = this.options;
            let fileName = '';

            if (req.url.slice(0, options.uploadUrl.length) === options.uploadUrl) {
                fileName = path.basename(decodeURIComponent(req.body.file));
                if (fileName[0] !== '.') {
                    fs.access(options.uploadDir + '/' + fileName, fs.F_OK, function (err) {
                        if (err) {
                            callback(new Error('File doesn\'t exist!'), null);
                            return ;
                        }
                        fs.unlink(options.uploadDir + '/' + fileName, function(ex) {
                            Object.keys(options.imageVersions).forEach(function(version) {
                                // TODO - Missing callback
                                fs.unlink(options.uploadDir + '/' + version + '/' + fileName, (e) => {});
                            });
                            callback(null, {
                                success: true
                            });
                        });
                    });
                    return;
                }
            }
            callback(new Error('File name invalid:' + fileName), null);
        },
        localDelete: function (fileObj, callback) {
            const options = this.options;
            const fileName = fileObj.name;

            if (fileName !== '.') {
                fs.access(options.uploadDir + '/' + fileName, fs.F_OK, function (err) {
                    if (err) {
                        callback(new Error('File doesn\'t exist!'), null);
                        return ;
                    }
                    fs.unlink(options.uploadDir + '/' + fileName, function(ex) {
                        callback(null, {
                            success: true
                        });
                    });
                });
                return;
            }
            callback(new Error('File name invalid:' + fileName), null);
        }
    };

    return api;

};
