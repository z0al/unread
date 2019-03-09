export interface Item {
	// Feed?
	type?: string;
	version?: string;

	// Normalized attributes
	id?: string;
	title?: string;
	summary?: string;
	content?: string;
	image?: string;
	published?: string;
	updated?: string;

	// Others
	attrs: Map<string, string>;
	meta: Map<string, Item | Item[]>;
	ns: string;
	value?: string;
}

export interface ParserOptions {
	// Normalize common attributes e.g. title, description
	normalize?: boolean;
}

export abstract class Parser {
	options: ParserOptions = { normalize: true };

	constructor(opt: ParserOptions = {}) {
		this.options = { ...this.options, ...opt };
	}

	/**
	 * Get the current parsed feed data.
	 *
	 * @returns {Item}
	 * @memberof Parser
	 */
	feed(): Item {
		return null;
	}

	/**
	 * Iterates over avaiable items
	 *
	 * @returns {IterableIterator<Item>}
	 * @memberof Parser
	 * @abstract
	 */
	*items(): IterableIterator<Item> {}

	/**
	 * Write text to stream.
	 *
	 * @param {string} chunk
	 * @returns {Parser}
	 * @memberof Parser
	 */
	write(chunk: string): Parser {
		return this;
	}

	/**
	 * Close the current stream.
	 *
	 * @membthis.write
	 * @abstract
	 */
	close() {}
}
