// Ours
import RSS from './rss';
import { Feed, Item } from './types';

interface ParserResult {
	feed?: Feed;
	items: Item[];
}

/**
 * A simple promise interface for the parsing RSS/Atom feeds.
 */
async function parse(text: string) {
	const result: ParserResult = { items: [] };

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
