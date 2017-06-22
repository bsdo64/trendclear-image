/**
 * Created by dobyeongsu on 2017. 6. 20..
 */
module.exports = (formidableResults, utils, config) => {
  const files = formidableResults.files.map(file => {
    return utils.renameFile(file, config)
  });
  return Promise.all(files)
};