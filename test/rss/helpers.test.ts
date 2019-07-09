// Ours
import Parser from '../../src/parser/rss';

describe('Parser.query', () => {
	let node, parser;

	beforeEach(() => {
		node = { attrs: new Map(), meta: new Map(), ns: '' };
		parser = new Parser();
	});

	test('simple term', () => {
		const title = {
			attrs: new Map(),
			meta: new Map(),
			value: 'my title',
			ns: ''
		};

		node.meta.set('title', title);

		expect(parser.query(node, ['title'])).toBe(title);
	});

	test('namespaced prefix', () => {
		const title = {
			attrs: new Map(),
			meta: new Map(),
			value: 'hello world',
			ns: 'http://www.w3.org/2005/Atom'
		};
		node.meta.set('title', title);

		expect(parser.query(node, ['title'])).toBeUndefined();
		expect(parser.query(node, ['atom:title'])).toBe(title);

		const link = {
			attrs: new Map(),
			meta: new Map(),
			value: 'https://example.com',
			ns: 'http://www.w3.org/2005/Atom'
		};

		node.meta.set('atom:link', link);
		expect(parser.query(node, ['atom:link', 'title'])).toBe(link);
	});

	test('duplicated keys', () => {
		const titles = [
			{
				attrs: new Map(),
				meta: new Map(),
				value: 'my title',
				ns: ''
			},
			{
				attrs: new Map(),
				meta: new Map(),
				value: 'namespaced title',
				ns: 'http://www.w3.org/2005/Atom'
			}
		];

		node.meta.set('title', titles);

		expect(parser.query(node, ['title'])).toBe(titles[0]);
		expect(parser.query(node, ['atom:title'])).toBe(titles[1]);
	});

	test('filter by attribute', () => {
		const links = [
			{
				attrs: new Map([['rel', 'alternate']]),
				meta: new Map(),
				value: 'https://example.com',
				ns: 'http://www.w3.org/2005/Atom'
			},
			{
				attrs: new Map([['rel', 'self']]),
				meta: new Map(),
				value: 'https://example.com',
				ns: 'http://www.w3.org/2005/Atom'
			}
		];

		node.meta.set('link', links);

		expect(parser.query(node, ['atom:link'])).toBe(links[0]);
		expect(parser.query(node, ['atom:link[rel=self]'])).toBe(links[1]);
	});
});
