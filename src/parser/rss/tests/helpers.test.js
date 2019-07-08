// @ts-check

// Ours
import Parser from '..';

describe('Parser.query', () => {
	let node;

	beforeEach(() => {
		node = { attrs: new Map(), meta: new Map(), ns: '' };
	});

	test('simple term', () => {
		const title = {
			attrs: new Map(),
			meta: new Map(),
			value: 'my title',
			ns: ''
		};

		node.meta.set('title', title);

		expect(Parser.query(node, ['title'])).toBe(title);
	});

	test('namespaced prefix', () => {
		const title = {
			attrs: new Map(),
			meta: new Map(),
			value: 'hello world',
			ns: 'http://www.w3.org/2005/Atom'
		};
		node.meta.set('title', title);

		expect(Parser.query(node, ['title'])).toBeUndefined();
		expect(Parser.query(node, ['atom:title'])).toBe(title);

		const link = {
			attrs: new Map(),
			meta: new Map(),
			value: 'https://example.com',
			ns: 'http://www.w3.org/2005/Atom'
		};

		node.meta.set('atom:link', link);
		expect(Parser.query(node, ['atom:link', 'title'])).toBe(link);
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

		expect(Parser.query(node, ['title'])).toBe(titles[0]);
		expect(Parser.query(node, ['atom:title'])).toBe(titles[1]);
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

		expect(Parser.query(node, ['atom:link'])).toBe(links[0]);
		expect(Parser.query(node, ['atom:link[rel=self]'])).toBe(links[1]);
	});
});
