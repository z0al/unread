// Packages
import saxes from 'saxes';

// Ours
import { nsLookup } from './namespaces';
import { Parser, Node, Feed, Item } from '../types';

interface XMLNode extends Feed, Item {
	$name?: string;
	$prefix?: string;
	$local?: string;
	$xhtml?: boolean;
}

/**
 * A Robust RSS/Atom Parser
 */
class RSS implements Parser {
	/**
	 * The feed element
	 */
	private _feed: Feed;
	private _done: boolean;

	private _stack: XMLNode[];
	private _buffer: XMLNode[];

	private _parser: saxes.SaxesParser;

	/**
	 * Creates an instance of RSS.
	 */
	constructor() {
		// XML Parser
		this._parser = new saxes.SaxesParser({
			xmlns: true,
			position: false
		});
		this._parser.onopentag = this.onopentag.bind(this);
		this._parser.onclosetag = this.onclosetag.bind(this);
		this._parser.ontext = this.ontext.bind(this);
		this._parser.oncdata = this.ontext.bind(this);
		this._parser.onerror = this.onerror.bind(this);
		this._parser.onend = this.onend.bind(this);

		/**
		 * Holds all open tags
		 */
		this._stack = [];

		/**
		 * Holds not consumed items
		 */
		this._buffer = [];

		// Are we done processing?
		this._done = false;
	}

	/**
	 * @override
	 */
	feed() {
		// Remove unnecessary attributes
		this.clear(this._feed);

		return this.toFeed(this._feed);
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

	onopentag(tag: saxes.SaxesTag) {
		const node: XMLNode = {
			$name: tag.name,
			$prefix: tag.prefix,
			$local: tag.local,
			ns: tag.uri,
			attrs: this.attributes(tag),
			children: new Map(),
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

	onclosetag(tag: saxes.SaxesTag) {
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

					this._buffer.unshift(this.toItem(node));
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

	ontext(text: string) {
		text = text.trim();
		if (text && this._stack.length > 0) {
			this._stack[0].value += text;
		}
	}

	onerror(err: Error) {
		throw err;
	}

	onend() {
		// We are done here
		this._done = true;
	}

	/**
	 * Checks if a given node is <rss> or <feed> tag
	 */
	is_feed(node: XMLNode) {
		return Boolean(
			node.$name === 'rss' ||
				(node.$local === 'feed' && nsLookup(node.ns) === 'atom') ||
				// Or
				node.type
		);
	}

	/**
	 * Checks if a given node is <item> or <entry> tag
	 */
	is_item(node: XMLNode) {
		return Boolean(
			node.$name === 'item' ||
				(node.$local === 'entry' && nsLookup(node.ns) === 'atom')
		);
	}

	/**
	 * Parse tag attributes
	 */
	attributes(tag: saxes.SaxesTag) {
		const attrs = new Map<string, string>();

		return Object.entries(tag.attributes).reduce(
			(map, [name, meta]) => map.set(name, meta.value),
			attrs
		);
	}

	/**
	 * Adds the child node to parent's meta
	 */
	assign(parent: XMLNode, child: XMLNode) {
		// Keep the name
		const key = child.$name;

		// Remove private attributes
		this.clear(child);

		// Are we assigning "channel" element?
		if (parent.type === 'rss' && key === 'channel') {
			parent.children = child.children;
			return;
		}

		let node: XMLNode | XMLNode[];

		// Handle duplicated keys
		if (parent.children.has(key)) {
			node = parent.children.get(key);

			if (node instanceof Array) {
				node.push(child);
			} else {
				node = [node, child];
			}
		} else {
			node = child;
		}

		parent.children.set(key, node);
	}

	/**
	 * Check if a node and an XML tag are equal
	 */
	equals(node: XMLNode, tag: saxes.SaxesTag) {
		return node.$name === tag.name;
	}

	/**
	 * @override
	 */
	getMany(node: Node, names: string[]) {
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
			const n = node.children.get(key) || node.children.get(local);

			/**
			 * A helper matcher
			 */
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
					const list = n.filter(el => match(el));

					return list.length > 0 && list;
				} else {
					if (match(n)) {
						return [n];
					}
				}
			}
		}
	}

	/**
	 * @override
	 */
	get(node: Node, names: string[]) {
		const matches = this.getMany(node, names);
		return matches && matches[0];
	}

	/**
	 * Normalize common attributes
	 */
	normalize(node: Node): XMLNode {
		return {
			...node,
			get: (names: string[]) => this.get(node, names),
			getMany: (names: string[]) => this.getMany(node, names),

			id: () => {
				const id = this.get(node, ['guid', 'atom:id']);
				return id && id.value;
			},

			title: () => {
				const title = this.get(node, [
					'title',
					'atom:title',
					'dc:title'
				]);
				return title && title.value;
			},

			links: () => {
				const links = [];

				const rssLink = this.get(node, ['link']);
				if (rssLink) {
					links.push({ href: rssLink.value });
				}

				const atomLinks = this.getMany(node, ['atom:link']);
				if (atomLinks) {
					links.push(
						...atomLinks.map(u => ({
							type: u.attrs.get('type'),
							rel: u.attrs.get('rel'),
							href: u.attrs.get('href')
						}))
					);
				}

				return links;
			}
		};
	}

	toItem(node: Node): Item {
		return {
			...this.normalize(node),

			description: () => {
				const desc = this.get(node, [
					'description',
					'atom:summary',
					'dc:description'
				]);
				return desc && desc.value;
			},

			content: () => {
				const content = this.get(node, [
					'content:encoded',
					'atom:content'
				]);
				return content && content.value;
			},

			published: () => {
				const published = this.get(node, [
					'pubDate',
					'atom:published',
					'dc:date'
				]);
				return published && published.value;
			},

			updated: () => {
				const updated = this.get(node, ['atom:updated', 'dc:date']);
				return updated && updated.value;
			},

			image: () => {
				const image = this.get(node, ['media:thumbnail']);

				if (image) {
					// Media
					if (image.attrs.has('url')) {
						return image.attrs.get('url');
					}
				}
			},

			enclosures: () => {
				const files = this.getMany(node, [
					'enclosure',
					'atom:link[rel=enclosure]'
				]);

				if (files) {
					return files.map(f => ({
						type: f.attrs.get('type'),
						href: f.attrs.get('url') || f.attrs.get('href'),
						length: f.attrs.get('length')
					}));
				}
			}
		};
	}

	toFeed(node: Node): Feed {
		return {
			...this.normalize(node),

			feedURL: () => {
				const url = this.get(node, ['atom:link[rel=self]']);
				return url && url.attrs.get('href');
			},

			language: () => {
				const lang = this.get(node, ['language', 'dc:language']);

				// Atom uses the standard `xml:lang` attribute.
				if (!lang) {
					return node.attrs.get('xml:lang');
				}

				return lang.value;
			},

			generator: () => {
				const g = this.get(node, ['generator', 'atom:generator']);
				return g && g.value;
			},

			description: () => {
				const desc = this.get(node, [
					'description',
					'atom:subtitle',
					'itunes:subtitle'
				]);
				return desc && desc.value;
			},

			published: () => {
				const published = this.get(node, ['pubDate']);
				return published && published.value;
			},

			updated: () => {
				const updated = this.get(node, [
					'lastBuildDate',
					'atom:updated',
					'dc:date'
				]);
				return updated && updated.value;
			},

			image: () => {
				const image = this.get(node, [
					'image',
					'atom:logo',
					'itunes:image'
				]);

				if (image) {
					// Itunes
					if (image.attrs.has('href')) {
						return image.attrs.get('href');
					}
					// RSS
					else if (image.children.has('url')) {
						const url = image.children.get('url');
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
	 */
	clear(node: XMLNode) {
		if (node.value === '') {
			delete node.value;
		}

		delete node.$name;
		delete node.$prefix;
		delete node.$local;
		delete node.$xhtml;
	}
}

export default RSS;
