/*
 * Default namespaces.
 *
 * Adopted from the `feedparser` package.
 *
 * Lookup by URI
 */
const namespaces = {
	'http://www.w3.org/2005/Atom': 'atom',
	'http://purl.org/rss/1.0/modules/content/': 'content',
	'http://purl.org/dc/elements/1.1/': 'dc',
	'http://purl.org/dc/elements/1.0/': 'dc',
	'http://www.itunes.com/dtds/podcast-1.0.dtd': 'itunes',
	'http://search.yahoo.com/mrss/': 'media',
	'http://search.yahoo.com/mrss': 'media', // commonly-used but wrong
	'http://www.w3.org/1999/xhtml': 'xhtml',
	'http://www.w3.org/XML/1998/namespace': 'xml'
};

export function nsLookup(uri: string) {
	return namespaces[uri] || '';
}
