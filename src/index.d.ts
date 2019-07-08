import * as sx from 'saxes';

export interface Item {
	// Feed ?
	type?: string;
	version?: string;

	attrs: Map<string, string>;
	meta: Map<string, Item | Item[]>;
	ns: string;
	value?: string;

	// Helpers
	get: (selectors: string[]) => Item;

	// Normalized
	id?: string;
	title?: string;
	image?: string;
	published?: string;
	updated?: string;
}

export interface ParserOptions {
	normalize?: boolean;
}

declare abstract class Parser {
	options: ParserOptions;
	constructor(opt?: ParserOptions);

	/**
	 * Get the current parsed feed data.
	 *
	 * @returns {Item}
	 * @memberof Parser
	 */
	feed(): Item;

	/**
	 * Iterates over avaiable items
	 *
	 * @returns {IterableIterator<Item>}
	 * @memberof Parser
	 * @abstract
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
	 * @abstract
	 */
	close(): void;
}

/**
 * A Robust RSS/Atom Parser
 *
 * @class RSSParser
 * @extends {Parser}
 */
declare class RSSParser extends Parser {
	constructor(options?: ParserOptions);

	/**
	 * @override
	 */
	feed(): Item;

	/**
	 * @override
	 */
	items(): IterableIterator<Item>;

	/**
	 * @override
	 */
	write(chunk: string): this;

	/**
	 * @override
	 */
	close(): void;
}

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
