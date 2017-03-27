import test from 'ava'
import { readFileSync } from 'jsonfile'
import rewriteShrinkwrapUrls from '../'

let shrinkwrap

test.beforeEach((t) => {
  shrinkwrap = readFileSync('fixture.json')
})

test('does not blow up on undefined args', (t) => {
  rewriteShrinkwrapUrls()
  t.pass()
})

test('rewrites to private http://localhost:8080 by default', (t) => {
  rewriteShrinkwrapUrls(shrinkwrap)
  t.is(shrinkwrap.dependencies.abbrev.resolved, 'http://localhost:8080/a/abbrev/_attachments/abbrev-1.0.7.tgz')
  t.is(shrinkwrap.dependencies.abbrev.version, '1.0.7')
  t.is(shrinkwrap.dependencies.abbrev.from, 'abbrev@>=1.0.0 <1.1.0')
  t.is(shrinkwrap.dependencies['uglify-js'].resolved, 'http://localhost:8080/u/uglify-js/_attachments/uglify-js-2.6.2.tgz')
  t.is(shrinkwrap.dependencies['uglify-js'].version, '2.6.2')
  t.is(shrinkwrap.dependencies['uglify-js'].from, 'uglify-js@>=2.6.0 <3.0.0')
  t.is(shrinkwrap.dependencies['uglify-js'].dependencies.async.resolved, 'http://localhost:8080/a/async/_attachments/async-0.2.10.tgz')
  t.is(shrinkwrap.dependencies['uglify-js'].dependencies.async.version, '0.2.10')
  t.is(shrinkwrap.dependencies['uglify-js'].dependencies.async.from, 'async@>=0.2.6 <0.3.0')
})

test('rewrites to private https://private-registry', (t) => {
  rewriteShrinkwrapUrls(shrinkwrap, { newBaseUrl: 'https://private-registry' })
  t.is(shrinkwrap.dependencies.abbrev.resolved, 'https://private-registry/a/abbrev/_attachments/abbrev-1.0.7.tgz')
  t.is(shrinkwrap.dependencies.abbrev.version, '1.0.7')
  t.is(shrinkwrap.dependencies.abbrev.from, 'abbrev@>=1.0.0 <1.1.0')
  t.is(shrinkwrap.dependencies['uglify-js'].resolved, 'https://private-registry/u/uglify-js/_attachments/uglify-js-2.6.2.tgz')
  t.is(shrinkwrap.dependencies['uglify-js'].version, '2.6.2')
  t.is(shrinkwrap.dependencies['uglify-js'].from, 'uglify-js@>=2.6.0 <3.0.0')
  t.is(shrinkwrap.dependencies['uglify-js'].dependencies.async.resolved, 'https://private-registry/a/async/_attachments/async-0.2.10.tgz')
  t.is(shrinkwrap.dependencies['uglify-js'].dependencies.async.version, '0.2.10')
  t.is(shrinkwrap.dependencies['uglify-js'].dependencies.async.from, 'async@>=0.2.6 <0.3.0')
})

test('rewrites to private private-registry', (t) => {
  rewriteShrinkwrapUrls(shrinkwrap, { newBaseUrl: 'private-registry' })
  t.is(shrinkwrap.dependencies.abbrev.resolved, 'http://private-registry/a/abbrev/_attachments/abbrev-1.0.7.tgz')
  t.is(shrinkwrap.dependencies.abbrev.version, '1.0.7')
  t.is(shrinkwrap.dependencies.abbrev.from, 'abbrev@>=1.0.0 <1.1.0')
  t.is(shrinkwrap.dependencies['uglify-js'].resolved, 'http://private-registry/u/uglify-js/_attachments/uglify-js-2.6.2.tgz')
  t.is(shrinkwrap.dependencies['uglify-js'].version, '2.6.2')
  t.is(shrinkwrap.dependencies['uglify-js'].from, 'uglify-js@>=2.6.0 <3.0.0')
  t.is(shrinkwrap.dependencies['uglify-js'].dependencies.async.resolved, 'http://private-registry/a/async/_attachments/async-0.2.10.tgz')
  t.is(shrinkwrap.dependencies['uglify-js'].dependencies.async.version, '0.2.10')
  t.is(shrinkwrap.dependencies['uglify-js'].dependencies.async.from, 'async@>=0.2.6 <0.3.0')
})

test('rewrites to private private-registry:9000/something/', (t) => {
  rewriteShrinkwrapUrls(shrinkwrap, { newBaseUrl: 'private-registry:9000/something/' })
  t.is(shrinkwrap.dependencies.abbrev.resolved, 'http://private-registry:9000/something/a/abbrev/_attachments/abbrev-1.0.7.tgz')
  t.is(shrinkwrap.dependencies.abbrev.version, '1.0.7')
  t.is(shrinkwrap.dependencies.abbrev.from, 'abbrev@>=1.0.0 <1.1.0')
  t.is(shrinkwrap.dependencies['uglify-js'].resolved, 'http://private-registry:9000/something/u/uglify-js/_attachments/uglify-js-2.6.2.tgz')
  t.is(shrinkwrap.dependencies['uglify-js'].version, '2.6.2')
  t.is(shrinkwrap.dependencies['uglify-js'].from, 'uglify-js@>=2.6.0 <3.0.0')
  t.is(shrinkwrap.dependencies['uglify-js'].dependencies.async.resolved, 'http://private-registry:9000/something/a/async/_attachments/async-0.2.10.tgz')
  t.is(shrinkwrap.dependencies['uglify-js'].dependencies.async.version, '0.2.10')
  t.is(shrinkwrap.dependencies['uglify-js'].dependencies.async.from, 'async@>=0.2.6 <0.3.0')
})

test('rewrites to public https://skimdb.npmjs.com/registry', (t) => {
  rewriteShrinkwrapUrls(shrinkwrap, { newBaseUrl: 'https://skimdb.npmjs.com/registry', public: true })
  t.is(shrinkwrap.dependencies.abbrev.resolved, 'https://skimdb.npmjs.com/registry/abbrev/-/abbrev-1.0.7.tgz')
  t.is(shrinkwrap.dependencies.abbrev.version, '1.0.7')
  t.is(shrinkwrap.dependencies.abbrev.from, 'abbrev@>=1.0.0 <1.1.0')
  t.is(shrinkwrap.dependencies['uglify-js'].resolved, 'https://skimdb.npmjs.com/registry/uglify-js/-/uglify-js-2.6.2.tgz')
  t.is(shrinkwrap.dependencies['uglify-js'].version, '2.6.2')
  t.is(shrinkwrap.dependencies['uglify-js'].from, 'uglify-js@>=2.6.0 <3.0.0')
  t.is(shrinkwrap.dependencies['uglify-js'].dependencies.async.resolved, 'https://skimdb.npmjs.com/registry/async/-/async-0.2.10.tgz')
  t.is(shrinkwrap.dependencies['uglify-js'].dependencies.async.version, '0.2.10')
  t.is(shrinkwrap.dependencies['uglify-js'].dependencies.async.from, 'async@>=0.2.6 <0.3.0')
})

test('calls transformer for each url', (t) => {
  let count = 0
  rewriteShrinkwrapUrls(shrinkwrap, {
    transformer: function (newUrl, oldUrl, packageName, version) {
      count++
      return 'https://something/' + packageName + '-' + version + '.tgz'
    }
  })
  t.is(shrinkwrap.dependencies.abbrev.resolved, 'https://something/abbrev-1.0.7.tgz')
  t.is(shrinkwrap.dependencies.abbrev.version, '1.0.7')
  t.is(shrinkwrap.dependencies.abbrev.from, 'abbrev@>=1.0.0 <1.1.0')
  t.is(shrinkwrap.dependencies['uglify-js'].resolved, 'https://something/uglify-js-2.6.2.tgz')
  t.is(shrinkwrap.dependencies['uglify-js'].version, '2.6.2')
  t.is(shrinkwrap.dependencies['uglify-js'].from, 'uglify-js@>=2.6.0 <3.0.0')
  t.is(shrinkwrap.dependencies['uglify-js'].dependencies.async.resolved, 'https://something/async-0.2.10.tgz')
  t.is(shrinkwrap.dependencies['uglify-js'].dependencies.async.version, '0.2.10')
  t.is(shrinkwrap.dependencies['uglify-js'].dependencies.async.from, 'async@>=0.2.6 <0.3.0')
  t.is(count, 669)
})

test('rewrites the "from" field with the syncFrom option', (t) => {
  rewriteShrinkwrapUrls(shrinkwrap, { syncFrom: true })
  t.is(shrinkwrap.dependencies.abbrev.resolved, 'http://localhost:8080/a/abbrev/_attachments/abbrev-1.0.7.tgz')
  t.is(shrinkwrap.dependencies.abbrev.version, '1.0.7')
  t.is(shrinkwrap.dependencies.abbrev.from, 'http://localhost:8080/a/abbrev/_attachments/abbrev-1.0.7.tgz')
  t.is(shrinkwrap.dependencies['uglify-js'].resolved, 'http://localhost:8080/u/uglify-js/_attachments/uglify-js-2.6.2.tgz')
  t.is(shrinkwrap.dependencies['uglify-js'].version, '2.6.2')
  t.is(shrinkwrap.dependencies['uglify-js'].from, 'http://localhost:8080/u/uglify-js/_attachments/uglify-js-2.6.2.tgz')
  t.is(shrinkwrap.dependencies['uglify-js'].dependencies.async.resolved, 'http://localhost:8080/a/async/_attachments/async-0.2.10.tgz')
  t.is(shrinkwrap.dependencies['uglify-js'].dependencies.async.version, '0.2.10')
  t.is(shrinkwrap.dependencies['uglify-js'].dependencies.async.from, 'http://localhost:8080/a/async/_attachments/async-0.2.10.tgz')
})
