"use strict";

var eslint = require("eslint").linter
var Config = require("eslint/lib/config");

var stylish = require("eslint/lib/formatters/stylish")

/**
 * linter
 *
 * @param  {String|Buffer} input
 * @param  {Object} config
 * @param  {Object} webpack
 */
function lint(input, config, webpack) {
  var res = eslint.verify(input, config)
  if (res.length) {
    var reporter = webpack.options.eslint.reporter || function(results) {
      // in order to use eslint formatters
      // we need to reproduce the object passed to them
      var msgs = stylish([{
        filePath: "",
        messages: results
      }]).split("\n")
      // drop the line that should contains filepath we do not have
      msgs.splice(0, 1)

      return msgs.join("\n")
    }
    var messages = reporter(res)
    var emitter = webpack.options.eslint.emitErrors ? webpack.emitError : webpack.emitWarning

    if (emitter) {
      emitter(messages)
    }
    else {
      throw new Error("Your module system doesn't support emitWarning. Update available? \n" + messages)
    }
  }
}

/**
 * webpack loader
 *
 * @param  {String|Buffer} input
 * @return {String|Buffer}
 */
module.exports = function(input) {
  this.options.eslint = this.options.eslint || {}

  this.cacheable()

  // sync
  var config = new Config(this.options.eslint).getConfig()
  lint(input, config, this)
  return input
}
