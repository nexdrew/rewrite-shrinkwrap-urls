var npmUrls = require('./lib/npm-urls')
var url = require('url')
var visit = require('./lib/visit')

module.exports = function rewriteShrinkwrapUrls (shrinkwrap, opts) {
  if (!shrinkwrap) return

  opts = opts || {}

  var transformer = typeof opts.transformer === 'function'
    ? opts.transformer
    : function (after, before, name, version) { return after }
  var npmUrl = opts.public ? npmUrls.oldTarballUrlToRegistry2 : npmUrls.oldTarballUrlToNew
  var baseUrl = parseBaseUrl(opts.newBaseUrl || 'http://localhost:8080')

  var before
  var after

  visit(shrinkwrap, function (value, key, parent) {
    if (typeof value === 'object' && 'resolved' in value) {
      before = value.resolved
      after = baseUrl + npmUrl(key, before)
      value.resolved = transformer(after, before, key, value.version)
      if (opts.from) {
        value.from = value.resolved
      }
    }
  })
}

function parseBaseUrl (baseUrl) {
  var parsed = baseUrl.indexOf('http') === 0 ? url.parse(baseUrl) : url.parse('http://' + baseUrl)
  var proto = parsed.protocol || 'http:'
  if (proto.lastIndexOf('//') === -1) proto += '//'
  baseUrl = proto + parsed.host + (parsed.pathname || '')
  return baseUrl.charAt(baseUrl.length - 1) === '/' ? baseUrl.slice(0, -1) : baseUrl
}
