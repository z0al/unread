/*
 * Known namespaces
 *
 * Lookup by URI
 */

const namespaces = [
	['atom', 'http://www.w3.org/2005/Atom'], // v1.0
	['content', 'http://purl.org/rss/1.0/modules/content/']
];

// @ts-ignore
export const byName = new Map(namespaces);

// @ts-ignore
export const byURI = new Map(namespaces.map(ns => ns.reverse()));
