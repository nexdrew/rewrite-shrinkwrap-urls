// copied from https://github.com/npm/rewrite-url-follower/blob/master/lib/npm-urls.js

/*
Copyright (c) 2015, Contributors

Permission to use, copy, modify, and/or distribute this software
for any purpose with or without fee is hereby granted, provided
that the above copyright notice and this permission notice
appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES
OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE
LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES
OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS,
WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION,
ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

var url = require('url')
var path = require('path')
var assert = require('assert')

// Takes an old-style tarball URL, like http://registry.npmjs.org/npm/-/npm-2.1.6.tgz
// (or just /npm/-/npm-2.1.6.tgz) and package name (since determining it from
// the filename would be pretty complicated because versions can have '-' in them)
// and converts it to new-style tarball URL, like /n/npm/_attachments/npm-2.1.6.tgz.
function oldTarballUrlToNew (packageName, old) {
  assert(old && typeof old === 'string')
  assert(packageName && typeof packageName === 'string')

  var filename = path.basename(old)
  return '/' + packageName[0] + '/' + packageName + '/_attachments/' + filename
}

// the tarball URL format used by registry 2.0.
// http://registry.npmjs.org/chuey/-/chuey-0.0.7.tgz
function oldTarballUrlToRegistry2 (packageName, old) {
  assert(old && typeof old === 'string')
  assert(packageName && typeof packageName === 'string')

  var filename = path.basename(old)
  return '/' + packageName + '/-/' + filename
}

// convert a registry 2.0 format URL to the
// old style tarball URL.
function registry2UrlToOldTarball (url) {
  var parts = parseNewTarballUrl(url)
  return '/' + parts.name + '/-/' + parts.name + '-' + parts.version + '.tgz'
}

// Takes a package.json with old-style URLs and rewrites them all to new-style
// URLs starting with `host' (modifying the object).
function rewriteOldTarballUrls (host, packageJson, registry2) {
  assert(host && typeof host === 'string')
  assert(packageJson && typeof packageJson === 'object')

  if (!packageJson.versions) return
  Object.keys(packageJson.versions).forEach(function (version) {
    var versionObject = packageJson.versions[version]
    if (registry2) {
      versionObject.dist.tarball = host + oldTarballUrlToRegistry2(packageJson.name, versionObject.dist.tarball)
    } else {
      versionObject.dist.tarball = host + oldTarballUrlToNew(packageJson.name, versionObject.dist.tarball)
    }
  })
}

// Parses a new-style tarball URL (with hostname or not), returning `{ name: ...,
// version: ... }`.
function parseNewTarballUrl (tarballUrl) {
  assert(tarballUrl && typeof tarballUrl === 'string')

  var urlSplit = url.parse(tarballUrl).path.split('/')

  if (urlSplit[1] === '@') {
    return {
      name: urlSplit[2] + '/' + urlSplit[3],
      version: urlSplit[5].slice(urlSplit[3].length + 1, -4) // -'.tgz'.length
    }
  } else if (urlSplit[1].match(/^@/)) {
    // /@bcoe/demo0002/-/demo0002-15.0.12.tgz
    return {
      name: urlSplit[1] + '/' + urlSplit[2],
      version: urlSplit[4].slice(urlSplit[2].length + 1, -4) // -'.tgz'.length
    }
  } else {
    var name = urlSplit[2]
    return {
      name: name,
      version: urlSplit[4].slice(name.length + 1, -4) // -'.tgz'.length
    }
  }
}

exports.oldTarballUrlToNew = oldTarballUrlToNew
exports.oldTarballUrlToRegistry2 = oldTarballUrlToRegistry2
exports.registry2UrlToOldTarball = registry2UrlToOldTarball
exports.rewriteOldTarballUrls = rewriteOldTarballUrls
exports.parseNewTarballUrl = parseNewTarballUrl
