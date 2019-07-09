import * as sx from 'saxes';

export interface Item {
	attrs: Map<string, string>;
	meta: Map<string, Item | Item[]>;
	ns: string;
	value?: string;

	/**
	 * Accepts multiple queries and return the first (if many) Node that
	 * matches one of the queries (executed in order).
	 *
	 * Examples:
	 *
	 *  * "title": returns the first <title> that has empty namespace
	 *
	 *  * "atom:link": returns the first <link> that has Atom namespace
	 *
	 *  * "atom:link[rel=self]": returns the first <link> that as Atom
	 *     namespace and has the attribute "rel" set to "self"
	 *
	 * 	We only recognize namespaces specified in ./namespaces.ts
	 *
	 * @param {import('../types').Item} node
	 * @param {string[]} names
	 * @returns
	 * @memberof Parser
	 */
	get: (selectors: string[]) => Item;

	// Normalized
	id?: string;
	title?: string;
	image?: string;
	published?: string;
	updated?: string;
}

export interface Feed extends Item {
	type?: string;
	version?: string;
	feedURL?: string;
}

export interface ParserOptions {
	normalize?: boolean;
}

declare class Parser {
	options: ParserOptions;
	constructor(opt?: ParserOptions);

	/**
	 * Get the current parsed feed data.
	 *
	 * @returns {Feed}
	 * @memberof Parser
	 */
	feed(): Feed;

	/**
	 * Iterates over avaiable items
	 *
	 * @returns {IterableIterator<Item>}
	 * @memberof Parser
	 */

	items(): IterableIterator<Item>;
	/**
	 * Write text to stream.
	 *
	 * @param {string} chunk
	 * @returns {Parser}
	 * @memberof Parser
	 */
	write(chunk: string): Parser;

	/**
	 * Close the current stream.
	 *
	 * @membthis.write
	 */
	close(): void;
}

/**
 * A Robust RSS/Atom Parser
 *
 * @class RSSParser
 * @extends {Parser}
 */
declare class RSSParser extends Parser {}

export interface ParserResult {
	feed: Item;
	items: Item[];
}

/**
 * A simple promise interface for the parsing RSS/Atom feeds.
 *
 * @param {string} text
 * @returns {Promise<ParserResult>}
 */
declare function parse(text: string): Promise<ParserResult>;

export { parse, RSSParser };
