// Native
import { readFileSync } from 'fs';
import * as path from 'path';

// Packages
import glob from 'glob';

// Ours
import { parse } from '../../src';

const cwd = path.resolve(__dirname, 'feeds');
let samples = [];

beforeAll(() => {
	// List available samples
	samples = samples.concat(glob.sync('*', { cwd }));
});

test('Samples', async () => {
	for (const file of samples) {
		const text = readFileSync(path.resolve(cwd, file)).toString();

		const output = await parse(text);

		let { feed, items } = output;

		// Evaluate all selectors
		feed = {
			...feed,
			id: feed.id(),
			title: feed.title(),
			description: feed.description(),
			image: feed.image(),
			published: feed.published(),
			updated: feed.updated(),
			links: feed.links(),
			feedURL: feed.feedURL(),
			language: feed.language(),
			generator: feed.generator(),
		} as any;

		items = items.map((item) => ({
			...item,
			id: item.id(),
			title: item.title(),
			description: item.description(),
			content: item.content(),
			image: item.image(),
			published: item.published(),
			updated: item.updated(),
			links: item.links(),
			enclosures: item.enclosures(),
		})) as any[];

		expect({ feed, items }).toMatchSnapshot(file);
	}
});
