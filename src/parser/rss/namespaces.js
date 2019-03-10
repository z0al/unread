// @ts-check

/*
 * Known namespaces
 *
 * Lookup by URI
 */
const namespaces = {
	'http://www.w3.org/2005/Atom': 'atom',
	'http://purl.org/rss/1.0/modules/content/': 'content'
};

/**
 * @param {string} uri
 * @returns
 */
export function nsLookup(uri) {
	return namespaces[uri] || '';
}
