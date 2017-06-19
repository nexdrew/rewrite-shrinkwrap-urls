'use strict'

const npmUrls = require('./lib/npm-urls')
const url = require('url')
const visit = require('./lib/visit')

module.exports = function rewriteShrinkwrapUrls (shrinkwrap, opts) {
  if (!shrinkwrap) return

  opts = opts || {}

  const transformer = typeof opts.transformer === 'function'
    ? opts.transformer
    : (after, before, name, version) => after
  const npmUrl = opts.public ? npmUrls.oldTarballUrlToRegistry2 : npmUrls.oldTarballUrlToNew
  const baseUrl = parseBaseUrl(opts.newBaseUrl || 'http://localhost:8080')

  let before
  let after

  visit(shrinkwrap, (value, key, parent) => {
    if (typeof value === 'object' && 'resolved' in value) {
      before = value.resolved
      after = baseUrl + npmUrl(key, before)
      value.resolved = transformer(after, before, key, value.version)
      if (opts.syncFrom) {
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
