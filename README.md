# rewrite-shrinkwrap-urls

[![Greenkeeper badge](https://badges.greenkeeper.io/nexdrew/rewrite-shrinkwrap-urls.svg)](https://greenkeeper.io/)

> Rewrite URLs in npm-shrinkwrap.json

[![Build Status](https://travis-ci.org/nexdrew/rewrite-shrinkwrap-urls.svg?branch=master)](https://travis-ci.org/nexdrew/rewrite-shrinkwrap-urls)
[![Coverage Status](https://coveralls.io/repos/github/nexdrew/rewrite-shrinkwrap-urls/badge.svg?branch=master)](https://coveralls.io/github/nexdrew/rewrite-shrinkwrap-urls?branch=master)

Sometimes it's necessary to update the "resolved" URLs in an `npm-shrinkwrap.json` file - for instance, when you want to point all packages to a private npm registry like [npm Enterprise](https://www.npmjs.com/enterprise).

This package provides a tool to do just that. It comes with a convenient CLI, but it can be easily used as a module in some other grander logic as well.

## Install and Usage

### CLI

Install as global (binary) module:

```
$ npm install -g rewrite-shrinkwrap-urls
```

View help content:

```
$ rewrite-shrinkwrap-urls --help
Usage: rewrite-shrinkwrap-urls [npm-shrinkwrap.json] -r <registry> [opts]

Required:
  -r, --registry  Base URL of the registry to point URLs at  [string] [required]

Options:
  -f, --file     Path of file to write modified shrinkwrap to, defaults to input
                 file                                                   [string]
  -i, --stdin    Read shrinkwrap file contents from stdin              [boolean]
  -o, --stdout   Write modified shrinkwrap content to stdout instead of file
                                                                       [boolean]
  -p, --public   Use public registry style URLs. Omit this flag when rewriting
                 to npm Enterprise.                                    [boolean]
  -s, --spaces   Number of spaces per JSON indent of output[number] [default: 2]
  -m, --from     Sync the "from" field with the "resolved" field (both will be
                 the rewritten URL)                                    [boolean]
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]
```

Rewrite all URLs in the current directory's `npm-shrinkwrap.json`, pointing to the private registry at `https://private-registry`:

```
$ rewrite-shrinkwrap-urls -r https://private-registry
```

Read `npm-shrinkwrap-OLD.json` and write the modified content to `npm-shrinkwrap-NEW.json`:

```
$ rewrite-shrinkwrap-urls npm-shrinkwrap-OLD.json -r https://private-registry -f npm-shrinkwrap-NEW.json
```

Read shrinkwrap file from stdin and output the modified content to stdout:

```
$ rewrite-shrinkwrap-urls -r localhost:8080 -i < npm-shrinkwrap.json
$ cat npm-shrinkwrap.json | rewrite-shrinkwrap-urls -r localhost:8080 -
```

### Module

Install to local `node_modules` directory and add dependency to `package.json`:

```
$ npm install --save rewrite-shrinkwrap-urls
```

Use the module to synchronously modify an object in-place:

```js
// require the module
var rewriteShrinkwrapUrls = require('rewrite-shrinkwrap-urls')

// read shrinkwrap object into memory
var shrinkwrap = JSON.parse(require('fs').readFileSync('npm-shrinkwrap.json', { encoding: 'utf8' }))

// modify the shrinkwrap object synchronously
rewriteShrinkwrapUrls(shrinkwrap, { newBaseUrl: 'https://private-registry' })

// do something with shrinkwrap
console.log(shrinkwrap)
```

## API

### `rewriteShrinkwrapUrls(shrinkwrap, opts)`

#### Arguments

- `shrinkwrap`: object

    Shrinkwrap content as an object in memory.

- `opts`: object

    Options object.

#### Options

- `newBaseUrl`: string

    Base URL of new registry to point package URLs at. Default is `'http://localhost:8080'`.

- `public`: boolean

    Whether to use public registry style URLs or not. A public registry tarball URL looks like `https://registry.npmjs.org/through/-/through-2.3.8.tgz` while a private registry tarball URL looks like `http://localhost:8080/t/through/_attachments/through-2.3.8.tgz`. Default is `false` (use private registry URL style).

- `transformer`: function

    A function that will be called for each modified URL, allowing any custom check or modification to be done. The default function simply returns the `newUrl`.

    Arguments:

    - `newUrl`: string
    - `oldUrl`: string
    - `packageName`: string
    - `version`: string

    Returns the desired URL as a string

- `syncFrom`: boolean

    Whether to sync the `"from"` field with the `"resolved"` field for each dependency in the shrinkwrap content. Syncing them means that both fields will updated/rewritten to the new URL.

## License

ISC © Contributors
