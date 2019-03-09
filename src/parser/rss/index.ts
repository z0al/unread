// Packages
import * as sx from 'saxes';

// Ours
import { Item, Parser, ParserOptions } from '../types';
import { nsLookup } from './namespaces';

export interface Node extends Item {
	$name?: string;
	$prefix?: string;
	$local?: string;
	$xhtml?: Boolean;
}

/**
 * A Robust RSS/Atom Parser
 *
 * @class RSSParser
 * @extends {Parser}
 */
class RSSParser extends Parser {
	// XML Parser
	private _parser: sx.SaxesParser;

	// Holds all open tags
	private _stack: Array<Node> = [];

	// Holds not consumed items
	private _buffer: Array<Item> = [];

	// The feed element
	private _feed: Node = null;

	// Are we done processing?
	private _done: Boolean = false;

	constructor(options: ParserOptions = {}) {
		super(options);

		// XML Parser
		this._parser = new sx.SaxesParser({ xmlns: true, position: false });
		this._parser.onopentag = this.onopentag.bind(this);
		this._parser.onclosetag = this.onclosetag.bind(this);
		this._parser.ontext = this.ontext.bind(this);
		this._parser.oncdata = this.ontext.bind(this);
		this._parser.onerror = this.onerror.bind(this);
		this._parser.onend = this.onend.bind(this);
	}

	/**
	 * @override
	 */
	feed(): Item {
		const { normalize } = this.options;

		// Remove unnecessary attributes
		this.clear(this._feed);

		let node = this._feed;

		// Normalize?
		if (normalize) {
			this.normalize(node);
		}

		return node;
	}

	/**
	 * @override
	 */
	async *items() {
		while (!this._done || this._buffer.length > 0) {
			if (this._buffer.length > 0) {
				yield await this._buffer.pop();
			}
		}
	}

	/**
	 * @override
	 */
	write(chunk: string) {
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
	 * @param {sx.SaxesTag} tag
	 * @memberof Parser
	 */
	onopentag(tag: sx.SaxesTag) {
		const node: Node = {
			$name: tag.name,
			$prefix: tag.prefix,
			$local: tag.local,
			ns: tag.uri,
			attrs: this.attributes(tag),
			meta: new Map<string, Node | Node[]>(),
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
	 * @param {sx.SaxesTag} tag
	 * @memberof Parser
	 */
	onclosetag(tag: sx.SaxesTag) {
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
	ontext(text: string) {
		text = text.trim();
		if (text && this._stack.length > 0) {
			this._stack[0].value += text;
		}
	}

	/**
	 * @param {Error} err
	 * @memberof Parser
	 */
	onerror(err: Error) {
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
	is_feed(node: Node) {
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
	is_item(node: Node) {
		return Boolean(
			node.$name === 'item' ||
				(node.$local === 'entry' && nsLookup(node.ns) === 'atom')
		);
	}

	/**
	 * Parse tag attributes
	 *
	 * @param {sx.SaxesTag} tag
	 * @returns
	 * @memberof Parser
	 */
	attributes(tag: sx.SaxesTag) {
		return Object.entries(tag.attributes).reduce(
			(map, [name, meta]) => map.set(name, meta.value),
			new Map<string, string>()
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
	assign(parent: Node, child: Node) {
		// Keep the name
		const key = child.$name;

		// Remove private attributes
		this.clear(child);

		// Are we assigning "channel" element?
		if (parent.type === 'rss' && key === 'channel') {
			parent.meta = child.meta;
			return;
		}

		let node: Node | Node[];

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
	 * @param {sx.SaxesTag} tag
	 * @returns
	 * @memberof Parser
	 */
	equals(node: Node, tag: sx.SaxesTag) {
		if (node.attrs.size !== Object.keys(tag.attributes).length) {
			return false;
		}

		return (
			node.$name === tag.name &&
			node.$local === tag.local &&
			node.$prefix === tag.prefix &&
			node.ns === tag.uri &&
			Array.from(node.attrs).every(([k, v]) => {
				return (
					tag.attributes[k] &&
					(tag.attributes[k] as sx.SaxesAttribute).value === v
				);
			})
		);
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
	 * @param {Item} node
	 * @param {string[]} names
	 * @returns
	 * @memberof Parser
	 */
	query(node: Item, names: string[]) {
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
			const attribute = /\[(\w+)=(\w+)\]$/su.exec(local);
			if (attribute) {
				// e.g. [a=b] => {key: "a", value: "b"}
				attr = { key: attribute[1], value: attribute[2] };
				local = local.split('[')[0];
			}

			// Namespaced key has a higher rank
			const key = prefix + ':' + local;
			const n = node.meta.get(key) || node.meta.get(local);

			// A helper matcher
			const match = (obj: Node) => {
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
	normalize(node: Node) {
		const id = this.query(node, ['guid', 'atom:id']);
		if (id) {
			node.id = id.value || '';
		}

		const title = this.query(node, ['title', 'atom:title']);
		if (title) {
			node.title = title.value || '';
		}

		const summary = this.query(node, [
			'description',
			'atom:summary',
			'atom:subtitle'
		]);
		if (summary) {
			node.summary = summary.value || '';
		}

		const content = this.query(node, ['content:encoded', 'atom:content']);
		if (content) {
			node.content = content.value || '';
		}

		const published = this.query(node, ['pubDate', 'atom:published']);
		if (published) {
			node.published = published.value || '';
		}

		const updated = this.query(node, ['lastBuildDate', 'atom:updated']);
		if (updated) {
			node.updated = updated.value || '';
		}

		const image = this.query(node, ['image', 'atom:logo']);
		if (image) {
			// RSS
			if (image.meta.has('url')) {
				const url = image.meta.get('url');
				if (!(url instanceof Array)) {
					node.image = url.value || '';
				}
			}
			// Atom
			else {
				node.image = image.value || '';
			}
		}

		return node;
	}

	/**
	 * Removes private attributes from a given node.
	 *
	 * @param {Node} node
	 * @memberof Parser
	 */
	clear(node: Node) {
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
