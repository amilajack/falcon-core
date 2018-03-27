falcon-core
===========
The cross-database ORM that powers [falcon](https://github.com/falcon-client/falcon)

**Requires `node >= 9` and `yarn >= 0.22.0`**

[![Build Status](https://api.travis-ci.com/amilajack/falcon-core.svg?token=stGf151gAJ11ZUi8LyvG&branch=master)](https://travis-ci.com/amilajack/falcon-core)

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
  * Add documentation
  * Add support for sqlite
  * Import databases as json, csv, and sqlite
  * Export databases/tables/rows as json, csv, xlsl, xml
  * Migrate to Typescript/Flow
  * Refactor to class/interface based architecture
  * Improve error messages
  * Fix/enhance project build configuration
### Release 2.0.0
  * Add support for mysql, mongo, postgres, maria, cassandra

## Installation
```bash
yarn add falcon-core
```

## Example
See the [falcon-core-example](https://github.com/amilajack/falcon-core-example/) repo

## Related
* [falcon](https://github.com/falcon-client/falcon)
