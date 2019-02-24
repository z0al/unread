// Native
import { createReadStream } from 'fs';
import * as path from 'path';

// Packages
import * as glob from 'globby';

// Ours
import RSSParser from '../../src/parser/rss';

const cwd = path.resolve(__dirname, 'feeds');
let samples = [];

beforeAll(async () => {
	// List availalbe samples
	samples = samples.concat(await glob('*', { cwd }));
});

test('Snapshots', async () => {
	for (const file of samples) {
		const feed = await new Promise((resolve, reject) => {
			const output = { items: [], feed: null };

			createReadStream(path.resolve(cwd, file))
				.on('error', err => reject(err))
				.pipe(new RSSParser())
				.on('error', err => reject(err))
				.on('feed', feed => {
					output.feed = feed;
				})
				.on('readable', function() {
					let item;
					while ((item = this.read())) {
						output.items.push(item);
					}
				})
				.on('end', () => {
					resolve(output);
				});
		});
		expect(feed).toMatchSnapshot(file);
	}
});
