# Feedify

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors) [![Build](https://img.shields.io/travis/z0al/feedify.svg)](https://travis-ci.org/z0al/feedify) [![Bundlephobia](https://img.shields.io/bundlephobia/minzip/feedify.svg)](https://bundlephobia.com/result?p=feedify)

[![NPM](https://nodei.co/npm/feedify.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/feedify/)

A package for parsing RSS 2.0, Atom 1.0.

## Installation

```sh
npm add feedify
```

### React Native

To use this package in React Native you need to install these dependencies first:

```sh
npm add stream string_decoder
```

## Usage

### Simple

```javascript
import { parse } from 'feedify';

fetch('https://overreacted.io/rss.xml')
	.then(resp => {
		return resp.text();
	})
	.then(text => {
		return parse(text);
	})
	.then(data => {
		console.log('Feed: ', data.feed);
		console.log('Items: ', data.items);
	});
```

### Stream-like

If you want more control you can use parsers directly. E.g.:

```javascript
import { RSSParser } from 'feedify';

const parser = new RSSParser();

parser.write('<rss> ....');
parser.write('... </rss>');
// ...

// You MUST close the stream or an infinite loop might happen
parser.close();

for (let item of parser.items()) {
	console.log(item);
}

console.log(parser.feed());
```

### Error handling

```javascript
import { parse } from 'feedify';

const text = 'borken feed';

// using .catch
parse(text)
	.then(output => console.log(output))
	.catch(err => {
		console.log('Oops, ', err);
	});

// OR, using try catch

try {
	const output = await parse(text);
	console.log(output);
} catch (err) {
	console.log('Oops, ', err);
}
```

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table><tr><td align="center"><a href="https://ahmed.sd"><img src="https://avatars1.githubusercontent.com/u/12673605?v=4" width="100px;" alt="Ahmed T. Ali"/><br /><sub><b>Ahmed T. Ali</b></sub></a><br /><a href="https://github.com/Ahmed T. Ali/feedify/commits?author=z0al" title="Code">💻</a> <a href="https://github.com/Ahmed T. Ali/feedify/commits?author=z0al" title="Documentation">📖</a> <a href="#maintenance-z0al" title="Maintenance">🚧</a> <a href="https://github.com/Ahmed T. Ali/feedify/commits?author=z0al" title="Tests">⚠️</a></td></tr></table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## License

MIT © Ahmed T. Ali
