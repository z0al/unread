// Native
import fs from 'fs';
import path from 'path';

// Packages
import glob from 'globby';

// Ours
import Parser from '..';

const cwd = path.resolve(__dirname, 'feeds');
let samples = [];

beforeAll(async () => {
	// List availalbe samples
	samples = samples.concat(await glob('*.atom', { cwd }));
});

test('Snapshots', async () => {
	for (const file of samples) {
		const feed = await new Promise((resolve, reject) => {
			const output = { items: [] };

			fs.createReadStream(path.resolve(cwd, file))
				.on('error', err => reject(err))
				.pipe(new Parser())
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
