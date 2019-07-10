// Packages
import { Except } from 'type-fest';

export interface Node {
	attrs: Map<string, string>;
	children: Map<string, Item | Item[]>;
	ns: string;
	value?: string;
}

export interface Item extends Node {
	id?: string;
	title?: string;
	description?: string;
	content?: string;
	image?: string;
	published?: string;
	updated?: string;

	get?: (names: string[]) => Item;
}

export interface Feed extends Except<Item, 'content'> {
	type?: string;
	version?: string;
	feedURL?: string;
}

export interface Parser {
	/**
	 * Get the current parsed feed data.
	 */
	feed(): Feed;

	/**
	 * Iterates over avaiable items
	 */
	items: () => IterableIterator<Item>;

	/**
	 * Write text to stream.
	 */
	write: (chunk: string) => Parser;

	/**
	 * Close the current stream.
	 */
	close: () => void;
}
