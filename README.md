# mdp-js

## Installation

```shell
bun install
bun run build
```

## Usage

### CLI

```shell
npx @qmaru/mdp-js@latest https://mdpr.jp/news/4690716
```

### Package

```shell
import getMdprImages from './dist/index.js'

const url = "https://mdpr.jp/news/4690716"
const imgUrls = await getMdprImages(url)
console.log(imgUrls)
```
