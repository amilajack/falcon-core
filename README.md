falcon-core
===========
The cross-database ORM that powers [falcon](https://github.com/amilajack/falcon)

**Requires `node >= 9`**

[![Build Status](https://api.travis-ci.com/amilajack/falcon-core.svg?token=stGf151gAJ11ZUi8LyvG&branch=master)](https://travis-ci.com/amilajack/falcon-core) [![Greenkeeper badge](https://badges.greenkeeper.io/amilajack/falcon-core.svg?token=7b291f402094f6dbfcff062d24843d5af6c66ee64024992f85679cf56e8bd8af&ts=1534297447974)](https://greenkeeper.io/)

## Setup
```bash
git clone https://github.com/amilajack/falcon-core
cd falcon-core
lerna bootstrap
lerna run build
yarn build
```

## Roadmap
### Release 1.0.0
  - [x] Add support for sqlite
  - [x] Import databases as json, csv, and sqlite
  - [x] Export databases/tables/rows as json, csv, xlsl, xml
  - [x] Migrate to Typescript/Flow
  - [x] Refactor to class/interface based architecture
  - [x] Improve error messages
  - [x] Fix/enhance project build configuration
  - [ ] Add documentation
### Release 2.0.0
  - [ ] Add support for mysql, mongo, postgres, maria, cassandra

## Installation
```bash
yarn add falcon-core
```

## Example
See the [falcon-core-example](https://github.com/amilajack/falcon-core-example/) repo

## Related
* [falcon](https://github.com/falcon-client/falcon)
