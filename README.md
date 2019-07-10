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

const text = 'broken feed';

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

## Mapping

| Feed        | RSS                                                                                                                                      | Atom                               |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| title       | /rss/channel/title<br>/rss/channel/dc:title                                                                                              | /feed/title                        |
| description | /rss/channel/description<br>/rss/channel/itunes:subtitle                                                                                 | /feed/subtitle                     |
| link        | /rss/channel/link                                                                                                                        | /feed/link[@rel=”alternate”]/@href |
| feedURL     | /rss/channel/atom:link[@rel="self"]/@href                                                                                                | /feed/link[@rel="self"]/@href      |
| updated     | /rss/channel/lastBuildDate<br>/rss/channel/dc:date                                                                                       | /feed/updated                      |
| published   | /rss/channel/pubDate                                                                                                                     |                                    |
| author      | /rss/channel/managingEditor<br>/rss/channel/webMaster<br>/rss/channel/dc:author<br>/rss/channel/dc:creator<br>/rss/channel/itunes:author | /feed/author                       |
| language    | /rss/channel/language<br>/rss/channel/dc:language                                                                                        | /feed/@xml:lang                    |
| image       | /rss/channel/image<br>/rss/channel/itunes:image                                                                                          | /feed/logo                         |
| copyright   | /rss/channel/copyright<br>/rss/channel/dc:rights                                                                                         | /feed/rights<br>/feed/copyright    |
| generator   | /rss/channel/generator                                                                                                                   | /feed/generator                    |
| categories  | /rss/channel/category<br>/rss/channel/itunes:category<br>/rss/channel/itunes:keywords<br>/rss/channel/dc:subject                         | /feed/category                     |

| Item        | RSS                                                                                                                        | Atom                                     |
| ----------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| id          | /rss/channel/item/guid                                                                                                     | /feed/entry/id                           |
| title       | /rss/channel/item/title<br>/rss/channel/item/dc:title                                                                      | /feed/entry/title                        |
| description | /rss/channel/item/description<br>/rss/channel/item/dc:description                                                          | /feed/entry/summary                      |
| content     | /rss/channel/item/content:encoded                                                                                          | /feed/entry/content                      |
| link        | /rss/channel/item/link                                                                                                     | /feed/entry/link[@rel=”alternate”]/@href |
| updated     | /rss/channel/item/dc:date<                                                                                                 | /feed/entry/updated                      |
| published   | /rss/channel/item/pubDate<br>/rss/channel/item/dc:date                                                                     | /feed/entry/published                    |
| author      | /rss/channel/item/author<br>/rss/channel/item/dc:author<br>/rss/channel/item/dc:creator<br>/rss/channel/item/itunes:author | /feed/entry/author                       |
| image       | /rss/channel/item/media:thumbnail                                                                                          |                                          |
| categories  | /rss/channel/item/category<br>/rss/channel/item/dc:subject<br>/rss/channel/item/itunes:keywords                            | /feed/entry/category                     |
| enclosures  | /rss/channel/item/enclosure                                                                                                | /feed/entry/link[@rel=”enclosure”]       |

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table><tr><td align="center"><a href="https://ahmed.sd"><img src="https://avatars1.githubusercontent.com/u/12673605?v=4" width="100px;" alt="Ahmed T. Ali"/><br /><sub><b>Ahmed T. Ali</b></sub></a><br /><a href="https://github.com/Ahmed T. Ali/unread/commits?author=z0al" title="Code">💻</a> <a href="https://github.com/Ahmed T. Ali/unread/commits?author=z0al" title="Documentation">📖</a> <a href="#maintenance-z0al" title="Maintenance">🚧</a> <a href="https://github.com/Ahmed T. Ali/unread/commits?author=z0al" title="Tests">⚠️</a></td></tr></table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Credits

- [Louis-Dominique Dubeau](https://github.com/lddubeau) for their work on [saxes](https://github.com/lddubeau/saxes). We use `saxes` to parse XML strings.
- [Dan MacTough](https://github.com/danmactough) for their work on [node-feedparser](https://github.com/danmactough/node-feedparser). Our work is heavily inspired by `feedparser`.
- [mmcdole](https://github.com/mmcdole) for their work on [gofeed](https://github.com/mmcdole/gofeed). We adopted `gofeed` fields mapping.

## License

MIT © Ahmed T. Ali
