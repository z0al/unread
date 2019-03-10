// @ts-check

// Ours
import RSS from './parser/rss';

/**
 * A simple promise interface for the parsing RSS/Atom feeds.
 *
 * @typedef ParserResult
 * @property {import('./parser/types').Item} feed
 * @property {import('./parser/types').Item[]} items
 *
 * @param {string} text
 * @returns {Promise<ParserResult>}
 */
async function parse(text) {
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
