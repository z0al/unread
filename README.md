# Unread

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors) [![Build](https://img.shields.io/travis/z0al/unread.svg)](https://travis-ci.org/z0al/unread) [![Bundlephobia](https://img.shields.io/bundlephobia/minzip/unread.svg)](https://bundlephobia.com/result?p=unread)

[![NPM](https://nodei.co/npm/unread.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/unread/)

A package for parsing RSS 2.0, Atom 1.0.

## Installation

```sh
npm add unread
```

## Usage

```javascript
import { parse } from 'unread';

const res = await fetch('https://overreacted.io/rss.xml');
const rss = await res.text();

const output = await parse(rss);
// {
// 	feed: {
// 		title,
// 		description,
// 		...
// 	},
// 	items: [
// 		{
// 			title,
// 			description,
// 			...
// 		}
// 	]
// }
```

### Error handling

```javascript
import { parse } from 'unread';

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
<table><tr><td align="center"><a href="https://ahmed.sd"><img src="https://avatars1.githubusercontent.com/u/12673605?v=4" width="100px;" alt="Ahmed T. Ali"/><br /><sub><b>Ahmed T. Ali</b></sub></a><br /><a href="https://github.com/Ahmed T. Ali/unread/commits?author=z0al" title="Code">💻</a> <a href="https://github.com/Ahmed T. Ali/unread/commits?author=z0al" title="Documentation">📖</a> <a href="#maintenance-z0al" title="Maintenance">🚧</a> <a href="https://github.com/Ahmed T. Ali/unread/commits?author=z0al" title="Tests">⚠️</a></td></tr></table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## License

MIT © Ahmed T. Ali
