/*
 * Known namespaces
 *
 * Lookup by URI
 */
const namespaces = new Map([
	['http://www.w3.org/2005/Atom', 'atom'],
	['http://purl.org/rss/1.0/modules/content/', 'content']
]);

export function nsLookup(uri: string) {
	return namespaces.get(uri) || '';
}
