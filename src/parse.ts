// Ours
import RSS from './parser/rss';
import { Item } from './parser/types';

interface ParserResult {
	feed: Item;
	items: Item[];
}

/**
 * A simple promise interface for the parsing RSS/Atom feeds.
 *
 * @param {string} text
 * @returns {Promise<ParserResult>}
 */
async function parse(text: string): Promise<ParserResult> {
	const result = { feed: null, items: [] };

	const parser = new RSS();

	// Write to stream
	parser.write(text).close();

	for (const item of parser.items()) {
		result.items.push(item);
	}

	result.feed = parser.feed();

	return result;
}

export default parse;
