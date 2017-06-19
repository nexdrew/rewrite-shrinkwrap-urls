import test from 'ava'
import { exec } from 'child_process'
import { resolve } from 'path'
import del from 'del'
import { readFileSync } from 'jsonfile'

const cli = resolve(__dirname, '..', 'cli.js')
const fixture = resolve(__dirname, 'fixture2.json')
const outfile = resolve(__dirname, 'deleteme.json')
const fixturePackageLock = resolve(__dirname, 'fixture-package-lock.json')
const outfilePackageLock = resolve(__dirname, 'deleteme-package-lock.json')

function run (cmd) {
  let done
  const promise = new Promise((resolve, reject) => {
    done = resolve
  })
  exec(cmd, (error, stdout, stderr) => {
    done({ error, stdout, stderr, code: (error && error.code) || 0 })
  })
  return promise
}

test('cli fails when -r, --registry option not given', async t => {
  const result = await run(`${cli}`)
  t.regex(result.stderr, /Missing required argument: r/)
  t.is(result.code, 1)
})

test('cli fails when default input file not found', async t => {
  const result = await run(`${cli} -r localhost`)
  t.regex(result.stderr, /No npm-shrinkwrap.json file found/)
  t.is(result.code, 1)
})

test('cli fails when arg given but file not found', async t => {
  const result = await run(`${cli} /bblah/dne -r localhost`)
  t.regex(result.stderr, /Invalid file or JSON content: \/bblah\/dne/)
  t.is(result.code, 1)
})

test('cli writes to stdout with -o option given', async t => {
  const result = await run(`${cli} ${fixture} -r https://private-registry -o`)
  const sliced = result.stdout.split('\n').slice(4, 14)
  t.is(sliced[0], '    "ansi-regex": {')
  t.is(sliced[1], '      "version": "2.0.0",')
  t.is(sliced[2], '      "from": "ansi-regex@>=2.0.0 <3.0.0",')
  t.is(sliced[3], '      "resolved": "https://private-registry/a/ansi-regex/_attachments/ansi-regex-2.0.0.tgz"')
  t.is(sliced[4], '    },')
  t.is(sliced[5], '    "builtin-modules": {')
  t.is(sliced[6], '      "version": "1.1.1",')
  t.is(sliced[7], '      "from": "builtin-modules@>=1.0.0 <2.0.0",')
  t.is(sliced[8], '      "resolved": "https://private-registry/b/builtin-modules/_attachments/builtin-modules-1.1.1.tgz"')
  t.is(sliced[9], '    },')
  t.is(result.code, 0)
})

test('cli writes to file specified with -f option', async t => {
  try {
    const result = await run(`${cli} ${fixture} -f ${outfile} -r localhost:8080`)
    t.regex(result.stdout, /Modified shrinkwrap content successfullly written to:/)
    t.is(result.code, 0)
    const output = readFileSync(outfile)
    t.deepEqual(output.dependencies['ansi-regex'], {
      version: '2.0.0',
      from: 'ansi-regex@>=2.0.0 <3.0.0',
      resolved: 'http://localhost:8080/a/ansi-regex/_attachments/ansi-regex-2.0.0.tgz'
    })
    t.deepEqual(output.dependencies['builtin-modules'], {
      version: '1.1.1',
      from: 'builtin-modules@>=1.0.0 <2.0.0',
      resolved: 'http://localhost:8080/b/builtin-modules/_attachments/builtin-modules-1.1.1.tgz'
    })
  } catch (_) {
    // ignore
  } finally {
    await del(outfile)
  }
})

test('cli accepts shrinkwrap content from stdin', async t => {
  const result = await run(`cat ${fixture} | ${cli} -p -r https://r.cnpmjs.org -`)
  const sliced = result.stdout.split('\n').slice(4, 14)
  t.is(sliced[0], '    "ansi-regex": {')
  t.is(sliced[1], '      "version": "2.0.0",')
  t.is(sliced[2], '      "from": "ansi-regex@>=2.0.0 <3.0.0",')
  t.is(sliced[3], '      "resolved": "https://r.cnpmjs.org/ansi-regex/-/ansi-regex-2.0.0.tgz"')
  t.is(sliced[4], '    },')
  t.is(sliced[5], '    "builtin-modules": {')
  t.is(sliced[6], '      "version": "1.1.1",')
  t.is(sliced[7], '      "from": "builtin-modules@>=1.0.0 <2.0.0",')
  t.is(sliced[8], '      "resolved": "https://r.cnpmjs.org/builtin-modules/-/builtin-modules-1.1.1.tgz"')
  t.is(sliced[9], '    },')
  t.is(result.code, 0)
})

test('cli fails with invalid json on stdin', async t => {
  const result = await run(`echo "invalid" | ${cli} -i -r localhost`)
  t.regex(result.stderr, /Invalid JSON/)
  t.is(result.code, 1)
})

test('cli supports json on command line instead of path to file', async t => {
  const result = await run(`${cli} '{"cliui":{"resolved":"https://registry.npmjs.org/cliui/-/cliui-3.2.0.tgz"}}' -o -r localhost -s 4`)
  const split = result.stdout.split('\n')
  t.is(split[0], '{')
  t.is(split[1], '    "cliui": {')
  t.is(split[2], '        "resolved": "http://localhost/c/cliui/_attachments/cliui-3.2.0.tgz"')
  t.is(split[3], '    }')
  t.is(split[4], '}')
  t.is(result.code, 0)
})

test('cli updates the "from" field with -m option given', async t => {
  const result = await run(`${cli} ${fixture} -r https://private-registry -om`)
  const sliced = result.stdout.split('\n').slice(4, 14)
  t.is(sliced[0], '    "ansi-regex": {')
  t.is(sliced[1], '      "version": "2.0.0",')
  t.is(sliced[2], '      "from": "https://private-registry/a/ansi-regex/_attachments/ansi-regex-2.0.0.tgz",')
  t.is(sliced[3], '      "resolved": "https://private-registry/a/ansi-regex/_attachments/ansi-regex-2.0.0.tgz"')
  t.is(sliced[4], '    },')
  t.is(sliced[5], '    "builtin-modules": {')
  t.is(sliced[6], '      "version": "1.1.1",')
  t.is(sliced[7], '      "from": "https://private-registry/b/builtin-modules/_attachments/builtin-modules-1.1.1.tgz",')
  t.is(sliced[8], '      "resolved": "https://private-registry/b/builtin-modules/_attachments/builtin-modules-1.1.1.tgz"')
  t.is(sliced[9], '    },')
  t.is(result.code, 0)
})

test('cli supports an explicit package-lock.json file', async t => {
  try {
    const result = await run(`${cli} ${fixturePackageLock} --file ${outfilePackageLock} --registry https://skimdb.npmjs.com/registry --public`)
    t.regex(result.stdout, /Modified shrinkwrap content successfullly written to:/)
    t.is(result.code, 0)
    const output = readFileSync(outfilePackageLock)
    t.is(output.lockfileVersion, 1)
    t.deepEqual(output.dependencies['@ava/babel-preset-stage-4'], {
      version: '1.1.0',
      resolved: 'https://skimdb.npmjs.com/registry/@ava/babel-preset-stage-4/-/babel-preset-stage-4-1.1.0.tgz',
      integrity: 'sha512-oWqTnIGXW3k72UFidXzW0ONlO7hnO9x02S/QReJ7NBGeiBH9cUHY9+EfV6C8PXC6YJH++WrliEq03wMSJGNZFg==',
      dev: true,
      dependencies: {
        'md5-hex': {
          version: '1.3.0',
          resolved: 'https://skimdb.npmjs.com/registry/md5-hex/-/md5-hex-1.3.0.tgz',
          integrity: 'sha1-0sSv6YPENwZiF5uMrRRSGRNQRsQ=',
          dev: true
        },
        'package-hash': {
          version: '1.2.0',
          resolved: 'https://skimdb.npmjs.com/registry/package-hash/-/package-hash-1.2.0.tgz',
          integrity: 'sha1-AD5WzVe3NqbtYRTMK4FUJnJ3DkQ=',
          dev: true
        }
      }
    })
    t.deepEqual(output.dependencies.jsonfile, {
      version: '3.0.0',
      resolved: 'https://skimdb.npmjs.com/registry/jsonfile/-/jsonfile-3.0.0.tgz',
      integrity: 'sha1-kufHRE5f/V+jLmqa6LhQNN+DR9A='
    })
  } catch (_) {
    // ignore
  } finally {
    await del(outfilePackageLock)
  }
})
