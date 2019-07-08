// @ts-check

// Packages
import saxes from 'saxes';

// Ours
import { Parser } from '../types';
import { nsLookup } from './namespaces';

/**
 * A Robust RSS/Atom Parser
 *
 * @class RSSParser
 * @extends {Parser}
 */
class RSSParser extends Parser {
	/**
	 * Creates an instance of RSSParser.
	 *
	 * @typedef NodeRef
	 * @property {string} [$name]
	 * @property {string} [$prefix]
	 * @property {string} [$local]
	 * @property {boolean} [$xhtml]
	 *
	 * @typedef {import('../types').Item & NodeRef} Node
	 *
	 * @param {import('../types').ParserOptions} [options={}]
	 * @memberof RSSParser
	 */
	constructor(options = {}) {
		super(options);

		// XML Parser
		this._parser = new saxes.SaxesParser({ xmlns: true, position: false });
		this._parser.onopentag = this.onopentag.bind(this);
		this._parser.onclosetag = this.onclosetag.bind(this);
		this._parser.ontext = this.ontext.bind(this);
		this._parser.oncdata = this.ontext.bind(this);
		this._parser.onerror = this.onerror.bind(this);
		this._parser.onend = this.onend.bind(this);

		/**
		 * Holds all open tags
		 *
		 * @type {Array<Node>}
		 */
		this._stack = [];

		/**
		 * Holds not consumed items
		 *
		 * @type {Array<import('../types').Item>}
		 */
		this._buffer = [];

		/**
		 * The feed element
		 *
		 * @type {Node}
		 */
		this._feed = null;

		// Are we done processing?
		this._done = false;
	}

	/**
	 * @override
	 */
	feed() {
		const { normalize } = this.options;

		// Remove unnecessary attributes
		this.clear(this._feed);

		let node = this._feed;

		// Normalize?
		if (normalize) {
			node = this.normalize(node);
		}

		return node;
	}

	/**
	 * @override
	 */
	*items() {
		while (!this._done || this._buffer.length > 0) {
			if (this._buffer.length > 0) {
				yield this._buffer.pop();
			}
		}
	}

	/**
	 * @param {string} chunk
	 * @override
	 */
	write(chunk) {
		this._parser.write(chunk);

		// Enable chaining
		return this;
	}

	/**
	 * @override
	 */
	close() {
		this._parser.close();
	}

	/**
	 * @param {saxes.SaxesTag} tag
	 * @memberof Parser
	 */
	onopentag(tag) {
		const node = {
			$name: tag.name,
			$prefix: tag.prefix,
			$local: tag.local,
			ns: tag.uri,
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
							throw new Error('Unsupported RSS version');
						}
						break;
					}
				}
			}

			// Update feed data if necessary
			if (this.is_item(node)) {
				// Find & clone feed node
				this._feed = { ...this._stack.find(n => this.is_feed(n)) };
			}

			this._stack.unshift(node);
		}
	}

	/**
	 * @param {saxes.SaxesTag} tag
	 * @memberof Parser
	 */
	onclosetag(tag) {
		// NOTE: We only rely on the internal stack to ensure correct output
		// in some cases. That being said, it's up to the consumer to decide
		// what happens in case of XML error.
		if (this._stack.length === 0) {
			return;
		}

		// Stack.peek()
		let node = this._stack[0];

		// Inside xhtml
		if (node.$xhtml && !this.equals(node, tag)) {
			node.value += tag.isSelfClosing ? '/>' : `</${tag.name}>`;
		} else {
			// Consume node
			this._stack.shift();
			const parent = this._stack[0];

			// Emit items
			if (parent && this.is_item(node)) {
				// Don't emit illegally nested items
				if (this.is_feed(parent) || parent.$name === 'channel') {
					// Remove private attributes
					this.clear(node);

					if (this.options.normalize) {
						node = this.normalize(node);
					}

					this._buffer.unshift(node);
				}
			} else {
				// Add this node as a child
				if (parent) {
					this.assign(parent, node);

					// Was it a feed node?
					if (this.is_feed(parent)) {
						this._feed = parent;
					}
				}

				// Update feed data if necessary
				if (this.is_feed(node)) {
					this._feed = node;
				}
			}
		}
	}

	/**
	 * @param {string} text
	 * @memberof Parser
	 */
	ontext(text) {
		text = text.trim();
		if (text && this._stack.length > 0) {
			this._stack[0].value += text;
		}
	}

	/**
	 * @param {Error} err
	 * @memberof Parser
	 */
	onerror(err) {
		throw err;
	}

	/**
	 * @memberof Parser
	 */
	onend() {
		// We are done here
		this._done = true;
	}

	/**
	 * Checks if a given node is <rss> or <feed> tag
	 *
	 * @param {Node} node
	 * @returns
	 * @memberof Parser
	 */
	is_feed(node) {
		return Boolean(
			node.$name === 'rss' ||
				(node.$local === 'feed' && nsLookup(node.ns) === 'atom') ||
				// Or
				node.type
		);
	}

	/**
	 * Checks if a given node is <item> or <entry> tag
	 *
	 * @param {Node} node
	 * @returns
	 * @memberof Parser
	 */
	is_item(node) {
		return Boolean(
			node.$name === 'item' ||
				(node.$local === 'entry' && nsLookup(node.ns) === 'atom')
		);
	}

	/**
	 * Parse tag attributes
	 *
	 * @param {saxes.SaxesTag} tag
	 * @returns
	 * @memberof Parser
	 */
	attributes(tag) {
		/**
		 * @type {Map<string, string>}
		 */
		const attrs = new Map();

		return Object.entries(tag.attributes).reduce(
			(map, [name, meta]) => map.set(name, meta.value),
			attrs
		);
	}

	/**
	 * Adds the child node to parent's meta
	 *
	 * @param {Node} parent
	 * @param {Node} child
	 * @returns
	 * @memberof Parser
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

		/**
		 * @type {Node | Node[]}
		 */
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
	 *
	 * @param {Node} node
	 * @param {saxes.SaxesTag} tag
	 * @returns
	 * @memberof Parser
	 */
	equals(node, tag) {
		return node.$name === tag.name;
	}

	/**
	 * Accepts multiple queries and return the first (if many) Node that
	 * matches one of the queries (executed in order).
	 *
	 * Examples:
	 *
	 *  1. "title": returns the first <title> that has empty namespace
	 *
	 *  2. "atom:link": returns the first <link> that has Atom namespace
	 *
	 *  3. "atom:link[rel=self]": returns the first <link> that as Atom
	 *     namespace and has the attribute "rel" set to "self"
	 *
	 * 	We only recognize namespaces specified in ./namespaces.ts
	 *
	 * @param {import('../types').Item} node
	 * @param {string[]} names
	 * @returns
	 * @memberof Parser
	 */
	static query(node, names) {
		for (const name of names) {
			// e.g atom:link => prefix=atom, local=link
			let [prefix, local] = name.trim().split(':');

			// Attribute
			let attr = null;

			// No namespace e.g. title
			if (!local) {
				local = prefix;
				prefix = '';
			}

			// Filter by attribute? e.g link[rel=self]
			const attribute = /\[(\w+)=(\w+)\]$/u.exec(local);
			if (attribute) {
				// e.g. [a=b] => {key: "a", value: "b"}
				attr = { key: attribute[1], value: attribute[2] };
				local = local.split('[')[0];
			}

			// Namespaced key has a higher rank
			const key = prefix + ':' + local;
			const n = node.meta.get(key) || node.meta.get(local);

			/**
			 * A helper matcher
			 *
			 * @param {Node} obj
			 */
			const match = obj => {
				if (nsLookup(obj.ns) !== prefix) return false;

				if (attr) {
					return obj.attrs.get(attr.key) === attr.value;
				}

				return true;
			};

			// A node can be an Array or a single object
			if (n) {
				if (n instanceof Array) {
					const index = n.findIndex(el => match(el));

					if (index !== -1) {
						return n[index];
					}
				} else {
					if (match(n)) {
						return n;
					}
				}
			}
		}
	}

	/**
	 * Normalize common attributes
	 *
	 * @param {Node} node
	 * @memberof Parser
	 */
	normalize(node) {
		const self = RSSParser;

		return {
			...node,

			get id() {
				const id = self.query(node, ['guid', 'atom:id']);
				return id && id.value;
			},

			get title() {
				const title = self.query(node, ['title', 'atom:title']);
				return title && title.value;
			},

			get published() {
				const published = self.query(node, ['pubDate', 'atom:published']);
				return published && published.value;
			},

			get updated() {
				const updated = self.query(node, ['lastBuildDate', 'atom:updated']);
				return updated && updated.value;
			},

			get image() {
				const image = self.query(node, ['image', 'atom:logo']);

				if (image) {
					// RSS
					if (image.meta.has('url')) {
						const url = image.meta.get('url');
						if (!(url instanceof Array)) {
							return url.value;
						}
					}
					// Atom
					else {
						return image.value;
					}
				}
			}
		};
	}

	/**
	 * Removes private attributes from a given node.
	 *
	 * @param {Node} node
	 * @memberof Parser
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

export default RSSParser;
