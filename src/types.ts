// Packages
import { Except } from 'type-fest';

export interface Node {
	attrs: Map<string, string>;
	children: Map<string, Node | Node[]>;
	ns: string;
	value?: string;
}

export interface Link {
	type?: string;
	rel?: string;
	href?: string;
}

export interface Enclosure {
	type?: string;
	href?: string;
	length?: string;
}

export interface Item extends Node {
	id?: string;
	title?: string;
	description?: string;
	content?: string;
	image?: string;
	published?: string;
	updated?: string;
	links?: Link[];
	enclosures?: Enclosure[];

	/**
	 * A wrapper around `getMany` that returns a single node.
	 */
	get?: (names: string[]) => Node;

	/**
	 * Accepts multiple queries and return the first (if many) Node that
	 * matches one of the queries (executed in order).
	 *
	 * Examples:
	 *
	 *  * "title": returns the <title>(s) that has empty namespace
	 *
	 *  * "atom:link": returns the <link>(s) that has Atom namespace
	 *
	 *  * "atom:link[rel=self]": returns the <link>(s) that as Atom
	 *     namespace and has the attribute "rel" set to "self"
	 *
	 * 	We only recognize namespaces specified in `src/rss/namespaces.ts`
	 */
	getMany?: (names: string[]) => Node[];
}

export interface Feed extends Except<Item, 'content' | 'enclosures'> {
	type?: string;
	version?: string;
	feedURL?: string;
	language?: string;
	generator?: string;
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
