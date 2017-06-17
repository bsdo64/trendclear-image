const path = require('path');

const currentPath = path.resolve(__dirname);
const rootPath = path.resolve(currentPath, '../');
const publicPath = path.resolve(rootPath, 'public');
const iodPath = path.resolve(publicPath, 'iod');
const iodTempDir = path.resolve(iodPath, 'tmp');
const iodFilesDir = path.resolve(iodPath, 'files');

module.exports = {
  secret: '75a1b28ee65177fbb78000e0fc637b66324a83d2570b932fa475a0671223a1c8',
  testHash: '75a1b28ee65177fbb78000e0fc637b66324a83d2570b932fa475a0671223a1c8',
  server: {
    name: 'iod',
    port: '3002',
    hostname: 'localhost',
    publicPath: publicPath,
    filesDir: iodFilesDir
  },
  formidable: {
    tmpDir: iodTempDir,
    uploadDir: iodFilesDir,
    maxFields: 1000,
    maxFieldsSize: 2 * 1024 * 1024,
    keepExtensions: false,
    encoding: 'utf-8',
    headers: null,
    type: 'multipart',
    multiples: false,
  }
};