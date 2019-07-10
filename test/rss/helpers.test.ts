// Ours
import Parser from '../../src/rss';

describe('Parser.get', () => {
	let node, parser;

	beforeEach(() => {
		node = { attrs: new Map(), children: new Map(), ns: '' };
		parser = new Parser();
	});

	test('simple term', () => {
		const title = {
			attrs: new Map(),
			children: new Map(),
			value: 'my title',
			ns: ''
		};

		node.children.set('title', title);

		expect(parser.get(node, ['title'])).toBe(title);
	});

	test('namespaced prefix', () => {
		const title = {
			attrs: new Map(),
			children: new Map(),
			value: 'hello world',
			ns: 'http://www.w3.org/2005/Atom'
		};
		node.children.set('title', title);

		expect(parser.get(node, ['title'])).toBeUndefined();
		expect(parser.get(node, ['atom:title'])).toBe(title);

		const link = {
			attrs: new Map(),
			children: new Map(),
			value: 'https://example.com',
			ns: 'http://www.w3.org/2005/Atom'
		};

		node.children.set('atom:link', link);
		expect(parser.get(node, ['atom:link', 'title'])).toBe(link);
	});

	test('duplicated keys', () => {
		const titles = [
			{
				attrs: new Map(),
				children: new Map(),
				value: 'my title',
				ns: ''
			},
			{
				attrs: new Map(),
				children: new Map(),
				value: 'namespaced title',
				ns: 'http://www.w3.org/2005/Atom'
			}
		];

		node.children.set('title', titles);

		expect(parser.get(node, ['title'])).toBe(titles[0]);
		expect(parser.get(node, ['atom:title'])).toBe(titles[1]);
	});

	test('filter by attribute', () => {
		const links = [
			{
				attrs: new Map([['rel', 'alternate']]),
				children: new Map(),
				value: 'https://example.com',
				ns: 'http://www.w3.org/2005/Atom'
			},
			{
				attrs: new Map([['rel', 'self']]),
				children: new Map(),
				value: 'https://example.com',
				ns: 'http://www.w3.org/2005/Atom'
			}
		];

		node.children.set('link', links);

		expect(parser.get(node, ['atom:link'])).toBe(links[0]);
		expect(parser.get(node, ['atom:link[rel=self]'])).toBe(links[1]);
	});
});
