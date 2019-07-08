// @ts-check

/**
 * The base class of all parsers.
 *
 * @typedef Item
 * @property {string} [type]
 * @property {string} [version]
 * @property {Map<string, string>} attrs
 * @property {Map<string, Item | Item[]>} meta
 * @property {string} ns
 * @property {string} [value]
 * @property {string} [id]
 * @property {string} [title]
 * @property {string} [image]
 * @property {string} [published]
 * @property {string} [updated]
 *
 *
 * @typedef ParserOptions
 * @property {boolean} [normalize] normalize commonly used attributes
 *
 * @export
 * @class Parser
 */
export class Parser {
	options = { normalize: true };

	/**
	 * Creates an instance of Parser.
	 *
	 * @param {ParserOptions} [opt={}]
	 * @memberof Parser
	 */
	constructor(opt) {
		this.options = { ...this.options, ...opt };
	}

	/**
	 * Get the current parsed feed data.
	 *
	 * @returns {Item}
	 * @memberof Parser
	 */
	feed() {
		return null;
	}

	/**
	 * Iterates over avaiable items
	 *
	 * @returns {IterableIterator<Item>}
	 * @memberof Parser
	 * @abstract
	 */
	*items() {}

	/**
	 * Write text to stream.
	 *
	 * @param {string} chunk
	 * @returns {Parser}
	 * @memberof Parser
	 */
	write(chunk) {
		return this;
	}

	/**
	 * Close the current stream.
	 *
	 * @memberof Parser
	 * @abstract
	 */
	close() {}
}
