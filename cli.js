#!/usr/bin/env node

var jsonfile = require('jsonfile')
var rewriteShrinkwrapUrls = require('./')

var defaultFile = 'npm-shrinkwrap.json'

var argv = require('yargs')
  .usage('Usage: $0 [npm-shrinkwrap.json] -r <registry> [opts]')
  .option('r', {
    alias: 'registry',
    describe: 'Base URL of the registry to point URLs at',
    type: 'string',
    required: true,
    group: 'Required:'
  })
  .option('f', {
    alias: 'file',
    describe: 'Path of file to write modified shrinkwrap to, defaults to input file',
    type: 'string'
  })
  .option('i', {
    alias: 'stdin',
    describe: 'Read shrinkwrap file contents from stdin',
    type: 'boolean'
  })
  .option('o', {
    alias: 'stdout',
    describe: 'Write modified shrinkwrap content to stdout instead of file',
    type: 'boolean'
  })
  .option('p', {
    alias: 'public',
    describe: 'Use public registry style URLs. Omit this flag when rewriting to npm Enterprise.',
    type: 'boolean'
  })
  .option('s', {
    alias: 'spaces',
    describe: 'Number of spaces per JSON indent of output',
    default: 2,
    type: 'number'
  })
  .option('m', {
    alias: 'from',
    describe: 'Sync the "from" field with the "resolved" field (both will be the rewritten URL)',
    type: 'boolean'
  })
  .check(function (argv) {
    if (argv._.length === 0) argv._.push(defaultFile)
    else if (argv._[0] === '-') argv.stdin = true

    if (argv.stdin && !argv.file) argv.stdout = true

    if (typeof argv.spaces === 'undefined' || isNaN(argv.spaces)) argv.spaces = 2
    return true
  })
  .help().alias('h', 'help')
  .version().alias('v', 'version')
  .argv

var shrinkwrap
var outfile = argv.file || defaultFile

if (argv.stdin) {
  // read from stdin
  shrinkwrap = ''
  process.stdin.resume()
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', function (chunk) {
    shrinkwrap += chunk
  })
  process.stdin.on('end', function () {
    try {
      shrinkwrap = JSON.parse(shrinkwrap)
    } catch (e) {
      console.error('Invalid JSON')
      process.exit(1)
    }
    rewrite()
  })
} else {
  // look for file
  var infile = argv._[0]
  outfile = argv.file || infile
  try {
    shrinkwrap = jsonfile.readFileSync(infile)
  } catch (e) {
    if (infile === defaultFile) {
      console.error('No %s file found', defaultFile)
      process.exit(1)
    }
    // see if actual file contents were passed
    try {
      shrinkwrap = JSON.parse(infile)
      outfile = argv.file || defaultFile
    } catch (er) {
      console.error('Invalid file or JSON content:', infile)
      process.exit(1)
    }
  }

  rewrite()
}

function rewrite () {
  // rewrite urls (modifies shrinkwrap object)
  rewriteShrinkwrapUrls(shrinkwrap, {
    newBaseUrl: argv.registry,
    public: argv.public,
    syncFrom: argv.from
  })

  // output to file or stdout
  if (argv.stdout) {
    console.log(JSON.stringify(shrinkwrap, null, argv.spaces))
  } else {
    jsonfile.writeFileSync(outfile, shrinkwrap, { spaces: argv.spaces })
    console.log('Modified shrinkwrap content successfullly written to:', outfile)
  }
}
