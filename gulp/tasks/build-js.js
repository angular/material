var util = require('../util');

exports.task = function() {
  return util.buildJs(IS_RELEASE_BUILD);
};
