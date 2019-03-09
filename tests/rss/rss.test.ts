// Native
import { readFileSync } from 'fs';
import * as path from 'path';

// Packages
import * as glob from 'globby';

// Ours
import { RSSParser } from '../../src';
import { Parser } from '../../src/parser/types';

const cwd = path.resolve(__dirname, 'feeds');
let samples = [];

beforeAll(async () => {
	// List availalbe samples
	samples = samples.concat(await glob('*', { cwd }));
});

test('Snapshots', async () => {
	for (const file of samples) {
		const output = { items: [], feed: null };

		const parser: Parser = new RSSParser();

		const text = readFileSync(path.resolve(cwd, file)).toString();

		parser.write(text).close();

		for (const item of parser.items()) {
			output.items.push(item);
		}

		output.feed = parser.feed();

		expect(output).toMatchSnapshot(file);
	}
});
