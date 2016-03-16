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

exports.oldTarballUrlToNew = oldTarballUrlToNew
exports.oldTarballUrlToRegistry2 = oldTarballUrlToRegistry2
