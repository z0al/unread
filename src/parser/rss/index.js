// @ts-check

// Packages
import { SaxesParser } from 'saxes';
import { Transform } from 'readable-stream';

// Ours
import ns from './namespaces';

/**
 * @typedef Node
 * @property {string} [type]
 * @property {string} [version]
 * @property {string} [$name]
 * @property {string} [$prefix]
 * @property {string} [$local]
 * @property {Boolean} [$xhtml]
 * @property {string} uri
 * @property {Map<string,string>} attrs
 * @property {string} value
 * @property {Map<string,Node|Node[]>} meta
 *
 */

/**
 * A Robust RSS/Atom Parser
 *
 * @class Parser
 * @extends {Transform}
 */
class Parser extends Transform {
	constructor() {
		// Object mode: In short, allows readable streams to push any type of chunk
		// other than Buffer and Uint8Array.
		//
		// https://nodejs.org/api/stream.html#stream_object_mode
		super({ objectMode: true });

		// XML Parser
		this._parser = new SaxesParser({ xmlns: true, position: false });
		this._parser.onopentag = this.onopentag.bind(this);
		this._parser.onclosetag = this.onclosetag.bind(this);
		this._parser.ontext = this.ontext.bind(this);
		this._parser.oncdata = this.ontext.bind(this);
		this._parser.onerror = this.onerror.bind(this);
		this._parser.onend = this.onend.bind(this);

		// Holds all open tags
		/** @type Array<Node> */
		this._stack = [];

		// We only emit a "feed" event if we:
		//
		// 1. Encountered an item and `_emitfeed` is true.
		// 2. Reached the end of the feed and `_emitfeed` is true.
		this._emitfeed = false;
	}

	/**
	 * @param {*} chunk
	 * @param {string} encoding
	 * @param {Function} cb
	 *
	 * @override
	 * @private
	 */
	_transform(chunk, encoding, cb) {
		try {
			this._parser.write(chunk);
			cb();
		} catch (err) {
			// Manually trigger an end, no more parsing!
			cb(err, null);
		}
	}

	/**
	 * This will be called when there is no more written data to be consumed,
	 * but before the 'end' event is emitted signaling the end of the Readable
	 * stream.
	 *
	 * @param {Function} cb
	 *
	 * @override
	 * @private
	 */
	_flush(cb) {
		try {
			this._parser.close();
			cb();
		} catch (err) {
			cb(err);
		}
	}

	/**
	 * @param {import('saxes').SaxesTag} tag
	 * @private
	 */
	onopentag(tag) {
		/**
		 * @type Node
		 */
		const node = {
			$name: tag.name,
			$prefix: tag.prefix,
			$local: tag.local,
			uri: tag.uri,
			attrs: this.attributes(tag),
			meta: new Map(),
			value: ''
		};

		// Inside xhtml
		if (this._stack.length > 0 && this._stack[0].$xhtml) {
			// name="value" pairs
			const attrs = Array.from(node.attrs)
				.map(([k, v]) => `${k}="${v}"`)
				.join(' ');

			// e.g. <a href="#"
			this._stack[0].value += `<${node.$name}${attrs && ' ' + attrs}`;

			if (!tag.isSelfClosing) {
				this._stack[0].value += '>';
			}
		} else {
			// xhtml?
			if (node.attrs.get('type') === 'xhtml') {
				node.$xhtml = true;
			}

			// <rss> or <feed>
			if (this.is_feed(node) && this._stack.length === 0) {
				switch (node.$local) {
					case 'feed': {
						node.type = 'atom';
						node.version = '1.0';
						break;
					}
					case 'rss': {
						node.type = 'rss';
						node.version = node.attrs.get('version') || '2.0';
						if (node.version !== '2.0') {
							this.emit('error', new Error('Unsupported RSS version'));
						}
						break;
					}
				}
			}

			// Emit updated feed
			if (this.is_item(node) && this._emitfeed) {
				// Don't emit again unless the feed has changed
				this._emitfeed = false;

				// Find & clone feed node
				const feed = { ...this._stack.find(n => this.is_feed(n)) };

				this.clear(feed);

				this.emit('feed', feed);
			}

			this._stack.unshift(node);
		}
	}

	/**
	 * @param {import('saxes').SaxesTag} tag
	 * @private
	 */
	onclosetag(tag) {
		// NOTE: We only rely on the internal stack to ensure correct output
		// in some cases. That being said, it's up to the consumer to decide
		// what happens in case of XML error.
		if (this._stack.length === 0) {
			return;
		}

		// Stack.peek()
		const node = this._stack[0];

		// Inside xhtml
		if (node.$xhtml && !this.equals(node, tag)) {
			node.value += tag.isSelfClosing ? '/>' : `</${tag.name}>`;
		} else {
			// Consume node
			this._stack.shift();
			const parent = this._stack[0];

			if (parent && this.is_item(node)) {
				// Don't emit illegally nested items
				if (this.is_feed(parent) || parent.$name === 'channel') {
					// Remove private attributes
					this.clear(node);

					return this.push(node);
				}
			}

			// Add this node as a child
			if (parent) {
				this.assign(parent, node);

				// Was it a feed node?
				if (this.is_feed(parent)) {
					this._emitfeed = true;
				}
			}

			// Emit "feed" if necessary
			if (this.is_feed(node) && this._emitfeed) {
				// This is probably the end anyway, but still, let's make sure that
				// We don't emit unnecessary events
				this._emitfeed = false;

				this.clear(node);

				this.emit('feed', node);
			}
		}
	}

	/**
	 * @param {string} text
	 * @private
	 */
	ontext(text) {
		text = text.trim();
		if (text && this._stack.length > 0) {
			this._stack[0].value += text;
		}
	}

	/**
	 * @param {Error} err
	 * @private
	 */
	onerror(err) {
		this.emit('error', err);
	}

	/**
	 * @private
	 */
	onend() {
		// We are done here
		this.push(null);
	}

	/**
	 * Checks if a given node is <rss> or <feed> tag
	 *
	 * @param {Node} node
	 * @returns {Boolean}
	 * @private
	 */
	is_feed(node) {
		return Boolean(
			node.$name === 'rss' ||
				(node.$local === 'feed' && ns[node.uri] === 'atom') ||
				// Or
				node.type
		);
	}

	/**
	 * Checks if a given node is <item> or <entry> tag
	 *
	 * @param {Node} node
	 * @returns {Boolean}
	 * @private
	 */
	is_item(node) {
		return Boolean(
			node.$name === 'item' ||
				(node.$local === 'entry' && ns[node.uri] === 'atom')
		);
	}

	/**
	 * Parse tag attributes
	 *
	 * @param {import('saxes').SaxesTag} tag
	 * @private
	 */
	attributes(tag) {
		return Object.entries(tag.attributes).reduce(
			(map, [name, meta]) => map.set(name, meta.value),
			new Map()
		);
	}

	/**
	 * Adds the child node to parent's meta
	 *
	 * @param {Node} parent
	 * @param {Node} child
	 * @private
	 */
	assign(parent, child) {
		// Keep the name
		const key = child.$name;

		// Remove private attributes
		this.clear(child);

		// Are we assigning "channel" element?
		if (parent.type === 'rss' && key === 'channel') {
			parent.meta = child.meta;
			return;
		}

		let node;

		// Handle duplicated keys
		if (parent.meta.has(key)) {
			node = parent.meta.get(key);

			if (node instanceof Array) {
				node.push(child);
			} else {
				node = [node, child];
			}
		} else {
			node = child;
		}

		parent.meta.set(key, node);
	}

	/**
	 * Check if a node and an XML tag are equal
	 * @param {Node} node
	 * @param {import('saxes').SaxesTag} tag
	 * @returns {Boolean}
	 * @private
	 */
	equals(node, tag) {
		if (node.attrs.size !== Object.keys(tag.attributes).length) {
			return false;
		}

		return (
			node.$name === tag.name &&
			node.$local === tag.local &&
			node.$prefix === tag.prefix &&
			node.uri === tag.uri &&
			Array.from(node.attrs).every(([k, v]) => {
				// @ts-ignore
				return tag.attributes[k] && tag.attributes[k].value === v;
			})
		);
	}

	/**
	 * Removes private attributes from a given node.
	 *
	 * @param {Node} node
	 * @private
	 */
	clear(node) {
		if (node.value === '') {
			delete node.value;
		}

		delete node.$name;
		delete node.$prefix;
		delete node.$local;
		delete node.$xhtml;
	}
}

export default Parser;
