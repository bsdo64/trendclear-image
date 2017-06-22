/**
 * Created by dobyeongsu on 2017. 6. 16..
 */

const deleteFile = require('./deleteFilePromise.js');
const formidablePromise = require('./formidablePromise.js');
const summaryResults = require('./summaryResults.js');
const renameFiles = require('./renameFiles.js');
const imageProcessing = require('./imageProcessing.js');

module.exports = {
  deleteFile,
  formidablePromise,
  summaryResults,
  renameFiles,
  imageProcessing
};