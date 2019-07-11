# Unread

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors) [![Build](https://img.shields.io/travis/z0al/unread.svg)](https://travis-ci.org/z0al/unread) [![Bundlephobia](https://img.shields.io/bundlephobia/minzip/unread.svg)](https://bundlephobia.com/result?p=unread)

[![NPM](https://nodei.co/npm/unread.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/unread/)

> A package for parsing RSS 2.0, Atom 1.0. Works on both Node.js and the browser.

## Features

- **Small** footprint
- **Query** attributes helper (see below)
- **Cross-platform** works on browser and Node.js
- **TypeScript** ready

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

// We support common attributes
const { feed, items } = output;
console.log(feed.title());
console.log(feed.feedLink());

// And you can also query custom ones (as long as we support that namespace)
console.log(item[0].get(['author', 'dc:creator'])); // returns first match or undefined
console.log(item[0].getMany(['atom:link[ref=enclosure]'])); // Array of nodes
```

## Supported namespaces

We support the followings XML namespaces:

- `http://www.w3.org/2005/Atom` (atom)
- `http://purl.org/rss/1.0/modules/content/` (content)
- `http://purl.org/dc/elements/1.1/` (dc)
- `http://purl.org/dc/elements/1.0/` (dc)
- `http://www.itunes.com/dtds/podcast-1.0.dtd` (itunes)
- `http://search.yahoo.com/mrss/` (media)
- `http://www.w3.org/1999/xhtml` (xhtml)
- `http://www.w3.org/XML/1998/namespace` (xml)

## Mapping

### Feed

| Helper        | RSS                                                      | Atom                          |
| ------------- | -------------------------------------------------------- | ----------------------------- |
| id()          |                                                          | /feed/id                      |
| title()       | /rss/channel/title<br>/rss/channel/dc:title              | /feed/title                   |
| description() | /rss/channel/description<br>/rss/channel/itunes:subtitle | /feed/subtitle                |
| links()       | /rss/channel/link                                        | /feed/link/@href              |
| feedURL()     | /rss/channel/atom:link[@rel="self"]/@href                | /feed/link[@rel="self"]/@href |
| updated()     | /rss/channel/lastBuildDate<br>/rss/channel/dc:date       | /feed/updated                 |
| published()   | /rss/channel/pubDate                                     |                               |
| language()    | /rss/channel/language<br>/rss/channel/dc:language        | /feed/@xml:lang               |
| image()       | /rss/channel/image<br>/rss/channel/itunes:image          | /feed/logo                    |
| generator()   | /rss/channel/generator                                   | /feed/generator               |

### Item

| Helper        | RSS                                                               | Atom                               |
| ------------- | ----------------------------------------------------------------- | ---------------------------------- |
| id()          | /rss/channel/item/guid                                            | /feed/entry/id                     |
| title()       | /rss/channel/item/title<br>/rss/channel/item/dc:title             | /feed/entry/title                  |
| description() | /rss/channel/item/description<br>/rss/channel/item/dc:description | /feed/entry/summary                |
| content()     | /rss/channel/item/content:encoded                                 | /feed/entry/content                |
| links()       | /rss/channel/item/link                                            | /feed/entry/@href                  |
| updated()     | /rss/channel/item/dc:date                                         | /feed/entry/updated                |
| published()   | /rss/channel/item/pubDate<br>/rss/channel/item/dc:date            | /feed/entry/published              |
| image()       | /rss/channel/item/media:thumbnail                                 |                                    |
| enclosures()  | /rss/channel/item/enclosure                                       | /feed/entry/link[@rel=”enclosure”] |

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
