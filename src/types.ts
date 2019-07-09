export interface Node {
	attrs: Map<string, string>;
	meta: Map<string, Item | Item[]>;
	ns: string;
	value?: string;
}

export interface Item extends Node {
	id?: string;
	title?: string;
	image?: string;
	published?: string;
	updated?: string;

	get?: (names: string[]) => Item;
}

export interface Feed extends Item {
	type?: string;
	version?: string;
	feedURL?: string;
}

export interface ParserOptions {
	normalize?: boolean;
}

export class Parser {
	options = { normalize: true };

	/**
	 * Creates an instance of Parser.
	 *
	 */
	constructor(opt: ParserOptions = {}) {
		this.options = { ...this.options, ...opt };
	}

	/**
	 * Get the current parsed feed data.
	 */
	feed(): Feed | undefined {
		return undefined;
	}

	/**
	 * Iterates over avaiable items
	 */
	*items(): IterableIterator<Item> {}

	/**
	 * Write text to stream.
	 */
	write(chunk: string) {
		return this;
	}

	/**
	 * Close the current stream.
	 */
	close() {}
}
