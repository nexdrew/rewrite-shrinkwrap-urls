#!/usr/bin/env node
'use strict'

const jsonfile = require('jsonfile')
const rewriteShrinkwrapUrls = require('./')

const defaultFile = 'npm-shrinkwrap.json'
let argv
let outfile
let shrinkwrap

require('sywac')
  .positional(`[${defaultFile}] -r <registry>`, {
    ignore: '-r <registry>',
    params: [{
      desc: 'The input shrinkwrap file containing urls to rewrite. You can omit this if --stdin is used.',
      type: 'file',
      defaultValue: defaultFile
    }]
  })
  .string('-r, --registry <registry>', {
    desc: 'Base URL of the registry to point URLs at',
    required: true,
    group: 'Required:'
  })
  .file('-f, --file <output>', {
    desc: 'Path of file to write modified shrinkwrap to, defaults to input file'
  })
  .boolean('-i, --stdin', {
    desc: 'Read shrinkwrap file contents from stdin'
  })
  .boolean('-o, --stdout', {
    desc: 'Write modified shrinkwrap content to stdout instead of file'
  })
  .boolean('-p, --public', {
    desc: 'Use public registry style URLs. Omit this flag when rewriting to npm Enterprise.'
  })
  .number('-s, --spaces <num>', {
    desc: 'Number of spaces per JSON indent of output',
    defaultValue: 2
  })
  .boolean('-m, --from', {
    desc: 'Sync the "from" field with the "resolved" field (both will be the rewritten URL)'
  })
  .help('-h, --help')
  .version('-v, --version')
  .outputSettings({ maxWidth: 76 })
  .check(argv => {
    if (argv[defaultFile] === '-') argv.stdin = true

    if (argv.stdin && !argv.file) argv.stdout = true

    if (typeof argv.spaces === 'undefined' || isNaN(argv.spaces)) argv.spaces = 2
  })
  .parseAndExit()
  .then(parsedArgv => {
    argv = parsedArgv
    outfile = argv.file || defaultFile
    if (argv.stdin) {
      return new Promise(resolve => {
        // read from stdin
        shrinkwrap = ''
        process.stdin.resume()
        process.stdin.setEncoding('utf8')
        process.stdin.on('data', chunk => {
          shrinkwrap += chunk
        })
        process.stdin.on('end', () => {
          try {
            shrinkwrap = JSON.parse(shrinkwrap)
          } catch (e) {
            console.error('Invalid JSON')
            process.exit(1)
          }
          resolve()
        })
      })
    } else {
      return new Promise(resolve => {
        // look for file
        const infile = argv[defaultFile]
        outfile = argv.file || infile
        jsonfile.readFile(infile, (e, content) => {
          if (!e) {
            shrinkwrap = content
            return resolve()
          }
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
          resolve()
        })
      })
    }
  })
  .then(whenDone => {
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
  })
